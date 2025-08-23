/**
 * Optimized Icons Component
 * 
 * Reduces lucide-react bundle impact by providing commonly used icons
 * as lightweight SVG components instead of importing the entire library.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// Core chat icons as lightweight SVG components
export const SendIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

export const MenuIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12"/>
    <line x1="4" x2="20" y1="6" y2="6"/>
    <line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18"/>
    <path d="m6 6 12 12"/>
  </svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

export const LayersIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
  </svg>
);

export const MapIcon: React.FC<IconProps> = ({ 
  size = 24, 
  className = "", 
  strokeWidth = 2 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.617a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/>
    <path d="M15 5.764v15"/>
    <path d="M9 3.236v15"/>
  </svg>
);

// Utility function to get optimized icon (for gradual migration)
export const getOptimizedIcon = (iconName: string) => {
  const icons: Record<string, React.FC<IconProps>> = {
    Send: SendIcon,
    Menu: MenuIcon,
    X: XIcon,
    Lightbulb: LightbulbIcon,
    Layers: LayersIcon,
    Map: MapIcon,
  };
  
  return icons[iconName] || null;
};