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
        // Using standard Tailwind colors:
        // primary: blue-600 (#2563EB)
        // secondary: teal-500 (#14B8A6)
        // accent: amber-500 (#F59E0B)
      },
      fontFamily: {
        sans: ['Urbanist', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        card: '0.75rem', // 12px
      },
      // Soft UI shadows
      boxShadow: {
        'soft': '6px 6px 12px rgba(0,0,0,0.08), -6px -6px 12px rgba(255,255,255,0.5)',
        'soft-sm': '3px 3px 6px rgba(0,0,0,0.06), -3px -3px 6px rgba(255,255,255,0.4)',
        'soft-lg': '8px 8px 16px rgba(0,0,0,0.1), -8px -8px 16px rgba(255,255,255,0.6)',
        'soft-inset': 'inset 4px 4px 8px rgba(0,0,0,0.08), inset -4px -4px 8px rgba(255,255,255,0.5)',
        'soft-inset-sm': 'inset 2px 2px 4px rgba(0,0,0,0.06), inset -2px -2px 4px rgba(255,255,255,0.4)',
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
