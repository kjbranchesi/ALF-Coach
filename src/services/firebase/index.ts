/**
 * Firebase Integration - Cloud-First Architecture
 *
 * Comprehensive Firebase integration with optimizations for production use:
 * - Primary cloud sync (replaces background sync)
 * - Intelligent retry logic with exponential backoff
 * - Offline queue for failed operations
 * - Smart caching with LRU eviction
 * - Optimized Firestore writes with batching
 * - Cloud Storage for large data
 * - Comprehensive error handling
 */

// Error handling
export {
  CloudError,
  CloudErrorCode,
  CloudErrorFactory,
  CloudErrorTelemetry,
  type CloudErrorContext,
} from './CloudErrors';

// Cloud Storage
export {
  CloudStorageService,
  type CloudBlobPointer,
  type UploadOptions,
  type RetryOptions,
} from './CloudStorageService';

// Firestore operations
export {
  OptimizedFirestore,
  type FirestoreWriteOptions,
  type BatchOperation,
} from './OptimizedFirestore';

// Primary sync
export {
  primaryCloudSave,
  processOfflineQueue,
  getSyncStatus,
  type CloudSaveResult,
  type CloudSaveOptions,
} from './PrimaryCloudSync';

// Offline queue
export {
  OfflineQueue,
  offlineQueue,
  type QueuedOperation,
  type QueueStats,
  type ProcessResult,
} from './OfflineQueue';

// Caching
export {
  CloudCache,
  ShowcaseCache,
  URLCache,
  showcaseCache,
  urlCache,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
} from './CloudCache';
