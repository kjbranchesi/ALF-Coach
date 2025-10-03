/**
 * EnhancedButton.tsx
 * Material Design 3 + Apple HIG button component
 */

import React, { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-medium transition-all duration-200 relative overflow-hidden touch-target state-layer-hover haptic-light',
  {
    variants: {
      // Material Design 3 variants
      variant: {
        filled: [
          'bg-primary-500 dark:bg-primary-600 text-white',
          'hover:bg-primary-600 dark:hover:bg-primary-700 active:bg-primary-700 dark:active:bg-primary-800',
          'shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-0',
          'before:absolute before:inset-0 before:bg-white before:opacity-0',
          'hover:before:opacity-10 active:before:opacity-20',
        ],
        tonal: [
          'bg-primary-100 text-primary-700',
          'hover:bg-primary-200 active:bg-primary-300',
          'dark:bg-primary-900/20 dark:text-primary-300',
          'dark:hover:bg-primary-900/30 dark:active:bg-primary-900/40',
        ],
        outlined: [
          'border border-outline text-primary-600',
          'hover:bg-primary-50 active:bg-primary-100',
          'dark:border-outline-variant dark:text-primary-400',
          'dark:hover:bg-primary-900/10 dark:active:bg-primary-900/20',
        ],
        text: [
          'text-primary-600',
          'hover:bg-primary-50 active:bg-primary-100',
          'dark:text-primary-400',
          'dark:hover:bg-primary-900/10 dark:active:bg-primary-900/20',
        ],
        elevated: [
          'bg-surface-container text-primary-600',
          'shadow-elevation-1 hover:shadow-elevation-2',
          'hover:bg-primary-50 active:bg-primary-100',
          'dark:bg-surface-container-high dark:text-primary-400',
        ],
        // Apple HIG inspired
        ios: [
          'bg-primary-500 dark:bg-primary-600 text-white',
          'hover:bg-primary-600 dark:hover:bg-primary-700 active:scale-[0.97]',
          'shadow-sm hover:shadow-md',
          'rounded-ios-lg',
        ],
        glass: [
          'glass-medium text-primary-600 dark:text-primary-400',
          'hover:glass-strong hover:scale-[1.02]',
          'active:scale-[0.98]',
          'shadow-glass hover:shadow-glass-hover',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
        md: 'h-11 px-6 text-base rounded-xl gap-2',
        lg: 'h-14 px-8 text-lg rounded-2xl gap-2.5',
        icon: 'h-10 w-10 rounded-xl',
        fab: 'h-14 w-14 rounded-2xl shadow-elevation-3 hover:shadow-elevation-4',
        'fab-extended': 'h-14 px-6 rounded-2xl shadow-elevation-3 hover:shadow-elevation-4',
      },
      // Color variants
      color: {
        primary: '',
        ai: [
          '[&.filled]:bg-ai-500 [&.filled]:dark:bg-ai-600 [&.filled]:hover:bg-ai-600 [&.filled]:dark:hover:bg-ai-700',
          '[&.tonal]:bg-ai-100 [&.tonal]:dark:bg-ai-900/30 [&.tonal]:text-ai-700 [&.tonal]:dark:text-ai-400',
          '[&.outlined]:border-ai-300 [&.outlined]:dark:border-ai-700 [&.outlined]:text-ai-600 [&.outlined]:dark:text-ai-400',
          '[&.text]:text-ai-600 [&.text]:dark:text-ai-400',
        ],
        coral: [
          '[&.filled]:bg-coral-500 [&.filled]:dark:bg-coral-600 [&.filled]:hover:bg-coral-600 [&.filled]:dark:hover:bg-coral-700',
          '[&.tonal]:bg-coral-100 [&.tonal]:dark:bg-coral-900/30 [&.tonal]:text-coral-700 [&.tonal]:dark:text-coral-400',
          '[&.outlined]:border-coral-300 [&.outlined]:dark:border-coral-700 [&.outlined]:text-coral-600 [&.outlined]:dark:text-coral-400',
          '[&.text]:text-coral-600 [&.text]:dark:text-coral-400',
        ],
        success: [
          '[&.filled]:bg-success-500 [&.filled]:dark:bg-success-600 [&.filled]:hover:bg-success-600 [&.filled]:dark:hover:bg-success-700',
          '[&.tonal]:bg-success-100 [&.tonal]:dark:bg-success-900/30 [&.tonal]:text-success-700 [&.tonal]:dark:text-success-400',
          '[&.outlined]:border-success-300 [&.outlined]:dark:border-success-700 [&.outlined]:text-success-600 [&.outlined]:dark:text-success-400',
          '[&.text]:text-success-600 [&.text]:dark:text-success-400',
        ],
        warning: [
          '[&.filled]:bg-warning-500 [&.filled]:dark:bg-warning-600 [&.filled]:hover:bg-warning-600 [&.filled]:dark:hover:bg-warning-700',
          '[&.tonal]:bg-warning-100 [&.tonal]:dark:bg-warning-900/30 [&.tonal]:text-warning-700 [&.tonal]:dark:text-warning-400',
          '[&.outlined]:border-warning-300 [&.outlined]:dark:border-warning-700 [&.outlined]:text-warning-600 [&.outlined]:dark:text-warning-400',
          '[&.text]:text-warning-600 [&.text]:dark:text-warning-400',
        ],
        error: [
          '[&.filled]:bg-error-500 [&.filled]:dark:bg-error-600 [&.filled]:hover:bg-error-600 [&.filled]:dark:hover:bg-error-700',
          '[&.tonal]:bg-error-100 [&.tonal]:dark:bg-error-900/30 [&.tonal]:text-error-700 [&.tonal]:dark:text-error-400',
          '[&.outlined]:border-error-300 [&.outlined]:dark:border-error-700 [&.outlined]:text-error-600 [&.outlined]:dark:text-error-400',
          '[&.text]:text-error-600 [&.text]:dark:text-error-400',
        ],
      },
      fullWidth: {
        true: 'w-full',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
      },
      loading: {
        true: 'cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      color: 'primary',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ripple?: boolean;
}

const EnhancedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      color,
      fullWidth,
      disabled,
      loading,
      leftIcon,
      rightIcon,
      children,
      ripple = true,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled) {return;}

      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    };

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({
            variant,
            size,
            color,
            fullWidth,
            disabled: disabled || loading,
            loading,
            className,
          }),
          variant && `${variant}` // Add variant class for color modifiers
        )}
        disabled={disabled || loading}
        onMouseDown={handleRipple}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}

        {/* Button content */}
        <span className={cn('relative z-10 flex items-center gap-2', loading && 'opacity-0')}>
          {leftIcon}
          {children}
          {rightIcon}
        </span>

        {/* Material Design ripple effect */}
        {ripple &&
          ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: '2px',
                height: '2px',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, buttonVariants };