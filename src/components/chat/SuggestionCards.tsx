/**
 * SuggestionCards.tsx - Quick action suggestions with soft UI design
 * Features rounded corners, soft shadows, and smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '../../design-system/components/Icon';

interface Suggestion {
  id: string;
  text: string;
  icon?: string;
  category?: 'idea' | 'question' | 'action' | 'example';
}

interface SuggestionCardsProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (suggestion: Suggestion) => void;
  disabled?: boolean;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ 
  suggestions, 
  onSelectSuggestion,
  disabled = false
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const getCategoryStyle = (category?: string) => {
    switch (category) {
      case 'idea':
        return {
          gradient: 'from-amber-400 to-orange-500',
          bgLight: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400'
        };
      case 'question':
        return {
          gradient: 'from-blue-400 to-cyan-500',
          bgLight: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400'
        };
      case 'action':
        return {
          gradient: 'from-green-400 to-emerald-500',
          bgLight: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-600 dark:text-green-400'
        };
      case 'example':
        return {
          gradient: 'from-purple-400 to-pink-500',
          bgLight: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400'
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

  const getIcon = (suggestion: Suggestion) => {
    if (suggestion.icon) return suggestion.icon;
    switch (suggestion.category) {
      case 'idea': return 'lightbulb';
      case 'question': return 'help';
      case 'action': return 'zap';
      case 'example': return 'book';
      default: return 'target';
    }
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2 px-2">
        <Icon name="sparkles" size="sm" className="text-blue-500 dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Suggestions for you
        </span>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion, index) => {
          const style = getCategoryStyle(suggestion.category);
          const icon = getIcon(suggestion);
          
          return (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !disabled && onSelectSuggestion(suggestion)}
              disabled={disabled}
              className={`
                relative overflow-hidden
                text-left p-4
                bg-white dark:bg-gray-800
                border-2 ${style.borderColor}
                rounded-xl
                shadow-md hover:shadow-lg
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
                  <Icon name={icon} size="sm" className={style.iconColor} />
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
                    <Icon name="chevronRight" size="xs" className="text-gray-400 dark:text-gray-500" />
                  </motion.div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};