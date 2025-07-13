import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// By removing the conflicting Tailwind plugin, we allow the standard PostCSS
// process to correctly build and apply our custom theme.
export default defineConfig({
  plugins: [react()],
})
