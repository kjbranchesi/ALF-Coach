/**
 * ChatInterface.tsx - Main chat component for ALF Coach
 * Orchestrates the SOP flow with stage-specific components
 */

import React, { useState, useRef, useEffect } from 'react';
import { SOPFlowManager } from '../../core/SOPFlowManager';
import { GeminiService } from '../../services/GeminiService';
import { 
  ChatMessage, 
  SuggestionCard, 
  QuickReply,
  SOPFlowState,
  WizardData 
} from '../../core/types/SOPTypes';
import { MessageBubble } from './MessageBubble';
import { QuickReplyChips } from './QuickReplyChips';
import { SuggestionCards } from './SuggestionCards';
import { ChatInput } from './ChatInput';
import { ProgressBar } from './ProgressBar';
import { StageInitiator, StepPrompt, StageClarifier, WizardFlow } from './stages';
import { DebugPanel } from './DebugPanel';

interface ChatInterfaceProps {
  flowManager: SOPFlowManager;
  geminiService: GeminiService;
  onExportBlueprint?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  flowManager,
  geminiService,
  onExportBlueprint
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [flowState, setFlowState] = useState<SOPFlowState>(flowManager.getState());
  const [showStageComponent, setShowStageComponent] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to flow state changes
  useEffect(() => {
    const unsubscribe = flowManager.subscribe((newState) => {
      setFlowState(newState);
    });
    return unsubscribe;
  }, [flowManager]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle wizard completion
   */
  const handleWizardComplete = (data: WizardData) => {
    flowManager.completeWizard(data);
    // Keep stage component showing for Ideation
    setShowStageComponent(true);
  };

  /**
   * Handle stage initiator step completion
   */
  const handleStepComplete = async (response: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content: response
    });

    setIsLoading(true);
    setShowStageComponent(false);

