// Conversation Recovery Middleware
import { useCallback, useRef } from 'react';

export const useConversationRecovery = (conversationState, setMessages, stage) => {
  const lastValidStateRef = useRef(null);
  const errorCountRef = useRef(0);

  // Save valid state snapshots
  const saveCheckpoint = useCallback((state) => {
    lastValidStateRef.current = {
      ...state,
      timestamp: Date.now()
    };
    errorCountRef.current = 0; // Reset error count on successful state
  }, []);

  // Recovery function when conversation breaks
  const recoverFromError = useCallback((error, userMessage) => {
    errorCountRef.current += 1;
    
    console.error(`🚨 Conversation error (attempt ${errorCountRef.current}):`, error);
    
    // If we have a recent valid state and this isn't a repeated failure
    if (lastValidStateRef.current && errorCountRef.current <= 2) {
      const recoveryMessage = {
        role: 'assistant',
        chatResponse: `I encountered a technical issue, but I can see we were working on your ${stage} stage. Let me help you continue from where we left off. What would you like to work on next?`,
        currentStep: lastValidStateRef.current.currentStep,
        currentStage: stage,
        interactionType: `conversational${stage}`,
        suggestions: null,
        timestamp: Date.now(),
        isRecovery: true
      };

      setMessages(prev => [...prev, recoveryMessage]);
      return true; // Indicate recovery attempted
    }
    
    // If no valid state or repeated failures, suggest restart
    const restartMessage = {
      role: 'assistant', 
      chatResponse: `I'm having trouble maintaining our conversation context. Would you like to restart this ${stage} stage, or would you prefer to continue with what we have so far?`,
      currentStep: 'restart_needed',
      currentStage: stage,
      interactionType: `conversational${stage}`,
      suggestions: ["Restart this stage", "Continue with current progress"],
      timestamp: Date.now(),
      isRecovery: true
    };
    
    setMessages(prev => [...prev, restartMessage]);
    return false; // Indicate restart needed
  }, [stage, setMessages]);

  // Validate AI response structure
  const validateAiResponse = useCallback((response) => {
    const required = ['chatResponse', 'currentStep', 'interactionType'];
    const missing = required.filter(field => !response[field]);
    
    if (missing.length > 0) {
      throw new Error(`Invalid AI response: missing ${missing.join(', ')}`);
    }
    
    if (response.interactionType !== `conversational${stage}`) {
      throw new Error(`Wrong interaction type: expected conversational${stage}, got ${response.interactionType}`);
    }
    
    return true;
  }, [stage]);

  return {
    saveCheckpoint,
    recoverFromError, 
    validateAiResponse,
    getErrorCount: () => errorCountRef.current
  };
};