# Cloud-First Architecture - Refined Implementation Plan

**Updated**: January 2025
**Status**: Strategic refinements incorporated from expert review
**Approach**: Risk-managed staged rollout with atomicity guarantees

---

## 🎯 Strategic Adjustments (Critical)

### 1. Pointer Strategy: Path-Based, Not URL-Based

**Problem**: Storing `showcaseUrl` with token is brittle (tokens rotate, cache serves stale).

**Solution**: Store canonical path + compute fresh URL at read time

```typescript
// Firestore document structure
interface CloudProjectMetadata {
  // Canonical reference (never expires)
  showcasePath: string;  // e.g., "users/{uid}/projects/{id}/showcase-12.json"

  // Versioning for atomicity
  rev: number;           // Monotonically increasing revision number

  // Metadata
  showcaseSizeKB: number;
  syncedAt: Timestamp;

  // Optional fast path (session-only cache)
  showcaseUrl?: string;  // Ephemeral, recompute if missing/expired
}
```

**Read Pattern**:
```typescript
// Always derive fresh URL from path
const metadata = await getDoc(doc(db, 'users', uid, 'projects', id));
const { showcasePath } = metadata.data();
const freshUrl = await getDownloadURL(ref(storage, showcasePath));
const showcase = await fetch(freshUrl).then(r => r.json());
```

---

### 2. Two-Phase Commit for Atomicity

**Problem**: Upload → Firestore write is not atomic. Failures leave:
- Storage blob without pointer (orphaned data)
- Firestore pointer without blob (404 on read)

**Solution**: Versioned upload + transactional pointer update

```typescript
async function atomicSaveShowcase(
  uid: string,
  projectId: string,
  showcase: ProjectShowcaseV2
): Promise<{ success: boolean; rev: number }> {

  // 1. Get current revision
  const docRef = doc(db, 'users', uid, 'projects', projectId);
  const currentSnap = await getDoc(docRef);
  const currentRev = currentSnap.data()?.rev || 0;
  const newRev = currentRev + 1;

  // 2. Upload to versioned path (idempotent - can retry safely)
  const showcasePath = `users/${uid}/projects/${projectId}/showcase-${newRev}.json`;
  const storageRef = ref(storage, showcasePath);
  const jsonBlob = new Blob([JSON.stringify(showcase)], {
    type: 'application/json'
  });

  // Set cache control for CDN
  await uploadBytes(storageRef, jsonBlob, {
    cacheControl: 'public, max-age=300', // 5 min cache
    customMetadata: {
      rev: String(newRev),
      uploadedAt: new Date().toISOString()
    }
  });

  // 3. Update pointer atomically (transaction prevents race conditions)
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(docRef);

    // Prevent stale writes
    if (snap.exists() && snap.data().rev >= newRev) {
      throw new Error('STALE_WRITE: Another device saved a newer version');
    }

    transaction.set(docRef, {
      showcasePath,
      showcaseSizeKB: Math.round(jsonBlob.size / 1024),
      rev: newRev,
      syncedAt: serverTimestamp(),
      // Don't store URL - will be computed fresh at read time
    }, { merge: true });
  });

  // 4. Best-effort cleanup of old version (outside transaction)
  if (currentRev > 0) {
    const oldPath = `users/${uid}/projects/${projectId}/showcase-${currentRev}.json`;
    deleteObject(ref(storage, oldPath)).catch(err => {
      console.warn('[CloudProjectService] Failed to delete old version:', err);
      // Non-fatal - orphaned blobs cleaned up by scheduled function
    });
  }

  return { success: true, rev: newRev };
}
```

**Why This Works**:
- Upload is idempotent (can retry if network fails)
- Transaction ensures only one pointer update wins
- Versioned paths prevent CDN cache staleness
- Old versions cleaned up asynchronously

---

### 3. Offline Fallback: Compressed Snapshot

**Problem**: Removing IDB risks data loss if tab closes while offline. Large JSON can't fit in localStorage.

**Solution**: Keep small compressed "last snapshot" in localStorage (size-capped)

