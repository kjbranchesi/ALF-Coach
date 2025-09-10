import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

export type ProcessMode = 'diverge' | 'converge' | 'reflect';
export type ProcessPhase = 'discover' | 'define' | 'develop' | 'deliver' | 'reflect';

interface ProcessIndicatorProps {
  phase: ProcessPhase;
  mode: ProcessMode;
  className?: string;
}

export const ProcessIndicator: React.FC<ProcessIndicatorProps> = ({ phase, mode, className = '' }) => {
  const modeConfig = {
    diverge: {
      icon: TrendingUp,
      label: 'Diverge',
      description: 'Explore options',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    },
    converge: {
      icon: TrendingDown,
      label: 'Converge',
      description: 'Make decisions',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    reflect: {
      icon: ArrowRight,
      label: 'Reflect',
      description: 'Capture learnings',
      color: 'bg-gradient-to-r from-emerald-500 to-teal-500'
    }
  };

  const phaseLabels = {
    discover: 'Discover',
    define: 'Define',
    develop: 'Develop',
    deliver: 'Deliver',
    reflect: 'Reflect'
  };

  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Phase Label */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {phaseLabels[phase]}
        </span>
        <span className="text-slate-400 dark:text-slate-600">→</span>
      </div>
      
      {/* Mode Indicator */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </div>
      
      {/* Description */}
      <span className="text-sm text-slate-600 dark:text-slate-400 italic">
        {config.description}
      </span>
    </div>
  );
};

// Double Diamond visualization component
export const DoubleDiamondDiagram: React.FC<{ currentPhase?: ProcessPhase }> = ({ currentPhase }) => {
  const phases: { phase: ProcessPhase; mode: ProcessMode; label: string }[] = [
    { phase: 'discover', mode: 'diverge', label: 'Discover' },
    { phase: 'define', mode: 'converge', label: 'Define' },
    { phase: 'develop', mode: 'diverge', label: 'Develop' },
    { phase: 'deliver', mode: 'converge', label: 'Deliver' },
    { phase: 'reflect', mode: 'reflect', label: 'Reflect' }
  ];

  return (
    <div className="flex items-center justify-center gap-1 py-8">
      {phases.map((p, i) => {
        const isActive = p.phase === currentPhase;
        const isDiverge = p.mode === 'diverge';
        const isConverge = p.mode === 'converge';
        const isReflect = p.mode === 'reflect';
        
        return (
          <div key={p.phase} className="relative">
            {/* Diamond shape or reflection bar */}
            {isReflect ? (
              <div className={`w-20 h-16 flex items-center justify-center ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}>
                <div className="w-full h-1 bg-current rounded"></div>
              </div>
            ) : (
              <div className={`relative w-20 h-16 ${
                isActive ? 'text-blue-600' : 'text-slate-300 dark:text-slate-600'
              }`}>
                <svg viewBox="0 0 80 64" className="w-full h-full fill-current">
                  {isDiverge ? (
                    // Diverge diamond (expanding)
                    <path d="M 0 32 L 40 8 L 40 56 Z" />
                  ) : (
                    // Converge diamond (narrowing)
                    <path d="M 40 8 L 80 32 L 40 56 Z" />
                  )}
                </svg>
              </div>
            )}
            
            {/* Phase label */}
            <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
              isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {p.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};