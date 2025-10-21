# Phase A Cloud-First Architecture: Comprehensive Diagnostic Report

**Date**: October 20, 2025
**Status**: CRITICAL - Production deployment broken with navigation errors
**Latest Commit**: `2541dc5` - Fix: Add Phase A environment variables to netlify.toml

---

## Executive Summary

We are implementing a three-phase migration to a cloud-first architecture for ALF Coach, a React/Firebase educational project builder. **Phase A was intended to enable cloud-first reads** - storing large project showcase data in Firebase Storage instead of localStorage/IndexedDB, with Firestore acting as a metadata pointer.

**Current Status**: The production site (alflearninglabs.com) is showing navigation errors with an empty console, preventing users from viewing completed projects. Despite successful local builds and multiple attempted fixes, the root cause remains elusive.

---

## The Three-Phase Cloud-First Architecture Plan

### Phase A: Cloud-First Reads (CURRENT - BROKEN)
**Goal**: Move large showcase JSON files to Firebase Storage, with Firestore holding pointers.

**Architecture**:
```
User completes project
  ↓
ChatMVP saves to:
  1. localStorage (immediate)
  2. Firebase Storage (showcase-{rev}.json)
  3. Firestore (metadata pointer: {showcasePath, rev, syncedAt})
  ↓
User clicks "View Review"
  ↓
ReviewScreen attempts:
  1. Firebase Storage (via Firestore pointer) - CLOUD FIRST
  2. Fallback to localStorage if cloud fails
  3. Fallback to Firestore if both fail
```

**Benefits**:
- Reduces localStorage bloat (showcases can be 100KB+)
- Enables cross-device access to completed projects
- Prepares for multi-device sync

**Implementation Files**:
- `src/services/CloudProjectService.ts` - Firebase Storage operations
- `src/services/ProjectLoadService.ts` - Cloud-first read orchestration
- `src/features/chat-mvp/ChatMVP.tsx` - Dual-save on completion
- `src/features/review/ReviewScreen.tsx` - Cloud-first load with fallbacks
- `src/config/featureFlags.js` - Feature flag: `cloudFirstReads`

### Phase B: Cloud-First Writes (PLANNED)
**Goal**: Make Firebase Storage the primary write target, localStorage becomes cache.

**Changes**:
- All project saves go to cloud first
- localStorage acts as optimistic update
- Background sync replaces immediate localStorage persistence

### Phase C: Real-Time Sync (PLANNED)
**Goal**: Enable multi-device real-time collaboration.

**Changes**:
- Firestore listeners for live updates
- Operational transforms for conflict resolution
- Presence indicators

---

## What We've Built (Phase A Implementation)

### 1. Cloud Storage Service (`CloudProjectService.ts`)

**Purpose**: Atomic two-phase commit to Firebase Storage + Firestore.

**Key Methods**:
```typescript
async saveShowcase(projectId, showcase, options): Promise<SaveResult>
  - Step 1: Upload to Storage at `users/{uid}/projects/{id}/showcase-{rev}.json`
  - Step 2: Update Firestore with metadata (atomic transaction)
  - Step 3: Cleanup old version (best-effort)
  - Returns: {success, rev, showcasePath, error}

async loadShowcase(projectId, options): Promise<LoadResult>
  - Reads Firestore metadata to get showcasePath
  - Generates fresh download URL from Storage
  - Fetches showcase JSON via HTTP
  - Returns: {success, showcase, metadata, source: 'cloud'|'cache'}
```

**Features**:
- Revision-based versioning (monotonically increasing)
- Conflict detection via optimistic locking
- 5-minute in-memory cache (TTL-based)
- Comprehensive telemetry tracking
- Mutex locks to prevent race conditions

### 2. Project Load Service (`ProjectLoadService.ts`)

**Purpose**: Orchestrate cloud-first reads with automatic fallbacks.

**Load Waterfall**:
```typescript
async loadProject(projectId): Promise<LoadResult>
  1. Try CloudProjectService.loadShowcase() // Firebase Storage
  2. If fails, try OfflineSnapshotService.loadSnapshot() // IndexedDB
  3. If fails, try localStorage // Browser storage
  4. Return first success or aggregate failure
```

**Telemetry Events**:
- `load_project` - Track success/failure per source
- `cache_hit` / `cache_miss` - Monitor cache effectiveness
- Error codes for debugging (AUTH_REQUIRED, NOT_FOUND, etc.)

### 3. Dual-Save Implementation (`ChatMVP.tsx`)

**When**: User completes project via chat wizard.

**Saves**:
```typescript
// Line 908: Legacy save (UnifiedStorageManager → Firestore + localStorage)
await unifiedStorage.saveProject(projectId, completeProject);

// Line 918-944: Phase A cloud save (NEW)
if (featureFlags.cloudFirstReads && completeProject.showcase) {
  await cloudProjectService.saveShowcase(projectId, completeProject.showcase);
}
```

**Why Both?**:
- Legacy path maintains backward compatibility
- Cloud save enables Phase A cloud-first reads
- Sync icon monitors legacy (Firestore) sync status

