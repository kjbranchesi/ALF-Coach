// Production-safe logger utility
const isDevelopment = import.meta.env.DEV;
const isDebugEnabled = import.meta.env?.VITE_DEBUG === 'true' || 
                      (typeof localStorage !== 'undefined' && localStorage.getItem('alfCoachDebug') === 'true');

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.warn(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.debug(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },
  
  group: (label: string) => {
    if (isDevelopment || isDebugEnabled) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment || isDebugEnabled) {
      console.groupEnd();
    }
  }
};

export default logger;