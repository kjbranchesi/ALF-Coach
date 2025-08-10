/**
 * SOPFlowManager.ts - Single source of truth for conversation flow
 * Implements exact SOP document specification
 */

import { 
  type SOPFlowState, 
  type SOPStage, 
  type SOPStep, 
  type ChipAction,
  type ChatMessage,
  SuggestionCard,
  type QuickReply,
  type BlueprintDoc,
  SOP_SCHEMA_VERSION
} from './types/SOPTypes';
import { type WizardData } from '../features/wizard/wizardSchema';
import { firebaseService } from './services/FirebaseService';
import { revisionService } from './services/RevisionService';
import { AIResponseParser } from './utils/AIResponseParser';
// import { contentParsingService } from './services/ContentParsingService'; // Removed - was causing errors

export class SOPFlowManager {
  private state: SOPFlowState;
  private stateChangeListeners: ((state: SOPFlowState) => void)[] = [];
  private readonly MAX_LISTENERS = 100; // Prevent memory leaks
  private blueprintId: string;
  private userId: string;
  private autoSaveEnabled: boolean = true;

  constructor(existingBlueprint?: BlueprintDoc, blueprintId?: string, userId?: string) {
    this.blueprintId = blueprintId || firebaseService.generateBlueprintId();
    this.userId = userId || 'anonymous';
    this.state = this.initializeState(existingBlueprint);
    
    // If new blueprint, save initial state
    if (!existingBlueprint && this.autoSaveEnabled) {
      this.saveToFirebase();
    }
  }

  // ============= INITIALIZATION =============
  private initializeState(existingBlueprint?: BlueprintDoc): SOPFlowState {
    if (existingBlueprint) {
      // Resume existing blueprint - use saved step if available, otherwise detect
      const savedStep = (existingBlueprint as any).currentStep;
      const savedStage = (existingBlueprint as any).currentStage;
      const savedStageStep = (existingBlueprint as any).stageStep;
      
      return {
        currentStage: savedStage || this.detectCurrentStage(existingBlueprint),
        currentStep: savedStep || this.detectCurrentStep(existingBlueprint),
        stageStep: savedStageStep || 1,
        blueprintDoc: existingBlueprint,
        conversationHistory: [],
        isTransitioning: false
      };
    }

    // New blueprint
    return {
      currentStage: 'WIZARD',
      currentStep: 'WIZARD_VISION',
      stageStep: 1,
      blueprintDoc: this.createEmptyBlueprint(),
      conversationHistory: [],
      messages: [],
      allowedActions: ['continue'],
      isTransitioning: false
    };
  }

