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

// Main wizard data schema - streamlined version
export const wizardSchema = z.object({
  // Step 1: Entry & Vision (REQUIRED)
  entryPoint: z.nativeEnum(EntryPoint),
  vision: z.string().min(20, 'Vision must be at least 20 characters'),
  drivingQuestion: z.string().optional(), // Auto-generated or user-provided
  
  // Step 2: Context (ALL OPTIONAL with smart defaults)
  subjects: z.array(z.string()).optional().default([]),
  primarySubject: z.string().optional(), // First selected subject is primary
  gradeLevel: z.string().optional().default('6-8'), // Default to middle school
  duration: z.enum(['short', 'medium', 'long']).optional().default('medium'),
  specialRequirements: z.string().optional(), // Renamed from materials/constraints
  
  // Step 3: Experience & Launch
  pblExperience: z.nativeEnum(PBLExperience),
  specialConsiderations: z.string().optional(), // Open text for any special needs
  
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
  vision: '',
  drivingQuestion: undefined,
  subjects: [],
  primarySubject: undefined,
  gradeLevel: '6-8',
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

// Grade level bands for UI
export const GRADE_BANDS = [
  { id: 'k-2', name: 'K-2', range: 'Primary' },
  { id: '3-5', name: '3-5', range: 'Elementary' },
  { id: '6-8', name: '6-8', range: 'Middle School' },
  { id: '9-12', name: '9-12', range: 'High School' },
  { id: 'college', name: 'College', range: 'Higher Ed' }
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
    case 1: // Entry & Vision
      if (!data.vision || data.vision.length < 20) {
        errors.push('Vision statement must be at least 20 characters');
      }
      break;
    case 2: // Context (all optional)
      // No validation needed - all fields optional
      break;
    case 3: // Experience
      if (!data.pblExperience) {
        errors.push('Please select your PBL experience level');
      }
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

// Check if wizard is minimally complete
export function isWizardComplete(data: Partial<WizardData>): boolean {
  return !!(data.vision && data.pblExperience);
}

// Generate driving question suggestions based on vision
export function generateDrivingQuestionSuggestions(vision: string): string[] {
  const suggestions: string[] = [];
  
  // Simple keyword-based suggestions (would be AI-enhanced in production)
  if (vision.toLowerCase().includes('climate') || vision.toLowerCase().includes('environment')) {
    suggestions.push('How can we reduce our carbon footprint in our community?');
    suggestions.push('What sustainable solutions can we create for local environmental challenges?');
  }
  
  if (vision.toLowerCase().includes('technology') || vision.toLowerCase().includes('digital')) {
    suggestions.push('How can technology solve real problems in our community?');
    suggestions.push('What digital tools can we create to improve daily life?');
  }
  
  if (vision.toLowerCase().includes('community') || vision.toLowerCase().includes('social')) {
    suggestions.push('How can we strengthen connections in our community?');
    suggestions.push('What can we create to address local social challenges?');
  }
  
  // Default suggestions if no keywords match
  if (suggestions.length === 0) {
    suggestions.push('How might we create positive change in our community?');
    suggestions.push('What innovative solutions can we develop for real-world problems?');
    suggestions.push('How can we use our learning to make a meaningful impact?');
  }
  
  return suggestions;
}