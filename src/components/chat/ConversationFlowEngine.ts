/**
 * ConversationFlowEngine.ts
 *
 * Simplified, validation-first conversation flow management
 * Replaces the complex stage management in ChatbotFirstInterfaceFixed
 */

export interface ConversationStage {
  id: string;
  name: string;
  description: string;
  required: boolean;
  validation: (input: string, context: ProjectContext) => ValidationResult;
  nextStage: string | null;
  previousStage: string | null;
}

export interface ProjectContext {
  subject?: string;
  gradeLevel?: string;
  projectTopic?: string;
  studentCount?: number;
  duration?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  suggestions?: string[];
  captureData?: boolean;
  dataKey?: string;
}

export interface ConversationState {
  currentStage: string;
  completedStages: string[];
  projectData: Record<string, any>;
  context: ProjectContext;
  pendingInput?: string;
  awaitingConfirmation?: boolean;
}

/**
 * Core conversation stages - streamlined to 4 essential steps
 */
export const CONVERSATION_STAGES: Record<string, ConversationStage> = {
  CONTEXT: {
    id: 'CONTEXT',
    name: 'Project Context',
    description: 'Gather basic project information',
    required: true,
    validation: validateContextInput,
    nextStage: 'BIG_IDEA',
    previousStage: null
  },

  BIG_IDEA: {
    id: 'BIG_IDEA',
    name: 'Big Idea',
    description: 'Define the central theme students will explore',
    required: true,
    validation: validateBigIdeaInput,
    nextStage: 'ESSENTIAL_QUESTION',
    previousStage: 'CONTEXT'
  },

  ESSENTIAL_QUESTION: {
    id: 'ESSENTIAL_QUESTION',
    name: 'Essential Question',
    description: 'Craft the driving question for the project',
    required: true,
    validation: validateEssentialQuestionInput,
    nextStage: 'LEARNING_JOURNEY',
    previousStage: 'BIG_IDEA'
  },

  LEARNING_JOURNEY: {
    id: 'LEARNING_JOURNEY',
    name: 'Learning Journey',
    description: 'Design the student experience and assessments',
    required: true,
    validation: validateLearningJourneyInput,
    nextStage: null,
    previousStage: 'ESSENTIAL_QUESTION'
  }
};

/**
 * Input validation functions
 */
function validateContextInput(input: string, context: ProjectContext): ValidationResult {
  const lowerInput = input.toLowerCase();

  // Check for subject matter
  if (lowerInput.includes('subject') || lowerInput.includes('topic')) {
    return {
      isValid: true,
      captureData: true,
      dataKey: 'subject',
      suggestions: ['Tell me more about your students', 'How long will this project run?']
    };
  }

  // Check for grade level
  if (lowerInput.includes('grade') || lowerInput.includes('year') || lowerInput.includes('student')) {
    return {
      isValid: true,
      captureData: true,
      dataKey: 'gradeLevel',
      suggestions: ['What subject area?', 'How many weeks for this project?']
    };
  }

  // Generic context response
  if (input.trim().length > 5) {
    return {
      isValid: true,
      captureData: false,
      suggestions: [
        'What subject will this project focus on?',
        'What grade level are your students?',
        'How long should this project run?'
      ]
    };
  }

  return {
    isValid: false,
    errorMessage: 'Please tell me about your project context - subject, grade level, or duration.'
  };
}

function validateBigIdeaInput(input: string, context: ProjectContext): ValidationResult {
  const trimmedInput = input.trim();

  // Too short
  if (trimmedInput.length < 10) {
    return {
      isValid: false,
      errorMessage: 'Please expand on your big idea. What real-world problem or theme should students explore?',
      suggestions: [
        'Think about current events or community issues',
        'Consider interdisciplinary themes',
        'What sparks student curiosity?'
      ]
    };
  }

  // Check for question marks (might be essential question instead)
  if (trimmedInput.includes('?')) {
    return {
      isValid: false,
      errorMessage: 'That sounds like a question! A big idea is more of a theme or concept. What broader topic should students explore?',
      suggestions: [
        'Environmental sustainability',
        'Community problem-solving',
        'Innovation and design'
      ]
    };
  }

  // Valid big idea
  if (trimmedInput.length >= 10) {
    return {
      isValid: true,
      captureData: true,
      dataKey: 'bigIdea',
      suggestions: ['Perfect! Now let\'s craft the essential question.']
    };
  }

  return {
    isValid: false,
    errorMessage: 'Please describe the big idea or theme for your project.'
  };
}

function validateEssentialQuestionInput(input: string, context: ProjectContext): ValidationResult {
  const trimmedInput = input.trim();

  // Must be a question
  if (!trimmedInput.includes('?')) {
    return {
      isValid: false,
      errorMessage: 'Essential questions should end with a question mark. What question will drive student inquiry?',
      suggestions: [
        'How can we...?',
        'What would happen if...?',
        'Why do you think...?'
      ]
    };
  }

  // Too short
  if (trimmedInput.length < 15) {
    return {
      isValid: false,
      errorMessage: 'Please expand your essential question. It should spark deep thinking and investigation.',
      suggestions: [
        'Make it open-ended',
        'Connect to real-world applications',
        'Encourage multiple perspectives'
      ]
    };
  }

  // Valid essential question
  return {
    isValid: true,
    captureData: true,
    dataKey: 'essentialQuestion',
    suggestions: ['Excellent! Now let\'s design the learning journey.']
  };
}

