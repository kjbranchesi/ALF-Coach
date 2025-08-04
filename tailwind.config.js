/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Use class-based dark mode
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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand color - ALF blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Using ALF brand colors:
        // primary: blue-500 (#3b82f6) - Main brand color
        // secondary: teal-500 (#14B8A6)
        // accent: amber-500 (#F59E0B)
      },
      fontFamily: {
        sans: ['Inter Variable', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: '0.75rem', // 12px
        '2xl': '1.5rem', // 24px
        card: '0.75rem', // 12px (keeping for backwards compatibility)
      },
      fontSize: {
        base: ['17px', '1.6'],
      },
      // Soft UI shadows
      boxShadow: {
        'soft': '0 6px 18px rgba(0,0,0,0.08)',
        'soft-sm': '0 3px 9px rgba(0,0,0,0.06)',
        'soft-lg': '0 8px 24px rgba(0,0,0,0.1)',
        'soft-xl': '0 12px 36px rgba(0,0,0,0.12)',
        'soft-inset': 'inset 0 2px 4px rgba(0,0,0,0.06)',
      },
      // Motion animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
