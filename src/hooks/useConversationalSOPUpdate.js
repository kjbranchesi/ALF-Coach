/**
 * Hook to bridge conversational AI responses with SOPFlowManager updates
 * This ensures the Continue button is enabled when users provide input conversationally
 */

import { useEffect } from 'react';
import { extractIdeationData, extractJourneyPhases } from '../utils/conversationalDataExtractor';

export const useConversationalSOPUpdate = (sopFlowManager, currentStep) => {
  
  const updateFromConversationalResponse = (aiResponse, userInput) => {
    console.log('[useConversationalSOPUpdate] Processing response for step:', currentStep);
    console.log('[useConversationalSOPUpdate] AI Response:', aiResponse);
    console.log('[useConversationalSOPUpdate] User Input:', userInput);
    
    if (!sopFlowManager || !currentStep) {return;}
    
    try {
      // For "not sure help me" or similar conversational inputs
      if (userInput && (
        userInput.toLowerCase().includes('not sure') ||
        userInput.toLowerCase().includes('help') ||
        userInput.toLowerCase().includes('give me') ||
        userInput.toLowerCase().includes('i need') ||
        userInput.toLowerCase().includes('suggest')
      )) {
        console.log('[useConversationalSOPUpdate] User asking for help, processing AI suggestions...');
        
        switch (currentStep) {
          case 'IDEATION_BIG_IDEA':
          case 'IDEATION_EQ':
          case 'IDEATION_CHALLENGE':
            // For ideation steps, use the user input as the data
            // This ensures even "not sure" responses register as progress
            const ideationData = userInput || 'Exploring ideas...';
            console.log('[useConversationalSOPUpdate] Updating ideation step with:', ideationData);
            sopFlowManager.updateStepData(ideationData);
            break;
            
          case 'JOURNEY_PHASES':
            // Extract phases from AI response
            const phases = extractJourneyPhases(aiResponse);
            if (phases.length > 0) {
              console.log('[useConversationalSOPUpdate] Updating journey phases:', phases);
              sopFlowManager.updateStepData(phases);
            } else {
              // Fallback: create a simple phase from the response
              console.log('[useConversationalSOPUpdate] No phases found, using fallback');
              sopFlowManager.updateStepData([{
                title: 'Phase 1',
                description: 'Initial exploration phase'
              }]);
            }
            break;
            
          default:
            // For other steps, use the user input
            console.log('[useConversationalSOPUpdate] Updating step with user input');
            sopFlowManager.updateStepData(userInput || 'Continuing...');
        }
        
        // Check if we can advance now
        const canAdvance = sopFlowManager.canAdvance();
        console.log('[useConversationalSOPUpdate] Can advance after update:', canAdvance);
      }
    } catch (error) {
      console.error('[useConversationalSOPUpdate] Error updating SOP:', error);
    }
  };
  
  // Return the update function for components to call
  return { updateFromConversationalResponse };
};

// Helper function to be called directly when AI responds
export const forceEnableContinue = (sopFlowManager, currentStep) => {
  console.log('[forceEnableContinue] Forcing continue button for step:', currentStep);
  
  if (!sopFlowManager || !currentStep) {return;}
  
  // Add minimal valid data for the current step
  switch (currentStep) {
    case 'IDEATION_BIG_IDEA':
      sopFlowManager.updateStepData('Exploring project ideas...');
      break;
    case 'IDEATION_EQ':
      sopFlowManager.updateStepData('Developing essential question...');
      break;
    case 'IDEATION_CHALLENGE':
      sopFlowManager.updateStepData('Defining the challenge...');
      break;
    case 'JOURNEY_PHASES':
      sopFlowManager.updateStepData([{
        title: 'Exploration Phase',
        description: 'Initial project exploration'
      }]);
      break;
    default:
      sopFlowManager.updateStepData('Continuing...');
  }
};