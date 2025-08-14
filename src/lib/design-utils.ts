/**
 * Design System Utilities
 * Helper functions for consistent design implementation
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Color utilities for dynamic theming
 */
export const colorUtils = {
  /**
   * Get CSS custom property value
   */
  getCSSVariable: (name: string): string => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  },

  /**
   * Set CSS custom property value
   */
  setCSSVariable: (name: string, value: string): void => {
    document.documentElement.style.setProperty(name, value);
  },

  /**
   * Convert hex to HSL for color manipulation
   */
  hexToHsl: (hex: string): { h: number; s: number; l: number } => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  },

  /**
   * Generate tonal palette from base color
   */
  generateTonalPalette: (baseColor: string) => {
    const { h, s } = colorUtils.hexToHsl(baseColor);
    
    return {
      0: `hsl(${h}, ${s}%, 0%)`,
      10: `hsl(${h}, ${s}%, 10%)`,
      20: `hsl(${h}, ${s}%, 20%)`,
      30: `hsl(${h}, ${s}%, 30%)`,
      40: `hsl(${h}, ${s}%, 40%)`,
      50: `hsl(${h}, ${s}%, 50%)`,
      60: `hsl(${h}, ${s}%, 60%)`,
      70: `hsl(${h}, ${s}%, 70%)`,
      80: `hsl(${h}, ${s}%, 80%)`,
      90: `hsl(${h}, ${s}%, 90%)`,
      95: `hsl(${h}, ${s}%, 95%)`,
      99: `hsl(${h}, ${s}%, 99%)`,
      100: `hsl(${h}, ${s}%, 100%)`,
    };
  },
};

/**
 * Motion utilities for consistent animations
 */
export const motionUtils = {
  /**
   * Get CSS duration value in milliseconds
   */
  getDuration: (token: string): number => {
    const value = colorUtils.getCSSVariable(token);
    if (value.endsWith('ms')) {
      return parseInt(value);
    }
    if (value.endsWith('s')) {
      return parseFloat(value) * 1000;
    }
    return 0;
  },

  /**
   * Create staggered animation delays for lists
   */
  createStagger: (index: number, baseDelay: number = 50): string => {
    return `${index * baseDelay}ms`;
  },

  /**
   * Reduced motion check
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Apply animation with reduced motion fallback
   */
  safeAnimate: (element: HTMLElement, animation: string, options?: KeyframeAnimationOptions) => {
    if (motionUtils.prefersReducedMotion()) {
      return null;
    }
    return element.animate(animation as any, options);
  },
};

/**
 * Responsive utilities
 */
export const responsiveUtils = {
  /**
   * Breakpoint values (matching Tailwind defaults)
   */
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  } as const,

  /**
   * Check if current viewport matches breakpoint
   */
  isBreakpoint: (breakpoint: keyof typeof responsiveUtils.breakpoints): boolean => {
    return window.innerWidth >= responsiveUtils.breakpoints[breakpoint];
  },

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint: (): keyof typeof responsiveUtils.breakpoints | 'xs' => {
    const width = window.innerWidth;
    if (width >= responsiveUtils.breakpoints['2xl']) return '2xl';
    if (width >= responsiveUtils.breakpoints.xl) return 'xl';
    if (width >= responsiveUtils.breakpoints.lg) return 'lg';
    if (width >= responsiveUtils.breakpoints.md) return 'md';
    if (width >= responsiveUtils.breakpoints.sm) return 'sm';
    return 'xs';
  },

  /**
   * Touch device detection
   */
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
};

/**
 * Accessibility utilities
 */
export const a11yUtils = {
  /**
   * Generate unique ID for form elements
   */
  generateId: (prefix: string = 'alf'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Focus management
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Announce to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;

    document.body.appendChild(announcer);

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Check if high contrast mode is enabled
   */
  isHighContrast: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Get appropriate contrast ratio for text
   */
  getContrastRatio: (background: string, text: string): number => {
    // Simplified contrast ratio calculation
    // In production, use a more robust library like 'color-contrast'
    const getLuminance = (color: string): number => {
      // This is a simplified version - use proper color library in production
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        const val = parseInt(c) / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(background);
    const l2 = getLuminance(text);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },
};

/**
 * Theme utilities
 */
export const themeUtils = {
  /**
   * Get current theme preference
   */
  getThemePreference: (): 'light' | 'dark' | 'system' => {
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
  },

  /**
   * Set theme preference
   */
  setThemePreference: (theme: 'light' | 'dark' | 'system'): void => {
    localStorage.setItem('theme', theme);
    themeUtils.applyTheme(theme);
  },

  /**
   * Apply theme to document
   */
  applyTheme: (theme: 'light' | 'dark' | 'system'): void => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.setAttribute('data-theme', theme);
      root.classList.toggle('dark', theme === 'dark');
    }
  },

  /**
   * Watch for system theme changes
   */
  watchSystemTheme: (callback: (isDark: boolean) => void): (() => void) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  },
};

/**
 * Education-specific utilities
 */
export const educationUtils = {
  /**
   * Calculate progress percentage
   */
  calculateProgress: (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  /**
   * Format learning time
   */
  formatLearningTime: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  },

  /**
   * Generate achievement color based on type
   */
  getAchievementColor: (type: 'bronze' | 'silver' | 'gold'): string => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
    };
    return colors[type];
  },

  /**
   * Calculate competency level
   */
  calculateCompetencyLevel: (masteredSkills: number, totalSkills: number): number => {
    if (totalSkills === 0) return 0;
    const percentage = (masteredSkills / totalSkills) * 100;
    
    if (percentage >= 90) return 4; // Expert
    if (percentage >= 70) return 3; // Proficient
    if (percentage >= 50) return 2; // Competent
    if (percentage >= 25) return 1; // Advanced Beginner
    return 0; // Novice
  },

  /**
   * Format streak display
   */
  formatStreak: (days: number): string => {
    if (days === 0) return 'Start your streak!';
    if (days === 1) return '1 day streak';
    return `${days} day streak`;
  },

  /**
   * Get next milestone
   */
  getNextMilestone: (currentXP: number): { target: number; remaining: number } => {
    const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
    const nextMilestone = milestones.find(m => m > currentXP) || milestones[milestones.length - 1];
    return {
      target: nextMilestone,
      remaining: nextMilestone - currentXP,
    };
  },
};

/**
 * Haptic feedback utilities (for mobile)
 */
export const hapticUtils = {
  /**
   * Light haptic feedback
   */
  light: (): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium haptic feedback
   */
  medium: (): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy haptic feedback
   */
  heavy: (): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },

  /**
   * Success haptic pattern
   */
  success: (): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 25, 50]);
    }
  },

  /**
   * Error haptic pattern
   */
  error: (): void => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  },
};

export {
  colorUtils,
  motionUtils,
  responsiveUtils,
  a11yUtils,
  themeUtils,
  educationUtils,
  hapticUtils,
};