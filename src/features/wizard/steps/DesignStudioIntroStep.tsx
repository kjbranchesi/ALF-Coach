import React from 'react';
import { MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import type { StepComponentProps } from '../types';

export const DesignStudioIntroStep: React.FC<StepComponentProps> = ({
  data,
  onBack,
  onComplete
}) => {
  const context = data.projectContext || {};
  const standards = data.standards || [];

  const summaryItems = [
    {
      label: 'Grade band',
      value: context.gradeLevel || 'Not set'
    },
    {
      label: 'Subjects',
      value: (context.subjects || []).join(', ') || 'Not set'
    },
    {
      label: 'Duration',
      value: context.timeWindow || 'Not set'
    },
    {
      label: 'Cadence',
      value: context.cadence || 'Not set'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
          Phase complete
        </span>
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Great! ALF is ready to co-design the project with you.
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          We captured the essentials. Jump into the ALF Design Studio to draft goals, milestones, artifacts,
          and differentiation with the AI partner. You can hop back here any time to revise the setup.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex items-start gap-3">
          <span className="mt-1 rounded-xl bg-primary-100 p-2 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              What ALF sees now
            </h4>
            <ul className="grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
              {summaryItems.map(item => (
                <li key={item.label} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-500" />
                  <span className="leading-snug">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{item.label}:</span>{' '}
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
            {!!standards.length && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Focus standards
                </p>
                <div className="flex flex-wrap gap-2">
                  {standards.slice(0, 4).map(standard => (
                    <span
                      key={standard.code}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200/70 bg-slate-100/70 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                    >
                      {standard.code}
                    </span>
                  ))}
                  {standards.length > 4 && (
                    <span className="rounded-full bg-slate-200/60 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      +{standards.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
        <h4 className="flex items-center gap-2 text-base font-semibold text-slate-800 dark:text-slate-100">
          <Sparkles className="h-4 w-4 text-primary-500" />
          What happens next
        </h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-500" />
            <span>ALF drafts big ideas, milestones, and differentiation from what you shared.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-500" />
            <span>You can accept, refine, or replace suggestions inside the builder cards.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary-500" />
            <span>Every acceptance autosaves to your draft and keeps completeness tracking in sync.</span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => onComplete?.()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:-translate-y-0.5 hover:bg-primary-700"
        >
          Continue in the ALF Design Studio
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
