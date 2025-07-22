/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-white',
    'text-primary-600',
    'border-primary-100',
    'text-purple-600',
    'border-purple-100',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          light: '#DBEAFE',   // blue-100
          50: '#EFF6FF',      // blue-50
          100: '#DBEAFE',     // blue-100
          200: '#BFDBFE',     // blue-200
          300: '#93C5FD',     // blue-300
          400: '#60A5FA',     // blue-400
          500: '#3B82F6',     // blue-500
          600: '#2563EB',     // blue-600
          700: '#1D4ED8',     // blue-700
          800: '#1E40AF',     // blue-800
          900: '#1E3A8A',     // blue-900
        },
        secondary: {
          DEFAULT: '#14B8A6', // teal-500
          light: '#CCFBF1',   // teal-100
          50: '#F0FDFA',      // teal-50
          100: '#CCFBF1',     // teal-100
          200: '#99F6E4',     // teal-200
          300: '#5EEAD4',     // teal-300
          400: '#2DD4BF',     // teal-400
          500: '#14B8A6',     // teal-500
          600: '#0D9488',     // teal-600
          700: '#0F766E',     // teal-700
          800: '#115E59',     // teal-800
          900: '#134E4A',     // teal-900
        },
        accent: {
          DEFAULT: '#F59E0B', // amber-500
          50: '#FFFBEB',      // amber-50
          100: '#FEF3C7',     // amber-100
          200: '#FDE68A',     // amber-200
          300: '#FCD34D',     // amber-300
          400: '#FBBF24',     // amber-400
          500: '#F59E0B',     // amber-500
          600: '#D97706',     // amber-600
          700: '#B45309',     // amber-700
          800: '#92400E',     // amber-800
          900: '#78350F',     // amber-900
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F9FAFB',  // slate-50
          dark: '#0F172A',    // slate-900
        },
      },
      fontFamily: {
        sans: ['Urbanist', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        card: '0.75rem', // 12px
      },
      // Keep default Tailwind spacing and typography
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
