/**
 * PBLErrorRecovery.ts
 * 
 * Intelligent error recovery and input validation for the PBL conversation flow.
 * Handles unexpected inputs, provides helpful suggestions, and maintains conversation continuity.
 */

import { logger } from '../utils/logger';

export interface RecoveryStrategy {
  type: 'clarify' | 'suggest' | 'rephrase' | 'example' | 'skip' | 'help';
  message: string;
  suggestions?: string[];
  examples?: string[];
  allowSkip?: boolean;
}

export interface InputAnalysis {
  intent: 'answer' | 'question' | 'confusion' | 'navigation' | 'correction' | 'unknown';
  confidence: number; // 0-1
  entities: Map<string, string>;
  sentiment: 'positive' | 'neutral' | 'negative' | 'frustrated';
}

export class PBLErrorRecovery {
  private conversationHistory: Array<{ input: string; context: string; recovery: boolean }> = [];
  private recoveryAttempts: Map<string, number> = new Map();
  private userPatterns: Map<string, number> = new Map();
  
  /**
   * Analyze user input to understand intent and sentiment
   */
  analyzeInput(input: string, expectedType: string): InputAnalysis {
    const normalizedInput = input.toLowerCase().trim();
    
    // Detect intent
    let intent: InputAnalysis['intent'] = 'unknown';
    let confidence = 0;
    
    // Navigation patterns
    if (this.matchesPattern(normalizedInput, NAVIGATION_PATTERNS)) {
      intent = 'navigation';
      confidence = 0.9;
    }
    // Question patterns
    else if (this.matchesPattern(normalizedInput, QUESTION_PATTERNS)) {
      intent = 'question';
      confidence = 0.8;
    }
    // Confusion patterns
    else if (this.matchesPattern(normalizedInput, CONFUSION_PATTERNS)) {
      intent = 'confusion';
      confidence = 0.85;
    }
    // Correction patterns
    else if (this.matchesPattern(normalizedInput, CORRECTION_PATTERNS)) {
      intent = 'correction';
      confidence = 0.8;
    }
    // Default to answer if it seems like valid content
    else if (normalizedInput.length > 10 && !this.matchesPattern(normalizedInput, GIBBERISH_PATTERNS)) {
      intent = 'answer';
      confidence = 0.6;
    }
    
    // Detect sentiment
    const sentiment = this.detectSentiment(normalizedInput);
    
    // Extract entities based on expected type
    const entities = this.extractEntities(input, expectedType);
    
    // Track patterns for learning
    this.trackUserPattern(intent);
    
    return {
      intent,
      confidence,
      entities,
      sentiment
    };
  }
  
  /**
   * Generate recovery strategy based on input analysis and context
   */
  getRecoveryStrategy(
    analysis: InputAnalysis,
    expectedType: string,
    attemptNumber: number = 1
  ): RecoveryStrategy {
    const contextKey = `${expectedType}_${analysis.intent}`;
    this.recoveryAttempts.set(contextKey, attemptNumber);
    
    // Handle frustrated users with empathy
    if (analysis.sentiment === 'frustrated' || attemptNumber > 2) {
      return this.getEmpathyResponse(expectedType, attemptNumber);
    }
    
    // Handle based on intent
    switch (analysis.intent) {
      case 'confusion':
        return this.handleConfusion(expectedType, attemptNumber);
        
      case 'question':
        return this.handleUserQuestion(expectedType, analysis);
        
      case 'navigation':
        return this.handleNavigationRequest(analysis);
        
      case 'correction':
        return this.handleCorrection(expectedType);
        
      case 'unknown':
      default:
        return this.handleUnknownInput(expectedType, attemptNumber, analysis);
    }
  }
  
  /**
   * Handle confused users with progressive clarification
   */
  private handleConfusion(expectedType: string, attempt: number): RecoveryStrategy {
    const strategies = CONFUSION_STRATEGIES[expectedType] || CONFUSION_STRATEGIES.default;
    const strategy = strategies[Math.min(attempt - 1, strategies.length - 1)];
    
    return {
      type: 'clarify',
      message: strategy.message,
      suggestions: strategy.suggestions,
      examples: strategy.examples,
      allowSkip: attempt > 2
    };
  }
  
  /**
   * Handle user questions about the process
   */
  private handleUserQuestion(expectedType: string, analysis: InputAnalysis): RecoveryStrategy {
    // Try to answer common questions
    const questionType = this.classifyQuestion(analysis.entities);
    const answer = COMMON_ANSWERS[questionType] || COMMON_ANSWERS.default;
    
    return {
      type: 'help',
      message: `${answer}\n\nNow, regarding ${this.getFieldDescription(expectedType)}...`,
      suggestions: this.getFieldSuggestions(expectedType)
    };
  }
  
