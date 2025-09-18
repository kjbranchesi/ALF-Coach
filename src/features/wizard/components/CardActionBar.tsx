import React from 'react';
import { CheckCircle2, Wand2, RotateCcw } from 'lucide-react';

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
    <div className={`mt-3 flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={onAccept}
        disabled={disabled}
        className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 hover:bg-emerald-700"
      >
        <CheckCircle2 className="h-3.5 w-3.5" /> {acceptLabel}
      </button>
      <button
        type="button"
        onClick={onRefine}
        className="inline-flex items-center gap-1 rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-50 active:scale-95"
      >
        <Wand2 className="h-3.5 w-3.5" /> {refineLabel}
      </button>
      <button
        type="button"
        onClick={onReplace}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" /> {replaceLabel}
      </button>
    </div>
  );
};

export default CardActionBar;
