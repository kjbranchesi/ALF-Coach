import { useState, useCallback } from 'react';

export interface SidebarState {
  isOpen: boolean;
  isHovered: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  setIsHovered: (hovered: boolean) => void;
}

/**
 * Hook to manage sidebar visibility state
 * Handles both mobile slide-over and desktop collapsible rail patterns
 */
export function useSidebarState(defaultOpen = false): SidebarState {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isHovered, setIsHovered] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    isHovered,
    toggle,
    open,
    close,
    setIsHovered,
  };
}
