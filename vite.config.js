import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: []
  },
  build: {
    minify: 'terser',
    terserOptions: {
      keep_classnames: true,
      keep_fnames: true,
      compress: {
        keep_fargs: true,
        keep_classnames: true,
        keep_fnames: true,
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true
      }
    },
    sourcemap: true,
    modulePreload: {
      polyfill: false
    },
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk - separate large dependencies
          if (id.includes('node_modules')) {
            // Split Firebase into smaller chunks
            if (id.includes('firebase/auth')) {
              return 'firebase-auth';
            }
            if (id.includes('firebase/firestore')) {
              return 'firebase-firestore';
            }
            if (id.includes('firebase')) {
              return 'firebase-core';
            }
            // React ecosystem chunks
            if (id.includes('react-dom')) {
              return 'react-dom';
            }
            if (id.includes('react/jsx-runtime') || id.includes('react') && !id.includes('react-')) {
              return 'react-core';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // UI libraries chunk
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            if (id.includes('lottie')) {
              return 'lottie';
            }
            // PDF and document libraries
            if (id.includes('pdf') || id.includes('jspdf') || id.includes('html2pdf')) {
              return 'document-vendor';
            }
            // Utility libraries
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('axios')) {
              return 'utils';
            }
            // General vendor chunk for other dependencies
            return 'vendor';
          }
          
          // App chunks - separate by feature
          if (id.includes('/components/Dashboard') || id.includes('/components/MainWorkspace')) {
            return 'dashboard';
          }
          if (id.includes('/features/chat/') || id.includes('TestChat')) {
            return 'chat';
          }
          if (id.includes('ChatLoader')) {
            return 'blueprint';
          }
          if (id.includes('/components/AboutPage') || id.includes('/components/HowItWorksPage') || id.includes('/components/ResearchBacking')) {
            return 'marketing';
          }
          // Validation and assessment modules
          if (id.includes('validation') || id.includes('assessment')) {
            return 'validation';
          }
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})