/**
 * Advanced intent detection system for natural conversation flow
 */

export type UserIntent = 
  | 'exploring'      // User is thinking out loud, not ready to commit
  | 'questioning'    // User is asking for clarification or help
  | 'submitting'     // User is providing their final answer
  | 'elaborating'    // User is adding more detail to previous thought
  | 'confirming'     // User is agreeing/confirming
  | 'refining'       // User wants to modify their previous answer
  | 'uncertain'      // User is expressing doubt or confusion

export interface IntentContext {
  currentStage: string;
  messageHistory: Array<{ role: string; content: string }>;
  previousIntent?: UserIntent;
  conversationTurns: number;
}

/**
 * Patterns for detecting different intents
 */
const IntentPatterns = {
  exploring: [
    // Thinking out loud
    /\b(maybe|perhaps|possibly|might|could be|thinking about|wondering if)\b/i,
    /\b(not sure|unsure|don't know|trying to|figuring out)\b/i,
    /\b(exploring|considering|pondering|contemplating)\b/i,
    // Common brainstorming phrases
    /\b(one idea|an idea|thinking maybe|we could try)\b/i,
    /\b(something like|along the lines of|sort of|kind of)\b/i,
    /\b(i'm thinking|i've been thinking|what if we)\b/i,
    // Stream of consciousness
    /\.\.\./,
    /\band\s+also\b/i,
    /\bor\s+maybe\b/i,
    // Multiple ideas joined
    /\b(another idea|also thinking|what about|or we could)\b/i
  ],
  
  questioning: [
    // Direct questions
    /\?$/,
    /^(what|when|where|who|why|how|which|can|could|should|would|will|is|are|do|does|did)\s/i,
    // Indirect questions
    /\b(wondering|curious|asking|question|unclear|confused)\b/i,
    /^(tell me|explain|help me understand|clarify|what does)\b/i,
    // Requests for examples
    /\b(example|for instance|such as|like what)\b/i,
    /\b(show me|can you give|could you provide)\b/i
  ],
  
  submitting: [
    // Definitive language
    /^(my|our|the)\s+(idea|question|challenge|answer)\s+(is|will be|would be)[:]/i,
    /^(here's|here is|this is)\s+(my|our|the)/i,
    /\b(definitely|certainly|absolutely|for sure)\b/i,
    // Completion markers
    /^(done|finished|complete|that's it|final answer)\b/i,
    /\b(ready to move|let's go with|i'll go with|decided on)\b/i
  ],
  
  elaborating: [
    // Building on previous
    /^(also|additionally|furthermore|moreover|plus)\b/i,
    /^(to add|building on|expanding on|more specifically)\b/i,
    /\b(because|since|as|due to|the reason)\b/i,
    // Clarifying
    /^(what i mean|to clarify|in other words|specifically)\b/i,
    /^(by that|when i say|i meant)\b/i
  ],
  
  confirming: [
    // Agreement
    /^(yes|yeah|yep|correct|exactly|right|that's it|perfect)\b/i,
    /^(sounds good|looks good|works for me|let's do it)\b/i,
    /^(i agree|confirmed|approved|go ahead)\b/i
  ],
  
  refining: [
    // Change indicators
    /^(actually|wait|hold on|scratch that|no wait)\b/i,
    /^(let me rephrase|i meant to say|correction)\b/i,
    /\b(change|modify|adjust|revise|edit)\b/i,
    /^(instead|rather than|different idea)\b/i
  ],
  
  uncertain: [
    // Doubt expressions
    /^(i don't know|not sure|confused|lost)\b/i,
    /\b(help|stuck|difficult|struggling)\b/i,
    /^(um+|uh+|hmm+)\b/i,
    // Seeking validation
    /\b(is this right|am i on track|does this make sense)\b/i
  ]
};

/**
 * Analyze message structure for intent clues
 */
function analyzeMessageStructure(message: string): {
  wordCount: number;
  hasMultipleClauses: boolean;
  sentenceCount: number;
  endsWithQuestion: boolean;
  startsWithFiller: boolean;
  hasListStructure: boolean;
} {
  const wordCount = message.trim().split(/\s+/).length;
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const hasMultipleClauses = /\b(and|but|or|because|since|although|while)\b/i.test(message);
  const endsWithQuestion = message.trim().endsWith('?');
  const startsWithFiller = /^(so|well|um|uh|like|you know)\b/i.test(message);
  const hasListStructure = /(\d+\.|\n-|\n•|first|second|third)/i.test(message);
  
  return {
    wordCount,
    hasMultipleClauses,
    sentenceCount,
    endsWithQuestion,
    startsWithFiller,
    hasListStructure
  };
}

/**
 * Calculate confidence scores for each intent
 */
function calculateIntentScores(
  message: string,
  structure: ReturnType<typeof analyzeMessageStructure>
): Record<UserIntent, number> {
  const scores: Record<UserIntent, number> = {
    exploring: 0,
    questioning: 0,
    submitting: 0,
    elaborating: 0,
    confirming: 0,
    refining: 0,
    uncertain: 0
  };
  
  // Check patterns
  for (const [intent, patterns] of Object.entries(IntentPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(message)) {
        scores[intent as UserIntent] += 10;
      }
    }
  }
  
  // Structure-based scoring adjustments
  if (structure.endsWithQuestion) {
    scores.questioning += 15;
  }
  
  if (structure.startsWithFiller) {
    scores.exploring += 5;
    scores.uncertain += 3;
  }
  
  if (structure.wordCount < 5) {
    scores.confirming += 5;
    scores.submitting -= 5;
  } else if (structure.wordCount > 50) {
    scores.exploring += 8;
    scores.elaborating += 5;
  }
  
  if (structure.hasMultipleClauses) {
    scores.exploring += 5;
    scores.elaborating += 3;
  }
  
  if (structure.hasListStructure) {
    scores.submitting += 8;
    scores.exploring -= 3;
  }
  
  return scores;
}

/**
 * Context-aware adjustments to intent scores
 */
function applyContextAdjustments(
  scores: Record<UserIntent, number>,
  context: IntentContext,
  message: string
): Record<UserIntent, number> {
  const adjustedScores = { ...scores };
  
  // Stage-specific adjustments (percentage-based for better balance)
  if (context.currentStage.includes('INITIATOR')) {
    // At the beginning, people often explore or ask questions
    adjustedScores.exploring *= 1.3; // 30% boost
    adjustedScores.questioning *= 1.2; // 20% boost
  }
  
  if (context.currentStage.includes('CLARIFIER')) {
    // Review stages often lead to confirmation or refinement
    adjustedScores.confirming *= 1.25; // 25% boost
    adjustedScores.refining *= 1.2; // 20% boost
  }
  
  // Previous intent influences current intent
  if (context.previousIntent === 'questioning') {
    // After asking a question, likely to elaborate or explore
    adjustedScores.elaborating += 3;
    adjustedScores.exploring += 3;
  }
  
  if (context.previousIntent === 'exploring') {
    // After exploring, might be ready to submit
    if (context.conversationTurns > 3) {
      adjustedScores.submitting += 5;
    }
  }
  
  // Check for response to AI prompts
  const lastAIMessage = context.messageHistory
    .filter(m => m.role === 'assistant')
    .pop();
    
  if (lastAIMessage) {
    const lastContent = lastAIMessage.content.toLowerCase();
    
    // If AI asked a direct question
    if (lastContent.includes('?')) {
      adjustedScores.questioning -= 5; // User probably answering, not asking
      adjustedScores.submitting += 3;
    }
    
    // If AI asked for confirmation
    if (lastContent.includes('is this') || lastContent.includes('correct')) {
      adjustedScores.confirming += 10;
    }
    
    // If AI offered to help refine
    if (lastContent.includes('refine') || lastContent.includes('adjust')) {
      adjustedScores.refining += 5;
    }
  }
  
  return adjustedScores;
}

/**
 * Main intent detection function
 */
export function detectUserIntent(
  message: string,
  context: IntentContext
): {
  intent: UserIntent;
  confidence: number;
  reasoning: string;
  suggestedResponse: 'engage' | 'clarify' | 'confirm' | 'guide';
} {
  // Analyze message structure
  const structure = analyzeMessageStructure(message);
  
  // Calculate base scores
  let scores = calculateIntentScores(message, structure);
  
  // Apply context adjustments
  scores = applyContextAdjustments(scores, context, message);
  
  // Find highest scoring intent
  let maxScore = 0;
  let detectedIntent: UserIntent = 'uncertain';
  
  for (const [intent, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedIntent = intent as UserIntent;
    }
  }
  
  // Calculate confidence
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 0;
  
  // Generate reasoning
  const reasoning = generateReasoning(detectedIntent, structure, scores);
  
  // Suggest appropriate response type
  const suggestedResponse = getSuggestedResponse(detectedIntent, confidence);
  
  return {
    intent: detectedIntent,
    confidence,
    reasoning,
    suggestedResponse
  };
}

/**
 * Generate human-readable reasoning for the detection
 */
function generateReasoning(
  intent: UserIntent,
  structure: ReturnType<typeof analyzeMessageStructure>,
  scores: Record<UserIntent, number>
): string {
  const reasons: string[] = [];
  
  if (structure.endsWithQuestion) {
    reasons.push('ends with a question');
  }
  
  if (structure.startsWithFiller) {
    reasons.push('starts with filler words suggesting thinking process');
  }
  
  if (structure.wordCount < 10) {
    reasons.push('brief response');
  } else if (structure.wordCount > 50) {
    reasons.push('detailed response suggesting exploration');
  }
  
  // Add top scoring pattern matches
  const topScores = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);
    
  for (const [scoredIntent, score] of topScores) {
    if (score > 10) {
      reasons.push(`strong ${scoredIntent} indicators`);
    }
  }
  
  return reasons.join(', ');
}

/**
 * Suggest how the AI should respond based on intent
 */
function getSuggestedResponse(
  intent: UserIntent,
  confidence: number
): 'engage' | 'clarify' | 'confirm' | 'guide' {
  if (confidence < 50) {
    return 'clarify'; // Low confidence, ask for clarification
  }
  
  switch (intent) {
    case 'exploring':
    case 'elaborating':
      return 'engage'; // Continue the conversation
      
    case 'questioning':
    case 'uncertain':
      return 'guide'; // Provide help or examples
      
    case 'submitting':
    case 'confirming':
      return 'confirm'; // Move to confirmation
      
    case 'refining':
      return 'engage'; // Help them refine
      
    default:
      return 'clarify';
  }
}

/**
 * Helper to format intent result for logging
 */
export function formatIntentDetection(result: ReturnType<typeof detectUserIntent>): string {
  return `Intent: ${result.intent} (${result.confidence.toFixed(1)}% confidence)
Reasoning: ${result.reasoning}
Suggested Response: ${result.suggestedResponse}`;
}