function validateLearningJourneyInput(input: string, context: ProjectContext): ValidationResult {
  const trimmedInput = input.trim();

  if (trimmedInput.length < 20) {
    return {
      isValid: false,
      errorMessage: 'Please describe how students will progress through this project. What activities and assessments will guide their learning?',
      suggestions: [
        'Research phase → Creative phase → Sharing phase',
        'Individual work → Collaboration → Presentation',
        'Investigation → Solution design → Testing'
      ]
    };
  }

  return {
    isValid: true,
    captureData: true,
    dataKey: 'learningJourney',
    suggestions: ['Great! Your project framework is complete.']
  };
}

/**
 * Main conversation flow engine
 */
export class ConversationFlowEngine {
  private state: ConversationState;
  private listeners: ((state: ConversationState) => void)[] = [];

  constructor(initialContext: ProjectContext = {}) {
    this.state = {
      currentStage: 'CONTEXT',
      completedStages: [],
      projectData: {},
      context: initialContext,
      awaitingConfirmation: false
    };
  }

  /**
   * Process user input with validation
   */
  processInput(input: string): {
    success: boolean;
    message: string;
    suggestions?: string[];
    stageComplete?: boolean;
  } {
    const currentStage = CONVERSATION_STAGES[this.state.currentStage];
    if (!currentStage) {
      return {
        success: false,
        message: 'Invalid conversation stage'
      };
    }

    const validation = currentStage.validation(input, this.state.context);

    if (!validation.isValid) {
      return {
        success: false,
        message: validation.errorMessage || 'Invalid input',
        suggestions: validation.suggestions
      };
    }

    // Capture data if validation allows
    if (validation.captureData && validation.dataKey) {
      this.state.projectData[validation.dataKey] = input.trim();
    }

    // Check if stage is complete
    const isStageComplete = this.isStageComplete(currentStage.id);

    if (isStageComplete) {
      this.completeStage(currentStage.id);
    }

    this.notifyListeners();

    return {
      success: true,
      message: this.getStageCompletionMessage(currentStage.id, isStageComplete),
      suggestions: validation.suggestions,
      stageComplete: isStageComplete
    };
  }

  /**
   * Check if current stage has all required data
   */
  private isStageComplete(stageId: string): boolean {
    switch (stageId) {
      case 'CONTEXT':
        return !!(this.state.context.subject || this.state.context.gradeLevel);
      case 'BIG_IDEA':
        return !!this.state.projectData.bigIdea;
      case 'ESSENTIAL_QUESTION':
        return !!this.state.projectData.essentialQuestion;
      case 'LEARNING_JOURNEY':
        return !!this.state.projectData.learningJourney;
      default:
        return false;
    }
  }

  /**
   * Mark stage as complete and advance
   */
  private completeStage(stageId: string): void {
    if (!this.state.completedStages.includes(stageId)) {
      this.state.completedStages.push(stageId);
    }

    const nextStage = CONVERSATION_STAGES[stageId].nextStage;
    if (nextStage) {
      this.state.currentStage = nextStage;
    }
  }

  /**
   * Get contextual message for stage completion
   */
  private getStageCompletionMessage(stageId: string, isComplete: boolean): string {
    if (!isComplete) {
      return this.getStagePrompt(stageId);
    }

    const nextStage = CONVERSATION_STAGES[stageId].nextStage;
    if (nextStage) {
      return `Great! Moving on to ${CONVERSATION_STAGES[nextStage].name}. ${this.getStagePrompt(nextStage)}`;
    }

    return 'Project framework complete! Ready to build your full project plan.';
  }

  /**
   * Get contextual prompt for each stage
   */
  getStagePrompt(stageId: string): string {
    const context = this.state.context;

    switch (stageId) {
      case 'CONTEXT':
        return 'Let\'s start by understanding your project context. What subject area and grade level are you designing for?';

      case 'BIG_IDEA':
        const subject = context.subject ? ` for ${context.subject}` : '';
        const grade = context.gradeLevel ? ` with ${context.gradeLevel} students` : '';
        return `Perfect! What big idea or theme would you like students to explore${subject}${grade}? Think about real-world problems or compelling concepts.`;

      case 'ESSENTIAL_QUESTION':
        const bigIdea = this.state.projectData.bigIdea;
        return `Now let's craft an essential question that will drive student inquiry around "${bigIdea}". What question will spark their investigation?`;

      case 'LEARNING_JOURNEY':
        return 'How will students progress through this project? Describe the key phases of their learning journey and how you\'ll assess their growth.';

      default:
        return 'How can I help you with your project design?';
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: ConversationState) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Navigate to specific stage (with validation)
   */
  navigateToStage(stageId: string): boolean {
    if (!CONVERSATION_STAGES[stageId]) return false;

    this.state.currentStage = stageId;
    this.notifyListeners();
    return true;
  }
}