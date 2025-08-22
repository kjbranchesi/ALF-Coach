// Acceptance Criteria System to Prevent Circular Questioning
// Based on PBL Expert recommendations: Progress > Perfection

export interface AcceptanceCriteria {
  isAcceptable: boolean;
  needsRefinement: boolean;
  refinementSuggestion?: string;
  acceptAndBuild?: string;
}

/**
 * Check if a Big Idea is acceptable to move forward
 * Accept when: Any conceptual theme (even simple), 3+ words suggesting a topic
 */
export function evaluateBigIdea(input: string): AcceptanceCriteria {
  const trimmed = input.trim();
  const wordCount = trimmed.split(' ').length;
  
  // Very minimal requirements - accept almost anything conceptual
  if (wordCount >= 2 && trimmed.length > 10) {
    // Check if it's an activity (we want concepts, not activities)
    const isActivity = /students will|they will do|activity|project to/i.test(trimmed);
    
    if (isActivity) {
      return {
        isAcceptable: true, // Still accept it!
        needsRefinement: true,
        acceptAndBuild: `"${trimmed}" - I can see you're thinking about the activity! Let's also identify the deeper concept behind this. What understanding will students gain from this work?`
      };
    }
    
    // It's conceptual enough - accept it!
    return {
      isAcceptable: true,
      needsRefinement: false,
      acceptAndBuild: `"${trimmed}" - excellent! That's a powerful conceptual lens for your project. This Big Idea will help students see the deeper patterns and connections.`
    };
  }
  
  // Even very short answers - accept and build
  if (trimmed.length > 0) {
    return {
      isAcceptable: true,
      needsRefinement: true,
      acceptAndBuild: `"${trimmed}" - that's a start! Let me help you expand this into a fuller Big Idea. What aspect of ${trimmed} do you want students to deeply understand?`
    };
  }
  
  return {
    isAcceptable: false,
    needsRefinement: true,
    refinementSuggestion: "Let's think about the core concept you want students to understand. What's the big picture idea behind your project?"
  };
}

/**
 * Check if an Essential Question is acceptable
 * Accept when: Any question format, any inquiry statement
 */
export function evaluateEssentialQuestion(input: string, bigIdea?: string): AcceptanceCriteria {
  const trimmed = input.trim();
  const hasQuestionMark = trimmed.includes('?');
  const hasQuestionWord = /how|why|what|when|where|which|who/i.test(trimmed);
  
  // Accept any question
  if (hasQuestionMark || hasQuestionWord) {
    // Check if it's closed-ended
    const isClosedEnded = /^(is|are|do|does|can|will|should)\s/i.test(trimmed);
    
    if (isClosedEnded) {
      return {
        isAcceptable: true, // Accept it anyway!
        needsRefinement: true,
        acceptAndBuild: `"${trimmed}" - good question! To make it more open-ended and drive deeper inquiry, we might rephrase it as "How does..." or "To what extent..." But let's work with your question as our starting point!`
      };
    }
    
    return {
      isAcceptable: true,
      needsRefinement: false,
      acceptAndBuild: `"${trimmed}" - that's a fantastic Essential Question! It's open-ended, thought-provoking, and will drive sustained inquiry throughout your project.`
    };
  }
  
  // Not a question but has content - accept and convert
  if (trimmed.length > 5) {
    return {
      isAcceptable: true,
      needsRefinement: true,
      acceptAndBuild: `"${trimmed}" - I can work with that! Let's frame it as a question: "How does ${trimmed}?" or "What is the impact of ${trimmed}?" Which angle interests you most?`
    };
  }
  
  return {
    isAcceptable: false,
    needsRefinement: true,
    refinementSuggestion: `Building on your Big Idea "${bigIdea}", what question would drive student investigation?`
  };
}

/**
 * Check if a Challenge is acceptable
 * Accept when: Any action verb, any student output mentioned
 */
export function evaluateChallenge(input: string, essentialQuestion?: string): AcceptanceCriteria {
  const trimmed = input.trim();
  const actionVerbs = /create|design|build|solve|develop|help|improve|investigate|propose|analyze/i;
  const hasActionVerb = actionVerbs.test(trimmed);
  
  // Has action verb - accept it!
  if (hasActionVerb || trimmed.length > 15) {
    // Check if it has real-world connection
    const hasAudience = /community|local|families|people|school|neighborhood/i.test(trimmed);
    
    if (!hasAudience) {
      return {
        isAcceptable: true, // Accept anyway!
        needsRefinement: true,
        acceptAndBuild: `"${trimmed}" - that's a solid challenge! To make it more authentic, let's think about who would benefit from this work. What real audience could use what your students create?`
      };
    }
    
    return {
      isAcceptable: true,
      needsRefinement: false,
      acceptAndBuild: `"${trimmed}" - perfect! That's an authentic challenge that will give your students real purpose and meaningful work.`
    };
  }
  
  // Any content at all - accept and build
  if (trimmed.length > 0) {
    return {
      isAcceptable: true,
      needsRefinement: true,
      acceptAndBuild: `"${trimmed}" - let's develop that into an action-oriented challenge. What will students actually create or do to explore "${essentialQuestion}"?`
    };
  }
  
  return {
    isAcceptable: false,
    needsRefinement: true,
    refinementSuggestion: `What authentic task could students complete to answer "${essentialQuestion}"?`
  };
}

/**
 * General principle: Accept and build rather than reject and request
 */
export function shouldAcceptInput(input: string, stage: string): boolean {
  // After 3 attempts at any stage, accept whatever they give us
  // This prevents infinite loops
  if (!input || input.trim().length === 0) return false;
  
  // For any input with content, we should accept and work with it
  return input.trim().length > 0;
}

/**
 * Generate a "Yes, and..." response that builds on user input
 */
export function generateAcceptanceResponse(
  input: string, 
  stage: string,
  context?: any
): string {
  const templates = {
    BIG_IDEA: [
      `"${input}" - that's a compelling conceptual foundation!`,
      `Yes! "${input}" gives us a powerful lens for the project.`,
      `Excellent - "${input}" will help students see deeper connections.`
    ],
    ESSENTIAL_QUESTION: [
      `"${input}" - that question will definitely drive inquiry!`,
      `Perfect! "${input}" is exactly the kind of question that sparks curiosity.`,
      `Yes! "${input}" will keep students investigating throughout the project.`
    ],
    CHALLENGE: [
      `"${input}" - that's an authentic challenge students will be excited about!`,
      `Great! "${input}" gives students real purpose for their work.`,
      `Excellent - "${input}" connects learning to real impact.`
    ]
  };
  
  const stageTemplates = templates[stage as keyof typeof templates] || [`"${input}" - let's build on that!`];
  return stageTemplates[Math.floor(Math.random() * stageTemplates.length)];
}