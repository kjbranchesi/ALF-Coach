import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true
    })
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 250,
    optimizeDeps: {
      include: ['lucide-react']
    },
    rollupOptions: {
      external: (id) => {
        // Exclude test files from production bundle
        return id.includes('.test.') || id.includes('.spec.') || id.includes('/__tests__/') || id.includes('/tests/');
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Firebase - split to reduce main vendor chunk
            if (id.includes('firebase/firestore')) return 'firebase-firestore';
            if (id.includes('firebase/auth')) return 'firebase-auth';
            if (id.includes('firebase/app')) return 'firebase-core';
            if (id.includes('firebase')) return 'firebase-vendor';
            
            // React ecosystem
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('react') || id.includes('@remix-run')) return 'react-core';
            
            // Animation libraries
            if (id.includes('framer-motion')) return 'animation';
            
            // Everything else in vendor (to avoid circular dependency issues)
            return 'vendor';
          }
          
          // Application code splitting
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