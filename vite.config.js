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
    sourcemap: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})