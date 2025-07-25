import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Rive, useRive, useStateMachineInput } from '@rive-app/react-canvas';

// Modern button with micro-interactions
export function AnimatedButton({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = '',
  icon: Icon,
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
  [key: string]: any;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Modern spring animation for press effect
  const handlePress = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const variantStyles = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={handlePress}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl px-4 py-2.5 font-medium
        transition-all duration-200 ease-out
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={{ scale: 0 }}
        whileTap={!disabled ? {
          scale: [0, 1.5],
          opacity: [0.4, 0],
        } : {}}
        transition={{ duration: 0.6 }}
        style={{
          background: variant === 'primary' 
            ? 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      
      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </span>
      
      {/* Subtle glow effect for primary buttons */}
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 -z-10 opacity-0"
          animate={{
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      )}
    </motion.button>
  );
}

// Interactive card with hover effects
export function AnimatedCard({ 
  children, 
  onClick,
  isActive = false,
  className = '',
  ...props 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        ${onClick ? 'cursor-pointer' : ''}
        ${isActive ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
        ${className}
      `}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Gradient follow effect */}
      {isHovered && onClick && (
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none"
          animate={{
            opacity: 0.1,
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.15), transparent 40%)`,
          }}
          transition={{ type: "tween", ease: "out", duration: 0.2 }}
        />
      )}
      
      {/* Shadow depth effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          boxShadow: isHovered && onClick
            ? '0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}
        transition={{ duration: 0.2 }}
      />
      
      {children}
    </motion.div>
  );
}

// Loading animation with modern spinner
export function AnimatedLoader({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-blue-400" />
      </motion.div>
    </div>
  );
}

// Progress ring animation
export function AnimatedProgressRing({ 
  progress, 
  size = 60,
  strokeWidth = 4,
  className = '' 
}: { 
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}