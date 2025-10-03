import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// Firebase config type
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Extended Firestore type with our custom property
interface ExtendedFirestore extends Firestore {
  type: 'firestore' | 'offline';
}

// Read Firebase config from environment variables
// Support both single config object and individual variables
let firebaseConfig: FirebaseConfig = {} as FirebaseConfig;

// Try to parse config from single variable first
if (import.meta.env.VITE_FIREBASE_CONFIG) {
  try {
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) as FirebaseConfig;
  } catch (e) {
    console.warn('Failed to parse VITE_FIREBASE_CONFIG, trying individual variables');
  }
}

// If no config or parse failed, try individual variables
if (!firebaseConfig.apiKey) {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  };
}

// Initialize Firebase with deferred heavy operations
let app: FirebaseApp | null = null;
let auth: Auth | ReturnType<typeof createOfflineAuth> | null = null;
let db: ExtendedFirestore | ReturnType<typeof createOfflineDb> | null = null;
let storage: FirebaseStorage | ReturnType<typeof createOfflineStorage> | null = null;
let isOfflineMode = false;
let initialized = false;

// Offline mode implementations
const createOfflineAuth = () => ({
  currentUser: null,
  onAuthStateChanged: (callback: (user: null) => void) => {
    callback(null);
    return () => {}; // unsubscribe function
  },
  signInWithEmailAndPassword: () => Promise.reject(new Error('Offline mode')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Offline mode')),
  signOut: () => Promise.resolve()
});

const createOfflineDb = () => ({
  type: 'offline' as const,
  collection: () => ({
    add: () => Promise.reject(new Error('Offline mode - use localStorage')),
    doc: () => ({
      get: () => Promise.reject(new Error('Offline mode - use localStorage')),
      set: () => Promise.reject(new Error('Offline mode - use localStorage')),
      update: () => Promise.reject(new Error('Offline mode - use localStorage')),
      delete: () => Promise.reject(new Error('Offline mode - use localStorage'))
    })
  })
});

const createOfflineStorage = () => ({
  ref: () => ({
    put: () => Promise.reject(new Error('Offline mode - use localStorage')),
    getDownloadURL: () => Promise.reject(new Error('Offline mode - use localStorage'))
  })
});

// Function to initialize Firebase lazily
const initializeFirebase = () => {
  if (initialized) {return;}
  
  try {
    // Check if Firebase config is valid
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key') {
      console.log('%c📱 ALF Coach: Firebase Offline Mode', 'color: #f59e0b; font-weight: bold; font-size: 14px');
      console.log('%c💡 Firebase not configured - using localStorage only', 'color: #f59e0b');
      console.log('%c📖 To enable cloud sync, see: docs/firebase-setup.md', 'color: #6b7280');
      isOfflineMode = true;
      
      // Create offline implementations
      auth = createOfflineAuth();
      db = createOfflineDb() as any;
      storage = createOfflineStorage() as any;
    } else {
      // Initialize Firebase normally
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app) as ExtendedFirestore;
      storage = getStorage(app);
      
      // Add type identifier for Firestore
      (db).type = 'firestore';

      console.log('%c✅ Firebase Connected', 'color: #10b981; font-weight: bold; font-size: 14px');
      console.log('%c🔥 Firestore: Online', 'color: #10b981');
      console.log(`%c📊 Project: ${  firebaseConfig.projectId}`, 'color: #6b7280');
      console.log('%c💾 Data will sync to cloud automatically', 'color: #6b7280');
      
      // Optional: Connect to emulators in development
      if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.info('🔧 Connected to Firebase emulators');
      }
    }
    initialized = true;
  } catch (error: any) {
    console.log('%c⚠️ Firebase initialization failed', 'color: #ef4444; font-weight: bold; font-size: 14px');
    console.log('%c📱 Switching to offline mode (localStorage only)', 'color: #f59e0b');
    console.log(`%c❌ Error: ${  error.message}`, 'color: #ef4444');
    isOfflineMode = true;
    
    // Provide offline implementations
    auth = createOfflineAuth();
    db = createOfflineDb() as any;
    storage = createOfflineStorage() as any;
    initialized = true;
  }
};

// Initialize immediately for now (can be made lazy later if needed)
initializeFirebase();

// Export services and offline mode status
export { auth, db, storage, isOfflineMode };