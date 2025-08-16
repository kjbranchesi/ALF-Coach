/**
 * EnhancedChatService - Robust chat service that never fails completely
 * CRITICAL: Ensures all 7 user personas can complete their flows
 */

import { GeminiService } from './GeminiService';
import { stateManager } from './StateManager';
import { connectionStatus } from './ConnectionStatusService';
import { DataFlowService } from './DataFlowService';

export interface ChatResponse {
  message: string;
  suggestions: any[];
  data: any;
  error?: string;
  fallback?: boolean;
}

export interface ChatContext {
  step: string;
  blueprint: any;
  userInput: string;
  action: string;
}

export class EnhancedChatService {
  private static geminiService = new GeminiService();
  private static fallbackResponses = new Map<string, string>();
  private static lastSuccessfulResponse: Date | null = null;

  static {
    // Initialize fallback responses for each step
    this.initializeFallbacks();
  }

  /**
   * Main chat interaction method - NEVER fails completely
   */
  static async chat(context: ChatContext): Promise<ChatResponse> {
    const { step, blueprint, userInput, action } = context;

    try {
      // Check if we should attempt AI call
      if (this.shouldUseAI()) {
        const aiResponse = await this.callAI(context);
        if (aiResponse.success) {
          this.lastSuccessfulResponse = new Date();
          return {
            message: aiResponse.message,
            suggestions: aiResponse.suggestions || [],
            data: aiResponse.data || {},
            fallback: false
          };
        }
      }

      // AI failed or unavailable - use intelligent fallback
      return this.generateIntelligentFallback(context);

    } catch (error) {
      console.error('Chat service error:', error);
      return this.generateIntelligentFallback(context, error as Error);
    }
  }

  /**
   * Process user input and update blueprint
   */
  static processUserInput(step: string, userInput: string, currentData: any): any {
    // CRITICAL: Always process user input, even without AI
    const updates = { ...currentData };

    switch (step) {
      case 'IDEATION_BIG_IDEA':
        if (userInput.trim()) {
          updates.ideation = {
            ...updates.ideation,
            bigIdea: userInput.trim()
          };
        }
        break;

      case 'IDEATION_EQ':
        if (userInput.trim()) {
          updates.ideation = {
            ...updates.ideation,
            essentialQuestion: userInput.trim()
          };
        }
        break;

      case 'IDEATION_CHALLENGE':
        if (userInput.trim()) {
          updates.ideation = {
            ...updates.ideation,
            challenge: userInput.trim()
          };
        }
        break;

      default:
        // For other steps, store in a general data field
        if (userInput.trim()) {
          updates.userResponses = {
            ...updates.userResponses,
            [step]: userInput.trim()
          };
        }
        break;
    }

    return updates;
  }

  /**
   * Generate contextual suggestions without AI
   */
  static generateOfflineSuggestions(step: string, blueprint: any): any[] {
    const wizardContext = blueprint?.wizard || {};
    const subject = wizardContext.subject || 'your subject';
    const students = wizardContext.students || 'students';

    switch (step) {
      case 'IDEATION_BIG_IDEA':
        return [
          {
            id: 'big-idea-1',
            text: `How ${subject} connects to real-world challenges`,
            category: 'idea'
          },
          {
            id: 'big-idea-2',
            text: `The role of innovation in ${subject}`,
            category: 'idea'
          },
          {
            id: 'big-idea-3',
            text: `${subject} and community impact`,
            category: 'idea'
          },
          {
            id: 'big-idea-4',
            text: `Future careers in ${subject}`,
            category: 'idea'
          }
        ];

      case 'IDEATION_EQ':
        return [
          {
            id: 'eq-1',
            text: `How can ${students} use ${subject} to solve problems?`,
            category: 'idea'
          },
          {
            id: 'eq-2',
            text: `What role does ${subject} play in our daily lives?`,
            category: 'idea'
          },
          {
            id: 'eq-3',
            text: `How do we make responsible decisions about ${subject}?`,
            category: 'idea'
          },
          {
            id: 'eq-4',
            text: `What would happen if ${subject} didn't exist?`,
            category: 'idea'
          }
        ];

      case 'IDEATION_CHALLENGE':
        return [
          {
            id: 'challenge-1',
            text: `Create a solution to a local community problem`,
            category: 'idea'
          },
          {
            id: 'challenge-2',
            text: `Design something that helps ${students} learn better`,
            category: 'idea'
          },
          {
            id: 'challenge-3',
            text: `Build a presentation for younger students`,
            category: 'idea'
          },
          {
            id: 'challenge-4',
            text: `Develop a prototype or model`,
            category: 'idea'
          }
        ];

      default:
        return [
          {
            id: 'general-1',
            text: 'Continue to the next step',
            category: 'action'
          }
        ];
    }
  }

