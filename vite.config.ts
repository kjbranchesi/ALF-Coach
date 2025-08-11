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
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('firebase')) {
              if (id.includes('auth')) return 'firebase-auth';
              if (id.includes('firestore')) return 'firebase-firestore';
              return 'firebase-core';
            }
            if (id.includes('framer-motion')) return 'animation';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@headlessui')) return 'ui-components';
            if (id.includes('markdown') || id.includes('remark')) return 'markdown';
            return 'vendor';
          }
          // Split app chunks
          if (id.includes('src/features/learningJourney')) {
            if (id.includes('components/Rubric') || id.includes('components/Assessment')) {
              return 'assessment';
            }
            return 'learning-journey';
          }
          if (id.includes('src/features/chat')) return 'chat';
          if (id.includes('src/components/chat')) return 'chat-components';
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
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