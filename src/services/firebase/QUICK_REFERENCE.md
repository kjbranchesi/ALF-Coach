# Firebase Cloud Integration - Quick Reference

## TL;DR

**Old Way (Before)**:
```typescript
// Silent background sync - no feedback
this.backgroundFirebaseSync(id, data).catch(error => {
  console.warn('Sync failed:', error.message);
});
```

**New Way (After)**:
```typescript
// Cloud-first with explicit results
const result = await primaryCloudSave(id, data);
if (!result.success) {
  showError(result.error.userMessage);
}
```

---

## Common Operations

### 1. Save Project to Cloud
```typescript
import { primaryCloudSave } from './services/firebase';

const result = await primaryCloudSave(projectId, projectData, {
  priority: 'high',        // 'high' | 'normal' | 'low'
  validateData: true,      // Check size limits
  splitLargeData: true     // Auto-split to Cloud Storage
});

if (result.success) {
  // Success!
  console.log(`Synced at ${result.syncedAt}`);
  console.log(`Showcase in: ${result.showcaseLocation}`);
} else if (result.queued) {
  // Queued for retry (offline or auth issue)
  showToast('Changes will sync when reconnected');
} else {
  // Failed
  showError(result.error.userMessage);
}
```

### 2. Upload Large File to Cloud Storage
```typescript
import { CloudStorageService } from './services/firebase';

try {
  const pointer = await CloudStorageService.uploadJSON(
    userId,
    projectId,
    'showcase',
    showcaseData,
    {
      maxRetries: 5,
      validateUpload: true,
      onProgress: (pct) => console.log(`${pct}%`)
    }
  );

  console.log(`Uploaded ${pointer.sizeKB} KB to ${pointer.path}`);
  console.log(`Download URL: ${pointer.downloadURL}`);
} catch (error) {
  console.error(error.userMessage);
}
```

### 3. Check Cache Before Fetching
```typescript
import { showcaseCache } from './services/firebase';

// Try cache first
let showcase = showcaseCache.getShowcase(userId, projectId);

if (!showcase) {
  // Cache miss - fetch from cloud
  showcase = await fetchFromCloud(userId, projectId);

  // Update cache
  showcaseCache.setShowcase(userId, projectId, showcase);
}

return showcase;
```

### 4. Monitor Sync Status
```typescript
import { getSyncStatus, offlineQueue } from './services/firebase';

// Check specific project
const status = getSyncStatus(projectId);
if (status.hasPendingOperations) {
  showBadge(`${status.queuedOperations} pending`);
}

// Subscribe to queue changes
const unsubscribe = offlineQueue.subscribe((stats) => {
  updateSyncIndicator({
    total: stats.totalItems,
    highPriority: stats.highPriority
  });
});
```

### 5. Handle Offline Mode
```typescript
import { offlineQueue, processOfflineQueue } from './services/firebase';

// Operations auto-queue when offline
// Process when back online
window.addEventListener('online', async () => {
  await processOfflineQueue();
});

// Or manually trigger
await processOfflineQueue();
```

### 6. Batch Firestore Operations
```typescript
import { OptimizedFirestore } from './services/firebase';

await OptimizedFirestore.batchWrite(userId, [
  {
    type: 'set',
    path: `users/${userId}/projects/${p1}`,
    data: project1
  },
  {
    type: 'update',
    path: `users/${userId}/projects/${p2}`,
    data: { status: 'published' }
  },
  {
    type: 'delete',
    path: `users/${userId}/projects/${p3}`
  }
]);
```

---

## Error Handling

### Standard Pattern
```typescript
import { CloudError, CloudErrorCode } from './services/firebase';

try {
  await cloudOperation();
} catch (error) {
  if (error instanceof CloudError) {
    switch (error.code) {
      case CloudErrorCode.AUTH_REQUIRED:
        redirectToLogin();
        break;

      case CloudErrorCode.NETWORK_OFFLINE:
        // Already queued, just notify
        showToast('Offline - will sync later');
        break;

      case CloudErrorCode.STORAGE_QUOTA_EXCEEDED:
        showUpgradeModal();
        break;

      default:
        showError(error.userMessage);
    }
  } else {
    // Unexpected error
    console.error(error);
  }
}
```

### Common Error Codes
- `AUTH_REQUIRED` - User must sign in
- `NETWORK_OFFLINE` - Device is offline
- `STORAGE_QUOTA_EXCEEDED` - Storage limit reached
- `FIRESTORE_DOCUMENT_TOO_LARGE` - Document >1MB
- `FIRESTORE_PERMISSION_DENIED` - Access denied
- `OPERATION_RETRY_EXHAUSTED` - All retries failed

---

## Performance Tips

### 1. Use Cache Aggressively
```typescript
// BAD - Always fetches from cloud
const showcase = await fetchShowcase(userId, projectId);

// GOOD - Check cache first
const showcase = showcaseCache.getShowcase(userId, projectId)
  || await fetchShowcase(userId, projectId);
```

### 2. Prefetch on Navigation
```typescript
// When user navigates to project list
const projectIds = await getProjectList();

// Prefetch showcases in background
showcaseCache.prefetchShowcases(
  projectIds.map(id => ({ userId, projectId: id })),
  fetchShowcase
);
```

### 3. Batch Operations
```typescript
// BAD - Multiple round trips
for (const project of projects) {
  await saveProject(project);
}

// GOOD - Single batch
await OptimizedFirestore.batchWrite(userId,
  projects.map(p => ({
    type: 'set',
    path: `users/${userId}/projects/${p.id}`,
    data: p
  }))
);
```

