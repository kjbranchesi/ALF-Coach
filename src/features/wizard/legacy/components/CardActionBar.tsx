import React from 'react';
import { CheckCircle2, Wand2, RotateCcw } from 'lucide-react';

/**
 * Redesigned CardActionBar with minimal visual noise.
 * Uses subtle text links instead of prominent buttons to reduce cognitive load
 * while preserving all functionality.
 */

interface CardActionBarProps {
  onAccept: () => void;
  onRefine: () => void;
  onReplace: () => void;
  acceptLabel?: string;
  refineLabel?: string;
  replaceLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const CardActionBar: React.FC<CardActionBarProps> = ({
  onAccept,
  onRefine,
  onReplace,
  acceptLabel = 'Accept',
  refineLabel = 'Refine',
  replaceLabel = 'Replace',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`mt-2 flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={onAccept}
        disabled={disabled}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 className="h-3 w-3" /> {acceptLabel}
      </button>
      <button
        type="button"
        onClick={onRefine}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors"
      >
        <Wand2 className="h-3 w-3" /> {refineLabel}
      </button>
      <button
        type="button"
        onClick={onReplace}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:underline transition-colors"
      >
        <RotateCcw className="h-3 w-3" /> {replaceLabel}
      </button>
    </div>
  );
};

export default CardActionBar;
