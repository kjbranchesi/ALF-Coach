import React from 'react';

interface EvidenceLogisticsStepProps {
  data: any;
  onUpdate: (data: Partial<any>) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete?: () => void;
}

export const EvidenceLogisticsStep: React.FC<EvidenceLogisticsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
  onComplete
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">EvidenceLogisticsStep</h3>
      <p className="text-slate-600 dark:text-slate-400">Step implementation coming soon.</p>
      
      <div className="flex justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button onClick={onBack} className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium">Back</button>
        <button onClick={onComplete || onNext} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium">
          {onComplete ? 'Complete' : 'Continue'}
        </button>
      </div>
    </div>
  );
};
