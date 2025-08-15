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
          // Simplified chunking strategy - reduce overhead from too many chunks
          if (id.includes('node_modules')) {
            // React ecosystem - combine related packages
            if (id.includes('react') || id.includes('@remix-run')) {
              return 'react-vendor';
            }
            
            // Firebase - keep separate due to size but combine sub-packages
            if (id.includes('firebase')) {
              return 'firebase-vendor';
            }
            
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // All other vendor code
            return 'vendor';
          }
          
          // Route-based application code splitting only (much simpler)
          if (id.includes('src/features/chat')) return 'chat';
          if (id.includes('src/features/wizard')) return 'wizard';
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