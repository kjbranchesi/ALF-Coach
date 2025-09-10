import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface FlowChipProps {
  variant: 'diverge' | 'converge' | 'reflect';
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export const FlowChip: React.FC<FlowChipProps> = ({ 
  variant, 
  label, 
  ariaLabel,
  className = '' 
}) => {
  const config = {
    diverge: {
      icon: TrendingUp,
      defaultLabel: 'Diverge',
      color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
    },
    converge: {
      icon: TrendingDown,
      defaultLabel: 'Converge',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    },
    reflect: {
      icon: ArrowRight,
      defaultLabel: 'Reflect',
      color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    }
  };

  const { icon: Icon, defaultLabel, color } = config[variant];
  const displayLabel = label || defaultLabel;

  // Honor prefers-reduced-motion
  const motionClass = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? ''
    : 'transition-all duration-200';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${color} ${motionClass} ${className}`}
      aria-label={ariaLabel || `${displayLabel} phase`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{displayLabel}</span>
    </div>
  );
};