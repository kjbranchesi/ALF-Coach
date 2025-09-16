/**
 * ConfirmationFrameworkExample.tsx
 * 
 * Complete example implementation showing how to integrate the confirmation framework
 * with the existing ChatbotFirstInterfaceFixed component
 */

import React, { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  useConfirmationFramework, 
  getRefinementSuggestions,
  type ALFStage 
} from './ConfirmationFramework';
import EnhancedSuggestionCard, { getCardType, getCardIcon } from '../EnhancedSuggestionCard';
import { MessageRenderer } from './MessageRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: ALFStage;
    confirmationUI?: {
      type: 'progress-update' | 'build-forward' | 'gentle-question';
      confidence: 'high' | 'medium' | 'low';
      pendingValue?: string;
    };
    source?: string;
  };
}

interface ProjectContext {
  subject: string;
  gradeLevel: string;
  duration: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
}

interface ProjectState {
  stage: ALFStage;
  messageCountInStage: number;
  context: ProjectContext;
  ideation: {
    bigIdea: string;
    essentialQuestion: string;
    challenge: string;
  };
}

const ConfirmationFrameworkExample: React.FC = () => {
  // Framework integration
  const {
    confirmationState,
    showRefinementSidebar,
    setConfirmationState,
    setShowRefinementSidebar,
    getConfirmationType,
    generateAcknowledgment,
    shouldOfferRefinement,
    ConfirmationMicroUI,
    RefinementSidebar
  } = useConfirmationFramework();

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'BIG_IDEA',
    messageCountInStage: 0,
    context: {
      subject: 'Environmental Science',
      gradeLevel: '8th Grade',
      duration: '4 weeks'
    },
    ideation: {
      bigIdea: '',
      essentialQuestion: '',
      challenge: ''
    }
  });

  // Enhanced handleSend with confirmation framework integration
  const handleSend = useCallback(async (inputText?: string, options?: { autoSubmit?: boolean; source?: string }) => {
    const userInput = inputText || input.trim();
    if (!userInput) return;
    
    const isAutoSubmit = options?.autoSubmit || false;
    const source = options?.source as 'typed' | 'suggestion' | 'refinement' || 'typed';
    
    console.log('[ConfirmationFramework] Processing input:', { userInput, source, stage: projectState.stage });
    
    // Increment message count
    setProjectState(prev => ({
      ...prev,
      messageCountInStage: prev.messageCountInStage + 1
    }));
    
    // Determine confirmation type based on input quality
    const confirmationType = getConfirmationType(
      userInput, 
      projectState.stage, 
      projectState.messageCountInStage, 
      source
    );
    
    console.log('[ConfirmationFramework] Confirmation type:', confirmationType);
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date(),
      metadata: { 
        stage: projectState.stage,
        source 
      }
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowSuggestions(false);
    
    // Handle based on confirmation type
    try {
      switch (confirmationType) {
        case 'immediate':
          await handleImmediateConfirmation(userInput);
          break;
          
        case 'review':
          await handleReviewConfirmation(userInput);
          break;
          
        case 'refine':
          await handleRefineConfirmation(userInput);
          break;
      }
    } catch (error) {
      console.error('[ConfirmationFramework] Error processing confirmation:', error);
      setIsTyping(false);
    }
  }, [input, projectState, getConfirmationType, generateAcknowledgment]);

  // High confidence - immediate progression
  const handleImmediateConfirmation = async (userInput: string) => {
    const acknowledgment = generateAcknowledgment(userInput, projectState.stage, projectState.context);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: acknowledgment,
      timestamp: new Date(),
      metadata: {
        stage: projectState.stage,
        confirmationUI: {
          type: 'progress-update',
          confidence: 'high'
        }
      }
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
    
    // Auto-progress after celebration
    setTimeout(() => {
      handleStageProgression(userInput);
    }, 2000);
  };

  // Medium confidence - gentle check-in
  const handleReviewConfirmation = async (userInput: string) => {
    const acknowledgment = generateAcknowledgment(userInput, projectState.stage, projectState.context);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: acknowledgment,
      timestamp: new Date(),
      metadata: {
        stage: projectState.stage,
        confirmationUI: {
          type: 'build-forward',
          confidence: 'medium',
          pendingValue: userInput
        }
      }
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Low confidence - explicit confirmation
  const handleRefineConfirmation = async (userInput: string) => {
    const response = `I want to make sure I understand your ${projectState.stage.toLowerCase().replace('_', ' ')} correctly. Let me show you what I captured and give you a chance to refine it if needed.`;
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata: {
        stage: projectState.stage,
        confirmationUI: {
          type: 'gentle-question',
          confidence: 'low',
          pendingValue: userInput
        }
      }
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  // Handle confirmation actions
  const handleConfirmationAction = useCallback((action: 'confirm' | 'refine', value: string) => {
    console.log('[ConfirmationFramework] Confirmation action:', action, value);
    
    if (action === 'confirm') {
      handleStageProgression(value);
    } else if (action === 'refine') {
      // Show refinement sidebar
      const refinementSuggestions = getRefinementSuggestions(
        projectState.stage, 
        value, 
        projectState.context
      );
      
      setConfirmationState({
        stage: projectState.stage,
        pendingValue: value,
        confirmationMode: 'refine',
        attempts: projectState.messageCountInStage,
        lastInteraction: 'refinement'
      });
      
      setShowRefinementSidebar(true);
    }
  }, [projectState, setConfirmationState, setShowRefinementSidebar]);

  // Handle stage progression
  const handleStageProgression = (value: string) => {
    console.log('[ConfirmationFramework] Progressing stage:', projectState.stage, 'with value:', value);
    
    // Update ideation state
    let updatedIdeation = { ...projectState.ideation };
    let nextStage: ALFStage = projectState.stage;
    
    switch (projectState.stage) {
      case 'BIG_IDEA':
        updatedIdeation.bigIdea = value;
        nextStage = 'ESSENTIAL_QUESTION';
        break;
      case 'ESSENTIAL_QUESTION':
        updatedIdeation.essentialQuestion = value;
        nextStage = 'CHALLENGE';
        break;
      case 'CHALLENGE':
        updatedIdeation.challenge = value;
        nextStage = 'JOURNEY';
        break;
      case 'JOURNEY':
        nextStage = 'DELIVERABLES';
        break;
      case 'DELIVERABLES':
        // Project complete
        break;
    }
    
    // Update project state
    setProjectState(prev => ({
      ...prev,
      stage: nextStage,
      messageCountInStage: 0,
      ideation: updatedIdeation
    }));
    
    // Show stage completion celebration
    showStageCompletionCelebration(projectState.stage);
  };

  // Stage completion celebration
  const showStageCompletionCelebration = (stageName: ALFStage) => {
    const stageDisplay = stageName.replace('_', ' ');
    console.log(`🎉 ${stageDisplay} Complete!`);
    // Could implement visual celebration here
  };

  // Get suggestions for current stage
  const getCurrentStageSuggestions = () => {
    const stageSuggestions = {
      BIG_IDEA: [
        { id: '1', text: 'The intersection of technology and environmental sustainability' },
        { id: '2', text: 'Systems thinking in environmental science' },
        { id: '3', text: 'How human choices impact natural ecosystems' }
      ],
      ESSENTIAL_QUESTION: [
        { id: '1', text: 'How can we use technology to solve environmental challenges in our community?' },
        { id: '2', text: 'What is the relationship between human innovation and environmental health?' },
        { id: '3', text: 'How might we design solutions that benefit both people and the planet?' }
      ],
      CHALLENGE: [
        { id: '1', text: 'Design and test an eco-friendly solution for a local environmental problem' },
        { id: '2', text: 'Create a sustainability plan for your school with measurable impact' },
        { id: '3', text: 'Develop a community education campaign about environmental stewardship' }
      ],
      JOURNEY: [
        { id: '1', text: 'Research → Analyze → Brainstorm → Prototype → Test → Present' },
        { id: '2', text: 'Investigate problems → Generate solutions → Build prototypes → Evaluate impact' },
        { id: '3', text: 'Understand context → Ideate solutions → Create and iterate → Share results' }
      ],
      DELIVERABLES: [
        { id: '1', text: 'Portfolio, working prototype, and community presentation' },
        { id: '2', text: 'Research report, solution design, and peer review process' },
        { id: '3', text: 'Documentation, final product, and impact assessment' }
      ]
    };
    
    return stageSuggestions[projectState.stage] || [];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Confirmation Framework Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Current Stage: {projectState.stage.replace('_', ' ')} | Messages in Stage: {projectState.messageCountInStage}
        </p>
      </div>

      {/* Messages */}
      <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-3">
            {/* Message */}
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-2xl p-4 rounded-xl ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              }`}>
                <MessageRenderer content={message.content} role={message.role} />
                {message.metadata?.source && (
                  <p className={`text-xs mt-2 opacity-70`}>
                    via {message.metadata.source}
                  </p>
                )}
              </div>
            </div>
            
            {/* Confirmation UI */}
            {message.metadata?.confirmationUI && (
              <ConfirmationMicroUI
                type={message.metadata.confirmationUI.type}
                value={message.metadata.confirmationUI.pendingValue || ''}
                stage={projectState.stage}
                confidence={message.metadata.confirmationUI.confidence}
                context={projectState.context}
                onConfirm={() => handleConfirmationAction('confirm', message.metadata?.confirmationUI?.pendingValue || '')}
                onRefine={() => handleConfirmationAction('refine', message.metadata?.confirmationUI?.pendingValue || '')}
              />
            )}
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {(showSuggestions || getCurrentStageSuggestions().length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Suggestions for {projectState.stage.replace('_', ' ')}
            </h3>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded-full"
            >
              {showSuggestions ? 'Hide' : 'Show'} Suggestions
            </button>
          </div>
          
          {(showSuggestions || true) && (
            <div className="grid gap-3">
              {getCurrentStageSuggestions().slice(0, 3).map((suggestion, index) => (
                <EnhancedSuggestionCard
                  key={suggestion.id}
                  text={suggestion.text}
                  onClick={handleSend}
                  type={getCardType(suggestion.text)}
                  icon={getCardIcon(suggestion.text)}
                  index={index}
                  autoSubmit={true}
                  showSubmitAnimation={true}
                  disabled={isTyping}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`Enter your ${projectState.stage.toLowerCase().replace('_', ' ')}...`}
          rows={2}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100 resize-none"
          disabled={isTyping}
        />
        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors"
        >
          Send
        </button>
      </div>

      {/* Project Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Project Progress</h3>
        <div className="space-y-2 text-sm">
          <div>Big Idea: {projectState.ideation.bigIdea || 'Not yet defined'}</div>
          <div>Essential Question: {projectState.ideation.essentialQuestion || 'Not yet defined'}</div>
          <div>Challenge: {projectState.ideation.challenge || 'Not yet defined'}</div>
        </div>
      </div>

      {/* Refinement Sidebar */}
      <AnimatePresence>
        {showRefinementSidebar && confirmationState && (
          <RefinementSidebar
            currentValue={confirmationState.pendingValue}
            stage={confirmationState.stage}
            context={projectState.context}
            suggestions={getRefinementSuggestions(confirmationState.stage, confirmationState.pendingValue, projectState.context)}
            onUpdate={(refinedValue) => {
              handleSend(refinedValue, { autoSubmit: true, source: 'refinement' });
              setShowRefinementSidebar(false);
              setConfirmationState(null);
            }}
            onCancel={() => {
              if (confirmationState) {
                handleSend(confirmationState.pendingValue, { autoSubmit: true, source: 'refinement' });
              }
              setShowRefinementSidebar(false);
              setConfirmationState(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfirmationFrameworkExample;