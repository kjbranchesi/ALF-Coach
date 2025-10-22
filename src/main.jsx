import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/soft-ui.css'
// Temporarily removed design-system/global.css - 85 lines of unused CSS variables
import App from './App'
import { setupErrorSuppressor, setupCleanConsole } from './utils/error-suppressor'
import { globalErrorHandler } from './utils/global-error-handler'
import { featureFlags } from './config/featureFlags'
// ThemeProvider is already applied inside App.tsx via providers/ThemeProvider

// Early startup diagnostics (not suppressed)
try {
  // Basic environment + flags snapshot
  // eslint-disable-next-line no-console
  console.log('[BOOT] App starting', {
    mode: import.meta.env.MODE,
    suppressErrors: import.meta.env.VITE_SUPPRESS_ERRORS,
    suppressFirebaseErrors: import.meta.env.VITE_SUPPRESS_FIREBASE_ERRORS,
  });

  // Allow query param override for cloud-first reads: ?cloud=off
  const params = new URLSearchParams(window.location.search);
  const cloudOverride = params.get('cloud') || params.get('cloudFirst');
  if (cloudOverride === 'off') {
    (featureFlags).cloudFirstReads = false;
    // eslint-disable-next-line no-console
    console.warn('[BOOT] Cloud-first reads disabled via query param');
  }

  // Log feature flags snapshot
  // eslint-disable-next-line no-console
  console.log('[BOOT] FeatureFlags:', featureFlags);
} catch {}

// Set up error suppression for browser extension errors (honors env + query overrides)
setupErrorSuppressor()

// Set up global error handling for navigation and crash prevention
globalErrorHandler.initialize()

// Set up cleaner console for development
if (import.meta.env.DEV) {
  setupCleanConsole()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
