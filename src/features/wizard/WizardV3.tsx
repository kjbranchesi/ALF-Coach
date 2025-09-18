import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import type { ProjectV3 } from '../../types/alf';
import { normalizeProjectV3 } from '../../utils/normalizeProject';
import { type WizardDataV3 } from './wizardSchema';
import type { StepComponentProps } from './types';

// Lazy load step components to prevent them from being in the main bundle
const ProjectIntakeStep = lazy(() => import('./steps/ProjectIntakeStep').then(m => ({ default: m.ProjectIntakeStep })));
const GoalsEQStep = lazy(() => import('./steps/GoalsEQStep').then(m => ({ default: m.GoalsEQStep })));
const StandardsAlignmentStep = lazy(() => import('./steps/StandardsAlignmentStep').then(m => ({ default: m.StandardsAlignmentStep })));
const PhasesMilestonesStep = lazy(() => import('./steps/PhasesMilestonesStep').then(m => ({ default: m.PhasesMilestonesStep })));
const ArtifactsRubricsStep = lazy(() => import('./steps/ArtifactsRubricsStep').then(m => ({ default: m.ArtifactsRubricsStep })));
const DifferentiationStep = lazy(() => import('./steps/DifferentiationStep').then(m => ({ default: m.DifferentiationStep })));
const EvidenceLogisticsStep = lazy(() => import('./steps/EvidenceLogisticsStep').then(m => ({ default: m.EvidenceLogisticsStep })));
const ReviewExportStep = lazy(() => import('./steps/ReviewExportStep').then(m => ({ default: m.ReviewExportStep })));

export type WizardStepId =
  | 'context'
  | 'core-goals'
  | 'standards'
  | 'structure'
  | 'assessment'
  | 'differentiation'
  | 'logistics'
  | 'review';

interface WizardStepConfig {
  id: WizardStepId;
  name: string;
  description: string;
  tier: 'core' | 'scaffold' | 'aspirational';
  helpText?: string;
  stage: string;
  component: React.LazyExoticComponent<React.ComponentType<StepComponentProps>>;
}

export const WIZARD_STEP_CONFIGS: WizardStepConfig[] = [
  {
    id: 'context',
    name: 'Classroom Context',
    description: 'Capture the essential classroom details that shape this project.',
    tier: 'core',
    helpText: 'We use this info to tailor examples, supports, and pacing to your learners.',
    stage: 'context',
    component: ProjectIntakeStep
  },
  {
    id: 'core-goals',
    name: 'Goals & Big Idea',
    description: 'Define the learning goals, big idea, and essential question that anchor the work.',
    tier: 'core',
    helpText: 'Focus on transfer: what do students understand and do long after the project?',
    stage: 'core-goals',
    component: GoalsEQStep
  },
  {
    id: 'standards',
    name: 'Standards Alignment',
    description: 'Connect the project to standards for clarity and accountability.',
    tier: 'core',
    helpText: 'Pick the standards you truly expect students to demonstrate through the project.',
    stage: 'standards',
    component: StandardsAlignmentStep
  },
  {
    id: 'structure',
    name: 'Phases & Milestones',
    description: 'Shape the learning journey and key checkpoints.',
    tier: 'scaffold',
    helpText: 'Use the templates as a starting point—everything is editable later.',
    stage: 'structure',
    component: PhasesMilestonesStep
  },
  {
    id: 'assessment',
    name: 'Artifacts & Rubrics',
    description: 'Decide how learning will be evidenced and evaluated.',
    tier: 'scaffold',
    helpText: 'Identify the few high-leverage artifacts that showcase growth.',
    stage: 'assessment',
    component: ArtifactsRubricsStep
  },
  {
    id: 'differentiation',
    name: 'Differentiation & Roles',
    description: 'Plan supports, roles, and scaffolds so every learner can thrive.',
    tier: 'scaffold',
    helpText: 'Capture at least one support or role so the AI can suggest aligned strategies.',
    stage: 'differentiation',
    component: DifferentiationStep
  },
  {
    id: 'logistics',
    name: 'Logistics & Evidence',
    description: 'Outline evidence plans, communications, risks, and exhibition ideas.',
    tier: 'aspirational',
    helpText: 'We surface the logistics that often derail projects so you can stay ahead of them.',
    stage: 'logistics',
    component: EvidenceLogisticsStep
  },
  {
    id: 'review',
    name: 'Review & Handoff',
    description: 'Confirm the snapshot and hand off to the AI design partner.',
    tier: 'aspirational',
    helpText: 'Review highlights, confirm completeness, and launch the chat experience.',
    stage: 'handoff',
    component: ReviewExportStep
  }
];

