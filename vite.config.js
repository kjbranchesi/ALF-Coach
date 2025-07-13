import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite' // REMOVED: This was conflicting with postcss.config.js

// By removing the @tailwindcss/vite plugin, we allow Vite to automatically
// detect and use our postcss.config.js file, which is the standard and
// more robust way to handle CSS processing.
export default defineConfig({
  // The 'react()' plugin is all that's needed here now.
  plugins: [react()],
})
