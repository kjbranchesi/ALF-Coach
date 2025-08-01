/**
 * SOPTypes.ts - Single source of truth for ALF Coach data types
 * Based on the official SOP document structure
 */

// ============= WIZARD TYPES =============
export interface WizardData {
  vision: string;
  subject: string;
  students: string;
  location?: string;
  resources?: string;
  scope: 'lesson' | 'unit' | 'course';
}

// ============= STAGE DATA TYPES =============
export interface IdeationData {
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
}

export interface JourneyPhase {
  title: string;
  description: string;
}

export interface JourneyData {
  phases: JourneyPhase[];
  activities: string[];
  resources: string[];
}

export interface RubricCriteria {
  criterion: string;
  description: string;
  weight: number;
}

export interface DeliverablesData {
  milestones: string[];
  rubric: {
    criteria: RubricCriteria[];
  };
  impact: {
    audience: string;
    method: string;
  };
}

// ============= BLUEPRINT DOCUMENT =============
export interface BlueprintDoc {
  id?: string;
  wizard: WizardData;
  ideation: IdeationData;
  journey: JourneyData;
  deliverables: DeliverablesData;
  timestamps: {
    created: Date;
    updated: Date;
  };
  schemaVersion: string;
}

// ============= SOP FLOW TYPES =============
export type SOPStage = 'WIZARD' | 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETED';

export type SOPStep = 
  // Wizard steps
  | 'WIZARD_VISION'
  | 'WIZARD_SUBJECT' 
  | 'WIZARD_STUDENTS'
  | 'WIZARD_LOCATION'
  | 'WIZARD_RESOURCES'
  | 'WIZARD_SCOPE'
  // Ideation steps
  | 'IDEATION_INTRO'
  | 'IDEATION_BIG_IDEA'
  | 'IDEATION_EQ'
  | 'IDEATION_CHALLENGE'
  | 'IDEATION_CLARIFIER'
  // Journey steps
  | 'JOURNEY_INTRO'
  | 'JOURNEY_PHASES'
  | 'JOURNEY_ACTIVITIES'
  | 'JOURNEY_RESOURCES'
  | 'JOURNEY_CLARIFIER'
  // Deliverables steps
  | 'DELIVERABLES_INTRO'
  | 'DELIVER_MILESTONES'
  | 'DELIVER_RUBRIC'
  | 'DELIVER_IMPACT'
  | 'DELIVERABLES_CLARIFIER'
  // Final
  | 'COMPLETED';

// ============= CONVERSATION TYPES =============
export type ChipAction = 'ideas' | 'whatif' | 'help' | 'continue' | 'refine' | 'edit' | 'proceed';

export interface QuickReply {
  label: string;
  action: ChipAction;
}

export interface SuggestionCard {
  id: string;
  text: string;
  category: 'idea' | 'whatif';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: SuggestionCard[];
  quickReplies?: QuickReply[];
  timestamp: Date;
}

// ============= STATE MACHINE TYPES =============
export interface SOPFlowState {
  currentStage: SOPStage;
  currentStep: SOPStep;
  stageStep?: number;
  blueprintDoc: BlueprintDoc;
  conversationHistory: ChatMessage[];
  messages?: ChatMessage[];
  allowedActions?: ChipAction[];
  isTransitioning: boolean;
  error?: string;
}

// ============= VALIDATION TYPES =============
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

// ============= METADATA =============
export const SOP_SCHEMA_VERSION = '1.0';

export const STAGE_METADATA: Record<SOPStage, { title: string; description: string }> = {
  WIZARD: { 
    title: 'Project Setup', 
    description: 'Tell us about your learning goals' 
  },
  IDEATION: { 
    title: 'Ideation', 
    description: 'Shape the big idea and challenge' 
  },
  JOURNEY: { 
    title: 'Learning Journey', 
    description: 'Design the learning experience' 
  },
  DELIVERABLES: { 
    title: 'Student Deliverables', 
    description: 'Define outcomes and assessment' 
  },
  COMPLETED: { 
    title: 'Completed', 
    description: 'Your blueprint is ready!' 
  }
};