```typescript
interface OfflineSnapshot {
  projectId: string;
  rev: number;
  compressedShowcase: string;  // Base64-encoded gzipped JSON
  sizeKB: number;
  capturedAt: number;          // Timestamp
}

const SNAPSHOT_SIZE_LIMIT_KB = 300;  // Hard cap

async function saveOfflineSnapshot(
  projectId: string,
  showcase: ProjectShowcaseV2,
  rev: number
) {
  try {
    // 1. Serialize and compress
    const json = JSON.stringify(showcase);
    const compressed = pako.gzip(json);  // Use pako library
    const base64 = btoa(String.fromCharCode(...compressed));

    const sizeKB = Math.round(base64.length / 1024);

    // 2. Check size limit
    if (sizeKB > SNAPSHOT_SIZE_LIMIT_KB) {
      console.warn(`[OfflineSnapshot] Snapshot too large (${sizeKB}KB), skipping`);
      return;
    }

    // 3. Save to localStorage
    const snapshot: OfflineSnapshot = {
      projectId,
      rev,
      compressedShowcase: base64,
      sizeKB,
      capturedAt: Date.now()
    };

    localStorage.setItem(`alf_offline_snapshot_${projectId}`, JSON.stringify(snapshot));

  } catch (error) {
    console.error('[OfflineSnapshot] Failed to save:', error);
    // Non-fatal - continue without snapshot
  }
}

async function loadOfflineSnapshot(projectId: string): Promise<ProjectShowcaseV2 | null> {
  try {
    const item = localStorage.getItem(`alf_offline_snapshot_${projectId}`);
    if (!item) return null;

    const snapshot: OfflineSnapshot = JSON.parse(item);

    // Decompress
    const compressed = Uint8Array.from(atob(snapshot.compressedShowcase), c => c.charCodeAt(0));
    const json = pako.ungzip(compressed, { to: 'string' });

    return JSON.parse(json);

  } catch (error) {
    console.error('[OfflineSnapshot] Failed to load:', error);
    return null;
  }
}
```

**Alternative: Keep IDB Behind Feature Flag (Safer for Pilot)**

```typescript
const useIDB = import.meta.env.VITE_ENABLE_IDB_FALLBACK === 'true';

if (useIDB) {
  // Use existing LargeObjectStore
  await LargeObjectStore.saveShowcase(id, showcase);
} else {
  // Use compressed snapshot
  await saveOfflineSnapshot(id, showcase, rev);
}
```

**Recommendation**: Keep IDB during pilot, gate with feature flag, remove only when cloud path is proven stable.

---

### 4. Observability: Telemetry Hooks

**Problem**: Silent failures make debugging impossible. Need visibility into save/load success rates.

**Solution**: Lightweight telemetry on all critical operations

```typescript
interface TelemetryEvent {
  event: 'save_project' | 'load_project' | 'sync_error' | 'conflict_detected';
  success: boolean;
  latencyMs: number;
  source?: 'cache' | 'cloud' | 'offline_snapshot';
  errorCode?: string;
  projectId: string;
  timestamp: number;
}

class SimpleTelemetry {
  private events: TelemetryEvent[] = [];

  track(event: Omit<TelemetryEvent, 'timestamp'>) {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(telemetryEvent);

    // Keep only last 100 events (memory bounded)
    if (this.events.length > 100) {
      this.events.shift();
    }

    // Log in dev mode
    if (import.meta.env.DEV) {
      console.log('[Telemetry]', telemetryEvent);
    }

    // Send to analytics in production (optional)
    if (import.meta.env.PROD && window.gtag) {
      window.gtag('event', event.event, {
        success: event.success,
        latency: event.latencyMs,
        source: event.source,
        error_code: event.errorCode
      });
    }
  }

  getStats() {
    const saves = this.events.filter(e => e.event === 'save_project');
    const loads = this.events.filter(e => e.event === 'load_project');

    return {
      saveSuccessRate: this.successRate(saves),
      loadSuccessRate: this.successRate(loads),
      avgSaveLatency: this.avgLatency(saves),
      avgLoadLatency: this.avgLatency(loads),
      errorCodes: this.errorCodeCounts()
    };
  }

  private successRate(events: TelemetryEvent[]) {
    if (events.length === 0) return 100;
    const successes = events.filter(e => e.success).length;
    return Math.round((successes / events.length) * 100);
  }

  private avgLatency(events: TelemetryEvent[]) {
    if (events.length === 0) return 0;
    const sum = events.reduce((acc, e) => acc + e.latencyMs, 0);
    return Math.round(sum / events.length);
  }

  private errorCodeCounts() {
    const errors = this.events.filter(e => !e.success && e.errorCode);
    return errors.reduce((acc, e) => {
      acc[e.errorCode!] = (acc[e.errorCode!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

export const telemetry = new SimpleTelemetry();
```

