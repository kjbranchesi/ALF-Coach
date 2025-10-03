/**
 * useBackspaceNavigation - Custom hook to prevent accidental backspace navigation
 * This prevents the critical issue where users pressing backspace outside of input
 * fields causes browser navigation that leads to asset loading errors and crashes
 */

import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useBackspaceNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only prevent backspace navigation, not other keys
    if (event.key !== 'Backspace') {return;}

    const target = event.target as HTMLElement;
    
    // Allow backspace in input fields and contenteditable elements
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return;
    }

    // Allow backspace if the input is focused (even if event.target is different)
    const activeElement = document.activeElement as HTMLElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
       activeElement.tagName === 'TEXTAREA' ||
       activeElement.contentEditable === 'true' ||
       activeElement.isContentEditable)
    ) {
      return;
    }

    // Check if we're in a critical app section (chat, wizard)
    const isCriticalSection = location.pathname.includes('/chat') || 
                             location.pathname.includes('/project') ||
                             location.pathname.includes('/blueprint');

    if (isCriticalSection) {
      // Prevent the default backspace navigation behavior
      event.preventDefault();
      event.stopPropagation();
      
      console.log('[BackspaceNavigation] Prevented backspace navigation in critical section:', location.pathname);
      
      // Optionally show a user-friendly message
      // This could be enhanced with a toast notification
      return false;
    }

    // For non-critical sections, still prevent to avoid asset loading issues
    // but allow programmatic navigation if needed
    event.preventDefault();
    console.log('[BackspaceNavigation] Prevented backspace navigation:', location.pathname);
    
  }, [location.pathname]);

  useEffect(() => {
    // Add event listener with capture phase to catch events early
    document.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);

  // Return navigation utilities that can be used by components
  return {
    navigateBack: useCallback(() => {
      // Safe navigation that handles asset loading issues
      try {
        // Force a full page refresh for navigation to avoid React Router cache issues
        window.history.back();
      } catch (error) {
        console.error('[BackspaceNavigation] Navigation error:', error);
        // Fallback to home if navigation fails
        navigate('/', { replace: true });
      }
    }, [navigate]),

    navigateHome: useCallback(() => {
      navigate('/', { replace: true });
    }, [navigate]),

    // Added: Force clean navigation without cache
    navigateWithRefresh: useCallback((path: string) => {
      window.location.href = path;
    }, [])
  };
};