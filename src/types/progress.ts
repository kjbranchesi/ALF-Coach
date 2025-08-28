/**
 * progress.ts
 * 
 * TypeScript types for the ALF Coach progress tracking system
 */

import { type SOPStage, type SOPStep } from '../core/types/SOPTypes';

// Core progress data structure
export interface ProgressData {
  currentStage: SOPStage;
  currentStep?: SOPStep | string;
  completedSteps: string[];
  totalSteps: number;
  stageProgress?: StageProgress;
}

// Stage-specific progress information
export interface StageProgress {
  stageNumber: number;
  currentStepInStage: number;
  totalStepsInStage: number;
  stagePercentage: number;
}

// Individual step definition
export interface StepDefinition {
  id: string;
  label: string;
  stepNumber: number;
  description: string;
  stageKey: keyof typeof import('../components/progress/EnhancedProgressIndicator').STEP_FLOW;
}

// Step status
export type StepStatus = 'completed' | 'current' | 'upcoming';

// Stage data structure
export interface StageData {
  steps: StepDefinition[];
  stageNumber: number;
  totalSteps: number;
}

// Progress calculation result
export interface ProgressCalculation {
  completed: number;
  current: number;
  total: number;
  percentage: number;
  currentStepNumber: number;
}

// Progress indicator variant types
export type ProgressVariant = 'horizontal' | 'compact' | 'floating' | 'header' | 'mobile';

// Progress component props
export interface BaseProgressProps {
  progress: ProgressData;
  variant?: ProgressVariant;
  className?: string;
  showDetails?: boolean;
  onStepClick?: (stepId: string) => void;
}

// Mobile-specific props
export interface MobileProgressProps {
  currentStage: SOPStage;
  currentStep?: string;
  completedSteps: string[];
  onStepTap?: (stepId: string) => void;
}

// Header progress props
export interface HeaderProgressProps {
  currentStage: SOPStage;
  currentStep?: string;
  completedSteps: string[];
  className?: string;
  showStageInfo?: boolean;
}

// Progress event types
export interface ProgressEvent {
  type: 'step_completed' | 'stage_completed' | 'step_changed' | 'progress_updated';
  data: {
    stepId?: string;
    stageId?: SOPStage;
    previousStep?: string;
    newStep?: string;
    progress?: ProgressCalculation;
    timestamp: Date;
  };
}

// Progress tracking configuration
export interface ProgressConfig {
  enableStageTransitions: boolean;
  enableStepNavigation: boolean;
  autoSave: boolean;
  showAnimations: boolean;
  trackAnalytics: boolean;
}

// Analytics data for progress tracking
export interface ProgressAnalytics {
  sessionId: string;
  userId: string;
  startTime: Date;
  stageEntryTimes: Record<SOPStage, Date>;
  stepCompletionTimes: Record<string, Date>;
  totalTimeSpent: number;
  stageTimeSpent: Record<SOPStage, number>;
  stepTimeSpent: Record<string, number>;
  backtrackingEvents: Array<{
    from: string;
    to: string;
    timestamp: Date;
  }>;
}

// Progress persistence structure
export interface ProgressSnapshot {
  id: string;
  userId: string;
  projectId?: string;
  progress: ProgressData;
  analytics?: Partial<ProgressAnalytics>;
  metadata: {
    version: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

// Validation result for progress operations
export interface ProgressValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

// Progress hook return type
export interface UseProgressReturn {
  progress: ProgressData;
  calculation: ProgressCalculation;
  stageInfo: StageProgress | null;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  completeStep: (stepId: string) => Promise<void>;
  navigateToStep: (stepId: string) => Promise<boolean>;
  completeStage: (stageId: SOPStage) => Promise<void>;
  resetProgress: () => Promise<void>;
  
  // Utilities
  canNavigateToStep: (stepId: string) => boolean;
  getStepStatus: (stepId: string) => StepStatus;
  validateProgress: () => ProgressValidationResult;
}

// Progress context value
export interface ProgressContextValue extends UseProgressReturn {
  config: ProgressConfig;
  analytics?: ProgressAnalytics;
  
  // Event handlers
  onProgressEvent?: (event: ProgressEvent) => void;
  onStageTransition?: (fromStage: SOPStage, toStage: SOPStage) => void;
  onStepComplete?: (stepId: string, data?: any) => void;
}

// Default progress configuration
export const DEFAULT_PROGRESS_CONFIG: ProgressConfig = {
  enableStageTransitions: true,
  enableStepNavigation: true,
  autoSave: true,
  showAnimations: true,
  trackAnalytics: true
};

// Progress state machine events
export type ProgressAction = 
  | { type: 'STEP_COMPLETED'; payload: { stepId: string; data?: any } }
  | { type: 'STEP_CHANGED'; payload: { stepId: string } }
  | { type: 'STAGE_COMPLETED'; payload: { stageId: SOPStage } }
  | { type: 'PROGRESS_RESET' }
  | { type: 'PROGRESS_LOADED'; payload: ProgressData }
  | { type: 'VALIDATION_FAILED'; payload: { errors: string[] } };

// Utility type for step flow mapping
export type StepFlowMap = Record<SOPStage, StageData>;

// Export commonly used type unions
export type AllProgressProps = 
  | BaseProgressProps 
  | MobileProgressProps 
  | HeaderProgressProps;

export type ProgressComponent = 
  | 'EnhancedProgressIndicator'
  | 'MobileProgressIndicator' 
  | 'HeaderProgressBar'
  | 'FloatingProgressPill';

// Animation configuration for progress components
export interface ProgressAnimationConfig {
  duration: number;
  easing: string;
  stagger: number;
  enableShimmer: boolean;
  enablePulse: boolean;
}