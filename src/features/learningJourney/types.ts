/**
 * types.ts
 * 
 * Centralized type definitions for the Creative Process Learning Journey
 * Addresses code review concern about type organization and reusability
 */

import { ReactElement } from 'react';
import { LucideIcon } from 'lucide-react';

// Core phase types
export type PhaseType = 'ANALYZE' | 'BRAINSTORM' | 'PROTOTYPE' | 'EVALUATE';

export type GradeLevel = 'elementary' | 'middle' | 'high';

// Phase components
export interface PhaseObjective {
  id: string;
  text: string;
  required: boolean;
}

export interface PhaseActivity {
  id: string;
  name: string;
  description: string;
  duration: string;
  resources: string[];
  studentChoice?: boolean;
}

export interface PhaseDeliverable {
  id: string;
  name: string;
  format: string;
  assessmentCriteria: string[];
}

// Iteration support
export interface IterationSupport {
  triggers: string[];
  resources: string[];
  timeBuffer: number; // percentage of phase time for iteration
  strategies: string[];
}

// Assessment
export interface PhaseAssessment {
  formative: string[];
  summative: string;
  rubricCriteria: string[];
}

// Main phase interface
export interface CreativePhase {
  type: PhaseType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  allocation: number; // percentage of total time (0-1)
  duration?: string; // calculated based on total project duration
  objectives: PhaseObjective[];
  activities: PhaseActivity[];
  deliverables: PhaseDeliverable[];
  iterationSupport: IterationSupport;
  assessment: PhaseAssessment;
  studentAgency: string[];
  completed: boolean;
}

// Iteration types
export type IterationType = 'quick_loop' | 'major_pivot' | 'complete_restart';

// Iteration tracking
export interface IterationEvent {
  id: string;
  fromPhase: PhaseType;
  toPhase: PhaseType;
  reason: string;
  timestamp: Date;
  duration: number; // in minutes
  metadata?: {
    iterationType: IterationType;
    strategies: string[];
    notes: string;
    weekNumber: number;
    estimatedDays: number;
  };
}

// Journey configuration
export interface CreativeProcessJourneyData {
  projectDuration: number; // in weeks
  gradeLevel: GradeLevel;
  subject: string;
  bigIdea: string;
  essentialQuestion: string;
  challenge: string;
  phases: CreativePhase[];
  currentPhase: number;
  iterationHistory: IterationEvent[];
  allowIteration: boolean;
  metadata?: JourneyMetadata;
}

// Additional metadata
export interface JourneyMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  schoolName?: string;
  className?: string;
  academicYear?: string;
  standards?: string[];
  tags?: string[];
}

// Grade level examples
export interface GradeLevelExample {
  objectives: string[];
  activities: Array<{
    name: string;
    duration: string;
    description: string;
  }>;
  resources?: string[];
}

export interface GradeLevelExamples {
  ANALYZE: GradeLevelExample;
  BRAINSTORM: GradeLevelExample;
  PROTOTYPE: GradeLevelExample;
  EVALUATE: GradeLevelExample;
}

// Progress tracking
export interface PhaseProgress {
  phaseType: PhaseType;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
  iterationCount: number;
  completionPercentage: number;
}

export interface StudentProgress {
  studentId: string;
  phaseProgress: PhaseProgress[];
  currentPhase: PhaseType;
  overallProgress: number; // 0-100
  iterationEvents: IterationEvent[];
}

// Validation rules
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface PhaseValidation {
  minObjectives: number;
  maxObjectives: number;
  minActivities: number;
  maxActivities: number;
  minDeliverables: number;
  maxDeliverables: number;
}

// Export configuration
export interface ExportConfig {
  format: 'pdf' | 'docx' | 'json' | 'csv';
  includeObjectives: boolean;
  includeActivities: boolean;
  includeDeliverables: boolean;
  includeAssessment: boolean;
  includeIterationHistory: boolean;
  includeStudentProgress?: boolean;
}

// Analytics
export interface JourneyAnalytics {
  totalIterations: number;
  averagePhaseTime: number;
  mostIteratedPhase: PhaseType | null;
  completionRate: number;
  studentEngagement: number; // 0-100
  teacherNotes?: string[];
}

// Error types
export class JourneyValidationError extends Error {
  constructor(
    public field: string,
    public value: any,
    message: string
  ) {
    super(message);
    this.name = 'JourneyValidationError';
  }
}

// Constants
export const PHASE_ALLOCATIONS = {
  ANALYZE: 0.25,
  BRAINSTORM: 0.25,
  PROTOTYPE: 0.35,
  EVALUATE: 0.15
} as const;

export const PHASE_COLORS = {
  ANALYZE: { bg: '#EBF8FF', border: '#3182CE', text: '#2C5282' },
  BRAINSTORM: { bg: '#FEF5E7', border: '#F59E0B', text: '#92400E' },
  PROTOTYPE: { bg: '#F3E8FF', border: '#8B5CF6', text: '#5B21B6' },
  EVALUATE: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' }
} as const;

export const GRADE_LEVEL_CONFIG = {
  elementary: {
    minProjectDuration: 2,
    maxProjectDuration: 4,
    defaultActivitiesPerPhase: 3,
    complexityLevel: 'basic'
  },
  middle: {
    minProjectDuration: 3,
    maxProjectDuration: 6,
    defaultActivitiesPerPhase: 4,
    complexityLevel: 'intermediate'
  },
  high: {
    minProjectDuration: 4,
    maxProjectDuration: 12,
    defaultActivitiesPerPhase: 5,
    complexityLevel: 'advanced'
  }
} as const;

// Type guards
export const isPhaseType = (value: any): value is PhaseType => {
  return ['ANALYZE', 'BRAINSTORM', 'PROTOTYPE', 'EVALUATE'].includes(value);
};

export const isGradeLevel = (value: any): value is GradeLevel => {
  return ['elementary', 'middle', 'high'].includes(value);
};

export const isValidPhase = (phase: any): phase is CreativePhase => {
  return (
    phase &&
    typeof phase === 'object' &&
    isPhaseType(phase.type) &&
    typeof phase.name === 'string' &&
    Array.isArray(phase.objectives) &&
    Array.isArray(phase.activities) &&
    Array.isArray(phase.deliverables)
  );
};

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PhaseUpdate = DeepPartial<CreativePhase>;

export type JourneyUpdate = DeepPartial<CreativeProcessJourneyData>;