# Firebase Storage CORS Fix

**Problem**: Firebase Storage blocks requests from alflearninglabs.com
**Solution**: Configure CORS to allow your production domain

## What Happened

Your Phase A cloud-first reads are **working perfectly**! The issue is that Firebase Storage needs permission to allow your website to fetch files.

**The Error**:
```
Access to fetch at 'https://firebasestorage.googleapis.com/...'
from origin 'https://alflearninglabs.com' has been blocked by CORS policy
```

**What This Means**:
- ✅ Your code is deployed and working
- ✅ The showcase file exists in Firebase Storage
- ✅ Cloud-first reads are attempting to fetch it
- ❌ Firebase Storage rejects the request (not on allowlist)

## The Fix: 3 Options

### Option 1: Firebase Console (Easiest - Recommended)

1. **Go to Firebase Console**:
   - Visit https://console.firebase.google.com
   - Select your `alf-coach-3aeab` project

2. **Open Storage Settings**:
   - Click "Storage" in left sidebar
   - Click "Rules" tab
   - Note: CORS is separate from Rules - we'll use Cloud Console

3. **Switch to Google Cloud Console**:
   - At the top of the Storage page, click the "..." menu
   - Select "Open in Google Cloud Console"

4. **Configure CORS via Cloud Console**:
   - In Google Cloud Console, go to "Cloud Storage" → "Browser"
   - Find your bucket: `alf-coach-3aeab.firebasestorage.app`
   - Click the bucket name
   - Click "Permissions" tab
   - Scroll down to "CORS configuration"
   - Click "Edit CORS configuration"
   - Paste this:
   ```json
   [
     {
       "origin": ["https://alflearninglabs.com"],
       "method": ["GET", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type"]
     }
   ]
   ```
   - Click "Save"

5. **Wait 1-2 minutes** for propagation, then test your site

---

### Option 2: Using gsutil Command Line (Advanced)

If you have Google Cloud SDK installed:

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   # macOS
   brew install --cask google-cloud-sdk

   # Or download from:
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Authenticate**:
   ```bash
   gcloud auth login
   gcloud config set project alf-coach-3aeab
   ```

3. **Apply CORS configuration**:
   ```bash
   cd /Users/kylebranchesi/Documents/GitHub/ALF-Coach
   gsutil cors set firebase-storage-cors.json gs://alf-coach-3aeab.firebasestorage.app
   ```

4. **Verify CORS is set**:
   ```bash
   gsutil cors get gs://alf-coach-3aeab.firebasestorage.app
   ```

   Should output:
   ```json
   [
     {
       "origin": ["https://alflearninglabs.com", ...],
       "method": ["GET", "HEAD"],
       ...
     }
   ]
   ```

---

### Option 3: Use Firebase SDK Download URL (Quick Workaround)

Instead of direct HTTP fetch, use Firebase SDK's `getDownloadURL()` which handles CORS internally.

**File to modify**: `src/services/CloudProjectService.ts`

Change from:
```typescript
// Direct HTTP fetch (requires CORS)
const response = await fetch(downloadURL);
const json = await response.json();
```

To:
```typescript
// Use Firebase SDK (handles CORS internally)
import { ref, getDownloadURL } from 'firebase/storage';
const storageRef = ref(storage, showcasePath);
const downloadURL = await getDownloadURL(storageRef);
const response = await fetch(downloadURL);
```

**Note**: This is a workaround, not the proper fix. Option 1 or 2 is better.

---

## After Applying CORS Fix

1. **Wait 1-2 minutes** for the configuration to propagate
2. **Hard refresh** your browser: Cmd+Shift+R
3. **Try "View Review"** again
4. **Check console** - you should see:
   ```
   [ReviewScreen] ✅ Loaded from cloud (rev 1)
   ```

## Verification

Once CORS is configured, you'll know it's working when:

- ✅ No CORS errors in browser console
- ✅ ReviewScreen loads project data successfully
- ✅ Console shows `[ReviewScreen] ✅ Loaded from cloud`
- ✅ Navigation error boundary doesn't trigger

## Why This Happened

**Before Phase A**:
- Used Firebase SDK methods (authentication handled internally)
- No direct HTTP fetch to Storage URLs
- CORS wasn't needed

**After Phase A**:
- Direct HTTP fetch to Storage URLs for performance
- Browser enforces CORS for cross-origin requests
- Firebase Storage needs to explicitly allow alflearninglabs.com

## The CORS Configuration Explained

```json
{
  "origin": ["https://alflearninglabs.com"],  // Your production domain
  "method": ["GET", "HEAD"],                   // Read-only access
  "maxAgeSeconds": 3600,                       // Cache preflight for 1 hour
  "responseHeader": ["Content-Type"]           // Allow reading content type
}
```

This tells Firebase Storage:
> "Allow GET requests from alflearninglabs.com to fetch files"

---

## If You Get Stuck

**Common Issues**:

1. **"gsutil not found"**: Install Google Cloud SDK first
2. **"Authentication failed"**: Run `gcloud auth login`
3. **"Wrong project"**: Run `gcloud config set project alf-coach-3aeab`
4. **Still blocked after CORS**: Hard refresh browser (Cmd+Shift+R)

**Quick Test**:
After applying CORS, test with:
```bash
curl -I "https://firebasestorage.googleapis.com/v0/b/alf-coach-3aeab.firebasestorage.app/o/users%2F3saHBpWWptQ9BH6n0wfKj4qob143%2Fprojects%2Fbp_1760998525731_gcydt8ygw%2Fshowcase-1.json?alt=media" \
  -H "Origin: https://alflearninglabs.com"
```

Should return:
```
Access-Control-Allow-Origin: https://alflearninglabs.com
```

---

**Next Steps After Fix**:
1. Apply CORS configuration (Option 1 recommended)
2. Wait 1-2 minutes
3. Hard refresh browser
4. Test "View Review" again
5. Check `/app/debug/telemetry` to see cloud-first metrics

Let me know when you've applied the CORS fix and I'll help verify it's working! 🚀