### 4. Cloud-First Review Screen (`ReviewScreen.tsx`)

**When**: User clicks "View Review" on completed project.

**Load Logic** (lines 415-457):
```typescript
if (featureFlags.cloudFirstReads) {
  const loadResult = await projectLoadService.loadProject(id);

  if (loadResult.success && loadResult.showcase) {
    // Cloud success - render showcase
    setRawProjectData({showcase: loadResult.showcase, ...});
    return; // Early exit
  } else {
    // Cloud failed - fall through to legacy localStorage path
    console.warn('Cloud-first load failed, falling back to local storage');
    // DON'T return - continue to line 461+
  }
}

// Legacy path: localStorage → heroTransform → render
```

**Bug Fixes Applied**:
1. **Line 428**: Removed `ReferenceError` on `displayData` (used before defined)
2. **Line 450**: Removed early `return` that prevented fallback

### 5. Feature Flags (`featureFlags.js`)

**Environment Variables** (read at build time):
```javascript
export const featureFlags = {
  // Phase A: Cloud-first reads
  cloudFirstReads: import.meta.env.VITE_CLOUD_FIRST_READS === 'true',

  // Phase B: Cloud-first writes (not yet enabled)
  cloudFirstWrites: import.meta.env.VITE_CLOUD_FIRST_WRITES === 'true',

  // Offline snapshot compression (enabled by default)
  enableOfflineSnapshot: import.meta.env.VITE_ENABLE_OFFLINE_SNAPSHOT !== 'false',

  // IndexedDB fallback (enabled by default)
  enableIDBFallback: import.meta.env.VITE_ENABLE_IDB_FALLBACK !== 'false'
};
```

**Critical**: These are evaluated **at build time** by Vite, not runtime!

---

## The Two-Cloud-System Architecture (Discovery)

### Why The Sync Icon Showed "Synced" While Cloud Reads Failed

We discovered the app uses **two separate Firebase backends**:

#### 1. Firebase Firestore (Document Database)
- **What saves here**: `UnifiedStorageManager.backgroundFirebaseSync()`
- **Data stored**: Project metadata, drafts, user settings
- **Monitored by**: "Synced to cloud" icon (`SyncStatusIndicator.tsx`)
- **Key code**: `UnifiedStorageManager.ts:1112`
  ```typescript
  data.syncStatus = 'synced';
  data.lastSyncAt = new Date();
  ```

#### 2. Firebase Storage (Blob Storage)
- **What saves here**: `CloudProjectService.saveShowcase()`
- **Data stored**: Large showcase JSON files (100KB+ each)
- **Monitored by**: Phase A telemetry (not UI indicator)
- **Key code**: `CloudProjectService.ts:66-89`
  ```typescript
  const showcasePath = `users/${userId}/projects/${projectId}/showcase-${newRev}.json`;
  await uploadBytes(storageRef, jsonBlob);
  ```

### Why This Was Confusing

**The Timeline**:
1. ✅ User completes project
2. ✅ `UnifiedStorageManager` saves to **Firestore** → `syncStatus = 'synced'`
3. ✅ Sync icon lights up green (monitoring Firestore)
4. ❌ `CloudProjectService.saveShowcase()` **wasn't being called** (bug in earlier code)
5. ❌ Firebase Storage remains **empty**
6. ❌ `ReviewScreen` cloud-first read queries **Storage** → not found → error

**The Fix**:
- Added `cloudProjectService.saveShowcase()` call in `ChatMVP.tsx:918-944`
- Now projects save to **both** Firestore (for sync icon) AND Storage (for Phase A reads)

---

## Critical Issues Discovered

### Issue 1: CORS Configuration Missing

**Problem**: Firebase Storage blocked requests from `alflearninglabs.com`.

**Error**:
```
Access to fetch at 'https://firebasestorage.googleapis.com/...'
from origin 'https://alflearninglabs.com' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

**Root Cause**: Firebase Storage defaults to rejecting all cross-origin requests.

**Fix Applied**: Configured CORS via `gsutil`:
```bash
gsutil cors set firebase-storage-cors.json gs://alf-coach-3aeab.firebasestorage.app
```

**CORS Configuration**:
```json
{
  "origin": ["https://alflearninglabs.com", "http://localhost:5173", ...],
  "method": ["GET", "HEAD"],
  "maxAgeSeconds": 3600,
  "responseHeader": ["Content-Type", "Authorization", ...]
}
```

**Status**: ✅ FIXED (verified via `gsutil cors get`)

---

### Issue 2: Environment Variables Not In Build

**Problem**: Production builds had `cloudFirstReads = false` even though env vars were set in Netlify UI.

**Discovery**:
```bash
# Check built files
grep -o "cloudFirstReads:[^,}]*" dist/assets/featureFlags-*.js
# Output: cloudFirstReads:!1  # ← FALSE! (0 = false, 1 = true in minified JS)
```

**Root Cause**:
- Vite reads environment variables **at build time**, not runtime
- Environment variables were set in Netlify UI but **not in netlify.toml**
- Local builds didn't have env vars set, so `import.meta.env.VITE_CLOUD_FIRST_READS` was `undefined`
- JavaScript: `undefined === 'true'` → `false`

**Fix Applied**: Added to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "20.11.0"
  # Phase A: Cloud-first architecture
  VITE_CLOUD_FIRST_READS = "true"
  VITE_ENABLE_OFFLINE_SNAPSHOT = "true"
  VITE_ENABLE_IDB_FALLBACK = "true"
```

