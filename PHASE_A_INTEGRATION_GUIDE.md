# Phase A Integration Guide - Cloud-First Reads

**Status**: Ready to Integrate
**Files Ready**: All services created, imports added to ReviewScreen
**Estimated Time**: 30 minutes

---

## ✅ What's Already Done

1. **Feature Flag Configuration** ✅
   - `src/config/featureFlags.ts` - Centralized flag management
   - `.env.example` - Updated with cloud-first flags
   - Default: `VITE_CLOUD_FIRST_READS=false` (opt-in)

2. **Core Services** ✅
   - `CloudProjectService` - Two-phase atomic saves/loads
   - `ProjectLoadService` - Orchestrates cloud/local fallbacks
   - `OfflineSnapshotService` - Compressed localStorage fallback
   - `Telemetry` - Tracks all operations
   - `SyncStatusManager` - Real-time status updates

3. **UI Components** ✅
   - `SyncStatusIndicator` - Shows sync state to users
   - All imports added to ReviewScreen

---

## 🔧 ReviewScreen Integration (Manual Step)

The ReviewScreen is already partially integrated (imports added). Here's the final modification needed:

### Current Load Logic (Line ~403-517)

The `loadHeroData` function currently:
1. Loads from localStorage
2. Rehydrates from IDB if needed
3. Tries hero transformation
4. Falls back to Cloud

### New Load Logic (Cloud-First)

Replace the beginning of `loadHeroData` with:

```typescript
const loadHeroData = async () => {
  try {
    setIsLoadingHero(true);
    setHeroError(null);

    console.log(`[ReviewScreen] =========== LOADING PROJECT DATA ===========`);
    console.log(`[ReviewScreen] Project ID: ${id}`);
    console.log(`[ReviewScreen] Cloud-first enabled: ${featureFlags.cloudFirstReads}`);

    // PHASE A: Cloud-first load with automatic fallbacks
    if (featureFlags.cloudFirstReads) {
      const loadResult = await projectLoadService.loadProject(id);

      if (loadResult.success && loadResult.showcase) {
        console.log(
          `[ReviewScreen] ✅ Loaded from ${loadResult.source} ` +
          `(rev ${loadResult.rev || 'unknown'})`
        );

        // Set showcase as raw project data
        setRawProjectData({
          showcase: loadResult.showcase,
          wizardData: displayData?.wizardData || {},
          status: 'completed',
          stage: 'review'
        });

        // Try hero transformation (optional enhancement)
        try {
          const enhanced = await unifiedStorage.loadHeroProject(id);
          if (enhanced) {
            setHeroData(enhanced);
            console.log(`[ReviewScreen] ✅ Hero transformation successful`);
          }
        } catch (heroErr) {
          console.warn(`[ReviewScreen] Hero transformation failed (non-fatal):`, heroErr);
          // Continue without hero data - we have showcase
        }

        return; // Success!
      } else {
        // Cloud-first load failed
        console.error(
          `[ReviewScreen] ❌ Cloud-first load failed:`,
          loadResult.error
        );

        // Show user-friendly error
        setHeroError(
          new Error(
            loadResult.error?.message || 'Failed to load project from cloud'
          )
        );
        return;
      }
    }

    // LEGACY PATH: Original load logic (if cloud-first disabled)
    // ... (keep existing code from line 411 onwards)
    const rawKey = `alf_project_${id}`;
    const rawData = localStorage.getItem(rawKey);
    // ... rest of original logic
```

### Key Changes Explanation

1. **Feature Flag Check**: First line checks `featureFlags.cloudFirstReads`
2. **ProjectLoadService**: Handles entire load sequence with fallbacks
3. **Success Path**: Sets showcase, attempts hero transform, returns
4. **Failure Path**: Sets error state with user-friendly message
5. **Legacy Path**: Original code remains for when flag is off

---

## 🧪 Testing Phase A

### Step 1: Enable Feature Flag

Create `.env.local`:
```bash
# Enable cloud-first reads for testing
VITE_CLOUD_FIRST_READS=true

# Keep IDB fallback during pilot
VITE_ENABLE_IDB_FALLBACK=true

# Enable offline snapshot
VITE_ENABLE_OFFLINE_SNAPSHOT=true

# Debug mode
VITE_REVIEW_DEBUG=true

# Show all errors (no suppression)
VITE_SUPPRESS_ERRORS=false
VITE_SUPPRESS_FIREBASE_ERRORS=false
```

### Step 2: Test Scenarios

**Scenario 1: Cloud Load** (Happy Path)
```
1. Save a project
2. Wait for cloud sync
3. Clear localStorage
4. Navigate to ReviewScreen
5. Expected: Loads from cloud
6. Check console: "Loaded from cloud"
```

**Scenario 2: Offline Snapshot Fallback**
```
1. Save a project
2. Go offline (disable network in DevTools)
3. Navigate to ReviewScreen
4. Expected: Loads from offline snapshot
5. Check console: "Loaded from offline_snapshot"
```

**Scenario 3: IDB Fallback**
```
1. Save a project (cloud sync pending)
2. Showcase offloaded to IDB
3. Navigate to ReviewScreen
4. Expected: Loads from IDB
5. Check console: "Loaded from idb"
```

**Scenario 4: Legacy Mode**
```
1. Set VITE_CLOUD_FIRST_READS=false
2. Navigate to ReviewScreen
3. Expected: Uses original UnifiedStorageManager path
4. Check console: "Legacy load"
```

