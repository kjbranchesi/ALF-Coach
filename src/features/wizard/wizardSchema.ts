/**
 * Wizard Data Schema - Streamlined 3-Step Flow
 * Based on PBL Expert recommendations for minimal friction onboarding
 */

import { z } from 'zod';
import {
  evaluateWizardCompleteness,
  type WizardCompletenessResult
} from '../../utils/completeness/wizardCompleteness';

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

// ==================== V3 SCHEMA EXTENSIONS ====================
// Based on gap analysis for hero project quality output

// Content tier labeling for transparency
export enum ContentTier {
  CORE = 'core',           // ALF-generated content
  SCAFFOLD = 'scaffold',   // Requires teacher input
  ASPIRATIONAL = 'aspirational' // Examples/inspiration
}

// Schedule types for context
export enum ScheduleType {
  TRADITIONAL = 'traditional', // 45-50 min periods
  BLOCK = 'block',             // 90+ min periods  
  HYBRID = 'hybrid',           // Mix of both
  FLEXIBLE = 'flexible'        // Self-paced/online
}

// Tech access levels
export enum TechAccess {
  FULL = 'full',         // 1:1 devices, reliable internet
  LIMITED = 'limited',   // Shared devices, some internet
  MINIMAL = 'minimal',   // Computer lab only
  NONE = 'none'          // No tech available
}

// Standards frameworks
export enum StandardsFramework {
  CCSS = 'CCSS',         // Common Core
  NGSS = 'NGSS',         // Next Gen Science
  STATE = 'STATE',       // State-specific
  IB = 'IB',             // International Baccalaureate
  CUSTOM = 'CUSTOM'      // School/district specific
}

// Project context schema
export const projectContextSchema = z.object({
  classSize: z.number().min(1).max(100).optional(),
  schedule: z.nativeEnum(ScheduleType).optional(),
  techAccess: z.nativeEnum(TechAccess).optional(),
  budget: z.number().optional(),
  specialPopulations: z.array(z.string()).optional(), // IEP, 504, ELL, GT
  constraints: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  communityPartners: z.array(z.string()).optional()
});

// Standards alignment schema
export const standardsAlignmentSchema = z.object({
  framework: z.nativeEnum(StandardsFramework),
  standards: z.array(z.object({
    code: z.string(),
    description: z.string(),
    rationale: z.string(),
    tier: z.nativeEnum(ContentTier).default(ContentTier.CORE)
  }))
});

// Assessment rubric schema
export const rubricSchema = z.object({
  name: z.string(),
  criteria: z.array(z.object({
    criterion: z.string(),
    weight: z.number(),
    levels: z.object({
      exemplary: z.string(),
      proficient: z.string(),
      developing: z.string(),
      beginning: z.string()
    }),
    standardsAlignment: z.array(z.string()).optional(),
    tier: z.nativeEnum(ContentTier).default(ContentTier.CORE)
  })),
  totalPoints: z.number().optional(),
  useStudentLanguage: z.boolean().default(false)
});

// Artifact/deliverable schema
export const artifactSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  milestone: z.string(),
  rubricId: z.string().optional(),
  exemplar: z.string().optional(),
  tier: z.nativeEnum(ContentTier).default(ContentTier.CORE)
});

// Phase schema
export const phaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration: z.string(),
  goals: z.array(z.string()),
  activities: z.array(z.string()),
  deliverables: z.array(z.string()),
  checkpoints: z.array(z.string()),
  tier: z.nativeEnum(ContentTier).default(ContentTier.CORE)
});

// Milestone schema
export const milestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  phaseId: z.string(),
  dueDate: z.string().optional(),
  evidence: z.array(z.string()),
  owner: z.string().optional(),
  tier: z.nativeEnum(ContentTier).default(ContentTier.CORE)
});

// Differentiation schema
export const differentiationSchema = z.object({
  tieredAssignments: z.array(z.object({
    level: z.string(),
    modifications: z.array(z.string())
  })).optional(),
  udlStrategies: z.object({
    representation: z.array(z.string()),
    action: z.array(z.string()),
    engagement: z.array(z.string())
  }).optional(),
  languageSupports: z.array(z.string()).optional(),
  executiveFunctionSupports: z.array(z.string()).optional(),
  tier: z.nativeEnum(ContentTier).default(ContentTier.SCAFFOLD)
});

// Evidence capture plan
export const evidencePlanSchema = z.object({
  checkpoints: z.array(z.object({
    date: z.string(),
    type: z.string(),
    evidence: z.array(z.string()),
    storage: z.string()
  })),
  permissions: z.array(z.string()),
  dataManagement: z.string().optional()
});

// Risk management schema
export const riskManagementSchema = z.object({
  risks: z.array(z.object({
    risk: z.string(),
    likelihood: z.enum(['low', 'medium', 'high']),
    impact: z.enum(['low', 'medium', 'high']),
    mitigation: z.string()
  })),
  contingencies: z.array(z.object({
    scenario: z.string(),
    plan: z.string()
  })),
  timeCompression: z.object({
    minimal: z.string(),
    moderate: z.string(),
    significant: z.string()
  }).optional()
});

