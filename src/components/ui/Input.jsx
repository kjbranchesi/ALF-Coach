// src/components/ui/Input.jsx

import React from 'react';
import clsx from 'clsx';

const baseInputClasses =
  'w-full border rounded-md focus:outline-none focus:ring-2 text-base';

const variantClasses = {
  default: 'border-neutral-300 focus:ring-primary-500',
  error: 'border-red-500 focus:ring-red-500',
};

const Input = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  return (
    <input
      className={clsx(
        baseInputClasses,
        'px-4 py-3',
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
        'px-4 py-3 resize-none',
        variantClasses[variant],
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export { Input, Textarea };

