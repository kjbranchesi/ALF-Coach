# Phase C Deprecation Guide - Legacy Path Removal

**Status**: Planning (Execute After Phase B is Stable)
**Prerequisites**: Phase B running in production for 3-5 days with <0.1% error rate
**Estimated Time**: 2-3 hours
**Risk Level**: Medium (requires data migration)

---

## ⚠️ Prerequisites Check

Before starting Phase C, verify:

- [ ] Phase B deployed to production for at least 3 days
- [ ] Telemetry shows >99.5% success rate for saves/loads
- [ ] No unresolved conflicts in past 24 hours
- [ ] Offline queue processing correctly
- [ ] <5 operations in dead letter queue
- [ ] Cache hit rate >60%
- [ ] Average latency <500ms
- [ ] All users have synced their projects to cloud

---

## 🎯 Phase C Goals

1. **Remove Background Sync Queue**
   - Deprecate UnifiedStorageManager's Firebase background sync
   - All saves now synchronous via CloudStorageAdapter

2. **Simplify IDB Strategy**
   - Make IDB opt-in via feature flag (default: off)
   - Or remove entirely (replaced by offline snapshots)
   - Migrate any remaining IDB-only data to cloud

3. **Clean Up Legacy Code**
   - Remove localStorage-first save paths
   - Remove legacy feature flag checks
   - Simplify UnifiedStorageManager
   - Update all save/load call sites

4. **Performance Optimizations**
   - Implement showcase compression
   - Add CDN caching headers
   - Preload projects on dashboard

---

## 📋 Migration Checklist

### Step 1: Data Migration Audit

Before removing legacy paths, ensure all data is in cloud:

```typescript
/**
 * Migration audit script
 * Run this in browser console to check for cloud migration gaps
 */
async function auditCloudMigration() {
  const allProjects = []; // Load from localStorage or Firestore users collection

  const results = {
    total: 0,
    inCloud: 0,
    localOnly: 0,
    conflicts: [],
    errors: []
  };

  for (const projectId of allProjects) {
    results.total++;

    try {
      // Check if in cloud
      const cloudResult = await cloudProjectService.loadShowcase(projectId);

      if (cloudResult.success) {
        results.inCloud++;
      } else {
        results.localOnly++;

        // Check localStorage
        const localData = localStorage.getItem(`alf_project_${projectId}`);
        if (localData) {
          console.warn(`Project ${projectId} exists in localStorage but not cloud`);

          // Trigger migration
          const parsed = JSON.parse(localData);
          await cloudStorageAdapter.saveProject({
            projectId,
            showcase: parsed.showcase,
            wizardData: parsed.wizardData
          });

          console.log(`✅ Migrated ${projectId} to cloud`);
        }
      }
    } catch (error) {
      results.errors.push({ projectId, error: error.message });
    }
  }

  console.log('Migration Audit Results:', results);
  return results;
}

// Run audit
const auditResults = await auditCloudMigration();

// Expected: { total: X, inCloud: X, localOnly: 0, conflicts: [], errors: [] }
```

**Action Required**: Fix any `localOnly` projects before proceeding.

---

### Step 2: Remove Background Sync Queue

**File**: `src/services/UnifiedStorageManager.ts`

**Current Code** (circa line 200-300):
```typescript
// Background Firebase sync queue
private syncQueue: Map<string, { data: any; timestamp: number }> = new Map();

async queueFirebaseSync(projectId: string, data: any) {
  this.syncQueue.set(projectId, { data, timestamp: Date.now() });
  this.processFirebaseQueue();
}

async processFirebaseQueue() {
  // Batch sync to Firestore/Storage
  // ...
}
```

**Action**: Remove entire background sync system

```typescript
// REMOVED: Background sync queue (replaced by CloudStorageAdapter)
// All saves are now synchronous via cloudStorageAdapter.saveProject()

// Keep only this warning for backward compatibility during transition
private logLegacyWarning(method: string) {
  console.warn(
    `[UnifiedStorageManager] ${method} is deprecated. ` +
    `Use cloudStorageAdapter directly.`
  );
}
```