### 4. Monitor Performance
```typescript
import { showcaseCache, CloudErrorTelemetry } from './services/firebase';

// Cache stats
const cacheStats = showcaseCache.getStats();
console.log(`Hit rate: ${(cacheStats.hitRate * 100).toFixed(1)}%`);

// Error stats
const errorStats = CloudErrorTelemetry.getErrorStats();
console.log('Errors by type:', errorStats);
```

---

## Size Limits & Thresholds

### Firestore
- **Document Size**: 1MB hard limit
- **Safe Threshold**: 900KB (warning)
- **Auto-Split Threshold**: 700KB (for showcase)
- **Batch Size**: 500 operations max

### Cloud Storage
- **Max Upload**: 50MB per file
- **Recommended**: <10MB for good performance
- **Snapshot Retention**: 10 most recent

### Cache
- **ShowcaseCache**: 100MB, 200 entries
- **URLCache**: 5MB, 1000 entries
- **Generic Cache**: 50MB, 500 entries

---

## Debugging

### View Error History
```typescript
import { CloudErrorTelemetry } from './services/firebase';

// Last 10 errors
const recent = CloudErrorTelemetry.getRecentErrors(10);
console.table(recent.map(e => ({
  code: e.code,
  message: e.message,
  retryable: e.isRetryable,
  time: e.context.timestamp
})));
```

### Inspect Queue
```typescript
import { offlineQueue } from './services/firebase';

// All queued operations
const queue = offlineQueue.getQueue();
console.table(queue.map(op => ({
  operation: op.operation,
  priority: op.priority,
  attempts: op.context.attemptCount,
  nextRetry: op.context.nextRetryAt
})));

// Operations for specific project
const projectOps = offlineQueue.getProjectOperations(projectId);
```

### Cache Inspection
```typescript
import { showcaseCache } from './services/firebase';

// All cached keys
const keys = showcaseCache.keys();

// Entry details
const entry = showcaseCache.getEntry(key);
console.log({
  cachedAt: entry.cachedAt,
  accessCount: entry.accessCount,
  sizeKB: entry.sizeBytes / 1024
});
```

---

## Testing

### Mock for Unit Tests
```typescript
import { primaryCloudSave } from './services/firebase';

jest.mock('./services/firebase');

test('handles cloud save', async () => {
  (primaryCloudSave as jest.Mock).mockResolvedValue({
    success: true,
    syncedAt: new Date(),
    showcaseLocation: 'firestore'
  });

  const result = await myFunction();
  expect(result.synced).toBe(true);
});
```

### Simulate Errors
```typescript
import { CloudError, CloudErrorCode } from './services/firebase';

test('handles auth error', async () => {
  (primaryCloudSave as jest.Mock).mockResolvedValue({
    success: false,
    error: new CloudError(
      CloudErrorCode.AUTH_REQUIRED,
      'Not authenticated',
      { operation: 'test' }
    )
  });

  await expect(myFunction()).rejects.toThrow('Not authenticated');
});
```

---

## Migration Checklist

- [ ] Copy all files to `/src/services/firebase/`
- [ ] Update imports in `UnifiedStorageManager.ts`
- [ ] Replace `backgroundFirebaseSync` with `primaryCloudSave`
- [ ] Add sync status handling
- [ ] Add queue processing on 'online' event
- [ ] Update UI to show sync status
- [ ] Add error messages to user
- [ ] Test offline scenarios
- [ ] Test large file scenarios
- [ ] Monitor error telemetry
- [ ] Check cache hit rates
- [ ] Verify queue processing

---

## API Reference

### primaryCloudSave
```typescript
function primaryCloudSave(
  projectId: string,
  data: UnifiedProjectData,
  options?: {
    priority?: 'high' | 'normal' | 'low';
    skipQueue?: boolean;
    validateData?: boolean;
    splitLargeData?: boolean;
  }
): Promise<CloudSaveResult>
```

### CloudStorageService
```typescript
class CloudStorageService {
  static uploadJSON(userId, projectId, kind, data, options?): Promise<CloudBlobPointer>
  static downloadJSON(pointer, options?): Promise<any>
  static uploadSnapshot(userId, projectId, kind, data, options?): Promise<string>
  static trimSnapshots(userId, projectId, kind, maxKeep?): Promise<number>
  static deleteProject(userId, projectId): Promise<void>
  static getProjectStats(userId, projectId): Promise<Stats>
}
```

### OptimizedFirestore
```typescript
class OptimizedFirestore {
  static writeDocument(userId, projectId, data, options?): Promise<void>
  static writeDocumentWithSplit(userId, projectId, data, options?): Promise<void>
  static readDocument(userId, projectId): Promise<any>
  static updateDocument(userId, projectId, updates): Promise<void>
  static deleteDocument(userId, projectId): Promise<void>
  static batchWrite(userId, operations): Promise<void>
}
```

### OfflineQueue
```typescript
class OfflineQueue {
  enqueue(operation, context): string
  processQueue(executor): Promise<ProcessResult>
  getStats(): QueueStats
  getQueue(): QueuedOperation[]
  getProjectOperations(projectId): QueuedOperation[]
  remove(operationId): boolean
  clear(): void
  subscribe(listener): () => void
  hasPendingOperations(projectId?): boolean
}
```

### CloudCache
```typescript
class CloudCache<T> {
  get(key): T | null
  set(key, data, options?): void
  has(key): boolean
  invalidate(key): boolean
  invalidatePattern(pattern): number
  clear(): void
  getStats(): CacheStats
  prefetch(keys, fetcher): Promise<void>
}
```

---

## Support

- **Full Docs**: See `README.md`
- **Migration Guide**: See `MIGRATION.md`
- **Summary**: See `FIREBASE_OPTIMIZATION_SUMMARY.md`
- **Issues**: Check error telemetry and queue stats
