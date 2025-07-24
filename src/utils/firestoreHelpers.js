import { auth } from '../firebase/firebase';

/**
 * Safely perform Firestore operations with auth check
 * @param {Function} operation - The Firestore operation to perform
 * @param {string} errorMessage - Custom error message
 * @returns {Promise<any>} The result of the operation
 */
export async function safeFirestoreOperation(operation, errorMessage = "Firestore operation failed") {
  try {
    // Check if user is authenticated
    if (!auth.currentUser) {
      console.warn("No authenticated user for Firestore operation");
      return null;
    }
    
    // Perform the operation
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    
    // Check for specific error types
    if (error.code === 'permission-denied') {
      console.error("Firestore permission denied. Check security rules.");
    } else if (error.code === 'unavailable') {
      console.error("Firestore service unavailable. Check network connection.");
    } else if (error.message?.includes('400')) {
      console.error("Bad request to Firestore. Check data format.");
    }
    
    throw error;
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