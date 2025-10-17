# Migration Guide: UnifiedStorageManager to Cloud-First Architecture

## Overview

This guide walks through updating `UnifiedStorageManager.ts` to use the new cloud-first Firebase integration with comprehensive error handling and offline support.

## Changes Required

### 1. Update Imports

**Add these imports at the top of `UnifiedStorageManager.ts`:**

```typescript
import {
  primaryCloudSave,
  processOfflineQueue,
  getSyncStatus,
  CloudErrorTelemetry,
  type CloudSaveResult
} from './firebase';
```

### 2. Replace `backgroundFirebaseSync` Method

**Remove lines 988-1120:**
```typescript
private async backgroundFirebaseSync(id: string, data: UnifiedProjectData): Promise<void> {
  // ... old implementation
}
```

**Replace with call to new service:**
```typescript
private async performCloudSync(id: string, data: UnifiedProjectData): Promise<CloudSaveResult> {
  return await primaryCloudSave(id, data, {
    priority: 'normal',
    validateData: true,
    splitLargeData: true
  });
}
```

### 3. Update `saveProject` Method

**Find lines 250-255:**
```typescript
// Background Firebase sync (if enabled and online)
if (this.options.syncToFirebase && navigator.onLine) {
  this.backgroundFirebaseSync(id, unifiedData).catch(error => {
    console.warn(`[UnifiedStorageManager] Background sync failed: ${error.message}`);
  });
}
```

**Replace with:**
```typescript
// Primary cloud sync (cloud-first architecture)
if (this.options.syncToFirebase) {
  try {
    const syncResult = await this.performCloudSync(id, unifiedData);

    if (syncResult.success) {
      // Update sync status
      unifiedData.syncStatus = 'synced';
      unifiedData.lastSyncAt = syncResult.syncedAt;

      // Update localStorage with new sync status
      await this.saveToLocalStorage(id, unifiedData);

      console.log(`[UnifiedStorageManager] Cloud sync successful: ${id}`, {
        showcaseLocation: syncResult.showcaseLocation,
        syncedAt: syncResult.syncedAt
      });
    } else if (syncResult.queued) {
      // Operation queued for retry
      unifiedData.syncStatus = 'queued';
      console.log(`[UnifiedStorageManager] Cloud sync queued for retry: ${id}`);
    } else {
      // Sync failed
      unifiedData.syncStatus = 'error';
      unifiedData.lastError = syncResult.error?.userMessage;

      console.error(`[UnifiedStorageManager] Cloud sync failed: ${id}`, {
        code: syncResult.error?.code,
        message: syncResult.error?.message,
        isRetryable: syncResult.error?.isRetryable
      });
    }
  } catch (error: any) {
    // Unexpected error (shouldn't happen with new service)
    console.error(`[UnifiedStorageManager] Unexpected sync error: ${id}`, error);
    unifiedData.syncStatus = 'error';
    unifiedData.lastError = error.message;
  }
}
```

### 4. Update `syncNowIfDue` Method

**Find lines 301-344:**
```typescript
async syncNowIfDue(projectId: string, opts?: { force?: boolean; reason?: string }): Promise<void> {
  try {
    const now = Date.now();
    const last = this.lastCloudSyncAt.get(projectId) || 0;
    const minInterval = this.options.minCloudSyncIntervalMs || 20000;
    const due = opts?.force || now - last >= minInterval;
    if (!due) { return; }

    const data = await this.loadProject(projectId);
    if (!data) { return; }

    await this.backgroundFirebaseSync(projectId, data);
    this.lastCloudSyncAt.set(projectId, Date.now());
    // Clear dirty if sync succeeded
    this.dirtyProjects.delete(projectId);
    // ... snapshot logic
  } catch (e) {
    // ...
  }
}
```

