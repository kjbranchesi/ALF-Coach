import { auth } from '../firebase/firebase';

/**
 * Wait for authentication to be ready
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} Whether auth is ready
 */
export async function waitForAuth(timeout = 5000) {
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    // If already authenticated, resolve immediately
    if (auth.currentUser) {
      resolve(true);
      return;
    }
    
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        unsubscribe();
        resolve(true);
      } else if (Date.now() - startTime > timeout) {
        unsubscribe();
        resolve(false);
      }
    });
    
    // Timeout fallback
    setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);
  });
}

/**
 * Safely perform Firestore operations with auth check
 * @param {Function} operation - The Firestore operation to perform
 * @param {string} errorMessage - Custom error message
 * @param {boolean} requireAuth - Whether to require authentication (default: true)
 * @returns {Promise<any>} The result of the operation
 */
export async function safeFirestoreOperation(operation, errorMessage = "Firestore operation failed", requireAuth = true) {
  try {
    // Wait for auth to be ready if required
    if (requireAuth) {
      const authReady = await waitForAuth();
      if (!authReady && !auth.currentUser) {
        console.warn("No authenticated user for Firestore operation. Using localStorage fallback.");
        return null;
      }
    }
    
    // Perform the operation
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    
    // Check for specific error types
    if (error.code === 'permission-denied') {
      console.error("Firestore permission denied. Check security rules and authentication.");
      console.error("Current user:", auth.currentUser?.uid || 'none');
    } else if (error.code === 'unavailable') {
      console.error("Firestore service unavailable. Check network connection.");
    } else if (error.message?.includes('400')) {
      console.error("Bad request to Firestore. Check data format.");
    }
    
    // Don't throw the error, return null to trigger fallback
    return null;
  }
}

/**
 * Cleanup function for Firestore listeners
 * @param {Function|null} unsubscribe - The unsubscribe function
 */
export function cleanupFirestoreListener(unsubscribe) {
  if (unsubscribe && typeof unsubscribe === 'function') {
    try {
      unsubscribe();
    } catch (error) {
      console.error("Error cleaning up Firestore listener:", error);
    }
  }
}