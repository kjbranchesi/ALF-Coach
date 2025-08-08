/**
 * Performance monitoring and optimization utilities
 */

// Performance observer for monitoring Core Web Vitals
export class PerformanceMonitor {
  private observers: PerformanceObserver[] = [];
  private metrics: Record<string, number> = {};

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.debug('LCP:', this.metrics.lcp);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.debug('LCP observer not supported');
    }

    // Observe First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          console.debug('FID:', this.metrics.fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (e) {
      console.debug('FID observer not supported');
    }

    // Observe Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.cls = clsValue;
            console.debug('CLS:', this.metrics.cls);
          }
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    } catch (e) {
      console.debug('CLS observer not supported');
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Throttle function for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Lazy load images with intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset.src;
              
              if (src) {
                img.src = src;
                img.classList.add('loaded');
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );
    }
  }

  observe(element: HTMLImageElement) {
    if (this.observer && element.dataset.src) {
      this.observer.observe(element);
    }
  }

  cleanup() {
    this.observer?.disconnect();
  }
}

// Memory leak detector
export class MemoryLeakDetector {
  private intervals: Set<NodeJS.Timeout> = new Set();
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private listeners: Map<EventTarget, Map<string, EventListener>> = new Map();

  trackInterval(id: NodeJS.Timeout) {
    this.intervals.add(id);
  }

  trackTimeout(id: NodeJS.Timeout) {
    this.timeouts.add(id);
  }

  trackEventListener(target: EventTarget, event: string, listener: EventListener) {
    if (!this.listeners.has(target)) {
      this.listeners.set(target, new Map());
    }
    this.listeners.get(target)?.set(event, listener);
  }

  cleanup() {
    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // Clear all timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();

    // Remove all event listeners
    this.listeners.forEach((events, target) => {
      events.forEach((listener, event) => {
        target.removeEventListener(event, listener);
      });
    });
    this.listeners.clear();
  }

  getStatus() {
    return {
      activeIntervals: this.intervals.size,
      activeTimeouts: this.timeouts.size,
      activeListeners: Array.from(this.listeners.values()).reduce(
        (sum, map) => sum + map.size,
        0
      )
    };
  }
}

// Request animation frame throttle
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
    
    rafId = requestAnimationFrame(() => {
      func.apply(context, args);
      rafId = null;
    });
  };
}

// Memoization for expensive computations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  maxCacheSize: number = 100
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    
    // Limit cache size
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  }) as T;
}

// Virtual scrolling helper
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
}

export function calculateVisibleItems<T>(
  items: T[],
  scrollTop: number,
  options: VirtualScrollOptions
): { visibleItems: T[]; startIndex: number; endIndex: number } {
  const { itemHeight, containerHeight, buffer = 3 } = options;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + buffer
  );
  
  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex
  };
}

// Preload critical resources
export function preloadResources(urls: string[]) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}

// Check if device has low-end hardware
export function isLowEndDevice(): boolean {
  // Check for memory
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Check for CPU cores
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;
  
  // Check for connection speed
  const connection = (navigator as any).connection;
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return true;
  }
  
  return false;
}

// Adaptive quality based on device capabilities
export function getAdaptiveQuality() {
  if (isLowEndDevice()) {
    return {
      animations: false,
      shadows: false,
      blur: false,
      particleEffects: false,
      imageQuality: 'low',
      videoQuality: '360p'
    };
  }
  
  return {
    animations: true,
    shadows: true,
    blur: true,
    particleEffects: true,
    imageQuality: 'high',
    videoQuality: '1080p'
  };
}