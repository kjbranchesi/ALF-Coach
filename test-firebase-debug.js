// Quick test to debug Firebase loading issue
console.log('=== Firebase Debug Test ===');

// Test environment variable access
console.log('Environment variables check:');
console.log('VITE_FIREBASE_API_KEY:', process.env.VITE_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? 'SET' : 'NOT SET');

// Test if auth state changes correctly
import('./src/firebase/firebase.js').then(({ auth, isOfflineMode }) => {
  console.log('Offline mode:', isOfflineMode);
  
  if (auth && auth.onAuthStateChanged) {
    console.log('Setting up test auth listener...');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed in test:', user ? 'User exists' : 'No user');
      unsubscribe();
    });
  } else {
    console.error('Auth object missing or invalid:', auth);
  }
}).catch(error => {
  console.error('Failed to import Firebase:', error);
});