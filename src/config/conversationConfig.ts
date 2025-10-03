/**
 * Conversation Configuration for ALF Coach
 * 
 * Centralizes conversation flow settings to prevent circular questioning
 * and maintain productive momentum in educator guidance.
 * 
 * Based on PBL best practices: Progress > Perfection
 */

export const ConversationConfig = {
  /**
   * Acceptance Thresholds
   * Minimum criteria for accepting user input at each stage
   */
  acceptanceThresholds: {
    BIG_IDEA: {
      minWords: 2,  // Accept even "technology matters"
      maxClarificationAttempts: 1,  // Only ask once for clarification
      acceptActivities: true,  // Extract concepts from activities
      acceptVague: true,  // Work with vague input rather than reject
    },
    ESSENTIAL_QUESTION: {
      minWords: 3,  // Accept short questions
      acceptClosedEnded: true,  // Convert yes/no to open-ended
      acceptStatements: true,  // Convert statements to questions
      maxClarificationAttempts: 1,
    },
    CHALLENGE: {
      minWords: 2,  // Accept "create guide"
      acceptWithoutAudience: true,  // Add audience ourselves
      acceptAbstract: true,  // Make it concrete ourselves
      maxClarificationAttempts: 1,
    },
  },

  /**
   * Coaching Strategies
   * How to respond based on input quality
   */
  coachingStrategies: {
    immediate_acceptance: {
      tone: 'celebratory',
      structure: ['acknowledge', 'expand', 'advance'],
      examples: [
        "Excellent! '{input}' is exactly the kind of {stage_element} we need.",
        "Perfect! '{input}' gives us a strong foundation to build on.",
        "Outstanding! '{input}' will really engage your students.",
      ],
    },
    gentle_refinement: {
      tone: 'supportive',
      structure: ['accept', 'suggest', 'confirm'],
      examples: [
        "Good start! '{input}' suggests we could explore...",
        "I like that! Building on '{input}', we might consider...",
        "That works! Let me help expand '{input}' to...",
      ],
    },
    recovery_support: {
      tone: 'encouraging',
      structure: ['normalize', 'options', 'simplify'],
      examples: [
        "That's perfectly normal! Let's try this angle...",
        "No problem! Would you prefer to: A)... B)... or C)...?",
        "I understand! Let's break this down into smaller pieces...",
      ],
    },
  },

  /**
   * Forbidden Phrases
   * Never use these phrases that create circular questioning
   */
  forbiddenPhrases: [
    "What fundamental understanding",
    "Could you clarify",
    "What do you mean by",
    "Can you be more specific",
    "I need more information",
    "That's not quite right",
    "Let's try again",
    "Not exactly what I was looking for",
    "Can you elaborate",
    "Tell me more about",
  ],

  /**
   * Progress Phrases
   * Always use these to maintain momentum
   */
  progressPhrases: {
    acceptance: [
      "Excellent!",
      "Perfect!",
      "Great!",
      "That works!",
      "I love that!",
      "Brilliant!",
    ],
    building: [
      "Building on that...",
      "Let me expand on that...",
      "That suggests...",
      "This connects to...",
      "We can develop this into...",
    ],
    advancement: [
      "Now let's...",
      "With that foundation...",
      "Moving forward...",
      "Next, we'll explore...",
      "This leads us to...",
    ],
  },

  /**
   * Recovery Templates
   * For handling minimal or confused responses
   */
  recoveryTemplates: {
    minimal_yes: "Great! I'll take that as agreement. Let's continue with...",
    minimal_no: "No problem! Let's try a different approach...",
    confusion: "That's perfectly fine! Here are three options to choose from...",
    very_short: "'{input}' - I can work with that! This suggests...",
    off_topic: "Interesting thought! Let me connect that to our project...",
  },

  /**
   * Stage Transition Rules
   * When to move forward vs. when to stay
   */
  stageTransitionRules: {
    BIG_IDEA: {
      canAdvanceWith: ['any conceptual statement', 'activity description', '3+ words'],
      mustStayIf: ['explicit help request', 'single word', 'question mark only'],
    },
    ESSENTIAL_QUESTION: {
      canAdvanceWith: ['any question format', 'inquiry statement', '5+ word statement'],
      mustStayIf: ['no inquiry intent', 'explicit confusion', 'help request'],
    },
    CHALLENGE: {
      canAdvanceWith: ['action verb present', 'output mentioned', 'creation implied'],
      mustStayIf: ['purely theoretical', 'no action component', 'explicit help request'],
    },
  },

  /**
   * Maximum Attempts
   * Prevent infinite loops
   */
  maxAttempts: {
    perStage: 10,  // Maximum exchanges before forced progression
    clarificationRequests: 1,  // Only ask for clarification once
    exampleProvisions: 2,  // Provide examples maximum twice
    totalConversation: 50,  // Maximum total exchanges
  },

  /**
   * Auto-Progress Rules
   * When to automatically move forward
   */
  autoProgressRules: {
    afterUserResponses: 3,  // Move forward after 3 responses in same stage
    onRepeatedConfusion: true,  // Move forward if user confused 2+ times
    onMinimalProgress: true,  // Accept minimal viable input and progress
  },
};

/**
 * Helper function to check if a phrase should trigger acceptance
 */
export function shouldAcceptInput(input: string, stage: string): boolean {
  const config = ConversationConfig.acceptanceThresholds[stage];
  if (!config) {return true;}  // Default to acceptance
  
  const wordCount = input.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  // Accept if meets minimum word count
  if (wordCount >= config.minWords) {return true;}
  
  // Accept if it's an activity and we accept activities
  if (config.acceptActivities && /will|create|make|do|build/.test(input)) {return true;}
  
  // Accept if it's vague but we accept vague
  if (config.acceptVague && wordCount >= 2) {return true;}
  
  return false;
}

/**
 * Helper function to get appropriate coaching response
 */
export function getCoachingResponse(
  input: string,
  stage: string,
  quality: 'immediate' | 'refine' | 'recover'
): string {
  const strategy = ConversationConfig.coachingStrategies[
    quality === 'immediate' ? 'immediate_acceptance' :
    quality === 'refine' ? 'gentle_refinement' :
    'recovery_support'
  ];
  
  const template = strategy.examples[Math.floor(Math.random() * strategy.examples.length)];
  return template.replace('{input}', input).replace('{stage_element}', stage.toLowerCase());
}

/**
 * Helper function to check if we should auto-progress
 */
export function shouldAutoProgress(messageCount: number, confusionCount: number): boolean {
  const rules = ConversationConfig.autoProgressRules;
  
  if (messageCount >= rules.afterUserResponses) {return true;}
  if (confusionCount >= 2 && rules.onRepeatedConfusion) {return true;}
  
  return false;
}