  /**
   * Handle navigation requests
   */
  private handleNavigationRequest(analysis: InputAnalysis): RecoveryStrategy {
    return {
      type: 'suggest',
      message: 'I understand you want to navigate. Here are your options:',
      suggestions: [
        'Continue with current step',
        'Go back to previous step',
        'Skip this field (if optional)',
        'Save and exit',
        'Get help'
      ]
    };
  }
  
  /**
   * Handle correction requests
   */
  private handleCorrection(expectedType: string): RecoveryStrategy {
    return {
      type: 'clarify',
      message: 'No problem! Let\'s correct that. What would you like to change?',
      suggestions: [
        'Revise my last answer',
        'Start this section over',
        'Go back one step'
      ]
    };
  }
  
  /**
   * Handle unknown/invalid input
   */
  private handleUnknownInput(
    expectedType: string,
    attempt: number,
    analysis: InputAnalysis
  ): RecoveryStrategy {
    // First attempt - gentle clarification
    if (attempt === 1) {
      return {
        type: 'clarify',
        message: `I didn't quite understand that. ${this.getFieldDescription(expectedType)}`,
        examples: this.getFieldExamples(expectedType),
        suggestions: this.getFieldSuggestions(expectedType)
      };
    }
    
    // Second attempt - provide more examples
    if (attempt === 2) {
      return {
        type: 'example',
        message: `Let me give you some examples of what I'm looking for:`,
        examples: this.getDetailedExamples(expectedType),
        suggestions: ['Show me more examples', 'I need help', 'Skip this']
      };
    }
    
    // Third+ attempt - offer skip or help
    return {
      type: 'skip',
      message: `This seems to be challenging. Would you like to skip this for now, or would you prefer some help?`,
      suggestions: ['Skip for now', 'Get detailed help', 'Try a different approach'],
      allowSkip: true
    };
  }
  
  /**
   * Provide empathetic response for frustrated users
   */
  private getEmpathyResponse(expectedType: string, attempt: number): RecoveryStrategy {
    const messages = [
      "I understand this can be frustrating. Let's take it step by step.",
      "No worries at all! Let's approach this differently.",
      "I'm here to help. Let's make this easier.",
      "Take your time. There's no rush. Let's break this down together."
    ];
    
    return {
      type: 'help',
      message: messages[Math.min(attempt - 1, messages.length - 1)],
      suggestions: [
        'Show me a complete example',
        'Skip this for now',
        'Let me try again',
        'Get human help'
      ],
      examples: this.getSimplestExamples(expectedType),
      allowSkip: true
    };
  }
  