**Migration**: Update all call sites

```typescript
// OLD (Phase A/B)
unifiedStorage.saveProject(projectId, data);
unifiedStorage.queueFirebaseSync(projectId, data);

// NEW (Phase C)
await cloudStorageAdapter.saveProject({
  projectId,
  showcase: data.showcase,
  wizardData: data.wizardData
});
```

---

### Step 3: Simplify IDB Strategy

**Option A: Make IDB Opt-In (Recommended)**

Keep IDB for users with extremely large showcases (>500KB), but make it opt-in.

**File**: `src/config/featureFlags.ts`

```typescript
export const featureFlags = {
  // ... existing flags

  // Phase C: Make IDB opt-in (default: off)
  enableIDBFallback: getBooleanEnv('VITE_ENABLE_IDB_FALLBACK', false), // Changed default

  // Or completely remove IDB
  // enableIDBFallback: false
};
```

**Update `.env.example`**:

```bash
# IDB Strategy (Phase C)
# Set to 'true' only if you have showcases >500KB
# Most users should keep this disabled (offline snapshots are sufficient)
VITE_ENABLE_IDB_FALLBACK=false
```

**Option B: Remove IDB Entirely**

If offline snapshots (compressed localStorage) are sufficient:

1. Remove `src/services/IDBStorageService.ts` (if exists)
2. Remove IDB offload logic from UnifiedStorageManager
3. Remove `enableIDBFallback` feature flag
4. Update documentation

**Migration**: For users with IDB data

```typescript
/**
 * Migrate IDB data to cloud (one-time script)
 */
async function migrateIDBToCloud() {
  // 1. Open IDB
  const db = await openDB('alf-storage', 1);

  // 2. Read all stored showcases
  const showcases = await db.getAll('showcases');

  // 3. Upload to cloud
  for (const item of showcases) {
    await cloudStorageAdapter.saveProject({
      projectId: item.projectId,
      showcase: item.showcase
    });

    console.log(`✅ Migrated ${item.projectId} from IDB to cloud`);
  }

  // 4. Clear IDB
  await db.clear('showcases');

  console.log('IDB migration complete');
}
```

---

### Step 4: Remove Legacy Feature Flag Checks

**Files to Update**:
- `src/services/UnifiedStorageManager.ts`
- `src/services/CloudStorageAdapter.ts`
- `src/services/ProjectLoadService.ts`
- `src/features/review/ReviewScreen.tsx`

**Find and Remove**:

```typescript
// OLD: Feature flag checks everywhere
if (featureFlags.cloudFirstReads) {
  // Cloud-first path
} else {
  // Legacy path
}

if (featureFlags.cloudFirstWrites) {
  // Dual-write path
} else {
  // localStorage-first path
}
```

**NEW: Always use cloud-first**

```typescript
// Cloud-first is now the only path
await cloudStorageAdapter.saveProject(data);

const result = await projectLoadService.loadProject(projectId);
```

**Update Feature Flags** (make permanent):

```typescript
// src/config/featureFlags.ts
export const featureFlags = {
  // Phase C: Cloud-first is now permanent (no longer configurable)
  cloudFirstReads: true,   // Always true
  cloudFirstWrites: true,  // Always true

  // Keep these optional
  enableIDBFallback: getBooleanEnv('VITE_ENABLE_IDB_FALLBACK', false),
  enableOfflineSnapshot: getBooleanEnv('VITE_ENABLE_OFFLINE_SNAPSHOT', true),
  reviewDebug: getBooleanEnv('VITE_REVIEW_DEBUG', false)
};
```

---

### Step 5: Clean Up UnifiedStorageManager

**Goal**: Simplify UnifiedStorageManager to be a thin wrapper around CloudStorageAdapter

