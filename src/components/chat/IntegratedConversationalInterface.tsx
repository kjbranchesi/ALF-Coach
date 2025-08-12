/**
 * IntegratedConversationalInterface.tsx
 * Demonstrates how to integrate all conversational flow improvements
 * Shows proper mental model establishment and professional tone throughout
 */

import React, { useState, useEffect } from 'react';
import { ConversationalFlowManager } from './ConversationalFlowManager';
import { ErrorRecoveryEnhanced } from './ErrorRecoveryEnhanced';
import { CelebrationSystem } from './CelebrationSystem';
import { 
  OPENING_MESSAGES, 
  detectTeacherConfusion, 
  getCelebrationMessage 
} from '../../prompts/enhanced-conversational-flow';
import { type SOPStage } from '../../core/types/SOPTypes';
import { type WizardData } from '../../features/wizard/wizardSchema';

interface IntegratedConversationalInterfaceProps {
  currentStage: SOPStage;
  currentStep: number;
  wizardData: WizardData;
  capturedData: any;
  onStageComplete: (stage: SOPStage, data: any) => void;
  onError: (error: any) => void;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'welcome' | 'transition' | 'celebration' | 'error_recovery';
}

interface InterfaceState {
  messages: ConversationMessage[];
  currentError: any | null;
  showCelebration: any | null;
  hasInitialized: boolean;
  isProcessing: boolean;
}

