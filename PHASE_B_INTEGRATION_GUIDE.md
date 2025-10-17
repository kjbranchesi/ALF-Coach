# Phase B Integration Guide - Dual-Write Pattern

**Status**: Ready to Integrate
**Prerequisites**: Phase A completed and tested
**Estimated Time**: 45 minutes

---

## ✅ What's Already Done

1. **Offline Queue Service** ✅
   - `src/services/OfflineQueue.ts` - Persistent operation queue with retry
   - localStorage persistence (survives tab close)
   - Exponential backoff retry strategy
   - Dead letter queue for max retries
   - Auto-process on network reconnection

2. **CloudStorageAdapter** ✅
   - `src/services/CloudStorageAdapter.ts` - UnifiedStorageManager integration
   - Dual-write pattern (cloud FIRST, localStorage cache SECOND)
   - Offline queue integration
   - Conflict detection and resolution
   - Backward compatible interface

3. **Dependencies** ✅
   - All Phase A services available (CloudProjectService, ConflictResolver, etc.)
   - Feature flags configured (`cloudFirstWrites`)

---

## 🔧 UnifiedStorageManager Integration (Manual Step)

The CloudStorageAdapter provides a drop-in replacement for localStorage-first saves. Here's how to integrate:

### Current Save Logic (UnifiedStorageManager)

The `saveProject` function currently:
1. Saves to localStorage
2. Queues background Firebase sync
3. Offloads large showcases to IDB

### New Save Logic (Dual-Write)

Replace the save logic in `UnifiedStorageManager.saveProject`:

```typescript
/**
 * Save project with cloud-first dual-write (Phase B)
 */
async saveProject(
  projectId: string,
  projectData: ProjectData
): Promise<{ success: boolean; rev?: number }> {
  try {
    console.log(`[UnifiedStorageManager] Saving project ${projectId.slice(0, 8)}`);

    // PHASE B: Cloud-first dual-write (feature flag controlled)
    if (featureFlags.cloudFirstWrites) {
      console.log('[UnifiedStorageManager] Using cloud-first dual-write');

      const result = await cloudStorageAdapter.saveProject(projectData, {
        forceOverwrite: false,
        skipOfflineSnapshot: false,
        skipLocalCache: false
      });

      if (result.success) {
        console.log(
          `[UnifiedStorageManager] ✅ Dual-write complete ` +
          `(rev ${result.rev})`
        );

        // Showcase offload to IDB (optional, only if very large)
        if (featureFlags.enableIDBFallback) {
          const showcaseSize = JSON.stringify(projectData.showcase).length;
          if (showcaseSize > 100 * 1024) {
            // >100KB
            this.offloadToIDB(projectId, projectData).catch(err => {
              console.warn('[UnifiedStorageManager] IDB offload failed:', err);
            });
          }
        }

        return { success: true, rev: result.rev };
      } else {
        // Cloud save failed - operation queued for retry
        console.warn('[UnifiedStorageManager] Cloud save failed, queued for retry');
        return { success: false, error: result.error };
      }
    }

    // LEGACY PATH: localStorage-first with background sync
    console.log('[UnifiedStorageManager] Using legacy localStorage-first path');

    // Original localStorage save logic
    const rawKey = `alf_project_${projectId}`;
    localStorage.setItem(rawKey, JSON.stringify(projectData));

    // Queue background Firebase sync (if not disabled)
    if (!featureFlags.firebaseDisabled) {
      this.queueFirebaseSync(projectId, projectData);
    }

    // Offload large showcases to IDB
    if (featureFlags.enableIDBFallback) {
      // ... existing IDB offload logic
    }

    return { success: true };
  } catch (error) {
    console.error('[UnifiedStorageManager] Save failed:', error);
    return { success: false, error };
  }
}
```

### Key Changes Explanation