  /**
   * Check if input matches known patterns
   */
  private matchesPattern(input: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(input));
  }
  
  /**
   * Detect user sentiment from input
   */
  private detectSentiment(input: string): InputAnalysis['sentiment'] {
    const frustrated = this.matchesPattern(input, FRUSTRATION_PATTERNS);
    const positive = this.matchesPattern(input, POSITIVE_PATTERNS);
    const negative = this.matchesPattern(input, NEGATIVE_PATTERNS);
    
    if (frustrated) {return 'frustrated';}
    if (positive) {return 'positive';}
    if (negative) {return 'negative';}
    return 'neutral';
  }
  
  /**
   * Extract relevant entities from input
   */
  private extractEntities(input: string, expectedType: string): Map<string, string> {
    const entities = new Map<string, string>();
    
    // Extract grade levels
    const gradeMatch = input.match(/(\d+)(st|nd|rd|th)?\s*(grade|year)/i);
    if (gradeMatch) {
      entities.set('grade', gradeMatch[0]);
    }
    
    // Extract numbers
    const numberMatch = input.match(/\d+/);
    if (numberMatch) {
      entities.set('number', numberMatch[0]);
    }
    
    // Extract time durations
    const durationMatch = input.match(/(\d+)\s*(week|month|day|hour|minute|period)/i);
    if (durationMatch) {
      entities.set('duration', durationMatch[0]);
    }
    
    // Extract subjects
    const subjects = ['math', 'science', 'english', 'history', 'art', 'music', 'pe', 'technology'];
    subjects.forEach(subject => {
      if (input.toLowerCase().includes(subject)) {
        entities.set('subject', subject);
      }
    });
    
    return entities;
  }
  
  /**
   * Track user patterns for adaptive responses
   */
  private trackUserPattern(intent: string): void {
    const count = this.userPatterns.get(intent) || 0;
    this.userPatterns.set(intent, count + 1);
    
    // Log patterns for improvement
    if (count > 3) {
      logger.info('Repeated user pattern detected', { intent, count });
    }
  }
  
  /**
   * Classify question type
   */
  private classifyQuestion(entities: Map<string, string>): string {
    // Simple classification based on keywords
    // In production, this would use NLP
    return 'general';
  }
  
  /**
   * Get field-specific descriptions
   */
  private getFieldDescription(fieldType: string): string {
    const descriptions: Record<string, string> = {
      gradeLevel: 'What grade level are your students?',
      subjects: 'Which subject areas will this project cover?',
      classSize: 'How many students are in your class?',
      duration: 'How long will this project run?',
      learningGoals: 'What do you want students to learn?',
      essentialQuestion: 'What big question will drive student inquiry?',
      default: 'Please provide information for this field.'
    };
    
    return descriptions[fieldType] || descriptions.default;
  }
  
  /**
   * Get field-specific suggestions
   */
  private getFieldSuggestions(fieldType: string): string[] {
    const suggestions: Record<string, string[]> = {
      gradeLevel: ['5th grade', '9-10th grade', 'Middle school (6-8)'],
      subjects: ['Science and Math', 'English Language Arts', 'Interdisciplinary'],
      classSize: ['20-25 students', '30 students', '15 students'],
      duration: ['4 weeks', '6-8 weeks', 'Full semester'],
      learningGoals: [
        'Understand climate change impacts',
        'Develop critical thinking skills',
        'Master fractions and decimals'
      ],
      essentialQuestion: [
        'How can we...?',
        'What would happen if...?',
        'Why does... matter?'
      ],
      default: ['Example 1', 'Example 2', 'Example 3']
    };
    
    return suggestions[fieldType] || suggestions.default;
  }
  
  /**
   * Get field-specific examples
   */
  private getFieldExamples(fieldType: string): string[] {
    return this.getFieldSuggestions(fieldType);
  }
  
  /**
   * Get detailed examples for second attempt
   */
  private getDetailedExamples(fieldType: string): string[] {
    const examples: Record<string, string[]> = {
      gradeLevel: [
        '5th grade (ages 10-11)',
        'High school freshmen (9th grade)',
        'Middle school, mixed 6-7-8 grades'
      ],
      learningGoals: [
        'Students will understand the water cycle and its impact on local ecosystems',
        'Students will develop empathy through exploring diverse cultural perspectives',
        'Students will apply mathematical concepts to solve real-world problems'
      ],
      essentialQuestion: [
        'How can we reduce plastic waste in our community?',
        'What makes a society just and equitable?',
        'How do stories shape our understanding of the world?'
      ],
      default: ['Detailed example 1', 'Detailed example 2', 'Detailed example 3']
    };
    
    return examples[fieldType] || examples.default;
  }
  
  /**
   * Get simplest possible examples for frustrated users
   */
  private getSimplestExamples(fieldType: string): string[] {
    const examples: Record<string, string[]> = {
      gradeLevel: ['5th grade', '10th grade', '7th grade'],
      subjects: ['Math', 'Science', 'English'],
      classSize: ['25', '30', '20'],
      duration: ['4 weeks', '2 months', '6 weeks'],
      default: ['Simple example']
    };
    
    return examples[fieldType] || examples.default;
  }
  
  /**
   * Learn from successful interactions
   */
  recordSuccess(input: string, context: string): void {
    this.conversationHistory.push({
      input,
      context,
      recovery: false
    });
    
    // Reset recovery attempts for this context
    const keys = Array.from(this.recoveryAttempts.keys());
    keys.forEach(key => {
      if (key.startsWith(context)) {
        this.recoveryAttempts.delete(key);
      }
    });
  }
  
  /**
   * Record recovery attempt for learning
   */
  recordRecovery(input: string, context: string, strategy: RecoveryStrategy): void {
    this.conversationHistory.push({
      input,
      context,
      recovery: true
    });
    
    logger.info('Recovery strategy applied', {
      context,
      strategyType: strategy.type,
      attemptNumber: this.recoveryAttempts.get(context) || 1
    });
  }
  
  /**
   * Get recovery statistics for monitoring
   */
  getRecoveryStats(): {
    totalRecoveries: number;
    successRate: number;
    commonIssues: Array<{ pattern: string; count: number }>;
  } {
    const recoveries = this.conversationHistory.filter(h => h.recovery).length;
    const total = this.conversationHistory.length;
    
    const commonIssues = Array.from(this.userPatterns.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalRecoveries: recoveries,
      successRate: total > 0 ? (total - recoveries) / total : 1,
      commonIssues
    };
  }
}

