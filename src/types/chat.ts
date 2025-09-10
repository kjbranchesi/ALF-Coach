/**
 * ALF Coach Chat Types
 * Types for the chatbot wizard flow and state management
 */

import type { Project, ID, PartialProject } from './alf';

// Slot types for form inputs
export type SlotType = 'string' | 'number' | 'date' | 'enum' | 'multi' | 'boolean';

// Chat input slots
export interface ChatSlot {
  name: string;                 // e.g., 'classSize'
  label: string;                // Display label
  type: SlotType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  enumValues?: string[];        // For enum type
  multiOptions?: string[];      // For multi-select
  min?: number;                 // For number type
  max?: number;                 // For number type
  validate?(value: unknown): string | null; // Return error or null
}

// Chat step in the flow
export interface ChatStep {
  id: ID;
  title: string;
  subtitle?: string;
  systemPrompt?: string;        // LLM instruction for this step
  userPromptTemplate?: string;  // Template for user-facing prompt
  collects: ChatSlot[];         // Inputs gathered in this step
  produces?: string[];          // Project paths updated (e.g., ['context.grade'])
  skipCondition?(project: PartialProject): boolean; // Skip if true
  next?(project: PartialProject): ID; // Dynamic next step
  validation?: {
    minInputs?: number;
    maxInputs?: number;
    customValidation?(inputs: Record<string, unknown>): string | null;
  };
}

// 9-step flow definition
export interface ChatFlow {
  id: ID;
  name: string;
  description?: string;
  steps: ChatStep[];
  startStepId: ID;
  version: string;
}

// Current chat state
export interface ChatState {
  flowId: ID;
  currentStepId: ID;
  project: PartialProject;
  answers: Record<string, unknown>;
  completedStepIds: ID[];
  skippedStepIds?: ID[];
  validationErrors?: Record<string, string>;
  conversationHistory?: ChatMessage[];
  metadata?: {
    startedAt: string;
    lastUpdated: string;
    completionPercentage: number;
  };
}

// Chat messages
export interface ChatMessage {
  id: ID;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  stepId?: ID;
  metadata?: {
    edited?: boolean;
    error?: boolean;
    retryCount?: number;
  };
}

// Step completion status
export interface StepStatus {
  stepId: ID;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'error';
  startedAt?: string;
  completedAt?: string;
  data?: Record<string, unknown>;
  errors?: string[];
}

// Navigation action
export interface NavigationAction {
  type: 'next' | 'back' | 'jump' | 'skip' | 'restart';
  targetStepId?: ID;
  saveProgress?: boolean;
}