**Replace with:**
```typescript
async syncNowIfDue(projectId: string, opts?: { force?: boolean; reason?: string }): Promise<void> {
  try {
    const now = Date.now();
    const last = this.lastCloudSyncAt.get(projectId) || 0;
    const minInterval = this.options.minCloudSyncIntervalMs || 20000;
    const due = opts?.force || now - last >= minInterval;
    if (!due) { return; }

    const data = await this.loadProject(projectId);
    if (!data) { return; }

    // Use new cloud sync service
    const syncResult = await this.performCloudSync(projectId, data);

    if (syncResult.success) {
      this.lastCloudSyncAt.set(projectId, Date.now());
      this.dirtyProjects.delete(projectId);

      // Update data with sync status
      data.syncStatus = 'synced';
      data.lastSyncAt = syncResult.syncedAt;
      await this.saveToLocalStorage(projectId, data);
    } else if (!syncResult.queued) {
      // Failed and not queued - log error
      console.error(`[UnifiedStorageManager] Sync failed for ${projectId}`, syncResult.error);
    }

    // Snapshot logic (unchanged)
    const snapInterval = this.options.snapshotIntervalMs || 120000;
    const lastSnap = this.snapshotLastAt.get(projectId) || 0;
    if (Date.now() - lastSnap >= snapInterval) {
      this.snapshotLastAt.set(projectId, Date.now());
      const { auth } = await import('../firebase/firebase');
      if (auth?.currentUser?.uid) {
        let showcaseObj: any = (data as any).showcase;
        if (!showcaseObj && data.showcaseRef) {
          try { showcaseObj = await LargeObjectStore.loadShowcase(data.showcaseRef); } catch {}
        }
        if (showcaseObj) {
          try {
            const { CloudStorageService } = await import('./firebase');
            await CloudStorageService.uploadSnapshot(auth.currentUser.uid, projectId, 'showcase', showcaseObj);
            await CloudStorageService.trimSnapshots(auth.currentUser.uid, projectId, 'showcase', this.options.maxSnapshots || 10);
          } catch (e) {
            console.warn('[UnifiedStorageManager] Snapshot attempt failed', (e as Error).message);
          }
        }
      }
    }
  } catch (e) {
    console.warn('[UnifiedStorageManager] syncNowIfDue failed', (e as Error).message, opts);
  }
}
```

### 5. Add Queue Processing on Init

**In constructor (after line 119):**
```typescript
// Global listeners to flush when we can
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Attempt to sync all dirty projects
    for (const projectId of this.dirtyProjects.keys()) {
      void this.syncNowIfDue(projectId, { force: true, reason: 'online' });
    }

    // NEW: Process offline queue
    this.processOfflineQueue();
  });
}
```

**Add this new method:**
```typescript
private async processOfflineQueue(): Promise<void> {
  try {
    console.log('[UnifiedStorageManager] Processing offline queue...');
    await processOfflineQueue();
  } catch (error) {
    console.error('[UnifiedStorageManager] Queue processing failed', error);
  }
}
```

### 6. Add Sync Status Method

**Add this new public method:**
```typescript
/**
 * Get detailed sync status for a project
 */
async getDetailedSyncStatus(projectId: string): Promise<{
  status: 'synced' | 'queued' | 'error' | 'local';
  lastSyncAt?: Date;
  lastError?: string;
  pendingOperations: number;
  isDirty: boolean;
}> {
  const data = await this.loadFromLocalStorage(projectId);
  const queueStatus = getSyncStatus(projectId);

  return {
    status: data?.syncStatus || 'local',
    lastSyncAt: data?.lastSyncAt,
    lastError: data?.lastError,
    pendingOperations: queueStatus.queuedOperations,
    isDirty: this.dirtyProjects.has(projectId)
  };
}
```

### 7. Update CloudBlobService Import

**Find line 331:**
```typescript
const { CloudBlobService } = await import('./CloudBlobService');
```

**Replace with:**
```typescript
const { CloudStorageService } = await import('./firebase');
```

**Update usage:**
```typescript
// Old
await CloudBlobService.uploadSnapshotJSON(auth.currentUser.uid, projectId, 'showcase', showcaseObj);
await CloudBlobService.trimSnapshots(auth.currentUser.uid, projectId, 'showcase', this.options.maxSnapshots || 10);

// New
await CloudStorageService.uploadSnapshot(auth.currentUser.uid, projectId, 'showcase', showcaseObj);
await CloudStorageService.trimSnapshots(auth.currentUser.uid, projectId, 'showcase', this.options.maxSnapshots || 10);
```