// Pattern definitions
const NAVIGATION_PATTERNS = [
  /^(go\s+)?back/i,
  /^previous/i,
  /^skip/i,
  /^next/i,
  /^jump\s+to/i,
  /^move\s+to/i,
  /^continue/i,
  /^stop/i,
  /^exit/i,
  /^save/i
];

const QUESTION_PATTERNS = [
  /^what\s+/i,
  /^how\s+/i,
  /^why\s+/i,
  /^when\s+/i,
  /^where\s+/i,
  /^who\s+/i,
  /^can\s+i/i,
  /^do\s+i/i,
  /^should\s+i/i,
  /\?$/
];

const CONFUSION_PATTERNS = [
  /i\s+don'?t\s+(understand|know|get)/i,
  /confused/i,
  /not\s+sure/i,
  /unclear/i,
  /what\s+do\s+you\s+mean/i,
  /help/i,
  /lost/i,
  /explain/i,
  /huh\??/i,
  /\?\?+/
];

const CORRECTION_PATTERNS = [
  /^(no|nope)/i,
  /^wait/i,
  /^actually/i,
  /^sorry/i,
  /^mistake/i,
  /^wrong/i,
  /^change/i,
  /^fix/i,
  /^correct/i,
  /^edit/i
];

const FRUSTRATION_PATTERNS = [
  /this\s+is\s+(stupid|dumb|annoying)/i,
  /i\s+give\s+up/i,
  /forget\s+it/i,
  /never\s+mind/i,
  /whatever/i,
  /ugh+/i,
  /grrr+/i,
  /!!!+/
];

const POSITIVE_PATTERNS = [
  /great/i,
  /perfect/i,
  /excellent/i,
  /good/i,
  /thanks/i,
  /thank\s+you/i,
  /got\s+it/i,
  /understand/i,
  /makes\s+sense/i
];

const NEGATIVE_PATTERNS = [
  /don'?t\s+like/i,
  /hate/i,
  /bad/i,
  /terrible/i,
  /awful/i,
  /horrible/i
];

const GIBBERISH_PATTERNS = [
  /^[^aeiou]+$/i, // No vowels
  /(.)\1{4,}/, // Same character repeated 4+ times
  /^[0-9]+$/, // Only numbers
  /^[^a-zA-Z0-9\s]+$/ // Only special characters
];

// Recovery strategy templates
const CONFUSION_STRATEGIES: Record<string, Array<{
  message: string;
  suggestions?: string[];
  examples?: string[];
}>> = {
  gradeLevel: [
    {
      message: 'I need to know what grade your students are in. For example, "5th grade" or "9-10th grade".',
      examples: ['5th grade', 'Middle school (grades 6-8)', 'High school freshmen']
    },
    {
      message: 'Let me clarify: What age group are your students? You can tell me the grade level, age range, or school level.',
      suggestions: ['Elementary (K-5)', 'Middle (6-8)', 'High School (9-12)']
    },
    {
      message: 'No problem! Simply type the grade number (like "7" for 7th grade) or describe the age group.',
      examples: ['7', '10-11 year olds', 'Sophomores']
    }
  ],
  default: [
    {
      message: 'Let me help you with this. Can you tell me more about what you\'re trying to describe?'
    },
    {
      message: 'I\'m here to help! Let\'s try a different approach. Can you give me a brief description?'
    },
    {
      message: 'No worries! This can be optional for now. We can always come back to it later.'
    }
  ]
};

// Common Q&A
const COMMON_ANSWERS: Record<string, string> = {
  why: 'This information helps me create a project that fits perfectly with your classroom needs.',
  how_long: 'This process typically takes 20-30 minutes, but you can save and resume anytime.',
  what_next: 'After we gather this information, I\'ll help you build a complete PBL project step by step.',
  privacy: 'Your information is kept private and is only used to customize your project.',
  skip: 'Some fields are optional. I\'ll let you know which ones you can skip.',
  default: 'That\'s a great question! This helps ensure your project is perfectly tailored to your needs.'
};

// Export singleton instance
export const pblErrorRecovery = new PBLErrorRecovery();