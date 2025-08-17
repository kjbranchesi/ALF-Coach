/**
 * SmartSuggestionButton.tsx
 * 
 * Single intelligent button that adapts based on context
 * Replaces the three separate buttons (Ideas/Examples/What If) with one smart button
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { ImprovedSuggestionCards } from './ImprovedSuggestionCards';
import { getStageSuggestions } from '../../utils/suggestionContent';

interface SmartSuggestionButtonProps {
  stage: string;
  messageContent?: string;
  onSuggestionSelect: (suggestion: string) => void;
  disabled?: boolean;
}

export const SmartSuggestionButton: React.FC<SmartSuggestionButtonProps> = ({
  stage,
  messageContent,
  onSuggestionSelect,
  disabled = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Determine button text based on context
  const getButtonText = () => {
    // Analyze context to provide appropriate label
    if (stage === 'BIG_IDEA' || stage === 'IDEATION_INTRO') {
      return 'Get Ideas';
    }
    if (stage === 'ESSENTIAL_QUESTION' || stage === 'CHALLENGE') {
      return 'See Examples';
    }
    if (stage === 'JOURNEY' || stage === 'DELIVERABLES') {
      return 'Get Suggestions';
    }
    return 'Get Started';
  };
  
  const handleClick = () => {
    setShowSuggestions(!showSuggestions);
  };
  
  const handleSuggestionSelect = (suggestion: { text: string }) => {
    onSuggestionSelect(suggestion.text);
    setShowSuggestions(false);
  };
  
  return (
    <div className="relative">
      {/* Smart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={disabled}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5
          bg-gradient-to-r from-blue-500 to-blue-600
          hover:from-blue-600 hover:to-blue-700
          text-white font-medium text-sm
          rounded-xl shadow-lg hover:shadow-xl
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${showSuggestions ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
        `}
      >
        <Sparkles className="w-4 h-4" />
        <span>{getButtonText()}</span>
        <motion.div
          animate={{ rotate: showSuggestions ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.button>
      
      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 z-50 min-w-[320px]"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    AI Suggestions
                  </span>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              {/* Suggestions */}
              <div className="p-3 max-h-96 overflow-y-auto">
                <ImprovedSuggestionCards
                  suggestions={getStageSuggestions(stage).map(s => ({
                    id: s.id,
                    text: s.text,
                    category: s.category as 'idea' | 'whatif' | 'resource'
                  }))}
                  onSelect={handleSuggestionSelect}
                  onDismiss={() => setShowSuggestions(false)}
                />
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click any suggestion to use it in your response
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSuggestionButton;