/**
 * Offline Queue Service
 *
 * Persists failed save operations and retries when connectivity returns.
 * Handles queue management, deduplication, and exponential backoff.
 *
 * Features:
 * - localStorage persistence (survives tab close)
 * - FIFO queue with deduplication (latest write wins)
 * - Exponential backoff retry strategy
 * - Queue size limits with overflow handling
 * - Integration with SyncStatusManager
 * - Telemetry tracking for all operations
 *
 * Architecture:
 * 1. Operation queued → persisted to localStorage
 * 2. Online event → processQueue() with backoff
 * 3. Success → remove from queue, update sync status
 * 4. Failure → increment retry count, schedule next retry
 * 5. Max retries → move to dead letter queue
 *
 * Usage:
 * ```typescript
 * // Queue a failed save
 * await offlineQueue.enqueue({
 *   projectId,
 *   showcase,
 *   operation: 'save',
 *   localRev
 * });
 *
 * // Process queue when back online
 * await offlineQueue.processQueue();
 * ```
 */

import { syncStatusManager } from './SyncStatusManager';
import { cloudProjectService } from './CloudProjectService';
import { telemetry } from './telemetry';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';

/**
 * Queued operation types
 */
export type QueuedOperationType = 'save' | 'delete';

/**
 * Queued operation metadata
 */
export interface QueuedOperation {
  id: string; // Unique operation ID
  projectId: string;
  operation: QueuedOperationType;
  showcase?: ProjectShowcaseV2; // For save operations
  localRev?: number; // Local revision at queue time
  queuedAt: number; // Timestamp when queued
  retryCount: number; // Number of retry attempts
  nextRetryAt?: number; // Timestamp for next retry
  lastError?: string; // Last error message
}

/**
 * Queue configuration
 */
interface QueueConfig {
  maxRetries: number; // Max retry attempts before dead letter
  maxQueueSize: number; // Max operations in queue
  baseRetryDelayMs: number; // Base delay for exponential backoff
  maxRetryDelayMs: number; // Cap on retry delay
  processIntervalMs: number; // Auto-process interval when online
}

/**
 * Default queue configuration
 */
const DEFAULT_CONFIG: QueueConfig = {
  maxRetries: 5,
  maxQueueSize: 50,
  baseRetryDelayMs: 2000, // Start with 2s
  maxRetryDelayMs: 60000, // Cap at 1 minute
  processIntervalMs: 10000 // Check every 10s when online
};

/**
 * Offline Queue Service
 *
 * Manages queued operations with persistence and auto-retry
 */
class OfflineQueue {
  private readonly STORAGE_KEY = 'alf_offline_queue';
  private readonly DEAD_LETTER_KEY = 'alf_offline_queue_dead';
  private readonly config: QueueConfig = DEFAULT_CONFIG;

  private queue: QueuedOperation[] = [];
  private deadLetterQueue: QueuedOperation[] = [];
  private isProcessing = false;
  private processInterval?: number;
  private isOnline = navigator.onLine;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
    this.startAutoProcess();

