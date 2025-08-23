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
    // Parse the project topic more intelligently
    const topics = data.projectTopic?.split(',').map(t => t.trim()).filter(t => t);
    const mainTopic = topics?.[0] || data.projectTopic || 'your project';
    const hasMultipleTopics = topics && topics.length > 1;
    
    // Parse grade level more naturally
    const gradeLevel = data.gradeLevel?.toLowerCase().replace('-', ' ') || 'your students';
    const isHigherEd = gradeLevel.includes('higher') || gradeLevel.includes('university') || gradeLevel.includes('college');
    const studentDescriptor = isHigherEd ? 'students' : `${gradeLevel} students`;
    
    // Parse subjects more naturally - avoid listing all if STEAM
    const subjects = data.subjects || [];
    const isSteam = subjects.length >= 4 && 
                    subjects.some(s => s.toLowerCase().includes('science')) &&
                    subjects.some(s => s.toLowerCase().includes('tech')) &&
                    subjects.some(s => s.toLowerCase().includes('math'));
    
    // Parse learning goals more intelligently
    const learningGoals = data.learningGoals?.split(',').map(g => g.trim().toLowerCase()).filter(g => g);
    const hasCollaboration = learningGoals?.some(g => g.includes('collab'));
    const hasCommunication = learningGoals?.some(g => g.includes('commun'));
    
    // Build natural message
    const parts: string[] = [];
    
    // Natural opening based on topic
    if (hasMultipleTopics) {
      parts.push(`I see you're interested in connecting ${topics.join(' and ')} - that's a rich foundation for project-based learning.`);
    } else if (mainTopic.toLowerCase().includes('sustain')) {
      parts.push(`Sustainability projects are perfect for authentic, real-world learning. ${mainTopic} offers students a chance to make genuine impact.`);
    } else {
      parts.push(`${mainTopic} is a compelling topic that can drive deep student engagement.`);
    }
    
    // Add context about students and scope
    if (data.duration) {
      const durationInfo = DURATION_INFO[data.duration as keyof typeof DURATION_INFO];
      const timeframe = durationInfo?.description || data.duration;
      
      if (isSteam) {
        parts.push(`\nWith a ${timeframe} timeframe and a STEAM approach, your ${studentDescriptor} can explore this from multiple angles.`);
      } else if (subjects.length > 1) {
        parts.push(`\nOver ${timeframe}, your ${studentDescriptor} can explore interdisciplinary connections.`);
      } else {
        parts.push(`\nA ${timeframe} project gives your ${studentDescriptor} time to dive deep.`);
      }
    }
    
    // Natural transition to goals if they're substantive
    if (hasCollaboration && hasCommunication) {
      parts.push(`\nFocusing on collaboration and communication skills will prepare students for real-world challenges.`);
    } else if (learningGoals && learningGoals.length > 0 && learningGoals[0].length > 3) {
      parts.push(`\nYour focus on ${learningGoals.join(' and ')} will guide our design process.`);
    }
    
    // Experience-appropriate transition to Big Idea
    const transition = {
      [PBLExperience.NEW]: `\nLet's start with the Big Idea - this is the core concept that will anchor your entire project. Think about what fundamental understanding you want students to walk away with. What's the "why" behind studying ${mainTopic}?`,
      [PBLExperience.SOME]: `\nLet's define your Big Idea - the conceptual understanding at the heart of this project. What enduring concept about ${mainTopic} do you want students to grasp?`,
      [PBLExperience.EXPERIENCED]: `\nWhat's the Big Idea driving this project? What conceptual understanding about ${mainTopic} will transfer beyond this unit?`
    }[data.pblExperience || PBLExperience.SOME];
    
    parts.push(transition);
    
    return parts.join('');
  }

  /**
   * Generate system prompt for AI with all context
   */
  private static generateSystemPrompt(data: Partial<WizardData>): string {
    const parts: string[] = [
      '=== PROJECT CONTEXT ===',
      `Entry Approach: ${this.getEntryPointDescription(data.entryPoint)}`,
      `Project Topic: ${data.projectTopic}`,
      `Learning Goals: ${data.learningGoals}`,
    ];
    
    if (data.learningPriorities && data.learningPriorities.length > 0) {
      parts.push(`Learning Priorities: ${data.learningPriorities.join(', ')}`);
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
      data.projectTopic &&
      data.learningGoals &&
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
    
    if (!data.projectTopic) missing.push('Project topic');
    if (!data.learningGoals) missing.push('Learning goals');
    if (!data.entryPoint) missing.push('Entry point');
    if (!data.subjects || data.subjects.length === 0) missing.push('Subject area(s)');
    if (!data.gradeLevel) missing.push('Grade level');
    if (!data.duration) missing.push('Project duration');
    if (!data.pblExperience) missing.push('PBL experience level');
    
    return missing;
  }
}