// Error suppressor for browser extension errors and other non-app errors

export function setupErrorSuppressor() {
  // Read env flags (default to suppressing unless explicitly disabled)
  const suppressBase = import.meta.env?.VITE_SUPPRESS_ERRORS !== 'false';
  const suppressFirebase = import.meta.env?.VITE_SUPPRESS_FIREBASE_ERRORS !== 'false';

  // Query param overrides to force logging in production
  // Example: ?debug=1 or ?logs=1 or ?forceLogs=1
  let forceLogs = false;
  try {
    const params = new URLSearchParams(window.location.search);
    const debugParam = params.get('debug') || params.get('logs') || params.get('forceLogs');
    forceLogs = debugParam === '1' || debugParam === 'true';
  } catch {}

  // If suppression disabled or debug forced, do nothing
  if (!suppressBase || forceLogs) {
    return;
  }

  // Build suppression patterns
  const basePatterns = [
    'Attempting to use a disconnected port object',
    'Extension context invalidated',
    'Cannot access a chrome:// URL',
    'content.js:',
    'chrome-extension://',
    'moz-extension://'
  ];

  const firebasePatterns = [
    'Failed to load resource: the server responded with a status of 400',
    'Firestore/Write/channel',
    'Firestore/Listen/channel',
    'Missing or insufficient permissions',
    'permission-denied'
  ];

  const suppressPatterns = suppressFirebase
    ? [...basePatterns, ...firebasePatterns]
    : basePatterns;

  // Suppress specific console errors
  const originalConsoleError = console.error;
  console.error = function (...args) {
    // Always allow explicit emergency logs through
    try {
      const joined = args.map(String).join(' ');
      if (joined.includes('🚨') || joined.includes('❌') || joined.includes('NAVIGATION ERROR BOUNDARY')) {
        return originalConsoleError.apply(console, args);
      }

      const shouldSuppress = suppressPatterns.some((p) => joined.includes(p));
      if (!shouldSuppress) {
        return originalConsoleError.apply(console, args);
      }
      // Suppressed
    } catch {
      // If anything goes wrong, do not suppress
      return originalConsoleError.apply(console, args);
    }
  } as typeof console.error;

  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    try {
      const errorString = event.reason?.toString() || '';
      if (
        errorString.includes('disconnected port') ||
        errorString.includes('message channel closed') ||
        errorString.includes('Extension context')
      ) {
        event.preventDefault();
      }
    } catch {}
  });

  // Suppress global errors from extensions
  window.addEventListener('error', (event) => {
    try {
      const errorMessage = event.message || '';
      const errorSource = event.filename || '';

      if (
        errorSource.includes('chrome-extension://') ||
        errorSource.includes('moz-extension://') ||
        errorMessage.includes('disconnected port')
      ) {
        event.preventDefault();
      }
    } catch {}
  });
}

// Also provide a cleaner console for development
export function setupCleanConsole() {
  // Group Firebase offline messages
  const originalConsoleInfo = console.info;
  let firebaseMessageCount = 0;
  
  console.info = function(...args) {
    const message = args.join(' ');
    
    // Group Firebase offline messages
    if (message.includes('offline mode') || message.includes('Firebase')) {
      if (firebaseMessageCount === 0) {
        console.group('🔥 Firebase Status');
      }
      firebaseMessageCount++;
      originalConsoleInfo.apply(console, args);
      if (firebaseMessageCount > 0) {
        setTimeout(() => {
          if (firebaseMessageCount > 0) {
            console.groupEnd();
            firebaseMessageCount = 0;
          }
        }, 100);
      }
    } else {
      originalConsoleInfo.apply(console, args);
    }
  };
}
