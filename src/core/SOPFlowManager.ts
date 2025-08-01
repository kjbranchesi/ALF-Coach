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
  type WizardData,
  SOP_SCHEMA_VERSION
} from './types/SOPTypes';
import { firebaseService } from './services/FirebaseService';
import { revisionService } from './services/RevisionService';

export class SOPFlowManager {
  private state: SOPFlowState;
  private stateChangeListeners: ((state: SOPFlowState) => void)[] = [];
  private blueprintId: string;
  private autoSaveEnabled: boolean = true;

  constructor(existingBlueprint?: BlueprintDoc, blueprintId?: string) {
    this.blueprintId = blueprintId || firebaseService.generateBlueprintId();
    this.state = this.initializeState(existingBlueprint);
    
    // If new blueprint, save initial state
    if (!existingBlueprint && this.autoSaveEnabled) {
      this.saveToFirebase();
    }
  }

  // ============= INITIALIZATION =============
  private initializeState(existingBlueprint?: BlueprintDoc): SOPFlowState {
    if (existingBlueprint) {
      // Resume existing blueprint
      return {
        currentStage: this.detectCurrentStage(existingBlueprint),
        currentStep: this.detectCurrentStep(existingBlueprint),
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
    this.stateChangeListeners.push(listener);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
    };
  }

  private updateState(updates: Partial<SOPFlowState>) {
    this.state = { ...this.state, ...updates };
    this.state.blueprintDoc.timestamps.updated = new Date();
    
    // Update allowed actions based on current state
    this.state.allowedActions = this.calculateAllowedActions();
    
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
    
    // Check for actual step names instead of numbered suffixes
    if (currentStep === 'IDEATION_BIG_IDEA' || currentStep === 'IDEATION_EQ' || currentStep === 'IDEATION_CHALLENGE' ||
        currentStep === 'JOURNEY_PHASES' || currentStep === 'JOURNEY_ACTIVITIES' || currentStep === 'JOURNEY_RESOURCES' ||
        currentStep === 'DELIVER_MILESTONES' || currentStep === 'DELIVER_RUBRIC' || currentStep === 'DELIVER_IMPACT') {
      return ['ideas', 'whatif', 'help', 'continue'];
    }
    
    return ['continue'];
  }

  private notifyListeners() {
    this.stateChangeListeners.forEach(listener => listener(this.getState()));
  }

  // ============= STEP DETECTION =============
  private detectCurrentStage(blueprint: BlueprintDoc): SOPStage {
    if (blueprint.deliverables.impact.method) {return 'COMPLETED';}
    if (blueprint.deliverables.milestones.length > 0) {return 'DELIVERABLES';}
    if (blueprint.journey.phases.length > 0) {return 'JOURNEY';}
    if (blueprint.ideation.bigIdea) {return 'IDEATION';}
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
        if (blueprint.deliverables.milestones.length === 0) {return 'DELIVER_MILESTONES';}
        if (blueprint.deliverables.rubric.criteria.length === 0) {return 'DELIVER_RUBRIC';}
        if (!blueprint.deliverables.impact.audience) {return 'DELIVER_IMPACT';}
        return 'DELIVERABLES_CLARIFIER';
      default:
        return 'COMPLETED';
    }
  }

