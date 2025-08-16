/**
 * UserFlowOrchestrator - Ensures all 7 user personas can complete their flows
 * CRITICAL: Handles different user needs and provides appropriate guidance
 */

import { stateManager, type AppState } from './StateManager';
import { EnhancedChatService } from './EnhancedChatService';

export interface UserPersona {
  id: string;
  name: string;
  characteristics: string[];
  needs: string[];
  painPoints: string[];
  successMetrics: string[];
}

export interface FlowResult {
  success: boolean;
  nextStep: string;
  message: string;
  suggestions: any[];
  guidance?: string;
  error?: string;
}

export class UserFlowOrchestrator {
  // The 7 user personas identified in the analysis
  private static readonly USER_PERSONAS: UserPersona[] = [
    {
      id: 'sarah-novice',
      name: 'Sarah (Novice)',
      characteristics: ['New to PBL', 'Overwhelmed by complexity', 'Needs guidance'],
      needs: ['Clear steps', 'Examples', 'Confidence building'],
      painPoints: ['Too many options', 'Technical jargon', 'Fear of failure'],
      successMetrics: ['Completes basic project', 'Gains confidence', 'Understands process']
    },
    {
      id: 'jennifer-time-pressed',
      name: 'Jennifer (Time-pressed)',
      characteristics: ['Busy schedule', 'Wants efficiency', 'Practical focus'],
      needs: ['Quick wins', 'Templates', 'Save/resume capability'],
      painPoints: ['Data not transferring', 'Having to re-enter info', 'Slow AI responses'],
      successMetrics: ['Completes in minimal time', 'Can save and resume', 'Gets usable output']
    },
    {
      id: 'aisha-innovator',
      name: 'Aisha (Innovator)',
      characteristics: ['Experienced with tech', 'Wants advanced features', 'Pushes boundaries'],
      needs: ['Customization', 'Advanced options', 'Integration capabilities'],
      painPoints: ['System unreliability', 'Limited customization', 'Crashes'],
      successMetrics: ['Creates complex projects', 'Uses advanced features', 'System stays stable']
    },
    {
      id: 'david-struggling',
      name: 'David (Struggling)',
      characteristics: ['Lacks confidence', 'Needs support', 'Easily discouraged'],
      needs: ['Encouragement', 'Simple interface', 'Help at every step'],
      painPoints: ['Unclear errors', 'Feeling lost', 'System complexity'],
      successMetrics: ['Completes without giving up', 'Feels supported', 'Gains skills']
    },
    {
      id: 'marcus-collaborative',
      name: 'Marcus (Collaborative)',
      characteristics: ['Shares with colleagues', 'Values peer input', 'Team-oriented'],
      needs: ['Sharing features', 'Export capabilities', 'Collaboration tools'],
      painPoints: ['Saves dont work', 'Cant share easily', 'Lost work'],
      successMetrics: ['Can share work', 'Collaborates effectively', 'Work is preserved']
    },
    {
      id: 'linda-professional',
      name: 'Linda (Professional)',
      characteristics: ['High standards', 'Administrative duties', 'Quality focused'],
      needs: ['Professional output', 'Reliability', 'Documentation'],
      painPoints: ['System looks broken', 'Unprofessional output', 'Inconsistent results'],
      successMetrics: ['Professional quality output', 'Reliable operation', 'Meets standards']
    },
    {
      id: 'robert-veteran',
      name: 'Robert (Veteran)',
      characteristics: ['Experienced educator', 'Skeptical of new tech', 'Values proven methods'],
      needs: ['Familiar patterns', 'Proven pedagogical approach', 'Gradual adoption'],
      painPoints: ['Too much tech', 'Unfamiliar interface', 'Complex workflows'],
      successMetrics: ['Sees educational value', 'Adopts gradually', 'Integrates with practice']
    }
  ];