interface WizardV3Props {
  onComplete: (project: ProjectV3) => void;
  onSave?: (payload: { data: Partial<WizardDataV3>; stepId: WizardStepId; stepIndex: number }) => void;
  onStepChange?: (payload: { stepId: WizardStepId; stepIndex: number }) => void;
  initialData?: Partial<WizardDataV3>;
}

export const WizardV3: React.FC<WizardV3Props> = ({
  onComplete,
  onSave,
  onStepChange,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<WizardDataV3>>(initialData);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = WIZARD_STEP_CONFIGS;
  const step = steps[currentStep];

  // Handle step data updates
  const handleStepUpdate = useCallback((stepData: Partial<WizardDataV3>) => {
    setWizardData(prev => {
      const updatedData = { ...prev, ...stepData };

      if (onSave) {
        onSave({ data: updatedData, stepId: step.id, stepIndex: currentStep });
      }

      setStepValidation(prevValidation => ({ ...prevValidation, [currentStep]: true }));
      return updatedData;
    });
  }, [currentStep, onSave, step.id]);

  // Handle navigation
  const goToNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete wizard
      handleComplete();
    }
  }, [currentStep, steps.length]);

  const goToPrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  useEffect(() => {
    onStepChange?.({ stepId: step.id, stepIndex: currentStep });
  }, [currentStep, onStepChange, step.id]);

  // Handle wizard completion
  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      // Convert wizard data to ProjectV3 structure
      const project = normalizeProjectV3(wizardData as WizardDataV3);
      onComplete(project);
    } catch (error) {
      console.error('Error completing wizard:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading component for lazy loaded steps
  const StepLoader = () => (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Loading step...</p>
      </div>
    </div>
  );

  // Render current step component
  const renderStepContent = () => {
    const commonProps = {
      data: wizardData,
      onUpdate: handleStepUpdate,
      onNext: goToNext,
      onBack: goToPrevious
    };

    const StepComponent = step.component;

    return (
      <Suspense fallback={<StepLoader />}>
        <StepComponent {...commonProps} onComplete={handleComplete} />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Progress header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Step indicators */}
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => stepValidation[idx] && goToStep(idx)}
                disabled={!stepValidation[idx] && idx !== currentStep}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${idx === currentStep 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : stepValidation[idx]
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 cursor-pointer'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                  {stepValidation[idx] ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </span>
                <span className="hidden md:inline">{s.name}</span>
              </button>
            ))}
          </div>
          
          {/* Current step info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {step.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {step.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Step {currentStep + 1} of {steps.length}</span>
              {step.tier && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${step.tier === 'core' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : step.tier === 'scaffold'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }
                `}>
                  {step.tier === 'core' ? 'ALF Generated' : step.tier === 'scaffold' ? 'Teacher Input' : 'Inspiration'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
              ${currentStep === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
              }
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {/* Save draft button */}
            <button
              onClick={() => onSave && onSave({ data: wizardData, stepId: step.id, stepIndex: currentStep })}
              className="px-6 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Save Draft
            </button>

            {/* Next/Complete button */}
            <button
              onClick={goToNext}
              disabled={isProcessing}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                ${isProcessing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : currentStep === steps.length - 1
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
                }
              `}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Complete
                  <Check className="w-5 h-5" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-primary-800 dark:text-primary-300">
                <strong>Tip:</strong> {step.helpText || 'Complete each step to build your comprehensive PBL blueprint. You can go back to review or edit previous steps at any time.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
