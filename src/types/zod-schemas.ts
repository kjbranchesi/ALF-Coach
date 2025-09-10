/**
 * Zod Schemas for ALF Coach
 * Runtime validation for project data structures
 */

import { z } from 'zod';

// Base schemas
export const zID = z.string().min(1);
export const zISODate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const zTier = z.enum(['core', 'scaffold', 'aspirational']);

// Tiered wrapper - adds tier metadata to any schema
export const zTiered = <T extends z.ZodTypeAny>(schema: T) =>
  schema.and(z.object({ 
    tier: zTier.default('core'), 
    confidence: z.number().min(0).max(1).optional() 
  }));

// Standards
export const zStandard = z.object({
  id: zID.optional(), // Optional for migration
  framework: z.enum(['NGSS', 'CCSS-ELA', 'CCSS-MATH', 'STATE', 'IB', 'CUSTOM']),
  code: z.string(),
  label: z.string(),
  description: z.string().optional(),
  rationale: z.string().min(1)
});

// Standards coverage
export const zStandardsCoverage = z.object({
  standardId: zID,
  milestoneId: zID,
  phaseId: zID.optional(),
  emphasis: z.enum(['introduce', 'develop', 'master']).default('develop')
});

// Phases
export const zPhase = z.object({
  id: zID.optional(),
  name: z.string(),
  start: zISODate.optional(),
  end: zISODate.optional(),
  duration: z.string().optional(),
  goals: z.array(z.string()).default([]),
  activities: z.array(z.string()).optional(),
  deliverables: z.array(zID).optional(),
  checkpoints: z.array(zID).optional()
});

// Milestones
export const zMilestone = z.object({
  id: zID.optional(),
  name: z.string(),
  phaseId: zID.optional(), // Optional for migration
  due: zISODate.optional(),
  owner: z.enum(['student', 'team', 'teacher', 'partner']).default('student'),
  description: z.string().optional(),
  evidence: z.array(z.string()).default([])
});

// Artifacts
export const zArtifact = z.object({
  id: zID.optional(),
  name: z.string(),
  description: z.string(),
  milestoneId: zID.optional(),
  rubricIds: z.array(zID).default([]),
  exemplar: z.string().optional()
});

// Rubric scale levels
export const zScaleLevel = z.object({
  value: z.number(),
  label: z.string(),
  descriptor: z.string()
});

// Rubric criteria
export const zRubricCriterion = z.object({
  id: zID.optional(),
  name: z.string(),
  description: z.string().optional(),
  levels: z.array(zScaleLevel).min(3),
  weight: z.number().min(0).max(1).optional(),
  standardsAlignment: z.array(zID).optional()
});

// Rubrics
export const zRubric = z.object({
  id: zID.optional(),
  name: z.string(),
  criteria: z.array(zRubricCriterion).min(1),
  scaleLabel: z.enum(['0-3', '1-4', '1-5', 'custom']).optional(),
  totalPoints: z.number().optional(),
  useStudentLanguage: z.boolean().default(false),
  exemplars: z.array(z.object({
    levelValue: z.number(),
    description: z.string(),
    link: z.string().url().optional()
  })).optional()
});

// Student roles
export const zRole = z.object({
  id: zID.optional(),
  name: z.string(),
  responsibilities: z.array(z.string()).default([])
});

// Differentiation
export const zDifferentiation = z.object({
  tieredAssignments: z.array(z.object({
    level: z.string(),
    modifications: z.array(z.string())
  })).optional(),
  udlStrategies: z.object({
    representation: z.array(z.string()).default([]),
    action: z.array(z.string()).default([]),
    engagement: z.array(z.string()).default([])
  }).optional(),
  languageSupports: z.array(z.string()).optional(),
  executiveFunctionSupports: z.array(z.string()).optional(),
  accommodations: z.array(z.string()).optional(),
  multilingual: z.object({
    languages: z.array(z.string()),
    strategies: z.array(z.string())
  }).optional()
});

// Scaffolds
export const zScaffold = z.object({
  id: zID.optional(),
  name: z.string(),
  description: z.string(),
  templateLink: z.string().optional()
});

// Communications
export const zCommunicationDoc = z.object({
  id: zID.optional(),
  audience: z.enum(['family', 'admin', 'partner', 'community']),
  subject: z.string(),
  body: z.string(),
  delivery: z.enum(['email', 'letter', 'lms', 'website', 'other']).default('email'),
  updateSchedule: z.string().optional()
});

// Exhibition
export const zExhibition = z.object({
  format: z.enum(['gallery', 'pitch', 'panel', 'festival', 'online', 'other']),
  audience: z.array(z.string()).default([]),
  date: zISODate.optional(),
  venue: z.string().optional(),
  location: z.string().optional(),
  preparation: z.array(z.string()).default([])
});

