import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    splitVendorChunkPlugin()
  ],
  
  build: {
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          
          // Feature chunks  
          'chat-system': [
            './src/features/chat/ChatV6.tsx',
            './src/components/ChatModule.jsx',
            './src/services/chat-service.ts'
          ],
          'services-core': [
            './src/core/SOPFlowManager.ts',
            './src/core/services/FirebaseService.ts'
          ],
          'analytics': [
            './src/components/analytics/ALFAnalyticsDashboard.tsx'
          ],
          
          // Heavy features (lazy loaded)
          'pdf-export': [
            './src/core/services/PDFExportService.ts',
            './src/features/review/exportUtils.ts'
          ],
          'content-pipeline': [
            './src/services/content-enrichment-pipeline.ts'
          ]
        },
        
        // Optimize chunk file names  
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') 
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      }
    },
    
    // Aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'debugLog'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    
    // Size warnings
    chunkSizeWarningLimit: 500,
    
    // Enable source maps for debugging
    sourcemap: false // Disable in production for smaller bundles
  },
  
  // Optimized dependency handling
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ],
    exclude: [
      '@react-pdf/renderer',
      'html2pdf.js',
      'jspdf'  // Load these dynamically
    ]
  },
  
  // Resolve optimization
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@services': '/src/services',
      '@utils': '/src/utils'
    }
  },
  
  // Modern browser targets
  build: {
    target: 'es2020',
    cssTarget: 'chrome80'
  }
});