// SimplifiedActionButtons.jsx
// Simplified button display logic for cleaner UI

import React from 'react';
import { HelpChip } from './EnhancedCards.jsx';

// Determine what buttons to show based on message state
export const ActionButtons = ({ 
  message, 
  isAiLoading, 
  isStale, 
  onAction,
  flowContext 
}) => {
  if (!message || message.role === 'user') return null;

  // Priority 1: Quick replies (help chips)
  if (message.quickReplies?.length > 0) {
    return (
      <div className="mt-4 text-center">
        {message.quickReplies.map((reply, i) => (
          <HelpChip
            key={i}
            text={reply}
            onClick={onAction}
            disabled={isAiLoading || isStale}
          />
        ))}
      </div>
    );
  }

  // Priority 2: Suggestions (enhanced cards)
  if (message.suggestions?.length > 0) {
    return null; // Handled by parent component with EnhancedSuggestionCard
  }

  // Priority 3: Fallback help buttons (only if no other options and message asks a question)
  const needsHelpButtons = 
    !message.suggestions && 
    !message.quickReplies && 
    (message.chatResponse?.includes('?') || 
     message.chatResponse?.includes('What are your') || 
     message.chatResponse?.includes('Share your') ||
     message.chatResponse?.includes('What\'s your'));

  if (needsHelpButtons) {
    const defaultButtons = flowContext?.suggestedButtons || ['ideas', 'examples'];
    
    return (
      <div className="mt-4 text-center">
        {defaultButtons.map((buttonText, i) => (
          <HelpChip
            key={i}
            text={buttonText}
            onClick={onAction}
            disabled={isAiLoading || isStale}
          />
        ))}
      </div>
    );
  }

  return null;
};

// Simplified guidance header for suggestion groups
export const SuggestionGuidance = ({ suggestions }) => {
  if (!suggestions || suggestions.length <= 2) return null;
  
  // Don't show guidance for binary choices
  if (suggestions.some(s => s.includes('Keep and Continue'))) return null;

  const hasIdeas = suggestions.some(s => s.toLowerCase().startsWith('what if'));
  const hasRefinements = suggestions.some(s => 
    s.toLowerCase().includes('make it more') || 
    s.toLowerCase().includes('connect it more')
  );
  const hasExamples = suggestions.some(s => 
    !s.toLowerCase().startsWith('what if') && 
    !s.toLowerCase().includes('make it more') && 
    !s.toLowerCase().includes('connect it more')
  );

  // Only show if we have mixed types
  const typeCount = [hasIdeas, hasRefinements, hasExamples].filter(Boolean).length;
  if (typeCount <= 1) return null;

  return (
    <div className="mb-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span className="text-blue-500">ℹ️</span>
        <span className="font-medium">Choose your approach:</span>
      </div>
      <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-4">
        {hasIdeas && (
          <span><span className="font-medium">💡 Explore:</span> Develop ideas</span>
        )}
        {hasExamples && (
          <span><span className="font-medium">📋 Select:</span> Use a template</span>
        )}
        {hasRefinements && (
          <span><span className="font-medium">✨ Refine:</span> Improve your answer</span>
        )}
      </div>
    </div>
  );
};

// Binary choice buttons (Keep/Refine, Yes/No)
export const BinaryChoiceButtons = ({ 
  choices, 
  onAction, 
  disabled 
}) => {
  const isPrimaryChoice = (choice) => {
    return choice.includes('Continue') || 
           choice.includes('Keep') || 
           choice === 'Yes' ||
           choice === 'Use this';
  };

  return (
    <div>
      <div className="mb-3 text-center text-sm text-gray-600">
        <span className="font-medium">Make your choice:</span>
      </div>
      <div className="flex justify-center gap-3">
        {choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => onAction(choice)}
            disabled={disabled}
            className={`
              px-6 py-3 rounded-lg font-medium transition-all
              ${isPrimaryChoice(choice) 
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
              disabled:opacity-50 disabled:cursor-not-allowed
              transform hover:scale-105
            `}
          >
            {choice}
          </button>
        ))}
      </div>
    </div>
  );
};

export default {
  ActionButtons,
  SuggestionGuidance,
  BinaryChoiceButtons
};