/**
 * WizardHandoffService - Creates meaningful handoff from wizard to chat
 * Ensures the AI has clear context and starting point
 */

import { WizardData, EntryPoint, PBLExperience, DURATION_INFO } from '../features/wizard/wizardSchema';

export interface HandoffContext {
  initialMessage: string;
  systemPrompt: string;
  suggestedNextSteps: string[];
  contextSummary: string;
}

export class WizardHandoffService {
  /**
   * Generate handoff context from wizard data
   */
  static generateHandoff(wizardData: Partial<WizardData>): HandoffContext {
    // Build context summary for AI
    const contextSummary = this.buildContextSummary(wizardData);
    
    // Generate appropriate initial message based on entry point
    const initialMessage = this.generateInitialMessage(wizardData);
    
    // Create system prompt with all context
    const systemPrompt = this.generateSystemPrompt(wizardData);
    
    // Suggest logical next steps
    const suggestedNextSteps = this.generateNextSteps(wizardData);
    
    return {
      initialMessage,
      systemPrompt,
      suggestedNextSteps,
      contextSummary
    };
  }

  /**
   * Build human-readable context summary
   */
  private static buildContextSummary(data: Partial<WizardData>): string {
    const parts: string[] = [];
    
    // Grade and duration
    if (data.gradeLevel && data.duration) {
      const durationLabel = DURATION_INFO[data.duration as keyof typeof DURATION_INFO]?.description || data.duration;
      parts.push(`${data.gradeLevel} grade level, ${durationLabel} project`);
    }
    
    // Subjects
    if (data.subjects && data.subjects.length > 0) {
      if (data.subjects.length === 1) {
        parts.push(`Focus: ${data.subjects[0]}`);
      } else {
        parts.push(`Interdisciplinary: ${data.subjects.join(', ')}`);
      }
    }
    
    // Experience level
    if (data.pblExperience) {
      const expLabel = {
        [PBLExperience.NEW]: 'New to PBL',
        [PBLExperience.SOME]: 'Some PBL experience',
        [PBLExperience.EXPERIENCED]: 'Experienced with PBL'
      }[data.pblExperience];
      parts.push(expLabel);
    }
    
    return parts.join(' • ');
  }

  /**
   * Generate the AI's first message based on entry point and context
   */
  private static generateInitialMessage(data: Partial<WizardData>): string {
    const name = "teacher"; // Could be personalized if we have user name
    
    // Entry point specific greetings
    const entryGreeting = {
      [EntryPoint.LEARNING_GOAL]: `I see you're starting with a clear learning vision: "${data.vision}". That's a great foundation!`,
      [EntryPoint.MATERIALS_FIRST]: `Starting with materials you already have is smart! Let's explore how to build a project around your resources.`,
      [EntryPoint.EXPLORE]: `Let's explore some inspiring project possibilities together!`
    }[data.entryPoint || EntryPoint.LEARNING_GOAL];
    
    // Build the message parts
    const parts: string[] = [
      `Hello! I'm excited to help you design an engaging project-based learning experience.`,
      '',
      entryGreeting
    ];
    
    // Add context acknowledgment
    if (data.gradeLevel && data.duration) {
      const durationInfo = DURATION_INFO[data.duration as keyof typeof DURATION_INFO];
      parts.push('');
      parts.push(`For your ${data.gradeLevel} students over ${durationInfo?.description || data.duration}, we'll create something meaningful and achievable.`);
    }
    
    // Add subject connection
    if (data.subjects && data.subjects.length > 0) {
      if (data.subjects.length === 1) {
        parts.push(`Focusing on ${data.subjects[0]} gives us great opportunities for deep learning.`);
      } else {
        parts.push(`Combining ${data.subjects.join(' and ')} opens up exciting interdisciplinary connections!`);
      }
    }
    
    // Add driving question if provided
    if (data.drivingQuestion) {
      parts.push('');
      parts.push(`Your driving question "${data.drivingQuestion}" will help guide our planning.`);
    }
    
    // Experience-based guidance offer
    const guidanceOffer = {
      [PBLExperience.NEW]: `Since you're new to PBL, I'll provide detailed guidance and explanations at each step. Don't worry - we'll build this together!`,
      [PBLExperience.SOME]: `With your PBL experience, I'll offer suggestions and best practices while respecting your expertise.`,
      [PBLExperience.EXPERIENCED]: `As an experienced PBL practitioner, I'll focus on optimization and advanced strategies.`
    }[data.pblExperience || PBLExperience.SOME];
    
    parts.push('');
    parts.push(guidanceOffer);
    
    // Call to action
    parts.push('');
    parts.push(`Let's start by developing your project's big idea. What real-world problem or challenge would you like your students to tackle?`);
    
    return parts.join('\n');
  }

