// Response Length Guidelines for Different Contexts

export interface ResponseGuidelines {
  context: ResponseContext;
  maxWords: number;
  tone: 'concise' | 'explanatory' | 'conversational';
  includeExample: boolean;
}

export enum ResponseContext {
  // CONCISE (25-50 words)
  CONFIRMATION = 'confirmation',           // "Great choice! 'X' will really engage students. Ready for the next step?"
  ACTION_ACKNOWLEDGMENT = 'action_ack',    // "Here are some ideas for your context:"
  TRANSITION = 'transition',               // "Excellent! Let's move to crafting your Essential Question."
  ERROR = 'error',                         // "That doesn't look like a question. Try starting with 'How' or 'Why'."
  
  // MEDIUM (50-100 words)  
  VALIDATION_GUIDANCE = 'validation',      // Explaining why something needs refinement
  HELP_SNIPPET = 'help_snippet',          // Quick help without full explanation
  BRAINSTORM_RESPONSE = 'brainstorm',     // Engaging with their exploration
  
  // LONGER (100-150 words) - Used sparingly
  INITIAL_WELCOME = 'welcome',            // Stage introduction
  HELP_FULL = 'help_full',                // Detailed help when requested
  INSIGHTS = 'insights',                  // Pedagogical insights
}

export const RESPONSE_LIMITS: Record<ResponseContext, ResponseGuidelines> = {
  [ResponseContext.CONFIRMATION]: {
    context: ResponseContext.CONFIRMATION,
    maxWords: 40,
    tone: 'concise',
    includeExample: false
  },
  [ResponseContext.ACTION_ACKNOWLEDGMENT]: {
    context: ResponseContext.ACTION_ACKNOWLEDGMENT,
    maxWords: 25,
    tone: 'concise',
    includeExample: false
  },
  [ResponseContext.TRANSITION]: {
    context: ResponseContext.TRANSITION,
    maxWords: 35,
    tone: 'conversational',
    includeExample: false
  },
  [ResponseContext.ERROR]: {
    context: ResponseContext.ERROR,
    maxWords: 40,
    tone: 'concise',
    includeExample: true
  },
  [ResponseContext.VALIDATION_GUIDANCE]: {
    context: ResponseContext.VALIDATION_GUIDANCE,
    maxWords: 80,
    tone: 'conversational',
    includeExample: true
  },
  [ResponseContext.HELP_SNIPPET]: {
    context: ResponseContext.HELP_SNIPPET,
    maxWords: 75,
    tone: 'explanatory',
    includeExample: true
  },
  [ResponseContext.BRAINSTORM_RESPONSE]: {
    context: ResponseContext.BRAINSTORM_RESPONSE,
    maxWords: 100,
    tone: 'conversational',
    includeExample: false
  },
  [ResponseContext.INITIAL_WELCOME]: {
    context: ResponseContext.INITIAL_WELCOME,
    maxWords: 125,
    tone: 'conversational',
    includeExample: false
  },
  [ResponseContext.HELP_FULL]: {
    context: ResponseContext.HELP_FULL,
    maxWords: 150,
    tone: 'explanatory',
    includeExample: true
  },
  [ResponseContext.INSIGHTS]: {
    context: ResponseContext.INSIGHTS,
    maxWords: 150,
    tone: 'explanatory',
    includeExample: false
  }
};

// Templates for different response types
export const RESPONSE_TEMPLATES = {
  confirmation: {
    bigIdea: [
      `"{{value}}" - powerful concept! Ready for your Essential Question?`,
      `Love it! "{{value}}" will transform how students see {{subject}}. Shall we continue?`,
      `That's compelling! Ready to build on "{{value}}"?`
    ],
    essentialQuestion: [
      `"{{value}}" - that will spark deep thinking! Ready for the Challenge?`,
      `Perfect question! Let's design an authentic challenge next.`,
      `Great! "{{value}}" will guide the entire journey. Continue?`
    ],
    challenge: [
      `"{{value}}" - students will love this authentic task! Ready to map the journey?`,
      `Excellent! That gives real purpose. Let's plan the learning phases.`,
      `Perfect! "{{value}}" connects learning to impact. Shall we continue?`
    ]
  },
  
  error: {
    notQuestion: `That's not quite a question yet. Try starting with "How," "Why," or "In what ways..."`,
    tooShort: `Let's add more depth. A Big Idea should capture a transformative concept.`,
    missingAction: `Challenges need an action verb. Try starting with "Create," "Design," or "Develop"...`
  },
  
  transition: {
    toEQ: `Great foundation! Now let's craft an Essential Question that explores "{{bigIdea}}".`,
    toChallenge: `Excellent question! Time to design an authentic challenge.`,
    toJourney: `Perfect! Now let's map out the learning journey.`
  }
};

// Function to enforce length limits
export function enforceResponseLength(
  response: string, 
  context: ResponseContext
): string {
  const guidelines = RESPONSE_LIMITS[context];
  const words = response.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length <= guidelines.maxWords) {
    return response;
  }
  
  // Truncate and add ellipsis if needed
  const truncated = words.slice(0, guidelines.maxWords).join(' ');
  
  // Make sure we don't cut off mid-sentence
  const lastPeriod = truncated.lastIndexOf('.');
  const lastQuestion = truncated.lastIndexOf('?');
  const lastExclamation = truncated.lastIndexOf('!');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
  
  if (lastSentenceEnd > truncated.length * 0.7) {
    // We have a reasonable sentence end
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // Otherwise just truncate
  return `${truncated  }...`;
}

// AI prompt modifier to enforce brevity
export function createBrevityPrompt(context: ResponseContext): string {
  const guidelines = RESPONSE_LIMITS[context];
  
  return `CRITICAL: Keep your response under ${guidelines.maxWords} words. Be ${guidelines.tone}. ${
    guidelines.includeExample ? 'Include a brief example if helpful.' : 'No examples needed.'
  }`;
}

// Example usage in prompt
export function generateConstrainedPrompt(
  basePrompt: string,
  context: ResponseContext
): string {
  return `${basePrompt}\n\n${createBrevityPrompt(context)}`;
}