// Feature flags for safe incremental fixes
// Set to true to enable each fix after testing

export const FIX_FLAGS = {
  // Sprint 1: Foundation & Critical Fixes
  USE_FIXED_APP_ARCHITECTURE: false,
  USE_FIXED_ICONS: false,
  USE_ONBOARDING_DATA_PASS: false,
  USE_ERROR_BOUNDARIES: false,
  
  // Ideation Stage Fixes (keep suggestion cards)
  USE_UNBLOCKED_CHAT_INPUT: false,
  USE_ACTION_BUTTONS: false,
  
  // Journey Stage Fixes (replace suggestion cards)
  USE_JOURNEY_PHASE_SELECTOR: false,
  USE_ACTIVITY_BUILDER: false,
  
  // Deliverables Stage Fixes (use forms)
  USE_DELIVERABLES_FORMS: false,
  
  // UI/UX Fixes
  USE_FIXED_DARK_MODE_BUTTON: false,
  USE_SINGLE_GET_STARTED: false,
  USE_FIXED_BLUR_OVERLAY: false,
  USE_ALF_LOADING_MESSAGE: false,
  USE_HIDDEN_COMMUNITY_RESOURCES: false,
  
  // Performance Fixes
  USE_PERFORMANCE_OPTIMIZATIONS: false,
  USE_DEBOUNCED_SAVES: false,
  
  // Sprint 2: Security (Next Session)
  USE_SECURE_FIREBASE_RULES: false,
  USE_ENV_VALIDATION: false,
  
  // Sprint 3: Tech Debt (Future Session)
  USE_TYPESCRIPT_COMPONENTS: false,
  USE_REFACTORED_CHAT: false
};

// Helper to check if a fix is enabled
export const isFixEnabled = (flagName) => {
  return FIX_FLAGS[flagName] === true;
};