  private createEmptyBlueprint(): BlueprintDoc {
    return {
      userId: this.userId,
      wizard: {
        vision: '',
        subject: '',
        students: '',
        location: '',
        resources: '',
        scope: 'unit'
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
      timestamps: {
        created: new Date(),
        updated: new Date()
      },
      schemaVersion: SOP_SCHEMA_VERSION
    };
  }

  // ============= STATE MANAGEMENT =============
  getState(): SOPFlowState {
    return { ...this.state };
  }

  subscribe(listener: (state: SOPFlowState) => void): () => void {
    if (this.stateChangeListeners.length >= this.MAX_LISTENERS) {
      console.warn('Maximum listeners reached. Removing oldest listener.');
      this.stateChangeListeners.shift(); // Remove oldest listener
    }
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  private updateState(updates: Partial<SOPFlowState>) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.state.blueprintDoc.timestamps.updated = new Date();
    
    // Update allowed actions based on current state
    this.state.allowedActions = this.calculateAllowedActions();
    
    // Log state changes
    console.log('[SOPFlowManager] State updated:', {
      oldStage: oldState.currentStage,
      newStage: this.state.currentStage,
      oldStep: oldState.currentStep,
      newStep: this.state.currentStep,
      updates: updates,
      allowedActions: this.state.allowedActions
    });
    
    // Log current blueprint data for debugging
    console.log('[SOPFlowManager] Current blueprint data after update:', {
      ideation: this.state.blueprintDoc.ideation,
      journey: this.state.blueprintDoc.journey,
      deliverables: this.state.blueprintDoc.deliverables
    });
    
    this.notifyListeners();
    
    // Auto-save to Firebase
    if (this.autoSaveEnabled) {
      this.autoSave();
    }
  }
  
  private calculateAllowedActions(): ChipAction[] {
    const { currentStep } = this.state;
    
    if (currentStep.includes('CLARIFIER')) {
      return ['continue', 'refine', 'help'];
    }
    
    // Check for actual step names
    if (currentStep === 'IDEATION_BIG_IDEA' || currentStep === 'IDEATION_EQ' || currentStep === 'IDEATION_CHALLENGE' ||
        currentStep === 'JOURNEY_PHASES' || currentStep === 'JOURNEY_ACTIVITIES' || currentStep === 'JOURNEY_RESOURCES' ||
        currentStep === 'DELIVER_MILESTONES' || currentStep === 'DELIVER_RUBRIC' || currentStep === 'DELIVER_IMPACT') {
      
      // Base actions always available
      const baseActions: ChipAction[] = ['ideas', 'whatif', 'help'];
      
      // Only add 'continue' if advancement validation passes
      if (this.canAdvance()) {
        baseActions.push('continue');
      }
      
      return baseActions;
    }
    
    return ['continue'];
  }

  private notifyListeners() {
    this.stateChangeListeners.forEach(listener => listener(this.getState()));
  }

  // ============= STEP DETECTION =============
  private detectCurrentStage(blueprint: BlueprintDoc): SOPStage {
    // CRITICAL FIX: Safe property access with null checks for stage detection
    const deliverables = blueprint.deliverables || {};
    const impact = deliverables.impact || {};
    const milestones = deliverables.milestones || [];
    const rubricCriteria = deliverables.rubric?.criteria || [];
    const phases = blueprint.journey?.phases || [];
    const bigIdea = blueprint.ideation?.bigIdea || '';
    
    // Check for completion: all deliverables must be complete
    if (impact.method && impact.audience && milestones.length >= 3 && rubricCriteria.length > 0) {
      return 'COMPLETED';
    }
    
    // Check if we're in deliverables stage
    if (milestones.length > 0 || rubricCriteria.length > 0 || impact.audience || impact.method) {
      return 'DELIVERABLES';
    }
    
    if (phases.length > 0) {return 'JOURNEY';}
    if (bigIdea) {return 'IDEATION';}
    return 'WIZARD';
  }

  private detectCurrentStep(blueprint: BlueprintDoc): SOPStep {
    // This would be more sophisticated in production
    const stage = this.detectCurrentStage(blueprint);
    switch (stage) {
      case 'WIZARD':
        if (!blueprint.wizard.vision) {return 'WIZARD_VISION';}
        if (!blueprint.wizard.subject) {return 'WIZARD_SUBJECT';}
        if (!blueprint.wizard.students) {return 'WIZARD_STUDENTS';}
        return 'WIZARD_SCOPE';
      case 'IDEATION':
        if (!blueprint.ideation.bigIdea) {return 'IDEATION_BIG_IDEA';}
        if (!blueprint.ideation.essentialQuestion) {return 'IDEATION_EQ';}
        if (!blueprint.ideation.challenge) {return 'IDEATION_CHALLENGE';}
        return 'IDEATION_CLARIFIER';
      case 'JOURNEY':
        if (blueprint.journey.phases.length === 0) {return 'JOURNEY_PHASES';}
        if (blueprint.journey.activities.length === 0) {return 'JOURNEY_ACTIVITIES';}
        if (blueprint.journey.resources.length === 0) {return 'JOURNEY_RESOURCES';}
        return 'JOURNEY_CLARIFIER';
      case 'DELIVERABLES':
        // CRITICAL FIX: Safe property access with null checks
        const deliverables = blueprint.deliverables || {};
        const milestones = deliverables.milestones || [];
        const rubricCriteria = deliverables.rubric?.criteria || [];
        const impact = deliverables.impact;
        
        if (milestones.length === 0) {return 'DELIVER_MILESTONES';}
        if (rubricCriteria.length === 0) {return 'DELIVER_RUBRIC';}
        if (!impact?.audience || impact.audience.length === 0) {return 'DELIVER_IMPACT';}
        return 'DELIVERABLES_CLARIFIER';
      default:
        return 'COMPLETED';
    }
  }

  // ============= NAVIGATION =============
  canAdvance(): boolean {
    // Check if current step has required data
    const { currentStep, blueprintDoc } = this.state;
    
    const result = (() => {
      switch (currentStep) {
        case 'WIZARD_VISION':
          return blueprintDoc.wizard.vision.length > 0;
        case 'WIZARD_SUBJECT':
          return blueprintDoc.wizard.subject.length > 0;
        case 'WIZARD_STUDENTS':
          return blueprintDoc.wizard.students.length > 0;
        case 'IDEATION_BIG_IDEA':
          return blueprintDoc.ideation.bigIdea.length > 0;
        case 'IDEATION_EQ':
          return blueprintDoc.ideation.essentialQuestion.length > 0;
        case 'IDEATION_CHALLENGE':
          return blueprintDoc.ideation.challenge.length > 0;
        case 'JOURNEY_PHASES':
          // Accept at least 1 phase (we can always add more later)
          return blueprintDoc.journey.phases && blueprintDoc.journey.phases.length >= 1;
        case 'JOURNEY_ACTIVITIES':
          // Reduced from 3 to 2 for better UX
          return blueprintDoc.journey.activities && blueprintDoc.journey.activities.length >= 2;
        case 'JOURNEY_RESOURCES':
          // Reduced from 3 to 1 to allow progression with single selection
          return blueprintDoc.journey.resources && blueprintDoc.journey.resources.length >= 1;
        case 'DELIVER_MILESTONES':
          // CRITICAL FIX: Ensure milestones array exists and has sufficient items
          const milestones = blueprintDoc.deliverables?.milestones || [];
          console.log('[SOPFlowManager] Validating DELIVER_MILESTONES:', {
            milestonesLength: milestones.length,
            milestones: milestones,
            canAdvance: milestones.length >= 3
          });
          return milestones.length >= 3;
        case 'DELIVER_RUBRIC':
          // CRITICAL FIX: Ensure rubric criteria array exists
          const rubricCriteria = blueprintDoc.deliverables?.rubric?.criteria || [];
          console.log('[SOPFlowManager] Validating DELIVER_RUBRIC:', {
            criteriaLength: rubricCriteria.length,
            canAdvance: rubricCriteria.length > 0
          });
          return rubricCriteria.length > 0;
        case 'DELIVER_IMPACT':
          // CRITICAL FIX: Ensure impact object exists with required fields
          const impact = blueprintDoc.deliverables?.impact;
          const hasAudience = impact?.audience && impact.audience.length > 0;
          const hasMethod = impact?.method && impact.method.length > 0;
          console.log('[SOPFlowManager] Validating DELIVER_IMPACT:', {
            impact: impact,
            hasAudience: hasAudience,
            hasMethod: hasMethod,
            canAdvance: hasAudience && hasMethod
          });
          return hasAudience && hasMethod;
        // Clarifier stages always allow advancement
        case 'IDEATION_CLARIFIER':
        case 'JOURNEY_CLARIFIER':
        case 'DELIVERABLES_CLARIFIER':
          return true;
        default:
          return true;
      }
    })();
    
    return result;
  }

  advance(): void {
    if (!this.canAdvance()) {
      console.error('[SOPFlowManager] Cannot advance - validation failed for step:', {
        currentStep: this.state.currentStep,
        blueprintData: {
          ideation: this.state.blueprintDoc.ideation,
          journey: this.state.blueprintDoc.journey,
          deliverables: this.state.blueprintDoc.deliverables
        }
      });
      throw new Error('Cannot advance: current step incomplete');
    }

    console.log(`[SOPFlowManager] Advancing from ${this.state.currentStep}`, {
      currentStage: this.state.currentStage,
      currentStageStep: this.state.stageStep,
      currentBlueprint: {
        bigIdea: this.state.blueprintDoc.ideation?.bigIdea,
        essentialQuestion: this.state.blueprintDoc.ideation?.essentialQuestion,
        challenge: this.state.blueprintDoc.ideation?.challenge,
        phases: this.state.blueprintDoc.journey?.phases,
        activities: this.state.blueprintDoc.journey?.activities,
        resources: this.state.blueprintDoc.journey?.resources,
        milestones: this.state.blueprintDoc.deliverables?.milestones,
        rubricCriteria: this.state.blueprintDoc.deliverables?.rubric?.criteria,
        impactAudience: this.state.blueprintDoc.deliverables?.impact?.audience,
        impactMethod: this.state.blueprintDoc.deliverables?.impact?.method
      }
    });

    const nextStep = this.getNextStep();
    if (nextStep) {
      const nextStage = this.getStageForStep(nextStep);
      const currentStageStep = this.state.stageStep || 1;
      
      // Calculate new stageStep
      let newStageStep = currentStageStep;
      if (nextStage === this.state.currentStage) {
        // Same stage, increment step
        newStageStep = currentStageStep + 1;
      } else {
        // New stage, reset to 1
        newStageStep = 1;
      }
      
      console.log(`[SOPFlowManager] Advancing to ${nextStep}`, {
        nextStage: nextStage,
        newStageStep: newStageStep,
        stageTransition: nextStage !== this.state.currentStage
      });
      
      this.updateState({
        currentStep: nextStep,
        currentStage: nextStage,
        stageStep: newStageStep
      });
      
      console.log(`[SOPFlowManager] Successfully advanced to ${nextStep}`, {
        newState: {
          stage: this.state.currentStage,
          step: this.state.currentStep,
          stageStep: this.state.stageStep
        },
        preservedBlueprint: {
          bigIdea: this.state.blueprintDoc.ideation?.bigIdea,
          essentialQuestion: this.state.blueprintDoc.ideation?.essentialQuestion,
          challenge: this.state.blueprintDoc.ideation?.challenge
        }
      });
    } else {
      console.warn('[SOPFlowManager] No next step available, staying at current step');
    }
  }

  private getNextStep(): SOPStep | null {
    const stepOrder: SOPStep[] = [
      // Wizard steps (if needed)
      'WIZARD_VISION', 'WIZARD_SUBJECT', 'WIZARD_STUDENTS', 
      'WIZARD_LOCATION', 'WIZARD_SCOPE',
      // Ideation (3 steps + clarifier)
      'IDEATION_BIG_IDEA', 'IDEATION_EQ', 'IDEATION_CHALLENGE', 'IDEATION_CLARIFIER',
      // Journey (3 steps + clarifier)
      'JOURNEY_PHASES', 'JOURNEY_ACTIVITIES', 'JOURNEY_RESOURCES', 'JOURNEY_CLARIFIER',
      // Deliverables (3 steps + clarifier)
      'DELIVER_MILESTONES', 'DELIVER_RUBRIC', 'DELIVER_IMPACT', 'DELIVERABLES_CLARIFIER',
      // Final
      'COMPLETED'
    ];

    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
      return null;
    }
    return stepOrder[currentIndex + 1];
  }