1. **Feature Flag Check**: `featureFlags.cloudFirstWrites` controls dual-write
2. **CloudStorageAdapter**: Handles entire save sequence with offline queue
3. **Success Path**: Cloud save → localStorage cache → optional IDB offload
4. **Failure Path**: Operation queued, localStorage updated, user can continue
5. **Legacy Path**: Original code remains for when flag is off

### Import Statements

Add to top of `UnifiedStorageManager.ts`:

```typescript
import { cloudStorageAdapter } from './CloudStorageAdapter';
import { featureFlags } from '../config/featureFlags';
import { offlineQueue } from './OfflineQueue';
```

---

## 🧪 Testing Phase B

### Step 1: Enable Feature Flags

Update `.env.local`:

```bash
# Phase A (must be enabled first)
VITE_CLOUD_FIRST_READS=true

# Phase B (enable dual-write)
VITE_CLOUD_FIRST_WRITES=true

# Keep fallbacks during pilot
VITE_ENABLE_IDB_FALLBACK=true
VITE_ENABLE_OFFLINE_SNAPSHOT=true

# Debug mode
VITE_REVIEW_DEBUG=true
VITE_SUPPRESS_ERRORS=false
```

### Step 2: Test Scenarios

**Scenario 1: Online Save** (Happy Path)

```
1. Create a new project
2. Fill out wizard
3. Save project
4. Expected:
   - Console shows "Cloud-first dual-write"
   - Sync status shows "Syncing..." → "Synced"
   - Check Firestore: Document created with rev=1
   - Check Storage: showcase-1.json uploaded
   - Check localStorage: Cached copy exists
5. Verify: Telemetry shows successful save
```

**Scenario 2: Offline Save** (Queue Test)

```
1. Go offline (disable network in DevTools)
2. Create/edit a project
3. Save project
4. Expected:
   - Console shows "Offline - queueing operation"
   - Sync status shows "Offline (1 queued)"
   - localStorage updated (user can continue working)
5. Go back online
6. Expected:
   - Console shows "Network connection restored"
   - Auto-process starts within 10s
   - Sync status shows "Syncing..." → "Synced"
   - Queue cleared
7. Verify: Project now in cloud storage
```

**Scenario 3: Conflict Resolution**

```
1. Open project in Tab A
2. Open same project in Tab B
3. In Tab A: Make changes, save (rev=2)
4. In Tab B: Make different changes, save
5. Expected:
   - Tab B detects conflict (cloud rev 2 > local rev 1)
   - Modal appears: "Project modified on another device"
   - User chooses "Use cloud version" or "Use my version"
6. If "Use cloud version": Tab B loads cloud data
7. If "Use my version": Tab B saves as rev=3 (force overwrite)
8. Verify: Telemetry shows conflict_detected event
```

**Scenario 4: Retry with Exponential Backoff**

```
1. Simulate cloud error (e.g., temporarily break Firebase)
2. Save project
3. Expected:
   - Save fails, operation queued
   - Sync status shows "Sync Failed (retrying in 2s)"
   - After 2s: Retry #1
   - After 4s: Retry #2
   - After 8s: Retry #3
   - After 16s: Retry #4
   - After 32s: Retry #5
   - After 60s: Max retries, moved to dead letter queue
4. Fix Firebase
5. Open debug dashboard, manually retry from dead letter
6. Expected: Save succeeds
```

**Scenario 5: Large Showcase Offload**

```
1. Create project with very large showcase (>100KB)
2. Save project
3. Expected:
   - Cloud save succeeds
   - localStorage cache created
   - Large showcase offloaded to IDB
   - Console shows "IDB offload complete"
4. Reload page
5. Expected: Loads from cloud, cache restored
```

**Scenario 6: Legacy Mode**

```
1. Set VITE_CLOUD_FIRST_WRITES=false
2. Create/save project
3. Expected:
   - Console shows "Using legacy localStorage-first path"
   - Original background sync behavior
   - No cloud-first operations
4. Verify: Backward compatibility maintained
```

