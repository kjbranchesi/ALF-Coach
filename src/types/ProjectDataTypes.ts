/**
 * Unified Project Data Types
 * Central schema for all project data across wizard, chat, and persistence layers
 */

import { z } from 'zod';

// ==================== CORE DATA SCHEMAS ====================

// Wizard Data (from existing wizardSchema but extended)
export enum EntryPoint {
  LEARNING_GOAL = 'learning_goal',
  MATERIALS_FIRST = 'materials_first', 
  EXPLORE = 'explore'
}

export enum PBLExperience {
  NEW = 'new',
  SOME = 'some',
  EXPERIENCED = 'experienced'
}

export enum ConversationPhase {
  WIZARD = 'wizard',
  HANDOFF = 'handoff',
  CONTEXT_GATHERING = 'context_gathering',
  PROJECT_DESIGN = 'project_design',
  REFINEMENT = 'refinement'
}

// Enhanced wizard data schema
export const wizardDataSchema = z.object({
  // Core Project Definition
  entryPoint: z.nativeEnum(EntryPoint),
  projectTopic: z.string().min(20, 'Project topic must be at least 20 characters'),
  learningGoals: z.string().min(20, 'Learning goals must be at least 20 characters'),
  materials: z.string().optional(),
  
  // Educational Context
  subjects: z.array(z.string()).min(1, 'Select at least one subject area'),
  primarySubject: z.string(),
  gradeLevel: z.string().min(1, 'Grade level is required'),
  duration: z.enum(['short', 'medium', 'long']),
  specialRequirements: z.string().optional(),
  
  // Teaching Context
  pblExperience: z.nativeEnum(PBLExperience),
  specialConsiderations: z.string().optional(),
  
  // Conversation State
  conversationPhase: z.nativeEnum(ConversationPhase).default(ConversationPhase.WIZARD),
  contextCompleteness: z.object({
    core: z.number().min(0).max(100).default(0),
    context: z.number().min(0).max(100).default(0),
    progressive: z.number().min(0).max(100).default(0)
  }).default({ core: 0, context: 0, progressive: 0 }),
  
  // Metadata
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    lastModified: z.date().default(() => new Date()),
    version: z.literal('3.0').default('3.0'),
    wizardCompleted: z.boolean().default(false),
    skippedFields: z.array(z.string()).default([])
  }).default({})
});

// Chat Data Schema
export const chatDataSchema = z.object({
  ideation: z.object({
    bigIdea: z.string().optional(),
    essentialQuestion: z.string().optional(),
    challenge: z.string().optional(),
    confirmed: z.boolean().default(false)
  }).optional(),
  
  learningJourney: z.object({
    phases: z.array(z.object({
      name: z.string(),
      description: z.string(),
      duration: z.string(),
      activities: z.array(z.string()),
      resources: z.array(z.string())
    })).default([]),
    timeline: z.string().optional(),
    milestones: z.array(z.string()).default([])
  }).optional(),
  
  deliverables: z.object({
    rubric: z.object({
      criteria: z.array(z.object({
        name: z.string(),
        description: z.string(),
        levels: z.array(z.string())
      }))
    }).optional(),
    assessments: z.array(z.string()).default([]),
    portfolio: z.array(z.string()).default([])
  }).optional(),
  
  chatHistory: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.date(),
    metadata: z.record(z.any()).optional()
  })).default([])
});

// Project Status & Stage
export const projectStatusSchema = z.object({
  stage: z.enum([
    'WIZARD',
    'IDEATION', 
    'LEARNING_JOURNEY',
    'DELIVERABLES',
    'CURRICULUM',
    'ASSIGNMENTS', 
    'COMPLETED'
  ]).default('WIZARD'),
  
  progress: z.object({
    wizard: z.number().min(0).max(100).default(0),
    ideation: z.number().min(0).max(100).default(0),
    journey: z.number().min(0).max(100).default(0),
    deliverables: z.number().min(0).max(100).default(0)
  }).default({ wizard: 0, ideation: 0, journey: 0, deliverables: 0 }),
  
  lastActivity: z.date().default(() => new Date()),
  estimatedCompletion: z.date().optional()
});

// ==================== UNIFIED PROJECT SCHEMA ====================

export const unifiedProjectSchema = z.object({
  // Identity
  id: z.string(),
  title: z.string(),
  userId: z.string(),
  
  // Wizard Data (enriched context)
  wizard: wizardDataSchema,
  
  // Chat/Design Data
  chat: chatDataSchema,
  
  // Project Status
  status: projectStatusSchema,
  
  // Sync & Persistence Metadata
  persistence: z.object({
    version: z.literal('3.0').default('3.0'),
    lastSyncToFirebase: z.date().optional(),
    lastSyncFromFirebase: z.date().optional(),
    hasPendingChanges: z.boolean().default(false),
    conflictResolution: z.enum(['local', 'remote', 'manual']).default('local'),
    storageStrategy: z.enum(['firebase-primary', 'local-primary', 'hybrid']).default('hybrid')
  }).default({})
});