### 8. Remove Old Methods

**Delete these methods (no longer needed):**
- `waitForAuth` (now in PrimaryCloudSync)
- `sanitizeForFirestore` (now in OptimizedFirestore)
- `backgroundFirebaseSync` (replaced by performCloudSync)

## Complete Modified Code Sections

### Import Section
```typescript
import { v4 as uuidv4 } from 'uuid';
import type { HeroProjectTransformer, EnhancedHeroProjectData, TransformationLevel, TransformationContext } from './HeroProjectTransformer';
import type { LargeRef } from './LargeObjectStore';
import { LargeObjectStore } from './LargeObjectStore';
// NEW IMPORTS
import {
  primaryCloudSave,
  processOfflineQueue,
  getSyncStatus,
  CloudErrorTelemetry,
  type CloudSaveResult
} from './firebase';
```

### Modified saveProject
```typescript
async saveProject(projectData: Partial<UnifiedProjectData>): Promise<string> {
  try {
    // ... existing code up to line 248

    // Primary cloud sync (cloud-first architecture)
    if (this.options.syncToFirebase) {
      try {
        const syncResult = await this.performCloudSync(id, unifiedData);

        if (syncResult.success) {
          unifiedData.syncStatus = 'synced';
          unifiedData.lastSyncAt = syncResult.syncedAt;
          await this.saveToLocalStorage(id, unifiedData);

          console.log(`[UnifiedStorageManager] Cloud sync successful: ${id}`, {
            showcaseLocation: syncResult.showcaseLocation,
            syncedAt: syncResult.syncedAt
          });
        } else if (syncResult.queued) {
          unifiedData.syncStatus = 'queued';
          console.log(`[UnifiedStorageManager] Cloud sync queued for retry: ${id}`);
        } else {
          unifiedData.syncStatus = 'error';
          unifiedData.lastError = syncResult.error?.userMessage;

          console.error(`[UnifiedStorageManager] Cloud sync failed: ${id}`, {
            code: syncResult.error?.code,
            message: syncResult.error?.message
          });
        }
      } catch (error: any) {
        console.error(`[UnifiedStorageManager] Unexpected sync error: ${id}`, error);
        unifiedData.syncStatus = 'error';
        unifiedData.lastError = error.message;
      }
    }

    return id;
  } catch (error) {
    console.error('[UnifiedStorageManager] Save failed:', error);
    throw new Error(`Failed to save project: ${error.message}`);
  }
}
```

### New Helper Method
```typescript
private async performCloudSync(id: string, data: UnifiedProjectData): Promise<CloudSaveResult> {
  return await primaryCloudSave(id, data, {
    priority: 'normal',
    validateData: true,
    splitLargeData: true
  });
}

private async processOfflineQueue(): Promise<void> {
  try {
    console.log('[UnifiedStorageManager] Processing offline queue...');
    await processOfflineQueue();
  } catch (error) {
    console.error('[UnifiedStorageManager] Queue processing failed', error);
  }
}

async getDetailedSyncStatus(projectId: string): Promise<{
  status: 'synced' | 'queued' | 'error' | 'local';
  lastSyncAt?: Date;
  lastError?: string;
  pendingOperations: number;
  isDirty: boolean;
}> {
  const data = await this.loadFromLocalStorage(projectId);
  const queueStatus = getSyncStatus(projectId);

  return {
    status: data?.syncStatus || 'local',
    lastSyncAt: data?.lastSyncAt,
    lastError: data?.lastError,
    pendingOperations: queueStatus.queuedOperations,
    isDirty: this.dirtyProjects.has(projectId)
  };
}
```

## Testing the Migration

### 1. Unit Tests