export const IntegratedConversationalInterface: React.FC<IntegratedConversationalInterfaceProps> = ({
  currentStage,
  currentStep,
  wizardData,
  capturedData,
  onStageComplete,
  onError
}) => {
  const [state, setState] = useState<InterfaceState>({
    messages: [],
    currentError: null,
    showCelebration: null,
    hasInitialized: false,
    isProcessing: false
  });

  // Initialize conversation with proper mental model establishment
  useEffect(() => {
    if (!state.hasInitialized && currentStage !== 'WIZARD') {
      initializeConversationFlow();
    }
  }, [currentStage]);

  /**
   * Initialize the conversation with mental model establishment
   */
  const initializeConversationFlow = () => {
    // Send welcome sequence that establishes teacher role
    addMessage({
      role: 'assistant',
      content: OPENING_MESSAGES.WELCOME.content,
      type: 'welcome'
    });

    // Follow up with mental model clarification
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: OPENING_MESSAGES.MENTAL_MODEL_CLARIFICATION.content,
        type: 'welcome'
      });
    }, 2000);

    // Complete with design session invitation
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: OPENING_MESSAGES.DESIGN_SESSION_BEGIN.content,
        type: 'welcome'
      });
      
      setState(prev => ({ ...prev, hasInitialized: true }));
    }, 4000);
  };

  /**
   * Handle user message with comprehensive processing
   */
  const handleUserMessage = (message: string) => {
    setState(prev => ({ ...prev, isProcessing: true }));
    
    // Add user message
    addMessage({
      role: 'user',
      content: message
    });

    // Check for teacher confusion first
    const confusionResponse = detectTeacherConfusion(message);
    if (confusionResponse) {
      handleTeacherConfusion(message, confusionResponse);
      return;
    }

    // Process normal flow
    processNormalFlow(message);
  };

  /**
   * Handle teacher role confusion with appropriate recovery
   */
  const handleTeacherConfusion = (originalMessage: string, confusionType: string) => {
    const errorType = getConfusionType(originalMessage);
    
    setState(prev => ({
      ...prev,
      currentError: {
        type: errorType,
        message: confusionType,
        originalInput: originalMessage
      },
      isProcessing: false
    }));
  };

  /**
   * Process normal conversation flow
   */
  const processNormalFlow = (message: string) => {
    // Simulate AI processing
    setTimeout(() => {
      // Generate appropriate response
      const response = generateContextualResponse(message);
      
      addMessage({
        role: 'assistant',
        content: response
      });

      // Check for celebration moments
      const celebrationMoment = detectCelebrationMoment(message);
      if (celebrationMoment) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            showCelebration: celebrationMoment
          }));
        }, 1000);
      }

      setState(prev => ({ ...prev, isProcessing: false }));
    }, 1500);
  };

  /**
   * Generate contextual response based on stage and input
   */
  const generateContextualResponse = (input: string): string => {
    // This would integrate with your AI service
    // For demo purposes, providing stage-appropriate responses
    
    const responses = {
      IDEATION: {
        1: `Excellent big idea. "${input.substring(0, 50)}..." shows real understanding of what engages students. This foundation will anchor their entire creative journey through meaningful exploration.`,
        2: `Strong essential question. This will guide deep inquiry throughout the learning experience. Your students will return to this question repeatedly as they develop understanding.`,
        3: `Perfect authentic challenge. This real-world connection will motivate students and give their work genuine purpose beyond the classroom walls.`
      },
      JOURNEY: {
        1: `Thoughtful progression design. This learning path will guide your students logically from curiosity to creation. Each phase builds naturally toward the next.`,
        2: `Engaging activity design. You're balancing different learning styles and providing varied experiences that will keep students motivated throughout the journey.`,
        3: `Comprehensive resource planning. You're thinking practically about what students need to succeed while considering different types of support and materials.`
      },
      DELIVERABLES: {
        1: `Strategic milestone planning. These checkpoints will help both you and students track progress while providing feedback opportunities.`,
        2: `Clear success criteria. This rubric will help students understand exactly what excellence looks like while making assessment transparent.`,
        3: `Meaningful impact design. Connecting student work to authentic audiences gives their efforts real purpose and significance.`
      }
    };

    const stageResponses = (responses as any)[currentStage];
    return stageResponses?.[currentStep] || "Your design thinking shows real educational expertise. This will create meaningful learning for your students.";
  };

  /**
   * Detect moments worthy of celebration
   */
  const detectCelebrationMoment = (input: string): any | null => {
    // Check for authentic connections
    if (input.toLowerCase().includes('community') || 
        input.toLowerCase().includes('real world')) {
      return {
        type: 'milestone',
        achievement: 'AUTHENTIC_CONNECTION',
        context: { stage: currentStage, step: currentStep }
      };
    }

    // Check for student-centered design
    if (input.toLowerCase().includes('students will') || 
        input.toLowerCase().includes('they will')) {
      return {
        type: 'milestone',
        achievement: 'STUDENT_CENTERED_DESIGN',
        context: { stage: currentStage, step: currentStep }
      };
    }

    return null;
  };

  /**
   * Determine type of teacher confusion
   */
  const getConfusionType = (message: string): string => {
    if (/students? (will|should|can) (help|decide|choose|design)/i.test(message)) {
      return 'role_confusion';
    }
    if (/with.{0,10}students?|students?.{0,10}present/i.test(message)) {
      return 'scope_confusion';
    }
    if (/how.{0,15}(implement|teach|deliver)/i.test(message)) {
      return 'implementation_confusion';
    }
    if (/curriculum|standards|textbook/i.test(message)) {
      return 'content_confusion';
    }
    return 'general';
  };

  /**
   * Add message to conversation
   */
  const addMessage = (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  /**
   * Clear current error state
   */
  const clearError = () => {
    setState(prev => ({
      ...prev,
      currentError: null
    }));
  };

  /**
   * Clear celebration state
   */
  const clearCelebration = () => {
    setState(prev => ({
      ...prev,
      showCelebration: null
    }));
  };

  /**
   * Handle validation errors
   */
  const handleValidationError = (message: string) => {
    setState(prev => ({
      ...prev,
      currentError: {
        type: 'validation',
        message: message
      }
    }));
  };

  return (
    <div className="integrated-conversational-interface max-w-4xl mx-auto p-6">
      {/* Error Recovery */}
      {state.currentError && (
        <ErrorRecoveryEnhanced
          error={state.currentError}
          currentStage={currentStage}
          onRetry={clearError}
          onClarifyRole={() => {
            addMessage({
              role: 'assistant',
              content: OPENING_MESSAGES.MENTAL_MODEL_CLARIFICATION.content,
              type: 'system'
            });
            clearError();
          }}
          onGetHelp={() => {
            addMessage({
              role: 'assistant', 
              content: "I'm here to help you design an exceptional learning experience. As the educator, you're making professional decisions about curriculum design. What aspect would you like guidance on?",
              type: 'system'
            });
            clearError();
          }}
        />
      )}

      {/* Celebration System */}
      {state.showCelebration && (
        <CelebrationSystem
          type={state.showCelebration.type}
          achievement={state.showCelebration.achievement}
          context={state.showCelebration.context}
          onContinue={() => {
            clearCelebration();
            // Continue to next step or stage
          }}
          onReview={() => {
            clearCelebration();
            // Show review interface
          }}
        />
      )}

      {/* Main Conversational Flow */}
      <ConversationalFlowManager
        currentStage={currentStage}
        currentStep={currentStep}
        wizardData={wizardData}
        capturedData={capturedData}
        onMessageSend={(message, role) => {
          if (role === 'user') {
            handleUserMessage(message);
          } else {
            addMessage({ role, content: message });
          }
        }}
        onValidationError={handleValidationError}
        onCelebration={(achievement) => {
          setState(prev => ({
            ...prev,
            showCelebration: {
              type: 'milestone',
              achievement: achievement,
              context: { stage: currentStage, step: currentStep }
            }
          }));
        }}
      />

      {/* Message History */}
      <div className="mt-8">
        <div className="space-y-4">
          {state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.role === 'system'
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Processing Indicator */}
      {state.isProcessing && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-pulse text-gray-500">
            Processing your design input...
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedConversationalInterface;