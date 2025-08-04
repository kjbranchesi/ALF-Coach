// src/components/ui/Button.jsx

import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl dark:bg-blue-500 dark:hover:bg-blue-600',
    secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 shadow-lg hover:shadow-xl dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600',
    accent: 'bg-amber-500 text-gray-900 hover:bg-amber-600 shadow-lg hover:shadow-xl',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl',
    cancel: 'bg-gray-200 text-gray-900 hover:bg-gray-300 shadow hover:shadow-md dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500',
    ghost: 'text-gray-900 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-100 dark:hover:text-blue-400 dark:hover:bg-gray-700',
    error: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
    soft: 'bg-white text-blue-600 border border-blue-200 shadow-lg hover:shadow-xl hover:text-blue-700 hover:border-blue-300 dark:bg-gray-800 dark:border-blue-500/30 dark:text-blue-400',
  };

  const sizes = {
    default: 'px-4 py-2 text-base', // 8px grid: 16px + 8px padding
    sm: 'px-3 py-1.5 text-sm', // 8px grid: 12px + 6px padding
    lg: 'px-6 py-3 text-lg', // 8px grid: 24px + 12px padding
    icon: 'p-2', // 8px grid: 8px padding
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5';

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
