import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Explicitly telling Vite to use PostCSS for all CSS files
  css: {
    postcss: {
      plugins: [require('tailwindcss'), require('autoprefixer')],
    },
  },
});