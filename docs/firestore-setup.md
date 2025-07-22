# Firestore Security Rules Setup

## Overview

ALF-Coach supports both authenticated and anonymous users. The Firestore rules need to accommodate this while maintaining security.

## Development Rules (Permissive)

For development and testing, you can use these more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes for development
    // WARNING: Only use this for development!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Production Rules (Secure)

For production, use the rules in `/firestore.rules` which provide:

1. **Authenticated users** can read/write their own documents
2. **Anonymous users** can read/write documents marked with `userId: 'anonymous'`
3. **No cross-user access** - users can't read other users' data

## Deploying Rules

### Via Firebase Console

1. Go to Firebase Console > Firestore Database > Rules
2. Copy the contents of `firestore.rules`
3. Paste and publish

### Via Firebase CLI

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Common Issues

### "Missing or insufficient permissions"

This error occurs when:
1. Rules haven't been deployed
2. User is trying to access another user's data
3. Anonymous user is trying to create a document without `userId: 'anonymous'`

### LocalStorage Fallback

The app automatically falls back to LocalStorage when Firestore fails, ensuring the app works even with permission issues.

## Testing Rules

Use the Firebase Console Rules Playground to test your rules:
1. Go to Firestore > Rules > Rules Playground
2. Test different scenarios (authenticated, anonymous, different userIds)