  private getStageForStep(step: SOPStep): SOPStage {
    if (step.startsWith('WIZARD')) {return 'WIZARD';}
    if (step.startsWith('IDEATION')) {return 'IDEATION';}
    if (step.startsWith('JOURNEY')) {return 'JOURNEY';}
    if (step.startsWith('DELIVER')) {return 'DELIVERABLES';}
    return 'COMPLETED';
  }

  // ============= DATA MANAGEMENT =============
  async updateStepData(data: any): Promise<void> {
    const { currentStep, blueprintDoc } = this.state;
    
    console.log(`[SOPFlowManager] updateStepData called for step: ${currentStep}`, { 
      inputData: data,
      currentBlueprintState: {
        ideation: blueprintDoc.ideation,
        journey: blueprintDoc.journey,
        deliverables: blueprintDoc.deliverables
      }
    });
    
    // Start tracking revision
    revisionService.startRevision(this.blueprintId, `Updated ${currentStep}`);
    
    switch (currentStep) {
      // Wizard steps
      case 'WIZARD_VISION':
        blueprintDoc.wizard.vision = data;
        break;
      case 'WIZARD_SUBJECT':
        blueprintDoc.wizard.subject = data;
        break;
      case 'WIZARD_STUDENTS':
        blueprintDoc.wizard.students = data;
        break;
      case 'WIZARD_LOCATION':
        blueprintDoc.wizard.location = data;
        break;
      case 'WIZARD_SCOPE':
        blueprintDoc.wizard.scope = data;
        break;
        
      // Ideation steps
      case 'IDEATION_BIG_IDEA':
        // Extract and save Big Idea
        const bigIdeaData = typeof data === 'string' ? data : (data?.text || data?.bigIdea || String(data));
        console.log(`[SOPFlowManager] Processing Big Idea:`, {
          originalData: data,
          extractedBigIdea: bigIdeaData,
          beforeSaving: blueprintDoc.ideation.bigIdea
        });
        blueprintDoc.ideation.bigIdea = bigIdeaData;
        
        // Auto-generate project name from Big Idea
        if (bigIdeaData && !blueprintDoc.name) {
          blueprintDoc.name = this.generateProjectName(bigIdeaData, blueprintDoc.wizard.subject);
          console.log(`[SOPFlowManager] Generated project name:`, blueprintDoc.name);
        }
        
        console.log(`[SOPFlowManager] Successfully saved Big Idea:`, {
          savedValue: bigIdeaData,
          fullIdeationSection: blueprintDoc.ideation
        });
        break;
      case 'IDEATION_EQ':
        // Extract and save Essential Question
        const eqData = typeof data === 'string' ? data : (data?.text || data?.essentialQuestion || String(data));
        console.log(`[SOPFlowManager] Processing Essential Question:`, {
          originalData: data,
          extractedEQ: eqData,
          beforeSaving: blueprintDoc.ideation.essentialQuestion
        });
        blueprintDoc.ideation.essentialQuestion = eqData;
        console.log(`[SOPFlowManager] Successfully saved Essential Question:`, {
          savedValue: eqData,
          fullIdeationSection: blueprintDoc.ideation
        });
        break;
      case 'IDEATION_CHALLENGE':
        // Extract and save Challenge
        const challengeData = typeof data === 'string' ? data : (data?.text || data?.challenge || String(data));
        console.log(`[SOPFlowManager] Processing Challenge:`, {
          originalData: data,
          extractedChallenge: challengeData,
          beforeSaving: blueprintDoc.ideation.challenge
        });
        blueprintDoc.ideation.challenge = challengeData;
        console.log(`[SOPFlowManager] Successfully saved Challenge:`, {
          savedValue: challengeData,
          fullIdeationSection: blueprintDoc.ideation
        });
        break;
        
      // Journey steps
      case 'JOURNEY_PHASES':
        // Parse and save phases with proper structure
        // Handle both string format and pre-parsed phase format
        let phases;
        if (typeof data === 'string' && data.includes('Phase 1:')) {
          // Multi-select format from JourneyPhaseSelector
          phases = data.split('\n').map(line => {
            const match = line.match(/Phase \d+: ([^-]+) - (.+)/);
            if (match) {
              return { title: match[1].trim(), description: match[2].trim() };
            }
            return null;
          }).filter(Boolean);
        } else {
          phases = AIResponseParser.extractPhases(data);
        }
        blueprintDoc.journey.phases = phases;
        break;
      case 'JOURNEY_ACTIVITIES':
        // Parse and save activities as array
        // Handle both string format and pre-parsed activity format
        let activities;
        if (typeof data === 'string' && data.includes('Activity 1:')) {
          // Multi-select format from ActivityBuilder
          activities = data.split('\n').map(line => {
            const match = line.match(/Activity \d+: ([^-]+) - (.+)/);
            if (match) {
              return `${match[1].trim()}: ${match[2].trim()}`;
            }
            return null;
          }).filter(Boolean);
        } else {
          activities = AIResponseParser.extractListItems(data, 'activities');
        }
        blueprintDoc.journey.activities = activities;
        break;
      case 'JOURNEY_RESOURCES':
        // Parse and save resources as array
        // Now handles multi-select format from ResourceSelector
        if (typeof data === 'string') {
          // If it's a comma-separated list from multi-select
          if (data.includes(',')) {
            blueprintDoc.journey.resources = data.split(',').map(r => r.trim());
          } else {
            // Single resource
            blueprintDoc.journey.resources = [data];
          }
        } else if (Array.isArray(data)) {
          blueprintDoc.journey.resources = data;
        } else {
          // Fallback
          const resources = AIResponseParser.extractListItems(data, 'resources');
          blueprintDoc.journey.resources = resources;
        }
        break;
        
      // Deliverables steps
      case 'DELIVER_MILESTONES':
        // CRITICAL FIX: Ensure deliverables object exists and parse milestones properly
        if (!blueprintDoc.deliverables) {
          blueprintDoc.deliverables = {
            milestones: [],
            rubric: { criteria: [] },
            impact: { audience: '', method: '' }
          };
        }
        
        // Parse milestones with better error handling
        let milestones;
        try {
          if (Array.isArray(data)) {
            // If data is already an array (from MilestoneSelector), use it directly
            milestones = data.map(m => {
              if (typeof m === 'string') return m;
              // If it's an object with title/description, format it
              return m.title || m.description || m.text || m;
            });
          } else if (typeof data === 'string') {
            // Handle both direct milestone text and AI-processed milestone descriptions
            if (data.includes('Milestone 1:') || data.includes('1.')) {
              milestones = AIResponseParser.extractListItems(data, 'milestones');
            } else {
              // User provided a single milestone or general description
              milestones = [data.trim()];
            }
          } else {
            milestones = AIResponseParser.extractListItems(data, 'milestones');
          }
        } catch (error) {
          console.warn('[SOPFlowManager] Error parsing milestones:', error);
          milestones = typeof data === 'string' ? [data.trim()] : [];
        }
        
        blueprintDoc.deliverables.milestones = milestones || [];
        console.log('[SOPFlowManager] Saved milestones:', {
          inputData: data,
          parsedMilestones: milestones,
          totalCount: milestones?.length || 0,
          canAdvance: (milestones?.length || 0) >= 3
        });
        break;
      case 'DELIVER_RUBRIC':
        // CRITICAL FIX: Ensure deliverables.rubric exists and parse criteria properly
        if (!blueprintDoc.deliverables) {
          blueprintDoc.deliverables = {
            milestones: [],
            rubric: { criteria: [] },
            impact: { audience: '', method: '' }
          };
        }
        if (!blueprintDoc.deliverables.rubric) {
          blueprintDoc.deliverables.rubric = { criteria: [] };
        }
        
        // Parse rubric criteria with better error handling
        let rubricCriteria;
        try {
          rubricCriteria = AIResponseParser.extractRubricCriteria(data);
        } catch (error) {
          console.warn('[SOPFlowManager] Error parsing rubric criteria:', error);
          rubricCriteria = { criteria: [] };
        }
        
        blueprintDoc.deliverables.rubric = rubricCriteria || { criteria: [] };
        console.log('[SOPFlowManager] Saved rubric criteria:', {
          inputData: data,
          parsedCriteria: rubricCriteria,
          criteriaCount: rubricCriteria?.criteria?.length || 0
        });
        break;
      case 'DELIVER_IMPACT':
        // CRITICAL FIX: Ensure deliverables.impact exists and parse impact properly
        if (!blueprintDoc.deliverables) {
          blueprintDoc.deliverables = {
            milestones: [],
            rubric: { criteria: [] },
            impact: { audience: '', method: '' }
          };
        }
        if (!blueprintDoc.deliverables.impact) {
          blueprintDoc.deliverables.impact = { audience: '', method: '' };
        }
        
        // Parse impact data with better error handling
        let impactData;
        try {
          impactData = AIResponseParser.extractImpactData(data);
        } catch (error) {
          console.warn('[SOPFlowManager] Error parsing impact data:', error);
          impactData = { audience: '', method: '' };
        }
        
        blueprintDoc.deliverables.impact = impactData || { audience: '', method: '' };
        console.log('[SOPFlowManager] Saved impact data:', {
          inputData: data,
          parsedImpact: impactData,
          hasAudience: !!(impactData?.audience),
          hasMethod: !!(impactData?.method)
        });
        break;
        
      default:
        console.warn(`No handler for step: ${currentStep}`);
    }

    this.updateState({ blueprintDoc });
    
    // Log final state after all updates
    console.log(`[SOPFlowManager] Final updateStepData result for ${currentStep}:`, {
      stepCompleted: currentStep,
      finalBlueprintState: {
        ideation: this.state.blueprintDoc.ideation,
        journey: this.state.blueprintDoc.journey,
        deliverables: this.state.blueprintDoc.deliverables
      },
      canAdvanceAfterUpdate: this.canAdvance()
    });
    
    // Commit the revision
    revisionService.commitRevision(this.state.blueprintDoc);
  }

