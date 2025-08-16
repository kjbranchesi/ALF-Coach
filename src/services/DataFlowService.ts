/**
 * DataFlowService - Ensures seamless data flow between wizard and chat
 * Fixes the disconnect where wizard data doesn't reach chat interface
 */

export interface WizardData {
  motivation?: string;
  subject?: string;
  ageGroup?: string;
  duration?: string;
  alfFocus?: string;
  location?: string;
  materials?: string;
  teacherResources?: string;
  scope?: string;
}

export interface BlueprintData {
  id?: string;
  userId: string;
  wizard: {
    vision: string;
    subject: string;
    students: string;
    duration: string;
    alfFocus: string;
    location: string;
    materials: string;
    teacherResources: string;
    scope: string;
    topic: string;
    timeline: string;
    gradeLevel: string;
  };
  ideation: {
    bigIdea: string;
    essentialQuestion: string;
    challenge: string;
  };
  journey: {
    phases: any[];
    activities: any[];
    resources: any[];
  };
  deliverables: {
    milestones: any[];
    rubric: { criteria: any[] };
    impact: { audience: string; method: string };
  };
  createdAt: Date | string;
  updatedAt: Date | string;
  currentStep: string;
  schemaVersion: string;
}

export class DataFlowService {
  /**
   * Transform wizard data into blueprint format
   * CRITICAL: This ensures wizard data flows properly to chat
   */
  static transformWizardToBlueprint(wizardData: WizardData, userId: string = 'anonymous'): BlueprintData {
    return {
      userId,
      wizard: {
        vision: wizardData.motivation || '',
        subject: wizardData.subject || '',
        students: wizardData.ageGroup || '', // CRITICAL: Map ageGroup to students
        duration: wizardData.duration || '4 weeks',
        alfFocus: wizardData.alfFocus || '',
        location: wizardData.location || '',
        materials: wizardData.materials || '',
        teacherResources: wizardData.teacherResources || '',
        scope: wizardData.scope || 'unit',
        // Legacy fields for backward compatibility
        topic: wizardData.subject || '',
        timeline: wizardData.duration || '4 weeks',
        gradeLevel: wizardData.ageGroup || 'middle school'
      },
      ideation: {
        bigIdea: '',
        essentialQuestion: '',
        challenge: ''
      },
      journey: {
        phases: [],
        activities: [],
        resources: []
      },
      deliverables: {
        milestones: [],
        rubric: { criteria: [] },
        impact: { audience: '', method: '' }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      currentStep: 'IDEATION_BIG_IDEA', // Start at ideation after wizard
      schemaVersion: '1.0.0'
    };
  }

  /**
   * Validate that required wizard data is present
   */
  static validateWizardData(wizardData: WizardData): { isValid: boolean; missingFields: string[] } {
    const requiredFields = ['subject', 'ageGroup'];
    const missingFields = requiredFields.filter(field => !wizardData[field as keyof WizardData]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Generate contextual prompt prefix for chat interface
   * CRITICAL: This ensures chat knows about wizard context
   */
  static generateContextualPrompt(blueprintData: BlueprintData): string {
    const wizard = blueprintData.wizard;
    
    if (!wizard.subject) {
      return '';
    }

    let context = `Context: The educator teaches ${wizard.subject}`;
    
    if (wizard.students) {
      context += ` to ${wizard.students} students`;
    }
    
    if (wizard.duration) {
      context += ` over ${wizard.duration}`;
    }
    
    if (wizard.location) {
      context += ` in a ${wizard.location} setting`;
    }
    
    if (wizard.alfFocus) {
      context += `. Their ALF focus is: ${wizard.alfFocus}`;
    }
    
    if (wizard.vision) {
      context += `. Their vision: ${wizard.vision}`;
    }
    
    context += '.\n\n';
    
    return context;
  }

  /**
   * Check if blueprint has wizard context
   */
  static hasWizardContext(blueprintData: any): boolean {
    return !!(blueprintData?.wizard?.subject || blueprintData?.wizard?.topic);
  }

  /**
   * Merge wizard data into existing blueprint
   */
  static mergeWizardData(existingBlueprint: BlueprintData, wizardData: WizardData): BlueprintData {
    return {
      ...existingBlueprint,
      wizard: {
        ...existingBlueprint.wizard,
        vision: wizardData.motivation || existingBlueprint.wizard.vision,
        subject: wizardData.subject || existingBlueprint.wizard.subject,
        students: wizardData.ageGroup || existingBlueprint.wizard.students,
        duration: wizardData.duration || existingBlueprint.wizard.duration,
        alfFocus: wizardData.alfFocus || existingBlueprint.wizard.alfFocus,
        location: wizardData.location || existingBlueprint.wizard.location,
        materials: wizardData.materials || existingBlueprint.wizard.materials,
        teacherResources: wizardData.teacherResources || existingBlueprint.wizard.teacherResources,
        scope: wizardData.scope || existingBlueprint.wizard.scope,
        // Update legacy fields
        topic: wizardData.subject || existingBlueprint.wizard.topic,
        timeline: wizardData.duration || existingBlueprint.wizard.timeline,
        gradeLevel: wizardData.ageGroup || existingBlueprint.wizard.gradeLevel
      },
      updatedAt: new Date()
    };
  }

  /**
   * Extract user-friendly summary of wizard data
   */
  static getWizardSummary(blueprintData: BlueprintData): string {
    const wizard = blueprintData.wizard;
    
    if (!wizard.subject) {
      return 'No project details available';
    }

    const parts = [];
    
    if (wizard.subject) {
      parts.push(`${wizard.subject} project`);
    }
    
    if (wizard.students) {
      parts.push(`for ${wizard.students} students`);
    }
    
    if (wizard.duration) {
      parts.push(`over ${wizard.duration}`);
    }

    return parts.join(' ');
  }
}

export default DataFlowService;