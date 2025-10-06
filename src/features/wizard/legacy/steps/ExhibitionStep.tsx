import React from 'react';
import type { StepComponentProps } from '../types';

export const ExhibitionStep: React.FC<StepComponentProps> = ({
  onNext,
  onBack,
  onComplete
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">ExhibitionStep</h3>
      <p className="text-slate-600 dark:text-slate-400">Step implementation coming soon.</p>
      
      {/* Navigation buttons removed - handled by wizard wrapper to avoid redundancy */}
    </div>
  );
};
