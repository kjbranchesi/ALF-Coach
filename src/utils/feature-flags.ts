/**
 * Feature flags for controlling bundle-heavy features
 * Allows gradual optimization without breaking changes
 */

// Global feature flags
export const FEATURE_FLAGS = {
  // Heavy syntax highlighting - enable only for power users or specific contexts
  HEAVY_SYNTAX_HIGHLIGHTING: import.meta.env.VITE_HEAVY_SYNTAX_HIGHLIGHTING === 'true',
  
  // PDF export features - lazy load by default
  PDF_EXPORTS: true,
  
  // Lottie animations - can be disabled for performance
  LOTTIE_ANIMATIONS: import.meta.env.VITE_LOTTIE_ANIMATIONS !== 'false',
  
  // Icon optimization - use optimized icons instead of full lucide library
  OPTIMIZED_ICONS: import.meta.env.VITE_OPTIMIZED_ICONS !== 'false',
  
  // Bundle analysis mode - helpful for development
  BUNDLE_ANALYSIS: import.meta.env.VITE_BUNDLE_ANALYSIS === 'true'
} as const;

// Context-aware feature flags
export const getContextualFeatureFlags = (context: 'chat' | 'dashboard' | 'export' | 'landing') => {
  const baseFlags = FEATURE_FLAGS;
  
  switch (context) {
    case 'chat':
      return {
        ...baseFlags,
        // Enable heavy syntax highlighting in chat if user needs it
        HEAVY_SYNTAX_HIGHLIGHTING: baseFlags.HEAVY_SYNTAX_HIGHLIGHTING || hasCodeBlocks(),
      };
      
    case 'export':
      return {
        ...baseFlags,
        // Always enable PDF exports in export context
        PDF_EXPORTS: true,
        HEAVY_SYNTAX_HIGHLIGHTING: true, // For high-quality exports
      };
      
    case 'landing':
      return {
        ...baseFlags,
        // Disable heavy features on landing page
        HEAVY_SYNTAX_HIGHLIGHTING: false,
        PDF_EXPORTS: false,
        LOTTIE_ANIMATIONS: baseFlags.LOTTIE_ANIMATIONS && !isLowEndDevice(),
      };
      
    default:
      return baseFlags;
  }
};

// Helper functions
function hasCodeBlocks(): boolean {
  // Check if current session has code blocks that would benefit from heavy highlighting
  const hasComplexCode = sessionStorage.getItem('has_complex_code') === 'true';
  return hasComplexCode;
}

function isLowEndDevice(): boolean {
  // Simple device capability detection
  return navigator.hardwareConcurrency <= 2 || 
         (navigator as any).deviceMemory <= 4 ||
         navigator.connection?.effectiveType === '2g';
}

// Performance monitoring
export const trackFeatureUsage = (feature: keyof typeof FEATURE_FLAGS, used: boolean) => {
  if (FEATURE_FLAGS.BUNDLE_ANALYSIS) {
    console.log(`Feature ${feature}: ${used ? 'used' : 'skipped'}`);
    // Could send to analytics in production
  }
};