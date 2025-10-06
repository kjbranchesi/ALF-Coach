import React from 'react';

type DecisionBarProps = {
  primaryLabel: string;
  onPrimary(): void;
  primaryDisabled?: boolean;
  secondary?: Array<{ label: string; onClick(): void; tone?: 'default' | 'danger' }>;
  sticky?: boolean;
};

export function DecisionBar({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondary = [],
  sticky = true
}: DecisionBarProps) {
  return (
    <div
      className={`${
        sticky ? 'sticky bottom-0 left-0 right-0 z-30' : ''
      } mt-4 border-t border-gray-200/70 dark:border-gray-800/60 bg-white/95 dark:bg-gray-900/90 backdrop-blur py-3`}
    >
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="inline-flex items-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-50"
          >
            {primaryLabel}
          </button>
          {secondary.map(({ label, onClick, tone = 'default' }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold ${
                tone === 'danger'
                  ? 'border-rose-200 text-rose-600 hover:border-rose-300'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

