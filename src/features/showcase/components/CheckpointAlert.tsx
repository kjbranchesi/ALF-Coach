import React from 'react';

interface CheckpointAlertProps {
  checkpoints: string[];
}

export default function CheckpointAlert({ checkpoints }: CheckpointAlertProps) {
  if (!Array.isArray(checkpoints) || checkpoints.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/30 dark:to-orange-950/20 border-2 border-amber-300/60 dark:border-amber-700/60 mt-4"
      role="alert"
      aria-label="Quality checkpoint"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-200/70 dark:bg-amber-800/50 flex items-center justify-center">
        <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300">
          Quality Checkpoint
        </div>
        <div className="space-y-1">
          {checkpoints.map((checkpoint, idx) => (
            <div key={idx} className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-snug">
              {checkpoint}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
