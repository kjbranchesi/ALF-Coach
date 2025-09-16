import React from 'react';
import { generateId } from '../utils/accessibility';

/**
 * Skip to main content link
 */
export const SkipToMainContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
};

/**
 * Create accessible tooltip
 */
export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  id?: string;
}

export const AccessibleTooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  id = generateId('tooltip') 
}) => {
  return (
    <div className="relative group">
      <div aria-describedby={id}>
        {children}
      </div>
      <div
        id={id}
        role="tooltip"
        className="absolute invisible group-hover:visible bg-gray-900 text-white text-sm rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
      >
        {content}
      </div>
    </div>
  );
};

/**
 * Accessible loading indicator
 */
export const AccessibleLoadingIndicator: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
      <span className="sr-only">{message}</span>
    </div>
  );
};