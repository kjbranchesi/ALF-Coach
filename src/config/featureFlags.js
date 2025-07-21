// Feature flags for gradual rollout of new features
const isDev = typeof import !== 'undefined' && import.meta?.env?.DEV;
const enableRecovery = typeof import !== 'undefined' && import.meta?.env?.VITE_ENABLE_RECOVERY === 'true';

export const FEATURE_FLAGS = {
  // Conversation recovery system
  CONVERSATION_RECOVERY: isDev || enableRecovery,
  
  // Enhanced error handling
  ENHANCED_ERROR_HANDLING: true,
  
  // Debug mode for conversation flow
  CONVERSATION_DEBUG: isDev,
  
  // State persistence middleware 
  STATE_PERSISTENCE: true
};

export const isFeatureEnabled = (flag) => {
  return FEATURE_FLAGS[flag] || false;
};