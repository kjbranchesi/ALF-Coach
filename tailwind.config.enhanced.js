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
        primary: {
          50: '#E6F0FF',
          100: '#C6DAFF',
          200: '#A1BFFF',
          300: '#7CA6FF',
          400: '#578AFB',
          500: '#356DF3',
          600: '#2B5CD9',
          700: '#234BBB',
          800: '#1C3C97',
          900: '#152C6F',
          950: '#0F1E4D'
        },
        ai: {
          50: '#F8F5FF',
          100: '#EFE8FF',
          200: '#E0D2FF',
          300: '#CFBCFF',
          400: '#BDA7FF',
          500: '#C9B5FF',
          600: '#AC93FF',
          700: '#8F75F6',
          800: '#7259D9',
          900: '#5441AE',
          950: '#35297A'
        },
        coral: {
          50: '#FFF2EA',
          100: '#FFE3D4',
          200: '#FFC5AA',
          300: '#FFA180',
          400: '#FF946B',
          500: '#FF8E5A',
          600: '#F47C45',
          700: '#D56137',
          800: '#AA4B29',
          900: '#78341C',
          950: '#4A1E11'
        },
        success: {
          50: '#E6F7F1',
          100: '#C8EFDF',
          200: '#9EDFBF',
          300: '#72CFA1',
          400: '#4AC183',
          500: '#29B682',
          600: '#1F9E6D',
          700: '#1A845B',
          800: '#146B49',
          900: '#0D4D34',
          950: '#062F21'
        },
        warning: {
          50: '#FFF4E2',
          100: '#FFE4B5',
          200: '#FFD489',
          300: '#FFC060',
          400: '#FFAE45',
          500: '#F1A736',
          600: '#D0872D',
          700: '#A96820',
          800: '#7F4A14',
          900: '#55310C',
          950: '#311C06'
        },
        error: {
          50: '#FCECEA',
          100: '#FBD6D2',
          200: '#F7B8B0',
          300: '#F08A80',
          400: '#E76159',
          500: '#DC4C3F',
          600: '#C13F34',
          700: '#9A342C',
          800: '#752722',
          900: '#4E1A17',
          950: '#2F0F0C'
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
          950: '#141721'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          container: '#F6F6F7',
          'container-high': '#E6E8EC',
          'container-highest': '#D3D5DC',
          inverse: '#21242E',
          bright: '#FFFFFF',
          dim: '#ECEEF4',
          tint: 'rgba(53, 109, 243, 0.08)'
        }
      },
      
      // Typography - Urbanist + Source Serif Pro
      fontFamily: {
        sans: [
          'Urbanist',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          ...defaultTheme.fontFamily.sans,
        ],
        display: [
          'Urbanist',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          ...defaultTheme.fontFamily.sans,
        ],
        serif: [
          '"Source Serif Pro"',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          ...defaultTheme.fontFamily.mono,
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
        'sm': '0 4px 10px rgba(21, 44, 111, 0.08)',
        'DEFAULT': '0 6px 14px rgba(21, 44, 111, 0.1)',
        'md': '0 12px 24px rgba(11, 20, 49, 0.12)',
        'lg': '0 18px 36px rgba(11, 20, 49, 0.16)',
        'xl': '0 24px 44px rgba(11, 20, 49, 0.18)',
        '2xl': '0 32px 56px rgba(11, 20, 49, 0.22)',
        // Material elevation levels tuned for new palette
        'elevation-0': 'none',
        'elevation-1': '0 4px 10px rgba(21, 44, 111, 0.08)',
        'elevation-2': '0 8px 20px rgba(21, 44, 111, 0.1)',
        'elevation-3': '0 12px 28px rgba(11, 20, 49, 0.12)',
        'elevation-4': '0 18px 36px rgba(11, 20, 49, 0.16)',
        'elevation-5': '0 24px 44px rgba(11, 20, 49, 0.18)',
        // Colored shadows for emphasis
        'primary': '0 20px 40px rgba(21, 44, 111, 0.18)',
        'ai': '0 18px 36px rgba(137, 112, 228, 0.2)',
        'coral': '0 18px 32px rgba(255, 142, 90, 0.22)',
        'success': '0 18px 32px rgba(31, 158, 109, 0.2)',
        // Glassmorphism shadows
        'glass': '0 12px 36px rgba(11, 20, 49, 0.14)',
        'glass-hover': '0 16px 44px rgba(11, 20, 49, 0.18)',
        // Soft UI shadows
        'soft': '0 16px 32px rgba(11, 20, 49, 0.12)',
        'soft-sm': '0 8px 18px rgba(21, 44, 111, 0.08)',
        'soft-lg': '0 24px 44px rgba(11, 20, 49, 0.16)',
        'soft-xl': '0 32px 56px rgba(11, 20, 49, 0.18)',
        'soft-inset': 'inset 0 2px 6px rgba(33, 36, 46, 0.08)',
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
