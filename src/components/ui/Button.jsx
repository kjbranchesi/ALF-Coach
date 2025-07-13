// src/components/ui/Button.jsx

import React from 'react';
import clsx from 'clsx';

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  // FIX: Using specific color classes (purple, green) that are known to work with the Tailwind config,
  // instead of relying on the abstract 'primary' and 'secondary' theme colors.
  const variants = {
    primary: 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm',
    secondary: 'bg-green-600 text-white hover:bg-green-700 shadow-sm',
    cancel: 'bg-slate-200 text-slate-700 hover:bg-slate-300',
    ghost: 'text-slate-700 hover:text-slate-900',
  };

  const sizes = {
    default: 'px-8 py-3 text-sm',
    sm: 'px-6 py-3 text-sm',
    icon: 'p-3',
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

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
