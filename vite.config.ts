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
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // CRITICAL: Don't ship source maps to production!
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      external: (id) => {
        // Exclude test files from production bundle
        return id.includes('.test.') || id.includes('.spec.') || id.includes('/__tests__/') || id.includes('/tests/');
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Critical: Keep Firebase completely separate
            if (id.includes('firebase')) {
              if (id.includes('firestore')) return 'firebase-firestore';
              if (id.includes('auth')) return 'firebase-auth';
              return 'firebase-core';
            }
            
            // React ecosystem - split for better caching
            if (id.includes('react-dom')) return 'react-dom';
            if (id.includes('react-router')) return 'react-router';
            if (id.includes('react')) return 'react-core';
            
            // Heavy libraries
            if (id.includes('framer-motion')) return 'animation';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('zod')) return 'validation';
            if (id.includes('marked') || id.includes('markdown')) return 'markdown';
            if (id.includes('pdf')) return 'pdf';
            
            // AI/Gemini libraries
            if (id.includes('@google')) return 'ai-vendor';
            
            // UI libraries
            if (id.includes('tailwind')) return 'styles';
            
            // Everything else
            return 'vendor';
          }
          
          // Application code splitting by feature
          if (id.includes('src/components/chat') || id.includes('src/features/chat')) return 'chat-feature';
          if (id.includes('src/features/wizard')) return 'wizard-feature';
          if (id.includes('src/services')) return 'services';
          if (id.includes('src/components')) return 'components';
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
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