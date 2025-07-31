/**
 * SOPFlowManager.ts - Single source of truth for conversation flow
 * Implements exact SOP document specification
 */

import { 
  SOPFlowState, 
  SOPStage, 
  SOPStep, 
  ChipAction,
  ChatMessage,
  SuggestionCard,
  QuickReply,
  BlueprintDoc,
  SOP_SCHEMA_VERSION
} from './types/SOPTypes';

export class SOPFlowManager {
  private state: SOPFlowState;
  private stateChangeListeners: ((state: SOPFlowState) => void)[] = [];

  constructor(existingBlueprint?: BlueprintDoc) {
    this.state = this.initializeState(existingBlueprint);
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
      blueprintDoc: this.createEmptyBlueprint(),
      conversationHistory: [],
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
    this.notifyListeners();
  }

  private notifyListeners() {
    this.stateChangeListeners.forEach(listener => listener(this.getState()));
  }

  // ============= STEP DETECTION =============
  private detectCurrentStage(blueprint: BlueprintDoc): SOPStage {
    if (blueprint.deliverables.impact.method) return 'COMPLETED';
    if (blueprint.deliverables.milestones.length > 0) return 'DELIVERABLES';
    if (blueprint.journey.phases.length > 0) return 'JOURNEY';
    if (blueprint.ideation.bigIdea) return 'IDEATION';
    return 'WIZARD';
  }

  private detectCurrentStep(blueprint: BlueprintDoc): SOPStep {
    // This would be more sophisticated in production
    const stage = this.detectCurrentStage(blueprint);
    switch (stage) {
      case 'WIZARD':
        if (!blueprint.wizard.vision) return 'WIZARD_VISION';
        if (!blueprint.wizard.subject) return 'WIZARD_SUBJECT';
        if (!blueprint.wizard.students) return 'WIZARD_STUDENTS';
        return 'WIZARD_SCOPE';
      case 'IDEATION':
        if (!blueprint.ideation.bigIdea) return 'IDEATION_BIG_IDEA';
        if (!blueprint.ideation.essentialQuestion) return 'IDEATION_EQ';
        if (!blueprint.ideation.challenge) return 'IDEATION_CHALLENGE';
        return 'IDEATION_CLARIFIER';
      case 'JOURNEY':
        if (blueprint.journey.phases.length === 0) return 'JOURNEY_PHASES';
        if (blueprint.journey.activities.length === 0) return 'JOURNEY_ACTIVITIES';
        if (blueprint.journey.resources.length === 0) return 'JOURNEY_RESOURCES';
        return 'JOURNEY_CLARIFIER';
      case 'DELIVERABLES':
        if (blueprint.deliverables.milestones.length === 0) return 'DELIVER_MILESTONES';
        if (blueprint.deliverables.rubric.criteria.length === 0) return 'DELIVER_RUBRIC';
        if (!blueprint.deliverables.impact.audience) return 'DELIVER_IMPACT';
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
      // Add more cases as needed
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
      this.updateState({
        currentStep: nextStep,
        currentStage: this.getStageForStep(nextStep)
      });
    }
  }

  private getNextStep(): SOPStep | null {
    const stepOrder: SOPStep[] = [
      // Wizard
      'WIZARD_VISION', 'WIZARD_SUBJECT', 'WIZARD_STUDENTS', 
      'WIZARD_LOCATION', 'WIZARD_RESOURCES', 'WIZARD_SCOPE',
      // Ideation
      'IDEATION_INTRO', 'IDEATION_BIG_IDEA', 'IDEATION_EQ', 
      'IDEATION_CHALLENGE', 'IDEATION_CLARIFIER',
      // Journey
      'JOURNEY_INTRO', 'JOURNEY_PHASES', 'JOURNEY_ACTIVITIES',
      'JOURNEY_RESOURCES', 'JOURNEY_CLARIFIER',
      // Deliverables
      'DELIVERABLES_INTRO', 'DELIVER_MILESTONES', 'DELIVER_RUBRIC',
      'DELIVER_IMPACT', 'DELIVERABLES_CLARIFIER',
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
    if (step.startsWith('WIZARD')) return 'WIZARD';
    if (step.startsWith('IDEATION')) return 'IDEATION';
    if (step.startsWith('JOURNEY')) return 'JOURNEY';
    if (step.startsWith('DELIVER')) return 'DELIVERABLES';
    return 'COMPLETED';
  }

  // ============= DATA MANAGEMENT =============
  updateStepData(data: any): void {
    const { currentStep, blueprintDoc } = this.state;
    
    switch (currentStep) {
      case 'WIZARD_VISION':
        blueprintDoc.wizard.vision = data;
        break;
      case 'WIZARD_SUBJECT':
        blueprintDoc.wizard.subject = data;
        break;
      case 'WIZARD_STUDENTS':
        blueprintDoc.wizard.students = data;
        break;
      case 'IDEATION_BIG_IDEA':
        blueprintDoc.ideation.bigIdea = data;
        break;
      case 'IDEATION_EQ':
        blueprintDoc.ideation.essentialQuestion = data;
        break;
      case 'IDEATION_CHALLENGE':
        blueprintDoc.ideation.challenge = data;
        break;
      // Add more cases as needed
    }

    this.updateState({ blueprintDoc });
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
    
    // Clarifiers allow continue, refine, edit
    if (currentStep.endsWith('_CLARIFIER')) {
      return ['continue', 'refine', 'edit'].includes(action);
    }
    
    // Sub-steps allow ideas, whatif, help
    return ['ideas', 'whatif', 'help'].includes(action);
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
    const totalSteps = 21; // Total steps in SOP
    const completedSteps = this.calculateCompletedSteps();
    
    return {
      percentage: Math.round((completedSteps / totalSteps) * 100),
      currentStepNumber: completedSteps + 1,
      totalSteps
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

  // ============= EXPORT =============
  exportBlueprint(): BlueprintDoc {
    return { ...this.state.blueprintDoc };
  }
}