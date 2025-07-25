import { safeFirestoreOperation, waitForAuth } from './firestoreHelpers';

// Note: We'll import and use the error reporter where this is used, not here
// to avoid circular dependencies

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 5000, // 5 seconds
  backoffMultiplier: 2
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Perform a Firestore operation with retry logic
 * @param {Function} operation - The Firestore operation to perform
 * @param {Object} options - Options for the operation
 * @param {string} options.errorMessage - Custom error message
 * @param {boolean} options.requireAuth - Whether to require authentication
 * @param {number} options.maxAttempts - Maximum retry attempts
 * @param {Function} options.fallback - Fallback function if all retries fail
 * @returns {Promise<any>} The result of the operation
 */
export async function firestoreOperationWithRetry(
  operation,
  {
    errorMessage = "Firestore operation failed",
    requireAuth = true,
    maxAttempts = RETRY_CONFIG.maxAttempts,
    fallback = null
  } = {}
) {
  let lastError = null;
  let delay = RETRY_CONFIG.initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Use safeFirestoreOperation for auth checks
      const result = await safeFirestoreOperation(operation, errorMessage, requireAuth);
      
      // If we got a result (not null), return it
      if (result !== null) {
        return result;
      }
      
      // If null was returned, it means auth failed or operation failed
      // Try fallback if this is the last attempt
      if (attempt === maxAttempts && fallback) {
        console.log("All Firestore attempts failed, using fallback");
        return await fallback();
      }
      
      throw new Error("Operation returned null");
      
    } catch (error) {
      lastError = error;
      
      // Don't retry on permission errors - they won't succeed
      if (error.code === 'permission-denied') {
        console.error("Permission denied, not retrying");
        if (fallback) {
          return await fallback();
        }
        throw error;
      }
      
      // Check if we should retry
      if (attempt < maxAttempts) {
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await sleep(delay);
        
        // Exponential backoff
        delay = Math.min(delay * RETRY_CONFIG.backoffMultiplier, RETRY_CONFIG.maxDelay);
        
        // Wait for auth to be ready before next attempt
        if (requireAuth) {
          await waitForAuth(5000);
        }
      }
    }
  }
  
  // All attempts failed
  console.error(`All ${maxAttempts} attempts failed:`, lastError);
  
  if (fallback) {
    console.log("Using fallback after all retries failed");
    return await fallback();
  }
  
  throw lastError;
}

/**
 * Helper to create a localStorage fallback
 * @param {string} key - The localStorage key
 * @param {any} data - The data to store
 * @param {string} operation - The operation type ('get', 'set', 'delete')
 */
export function createLocalStorageFallback(key, data = null, operation = 'get') {
  return async () => {
    try {
      switch (operation) {
        case 'get':
          const stored = localStorage.getItem(key);
          return stored ? JSON.parse(stored) : null;
          
        case 'set':
          localStorage.setItem(key, JSON.stringify(data));
          return data;
          
        case 'delete':
          localStorage.removeItem(key);
          return true;
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error("LocalStorage fallback error:", error);
      return null;
    }
  };
}