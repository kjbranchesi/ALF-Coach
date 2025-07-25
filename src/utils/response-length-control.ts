import { ResponseContext, ResponseLengthLimits } from '../types/chat';

/**
 * Counts words in a text string
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Enforces response length based on context
 */
export function enforceResponseLength(
  response: string, 
  context: ResponseContext
): { text: string; wordCount: number; wasModified: boolean } {
  const wordCount = countWords(response);
  const limits = ResponseLengthLimits[context];
  
  if (wordCount >= limits.min && wordCount <= limits.max) {
    return { text: response, wordCount, wasModified: false };
  }
  
  // Response is too long - truncate intelligently
  if (wordCount > limits.max) {
    const words = response.trim().split(/\s+/);
    const truncated = words.slice(0, limits.max).join(' ');
    
    // Try to end at a sentence boundary while preserving punctuation
    const sentencePattern = /([.!?]+)/;
    const parts = truncated.split(sentencePattern);
    
    // Need at least 2 parts for a complete sentence (text + punctuation)
    if (parts.length > 2) {
      // Keep complete sentences (pairs of text + punctuation)
      const lastCompleteIndex = Math.floor((parts.length - 1) / 2) * 2;
      const completeSentences = parts.slice(0, lastCompleteIndex).join('');
      return { 
        text: completeSentences, 
        wordCount: countWords(completeSentences), 
        wasModified: true 
      };
    }
    
    return { text: truncated + '...', wordCount: limits.max, wasModified: true };
  }
  
  // Response is too short - log warning but allow it
  if (wordCount < limits.min && wordCount > 0) {
    console.warn(`Response shorter than expected for ${context}: ${wordCount} words (expected ${limits.min}-${limits.max})`);
  }
  return { text: response, wordCount, wasModified: false };
}

/**
 * Adds length enforcement instructions to prompts
 */
export function addLengthConstraintToPrompt(
  prompt: string, 
  context: ResponseContext
): string {
  const limits = ResponseLengthLimits[context];
  const constraint = `\n\nIMPORTANT: Keep your response between ${limits.min}-${limits.max} words. Be concise and focused.`;
  
  return prompt + constraint;
}

/**
 * Determines the appropriate response context based on the message type and stage
 */
export function determineResponseContext(
  messageType: string,
  currentStage: string,
  isConfirmation: boolean = false
): ResponseContext {
  // Confirmations always use confirmation length
  if (isConfirmation) {
    return ResponseContext.CONFIRMATION;
  }
  
  // Stage-specific contexts
  if (messageType === 'validation_error') {
    return ResponseContext.VALIDATION_ERROR;
  }
  
  if (messageType === 'help') {
    return ResponseContext.HELP_CONTENT;
  }
  
  if (messageType === 'brainstorming' || messageType === 'exploration') {
    return ResponseContext.BRAINSTORMING;
  }
  
  if (currentStage.includes('_INITIATOR') || messageType === 'welcome') {
    return ResponseContext.INITIAL_WELCOME;
  }
  
  if (currentStage.includes('_CLARIFIER') || messageType === 'complete') {
    return ResponseContext.STAGE_COMPLETE;
  }
  
  // Default to brainstorming length for general responses
  return ResponseContext.BRAINSTORMING;
}

/**
 * Formats a confirmation response with appropriate length
 */
export function formatConfirmationResponse(
  userInput: string,
  stage: string,
  context: { subject?: string; ageGroup?: string }
): string {
  const templates = {
    'IDEATION_BIG_IDEA': [
      `Excellent! "${userInput}" is a powerful concept that will drive meaningful learning. This gives your ${context.ageGroup || 'students'} a compelling reason to engage deeply.`,
      `Perfect! "${userInput}" creates authentic purpose for exploration. Your ${context.ageGroup || 'students'} will connect personally with this theme.`,
      `Love it! "${userInput}" opens rich possibilities for discovery. This will anchor your ${context.subject || 'project'} beautifully.`
    ],
    'IDEATION_EQ': [
      `Great question! "${userInput}" will spark genuine inquiry and sustain exploration throughout your project. It's open-ended and thought-provoking.`,
      `Powerful! "${userInput}" invites multiple perspectives and deep thinking. Your students will wrestle productively with this question.`,
      `Excellent! "${userInput}" connects perfectly to your big idea while opening space for authentic investigation.`
    ],
    'IDEATION_CHALLENGE': [
      `Perfect! "${userInput}" gives students real purpose and audience. This authentic challenge will drive meaningful work.`,
      `Outstanding! "${userInput}" transforms learning into action. Students will see immediate relevance and impact.`,
      `Brilliant! "${userInput}" creates genuine stakes and motivation. This challenge will inspire your students.`
    ]
  };
  
  const stageTemplates = templates[stage] || [
    `Excellent! "${userInput}" captures exactly what we're looking for. This will work beautifully for your project.`
  ];
  
  const template = stageTemplates[Math.floor(Math.random() * stageTemplates.length)];
  
  // Ensure it meets length requirements
  const result = enforceResponseLength(template, ResponseContext.CONFIRMATION);
  return result.text;
}