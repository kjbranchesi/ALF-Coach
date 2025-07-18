// src/components/ui/Input.jsx

import React from 'react';
import clsx from 'clsx';

const baseInputClasses =
  'w-full border rounded-lg focus:outline-none focus:ring-2 text-base bg-surface-50 transition-colors';

const variantClasses = {
  default: 'border-neutral-300 focus:ring-primary-500 focus:border-primary-500',
  error: 'border-error-500 focus:ring-error-500 focus:border-error-500',
  success: 'border-success-500 focus:ring-success-500 focus:border-success-500',
};

const Input = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <input
      className={clsx(
        baseInputClasses,
        'px-3 py-2', // 8px grid: 12px + 8px padding
        variantClasses[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

const Textarea = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <textarea
      className={clsx(
        baseInputClasses,
        'px-3 py-2 resize-none', // 8px grid: 12px + 8px padding
        variantClasses[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Input, Textarea };

