import React from 'react';
import {
  stageOrder,
  validate,
  type CapturedData,
  type Stage
} from '../domain/stages';

interface CompactStageStepperProps {
  currentStage: Stage;
  captured: CapturedData;
  labels: Record<Stage, string>;
  onSelectStage?: (stage: Stage) => void;
}

function stageKeyToAria(stage: Stage, labels: Record<Stage, string>) {
  return `${labels[stage]} stage`;
}

export function CompactStageStepper({
  currentStage,
  captured,
  labels,
  onSelectStage
}: CompactStageStepperProps) {
  return (
    <nav
      className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-gray-200/70 bg-white/80 px-3 py-2 shadow-sm dark:border-gray-700/60 dark:bg-gray-800/70"
      aria-label="Project design progress"
    >
      <ol className="flex items-center gap-2" role="list">
        {stageOrder.map((stage, index) => {
          const isCurrent = stage === currentStage;
          const isComplete = validate(stage, captured).ok;
          const isClickable = onSelectStage && isComplete && !isCurrent;

          return (
            <React.Fragment key={stage}>
              <li>
                <button
                  type="button"
                  onClick={() => isClickable && onSelectStage?.(stage)}
                  disabled={!isClickable}
                  className={`h-9 min-w-[44px] rounded-full px-3 text-xs font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    isCurrent
                      ? 'bg-primary-600 text-white shadow'
                      : isComplete
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  } ${
                    isClickable
                      ? 'hover:scale-[1.02] active:scale-[0.99]'
                      : 'cursor-default'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={stageKeyToAria(stage, labels)}
                >
                  {labels[stage]}
                </button>
              </li>
              {index < stageOrder.length - 1 && (
                <li aria-hidden className="h-0.5 w-6 rounded-full bg-gray-300 dark:bg-gray-700" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export default CompactStageStepper;
