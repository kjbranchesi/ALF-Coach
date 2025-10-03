import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { useResponsiveLayout, useSidebarState } from '../hooks';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ResponsiveSidebar - Progressive disclosure sidebar that adapts to screen size
 *
 * Desktop (≥1024px): Collapsible rail that expands on hover/click
 * Mobile (<768px): Slide-over panel from left with backdrop
 * Tablet (768-1023px): Same as mobile
 */
export function ResponsiveSidebar({ children, className = '' }: ResponsiveSidebarProps) {
  const { isMobile, isDesktop } = useResponsiveLayout();
  const { isOpen, isHovered, toggle, close, setIsHovered } = useSidebarState(false);

  // Swipe gesture handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: close,
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  // Desktop: Collapsible rail
  if (isDesktop) {
    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence>
          <motion.div
            initial={false}
            animate={{
              width: isOpen || isHovered ? 280 : 48,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className={`
              h-screen bg-white border-r border-gray-200
              overflow-hidden flex flex-col
              dark:bg-slate-900 dark:border-slate-700
              ${className}
            `}
          >
            {/* Toggle button */}
            <button
              onClick={toggle}
              className="
                absolute top-4 right-2 z-10
                w-8 h-8 flex items-center justify-center
                rounded-md hover:bg-gray-100 dark:hover:bg-slate-800
                transition-colors
              "
              aria-label={isOpen || isHovered ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Sidebar content - only show when expanded */}
            <div className="flex-1 overflow-y-auto">
              {(isOpen || isHovered) ? children : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-gray-400 text-xs transform -rotate-90 whitespace-nowrap">
                    Draft
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Mobile/Tablet: Slide-over panel
  return (
    <>
      {/* Hamburger menu button */}
      <button
        onClick={toggle}
        className="
          fixed top-4 left-4 z-40
          w-10 h-10 flex items-center justify-center
          bg-white dark:bg-slate-800
          rounded-lg shadow-md
          hover:shadow-lg transition-shadow
        "
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Slide-over panel */}
      <Transition show={isOpen} as={React.Fragment}>
        <Dialog onClose={close} className="relative z-50">
          {/* Backdrop */}
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" />
          </Transition.Child>

          {/* Panel */}
          <Transition.Child
            as={React.Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel
              {...swipeHandlers}
              className={`
                fixed inset-y-0 left-0 w-full max-w-sm
                bg-white dark:bg-slate-900
                shadow-xl overflow-y-auto
                flex flex-col
                ${className}
              `}
            >
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Working Draft
                </h2>
                <button
                  onClick={close}
                  className="
                    w-8 h-8 flex items-center justify-center
                    rounded-md hover:bg-gray-100 dark:hover:bg-slate-800
                    transition-colors
                  "
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>

              {/* Footer hint */}
              <div className="p-4 text-xs text-gray-500 dark:text-gray-400 text-center border-t border-gray-200 dark:border-slate-700">
                Swipe left to close
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
