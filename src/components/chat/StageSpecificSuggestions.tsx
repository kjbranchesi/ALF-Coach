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

  const suggestions = getSuggestions();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 space-y-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
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
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Hide
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  console.log('[StageSpecificSuggestions] Card clicked:', suggestion.text);
                  onSelectSuggestion(suggestion.text);
                }}
                className="
                  text-left p-4 rounded-lg bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700
                  hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md
                  transition-all duration-200 group cursor-pointer
                "
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1">
                      {suggestion.text}
                    </p>
                    {suggestion.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                  {/* Category icon */}
                  {suggestion.id.includes('whatif') && (
                    <Zap className="w-4 h-4 text-amber-500 ml-2 mt-0.5" />
                  )}
                  {suggestion.id.includes('resource') && (
                    <BookOpen className="w-4 h-4 text-green-500 ml-2 mt-0.5" />
                  )}
                  {suggestion.id.includes('bi-') || suggestion.id.includes('eq-') || suggestion.id.includes('ch-') && (
                    <Lightbulb className="w-4 h-4 text-primary-500 ml-2 mt-0.5" />
                  )}
                </div>
                <span className="text-xs text-primary-500 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity mt-2 inline-block">
                  Click to use →
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StageSpecificSuggestions;