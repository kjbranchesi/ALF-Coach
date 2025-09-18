import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  NotebookPen,
  Sparkles,
  Target,
  Route,
  ClipboardCheck,
  Users,
  CalendarClock,
  Flag
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  icon: LucideIcon;
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
    icon: NotebookPen,
    component: ProjectIntakeStep
  },
  {
    id: 'core-goals',
    name: 'Goals & Big Idea',
    description: 'Define the learning goals, big idea, and essential question that anchor the work.',
    tier: 'core',
    helpText: 'Focus on transfer: what do students understand and do long after the project?',
    stage: 'core-goals',
    icon: Sparkles,
    component: GoalsEQStep
  },
  {
    id: 'standards',
    name: 'Standards Alignment',
    description: 'Connect the project to standards for clarity and accountability.',
    tier: 'core',
    helpText: 'Pick the standards you truly expect students to demonstrate through the project.',
    stage: 'standards',
    icon: Target,
    component: StandardsAlignmentStep
  },
  {
    id: 'structure',
    name: 'Phases & Milestones',
    description: 'Shape the learning journey and key checkpoints.',
    tier: 'scaffold',
    helpText: 'Use the templates as a starting point—everything is editable later.',
    stage: 'structure',
    icon: Route,
    component: PhasesMilestonesStep
  },
  {
    id: 'assessment',
    name: 'Artifacts & Rubrics',
    description: 'Decide how learning will be evidenced and evaluated.',
    tier: 'scaffold',
    helpText: 'Identify the few high-leverage artifacts that showcase growth.',
    stage: 'assessment',
    icon: ClipboardCheck,
    component: ArtifactsRubricsStep
  },
  {
    id: 'differentiation',
    name: 'Differentiation & Roles',
    description: 'Plan supports, roles, and scaffolds so every learner can thrive.',
    tier: 'scaffold',
    helpText: 'Capture at least one support or role so the AI can suggest aligned strategies.',
    stage: 'differentiation',
    icon: Users,
    component: DifferentiationStep
  },
  {
    id: 'logistics',
    name: 'Logistics & Evidence',
    description: 'Outline evidence plans, communications, risks, and exhibition ideas.',
    tier: 'aspirational',
    helpText: 'We surface the logistics that often derail projects so you can stay ahead of them.',
    stage: 'logistics',
    icon: CalendarClock,
    component: EvidenceLogisticsStep
  },
  {
    id: 'review',
    name: 'Review & Handoff',
    description: 'Confirm the snapshot and hand off to the AI design partner.',
    tier: 'aspirational',
    helpText: 'Review highlights, confirm completeness, and launch the chat experience.',
    stage: 'handoff',
    icon: Flag,
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

  const stepProgressLabel = `Step ${currentStep + 1} of ${steps.length}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Progress header */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500 dark:text-primary-300">
                  ALF Project Builder
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {step.name}
                  </h2>
                  {step.tier && (
                    <span className={`
                      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${step.tier === 'core'
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                        : step.tier === 'scaffold'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }
                    `}>
                      {step.tier === 'core'
                        ? 'ALF Generated Focus'
                        : step.tier === 'scaffold'
                          ? 'Your Input Needed'
                          : 'Inspiration'}
                    </span>
                  )}
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 max-w-3xl">
                  {step.description}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 dark:border-primary-500/30 bg-primary-50/70 dark:bg-primary-900/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-200">
                  {stepProgressLabel}
                </span>
                <p className="max-w-xs text-xs text-slate-500 dark:text-slate-400 sm:text-right">
                  Complete each module and ALF will meet you in the coaching chat to finalize your project.
                </p>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 top-1.5 bottom-1.5 w-8 bg-gradient-to-r from-white via-white/70 to-transparent dark:from-slate-900 dark:via-slate-900/70 dark:to-transparent hidden sm:block"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-1.5 bottom-1.5 w-8 bg-gradient-to-l from-white via-white/70 to-transparent dark:from-slate-900 dark:via-slate-900/70 dark:to-transparent hidden sm:block"
              />
              <div
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 scroll-smooth snap-x snap-mandatory"
                role="list"
              >
                {steps.map((s, idx) => {
                  const Icon = s.icon;
                  const isCurrent = idx === currentStep;
                  const isComplete = idx < currentStep;
                  const canNavigate = idx <= currentStep || Boolean(stepValidation[idx]);
                  const statusLabel = isComplete ? 'Completed' : isCurrent ? 'In progress' : 'Up next';
                  const cardBase = 'group relative flex-shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/40';
                  const stateClasses = isCurrent
                    ? 'bg-white dark:bg-slate-900 border-primary-200 dark:border-primary-500/40 shadow-xl shadow-primary-500/10'
                    : isComplete
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 shadow-lg shadow-emerald-500/10'
                      : 'bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700';
                  const hoverClasses = canNavigate && !isCurrent ? 'hover:-translate-y-1 hover:shadow-lg' : '';
                  const iconClasses = isCurrent
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : isComplete
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300';
                  const statusClasses = isCurrent
                    ? 'text-primary-600 dark:text-primary-300'
                    : isComplete
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-slate-500 dark:text-slate-400';
                  const progressBarColor = isCurrent
                    ? 'bg-primary-500'
                    : isComplete
                      ? 'bg-emerald-500'
                      : 'bg-slate-400/60';
                  const progressWidth = isComplete ? '100%' : isCurrent ? '75%' : '0%';

                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="listitem"
                      onClick={() => canNavigate && goToStep(idx)}
                      disabled={!canNavigate}
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-label={`Step ${idx + 1}: ${s.name}`}
                      className={`${cardBase} ${stateClasses} ${hoverClasses} ${!canNavigate ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} w-[12.5rem] sm:w-[13.5rem] min-h-[120px] flex flex-col`}
                    >
                      <div className="flex flex-1 flex-col justify-between px-4 py-4 sm:px-5 sm:py-5 gap-4">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClasses}`}>
                            <Icon className="w-[18px] h-[18px]" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              Step {idx + 1}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                              {s.name}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className={statusClasses}>{statusLabel}</span>
                          {isComplete && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                      </div>
                      <div className="h-1 w-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className={`h-full transition-all duration-300 ${progressBarColor}`}
                          style={{ width: progressWidth }}
                        ></div>
                      </div>
                    </button>
                  );
                })}
              </div>
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
            className="rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/80 p-8 sm:p-10 shadow-xl shadow-slate-900/10"
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
        <div className="mt-8 rounded-2xl border border-primary-200/70 dark:border-primary-900/40 bg-primary-50/80 dark:bg-primary-900/20 p-5 shadow-sm shadow-primary-500/10">
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
