import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/soft-ui.css'
import './design-system/global.css'
import App from './App'
import { setupErrorSuppressor, setupCleanConsole } from './utils/error-suppressor'
import { globalErrorHandler } from './utils/global-error-handler'
import { ThemeProvider } from './contexts/ThemeContext'

// Set up error suppression for browser extension errors
setupErrorSuppressor()

// Set up global error handling for navigation and crash prevention
globalErrorHandler.initialize()

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
