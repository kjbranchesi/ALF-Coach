import React from 'react';
import { cn } from '../../../utils/cn';

export function SuggestionChips({ items, onSelect }: { items: string[]; onSelect: (t: string, index: number) => void }) {
  if (!items?.length) {return null;}
  return (
    <div className="mb-3 flex flex-col gap-2">
      {items.slice(0, 3).map((t, i) => (
        <button
          key={i}
          onClick={() => onSelect(t, i)}
          className={cn(
            'w-full text-left px-3.5 py-2.5 rounded-xl border',
            'border-primary-200/60 dark:border-primary-700/50',
            'bg-gradient-to-br from-white/95 via-white/90 to-primary-50/80',
            'dark:from-gray-800/95 dark:via-gray-800/90 dark:to-gray-900/95',
            'backdrop-blur-xl text-gray-900 dark:text-gray-100 text-[13px] font-medium',
            'shadow-[0_4px_12px_rgba(59,130,246,0.08),0_2px_4px_rgba(0,0,0,0.06)]',
            'dark:shadow-[0_4px_12px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.2)]',
            'hover:border-primary-300/80 dark:hover:border-primary-600/60',
            'hover:bg-gradient-to-br hover:from-white hover:to-primary-50',
            'dark:hover:from-gray-800 dark:hover:to-gray-900',
            'hover:shadow-[0_8px_20px_rgba(59,130,246,0.12),0_4px_8px_rgba(0,0,0,0.08)]',
            'dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.25)]',
            'transition-all duration-200 active:scale-[0.98]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400'
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
