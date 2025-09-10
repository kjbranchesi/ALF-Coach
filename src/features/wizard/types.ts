import { WizardDataV3 } from './wizardSchema';

/**
 * Type-safe props for all wizard step components
 */
export interface StepComponentProps {
  data: Partial<WizardDataV3>;
  onUpdate: (updates: Partial<WizardDataV3>) => void;
  onNext: () => void;
  onBack: () => void;
  onComplete?: () => void;
}

/**
 * Validation result for step data
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

/**
 * Step validation configuration
 */
export interface StepValidation {
  required: Array<keyof WizardDataV3>;
  validate: (data: Partial<WizardDataV3>) => ValidationResult;
}

/**
 * Wizard state management
 */
export interface WizardState {
  currentStep: number;
  data: Partial<WizardDataV3>;
  validation: Record<number, ValidationResult>;
  isDirty: boolean;
  isProcessing: boolean;
  lastSaved?: Date;
}

/**
 * Wizard action types for state management
 */
export type WizardAction = 
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; stepIndex: number }
  | { type: 'UPDATE_DATA'; payload: Partial<WizardDataV3> }
  | { type: 'VALIDATE_STEP'; stepIndex: number; result: ValidationResult }
  | { type: 'SET_PROCESSING'; isProcessing: boolean }
  | { type: 'SAVE_DRAFT'; timestamp: Date }
  | { type: 'RESET' }
  | { type: 'COMPLETE' };

/**
 * Enhanced step metadata
 */
export interface EnhancedStepMetadata {
  name: string;
  description: string;
  tier: 'core' | 'scaffold' | 'aspirational';
  helpText?: string;
  validation?: StepValidation;
  dependencies?: number[]; // Indices of steps that must be completed first
  estimatedTime?: string; // e.g., "5 minutes"
}