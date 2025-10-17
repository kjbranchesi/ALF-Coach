/**
 * Cloud Storage Service
 * Optimized Firebase Storage integration with retry logic, exponential backoff,
 * and comprehensive error handling for production use.
 */

import { storage, auth, isOfflineMode } from '../../firebase/firebase';
import { ref, uploadString, getDownloadURL, listAll, deleteObject, getMetadata } from 'firebase/storage';
import { CloudError, CloudErrorCode, CloudErrorFactory, CloudErrorTelemetry } from './CloudErrors';

export interface CloudBlobPointer {
  storage: 'cloud';
  path: string;
  sizeKB: number;
  uploadedAt: string;
  downloadURL?: string;
  etag?: string; // For cache validation
}

export interface UploadOptions {
  maxRetries?: number;
  timeoutMs?: number;
  validateUpload?: boolean;
  onProgress?: (progress: number) => void;
}

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs: number;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterMs: 500,
};

/**
 * Retry executor with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
  context: { operation: string; projectId?: string }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Convert to CloudError if not already
      const cloudError = error instanceof CloudError
        ? error
        : CloudErrorFactory.fromFirebaseError(error, context.operation, {
            attemptNumber: attempt,
            maxAttempts: options.maxAttempts,
            projectId: context.projectId,
          });

      // Record error for telemetry
      CloudErrorTelemetry.record(cloudError);

      // Don't retry if error is not retryable
      if (!cloudError.isRetryable) {
        throw cloudError;
      }

      // Don't retry on last attempt
      if (attempt === options.maxAttempts) {
        throw new CloudError(
          CloudErrorCode.OPERATION_RETRY_EXHAUSTED,
          `Operation failed after ${options.maxAttempts} attempts`,
          {
            operation: context.operation,
            attemptNumber: attempt,
            maxAttempts: options.maxAttempts,
            projectId: context.projectId,
          },
          { originalError: cloudError, isRetryable: false }
        );
      }

      // Calculate backoff delay with exponential increase and jitter
      const exponentialDelay = Math.min(
        options.baseDelayMs * Math.pow(options.backoffMultiplier, attempt - 1),
        options.maxDelayMs
      );
      const jitter = Math.random() * options.jitterMs;
      const delay = exponentialDelay + jitter;

      console.warn(
        `[CloudStorageService] Retry attempt ${attempt}/${options.maxAttempts} after ${delay.toFixed(0)}ms`,
        { error: cloudError.code, operation: context.operation }
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but TypeScript requires it
  throw lastError || new Error('Retry failed');
}

/**
 * Generate storage path
 */
function generatePath(userId: string, projectId: string, kind: 'showcase' | 'hero'): string {
  return `users/${userId}/projects/${projectId}/${kind}.json`;
}

/**
 * Generate snapshot folder path
 */
function generateSnapshotPath(userId: string, projectId: string, kind: 'showcase' | 'hero'): string {
  return `users/${userId}/projects/${projectId}/snapshots/${kind}`;
}

