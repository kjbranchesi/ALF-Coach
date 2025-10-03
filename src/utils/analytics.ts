/*
 * Lightweight analytics helper that respects sandboxed/local environments.
 * Will noop when no global tracker is available.
 */

interface AnalyticsPayload {
  [key: string]: unknown;
}

declare global {
  interface Window {
    ALF_ANALYTICS?: {
      track: (event: string, payload?: AnalyticsPayload) => void;
    };
  }
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}): void {
  try {
    if (typeof window !== 'undefined' && window.ALF_ANALYTICS?.track) {
      window.ALF_ANALYTICS.track(event, payload);
      return;
    }

    if (import.meta.env.DEV) {
      console.debug(`[analytics] ${event}`, payload);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[analytics] failed to record event', event, error);
    }
  }
}

export default trackEvent;