  completeWizard(data: WizardData): void {
    // Update wizard data in blueprint with new simplified structure
    this.state.blueprintDoc.wizard = {
      vision: data.vision || '',
      subject: data.subject || '',
      students: data.gradeLevel || '',
      location: '', // Optional, not collected in simplified wizard
      resources: data.requiredResources || '', // Optional resources from accordion
      scope: this.convertDurationToScope(data.duration)
    };
    
    // Transition to first ideation step
    this.updateState({
      currentStage: 'IDEATION',
      currentStep: 'IDEATION_BIG_IDEA',
      stageStep: 1,
      blueprintDoc: this.state.blueprintDoc
    });
    
    this.notifyListeners();
  }
  
  // Helper to convert new duration enum to legacy scope
  private convertDurationToScope(duration: 'short' | 'medium' | 'long' | undefined): 'lesson' | 'unit' | 'course' {
    switch (duration) {
      case 'short': return 'lesson';
      case 'medium': return 'unit';
      case 'long': return 'course';
      default: return 'unit';
    }
  }

  // ============= CONVERSATION MANAGEMENT =============
  addMessage(message: ChatMessage): void {
    const conversationHistory = [...this.state.conversationHistory, message];
    this.updateState({ conversationHistory });
  }

  // ============= ACTION VALIDATION =============
  isActionAllowed(action: ChipAction): boolean {
    const { currentStep } = this.state;
    
    // Stage initiators only allow 'continue'
    if (currentStep.endsWith('_INTRO')) {
      return action === 'continue';
    }
    
    // Clarifiers allow continue, refine, help (not edit)
    if (currentStep.endsWith('_CLARIFIER')) {
      return ['continue', 'refine', 'help'].includes(action);
    }
    
    // Sub-steps allow ideas, whatif, help, continue
    return ['ideas', 'whatif', 'help', 'continue'].includes(action);
  }

