// Environment configuration
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Feature flags for debugging
export const debugFeatures = {
  showDebugPanel: isDevelopment || localStorage.getItem('debug_panel') === 'true',
  logStateTransitions: isDevelopment || localStorage.getItem('debug_fsm') === 'true',
  logApiCalls: isDevelopment || localStorage.getItem('debug_api') === 'true',
  showErrorDetails: isDevelopment || localStorage.getItem('debug_errors') === 'true'
};

// Enable debug features via console
if (typeof window !== 'undefined') {
  window.enableDebug = (feature) => {
    if (feature === 'all') {
      Object.keys(debugFeatures).forEach(key => {
        localStorage.setItem(key.replace(/([A-Z])/g, '_$1').toLowerCase(), 'true');
      });
      console.log('All debug features enabled. Refresh the page.');
    } else {
      localStorage.setItem(`debug_${feature}`, 'true');
      console.log(`Debug feature '${feature}' enabled. Refresh the page.`);
    }
  };

  window.disableDebug = (feature) => {
    if (feature === 'all') {
      Object.keys(debugFeatures).forEach(key => {
        localStorage.removeItem(key.replace(/([A-Z])/g, '_$1').toLowerCase());
      });
      console.log('All debug features disabled. Refresh the page.');
    } else {
      localStorage.removeItem(`debug_${feature}`);
      console.log(`Debug feature '${feature}' disabled. Refresh the page.`);
    }
  };

  // Log available debug commands
  if (isDevelopment) {
    console.log(`
🐛 Debug Mode Available!
Use these commands in the console:

• enableDebug('panel') - Show debug panels in chat
• enableDebug('fsm') - Log FSM state transitions  
• enableDebug('api') - Log API calls
• enableDebug('errors') - Show detailed errors
• enableDebug('all') - Enable all debug features

• disableDebug('panel') - Hide specific feature
• disableDebug('all') - Disable all debug features
    `);
  }
}