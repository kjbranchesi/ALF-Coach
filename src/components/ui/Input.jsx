// src/components/ui/Input.jsx

import React from 'react';
import clsx from 'clsx';

// Base classes for consistent styling across all input types.
const baseInputClasses =
  'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={clsx(baseInputClasses, className)}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = 'Input';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={clsx(baseInputClasses, 'min-h-[80px]', className)}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Input, Textarea };
