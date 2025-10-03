/**
 * InputValidationSystem.ts
 *
 * Advanced input validation system that prevents accidental data capture
 * Addresses the critical issue where "what?" gets stored as "big idea"
 */

export interface ValidationRule {
  name: string;
  test: (input: string, context?: any) => boolean;
  errorMessage: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number; // 0-1 score
  intent: InputIntent;
  errorMessage?: string;
  suggestions?: string[];
  shouldCapture: boolean;
  alternativeAction?: string;
}

export enum InputIntent {
  CONTENT_RESPONSE = 'content_response',     // User providing project content
  CLARIFICATION_REQUEST = 'clarification',   // User asking for clarification
  NAVIGATION_REQUEST = 'navigation',         // User wants to navigate
  HELP_REQUEST = 'help',                     // User needs help
  RANDOM_INPUT = 'random',                   // Nonsensical or test input
  GREETING = 'greeting',                     // Hello, hi, etc.
  AFFIRMATION = 'affirmation',              // Yes, no, okay, etc.
}

/**
 * Comprehensive input validation system
 */
export class InputValidationSystem {
  private clarificationPatterns = [
    /^(what|how|why|when|where|who)\?*$/i,
    /^(huh|eh|excuse me|pardon)\?*$/i,
    /^(i don't understand|unclear|confusing)$/i,
    /^(can you explain|what do you mean)$/i,
    /^(sorry|sorry\?|what\?)$/i
  ];

  private helpPatterns = [
    /^(help|assistance|guide|support)$/i,
    /^(i need help|can you help|help me)$/i,
    /^(how do i|what should i|where do i)$/i,
    /^(stuck|confused|lost|don't know)$/i
  ];

  private navigationPatterns = [
    /^(back|previous|next|forward|skip)$/i,
    /^(go back|go to|navigate to)$/i,
    /^(restart|start over|begin again)$/i,
    /^(menu|home|dashboard)$/i
  ];

  private greetingPatterns = [
    /^(hi|hello|hey|greetings)!*$/i,
    /^(good morning|good afternoon|good evening)$/i,
    /^(thanks|thank you|ty)$/i
  ];

  private affirmationPatterns = [
    /^(yes|yeah|yep|y|ok|okay|sure)$/i,
    /^(no|nope|n|nah)$/i,
    /^(correct|right|wrong|exactly)$/i,
    /^(sounds good|looks good|perfect)$/i
  ];

  private randomPatterns = [
    /^(test|testing|abc|123|asdf|qwerty)$/i,
    /^[a-z]{1,3}$/i, // Single characters or very short strings
    /^[\W_]+$/, // Only special characters
    /^(.)\1{3,}$/, // Repeated characters (aaaa, bbbb)
  ];

  /**
   * Validate user input with intent detection
   */
  validateInput(input: string, stage: string, context?: any): ValidationResult {
    const trimmedInput = input.trim();

    // Empty input
    if (!trimmedInput) {
      return {
        isValid: false,
        confidence: 1.0,
        intent: InputIntent.RANDOM_INPUT,
        errorMessage: 'Please enter a response.',
        shouldCapture: false
      };
    }

    // Detect input intent
    const intent = this.detectInputIntent(trimmedInput);
    const confidence = this.calculateConfidence(trimmedInput, intent, stage);

    // Handle non-content intents
    if (intent !== InputIntent.CONTENT_RESPONSE) {
      return this.handleNonContentIntent(trimmedInput, intent, confidence, stage);
    }

    // Validate content responses by stage
    return this.validateContentByStage(trimmedInput, stage, confidence, context);
  }

  /**
   * Detect the user's intent from their input
   */
  private detectInputIntent(input: string): InputIntent {
    const lower = input.toLowerCase().trim();

    // Check for clarification requests
    if (this.matchesPatterns(input, this.clarificationPatterns)) {
      return InputIntent.CLARIFICATION_REQUEST;
    }

    // Check for help requests
    if (this.matchesPatterns(input, this.helpPatterns)) {
      return InputIntent.HELP_REQUEST;
    }

    // Check for navigation requests
    if (this.matchesPatterns(input, this.navigationPatterns)) {
      return InputIntent.NAVIGATION_REQUEST;
    }

    // Check for greetings
    if (this.matchesPatterns(input, this.greetingPatterns)) {
      return InputIntent.GREETING;
    }

    // Check for affirmations
    if (this.matchesPatterns(input, this.affirmationPatterns)) {
      return InputIntent.AFFIRMATION;
    }

    // Check for random/test input
    if (this.matchesPatterns(input, this.randomPatterns)) {
      return InputIntent.RANDOM_INPUT;
    }

    // Additional random input checks
    if (input.length < 3) {
      return InputIntent.RANDOM_INPUT;
    }

    if (this.isLikelyRandomInput(input)) {
      return InputIntent.RANDOM_INPUT;
    }

    // Default to content response
    return InputIntent.CONTENT_RESPONSE;
  }

  /**
   * Calculate confidence score for the detected intent
   */
  private calculateConfidence(input: string, intent: InputIntent, stage: string): number {
    let confidence = 0.5; // Base confidence

    // Adjust based on input length and complexity
    if (intent === InputIntent.CONTENT_RESPONSE) {
      if (input.length < 10) {confidence -= 0.2;}
      if (input.length > 20) {confidence += 0.2;}
      if (input.length > 50) {confidence += 0.3;}

      // Stage-specific confidence adjustments
      confidence += this.getStageSpecificConfidence(input, stage);
    } else {
      // Non-content intents should have high confidence if detected
      confidence = 0.8;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Handle non-content intents (clarification, help, etc.)
   */
  private handleNonContentIntent(
    input: string,
    intent: InputIntent,
    confidence: number,
    stage: string
  ): ValidationResult {
    switch (intent) {
      case InputIntent.CLARIFICATION_REQUEST:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'I\'d be happy to clarify! Let me provide more guidance for this step.',
          suggestions: this.getClarificationSuggestions(stage),
          shouldCapture: false,
          alternativeAction: 'provide_clarification'
        };

      case InputIntent.HELP_REQUEST:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'I\'m here to help! Here\'s what I need for this step.',
          suggestions: this.getHelpSuggestions(stage),
          shouldCapture: false,
          alternativeAction: 'show_help'
        };

      case InputIntent.NAVIGATION_REQUEST:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'I can help with navigation. What would you like to do?',
          suggestions: ['Go to previous step', 'Start over', 'Skip this step'],
          shouldCapture: false,
          alternativeAction: 'handle_navigation'
        };

      case InputIntent.GREETING:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'Hello! Let\'s focus on designing your project.',
          suggestions: this.getStageSpecificSuggestions(stage),
          shouldCapture: false,
          alternativeAction: 'acknowledge_greeting'
        };

      case InputIntent.AFFIRMATION:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'I need more detailed information to help design your project.',
          suggestions: this.getStageSpecificSuggestions(stage),
          shouldCapture: false,
          alternativeAction: 'request_elaboration'
        };

      case InputIntent.RANDOM_INPUT:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'I didn\'t understand that. Let me help you with this step.',
          suggestions: this.getStageSpecificSuggestions(stage),
          shouldCapture: false,
          alternativeAction: 'provide_guidance'
        };

