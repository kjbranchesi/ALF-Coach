/**
 * Primary Cloud Sync
 * Cloud-first save operations with comprehensive error handling, retry logic,
 * and offline queue integration. Replaces backgroundFirebaseSync.
 */

import { auth, isOfflineMode } from '../../firebase/firebase';
import { CloudError, CloudErrorCode, CloudErrorFactory, CloudErrorTelemetry } from './CloudErrors';
import { CloudStorageService } from './CloudStorageService';
import { OptimizedFirestore } from './OptimizedFirestore';
import { offlineQueue } from './OfflineQueue';
import { showcaseCache } from './CloudCache';
import type { UnifiedProjectData } from '../UnifiedStorageManager';
import type { LargeRef } from '../LargeObjectStore';
import { LargeObjectStore } from '../LargeObjectStore';

export interface CloudSaveResult {
  success: boolean;
  syncedAt?: Date;
  error?: CloudError;
  queued?: boolean;
  showcaseLocation?: 'firestore' | 'cloud-storage' | 'queued';
}

export interface CloudSaveOptions {
  priority?: 'high' | 'normal' | 'low';
  skipQueue?: boolean;
  validateData?: boolean;
  splitLargeData?: boolean;
}

const SHOWCASE_FIRESTORE_THRESHOLD = 700_000; // 700KB

/**
 * Wait for authentication with timeout
 */