  // ============= QUICK REPLY GENERATION =============
  getQuickReplies(): QuickReply[] {
    const { currentStep } = this.state;
    
    // Stage initiators
    if (currentStep.endsWith('_INTRO')) {
      return [{ label: 'Start', action: 'continue' }];
    }
    
    // Clarifiers
    if (currentStep.endsWith('_CLARIFIER')) {
      return [
        { label: 'Continue', action: 'continue' },
        { label: 'Refine', action: 'refine' },
        { label: 'Help', action: 'help' }
      ];
    }
    
    // Sub-steps
    return [
      { label: 'Ideas', action: 'ideas' },
      { label: 'What-If', action: 'whatif' },
      { label: 'Help', action: 'help' }
    ];
  }

  // ============= PROGRESS CALCULATION =============
  getProgress(): { percentage: number; currentStepNumber: number; totalSteps: number } {
    // For stage-based progress (3 steps per stage)
    const { currentStage, stageStep } = this.state;
    
    if (currentStage === 'WIZARD') {
      return { percentage: 0, currentStepNumber: 0, totalSteps: 0 };
    }
    
    if (currentStage === 'COMPLETED') {
      return { percentage: 100, currentStepNumber: 3, totalSteps: 3 };
    }
    
    // Each stage has 3 steps
    const stepsPerStage = 3;
    const currentStep = stageStep || 1;
    const percentage = Math.round((currentStep / stepsPerStage) * 100);
    
    return {
      percentage,
      currentStepNumber: currentStep,
      totalSteps: stepsPerStage
    };
  }

