import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import the tailwindcss vite plugin

// https://vitejs.dev/config/
export default defineConfig({
  // Add the tailwindcss plugin
  plugins: [react(), tailwindcss()], 
})