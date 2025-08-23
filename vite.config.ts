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
      external: (id) => {
        // Exclude test files from production bundle
        return id.includes('.test.') || id.includes('.spec.') || id.includes('/__tests__/') || id.includes('/tests/');
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Large libraries that should be separate chunks
            if (id.includes('firebase/firestore')) return 'firebase-firestore';
            if (id.includes('firebase/auth')) return 'firebase-auth';
            if (id.includes('firebase/app')) return 'firebase-core';
            if (id.includes('firebase')) return 'firebase-vendor';
            
            // React ecosystem
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('react') || id.includes('@remix-run')) return 'react-core';
            
            // Animation libraries (now lazy loaded)
            if (id.includes('framer-motion')) return 'animation';
            
            // UI libraries
            if (id.includes('lucide-react') || id.includes('@radix-ui')) return 'ui-vendor';
            
            // Utility libraries
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind')) return 'utils-vendor';
            
            // Everything else
            return 'vendor';
          }
          
          // Application code splitting
          if (id.includes('src/features/chat')) return 'chat';
          if (id.includes('src/features/wizard')) return 'wizard';
          if (id.includes('src/services/')) return 'services';
          if (id.includes('src/utils/')) return 'utils';
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