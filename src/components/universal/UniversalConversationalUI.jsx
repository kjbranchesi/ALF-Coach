// UniversalConversationalUI.jsx
// Shared UI components for all conversational stages with age-adaptive features

import React from 'react';
import { AgeAdaptiveValidator } from '../../utils/AgeAdaptiveValidation.js';

// Enhanced suggestion card with age-appropriate styling
export const UniversalSuggestionCard = ({ 
  suggestion, 
  type, 
  onClick, 
  disabled,
  ageGroup,
  stage 
}) => {
  const validator = new AgeAdaptiveValidator(ageGroup, '');
  const isCollege = validator.isCollegeLevel;
  
  // Age-adaptive card styles
  const cardStyles = {
    idea: {
      gradient: isCollege ? 'from-indigo-50 to-indigo-100' : 'from-purple-50 to-purple-100',
      border: isCollege ? 'border-indigo-300' : 'border-purple-300',
      borderLeft: isCollege ? 'border-l-4 border-l-indigo-600' : 'border-l-4 border-l-purple-500',
      icon: isCollege ? '🎓' : '💡',
      label: isCollege ? 'EXPLORE THEORY' : 'EXPLORE IDEA',
      labelBg: isCollege ? 'bg-indigo-100' : 'bg-purple-100',
      labelText: isCollege ? 'text-indigo-700' : 'text-purple-700',
      hoverBg: isCollege ? 'hover:from-indigo-100 hover:to-indigo-200' : 'hover:from-purple-100 hover:to-purple-200',
      iconBg: isCollege ? 'bg-indigo-200' : 'bg-purple-200',
      primaryText: isCollege ? 'text-indigo-900' : 'text-purple-900',
      secondaryText: isCollege ? 'text-indigo-700' : 'text-purple-700'
    },
    example: {
      gradient: 'from-green-50 to-green-100',
      border: 'border-green-300',
      borderLeft: 'border-l-4 border-l-green-500',
      icon: isCollege ? '📚' : '📋',
      label: isCollege ? 'FRAMEWORK' : 'USE EXAMPLE',
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
      label: isCollege ? 'SYNTHESIZE' : 'REFINE',
      labelBg: 'bg-amber-100',
      labelText: 'text-amber-700',
      hoverBg: 'hover:from-amber-100 hover:to-amber-200',
      iconBg: 'bg-amber-200',
      primaryText: 'text-amber-900',
      secondaryText: 'text-amber-700'
    },
    research: {
      gradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-300',
      borderLeft: 'border-l-4 border-l-blue-600',
      icon: '🔬',
      label: 'RESEARCH',
      labelBg: 'bg-blue-100',
      labelText: 'text-blue-700',
      hoverBg: 'hover:from-blue-100 hover:to-blue-200',
      iconBg: 'bg-blue-200',
      primaryText: 'text-blue-900',
      secondaryText: 'text-blue-700'
    }
  };

  // Determine card type with age awareness
  const getCardType = () => {
    if (type) return type;
    
    const lowerSuggestion = suggestion.toLowerCase();
    
    // College-specific patterns
    if (isCollege) {
      if (lowerSuggestion.includes('theory') || lowerSuggestion.includes('framework') || 
          lowerSuggestion.includes('paradigm') || lowerSuggestion.includes('philosophical')) {
        return 'research';
      }
    }
    
    if (lowerSuggestion.includes('what if')) return 'idea';
    if (lowerSuggestion.includes('make it more') || 
        lowerSuggestion.includes('connect it more') || 
        lowerSuggestion.includes('focus it on')) return 'refine';
    return 'example';
  };

  const style = cardStyles[getCardType()] || cardStyles.idea;

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
          <p className={`font-semibold ${isCollege ? 'text-base' : 'text-lg'} ${style.primaryText} mb-1`}>
            {suggestion}
          </p>
          <p className={`text-sm ${style.secondaryText}`}>
            {getSubtext(getCardType(), isCollege, stage)}
          </p>
        </div>
      </div>
    </button>
  );
};