export type WizardData = z.infer<typeof wizardDataSchema>;
export type ChatData = z.infer<typeof chatDataSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type UnifiedProject = z.infer<typeof unifiedProjectSchema>;

// ==================== VALIDATION HELPERS ====================

export function validateWizardData(data: unknown): WizardData {
  return wizardDataSchema.parse(data);
}

export function validateChatData(data: unknown): ChatData {
  return chatDataSchema.parse(data);
}

export function validateUnifiedProject(data: unknown): UnifiedProject {
  return unifiedProjectSchema.parse(data);
}

// ==================== MIGRATION SCHEMAS ====================

// Legacy schema mappings for backward compatibility
export const legacyProjectSchema = z.object({
  // Legacy fields from existing system
  subject: z.string().optional(),
  ageGroup: z.string().optional(),
  title: z.string().optional(),
  stage: z.string().optional(),
  ideation: z.record(z.any()).optional(),
  learningJourney: z.record(z.any()).optional(),
  studentDeliverables: z.record(z.any()).optional(),
  chatHistory: z.array(z.any()).optional()
});

export type LegacyProject = z.infer<typeof legacyProjectSchema>;

// Migration function
export function migrateLegacyProject(legacy: LegacyProject): Partial<UnifiedProject> {
  const wizardData: Partial<WizardData> = {
    projectTopic: legacy.title || '',
    learningGoals: '',
    primarySubject: legacy.subject || '',
    subjects: legacy.subject ? [legacy.subject] : [],
    gradeLevel: legacy.ageGroup || '',
    duration: 'medium',
    entryPoint: EntryPoint.LEARNING_GOAL,
    pblExperience: PBLExperience.SOME,
    conversationPhase: ConversationPhase.PROJECT_DESIGN
  };

  const chatData: Partial<ChatData> = {
    ideation: legacy.ideation as any,
    learningJourney: legacy.learningJourney as any,
    deliverables: legacy.studentDeliverables as any,
    chatHistory: (legacy.chatHistory || []).map((msg: any) => ({
      id: msg.id || Date.now().toString(),
      role: msg.role || 'user',
      content: msg.content || msg.chatResponse || '',
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      metadata: msg.metadata || {}
    }))
  };

  return {
    id: legacy.id,
    title: legacy.title || 'Untitled Project',
    wizard: wizardDataSchema.parse(wizardData),
    chat: chatDataSchema.parse(chatData),
    status: {
      stage: (legacy.stage as any) || 'WIZARD',
      progress: { wizard: 50, ideation: 0, journey: 0, deliverables: 0 },
      lastActivity: new Date()
    }
  };
}

// ==================== DATA TRANSFORMATION UTILITIES ====================

export function extractWizardContext(project: UnifiedProject): Record<string, any> {
  const { wizard } = project;
  return {
    entryPoint: wizard.entryPoint,
    projectTopic: wizard.projectTopic,
    learningGoals: wizard.learningGoals,
    subjects: wizard.subjects,
    primarySubject: wizard.primarySubject,
    gradeLevel: wizard.gradeLevel,
    duration: wizard.duration,
    pblExperience: wizard.pblExperience,
    materials: wizard.materials,
    specialRequirements: wizard.specialRequirements,
    specialConsiderations: wizard.specialConsiderations
  };
}

export function calculateProjectCompleteness(project: UnifiedProject): number {
  const { wizard, chat, status } = project;
  
  // Wizard completeness (30%)
  const wizardComplete = wizard.metadata.wizardCompleted ? 30 : 
    (wizard.projectTopic && wizard.learningGoals && wizard.subjects.length > 0) ? 20 : 10;
  
  // Design completeness (70%)
  const ideationComplete = chat.ideation?.confirmed ? 25 : 0;
  const journeyComplete = chat.learningJourney?.phases.length > 0 ? 25 : 0;
  const deliverablesComplete = chat.deliverables?.rubric ? 20 : 0;
  
  return wizardComplete + ideationComplete + journeyComplete + deliverablesComplete;
}

export function getNextRecommendedAction(project: UnifiedProject): string {
  const { wizard, chat, status } = project;
  
  if (!wizard.metadata.wizardCompleted) {
    return 'Complete project setup in the wizard';
  }
  
  if (!chat.ideation?.confirmed) {
    return 'Define your Big Idea and Essential Question';
  }
  
  if (!chat.learningJourney?.phases.length) {
    return 'Design the learning journey phases';
  }
  
  if (!chat.deliverables?.rubric) {
    return 'Create assessment rubrics and deliverables';
  }
  
  return 'Review and refine your complete project';
}