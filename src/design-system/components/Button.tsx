/**
 * Button Component System
 * Unified button with consistent variants and states
 */

import React from 'react';
import { Icon } from './Icon';
import type { IconName } from './Icon';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses = {
  primary: `
    bg-primary-500 text-white
    hover:bg-primary-600 active:bg-primary-700
    focus:ring-primary-500
    disabled:bg-gray-300
  `,
  secondary: `
    bg-white text-gray-700 border border-gray-300
    hover:bg-gray-50 active:bg-gray-100
    focus:ring-gray-500
    disabled:bg-gray-100 disabled:text-gray-400
  `,
  ghost: `
    bg-transparent text-gray-700
    hover:bg-gray-100 active:bg-gray-200
    focus:ring-gray-500
    disabled:text-gray-400
  `,
  danger: `
    bg-red-500 text-white
    hover:bg-red-600 active:bg-red-700
    focus:ring-red-500
    disabled:bg-gray-300
  `,
  success: `
    bg-green-500 text-white
    hover:bg-green-600 active:bg-green-700
    focus:ring-green-500
    disabled:bg-gray-300
  `,
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
}) => {
  const isDisabled = disabled || loading;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Icon name="refresh" size="sm" className="animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <Icon name={leftIcon} size="sm" />}
          {children}
          {rightIcon && <Icon name={rightIcon} size="sm" />}
        </>
      )}
    </button>
  );
};

// Button Group component
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`inline-flex rounded-lg shadow-sm ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isFirst = index === 0;
          const isLast = index === React.Children.count(children) - 1;
          
          return React.cloneElement(child as React.ReactElement<ButtonProps>, {
            className: `
              ${child.props.className || ''}
              ${!isFirst && '-ml-px'}
              ${isFirst ? 'rounded-r-none' : ''}
              ${isLast ? 'rounded-l-none' : ''}
              ${!isFirst && !isLast ? 'rounded-none' : ''}
            `,
          });
        }
        return child;
      })}
    </div>
  );
};

// Icon-only button variant
interface IconButtonProps {
  icon: IconName;
  label: string; // For accessibility
  variant?: ButtonProps['variant'];
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}) => {
  const iconSizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
  };
  
  const paddingClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${variantClasses[variant]}
        ${paddingClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      <Icon name={icon} size={iconSizeMap[size]} />
    </button>
  );
};