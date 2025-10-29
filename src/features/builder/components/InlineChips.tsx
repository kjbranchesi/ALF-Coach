/**
 * InlineChips - Field-level AI suggestion chips
 *
 * Shows up to 2 AI suggestions underneath form inputs with Accept buttons.
 * "More..." button opens the assistant panel.
 */

import React, { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';
import type { FieldSuggestion } from '../hooks/useStageAI';

interface InlineChipsProps {
  suggestions: FieldSuggestion[];
  loading?: boolean;
  onAccept: (suggestion: FieldSuggestion, index: number) => void;
  onMore?: () => void;
  limit?: number;
}

export function InlineChips({
  suggestions,
  loading,
  onAccept,
  onMore,
  limit = 2
}: InlineChipsProps) {
  const [acceptedIndex, setAcceptedIndex] = useState<number | null>(null);

  // Reset accepted state when suggestions change
  useEffect(() => {
    setAcceptedIndex(null);
  }, [suggestions]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Getting suggestions...</span>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  const displayedSuggestions = suggestions.slice(0, limit);
  const hasMore = suggestions.length > limit;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {displayedSuggestions.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => {
            setAcceptedIndex(idx);
            onAccept(suggestion, idx);
          }}
          disabled={acceptedIndex !== null}
          className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-900 dark:text-purple-100 text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {acceptedIndex === idx ? (
            <>
              <Check className="w-3 h-3" />
              <span>Accepted</span>
            </>
          ) : (
            <>
              <span className="max-w-xs truncate">{suggestion.text}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-600 dark:text-purple-400 font-semibold">
                ✓ Accept
              </span>
            </>
          )}
        </button>
      ))}

      {hasMore && onMore && (
        <button
          onClick={onMore}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors"
        >
          More...
        </button>
      )}
    </div>
  );
}
