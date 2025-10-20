// Feature flags for gradual rollout of new features
export const FEATURE_FLAGS = {
  // Conversation recovery system
  CONVERSATION_RECOVERY: import.meta.env.DEV || import.meta.env.VITE_ENABLE_RECOVERY === 'true',

  // Enhanced error handling
  ENHANCED_ERROR_HANDLING: true,

  // Debug mode for conversation flow
  CONVERSATION_DEBUG: import.meta.env.DEV,

  // State persistence middleware
  STATE_PERSISTENCE: true
};

export const isFeatureEnabled = (flag) => {
  return FEATURE_FLAGS[flag] || false;
};

// Phase A: Cloud-first architecture feature flags
export const featureFlags = {
  // Cloud-first reads (Phase A)
  cloudFirstReads: import.meta.env.VITE_CLOUD_FIRST_READS === 'true',

  // Cloud-first writes (Phase B - not yet enabled)
  cloudFirstWrites: import.meta.env.VITE_CLOUD_FIRST_WRITES === 'true',

  // Offline snapshot compression (enabled by default)
  enableOfflineSnapshot: import.meta.env.VITE_ENABLE_OFFLINE_SNAPSHOT !== 'false',

  // IndexedDB fallback (enabled by default)
  enableIDBFallback: import.meta.env.VITE_ENABLE_IDB_FALLBACK !== 'false'
};