    console.log('[OfflineQueue] Initialized with', this.queue.length, 'queued operations');
  }

  /**
   * Enqueue a failed save operation
   *
   * @param operation - Operation to queue
   * @returns Operation ID
   */
  async enqueue(
    projectId: string,
    operation: QueuedOperationType,
    data: { showcase?: ProjectShowcaseV2; localRev?: number }
  ): Promise<string> {
    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      console.error('[OfflineQueue] Queue full, rejecting operation');
      telemetry.track({
        event: 'sync_error',
        success: false,
        latencyMs: 0,
        errorCode: 'QUEUE_FULL',
        errorMessage: 'Offline queue full',
        projectId
      });

      throw new Error('Offline queue is full. Please try again later.');
    }

    // Deduplicate: Remove any existing operations for this project
    // (latest write wins)
    this.queue = this.queue.filter(op => op.projectId !== projectId);

    // Create operation
    const queuedOp: QueuedOperation = {
      id: `${projectId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      projectId,
      operation,
      showcase: data.showcase,
      localRev: data.localRev,
      queuedAt: Date.now(),
      retryCount: 0
    };

    // Add to queue
    this.queue.push(queuedOp);
    this.persistQueue();

    // Update sync status
    syncStatusManager.setStatus(projectId, 'offline', {
      queuedChanges: this.getQueuedChangesCount(projectId)
    });

    console.log(
      `[OfflineQueue] Queued ${operation} for project ${projectId.slice(0, 8)} ` +
      `(queue size: ${this.queue.length})`
    );

    telemetry.track({
      event: 'sync_error',
      success: false,
      latencyMs: 0,
      errorCode: 'QUEUED_OFFLINE',
      errorMessage: 'Operation queued for retry',
      projectId
    });

    return queuedOp.id;
  }

  /**
   * Process all queued operations
   *
   * Respects retry delays and handles failures gracefully
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('[OfflineQueue] Already processing, skipping');
      return;
    }

    if (!this.isOnline) {
      console.log('[OfflineQueue] Offline, skipping queue processing');
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`[OfflineQueue] Processing ${this.queue.length} queued operations`);

    const operations = [...this.queue];
    const now = Date.now();

    for (const op of operations) {
      // Check if retry delay has elapsed
      if (op.nextRetryAt && now < op.nextRetryAt) {
        console.log(
          `[OfflineQueue] Skipping ${op.id} (retry in ` +
          `${Math.round((op.nextRetryAt - now) / 1000)}s)`
        );
        continue;
      }

      try {
        await this.processOperation(op);
      } catch (error) {
        console.error(`[OfflineQueue] Failed to process ${op.id}:`, error);
        // Continue processing other operations
      }
    }

    this.isProcessing = false;
  }

  /**
   * Process a single queued operation
   */
  private async processOperation(op: QueuedOperation): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(
        `[OfflineQueue] Processing ${op.operation} for ${op.projectId.slice(0, 8)} ` +
        `(attempt ${op.retryCount + 1}/${this.config.maxRetries})`
      );

      // Update sync status
      syncStatusManager.setStatus(op.projectId, 'syncing');

      // Execute operation
      if (op.operation === 'save' && op.showcase) {
        const result = await cloudProjectService.saveShowcase(
          op.projectId,
          op.showcase,
          { forceOverwrite: false }
        );

        if (!result.success) {
          throw new Error(result.error?.message || 'Save failed');
        }

        // Success!
        this.removeFromQueue(op.id);

        syncStatusManager.setStatus(op.projectId, 'synced', {
          rev: result.rev
        });

        telemetry.track({
          event: 'save_project',
          success: true,
          latencyMs: Date.now() - startTime,
          source: 'offline_queue',
          projectId: op.projectId
        });

        console.log(
          `[OfflineQueue] ✅ Successfully processed ${op.id} ` +
          `(rev ${result.rev}, ${Date.now() - startTime}ms)`
        );
      }
    } catch (error) {
      // Operation failed - handle retry logic
      await this.handleOperationFailure(op, error as Error);
    }
  }

  /**
   * Handle operation failure with retry logic
   */
  private async handleOperationFailure(op: QueuedOperation, error: Error): Promise<void> {
    op.retryCount++;
    op.lastError = error.message;

    // Check if max retries exceeded
    if (op.retryCount >= this.config.maxRetries) {
      console.error(
        `[OfflineQueue] ❌ Max retries exceeded for ${op.id}, ` +
        `moving to dead letter queue`
      );

      // Move to dead letter queue
      this.removeFromQueue(op.id);
      this.deadLetterQueue.push(op);
      this.persistDeadLetterQueue();

      // Update sync status with error
      syncStatusManager.setStatus(op.projectId, 'error', {
        error: {
          code: 'MAX_RETRIES_EXCEEDED',
          message: `Failed after ${op.retryCount} attempts: ${error.message}`,
          timestamp: Date.now()
        }
      });

      telemetry.track({
        event: 'sync_error',
        success: false,
        latencyMs: 0,
        errorCode: 'MAX_RETRIES_EXCEEDED',
        errorMessage: error.message,
        projectId: op.projectId
      });

      return;
    }

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.config.baseRetryDelayMs * Math.pow(2, op.retryCount - 1),
      this.config.maxRetryDelayMs
    );

    op.nextRetryAt = Date.now() + delay;

    console.warn(
      `[OfflineQueue] Retry ${op.retryCount}/${this.config.maxRetries} ` +
      `for ${op.id} in ${Math.round(delay / 1000)}s: ${error.message}`
    );

    // Update queue
    this.persistQueue();

    // Update sync status
    syncStatusManager.setStatus(op.projectId, 'error', {
      error: {
        code: 'RETRY_PENDING',
        message: `Retrying in ${Math.round(delay / 1000)}s`,
        timestamp: Date.now()
      },
      queuedChanges: this.getQueuedChangesCount(op.projectId)
    });

    telemetry.track({
      event: 'sync_error',
      success: false,
      latencyMs: 0,
      errorCode: 'RETRY_SCHEDULED',
      errorMessage: error.message,
      projectId: op.projectId
    });
  }

  /**
   * Remove operation from queue
   */
  private removeFromQueue(operationId: string): void {
    this.queue = this.queue.filter(op => op.id !== operationId);
    this.persistQueue();
  }

  /**
   * Get number of queued changes for a project
   */
  private getQueuedChangesCount(projectId: string): number {
    return this.queue.filter(op => op.projectId === projectId).length;
  }

  /**
   * Get all queued operations (for debugging)
   */
  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  /**
   * Get dead letter queue (for debugging/recovery)
   */
  getDeadLetterQueue(): QueuedOperation[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queuedOperations: this.queue.length,
      deadLetterOperations: this.deadLetterQueue.length,
      isProcessing: this.isProcessing,
      isOnline: this.isOnline,
      oldestOperation: this.queue[0]?.queuedAt
        ? Date.now() - this.queue[0].queuedAt
        : 0
    };
  }

  /**
   * Retry a specific operation manually
   */
  async retryOperation(operationId: string): Promise<void> {
    const op = this.queue.find(op => op.id === operationId);

    if (!op) {
      throw new Error(`Operation ${operationId} not found in queue`);
    }

    // Reset retry delay
    op.nextRetryAt = undefined;

    await this.processOperation(op);
  }

  /**
   * Clear dead letter queue (user action)
   */
  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
    this.persistDeadLetterQueue();
    console.log('[OfflineQueue] Dead letter queue cleared');
  }

  /**
   * Persist queue to localStorage
   */
  private persistQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to persist queue:', error);
    }
  }

  /**
   * Persist dead letter queue to localStorage
   */
  private persistDeadLetterQueue(): void {
    try {
      localStorage.setItem(this.DEAD_LETTER_KEY, JSON.stringify(this.deadLetterQueue));
    } catch (error) {
      console.error('[OfflineQueue] Failed to persist dead letter queue:', error);
    }
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const queueData = localStorage.getItem(this.STORAGE_KEY);
      if (queueData) {
        this.queue = JSON.parse(queueData);
        console.log(`[OfflineQueue] Loaded ${this.queue.length} operations from storage`);
      }

      const deadLetterData = localStorage.getItem(this.DEAD_LETTER_KEY);
      if (deadLetterData) {
        this.deadLetterQueue = JSON.parse(deadLetterData);
        console.log(
          `[OfflineQueue] Loaded ${this.deadLetterQueue.length} dead letter operations`
        );
      }
    } catch (error) {
      console.error('[OfflineQueue] Failed to load queue:', error);
      this.queue = [];
      this.deadLetterQueue = [];
    }
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      console.log('[OfflineQueue] Network connection restored');
      this.isOnline = true;

      // Process queue immediately
      this.processQueue().catch(err => {
        console.error('[OfflineQueue] Failed to process queue after coming online:', err);
      });
    });

    window.addEventListener('offline', () => {
      console.log('[OfflineQueue] Network connection lost');
      this.isOnline = false;
    });
  }

  /**
   * Start auto-process timer
   */
  private startAutoProcess(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
    }

    this.processInterval = window.setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.processQueue().catch(err => {
          console.error('[OfflineQueue] Auto-process failed:', err);
        });
      }
    }, this.config.processIntervalMs);

    console.log(
      `[OfflineQueue] Auto-process enabled (every ${this.config.processIntervalMs / 1000}s)`
    );
  }

  /**
   * Stop auto-process timer (for cleanup)
   */
  destroy(): void {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = undefined;
    }
  }
}

/**
 * Singleton instance
 */
export const offlineQueue = new OfflineQueue();