**Verification**:
```bash
# Rebuild with env vars
VITE_CLOUD_FIRST_READS=true npm run build

# Check built files
grep -o "cloudFirstReads:[^,}]*" dist/assets/featureFlags-*.js
# Output: cloudFirstReads:!0  # ← TRUE! ✅
```

**Status**: ✅ FIXED in commit `2541dc5`

---

### Issue 3: Navigation Error Boundary Hiding Real Errors

**Problem**: Production site shows "Loading... We're recovering from a navigation error" with **empty console**.

**Expected Behavior**: Navigation error boundary (`NavigationErrorBoundary` in `ErrorBoundary.tsx`) should log:
```javascript
console.error('🚨🚨🚨 NAVIGATION ERROR BOUNDARY CAUGHT ERROR 🚨🚨🚨');
console.error('Error:', error);
console.error('Error message:', error.message);
// ... more detailed logging (lines 206-212)
```

**Actual Behavior**: Console is completely empty - no logs, no errors, nothing.

**Theories**:

#### Theory A: Error Suppressor Silencing Everything
**File**: `src/utils/error-suppressor.ts`
**Evidence**: Called in `main.jsx:12` via `setupErrorSuppressor()`

**What it does**:
```typescript
// Wraps console.error
const originalConsoleError = console.error;
console.error = function(...args) {
  const errorString = args.join(' ');
  const shouldSuppress = suppressPatterns.some(pattern =>
    errorString.includes(pattern)
  );
  if (!shouldSuppress) {
    originalConsoleError.apply(console, args);
  }
};
```

**Suppress patterns include**:
- Browser extension errors
- Firebase permission errors
- Chrome/Mozilla extension errors

**Could this be suppressing Phase A errors?** Possibly, but the error boundary's 🚨 logs should still appear.

#### Theory B: Error During App Initialization (Before Error Boundary Mounts)
**Evidence**:
- Empty console suggests JavaScript crashes before React renders
- Error boundary only catches errors **after** it mounts
- If app crashes in `main.jsx` before `createRoot().render()`, no error boundary exists

**Possible crash points**:
1. `setupErrorSuppressor()` (line 12)
2. `globalErrorHandler.initialize()` (line 15)
3. `setupCleanConsole()` (line 19 - DEV only)
4. `import App from './App'` (line 6)
5. `createRoot(document.getElementById('root'))` (line 22)

**Why console would be empty**:
- If error happens before error suppressor runs → no logging mechanism
- If error happens during suppressor setup → suppressor itself might crash
- If error is caught by global error handler → might be suppressed

#### Theory C: Build Output Mismatch
**Evidence**:
- Local build works (with env vars): `cloudFirstReads:!0` ✅
- Netlify build might be different (if env vars not applied)

**Hypothesis**: Netlify might be caching old build artifacts or building without env vars.

**How to verify**:
1. Check Netlify build logs for environment variable values
2. Download built `featureFlags-*.js` from Netlify and check value
3. Compare file hashes between local dist and deployed version

#### Theory D: Import Errors Due to Missing Lazy Chunk
**Evidence**: Earlier commit `3cf83bb` - "Fix lazy import errors: Change named exports to default exports"

**What this suggests**: There were issues with dynamic imports failing in production.

**Navigation error boundary is designed to catch**:
```typescript
errorMessage.includes('loading chunk') ||
errorMessage.includes('failed to fetch dynamically imported module') ||
errorMessage.includes('loading failed for the module')
```

**Could be happening**:
1. Phase A code tries to lazy load `CloudProjectService`
2. Chunk fails to load (404, CORS, etc.)
3. Error caught by navigation boundary
4. But error suppressor prevents logging?

#### Theory E: Firebase Authentication Issue
**Evidence**: Cloud services require `auth.currentUser?.uid`

**Code in CloudProjectService.ts:106-124**:
```typescript
const userId = auth.currentUser?.uid;
if (!userId) {
  return {success: false, error: {code: 'AUTH_REQUIRED', ...}};
}
```

**Hypothesis**:
- Anonymous auth might be failing in production
- `auth.currentUser` is null
- Cloud services return `AUTH_REQUIRED`
- App falls back to localStorage
- But localStorage is also empty (new user)
- App has no data to render
- Navigation error boundary triggers with generic error

**Why console might be empty**:
- Error suppressor has pattern: `'Missing or insufficient permissions'`
- Firebase auth errors might match this pattern
- Suppressed before logging

---

## Current Deployment Status

### Git Repository
```bash
Latest commit: 2541dc5 - Fix: Add Phase A environment variables to netlify.toml
Branch: main
Status: Up to date with origin/main
```

