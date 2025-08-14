/**
 * Memory Management Utilities for ALF Coach
 * Prevents memory leaks and manages resource cleanup
 */

interface PerformanceMetrics {
  memoryUsage: number;
  activeListeners: number;
  cacheSize: number;
  lastCleanup: Date;
}

class MemoryManager {
  private listeners: Set<() => void> = new Set();
  private timers: Set<number> = new Set();
  private intervals: Set<number> = new Set();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private cleanupInterval: number;
  
  // Performance monitoring
  private metrics: PerformanceMetrics = {
    memoryUsage: 0,
    activeListeners: 0,
    cacheSize: 0,
    lastCleanup: new Date()
  };

  constructor() {
    // Clean up cache every 5 minutes
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupExpiredCache();
      this.updateMetrics();
    }, 5 * 60 * 1000);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  /**
   * Register a cleanup function to be called when component unmounts
   */
  public registerCleanup(cleanupFn: () => void): () => void {
    this.listeners.add(cleanupFn);
    this.updateMetrics();
    
    return () => {
      this.listeners.delete(cleanupFn);
      this.updateMetrics();
    };
  }

  /**
   * Create a managed timeout that will be automatically cleaned up
   */
  public setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      callback();
      this.timers.delete(id);
      this.updateMetrics();
    }, delay);
    
    this.timers.add(id);
    this.updateMetrics();
    return id;
  }

  /**
   * Create a managed interval that will be automatically cleaned up
   */
  public setInterval(callback: () => void, delay: number): number {
    const id = window.setInterval(callback, delay);
    this.intervals.add(id);
    this.updateMetrics();
    return id;
  }

  /**
   * Clear a managed timeout
   */
  public clearTimeout(id: number): void {
    window.clearTimeout(id);
    this.timers.delete(id);
    this.updateMetrics();
  }

  /**
   * Clear a managed interval
   */
  public clearInterval(id: number): void {
    window.clearInterval(id);
    this.intervals.delete(id);
    this.updateMetrics();
  }

  /**
   * Cache data with TTL (time to live)
   */
  public setCache(key: string, data: any, ttlMs: number = 10 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
    this.updateMetrics();
  }

  /**
   * Get cached data if not expired
   */
  public getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.updateMetrics();
      return null;
    }
    
    return cached.data as T;
  }

  /**
   * Clear specific cache entry
   */
  public clearCache(key: string): void {
    this.cache.delete(key);
    this.updateMetrics();
  }

  /**
   * Clear all cached data
   */
  public clearAllCache(): void {
    this.cache.clear();
    this.updateMetrics();
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    this.updateMetrics();
    return { ...this.metrics };
  }

  /**
   * Force cleanup of expired cache entries
   */
  public cleanupExpiredCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.debug(`Cleaned up ${cleaned} expired cache entries`);
      this.updateMetrics();
    }
  }

  /**
   * Check if memory usage is getting high
   */
  public isMemoryHigh(): boolean {
    if (!('memory' in performance)) return false;
    
    const memInfo = (performance as any).memory;
    if (!memInfo) return false;
    
    // Alert if using more than 80% of available memory
    const usageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
    return usageRatio > 0.8;
  }

  /**
   * Get memory usage information
   */
  public getMemoryInfo(): any {
    if (!('memory' in performance)) {
      return { available: false };
    }
    
    const memInfo = (performance as any).memory;
    if (!memInfo) return { available: false };
    
    return {
      available: true,
      used: memInfo.usedJSHeapSize,
      total: memInfo.totalJSHeapSize,
      limit: memInfo.jsHeapSizeLimit,
      usagePercentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
    };
  }

  /**
   * Force garbage collection if available (Chrome DevTools)
   */
  public forceGC(): void {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      console.debug('Forcing garbage collection...');
      (window as any).gc();
    }
  }

  /**
   * Clean up all managed resources
   */
  public cleanup(): void {
    // Call all registered cleanup functions
    this.listeners.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (error) {
        console.error('Cleanup function error:', error);
      }
    });
    this.listeners.clear();

    // Clear all timers
    this.timers.forEach(id => window.clearTimeout(id));
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach(id => window.clearInterval(id));
    this.intervals.clear();

    // Clear cache
    this.cache.clear();

    // Clear the cleanup interval
    if (this.cleanupInterval) {
      window.clearInterval(this.cleanupInterval);
    }

    this.updateMetrics();
  }

  private updateMetrics(): void {
    const memInfo = this.getMemoryInfo();
    
    this.metrics = {
      memoryUsage: memInfo.available ? memInfo.usagePercentage : 0,
      activeListeners: this.listeners.size,
      cacheSize: this.cache.size,
      lastCleanup: new Date()
    };
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();

/**
 * Hook for component-level memory management
 */
export function useMemoryManager() {
  const registerCleanup = (cleanupFn: () => void) => {
    return memoryManager.registerCleanup(cleanupFn);
  };

  const setCache = (key: string, data: any, ttl?: number) => {
    memoryManager.setCache(key, data, ttl);
  };

  const getCache = <T>(key: string): T | null => {
    return memoryManager.getCache<T>(key);
  };

  const clearCache = (key: string) => {
    memoryManager.clearCache(key);
  };

  return {
    registerCleanup,
    setCache,
    getCache,
    clearCache,
    getMetrics: () => memoryManager.getMetrics(),
    isMemoryHigh: () => memoryManager.isMemoryHigh()
  };
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor() {
  return {
    getMemoryInfo: () => memoryManager.getMemoryInfo(),
    getMetrics: () => memoryManager.getMetrics(),
    isMemoryHigh: () => memoryManager.isMemoryHigh(),
    forceGC: () => memoryManager.forceGC(),
    cleanupCache: () => memoryManager.cleanupExpiredCache()
  };
}