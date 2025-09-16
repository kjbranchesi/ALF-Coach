/**
 * UIGuidanceSystemV2.tsx
 * Improved UI guidance with inline contextual buttons instead of floating buttons
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Lightbulb, HelpCircle, X, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIdleDetection } from '../../hooks/useIdleDetection';
import { getHelpContent, getContextualHelp } from '../../utils/helpContent';
import { getStageSuggestions, getRandomSuggestions } from '../../utils/suggestionContent';

interface Suggestion {
  id: string;
  text: string;
  category: 'idea' | 'whatif' | 'resource';
}

interface UIGuidanceSystemV2Props {
  currentStage: string;
  currentStep?: string;
  userContext?: {
    subject?: string;
    ageGroup?: string;
    location?: string;
    educatorPerspective?: string;
  };
  onSuggestionSelect: (suggestion: string) => void;
  inputValue?: string;
  lastInteractionTime?: number;
  isWaiting?: boolean;
  messageId?: string; // To associate with specific message
  messageContent?: string; // For contextual help
}

// Inline button component for chat messages
export const InlineActionButton: React.FC<{
  type: 'ideas' | 'help';
  onClick: () => void;
  label?: string;
}> = ({ type, onClick, label }) => {
  const Icon = type === 'ideas' ? Lightbulb : HelpCircle;
  const defaultLabel = type === 'ideas' ? 'Get Ideas' : 'Learn More';
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
        type === 'ideas' 
          ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100 border border-purple-200'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-primary-700 hover:from-blue-100 hover:to-indigo-100 border border-primary-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label || defaultLabel}</span>
    </motion.button>
  );
};

// Suggestion card component for inline display
export const InlineSuggestionCards: React.FC<{
  suggestions: Suggestion[];
  onSelect: (suggestion: Suggestion) => void;
  onDismiss: () => void;
}> = ({ suggestions, onSelect, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">Suggestions</span>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Dismiss suggestions"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="grid gap-2">
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(suggestion)}
            className={`text-left p-3 rounded-lg border transition-all ${
              suggestion.category === 'idea'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400'
                : suggestion.category === 'whatif'
                ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 hover:border-orange-400'
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-primary-200 hover:border-primary-400'
            }`}
          >
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{suggestion.text}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Help content component for inline display
export const InlineHelpContent: React.FC<{
  title: string;
  content: string;
  tips?: string[];
  examples?: string[];
  onDismiss: () => void;
}> = ({ title, content, tips, examples, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-primary-200 shadow-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary-600" />
          <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
          aria-label="Dismiss help"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{content}</p>
      
      {tips && tips.length > 0 && (
        <div className="space-y-1 mb-3">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Tips:</span>
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-primary-500 mt-0.5">•</span>
              <span className="text-sm text-gray-600">{tip}</span>
            </div>
          ))}
        </div>
      )}
      
      {examples && examples.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-primary-100">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Examples:</span>
          {examples.map((example, index) => (
            <div key={index} className="flex items-start gap-2">
              <ChevronRight className="w-3 h-3 text-primary-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 italic">{example}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Main UI Guidance System component
export const UIGuidanceSystemV2: React.FC<UIGuidanceSystemV2Props> = ({
  currentStage,
  currentStep,
  userContext,
  onSuggestionSelect,
  inputValue = '',
  lastInteractionTime = Date.now(),
  isWaiting = false,
  messageId,
  messageContent
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Use the custom idle detection hook
  const { isIdle, idleSeconds } = useIdleDetection(lastInteractionTime, {
    threshold: 15000,
    onIdle: () => {
      // Auto-show suggestions when idle (if not already showing something)
      if (!showHelp && !showSuggestions && !inputValue && !isWaiting) {
        setShowSuggestions(true);
      }
    },
    disabled: isWaiting || inputValue.length > 0
  });
  
  // Generate contextual suggestions
  const generateSuggestions = useCallback((): Suggestion[] => {
    // Use the improved suggestion system
    const suggestions = getStageSuggestions(currentStage, currentStep);
    
    // If no suggestions found, get random ones for the stage
    if (suggestions.length === 0) {
      return getRandomSuggestions(currentStage, 6);
    }
    
    // Personalize based on context if needed
    if (userContext?.subject) {
      // Future enhancement: filter or modify suggestions based on subject
      // For now, return suggestions as is
    }
    
    return suggestions;
  }, [currentStage, currentStep, userContext]);
  
  // Generate help content using the context-aware system
  const getHelpContentForDisplay = useCallback(() => {
    // Use the context-aware help system
    if (messageContent) {
      return getContextualHelp(messageContent, currentStage);
    }
    return getHelpContent(currentStage, currentStep);
  }, [currentStage, currentStep, messageContent]);
  
  const suggestions = generateSuggestions();
  const helpContent = getHelpContentForDisplay();
  
  // Hide suggestions when user types
  useEffect(() => {
    if (inputValue.length > 0) {
      setShowSuggestions(false);
      setShowHelp(false);
    }
  }, [inputValue]);
  
  // This component returns the inline elements to be rendered within chat messages
  return (
    <div className="space-y-2">
      {/* Action buttons row */}
      <div className="flex gap-2 mt-2">
        <InlineActionButton
          type="ideas"
          onClick={() => {
            setShowSuggestions(!showSuggestions);
            setShowHelp(false);
          }}
        />
        <InlineActionButton
          type="help"
          onClick={() => {
            setShowHelp(!showHelp);
            setShowSuggestions(false);
          }}
        />
        
        {/* Show idle indicator */}
        {isIdle && !showSuggestions && !showHelp && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-2 text-xs text-gray-500 italic"
          >
            Need help? Click a button above
          </motion.span>
        )}
      </div>
      
      {/* Suggestions display */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <InlineSuggestionCards
            suggestions={suggestions}
            onSelect={(suggestion) => {
              onSuggestionSelect(suggestion.text);
              setShowSuggestions(false);
            }}
            onDismiss={() => setShowSuggestions(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Help display */}
      <AnimatePresence>
        {showHelp && (
          <InlineHelpContent
            title={helpContent.title}
            content={helpContent.description}
            tips={helpContent.tips}
            examples={helpContent.examples}
            onDismiss={() => setShowHelp(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UIGuidanceSystemV2;