async function waitForAuth(timeoutMs: number): Promise<boolean> {
  if (auth.currentUser) {
    return true;
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}

/**
 * Sanitize data for Firestore
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }

  if (obj instanceof Date) {
    return obj;
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || typeof value === 'function') {
        continue;
      }
      sanitized[key] = sanitizeForFirestore(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Primary cloud save - the main sync path for cloud-first architecture
 */
export async function primaryCloudSave(
  projectId: string,
  data: UnifiedProjectData,
  options: CloudSaveOptions = {}
): Promise<CloudSaveResult> {
  const operation = 'primaryCloudSave';
  const startTime = Date.now();

  console.log(`[PrimaryCloudSync] Starting cloud save for ${projectId}...`);

  // Check if Firebase is disabled
  const FIREBASE_DISABLED = (import.meta as any)?.env?.VITE_FIREBASE_DISABLED === 'true';
  if (FIREBASE_DISABLED) {
    console.log(`[PrimaryCloudSync] Firebase disabled by env, skipping sync`);
    return { success: true, syncedAt: new Date() };
  }

  // Check offline mode
  if (isOfflineMode) {
    return handleOfflineSync(projectId, data, options);
  }

  // Wait for authentication
  const isAuthenticated = await waitForAuth(5000);
  if (!isAuthenticated || !auth.currentUser) {
    return handleAuthFailure(projectId, data, options);
  }

  const userId = auth.currentUser.uid;

  try {
    // Prepare showcase data
    let showcaseObj: any = (data as any).showcase;
    let showcaseLocation: CloudSaveResult['showcaseLocation'] = 'firestore';

    // Load showcase from IDB if needed
    if (!showcaseObj && data.showcaseRef) {
      try {
        showcaseObj = await LargeObjectStore.loadShowcase(data.showcaseRef);
      } catch (error) {
        console.warn(`[PrimaryCloudSync] Failed to load showcase from IDB`, error);
      }
    }

    // Prepare project payload
    const projectPayload: any = { ...(data.projectData || {}) };

    // Handle showcase based on size
    if (showcaseObj) {
      const sanitized = sanitizeForFirestore(showcaseObj);
      const estimatedSize = JSON.stringify(sanitized).length;

      if (estimatedSize < SHOWCASE_FIRESTORE_THRESHOLD) {
        // Include in Firestore document
        projectPayload.showcase = sanitized;
        showcaseLocation = 'firestore';
      } else {
        // Upload to Cloud Storage
        try {
          const cloudPtr = await CloudStorageService.uploadJSON(
            userId,
            projectId,
            'showcase',
            sanitized,
            { validateUpload: true }
          );

          projectPayload.showcase = null;
          projectPayload.showcaseRef = cloudPtr;
          showcaseLocation = 'cloud-storage';

          // Update cache
          showcaseCache.setShowcase(userId, projectId, sanitized, cloudPtr.etag);

          console.log(`[PrimaryCloudSync] Showcase uploaded to Cloud Storage (${cloudPtr.sizeKB} KB)`);
        } catch (storageError: any) {
          // If Cloud Storage fails, try to fit in Firestore anyway
          console.warn(`[PrimaryCloudSync] Cloud Storage upload failed, attempting Firestore`, storageError);

          if (estimatedSize < 900_000) { // Still under Firestore limit
            projectPayload.showcase = sanitized;
            showcaseLocation = 'firestore';
          } else {
            // Too large for Firestore, will need to queue
            throw storageError;
          }
        }
      }
    }

    // Build complete payload
    const enhancedPayload = {
      wizardData: sanitizeForFirestore(data.wizardData),
      project: sanitizeForFirestore(projectPayload),
      capturedData: sanitizeForFirestore(data.capturedData),
      completeness: data.progress,
      metadata: sanitizeForFirestore({
        title: data.title,
        description: data.description,
        tagline: data.tagline,
        stage: data.stage,
        status: data.status,
        completedAt: data.completedAt ? data.completedAt.toISOString() : undefined,
        source: data.source || 'chat',
      }),
    };

    // Write to Firestore with splitting if needed
    if (options.splitLargeData !== false) {
      await OptimizedFirestore.writeDocumentWithSplit(
        userId,
        projectId,
        enhancedPayload,
        { validateSize: options.validateData !== false }
      );
    } else {
      await OptimizedFirestore.writeDocument(
        userId,
        projectId,
        enhancedPayload,
        { validateSize: options.validateData !== false }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[PrimaryCloudSync] Cloud save successful: ${projectId} (${duration}ms)`, {
      showcaseLocation,
      hasShowcase: !!showcaseObj,
      hasCapturedData: !!data.capturedData,
      hasWizardData: !!data.wizardData,
    });

    return {
      success: true,
      syncedAt: new Date(),
      showcaseLocation,
    };

  } catch (error: any) {
    return handleSyncError(error, projectId, data, userId, options);
  }
}

/**
 * Handle offline sync by queuing
 */
function handleOfflineSync(
  projectId: string,
  data: UnifiedProjectData,
  options: CloudSaveOptions
): CloudSaveResult {
  console.log(`[PrimaryCloudSync] Offline mode, queuing for later sync: ${projectId}`);

  if (options.skipQueue) {
    return {
      success: false,
      error: CloudErrorFactory.networkOffline('primaryCloudSave', { projectId }),
    };
  }

  try {
    offlineQueue.enqueue(
      {
        type: 'firestore_write',
        operation: 'primaryCloudSave',
        payload: { projectId, data },
        priority: options.priority || 'normal',
      },
      { projectId, userId: data.userId }
    );

    return {
      success: true,
      queued: true,
      showcaseLocation: 'queued',
    };
  } catch (queueError: any) {
    return {
      success: false,
      error: queueError instanceof CloudError
        ? queueError
        : CloudErrorFactory.fromFirebaseError(queueError, 'queueOffline', { projectId }),
    };
  }
}

/**
 * Handle authentication failure
 */
function handleAuthFailure(
  projectId: string,
  data: UnifiedProjectData,
  options: CloudSaveOptions
): CloudSaveResult {
  console.warn(`[PrimaryCloudSync] No authenticated user, queuing for later sync: ${projectId}`);

  const authError = CloudErrorFactory.authRequired('primaryCloudSave', { projectId });
  CloudErrorTelemetry.record(authError);

  if (options.skipQueue) {
    return { success: false, error: authError };
  }

  try {
    offlineQueue.enqueue(
      {
        type: 'firestore_write',
        operation: 'primaryCloudSave',
        payload: { projectId, data },
        priority: 'high', // Auth failures get high priority
      },
      { projectId, userId: data.userId }
    );

    return {
      success: true,
      queued: true,
      showcaseLocation: 'queued',
    };
  } catch (queueError: any) {
    return {
      success: false,
      error: queueError instanceof CloudError
        ? queueError
        : CloudErrorFactory.fromFirebaseError(queueError, 'queueAuthFailure', { projectId }),
    };
  }
}

/**
 * Handle sync errors
 */
function handleSyncError(
  error: any,
  projectId: string,
  data: UnifiedProjectData,
  userId: string,
  options: CloudSaveOptions
): CloudSaveResult {
  const cloudError = error instanceof CloudError
    ? error
    : CloudErrorFactory.fromFirebaseError(error, 'primaryCloudSave', {
        projectId,
        userId,
      });

  CloudErrorTelemetry.record(cloudError);

  console.error(`[PrimaryCloudSync] Cloud save failed: ${projectId}`, {
    code: cloudError.code,
    message: cloudError.message,
    isRetryable: cloudError.isRetryable,
  });

  // Queue for retry if error is retryable
  if (cloudError.isRetryable && !options.skipQueue) {
    try {
      offlineQueue.enqueue(
        {
          type: 'firestore_write',
          operation: 'primaryCloudSave',
          payload: { projectId, data },
          priority: options.priority || 'normal',
        },
        { projectId, userId }
      );

      console.log(`[PrimaryCloudSync] Queued for retry: ${projectId}`);

      return {
        success: false,
        error: cloudError,
        queued: true,
      };
    } catch (queueError) {
      console.error(`[PrimaryCloudSync] Failed to queue operation`, queueError);
    }
  }

  return {
    success: false,
    error: cloudError,
  };
}

/**
 * Process offline queue
 */
export async function processOfflineQueue(): Promise<void> {
  console.log('[PrimaryCloudSync] Processing offline queue...');

  const result = await offlineQueue.processQueue(async (op) => {
    if (op.type === 'firestore_write' && op.operation === 'primaryCloudSave') {
      const { projectId, data } = op.payload;
      const result = await primaryCloudSave(projectId, data, { skipQueue: true });

      if (!result.success) {
        throw result.error || new Error('Cloud save failed');
      }
    } else {
      console.warn(`[PrimaryCloudSync] Unknown operation type: ${op.type}`);
    }
  });

  console.log('[PrimaryCloudSync] Queue processing complete:', result);
}

/**
 * Get sync status for a project
 */
export function getSyncStatus(projectId: string): {
  hasPendingOperations: boolean;
  queuedOperations: number;
} {
  const operations = offlineQueue.getProjectOperations(projectId);

  return {
    hasPendingOperations: operations.length > 0,
    queuedOperations: operations.length,
  };
}

export default primaryCloudSave;
