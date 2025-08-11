/**
 * index.ts
 * 
 * Central export file for all Learning Journey components
 * Ensures proper module resolution and prevents circular dependencies
 */

// Core components
export { CreativeProcessJourney } from './CreativeProcessJourney';

// Sprint 1 components
export { PhasePanel } from './components/PhasePanel';
export { PhaseTimeline } from './components/PhaseTimeline';

// Sprint 2 components
export { IterationDialog } from './components/IterationDialog';
export { PhaseBuilder } from './components/PhaseBuilder';

// Sprint 4 components
export { RubricBuilder } from './components/RubricBuilder';
export { AssessmentCriteria } from './components/AssessmentCriteria';
export { StudentProgress } from './components/StudentProgress';
export { PeerEvaluation } from './components/PeerEvaluation';

// Sprint 5 components
export { DataAnalytics } from './components/DataAnalytics';
export { ReportGenerator } from './components/ReportGenerator';

// Sprint 6 components
export { AITutor } from './components/AITutor';
export { AdaptiveLearning } from './components/AdaptiveLearning';

// Sprint 3 components
export { IterationHistory } from './components/IterationHistory';
export { IterationAnalytics } from './components/IterationAnalytics';
export { SupportResources } from './components/SupportResources';
export { TeacherGuidance } from './components/TeacherGuidance';

// Sprint 4 components
export { RubricBuilder } from './components/RubricBuilder';
export { AssessmentCriteria } from './components/AssessmentCriteria';
export { StudentProgress } from './components/StudentProgress';
export { PeerEvaluation } from './components/PeerEvaluation';

// Hooks
export { useCreativeJourney, useLocalStorage } from './hooks/useCreativeJourney';

// Types
export type {
  // Core types
  PhaseType,
  GradeLevel,
  IterationType,
  
  // Phase components
  PhaseObjective,
  PhaseActivity,
  PhaseDeliverable,
  CreativePhase,
  
  // Iteration support
  IterationEvent,
  IterationSupport,
  
  // Journey data
  CreativeProcessJourneyData,
  JourneyMetadata,
  
  // Assessment
  PhaseAssessment,
  
  // Progress tracking
  PhaseProgress,
  StudentProgress,
  
  // Analytics
  JourneyAnalytics,
  
  // Validation
  ValidationRule,
  PhaseValidation,
  JourneyValidationError,
  
  // Export configuration
  ExportConfig,
  
  // Grade level examples
  GradeLevelExample,
  GradeLevelExamples,
  
  // Metrics
  PhaseMetrics,
  
  // Utility types
  DeepPartial,
  RequiredFields,
  PhaseUpdate,
  JourneyUpdate
} from './types';

// Sprint 4 Types
export type {
  // Rubric types
  Rubric,
  RubricType,
  RubricCriterion,
  RubricLevel,
  PerformanceLevel
} from './components/RubricBuilder';

export type {
  // Assessment types
  Assessment,
  AssessmentScore,
  Evidence
} from './components/AssessmentCriteria';

export type {
  // Progress types
  Achievement,
  ProgressMilestone,
  GrowthMetric
} from './components/StudentProgress';

export type {
  // Peer evaluation types
  PeerReview,
  PeerRating,
  PeerFeedback,
  PeerRecognition,
  PeerEvaluationSummary
} from './components/PeerEvaluation';

// Constants
export {
  PHASE_ALLOCATIONS,
  PHASE_COLORS,
  GRADE_LEVEL_CONFIG
} from './types';

// Type guards
export {
  isPhaseType,
  isGradeLevel,
  isValidPhase
} from './types';

// Color utilities
export {
  phaseColorClasses,
  getPhaseColorClass,
  performanceLevelColors,
  achievementCategoryColors,
  feedbackTypeColors,
  recognitionTypeColors,
  statusColors,
  getColorClass,
  tailwindSafelistClasses
} from './utils/colorMappings';