  private calculateCompletedSteps(): number {
    // This would calculate based on current step
    // Simplified for now
    const stepOrder: SOPStep[] = [
      'WIZARD_VISION', 'WIZARD_SUBJECT', 'WIZARD_STUDENTS', 
      'WIZARD_LOCATION', 'WIZARD_SCOPE',
      'IDEATION_INTRO', 'IDEATION_BIG_IDEA', 'IDEATION_EQ', 
      'IDEATION_CHALLENGE', 'IDEATION_CLARIFIER',
      'JOURNEY_INTRO', 'JOURNEY_PHASES', 'JOURNEY_ACTIVITIES',
      'JOURNEY_RESOURCES', 'JOURNEY_CLARIFIER',
      'DELIVERABLES_INTRO', 'DELIVER_MILESTONES', 'DELIVER_RUBRIC',
      'DELIVER_IMPACT', 'DELIVERABLES_CLARIFIER'
    ];
    
    const currentIndex = stepOrder.indexOf(this.state.currentStep);
    return currentIndex === -1 ? 0 : currentIndex;
  }

  // ============= STAGE RESET =============
  resetToStageBeginning(): void {
    const { currentStage } = this.state;
    if (currentStage === 'WIZARD' || currentStage === 'COMPLETED') {
      return;
    }
    
    let firstStep: SOPStep;
    switch (currentStage) {
      case 'IDEATION':
        firstStep = 'IDEATION_BIG_IDEA';
        break;
      case 'JOURNEY':
        firstStep = 'JOURNEY_PHASES';
        break;
      case 'DELIVERABLES':
        firstStep = 'DELIVER_MILESTONES';
        break;
      default:
        return;
    }
    
    this.updateState({
      currentStep: firstStep,
      stageStep: 1
    });
  }

