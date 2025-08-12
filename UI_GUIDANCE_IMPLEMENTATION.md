# ALF Coach UI Guidance Framework - Implementation Guide

This document provides concrete implementation guidance for integrating the Ideas Button, Help Button, and Suggestion Cards into the ALF Coach application.

## Quick Reference

### Component Integration Pattern
```typescript
// Main Stage Component
const IdeationStage = () => {
  const { guidanceState, updateGuidance } = useGuidanceState();
  
  return (
    <div className="stage-container">
      {/* Help Button - Always visible top-right */}
      <HelpButton 
        stage="IDEATION" 
        step="IDEATION_BIG_IDEA"
        onToggle={() => updateGuidance('help', 'toggle')} 
      />
      
      {/* Main content area */}
      <div className="content-area">
        {/* Input field with Ideas Button */}
        <InputWithIdeas
          placeholder="Describe your big idea..."
          showIdeas={guidanceState.ideas.visible}
          onRequestIdeas={() => updateGuidance('ideas', 'show')}
        />
      </div>
      
      {/* Suggestion Cards - Bottom of stage */}
      {guidanceState.suggestions.cards.length > 0 && (
        <EnhancedSuggestionCards
          suggestions={guidanceState.suggestions.cards}
          onAccept={handleAcceptSuggestions}
          context={{ stage: 'IDEATION', step: 'IDEATION_BIG_IDEA' }}
        />
      )}
    </div>
  );
};
```

## 1. Ideas Button Implementation

### Core Component
```typescript
// src/components/guidance/IdeasButton.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, RefreshCw } from 'lucide-react';

interface IdeasButtonProps {
  stage: SOPStage;
  step: SOPStep;
  currentData: any;
  trigger: 'empty' | 'stuck' | 'manual' | 'hidden';
  onSelectIdea: (idea: string) => void;
  onGenerateMore?: () => void;
}

export const IdeasButton: React.FC<IdeasButtonProps> = ({
  stage,
  step,
  currentData,
  trigger,
  onSelectIdea,
  onGenerateMore
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  if (trigger === 'hidden') return null;

  const handleGenerateIdeas = async () => {
    setIsLoading(true);
    try {
      const newIdeas = await generateIdeasForContext(stage, step, currentData);
      setIdeas(newIdeas);
      setShowDropdown(true);
    } catch (error) {
      console.error('Failed to generate ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleGenerateIdeas}
        disabled={isLoading}
        className={`
          flex items-center gap-2 px-4 py-2
          bg-gradient-to-r from-blue-100 to-blue-200 
          hover:from-blue-200 hover:to-blue-300
          border-2 border-blue-300 rounded-xl
          text-blue-700 font-medium text-sm
          shadow-lg hover:shadow-xl
          transition-all duration-200
          ${trigger === 'stuck' ? 'animate-pulse' : ''}
        `}
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Lightbulb className="w-4 h-4" />
        )}
        <span>{isLoading ? 'Generating...' : 'Get Ideas'}</span>
      </motion.button>

      {/* Ideas Dropdown */}
      <AnimatePresence>
        {showDropdown && ideas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 z-50"
          >
            <div className="bg-white dark:bg-gray-800 border-2 border-blue-200 rounded-xl shadow-xl p-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ideas for you
                </span>
              </div>
              
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onSelectIdea(idea);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {idea}
                    </p>
                  </motion.button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onGenerateMore?.();
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Generate more ideas
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

### Ideas Generation Service
```typescript
// src/services/IdeasGenerationService.ts
export class IdeasGenerationService {
  private static ideaTemplates = {
    IDEATION: {
      IDEATION_BIG_IDEA: {
        science: [
          "How can students become environmental scientists in their community?",
          "What if students designed solutions for local sustainability challenges?",
          "How might we use biomimicry to solve everyday problems?"
        ],
        english: [
          "Students become documentary filmmakers capturing community stories",
          "Creating a community newspaper with investigative journalism",
          "Developing a podcast series about local history and culture"
        ],
        math: [
          "Students as data analysts helping local businesses optimize",
          "Designing and building a community garden using geometric principles",
          "Creating a financial literacy program for younger students"
        ]
      }
    },
    JOURNEY: {
      JOURNEY_BUILD: [
        "Phase 1: Community exploration and problem identification",
        "Phase 2: Research and solution development",
        "Phase 3: Implementation and impact measurement"
      ]
    }
  };

  static async generateIdeas(
    stage: SOPStage, 
    step: SOPStep, 
    context: any
  ): Promise<string[]> {
    // In production, this would call the AI service
    // For now, return template-based ideas
    const templates = this.ideaTemplates[stage]?.[step];
    if (!templates) return [];

    if (typeof templates === 'object') {
      const subject = context.wizard?.subject?.toLowerCase();
      return templates[subject] || templates.science || [];
    }

    return templates || [];
  }
}
```

## 2. Help Button Implementation

### Core Component
```typescript
// src/components/guidance/HelpButton.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

