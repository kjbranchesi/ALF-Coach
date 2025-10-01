# Firebase Setup Checklist

## ✅ Completed
- [x] Firebase credentials configured in Netlify
- [x] Firebase credentials added to local `.env` file

## 🔍 Next Steps - Please Verify in Firebase Console

### 1. Open Firebase Console
Go to: https://console.firebase.google.com/project/alf-coach-3aeab

### 2. Enable Firestore Database

**Check if enabled:**
- Click "Firestore Database" in left sidebar
- If you see a database with collections, it's already enabled ✅
- If you see "Create database" button, follow these steps:

**To enable:**
1. Click "Create database"
2. Choose "Start in production mode" (we'll set rules next)
3. Select your region (nam5 recommended for US)
4. Click "Enable"

### 3. Set Firestore Security Rules

**Location:** Firestore Database → Rules tab

**Replace with these rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blueprints - authenticated users can read/write their own
    match /blueprints/{blueprintId} {
      allow read: if true;  // Public read for sharing
      allow write: if request.auth != null &&
        (resource == null || resource.data.userId == request.auth.uid);
    }

    // Projects - users can only access their own
    match /projects/{userId}/{projectId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Drafts - users can only access their own
    match /drafts/{userId}/{draftId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

**Then click "Publish"**

### 4. Enable Firebase Storage

**Check if enabled:**
- Click "Storage" in left sidebar
- If you see buckets/files interface, it's enabled ✅
- If you see "Get started" button, follow these steps:

**To enable:**
1. Click "Get started"
2. Review security rules (we'll customize next)
3. Select same region as Firestore
4. Click "Done"

### 5. Set Firebase Storage Security Rules

**Location:** Storage → Rules tab

**Replace with these rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User project files
    match /projects/{userId}/{projectId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    // User uploads
    match /uploads/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

**Then click "Publish"**

### 6. Enable Authentication (if not already enabled)

**Check if enabled:**
- Click "Authentication" in left sidebar
- If you see "Users" tab, it's enabled ✅
- If you see "Get started" button, follow these steps:

**To enable:**
1. Click "Get started"
2. Click "Email/Password" provider
3. Toggle "Email/Password" to **Enabled**
4. Click "Save"
5. Optional: Also enable "Anonymous" for testing

### 7. Test the Connection

Once all services are enabled, come back to your terminal and run:

```bash
npm run dev
```

**Expected console output:**
```
✅ Firebase initialized successfully
```

**You should NOT see:**
```
📱 ALF Coach running in offline mode
```

### 8. Verify Sync is Working

1. Open the app in browser: http://localhost:5173
2. Open browser console (F12)
3. Create or edit a project
4. Look for console messages like:
   - `[UnifiedStorageManager] Background Firebase sync successful: {id}`
   - `✅ Firebase initialized successfully`

5. Go back to Firebase Console → Firestore Database
6. You should see new documents appearing in the `blueprints` or `projects` collections

---

## Troubleshooting

### "Firebase: Error (auth/operation-not-allowed)"
- Solution: Enable Email/Password authentication in Firebase Console

### "Missing or insufficient permissions"
- Solution: Update Firestore security rules as shown above

### "Storage: Unauthorized"
- Solution: Update Storage security rules as shown above

### Still seeing "offline mode" message
- Solution: Make sure `.env` file has valid credentials and restart dev server

---

## Current Status

| Service | Status | Next Action |
|---------|--------|-------------|
| Firebase Config | ✅ Set in .env | None |
| Firestore | ❓ Unknown | Check in Console |
| Firebase Storage | ❓ Unknown | Check in Console |
| Authentication | ❓ Unknown | Check in Console |
| Security Rules | ❓ Unknown | Set rules above |

**After completing steps above, report back and we can test!**
