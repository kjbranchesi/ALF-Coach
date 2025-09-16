/**
 * AlfLogo Component - Official logo using layers icon and blue color scheme
 * Follows DESIGN-SOP.md requirements
 */

import React from 'react';
import { Layers } from 'lucide-react';

interface AlfLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const sizeMap = {
  sm: { icon: 20, text: 'text-lg' },
  md: { icon: 24, text: 'text-xl' },
  lg: { icon: 32, text: 'text-2xl' },
  xl: { icon: 40, text: 'text-3xl' },
};

export const AlfLogo: React.FC<AlfLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  textClassName = '',
}) => {
  const { icon: iconSize, text: textSize } = sizeMap[size];
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <Layers 
          size={iconSize} 
          className="text-primary-600 dark:text-primary-400" 
          strokeWidth={2}
        />
      </div>
      {showText && (
        <span className={`${textSize} font-bold text-gray-900 dark:text-gray-100 ${textClassName}`}>
          Alf
        </span>
      )}
    </div>
  );
};

export default AlfLogo;