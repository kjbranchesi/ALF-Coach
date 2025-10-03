/**
 * Lazy-loaded Firebase services
 * Reduces initial bundle size by ~200KB
 */

import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let auth: Auth | null = null;
let db: Firestore | null = null;
let initialized = false;

/**
 * Initialize Firebase lazily when first needed
 */
export async function initializeFirebase() {
  if (initialized) {return { auth, db };}
  
  console.log('[Firebase] Lazy loading Firebase modules...');
  
  try {
    // Dynamic imports for Firebase modules
    const [
      { initializeApp },
      { getAuth, connectAuthEmulator },
      { getFirestore, connectFirestoreEmulator }
    ] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore')
    ]);
    
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Connect to emulators in development
    if (import.meta.env.DEV && !window.location.host.includes('localhost:8080')) {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
      } catch (e) {
        // Emulators might not be running
        console.log('[Firebase] Emulators not available, using production');
      }
    }
    
    initialized = true;
    console.log('[Firebase] Firebase initialized successfully');
    
    return { auth, db };
  } catch (error) {
    console.error('[Firebase] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Get auth instance (initializes if needed)
 */
export async function getAuthLazy(): Promise<Auth> {
  if (!auth) {
    await initializeFirebase();
  }
  return auth!;
}

/**
 * Get Firestore instance (initializes if needed)
 */
export async function getFirestoreLazy(): Promise<Firestore> {
  if (!db) {
    await initializeFirebase();
  }
  return db!;
}

/**
 * Sign in anonymously (lazy loads auth)
 */
export async function signInAnonymouslyLazy() {
  const authInstance = await getAuthLazy();
  const { signInAnonymously } = await import('firebase/auth');
  return signInAnonymously(authInstance);
}

/**
 * Firestore operations (lazy loads firestore)
 */
export async function getDocLazy(collectionName: string, docId: string) {
  const dbInstance = await getFirestoreLazy();
  const { doc, getDoc } = await import('firebase/firestore');
  const docRef = doc(dbInstance, collectionName, docId);
  return getDoc(docRef);
}

export async function setDocLazy(collectionName: string, docId: string, data: any) {
  const dbInstance = await getFirestoreLazy();
  const { doc, setDoc } = await import('firebase/firestore');
  const docRef = doc(dbInstance, collectionName, docId);
  return setDoc(docRef, data);
}

export async function updateDocLazy(collectionName: string, docId: string, data: any) {
  const dbInstance = await getFirestoreLazy();
  const { doc, updateDoc } = await import('firebase/firestore');
  const docRef = doc(dbInstance, collectionName, docId);
  return updateDoc(docRef, data);
}