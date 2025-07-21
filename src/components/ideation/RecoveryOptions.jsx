// RecoveryOptions.jsx
// Recovery system for users who get stuck in the ideation flow

import React from 'react';

// Start Over button that appears when users are stuck
export const StartOverButton = ({ currentStep, onStartOver }) => {
  return (
    <button
      onClick={onStartOver}
      className="fixed top-20 right-6 bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-400 transition-all shadow-md hover:shadow-lg"
    >
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Start Over - {currentStep === 'bigIdea' ? 'Big Idea' : currentStep === 'essentialQuestion' ? 'Essential Question' : 'Challenge'}
      </span>
    </button>
  );
};

// Skip button for users who want to move forward
export const SkipStepButton = ({ currentStep, onSkip, disabled }) => {
  if (disabled) return null;
  
  return (
    <div className="mt-4 text-center">
      <button
        onClick={onSkip}
        className="text-sm text-gray-500 hover:text-purple-600 underline transition-colors"
      >
        Skip this step for now →
      </button>
    </div>
  );
};

// Recovery message when AI fails
export const RecoveryMessage = ({ error, onRetry }) => {
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg my-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-medium text-amber-900 mb-1">
            Let's try a different approach
          </p>
          <p className="text-sm text-amber-800 mb-3">
            I'm having trouble understanding. Here are some options to help you move forward:
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onRetry('examples')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Show me examples
            </button>
            <button
              onClick={() => onRetry('skip')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stuck detector - shows help after too many attempts
export const StuckHelper = ({ attemptCount, currentStep, onAction }) => {
  if (attemptCount < 3) return null;
  
  const stepHelp = {
    bigIdea: {
      title: "Having trouble with your Big Idea?",
      tips: [
        "Think of a broad theme that excites you",
        "Consider what aspect of your subject fascinates you most",
        "What real-world problem do you want students to explore?"
      ],
      example: "For Urban Planning, you might use: 'Sustainable Urban Development' or 'Cities of the Future'"
    },
    essentialQuestion: {
      title: "Need help with your Essential Question?",
      tips: [
        "Start with 'How might...' or 'What if...'",
        "Make it open-ended with multiple possible answers",
        "Connect it directly to your Big Idea"
      ],
      example: "For 'Sustainable Urban Development', you might ask: 'How might we design cities that balance growth with environmental protection?'"
    },
    challenge: {
      title: "Stuck on the Challenge?",
      tips: [
        "Think about what students will create or do",
        "Make it concrete and actionable",
        "Connect it to real-world work"
      ],
      example: "Students could 'Design a sustainable neighborhood plan for a growing city'"
    }
  };
  
  const help = stepHelp[currentStep] || stepHelp.bigIdea;
  
  return (
    <div className="fixed bottom-24 right-6 max-w-sm bg-white rounded-lg shadow-xl border-2 border-purple-300 p-5">
      <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
        <span className="text-2xl">💡</span>
        {help.title}
      </h3>
      
      <ul className="space-y-2 mb-4">
        {help.tips.map((tip, i) => (
          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      
      <p className="text-xs text-gray-600 italic mb-4">
        Example: {help.example}
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={() => onAction('use_example')}
          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Use this example
        </button>
        <button
          onClick={() => onAction('see_more')}
          className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
        >
          See more examples
        </button>
      </div>
    </div>
  );
};

export default {
  StartOverButton,
  SkipStepButton,
  RecoveryMessage,
  StuckHelper
};