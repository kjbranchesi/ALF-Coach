// src/components/ui/Card.jsx
import React from 'react';
import clsx from 'clsx';

// A flexible, polymorphic Card component system, adhering to the new design principles.
// The base card has gentle rounding and a subtle shadow for a modern, layered feel.

const Card = React.forwardRef(({ className, as: Component = 'div', ...props }, ref) => (
  <Component
    ref={ref}
    className={clsx(
      'rounded-lg border border-neutral-200 bg-white text-neutral-900 shadow-sm',
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, as: Component = 'h3', ...props }, ref) => (
  <Component
    ref={ref}
    className={clsx('text-2xl font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx('text-sm text-neutral-500', className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={clsx('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
