/**
 * Cloud Cache
 * Smart caching layer with LRU eviction, prefetching, and memory management.
 * Optimizes cloud data access with intelligent cache invalidation.
 */

export interface CacheEntry<T> {
  key: string;
  data: T;
  cachedAt: number;
  accessCount: number;
  lastAccessedAt: number;
  sizeBytes: number;
  etag?: string;
}

export interface CacheOptions {
  maxSizeBytes?: number;
  maxEntries?: number;
  ttlMs?: number; // Time to live
  lruEvictionThreshold?: number; // Percentage of max size before eviction
}

export interface CacheStats {
  entries: number;
  sizeBytes: number;
  maxSizeBytes: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  evictions: number;
  oldestEntry?: string;
  mostAccessed?: string;
}

const DEFAULT_OPTIONS: Required<CacheOptions> = {
  maxSizeBytes: 50 * 1024 * 1024, // 50MB
  maxEntries: 500,
  ttlMs: 30 * 60 * 1000, // 30 minutes
  lruEvictionThreshold: 0.9, // Evict when 90% full
};

export class CloudCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<CacheOptions>;
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    evictions: 0,
  };

  // Prefetch queue
  private prefetchQueue: Set<string> = new Set();
  private prefetching = false;

  constructor(options: CacheOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Get cached data
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.totalMisses++;
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.cachedAt;
    if (age > this.options.ttlMs) {
      this.cache.delete(key);
      this.stats.totalMisses++;
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessedAt = Date.now();
    this.stats.totalHits++;

    return entry.data;
  }

  /**
   * Set cached data
   */
  set(key: string, data: T, options?: { etag?: string }): void {
    // Calculate size
    const sizeBytes = this.estimateSize(data);

    // Check if we need to evict
    const currentSize = this.getCurrentSize();
    const threshold = this.options.maxSizeBytes * this.options.lruEvictionThreshold;

    if (currentSize + sizeBytes > threshold) {
      this.evictLRU(sizeBytes);
    }

    // Create entry
    const entry: CacheEntry<T> = {
      key,
      data,
      cachedAt: Date.now(),
      accessCount: 0,
      lastAccessedAt: Date.now(),
      sizeBytes,
      etag: options?.etag,
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {return false;}

    // Check expiration
    const age = Date.now() - entry.cachedAt;
    if (age > this.options.ttlMs) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Invalidate entries matching pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.prefetchQueue.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const sizeBytes = entries.reduce((sum, e) => sum + e.sizeBytes, 0);

    const hitRate = this.stats.totalHits + this.stats.totalMisses > 0
      ? this.stats.totalHits / (this.stats.totalHits + this.stats.totalMisses)
      : 0;

    let oldestEntry: string | undefined;
    let mostAccessed: string | undefined;

    if (entries.length > 0) {
      // Find oldest
      const oldest = entries.reduce((min, e) =>
        e.cachedAt < min.cachedAt ? e : min
      );
      oldestEntry = oldest.key;

      // Find most accessed
      const mostUsed = entries.reduce((max, e) =>
        e.accessCount > max.accessCount ? e : max
      );
      mostAccessed = mostUsed.key;
    }

    return {
      entries: this.cache.size,
      sizeBytes,
      maxSizeBytes: this.options.maxSizeBytes,
      hitRate,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      evictions: this.stats.evictions,
      oldestEntry,
      mostAccessed,
    };
  }

  /**
   * Prefetch data (to be called with fetcher function)
   */
  async prefetch(
    keys: string[],
    fetcher: (key: string) => Promise<T>
  ): Promise<void> {
    // Add to prefetch queue
    for (const key of keys) {
      if (!this.has(key)) {
        this.prefetchQueue.add(key);
      }
    }

    // Start prefetching if not already running
    if (!this.prefetching) {
      this.processPrefetchQueue(fetcher);
    }
  }

  /**
   * Get cached entry with metadata
   */
  getEntry(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    // Check expiration
    const age = Date.now() - entry.cachedAt;
    if (age > this.options.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return { ...entry };
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size in bytes
   */
  private getCurrentSize(): number {
    let total = 0;
    for (const entry of this.cache.values()) {
      total += entry.sizeBytes;
    }
    return total;
  }

  /**
   * Estimate size of data in bytes
   */
  private estimateSize(data: T): number {
    try {
      const json = JSON.stringify(data);
      // Account for UTF-16 encoding (2 bytes per character)
      return json.length * 2;
    } catch {
      // Fallback estimate
      return 1024; // 1KB default
    }
  }

  /**
   * Evict least recently used entries to make room
   */
  private evictLRU(requiredBytes: number): void {
    console.log(`[CloudCache] Evicting entries to free ${requiredBytes} bytes...`);

    // Sort by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessedAt - b.entry.lastAccessedAt);

    let freedBytes = 0;
    let evictedCount = 0;

    for (const { key } of entries) {
      if (freedBytes >= requiredBytes) {break;}

      const entry = this.cache.get(key);
      if (entry) {
        freedBytes += entry.sizeBytes;
        this.cache.delete(key);
        evictedCount++;
        this.stats.evictions++;
      }
    }

    console.log(`[CloudCache] Evicted ${evictedCount} entries (${freedBytes} bytes freed)`);
  }

  /**
   * Process prefetch queue in background
   */
  private async processPrefetchQueue(
    fetcher: (key: string) => Promise<T>
  ): Promise<void> {
    this.prefetching = true;

    try {
      while (this.prefetchQueue.size > 0) {
        // Take next key
        const [key] = this.prefetchQueue;
        this.prefetchQueue.delete(key);

        // Skip if already cached
        if (this.has(key)) {
          continue;
        }

        try {
          const data = await fetcher(key);
          this.set(key, data);
        } catch (error) {
          console.warn(`[CloudCache] Prefetch failed for ${key}`, error);
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.prefetching = false;
    }
  }
}

/**
 * Specialized cache for showcase data with intelligent prefetching
 */
export class ShowcaseCache extends CloudCache<any> {
  constructor() {
    super({
      maxSizeBytes: 100 * 1024 * 1024, // 100MB for showcases
      maxEntries: 200,
      ttlMs: 60 * 60 * 1000, // 1 hour
      lruEvictionThreshold: 0.85,
    });
  }

  /**
   * Generate cache key for showcase
   */
  static generateKey(userId: string, projectId: string): string {
    return `showcase:${userId}:${projectId}`;
  }

  /**
   * Get showcase from cache
   */
  getShowcase(userId: string, projectId: string): any | null {
    return this.get(ShowcaseCache.generateKey(userId, projectId));
  }

  /**
   * Cache showcase data
   */
  setShowcase(userId: string, projectId: string, data: any, etag?: string): void {
    this.set(ShowcaseCache.generateKey(userId, projectId), data, { etag });
  }

  /**
   * Invalidate showcase cache
   */
  invalidateShowcase(userId: string, projectId: string): boolean {
    return this.invalidate(ShowcaseCache.generateKey(userId, projectId));
  }

  /**
   * Prefetch showcases for multiple projects
   */
  async prefetchShowcases(
    items: Array<{ userId: string; projectId: string }>,
    fetcher: (userId: string, projectId: string) => Promise<any>
  ): Promise<void> {
    const keys = items.map(({ userId, projectId }) =>
      ShowcaseCache.generateKey(userId, projectId)
    );

    await this.prefetch(keys, async (key) => {
      const [, userId, projectId] = key.split(':');
      return await fetcher(userId, projectId);
    });
  }
}

/**
 * Specialized cache for download URLs
 */
export class URLCache extends CloudCache<string> {
  constructor() {
    super({
      maxSizeBytes: 5 * 1024 * 1024, // 5MB (URLs are small)
      maxEntries: 1000,
      ttlMs: 50 * 60 * 1000, // 50 minutes (URLs expire after 1 hour)
      lruEvictionThreshold: 0.9,
    });
  }

  /**
   * Generate cache key for URL
   */
  static generateKey(storagePath: string): string {
    return `url:${storagePath}`;
  }

  /**
   * Get download URL from cache
   */
  getURL(storagePath: string): string | null {
    return this.get(URLCache.generateKey(storagePath));
  }

  /**
   * Cache download URL
   */
  setURL(storagePath: string, url: string): void {
    this.set(URLCache.generateKey(storagePath), url);
  }
}

// Export singleton instances
export const showcaseCache = new ShowcaseCache();
export const urlCache = new URLCache();
