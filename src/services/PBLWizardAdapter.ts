/**
 * PBLWizardAdapter.ts
 * 
 * Adapter to integrate the new 9-step PBL flow with the existing wizard system.
 * Provides seamless transition and data migration between old and new flows.
 */

import { PBLProjectState, PBLFlowOrchestrator } from './PBLFlowOrchestrator';
import { WizardData } from '../features/wizard/wizardSchema';
import { logger } from '../utils/logger';

export interface WizardToPBLMigration {
  sourceData: Partial<WizardData>;
  targetState: Partial<PBLProjectState>;
  mappingQuality: number; // 0-100 indicating how complete the migration is
  missingFields: string[];
}

export class PBLWizardAdapter {
  /**
   * Migrate from old wizard data to new PBL state
   */
  static migrateFromWizard(wizardData: Partial<WizardData>): WizardToPBLMigration {
    const missingFields: string[] = [];
    
    // Initialize the PBL state with migrated data
    const pblState: Partial<PBLProjectState> = {
      currentStep: 'PROJECT_INTAKE',
      subStep: null,
      messageCountInStep: 0,
      totalProgress: 0,
      stepsCompleted: new Set(),
      stepValidation: new Map(),
      
      projectData: {
        // Step 1: Project Intake - Map from wizard data
        intake: {
          gradeLevel: wizardData.gradeLevel || '',
          subjects: wizardData.subjects || [],
          primarySubject: wizardData.primarySubject || wizardData.subjects?.[0] || '',
          classSize: 25, // Default, not in old wizard
          classProfile: {
            diverseLearners: false,
            englishLearners: false,
            giftedStudents: false,
            specialNeeds: []
          },
          schedule: {
            periodsPerDay: 0,
            minutesPerPeriod: 0,
            daysPerWeek: 5,
            projectDuration: this.mapDuration(wizardData.duration)
          },
          availableMaterials: this.extractMaterials(wizardData.materials),
          technologyAccess: [],
          spaceConstraints: []
        },
        
        // Step 2: Goals & Essential Question - Map from wizard
        goalsEQ: {
          learningGoals: wizardData.learningGoals ? [wizardData.learningGoals] : [],
          essentialQuestions: [],
          selectedEQ: '',
          drivingQuestion: '',
          successCriteria: []
        },
        
        // Step 3: Standards - Empty, needs to be filled
        standards: {
          framework: 'CCSS',
          selectedStandards: [],
          crossCurricular: [],
          skills21stCentury: []
        },
        
        // Steps 4-9: Initialize empty
        phases: {
          phases: [],
          milestones: []
        },
        artifacts: {
          artifacts: [],
          rubrics: []
        },
        rolesDiff: {
          studentRoles: [],
          differentiationStrategies: {
            forStruggling: [],
            forAdvanced: [],
            forELL: [],
            forSpecialNeeds: []
          },
          scaffolds: [],
          groupingStrategy: ''
        },
        outreach: {
          communityPartners: [],
          exhibitionPlan: {
            format: '',
            venue: '',
            audience: [],
            date: '',
            preparation: []
          },
          expertConnections: []
        },
        logistics: {
          calendar: [],
          permissions: [],
          assessmentPlan: {
            formative: [],
            summative: [],
            selfAssessment: [],
            peerAssessment: []
          },
          resourceList: []
        },
        review: {
          completenessCheck: new Map(),
          revisions: [],
          exportFormat: 'PDF',
          sharingSettings: {
            shareWithStudents: false,
            shareWithParents: false,
            shareWithAdmin: false,
            publicPortfolio: false
          }
        }
      },
      
      conversationContext: {
        tone: 'friendly',
        experienceLevel: this.mapExperience(wizardData.pblExperience),
        preferredPacing: 'thorough',
        lastInteraction: new Date(),
        sessionDuration: 0,
        questionsAsked: 0,
        clarificationsNeeded: 0
      },
      
      navigationHistory: [],
      partialSaves: new Map(),
      lastSaveTimestamp: new Date()
    };
    
    // Track what's missing
    if (!wizardData.gradeLevel) missingFields.push('gradeLevel');
    if (!wizardData.subjects || wizardData.subjects.length === 0) missingFields.push('subjects');
    if (!wizardData.projectTopic) missingFields.push('projectTopic');
    if (!wizardData.learningGoals) missingFields.push('learningGoals');
    
    // Calculate migration quality
    const totalFields = 10; // Key fields from wizard
    const filledFields = totalFields - missingFields.length;
    const mappingQuality = Math.round((filledFields / totalFields) * 100);
    
    // If we have substantial wizard data, mark first step as complete
    if (mappingQuality > 60) {
      pblState.stepsCompleted = new Set(['PROJECT_INTAKE']);
      pblState.currentStep = 'GOALS_EQ';
      pblState.totalProgress = 11; // 1 of 9 steps complete
    }
    
    logger.info('Migrated wizard data to PBL state', {
      mappingQuality,
      missingFields,
      hasBasicInfo: mappingQuality > 60
    });
    
    return {
      sourceData: wizardData,
      targetState: pblState,
      mappingQuality,
      missingFields
    };
  }
  