  // ============= FIREBASE PERSISTENCE =============
  private saveToFirebase(): void {
    // Include flow state information in the blueprint for persistence
    const blueprintWithFlowState = {
      ...this.state.blueprintDoc,
      currentStep: this.state.currentStep,
      currentStage: this.state.currentStage,
      stageStep: this.state.stageStep
    };
    
    firebaseService.saveBlueprint(this.blueprintId, blueprintWithFlowState)
      .catch(error => {
        console.error('Failed to save blueprint:', error);
      });
  }
  
  private autoSave(): void {
    // Include flow state information in the blueprint for persistence
    const blueprintWithFlowState = {
      ...this.state.blueprintDoc,
      currentStep: this.state.currentStep,
      currentStage: this.state.currentStage,
      stageStep: this.state.stageStep
    };
    
    // Use debounced auto-save to avoid too many writes
    firebaseService.autoSave(this.blueprintId, blueprintWithFlowState);
  }
  
  async loadFromFirebase(blueprintId: string): Promise<boolean> {
    try {
      const blueprint = await firebaseService.loadBlueprint(blueprintId);
      if (blueprint) {
        this.blueprintId = blueprintId;
        this.state = this.initializeState(blueprint);
        this.notifyListeners();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load blueprint:', error);
      return false;
    }
  }
  
  getBlueprintId(): string {
    return this.blueprintId;
  }
  
  setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
  }

