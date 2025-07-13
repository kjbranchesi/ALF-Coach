import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This reads the secure environment variable we set up
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

console.log('Parsed firebaseConfig:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log('Firebase app initialized:', app);

// Initialize and export Firebase services
export const auth = getAuth(app);
console.log('Firebase auth initialized:', auth);
export const db = getFirestore(app);
console.log('Firebase db initialized:', db);