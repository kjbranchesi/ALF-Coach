/**
 * Holistic Confirmation Framework for ALF Coach
 * Applies consistent confirmation and refinement patterns across ALL stages
 */

export interface ConfirmationResponse {
  shouldProgress: boolean;
  confirmationType: 'immediate' | 'review' | 'refine';
  message: string;
  enhancementSuggestion?: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface StageValidation {
  stage: string;
  input: string;
  attemptCount: number;
  isFromSuggestion: boolean;
}

/**
 * Determine confirmation approach based on input quality and context
 */
export function getConfirmationStrategy(validation: StageValidation): ConfirmationResponse {
  const { stage, input, attemptCount, isFromSuggestion } = validation;
  
  // Force progression after 3 attempts regardless of quality
  if (attemptCount >= 3) {
    return {
      shouldProgress: true,
      confirmationType: 'immediate',
      message: getAcceptanceMessage(stage, input),
      confidenceLevel: 'medium'
    };
  }
  
  // Auto-accept suggestion cards with positive confirmation
  if (isFromSuggestion) {
    return {
      shouldProgress: false, // Still ask for confirmation but positively
      confirmationType: 'review',
      message: getSuggestionConfirmation(stage, input),
      confidenceLevel: 'high'
    };
  }
  
  // Assess quality based on stage
  const quality = assessInputQuality(stage, input);
  
  if (quality.level === 'high') {
    return {
      shouldProgress: false, // Ask for confirmation even for high quality
      confirmationType: 'review',
      message: getHighQualityConfirmation(stage, input),
      confidenceLevel: 'high'
    };
  }
  
  if (quality.level === 'medium') {
    return {
      shouldProgress: false,
      confirmationType: 'review',
      message: getMediumQualityConfirmation(stage, input),
      enhancementSuggestion: quality.enhancement,
      confidenceLevel: 'medium'
    };
  }
  
  // Low quality - offer refinement help
  return {
    shouldProgress: false,
    confirmationType: 'refine',
    message: getRefinementHelp(stage, input),
    enhancementSuggestion: quality.enhancement,
    confidenceLevel: 'low'
  };
}

/**
 * Assess input quality for each stage
 */
function assessInputQuality(stage: string, input: string): { level: 'high' | 'medium' | 'low'; enhancement?: string } {
  const trimmed = input.trim();
  const wordCount = trimmed.split(' ').filter(w => w).length;
  
  switch (stage) {
    case 'BIG_IDEA':
      if (wordCount < 3) {
        return { 
          level: 'low', 
          enhancement: 'Could you expand on this concept a bit more? What deeper understanding do you want students to develop?' 
        };
      }
      if (input.includes('?')) {
        return { 
          level: 'medium', 
          enhancement: 'This sounds like a question - let\'s frame it as a conceptual understanding instead.' 
        };
      }
      return { level: 'high' };
    
    case 'ESSENTIAL_QUESTION':
      const hasQuestionMark = input.includes('?');
      const hasQuestionWord = /\b(how|why|what|when|where|which)\b/i.test(input);
      const isOpenEnded = !input.match(/^(is|are|do|does|can|will|should)/i);
      
      if (!hasQuestionMark && !hasQuestionWord) {
        return { 
          level: 'low', 
          enhancement: 'Let\'s phrase this as a question that will drive student inquiry.' 
        };
      }
      if (!isOpenEnded) {
        return { 
          level: 'medium', 
          enhancement: 'To make this more open-ended, we might start with "How" or "Why" instead.' 
        };
      }
      return { level: 'high' };
    
    case 'CHALLENGE':
      const hasActionWord = /\b(create|design|solve|build|develop|improve|make|plan|propose)\b/i.test(input);
      
      if (wordCount < 5) {
        return { 
          level: 'low', 
          enhancement: 'Let\'s add more detail about what students will actually do or create.' 
        };
      }
      if (!hasActionWord) {
        return { 
          level: 'medium', 
          enhancement: 'Consider adding an action verb to make this more task-oriented.' 
        };
      }
      return { level: 'high' };
    
    default:
      return wordCount > 3 ? { level: 'high' } : { level: 'medium' };
  }
}

/**
 * Stage-specific confirmation messages
 */
function getAcceptanceMessage(stage: string, input: string): string {
  const messages = {
    'BIG_IDEA': `Perfect! "${input}" provides a strong conceptual foundation for your project.`,
    'ESSENTIAL_QUESTION': `Excellent! "${input}" will drive meaningful inquiry throughout the project.`,
    'CHALLENGE': `Great! "${input}" gives students an authentic purpose for their learning.`,
    'JOURNEY': `Your learning journey is well-structured and will guide students effectively.`,
    'DELIVERABLES': `These deliverables will showcase student learning beautifully.`
  };
  return messages[stage] || `Great! Let's move forward with this.`;
}

function getSuggestionConfirmation(stage: string, input: string): string {
  return `I love that choice! "${input}" is a strong foundation. Shall we build on this, or would you like to refine it further?`;
}

function getHighQualityConfirmation(stage: string, input: string): string {
  const confirmations = {
    'BIG_IDEA': `Excellent conceptual thinking! "${input}" will help students see important connections. Ready to create our Essential Question from this?`,
    'ESSENTIAL_QUESTION': `Perfect! "${input}" is open-ended and thought-provoking. Shall we design the Challenge that addresses this question?`,
    'CHALLENGE': `This is an authentic, engaging challenge! Ready to plan the learning journey?`
  };
  return confirmations[stage] || `This looks great! Shall we continue to the next step?`;
}

function getMediumQualityConfirmation(stage: string, input: string): string {
  const confirmations = {
    'BIG_IDEA': `"${input}" is a good start! We can work with this as-is, or I can help you strengthen it. What would you prefer?`,
    'ESSENTIAL_QUESTION': `"${input}" has potential! We can proceed with this, or refine it to be more open-ended. Your choice!`,
    'CHALLENGE': `"${input}" is solid! We can build from here, or add more authentic elements. How would you like to proceed?`
  };
  return confirmations[stage] || `This works! Would you like to refine it or shall we continue?`;
}

function getRefinementHelp(stage: string, input: string): string {
  const helpers = {
    'BIG_IDEA': `I see where you're going with "${input}". Let's develop this into a fuller conceptual understanding. What patterns or principles do you want students to discover?`,
    'ESSENTIAL_QUESTION': `Let's shape "${input}" into a driving question. What aspect of your Big Idea should students investigate?`,
    'CHALLENGE': `"${input}" is a start! Let's make it more action-oriented. What will students create or solve?`
  };
  return helpers[stage] || `Let's develop this further. What else would you like to add?`;
}

/**
 * Generate confirmation prompt for AI based on strategy
 */
export function generateConfirmationPrompt(strategy: ConfirmationResponse, stage: string): string {
  let prompt = strategy.message;
  
  if (strategy.enhancementSuggestion) {
    prompt += `\n\n💡 ${strategy.enhancementSuggestion}`;
  }
  
  // Add action buttons/options based on confirmation type
  switch (strategy.confirmationType) {
    case 'immediate':
      prompt += '\n\n✅ Moving to the next step...';
      break;
    case 'review':
      prompt += '\n\n**Options:**\n- Type "yes" or "continue" to proceed\n- Or share any refinements you\'d like to make';
      break;
    case 'refine':
      prompt += '\n\n**Let me help you refine this.** Share your thoughts and I\'ll help shape them.';
      break;
  }
  
  return prompt;
}

/**
 * Check if user response indicates they want to proceed
 */
export function checkForProgressSignal(input: string): boolean {
  const progressWords = [
    'yes', 'yep', 'yeah', 'sure', 'ok', 'okay', 'good', 'great', 
    'perfect', 'continue', 'next', 'proceed', 'move on', 'let\'s go',
    'sounds good', 'that works', 'ready', 'done', 'confirmed'
  ];
  
  const lowercased = input.toLowerCase().trim();
  return progressWords.some(word => lowercased.includes(word));
}

/**
 * Check if user wants to refine
 */
export function checkForRefinementSignal(input: string): boolean {
  const refineWords = [
    'wait', 'actually', 'hmm', 'let me', 'change', 'different', 
    'revise', 'edit', 'modify', 'adjust', 'refine', 'improve',
    'not quite', 'almost', 'close but'
  ];
  
  const lowercased = input.toLowerCase().trim();
  return refineWords.some(word => lowercased.includes(word));
}