import { useState, useEffect } from 'react';

export interface ResponsiveLayout {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
}

/**
 * Hook to determine current responsive layout breakpoint
 * Breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const [width, setWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}
