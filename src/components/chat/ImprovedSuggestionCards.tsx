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
          bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          hoverBorder: 'hover:border-blue-400',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          badge: 'bg-blue-100 text-blue-700'
        };
      case 'whatif':
        return {
          bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
          border: 'border-orange-200',
          hoverBorder: 'hover:border-orange-400',
          icon: 'text-orange-600',
          title: 'text-orange-900',
          badge: 'bg-orange-100 text-orange-700'
        };
      case 'resource':
        return {
          bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
          border: 'border-purple-200',
          hoverBorder: 'hover:border-purple-400',
          icon: 'text-purple-600',
          title: 'text-purple-900',
          badge: 'bg-purple-100 text-purple-700'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
          border: 'border-gray-200',
          hoverBorder: 'hover:border-gray-400',
          icon: 'text-gray-600',
          title: 'text-gray-900',
          badge: 'bg-gray-100 text-gray-700'
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
        <h4 className="text-sm font-semibold text-gray-700">
          Suggestions to explore
        </h4>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
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
                <div className={`p-2 rounded-lg bg-white/80 ${styles.icon} flex-shrink-0`}>
                  {getCategoryIcon(suggestion.category)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Category Badge */}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${styles.badge}`}>
                    {getCategoryLabel(suggestion.category)}
                  </span>
                  
                  {/* Text */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {suggestion.text}
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              {/* Hover Indicator */}
              <div className="flex items-center justify-end mt-3 pt-2 border-t border-gray-200/30">
                <span className="text-xs font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to use
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center mt-4">
        These suggestions are tailored to your current conversation. Click any to add it to your message.
      </p>
    </motion.div>
  );
};

export default ImprovedSuggestionCards;