// Get appropriate subtext based on context
function getSubtext(cardType, isCollege, stage) {
  const subtexts = {
    idea: {
      college: 'Explore theoretical dimensions',
      standard: 'Explore this direction'
    },
    example: {
      college: 'Apply this framework',
      standard: 'Ready to use this template'
    },
    refine: {
      college: 'Synthesize and strengthen',
      standard: 'Improve your current response'
    },
    research: {
      college: 'Investigate scholarly perspectives',
      standard: 'Research this topic'
    }
  };

  const level = isCollege ? 'college' : 'standard';
  return subtexts[cardType]?.[level] || 'Click to select';
}

// Universal progress indicator with stage awareness
export const UniversalProgressIndicator = ({ 
  currentStep, 
  stageData, 
  stage,
  ageGroup 
}) => {
  const steps = getStageSteps(stage);
  const validator = new AgeAdaptiveValidator(ageGroup, '');
  const isCollege = validator.isCollegeLevel;

  const getStepStatus = (stepKey) => {
    if (stageData[stepKey]) return 'complete';
    if (currentStep === stepKey) return 'active';
    return 'pending';
  };

  const getStepIcon = (step, stage) => {
    const icons = {
      ideation: {
        bigIdea: isCollege ? '🎓' : '💡',
        essentialQuestion: '❓',
        challenge: '🎯'
      },
      journey: {
        phases: '📅',
        activities: '🎨',
        resources: '📚'
      },
      deliverables: {
        milestones: '🏁',
        descriptions: '📝',
        assessment: '✅'
      }
    };
    return icons[stage]?.[step.key] || '📌';
  };

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl p-5 border-2 border-gray-200 max-w-xs">
      <h3 className="font-bold text-sm text-gray-800 mb-3">
        {stage === 'ideation' ? 'Ideation Progress' : 
         stage === 'journey' ? 'Journey Design' : 
         'Deliverables Planning'}
      </h3>
      <div className="space-y-3">
        {steps.map((step) => {
          const status = getStepStatus(step.key);
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-lg
                ${status === 'complete' ? 'bg-green-100 text-green-600' :
                  status === 'active' ? 
                    (isCollege ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300' : 
                               'bg-purple-100 text-purple-600 ring-2 ring-purple-300') :
                  'bg-gray-100 text-gray-400'}
              `}>
                {status === 'complete' ? '✓' : getStepIcon(step, stage)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'complete' ? 'text-green-700' :
                  status === 'active' ? 
                    (isCollege ? 'text-indigo-700' : 'text-purple-700') :
                  'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {stageData[step.key] && (
                  <p className="text-xs text-gray-600 truncate">
                    {stageData[step.key].substring(0, 30)}...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Age-appropriate tips */}
      {currentStep && !stageData[currentStep] && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCollege ? 'bg-indigo-50' : 'bg-blue-50'
        }`}>
          <p className={`text-xs ${isCollege ? 'text-indigo-700' : 'text-blue-700'}`}>
            <strong>Tip:</strong> {getStepTip(currentStep, stage, isCollege)}
          </p>
        </div>
      )}
    </div>
  );
};

// Get stage-specific steps
function getStageSteps(stage) {
  const steps = {
    ideation: [
      { key: 'bigIdea', label: 'Big Idea' },
      { key: 'essentialQuestion', label: 'Essential Question' },
      { key: 'challenge', label: 'Challenge' }
    ],
    journey: [
      { key: 'phases', label: 'Learning Phases' },
      { key: 'activities', label: 'Key Activities' },
      { key: 'resources', label: 'Resources Needed' }
    ],
    deliverables: [
      { key: 'milestones', label: 'Key Milestones' },
      { key: 'descriptions', label: 'Deliverable Details' },
      { key: 'assessment', label: 'Assessment Criteria' }
    ]
  };
  return steps[stage] || [];
}

