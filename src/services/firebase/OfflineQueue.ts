/**
 * Offline Queue
 * Queues failed operations and retries them when connectivity is restored.
 * Persists queue to localStorage for durability across sessions.
 */

import { CloudError, CloudErrorCode, CloudErrorTelemetry } from './CloudErrors';

export interface QueuedOperation {
  id: string;
  type: 'firestore_write' | 'storage_upload' | 'storage_delete' | 'firestore_delete';
  operation: string;
  payload: any;
  context: {
    userId: string;
    projectId: string;
    timestamp: string;
    attemptCount: number;
    lastAttemptAt?: string;
    nextRetryAt?: string;
  };
  priority: 'high' | 'normal' | 'low';
}

export interface QueueStats {
  totalItems: number;
  highPriority: number;
  normalPriority: number;
  lowPriority: number;
  oldestItem?: string;
  newestItem?: string;
}

export interface ProcessResult {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

const STORAGE_KEY = 'alf_offline_queue';
const MAX_QUEUE_SIZE = 1000;
const MAX_ATTEMPTS = 10;
const RETRY_DELAYS = {
  high: 5000,    // 5 seconds
  normal: 30000, // 30 seconds
  low: 60000,    // 1 minute
};

export class OfflineQueue {
  private queue: QueuedOperation[] = [];
  private processing = false;
  private listeners: Set<(stats: QueueStats) => void> = new Set();

  constructor() {
    this.loadQueue();
    this.setupNetworkListeners();
  }

  /**
   * Add operation to queue
   */
  enqueue(operation: Omit<QueuedOperation, 'id' | 'context'>, context: Partial<QueuedOperation['context']>): string {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const queuedOp: QueuedOperation = {
      id,
      ...operation,
      context: {
        userId: context.userId || 'unknown',
        projectId: context.projectId || 'unknown',
        timestamp: new Date().toISOString(),
        attemptCount: 0,
        ...context,
      },
    };

    // Check queue size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest low-priority item
      const lowPriorityIdx = this.queue.findIndex(op => op.priority === 'low');
      if (lowPriorityIdx !== -1) {
        this.queue.splice(lowPriorityIdx, 1);
        console.warn('[OfflineQueue] Queue full, removed oldest low-priority item');
      } else {
        console.error('[OfflineQueue] Queue full, cannot add new operation');
        throw new CloudError(
          CloudErrorCode.STORAGE_QUOTA_EXCEEDED,
          'Offline queue is full',
          { operation: operation.operation },
          { isRetryable: false }
        );
      }
    }

    this.queue.push(queuedOp);
    this.saveQueue();
    this.notifyListeners();

    console.log(`[OfflineQueue] Enqueued: ${operation.operation} (${operation.type}) [${operation.priority}]`);
    return id;
  }

  /**
   * Process queue - attempts to execute all pending operations
   */
  async processQueue(executor: (op: QueuedOperation) => Promise<void>): Promise<ProcessResult> {
    if (this.processing) {
      console.log('[OfflineQueue] Already processing');
      return { processed: 0, succeeded: 0, failed: 0, skipped: 0 };
    }

    this.processing = true;
    console.log(`[OfflineQueue] Processing ${this.queue.length} operations...`);

    const result: ProcessResult = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
    };