### Step 3: Verify Telemetry

Open browser console and run:
```javascript
import { telemetry } from './services/telemetry';

// View stats
console.log(telemetry.getStats());

// Expected output:
// {
//   loadSuccessRate: 100,  // Target: >99.5%
//   avgLoadLatency: 450,   // Target: <500ms
//   cacheHitRate: 60,      // Target: >60%
//   errorCodes: {}         // Should be empty
// }

// View recent events
console.log(telemetry.getRecentEvents(10));
```

### Step 4: Monitor Sync Status

Check sync status UI shows correct state:
```
- After save: "Syncing..." → "Synced"
- On error: "Sync Failed" with retry button
- Offline: "Offline" with queued changes count
```

---

## 📊 Success Criteria

Phase A complete when:
- [ ] Feature flag toggles between cloud/legacy correctly
- [ ] Cloud load works with >99.5% success
- [ ] Offline fallback works (snapshot or IDB)
- [ ] No 403/404 Storage errors
- [ ] Telemetry shows latency <500ms
- [ ] Cache hit rate >60% after warmup
- [ ] Sync status visible to users

---

## 🐛 Troubleshooting

### "Project not found" Error

**Symptoms**: ReviewScreen shows error even though project exists

**Causes**:
1. Storage rules not deployed
2. Project not synced to cloud yet
3. Feature flag enabled but project is localStorage-only

**Solutions**:
```bash
# 1. Deploy storage rules
npm run deploy:storage-rules

# 2. Force sync project
# (Add manual sync button in dashboard)

# 3. Disable cloud-first temporarily
VITE_CLOUD_FIRST_READS=false
```

### 403 Storage Errors

**Symptoms**: Console shows "permission-denied" errors

**Cause**: Storage rules not deployed

**Solution**:
```bash
npx firebase login
npm run deploy:storage-rules
npx firebase storage:rules:get  # Verify
```

### Slow Load Times (>1000ms)

**Symptoms**: Telemetry shows high latency

**Causes**:
1. Cold start (no cache)
2. Large showcases (>500KB)
3. Network latency

**Solutions**:
1. Preload projects on dashboard
2. Enable compression in future phase
3. Use CDN caching

### Cache Not Working

**Symptoms**: Every load hits cloud (cache hit rate 0%)

**Cause**: Cache TTL too short or cache being cleared

**Solution**:
```typescript
// In CloudProjectService.ts
private readonly CACHE_TTL_MS = 10 * 60 * 1000; // Increase to 10 min
```

---

## 🚀 Next Steps: Phase B

Once Phase A is stable (1-2 days of testing):

1. **Create CloudStorageAdapter**
   - Wraps CloudProjectService for UnifiedStorageManager
   - Maintains backward compatibility

2. **Implement Dual-Write**
   - Write to cloud FIRST (atomic)
   - Write to localStorage SECOND (cache)

3. **Add Offline Queue**
   - Persist failed operations
   - Auto-retry on reconnect

4. **End-to-End Testing**
   - Save/load flows
   - Cross-device sync
   - Offline → online transitions

---

## 📝 Code Snippets

### Add to ReviewScreen.tsx

At line ~408 (inside `loadHeroData` function), add this at the very beginning:

```typescript
// PHASE A: Cloud-first load (feature flag controlled)
if (featureFlags.cloudFirstReads) {
  console.log('[ReviewScreen] Using cloud-first load path');

  const loadResult = await projectLoadService.loadProject(id);

  if (loadResult.success && loadResult.showcase) {
    console.log(
      `[ReviewScreen] ✅ Cloud-first load success ` +
      `(source: ${loadResult.source}, rev: ${loadResult.rev || 'n/a'})`
    );

    setRawProjectData({
      showcase: loadResult.showcase,
      wizardData: displayData?.wizardData || {},
      status: 'completed',
      stage: 'review'
    });

    // Optional: Try hero transformation
    try {
      const enhanced = await unifiedStorage.loadHeroProject(id);
      if (enhanced) {setHeroData(enhanced);}
    } catch (e) {
      console.warn('[ReviewScreen] Hero transform skipped:', e);
    }

    setIsLoadingHero(false);
    return; // Exit early - load complete
  }

  // Cloud load failed - show error
  console.error('[ReviewScreen] Cloud-first load failed:', loadResult.error);
  setHeroError(new Error(loadResult.error?.message || 'Load failed'));
  setIsLoadingHero(false);
  return;
}

// LEGACY PATH: Continue with original logic below
console.log('[ReviewScreen] Using legacy load path');
```

### Test from Browser Console

```javascript
// Import services
import { featureFlags } from './config/featureFlags';
import { telemetry } from './services/telemetry';
import { cloudProjectService } from './services/CloudProjectService';

// Check feature flags
console.log('Feature Flags:', featureFlags);

// Manual cloud load test
const result = await cloudProjectService.loadShowcase('your-project-id');
console.log('Manual load result:', result);

// Check telemetry
console.log('Stats:', telemetry.getStats());
console.log('Recent:', telemetry.getRecentEvents(5));

// Force cache invalidation
cloudProjectService.clearCache();
```

---

## 📚 Reference

- **Main Plan**: `CLOUD_FIRST_REFINED_PLAN.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`
- **Security Fixes**: `SECURITY_FIXES_SUMMARY.md`

---

**Ready to integrate?** Follow the steps above and test thoroughly before moving to Phase B!