**Usage**:
```typescript
const startTime = Date.now();
try {
  await cloudProjectService.saveProject(id, data);
  telemetry.track({
    event: 'save_project',
    success: true,
    latencyMs: Date.now() - startTime,
    projectId: id
  });
} catch (error) {
  telemetry.track({
    event: 'save_project',
    success: false,
    latencyMs: Date.now() - startTime,
    errorCode: error.code || 'UNKNOWN',
    projectId: id
  });
}
```

---

### 5. Error Suppression: Off by Default in Pilot

**Problem**: Error suppressors made debugging impossible.

**Solution**: Gate suppressors with env flags, default to OFF

```typescript
// src/utils/errorHandler.ts

const SUPPRESS_ERRORS = import.meta.env.VITE_SUPPRESS_ERRORS === 'true';
const SUPPRESS_FIREBASE = import.meta.env.VITE_SUPPRESS_FIREBASE_ERRORS === 'true';

export function shouldSuppressError(error: Error): boolean {
  // Never suppress in dev
  if (import.meta.env.DEV) return false;

  // Check Firebase-specific suppression
  if (error.message?.includes('Firebase') && SUPPRESS_FIREBASE) {
    return true;
  }

  // Check general suppression
  return SUPPRESS_ERRORS;
}

// In production builds for pilot: keep suppressors OFF
// .env.pilot
// VITE_SUPPRESS_ERRORS=false
// VITE_SUPPRESS_FIREBASE_ERRORS=false
```

---

### 6. Staged Rollout Strategy (Risk-Managed)

**Phase A (1-2 days): Cloud-First Reads Only**
- Build `CloudProjectService` with two-phase commit pattern
- Switch `ReviewScreen` to cloud-first reads
- Keep saves in `UnifiedStorageManager` (local-first + background cloud)
- **Goal**: Prove read path stability without touching writes

**Phase B (1-2 days): Cloud-First Writes**
- Switch saves to `CloudProjectService.saveProject()`
- Keep local cache write-through for UX speed
- Queue offline operations
- **Goal**: Prove write path stability with full atomicity

**Phase C (cleanup): Deprecate UnifiedStorageManager**
- Remove `backgroundFirebaseSync()` (replaced by CloudProjectService)
- Optionally keep IDB behind feature flag or remove entirely
- Clean up legacy code paths
- **Goal**: Single source of truth, simplified architecture

---

## 🔴 Remaining Critical Fixes (Updated Plan)

### 3. Sync Error Visibility + Telemetry (CRITICAL)

**Implementation**:
```typescript
// src/types/syncStatus.ts
export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline' | 'conflict';

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt?: number;
  lastError?: {
    code: string;
    message: string;
    timestamp: number;
  };
  rev?: number;
}

// src/services/SyncStatusManager.ts
class SyncStatusManager {
  private statusMap = new Map<string, SyncState>();

  setStatus(projectId: string, status: SyncStatus) {
    const current = this.getStatus(projectId);
    this.statusMap.set(projectId, {
      ...current,
      status,
      lastSyncedAt: status === 'synced' ? Date.now() : current.lastSyncedAt
    });

    // Notify listeners
    this.notifyListeners(projectId);
  }

  setError(projectId: string, error: Error) {
    const current = this.getStatus(projectId);
    this.statusMap.set(projectId, {
      ...current,
      status: 'error',
      lastError: {
        code: error.name,
        message: error.message,
        timestamp: Date.now()
      }
    });

    // Track in telemetry
    telemetry.track({
      event: 'sync_error',
      success: false,
      latencyMs: 0,
      errorCode: error.name,
      projectId
    });

    this.notifyListeners(projectId);
  }

  getStatus(projectId: string): SyncState {
    return this.statusMap.get(projectId) || { status: 'offline' };
  }

  private listeners = new Set<(projectId: string, state: SyncState) => void>();

  subscribe(callback: (projectId: string, state: SyncState) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(projectId: string) {
    const state = this.getStatus(projectId);
    this.listeners.forEach(cb => cb(projectId, state));
  }
}

export const syncStatusManager = new SyncStatusManager();
```