export class CloudStorageService {
  /**
   * Upload JSON data to Cloud Storage with retry logic
   */
  static async uploadJSON(
    userId: string,
    projectId: string,
    kind: 'showcase' | 'hero',
    data: unknown,
    options: UploadOptions = {}
  ): Promise<CloudBlobPointer> {
    const operation = `uploadJSON:${kind}`;

    // Pre-flight checks
    if (isOfflineMode || !storage) {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    if (!auth.currentUser) {
      throw CloudErrorFactory.authRequired(operation, { userId, projectId });
    }

    // Serialize data
    let json: string;
    try {
      json = typeof data === 'string' ? data : JSON.stringify(data);
    } catch (error: any) {
      throw new CloudError(
        CloudErrorCode.DATA_SERIALIZATION_FAILED,
        'Failed to serialize data to JSON',
        { operation, userId, projectId },
        { originalError: error, isRetryable: false }
      );
    }

    const dataSize = json.length;

    // Validate size (Cloud Storage limit is 5GB, but we want reasonable limits)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (dataSize > MAX_SIZE) {
      throw new CloudError(
        CloudErrorCode.DATA_TOO_LARGE,
        `Data size ${dataSize} bytes exceeds maximum ${MAX_SIZE} bytes`,
        { operation, userId, projectId, dataSize },
        { isRetryable: false }
      );
    }

    const path = generatePath(userId, projectId, kind);
    const storageRef = ref(storage as any, path);

    // Upload with retry
    await retryWithBackoff(
      async () => {
        await uploadString(storageRef, json, 'raw', {
          contentType: 'application/json',
          customMetadata: {
            projectId,
            kind,
            sizeBytes: dataSize.toString(),
            uploadedBy: userId,
          },
        });
      },
      {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: options.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxAttempts,
      },
      { operation, projectId }
    );

    // Validate upload if requested
    if (options.validateUpload) {
      await retryWithBackoff(
        async () => {
          const metadata = await getMetadata(storageRef);
          if (!metadata) {
            throw new Error('Upload validation failed: metadata not found');
          }
        },
        { ...DEFAULT_RETRY_OPTIONS, maxAttempts: 3 },
        { operation: `${operation}:validate`, projectId }
      );
    }

    // Get download URL
    let downloadURL: string | undefined;
    try {
      downloadURL = await retryWithBackoff(
        async () => await getDownloadURL(storageRef),
        { ...DEFAULT_RETRY_OPTIONS, maxAttempts: 3 },
        { operation: `${operation}:getURL`, projectId }
      );
    } catch (error) {
      // Non-critical - we can get URL later
      console.warn('[CloudStorageService] Failed to get download URL', error);
    }

    const pointer: CloudBlobPointer = {
      storage: 'cloud',
      path,
      sizeKB: Math.round(dataSize / 1024),
      uploadedAt: new Date().toISOString(),
      downloadURL,
    };

    console.log(`[CloudStorageService] Upload successful: ${path} (${pointer.sizeKB} KB)`);
    return pointer;
  }

