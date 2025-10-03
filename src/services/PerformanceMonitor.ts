/**
 * PerformanceMonitor - Tracks system health and prevents performance regression
 * CRITICAL: Ensures Lighthouse scores improve and system stays responsive
 */

import React from 'react';

export interface PerformanceMetrics {
  timestamp: number;
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  bundleSize?: number;
  apiResponseTimes: Record<string, number>;
  errorCount: number;
}

export interface PerformanceThresholds {
  pageLoad: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  memoryUsage: number;
  apiResponseTime: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 100;
  
  // Performance thresholds based on Lighthouse recommendations
  private readonly thresholds: PerformanceThresholds = {
    pageLoad: 3000, // 3 seconds
    firstContentfulPaint: 1800, // 1.8 seconds
    largestContentfulPaint: 2500, // 2.5 seconds
    cumulativeLayoutShift: 0.1, // 0.1 or less
    firstInputDelay: 100, // 100ms
    memoryUsage: 50 * 1024 * 1024, // 50MB
    apiResponseTime: 2000 // 2 seconds
  };

  private observers: PerformanceObserver[] = [];
  private startTime = performance.now();

  private constructor() {
    this.initializeObservers();
    this.startPeriodicCollection();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record API response time
   */
  recordApiCall(endpoint: string, responseTime: number): void {
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics.apiResponseTimes[endpoint] = responseTime;
    
    // Alert if response time exceeds threshold
    if (responseTime > this.thresholds.apiResponseTime) {
      console.warn(`⚠️ Slow API response: ${endpoint} took ${responseTime}ms`);
      this.reportPerformanceIssue('slow_api', { endpoint, responseTime });
    }
  }

  /**
   * Record error occurrence
   */
  recordError(error: Error, context?: string): void {
    const currentMetrics = this.getCurrentMetrics();
    currentMetrics.errorCount++;
    
    console.error('Performance Monitor - Error recorded:', {
      error: error.message,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * Get current performance status
   */
  getPerformanceStatus(): {
    status: 'good' | 'warning' | 'critical';
    score: number;
    issues: string[];
    metrics: PerformanceMetrics;
  } {
    const latest = this.getLatestMetrics();
    const issues: string[] = [];
    let score = 100;

    // Check each threshold
    if (latest.pageLoad > this.thresholds.pageLoad) {
      issues.push(`Page load slow: ${latest.pageLoad}ms`);
      score -= 20;
    }

    if (latest.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      issues.push(`FCP slow: ${latest.firstContentfulPaint}ms`);
      score -= 15;
    }

    if (latest.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      issues.push(`LCP slow: ${latest.largestContentfulPaint}ms`);
      score -= 20;
    }

    if (latest.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      issues.push(`Layout shift high: ${latest.cumulativeLayoutShift}`);
      score -= 15;
    }

    if (latest.firstInputDelay > this.thresholds.firstInputDelay) {
      issues.push(`Input delay high: ${latest.firstInputDelay}ms`);
      score -= 15;
    }

    if (latest.memoryUsage > this.thresholds.memoryUsage) {
      issues.push(`Memory usage high: ${Math.round(latest.memoryUsage / 1024 / 1024)}MB`);
      score -= 10;
    }

    // Check API response times
    Object.entries(latest.apiResponseTimes).forEach(([endpoint, time]) => {
      if (time > this.thresholds.apiResponseTime) {
        issues.push(`${endpoint} API slow: ${time}ms`);
        score -= 5;
      }
    });

    const status = score >= 80 ? 'good' : score >= 60 ? 'warning' : 'critical';

    return {
      status,
      score: Math.max(0, score),
      issues,
      metrics: latest
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: any;
    trends: any;
    recommendations: string[];
  } {
    const recentMetrics = this.metrics.slice(-10);
    const summary = this.getPerformanceStatus();
    
    const trends = this.analyzeTrends(recentMetrics);
    const recommendations = this.generateRecommendations(summary, trends);

    return {
      summary,
      trends,
      recommendations
    };
  }

  /**
   * Start performance measurement for a specific operation
   */
  startMeasurement(name: string): () => number {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      console.log(`📊 Performance: ${name} took ${duration.toFixed(2)}ms`);
      return duration;
    };
  }

  // Private methods

  private initializeObservers(): void {
    try {
      // Observe navigation timing
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.processNavigationEntry(entry as PerformanceNavigationTiming);
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Observe paint timing
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPaintEntry(entry);
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // Observe layout shift
        const layoutObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processLayoutShiftEntry(entry);
          }
        });
        layoutObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutObserver);
      }
    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = this.getCurrentMetrics();
    metrics.pageLoad = entry.loadEventEnd - entry.loadEventStart;
  }

