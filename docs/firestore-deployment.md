# Firestore Security Rules Deployment

## Important: Deploy Updated Security Rules

The Firestore security rules have been updated to fix the dashboard permissions error. You need to deploy these rules to Firebase for the changes to take effect.

### What was fixed:
- Added `allow list` rule for blueprints collection to allow querying/listing documents
- This fixes the "Missing or insufficient permissions" error on the dashboard

### How to deploy:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in the project** (if not already done):
   ```bash
   firebase init
   ```
   - Select "Firestore"
   - Use existing project
   - Keep `firestore.rules` as the rules file

4. **Deploy the security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Alternative: Update via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database → Rules
4. Copy the contents of `firestore.rules` and paste them
5. Click "Publish"

### What the fix does:
The updated rules add `allow list: if request.auth != null;` which allows authenticated users to query the blueprints collection. Previously, users could only read specific documents they already knew the ID for, but couldn't list/query their own blueprints.

## Fixed Issues:
- ✅ Firebase permissions error when accessing dashboard
- ✅ "FirebaseError: Missing or insufficient permissions" when querying blueprints
- ✅ ProjectCard expecting non-existent `duration` field (changed to use `scope`)