      default:
        return {
          isValid: false,
          confidence,
          intent,
          errorMessage: 'Please provide a thoughtful response for this step.',
          shouldCapture: false
        };
    }
  }

  /**
   * Validate content responses based on the current stage
   */
  private validateContentByStage(
    input: string,
    stage: string,
    confidence: number,
    context?: any
  ): ValidationResult {
    switch (stage) {
      case 'CONTEXT':
        return this.validateContextInput(input, confidence, context);
      case 'BIG_IDEA':
        return this.validateBigIdeaInput(input, confidence, context);
      case 'ESSENTIAL_QUESTION':
        return this.validateEssentialQuestionInput(input, confidence, context);
      case 'LEARNING_JOURNEY':
        return this.validateLearningJourneyInput(input, confidence, context);
      default:
        return {
          isValid: true,
          confidence,
          intent: InputIntent.CONTENT_RESPONSE,
          shouldCapture: true
        };
    }
  }

  /**
   * Stage-specific validation methods
   */
  private validateContextInput(input: string, confidence: number, context?: any): ValidationResult {
    const hasSubjectKeywords = /\b(science|math|english|social|history|art|music|pe|technology)\b/i.test(input);
    const hasGradeKeywords = /\b(grade|year|k-|elementary|middle|high|primary|secondary|\d+th)\b/i.test(input);
    const hasDurationKeywords = /\b(week|month|semester|quarter|day|hour)\b/i.test(input);

    if (hasSubjectKeywords || hasGradeKeywords || hasDurationKeywords) {
      return {
        isValid: true,
        confidence: Math.min(1.0, confidence + 0.3),
        intent: InputIntent.CONTENT_RESPONSE,
        shouldCapture: true
      };
    }

    if (input.length < 8) {
      return {
        isValid: false,
        confidence,
        intent: InputIntent.CONTENT_RESPONSE,
        errorMessage: 'Please provide more details about your project context.',
        suggestions: [
          'What subject area?',
          'Which grade level?',
          'How long will the project run?'
        ],
        shouldCapture: false
      };
    }

    return {
      isValid: true,
      confidence,
      intent: InputIntent.CONTENT_RESPONSE,
      shouldCapture: true
    };
  }

  private validateBigIdeaInput(input: string, confidence: number, context?: any): ValidationResult {
    // Check if it's actually a question (might be essential question)
    if (input.includes('?')) {
      return {
        isValid: false,
        confidence,
        intent: InputIntent.CONTENT_RESPONSE,
        errorMessage: 'That sounds like a question! A big idea is more of a theme or concept.',
        suggestions: [
          'Environmental sustainability',
          'Community problem-solving',
          'Innovation and design'
        ],
        shouldCapture: false
      };
    }

    // Too short or generic
    if (input.length < 10) {
      return {
        isValid: false,
        confidence,
        intent: InputIntent.CONTENT_RESPONSE,
        errorMessage: 'Please expand on your big idea. What real-world theme should students explore?',
        suggestions: [
          'Think about current events',
          'Consider community issues',
          'What sparks curiosity?'
        ],
        shouldCapture: false
      };
    }

    return {
      isValid: true,
      confidence: Math.min(1.0, confidence + 0.2),
      intent: InputIntent.CONTENT_RESPONSE,
      shouldCapture: true
    };
  }

  private validateEssentialQuestionInput(input: string, confidence: number, context?: any): ValidationResult {
    // Must be a question
    if (!input.includes('?')) {
      return {
        isValid: false,
        confidence,
        intent: InputIntent.CONTENT_RESPONSE,
        errorMessage: 'Essential questions should end with a question mark.',
        suggestions: [
          'How can students...?',
          'What would happen if...?',
          'Why should we care about...?'
        ],
        shouldCapture: false
      };
    }

    // Too short
    if (input.length < 15) {
      return {
        isValid: false,
        confidence,
        intent: InputIntent.CONTENT_RESPONSE,
        errorMessage: 'Please expand your essential question to encourage deeper thinking.',
        suggestions: [
          'Make it open-ended',
          'Connect to real-world issues',
          'Encourage investigation'
        ],
        shouldCapture: false
      };
    }

    return {
      isValid: true,
      confidence: Math.min(1.0, confidence + 0.3),
      intent: InputIntent.CONTENT_RESPONSE,
      shouldCapture: true
    };
  }

  private validateLearningJourneyInput(input: string, confidence: number, context?: any): ValidationResult {
    // Look for process indicators
    const hasProcessWords = /\b(first|then|next|finally|step|phase|stage|research|create|present|share)\b/i.test(input);

    if (input.length < 20) {
      return {
        isValid: false,
        confidence,
        intent: InputIntent.CONTENT_RESPONSE,
        errorMessage: 'Please describe the learning journey in more detail.',
        suggestions: [
          'What phases will students go through?',
          'How will they build knowledge?',
          'What will they create and share?'
        ],
        shouldCapture: false
      };
    }

    const adjustedConfidence = hasProcessWords ? confidence + 0.2 : confidence;

    return {
      isValid: true,
      confidence: Math.min(1.0, adjustedConfidence),
      intent: InputIntent.CONTENT_RESPONSE,
      shouldCapture: true
    };
  }

  /**
   * Helper methods
   */
  private matchesPatterns(input: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(input));
  }

  private isLikelyRandomInput(input: string): boolean {
    // Check for keyboard patterns
    const keyboardPatterns = ['qwerty', 'asdf', 'zxcv', '1234', 'abc'];
    const lower = input.toLowerCase();

    if (keyboardPatterns.some(pattern => lower.includes(pattern))) {
      return true;
    }

    // Check for excessive repetition
    const chars = input.split('');
    const uniqueChars = new Set(chars);
    if (chars.length > 3 && uniqueChars.size === 1) {
      return true;
    }

    return false;
  }

  private getStageSpecificConfidence(input: string, stage: string): number {
    switch (stage) {
      case 'CONTEXT':
        if (/\b(grade|subject|week|month)\b/i.test(input)) {return 0.2;}
        break;
      case 'BIG_IDEA':
        if (input.length > 20 && !input.includes('?')) {return 0.2;}
        break;
      case 'ESSENTIAL_QUESTION':
        if (input.includes('?') && input.length > 15) {return 0.3;}
        break;
      case 'LEARNING_JOURNEY':
        if (/\b(research|create|present|step|phase)\b/i.test(input)) {return 0.2;}
        break;
    }
    return 0;
  }

  private getClarificationSuggestions(stage: string): string[] {
    switch (stage) {
      case 'CONTEXT':
        return ['Tell me your subject area and grade level', 'Example: "Grade 7 science, 3 weeks"'];
      case 'BIG_IDEA':
        return ['Describe a real-world theme or concept', 'Example: "Environmental sustainability"'];
      case 'ESSENTIAL_QUESTION':
        return ['Create an open-ended question', 'Example: "How can we protect our environment?"'];
      case 'LEARNING_JOURNEY':
        return ['Describe student learning phases', 'Example: "Research → Design → Test → Share"'];
      default:
        return ['Let me help you with this step'];
    }
  }

  private getHelpSuggestions(stage: string): string[] {
    return this.getClarificationSuggestions(stage);
  }

  private getStageSpecificSuggestions(stage: string): string[] {
    return this.getClarificationSuggestions(stage);
  }
}

// Singleton instance for easy use
export const inputValidator = new InputValidationSystem();