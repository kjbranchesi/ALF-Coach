/**
 * Enhanced Button Component
 * Implements Material Design 3 and Apple HIG patterns
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Ripple effect for Material Design interactions
const useRipple = () => {
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    
    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
    
    setTimeout(() => {
      circle.remove();
    }, 600);
  };
  
  return createRipple;
};

// Button variants using class-variance-authority
const buttonVariants = cva(
  [
    'alf-button',
    'relative overflow-hidden',
    'inline-flex items-center justify-center',
    'font-medium text-sm',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ],
  {
    variants: {
      variant: {
        filled: [
          'alf-button--filled',
          'bg-primary text-primary-foreground',
          'shadow-md hover:shadow-lg',
          'hover:-translate-y-0.5',
          'active:translate-y-0',
        ],
        outlined: [
          'alf-button--outlined',
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        text: [
          'alf-button--text',
          'bg-transparent text-primary',
          'hover:bg-primary/10',
        ],
        elevated: [
          'alf-button--elevated',
          'bg-surface text-primary',
          'shadow-sm hover:shadow-md',
          'hover:bg-primary/5',
        ],
        tonal: [
          'alf-button--tonal',
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
        ],
        ghost: [
          'bg-transparent text-foreground',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
        ],
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 text-xs',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10 p-0',
      },
      shape: {
        default: 'rounded-lg',
        pill: 'rounded-full',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      variant: 'filled',
      size: 'default',
      shape: 'default',
    },
  }
);

// Ripple animation styles
const rippleStyles = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple 600ms linear;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  children: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  hapticFeedback?: boolean; // Apple HIG haptic feedback
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      asChild = false,
      children,
      startIcon,
      endIcon,
      loading = false,
      hapticFeedback = false,
      onClick,
      ...props
    },
    ref
  ) => {
    const createRipple = useRipple();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Material Design ripple effect
      if (variant === 'filled' || variant === 'tonal') {
        createRipple(event);
      }

      // Apple HIG haptic feedback simulation
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(10); // Light haptic feedback
      }

      onClick?.(event);
    };

    // Add ripple styles to document if not already present
    React.useEffect(() => {
      if (!document.getElementById('ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = rippleStyles;
        document.head.appendChild(style);
      }
    }, []);

    const content = (
      <>
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
        )}
        {!loading && startIcon && (
          <span className="mr-2">{startIcon}</span>
        )}
        {children}
        {!loading && endIcon && (
          <span className="ml-2">{endIcon}</span>
        )}
      </>
    );

    return (
      <button
        className={cn(buttonVariants({ variant, size, shape, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={loading || props.disabled}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Floating Action Button component
export interface FABProps extends Omit<ButtonProps, 'variant' | 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  extended?: boolean;
  icon: React.ReactNode;
  label?: string;
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      className,
      position = 'bottom-right',
      extended = false,
      icon,
      label,
      children,
      ...props
    },
    ref
  ) => {
    const positionClasses = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
    };

    return (
      <Button
        ref={ref}
        className={cn(
          'alf-fab fixed z-50 shadow-lg',
          positionClasses[position],
          extended ? 'alf-fab--extended' : '',
          className
        )}
        variant="filled"
        size={extended ? 'default' : 'icon'}
        shape="pill"
        {...props}
      >
        {icon}
        {extended && (label || children)}
      </Button>
    );
  }
);

FAB.displayName = 'FAB';

// Export both components
export { Button, FAB, buttonVariants };