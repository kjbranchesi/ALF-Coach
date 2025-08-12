/**
 * ConversationalFlowManager.tsx
 * Manages enhanced conversational flow with proper mental model establishment
 * Professional, warm tone like expert colleague - no emojis, no cutesy language
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type SOPStage } from '../../core/types/SOPTypes';
import { type WizardData } from '../../features/wizard/wizardSchema';
import {
  OPENING_MESSAGES,
  STAGE_TRANSITIONS,
  CREATIVE_PROCESS_PROMPTS,
  ERROR_RECOVERY_MESSAGES,
  CELEBRATION_MESSAGES,
  VALIDATION_MESSAGES,
  detectTeacherConfusion,
  getCelebrationMessage
} from '../../prompts/enhanced-conversational-flow';

interface ConversationalFlowManagerProps {
  currentStage: SOPStage;
  currentStep: number;
  wizardData: WizardData;
  capturedData: any;
  onMessageSend: (message: string, type: 'user' | 'assistant') => void;
  onValidationError: (message: string) => void;
  onCelebration: (achievement: string) => void;
}

interface ConversationalState {
  hasWelcomed: boolean;
  hasEstablishedMentalModel: boolean;
  lastStage: SOPStage | null;
  needsTransition: boolean;
  awaitingUserResponse: boolean;
}

export const ConversationalFlowManager: React.FC<ConversationalFlowManagerProps> = ({
  currentStage,
  currentStep,
  wizardData,
  capturedData,
  onMessageSend,
  onValidationError,
  onCelebration
}) => {
  const [conversationalState, setConversationalState] = useState<ConversationalState>({
    hasWelcomed: false,
    hasEstablishedMentalModel: false,
    lastStage: null,
    needsTransition: false,
    awaitingUserResponse: false
  });
  
  const [userInput, setUserInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize conversation flow
  useEffect(() => {
    if (!hasInitialized.current && currentStage !== 'WIZARD') {
      initializeConversation();
      hasInitialized.current = true;
    }
  }, [currentStage]);

  // Handle stage transitions
  useEffect(() => {
    if (conversationalState.lastStage && conversationalState.lastStage !== currentStage) {
      handleStageTransition(conversationalState.lastStage, currentStage);
    }
    
    setConversationalState(prev => ({
      ...prev,
      lastStage: currentStage
    }));
  }, [currentStage]);

  /**
   * Initialize conversation with proper mental model establishment
   */
  const initializeConversation = async () => {
    if (!conversationalState.hasWelcomed) {
      // Send welcome message
      onMessageSend(OPENING_MESSAGES.WELCOME.content, 'assistant');
      
      // Brief pause, then mental model clarification
      setTimeout(() => {
        onMessageSend(OPENING_MESSAGES.MENTAL_MODEL_CLARIFICATION.content, 'assistant');
        
        // Another pause, then design session invitation
        setTimeout(() => {
          onMessageSend(OPENING_MESSAGES.DESIGN_SESSION_BEGIN.content, 'assistant');
          
          setConversationalState(prev => ({
            ...prev,
            hasWelcomed: true,
            hasEstablishedMentalModel: true,
            awaitingUserResponse: true
          }));
        }, 2000);
      }, 3000);
    }
  };

  /**
   * Handle transitions between major stages
   */
  const handleStageTransition = (fromStage: SOPStage, toStage: SOPStage) => {
    let transitionMessage = '';
    
    if (fromStage === 'IDEATION' && toStage === 'JOURNEY') {
      if (STAGE_TRANSITIONS.IDEATION_TO_JOURNEY.validation(capturedData)) {
        transitionMessage = STAGE_TRANSITIONS.IDEATION_TO_JOURNEY.content;
        onCelebration('IDEATION_COMPLETE');
      }
    } else if (fromStage === 'JOURNEY' && toStage === 'DELIVERABLES') {
      if (STAGE_TRANSITIONS.JOURNEY_TO_DELIVERABLES.validation(capturedData)) {
        transitionMessage = STAGE_TRANSITIONS.JOURNEY_TO_DELIVERABLES.content;
        onCelebration('JOURNEY_COMPLETE');
      }
    } else if (fromStage === 'DELIVERABLES' && toStage === 'COMPLETED') {
      if (STAGE_TRANSITIONS.DELIVERABLES_TO_COMPLETION.validation(capturedData)) {
        transitionMessage = STAGE_TRANSITIONS.DELIVERABLES_TO_COMPLETION.content;
        onCelebration('DELIVERABLES_COMPLETE');
      }
    }

    if (transitionMessage) {
      onMessageSend(transitionMessage, 'assistant');
    }
  };

  /**
   * Process user input with enhanced validation and confusion detection
   */
  const processUserInput = async (input: string) => {
    setIsValidating(true);
    
    try {
      // First, check for teacher role confusion
      const confusionResponse = detectTeacherConfusion(input);
      if (confusionResponse) {
        onMessageSend(input, 'user');
        onMessageSend(confusionResponse, 'assistant');
        setUserInput('');
        setIsValidating(false);
        return;
      }

      // Validate input based on current stage and step
      const validation = validateCurrentStageInput(input);
      if (!validation.isValid) {
        onValidationError(validation.message);
        setIsValidating(false);
        return;
      }

      // Process valid input
      onMessageSend(input, 'user');
      
      // Generate contextual response
      const response = generateContextualResponse(input);
      if (response) {
        setTimeout(() => {
          onMessageSend(response, 'assistant');
        }, 1000);
      }

      // Check for celebration moments
      if (validation.celebrationMoment) {
        setTimeout(() => {
          onCelebration(validation.celebrationMoment);
        }, 2000);
      }

      setUserInput('');
    } catch (error) {
      console.error('Error processing user input:', error);
      onValidationError('I encountered an issue processing your response. Could you try again?');
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Validate input based on current context
   */
  const validateCurrentStageInput = (input: string): {
    isValid: boolean;
    message: string;
    celebrationMoment?: string;
  } => {
    const trimmed = input.trim();
    
    // Basic length validation
    if (trimmed.length < 10) {
      return {
        isValid: false,
        message: "Your response is quite brief. Could you elaborate a bit more to give me better context?"
      };
    }

    // Stage-specific validation
    if (currentStage === 'IDEATION') {
      return validateIdeationInput(trimmed);
    } else if (currentStage === 'JOURNEY') {
      return validateJourneyInput(trimmed);
    } else if (currentStage === 'DELIVERABLES') {
      return validateDeliverablesInput(trimmed);
    }

    return { isValid: true, message: '' };
  };

  /**
   * Validate ideation stage input
   */
  const validateIdeationInput = (input: string): {
    isValid: boolean;
    message: string;
    celebrationMoment?: string;
  } => {
    if (currentStep === 1) { // Big Idea
      if (input.length < 15) {
        return {
          isValid: false,
          message: VALIDATION_MESSAGES.BIG_IDEA_REFINEMENT.too_narrow
        };
      }
      
      // Check for authentic connection
      if (input.toLowerCase().includes('community') || 
          input.toLowerCase().includes('real world') ||
          input.toLowerCase().includes('students')) {
        return {
          isValid: true,
          message: '',
          celebrationMoment: 'AUTHENTIC_CONNECTION'
        };
      }
    } else if (currentStep === 2) { // Essential Question
      if (!input.includes('?')) {
        return {
          isValid: false,
          message: VALIDATION_MESSAGES.ESSENTIAL_QUESTION_REFINEMENT.not_question
        };
      }
      
      // Check for depth
      if (input.includes('How') || input.includes('Why') || input.includes('What if')) {
        return {
          isValid: true,
          message: '',
          celebrationMoment: 'BREAKTHROUGH_MOMENT'
        };
      }
    } else if (currentStep === 3) { // Challenge
      if (!input.toLowerCase().includes('student')) {
        return {
          isValid: false,
          message: VALIDATION_MESSAGES.CHALLENGE_REFINEMENT.missing_audience
        };
      }
    }

    return { isValid: true, message: '' };
  };

  /**
   * Validate journey stage input
   */
  const validateJourneyInput = (input: string): {
    isValid: boolean;
    message: string;
    celebrationMoment?: string;
  } => {
    // Check for student-centered language
    if (input.toLowerCase().includes('students will') ||
        input.toLowerCase().includes('they will')) {
      return {
        isValid: true,
        message: '',
        celebrationMoment: 'STUDENT_CENTERED_DESIGN'
      };
    }

    return { isValid: true, message: '' };
  };

  /**
   * Validate deliverables stage input
   */
  const validateDeliverablesInput = (input: string): {
    isValid: boolean;
    message: string;
    celebrationMoment?: string;
  } => {
    // Check for authentic audience mention
    if (input.toLowerCase().includes('present') ||
        input.toLowerCase().includes('share') ||
        input.toLowerCase().includes('community')) {
      return {
        isValid: true,
        message: '',
        celebrationMoment: 'AUTHENTIC_CONNECTION'
      };
    }

    return { isValid: true, message: '' };
  };

  /**
   * Generate contextual response based on current stage and input
   */
  const generateContextualResponse = (input: string): string => {
    const prompts = CREATIVE_PROCESS_PROMPTS[currentStage as keyof typeof CREATIVE_PROCESS_PROMPTS];
    
    if (!prompts) return '';

    let responseTemplate = '';
    
    if (currentStage === 'IDEATION') {
      const ideationPrompts = prompts as typeof CREATIVE_PROCESS_PROMPTS.IDEATION;
      
      if (currentStep === 1) {
        responseTemplate = `Excellent big idea. I can see how "${input.substring(0, 50)}..." will engage your students deeply. ${ideationPrompts.BIG_IDEA.clarification}`;
      } else if (currentStep === 2) {
        responseTemplate = `Strong essential question. "${input}" will guide meaningful inquiry throughout the learning experience. ${ideationPrompts.ESSENTIAL_QUESTION.clarification}`;
      } else if (currentStep === 3) {
        responseTemplate = `Perfect authentic challenge. Your students will be motivated by this real-world connection. ${ideationPrompts.CHALLENGE.clarification}`;
      }
    }

    return responseTemplate;
  };

  /**
   * Get current stage prompt based on context
   */
  const getCurrentPrompt = () => {
    const prompts = CREATIVE_PROCESS_PROMPTS[currentStage as keyof typeof CREATIVE_PROCESS_PROMPTS];
    if (!prompts) return null;

    let stepKey = '';
    if (currentStage === 'IDEATION') {
      stepKey = currentStep === 1 ? 'BIG_IDEA' : currentStep === 2 ? 'ESSENTIAL_QUESTION' : 'CHALLENGE';
    } else if (currentStage === 'JOURNEY') {
      stepKey = currentStep === 1 ? 'PHASES' : currentStep === 2 ? 'ACTIVITIES' : 'RESOURCES';
    } else if (currentStage === 'DELIVERABLES') {
      stepKey = currentStep === 1 ? 'MILESTONES' : currentStep === 2 ? 'ASSESSMENT' : 'IMPACT';
    }

    return (prompts as any)[stepKey] || null;
  };

  const currentPrompt = getCurrentPrompt();

  if (!currentPrompt || currentStage === 'WIZARD') {
    return null;
  }

  return (
    <div className="conversational-flow-manager">
      {/* Current Stage Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 mb-6"
      >
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {currentPrompt.prompt}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            {currentPrompt.guidance}
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Examples:
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {currentPrompt.examples}
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Share your thinking..."
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-lg transition-all duration-200 resize-none"
            rows={4}
            disabled={isValidating}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentPrompt.clarification}
            </p>
            
            <button
              onClick={() => processUserInput(userInput)}
              disabled={!userInput.trim() || isValidating}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                userInput.trim() && !isValidating
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {isValidating ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contextual Guidance */}
      <AnimatePresence>
        {userInput.length > 50 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800 mb-4"
          >
            <p className="text-sm text-green-700 dark:text-green-300">
              Great depth in your response. This level of detail will help create a rich learning experience for your students.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationalFlowManager;