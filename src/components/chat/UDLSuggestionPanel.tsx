/**
 * UDLSuggestionPanel.tsx
 * 
 * Context-aware UDL suggestion panel that appears in the chat interface
 * Provides differentiation suggestions based on teacher-specified learner needs
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Users, 
  Eye, 
  Ear, 
  Hand, 
  Heart,
  Brain,
  Settings,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react';
import { DifferentiationProfile } from '../../features/wizard/components/DifferentiationOptionsStep';
import { 
  generateUDLSuggestions, 
  getPrioritizedSuggestions,
  UDLSuggestion,
  UDLSuggestionGroup 
} from '../../utils/udlEnhancedSuggestions';

interface UDLSuggestionPanelProps {
  currentStage: string;
  differentiationProfile: DifferentiationProfile | null;
  onSuggestionClick: (suggestion: UDLSuggestion) => void;
  onApplyAllSuggestions?: (suggestions: UDLSuggestion[]) => void;
  className?: string;
  compact?: boolean;
}

const UDL_PRINCIPLE_ICONS = {
  representation: Eye,
  engagement: Heart,
  action_expression: Hand
};

const UDL_PRINCIPLE_COLORS = {
  representation: 'blue',
  engagement: 'green', 
  action_expression: 'purple'
};

const UDL_PRINCIPLE_DESCRIPTIONS = {
  representation: 'Multiple ways to access and perceive information',
  engagement: 'Multiple ways to engage and motivate learners',
  action_expression: 'Multiple ways to demonstrate knowledge and skills'
};

export const UDLSuggestionPanel: React.FC<UDLSuggestionPanelProps> = ({
  currentStage,
  differentiationProfile,
  onSuggestionClick,
  onApplyAllSuggestions,
  className = '',
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  // Generate suggestions based on profile
  const suggestionGroups = useMemo(() => {
    if (!differentiationProfile) return [];
    return generateUDLSuggestions(currentStage, differentiationProfile);
  }, [currentStage, differentiationProfile]);

  // Get top priority suggestions for compact view
  const prioritySuggestions = useMemo(() => {
    if (!differentiationProfile) return [];
    return getPrioritizedSuggestions(currentStage, differentiationProfile, 4);
  }, [currentStage, differentiationProfile]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: UDLSuggestion) => {
    setAppliedSuggestions(prev => new Set([...prev, suggestion.id]));
    onSuggestionClick(suggestion);
  };

  // Handle apply all suggestions
  const handleApplyAll = (suggestions: UDLSuggestion[]) => {
    const newApplied = new Set(appliedSuggestions);
    suggestions.forEach(s => newApplied.add(s.id));
    setAppliedSuggestions(newApplied);
    onApplyAllSuggestions?.(suggestions);
  };

  // Reset applied suggestions when stage changes
  useEffect(() => {
    setAppliedSuggestions(new Set());
  }, [currentStage]);

  if (!differentiationProfile) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <Settings className="w-4 h-4" />
          <span className="text-sm">
            Set up differentiation options to see personalized suggestions
          </span>
        </div>
      </div>
    );
  }

  if (suggestionGroups.length === 0) {
    return (
      <div className={`bg-green-50 dark:bg-green-900/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
          <Check className="w-4 h-4" />
          <span className="text-sm">
            Great! No additional differentiation needed for this stage.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            UDL Suggestions
          </h3>
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
            {currentStage.replace('_', ' ').toLowerCase()}
          </span>
        </div>
        
        {compact && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {compact ? (
              // Compact view - show priority suggestions
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Top Recommendations
                  </span>
                  {prioritySuggestions.length > 0 && (
                    <button
                      onClick={() => handleApplyAll(prioritySuggestions)}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      Apply all
                    </button>
                  )}
                </div>
                
                {prioritySuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={handleSuggestionClick}
                    isApplied={appliedSuggestions.has(suggestion.id)}
                    compact={true}
                  />
                ))}
              </div>
            ) : (
              // Full view - show grouped suggestions
              <div className="p-4 space-y-4">
                {suggestionGroups.map((group, index) => (
                  <SuggestionGroupCard
                    key={index}
                    group={group}
                    isSelected={selectedGroup === group.title}
                    onToggle={() => setSelectedGroup(
                      selectedGroup === group.title ? null : group.title
                    )}
                    onSuggestionApply={handleSuggestionClick}
                    onApplyAll={() => handleApplyAll(group.suggestions)}
                    appliedSuggestions={appliedSuggestions}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface SuggestionCardProps {
  suggestion: UDLSuggestion;
  onApply: (suggestion: UDLSuggestion) => void;
  isApplied: boolean;
  compact?: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  isApplied,
  compact = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const IconComponent = UDL_PRINCIPLE_ICONS[suggestion.udlPrinciple];
  const colorClass = UDL_PRINCIPLE_COLORS[suggestion.udlPrinciple];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        border rounded-lg transition-all duration-200
        ${isApplied 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
          : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className={`
            p-1.5 rounded-lg
            ${colorClass === 'blue' ? 'bg-primary-100 dark:bg-primary-900/30' : ''}
            ${colorClass === 'green' ? 'bg-green-100 dark:bg-green-900/30' : ''}
            ${colorClass === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : ''}
          `}>
            <IconComponent className={`
              w-4 h-4
              ${colorClass === 'blue' ? 'text-primary-600 dark:text-primary-400' : ''}
              ${colorClass === 'green' ? 'text-green-600 dark:text-green-400' : ''}
              ${colorClass === 'purple' ? 'text-purple-600 dark:text-purple-400' : ''}
            `} />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              {suggestion.text}
            </p>
            
            {!compact && (
              <div className="flex flex-wrap gap-1 mb-2">
                {suggestion.targetNeeds.slice(0, 2).map((need) => (
                  <span
                    key={need}
                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                  >
                    {need.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                ))}
                {suggestion.targetNeeds.length > 2 && (
                  <span className="text-xs text-gray-400">
                    +{suggestion.targetNeeds.length - 2} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApply(suggestion)}
                disabled={isApplied}
                className={`
                  text-xs px-2 py-1 rounded transition-colors
                  ${isApplied
                    ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                  }
                `}
              >
                {isApplied ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Applied
                  </span>
                ) : (
                  'Apply'
                )}
              </button>
              
              {!compact && suggestion.implementation.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {showDetails && !compact && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            {suggestion.implementation.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Implementation:
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {suggestion.implementation.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-gray-400 mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {suggestion.examples.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Examples:
                </h4>
                <div className="flex flex-wrap gap-1">
                  {suggestion.examples.slice(0, 3).map((example, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

interface SuggestionGroupCardProps {
  group: UDLSuggestionGroup;
  isSelected: boolean;
  onToggle: () => void;
  onSuggestionApply: (suggestion: UDLSuggestion) => void;
  onApplyAll: () => void;
  appliedSuggestions: Set<string>;
}

const SuggestionGroupCard: React.FC<SuggestionGroupCardProps> = ({
  group,
  isSelected,
  onToggle,
  onSuggestionApply,
  onApplyAll,
  appliedSuggestions
}) => {
  const appliedCount = group.suggestions.filter(s => appliedSuggestions.has(s.id)).length;
  const priorityColors = {
    high: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
  };

  return (
    <div className={`border rounded-lg ${priorityColors[group.priority]}`}>
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">
                {group.title}
              </h3>
              <span className={`
                px-2 py-0.5 text-xs rounded-full
                ${group.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''}
                ${group.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : ''}
                ${group.priority === 'low' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : ''}
              `}>
                {group.priority} priority
              </span>
            </div>
            {appliedCount > 0 && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                {appliedCount}/{group.suggestions.length} applied
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {group.suggestions.length} suggestion{group.suggestions.length !== 1 ? 's' : ''}
            </span>
            {isSelected ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {group.description}
        </p>
      </button>
      
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Suggestions:
                </span>
                <button
                  onClick={onApplyAll}
                  disabled={appliedCount === group.suggestions.length}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:text-gray-400"
                >
                  Apply all ({group.suggestions.length - appliedCount} remaining)
                </button>
              </div>
              
              {group.suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onApply={onSuggestionApply}
                  isApplied={appliedSuggestions.has(suggestion.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UDLSuggestionPanel;