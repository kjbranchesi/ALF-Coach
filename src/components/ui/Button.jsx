// src/components/ui/Button.jsx

import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 shadow-md',
    accent: 'bg-amber-500 text-neutral-900 hover:bg-amber-600 shadow-md',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
    cancel: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    ghost: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
    error: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
  };

  const sizes = {
    default: 'px-4 py-2 text-base', // 8px grid: 16px + 8px padding
    sm: 'px-3 py-1.5 text-sm', // 8px grid: 12px + 6px padding
    lg: 'px-6 py-3 text-lg', // 8px grid: 24px + 12px padding
    icon: 'p-2', // 8px grid: 8px padding
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

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
