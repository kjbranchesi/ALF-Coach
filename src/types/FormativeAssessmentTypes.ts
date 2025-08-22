/**
 * Formative Assessment Types for ALF Coach
 * Comprehensive schema for formative assessments throughout the PBL journey
 */

import { z } from 'zod';

// ==================== CORE ASSESSMENT TYPES ====================

export enum AssessmentType {
  EXIT_TICKET = 'exit_ticket',
  PEER_ASSESSMENT = 'peer_assessment', 
  SELF_REFLECTION = 'self_reflection',
  QUICK_CHECK = 'quick_check',
  OBSERVATION = 'observation',
  COLLABORATION_REVIEW = 'collaboration_review',
  PROGRESS_CHECKPOINT = 'progress_checkpoint'
}

export enum PBLStage {
  BIG_IDEA = 'big_idea',
  ESSENTIAL_QUESTION = 'essential_question',
  CHALLENGE = 'challenge',
  JOURNEY = 'journey',
  DELIVERABLES = 'deliverables',
  REFLECTION = 'reflection'
}

export enum BloomLevel {
  REMEMBER = 'remember',
  UNDERSTAND = 'understand',
  APPLY = 'apply',
  ANALYZE = 'analyze',
  EVALUATE = 'evaluate',
  CREATE = 'create'
}

export enum ConfidenceLevel {
  NOT_CONFIDENT = 1,
  SOMEWHAT_CONFIDENT = 2,
  CONFIDENT = 3,
  VERY_CONFIDENT = 4
}

// ==================== EXIT TICKET SCHEMAS ====================

export const exitTicketResponseSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  response: z.string(),
  confidence: z.nativeEnum(ConfidenceLevel).optional(),
  timestamp: z.date().default(() => new Date())
});

export const exitTicketSchema = z.object({
  id: z.string(),
  title: z.string(),
  pblStage: z.nativeEnum(PBLStage),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    type: z.enum(['short_answer', 'multiple_choice', 'scale', 'confidence']),
    required: z.boolean().default(true),
    bloomLevel: z.nativeEnum(BloomLevel).optional(),
    options: z.array(z.string()).optional() // For multiple choice
  })),
  responses: z.array(exitTicketResponseSchema).default([]),
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
    timeToComplete: z.number().optional(), // seconds
    isCompleted: z.boolean().default(false)
  }).default({})
});

// ==================== PEER ASSESSMENT SCHEMAS ====================

export const peerFeedbackSchema = z.object({
  criteriaId: z.string(),
  rating: z.number().min(1).max(4),
  comment: z.string().optional(),
  suggestions: z.string().optional()
});

export const peerAssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  assessorId: z.string(), // Student giving feedback
  assesseeId: z.string(), // Student receiving feedback
  pblStage: z.nativeEnum(PBLStage),
  criteria: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    rubricLevels: z.array(z.string()) // ["Emerging", "Developing", "Proficient", "Advanced"]
  })),
  feedback: z.array(peerFeedbackSchema),
  overallComment: z.string().optional(),
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
    isAnonymous: z.boolean().default(false),
    isCompleted: z.boolean().default(false)
  }).default({})
});

// ==================== SELF-REFLECTION SCHEMAS ====================

export const reflectionPromptSchema = z.object({
  id: z.string(),
  text: z.string(),
  bloomLevel: z.nativeEnum(BloomLevel),
  isRequired: z.boolean().default(true)
});

export const selfReflectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  pblStage: z.nativeEnum(PBLStage),
  prompts: z.array(reflectionPromptSchema),
  responses: z.array(z.object({
    promptId: z.string(),
    response: z.string(),
    confidence: z.nativeEnum(ConfidenceLevel).optional(),
    learningGoals: z.array(z.string()).default([]), // What they want to improve
    timestamp: z.date().default(() => new Date())
  })).default([]),
  learningGoalsProgress: z.array(z.object({
    goal: z.string(),
    startDate: z.date(),
    progress: z.number().min(0).max(100),
    notes: z.string().optional()
  })).default([]),
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
    isCompleted: z.boolean().default(false)
  }).default({})
});