  // ============= NAVIGATION =============
  canAdvance(): boolean {
    // Check if current step has required data
    const { currentStep, blueprintDoc } = this.state;
    
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
        return blueprintDoc.journey.phases.length >= 3;
      case 'JOURNEY_ACTIVITIES':
        return blueprintDoc.journey.activities.length >= 3;
      case 'JOURNEY_RESOURCES':
        return blueprintDoc.journey.resources.length >= 3;
      case 'DELIVER_MILESTONES':
        return blueprintDoc.deliverables.milestones.length >= 3;
      case 'DELIVER_RUBRIC':
        return blueprintDoc.deliverables.rubric.criteria.length > 0;
      case 'DELIVER_IMPACT':
        return blueprintDoc.deliverables.impact.audience.length > 0 &&
               blueprintDoc.deliverables.impact.method.length > 0;
      // Clarifier stages always allow advancement
      case 'IDEATION_CLARIFIER':
      case 'JOURNEY_CLARIFIER':
      case 'DELIVERABLES_CLARIFIER':
        return true;
      default:
        return true;
    }
  }

  advance(): void {
    if (!this.canAdvance()) {
      throw new Error('Cannot advance: current step incomplete');
    }

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
      
      this.updateState({
        currentStep: nextStep,
        currentStage: nextStage,
        stageStep: newStageStep
      });
    }
  }

  private getNextStep(): SOPStep | null {
    const stepOrder: SOPStep[] = [
      // Wizard steps (if needed)
      'WIZARD_VISION', 'WIZARD_SUBJECT', 'WIZARD_STUDENTS', 
      'WIZARD_LOCATION', 'WIZARD_RESOURCES', 'WIZARD_SCOPE',
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
  updateStepData(data: any): void {
    const { currentStep, blueprintDoc } = this.state;
    
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
      case 'WIZARD_RESOURCES':
        blueprintDoc.wizard.resources = data;
        break;
      case 'WIZARD_SCOPE':
        blueprintDoc.wizard.scope = data;
        break;
        
      // Ideation steps
      case 'IDEATION_BIG_IDEA':
        blueprintDoc.ideation.bigIdea = data;
        break;
      case 'IDEATION_EQ':
        blueprintDoc.ideation.essentialQuestion = data;
        break;
      case 'IDEATION_CHALLENGE':
        blueprintDoc.ideation.challenge = data;
        break;
        
      // Journey steps
      case 'JOURNEY_PHASES':
        if (typeof data === 'string') {
          // Try to parse multi-phase response - support multiple formats
          const phases = [];
          
          // Format 1: "Phase 1: Title\nDescription"
          const phaseMatches = data.match(/Phase \d+:\s*([^\n]+)\n([^\n]+)/g);
          
          // Format 2: Numbered list with descriptions
          const numberedMatches = data.match(/(\d+)\.\s*([^\n]+)\n([^\n]+)/g);
          
          if (phaseMatches && phaseMatches.length >= 3) {
            blueprintDoc.journey.phases = phaseMatches.map(match => {
              const [, title, description] = match.match(/Phase \d+:\s*([^\n]+)\n([^\n]+)/) || [];
              return { title: title?.trim() || 'Phase', description: description?.trim() || '' };
            });
          } else if (numberedMatches && numberedMatches.length >= 3) {
            blueprintDoc.journey.phases = numberedMatches.map(match => {
              const [, , title, description] = match.match(/(\d+)\.\s*([^\n]+)\n([^\n]+)/) || [];
              return { title: title?.trim() || 'Phase', description: description?.trim() || '' };
            });
          } else {
            // Try to find any 3 distinct sections
            const sections = data.split(/\n\n+/).filter(s => s.trim());
            if (sections.length >= 3) {
              blueprintDoc.journey.phases = sections.slice(0, 3).map((section, idx) => {
                const lines = section.split('\n').filter(l => l.trim());
                return {
                  title: lines[0]?.replace(/^(Phase \d+:|[\d.]+\s*)/i, '').trim() || `Phase ${idx + 1}`,
                  description: lines.slice(1).join(' ').trim() || section
                };
              });
            } else {
              // Fallback for single input
              blueprintDoc.journey.phases = [{ title: 'Phase 1', description: data }];
            }
          }
        } else {
          blueprintDoc.journey.phases = data;
        }
        break;
      case 'JOURNEY_ACTIVITIES':
        if (typeof data === 'string') {
          // Parse numbered list of activities
          const activityMatches = data.match(/\d+\.\s*([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/g);
          if (activityMatches && activityMatches.length >= 3) {
            blueprintDoc.journey.activities = activityMatches.map(match => {
              return match.replace(/^\d+\.\s*/, '').trim();
            });
          } else {
            // Try splitting by newlines
            const lines = data.split('\n').filter(line => line.trim() && !line.match(/^(I can|I'll help|Based on)/i));
            if (lines.length >= 3) {
              blueprintDoc.journey.activities = lines.slice(0, 3);
            } else {
              blueprintDoc.journey.activities = [data];
            }
          }
        } else {
          blueprintDoc.journey.activities = Array.isArray(data) ? data : [data];
        }
        break;
      case 'JOURNEY_RESOURCES':
        if (typeof data === 'string') {
          // Parse numbered list of resources
          const resourceMatches = data.match(/\d+\.\s*([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/g);
          if (resourceMatches && resourceMatches.length >= 3) {
            blueprintDoc.journey.resources = resourceMatches.map(match => {
              return match.replace(/^\d+\.\s*/, '').trim();
            });
          } else {
            // Try splitting by newlines
            const lines = data.split('\n').filter(line => line.trim() && !line.match(/^(I'll help|Based on)/i));
            if (lines.length >= 3) {
              blueprintDoc.journey.resources = lines.slice(0, 3);
            } else {
              blueprintDoc.journey.resources = [data];
            }
          }
        } else {
          blueprintDoc.journey.resources = Array.isArray(data) ? data : [data];
        }
        break;
        
      // Deliverables steps
      case 'DELIVER_MILESTONES':
        if (typeof data === 'string') {
          // Parse multi-milestone response
          const milestoneMatches = data.match(/Milestone \d+:\s*([^\n]+)\n([^\n]+)/g);
          if (milestoneMatches && milestoneMatches.length >= 3) {
            blueprintDoc.deliverables.milestones = milestoneMatches.map((match, idx) => {
              const [, title, description] = match.match(/Milestone \d+:\s*([^\n]+)\n([^\n]+)/) || [];
              return {
                id: `m${idx + 1}`,
                title: title?.trim() || `Milestone ${idx + 1}`,
                description: description?.trim() || '',
                phase: `phase${idx + 1}` as 'phase1' | 'phase2' | 'phase3'
              };
            });
          } else {
            // Fallback for single input
            blueprintDoc.deliverables.milestones = [data];
          }
        } else {
          blueprintDoc.deliverables.milestones = data;
        }
        break;
      case 'DELIVER_RUBRIC':
        if (typeof data === 'string') {
          blueprintDoc.deliverables.rubric.criteria = [{
            criterion: 'Quality',
            description: data,
            weight: 100
          }];
        } else {
          blueprintDoc.deliverables.rubric = data;
        }
        break;
      case 'DELIVER_IMPACT':
        if (typeof data === 'string') {
          blueprintDoc.deliverables.impact.audience = data;
        } else {
          blueprintDoc.deliverables.impact = data;
        }
        break;
        
      default:
        console.warn(`No handler for step: ${currentStep}`);
    }

    this.updateState({ blueprintDoc });
    
    // Commit the revision
    revisionService.commitRevision(this.blueprintDoc);
  }

  completeWizard(data: WizardData): void {
    // Update wizard data in blueprint
    this.state.blueprintDoc.wizard = {
      vision: data.alfFocus || 'balanced',
      subject: data.subject,
      students: data.gradeLevel,
      scope: data.duration.includes('week') ? 'unit' : 'course'
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
      'WIZARD_LOCATION', 'WIZARD_RESOURCES', 'WIZARD_SCOPE',
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
    firebaseService.saveBlueprint(this.blueprintId, this.state.blueprintDoc)
      .catch(error => {
        console.error('Failed to save blueprint:', error);
      });
  }
  
  private autoSave(): void {
    // Use debounced auto-save to avoid too many writes
    firebaseService.autoSave(this.blueprintId, this.state.blueprintDoc);
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
    // Clear listeners
    this.stateChangeListeners = [];
    
    // Stop auto-save
    this.autoSaveEnabled = false;
    
    // Clean up Firebase service
    firebaseService.destroy();
  }

  // ============= EXPORT =============
  exportBlueprint(): BlueprintDoc {
    return { ...this.state.blueprintDoc };
  }

  /**
   * Update blueprint with partial data
   */
  updateBlueprint(updates: Partial<BlueprintDoc>): void {
    // Start a new revision
    revisionService.startRevision(this.blueprintId, 'Manual edit from blueprint viewer');
    
    // Track changes before applying them
    const oldBlueprint = JSON.parse(JSON.stringify(this.blueprintDoc));
    
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
    revisionService.commitRevision(this.blueprintDoc);
    
    this.notifyListeners();
    
    // Save to Firebase
    this.saveToFirebase();
  }
}