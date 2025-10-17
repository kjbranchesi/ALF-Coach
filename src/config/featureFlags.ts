/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for gradual rollout of cloud-first architecture.
 * Flags can be controlled via environment variables or runtime overrides.
 *
 * Usage:
 * ```typescript
 * import { featureFlags } from './config/featureFlags';
 *
 * if (featureFlags.cloudFirstReads) {
 *   // Use CloudProjectService
 * } else {
 *   // Use legacy UnifiedStorageManager
 * }
 * ```
 *
 * Environment Variables:
 * - VITE_CLOUD_FIRST_READS=true/false
 * - VITE_CLOUD_FIRST_WRITES=true/false
 * - VITE_ENABLE_IDB_FALLBACK=true/false
 * - VITE_REVIEW_DEBUG=true/false
 * - VITE_SUPPRESS_ERRORS=true/false
 */

interface FeatureFlags {
  // Phase A: Cloud-first reads
  cloudFirstReads: boolean;

  // Phase B: Cloud-first writes
  cloudFirstWrites: boolean;

  // IDB fallback (keep during pilot)
  enableIDBFallback: boolean;

  // Offline snapshot (compressed localStorage fallback)
  enableOfflineSnapshot: boolean;

  // Debug UI and verbose logging
  reviewDebug: boolean;

  // Error suppression (should be OFF in pilot)
  suppressErrors: boolean;
  suppressFirebaseErrors: boolean;

  // Telemetry
  enableTelemetry: boolean;

  // Sync status UI
  showSyncStatus: boolean;
}

/**
 * Default feature flag values
 * Safe defaults: conservative, backward-compatible
 */
const DEFAULT_FLAGS: FeatureFlags = {
  cloudFirstReads: false,        // Off by default (opt-in for testing)
  cloudFirstWrites: false,       // Off by default (Phase B)
  enableIDBFallback: true,       // Keep IDB during pilot
  enableOfflineSnapshot: true,   // Always on (safety net)
  reviewDebug: false,            // Off in production
  suppressErrors: false,         // Show all errors (critical for debugging)
  suppressFirebaseErrors: false, // Show Firebase errors
  enableTelemetry: true,         // Always collect metrics
  showSyncStatus: true           // Always show sync status to users
};

/**
 * Parse environment variable as boolean
 */
function envBool(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) {return defaultValue;}
  return value === 'true' || value === '1';
}

/**
 * Load feature flags from environment variables
 */
function loadFeatureFlags(): FeatureFlags {
  return {
    cloudFirstReads: envBool('VITE_CLOUD_FIRST_READS', DEFAULT_FLAGS.cloudFirstReads),
    cloudFirstWrites: envBool('VITE_CLOUD_FIRST_WRITES', DEFAULT_FLAGS.cloudFirstWrites),
    enableIDBFallback: envBool('VITE_ENABLE_IDB_FALLBACK', DEFAULT_FLAGS.enableIDBFallback),
    enableOfflineSnapshot: envBool('VITE_ENABLE_OFFLINE_SNAPSHOT', DEFAULT_FLAGS.enableOfflineSnapshot),
    reviewDebug: envBool('VITE_REVIEW_DEBUG', DEFAULT_FLAGS.reviewDebug),
    suppressErrors: envBool('VITE_SUPPRESS_ERRORS', DEFAULT_FLAGS.suppressErrors),
    suppressFirebaseErrors: envBool('VITE_SUPPRESS_FIREBASE_ERRORS', DEFAULT_FLAGS.suppressFirebaseErrors),
    enableTelemetry: envBool('VITE_ENABLE_TELEMETRY', DEFAULT_FLAGS.enableTelemetry),
    showSyncStatus: envBool('VITE_SHOW_SYNC_STATUS', DEFAULT_FLAGS.showSyncStatus)
  };
}

/**
 * Global feature flags instance
 */
export const featureFlags = loadFeatureFlags();

/**
 * Runtime feature flag overrides (for testing)
 * Only works in development mode
 */
export const overrideFeatureFlag = (flag: keyof FeatureFlags, value: boolean) => {
  if (import.meta.env.DEV) {
    (featureFlags as any)[flag] = value;
    console.log(`[FeatureFlags] Override: ${flag} = ${value}`);
  } else {
    console.warn('[FeatureFlags] Runtime overrides only work in development');
  }
};

/**
 * Get all feature flags (for debug UI)
 */
export const getFeatureFlags = (): FeatureFlags => {
  return { ...featureFlags };
};

/**
 * Check if in pilot mode (cloud-first enabled)
 */
export const isPilotMode = (): boolean => {
  return featureFlags.cloudFirstReads || featureFlags.cloudFirstWrites;
};

/**
 * Validate feature flag consistency
 * Warns if flags are in invalid combination
 */
export const validateFeatureFlags = () => {
  const warnings: string[] = [];

  // Cloud-first writes requires cloud-first reads
  if (featureFlags.cloudFirstWrites && !featureFlags.cloudFirstReads) {
    warnings.push('cloudFirstWrites enabled but cloudFirstReads disabled - reads will be inconsistent');
  }

  // Error suppression in pilot mode is dangerous
  if (isPilotMode() && (featureFlags.suppressErrors || featureFlags.suppressFirebaseErrors)) {
    warnings.push('Error suppression enabled in pilot mode - debugging will be difficult');
  }

  // No fallback enabled
  if (!featureFlags.enableIDBFallback && !featureFlags.enableOfflineSnapshot) {
    warnings.push('No offline fallback enabled - data loss risk on network failure');
  }

  if (warnings.length > 0) {
    console.warn('[FeatureFlags] Configuration warnings:', warnings);
  }

  return warnings;
};

/**
 * Log feature flag status on app start
 */
if (typeof window !== 'undefined') {
  console.log('[FeatureFlags] Configuration loaded:', {
    ...featureFlags,
    isPilotMode: isPilotMode(),
    environment: import.meta.env.MODE
  });

  // Validate on load
  validateFeatureFlags();
}

/**
 * React hook for feature flags
 *
 * Usage:
 * ```tsx
 * const flags = useFeatureFlags();
 * if (flags.cloudFirstReads) {
 *   // Cloud-first logic
 * }
 * ```
 */
export function useFeatureFlags(): FeatureFlags {
  return featureFlags;
}
