/**
 * ALF Design System Tokens
 * Single source of truth for all design decisions
 */

export const tokens = {
  // Color System
  colors: {
    primary: {
      50: '#E6F0FF',
      100: '#C6DAFF',
      200: '#A1BFFF',
      300: '#7CA6FF',
      400: '#578AFB',
      500: '#356DF3', // Learning Blue – main brand color
      600: '#2B5CD9',
      700: '#234BBB',
      800: '#1C3C97',
      900: '#152C6F',
    },
    accent: {
      meadow: '#29B682',
      meadowLight: '#D4F3E7',
      meadowDark: '#1F9E6D',
      apricot: '#FF8E5A',
      apricotLight: '#FFE3D4',
      apricotDark: '#E77440',
      lilac: '#C9B5FF',
      lilacLight: '#EFE8FF',
      lilacDark: '#A991FF',
    },
    gray: {
      50: '#FCFCFD',
      100: '#F6F6F7',
      200: '#E6E8EC',
      300: '#D3D5DC',
      400: '#B7BBC6',
      500: '#9CA0AE',
      600: '#7F8494',
      700: '#626777',
      800: '#4B4F5C',
      900: '#21242E',
    },
    semantic: {
      success: '#1F9E6D',
      successLight: '#D7F2E6',
      successBorder: '#18865C',
      warning: '#F1A736',
      warningLight: '#FFE8C2',
      warningBorder: '#DB8C1E',
      error: '#DC4C3F',
      errorLight: '#FBD6D2',
      errorBorder: '#B93C32',
      info: '#1A8CD8',
      infoLight: '#D3ECFF',
      infoBorder: '#146FB0',
    },
    background: {
      primary: '#FFFFFF', // Chalk White
      secondary: '#F6F6F7', // Mist Gray
      tertiary: '#E6E8EC',
      overlay: 'rgba(21, 44, 111, 0.06)',
    },
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: 'Urbanist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: '"Source Serif Pro", Georgia, "Times New Roman", serif',
      mono: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.75rem', // 44px display
      '5xl': '3.5rem',    // 56px hero
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing System (8px base)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
  },

  // Border Radius
  radius: {
    none: '0',
    sm: '0.125rem',  // 2px
    base: '0.25rem', // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 4px 10px rgba(21, 44, 111, 0.08)',
    base: '0 6px 14px rgba(21, 44, 111, 0.1)',
    md: '0 12px 24px rgba(11, 20, 49, 0.12)',
    lg: '0 18px 36px rgba(11, 20, 49, 0.16)',
    xl: '0 24px 44px rgba(11, 20, 49, 0.18)',
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Z-index
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Type exports for TypeScript
export type Colors = typeof tokens.colors;
export type Typography = typeof tokens.typography;
export type Spacing = typeof tokens.spacing;
export type Tokens = typeof tokens;
