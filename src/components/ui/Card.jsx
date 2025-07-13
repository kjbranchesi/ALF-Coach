// src/components/ui/Card.jsx
import React from 'react';
import clsx from 'clsx';

// FIX: Correctly implement the 'as' prop for polymorphism.
// Now the Card can be rendered as a 'div', 'form', or any other element.
const Card = React.forwardRef(({ className, as: Component = 'div', ...props }, ref) => (
  <Component
    ref={ref}
    className={clsx(
      'bg-white rounded-2xl shadow-lg border border-neutral-200',
      className
    )}
    {...props}
  />
));

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={clsx('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-sm text-neutral-500', className)}
    {...props}
  />
));

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-6 pt-0', className)} {...props} />
));

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
