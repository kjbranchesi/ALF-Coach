/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    // Preserve existing safelists
    'bg-white',
    'text-primary-600',
    'border-primary-100',
    'text-purple-600',
    'border-purple-100',
    // Add new Material Design 3 safelists
    { pattern: /bg-(primary|ai|coral|success|warning|error)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /text-(primary|ai|coral|success|warning|error)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /border-(primary|ai|coral|success|warning|error)-(50|100|200|300|400|500|600|700|800|900|950)/ },
  ],
  theme: {
    extend: {
      // Enhanced Color System - Material Design 3 + Apple HIG
      colors: {
        // Primary Blues - Trust & Intelligence (Material Design 3 tonal palette)
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',  // Main
          600: '#2563EB',  // Hover
          700: '#1D4ED8',  // Active
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554'
        },
        // AI Purple - Wisdom & Magic
        ai: {
          50: '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',  // Main
          600: '#9333EA',  // Hover
          700: '#7C3AED',  // Active
          800: '#6B21A8',
          900: '#581C87',
          950: '#3B0764'
        },
        // Warm Accent - Delight & Energy
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFC9C9',
          300: '#FFA8A8',
          400: '#FF8787',
          500: '#FF6B6B',  // Main
          600: '#FA5252',
          700: '#F03E3E',
          800: '#E03131',
          900: '#C92A2A',
          950: '#A61E1E'
        },
        // Semantic Colors with full tonal range
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
          950: '#052E16'
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03'
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
          950: '#450A0A'
        },
        // Neutral with Material Design 3 surface tones
        gray: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
          950: '#09090B'
        },
        // Material Design 3 surface colors
        surface: {
          DEFAULT: '#FAFAFA',
          container: '#F4F4F5',
          'container-high': '#E4E4E7',
          'container-highest': '#D4D4D8',
          inverse: '#18181B',
          bright: '#FFFFFF',
          dim: '#E4E4E7',
          tint: 'rgb(59 130 246 / 0.05)'
        }
      },
      
      // Typography - Apple SF Pro fallback to Inter
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          'Inter Variable',
          'Inter',
          ...defaultTheme.fontFamily.sans,
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'Consolas',
          ...defaultTheme.fontFamily.mono,
        ],
        display: [
          '"SF Pro Display"',
          '-apple-system',
          'Inter Variable',
          ...defaultTheme.fontFamily.sans,
        ],
      },
      
      // Typography Scale - Apple HIG inspired
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.004em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.002em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.002em' }],
        'xl': ['20px', { lineHeight: '30px', letterSpacing: '-0.004em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.006em' }],
        '3xl': ['30px', { lineHeight: '38px', letterSpacing: '-0.008em' }],
        '4xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.01em' }],
        '5xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.012em' }],
        '6xl': ['60px', { lineHeight: '68px', letterSpacing: '-0.014em' }],
        '7xl': ['72px', { lineHeight: '80px', letterSpacing: '-0.016em' }],
      },
      
      // Spacing with 4px base grid
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem',
        '144': '36rem',
      },
      
      // Enhanced Shadow System - Material Design 3 elevation
      boxShadow: {
        // Standard elevation shadows
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        // Material Design 3 elevation levels
        'elevation-0': 'none',
        'elevation-1': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'elevation-2': '0 2px 4px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'elevation-3': '0 4px 8px 0 rgb(0 0 0 / 0.08), 0 2px 4px 0 rgb(0 0 0 / 0.04)',
        'elevation-4': '0 8px 16px 0 rgb(0 0 0 / 0.1), 0 4px 8px 0 rgb(0 0 0 / 0.04)',
        'elevation-5': '0 16px 32px 0 rgb(0 0 0 / 0.12), 0 8px 16px 0 rgb(0 0 0 / 0.04)',
        // Colored shadows for emphasis
        'primary': '0 4px 14px 0 rgb(59 130 246 / 0.3)',
        'ai': '0 4px 14px 0 rgb(168 85 247 / 0.25)',
        'coral': '0 4px 14px 0 rgb(255 107 107 / 0.3)',
        'success': '0 4px 14px 0 rgb(34 197 94 / 0.25)',
        // Glassmorphism shadows
        'glass': '0 8px 32px 0 rgb(0 0 0 / 0.08)',
        'glass-hover': '0 12px 40px 0 rgb(0 0 0 / 0.12)',
        // Soft UI shadows (preserved from original)
        'soft': '0 6px 18px rgba(0,0,0,0.08)',
        'soft-sm': '0 3px 9px rgba(0,0,0,0.06)',
        'soft-lg': '0 8px 24px rgba(0,0,0,0.1)',
        'soft-xl': '0 12px 36px rgba(0,0,0,0.12)',
        'soft-inset': 'inset 0 2px 4px rgba(0,0,0,0.06)',
        // Inset shadows for depth
        'inner-light': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'inner-glow': 'inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
      },
      
      // Backdrop filters for glassmorphism
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // Modern border radius - Apple HIG inspired
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.625rem',   // 10px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.25rem',   // 20px
        '3xl': '1.5rem',    // 24px
        '4xl': '2rem',      // 32px
        '5xl': '2.5rem',    // 40px
        '6xl': '3rem',      // 48px
        'full': '9999px',
        // Apple HIG specific
        'ios-sm': '0.375rem',  // 6px
        'ios': '0.625rem',     // 10px
        'ios-lg': '0.875rem',  // 14px
        'ios-xl': '1.125rem',  // 18px
        // Material Design 3
        'material-sm': '0.25rem',  // 4px
        'material': '0.75rem',     // 12px
        'material-lg': '1rem',     // 16px
        'material-xl': '1.75rem',  // 28px
      },
      
      // Enhanced Animations
      animation: {
        // Entrances
        'fade-in': 'fadeIn 300ms ease-out',
        'fade-in-up': 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in': 'slideIn 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 200ms ease-out',
        // Continuous
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'rotate': 'rotate 20s linear infinite',
        // Interactions
        'bounce-in': 'bounceIn 600ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shake': 'shake 500ms ease-in-out',
        'ripple': 'ripple 600ms ease-out',
        // Chat specific
        'message-in': 'messageIn 400ms cubic-bezier(0.16, 1, 0.3, 1)',
        'typing': 'typing 1.4s infinite',
        // Success animations
        'check': 'checkmark 400ms ease-out forwards',
        'confetti': 'confetti 1s ease-out forwards',
        // Loading
        'skeleton': 'skeleton 2s ease-in-out infinite',
        'progress': 'progress 2s ease-out forwards',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        rotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        messageIn: {
          '0%': { transform: 'translateY(20px) scale(0.96)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        typing: {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '40%': { opacity: '1', transform: 'scale(1.2)' },
        },
        checkmark: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' },
        },
        skeleton: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.75' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      
      // Transition timing functions - Apple + Material
      transitionTimingFunction: {
        // Apple HIG curves
        'ios-standard': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ios-entrance': 'cubic-bezier(0, 0, 0.2, 1)',
        'ios-exit': 'cubic-bezier(0.4, 0, 1, 1)',
        // Material Design 3 emphasis curves
        'material-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'material-decelerated': 'cubic-bezier(0, 0, 0.2, 1)',
        'material-accelerated': 'cubic-bezier(0.4, 0, 1, 1)',
        // Custom spring curves
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'notification': '1080',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // Custom plugin for glass effects and utilities
    function({ addUtilities, addComponents, theme }) {
      // Glass utilities
      addUtilities({
        '.glass': {
          '@apply bg-white/80 backdrop-blur-xl border border-white/20': {},
        },
        '.glass-dark': {
          '@apply bg-gray-900/80 backdrop-blur-xl border border-white/10': {},
        },
        '.glass-primary': {
          '@apply bg-primary-500/10 backdrop-blur-xl border border-primary-500/20': {},
        },
        '.glass-ai': {
          '@apply bg-ai-500/10 backdrop-blur-xl border border-ai-500/20': {},
        },
        '.glass-coral': {
          '@apply bg-coral-500/10 backdrop-blur-xl border border-coral-500/20': {},
        },
        // Material Design 3 state layers
        '.state-hover': {
          '@apply hover:bg-black/[0.08] dark:hover:bg-white/[0.08]': {},
        },
        '.state-focus': {
          '@apply focus:bg-black/[0.12] dark:focus:bg-white/[0.12]': {},
        },
        '.state-pressed': {
          '@apply active:bg-black/[0.12] dark:active:bg-white/[0.12]': {},
        },
        // Apple HIG utilities
        '.vibrancy-light': {
          '@apply bg-white/70 backdrop-blur-2xl': {},
        },
        '.vibrancy-dark': {
          '@apply bg-black/70 backdrop-blur-2xl': {},
        },
        // Gradient text
        '.gradient-text': {
          '@apply bg-gradient-to-r from-primary-600 to-ai-600 bg-clip-text text-transparent': {},
        },
        '.gradient-text-coral': {
          '@apply bg-gradient-to-r from-coral-500 to-warning-500 bg-clip-text text-transparent': {},
        },
        // Safe area for mobile
        '.safe-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.safe-left': {
          paddingLeft: 'env(safe-area-inset-left)',
        },
        '.safe-right': {
          paddingRight: 'env(safe-area-inset-right)',
        },
      });
      
      // Component classes
      addComponents({
        // Material Design 3 FAB
        '.fab': {
          '@apply fixed bottom-4 right-4 w-14 h-14 rounded-2xl shadow-elevation-3 flex items-center justify-center transition-all duration-200': {},
          '@apply hover:shadow-elevation-4 active:shadow-elevation-2': {},
        },
        '.fab-extended': {
          '@apply fixed bottom-4 right-4 px-6 h-14 rounded-2xl shadow-elevation-3 flex items-center gap-2 transition-all duration-200': {},
          '@apply hover:shadow-elevation-4 active:shadow-elevation-2': {},
        },
        // Apple HIG style cards
        '.card-ios': {
          '@apply bg-white dark:bg-gray-800 rounded-ios-lg shadow-sm': {},
          '@apply border border-gray-200/50 dark:border-gray-700/50': {},
        },
        // Material Design 3 cards
        '.card-material': {
          '@apply bg-surface rounded-material shadow-elevation-1': {},
          '@apply hover:shadow-elevation-2 transition-shadow duration-200': {},
        },
      });
    },
  ],
}