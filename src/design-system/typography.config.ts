/**
 * Typography Configuration
 * Centralized typography system for consistent text styling
 * Based on modern, clean design principles
 */

export const typography = {
  // Font families
  fonts: {
    sans: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    serif: '"Source Serif Pro", Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },

  // Font sizes with line heights
  sizes: {
    // Display sizes
    display: {
      xl: { size: 'text-6xl', lineHeight: 'leading-none', tracking: 'tracking-tight' }, // 60px
      lg: { size: 'text-5xl', lineHeight: 'leading-tight', tracking: 'tracking-tight' }, // 48px
      md: { size: 'text-4xl', lineHeight: 'leading-tight', tracking: 'tracking-tight' }, // 36px
      sm: { size: 'text-3xl', lineHeight: 'leading-tight', tracking: 'tracking-normal' }, // 30px
    },
    
    // Heading sizes
    heading: {
      h1: { size: 'text-3xl', lineHeight: 'leading-tight', tracking: 'tracking-tight' }, // 30px
      h2: { size: 'text-2xl', lineHeight: 'leading-tight', tracking: 'tracking-tight' }, // 24px
      h3: { size: 'text-xl', lineHeight: 'leading-snug', tracking: 'tracking-normal' }, // 20px
      h4: { size: 'text-lg', lineHeight: 'leading-snug', tracking: 'tracking-normal' }, // 18px
      h5: { size: 'text-base', lineHeight: 'leading-normal', tracking: 'tracking-normal' }, // 16px
      h6: { size: 'text-sm', lineHeight: 'leading-normal', tracking: 'tracking-normal' }, // 14px
    },
    
    // Body text sizes
    body: {
      xl: { size: 'text-xl', lineHeight: 'leading-relaxed' }, // 20px
      lg: { size: 'text-lg', lineHeight: 'leading-relaxed' }, // 18px
      md: { size: 'text-base', lineHeight: 'leading-relaxed' }, // 16px
      sm: { size: 'text-sm', lineHeight: 'leading-relaxed' }, // 14px
      xs: { size: 'text-xs', lineHeight: 'leading-relaxed' }, // 12px
    },
    
    // UI text sizes (for buttons, labels, etc.)
    ui: {
      lg: { size: 'text-base', lineHeight: 'leading-tight' }, // 16px
      md: { size: 'text-sm', lineHeight: 'leading-tight' }, // 14px
      sm: { size: 'text-xs', lineHeight: 'leading-tight' }, // 12px
      xs: { size: 'text-[11px]', lineHeight: 'leading-tight' }, // 11px
    },
  },

  // Font weights
  weights: {
    thin: 'font-thin', // 100
    extralight: 'font-extralight', // 200
    light: 'font-light', // 300
    normal: 'font-normal', // 400
    medium: 'font-medium', // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold', // 700
    extrabold: 'font-extrabold', // 800
    black: 'font-black', // 900
  },

  // Text colors
  colors: {
    // Primary text colors
    primary: {
      default: 'text-gray-900 dark:text-gray-100',
      muted: 'text-gray-600 dark:text-gray-400',
      subtle: 'text-gray-500 dark:text-gray-500',
      placeholder: 'text-gray-400 dark:text-gray-600',
    },
    
    // Semantic colors
    semantic: {
      info: 'text-blue-600 dark:text-blue-400',
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-amber-600 dark:text-amber-400',
      error: 'text-red-600 dark:text-red-400',
    },
    
    // Brand colors
    brand: {
      blue: 'text-blue-600 dark:text-blue-400',
      purple: 'text-purple-600 dark:text-purple-400',
      orange: 'text-orange-600 dark:text-orange-400',
    },
  },

  // Utility classes for common text styles
  utilities: {
    // Truncation
    truncate: 'truncate',
    lineClamp1: 'line-clamp-1',
    lineClamp2: 'line-clamp-2',
    lineClamp3: 'line-clamp-3',
    
    // Text alignment
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
    
    // Text transform
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    normalCase: 'normal-case',
    
    // Text decoration
    underline: 'underline',
    noUnderline: 'no-underline',
    lineThrough: 'line-through',
    
    // Word breaking
    breakWords: 'break-words',
    breakAll: 'break-all',
    breakNormal: 'break-normal',
  },
} as const;

// Helper function to combine typography classes
export const getTypographyClass = (
  size: keyof typeof typography.sizes.body | keyof typeof typography.sizes.heading | keyof typeof typography.sizes.display,
  weight: keyof typeof typography.weights = 'normal',
  color: keyof typeof typography.colors.primary = 'default'
): string => {
  // Determine which size category to use
  let sizeClass = '';
  if (size in typography.sizes.body) {
    const bodySize = typography.sizes.body[size as keyof typeof typography.sizes.body];
    sizeClass = `${bodySize.size} ${bodySize.lineHeight}`;
  } else if (size in typography.sizes.heading) {
    const headingSize = typography.sizes.heading[size as keyof typeof typography.sizes.heading];
    sizeClass = `${headingSize.size} ${headingSize.lineHeight} ${headingSize.tracking}`;
  } else if (size in typography.sizes.display) {
    const displaySize = typography.sizes.display[size as keyof typeof typography.sizes.display];
    sizeClass = `${displaySize.size} ${displaySize.lineHeight} ${displaySize.tracking}`;
  }
  
  const weightClass = typography.weights[weight];
  const colorClass = typography.colors.primary[color];
  
  return `${sizeClass} ${weightClass} ${colorClass}`.trim();
};

// Predefined style combinations for common use cases
export const textStyles = {
  // Stage titles
  stageTitle: 'text-2xl font-bold text-gray-900 dark:text-gray-100',
  stageSubtitle: 'text-lg font-medium text-gray-700 dark:text-gray-300',
  stageDescription: 'text-base font-normal text-gray-600 dark:text-gray-400 leading-relaxed',
  
  // Step indicators
  stepTitle: 'text-xl font-semibold text-gray-900 dark:text-gray-100',
  stepLabel: 'text-sm font-medium text-gray-600 dark:text-gray-400',
  stepNumber: 'text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider',
  
  // Chat messages
  chatUser: 'text-base font-normal text-gray-800 dark:text-gray-200 leading-relaxed',
  chatAssistant: 'text-base font-normal text-gray-700 dark:text-gray-300 leading-relaxed',
  chatTimestamp: 'text-xs font-normal text-gray-400 dark:text-gray-600',
  chatRole: 'text-[10px] font-medium text-gray-500 dark:text-gray-500 uppercase tracking-wider',
  
  // Buttons
  buttonPrimary: 'text-sm font-medium text-white',
  buttonSecondary: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  buttonGhost: 'text-sm font-medium text-gray-600 dark:text-gray-400',
  
  // Form elements
  label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  input: 'text-base font-normal text-gray-900 dark:text-gray-100',
  placeholder: 'text-base font-normal text-gray-400 dark:text-gray-600',
  helperText: 'text-sm font-normal text-gray-500 dark:text-gray-500',
  errorText: 'text-sm font-normal text-red-600 dark:text-red-400',
  
  // Cards
  cardTitle: 'text-lg font-semibold text-gray-900 dark:text-gray-100',
  cardDescription: 'text-sm font-normal text-gray-600 dark:text-gray-400',
  cardMeta: 'text-xs font-normal text-gray-500 dark:text-gray-500',
  
  // Navigation
  navItem: 'text-sm font-medium text-gray-700 dark:text-gray-300',
  navItemActive: 'text-sm font-semibold text-blue-600 dark:text-blue-400',
  
  // Tooltips
  tooltip: 'text-xs font-normal text-gray-700 dark:text-gray-300',
  
  // Badges
  badge: 'text-xs font-medium uppercase tracking-wider',
  
  // Code
  code: 'text-sm font-mono text-gray-800 dark:text-gray-200',
  codeInline: 'text-[0.875em] font-mono text-blue-600 dark:text-blue-400',
} as const;

export default typography;