    // Sort by priority (high → normal → low) and timestamp
    const sortedQueue = [...this.queue].sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {return priorityDiff;}
      return new Date(a.context.timestamp).getTime() - new Date(b.context.timestamp).getTime();
    });

    const now = Date.now();
    const toProcess: QueuedOperation[] = [];
    const toSkip: string[] = [];

    // Filter operations ready for retry
    for (const op of sortedQueue) {
      // Check if max attempts exceeded
      if (op.context.attemptCount >= MAX_ATTEMPTS) {
        console.warn(`[OfflineQueue] Max attempts exceeded for ${op.id}, removing`);
        toSkip.push(op.id);
        result.skipped++;
        continue;
      }

      // Check if ready for retry
      if (op.context.nextRetryAt && new Date(op.context.nextRetryAt).getTime() > now) {
        result.skipped++;
        continue;
      }

      toProcess.push(op);
    }

    // Remove operations that exceeded max attempts
    this.queue = this.queue.filter(op => !toSkip.includes(op.id));

    // Process operations
    for (const op of toProcess) {
      result.processed++;

      try {
        await executor(op);

        // Success - remove from queue
        this.queue = this.queue.filter(item => item.id !== op.id);
        result.succeeded++;

        console.log(`[OfflineQueue] Successfully processed: ${op.operation}`);
      } catch (error: any) {
        result.failed++;

        // Update attempt count and schedule next retry
        const queuedOp = this.queue.find(item => item.id === op.id);
        if (queuedOp) {
          queuedOp.context.attemptCount++;
          queuedOp.context.lastAttemptAt = new Date().toISOString();

          // Calculate exponential backoff
          const baseDelay = RETRY_DELAYS[queuedOp.priority];
          const exponentialDelay = baseDelay * Math.pow(2, queuedOp.context.attemptCount - 1);
          const maxDelay = 5 * 60 * 1000; // 5 minutes max
          const delay = Math.min(exponentialDelay, maxDelay);

          queuedOp.context.nextRetryAt = new Date(Date.now() + delay).toISOString();

          console.warn(
            `[OfflineQueue] Failed to process ${op.operation} (attempt ${queuedOp.context.attemptCount}/${MAX_ATTEMPTS}), retry at ${queuedOp.context.nextRetryAt}`,
            error
          );
        }

        // Record error
        if (error instanceof CloudError) {
          CloudErrorTelemetry.record(error);
        }
      }
    }

    this.saveQueue();
    this.notifyListeners();
    this.processing = false;

    console.log(`[OfflineQueue] Processing complete:`, result);
    return result;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const stats: QueueStats = {
      totalItems: this.queue.length,
      highPriority: this.queue.filter(op => op.priority === 'high').length,
      normalPriority: this.queue.filter(op => op.priority === 'normal').length,
      lowPriority: this.queue.filter(op => op.priority === 'low').length,
    };

    if (this.queue.length > 0) {
      const timestamps = this.queue.map(op => new Date(op.context.timestamp).getTime());
      stats.oldestItem = new Date(Math.min(...timestamps)).toISOString();
      stats.newestItem = new Date(Math.max(...timestamps)).toISOString();
    }

    return stats;
  }

  /**
   * Get all queued operations
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get operations for a specific project
   */
  getProjectOperations(projectId: string): QueuedOperation[] {
    return this.queue.filter(op => op.context.projectId === projectId);
  }

  /**
   * Remove operation from queue
   */
  remove(operationId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.id !== operationId);

    if (this.queue.length < initialLength) {
      this.saveQueue();
      this.notifyListeners();
      console.log(`[OfflineQueue] Removed operation: ${operationId}`);
      return true;
    }

    return false;
  }

  /**
   * Clear all operations from queue
   */
  clear(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyListeners();
    console.log('[OfflineQueue] Queue cleared');
  }

  /**
   * Clear operations for a specific project
   */
  clearProject(projectId: string): number {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(op => op.context.projectId !== projectId);
    const removed = initialLength - this.queue.length;

    if (removed > 0) {
      this.saveQueue();
      this.notifyListeners();
      console.log(`[OfflineQueue] Cleared ${removed} operations for project ${projectId}`);
    }

    return removed;
  }

  /**
   * Subscribe to queue changes
   */
  subscribe(listener: (stats: QueueStats) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current stats
    listener(this.getStats());

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Check if queue has pending operations
   */
  hasPendingOperations(projectId?: string): boolean {
    if (projectId) {
      return this.queue.some(op => op.context.projectId === projectId);
    }
    return this.queue.length > 0;
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} operations from storage`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue from storage', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to save queue to storage', error);
    }
  }

  /**
   * Notify subscribers of queue changes
   */
  private notifyListeners(): void {
    const stats = this.getStats();
    for (const listener of this.listeners) {
      try {
        listener(stats);
      } catch (error) {
        console.error('[OfflineQueue] Listener error', error);
      }
    }
  }

  /**
   * Setup network event listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') {return;}

    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Network online, queue will be processed automatically');
      // Note: Actual processing is triggered by the sync service
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Network offline, operations will be queued');
    });
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();
