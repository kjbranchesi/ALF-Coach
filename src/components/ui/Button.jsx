// src/components/ui/Button.jsx

import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  // Professional Design System Color Palette
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-md',
    secondary: 'bg-success-500 text-white hover:bg-success-600 shadow-md', // Legacy support
    accent: 'bg-accent-400 text-neutral-900 hover:bg-accent-500 shadow-md',
    success: 'bg-success-500 text-white hover:bg-success-600 shadow-md', 
    cancel: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300',
    ghost: 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100',
    error: 'bg-error-600 text-white hover:bg-error-700 shadow-md',
  };

  const sizes = {
    default: 'px-4 py-2 text-base', // 8px grid: 16px + 8px padding
    sm: 'px-3 py-1.5 text-sm', // 8px grid: 12px + 6px padding
    lg: 'px-6 py-3 text-lg', // 8px grid: 24px + 12px padding
    icon: 'p-2', // 8px grid: 8px padding
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant] || variants.primary,
        sizes[size] || sizes.default,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Button };