  private processPaintEntry(entry: PerformanceEntry): void {
    const metrics = this.getCurrentMetrics();
    
    if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime;
    }
  }

  private processLayoutShiftEntry(entry: any): void {
    const metrics = this.getCurrentMetrics();
    
    // Only count unexpected layout shifts
    if (!entry.hadRecentInput) {
      metrics.cumulativeLayoutShift += entry.value;
    }
  }

  private getCurrentMetrics(): PerformanceMetrics {
    if (this.metrics.length === 0 || 
        Date.now() - this.metrics[this.metrics.length - 1].timestamp > 5000) {
      this.metrics.push({
        timestamp: Date.now(),
        pageLoad: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        memoryUsage: this.getMemoryUsage(),
        apiResponseTimes: {},
        errorCount: 0
      });

      // Keep only recent metrics
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }
    }

    return this.metrics[this.metrics.length - 1];
  }

  private getLatestMetrics(): PerformanceMetrics {
    return this.metrics[this.metrics.length - 1] || this.getCurrentMetrics();
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0;
    }
    return 0;
  }

  private startPeriodicCollection(): void {
    setInterval(() => {
      this.collectMetrics();
    }, 10000); // Collect every 10 seconds
  }

  private collectMetrics(): void {
    const metrics = this.getCurrentMetrics();
    
    // Update memory usage
    metrics.memoryUsage = this.getMemoryUsage();
    
    // Check for performance issues
    const status = this.getPerformanceStatus();
    if (status.status === 'critical') {
      console.warn('🚨 Critical performance issues detected:', status.issues);
      this.reportPerformanceIssue('critical_performance', status);
    }
  }

  private analyzeTrends(metrics: PerformanceMetrics[]): any {
    if (metrics.length < 2) {return null;}

    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];

    return {
      pageLoadTrend: latest.pageLoad - previous.pageLoad,
      memoryTrend: latest.memoryUsage - previous.memoryUsage,
      errorTrend: latest.errorCount - previous.errorCount
    };
  }

  private generateRecommendations(summary: any, trends: any): string[] {
    const recommendations: string[] = [];

    if (summary.metrics.pageLoad > this.thresholds.pageLoad) {
      recommendations.push('Consider implementing lazy loading for images and components');
      recommendations.push('Optimize bundle size by removing unused code');
    }

    if (summary.metrics.memoryUsage > this.thresholds.memoryUsage) {
      recommendations.push('Check for memory leaks in event listeners and intervals');
      recommendations.push('Optimize state management to reduce memory footprint');
    }

    if (summary.metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      recommendations.push('Set explicit dimensions for images and media');
      recommendations.push('Reserve space for dynamic content');
    }

    if (trends?.errorTrend > 0) {
      recommendations.push('Investigate recent error increases');
      recommendations.push('Improve error boundaries and handling');
    }

    return recommendations;
  }

  private reportPerformanceIssue(type: string, data: any): void {
    // In a real application, this would send to monitoring service
    console.warn(`Performance Issue [${type}]:`, data);
    
    // Could integrate with services like:
    // - Sentry for error tracking
    // - DataDog for performance monitoring
    // - Custom analytics endpoint
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [status, setStatus] = React.useState(performanceMonitor.getPerformanceStatus());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(performanceMonitor.getPerformanceStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}

export default PerformanceMonitor;