### Step 3: Monitor Telemetry Dashboard

Navigate to `/app/debug/telemetry` and verify:

```
- Save Success Rate: >99.5%
- Load Success Rate: >99.5%
- Cache Hit Rate: >60% (after warmup)
- Avg Latency: <500ms

Recent Events should show:
- save_project events with source="cloud"
- conflict_detected events (if tested)
- sync_error events with errorCode="QUEUED_OFFLINE"
```

### Step 4: Verify Offline Queue

Open browser console:

```javascript
import { offlineQueue } from './services/OfflineQueue';

// Check queue stats
console.log(offlineQueue.getStats());
// Expected: { queuedOperations: 0, deadLetterOperations: 0, isOnline: true }

// View queued operations (when offline)
console.log(offlineQueue.getQueue());

// View dead letter queue
console.log(offlineQueue.getDeadLetterQueue());

// Manually retry operation
await offlineQueue.retryOperation('operation-id');

// Clear dead letter queue
offlineQueue.clearDeadLetterQueue();
```

### Step 5: Verify Sync Status UI

Check that `<SyncStatusIndicator>` shows correct states:

- **Synced**: Green checkmark, "Synced"
- **Syncing**: Blue spinner, "Syncing..."
- **Offline**: Gray wifi icon, "Offline (1 queued)"
- **Error**: Red alert, "Sync Failed" with retry button
- **Conflict**: Yellow warning, "Conflict detected"

---

## 📊 Success Criteria

Phase B complete when:

- [ ] Feature flag toggles between dual-write/legacy correctly
- [ ] Cloud-first saves work with >99.5% success
- [ ] Offline queue persists across tab close
- [ ] Operations auto-retry with exponential backoff
- [ ] Dead letter queue handles max retries
- [ ] Conflict detection and resolution work
- [ ] localStorage cache updated after cloud save
- [ ] Offline snapshot created for offline reads
- [ ] Sync status visible and accurate
- [ ] Telemetry shows all save/load operations
- [ ] No data loss in any scenario

---

## 🐛 Troubleshooting

### "Queue Full" Error

**Symptoms**: User gets "Offline queue is full" error

**Causes**:
1. Too many failed operations queued
2. Network issues preventing queue processing
3. Dead letter queue not being cleared

**Solutions**:
```bash
# 1. Check queue stats
offlineQueue.getStats()

# 2. Clear dead letter queue
offlineQueue.clearDeadLetterQueue()

# 3. Increase queue size (in OfflineQueue.ts)
maxQueueSize: 100  # Increase from 50
```

### Operations Not Auto-Retrying

**Symptoms**: Queued operations don't process when back online

**Causes**:
1. Auto-process timer not running
2. nextRetryAt set too far in future
3. isOnline status not detected

**Solutions**:
```javascript
// 1. Check online status
console.log(navigator.onLine);

// 2. Manually trigger process
await offlineQueue.processQueue();

// 3. Check process interval (in OfflineQueue.ts)
processIntervalMs: 5000  // Reduce to 5s for testing
```

### Conflict Modal Not Appearing

**Symptoms**: Conflicts not detected or user not prompted

**Causes**:
1. ConflictResolver not integrated
2. Rev numbers not being tracked
3. forceOverwrite: true bypassing detection

**Solutions**:
```typescript
// 1. Verify rev tracking in saves
console.log('Local rev:', projectData.rev);
console.log('Cloud rev:', cloudMetadata.rev);

// 2. Check ConflictResolver import
import { conflictResolver } from './ConflictResolver';

// 3. Ensure forceOverwrite is false
await cloudStorageAdapter.saveProject(data, { forceOverwrite: false });
```

### localStorage Not Being Updated

**Symptoms**: Cache miss after cloud save

**Causes**:
1. skipLocalCache: true in options
2. localStorage quota exceeded
3. Browser blocking localStorage