    try {
      // Update flow manager with response
      flowManager.updateStepData(response);

      // Generate AI response
      const aiResponse = await geminiService.generate({
        step: flowState.currentStep,
        context: flowState.blueprintDoc,
        action: 'response',
        userInput: response
      });

      // Add AI message with quick replies
      const quickReplies: QuickReply[] = [
        { action: 'ideas', label: 'Ideas' },
        { action: 'whatif', label: 'What If?' },
        { action: 'help', label: 'Help' }
      ];

      addMessage({
        role: 'assistant',
        content: aiResponse.message,
        quickReplies,
        suggestions: aiResponse.suggestions
      });

    } catch (error) {
      console.error('Error handling step completion:', error);
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle quick reply action
   */
  const handleQuickReply = async (action: string) => {
    if (!flowManager.isActionAllowed(action as any)) {
      console.error('Action not allowed:', action);
      return;
    }

    setIsLoading(true);

    try {
      // Handle stage progression
      if (action === 'continue') {
        if (flowManager.canAdvance()) {
          flowManager.advance();
          setShowStageComponent(true);
          
          // Clear messages on stage change
          if (flowState.currentStep.endsWith('_1')) {
            setMessages([]);
          }
        }
        return;
      }

      // Generate response for other actions
      const response = await geminiService.generate({
        step: flowState.currentStep,
        context: flowState.blueprintDoc,
        action: action as any
      });

      addMessage({
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions
      });

    } catch (error) {
      console.error('Error handling quick reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle stage clarifier action
   */
  const handleClarifierAction = async (action: string) => {
    if (action === 'continue') {
      flowManager.advance();
      setMessages([]);
      setShowStageComponent(true);
    } else if (action === 'refine') {
      // Go back to beginning of stage
      const currentStage = flowState.currentStage;
      if (currentStage !== 'WIZARD' && currentStage !== 'COMPLETED') {
        flowManager.setState({
          ...flowState,
          currentStep: `${currentStage}_1`,
          stageStep: 1
        });
        setMessages([]);
        setShowStageComponent(true);
      }
    } else if (action === 'help') {
      addMessage({
        role: 'assistant',
        content: 'I can help you refine any part of this stage. What would you like to adjust?',
        quickReplies: [
          { action: 'continue', label: 'Continue' },
          { action: 'refine', label: 'Start Over' }
        ]
      });
      setShowStageComponent(false);
    }
  };

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    addMessage({
      role: 'user',
      content: suggestion.text
    });
    
    flowManager.updateStepData(suggestion.text);
    
    // Move to next step
    if (flowManager.canAdvance()) {
      flowManager.advance();
      setShowStageComponent(true);
    }
  };

  /**
   * Handle text input
   */
  const handleInputSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue('');

    // If stage component is showing, treat as step response
    if (showStageComponent) {
      handleStepComplete(userInput);
    } else {
      // Regular chat interaction
      addMessage({
        role: 'user',
        content: userInput
      });

      // Process based on context
      setIsLoading(true);
      try {
        const response = await geminiService.generate({
          step: flowState.currentStep,
          context: flowState.blueprintDoc,
          action: 'chat',
          userInput
        });

        addMessage({
          role: 'assistant',
          content: response.message,
          suggestions: response.suggestions
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Add message to chat
   */
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    flowManager.addMessage(newMessage);
  };

  /**
   * Get current stage step (1, 2, or 3)
   */
  const getCurrentStageStep = (): number => {
    const step = flowState.currentStep;
    const match = step.match(/_(\d)$/);
    return match ? parseInt(match[1]) : 1;
  };

  /**
   * Get stage summary for clarifier
   */
  const getStageSummary = () => {
    const blueprint = flowState.blueprintDoc;
    const stage = flowState.currentStage;

    switch (stage) {
      case 'IDEATION':
        return {
          step1: blueprint.ideation?.bigIdea || 'Developing...',
          step2: blueprint.ideation?.essentialQuestion || 'Developing...',
          step3: blueprint.ideation?.challenge || 'Developing...'
        };
      case 'JOURNEY':
        return {
          step1: blueprint.journey?.hook || 'Developing...',
          step2: blueprint.journey?.activities || 'Developing...',
          step3: blueprint.journey?.reflection || 'Developing...'
        };
      case 'DELIVERABLES':
        return {
          step1: blueprint.deliverables?.products || 'Developing...',
          step2: blueprint.deliverables?.assessment || 'Developing...',
          step3: blueprint.deliverables?.timeline || 'Developing...'
        };
      default:
        return { step1: '', step2: '', step3: '' };
    }
  };

  // Get current UI state
  const currentStage = flowState.currentStage;
  const currentStep = flowState.currentStep;
  const isClarifier = currentStep.endsWith('_CLARIFIER');
  const isWizard = currentStage === 'WIZARD';
  const isCompleted = currentStage === 'COMPLETED';

  // Current message data
  const lastMessage = messages[messages.length - 1];
  const currentSuggestions = lastMessage?.suggestions || [];
  const currentQuickReplies = lastMessage?.quickReplies || [];

  return (
    <div className="chat-interface flex flex-col h-full bg-gray-50">
      {/* Progress Bar - hide during wizard */}
      {!isWizard && !isCompleted && (
        <ProgressBar 
          progress={flowManager.getProgress()} 
          currentStage={currentStage}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Show wizard if in wizard stage */}
        {isWizard && showStageComponent && (
          <WizardFlow onComplete={handleWizardComplete} />
        )}

        {/* Show stage components when appropriate */}
        {!isWizard && !isCompleted && showStageComponent && (
          <div className="max-w-3xl mx-auto p-4">
            {isClarifier ? (
              <StageClarifier
                stage={currentStage}
                summary={getStageSummary()}
                onAction={handleClarifierAction}
                isLoading={isLoading}
              />
            ) : (
              <StageInitiator
                stage={currentStage}
                currentStep={getCurrentStageStep()}
                onStepComplete={handleStepComplete}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {/* Chat messages */}
        {(!showStageComponent || messages.length > 0) && (
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <div className="typing-indicator flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Show completed state */}
        {isCompleted && (
          <div className="max-w-3xl mx-auto p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Blueprint Complete!</h2>
              <p className="text-gray-600">Your active learning experience is ready to implement.</p>
            </div>
            
            <button
              onClick={onExportBlueprint}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Export Blueprint
            </button>
          </div>
        )}
      </div>

      {/* Bottom interaction area */}
      {!isWizard && !isCompleted && !showStageComponent && (
        <>
          {/* Suggestions */}
          {currentSuggestions.length > 0 && (
            <SuggestionCards 
              suggestions={currentSuggestions}
              onSelect={handleSuggestionClick}
            />
          )}

          {/* Quick Replies */}
          {currentQuickReplies.length > 0 && !currentSuggestions.length && (
            <QuickReplyChips
              replies={currentQuickReplies}
              onSelect={handleQuickReply}
              disabled={isLoading}
            />
          )}

          {/* Input Area */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleInputSubmit}
            disabled={isLoading || currentSuggestions.length > 0}
            placeholder={currentSuggestions.length > 0 ? "Select a suggestion above..." : "Type your response..."}
          />
        </>
      )}

      {/* Debug Panel - remove in production */}
      <DebugPanel flowState={flowState} isVisible={true} />
    </div>
  );
};