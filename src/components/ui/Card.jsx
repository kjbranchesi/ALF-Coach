// src/components/ui/Card.jsx
import React from 'react';
import clsx from 'clsx';

// FIX: Correctly implement the 'as' prop for polymorphism.
// Now the Card can be rendered as a 'div', 'form', or any other element.
const Card = React.forwardRef(({ className, as: As = 'div', ...props }, ref) => (
  <As
    ref={ref}
    className={clsx(
      'bg-surface-50 dark:bg-gray-800 rounded-lg shadow-md border border-neutral-200 dark:border-gray-700',
      className
    )}
    {...props}
  />
));

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex flex-col space-y-1.5 p-4', className)} // 8px grid: 16px padding
    {...props}
  />
));

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx('text-xl font-semibold leading-tight text-neutral-900 dark:text-gray-100', className)} // Modular scale 1.25× from 16px base
    {...props}
  />
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-sm text-neutral-500 dark:text-gray-400', className)}
    {...props}
  />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-4 pt-0', className)} {...props} /> // 8px grid: 16px padding
));

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex items-center p-4 pt-0', className)} // 8px grid: 16px padding
    {...props}
  />
));

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
