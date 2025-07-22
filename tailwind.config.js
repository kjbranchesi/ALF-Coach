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