// ==================== QUICK ASSESSMENT SCHEMAS ====================

export const quickCheckSchema = z.object({
  id: z.string(),
  type: z.enum(['think_pair_share', 'gallery_walk', 'thumbs_up_down', 'exit_slip', 'one_word', 'muddiest_point']),
  title: z.string(),
  description: z.string(),
  pblStage: z.nativeEnum(PBLStage),
  prompt: z.string(),
  responses: z.array(z.object({
    studentId: z.string(),
    response: z.string(),
    timestamp: z.date().default(() => new Date())
  })).default([]),
  aggregatedData: z.object({
    participationRate: z.number().min(0).max(100),
    commonThemes: z.array(z.string()).default([]),
    concernsRaised: z.array(z.string()).default([]),
    insightsGained: z.array(z.string()).default([])
  }).optional(),
  metadata: z.object({
    createdAt: z.date().default(() => new Date()),
    completedAt: z.date().optional(),
    duration: z.number().optional() // minutes
  }).default({})
});

// ==================== TEACHER MONITORING SCHEMAS ====================

export const studentProgressDataSchema = z.object({
  studentId: z.string(),
  studentName: z.string(),
  pblStage: z.nativeEnum(PBLStage),
  completionRate: z.number().min(0).max(100),
  engagementLevel: z.enum(['low', 'medium', 'high']),
  strugglingAreas: z.array(z.string()).default([]),
  strengths: z.array(z.string()).default([]),
  lastActivity: z.date(),
  interventionsNeeded: z.array(z.enum(['scaffold', 'extend', 'reteach', 'peer_support'])).default([]),
  confidenceTrends: z.array(z.object({
    stage: z.nativeEnum(PBLStage),
    averageConfidence: z.number().min(1).max(4),
    timestamp: z.date()
  })).default([])
});

export const classProgressDashboardSchema = z.object({
  id: z.string(),
  classId: z.string(),
  projectId: z.string(),
  currentStage: z.nativeEnum(PBLStage),
  students: z.array(studentProgressDataSchema),
  classMetrics: z.object({
    averageProgress: z.number().min(0).max(100),
    averageEngagement: z.number().min(1).max(5),
    completionRates: z.record(z.nativeEnum(PBLStage), z.number()),
    commonChallenges: z.array(z.string()).default([]),
    successfulStrategies: z.array(z.string()).default([])
  }),
  alerts: z.array(z.object({
    type: z.enum(['low_engagement', 'behind_schedule', 'needs_intervention', 'ready_for_extension']),
    studentIds: z.array(z.string()),
    description: z.string(),
    suggestedAction: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    timestamp: z.date().default(() => new Date())
  })).default([]),
  lastUpdated: z.date().default(() => new Date())
});

// ==================== ASSESSMENT COLLECTION SCHEMA ====================

export const formativeAssessmentCollectionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(), // Teacher ID
  exitTickets: z.array(exitTicketSchema).default([]),
  peerAssessments: z.array(peerAssessmentSchema).default([]),
  selfReflections: z.array(selfReflectionSchema).default([]),
  quickChecks: z.array(quickCheckSchema).default([]),
  progressDashboard: classProgressDashboardSchema.optional(),
  settings: z.object({
    enablePeerAssessment: z.boolean().default(true),
    enableSelfReflection: z.boolean().default(true),
    exitTicketFrequency: z.enum(['daily', 'per_stage', 'custom']).default('per_stage'),
    anonymousPeerFeedback: z.boolean().default(false),
    requireReflectionCompletion: z.boolean().default(true),
    dashboardUpdateFrequency: z.number().default(60) // minutes
  }).default({})
});

// ==================== TYPE EXPORTS ====================