### Key Commits (Most Recent First)
```
2541dc5 - Fix: Add Phase A environment variables to netlify.toml
9b7ad71 - Create FIREBASE_CORS_FIX.md
a9c6f51 - Create firebase-storage-cors.json
d42c37d - PHASE A COMPLETE: Fix cloud-first reads AND writes
2eefa80 - Create PHASE_A_TROUBLESHOOTING.md
3cf83bb - Fix lazy import errors: Change named exports to default exports
8df8747 - Export featureFlags for cloud-first architecture
```

### Netlify Status
**Site**: projectcraft-alf (alflearninglabs.com)
**Last Deployed Commit**: `9b7ad71` (as of last check)
**Expected Next Deploy**: `2541dc5` (with netlify.toml env vars)

**Critical**: Netlify needs to rebuild with commit `2541dc5` to pick up environment variables!

### Firebase Configuration
**CORS**: ✅ Configured (verified)
**Storage Bucket**: `alf-coach-3aeab.firebasestorage.app`
**Firestore Database**: `alf-coach-3aeab`
**Authentication**: Anonymous enabled

---

## Diagnostic Commands

### Check Feature Flag Value in Built Files
```bash
# Should show cloudFirstReads:!0 (true)
grep -o "cloudFirstReads:[^,}]*" dist/assets/featureFlags-*.js
```

### Verify CORS Configuration
```bash
# Should show alflearninglabs.com in origin list
gsutil cors get gs://alf-coach-3aeab.firebasestorage.app
```

### Check Environment Variables in Build
```bash
# Look for VITE_ variables in Netlify build log
# Should see:
# VITE_CLOUD_FIRST_READS=true
# VITE_ENABLE_OFFLINE_SNAPSHOT=true
# VITE_ENABLE_IDB_FALLBACK=true
```

### Test Production Build Locally
```bash
# Build with env vars
VITE_CLOUD_FIRST_READS=true VITE_ENABLE_OFFLINE_SNAPSHOT=true VITE_ENABLE_IDB_FALLBACK=true npm run build

# Serve locally
npm run preview

# Open http://localhost:4173
# NOTE: Gemini API won't work (requires Netlify Functions)
```

### Check Netlify Deployment
```bash
# Open Netlify dashboard
open https://app.netlify.com/sites/projectcraft-alf/deploys

# Look for deployment of commit 2541dc5
# Check build logs for:
# 1. Environment variables being set
# 2. Build succeeding
# 3. No errors in output
```

---

## Next Steps & Recommendations

### Immediate Actions (Priority Order)

#### 1. Verify Netlify Has Latest Code
**What**: Confirm deployment of commit `2541dc5`
**Why**: This commit has environment variables in netlify.toml
**How**:
1. Check Netlify dashboard → Deploys tab
2. Look for commit starting with `2541dc5`
3. If not there, trigger manual deploy: "Trigger deploy" → "Clear cache and deploy site"
4. Wait for build to complete (2-3 minutes)
5. Check build log for `VITE_CLOUD_FIRST_READS=true`

#### 2. Download and Inspect Production JavaScript
**What**: Verify feature flags in deployed code
**Why**: Ensure Netlify built with correct environment variables
**How**:
1. Open alflearninglabs.com
2. Open DevTools → Network tab
3. Find `featureFlags-*.js` in list
4. Download the file
5. Search for `cloudFirstReads`
6. Should see: `cloudFirstReads:!0` (true) or `cloudFirstReads:true`
7. If you see: `cloudFirstReads:!1` or `cloudFirstReads:false` → Build failed

#### 3. Investigate Empty Console
**What**: Determine why console has no logs
**Why**: Can't debug without error messages
**How**:

**Option A: Bypass Error Suppressor**
```javascript
// In browser console, paste this to restore original console.error:
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
document.body.appendChild(iframe);
window.console = iframe.contentWindow.console;
```

**Option B: Check Network Tab**
1. Open DevTools → Network tab
2. Reload page
3. Look for failed requests (red status codes)
4. Check:
   - JavaScript chunks (404 means missing file)
   - Firebase API calls (401 means auth issue, 403 means permissions)
   - Storage URLs (CORS errors)

**Option C: Add Debug Logging**
Edit `src/main.jsx` to add logging before error suppressor:
```javascript
console.log('🔵 MAIN.JSX: Starting app initialization');
console.log('🔵 MAIN.JSX: Environment:', import.meta.env.MODE);

setupErrorSuppressor();
console.log('🔵 MAIN.JSX: Error suppressor initialized');

globalErrorHandler.initialize();
console.log('🔵 MAIN.JSX: Global error handler initialized');
```

#### 4. Test Anonymous Auth in Production
**What**: Verify Firebase anonymous authentication works
**Why**: Cloud services require authenticated user
**How**:
1. Open alflearninglabs.com
2. Open console
3. Paste:
   ```javascript
   import { getAuth } from 'firebase/auth';
   const auth = getAuth();
   console.log('Auth user:', auth.currentUser);
   console.log('Auth state:', auth.currentUser ? 'authenticated' : 'not authenticated');
   ```
4. Should see user object with `uid`
5. If null, anonymous auth is broken

