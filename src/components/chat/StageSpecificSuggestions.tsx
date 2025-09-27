/**
 * StageSpecificSuggestions - Context-aware suggestion cards for each PBL stage
 * Shows relevant examples and ideas based on current stage and user context
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, HelpCircle, Map, Package, Lightbulb, Zap, BookOpen } from 'lucide-react';
import { getStageSpecificSuggestions } from '../../utils/stageSpecificContent';

interface Suggestion {
  id: string;
  text: string;
  description?: string;
}

interface StageSpecificSuggestionsProps {
  stage: string;
  context: {
    subject?: string;
    gradeLevel?: string;
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
    projectTopic?: string;
  };
  onSelectSuggestion: (suggestion: string) => void;
  isVisible: boolean;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

export const StageSpecificSuggestions: React.FC<StageSpecificSuggestionsProps> = ({
  stage,
  context,
  onSelectSuggestion,
  isVisible,
  showDismiss = false,
  onDismiss
}) => {
  // Generate suggestions using the sophisticated content generator
  const getSuggestions = (): Suggestion[] => {
    // Get suggestions from the utility function
    const stageSuggestions = getStageSpecificSuggestions(stage, context);
    
    // Transform to the component's format, grouping by category
    const transformed: Suggestion[] = [];
    
    // Add idea suggestions
    const ideas = stageSuggestions.filter(s => s.category === 'idea');
    ideas.forEach((suggestion, index) => {
      transformed.push({
        id: suggestion.id,
        text: suggestion.text,
        description: 'Click to use this idea'
      });
    });
    
    // Add what-if suggestions
    const whatIfs = stageSuggestions.filter(s => s.category === 'whatif');
    whatIfs.forEach((suggestion) => {
      transformed.push({
        id: suggestion.id,
        text: suggestion.text,
        description: 'Explore possibilities'
      });
    });
    
    // Add resource suggestions
    const resources = stageSuggestions.filter(s => s.category === 'resource');
    resources.forEach((suggestion) => {
      transformed.push({
        id: suggestion.id,
        text: suggestion.text,
        description: 'Get more help'
      });
    });
    
    // Return max 6 suggestions for clean layout
    return transformed.slice(0, 6);
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'BIG_IDEA': return <Sparkles className="w-5 h-5" />;
      case 'ESSENTIAL_QUESTION': return <HelpCircle className="w-5 h-5" />;
      case 'CHALLENGE': return <Target className="w-5 h-5" />;
      case 'JOURNEY': return <Map className="w-5 h-5" />;
      case 'DELIVERABLES': return <Package className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  let suggestions = getSuggestions();
  // Keep it focused: maximum 4 pills, prefer variety
  suggestions = suggestions.slice(0, 4);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {getStageIcon()}
              <span className="font-medium">
                {stage === 'BIG_IDEA' ? 'Example Big Ideas' :
                 stage === 'ESSENTIAL_QUESTION' ? 'Example Questions' :
                 stage === 'CHALLENGE' ? 'Challenge Ideas' :
                 stage === 'JOURNEY' ? 'Journey Structures' :
                 'Suggestions'}
              </span>
            </div>
            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Hide
              </button>
            )}
          </div>

          {/* Compact pill chip row */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectSuggestion(suggestion.text)}
                className="
                  px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full text-xs sm:text-sm
                  bg-white/90 dark:bg-gray-900/80 backdrop-blur-md
                  border border-gray-200/80 dark:border-gray-700/80
                  text-gray-800 dark:text-gray-200
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 dark:focus-visible:ring-primary-700
                  transition-colors
                "
                aria-label={`Use suggestion: ${suggestion.text}`}
              >
                {suggestion.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StageSpecificSuggestions;
