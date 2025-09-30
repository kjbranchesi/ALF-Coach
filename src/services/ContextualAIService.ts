/**
 * ContextualAIService.ts
 *
 * Intelligent AI service that provides contextual, stage-appropriate responses
 * Replaces the generic AI handling in the original component
 */

import { ConversationState, ProjectContext } from '../components/chat/ConversationFlowEngine';

export interface AIResponse {
  content: string;
  suggestions: string[];
  needsMoreInfo: boolean;
  stageAdvice?: string;
}

export interface AIServiceConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export class ContextualAIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      model: 'gemini-2.5-flash-lite',
      maxTokens: 1000,
      ...config
    };
  }

  /**
   * Generate contextual response based on conversation stage and user input
   */
  async generateResponse(
    userInput: string,
    conversationState: ConversationState,
    validationResult: { isValid: boolean; errorMessage?: string; suggestions?: string[] }
  ): Promise<AIResponse> {
    // If validation failed, provide corrective guidance
    if (!validationResult.isValid) {
      return this.generateCorrectionResponse(userInput, conversationState, validationResult);
    }

    // Generate stage-appropriate success response
    return this.generateSuccessResponse(userInput, conversationState);
  }

  /**
   * Generate corrective response for invalid input
   */
  private generateCorrectionResponse(
    userInput: string,
    conversationState: ConversationState,
    validationResult: { errorMessage?: string; suggestions?: string[] }
  ): AIResponse {
    const stage = conversationState.currentStage;
    const suggestions = validationResult.suggestions || this.getDefaultSuggestions(stage);

    // Contextual error messages
    const baseMessage = validationResult.errorMessage || 'Let me help you with that.';
    const contextualGuidance = this.getStageGuidance(stage, conversationState.context);

    return {
      content: `${baseMessage}\n\n${contextualGuidance}`,
      suggestions,
      needsMoreInfo: true,
      stageAdvice: this.getStageAdvice(stage)
    };
  }

  /**
   * Generate success response for valid input
   */
  private generateSuccessResponse(
    userInput: string,
    conversationState: ConversationState
  ): AIResponse {
    const stage = conversationState.currentStage;
    const context = conversationState.context;
    const projectData = conversationState.projectData;

    switch (stage) {
      case 'CONTEXT':
        return this.generateContextSuccessResponse(userInput, context);

      case 'BIG_IDEA':
        return this.generateBigIdeaSuccessResponse(userInput, context, projectData);

      case 'ESSENTIAL_QUESTION':
        return this.generateEssentialQuestionSuccessResponse(userInput, context, projectData);

      case 'LEARNING_JOURNEY':
        return this.generateLearningJourneySuccessResponse(userInput, context, projectData);

      default:
        return {
          content: 'Great! Let\'s continue building your project.',
          suggestions: ['What\'s next?'],
          needsMoreInfo: false
        };
    }
  }

  /**
   * Context stage success response
   */
  private generateContextSuccessResponse(userInput: string, context: ProjectContext): AIResponse {
    const hasSubject = context.subject || userInput.toLowerCase().includes('science') ||
                      userInput.toLowerCase().includes('math') || userInput.toLowerCase().includes('english');
    const hasGrade = context.gradeLevel || userInput.includes('grade') || userInput.includes('year');

    if (hasSubject && hasGrade) {
      return {
        content: `Perfect! I understand you're designing a project for ${context.gradeLevel || 'your students'} in ${context.subject || 'your subject area'}. Now let's explore the big idea that will drive this project.`,
        suggestions: [
          'Environmental challenges in our community',
          'Innovation and problem-solving',
          'Historical connections to current events'
        ],
        needsMoreInfo: false
      };
    }

    if (hasSubject) {
      return {
        content: `Great! ${context.subject || 'That subject area'} offers rich opportunities for project-based learning. What grade level will you be working with?`,
        suggestions: [
          'Elementary students (K-5)',
          'Middle school (6-8)',
          'High school (9-12)'
        ],
        needsMoreInfo: true
      };
    }

    if (hasGrade) {
      return {
        content: `Excellent! ${context.gradeLevel || 'Those students'} are at a great age for project-based learning. What subject area will this project focus on?`,
        suggestions: [
          'Science and STEM',
          'Language Arts and Literature',
          'Social Studies and History',
          'Math and Problem Solving'
        ],
        needsMoreInfo: true
      };
    }

    return {
      content: 'Thanks for that context! To help design the perfect project, I\'d love to know more about your subject area and grade level.',
      suggestions: [
        'Tell me about the subject',
        'Share the grade level',
        'Describe your students'
      ],
      needsMoreInfo: true
    };
  }

  /**
   * Big Idea stage success response
   */
  private generateBigIdeaSuccessResponse(
    userInput: string,
    context: ProjectContext,
    projectData: any
  ): AIResponse {
    const bigIdea = userInput.trim();
    const subject = context.subject || '';
    const gradeLevel = context.gradeLevel || '';

    // Generate contextual enthusiasm and connections
    const connections = this.generateSubjectConnections(bigIdea, subject);
    const gradeAppropriate = this.generateGradeAppropriateness(bigIdea, gradeLevel);

    return {
      content: `Excellent choice! "${bigIdea}" is a compelling theme that will engage your students. ${connections} ${gradeAppropriate}\n\nNow, let's craft an essential question that will drive their investigation and inquiry throughout this project.`,
      suggestions: [
        `How can students make a difference in ${bigIdea.toLowerCase()}?`,
        `What would happen if we approached ${bigIdea.toLowerCase()} differently?`,
        `Why should students care about ${bigIdea.toLowerCase()}?`
      ],
      needsMoreInfo: false,
      stageAdvice: 'Essential questions should be open-ended, thought-provoking, and connect to real-world applications.'
    };
  }

  /**
   * Essential Question stage success response
   */
  private generateEssentialQuestionSuccessResponse(
    userInput: string,
    context: ProjectContext,
    projectData: any
  ): AIResponse {
    const question = userInput.trim();
    const bigIdea = projectData.bigIdea || '';

    return {
      content: `Perfect! "${question}" is an excellent essential question that will guide student inquiry around ${bigIdea}. It's open-ended, thought-provoking, and will lead to meaningful investigation.\n\nNow let's design the learning journey - how will students progress through this project from start to finish?`,
      suggestions: [
        'Research → Design → Test → Share approach',
        'Individual exploration → Team collaboration → Community presentation',
        'Problem identification → Solution development → Impact assessment'
      ],
      needsMoreInfo: false,
      stageAdvice: 'Consider how students will build knowledge, create solutions, and demonstrate their learning.'
    };
  }

  /**
   * Learning Journey stage success response
   */
  private generateLearningJourneySuccessResponse(
    userInput: string,
    context: ProjectContext,
    projectData: any
  ): AIResponse {
    const journey = userInput.trim();
    const bigIdea = projectData.bigIdea || '';
    const question = projectData.essentialQuestion || '';

    return {
      content: `Outstanding! You've designed a comprehensive learning journey that will guide students through meaningful exploration of "${bigIdea}" while investigating "${question}".\n\nYour project framework is complete! Students will have a clear path from initial curiosity to deep understanding and real-world application.`,
      suggestions: [
        'Review the complete project plan',
        'Add specific assessment rubrics',
        'Plan resource requirements',
        'Create project timeline'
      ],
      needsMoreInfo: false,
      stageAdvice: 'Your project is ready to implement. Consider creating detailed lesson plans and assessment tools.'
    };
  }

  /**
   * Generate subject-specific connections
   */
  private generateSubjectConnections(bigIdea: string, subject: string): string {
    const lowerIdea = bigIdea.toLowerCase();
    const lowerSubject = subject.toLowerCase();

    if (lowerSubject.includes('science')) {
      if (lowerIdea.includes('environment') || lowerIdea.includes('climate')) {
        return 'This connects beautifully with scientific inquiry, data analysis, and environmental stewardship.';
      }
      return 'This provides rich opportunities for hypothesis testing, experimentation, and scientific reasoning.';
    }

    if (lowerSubject.includes('math')) {
      return 'This offers excellent opportunities for data collection, statistical analysis, and mathematical modeling.';
    }

    if (lowerSubject.includes('english') || lowerSubject.includes('language')) {
      return 'This theme provides rich opportunities for research, storytelling, and persuasive communication.';
    }

    if (lowerSubject.includes('social') || lowerSubject.includes('history')) {
      return 'This connects to important historical patterns, cultural perspectives, and civic engagement.';
    }

    return 'This theme offers excellent opportunities for interdisciplinary learning and real-world connections.';
  }

  /**
   * Generate grade-appropriate comments
   */
  private generateGradeAppropriateness(bigIdea: string, gradeLevel: string): string {
    const lowerGrade = gradeLevel.toLowerCase();

    if (lowerGrade.includes('elementary') || lowerGrade.includes('k-') || lowerGrade.includes('primary')) {
      return 'This is perfect for young learners who are naturally curious and love hands-on exploration.';
    }

    if (lowerGrade.includes('middle') || lowerGrade.includes('6') || lowerGrade.includes('7') || lowerGrade.includes('8')) {
      return 'This is ideal for middle schoolers who are developing critical thinking skills and social awareness.';
    }

    if (lowerGrade.includes('high') || lowerGrade.includes('9') || lowerGrade.includes('10') || lowerGrade.includes('11') || lowerGrade.includes('12')) {
      return 'This is excellent for high school students who can tackle complex issues and create meaningful solutions.';
    }

    return 'This theme is well-suited for your students\' developmental stage and interests.';
  }

  /**
   * Get contextual guidance for each stage
   */
  private getStageGuidance(stage: string, context: ProjectContext): string {
    switch (stage) {
      case 'CONTEXT':
        return 'Let me know about your subject area, grade level, or project duration. For example: "7th grade science project" or "Elementary math exploration, 2 weeks."';

      case 'BIG_IDEA':
        return `Think about a compelling theme or real-world problem that would engage ${context.gradeLevel || 'your students'} in ${context.subject || 'your subject area'}. What big concept should they explore?`;

      case 'ESSENTIAL_QUESTION':
        return 'Craft a question that starts with "How," "What," or "Why" - something that will drive student inquiry and doesn\'t have a simple yes/no answer.';

      case 'LEARNING_JOURNEY':
        return 'Describe the key phases students will go through. Consider: How will they build knowledge? What will they create? How will they share their learning?';

      default:
        return 'Let me help guide you through this step.';
    }
  }

  /**
   * Get stage-specific advice
   */
  private getStageAdvice(stage: string): string {
    switch (stage) {
      case 'CONTEXT':
        return 'Context helps me tailor suggestions to your specific situation and student needs.';

      case 'BIG_IDEA':
        return 'Great big ideas connect to real-world issues and spark genuine student curiosity.';

      case 'ESSENTIAL_QUESTION':
        return 'Essential questions should be open-ended, thought-provoking, and lead to meaningful investigation.';

      case 'LEARNING_JOURNEY':
        return 'Effective learning journeys balance structure with student choice and authentic assessment.';

      default:
        return 'Follow the prompts to create an engaging, well-structured project.';
    }
  }

  /**
   * Get default suggestions for each stage
   */
  private getDefaultSuggestions(stage: string): string[] {
    switch (stage) {
      case 'CONTEXT':
        return [
          'Grade 6 science project, 3 weeks',
          'High school English, semester-long',
          'Elementary math exploration'
        ];

      case 'BIG_IDEA':
        return [
          'Environmental sustainability',
          'Community problem-solving',
          'Innovation and design thinking'
        ];

      case 'ESSENTIAL_QUESTION':
        return [
          'How can we make a positive impact?',
          'What would happen if we tried a different approach?',
          'Why should this matter to our community?'
        ];

      case 'LEARNING_JOURNEY':
        return [
          'Research → Design → Test → Share',
          'Explore → Collaborate → Create → Present',
          'Investigate → Solve → Reflect → Act'
        ];

      default:
        return ['Tell me more', 'Can you expand on that?', 'What else should I know?'];
    }
  }
}

// Example usage and integration helper
export const createContextualAI = (config?: AIServiceConfig): ContextualAIService => {
  return new ContextualAIService(config);
};