// Evidence items
export const zEvidenceItem = z.object({
  id: zID.optional(),
  name: z.string(),
  type: z.enum(['photo', 'video', 'doc', 'artifact', 'reflection', 'observation']),
  storage: z.object({
    location: z.enum(['drive', 'lms', 'local', 'portfolio', 'other']),
    path: z.string().optional()
  }),
  linkedArtifactId: zID.optional()
});

// Checkpoints
export const zCheckpoint = z.object({
  id: zID.optional(),
  milestoneId: zID,
  when: zISODate.optional(),
  type: z.string(),
  evidence: z.array(zEvidenceItem).default([]),
  assessment: z.object({
    rubricId: zID.optional(),
    criterionIds: z.array(zID).optional()
  }).optional(),
  notes: z.string().optional()
});

// Evidence plan
export const zEvidencePlan = z.object({
  checkpoints: z.array(zCheckpoint).default([]),
  permissions: z.array(z.string()).default([]),
  dataManagement: z.string().optional()
});

// Risk management
export const zRisk = z.object({
  id: zID.optional(),
  name: z.string(),
  likelihood: z.enum(['low', 'medium', 'high']),
  impact: z.enum(['low', 'medium', 'high']),
  mitigation: z.string(),
  contingencyId: zID.optional()
});

// Contingencies
export const zContingency = z.object({
  id: zID.optional(),
  trigger: z.string(),
  scenario: z.string(),
  plan: z.string()
});

// Time compression
export const zTimeCompression = z.object({
  minimal: z.string(),
  moderate: z.string(),
  significant: z.string()
});

// Project context
export const zProjectContext = z.object({
  grade: z.string(),
  subjects: z.array(z.string()).default([]),
  primarySubject: z.string(),
  classSize: z.number().min(1).max(100).optional(),
  timeWindow: z.object({
    start: zISODate,
    end: zISODate,
    totalWeeks: z.number()
  }).optional(),
  schedule: z.enum(['traditional', 'block', 'hybrid', 'flexible']).optional(),
  constraints: z.object({
    budgetUSD: z.number().optional(),
    techAccess: z.enum(['full', 'limited', 'minimal', 'none']),
    materials: z.array(z.string()).optional(),
    specialPopulations: z.array(z.enum(['IEP', '504', 'ELL', 'Gifted', 'Other'])).optional(),
    safetyRequirements: z.array(z.string()).optional()
  }).optional()
});

// Main project schema
export const zProject = z.object({
  id: zID,
  title: z.string(),
  description: z.string(),
  tierSummary: z.string().optional(),
  
  // Core elements with tiers
  context: zTiered(zProjectContext),
  bigIdea: zTiered(z.string()),
  essentialQuestion: zTiered(z.string()),
  learningGoals: zTiered(z.array(z.string())),
  successCriteria: zTiered(z.array(z.string())),
  
  // Standards
  standards: z.array(zTiered(zStandard)).default([]),
  standardsCoverage: z.array(zStandardsCoverage).default([]),
  
  // Project structure
  phases: z.array(zTiered(zPhase)).default([]),
  milestones: z.array(zTiered(zMilestone)).default([]),
  
  // Deliverables & assessment
  artifacts: z.array(zTiered(zArtifact)).default([]),
  rubrics: z.array(zTiered(zRubric)).default([]),
  
  // Roles & differentiation
  roles: z.array(zTiered(zRole)).default([]),
  differentiation: zTiered(zDifferentiation).optional(),
  scaffolds: z.array(zTiered(zScaffold)).default([]),
  
  // Communications & exhibition
  communications: z.array(zTiered(zCommunicationDoc)).default([]),
  exhibition: zTiered(zExhibition).optional(),
  
  // Evidence & logistics
  evidencePlan: zTiered(zEvidencePlan).optional(),
  checkpoints: z.array(zTiered(zCheckpoint)).default([]),
  
  // Risk management
  risks: z.array(zTiered(zRisk)).default([]),
  contingencies: z.array(zTiered(zContingency)).default([]),
  timeCompression: zTimeCompression.optional(),
  
  // Metadata
  metadata: z.object({
    version: z.string(),
    schemaVersion: z.number(),
    createdAt: zISODate,
    updatedAt: zISODate,
    contentTiers: z.object({
      core: z.number().default(0),
      scaffold: z.number().default(0),
      aspirational: z.number().default(0)
    }).optional()
  }).optional()
});

// Partial project for creation
export const zPartialProject = zProject.partial();

// Export inferred types
export type Standard = z.infer<typeof zStandard>;
export type StandardsCoverage = z.infer<typeof zStandardsCoverage>;
export type Phase = z.infer<typeof zPhase>;
export type Milestone = z.infer<typeof zMilestone>;
export type Artifact = z.infer<typeof zArtifact>;
export type Rubric = z.infer<typeof zRubric>;
export type Role = z.infer<typeof zRole>;
export type Project = z.infer<typeof zProject>;
export type PartialProject = z.infer<typeof zPartialProject>;