**Before** (Phase B):
```typescript
class UnifiedStorageManager {
  // 500+ lines of localStorage, IDB, Firebase sync, conflict detection, etc.

  async saveProject(projectId: string, data: ProjectData) {
    // Feature flag checks
    // localStorage first
    // Queue background sync
    // Offload to IDB
    // Handle conflicts
    // etc.
  }
}
```

**After** (Phase C):
```typescript
class UnifiedStorageManager {
  // ~100 lines - thin wrapper around CloudStorageAdapter

  /**
   * Save project (delegates to CloudStorageAdapter)
   *
   * @deprecated This class is being phased out. Use cloudStorageAdapter directly.
   */
  async saveProject(projectId: string, data: ProjectData) {
    console.warn('[UnifiedStorageManager] Deprecated - use cloudStorageAdapter');

    return cloudStorageAdapter.saveProject({
      projectId,
      showcase: data.showcase,
      wizardData: data.wizardData,
      status: data.status,
      stage: data.stage,
      rev: data.rev
    });
  }

  /**
   * Load project (delegates to ProjectLoadService)
   *
   * @deprecated Use projectLoadService directly.
   */
  async loadProject(projectId: string) {
    console.warn('[UnifiedStorageManager] Deprecated - use projectLoadService');

    const result = await projectLoadService.loadProject(projectId);

    if (result.success) {
      return {
        projectId,
        showcase: result.showcase,
        wizardData: {},
        rev: result.rev
      };
    }

    return null;
  }

  // Keep minimal compatibility methods
  // Remove after all call sites updated
}
```

**Migration Plan**:
1. Add deprecation warnings (Phase C start)
2. Update all call sites to use services directly (1-2 days)
3. Remove UnifiedStorageManager entirely (Phase D)

---

### Step 6: Update All Call Sites

**Find all usages**:

```bash
# Search for UnifiedStorageManager usage
grep -r "unifiedStorage\." src/

# Search for direct localStorage usage (should be rare)
grep -r "localStorage.setItem.*alf_project" src/
```

**Update patterns**:

```typescript
// Pattern 1: Save project
// OLD
await unifiedStorage.saveProject(projectId, projectData);

// NEW
await cloudStorageAdapter.saveProject({
  projectId,
  showcase: projectData.showcase,
  wizardData: projectData.wizardData
});

// Pattern 2: Load project
// OLD
const project = await unifiedStorage.loadProject(projectId);

// NEW
const result = await projectLoadService.loadProject(projectId);
if (result.success) {
  const project = {
    projectId: result.projectId,
    showcase: result.showcase
  };
}

// Pattern 3: Check existence
// OLD
const exists = await unifiedStorage.projectExists(projectId);

// NEW
const exists = await cloudStorageAdapter.projectExists(projectId);
```

---

### Step 7: Performance Optimizations

Once legacy code is removed, add performance enhancements:

**A. Showcase Compression**

```typescript
// In CloudProjectService.saveShowcase()
import pako from 'pako';

// Before upload
const json = JSON.stringify(showcase);
const compressed = pako.gzip(json);

await uploadBytes(storageRef, compressed, {
  contentType: 'application/json',
  contentEncoding: 'gzip',
  cacheControl: 'public, max-age=300'
});
```

**B. CDN Caching Headers**

```typescript
// Optimize cache control based on rev
const cacheControl = rev === latestRev
  ? 'public, max-age=300, must-revalidate'  // 5 min for latest
  : 'public, max-age=31536000, immutable';  // 1 year for old revs

await uploadBytes(storageRef, jsonBlob, {
  cacheControl,
  customMetadata: { rev: String(rev) }
});
```

**C. Project Preloading**

```typescript
// In Dashboard component
useEffect(() => {
  // Preload all user projects
  userProjects.forEach(project => {
    projectLoadService.preloadProject(project.id);
  });
}, [userProjects]);
```

---

## 🧪 Testing Phase C

### Regression Tests

