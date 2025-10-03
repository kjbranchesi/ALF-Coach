/**
 * SuggestionCards.tsx - Quick action suggestions with soft UI design
 * Features rounded corners, soft shadows, and smooth animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, HelpCircle, Target, Sparkles, ChevronRight, Rocket, Users } from 'lucide-react';
import { type SuggestionCard, type SuggestionCategory } from '../../core/types/SOPTypes';

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
  if (!suggestions || suggestions.length === 0) {return null;}

  const getCategoryStyle = (category: SuggestionCategory) => {
    switch (category) {
      case 'core':
        return {
          gradient: 'from-primary-400 to-primary-500',
          bgLight: 'bg-primary-50 dark:bg-primary-900/20',
          borderColor: 'border-primary-200 dark:border-blue-800',
          iconColor: 'text-primary-600 dark:text-primary-400',
          label: 'Core'
        };
      case 'cross':
        return {
          gradient: 'from-emerald-400 to-teal-500',
          bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          label: 'Cross'
        };
      case 'moonshot':
        return {
          gradient: 'from-fuchsia-400 to-purple-500',
          bgLight: 'bg-fuchsia-50 dark:bg-fuchsia-900/20',
          borderColor: 'border-fuchsia-200 dark:border-fuchsia-800',
          iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
          label: 'Moonshot'
        };
      case 'student-led':
        return {
          gradient: 'from-amber-400 to-orange-500',
          bgLight: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
          label: 'Student-led'
        };
      case 'whatif':
        return {
          gradient: 'from-sky-400 to-blue-500',
          bgLight: 'bg-sky-50 dark:bg-sky-900/20',
          borderColor: 'border-sky-200 dark:border-sky-800',
          iconColor: 'text-sky-700 dark:text-sky-300',
          label: 'What‑If'
        };
      default:
        return {
          gradient: 'from-gray-400 to-gray-500',
          bgLight: 'bg-gray-50 dark:bg-gray-900/20',  
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconColor: 'text-gray-600 dark:text-gray-400',
          label: 'Suggestion'
        };
    }
  };

  const getIcon = (suggestion: SuggestionCard) => {
    switch (suggestion.category) {
      case 'core': return Lightbulb;
      case 'cross': return Target;
      case 'moonshot': return Rocket;
      case 'student-led': return Users;
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
                  {/* Category pill */}
                  <div className="mb-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${style.bgLight} ${style.borderColor} border text-gray-600 dark:text-gray-300`}
                      aria-label={`Suggestion category: ${style.label}`}
                    >
                      {style.label}
                    </span>
                  </div>
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
