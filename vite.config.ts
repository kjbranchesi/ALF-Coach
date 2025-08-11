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
    chunkSizeWarningLimit: 250,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More granular vendor splitting
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('@remix-run') || id.includes('react-router')) {
              return 'react-router';
            }
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react/jsx-runtime') || id.includes('react/index')) {
              return 'react-core';
            }
            
            // Firebase - more granular splitting
            if (id.includes('firebase')) {
              if (id.includes('@firebase/auth')) return 'firebase-auth';
              if (id.includes('@firebase/firestore')) return 'firebase-firestore';
              if (id.includes('@firebase/storage')) return 'firebase-storage';
              if (id.includes('@firebase/app')) return 'firebase-app';
              if (id.includes('@firebase/util')) return 'firebase-util';
              return 'firebase-core';
            }
            
            // UI Libraries
            if (id.includes('framer-motion')) return 'animation';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@headlessui') || id.includes('@heroicons')) return 'ui-components';
            
            // Document processing
            if (id.includes('html2canvas') || id.includes('jspdf')) return 'document-vendor';
            if (id.includes('markdown') || id.includes('remark')) return 'markdown';
            
            // Form libraries
            if (id.includes('zod') || id.includes('@hookform')) return 'validation';
            
            // Everything else
            return 'vendor';
          }
          
          // Application code splitting
          if (id.includes('src/features/learningJourney')) {
            if (id.includes('/components/Creative')) return 'creative-process';
            if (id.includes('/components/Rubric') || id.includes('/components/Assessment')) {
              return 'assessment';
            }
            if (id.includes('/components/Peer') || id.includes('/components/Student')) {
              return 'evaluation';
            }
            return 'learning-journey';
          }
          
          if (id.includes('src/features/chat')) {
            if (id.includes('/stages/')) return 'chat-stages';
            return 'chat-core';
          }
          
          if (id.includes('src/components/chat')) {
            if (id.includes('/stages/')) return 'chat-stages';
            return 'chat-components';
          }
          
          if (id.includes('src/features/wizard')) return 'wizard';
          if (id.includes('src/features/review')) return 'review';
          if (id.includes('src/components/marketing')) return 'marketing';
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
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