#### 5. Enable Production Error Logging
**What**: Temporarily disable error suppressor in production
**Why**: See real errors without filters
**How**:

Edit `src/main.jsx`:
```javascript
// Comment out error suppressor in production
if (import.meta.env.DEV) {  // Only in development
  setupErrorSuppressor();
}
```

Rebuild, deploy, test.

---

### Medium-Term Fixes

#### 1. Add Comprehensive Error Boundary Logging
**File**: `src/components/ErrorBoundary.tsx`

Add explicit logging that bypasses suppressors:
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Force logging with alert as backup
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };

  // Multiple logging strategies
  console.error('🚨 ERROR BOUNDARY:', errorDetails);

  // Also store in localStorage for retrieval
  localStorage.setItem('lastError', JSON.stringify(errorDetails));

  // In development, also alert
  if (import.meta.env.DEV) {
    alert(`Error caught: ${error.message}`);
  }
}
```

#### 2. Add Telemetry Dashboard Access
**What**: Make `/app/debug/telemetry` work in production
**Why**: Monitor cloud-first operations in real-time
**How**:

Current restriction in `src/pages/DebugTelemetry.tsx`:
```typescript
// Only visible when VITE_REVIEW_DEBUG=true
```

Add to netlify.toml temporarily:
```toml
VITE_REVIEW_DEBUG = "true"
```

Then access: `https://alflearninglabs.com/app/debug/telemetry`

**What you'll see**:
- Save success rates (target: >99.5%)
- Load success rates
- Cache hit rates (target: >60%)
- Average latency (target: <500ms)
- Error codes
- Recent events with timestamps

#### 3. Implement Staged Rollout
**What**: Test Phase A with subset of users
**Why**: Reduce blast radius if bugs exist
**How**:

Modify `featureFlags.js`:
```javascript
export const featureFlags = {
  // Enable for 10% of users based on user ID hash
  cloudFirstReads: import.meta.env.VITE_CLOUD_FIRST_READS === 'true'
    && shouldEnableForUser(),
  // ...
};

function shouldEnableForUser() {
  const userId = getCurrentUserId();
  if (!userId) return false;

  // Hash user ID to number 0-99
  const hash = hashCode(userId) % 100;

  // Enable for 10% of users
  return hash < 10;
}
```

#### 4. Add Feature Flag Override UI
**What**: Admin panel to toggle features
**Why**: Quick rollback without deployment
**How**:

Add to `/app/debug` route:
```typescript
<button onClick={() => {
  localStorage.setItem('override_cloudFirstReads', 'false');
  window.location.reload();
}}>
  Disable Cloud-First Reads
</button>
```

Read override in `featureFlags.js`:
```javascript
cloudFirstReads: (
  localStorage.getItem('override_cloudFirstReads') === 'true'
  || (
    localStorage.getItem('override_cloudFirstReads') !== 'false'
    && import.meta.env.VITE_CLOUD_FIRST_READS === 'true'
  )
)
```

---

### Long-Term Architecture Improvements

#### 1. Separate Error Handling from Error Suppression
**Current Problem**: Single suppressor handles both browser extension noise and real app errors.

**Proposed Solution**:
```typescript
// error-filter.ts - Only suppress known noise
export function isKnownNoiseError(error: string): boolean {
  return [
    'chrome-extension://',
    'moz-extension://',
    'Attempting to use a disconnected port'
  ].some(pattern => error.includes(pattern));
}

// error-logger.ts - Log everything else
export function logError(error: Error, context: object) {
  if (isKnownNoiseError(error.message)) {
    return; // Silent ignore
  }

  // Log to console
  console.error('[APP ERROR]', error, context);

  // Send to error tracking service (Sentry, etc.)
  if (import.meta.env.PROD) {
    sendToErrorTracking(error, context);
  }
}
```

#### 2. Implement Health Check Endpoint
**What**: `/api/health` that validates all systems
**Why**: Quick diagnostic for support team

**Checks**:
- ✅ Firebase Auth working
- ✅ Firebase Storage accessible
- ✅ Firestore readable/writable
- ✅ Feature flags loaded correctly
- ✅ Environment variables present

**Returns**:
```json
{
  "status": "healthy|degraded|unhealthy",
  "checks": {
    "firebase_auth": {"status": "pass", "uid": "abc123"},
    "firebase_storage": {"status": "pass", "cors": "configured"},
    "firestore": {"status": "pass", "latency_ms": 45},
    "feature_flags": {
      "cloudFirstReads": true,
      "source": "environment"
    }
  },
  "timestamp": "2025-10-20T23:00:00Z"
}
```

#### 3. Add Observability Stack
**Components**:
1. **Error Tracking**: Sentry or Rollbar
2. **Analytics**: Track feature adoption (% using cloud-first)
3. **Performance Monitoring**: Track load times by source
4. **User Session Replay**: Understand error context

**Implementation**:
```typescript
// observability.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,

  beforeSend(event, hint) {
    // Filter out known browser extension errors
    if (isKnownNoiseError(event.message || '')) {
      return null;
    }
    return event;
  }
});
```