  /**
   * Generate system prompt for AI with all context
   */
  private static generateSystemPrompt(data: Partial<WizardData>): string {
    const parts: string[] = [
      '=== PROJECT CONTEXT ===',
      `Entry Approach: ${this.getEntryPointDescription(data.entryPoint)}`,
      `Learning Vision: ${data.vision}`,
    ];
    
    if (data.drivingQuestion) {
      parts.push(`Driving Question: ${data.drivingQuestion}`);
    }
    
    parts.push(`Grade Level: ${data.gradeLevel}`);
    parts.push(`Duration: ${data.duration} (${DURATION_INFO[data.duration as keyof typeof DURATION_INFO]?.details || ''})`);
    
    if (data.subjects && data.subjects.length > 0) {
      parts.push(`Subject Areas: ${data.subjects.join(', ')}`);
      if (data.primarySubject) {
        parts.push(`Primary Focus: ${data.primarySubject}`);
      }
    }
    
    parts.push(`Teacher Experience: ${this.getExperienceDescription(data.pblExperience)}`);
    
    if (data.specialRequirements) {
      parts.push(`Special Requirements: ${data.specialRequirements}`);
    }
    
    if (data.specialConsiderations) {
      parts.push(`Special Considerations: ${data.specialConsiderations}`);
    }
    
    parts.push('');
    parts.push('=== GUIDANCE LEVEL ===');
    parts.push(this.getGuidanceInstructions(data.pblExperience));
    
    parts.push('');
    parts.push('=== CURRENT PHASE ===');
    parts.push('Phase: Project Ideation');
    parts.push('Goal: Develop the big idea and essential question');
    parts.push('Next: Create project framework and milestones');
    
    return parts.join('\n');
  }

  /**
   * Generate suggested next steps based on context
   */
  private static generateNextSteps(data: Partial<WizardData>): string[] {
    const steps: string[] = [];
    
    // Entry point specific steps
    if (data.entryPoint === EntryPoint.LEARNING_GOAL) {
      steps.push('Align project with learning standards');
      steps.push('Develop authentic real-world connections');
    } else if (data.entryPoint === EntryPoint.MATERIALS_FIRST) {
      steps.push('Inventory available materials and resources');
      steps.push('Identify learning goals that leverage these resources');
    } else {
      steps.push('Explore exemplar projects for inspiration');
      steps.push('Identify compelling problems or challenges');
    }
    
    // Common next steps
    steps.push('Refine the driving question');
    steps.push('Define project deliverables');
    steps.push('Create assessment criteria');
    steps.push('Plan project milestones');
    
    // Experience-based steps
    if (data.pblExperience === PBLExperience.NEW) {
      steps.push('Review PBL best practices');
      steps.push('Set up collaboration structures');
    } else if (data.pblExperience === PBLExperience.EXPERIENCED) {
      steps.push('Design advanced inquiry activities');
      steps.push('Plan for student voice and choice');
    }
    
    return steps;
  }

  /**
   * Get human-readable entry point description
   */
  private static getEntryPointDescription(entryPoint?: EntryPoint): string {
    const descriptions = {
      [EntryPoint.LEARNING_GOAL]: 'Starting with specific learning objectives',
      [EntryPoint.MATERIALS_FIRST]: 'Building around available materials',
      [EntryPoint.EXPLORE]: 'Exploring possibilities'
    };
    return descriptions[entryPoint || EntryPoint.LEARNING_GOAL];
  }

  /**
   * Get experience level description
   */
  private static getExperienceDescription(experience?: PBLExperience): string {
    const descriptions = {
      [PBLExperience.NEW]: 'New to PBL (needs maximum scaffolding)',
      [PBLExperience.SOME]: 'Some experience (moderate guidance)',
      [PBLExperience.EXPERIENCED]: 'Experienced (minimal scaffolding, focus on optimization)'
    };
    return descriptions[experience || PBLExperience.SOME];
  }

  /**
   * Get guidance instructions for AI based on experience
   */
  private static getGuidanceInstructions(experience?: PBLExperience): string {
    const instructions = {
      [PBLExperience.NEW]: `
- Provide detailed explanations for PBL concepts
- Offer step-by-step guidance
- Include examples and templates
- Check understanding frequently
- Suggest simpler alternatives when appropriate
- Explain the "why" behind each recommendation`,
      
      [PBLExperience.SOME]: `
- Balance guidance with teacher autonomy
- Offer suggestions rather than prescriptions
- Provide rationale for recommendations
- Share best practices and tips
- Build on existing knowledge`,
      
      [PBLExperience.EXPERIENCED]: `
- Focus on optimization and refinement
- Share advanced strategies
- Discuss edge cases and challenges
- Provide research-backed insights
- Respect expertise while offering fresh perspectives`
    };
    
    return instructions[experience || PBLExperience.SOME].trim();
  }

  /**
   * Validate that we have enough context to provide value
   */
  static hasMinimumViableContext(data: Partial<WizardData>): boolean {
    return !!(
      data.vision &&
      data.entryPoint &&
      data.subjects && data.subjects.length > 0 &&
      data.gradeLevel &&
      data.duration &&
      data.pblExperience
    );
  }

  /**
   * Get missing critical fields
   */
  static getMissingCriticalFields(data: Partial<WizardData>): string[] {
    const missing: string[] = [];
    
    if (!data.vision) missing.push('Project vision');
    if (!data.entryPoint) missing.push('Entry point');
    if (!data.subjects || data.subjects.length === 0) missing.push('Subject area(s)');
    if (!data.gradeLevel) missing.push('Grade level');
    if (!data.duration) missing.push('Project duration');
    if (!data.pblExperience) missing.push('PBL experience level');
    
    return missing;
  }
}