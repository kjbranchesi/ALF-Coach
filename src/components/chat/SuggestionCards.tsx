/**
 * SuggestionCards.tsx - Clickable suggestion cards with ALF design system
 * Features Lucide icons, soft shadows, and consistent styling
 */

import React from 'react';
import { type SuggestionCard } from '../../core/types/SOPTypes';
import { Card, Icon } from '../../design-system';

interface SuggestionCardsProps {
  suggestions: SuggestionCard[];
  onSelect: (suggestion: SuggestionCard) => void;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({
  suggestions,
  onSelect
}) => {
  // Get color scheme based on category
  const getCardProps = (category: string) => {
    switch (category) {
      case 'idea':
        return {
          className: 'bg-blue-50 border border-blue-200 hover:border-blue-400 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200',
          iconColor: '#3b82f6'
        };
      case 'whatif':
        return {
          className: 'bg-purple-50 border border-purple-200 hover:border-purple-400 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200',
          iconColor: '#8b5cf6'
        };
      default:
        return {
          className: 'bg-gray-50 border border-gray-200 hover:border-gray-400 hover:shadow-md transform hover:-translate-y-1 transition-all duration-200',
          iconColor: '#6b7280'
        };
    }
  };

  const getIconName = (category: string) => {
    switch (category) {
      case 'idea':
        return 'lightbulb';
      case 'whatif':
        return 'help';
      default:
        return 'target';
    }
  };

  return (
    <div className="suggestion-cards px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const cardProps = getCardProps(suggestion.category);
          const iconName = getIconName(suggestion.category);
          
          return (
            <Card
              key={suggestion.id}
              padding="md"
              className={`cursor-pointer ${cardProps.className}`}
              onClick={() => onSelect(suggestion)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon 
                    name={iconName as any} 
                    size="lg" 
                    color={cardProps.iconColor}
                  />
                </div>
                <p className="flex-1 text-gray-800 leading-relaxed font-medium">
                  {suggestion.text}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};