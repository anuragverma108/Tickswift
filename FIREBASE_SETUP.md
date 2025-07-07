# Firebase Setup for TickSwift

## 🔥 Firebase Configuration

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "TickSwift"
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" authentication
3. Click "Save"

### 3. Enable Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location close to your users
4. Click "Done"

### 4. Enable Storage

1. Go to "Storage" → "Get started"
2. Choose "Start in test mode" (for development)
3. Select a location
4. Click "Done"

### 5. Get Your Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register app with name "TickSwift Web"
5. Copy the configuration object

### 6. Update Configuration

Replace the placeholder values in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 7. Environment Variables (Recommended)

Create a `.env` file in the root directory:

```env
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 8. Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can create tickets and read their own tickets
    match /tickets/{ticketId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /tickets/{ticketId}/{fileName} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Features Implemented

### Authentication
- ✅ User registration with email/password
- ✅ User login/logout
- ✅ User profile management
- ✅ Protected routes

### Database (Firestore)
- ✅ Ticket creation and management
- ✅ User ticket retrieval
- ✅ Admin ticket management
- ✅ Real-time updates

### Storage
- ✅ File upload for ticket attachments
- ✅ Image and document support
- ✅ Secure file access

### Context API
- ✅ Firebase services available throughout app
- ✅ User state management
- ✅ Loading states

## 📝 Usage Examples

### Login
```javascript
import { useFirebase } from './contexts/FirebaseContext';

const { login } = useFirebase();
await login(email, password);
```

### Create Ticket
```javascript
const { createTicket } = useFirebase();
const ticketId = await createTicket({
  title: 'Bug Report',
  category: 'Bug',
  priority: 'High',
  description: 'Issue description'
});
```

### Upload File
```javascript
const { uploadFile } = useFirebase();
const downloadURL = await uploadFile(file, `tickets/${ticketId}/${fileName}`);
```

## 🔒 Security Notes

1. **Never commit your Firebase config to version control**
2. **Use environment variables for sensitive data**
3. **Set up proper Firestore and Storage security rules**
4. **Enable authentication methods you need**
5. **Monitor usage in Firebase Console**

## 🛠️ Troubleshooting

### Common Issues:
1. **"Firebase App named '[DEFAULT]' already exists"**
   - Ensure you're only initializing Firebase once
   
2. **"Permission denied" errors**
   - Check your Firestore/Storage security rules
   
3. **Authentication not working**
   - Verify Email/Password is enabled in Firebase Console
   
4. **File upload fails**
   - Check Storage rules and file size limits

## 📚 Next Steps

1. Set up your Firebase project
2. Update the configuration in `src/firebase.js`
3. Test authentication flow
4. Test ticket creation
5. Deploy with proper security rules 