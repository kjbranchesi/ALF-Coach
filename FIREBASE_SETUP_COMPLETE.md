# ✅ Firebase Setup - What's Been Done & What's Next

## ✅ Completed Steps

### 1. **Local Environment Configuration**
- ✅ Firebase credentials added to `.env` file
- ✅ Gemini API key **removed** from `.env` for security (stays server-side only)
- ✅ Configuration pulled from your Netlify environment

### 2. **Security Audit**
- ✅ Firebase API keys are safe to expose (by design)
- ✅ Gemini API is proxied through Netlify function (secure)
- ✅ Chat feature already uses `/.netlify/functions/gemini`

---

## 🔧 Next Steps - Firebase Console Setup

You need to complete these steps in the Firebase Console to enable sync:

### Step 1: Open Firebase Console
🔗 **Direct link to your project:**
https://console.firebase.google.com/project/alf-coach-3aeab

### Step 2: Enable Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. If you see "Create database":
   - Click **"Create database"**
   - Choose **"Start in production mode"**
   - Select **"nam5 (us-central)"** region
   - Click **"Enable"**

3. Once enabled, click the **"Rules"** tab
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Blueprints - authenticated users can CRUD their own
    match /blueprints/{blueprintId} {
      allow read: if true;  // Public read for sharing
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Projects - private to each user
    match /projects/{userId}/{projectId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Drafts - private to each user
    match /drafts/{userId}/{draftId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

5. Click **"Publish"**

### Step 3: Enable Firebase Storage

1. Click **"Storage"** in the left sidebar
2. If you see "Get started":
   - Click **"Get started"**
   - Review default rules (we'll customize next)
   - Select **same region** as Firestore (nam5)
   - Click **"Done"**

3. Once enabled, click the **"Rules"** tab
4. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User project files - 10MB limit
    match /projects/{userId}/{projectId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024;
    }

    // User uploads - 10MB limit
    match /uploads/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 10 * 1024 * 1024;
    }

    // Public assets (if needed)
    match /public/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

5. Click **"Publish"**

### Step 4: Enable Authentication (if not already)

1. Click **"Authentication"** in the left sidebar
2. If you see "Get started", click it
3. Click **"Email/Password"** sign-in method
4. Toggle **"Email/Password"** to **Enabled**
5. Click **"Save"**
6. Also enable **"Anonymous"** (useful for testing)

---

## 🧪 Testing the Connection

Once you've completed the Firebase Console steps above:

### 1. Start the Dev Server
```bash
npm run dev
```

### 2. Check Console Output
You should see:
```
✅ Firebase initialized successfully
```

You should **NOT** see:
```
📱 ALF Coach running in offline mode
```

### 3. Test in Browser

1. Open http://localhost:5173
2. Open browser console (F12)
3. Create or edit a project in the app
4. Look for console messages:
   ```
   [UnifiedStorageManager] Background Firebase sync successful: {id}
   ```

### 4. Verify Data in Firebase

1. Go to Firebase Console → Firestore Database
2. You should see new documents appearing in collections:
   - `blueprints`
   - `projects/{userId}`
   - `drafts/{userId}`

---

## 📊 Current Configuration Summary

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **Firebase Config** | ✅ Set | `.env` | Safe to have locally |
| **Firestore** | ⏳ Pending | Firebase Console | You need to enable |
| **Storage** | ⏳ Pending | Firebase Console | You need to enable |
| **Auth** | ⏳ Pending | Firebase Console | You need to enable |
| **Gemini API** | ✅ Secure | Netlify only | Server-side proxy |

---

## 🔒 Security Status

### ✅ Secure
- Firebase config in `.env` (API keys are public by design)
- Gemini API proxied through Netlify function
- Chat feature uses secure proxy

### ⚠️ To Configure
- Firestore security rules (prevents unauthorized access)
- Storage security rules (prevents unauthorized uploads)
- Authentication (required for rules to work)

---

## 🚨 Important Notes

### Gemini API Key
- ✅ **Removed** from `.env` file
- ✅ Should **only** be in Netlify: `GEMINI_API_KEY` (not `VITE_GEMINI_API_KEY`)
- ✅ App uses `/.netlify/functions/gemini` proxy (keeps key secure)

### Firebase API Key
- ✅ **Safe** to have in `.env` as `VITE_FIREBASE_CONFIG`
- ✅ This is public information (not a security risk)
- ✅ Real security = Firestore/Storage rules

### Development vs Production
- **Local development**: Uses Firebase with your credentials from `.env`
- **Netlify production**: Uses Firebase with credentials from Netlify env vars
- **Both are secure** when rules are set properly

---

## 🎯 Quick Start Checklist

- [x] Firebase config in `.env`
- [x] Gemini API removed from client
- [ ] **Enable Firestore in Console** ← DO THIS
- [ ] **Set Firestore rules in Console** ← DO THIS
- [ ] **Enable Storage in Console** ← DO THIS
- [ ] **Set Storage rules in Console** ← DO THIS
- [ ] **Enable Auth in Console** ← DO THIS
- [ ] Run `npm run dev` and verify connection
- [ ] Test creating/editing a project
- [ ] Check Firebase Console for synced data

---

## 💡 What Happens Next

Once you enable Firestore/Storage/Auth in the Firebase Console:

1. **Local dev**: Your app will sync data to Firebase automatically
2. **Production (Netlify)**: Already configured, will just start working
3. **Offline mode**: Still works! localStorage is primary, Firebase is backup
4. **Cross-device**: Projects sync across devices automatically

---

## 📞 Need Help?

### If dev server shows "offline mode":
1. Double-check `.env` has `VITE_FIREBASE_CONFIG` set
2. Verify Firebase credentials are correct
3. Restart dev server: `Ctrl+C`, then `npm run dev`

### If you see Firebase errors:
1. Check that Firestore is enabled in Console
2. Check that security rules are published
3. Check that Authentication is enabled

### If Gemini AI doesn't work:
1. Verify `GEMINI_API_KEY` is set in Netlify (not `VITE_GEMINI_API_KEY`)
2. Check browser console for fetch errors to `/.netlify/functions/gemini`

---

**Ready to continue? Complete the Firebase Console steps above, then run `npm run dev`!**
