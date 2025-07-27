// Environment detection utility
// Provides consistent environment checks across the application

/**
 * Check if the application is running in development mode
 * @returns {boolean} true if in development mode
 */
export const isDevelopment = () => {
  // Vite uses import.meta.env
  return import.meta.env?.DEV === true || import.meta.env?.MODE === 'development';
};

/**
 * Check if the application is running in production mode
 * @returns {boolean} true if in production mode
 */
export const isProduction = () => {
  // Vite uses import.meta.env
  return import.meta.env?.PROD === true || import.meta.env?.MODE === 'production';
};

/**
 * Check if debug mode is explicitly enabled
 * @returns {boolean} true if debug is enabled
 */
export const isDebugEnabled = () => {
  // Check for debug flag in environment or localStorage
  return import.meta.env?.VITE_DEBUG === 'true' || 
         localStorage.getItem('alfCoachDebug') === 'true';
};

/**
 * Conditionally log messages based on environment
 * @param {...any} args - Arguments to pass to console.log
 */
export const debugLog = (...args) => {
  if (isDevelopment() || isDebugEnabled()) {
    console.log('[ALF Coach Debug]', ...args);
  }
};

/**
 * Conditionally log errors based on environment
 * @param {...any} args - Arguments to pass to console.error
 */
export const debugError = (...args) => {
  if (isDevelopment() || isDebugEnabled()) {
    console.error('[ALF Coach Error]', ...args);
  }
};

/**
 * Conditionally log warnings based on environment
 * @param {...any} args - Arguments to pass to console.warn
 */
export const debugWarn = (...args) => {
  if (isDevelopment() || isDebugEnabled()) {
    console.warn('[ALF Coach Warning]', ...args);
  }
};

/**
 * Get environment-specific configuration
 * @returns {object} Environment configuration
 */
export const getEnvironmentConfig = () => {
  return {
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    isDebugEnabled: isDebugEnabled(),
    showDebugPanels: isDevelopment() || isDebugEnabled(),
    logLevel: isProduction() ? 'error' : 'debug'
  };
};