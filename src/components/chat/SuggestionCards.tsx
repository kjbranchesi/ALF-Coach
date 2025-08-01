/**
 * SuggestionCards.tsx - Clickable suggestion cards
 * Replaces the broken star-symbol cards
 */

import React from 'react';
import { type SuggestionCard } from '../../core/types/SOPTypes';

interface SuggestionCardsProps {
  suggestions: SuggestionCard[];
  onSelect: (suggestion: SuggestionCard) => void;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({
  suggestions,
  onSelect
}) => {
  // Get color scheme based on category
  const getCardClass = (category: string) => {
    const baseClass = `
      p-4 rounded-xl cursor-pointer
      transition-all duration-200 ease-in-out
      hover:shadow-lg hover:-translate-y-1
      border-2
    `;
    
    switch (category) {
      case 'idea':
        return `${baseClass} bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600`;
      case 'whatif':
        return `${baseClass} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600`;
      default:
        return `${baseClass} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600`;
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'idea':
        return '💡';
      case 'whatif':
        return '🤔';
      default:
        return '📌';
    }
  };

  return (
    <div className="suggestion-cards px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
            className={getCardClass(suggestion.category)}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{getIcon(suggestion.category)}</span>
              <p className="flex-1 text-gray-800 dark:text-gray-200 leading-relaxed">
                {suggestion.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};