import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  onTab?: (event: KeyboardEvent) => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({
  onNext,
  onPrevious,
  onSubmit,
  onCancel,
  onTab,
  enabled = true
}: KeyboardNavigationOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) {return;}

    // Handle keyboard shortcuts
    const { key, ctrlKey, metaKey, shiftKey } = event;
    const isModified = ctrlKey || metaKey;

    switch (key) {
      case 'Enter':
        if (isModified && onSubmit) {
          event.preventDefault();
          onSubmit();
        }
        break;
        
      case 'ArrowRight':
        if (isModified && onNext) {
          event.preventDefault();
          onNext();
        }
        break;
        
      case 'ArrowLeft':
        if (isModified && onPrevious) {
          event.preventDefault();
          onPrevious();
        }
        break;
        
      case 'Escape':
        if (onCancel) {
          event.preventDefault();
          onCancel();
        }
        break;
        
      case 'Tab':
        if (onTab) {
          onTab(event);
        }
        break;
        
      default:
        break;
    }
  }, [enabled, onNext, onPrevious, onSubmit, onCancel, onTab]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [enabled, handleKeyDown]);

  // Return keyboard hints for UI display
  return {
    hints: {
      next: 'Ctrl/Cmd + →',
      previous: 'Ctrl/Cmd + ←',
      submit: 'Ctrl/Cmd + Enter',
      cancel: 'Esc'
    }
  };
};

// Hook for managing focus within a container
export const useFocusManager = (containerRef: React.RefObject<HTMLElement>) => {
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) {return [];}
    
    const selector = [
      'a[href]:not([disabled])',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(containerRef.current.querySelectorAll(selector));
  }, [containerRef]);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
    }
  }, [getFocusableElements]);

  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
    } else {
      elements[0]?.focus(); // Wrap to first
    }
  }, [getFocusableElements]);

  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const currentIndex = elements.findIndex(el => el === document.activeElement);
    
    if (currentIndex > 0) {
      elements[currentIndex - 1].focus();
    } else {
      elements[elements.length - 1]?.focus(); // Wrap to last
    }
  }, [getFocusableElements]);

  return {
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    getFocusableElements
  };
};