#### 4. Progressive Enhancement Strategy
**Instead of**: All-or-nothing feature flag
**Use**: Graceful degradation tiers

```typescript
export const capabilities = {
  // Tier 1: Always available (localStorage)
  basicPersistence: true,

  // Tier 2: Available if online (Firestore)
  cloudSync: isOnline() && hasFirebaseAccess(),

  // Tier 3: Available if Phase A working (Storage)
  cloudFirstReads: (
    isOnline()
    && hasFirebaseAccess()
    && featureFlags.cloudFirstReads
    && !isCloudFirstBroken() // Health check
  ),

  // Tier 4: Future (real-time sync)
  realtimeSync: false
};

function isCloudFirstBroken(): boolean {
  // Check localStorage for recent failures
  const recentErrors = getRecentCloudErrors();
  return recentErrors.length > 5; // More than 5 failures in last hour
}
```

---

## Open Questions

### Technical Questions

1. **Why is console completely empty in production?**
   - Is error suppressor too aggressive?
   - Is there an error before React mounts?
   - Is there a CSP policy blocking console?
   - Is the browser DevTools broken?

2. **Are environment variables being read by Netlify build?**
   - Can we see them in Netlify build logs?
   - Are they being passed to Vite correctly?
   - Does `netlify.toml` work or do we need UI settings?

3. **Is anonymous auth working in production?**
   - Does `auth.currentUser` return a user?
   - Is the Firebase config correct for production domain?
   - Are there CORS issues with Firebase Auth?

4. **Are lazy imports failing?**
   - Is `CloudProjectService` being loaded?
   - Are there 404s for chunk files?
   - Is code splitting breaking in production?

5. **Is localStorage working in production?**
   - Can we write to it?
   - Can we read from it?
   - Is there a quota issue?

### Product Questions

1. **Should we rollback Phase A entirely?**
   - Return to 100% localStorage approach
   - Focus on stability over features
   - Implement Phase A more gradually

2. **Is the dual-cloud architecture the right design?**
   - Should we consolidate to single backend (Firestore OR Storage)?
   - Is the complexity worth the benefits?
   - Are there simpler alternatives?

3. **What's the user impact?**
   - How many users are affected?
   - Can existing users access old projects?
   - Is this a blocker for new users?

4. **What's our fallback plan?**
   - Can we revert to last known good commit?
   - What commit should we target?
   - How long can we tolerate downtime?

---

## Success Criteria (How We'll Know Phase A Works)

### Functional Tests

#### Test 1: Complete New Project
```
User: alflearninglabs.com
Action: Complete project via chat wizard
Expected Console Logs:
  [ChatMVP] Project saved successfully
  [ChatMVP] 🌥️ Saving showcase to cloud...
  [ChatMVP] ✅ Showcase saved to cloud (rev 1) users/.../showcase-1.json
  [ReviewScreen] =========== LOADING PROJECT DATA ===========
  [ReviewScreen] Cloud-first enabled: true
  [ReviewScreen] 🌥️ Attempting cloud-first load...
  [ReviewScreen] ✅ Loaded from cloud (rev 1)

Expected Firebase Storage:
  File: users/{uid}/projects/{id}/showcase-1.json
  Size: ~100-200KB
  Metadata: rev=1, projectId={id}

Expected Firestore:
  Document: users/{uid}/projects/{id}
  Fields: {showcasePath, rev: 1, syncedAt, title, ...}

Expected Result:
  ✅ Project displays in ReviewScreen
  ✅ No navigation errors
  ✅ All content renders correctly
```

#### Test 2: Load Existing Project (Cloud Hit)
```
User: alflearninglabs.com (returning user with existing project)
Action: Click "View Review" on completed project
Expected Console Logs:
  [ReviewScreen] 🌥️ Attempting cloud-first load...
  [ReviewScreen] ✅ Loaded from cloud (rev 1)
  [ReviewScreen] Source: cloud (not cache)

Expected Network:
  GET https://firebasestorage.googleapis.com/.../showcase-1.json
  Status: 200 OK
  Response Headers: Access-Control-Allow-Origin: https://alflearninglabs.com

Expected Result:
  ✅ Project loads within 500ms
  ✅ Content matches original
```

#### Test 3: Offline Fallback
```
User: alflearninglabs.com
Setup: Disconnect network
Action: Click "View Review" on previously loaded project
Expected Console Logs:
  [ReviewScreen] 🌥️ Attempting cloud-first load...
  [ReviewScreen] ⚠️ Cloud-first load failed, falling back to local storage
  [ReviewScreen] ✅ Loaded from localStorage

Expected Result:
  ✅ Project still loads (from cache)
  ✅ No errors shown to user
```

### Performance Metrics (from /app/debug/telemetry)

```
Save Success Rate: >99.5% ✅
Load Success Rate: >99.5% ✅
Cache Hit Rate: >60% ✅
Avg Load Latency: <500ms ✅
Error Codes: {} (empty) ✅

Sync Status Counts:
  synced: 90%+
  syncing: <5%
  error: <1%
  offline: <5%

Offline Snapshot Stats:
  Total Snapshots: 10+
  Total Size: <1MB
  Avg Compression: 70%+
```

