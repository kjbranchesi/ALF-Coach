import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// This reads the secure environment variable we set up
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  // Check if Firebase config is valid
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase config not found. Running in offline mode.');
    // Create mock objects that won't cause errors
    auth = { currentUser: null };
    db = {};
    storage = {};
  } else {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Optional: Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error.message);
  // Provide fallback empty objects to prevent app crash
  auth = { currentUser: null };
  db = {};
  storage = {};
}

// Initialize and export Firebase services
export { auth, db, storage };