export type ExitTicket = z.infer<typeof exitTicketSchema>;
export type ExitTicketResponse = z.infer<typeof exitTicketResponseSchema>;
export type PeerAssessment = z.infer<typeof peerAssessmentSchema>;
export type PeerFeedback = z.infer<typeof peerFeedbackSchema>;
export type SelfReflection = z.infer<typeof selfReflectionSchema>;
export type ReflectionPrompt = z.infer<typeof reflectionPromptSchema>;
export type QuickCheck = z.infer<typeof quickCheckSchema>;
export type StudentProgressData = z.infer<typeof studentProgressDataSchema>;
export type ClassProgressDashboard = z.infer<typeof classProgressDashboardSchema>;
export type FormativeAssessmentCollection = z.infer<typeof formativeAssessmentCollectionSchema>;

// ==================== VALIDATION HELPERS ====================

export function validateExitTicket(data: unknown): ExitTicket {
  return exitTicketSchema.parse(data);
}

export function validatePeerAssessment(data: unknown): PeerAssessment {
  return peerAssessmentSchema.parse(data);
}

export function validateSelfReflection(data: unknown): SelfReflection {
  return selfReflectionSchema.parse(data);
}

export function validateFormativeAssessmentCollection(data: unknown): FormativeAssessmentCollection {
  return formativeAssessmentCollectionSchema.parse(data);
}

// ==================== ASSESSMENT TEMPLATES ====================

export const DEFAULT_EXIT_TICKET_QUESTIONS = {
  [PBLStage.BIG_IDEA]: [
    {
      id: 'understanding',
      text: 'In your own words, explain the Big Idea we explored today.',
      type: 'short_answer' as const,
      required: true,
      bloomLevel: BloomLevel.UNDERSTAND
    },
    {
      id: 'connection',
      text: 'How does this Big Idea connect to your own experiences or interests?',
      type: 'short_answer' as const,
      required: true,
      bloomLevel: BloomLevel.APPLY
    },
    {
      id: 'confidence',
      text: 'How confident do you feel about understanding the Big Idea?',
      type: 'confidence' as const,
      required: true
    }
  ],
  [PBLStage.ESSENTIAL_QUESTION]: [
    {
      id: 'question_clarity',
      text: 'Rewrite the Essential Question in your own words.',
      type: 'short_answer' as const,
      required: true,
      bloomLevel: BloomLevel.UNDERSTAND
    },
    {
      id: 'investigation_plan',
      text: 'What steps will you take to investigate this question?',
      type: 'short_answer' as const,
      required: true,
      bloomLevel: BloomLevel.CREATE
    },
    {
      id: 'confidence',
      text: 'How confident do you feel about investigating this question?',
      type: 'confidence' as const,
      required: true
    }
  ]
};

export const DEFAULT_REFLECTION_PROMPTS = {
  [PBLStage.BIG_IDEA]: [
    {
      id: 'learning_reflection',
      text: 'What did you learn about the Big Idea today that you didn\'t know before?',
      bloomLevel: BloomLevel.UNDERSTAND,
      isRequired: true
    },
    {
      id: 'metacognition',
      text: 'What strategies helped you understand the Big Idea best?',
      bloomLevel: BloomLevel.ANALYZE,
      isRequired: true
    },
    {
      id: 'goal_setting',
      text: 'What do you want to learn more about related to this Big Idea?',
      bloomLevel: BloomLevel.CREATE,
      isRequired: false
    }
  ]
};

export const DEFAULT_PEER_ASSESSMENT_CRITERIA = {
  collaboration: {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'How well did this person work with others?',
    rubricLevels: ['Needs Support', 'Developing', 'Proficient', 'Exemplary']
  },
  communication: {
    id: 'communication',
    name: 'Communication',
    description: 'How clearly did this person share their ideas?',
    rubricLevels: ['Unclear', 'Somewhat Clear', 'Clear', 'Very Clear']
  },
  contribution: {
    id: 'contribution',
    name: 'Contribution',
    description: 'How much did this person contribute to the work?',
    rubricLevels: ['Limited', 'Some', 'Significant', 'Outstanding']
  }
};