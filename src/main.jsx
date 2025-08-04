import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/soft-ui.css'
import './design-system/global.css'
import App from './App.jsx'
import { setupErrorSuppressor, setupCleanConsole } from './utils/error-suppressor'
import { ThemeProvider } from './contexts/ThemeContext'

// Set up error suppression for browser extension errors
setupErrorSuppressor()

// Set up cleaner console for development
if (import.meta.env.DEV) {
  setupCleanConsole()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
