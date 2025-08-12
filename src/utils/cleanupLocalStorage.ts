/**
 * LocalStorage Cleanup Utility
 * Removes old/deprecated keys from localStorage
 */

export function cleanupLocalStorage() {
  const keysToRemove = [
    // Old journey versions
    'journey-v4-',
    'journey-v3-',
    'journey-v2-',
    
    // Old onboarding keys
    'alfOnboardingCompleted',
    'onboardingComplete',
    
    // Old debug flags
    'debug-',
    'test-',
    
    // Old ideation keys
    'ideation-v1-',
    'conversational-ideation-',
    
    // Old form data
    'form-data-',
    'wizard-state-'
  ];

  let removedCount = 0;
  
  // Get all localStorage keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Check if key should be removed
    for (const pattern of keysToRemove) {
      if (key.startsWith(pattern)) {
        localStorage.removeItem(key);
        removedCount++;
        console.log(`Removed deprecated localStorage key: ${key}`);
        break;
      }
    }
  }
  
  if (removedCount > 0) {
    console.log(`✅ Cleaned up ${removedCount} deprecated localStorage keys`);
  }
  
  return removedCount;
}

/**
 * Get active localStorage keys (for debugging)
 */
export function getActiveLocalStorageKeys(): string[] {
  const activeKeys = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      activeKeys.push(key);
    }
  }
  
  return activeKeys;
}

/**
 * Standardize onboarding key
 */
export function standardizeOnboardingKey() {
  // Check for old onboarding keys
  const oldKeys = ['alfOnboardingCompleted', 'onboardingComplete'];
  const standardKey = 'alf-onboarding-complete';
  
  for (const oldKey of oldKeys) {
    if (localStorage.getItem(oldKey)) {
      // Migrate to standard key
      localStorage.setItem(standardKey, 'true');
      localStorage.removeItem(oldKey);
      console.log(`Migrated onboarding key: ${oldKey} → ${standardKey}`);
    }
  }
}