// Communications schema
export const communicationsSchema = z.object({
  family: z.object({
    letter: z.string(),
    updateSchedule: z.string().optional()
  }).optional(),
  admin: z.object({
    overview: z.string(),
    alignmentDoc: z.string().optional()
  }).optional(),
  partners: z.array(z.object({
    name: z.string(),
    role: z.string(),
    communication: z.string()
  })).optional()
});

// Exhibition schema
export const exhibitionSchema = z.object({
  format: z.string(),
  audience: z.array(z.string()),
  date: z.string().optional(),
  venue: z.string().optional(),
  preparation: z.array(z.string()),
  tier: z.nativeEnum(ContentTier).default(ContentTier.SCAFFOLD)
});

// V3 Extended Wizard Data Schema
export const wizardSchemaV3 = wizardSchema.extend({
  // New context fields
  projectContext: projectContextSchema.optional(),
  
  // Standards alignment
  standardsAlignment: standardsAlignmentSchema.optional(),
  
  // Project structure
  bigIdea: z.string().optional(),
  essentialQuestion: z.string().optional(),
  phases: z.array(phaseSchema).optional(),
  milestones: z.array(milestoneSchema).optional(),
  
  // Assessment
  artifacts: z.array(artifactSchema).optional(),
  rubrics: z.array(rubricSchema).optional(),
  
  // Differentiation
  differentiation: differentiationSchema.optional(),
  studentRoles: z.array(z.object({
    role: z.string(),
    responsibilities: z.array(z.string())
  })).optional(),
  
  // Evidence & logistics
  evidencePlan: evidencePlanSchema.optional(),
  riskManagement: riskManagementSchema.optional(),
  
  // Communications
  communications: communicationsSchema.optional(),
  exhibition: exhibitionSchema.optional(),
  
  // Metadata updates - properly merge the metadata schema
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    lastModified: z.date().default(() => new Date()),
    version: z.literal('3.0').default('3.0'),
    migrationApplied: z.boolean().optional(),
    wizardCompleted: z.boolean().default(false),
    skippedFields: z.array(z.string()).default([]),
    schemaVersion: z.literal(3).default(3),
    contentTiers: z.object({
      core: z.number().default(0),
      scaffold: z.number().default(0),
      aspirational: z.number().default(0)
    }).optional()
  }).default({})
});

export type WizardDataV3 = z.infer<typeof wizardSchemaV3>;
export type ProjectContext = z.infer<typeof projectContextSchema>;
export type StandardsAlignment = z.infer<typeof standardsAlignmentSchema>;
export type Rubric = z.infer<typeof rubricSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
export type Phase = z.infer<typeof phaseSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Differentiation = z.infer<typeof differentiationSchema>;
export type EvidencePlan = z.infer<typeof evidencePlanSchema>;
export type RiskManagement = z.infer<typeof riskManagementSchema>;
export type Communications = z.infer<typeof communicationsSchema>;
export type Exhibition = z.infer<typeof exhibitionSchema>;

// Type guards
export function isV3Schema(data: WizardData | WizardDataV3): data is WizardDataV3 {
  return data.metadata?.version === '3.0';
}

// Migration utilities
export function migrateToV3(data: WizardData): WizardDataV3 {
  return {
    ...data,
    metadata: {
      ...data.metadata,
      version: '3.0' as const,
      schemaVersion: 3 as const,
      contentTiers: {
        core: 0,
        scaffold: 0,
        aspirational: 0
      }
    },
    // Initialize new fields with undefined (optional)
    projectContext: undefined,
    standardsAlignment: undefined,
    bigIdea: undefined,
    essentialQuestion: undefined,
    phases: undefined,
    milestones: undefined,
    artifacts: undefined,
    rubrics: undefined,
    differentiation: undefined,
    studentRoles: undefined,
    evidencePlan: undefined,
    riskManagement: undefined,
    communications: undefined,
    exhibition: undefined
  };
}

// Backward compatibility
export function ensureV2Compatibility(data: WizardDataV3): WizardData {
  // Remove V3-specific fields for backward compatibility
  const {
    projectContext,
    standardsAlignment,
    bigIdea,
    essentialQuestion,
    phases,
    milestones,
    artifacts,
    rubrics,
    differentiation,
    studentRoles,
    evidencePlan,
    riskManagement,
    communications,
    exhibition,
    ...v2Fields
  } = data;
  
  return {
    ...v2Fields,
    metadata: {
      ...v2Fields.metadata,
      version: '2.0' as const
    }
  } as WizardData;
}

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
  const completeness = evaluateWizardCompleteness(data);
  return {
    core: completeness.summary.core,
    context: completeness.summary.context,
    progressive: completeness.summary.progressive
  };
}

export function getWizardCompleteness(
  data: Partial<WizardData> | Partial<WizardDataV3>
): WizardCompletenessResult {
  return evaluateWizardCompleteness(data);
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
