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
    sourcemap: process.env.DEBUG_BUNDLE === 'true' ? 'inline' : false, // CRITICAL: Don't ship source maps to production!
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      external: (id) => {
        // Exclude test files from production bundle
        return id.includes('.test.') || id.includes('.spec.') || id.includes('/__tests__/') || id.includes('/tests/');
      },
      output: {
        // Use Vite/Rollup defaults; custom chunking was causing runtime issues
      }
    },
    minify: process.env.DEBUG_BUNDLE === 'true' ? false : 'terser',
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
    // Restrict exposure of env to only NODE_ENV for compatibility; prefer import.meta.env for app vars
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
});
