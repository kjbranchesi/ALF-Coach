/**
 * Wizard Data Schema - Streamlined 3-Step Flow
 * Based on PBL Expert recommendations for minimal friction onboarding
 */

import { z } from 'zod';

// Entry point determines the conversation strategy
export enum EntryPoint {
  LEARNING_GOAL = 'learning_goal',    // Teacher has specific standards/objectives
  MATERIALS_FIRST = 'materials_first', // Teacher has resources to use
  EXPLORE = 'explore'                  // Teacher wants to browse possibilities
}

// PBL Experience determines guidance level
export enum PBLExperience {
  NEW = 'new',               // New to PBL - maximum scaffolding
  SOME = 'some',              // Some experience - moderate guidance
  EXPERIENCED = 'experienced' // Experienced - minimal scaffolding
}

// Conversation phases for smooth handoff
export enum ConversationPhase {
  WIZARD = 'wizard',                     // In wizard interface
  HANDOFF = 'handoff',                   // Transitioning to chat
  CONTEXT_GATHERING = 'context_gathering', // Progressively gathering context
  PROJECT_DESIGN = 'project_design',      // Designing the project
  REFINEMENT = 'refinement'               // Refining and iterating
}

// Context completeness tracking
export interface ContextCompleteness {
  core: number;        // 0-100: Required fields (vision)
  context: number;     // 0-100: Helpful fields (grade, duration, subject)
  progressive: number; // 0-100: Additional context gathered in conversation
}

// Main wizard data schema - PBL best practices aligned
export const wizardSchema = z.object({
  // Step 1: Entry & Project Focus (REQUIRED)
  entryPoint: z.nativeEnum(EntryPoint),
  problemContext: z.string().optional(), // Real-world problem context ID
  projectTopic: z.string().min(20, 'Project topic must be at least 20 characters'),
  learningGoals: z.string().min(20, 'Learning goals must be at least 20 characters'),
  materials: z.string().optional(), // For 'I have materials' entry point
  subjectConnections: z.array(z.object({
    subjects: z.array(z.string()),
    rationale: z.string(),
    connectionType: z.enum(['natural', 'surprising', 'powerful'])
  })).optional(), // Track why subjects were connected
  
  // Step 2: Essential Context (REQUIRED for meaningful guidance)
  subjects: z.array(z.string()).min(1, 'Select at least one subject area'),
  primarySubject: z.string(), // Primary subject for focus
  gradeLevel: z.string().min(1, 'Grade level is required for appropriate scaffolding'),
  duration: z.enum(['short', 'medium', 'long']),
  specialRequirements: z.string().optional(), // Optional materials/constraints
  
  // Step 3: Experience & Launch (REQUIRED for guidance level)
  pblExperience: z.nativeEnum(PBLExperience),
  specialConsiderations: z.string().optional(), // Optional special needs
  
  // Metadata for tracking
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    lastModified: z.date().default(() => new Date()),
    version: z.literal('2.0').default('2.0'),
    migrationApplied: z.boolean().optional(),
    wizardCompleted: z.boolean().default(false),
    skippedFields: z.array(z.string()).default([])
  }).default({}),
  
  // Conversation state tracking
  conversationState: z.object({
    phase: z.nativeEnum(ConversationPhase).default(ConversationPhase.WIZARD),
    contextCompleteness: z.object({
      core: z.number().min(0).max(100).default(0),
      context: z.number().min(0).max(100).default(0),
      progressive: z.number().min(0).max(100).default(0)
    }).default({
      core: 0,
      context: 0,
      progressive: 0
    }),
    gatheredContext: z.record(z.any()).optional(), // Additional context from chat
    lastContextUpdate: z.date().optional()
  }).default({
    phase: ConversationPhase.WIZARD,
    contextCompleteness: { core: 0, context: 0, progressive: 0 }
  })
});

export type WizardData = z.infer<typeof wizardSchema>;

// Default wizard data for initialization
export const defaultWizardData: WizardData = {
  entryPoint: EntryPoint.LEARNING_GOAL,
  problemContext: undefined,
  projectTopic: '',
  learningGoals: '',
  materials: '',
  subjectConnections: undefined,
  subjects: [],
  primarySubject: '',
  gradeLevel: '',
  duration: 'medium',
  specialRequirements: undefined,
  pblExperience: PBLExperience.SOME,
  specialConsiderations: undefined,
  metadata: {
    createdAt: new Date(),
    lastModified: new Date(),
    version: '2.0',
    migrationApplied: false,
    wizardCompleted: false,
    skippedFields: []
  },
  conversationState: {
    phase: ConversationPhase.WIZARD,
    contextCompleteness: {
      core: 0,
      context: 0,
      progressive: 0
    },
    gatheredContext: {},
    lastContextUpdate: undefined
  }
};