  /**
   * Convert PBL state back to wizard format for compatibility
   */
  static exportToWizardFormat(pblState: PBLProjectState): Partial<WizardData> {
    const { projectData } = pblState;
    
    return {
      // Map back to wizard fields
      gradeLevel: projectData.intake.gradeLevel,
      subjects: projectData.intake.subjects,
      primarySubject: projectData.intake.primarySubject,
      duration: this.mapDurationReverse(projectData.intake.schedule.projectDuration),
      projectTopic: projectData.goalsEQ.drivingQuestion || '',
      learningGoals: projectData.goalsEQ.learningGoals.join('\n'),
      materials: projectData.intake.availableMaterials.join(', '),
      
      // Additional context
      specialRequirements: this.compileSpecialRequirements(projectData),
      specialConsiderations: this.compileSpecialConsiderations(projectData),
      
      // Metadata
      metadata: {
        createdAt: new Date(),
        lastModified: new Date(),
        version: '2.0',
        wizardCompleted: pblState.totalProgress === 100,
        skippedFields: []
      },
      
      conversationState: {
        phase: 'PROJECT_DESIGN' as any,
        contextCompleteness: {
          core: Math.min(pblState.totalProgress * 2, 100),
          context: pblState.totalProgress,
          progressive: Math.min(pblState.totalProgress * 1.5, 100)
        },
        gatheredContext: {
          pblProjectData: projectData
        },
        lastContextUpdate: new Date()
      }
    };
  }
  
  /**
   * Check if user should use new PBL flow vs old wizard
   */
  static shouldUsePBLFlow(context: {
    userPreference?: string;
    projectComplexity?: 'simple' | 'moderate' | 'complex';
    experienceLevel?: string;
    featureFlags?: Record<string, boolean>;
  }): boolean {
    // Check feature flag first
    if (context.featureFlags?.['usePBLFlow'] === false) {
      return false;
    }
    
    // Use PBL flow for complex projects
    if (context.projectComplexity === 'complex') {
      return true;
    }
    
    // Use PBL flow for experienced users who want structure
    if (context.experienceLevel === 'experienced' && context.userPreference === 'structured') {
      return true;
    }
    
    // Default to PBL flow if feature is enabled
    return context.featureFlags?.['usePBLFlow'] !== false;
  }
  
  /**
   * Create a smooth handoff message when transitioning between flows
   */
  static createHandoffMessage(
    from: 'wizard' | 'pbl',
    to: 'wizard' | 'pbl',
    context: any
  ): string {
    if (from === 'wizard' && to === 'pbl') {
      return `Great start! I've transferred your initial ideas into our structured project builder. 
              We'll now work through each component step by step to create a comprehensive PBL project. 
              Don't worry - everything you've entered so far has been saved.`;
    }
    
    if (from === 'pbl' && to === 'wizard') {
      return `Let's switch to a more flexible approach. 
              I've saved all your work so far, and we can return to the structured flow anytime you'd like.`;
    }
    
    return 'Transitioning to the next phase of project design...';
  }
  
  /**
   * Validate if PBL state is ready for export
   */
  static validateForExport(pblState: PBLProjectState): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields check
    if (!pblState.projectData.intake.gradeLevel) {
      errors.push('Grade level is required');
    }
    
    if (pblState.projectData.intake.subjects.length === 0) {
      errors.push('At least one subject must be selected');
    }
    
    if (!pblState.projectData.goalsEQ.selectedEQ) {
      errors.push('Essential question must be defined');
    }
    
    if (pblState.projectData.phases.phases.length === 0) {
      errors.push('Project phases must be defined');
    }
    
    // Warnings for incomplete but non-critical fields
    if (pblState.projectData.standards.selectedStandards.length === 0) {
      warnings.push('No standards aligned - consider adding for curriculum compliance');
    }
    
    if (pblState.projectData.outreach.communityPartners.length === 0) {
      warnings.push('No community partners identified - real-world connections enhance PBL');
    }
    