Run all Phase A and Phase B tests again to ensure nothing broke:

1. **Save/Load Tests**
   - Online save
   - Offline save (queue)
   - Conflict resolution
   - Cross-device sync

2. **Migration Tests**
   - All localStorage data migrated
   - IDB data migrated (if applicable)
   - No orphaned data

3. **Performance Tests**
   - Latency <500ms
   - Cache hit rate >60%
   - Compression working (check file sizes)
   - No memory leaks

4. **Backward Compatibility**
   - Old projects still load
   - No breaking changes for existing users

---

## 📊 Success Criteria

Phase C complete when:

- [ ] All projects migrated to cloud (0 local-only)
- [ ] Background sync queue removed
- [ ] IDB strategy simplified (opt-in or removed)
- [ ] Legacy feature flag checks removed
- [ ] UnifiedStorageManager simplified to <150 lines
- [ ] All call sites updated to use services directly
- [ ] Compression enabled for showcases
- [ ] CDN caching optimized
- [ ] Performance metrics maintained or improved
- [ ] No regressions in save/load functionality
- [ ] Zero data loss incidents
- [ ] Documentation updated

---

## 🐛 Rollback Plan

If Phase C causes issues:

### Quick Rollback (Restore Feature Flags)

```typescript
// Emergency rollback - restore legacy paths
export const featureFlags = {
  cloudFirstReads: false,   // Back to localStorage-first
  cloudFirstWrites: false,  // Back to background sync
  enableIDBFallback: true   // Re-enable IDB
};
```

### Full Rollback (Restore Code)

```bash
# Revert to Phase B code
git revert <phase-c-commit-hash>
npm run build
npm run deploy
```

### Data Recovery

If data is lost:

1. Check Firestore document history (if versioning enabled)
2. Restore from offline snapshots (localStorage)
3. Check IDB data (if not yet cleared)
4. Restore from Firebase Storage previous revisions
5. Contact users for local backups

---

## 📝 Cleanup Checklist

Files to remove (after deprecation period):

- [ ] `src/services/UnifiedStorageManager.ts` (if fully replaced)
- [ ] `src/services/IDBStorageService.ts` (if IDB removed)
- [ ] Legacy sync queue code
- [ ] Unused feature flag checks
- [ ] Old localStorage-first save paths

Files to update:

- [x] `src/config/featureFlags.ts` - Make cloud-first permanent
- [x] `src/services/CloudStorageAdapter.ts` - Remove legacy paths
- [x] `src/services/ProjectLoadService.ts` - Remove legacy paths
- [x] `src/features/review/ReviewScreen.tsx` - Use services directly
- [x] `.env.example` - Update flag descriptions
- [x] `README.md` - Update architecture docs

---

## 🚀 Phase D: Final Polish

After Phase C is stable (1-2 weeks):

1. **Remove Deprecation Warnings**
   - UnifiedStorageManager fully removed
   - All call sites using services directly

2. **Advanced Features**
   - Real-time collaboration via Firestore listeners
   - Conflict-free replicated data types (CRDTs)
   - Optimistic UI updates
   - Batch operations

3. **Monitoring & Analytics**
   - Set up alerting for error rates
   - Track usage metrics (saves/loads per user)
   - Monitor storage costs
   - Analyze performance bottlenecks

4. **Documentation**
   - Complete API reference
   - Migration guide for other projects
   - Best practices guide
   - Troubleshooting runbook

---

## 📚 Reference

- **Phase A Guide**: `PHASE_A_INTEGRATION_GUIDE.md`
- **Phase B Guide**: `PHASE_B_INTEGRATION_GUIDE.md`
- **Main Plan**: `CLOUD_FIRST_REFINED_PLAN.md`
- **Implementation Status**: `IMPLEMENTATION_STATUS.md`

---

**Important**: Do NOT start Phase C until Phase B has been stable in production for at least 3-5 days with <0.1% error rate. Data migration is irreversible!
