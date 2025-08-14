/**
 * ImprovedSuggestionCards.tsx
 * 
 * Beautiful suggestion cards matching StageInitiatorCards style
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  category: 'idea' | 'whatif' | 'resource';
}

interface ImprovedSuggestionCardsProps {
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  onDismiss: () => void;
}

export const ImprovedSuggestionCards: React.FC<ImprovedSuggestionCardsProps> = ({
  suggestions,
  onSelect,
  onDismiss
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'idea':
        return <Lightbulb className="w-5 h-5" />;
      case 'whatif':
        return <Sparkles className="w-5 h-5" />;
      case 'resource':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'idea':
        return {
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
          border: 'border-blue-200 dark:border-blue-700',
          hoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-900 dark:text-blue-100',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
        };
      case 'whatif':
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
          border: 'border-orange-200 dark:border-orange-700',
          hoverBorder: 'hover:border-orange-400 dark:hover:border-orange-600',
          icon: 'text-orange-600 dark:text-orange-400',
          title: 'text-orange-900 dark:text-orange-100',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
        };
      case 'resource':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
          border: 'border-purple-200 dark:border-purple-700',
          hoverBorder: 'hover:border-purple-400 dark:hover:border-purple-600',
          icon: 'text-purple-600 dark:text-purple-400',
          title: 'text-purple-900 dark:text-purple-100',
          badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
          border: 'border-gray-200 dark:border-gray-700',
          hoverBorder: 'hover:border-gray-400 dark:hover:border-gray-600',
          icon: 'text-gray-600 dark:text-gray-400',
          title: 'text-gray-900 dark:text-gray-100',
          badge: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
        };
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'idea':
        return 'Idea';
      case 'whatif':
        return 'What If';
      case 'resource':
        return 'Resource';
      default:
        return 'Suggestion';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Suggestions to explore
        </h4>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Dismiss
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-3">
        {suggestions.map((suggestion, index) => {
          const styles = getCategoryStyles(suggestion.category);
          
          return (
            <motion.button
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(suggestion)}
              className={`
                group text-left p-4 rounded-xl border-2 transition-all duration-200
                ${styles.bg} ${styles.border} ${styles.hoverBorder}
                hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              `}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 ${styles.icon} flex-shrink-0`}>
                  {getCategoryIcon(suggestion.category)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category Badge */}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${styles.badge}`}>
                    {getCategoryLabel(suggestion.category)}
                  </span>
                  
                  {/* Text */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {suggestion.text}
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
              
              {/* Hover Indicator */}
              <div className="flex items-center justify-end mt-3 pt-2 border-t border-gray-200/30 dark:border-gray-700/30">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to use
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        These suggestions are tailored to your current conversation. Click any to add it to your message.
      </p>
    </motion.div>
  );
};

export default ImprovedSuggestionCards;