    if (pblState.projectData.artifacts.rubrics.length === 0) {
      warnings.push('No rubrics created - consider adding for clear assessment criteria');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Helper methods
  private static mapDuration(duration?: string): string {
    const durationMap: Record<string, string> = {
      'short': '2-3 weeks',
      'medium': '4-6 weeks',
      'long': '8-12 weeks'
    };
    return duration ? durationMap[duration] || '4-6 weeks' : '4-6 weeks';
  }
  
  private static mapDurationReverse(duration: string): 'short' | 'medium' | 'long' {
    if (duration.includes('2-3')) return 'short';
    if (duration.includes('8-12') || duration.includes('semester')) return 'long';
    return 'medium';
  }
  
  private static mapExperience(pblExp?: string): 'novice' | 'intermediate' | 'expert' {
    const expMap: Record<string, 'novice' | 'intermediate' | 'expert'> = {
      'new': 'novice',
      'some': 'intermediate',
      'experienced': 'expert'
    };
    return pblExp ? expMap[pblExp] || 'intermediate' : 'intermediate';
  }
  
  private static extractMaterials(materials?: string): string[] {
    if (!materials) return [];
    return materials.split(',').map(m => m.trim()).filter(m => m.length > 0);
  }
  
  private static compileSpecialRequirements(projectData: any): string {
    const requirements: string[] = [];
    
    if (projectData.intake.technologyAccess.length > 0) {
      requirements.push(`Technology: ${projectData.intake.technologyAccess.join(', ')}`);
    }
    
    if (projectData.intake.availableMaterials.length > 0) {
      requirements.push(`Materials: ${projectData.intake.availableMaterials.join(', ')}`);
    }
    
    if (projectData.logistics.permissions.length > 0) {
      requirements.push(`Permissions needed: ${projectData.logistics.permissions.map((p: any) => p.type).join(', ')}`);
    }
    
    return requirements.join('\n');
  }
  
  private static compileSpecialConsiderations(projectData: any): string {
    const considerations: string[] = [];
    
    if (projectData.intake.classProfile.diverseLearners) {
      considerations.push('Class includes diverse learners');
    }
    
    if (projectData.intake.classProfile.englishLearners) {
      considerations.push('Class includes English language learners');
    }
    
    if (projectData.intake.classProfile.specialNeeds.length > 0) {
      considerations.push(`Special needs: ${projectData.intake.classProfile.specialNeeds.join(', ')}`);
    }
    
    if (projectData.intake.spaceConstraints.length > 0) {
      considerations.push(`Space constraints: ${projectData.intake.spaceConstraints.join(', ')}`);
    }
    
    return considerations.join('\n');
  }
  
  /**
   * Resume a PBL session from saved state
   */
  static resumeSession(savedState: string): PBLFlowOrchestrator | null {
    try {
      const orchestrator = PBLFlowOrchestrator.deserialize(savedState);
      logger.info('Resumed PBL session from saved state');
      return orchestrator;
    } catch (error) {
      logger.error('Failed to resume PBL session', error);
      return null;
    }
  }
  
  /**
   * Get contextual help for current step
   */
  static getStepHelp(stepId: string): {
    overview: string;
    tips: string[];
    examples: string[];
    resources: string[];
  } {
    const helpContent: Record<string, any> = {
      PROJECT_INTAKE: {
        overview: 'Understanding your classroom context helps create a project that fits your unique situation.',
        tips: [
          'Be specific about your schedule constraints',
          'List all available technology and materials',
          'Consider your students\' diverse learning needs',
          'Think about physical space limitations'
        ],
        examples: [
          '25 students, 45-minute periods, 5 days/week',
          'Chromebooks 1:1, basic art supplies, 3D printer access',
          '5 ELL students, 3 gifted, 2 with IEPs'
        ],
        resources: [
          'Classroom inventory checklist',
          'Student needs assessment template',
          'Technology audit guide'
        ]
      },
      GOALS_EQ: {
        overview: 'A strong essential question drives deep learning and student engagement.',
        tips: [
          'Focus on open-ended questions without single answers',
          'Connect to real-world issues students care about',
          'Ensure the question requires investigation',
          'Make it developmentally appropriate'
        ],
        examples: [
          'How can we reduce our school\'s environmental impact?',
          'What makes a community thrive?',
          'How do stories shape our understanding of history?'
        ],
        resources: [
          'Essential Question criteria rubric',
          'Question stem templates',
          'Student voice survey'
        ]
      }
      // Add more steps as needed
    };
    
    return helpContent[stepId] || {
      overview: 'This step helps build your PBL project.',
      tips: ['Take your time', 'Be specific', 'Think about your students'],
      examples: [],
      resources: []
    };
  }
}

// Export singleton instance for consistent adapter usage
export const pblWizardAdapter = new PBLWizardAdapter();