# Firebase Permission Error Fixes

## Overview
This document describes the fixes implemented to resolve Firebase permission errors in the ALF-Coach application.

## Issues Addressed
1. "FirebaseError: Missing or insufficient permissions" when saving projects
2. Authentication state not properly checked before Firestore operations
3. Anonymous users not properly handled in security rules
4. No retry logic for transient Firebase failures
5. Poor user feedback when Firebase operations fail

## Solutions Implemented

### 1. Updated Firebase Security Rules (`/firestore.rules`)
- Added helper functions for cleaner rule definitions
- Properly handle anonymous users with `isAnonymous` check
- Allow anonymous users to create/update documents with `userId: 'anonymous'`
- Prevent anonymous users from deleting documents
- Fixed message subcollection permissions

### 2. Enhanced Authentication Checks (`/src/utils/firestoreHelpers.js`)
- Added `waitForAuth()` function to ensure auth is ready before operations
- Modified `safeFirestoreOperation()` to wait for authentication
- Return null instead of throwing errors to trigger fallbacks
- Added detailed error logging with user context

### 3. Fixed User ID Handling
- Updated `AppContext.jsx` to handle anonymous users with `effectiveUserId`
- Updated `Dashboard.jsx` to query with correct userId for anonymous users
- Ensured all document creation uses proper userId

### 4. Added Retry Logic (`/src/utils/firestoreWithRetry.js`)
- Implemented exponential backoff retry mechanism
- Skip retries for permission-denied errors
- Support for custom fallback functions
- LocalStorage fallback helper functions

### 5. Improved Error Handling
- Created `FirebaseErrorNotification.jsx` for user-friendly error messages
- Added `FirebaseErrorContext.jsx` for global error management
- Non-intrusive notifications that auto-dismiss
- Clear messaging about local storage fallback

## Usage

### Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

### Using Retry Logic in Code
```javascript
import { firestoreOperationWithRetry, createLocalStorageFallback } from '../utils/firestoreWithRetry';

// Example usage
await firestoreOperationWithRetry(
  async () => {
    // Your Firestore operation
    return await setDoc(docRef, data);
  },
  {
    errorMessage: 'Failed to save data',
    fallback: createLocalStorageFallback('key', data, 'set')
  }
);
```

### Handling Anonymous Users
```javascript
// Get effective userId
const effectiveUserId = userId || (user?.isAnonymous ? 'anonymous' : null);

// Use in queries
const q = query(collection(db, 'blueprints'), where('userId', '==', effectiveUserId));
```

## Testing

1. **Test Anonymous User Access**
   - Sign out and use "Continue as Guest"
   - Create a new project
   - Verify it saves without permission errors

2. **Test Authenticated User Access**
   - Sign in with email/Google
   - Create and update projects
   - Verify proper ownership

3. **Test Network Failures**
   - Disable network in DevTools
   - Try to save data
   - Verify fallback to localStorage
   - Re-enable network and verify sync

4. **Test Permission Errors**
   - Temporarily modify security rules to deny access
   - Verify error notification appears
   - Verify data is saved locally

## Best Practices

1. Always use `effectiveUserId` when creating documents
2. Use `firestoreOperationWithRetry` for critical operations
3. Provide meaningful fallback functions
4. Test both authenticated and anonymous user flows
5. Monitor Firebase usage and errors in production

## Monitoring

Check the browser console for:
- "No authenticated user for Firestore operation"
- "Firestore permission denied"
- "Using localStorage fallback"
- "All Firestore attempts failed"

These messages indicate Firebase issues but confirm fallback is working.