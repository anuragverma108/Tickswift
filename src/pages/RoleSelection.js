import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import { doc, setDoc } from 'firebase/firestore';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { currentUser, db, setUserRole } = useFirebase();

  const handleRoleSelect = async (role) => {
    if (!currentUser) {
      console.error('No currentUser:', currentUser);
      alert('No user is logged in.');
      return;
    }
    try {
      console.log('Attempting setDoc with:', {
        db,
        uid: currentUser.uid,
        role
      });
      await setDoc(doc(db, 'users', currentUser.uid), { role }, { merge: true });
      setUserRole(role);
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('setDoc error:', error);
      alert('Failed to set role. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-950 px-4">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-primary-500 mb-4 drop-shadow-lg">TickSwift</h1>
        <p className="text-xl text-gray-300 font-medium">Who are you?</p>
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <button
          onClick={() => handleRoleSelect('user')}
          className="px-10 py-6 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          User
        </button>
        <button
          onClick={() => handleRoleSelect('admin')}
          className="px-10 py-6 rounded-2xl bg-gradient-to-r from-pink-500 to-red-500 text-white text-2xl font-bold shadow-lg hover:scale-105 transition-transform"
        >
          Admin
        </button>
      </div>
    </div>
  );
};

export default RoleSelection; 