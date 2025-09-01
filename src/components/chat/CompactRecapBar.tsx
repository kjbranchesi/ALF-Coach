import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface CompactRecapBarProps {
  savedLabel?: string;
  savedValue?: string;
  nextLabel?: string;
  onNext?: () => void;
}

// Compact, pill-shaped inline recap bar
export const CompactRecapBar: React.FC<CompactRecapBarProps> = ({
  savedLabel,
  savedValue,
  nextLabel,
  onNext,
}) => {
  const truncated = (s?: string, n: number = 80) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 shadow-sm">
        {savedLabel && (
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <Check className="w-3 h-3" />
            </span>
            <span className="font-medium">Saved:</span>
            <span className="text-gray-900 dark:text-gray-100">{savedLabel}</span>
            {savedValue && (
              <span className="text-gray-500 dark:text-gray-400">• {truncated(savedValue, 60)}</span>
            )}
          </div>
        )}

        {nextLabel && (
          <button
            onClick={onNext}
            className="ml-auto text-sm inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
          >
            Next: {nextLabel}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

