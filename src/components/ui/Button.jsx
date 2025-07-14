// src/components/ui/Button.jsx

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';

// Using cva for robust, scalable button components as per the design plan.
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600',
        // ADDED: Accent variant for high-contrast, critical calls-to-action.
        accent: 'bg-accent-500 text-white hover:bg-accent-600',
        destructive: 'bg-red-500 text-white hover:bg-red-500/90',
        outline: 'border border-primary-500 bg-transparent text-primary-500 hover:bg-primary-100',
        secondary: 'bg-secondary-500 text-white hover:bg-secondary-500/80',
        ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
        link: 'text-primary-900 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={clsx(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