**Solutions**:
```typescript
// 1. Check save options
await cloudStorageAdapter.saveProject(data, {
  skipLocalCache: false  // Ensure cache enabled
});

// 2. Check localStorage quota
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
} catch (e) {
  console.error('localStorage blocked:', e);
}

// 3. Clear old data
// (Add cleanup logic for old localStorage items)
```

### High Latency (>1000ms)

**Symptoms**: Saves taking too long

**Causes**:
1. Large showcases (>500KB)
2. Slow network connection
3. Firestore transaction retries
4. Multiple operations in series

**Solutions**:
1. Enable compression (future phase)
2. Optimize showcase size (remove unused data)
3. Profile operations in telemetry dashboard
4. Consider background sync for non-critical updates

---

## 🚀 Next Steps: Phase C

Once Phase B is stable (3-5 days of testing):

1. **Deprecate Background Sync**
   - Remove UnifiedStorageManager queue
   - All saves go through CloudStorageAdapter
   - Legacy path removed

2. **Optional IDB Strategy**
   - Make IDB opt-in via feature flag
   - Or remove entirely (replaced by offline snapshots)
   - Migrate existing IDB data to cloud

3. **Code Cleanup**
   - Remove legacy localStorage-first paths
   - Simplify UnifiedStorageManager
   - Update all save/load call sites

4. **Performance Optimizations**
   - Implement compression for large showcases
   - Add CDN caching headers
   - Preload projects on dashboard
   - Batch operations where possible

---

## 📝 Code Snippets

### Add Retry Button to UI

In your project detail/review screen:

```typescript
import { offlineQueue } from '../../services/OfflineQueue';
import { syncStatusManager } from '../../services/SyncStatusManager';

function ProjectActions({ projectId }: { projectId: string }) {
  const [syncState, setSyncState] = useState(syncStatusManager.getStatus(projectId));

  const handleRetry = async () => {
    const queue = offlineQueue.getQueue();
    const operation = queue.find(op => op.projectId === projectId);

    if (operation) {
      try {
        await offlineQueue.retryOperation(operation.id);
        alert('Retry successful!');
      } catch (err) {
        alert(`Retry failed: ${err.message}`);
      }
    }
  };

  if (syncState.status === 'error') {
    return (
      <button onClick={handleRetry} className="btn-retry">
        Retry Sync
      </button>
    );
  }

  return null;
}
```

### Monitor Queue Depth

In dashboard or header:

```typescript
import { offlineQueue } from '../../services/OfflineQueue';

function QueueStatusBadge() {
  const [stats, setStats] = useState(offlineQueue.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(offlineQueue.getStats());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (stats.queuedOperations === 0) return null;

  return (
    <div className="badge badge-warning">
      {stats.queuedOperations} queued
    </div>
  );
}
```

### Test from Browser Console

```javascript
// Import services
import { cloudStorageAdapter } from './services/CloudStorageAdapter';
import { offlineQueue } from './services/OfflineQueue';
import { telemetry } from './services/telemetry';

// Test online save
const result = await cloudStorageAdapter.saveProject({
  projectId: 'test-project',
  showcase: { /* test data */ }
});
console.log('Save result:', result);

// Test offline scenario
Object.defineProperty(navigator, 'onLine', { value: false });
await cloudStorageAdapter.saveProject({ /* ... */ });
console.log('Queued operations:', offlineQueue.getQueue());

// Restore online
Object.defineProperty(navigator, 'onLine', { value: true });
window.dispatchEvent(new Event('online'));

// Check telemetry
console.log('Stats:', telemetry.getStats());
console.log('Recent events:', telemetry.getRecentEvents(10));
```

---

## 📚 Reference

- **Phase A Guide**: `PHASE_A_INTEGRATION_GUIDE.md`
- **Main Plan**: `CLOUD_FIRST_REFINED_PLAN.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`

---

**Ready to integrate?** Complete Phase A testing first, then follow the steps above to enable dual-write!