// The 9-step flow configuration
export const NINE_STEP_FLOW: ChatStep[] = [
  {
    id: 'project_intake',
    title: 'Project Context',
    subtitle: 'Tell us about your classroom',
    collects: [
      {
        name: 'grade',
        label: 'Grade Level/Age Group',
        type: 'string',
        required: true,
        placeholder: 'e.g., 8th grade, Ages 13-14'
      },
      {
        name: 'subjects',
        label: 'Subject Areas',
        type: 'multi',
        required: true,
        multiOptions: ['Science', 'Math', 'ELA', 'Social Studies', 'Arts', 'Technology', 'World Languages', 'PE/Health']
      },
      {
        name: 'classSize',
        label: 'Class Size',
        type: 'number',
        required: false,
        min: 1,
        max: 100
      },
      {
        name: 'schedule',
        label: 'Schedule Type',
        type: 'enum',
        required: false,
        enumValues: ['traditional', 'block', 'hybrid', 'flexible']
      },
      {
        name: 'techAccess',
        label: 'Technology Access',
        type: 'enum',
        required: false,
        enumValues: ['full', 'limited', 'minimal', 'none']
      }
    ],
    produces: ['context']
  },
  {
    id: 'goals_eq',
    title: 'Learning Goals & Essential Question',
    subtitle: 'What do you want students to learn and explore?',
    collects: [
      {
        name: 'learningGoals',
        label: 'Learning Goals',
        type: 'string',
        required: true,
        placeholder: 'What should students know and be able to do?',
        helpText: 'Be specific about knowledge and skills'
      },
      {
        name: 'bigIdea',
        label: 'Big Idea',
        type: 'string',
        required: true,
        placeholder: 'What\'s the overarching concept?'
      }
    ],
    produces: ['learningGoals', 'bigIdea', 'essentialQuestion']
  },
  {
    id: 'standards_alignment',
    title: 'Standards Alignment',
    subtitle: 'Which standards will this project address?',
    collects: [
      {
        name: 'framework',
        label: 'Standards Framework',
        type: 'enum',
        required: true,
        enumValues: ['NGSS', 'CCSS-ELA', 'CCSS-MATH', 'STATE', 'IB', 'CUSTOM']
      },
      {
        name: 'standardCodes',
        label: 'Specific Standards',
        type: 'string',
        required: false,
        placeholder: 'e.g., MS-ESS3-3, CCSS.ELA-LITERACY.RST.6-8.1',
        helpText: 'Enter standard codes or descriptions'
      }
    ],
    produces: ['standards', 'standardsCoverage']
  },
  {
    id: 'phases_milestones',
    title: 'Project Phases & Milestones',
    subtitle: 'How will the project unfold over time?',
    collects: [
      {
        name: 'duration',
        label: 'Project Duration',
        type: 'enum',
        required: true,
        enumValues: ['2-3 weeks', '4-6 weeks', '6-8 weeks', 'Quarter', 'Semester']
      },
      {
        name: 'phases',
        label: 'Key Phases',
        type: 'multi',
        required: false,
        multiOptions: ['Discover', 'Research', 'Plan', 'Create', 'Test', 'Refine', 'Share', 'Reflect']
      }
    ],
    produces: ['phases', 'milestones']
  },
  {
    id: 'artifacts_rubrics',
    title: 'Deliverables & Assessment',
    subtitle: 'What will students create and how will you assess it?',
    collects: [
      {
        name: 'mainArtifact',
        label: 'Main Project Deliverable',
        type: 'string',
        required: true,
        placeholder: 'e.g., Documentary video, Research paper, Prototype'
      },
      {
        name: 'assessmentFocus',
        label: 'Assessment Priorities',
        type: 'multi',
        required: true,
        multiOptions: ['Content Knowledge', 'Critical Thinking', 'Collaboration', 'Communication', 'Creativity']
      }
    ],
    produces: ['artifacts', 'rubrics']
  },
  {
    id: 'roles_differentiation',
    title: 'Student Roles & Differentiation',
    subtitle: 'How will you support diverse learners?',
    collects: [
      {
        name: 'useRoles',
        label: 'Use Student Roles?',
        type: 'boolean',
        required: true
      },
      {
        name: 'specialPopulations',
        label: 'Special Considerations',
        type: 'multi',
        required: false,
        multiOptions: ['IEP', '504', 'ELL', 'Gifted', 'Other']
      },
      {
        name: 'differentiationNeeds',
        label: 'Differentiation Priorities',
        type: 'string',
        required: false,
        placeholder: 'Describe specific needs or strategies'
      }
    ],
    produces: ['roles', 'differentiation', 'scaffolds']
  },
  {
    id: 'outreach_exhibition',
    title: 'Community & Exhibition',
    subtitle: 'How will students share their work?',
    collects: [
      {
        name: 'exhibitionFormat',
        label: 'Exhibition Format',
        type: 'enum',
        required: true,
        enumValues: ['gallery', 'pitch', 'panel', 'festival', 'online', 'other']
      },
      {
        name: 'audience',
        label: 'Target Audience',
        type: 'multi',
        required: true,
        multiOptions: ['Parents', 'Community', 'Experts', 'Peers', 'Younger Students', 'Online']
      },
      {
        name: 'communityPartners',
        label: 'Community Partners',
        type: 'string',
        required: false,
        placeholder: 'List any external partners or experts'
      }
    ],
    produces: ['exhibition', 'communications']
  },
  {
    id: 'evidence_logistics',
    title: 'Evidence & Planning',
    subtitle: 'How will you document and manage the project?',
    collects: [
      {
        name: 'evidenceTypes',
        label: 'Evidence to Collect',
        type: 'multi',
        required: true,
        multiOptions: ['Photos', 'Videos', 'Documents', 'Reflections', 'Observations', 'Portfolios']
      },
      {
        name: 'storageLocation',
        label: 'Storage Location',
        type: 'enum',
        required: false,
        enumValues: ['Google Drive', 'OneDrive', 'LMS', 'Physical', 'Other']
      },
      {
        name: 'permissions',
        label: 'Permission Needs',
        type: 'multi',
        required: false,
        multiOptions: ['Photo Release', 'Field Trip', 'Guest Speaker', 'Internet Use', 'Recording']
      }
    ],
    produces: ['evidencePlan', 'checkpoints']
  },
  {
    id: 'review_export',
    title: 'Review & Finalize',
    subtitle: 'Review your project and generate materials',
    collects: [
      {
        name: 'projectTitle',
        label: 'Project Title',
        type: 'string',
        required: true,
        placeholder: 'Give your project a memorable name'
      },
      {
        name: 'readyToGenerate',
        label: 'Ready to Generate Materials?',
        type: 'boolean',
        required: true
      }
    ],
    produces: ['title', 'description']
  }
];

// Flow configuration
export const WIZARD_CHAT_FLOW: ChatFlow = {
  id: 'wizard_flow_v3',
  name: 'PBL Project Wizard',
  description: '9-step flow to create comprehensive PBL projects',
  steps: NINE_STEP_FLOW,
  startStepId: 'project_intake',
  version: '3.0.0'
};

// Helper functions for chat flow
export function getStepById(stepId: ID, flow: ChatFlow = WIZARD_CHAT_FLOW): ChatStep | undefined {
  return flow.steps.find(step => step.id === stepId);
}

export function getNextStep(currentStepId: ID, project: PartialProject, flow: ChatFlow = WIZARD_CHAT_FLOW): ChatStep | undefined {
  const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex === flow.steps.length - 1) {
    return undefined;
  }
  
  const currentStep = flow.steps[currentIndex];
  
  // Check for dynamic next step
  if (currentStep.next) {
    const nextStepId = currentStep.next(project);
    return getStepById(nextStepId, flow);
  }
  
  // Default to next step in sequence
  let nextStep = flow.steps[currentIndex + 1];
  
  // Skip steps that don't apply
  while (nextStep && nextStep.skipCondition && nextStep.skipCondition(project)) {
    const nextIndex = flow.steps.indexOf(nextStep) + 1;
    if (nextIndex >= flow.steps.length) {
      return undefined;
    }
    nextStep = flow.steps[nextIndex];
  }
  
  return nextStep;
}

export function getPreviousStep(currentStepId: ID, flow: ChatFlow = WIZARD_CHAT_FLOW): ChatStep | undefined {
  const currentIndex = flow.steps.findIndex(step => step.id === currentStepId);
  if (currentIndex <= 0) {
    return undefined;
  }
  return flow.steps[currentIndex - 1];
}

export function calculateProgress(completedStepIds: ID[], flow: ChatFlow = WIZARD_CHAT_FLOW): number {
  const totalSteps = flow.steps.length;
  const completedSteps = completedStepIds.length;
  return Math.round((completedSteps / totalSteps) * 100);
}