**UI Component**:
```tsx
// src/components/SyncStatusIndicator.tsx
export function SyncStatusIndicator({ projectId }: { projectId: string }) {
  const [syncState, setSyncState] = useState(syncStatusManager.getStatus(projectId));

  useEffect(() => {
    return syncStatusManager.subscribe((id, state) => {
      if (id === projectId) setSyncState(state);
    });
  }, [projectId]);

  const statusConfig = {
    synced: { icon: CheckCircle, color: 'text-success-600', label: 'Synced' },
    syncing: { icon: RefreshCw, color: 'text-primary-600', label: 'Syncing...' },
    error: { icon: AlertCircle, color: 'text-error-600', label: 'Sync Failed' },
    offline: { icon: WifiOff, color: 'text-gray-400', label: 'Offline' },
    conflict: { icon: AlertTriangle, color: 'text-warning-600', label: 'Conflict' }
  };

  const config = statusConfig[syncState.status];

  return (
    <div className="flex items-center gap-2">
      <config.icon className={`w-4 h-4 ${config.color}`} />
      <span className="text-sm">{config.label}</span>

      {syncState.status === 'error' && (
        <button
          onClick={() => retrySync(projectId)}
          className="text-xs text-primary-600 hover:underline"
        >
          Retry
        </button>
      )}

      {syncState.lastSyncedAt && (
        <span className="text-xs text-gray-500">
          {formatRelativeTime(syncState.lastSyncedAt)}
        </span>
      )}
    </div>
  );
}
```

---

### 4. Conflict Resolution with Rev-Based Versioning (CRITICAL)

**Implementation**:
```typescript
// src/services/ConflictResolver.ts
interface ConflictResolution {
  action: 'use_local' | 'use_cloud' | 'merge' | 'cancel';
  mergedData?: any;
}

class ConflictResolver {
  async detectConflict(
    projectId: string,
    localRev: number,
    localData: any
  ): Promise<{ hasConflict: boolean; cloudRev?: number; cloudData?: any }> {
    const cloudDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid, 'projects', projectId));

    if (!cloudDoc.exists()) {
      return { hasConflict: false };
    }

    const cloudRev = cloudDoc.data().rev || 0;

    if (cloudRev <= localRev) {
      return { hasConflict: false };
    }

    // Cloud is newer - conflict detected
    return {
      hasConflict: true,
      cloudRev,
      cloudData: await this.loadCloudData(cloudDoc.data().showcasePath)
    };
  }

  async promptUserResolution(
    localData: any,
    cloudData: any
  ): Promise<ConflictResolution> {
    // Show modal to user with diff view
    return new Promise(resolve => {
      showConflictModal({
        local: localData,
        cloud: cloudData,
        onResolve: resolve
      });
    });
  }

  private async loadCloudData(showcasePath: string) {
    const url = await getDownloadURL(ref(storage, showcasePath));
    return fetch(url).then(r => r.json());
  }
}

export const conflictResolver = new ConflictResolver();
```