  /**
   * Orchestrate user flow based on current state and user behavior
   */
  static async orchestrateFlow(userInput: string, action: string): Promise<FlowResult> {
    const currentState = stateManager.getState();
    
    try {
      // Detect user persona based on behavior patterns
      const detectedPersona = this.detectUserPersona(currentState, userInput, action);
      
      // Get appropriate guidance for this persona
      const personaGuidance = this.getPersonaGuidance(detectedPersona, currentState);
      
      // Process the interaction with persona-specific adaptations
      const chatContext = {
        step: currentState.currentStep,
        blueprint: currentState.currentBlueprint,
        userInput,
        action
      };

      const chatResponse = await EnhancedChatService.chat(chatContext);
      
      // Adapt response for persona
      const adaptedResponse = this.adaptResponseForPersona(chatResponse, detectedPersona, currentState);
      
      // Determine next step
      const nextStep = this.determineNextStep(currentState, userInput, action, detectedPersona);
      
      return {
        success: true,
        nextStep,
        message: adaptedResponse.message,
        suggestions: adaptedResponse.suggestions,
        guidance: personaGuidance
      };

    } catch (error) {
      console.error('Flow orchestration error:', error);
      
      // CRITICAL: Never let orchestration fail completely
      return this.createFailsafeResponse(currentState, error as Error);
    }
  }

  /**
   * Get persona-specific onboarding guidance
   */
  static getOnboardingGuidance(detectedPersona?: string): string {
    const persona = detectedPersona || 'sarah-novice'; // Default to novice
    
    const guidance: Record<string, string> = {
      'sarah-novice': "Welcome! I'll guide you step-by-step through creating your first project. Don't worry - we'll take it slow and I'll explain everything.",
      'jennifer-time-pressed': "Let's get you set up quickly! I'll help you create a project efficiently. You can save and come back anytime.",
      'aisha-innovator': "Ready to create something amazing? I'll help you build a sophisticated project with all the advanced features you need.",
      'david-struggling': "You're in the right place! I'm here to support you every step of the way. We'll build your confidence as we go.",
      'marcus-collaborative': "Great choice! I'll help you create a project that's easy to share with your colleagues and perfect for collaboration.",
      'linda-professional': "I'll help you create a professional-quality project that meets the highest educational standards.",
      'robert-veteran': "I'll show you how this builds on proven educational practices. We'll start simple and add complexity gradually."
    };

    return guidance[persona] || guidance['sarah-novice'];
  }

  // Private helper methods

  private static detectUserPersona(state: AppState, userInput: string, action: string): string {
    // Analyze patterns to detect persona
    const input = userInput.toLowerCase();
    
    // Time-pressed indicators
    if (input.includes('quick') || input.includes('fast') || input.includes('save') || action === 'skip') {
      return 'jennifer-time-pressed';
    }
    
    // Struggling indicators
    if (input.includes('help') || input.includes('confused') || input.includes('don\'t understand')) {
      return 'david-struggling';
    }
    
    // Professional indicators
    if (input.includes('standard') || input.includes('quality') || input.includes('professional')) {
      return 'linda-professional';
    }
    
    // Collaborative indicators
    if (input.includes('share') || input.includes('colleague') || input.includes('team')) {
      return 'marcus-collaborative';
    }
    
    // Innovator indicators
    if (input.includes('advanced') || input.includes('custom') || input.includes('complex')) {
      return 'aisha-innovator';
    }
    
    // Veteran indicators
    if (input.includes('traditional') || input.includes('proven') || input.includes('experience')) {
      return 'robert-veteran';
    }
    
    // Default to novice
    return 'sarah-novice';
  }

