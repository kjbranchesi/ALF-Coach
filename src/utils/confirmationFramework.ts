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
    'BIG_IDEA': `I love the conceptual depth in "${input}" - this gives students something transferable they can apply way beyond this project. This kind of Big Idea helps them see patterns across disciplines.`,
    'ESSENTIAL_QUESTION': `"${input}" has that perfect quality of a question students won't be able to stop thinking about. I can imagine them debating this at lunch and bringing new perspectives from home.`,
    'CHALLENGE': `"${input}" beautifully connects learning to real impact. When students know their work matters to actual people in their community, everything changes about their engagement level.`
  };
  return confirmations[stage] || `This demonstrates excellent understanding of what makes powerful PBL design!`;
}

function getMediumQualityConfirmation(stage: string, input: string): string {
  const confirmations = {
    'BIG_IDEA': `I can see the concept developing in "${input}" - you're moving from topic toward transferable understanding, which is exactly the right direction. We can build on this foundation or sharpen it further.`,
    'ESSENTIAL_QUESTION': `"${input}" shows good thinking about driving inquiry. To maximize student engagement, we could explore making it even more open-ended and debate-worthy - but this works as our starting point.`,
    'CHALLENGE': `"${input}" has authentic purpose building in it. The key is making sure students see exactly how their work will impact real people - we can strengthen that connection or move forward.`
  };
  return confirmations[stage] || `This shows solid PBL thinking! We can develop it further or build from here - what feels right to you?`;
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
 * Generate confirmation prompt for AI based on strategy - EXPERT GUIDANCE APPROACH
 */
export function generateConfirmationPrompt(strategy: ConfirmationResponse, stage: string): string {
  // Start with expert context to expand teacher understanding
  let prompt = `${getExpertInsight(stage)  }\n\n${  strategy.message}`;

  if (strategy.enhancementSuggestion) {
    prompt += `\n\n💡 **Coaching Insight:** ${strategy.enhancementSuggestion}`;
  }

  // Add forward momentum while maintaining educational value
  switch (strategy.confirmationType) {
    case 'immediate':
      prompt += `\n\n${  getStageTransition(stage)  }\n\n✅ Let's build on this foundation...`;
      break;
    case 'review':
      prompt += `\n\n${  getStageTransition(stage)}`;
      prompt += '\n\n**Ready to move forward?** Type "yes" to continue, or share any thoughts to refine this together.';
      break;
    case 'refine':
      prompt += '\n\n**Let\'s strengthen this together.** What direction feels right to you?';
      break;
  }

  return prompt;
}

/**
 * Provide expert insights that expand teacher thinking
 */
function getExpertInsight(stage: string): string {
  switch (stage) {
    case 'BIG_IDEA':
      return "🎯 **PBL Expert Insight:** The strongest Big Ideas help students see transferable patterns. For example, 'Systems have interconnected parts' works across science, social studies, and beyond - while 'Photosynthesis' stays locked in one lesson.";

    case 'ESSENTIAL_QUESTION':
      return "🎯 **PBL Expert Insight:** Great Essential Questions create 'cognitive hooks' that students can't stop thinking about. They should spark debate at the dinner table and connect daily lessons to bigger purposes.";

    case 'CHALLENGE':
      return "🎯 **PBL Expert Insight:** Authentic challenges transform students from 'doing school' to 'doing important work.' When students know their audience is real and their impact matters, engagement soars.";

    case 'JOURNEY':
      return "🎯 **PBL Expert Insight:** The learning journey mirrors real creative work - from understanding problems to testing solutions. This process builds both content knowledge and life skills.";

    default:
      return "🎯 **PBL Expert Insight:** Each element works together to create learning experiences that feel meaningful to students.";
  }
}

/**
 * Provide transition context that maintains momentum while educating
 */
function getStageTransition(stage: string): string {
  switch (stage) {
    case 'BIG_IDEA':
      return "**Next:** We'll craft an Essential Question that will drive student curiosity and connect to this Big Idea throughout your project timeline.";

    case 'ESSENTIAL_QUESTION':
      return "**Next:** Let's design an authentic Challenge that gives students real purpose and connects their inquiry to community impact.";

    case 'CHALLENGE':
      return "**Next:** We'll map the learning journey - how students will move through research, ideation, creation, and reflection to tackle this challenge.";

    case 'JOURNEY':
      return "**Next:** Let's define the deliverables and assessment strategy that will capture student learning and growth.";

    default:
      return "**Next:** Let's continue building your project framework.";
  }
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