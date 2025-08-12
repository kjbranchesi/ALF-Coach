console.log('1. Main.jsx starting...');

import { StrictMode } from 'react'
console.log('2. React imported');

import { createRoot } from 'react-dom/client'
console.log('3. ReactDOM imported');

try {
  import('./index.css')
  console.log('4. index.css imported');
} catch (e) {
  console.error('Failed to import index.css:', e);
}

try {
  import('./styles/soft-ui.css')
  console.log('5. soft-ui.css imported');
} catch (e) {
  console.error('Failed to import soft-ui.css:', e);
}

try {
  import('./design-system/global.css')
  console.log('6. global.css imported');
} catch (e) {
  console.error('Failed to import global.css:', e);
}

console.log('7. About to import App.tsx');

// Let's try importing App without .tsx extension first
let App;
try {
  App = require('./App').default;
  console.log('8. App imported successfully via require');
} catch (e) {
  console.error('Failed to import App:', e);
  // Create a minimal fallback
  App = () => {
    console.log('Rendering fallback App');
    return React.createElement('div', {style: {padding: '20px'}}, 
      React.createElement('h1', null, 'App Debug Mode'),
      React.createElement('p', null, 'If you see this, the app structure is working but imports are failing')
    );
  };
}

console.log('9. Setting up error suppression...');
let setupErrorSuppressor, setupCleanConsole, globalErrorHandler, ThemeProvider;

try {
  const errorModule = require('./utils/error-suppressor');
  setupErrorSuppressor = errorModule.setupErrorSuppressor;
  setupCleanConsole = errorModule.setupCleanConsole;
  console.log('10. Error suppressor imported');
} catch (e) {
  console.error('Failed to import error-suppressor:', e);
  setupErrorSuppressor = () => console.log('Error suppressor skipped');
  setupCleanConsole = () => console.log('Clean console skipped');
}

try {
  globalErrorHandler = require('./utils/global-error-handler').globalErrorHandler;
  console.log('11. Global error handler imported');
} catch (e) {
  console.error('Failed to import global-error-handler:', e);
  globalErrorHandler = { initialize: () => console.log('Global error handler skipped') };
}

try {
  ThemeProvider = require('./contexts/ThemeContext').ThemeProvider;
  console.log('12. ThemeProvider imported');
} catch (e) {
  console.error('Failed to import ThemeProvider:', e);
  ThemeProvider = ({ children }) => children;
}

console.log('13. Setting up error handling...');
// Set up error suppression for browser extension errors
setupErrorSuppressor()

// Set up global error handling for navigation and crash prevention
globalErrorHandler.initialize()

// Set up cleaner console for development
if (import.meta.env.DEV) {
  setupCleanConsole()
}

console.log('14. About to render app...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px;"><h1>Root element missing</h1><p>The #root element is not in the DOM</p></div>';
} else {
  console.log('15. Root element found, creating React root...');
  try {
    const root = createRoot(rootElement);
    console.log('16. React root created, rendering...');
    
    root.render(
      <StrictMode>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </StrictMode>
    );
    
    console.log('17. App rendered successfully!');
  } catch (e) {
    console.error('Failed to render app:', e);
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: system-ui;">
        <h1 style="color: red;">Render Error</h1>
        <p>Error: ${e.message}</p>
        <pre style="background: #f0f0f0; padding: 10px; overflow: auto;">${e.stack}</pre>
      </div>
    `;
  }
}

console.log('18. Main.jsx completed');