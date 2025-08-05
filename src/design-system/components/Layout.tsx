/**
 * Layout Component System
 * Consistent spacing and layout patterns
 */

import React from 'react';

// Container component
interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className = '',
}) => {
  return (
    <div className={`
      w-full mx-auto px-4 sm:px-6 lg:px-8
      ${containerSizes[size]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Stack component for vertical layouts
interface StackProps {
  children: React.ReactNode;
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

const stackSpacing = {
  0: 'space-y-0',
  1: 'space-y-1',
  2: 'space-y-2',
  3: 'space-y-3',
  4: 'space-y-4',
  5: 'space-y-5',
  6: 'space-y-6',
  8: 'space-y-8',
};

const stackAlign = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 4,
  align = 'stretch',
  className = '',
}) => {
  return (
    <div className={`
      flex flex-col
      ${stackSpacing[spacing]}
      ${stackAlign[align]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Grid component
interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
};

const gridGap = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
};

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 3,
  gap = 4,
  className = '',
}) => {
  return (
    <div className={`
      grid
      ${gridCols[cols]}
      ${gridGap[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Card component
interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const cardShadow = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = 'sm',
  hover = false,
  className = '',
}) => {
  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
      ${cardPadding[padding]}
      ${cardShadow[shadow]}
      ${hover ? 'transition-shadow hover:shadow-md' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Section component
interface SectionProps {
  children: React.ReactNode;
  background?: 'white' | 'gray' | 'primary' | 'gradient';
  className?: string;
}

const sectionBackground = {
  white: 'bg-white dark:bg-gray-900',
  gray: 'bg-gray-50 dark:bg-gray-800',
  primary: 'bg-primary-50 dark:bg-gray-900',
  gradient: 'bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800',
};

export const Section: React.FC<SectionProps> = ({
  children,
  background = 'white',
  className = '',
}) => {
  return (
    <section className={`
      py-12 md:py-16 lg:py-20
      ${sectionBackground[background]}
      ${className}
    `}>
      {children}
    </section>
  );
};

// Divider component
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={`w-px h-full bg-gray-200 dark:bg-gray-700 ${className}`} />;
  }
  
  return <hr className={`border-gray-200 dark:border-gray-700 ${className}`} />;
};