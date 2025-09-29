import React from 'react';
import { Sparkles } from 'lucide-react';

export interface SuggestionEntry {
  id?: string | number;
  text: string;
  category?: string;
}

interface SuggestionPanelProps {
  suggestions: SuggestionEntry[];
  stageLabel?: string;
  onSelect: (s: SuggestionEntry) => void;
}

export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, stageLabel, onSelect }) => {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="flex flex-col gap-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">{stageLabel || 'Ideas'}</span>
        </div>
        <div className="mb-2 flex flex-wrap gap-1 text-[10px] text-gray-500 dark:text-gray-500"></div>
        {suggestions.slice(0, 3).map((s, index) => (
          <button
            key={s.id ?? index}
            onClick={() => onSelect(s)}
            className="w-full text-left p-3 min-h-[40px] bg-gray-50/60 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100/60 dark:hover:bg-gray-700/60 focus:outline-none focus:ring-1 focus:ring-gray-300/50 dark:focus:ring-gray-600/40 transition-all duration-200 group touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                {s.category && (
                  <span className="inline-block mb-0.5 px-1.5 py-0.5 rounded-full border text-[10px] text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-gray-900/40 border-gray-200/60 dark:border-gray-700/60">
                    {String(s.category).replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed truncate">{s.text}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPanel;

