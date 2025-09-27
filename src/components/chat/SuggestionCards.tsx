/**
 * SuggestionCards.tsx - Quick action suggestions with soft UI design
 * Features rounded corners, soft shadows, and smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, HelpCircle, Target, Sparkles, ChevronRight } from 'lucide-react';
import { type SuggestionCard } from '../../core/types/SOPTypes';

interface SuggestionCardsProps {
  suggestions: SuggestionCard[];
  onSelect: (suggestion: SuggestionCard) => void;
  disabled?: boolean;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ 
  suggestions, 
  onSelect,
  disabled = false
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const getCategoryStyle = (category: 'idea' | 'whatif') => {
    switch (category) {
      case 'idea':
        return {
          gradient: 'from-primary-400 to-primary-500',
          bgLight: 'bg-primary-50 dark:bg-primary-900/20',
          borderColor: 'border-primary-200 dark:border-blue-800',
          iconColor: 'text-primary-600 dark:text-primary-400'
        };
      case 'whatif':
        return {
          gradient: 'from-primary-300 to-primary-400',
          bgLight: 'bg-primary-100 dark:bg-primary-900/30',
          borderColor: 'border-primary-300 dark:border-blue-700',
          iconColor: 'text-primary-700 dark:text-primary-300'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-500',
          bgLight: 'bg-gray-50 dark:bg-gray-900/20',  
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconColor: 'text-gray-600 dark:text-gray-400'
        };
    }
  };

  const getIcon = (suggestion: SuggestionCard) => {
    switch (suggestion.category) {
      case 'idea': return Lightbulb;
      case 'whatif': return HelpCircle;
      default: return Target;
    }
  };

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="w-4 h-4 text-primary-500 dark:text-primary-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Suggestions for you
            </span>
          </div>
          
          <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion, index) => {
              const style = getCategoryStyle(suggestion.category);
              const IconComponent = getIcon(suggestion);
              
              return (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !disabled && onSelect(suggestion)}
                  disabled={disabled}
                  className={`
                    relative overflow-hidden text-left p-3 sm:p-4
                    bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
                    border ${style.borderColor}
                    rounded-lg sm:rounded-xl
                    shadow-sm hover:shadow-md
                    transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed group
                  `}
                >
              {/* Minimal background tint only */}
              
              {/* Content */}
              <div className="relative flex items-start gap-3">
                <div className={`
                  flex-shrink-0 p-2 rounded-lg ${style.bgLight}
                  group-hover:scale-105 transition-transform duration-150
               `}>
                  <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                    {suggestion.text}
                  </p>
                  
                  {/* Hover indicator */}
                  <motion.div 
                    className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Click to use
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </div>
              </div>
            </motion.button>
          );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
