/**
 * ThemeProvider.tsx
 * 
 * Automatically syncs with browser/OS dark mode preferences
 * Following industry best practices - NO manual toggle
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  systemPreference: 'light' | 'dark' | 'no-preference';
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  systemPreference: 'light'
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | 'no-preference'>('light');

  useEffect(() => {
    // Check if browser supports matchMedia
    if (!window.matchMedia) {
      return;
    }

    // Create media query for dark mode preference
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial state
    const updateTheme = (e?: MediaQueryListEvent | MediaQueryList) => {
      const prefersDark = e ? e.matches : darkModeQuery.matches;
      setIsDarkMode(prefersDark);
      setSystemPreference(prefersDark ? 'dark' : 'light');
      
      // Update document class for Tailwind dark mode
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Set initial theme
    updateTheme(darkModeQuery);

    // Listen for changes in system preference
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', updateTheme);
    } else {
      // Fallback for older browsers
      darkModeQuery.addListener(updateTheme);
    }

    // Cleanup
    return () => {
      if (darkModeQuery.removeEventListener) {
        darkModeQuery.removeEventListener('change', updateTheme);
      } else {
        darkModeQuery.removeListener(updateTheme);
      }
    };
  }, []);

  // Also listen for manual changes to the HTML class (for debugging/testing)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasDarkClass = document.documentElement.classList.contains('dark');
          setIsDarkMode(hasDarkClass);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, systemPreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to check if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) {return;}

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const updateMotionPreference = (e?: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReducedMotion(e ? e.matches : motionQuery.matches);
    };

    updateMotionPreference(motionQuery);

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', updateMotionPreference);
    } else {
      motionQuery.addListener(updateMotionPreference);
    }

    return () => {
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', updateMotionPreference);
      } else {
        motionQuery.removeListener(updateMotionPreference);
      }
    };
  }, []);

  return prefersReducedMotion;
};

// Hook to check if user prefers high contrast
export const usePrefersHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) {return;}

    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const updateContrastPreference = (e?: MediaQueryListEvent | MediaQueryList) => {
      setPrefersHighContrast(e ? e.matches : contrastQuery.matches);
    };

    updateContrastPreference(contrastQuery);

    if (contrastQuery.addEventListener) {
      contrastQuery.addEventListener('change', updateContrastPreference);
    } else {
      contrastQuery.addListener(updateContrastPreference);
    }

    return () => {
      if (contrastQuery.removeEventListener) {
        contrastQuery.removeEventListener('change', updateContrastPreference);
      } else {
        contrastQuery.removeListener(updateContrastPreference);
      }
    };
  }, []);

  return prefersHighContrast;
};