interface HelpButtonProps {
  stage: SOPStage;
  step: SOPStep;
  hasBeenViewed?: boolean;
  onToggleHelp: () => void;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  stage,
  step,
  hasBeenViewed = false,
  onToggleHelp
}) => {
  const [showBadge, setShowBadge] = useState(!hasBeenViewed);

  useEffect(() => {
    setShowBadge(!hasBeenViewed);
  }, [hasBeenViewed, step]);

  return (
    <div className="fixed top-4 right-4 z-40">
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleHelp}
        className={`
          relative p-3 rounded-full
          bg-gray-100 dark:bg-gray-800
          hover:bg-gray-200 dark:hover:bg-gray-700
          border-2 border-gray-300 dark:border-gray-600
          shadow-lg hover:shadow-xl
          transition-all duration-200
          ${showBadge ? 'animate-pulse' : ''}
        `}
      >
        <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        
        {showBadge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"
          />
        )}
      </motion.button>
    </div>
  );
};
```

### Help Panel Component
```typescript
// src/components/guidance/HelpPanel.tsx
interface HelpPanelProps {
  isOpen: boolean;
  stage: SOPStage;
  step: SOPStep;
  onClose: () => void;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({
  isOpen,
  stage,
  step,
  onClose
}) => {
  const helpContent = HelpContentService.getContent(stage, step);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          
          {/* Panel */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {helpContent.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {helpContent.overview}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  How to approach this step
                </h3>
                <ol className="space-y-2">
                  {helpContent.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Examples */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Examples
                </h3>
                <div className="space-y-3">
                  {helpContent.examples.map((example, index) => (
                    <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-green-800 dark:text-green-300">{example}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Pro Tips
                </h3>
                <ul className="space-y-2">
                  {helpContent.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2" />
                      <p className="text-gray-700 dark:text-gray-300">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Mistakes */}
              {helpContent.commonMistakes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Common Pitfalls to Avoid
                  </h3>
                  <ul className="space-y-2">
                    {helpContent.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                        <p className="text-gray-700 dark:text-gray-300">{mistake}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

## 3. Enhanced Suggestion Cards Integration

### Trigger Detection System
```typescript
// src/hooks/useSuggestionTriggers.ts
export const useSuggestionTriggers = (
  stage: SOPStage,
  step: SOPStep,
  currentData: any,
  userBehavior: BehaviorPattern
) => {
  const [suggestions, setSuggestions] = useState<EnhancedSuggestionCard[]>([]);

  useEffect(() => {
    const triggers = detectTriggers(stage, step, currentData, userBehavior);
    
    if (triggers.length > 0) {
      generateSuggestions(triggers).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [stage, step, currentData, userBehavior]);

  return suggestions;
};

const detectTriggers = (
  stage: SOPStage,
  step: SOPStep,
  data: any,
  behavior: BehaviorPattern
): TriggerType[] => {
  const triggers: TriggerType[] = [];

  // Behavior-based triggers
  if (behavior.hesitation) triggers.push('hesitation');
  if (behavior.completion) triggers.push('completion');
  if (behavior.inconsistency) triggers.push('inconsistency');

  // Content-based triggers
  if (stage === 'IDEATION' && step === 'IDEATION_BIG_IDEA' && !data.bigIdea) {
    triggers.push('empty_content');
  }

  // Cross-stage integration triggers
  if (stage === 'JOURNEY' && data.ideation?.bigIdea) {
    triggers.push('integration_opportunity');
  }

  return triggers;
};
```

### Suggestion Content Generation
```typescript
// src/services/SuggestionContentService.ts
export class SuggestionContentService {
  static async generateSuggestions(
    triggers: TriggerType[],
    context: SuggestionContext
  ): Promise<EnhancedSuggestionCard[]> {
    const cards: EnhancedSuggestionCard[] = [];

    for (const trigger of triggers) {
      switch (trigger) {
        case 'hesitation':
          cards.push(await this.createHesitationSuggestion(context));
          break;
        case 'completion':
          cards.push(await this.createCompletionSuggestion(context));
          break;
        case 'integration_opportunity':
          cards.push(await this.createIntegrationSuggestion(context));
          break;
      }
    }

    // Limit to top 3 suggestions by priority
    return cards
      .sort((a, b) => this.getPriority(b) - this.getPriority(a))
      .slice(0, 3);
  }

  private static async createHesitationSuggestion(
    context: SuggestionContext
  ): Promise<EnhancedSuggestionCard> {
    return {
      id: `hesitation-${Date.now()}`,
      category: 'idea',
      title: 'Need some inspiration?',
      description: 'Here are some ideas to get you started',
      items: [
        {
          id: '1',
          text: 'Consider what real-world problem this addresses',
          type: 'objective',
          selected: false
        },
        {
          id: '2', 
          text: 'Think about how this connects to student interests',
          type: 'objective',
          selected: false
        },
        {
          id: '3',
          text: 'What would make this project authentic and meaningful?',
          type: 'objective',
          selected: false
        }
      ],
      allowPartialSelection: true,
      editable: true
    };
  }

  // Additional suggestion creation methods...
}
```

## 4. State Management Integration

### Guidance State Hook
```typescript
// src/hooks/useGuidanceState.ts
interface GuidanceState {
  ideas: {
    visible: boolean;
    trigger: TriggerType;
    lastShown: Date | null;
  };
  help: {
    isOpen: boolean;
    hasBeenViewed: boolean;
    viewCount: number;
  };
  suggestions: {
    cards: EnhancedSuggestionCard[];
    dismissedCards: string[];
    priority: 'high' | 'medium' | 'low';
  };
}

export const useGuidanceState = (
  stage: SOPStage,
  step: SOPStep,
  userData: any
) => {
  const [guidanceState, setGuidanceState] = useState<GuidanceState>({
    ideas: { visible: false, trigger: 'hidden', lastShown: null },
    help: { isOpen: false, hasBeenViewed: false, viewCount: 0 },
    suggestions: { cards: [], dismissedCards: [], priority: 'medium' }
  });

  const updateGuidance = (component: keyof GuidanceState, action: string, data?: any) => {
    setGuidanceState(prev => ({
      ...prev,
      [component]: updateComponentState(prev[component], action, data)
    }));
  };

  return { guidanceState, updateGuidance };
};
```

## 5. Integration with Existing Components

### ChatInterface Integration
```typescript
// Modify existing ChatInterface to include guidance
export const EnhancedChatInterface = ({ stage, step, ...props }) => {
  const { guidanceState, updateGuidance } = useGuidanceState(stage, step, props.userData);
  
  return (
    <div className="chat-interface-container">
      {/* Help Button - Always visible */}
      <HelpButton
        stage={stage}
        step={step}
        hasBeenViewed={guidanceState.help.hasBeenViewed}
        onToggleHelp={() => updateGuidance('help', 'toggle')}
      />

      {/* Help Panel */}
      <HelpPanel
        isOpen={guidanceState.help.isOpen}
        stage={stage}
        step={step}
        onClose={() => updateGuidance('help', 'close')}
      />

      {/* Existing chat messages */}
      <div className="messages-container">
        {props.messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Suggestion Cards */}
      {guidanceState.suggestions.cards.length > 0 && (
        <EnhancedSuggestionCards
          suggestions={guidanceState.suggestions.cards}
          onAccept={(cards) => updateGuidance('suggestions', 'accept', cards)}
          context={{ stage, step }}
        />
      )}

      {/* Chat Input with Ideas Button */}
      <ChatInputWithIdeas
        stage={stage}
        step={step}
        guidanceState={guidanceState}
        onUpdateGuidance={updateGuidance}
        {...props}
      />
    </div>
  );
};
```

### Input Field Integration
```typescript
// src/components/chat/ChatInputWithIdeas.tsx
export const ChatInputWithIdeas = ({ 
  stage, 
  step, 
  guidanceState, 
  onUpdateGuidance,
  ...inputProps 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showIdeas, setShowIdeas] = useState(false);

  // Trigger detection
  useEffect(() => {
    const trigger = detectIdeasTrigger(inputValue, stage, step);
    if (trigger !== 'hidden' && !showIdeas) {
      onUpdateGuidance('ideas', 'show', { trigger });
    }
  }, [inputValue, stage, step]);

  return (
    <div className="relative">
      {/* Input field */}
      <textarea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="chat-input"
        {...inputProps}
      />

      {/* Ideas Button - positioned contextually */}
      {guidanceState.ideas.visible && (
        <div className="absolute top-2 right-2">
          <IdeasButton
            stage={stage}
            step={step}
            trigger={guidanceState.ideas.trigger}
            onSelectIdea={(idea) => {
              setInputValue(prev => prev + idea);
              onUpdateGuidance('ideas', 'hide');
            }}
          />
        </div>
      )}
    </div>
  );
};
```

This implementation guide provides the concrete code structure needed to integrate all three UI guidance components into the existing ALF Coach architecture, maintaining consistency with the current design system while adding intelligent, contextual support for users.