import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  enableNetwork,
  onSnapshot,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [useRealTimeListeners, setUseRealTimeListeners] = useState(true); // Flag to disable listeners if they fail
  const [listenerFailures, setListenerFailures] = useState(0); // Track consecutive failures

  // Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

  // Check network connectivity
  const checkNetworkStatus = async () => {
    try {
      await enableNetwork(db);
      setIsOnline(true);
    } catch (error) {
      console.error('Network error:', error);
      setIsOnline(false);
    }
  };

  // Authentication functions
  const signup = async (email, password, name) => {
    try {
      // Check network status first
      await checkNetworkStatus();
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document in Firestore with retry logic
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name,
          email,
          createdAt: new Date(),
          authProvider: 'email'
        });
        // Do not set userRole here
      } catch (firestoreError) {
        console.error('Firestore error during signup:', firestoreError);
        // Continue even if Firestore fails - user is still created in Auth
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // Check network status first
      await checkNetworkStatus();
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore after successful login
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role || 'user');
        } else {
          // Fallback if user document doesn't exist
          setUserRole('user');
        }
      } catch (firestoreError) {
        console.error('Firestore error during login:', firestoreError);
        setUserRole('user'); // Default fallback
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Google Sign-In functions
  const signInWithGoogle = async () => {
    try {
      // Check network status first
      await checkNetworkStatus();
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign-in successful for user:', user.email);
      
      // Check if user document exists, if not create one
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log('Creating new user document for Google user');
          // Create user document for new Google users with default role 'user'
          await setDoc(userDocRef, {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            role: 'user', // Default role for Google users
            authProvider: 'google'
          });
          // Set the role in context for new users
          setUserRole('user');
          console.log('New Google user role set to: user');
        } else {
          console.log('Existing Google user found, fetching role');
          // For existing users, fetch their role from Firestore
          const userData = userDoc.data();
          const role = userData.role || 'user';
          setUserRole(role);
          console.log('Existing Google user role set to:', role);
        }
      } catch (firestoreError) {
        console.error('Firestore error during Google sign-in:', firestoreError);
        // Continue even if Firestore fails - user is still authenticated
        setUserRole('user'); // Default fallback
        console.log('Google sign-in fallback role set to: user');
      }
      
      return user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithGoogleRedirect = async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Google redirect error:', error);
      throw error;
    }
  };

  const handleGoogleRedirectResult = async () => {
    try {
      const result = await getRedirectResult(auth);
      if (result) {
        const user = result.user;
        
        // Check if user document exists, if not create one
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) {
            // Create user document for new Google users with default role 'user'
            await setDoc(userDocRef, {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              createdAt: new Date(),
              role: 'user', // Default role for Google users
              authProvider: 'google'
            });
            // Set the role in context for new users
            setUserRole('user');
          } else {
            // For existing users, fetch their role from Firestore
            const userData = userDoc.data();
            setUserRole(userData.role || 'user');
          }
        } catch (firestoreError) {
          console.error('Firestore error during redirect result:', firestoreError);
          setUserRole('user'); // Default fallback
        }
        
        return user;
      }
    } catch (error) {
      console.error('Redirect result error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Ticket functions with better error handling
  const createTicket = async (ticketData) => {
    try {
      await checkNetworkStatus();
      
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        ...ticketData,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        status: 'Open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return ticketRef.id;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  };

  const getUserTickets = async () => {
    try {
      await checkNetworkStatus();
      
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', currentUser.uid),
        where('createdAt', '!=', null),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get user tickets error:', error);
      throw error;
    }
  };

  const getAllTickets = async () => {
    try {
      await checkNetworkStatus();
      
      const q = query(
        collection(db, 'tickets'),
        where('createdAt', '!=', null),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get all tickets error:', error);
      throw error;
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId, status) => {
    await updateDoc(doc(db, 'tickets', ticketId), {
      status,
      updatedAt: new Date()
    });
  };

  // File upload function
  const uploadFile = async (file, path) => {
    try {
      await checkNetworkStatus();
      
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  };

  // Get user profile
  const getUserProfile = async (userId) => {
    try {
      await checkNetworkStatus();
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  };

  // Function to re-enable real-time listeners
  const reEnableRealTimeListeners = () => {
    setUseRealTimeListeners(true);
    setListenerFailures(0);
  };

  // Function to manually refresh tickets (for when listeners are disabled)
  const refreshTickets = async (callback, isAdmin = false) => {
    try {
      const tickets = isAdmin ? await getAllTickets() : await getUserTickets();
      callback(tickets);
    } catch (error) {
      console.error('Error refreshing tickets:', error);
      callback([]);
    }
  };

  // Real-time listener for user's tickets
  const listenToUserTickets = (callback) => {
    if (!currentUser || !currentUser.uid) return () => {};
    
    // If real-time listeners are disabled, use regular query
    if (!useRealTimeListeners) {
      refreshTickets(callback, false);
      return () => {};
    }
    
    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', currentUser.uid),
        where('createdAt', '!=', null),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const tickets = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(tickets);
          setListenerFailures(0); // Reset failure count on success
        },
        (error) => {
          console.error('Firestore listener error, falling back to regular queries:', error);
          setListenerFailures(prev => prev + 1);
          if (listenerFailures >= 2) { // Disable after 2 consecutive failures
            setUseRealTimeListeners(false);
          }
          // Fall back to regular query
          refreshTickets(callback, false);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up user tickets listener:', error);
      setListenerFailures(prev => prev + 1);
      if (listenerFailures >= 2) { // Disable after 2 consecutive failures
        setUseRealTimeListeners(false);
      }
      // Fall back to regular query
      refreshTickets(callback, false);
      return () => {};
    }
  };

  // Real-time listener for all tickets (admin)
  const listenToAllTickets = (callback) => {
    // If real-time listeners are disabled, use regular query
    if (!useRealTimeListeners) {
      refreshTickets(callback, true);
      return () => {};
    }
    
    try {
      const q = query(collection(db, 'tickets'), where('createdAt', '!=', null), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const tickets = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          callback(tickets);
          setListenerFailures(0); // Reset failure count on success
        },
        (error) => {
          console.error('Firestore listener error, falling back to regular queries:', error);
          setListenerFailures(prev => prev + 1);
          if (listenerFailures >= 2) { // Disable after 2 consecutive failures
            setUseRealTimeListeners(false);
          }
          // Fall back to regular query
          refreshTickets(callback, true);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up tickets listener:', error);
      setListenerFailures(prev => prev + 1);
      if (listenerFailures >= 2) { // Disable after 2 consecutive failures
        setUseRealTimeListeners(false);
      }
      // Fall back to regular query
      refreshTickets(callback, true);
      return () => {};
    }
  };

  // Assign ticket to an agent
  const assignTicket = async (ticketId, assignedTo) => {
    await updateDoc(doc(db, 'tickets', ticketId), {
      assignedTo,
      updatedAt: new Date()
    });
  };

  // Add comment to ticket
  const addCommentToTicket = async (ticketId, comment) => {
    await updateDoc(doc(db, 'tickets', ticketId), {
      comments: arrayUnion(comment),
      updatedAt: new Date()
    });
  };

  // Get all users (for admin/agent search)
  const getAllUsers = async () => {
    try {
      await checkNetworkStatus();
      const q = query(collection(db, 'users'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  };

  // Fetch user role after login
  useEffect(() => {
    if (!currentUser) return;
    const fetchRole = async () => {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role);
      } else {
        // If user doc does not exist, set default role and create the doc
        setUserRole('user');
        await setDoc(userDocRef, { role: 'user' }, { merge: true });
      }
    };
    fetchRole();
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Handle Google redirect result on component mount
    handleGoogleRedirectResult().catch(console.error);

    // Check network status periodically
    const networkCheck = setInterval(checkNetworkStatus, 30000); // Check every 30 seconds

    return () => {
      unsubscribe();
      clearInterval(networkCheck);
    };
  }, []);

  return (
    <FirebaseContext.Provider value={{
      currentUser,
      loading,
      isOnline,
      userRole,
      setUserRole,
      signup,
      login,
      logout,
      signInWithGoogle,
      signInWithGoogleRedirect,
      handleGoogleRedirectResult,
      createTicket,
      getUserTickets,
      getAllTickets,
      updateTicketStatus,
      uploadFile,
      getUserProfile,
      reEnableRealTimeListeners,
      refreshTickets,
      listenToUserTickets,
      listenToAllTickets,
      assignTicket,
      db // Ensure db is provided in context
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}; 