/**
 * Spacing Configuration
 * Standardized spacing system for consistent layout
 * Based on 4px base unit for mathematical harmony
 */

export const spacing = {
  // Base spacing units (4px increments)
  base: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
  },

  // Component-specific padding
  padding: {
    // Buttons
    button: {
      xs: 'px-2 py-1',      // 8px x 4px
      sm: 'px-3 py-1.5',    // 12px x 6px
      md: 'px-4 py-2',      // 16px x 8px
      lg: 'px-5 py-2.5',    // 20px x 10px
      xl: 'px-6 py-3',      // 24px x 12px
    },
    
    // Cards
    card: {
      sm: 'p-4',            // 16px
      md: 'p-6',            // 24px
      lg: 'p-8',            // 32px
      xl: 'p-10',           // 40px
    },
    
    // Sections
    section: {
      sm: 'py-8 px-4',      // 32px y, 16px x
      md: 'py-12 px-6',     // 48px y, 24px x
      lg: 'py-16 px-8',     // 64px y, 32px x
      xl: 'py-20 px-10',    // 80px y, 40px x
    },
    
    // Inputs
    input: {
      sm: 'px-2.5 py-1.5',  // 10px x 6px
      md: 'px-3 py-2',      // 12px x 8px
      lg: 'px-4 py-2.5',    // 16px x 10px
    },
    
    // Chat specific
    chat: {
      bubble: 'px-4 py-3',  // 16px x 12px
      message: 'px-6 py-5', // 24px x 20px
      input: 'px-4 py-3',   // 16px x 12px
    },
  },

  // Component-specific margins
  margin: {
    // Between elements
    between: {
      xs: 'space-y-1',      // 4px
      sm: 'space-y-2',      // 8px
      md: 'space-y-3',      // 12px
      lg: 'space-y-4',      // 16px
      xl: 'space-y-6',      // 24px
      '2xl': 'space-y-8',   // 32px
    },
    
    // Stack spacing (vertical rhythm)
    stack: {
      xs: 'mb-1',           // 4px
      sm: 'mb-2',           // 8px
      md: 'mb-3',           // 12px
      lg: 'mb-4',           // 16px
      xl: 'mb-6',           // 24px
      '2xl': 'mb-8',        // 32px
    },
    
    // Inline spacing (horizontal)
    inline: {
      xs: 'mr-1',           // 4px
      sm: 'mr-2',           // 8px
      md: 'mr-3',           // 12px
      lg: 'mr-4',           // 16px
      xl: 'mr-6',           // 24px
    },
  },

  // Gap utilities for flexbox/grid
  gap: {
    xs: 'gap-1',            // 4px
    sm: 'gap-2',            // 8px
    md: 'gap-3',            // 12px
    lg: 'gap-4',            // 16px
    xl: 'gap-6',            // 24px
    '2xl': 'gap-8',         // 32px
    '3xl': 'gap-12',        // 48px
  },

  // Container widths
  container: {
    xs: 'max-w-xs',         // 320px
    sm: 'max-w-sm',         // 384px
    md: 'max-w-md',         // 448px
    lg: 'max-w-lg',         // 512px
    xl: 'max-w-xl',         // 576px
    '2xl': 'max-w-2xl',     // 672px
    '3xl': 'max-w-3xl',     // 768px
    '4xl': 'max-w-4xl',     // 896px
    '5xl': 'max-w-5xl',     // 1024px
    '6xl': 'max-w-6xl',     // 1152px
    '7xl': 'max-w-7xl',     // 1280px
    full: 'max-w-full',     // 100%
    prose: 'max-w-prose',   // 65ch
  },
};

// Predefined spacing combinations for common patterns
export const spacingPatterns = {
  // Page layouts
  page: {
    default: 'px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
    narrow: 'px-4 sm:px-6 py-6 sm:py-8',
    wide: 'px-6 sm:px-8 lg:px-12 py-10 sm:py-16',
  },
  
  // Component layouts
  component: {
    card: 'p-6 rounded-xl',
    cardCompact: 'p-4 rounded-lg',
    cardSpaciou: 'p-8 rounded-2xl',
    
    modal: 'p-6 sm:p-8',
    modalHeader: 'pb-4 border-b border-gray-200 dark:border-gray-700',
    modalBody: 'py-6',
    modalFooter: 'pt-4 border-t border-gray-200 dark:border-gray-700',
    
    form: 'space-y-4',
    formGroup: 'space-y-2',
    formActions: 'pt-6 flex gap-3 justify-end',
  },
  
  // Chat specific patterns
  chat: {
    container: 'flex h-screen',
    sidebar: 'w-64 lg:w-80 border-r border-gray-200 dark:border-gray-800',
    mainArea: 'flex-1 flex flex-col',
    messagesArea: 'flex-1 overflow-y-auto px-4 py-6',
    messageGroup: 'space-y-4',
    inputArea: 'border-t border-gray-200 dark:border-gray-800 p-4',
    stageCard: 'max-w-4xl mx-auto p-6',
    suggestion: 'p-4 rounded-lg hover:shadow-md transition-shadow',
  },
  
  // Navigation patterns
  nav: {
    header: 'px-4 sm:px-6 lg:px-8 py-4',
    sidebar: 'p-4 space-y-1',
    breadcrumb: 'px-4 py-2',
    tabs: 'px-4 space-x-8',
  },
};

// Helper function to combine spacing classes
export const getSpacing = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Responsive spacing helper
export const responsiveSpacing = (
  mobile: string,
  tablet?: string,
  desktop?: string
): string => {
  const classes = [mobile];
  if (tablet) classes.push(`sm:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
};

export default spacing;