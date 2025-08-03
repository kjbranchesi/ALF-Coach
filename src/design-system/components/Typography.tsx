/**
 * Typography Component System
 * Consistent text styling across the application
 */

import React from 'react';

// Heading component
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'muted';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const headingSizes = {
  1: 'text-5xl leading-tight tracking-tight',
  2: 'text-4xl leading-tight tracking-tight',
  3: 'text-3xl leading-tight',
  4: 'text-2xl leading-normal',
  5: 'text-xl leading-normal',
  6: 'text-lg leading-normal',
};

const colorClasses = {
  default: 'text-gray-900',
  primary: 'text-primary-600',
  secondary: 'text-gray-700',
  muted: 'text-gray-500',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Heading: React.FC<HeadingProps> = ({
  level,
  children,
  className = '',
  color = 'default',
  weight = 'semibold',
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Tag
      className={`
        ${headingSizes[level]}
        ${colorClasses[color]}
        ${weightClasses[weight]}
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

// Text component
interface TextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'error' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const textColorClasses = {
  ...colorClasses,
  error: 'text-red-600',
  success: 'text-green-600',
};

export const Text: React.FC<TextProps> = ({
  children,
  size = 'base',
  color = 'default',
  weight = 'normal',
  className = '',
  as: Tag = 'p',
}) => {
  return (
    <Tag
      className={`
        ${textSizes[size]}
        ${textColorClasses[color]}
        ${weightClasses[weight]}
        leading-relaxed
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

// Label component for forms
interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  children,
  required = false,
  className = '',
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        block text-sm font-medium text-gray-700 mb-1
        ${className}
      `}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Caption component for small text
interface CaptionProps {
  children: React.ReactNode;
  color?: 'default' | 'muted' | 'error' | 'success';
  className?: string;
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  color = 'muted',
  className = '',
}) => {
  return (
    <Text
      size="sm"
      color={color}
      className={`${className}`}
      as="span"
    >
      {children}
    </Text>
  );
};

// Code component for inline code
interface CodeProps {
  children: React.ReactNode;
  className?: string;
}

export const Code: React.FC<CodeProps> = ({
  children,
  className = '',
}) => {
  return (
    <code
      className={`
        px-1.5 py-0.5 rounded bg-gray-100 text-sm font-mono text-gray-800
        ${className}
      `}
    >
      {children}
    </code>
  );
};

// Link component
interface LinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  color?: 'primary' | 'default';
}

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  external = false,
  className = '',
  color = 'primary',
}) => {
  const colorClass = color === 'primary' 
    ? 'text-primary-600 hover:text-primary-700' 
    : 'text-gray-700 hover:text-gray-900';
    
  const externalProps = external ? {
    target: '_blank',
    rel: 'noopener noreferrer',
  } : {};
  
  return (
    <a
      href={href}
      className={`
        ${colorClass}
        underline decoration-1 underline-offset-2
        transition-colors
        ${className}
      `}
      {...externalProps}
    >
      {children}
    </a>
  );
};