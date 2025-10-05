import React from 'react';

export function SuggestionChips({ items, onSelect }: { items: string[]; onSelect: (t: string) => void }) {
  if (!items?.length) {return null;}
  return (
    <div className="mb-3 flex flex-col gap-2">
      {items.slice(0, 3).map((t, i) => (
        <button
          key={i}
          onClick={() => onSelect(t)}
          className="w-full text-left px-3 py-2 rounded-2xl border border-white/60 dark:border-white/10 bg-white/65 dark:bg-gray-900/35 backdrop-blur-md text-gray-800 dark:text-gray-100 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-white/75 dark:hover:bg-gray-900/45 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_14px_36px_rgba(0,0,0,0.45)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
          >
          {t}
        </button>
      ))}
    </div>
  );
}