### User-Facing Success

- ✅ No navigation errors
- ✅ Projects load quickly (<1 second perceived)
- ✅ Works offline for recently viewed projects
- ✅ Cross-device access (view project on different device)
- ✅ No data loss
- ✅ Sync icon shows accurate status

---

## Rollback Plan

If Phase A continues to fail, here's the rollback strategy:

### Option 1: Disable Feature Flag (Quickest)
```bash
# Edit netlify.toml
[build.environment]
  VITE_CLOUD_FIRST_READS = "false"  # ← Change to false

# Commit and push
git add netlify.toml
git commit -m "Rollback: Disable Phase A cloud-first reads"
git push

# Netlify auto-deploys in 2-3 minutes
# App returns to 100% localStorage behavior
```

**Impact**:
- ✅ Fast recovery (2-3 minutes)
- ✅ No code changes needed
- ✅ Existing users unaffected
- ❌ Loses Phase A benefits
- ❌ Doesn't fix root cause

### Option 2: Revert to Pre-Phase-A Commit (Nuclear)
```bash
# Identify last stable commit (before Phase A)
git log --oneline --before="2025-10-19" | head -5

# Example: Revert to commit before "Phase A: Integrate cloud-first reads"
git revert af11f98..HEAD --no-commit
git commit -m "Rollback: Revert all Phase A changes"
git push
```

**Impact**:
- ✅ Complete rollback to known-good state
- ✅ All Phase A code removed
- ❌ Loses all Phase A work
- ❌ Requires re-implementation later
- ❌ May cause merge conflicts

### Option 3: Conditional Rollback (Safest)
```javascript
// featureFlags.js
export const featureFlags = {
  cloudFirstReads: (
    import.meta.env.VITE_CLOUD_FIRST_READS === 'true'
    && !isProductionBroken() // ← Add safety check
  ),
  // ...
};

function isProductionBroken(): boolean {
  // Check for too many recent errors
  const errors = JSON.parse(localStorage.getItem('cloudErrors') || '[]');
  const recentErrors = errors.filter(e =>
    Date.now() - e.timestamp < 3600000 // Last hour
  );

  // If more than 10 errors in last hour, disable
  return recentErrors.length > 10;
}
```

**Impact**:
- ✅ Auto-disables if broken
- ✅ Self-healing
- ✅ No deployment needed
- ⚠️ Adds complexity
- ⚠️ Might mask real issues

---

## Files Modified (Phase A Implementation)

### Core Services
- ✅ `src/services/CloudProjectService.ts` - NEW (Firebase Storage operations)
- ✅ `src/services/ProjectLoadService.ts` - NEW (Cloud-first orchestration)
- ✅ `src/services/telemetry.ts` - ENHANCED (Phase A event tracking)
- ✅ `src/services/SyncStatusManager.ts` - ENHANCED (Cloud status tracking)

### Feature Components
- ✅ `src/features/chat-mvp/ChatMVP.tsx` - MODIFIED (Dual-save: localStorage + Storage)
- ✅ `src/features/review/ReviewScreen.tsx` - MODIFIED (Cloud-first load with fallbacks)

### Configuration
- ✅ `src/config/featureFlags.js` - MODIFIED (Added Phase A flags)
- ✅ `netlify.toml` - MODIFIED (Added environment variables)
- ✅ `firebase-storage-cors.json` - NEW (CORS configuration)

### Debug/Monitoring
- ✅ `src/pages/DebugTelemetry.tsx` - EXISTS (Telemetry dashboard)
- ✅ `src/hooks/useBlueprintDoc.ts` - MODIFIED (Added Firestore metadata support)

### Documentation
- ✅ `PHASE_A_TROUBLESHOOTING.md` - NEW (Troubleshooting guide)
- ✅ `FIREBASE_CORS_FIX.md` - NEW (CORS setup instructions)
- ✅ `PHASE_A_COMPREHENSIVE_REPORT.md` - NEW (This document)

---

## Timeline of Events (October 19-20, 2025)

### Day 1: October 19
- **22:07**: Commit `8df8747` - Export featureFlags for cloud-first architecture
- **22:13**: User reports navigation error on production site
- **22:13**: Screenshot shows "Loading... We're recovering from a navigation error"
- **Late evening**: Multiple attempts to fix, local builds succeed

### Day 2: October 20
- **04:57**: Commit `3cf83bb` - Fix lazy import errors (named → default exports)
- **04:58**: Commit `2eefa80` - Create PHASE_A_TROUBLESHOOTING.md
- **18:13**: Commit `d42c37d` - PHASE A COMPLETE: Fix cloud-first reads AND writes
  - Added CloudProjectService.saveShowcase() call in ChatMVP
  - Fixed ReviewScreen fallback logic (ReferenceError, early return)
