import React from 'react';

export function SuggestionChips({ items, onSelect }: { items: string[]; onSelect: (t: string) => void }) {
  if (!items?.length) return null;
  return (
    <div className="mb-3 flex flex-col gap-2">
      {items.slice(0, 3).map((t, i) => (
        <button
          key={i}
          onClick={() => onSelect(t)}
          className="w-full text-left px-3 py-2 rounded-xl border bg-white hover:bg-gray-50 text-gray-800"
        >
          {t}
        </button>
      ))}
    </div>
  );
}