// Duration descriptions for UI
export const DURATION_INFO = {
  short: {
    label: 'Short',
    description: '2-3 weeks',
    details: 'Mini-projects, skill builders'
  },
  medium: {
    label: 'Medium', 
    description: '4-8 weeks',
    details: 'Standard PBL units'
  },
  long: {
    label: 'Long',
    description: 'Semester',
    details: 'Comprehensive, multi-phase projects'
  }
};

// International Age Groups - more inclusive than US-centric grades
export const GRADE_BANDS = [
  { 
    id: 'early-elementary', 
    name: 'Early Elementary', 
    range: 'Ages 5-7',
    examples: 'K-2 • Reception • Foundation'
  },
  { 
    id: 'elementary', 
    name: 'Elementary', 
    range: 'Ages 8-10',
    examples: 'Grades 3-5 • Years 3-5 • Primary'
  },
  { 
    id: 'middle', 
    name: 'Middle Years', 
    range: 'Ages 11-13',
    examples: 'Grades 6-8 • Years 6-8 • Upper Primary'
  },
  { 
    id: 'secondary', 
    name: 'Secondary', 
    range: 'Ages 14-16',
    examples: 'Grades 9-10 • Years 9-11 • High School'
  },
  { 
    id: 'upper-secondary', 
    name: 'Upper Secondary', 
    range: 'Ages 17-18',
    examples: 'Grades 11-12 • A-Levels • IB'
  },
  { 
    id: 'higher-ed', 
    name: 'Higher Education', 
    range: 'Ages 18+',
    examples: 'University • College • Tertiary'
  },
  { 
    id: 'adult', 
    name: 'Adult/Professional', 
    range: 'Continuing Ed',
    examples: 'Professional Development'
  }
];

// Legacy field mapping for backward compatibility
export const legacyFieldMapping: Record<string, keyof WizardData> = {
  motivation: 'vision',
  ageGroup: 'gradeLevel',
  scope: 'duration',
  subject: 'primarySubject', // Single subject to primary
  initialIdeas: 'specialRequirements', // Consolidate into requirements
  materials: 'specialRequirements'
};

// Validation helpers
export function validateWizardStep(step: number, data: Partial<WizardData>): string[] {
  const errors: string[] = [];
  
  switch (step) {
    case 0: // Entry & Project Focus
      if (!data.projectTopic || data.projectTopic.length < 20) {
        errors.push('Please describe the topic or real-world problem (at least 20 characters)');
      }
      if (!data.learningGoals || data.learningGoals.length < 20) {
        errors.push('Please describe your learning goals (at least 20 characters)');
      }
      if (!data.entryPoint) {
        errors.push('Please select how you want to begin');
      }
      break;
    case 1: // Essential Context - Required for project completion
      if (!data.gradeLevel) {
        errors.push('Grade level is required for age-appropriate content');
      }
      if (!data.duration) {
        errors.push('Project duration helps us plan milestones');
      }
      // Subjects are optional - can be empty if user wants to explore contexts first
      break;
    case 2: // Legacy Experience step (now removed)
      // No validation needed - step removed
      break;
  }
  
  return errors;
}

// Calculate context completeness
export function calculateCompleteness(data: Partial<WizardData>): ContextCompleteness {
  const core = data.vision ? 100 : 0;
  
  const contextFields = ['subjects', 'gradeLevel', 'duration', 'specialRequirements'];
  const filledContext = contextFields.filter(field => data[field as keyof WizardData]).length;
  const context = (filledContext / contextFields.length) * 100;
  
  const progressiveFields = data.conversationState?.gatheredContext 
    ? Object.keys(data.conversationState.gatheredContext).length 
    : 0;
  const progressive = Math.min(progressiveFields * 10, 100); // Cap at 100%
  
  return { core, context, progressive };
}

// Check if wizard has all required fields
export function isWizardComplete(data: Partial<WizardData>): boolean {
  return !!(
    data.projectTopic && 
    data.projectTopic.length >= 20 &&
    data.learningGoals &&
    data.learningGoals.length >= 20 &&
    data.entryPoint &&
    data.subjects && 
    data.subjects.length > 0 &&
    data.gradeLevel &&
    data.duration &&
    data.pblExperience
  );
}

// Learning priority categories for checkboxes
export const LEARNING_PRIORITIES = [
  { id: 'content', label: 'Content Knowledge', description: 'Subject-specific facts and concepts' },
  { id: 'critical-thinking', label: 'Critical Thinking', description: 'Analysis, evaluation, problem-solving' },
  { id: 'collaboration', label: 'Collaboration', description: 'Teamwork and interpersonal skills' },
  { id: 'communication', label: 'Communication', description: 'Written, oral, and visual presentation' },
  { id: 'creativity', label: 'Creativity', description: 'Innovation and original thinking' },
  { id: 'research', label: 'Research Skills', description: 'Information literacy and investigation' },
  { id: 'self-management', label: 'Self-Management', description: 'Time management and organization' },
  { id: 'digital-literacy', label: 'Digital Literacy', description: 'Technology skills and digital citizenship' }
];