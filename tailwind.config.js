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
  ],
  theme: {
    extend: {
      colors: {
        // New Professional Color Palette
        'primary': {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': '#3b82f6',
          '600': '#2563eb', // Primary blue
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
          '950': '#172554',
        },
        'accent': {
          '50': '#fefce8',
          '100': '#fef9c3',
          '200': '#fef08a',
          '300': '#fde047',
          '400': '#facc15', // Accent gold
          '500': '#eab308',
          '600': '#ca8a04',
          '700': '#a16207',
          '800': '#854d0e',
          '900': '#713f12',
          '950': '#422006',
        },
        'success': {
          '50': '#f0fdfa',
          '100': '#ccfbf1',
          '200': '#99f6e4',
          '300': '#5eead4',
          '400': '#2dd4bf',
          '500': '#14b8a6', // Success teal
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#115e59',
          '900': '#134e4a',
          '950': '#042f2e',
        },
        'surface': {
          '50': '#ffffff', // Surface white
          '100': '#fefefe',
          '200': '#fafafa',
          '300': '#f5f5f5',
          '400': '#f0f0f0',
          '500': '#e5e5e5',
          '600': '#d4d4d4',
          '700': '#a3a3a3',
          '800': '#525252',
          '900': '#404040',
          '950': '#262626',
        },
        'neutral': {
          '50': '#fafafa',
          '100': '#f4f4f5', // Neutral gray-100
          '200': '#e4e4e7',
          '300': '#d4d4d8',
          '400': '#a1a1aa',
          '500': '#71717a',
          '600': '#52525b',
          '700': '#3f3f46',
          '800': '#27272a',
          '900': '#18181b',
          '950': '#09090b',
        },
        'error': {
          '50': '#fef2f2',
          '100': '#fee2e2',
          '200': '#fecaca',
          '300': '#fca5a5',
          '400': '#f87171',
          '500': '#ef4444',
          '600': '#dc2626', // Error red
          '700': '#b91c1c',
          '800': '#991b1b',
          '900': '#7f1d1d',
          '950': '#450a0a',
        },
        // Legacy color support (for gradual migration)
        'secondary': {
          '50': '#ecfdf5',
          '100': '#d1fae5',
          '200': '#a7f3d0',
          '300': '#6ee7b7',
          '400': '#34d399',
          '500': '#10b981',
          '600': '#059669',
          '700': '#047857',
          '800': '#065f46',
          '900': '#064e3b',
          '950': '#022c22',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // Design System Tokens
      fontSize: {
        'base': ['16px', '24px'], // Base 16px font size
      },
      borderRadius: {
        'lg': '6px', // Standard 6px radius
      },
      boxShadow: {
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', // Single elevation
      },
      spacing: {
        // 8px grid system
        '0.5': '4px',   // 4px
        '1': '8px',     // 8px
        '1.5': '12px',  // 12px
        '2': '16px',    // 16px (gap-2)
        '2.5': '20px',  // 20px
        '3': '24px',    // 24px
        '3.5': '28px',  // 28px
        '4': '32px',    // 32px
        '5': '40px',    // 40px
        '6': '48px',    // 48px
        '7': '56px',    // 56px
        '8': '64px',    // 64px
        '9': '72px',    // 72px
        '10': '80px',   // 80px
        '11': '88px',   // 88px
        '12': '96px',   // 96px
        '14': '112px',  // 112px
        '16': '128px',  // 128px
        '20': '160px',  // 160px
        '24': '192px',  // 192px
        '28': '224px',  // 224px
        '32': '256px',  // 256px
        '36': '288px',  // 288px
        '40': '320px',  // 320px
        '44': '352px',  // 352px
        '48': '384px',  // 384px
        '52': '416px',  // 416px
        '56': '448px',  // 448px
        '60': '480px',  // 480px
        '64': '512px',  // 512px
        '72': '576px',  // 576px
        '80': '640px',  // 640px
        '96': '768px',  // 768px
      },
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
  plugins: [],
}