  // Private helper methods

  private static shouldUseAI(): boolean {
    const status = connectionStatus.getStatus();
    
    // Don't use AI if offline
    if (!status.online) return false;
    
    // Don't use AI if Gemini is unavailable
    if (status.geminiApi === 'unavailable') return false;
    
    // Don't use AI if recently rate limited
    if (status.geminiApi === 'rate-limited') return false;
    
    return true;
  }

  private static async callAI(context: ChatContext): Promise<{ success: boolean; message?: string; suggestions?: any[]; data?: any }> {
    try {
      const response = await this.geminiService.generate({
        step: context.step,
        context: context.blueprint,
        action: context.action,
        userInput: context.userInput
      });

      return {
        success: true,
        message: response.message,
        suggestions: response.suggestions,
        data: response.data
      };
    } catch (error) {
      console.warn('AI call failed:', error);
      return { success: false };
    }
  }

  private static generateIntelligentFallback(context: ChatContext, error?: Error): ChatResponse {
    const { step, blueprint, userInput, action } = context;
    const stepName = this.getStepDisplayName(step);
    
    // Get contextual fallback message
    let message = this.fallbackResponses.get(step) || 
                  `Let's work on your ${stepName}. What ideas do you have?`;

    // Add context from wizard data if available
    if (blueprint?.wizard?.subject) {
      const subject = blueprint.wizard.subject;
      message = `Let's work on your ${stepName} for your ${subject} project. ${message}`;
    }

    // Generate offline suggestions
    const suggestions = this.generateOfflineSuggestions(step, blueprint);

    // Process any user input even without AI
    let data = {};
    if (userInput && userInput.trim()) {
      data = this.processUserInput(step, userInput, blueprint);
      message = `Got it! You said: "${userInput}". ${message}`;
    }

    return {
      message,
      suggestions,
      data,
      fallback: true,
      error: error ? 'AI temporarily unavailable - working offline' : undefined
    };
  }

  private static getStepDisplayName(step: string): string {
    const stepNames: Record<string, string> = {
      'IDEATION_BIG_IDEA': 'Big Idea',
      'IDEATION_EQ': 'Essential Question',
      'IDEATION_CHALLENGE': 'Challenge',
      'JOURNEY_PHASES': 'Learning Phases',
      'JOURNEY_ACTIVITIES': 'Activities',
      'JOURNEY_RESOURCES': 'Resources',
      'DELIVER_MILESTONES': 'Milestones',
      'DELIVER_RUBRIC': 'Assessment',
      'DELIVER_IMPACT': 'Impact'
    };

    return stepNames[step] || 'project step';
  }

  private static initializeFallbacks(): void {
    this.fallbackResponses.set('IDEATION_BIG_IDEA', 
      "What's the main concept or theme you want students to explore? Think about big ideas that matter in the real world."
    );
    
    this.fallbackResponses.set('IDEATION_EQ', 
      "What's a thought-provoking question that will drive student inquiry throughout this project?"
    );
    
    this.fallbackResponses.set('IDEATION_CHALLENGE', 
      "What specific task or problem will students work on? Make it authentic and meaningful."
    );
    
    this.fallbackResponses.set('JOURNEY_PHASES', 
      "How do you want to organize the learning experience? What are the main phases or stages?"
    );
    
    this.fallbackResponses.set('JOURNEY_ACTIVITIES', 
      "What activities will help students build the skills they need for success?"
    );
    
    this.fallbackResponses.set('JOURNEY_RESOURCES', 
      "What materials, tools, or resources will support student learning?"
    );
    
    this.fallbackResponses.set('DELIVER_MILESTONES', 
      "What are the key checkpoints or deliverables throughout the project?"
    );
    
    this.fallbackResponses.set('DELIVER_RUBRIC', 
      "How will you assess student learning? What criteria matter most?"
    );
    
    this.fallbackResponses.set('DELIVER_IMPACT', 
      "How will students share their work and make an impact beyond the classroom?"
    );
  }
}

export default EnhancedChatService;