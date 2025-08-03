import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
            '@google/generative-ai'
          ],
          'firebase': [
            'firebase/app',
            'firebase/auth', 
            'firebase/firestore'
          ],
          'ui': [
            'framer-motion',
            '@headlessui/react',
            'react-hot-toast'
          ],
          'pdf': [
            'jspdf',
            'html2canvas'
          ],
          // Enrichment services will be lazy loaded dynamically
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    // Make process.env available for Netlify compatibility
    'process.env': process.env
  }
});