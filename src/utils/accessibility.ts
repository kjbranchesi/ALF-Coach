/**
 * Accessibility utilities for ALF Coach
 * Provides ARIA attributes, keyboard navigation, and screen reader support
 */

/**
 * Generate ARIA attributes for interactive elements
 */
export const getAriaAttributes = (props: {
  label?: string;
  describedBy?: string;
  expanded?: boolean;
  selected?: boolean;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  live?: 'polite' | 'assertive' | 'off';
  role?: string;
}) => {
  const attrs: Record<string, any> = {};
  
  if (props.label) {attrs['aria-label'] = props.label;}
  if (props.describedBy) {attrs['aria-describedby'] = props.describedBy;}
  if (props.expanded !== undefined) {attrs['aria-expanded'] = props.expanded;}
  if (props.selected !== undefined) {attrs['aria-selected'] = props.selected;}
  if (props.disabled !== undefined) {attrs['aria-disabled'] = props.disabled;}
  if (props.required !== undefined) {attrs['aria-required'] = props.required;}
  if (props.invalid !== undefined) {attrs['aria-invalid'] = props.invalid;}
  if (props.live) {attrs['aria-live'] = props.live;}
  if (props.role) {attrs['role'] = props.role;}
  
  return attrs;
};

/**
 * Keyboard navigation handler
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  callbacks: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
  }
) => {
  const { key } = event;
  
  switch (key) {
    case 'Enter':
      if (callbacks.onEnter) {
        event.preventDefault();
        callbacks.onEnter();
      }
      break;
    case ' ':
    case 'Space':
      if (callbacks.onSpace) {
        event.preventDefault();
        callbacks.onSpace();
      }
      break;
    case 'Escape':
      if (callbacks.onEscape) {
        event.preventDefault();
        callbacks.onEscape();
      }
      break;
    case 'ArrowUp':
      if (callbacks.onArrowUp) {
        event.preventDefault();
        callbacks.onArrowUp();
      }
      break;
    case 'ArrowDown':
      if (callbacks.onArrowDown) {
        event.preventDefault();
        callbacks.onArrowDown();
      }
      break;
    case 'ArrowLeft':
      if (callbacks.onArrowLeft) {
        event.preventDefault();
        callbacks.onArrowLeft();
      }
      break;
    case 'ArrowRight':
      if (callbacks.onArrowRight) {
        event.preventDefault();
        callbacks.onArrowRight();
      }
      break;
    case 'Tab':
      if (callbacks.onTab) {
        callbacks.onTab();
      }
      break;
  }
};

/**
 * Focus trap for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private previousFocus: HTMLElement | null = null;
  
  constructor(element: HTMLElement) {
    this.element = element;
  }
  
  activate() {
    this.previousFocus = document.activeElement as HTMLElement;
    
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    this.element.addEventListener('keydown', this.handleKeyDown);
  }
  
  deactivate() {
    this.element.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
  }
  
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(this.element.querySelectorAll(selector));
  }
  
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') {return;}
    
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) {return;}
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };
}

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};


/**
 * Generate unique IDs for form elements
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb;
    const sRGB = [r, g, b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };
  
  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);
  
  if (!rgb1 || !rgb2) {return 0;}
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Ensure minimum touch target size (48x48px for WCAG AAA)
 */
export const ensureTouchTarget = (className: string = ''): string => {
  return `${className} min-h-[48px] min-w-[48px]`;
};

/**
 * High contrast mode detection
 */
export const isHighContrastMode = (): boolean => {
  return window.matchMedia('(prefers-contrast: high)').matches;
};


/**
 * Ensure color contrast for text
 */
export const getAccessibleTextColor = (backgroundColor: string): string => {
  const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
  const blackContrast = getContrastRatio(backgroundColor, '#000000');
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};