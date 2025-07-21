// Feature flags for gradual rollout of new features
export const FEATURE_FLAGS = {
  // Conversation recovery system
  CONVERSATION_RECOVERY: process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENABLE_RECOVERY === 'true',
  
  // Enhanced error handling
  ENHANCED_ERROR_HANDLING: true,
  
  // Debug mode for conversation flow
  CONVERSATION_DEBUG: process.env.NODE_ENV === 'development',
  
  // State persistence middleware 
  STATE_PERSISTENCE: true
};

export const isFeatureEnabled = (flag) => {
  return FEATURE_FLAGS[flag] || false;
};