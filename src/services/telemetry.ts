/**
 * Simple Telemetry Service
 *
 * Lightweight tracking for critical operations to ensure observability
 * in cloud-first architecture rollout.
 *
 * Tracks:
 * - Save/load success rates
 * - Latency metrics
 * - Error codes and frequencies
 * - Source attribution (cache/cloud/offline)
 */

export interface TelemetryEvent {
  event: 'save_project' | 'load_project' | 'sync_error' | 'conflict_detected' | 'cache_hit' | 'cache_miss' | 'ai_prompt' | 'ai_fallback';
  success: boolean;
  latencyMs: number;
  source?: 'cache' | 'cloud' | 'offline_snapshot' | 'idb' | 'firestore';
  errorCode?: string;
  errorMessage?: string;
  projectId: string; // for AI events, use a label or 'ai'
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface TelemetryStats {
  saveSuccessRate: number;
  loadSuccessRate: number;
  avgSaveLatency: number;
  avgLoadLatency: number;
  cacheHitRate: number;
  errorCodes: Record<string, number>;
  totalEvents: number;
}

class SimpleTelemetry {
  private events: TelemetryEvent[] = [];
  private readonly MAX_EVENTS = 100; // Memory bounded

  /**
   * Track a telemetry event
   */
  track(event: Omit<TelemetryEvent, 'timestamp'>) {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(telemetryEvent);

    // Keep only last MAX_EVENTS (prevent memory leak)
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    // Log in dev mode for debugging
    if (import.meta.env.DEV) {
      const icon = event.success ? '✅' : '❌';
      console.log(`[Telemetry] ${icon} ${event.event}`, {
        success: event.success,
        latency: `${event.latencyMs}ms`,
        source: event.source,
        errorCode: event.errorCode,
        projectId: event.projectId.slice(0, 8)
      });
    }

    // Send to analytics in production (optional)
    if (import.meta.env.PROD && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.event, {
        success: event.success,
        latency_ms: event.latencyMs,
        source: event.source,
        error_code: event.errorCode,
        project_id: event.projectId
      });
    }

    // Also log errors to console even in prod (but sanitized)
    if (!event.success && import.meta.env.PROD) {
      console.error(`[Telemetry] ${event.event} failed:`, {
        code: event.errorCode,
        message: event.errorMessage,
        projectId: event.projectId.slice(0, 8) // Partial ID for privacy
      });
    }
  }

  /**
   * Get aggregated statistics
   */
  getStats(): TelemetryStats {
    const saves = this.events.filter(e => e.event === 'save_project');
    const loads = this.events.filter(e => e.event === 'load_project');
    const cacheEvents = this.events.filter(e => e.event === 'cache_hit' || e.event === 'cache_miss');

    return {
      saveSuccessRate: this.successRate(saves),
      loadSuccessRate: this.successRate(loads),
      avgSaveLatency: this.avgLatency(saves),
      avgLoadLatency: this.avgLatency(loads),
      cacheHitRate: this.cacheHitRate(cacheEvents),
      errorCodes: this.errorCodeCounts(),
      totalEvents: this.events.length
    };
  }

  /**
   * Aggregate AI prompt metrics
   */
  getAIMetrics(): { total: number; successRate: number; avgLatency: number; fallbacks: number } {
    const ai = this.events.filter(e => e.event === 'ai_prompt');
    const fb = this.events.filter(e => e.event === 'ai_fallback');
    const total = ai.length;
    const success = ai.filter(e => e.success).length;
    const successRate = total ? Math.round((success / total) * 100) : 100;
    const avgLatency = total ? Math.round(ai.reduce((s, e) => s + e.latencyMs, 0) / total) : 0;
    return { total, successRate, avgLatency, fallbacks: fb.length };
  }

  /**
   * Get recent events (for debug UI)
   */
  getRecentEvents(limit = 20): TelemetryEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear all events (for testing)
   */
  clear() {
    this.events = [];
  }

  /**
   * Export events as JSON (for debugging/support)
   */
  export(): string {
    return JSON.stringify(this.events, null, 2);
  }

  // Private helper methods

  private successRate(events: TelemetryEvent[]): number {
    if (events.length === 0) {return 100;}
    const successes = events.filter(e => e.success).length;
    return Math.round((successes / events.length) * 100);
  }

  private avgLatency(events: TelemetryEvent[]): number {
    if (events.length === 0) {return 0;}
    const sum = events.reduce((acc, e) => acc + e.latencyMs, 0);
    return Math.round(sum / events.length);
  }

  private cacheHitRate(cacheEvents: TelemetryEvent[]): number {
    if (cacheEvents.length === 0) {return 0;}
    const hits = cacheEvents.filter(e => e.event === 'cache_hit').length;
    return Math.round((hits / cacheEvents.length) * 100);
  }

  private errorCodeCounts(): Record<string, number> {
    const errors = this.events.filter(e => !e.success && e.errorCode);
    return errors.reduce((acc, e) => {
      acc[e.errorCode!] = (acc[e.errorCode!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// Singleton instance
export const telemetry = new SimpleTelemetry();

// Helper to measure operation latency
export async function measureAsync<T>(
  fn: () => Promise<T>
): Promise<{ result: T; latencyMs: number }> {
  const startTime = Date.now();
  const result = await fn();
  const latencyMs = Date.now() - startTime;
  return { result, latencyMs };
}
