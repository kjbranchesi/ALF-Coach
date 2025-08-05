# Firebase Rules Update - URGENT

## The Issue
Blueprints cannot be saved due to Firebase permission errors. The app is trying to save with `userId: 'anonymous'` but the rules were too restrictive.

## The Fix
We've updated the Firestore rules to be very permissive for development. The new rules allow:
- Anyone to read all blueprints
- Anyone to create blueprints
- Anyone to update/delete blueprints (for now)

## Deploy the Fix

### Option 1: Firebase Console (Easiest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (alf-coach-3aeab)
3. Go to Firestore Database → Rules
4. Replace the entire rules with the contents of `/firestore.rules`
5. Click "Publish"

### Option 2: Firebase CLI
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy only the rules
firebase deploy --only firestore:rules
```

## Verify the Fix
1. Clear your browser cache/local storage
2. Go to your app
3. Create a new blueprint
4. Check that it saves without permission errors
5. Check Firebase Console to see the saved blueprint

## Important Notes
- These rules are VERY permissive for development
- Before production, update the rules to be more restrictive:
  - Only allow users to update/delete their own blueprints
  - Add validation for required fields
  - Consider rate limiting

## Other Fixes Applied
1. Fixed `FormativeAssessmentService.initializeDefaultSystems` error
2. Fixed `ComprehensiveContentValidator.split` error by ensuring content is a string

The app should now work without console errors!