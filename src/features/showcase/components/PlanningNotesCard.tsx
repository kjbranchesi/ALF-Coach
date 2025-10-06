import React from 'react';

interface PlanningNotesCardProps {
  notes: string;
}

export default function PlanningNotesCard({ notes }: PlanningNotesCardProps) {
  if (!notes) {
    return null;
  }

  return (
    <div className="squircle-pure border border-amber-200/70 dark:border-amber-700/70 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/15 px-5 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-200/70 dark:bg-amber-800/50 flex items-center justify-center">
          <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 mb-2">
            Planning & Coordination Notes
          </h3>
          <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-100">
            {notes}
          </p>
        </div>
      </div>
    </div>
  );
}
