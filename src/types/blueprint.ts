/**
 * Comprehensive TypeScript interfaces for blueprint data structures
 * Created to resolve type safety issues identified in quality audit
 */

// Base interfaces for project data structures
export interface WizardData {
  projectTopic: string;
  learningGoals: string;
  entryPoint: 'learning_goal' | 'authentic_problem' | 'creative_challenge';
  subjects: string[];
  primarySubject: string;
  gradeLevel: 'early-elementary' | 'elementary' | 'middle' | 'high' | 'upper-secondary';
  duration: 'short' | 'medium' | 'long';
  materials?: string;
  subject: string;
  location?: string;
  featured?: boolean;
  communityPartners?: string[];
  // Legacy fields for backward compatibility
  ageGroup?: string;
  motivation?: string;
  scope?: string;
}

export interface StudentVoice {
  drivingQuestions: string[];
  choicePoints: string[];
}

export interface IdeationData {
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
  studentVoice?: StudentVoice;
}

// Journey phase and activity structures
export interface PhaseInterdisciplinary {
  science?: string;
  mathematics?: string;
  socialStudies?: string;
  languageArts?: string;
  arts?: string;
  technology?: string;
}

export interface JourneyPhase {
  id: string;
  name: string;
  description?: string;
  goal: string;
  activity: string;
  output: string;
  duration: string;
  interdisciplinary?: PhaseInterdisciplinary;
}

export interface Activity {
  id: string;
  name: string;
  phaseId: string;
  description?: string;
  duration?: string;
}

export interface Resource {
  name: string;
  type?: string;
  url?: string;
  description?: string;
}

// Assessment and deliverables structures
export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  levels?: string[];
}

export interface Rubric {
  criteria: RubricCriterion[];
  scale?: string[];
  type?: 'analytical' | 'holistic' | 'single-point';
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
}

export interface ImpactData {
  audience: string;
  method?: string;
  timeline?: string;
  measures?: string[];
}

export interface Deliverables {
  milestones?: Milestone[];
  rubric?: Rubric;
  impact?: ImpactData;
  assessmentStrategy?: string;
}

// Main journey data structure
export interface JourneyData {
  phases?: JourneyPhase[];
  activities?: Activity[];
  resources?: Resource[];
  deliverables?: Deliverables;
  // Legacy structure support (backward compatibility)
  investigate?: JourneyPhase;
  strategize?: JourneyPhase;
  implement?: JourneyPhase;
  advocate?: JourneyPhase;
  analyze?: JourneyPhase;
  brainstorm?: JourneyPhase;
  prototype?: JourneyPhase;
  evaluate?: JourneyPhase;
}

// Standards alignment structures
export interface StandardAlignment {
  framework: 'NGSS' | 'CCSS-ELA' | 'CCSS-Math' | 'C3' | 'NVAS' | 'ISTE';
  standardId: string;
  description: string;
  alignment: 'primary' | 'secondary';
  evidence?: string;
}

export interface StandardsFramework {
  alignments: StandardAlignment[];
  gradeLevel: string;
  totalStandards: number;
  coverage: {
    science?: number;
    mathematics?: number;
    ela?: number;
    socialStudies?: number;
    arts?: number;
  };
}

// Enhanced sample blueprint type (extends base SampleBlueprint)
export interface EnhancedBlueprintDoc {
  id: string;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  wizardData: WizardData;
  ideation?: IdeationData;
  journey?: JourneyData;
  journeyData?: JourneyData; // Alias for backward compatibility
  deliverables?: Deliverables;
  sample?: boolean;
  assignments?: any[];
  alignment?: StandardsFramework;
  featured?: boolean;
  // Chat and state data
  chatHistory?: ChatMessage[];
  conversationState?: any;
  contextCompleteness?: {
    coreCompleteness: number;
    contextCompleteness: number;
    progressiveCompleteness: number;
    lastUpdated: Date;
  };
}

// Chat message interface (from useBlueprintDoc)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// For environment variables type safety
export interface ImportMetaEnv {
  VITE_ENABLE_DOWNLOADS?: string;
  VITE_PDF_EXPORT_ENABLED?: string;
  VITE_ENVIRONMENT?: string;
}

export interface ImportMeta {
  env: ImportMetaEnv;
}

// Type guards for runtime type checking
export function isEnhancedBlueprintDoc(obj: any): obj is EnhancedBlueprintDoc {
  return obj && 
         typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.wizardData === 'object';
}

export function hasJourneyData(blueprint: EnhancedBlueprintDoc): boolean {
  return !!(blueprint.journey || blueprint.journeyData);
}

export function getJourneyData(blueprint: EnhancedBlueprintDoc): JourneyData | undefined {
  return blueprint.journeyData || blueprint.journey;
}

// Helper functions for data transformation
export function transformLegacyJourney(journey: any): JourneyData {
  if (!journey) return {};
  
  // If it's already the new format
  if (journey.phases && Array.isArray(journey.phases)) {
    return journey as JourneyData;
  }
  
  // Transform legacy format to new format
  const phases: JourneyPhase[] = [];
  
  // Map legacy phase names to new format
  const legacyPhases = ['investigate', 'strategize', 'implement', 'advocate', 'analyze', 'brainstorm', 'prototype', 'evaluate'];
  
  legacyPhases.forEach((phaseName, index) => {
    if (journey[phaseName]) {
      const phase = journey[phaseName];
      phases.push({
        id: `phase-${index + 1}`,
        name: phase.goal || phaseName,
        description: phase.activity || '',
        goal: phase.goal || '',
        activity: phase.activity || '',
        output: phase.output || '',
        duration: phase.duration || '',
        interdisciplinary: phase.interdisciplinary
      });
    }
  });
  
  return {
    phases,
    activities: [],
    resources: [],
    ...journey
  };
}

// Export type for backward compatibility with existing code
export type SampleBlueprint = EnhancedBlueprintDoc;