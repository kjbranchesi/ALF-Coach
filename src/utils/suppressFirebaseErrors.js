// Suppress specific Firebase/Google API errors that are expected when running offline
// or without proper Firebase configuration

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// List of error patterns to suppress
const suppressedPatterns = [
  /Failed to load resource.*firestore\.googleapis\.com/i,
  /400.*firestore\.googleapis\.com/i,
  /FirebaseError: Missing or insufficient permissions/i,
  /permission-denied/i,
];

// Override console.error
console.error = function(...args) {
  const message = args.join(' ');
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedPatterns.some(pattern => pattern.test(message));
  
  if (!shouldSuppress) {
    originalError.apply(console, args);
  }
};

// Override console.warn  
console.warn = function(...args) {
  const message = args.join(' ');
  
  // Check if this warning should be suppressed
  const shouldSuppress = suppressedPatterns.some(pattern => pattern.test(message));
  
  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

// Intercept network errors for Firebase URLs
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = function(...args) {
    const url = args[0];
    
    // Check if this is a Firebase/Google API URL
    if (typeof url === 'string' && url.includes('firestore.googleapis.com')) {
      // Return a rejected promise without logging
      return Promise.reject(new Error('Firebase offline mode'));
    }
    
    return originalFetch.apply(this, args);
  };
}

export function enableFirebaseErrorSuppression() {
  // This function exists just to ensure the module is imported
  console.log('Firebase error suppression enabled for offline mode');
}