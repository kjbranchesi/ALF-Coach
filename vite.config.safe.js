import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// SAFE Vite configuration - minimal changes to avoid breaking anything
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // SAFE build optimizations
  build: {
    // Keep existing terser settings but optimize them slightly
    minify: 'terser',
    terserOptions: {
      compress: {
        // Safe optimizations that won't break functionality
        drop_console: process.env.NODE_ENV === 'production', // Only in prod
        drop_debugger: true,
        passes: 1 // Conservative - don't over-optimize
      },
      mangle: {
        // Keep function names for debugging if needed  
        keep_fnames: process.env.NODE_ENV === 'development'
      }
    },
    
    // SAFE chunk splitting - only split obvious vendor libraries
    rollupOptions: {
      output: {
        manualChunks: {
          // Only split large, stable vendor libraries
          'react-core': ['react', 'react-dom'],
          'firebase-core': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'router': ['react-router-dom'],
          
          // Split large utility libraries (safe)
          'markdown-utils': [
            'remark',
            'remark-gfm', 
            'remark-parse',
            'remark-rehype',
            'rehype-sanitize',
            'rehype-stringify',
            'unified'
          ]
        }
      }
    },
    
    // Warn about large chunks but don't fail build
    chunkSizeWarningLimit: 1000,
    
    // Keep source maps for debugging
    sourcemap: true
  },
  
  // SAFE dependency optimization - only include what we know is used
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth', 
      'firebase/firestore',
      'firebase/storage'
    ]
    // Don't exclude anything to avoid breaking imports
  },
  
  // Keep existing resolve settings but add helpful aliases
  resolve: {
    alias: {
      '@': '/src'
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  
  // Modern target but not too aggressive 
  build: {
    target: 'es2020' // Good balance of modern features and compatibility
  }
});