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
          gradient: 'from-blue-400 to-blue-500',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'whatif':
        return {
          gradient: 'from-blue-300 to-blue-400',
          bgLight: 'bg-blue-100 dark:bg-blue-900/30',
          borderColor: 'border-blue-300 dark:border-blue-700',
          iconColor: 'text-blue-700 dark:text-blue-300'
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
    <div className="px-4 py-3">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 px-2">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Suggestions for you
            </span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {suggestions.map((suggestion, index) => {
              const style = getCategoryStyle(suggestion.category);
              const IconComponent = getIcon(suggestion);
              
              return (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !disabled && onSelect(suggestion)}
                  disabled={disabled}
                  className={`
                    relative overflow-hidden
                    text-left p-5
                    bg-white dark:bg-gray-800
                    border-2 ${style.borderColor}
                    rounded-2xl
                    shadow-xl hover:shadow-2xl
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    group
                  `}
                >
              {/* Background gradient decoration */}
              <div 
                className={`
                  absolute top-0 right-0 w-24 h-24 
                  bg-gradient-to-br ${style.gradient}
                  opacity-10 dark:opacity-20
                  rounded-full blur-2xl
                  group-hover:scale-150 transition-transform duration-500
                `}
              />
              
              {/* Content */}
              <div className="relative flex items-start gap-3">
                <div className={`
                  flex-shrink-0 p-2 rounded-lg
                  ${style.bgLight}
                  group-hover:scale-110 transition-transform duration-200
                `}>
                  <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
                </div>
                
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                    {suggestion.text}
                  </p>
                  
                  {/* Hover indicator */}
                  <motion.div 
                    className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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