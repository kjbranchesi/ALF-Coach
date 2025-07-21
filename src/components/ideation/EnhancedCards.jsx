// EnhancedCards.jsx
// Improved card components with better visual hierarchy for ideation flow

import React from 'react';

// Enhanced suggestion card with clear type indicators
export const EnhancedSuggestionCard = ({ suggestion, type, onClick, disabled }) => {
  const cardStyles = {
    idea: {
      gradient: 'from-purple-50 to-purple-100',
      border: 'border-purple-300',
      borderLeft: 'border-l-4 border-l-purple-500',
      icon: '💡',
      label: 'EXPLORE IDEA',
      labelBg: 'bg-purple-100',
      labelText: 'text-purple-700',
      hoverBg: 'hover:from-purple-100 hover:to-purple-200',
      iconBg: 'bg-purple-200',
      primaryText: 'text-purple-900',
      secondaryText: 'text-purple-700'
    },
    example: {
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-300',
      borderLeft: 'border-l-4 border-l-green-500',
      icon: '📋',
      label: 'USE EXAMPLE',
      labelBg: 'bg-green-100',
      labelText: 'text-green-700',
      hoverBg: 'hover:from-green-100 hover:to-green-200',
      iconBg: 'bg-green-200',
      primaryText: 'text-green-900',
      secondaryText: 'text-green-700'
    },
    refine: {
      gradient: 'from-amber-50 to-amber-100',
      border: 'border-amber-300',
      borderLeft: 'border-l-4 border-l-amber-500',
      icon: '✨',
      label: 'REFINE',
      labelBg: 'bg-amber-100',
      labelText: 'text-amber-700',
      hoverBg: 'hover:from-amber-100 hover:to-amber-200',
      iconBg: 'bg-amber-200',
      primaryText: 'text-amber-900',
      secondaryText: 'text-amber-700'
    }
  };

  // Determine card type
  const getCardType = () => {
    if (type) return type;
    
    const lowerSuggestion = suggestion.toLowerCase();
    if (lowerSuggestion.includes('what if')) return 'idea';
    if (lowerSuggestion.includes('make it more') || 
        lowerSuggestion.includes('connect it more') || 
        lowerSuggestion.includes('focus it on')) return 'refine';
    return 'example';
  };

  const style = cardStyles[getCardType()];

  return (
    <button
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className={`
        relative w-full text-left p-5 my-3
        bg-gradient-to-r ${style.gradient} ${style.hoverBg}
        ${style.border} ${style.borderLeft}
        rounded-lg transition-all duration-200 transform hover:scale-[1.02]
        shadow-md hover:shadow-lg
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
      `}
    >
      {/* Type label badge - positioned absolutely */}
      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${style.labelBg} ${style.labelText} border ${style.border}`}>
        {style.label}
      </div>

      <div className="flex items-start gap-4 pr-24">
        {/* Icon with background */}
        <div className={`p-3 rounded-lg ${style.iconBg} flex-shrink-0`}>
          <span className="text-2xl">{style.icon}</span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {suggestion.includes(' - ') ? (
            // Example with description format
            <>
              <p className={`font-semibold text-lg ${style.primaryText} mb-1`}>
                {suggestion.split(' - ')[0]}
              </p>
              <p className={`text-sm ${style.secondaryText}`}>
                {suggestion.split(' - ')[1]}
              </p>
            </>
          ) : (
            // Regular suggestion
            <>
              <p className={`font-semibold text-lg ${style.primaryText} mb-1`}>
                {suggestion}
              </p>
              <p className={`text-sm ${style.secondaryText}`}>
                {getCardType() === 'example' ? 'Ready to use this template' : 
                 getCardType() === 'refine' ? 'Improve your current response' :
                 'Explore this direction'}
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
};

// Quick action buttons with consistent styling
export const QuickActionButton = ({ text, onClick, disabled, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  return (
    <button
      onClick={() => onClick(text)}
      disabled={disabled}
      className={`
        px-6 py-3 mx-2 rounded-lg font-medium
        ${variants[variant]}
        transition-all duration-200 transform hover:scale-105
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        shadow-sm hover:shadow-md
      `}
    >
      {text}
    </button>
  );
};

// Help chip buttons with icons
export const HelpChip = ({ text, icon, onClick, disabled }) => {
  const icons = {
    ideas: '💡',
    examples: '📋',
    help: '❓'
  };

  return (
    <button
      onClick={() => onClick(text)}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 m-1
        bg-white border-2 border-gray-300 rounded-full
        hover:border-purple-400 hover:bg-purple-50
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        text-sm font-medium text-gray-700 hover:text-purple-700
      `}
    >
      <span className="text-lg">{icon || icons[text] || '🔹'}</span>
      <span>{text === 'ideas' ? 'Get Ideas' : text === 'examples' ? 'See Examples' : 'Get Help'}</span>
    </button>
  );
};

// Navigation breadcrumb component
export const NavigationBreadcrumb = ({ path, onNavigate }) => {
  if (!path || path.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-500 font-medium">Navigation:</span>
        {path.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">→</span>}
            <button 
              className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
              onClick={() => onNavigate(index)}
            >
              {item}
            </button>
          </React.Fragment>
        ))}
      </div>
      {path.length > 2 && (
        <p className="text-xs text-amber-600 mt-1">
          💡 Tip: Getting lost? Click on any step above to go back, or use the examples to move forward.
        </p>
      )}
    </div>
  );
};

// Floating progress indicator
export const FloatingProgressIndicator = ({ currentStep, ideationData }) => {
  const steps = [
    { key: 'bigIdea', label: 'Big Idea', icon: '💡' },
    { key: 'essentialQuestion', label: 'Essential Question', icon: '❓' },
    { key: 'challenge', label: 'Challenge', icon: '🎯' }
  ];

  const getStepStatus = (stepKey) => {
    if (ideationData[stepKey]) return 'complete';
    if (currentStep === stepKey) return 'active';
    return 'pending';
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl p-5 border-2 border-gray-200 max-w-xs">
      <h3 className="font-bold text-sm text-gray-800 mb-3">Your Progress</h3>
      <div className="space-y-3">
        {steps.map((step) => {
          const status = getStepStatus(step.key);
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${status === 'complete' ? 'bg-green-100 text-green-600' :
                  status === 'active' ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-300' :
                  'bg-gray-100 text-gray-400'}
              `}>
                {status === 'complete' ? '✓' : step.icon}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'complete' ? 'text-green-700' :
                  status === 'active' ? 'text-purple-700' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {ideationData[step.key] && (
                  <p className="text-xs text-gray-600 truncate">
                    {ideationData[step.key].substring(0, 30)}...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {currentStep === 'bigIdea' && !ideationData.bigIdea && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Start with a broad theme that excites you!
          </p>
        </div>
      )}
    </div>
  );
};

export default {
  EnhancedSuggestionCard,
  QuickActionButton,
  HelpChip,
  NavigationBreadcrumb,
  FloatingProgressIndicator
};