// src/components/ui/Button.jsx

import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow-sm',
    cancel: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300',
    ghost: 'text-neutral-700 hover:text-neutral-900',
  };

  const sizes = {
    default: 'px-8 py-3 text-sm',
    sm: 'px-6 py-3 text-sm',
    icon: 'p-3',
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
