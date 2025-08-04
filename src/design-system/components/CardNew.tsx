/**
 * Card Component - ALF Design System
 * 
 * A flexible card component with soft shadows and rounded corners
 * Supports dark mode and hover effects
 */

import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverable?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  noPadding = false,
  hoverable = false,
  shadow = 'md',
  onClick,
  ...props 
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-lg',
    lg: 'shadow-xl', 
    xl: 'shadow-2xl'
  };

  return (
    <div 
      className={cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl',
        shadowClasses[shadow],
        hoverable && 'hover:shadow-xl hover:scale-[1.01]',
        onClick && 'cursor-pointer',
        'transition-all duration-200',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'px-6 py-4',
        'border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'px-6 py-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={cn(
        'px-6 py-4',
        'border-t border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-900/50',
        'rounded-b-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};