  // ============= CLEANUP =============
  destroy(): void {
    // Clear listeners properly
    this.stateChangeListeners.length = 0; // More efficient than creating new array
    
    // Stop auto-save
    this.autoSaveEnabled = false;
    
    // Final save before cleanup
    if (this.state.blueprintDoc) {
      this.saveToFirebase();
    }
    
    // Clean up Firebase service
    firebaseService.destroy();
  }

  // ============= EXPORT =============
  exportBlueprint(): BlueprintDoc {
    return { ...this.state.blueprintDoc };
  }

  /**
   * Generate a concise project name from Big Idea and subject
   */
  private generateProjectName(bigIdea: string, subject?: string): string {
    // Extract key concepts from big idea (first 50 chars or first sentence)
    let shortIdea = bigIdea.split('.')[0].substring(0, 50);
    
    // Remove common words
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = shortIdea.toLowerCase().split(' ').filter(w => !commonWords.includes(w));
    
    // Take first 3-4 meaningful words
    const keyWords = words.slice(0, 3).map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    
    // Add subject if provided and not already in name
    if (subject && !keyWords.toLowerCase().includes(subject.toLowerCase())) {
      return `${subject}: ${keyWords}`;
    }
    
    return keyWords || 'Untitled Project';
  }

  /**
   * Update blueprint with partial data
   */
  updateBlueprint(updates: Partial<BlueprintDoc>): void {
    // Start a new revision
    revisionService.startRevision(this.blueprintId, 'Manual edit from blueprint viewer');
    
    // Track changes before applying them
    const oldBlueprint = JSON.parse(JSON.stringify(this.state.blueprintDoc));
    
    // Deep merge the updates
    if (updates.wizard) {
      Object.keys(updates.wizard).forEach(key => {
        const path = `wizard.${key}`;
        revisionService.trackChange(
          path, 
          this.blueprintDoc.wizard[key as keyof WizardData],
          updates.wizard![key as keyof WizardData]
        );
      });
      this.blueprintDoc.wizard = { ...this.blueprintDoc.wizard, ...updates.wizard };
    }
    if (updates.ideation) {
      Object.keys(updates.ideation).forEach(key => {
        const path = `ideation.${key}`;
        revisionService.trackChange(
          path,
          this.blueprintDoc.ideation[key as keyof typeof this.blueprintDoc.ideation],
          updates.ideation![key as keyof typeof updates.ideation]
        );
      });
      this.blueprintDoc.ideation = { ...this.blueprintDoc.ideation, ...updates.ideation };
    }
    if (updates.journey) {
      Object.keys(updates.journey).forEach(key => {
        const path = `journey.${key}`;
        revisionService.trackChange(
          path,
          this.blueprintDoc.journey[key as keyof typeof this.blueprintDoc.journey],
          updates.journey![key as keyof typeof updates.journey]
        );
      });
      this.blueprintDoc.journey = { ...this.blueprintDoc.journey, ...updates.journey };
    }
    if (updates.deliverables) {
      Object.keys(updates.deliverables).forEach(key => {
        const path = `deliverables.${key}`;
        revisionService.trackChange(
          path,
          this.blueprintDoc.deliverables[key as keyof typeof this.blueprintDoc.deliverables],
          updates.deliverables![key as keyof typeof updates.deliverables]
        );
      });
      this.blueprintDoc.deliverables = { ...this.blueprintDoc.deliverables, ...updates.deliverables };
    }
    
    this.blueprintDoc.timestamps.updated = new Date();
    this.state.blueprintDoc = this.blueprintDoc;
    
    // Commit the revision
    revisionService.commitRevision(this.state.blueprintDoc);
    
    this.notifyListeners();
    
    // Save to Firebase
    this.saveToFirebase();
  }
}