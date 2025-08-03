import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read Firebase config from environment variables
// Support both single config object and individual variables
let firebaseConfig = {};

// Try to parse config from single variable first
if (import.meta.env.VITE_FIREBASE_CONFIG) {
  try {
    firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG);
  } catch (e) {
    console.warn('Failed to parse VITE_FIREBASE_CONFIG, trying individual variables');
  }
}

// If no config or parse failed, try individual variables
// Support both VITE_ and REACT_APP_ prefixes for backward compatibility
if (!firebaseConfig.apiKey) {
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 
            import.meta.env.REACT_APP_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 
                import.meta.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 
               import.meta.env.REACT_APP_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 
                   import.meta.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 
                       import.meta.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || 
           import.meta.env.REACT_APP_FIREBASE_APP_ID || ''
  };
}

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let storage = null;
let isOfflineMode = false;

// Offline mode implementations
const createOfflineAuth = () => ({
  currentUser: null,
  onAuthStateChanged: (callback) => {
    // Immediately call callback with null user to prevent infinite loading
    setTimeout(() => callback(null), 0);
    return () => {}; // unsubscribe function
  },
  signInWithEmailAndPassword: () => Promise.reject(new Error('Offline mode')),
  createUserWithEmailAndPassword: () => Promise.reject(new Error('Offline mode')),
  signOut: () => Promise.resolve()
});

const createOfflineDb = () => ({
  type: 'offline',
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

try {
  // Debug: Log current environment variables
  console.log('Firebase config check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyValue: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 10) + '...' : 'none',
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain
  });

  // Check if Firebase config is valid
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key' || firebaseConfig.apiKey === '') {
    console.info('📱 ALF Coach running in offline mode (Firebase not configured)');
    console.info('💡 To enable cloud sync, see: docs/firebase-setup.md');
    isOfflineMode = true;
    
    // Create offline implementations
    auth = createOfflineAuth();
    db = createOfflineDb();
    storage = createOfflineStorage();
  } else {
    // Initialize Firebase normally
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // Add type identifier for Firestore
    db.type = 'firestore';
    
    console.info('✅ Firebase initialized successfully');
    
    // Optional: Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.info('🔧 Connected to Firebase emulators');
    }
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, switching to offline mode:', error.message);
  console.error('Full error:', error);
  isOfflineMode = true;
  
  // Provide offline implementations
  auth = createOfflineAuth();
  db = createOfflineDb();
  storage = createOfflineStorage();
}

// Export services and offline mode status
export { auth, db, storage, isOfflineMode };