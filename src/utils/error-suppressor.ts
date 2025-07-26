// Error suppressor for browser extension errors and other non-app errors

export function setupErrorSuppressor() {
  // Suppress specific console errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Filter out browser extension errors
    const errorString = args.join(' ');
    
    // Common browser extension errors to suppress
    const suppressPatterns = [
      'Attempting to use a disconnected port object',
      'Extension context invalidated',
      'Cannot access a chrome:// URL',
      'content.js:',
      'chrome-extension://',
      'moz-extension://',
      'Failed to load resource: the server responded with a status of 400',
      'Firestore/Write/channel',
      'Firestore/Listen/channel'
    ];
    
    // Check if this is an error we want to suppress
    const shouldSuppress = suppressPatterns.some(pattern => 
      errorString.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalConsoleError.apply(console, args);
    }
  };
  
  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const errorString = event.reason?.toString() || '';
    
    // Suppress extension-related promise rejections
    if (errorString.includes('disconnected port') || 
        errorString.includes('message channel closed') ||
        errorString.includes('Extension context')) {
      event.preventDefault();
    }
  });
  
  // Suppress global errors from extensions
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';
    const errorSource = event.filename || '';
    
    // Suppress extension errors
    if (errorSource.includes('chrome-extension://') || 
        errorSource.includes('moz-extension://') ||
        errorMessage.includes('disconnected port')) {
      event.preventDefault();
    }
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