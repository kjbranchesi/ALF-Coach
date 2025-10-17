/**
 * Async Mutex (Mutual Exclusion Lock)
 *
 * Prevents race conditions by ensuring only one async operation per key
 * can execute at a time. Other operations wait in queue.
 *
 * Use cases:
 * - Prevent overlapping sync operations on the same project
 * - Ensure atomic save sequences (upload → update pointer)
 * - Avoid concurrent IDB reads/writes causing corruption
 *
 * Example:
 * ```typescript
 * const mutex = new AsyncMutex();
 *
 * // Multiple rapid calls to save same project
 * mutex.runExclusive('project-123', async () => {
 *   await uploadToStorage();
 *   await updateFirestore();
 * });
 * ```
 */

interface QueuedOperation<T> {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class AsyncMutex {
  private locks = new Map<string, Promise<void>>();
  private queues = new Map<string, QueuedOperation<any>[]>();

  /**
   * Run a function exclusively (with mutex lock)
   *
   * @param key - Unique identifier for the lock (e.g., project ID)
   * @param fn - Async function to execute exclusively
   * @returns Promise that resolves with function result
   */
  async runExclusive<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // If lock exists, queue this operation
    if (this.locks.has(key)) {
      return this.enqueue(key, fn);
    }

    // Acquire lock
    return this.acquireLockAndExecute(key, fn);
  }

  /**
   * Check if a key is currently locked
   */
  isLocked(key: string): boolean {
    return this.locks.has(key);
  }

  /**
   * Get count of queued operations for a key
   */
  getQueueLength(key: string): number {
    return this.queues.get(key)?.length || 0;
  }

  /**
   * Clear all locks (for testing only)
   */
  clearAll() {
    this.locks.clear();
    this.queues.clear();
  }

  // Private methods

  private async acquireLockAndExecute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    let release: () => void;
    const lockPromise = new Promise<void>(resolve => {
      release = resolve;
    });

    this.locks.set(key, lockPromise);

    try {
      const result = await fn();
      return result;
    } finally {
      // Release lock
      this.locks.delete(key);
      release!();

      // Process next in queue
      await this.processQueue(key);
    }
  }

  private enqueue<T>(key: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.queues.has(key)) {
        this.queues.set(key, []);
      }

      this.queues.get(key)!.push({
        execute: fn,
        resolve,
        reject
      });

      // Log queue depth in dev
      if (import.meta.env.DEV) {
        const queueLength = this.queues.get(key)!.length;
        if (queueLength > 2) {
          console.warn(
            `[AsyncMutex] Queue depth for "${key}" is ${queueLength}. ` +
            `Possible performance issue or excessive saves.`
          );
        }
      }
    });
  }

  private async processQueue(key: string) {
    const queue = this.queues.get(key);
    if (!queue || queue.length === 0) {
      this.queues.delete(key);
      return;
    }

    // Get next operation from queue
    const next = queue.shift()!;

    // Execute with lock
    try {
      const result = await this.acquireLockAndExecute(key, next.execute);
      next.resolve(result);
    } catch (error) {
      next.reject(error);
    }
  }
}

/**
 * Global sync mutex for project save operations
 */
export const syncMutex = new AsyncMutex();

/**
 * Debounced mutex execution
 *
 * Combines mutex locking with debouncing to reduce rapid-fire operations.
 * Useful for auto-save scenarios.
 *
 * @param key - Lock key
 * @param fn - Function to execute
 * @param delayMs - Debounce delay in milliseconds
 */
export class DebouncedMutex extends AsyncMutex {
  private timers = new Map<string, number>();

  async runDebounced<T>(
    key: string,
    fn: () => Promise<T>,
    delayMs: number
  ): Promise<T> {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }

    // Create new promise that resolves after delay
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(async () => {
        this.timers.delete(key);

        try {
          const result = await this.runExclusive(key, fn);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);

      this.timers.set(key, timer);
    });
  }

  clearTimer(key: string) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
      this.timers.delete(key);
    }
  }

  clearAllTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

/**
 * Global debounced mutex for auto-save operations
 */
export const autoSaveMutex = new DebouncedMutex();