  /**
   * Download JSON data from Cloud Storage
   */
  static async downloadJSON(pointer: CloudBlobPointer, options: UploadOptions = {}): Promise<any> {
    const operation = 'downloadJSON';

    if (isOfflineMode || !storage) {
      throw CloudErrorFactory.networkOffline(operation, {});
    }

    return await retryWithBackoff(
      async () => {
        // Try using cached download URL first
        let url = pointer.downloadURL;

        // If no cached URL, get a fresh one
        if (!url) {
          const storageRef = ref(storage as any, pointer.path);
          url = await getDownloadURL(storageRef);
        }

        // Fetch the data
        const controller = new AbortController();
        const timeoutId = options.timeoutMs
          ? setTimeout(() => controller.abort(), options.timeoutMs)
          : null;

        try {
          const response = await fetch(url, {
            signal: controller.signal,
            cache: 'no-store', // Always get fresh data
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.json();
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      },
      {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: options.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxAttempts,
      },
      { operation }
    );
  }

  /**
   * Upload a snapshot (versioned backup)
   */
  static async uploadSnapshot(
    userId: string,
    projectId: string,
    kind: 'showcase' | 'hero',
    data: unknown,
    options: UploadOptions = {}
  ): Promise<string> {
    const operation = `uploadSnapshot:${kind}`;

    if (isOfflineMode || !storage) {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    if (!auth.currentUser) {
      throw CloudErrorFactory.authRequired(operation, { userId, projectId });
    }

    // Serialize data
    let json: string;
    try {
      json = typeof data === 'string' ? data : JSON.stringify(data);
    } catch (error: any) {
      throw new CloudError(
        CloudErrorCode.DATA_SERIALIZATION_FAILED,
        'Failed to serialize snapshot data',
        { operation, userId, projectId },
        { originalError: error, isRetryable: false }
      );
    }

    // Generate timestamped path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const folder = generateSnapshotPath(userId, projectId, kind);
    const path = `${folder}/${timestamp}.json`;
    const storageRef = ref(storage as any, path);

    // Upload with retry
    await retryWithBackoff(
      async () => {
        await uploadString(storageRef, json, 'raw', {
          contentType: 'application/json',
          customMetadata: {
            projectId,
            kind,
            snapshotType: 'auto',
            sizeBytes: json.length.toString(),
          },
        });
      },
      {
        ...DEFAULT_RETRY_OPTIONS,
        maxAttempts: options.maxRetries ?? DEFAULT_RETRY_OPTIONS.maxAttempts,
      },
      { operation, projectId }
    );

    console.log(`[CloudStorageService] Snapshot uploaded: ${path}`);
    return path;
  }

  /**
   * Trim old snapshots to keep only recent N snapshots
   */
  static async trimSnapshots(
    userId: string,
    projectId: string,
    kind: 'showcase' | 'hero',
    maxKeep: number = 10
  ): Promise<number> {
    const operation = 'trimSnapshots';

    if (isOfflineMode || !storage) {
      // Silent fail - trimming is not critical
      return 0;
    }

    try {
      const folder = generateSnapshotPath(userId, projectId, kind);
      const folderRef = ref(storage as any, folder);

      // List all snapshots
      const listing = await retryWithBackoff(
        async () => await listAll(folderRef),
        { ...DEFAULT_RETRY_OPTIONS, maxAttempts: 3 },
        { operation, projectId }
      );

      const items = listing.items || [];

      if (items.length <= maxKeep) {
        return 0;
      }

      // Sort by name descending (ISO timestamps → newest first)
      const sorted = [...items].sort((a, b) => b.name.localeCompare(a.name));
      const toDelete = sorted.slice(maxKeep);

      // Delete old snapshots (best effort)
      const results = await Promise.allSettled(
        toDelete.map(item => deleteObject(item))
      );

      const deleted = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[CloudStorageService] Trimmed ${deleted}/${toDelete.length} snapshots`);

      return deleted;
    } catch (error: any) {
      // Non-critical - log and continue
      console.warn('[CloudStorageService] Snapshot trim failed', error);
      return 0;
    }
  }

  /**
   * Delete all data for a project
   */
  static async deleteProject(
    userId: string,
    projectId: string
  ): Promise<void> {
    const operation = 'deleteProject';

    if (isOfflineMode || !storage) {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    const paths = [
      generatePath(userId, projectId, 'showcase'),
      generatePath(userId, projectId, 'hero'),
    ];

    // Delete main files
    for (const path of paths) {
      try {
        const fileRef = ref(storage as any, path);
        await retryWithBackoff(
          async () => await deleteObject(fileRef),
          { ...DEFAULT_RETRY_OPTIONS, maxAttempts: 3 },
          { operation, projectId }
        );
      } catch (error) {
        // Continue on error - file may not exist
        console.warn(`[CloudStorageService] Failed to delete ${path}`, error);
      }
    }

    // Delete snapshots
    const snapshotKinds: Array<'showcase' | 'hero'> = ['showcase', 'hero'];
    for (const kind of snapshotKinds) {
      try {
        const folder = generateSnapshotPath(userId, projectId, kind);
        const folderRef = ref(storage as any, folder);
        const listing = await listAll(folderRef);

        await Promise.allSettled(
          listing.items.map(item => deleteObject(item))
        );
      } catch (error) {
        console.warn(`[CloudStorageService] Failed to delete ${kind} snapshots`, error);
      }
    }

    console.log(`[CloudStorageService] Project deleted: ${projectId}`);
  }

  /**
   * Get storage statistics for a project
   */
  static async getProjectStats(
    userId: string,
    projectId: string
  ): Promise<{
    totalSizeKB: number;
    fileCount: number;
    files: Array<{ path: string; sizeKB: number; updated: string }>;
  }> {
    const operation = 'getProjectStats';

    if (isOfflineMode || !storage) {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    const paths = [
      generatePath(userId, projectId, 'showcase'),
      generatePath(userId, projectId, 'hero'),
    ];

    const files: Array<{ path: string; sizeKB: number; updated: string }> = [];
    let totalSizeKB = 0;

    for (const path of paths) {
      try {
        const fileRef = ref(storage as any, path);
        const metadata = await getMetadata(fileRef);

        const sizeKB = Math.round((metadata.size || 0) / 1024);
        totalSizeKB += sizeKB;

        files.push({
          path,
          sizeKB,
          updated: metadata.updated || metadata.timeCreated || '',
        });
      } catch (error) {
        // File doesn't exist - skip
      }
    }

    return {
      totalSizeKB,
      fileCount: files.length,
      files,
    };
  }
}

export default CloudStorageService;