// Get age-appropriate tips
function getStepTip(step, stage, isCollege) {
  const tips = {
    ideation: {
      bigIdea: isCollege ? 
        'Consider theoretical frameworks that underpin your field' : 
        'Start with a broad theme that excites you!',
      essentialQuestion: isCollege ?
        'Frame a question that invites critical analysis' :
        'Ask something students can really explore',
      challenge: isCollege ?
        'Design a scholarly product or research outcome' :
        'Think about what students will create'
    },
    journey: {
      phases: isCollege ?
        'Consider self-directed learning pathways' :
        'Break learning into clear stages',
      activities: isCollege ?
        'Balance independent research with collaboration' :
        'Mix different types of activities',
      resources: isCollege ?
        'Include primary sources and scholarly materials' :
        'Think about materials and tools needed'
    },
    deliverables: {
      milestones: 'Identify key checkpoints',
      descriptions: 'Be specific about expectations',
      assessment: isCollege ?
        'Include peer review and self-assessment' :
        'Make success criteria clear'
    }
  };
  
  return tips[stage]?.[step] || 'Take your time to think this through';
}

// Universal help chip with age-appropriate labeling
export const UniversalHelpChip = ({ text, icon, onClick, disabled, ageGroup }) => {
  const validator = new AgeAdaptiveValidator(ageGroup, '');
  const isCollege = validator.isCollegeLevel;
  
  const icons = {
    ideas: isCollege ? '🎓' : '💡',
    examples: isCollege ? '📚' : '📋',
    help: '❓'
  };

  const labels = {
    ideas: isCollege ? 'Explore Concepts' : 'Get Ideas',
    examples: isCollege ? 'See Frameworks' : 'See Examples',
    help: 'Get Help'
  };

  return (
    <button
      onClick={() => onClick(text)}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 px-5 py-2.5 m-1
        bg-white border-2 border-gray-300 rounded-full
        ${isCollege ? 'hover:border-indigo-400 hover:bg-indigo-50' : 
                     'hover:border-purple-400 hover:bg-purple-50'}
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        text-sm font-medium text-gray-700 
        ${isCollege ? 'hover:text-indigo-700' : 'hover:text-purple-700'}
      `}
    >
      <span className="text-lg">{icon || icons[text] || '🔹'}</span>
      <span>{labels[text] || text}</span>
    </button>
  );
};

// Stage-specific header with context
export const UniversalStageHeader = ({ stage, projectInfo, ageGroup }) => {
  const titles = {
    ideation: 'Project Foundation',
    journey: 'Learning Journey Design',
    deliverables: 'Student Deliverables'
  };

  const descriptions = {
    ideation: 'Define your project\'s core concepts',
    journey: 'Map out the learning experience',
    deliverables: 'Plan what students will create'
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <h2 className="text-2xl font-bold text-gray-900">
        {titles[stage]}
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        {descriptions[stage]}
      </p>
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        <span>Subject: <strong>{projectInfo.subject}</strong></span>
        <span>•</span>
        <span>Age: <strong>{ageGroup}</strong></span>
        {projectInfo.scope && (
          <>
            <span>•</span>
            <span>Scope: <strong>{projectInfo.scope}</strong></span>
          </>
        )}
      </div>
    </div>
  );
};

// Quick mode toggle that works for all stages
export const UniversalQuickModeToggle = ({ onToggle, isQuickMode, stage }) => {
  const stageLabels = {
    ideation: 'Ideation',
    journey: 'Journey',
    deliverables: 'Deliverables'
  };

  return (
    <div className="fixed top-20 left-6 bg-white border-2 border-gray-300 rounded-lg px-4 py-2 shadow-md z-50">
      <label className="flex items-center gap-3 cursor-pointer">
        <span className="text-sm font-medium text-gray-700">
          Quick {stageLabels[stage]} Mode
        </span>
        <div className="relative">
          <input
            type="checkbox"
            checked={isQuickMode}
            onChange={(e) => onToggle(e.target.checked)}
            className="sr-only"
          />
          <div className={`block w-14 h-8 rounded-full ${isQuickMode ? 'bg-purple-600' : 'bg-gray-300'}`}></div>
          <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isQuickMode ? 'translate-x-6' : ''}`}></div>
        </div>
      </label>
      <p className="text-xs text-gray-500 mt-1">
        {isQuickMode ? 'Direct input mode' : 'Guided conversation'}
      </p>
    </div>
  );
};

export default {
  UniversalSuggestionCard,
  UniversalProgressIndicator,
  UniversalHelpChip,
  UniversalStageHeader,
  UniversalQuickModeToggle
};