**Usage in Save Flow**:
```typescript
async function saveWithConflictDetection(projectId: string, data: any) {
  const localRev = getLocalRev(projectId);

  // Check for conflicts before saving
  const { hasConflict, cloudRev, cloudData } = await conflictResolver.detectConflict(
    projectId,
    localRev,
    data
  );

  if (hasConflict) {
    telemetry.track({
      event: 'conflict_detected',
      success: false,
      latencyMs: 0,
      projectId
    });

    const resolution = await conflictResolver.promptUserResolution(data, cloudData);

    if (resolution.action === 'cancel') {
      throw new Error('CONFLICT_CANCELLED');
    }

    if (resolution.action === 'use_cloud') {
      // Load cloud version locally
      return cloudData;
    }

    // Continue with local or merged data
    data = resolution.action === 'merge' ? resolution.mergedData : data;
  }

  // Proceed with atomic save
  return atomicSaveShowcase(auth.currentUser!.uid, projectId, data);
}
```

---

### 5. Race Condition Fix with Mutex Lock (CRITICAL)

**Implementation**:
```typescript
// src/utils/AsyncMutex.ts
class AsyncMutex {
  private locks = new Map<string, Promise<void>>();

  async runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Wait for existing lock to release
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }

    // Acquire lock
    let release: () => void;
    const lockPromise = new Promise<void>(resolve => {
      release = resolve;
    });
    this.locks.set(key, lockPromise);

    try {
      // Execute function
      return await fn();
    } finally {
      // Release lock
      this.locks.delete(key);
      release!();
    }
  }
}

export const syncMutex = new AsyncMutex();
```

**Usage in CloudProjectService**:
```typescript
class CloudProjectService {
  async saveProject(projectId: string, data: any) {
    return syncMutex.runExclusive(`save_${projectId}`, async () => {
      const startTime = Date.now();

      try {
        syncStatusManager.setStatus(projectId, 'syncing');

        const result = await atomicSaveShowcase(
          auth.currentUser!.uid,
          projectId,
          data
        );

        syncStatusManager.setStatus(projectId, 'synced');

        telemetry.track({
          event: 'save_project',
          success: true,
          latencyMs: Date.now() - startTime,
          projectId
        });

        return result;

      } catch (error) {
        syncStatusManager.setError(projectId, error as Error);
        throw error;
      }
    });
  }
}
```

---

## 📊 Acceptance Criteria

### Phase A (Cloud-First Reads)
- [ ] ReviewScreen loads from cloud with >99.5% success rate
- [ ] Fresh URL computed via `getDownloadURL()` on every load
- [ ] No 403/404 errors on Storage (rules deployed correctly)
- [ ] Telemetry shows consistent read latency <500ms
- [ ] Fallback to offline snapshot works when offline

### Phase B (Cloud-First Writes)
- [ ] Save success rate >99.5% across 20 projects
- [ ] Atomic two-phase commit prevents orphaned blobs
- [ ] Conflict detection works across devices
- [ ] Sync status visible within 200-500ms
- [ ] Offline queue drains within 30s on reconnect

### Phase C (Cleanup)
- [ ] UnifiedStorageManager deprecated, all code paths use CloudProjectService
- [ ] IDB removed (or kept behind feature flag)
- [ ] No regression in offline editing capability
- [ ] Telemetry confirms 100% cloud-first reads/writes

---

## 🚀 Implementation Order (Next 2-3 Days)

**Today (3-4 hours)**:
1. ✅ Sync error visibility + telemetry hooks
2. ✅ Conflict resolution with rev-based versioning
3. ✅ Race condition fix with mutex lock

**Tomorrow (4-6 hours)**:
1. CloudProjectService with two-phase commit
2. Offline snapshot (compressed, size-capped)
3. ReviewScreen integration (Phase A)

**Day 3 (4-6 hours)**:
1. Switch saves to CloudProjectService (Phase B)
2. End-to-end testing (save/load flows)
3. Telemetry verification

**Next Week (Phase C cleanup)**:
1. Deprecate UnifiedStorageManager
2. Optional: Remove IDB or keep behind flag
3. Documentation and pilot launch

---

## 📚 Dependencies to Add

```bash
# Compression library for offline snapshots
npm install pako
npm install --save-dev @types/pako

# Already installed:
# - firebase (11.10.0)
# - dompurify (3.3.0)
```

---

**Next Action**: Implement sync error visibility with telemetry hooks