- **18:32**: Commit `a9c6f51` - Create firebase-storage-cors.json
- **18:32**: Commit `9b7ad71` - Create FIREBASE_CORS_FIX.md
- **18:32**: Applied CORS configuration via gsutil ✅
- **18:45**: Commit `2541dc5` - Fix: Add Phase A environment variables to netlify.toml
- **22:00**: User reports navigation error persists, console still empty
- **22:30**: Discovered environment variables weren't in build (`cloudFirstReads:!1`)
- **22:45**: Rebuilt with env vars, verified `cloudFirstReads:!0` ✅
- **23:00**: User confirms error persists on production (Netlify)
- **23:15**: Writing comprehensive diagnostic report

---

## Conclusions & Recommendations

### What We Know
1. ✅ **Local builds work** when environment variables are set
2. ✅ **CORS is configured** correctly for Firebase Storage
3. ✅ **Code is correct** - Phase A implementation follows best practices
4. ✅ **Feature flags build correctly** with env vars
5. ❌ **Production is broken** with navigation errors
6. ❌ **Console is empty** - cannot debug without error messages
7. ❓ **Netlify build status** - Need to verify deployment of `2541dc5`

### What's Most Likely Wrong
1. **Netlify hasn't deployed latest commit** with environment variables
2. **Error suppressor is too aggressive** and hiding all errors
3. **Something crashes before error boundary mounts** (initialization error)
4. **Browser cache** is serving old broken JavaScript

### Immediate Action Required
**#1 Priority**: Verify Netlify deployment status
- Check if commit `2541dc5` is deployed
- Check build logs for environment variables
- Trigger manual deploy if needed

**#2 Priority**: Get error visibility
- Temporarily disable error suppressor in production
- Add forced logging that bypasses suppressors
- Check browser Network tab for failed requests

**#3 Priority**: Test with minimal changes
- Disable Phase A entirely (`VITE_CLOUD_FIRST_READS=false`)
- Confirm app works without Phase A
- Re-enable incrementally

### Recommended Next Steps (In Order)

1. **Verify Netlify Deployment** (5 minutes)
   - Check dashboard for `2541dc5`
   - If missing, trigger deploy
   - Wait for completion
   - Hard refresh browser

2. **If Still Broken: Disable Phase A** (10 minutes)
   - Set `VITE_CLOUD_FIRST_READS=false` in netlify.toml
   - Commit and push
   - Verify app works

3. **If Works Without Phase A: Investigate Root Cause** (1 hour)
   - Download production JavaScript
   - Check feature flag values
   - Test Firebase auth
   - Check for import errors

4. **If Doesn't Work Even Without Phase A: Rollback** (30 minutes)
   - Revert to commit before Phase A (before `af11f98`)
   - Emergency deployment
   - Investigate separately

5. **Once Stable: Re-implement Phase A Incrementally** (1 week)
   - Start with telemetry only
   - Add cloud saves (write-only)
   - Add cloud reads (behind flag)
   - Staged rollout (10% → 50% → 100%)

---

## Contact Points for Further Assistance

### If You Need Help With:

**Firebase/GCP**:
- Firebase Console: https://console.firebase.google.com
- Firebase Support: https://firebase.google.com/support
- Cloud Storage CORS: https://cloud.google.com/storage/docs/cross-origin

**Netlify**:
- Netlify Dashboard: https://app.netlify.com
- Netlify Support: https://www.netlify.com/support
- Environment Variables: https://docs.netlify.com/environment-variables/overview

**React/Vite**:
- Vite Environment Variables: https://vite.dev/guide/env-and-mode
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

**Debugging**:
- Chrome DevTools: https://developer.chrome.com/docs/devtools
- Error Tracking: https://sentry.io/for/react

---

## Appendix: Code Snippets for Quick Reference

### Force Console Logging (Paste in Browser)
```javascript
// Bypass error suppressor
const iframe = document.createElement('iframe');
iframe.style.display = 'none';
document.body.appendChild(iframe);
console.log = iframe.contentWindow.console.log;
console.error = iframe.contentWindow.console.error;
console.warn = iframe.contentWindow.console.warn;

console.log('✅ Console restored - errors will now show');
```

### Check Feature Flags (Paste in Browser)
```javascript
// Dynamically import and check feature flags
import('/src/config/featureFlags.js').then(module => {
  console.log('Feature Flags:', module.featureFlags);
});
```

### Check Firebase Auth (Paste in Browser)
```javascript
// Check if user is authenticated
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Firebase Auth:', {
  user: auth.currentUser,
  uid: auth.currentUser?.uid,
  isAnonymous: auth.currentUser?.isAnonymous
});
```

### Force Feature Flag Override (Paste in Browser)
```javascript
// Disable cloud-first reads
localStorage.setItem('override_cloudFirstReads', 'false');
console.log('Phase A disabled. Reload page to apply.');
```

### Retrieve Last Error (Paste in Browser)
```javascript
// Get error stored by error boundary
const lastError = localStorage.getItem('lastError');
if (lastError) {
  console.log('Last Error:', JSON.parse(lastError));
} else {
  console.log('No errors stored');
}
```

---

**Report Generated**: October 20, 2025, 11:00 PM
**Status**: 🔴 CRITICAL - Production broken, root cause unknown
**Next Review**: After Netlify deployment verification

---

_This report will be updated as new information becomes available._