  private static getPersonaGuidance(persona: string, state: AppState): string {
    const step = state.currentStep;
    
    const guidanceMap: Record<string, Record<string, string>> = {
      'sarah-novice': {
        'IDEATION_BIG_IDEA': "A Big Idea is like the main theme of your project - what you want students to explore. Think of it as a big concept that matters in the real world.",
        'IDEATION_EQ': "An Essential Question is a thought-provoking question that students will investigate throughout the project. It should make them think deeply.",
        'IDEATION_CHALLENGE': "The Challenge is the specific task students will work on - like creating something, solving a problem, or investigating an issue."
      },
      'jennifer-time-pressed': {
        'IDEATION_BIG_IDEA': "💾 Your work saves automatically. Enter your main concept or choose from suggestions to move quickly.",
        'IDEATION_EQ': "⚡ Pick a question that drives inquiry. Use suggestions if you're in a hurry - you can refine later.",
        'IDEATION_CHALLENGE': "🚀 Choose what students will create or solve. Templates available to speed things up."
      },
      'david-struggling': {
        'IDEATION_BIG_IDEA': "You're doing great! 👍 The Big Idea is just the main topic - like 'How technology affects our lives'. Don't overthink it.",
        'IDEATION_EQ': "Perfect! 🌟 Now we need a question that makes students think - like 'How should we use technology responsibly?'",
        'IDEATION_CHALLENGE': "Excellent progress! 🎯 The Challenge is what students actually do - like create a presentation or design something."
      }
    };

    return guidanceMap[persona]?.[step] || '';
  }

  private static adaptResponseForPersona(response: any, persona: string, state: AppState): any {
    const adaptations: Record<string, (r: any) => any> = {
      'sarah-novice': (r) => ({
        ...r,
        message: `${r.message}\n\n💡 Tip: Take your time and don't worry about perfection. You can always refine your ideas later!`
      }),
      'jennifer-time-pressed': (r) => ({
        ...r,
        message: r.message,
        suggestions: r.suggestions.slice(0, 3) // Show fewer options for speed
      }),
      'david-struggling': (r) => ({
        ...r,
        message: `✅ ${r.message}\n\n🌟 You're making great progress! Each step brings you closer to an amazing project.`
      }),
      'aisha-innovator': (r) => ({
        ...r,
        suggestions: [...r.suggestions, {
          id: 'advanced-options',
          text: 'Show advanced customization options',
          category: 'advanced'
        }]
      }),
      'linda-professional': (r) => ({
        ...r,
        message: r.message + '\n\n📊 This approach aligns with research-based best practices in project-based learning.'
      })
    };

    const adapter = adaptations[persona];
    return adapter ? adapter(response) : response;
  }

  private static determineNextStep(state: AppState, userInput: string, action: string, persona: string): string {
    const currentStep = state.currentStep;
    
    // Handle step progression based on current step and user action
    if (action === 'continue' || action === 'next') {
      return this.getNextStepInSequence(currentStep);
    }
    
    // For time-pressed users, allow skipping with minimal input
    if (persona === 'jennifer-time-pressed' && action === 'skip') {
      return this.getNextStepInSequence(currentStep);
    }
    
    // For struggling users, stay on current step until they're confident
    if (persona === 'david-struggling' && !userInput.trim()) {
      return currentStep; // Stay on current step
    }
    
    // Default progression
    return currentStep;
  }

  private static getNextStepInSequence(currentStep: string): string {
    const stepSequence = [
      'ONBOARDING',
      'IDEATION_BIG_IDEA',
      'IDEATION_EQ',
      'IDEATION_CHALLENGE',
      'JOURNEY_PHASES',
      'JOURNEY_ACTIVITIES',
      'JOURNEY_RESOURCES',
      'DELIVER_MILESTONES',
      'DELIVER_RUBRIC',
      'DELIVER_IMPACT',
      'COMPLETE'
    ];

    const currentIndex = stepSequence.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < stepSequence.length - 1) {
      return stepSequence[currentIndex + 1];
    }
    
    return currentStep;
  }

  private static createFailsafeResponse(state: AppState, error: Error): FlowResult {
    return {
      success: false,
      nextStep: state.currentStep,
      message: "I'm here to help you create an amazing project! Let's continue working together.",
      suggestions: [
        {
          id: 'continue',
          text: 'Continue with my project',
          category: 'action'
        },
        {
          id: 'help',
          text: 'I need help understanding this step',
          category: 'help'
        }
      ],
      error: 'System temporarily working in simplified mode'
    };
  }
}

export default UserFlowOrchestrator;