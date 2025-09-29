import React from 'react';

interface Microcopy { what: string; why: string; tip: string }

interface StageGuideCardProps {
  microcopy: Microcopy;
  open: boolean;
  onToggle: () => void;
}

export const StageGuideCard: React.FC<StageGuideCardProps> = ({ microcopy, open, onToggle }) => {
  return (
    <div className="w-full rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/60 dark:bg-gray-800/30 backdrop-blur" data-testid="stage-guide">
      <div className="flex items-center justify-between px-3 py-1.5 md:hidden">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Context</span>
        <button
          onClick={onToggle}
          className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      <div className={`px-3 pb-2 ${open ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] sm:text-[11px]">
          <div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">What</div>
            <div className="text-gray-500 dark:text-gray-400 mt-0.5">{microcopy.what}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Why</div>
            <div className="text-gray-500 dark:text-gray-400 mt-0.5">{microcopy.why}</div>
          </div>
          <div>
            <div className="text-gray-600 dark:text-gray-300 font-medium">Tip</div>
            <div className="text-gray-500 dark:text-gray-400 mt-0.5">{microcopy.tip}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageGuideCard;

