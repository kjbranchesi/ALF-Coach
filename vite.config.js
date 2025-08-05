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
        keep_fnames: true
      },
      mangle: {
        keep_classnames: true,
        keep_fnames: true
      }
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk - separate large dependencies
          if (id.includes('node_modules')) {
            // Firebase chunk
            if (id.includes('firebase')) {
              return 'firebase';
            }
            // React ecosystem chunk
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries chunk
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('lottie-react')) {
              return 'ui-vendor';
            }
            // PDF and document libraries
            if (id.includes('pdf') || id.includes('jspdf') || id.includes('html2pdf')) {
              return 'document-vendor';
            }
            // General vendor chunk for other dependencies
            return 'vendor';
          }
          
          // App chunks - separate by feature
          if (id.includes('/components/Dashboard') || id.includes('/components/MainWorkspace')) {
            return 'dashboard';
          }
          if (id.includes('/features/chat/') || id.includes('TestChat') || id.includes('ChatLoader')) {
            return 'chat';
          }
          if (id.includes('/components/AboutPage') || id.includes('/components/HowItWorksPage') || id.includes('/components/ResearchBacking')) {
            return 'marketing';
          }
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})