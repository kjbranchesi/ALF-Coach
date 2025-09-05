import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Bundle analyzer - run with: npm run build && open dist/stats.html
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['firebase', '@firebase/auth', '@firebase/firestore']
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
    sourcemap: false,
    target: 'es2020',
    modulePreload: {
      polyfill: false
    },
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 200, // Stricter limit to catch issues early
    rollupOptions: {
      output: {
        // Optimize chunk names for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
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
            // Split lucide-react more granularly
            if (id.includes('lucide-react')) {
              // Core icons used everywhere
              if (id.includes('Menu') || id.includes('X') || id.includes('Send') || id.includes('FileText')) {
                return 'icons-core';
              }
              // Feature-specific icons
              return 'icons-extended';
            }
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            // Animation libraries
            if (id.includes('lottie')) {
              return 'animation-lottie';
            }
            // Utility libraries
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('axios')) {
              return 'utils';
            }
            // Syntax highlighting (heavy)
            if (id.includes('react-syntax-highlighter') || id.includes('prismjs')) {
              return 'syntax-highlighter';
            }
            
            // Chart and visualization libraries
            if (id.includes('chart') || id.includes('d3') || id.includes('recharts')) {
              return 'charts';
            }
            
            // Markdown processing
            if (id.includes('remark') || id.includes('rehype') || id.includes('markdown')) {
              return 'markdown-vendor';
            }
            
            // General vendor chunk (should be much smaller now)
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
          
          // Split heavy components into separate chunks
          if (id.includes('MarkdownRenderer') || id.includes('SyntaxHighlighter')) {
            return 'markdown-heavy';
          }
          // Avoid forcing PDF-related chunks; these libs are dynamically imported
          
          if (id.includes('LottieAnimation') || id.includes('animations')) {
            return 'animations';
          }
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})
