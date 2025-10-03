/**
 * Progress Components Export Index
 * 
 * Centralized exports for the ALF Coach progress indicator system
 */

// Core progress components
export { EnhancedProgressIndicator, STEP_FLOW } from './EnhancedProgressIndicator';
export { MobileProgressIndicator } from './MobileProgressIndicator';
export { HeaderProgressBar, addShimmerStyles } from './HeaderProgressBar';

// TypeScript types
export type {
  ProgressData,
  StageProgress,
  StepDefinition,
  StepStatus,
  StageData,
  ProgressCalculation,
  ProgressVariant,
  BaseProgressProps,
  MobileProgressProps,
  HeaderProgressProps,
  ProgressEvent,
  ProgressConfig,
  ProgressAnalytics,
  ProgressSnapshot,
  ProgressValidationResult,
  UseProgressReturn,
  ProgressContextValue,
  ProgressAction,
  StepFlowMap,
  AllProgressProps,
  ProgressComponent,
  ProgressAnimationConfig
} from '../../types/progress';

// Default configuration
export { DEFAULT_PROGRESS_CONFIG } from '../../types/progress';

// Utility functions for progress calculations
export const calculateOverallProgress = (completedSteps: string[], totalSteps: number = 9) => {
  return {
    completed: completedSteps.length,
    total: totalSteps,
    percentage: Math.round((completedSteps.length / totalSteps) * 100)
  };
};

export const getCurrentStepNumber = (currentStep: string | undefined, stepFlow = STEP_FLOW): number => {
  if (!currentStep) {return 0;}
  
  for (const [, stageData] of Object.entries(stepFlow)) {
    const step = stageData.steps.find(s => s.id === currentStep);
    if (step) {return step.stepNumber;}
  }
  return 0;
};

export const getStepStatus = (stepId: string, currentStep: string | undefined, completedSteps: string[]): StepStatus => {
  if (completedSteps.includes(stepId)) {return 'completed';}
  if (currentStep === stepId) {return 'current';}
  return 'upcoming';
};

export const getStageProgress = (stage: string, currentStep: string | undefined, completedSteps: string[]) => {
  const stageData = STEP_FLOW[stage as keyof typeof STEP_FLOW];
  if (!stageData) {return null;}

  const stageSteps = stageData.steps;
  const completedInStage = stageSteps.filter(step => completedSteps.includes(step.id)).length;
  const currentStepInStage = stageSteps.findIndex(step => step.id === currentStep) + 1;

  return {
    stageNumber: stageData.stageNumber,
    currentStepInStage: currentStepInStage || 1,
    totalStepsInStage: stageData.totalSteps,
    stagePercentage: Math.round((completedInStage / stageData.totalSteps) * 100)
  };
};

// Re-export types from SOPTypes for convenience
export type { SOPStage, SOPStep } from '../../core/types/SOPTypes';
export { STAGE_METADATA } from '../../core/types/SOPTypes';