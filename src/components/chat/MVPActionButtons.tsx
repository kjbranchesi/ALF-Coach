/**
 * MVPActionButtons - Simple three-button system for clear user actions
 * Replaces the confusing single button with context-aware options
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Send, Lightbulb, HelpCircle } from 'lucide-react';

interface MVPActionButtonsProps {
  stage: string;
  userInput: string;
  onPrimaryAction: () => void;
  onShowSuggestions: () => void;
  onShowHelp: () => void;
  isTyping?: boolean;
}

export const MVPActionButtons: React.FC<MVPActionButtonsProps> = ({
  stage,
  userInput,
  onPrimaryAction,
  onShowSuggestions,
  onShowHelp,
  isTyping = false
}) => {
  // Determine primary button label based on stage and context
  const getPrimaryButtonLabel = () => {
    if (!userInput.trim()) {
      switch (stage) {
        case 'BIG_IDEA':
          return 'I have an idea';
        case 'ESSENTIAL_QUESTION':
          return 'I have a question';
        case 'CHALLENGE':
          return 'I have a challenge';
        case 'JOURNEY':
          return 'Plan activities';
        case 'DELIVERABLES':
          return 'Define deliverables';
        default:
          return 'Continue';
      }
    }
    // If user has typed something
    return 'Send';
  };

  const getPrimaryIcon = () => {
    if (!userInput.trim()) {
      return null; // No icon when showing stage-specific label
    }
    return <Send className="w-4 h-4" />;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Primary Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onPrimaryAction}
        disabled={isTyping}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium
          transition-all duration-200
          ${userInput.trim() 
            ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-blue-600/20' 
            : 'bg-primary-100 hover:bg-primary-200 text-primary-700'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {getPrimaryIcon()}
        <span>{getPrimaryButtonLabel()}</span>
      </motion.button>

      {/* Show Suggestions Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onShowSuggestions}
        disabled={isTyping}
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-lg
          bg-white hover:bg-gray-50 text-gray-700
          border border-gray-300 hover:border-gray-400
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <Lightbulb className="w-4 h-4 text-yellow-500" />
        <span className="hidden sm:inline">
          {stage === 'BIG_IDEA' ? 'Show examples' :
           stage === 'ESSENTIAL_QUESTION' ? 'Example questions' :
           stage === 'CHALLENGE' ? 'Suggest challenges' :
           stage === 'JOURNEY' ? 'Activity ideas' :
           'Get ideas'}
        </span>
        <span className="sm:hidden">Ideas</span>
      </motion.button>

      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onShowHelp}
        disabled={isTyping}
        className="
          flex items-center gap-2 px-4 py-2.5 rounded-lg
          bg-white hover:bg-gray-50 text-gray-700
          border border-gray-300 hover:border-gray-400
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <HelpCircle className="w-4 h-4 text-primary-500" />
        <span className="hidden sm:inline">
          {stage === 'BIG_IDEA' ? "What's a Big Idea?" :
           stage === 'ESSENTIAL_QUESTION' ? 'Help me understand' :
           stage === 'CHALLENGE' ? 'What makes a good challenge?' :
           'Get help'}
        </span>
        <span className="sm:hidden">Help</span>
      </motion.button>
    </div>
  );
};

export default MVPActionButtons;