```typescript
import { UnifiedStorageManager } from './UnifiedStorageManager';
import { primaryCloudSave } from './firebase';

jest.mock('./firebase');

describe('UnifiedStorageManager - Cloud Sync', () => {
  it('should update sync status on successful save', async () => {
    (primaryCloudSave as jest.Mock).mockResolvedValue({
      success: true,
      syncedAt: new Date(),
      showcaseLocation: 'firestore'
    });

    const manager = UnifiedStorageManager.getInstance();
    const projectId = await manager.saveProject({
      title: 'Test Project',
      userId: 'user123'
    });

    const status = await manager.getDetailedSyncStatus(projectId);
    expect(status.status).toBe('synced');
    expect(status.lastSyncAt).toBeDefined();
  });

  it('should queue failed operations', async () => {
    (primaryCloudSave as jest.Mock).mockResolvedValue({
      success: false,
      queued: true
    });

    const manager = UnifiedStorageManager.getInstance();
    const projectId = await manager.saveProject({
      title: 'Test Project',
      userId: 'user123'
    });

    const status = await manager.getDetailedSyncStatus(projectId);
    expect(status.status).toBe('queued');
    expect(status.pendingOperations).toBeGreaterThan(0);
  });
});
```

### 2. Integration Test

```typescript
describe('UnifiedStorageManager - Integration', () => {
  it('should sync to cloud and recover from offline', async () => {
    const manager = UnifiedStorageManager.getInstance({
      syncToFirebase: true
    });

    // Save while online
    const projectId = await manager.saveProject({
      title: 'Test Project',
      userId: 'user123',
      showcase: { /* large data */ }
    });

    let status = await manager.getDetailedSyncStatus(projectId);
    expect(status.status).toBe('synced');

    // Simulate offline
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

    // Update project
    await manager.saveProject({
      id: projectId,
      title: 'Updated Project',
      userId: 'user123'
    });

    status = await manager.getDetailedSyncStatus(projectId);
    expect(status.status).toBe('queued');

    // Go back online
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    window.dispatchEvent(new Event('online'));

    // Wait for queue processing
    await new Promise(resolve => setTimeout(resolve, 100));

    status = await manager.getDetailedSyncStatus(projectId);
    expect(status.status).toBe('synced');
    expect(status.pendingOperations).toBe(0);
  });
});
```

## Rollback Plan

If issues arise, you can quickly rollback:

1. **Revert imports**: Remove firebase imports
2. **Restore old method**: Copy `backgroundFirebaseSync` from backup
3. **Revert saveProject**: Restore old sync call
4. **Remove new methods**: Delete `performCloudSync`, `processOfflineQueue`, `getDetailedSyncStatus`

## Performance Monitoring

Add these metrics to track migration success:

```typescript
// In performCloudSync
private async performCloudSync(id: string, data: UnifiedProjectData): Promise<CloudSaveResult> {
  const startTime = performance.now();

  const result = await primaryCloudSave(id, data, {
    priority: 'normal',
    validateData: true,
    splitLargeData: true
  });

  const duration = performance.now() - startTime;

  // Log metrics
  console.log('[UnifiedStorageManager] Cloud sync metrics', {
    projectId: id,
    duration: `${duration.toFixed(0)}ms`,
    success: result.success,
    queued: result.queued,
    showcaseLocation: result.showcaseLocation
  });

  return result;
}
```

## Common Migration Issues

### Issue 1: TypeScript Errors
**Error**: `Cannot find module './firebase'`
**Solution**: Ensure index.ts exports are correct

### Issue 2: Circular Dependencies
**Error**: Module initialization errors
**Solution**: Use dynamic imports for firebase services

### Issue 3: Queue Not Processing
**Error**: Operations stuck in queue
**Solution**: Verify 'online' event listener is registered

### Issue 4: Sync Status Not Updating
**Error**: UI shows wrong status
**Solution**: Ensure localStorage is updated after sync

## Next Steps

After migration:

1. Monitor error telemetry: `CloudErrorTelemetry.getErrorStats()`
2. Check queue stats: `offlineQueue.getStats()`
3. Review cache performance: `showcaseCache.getStats()`
4. Update UI to show sync status
5. Add user-facing sync indicators
6. Implement conflict resolution UI

## Support

For issues or questions:
1. Check README.md for detailed API docs
2. Review error telemetry for patterns
3. Check offline queue for stuck operations
4. Verify Firestore rules allow writes
