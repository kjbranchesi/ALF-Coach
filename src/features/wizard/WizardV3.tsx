import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  NotebookPen,
  Sparkles,
  Target
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ProjectV3 } from '../../types/alf';
import { normalizeProjectV3 } from '../../utils/normalizeProject';
import { type WizardDataV3 } from './wizardSchema';
import type { StepComponentProps } from './types';

// Lazy load step components to prevent them from being in the main bundle
const ProjectIntakeStep = lazy(() => import('./steps/ProjectIntakeStep').then(m => ({ default: m.ProjectIntakeStep })));
const StandardsAlignmentStep = lazy(() => import('./steps/StandardsAlignmentStep').then(m => ({ default: m.StandardsAlignmentStep })));
const DesignStudioIntroStep = lazy(() => import('./steps/DesignStudioIntroStep').then(m => ({ default: m.DesignStudioIntroStep })));

export type WizardStepId =
  | 'context'
  | 'standards'
  | 'handoff';

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
    id: 'standards',
    name: 'Must-Hit Standards',
    description: 'Select the standards ALF should design toward and reference in drafts.',
    tier: 'core',
    helpText: 'Choose the most important standards—ALF will weave them into goals and milestones.',
    stage: 'standards',
    icon: Target,
    component: StandardsAlignmentStep
  },
  {
    id: 'handoff',
    name: 'Design Studio Handoff',
    description: 'Review your setup and continue with ALF for co-design.',
    tier: 'core',
    stage: 'handoff',
    icon: Sparkles,
    component: DesignStudioIntroStep
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
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.innerWidth >= 1024;
  });
  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

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
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-primary-500 dark:text-primary-300">
                  ALF Project Builder
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                    {step.name}
                  </h2>
                  {step.tier && (
                    <span className={`
                      inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide
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
                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <div className="min-w-[200px] sm:min-w-[240px]">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700/70">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-primary-600 dark:text-primary-300">
                      {stepProgressLabel}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 sm:max-w-[220px]">
                  Finish the setup here and ALF will co-design goals, milestones, and supports with you in the studio.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNavExpanded(prev => !prev)}
                  aria-expanded={isNavExpanded}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-primary-200 hover:text-primary-600 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-primary-500/40 dark:hover:text-primary-300"
                >
                  <span className="flex items-center gap-1">
                    {isNavExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Step map
                  </span>
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {isNavExpanded && (
                <motion.nav
                  key="step-map"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" role="list">
                    {steps.map((s, idx) => {
                      const Icon = s.icon;
                      const isCurrent = idx === currentStep;
                      const isComplete = idx < currentStep;
                      const canNavigate = idx <= currentStep || Boolean(stepValidation[idx]);
                      const statusLabel = isComplete ? 'Completed' : isCurrent ? 'In progress' : 'Up next';
                      const cardBase = 'group relative flex flex-col gap-2 rounded-xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/30';
                      const stateClasses = isCurrent
                        ? 'border-primary-300 bg-white shadow-lg shadow-primary-500/10 dark:bg-slate-900 dark:border-primary-500/40'
                        : isComplete
                          ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-900/20'
                          : 'border-slate-200/70 bg-white/70 dark:border-slate-700/60 dark:bg-slate-900/60';
                      const hoverClasses = canNavigate ? 'hover:-translate-y-0.5 hover:shadow-md' : '';
                      const iconClasses = isCurrent
                        ? 'bg-primary-600 text-white'
                        : isComplete
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
                      const stepTone = isCurrent
                        ? 'text-primary-600 dark:text-primary-300'
                        : isComplete
                          ? 'text-emerald-600 dark:text-emerald-300'
                          : 'text-slate-500 dark:text-slate-400';
                      const labelColor = isCurrent
                        ? 'text-slate-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-200';

                      return (
                        <button
                          key={s.id}
                          type="button"
                          role="listitem"
                          onClick={() => canNavigate && goToStep(idx)}
                          disabled={!canNavigate}
                          aria-current={isCurrent ? 'step' : undefined}
                          aria-label={`Step ${idx + 1}: ${s.name}`}
                          className={`${cardBase} ${stateClasses} ${hoverClasses} ${!canNavigate ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold ${iconClasses}`}>
                              <Icon className="h-[14px] w-[14px]" />
                            </span>
                            <span className={stepTone}>Step {idx + 1}</span>
                          </div>
                          <p className={`text-sm font-semibold leading-snug ${labelColor} line-clamp-2`}>{s.name}</p>
                          <p className="text-[11px] leading-4 text-slate-500 dark:text-slate-400 line-clamp-2">
                            {statusLabel}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
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
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg'
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
                  Open ALF Design Studio
                  <Sparkles className="w-5 h-5" />
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
                <strong>Tip:</strong> {step.helpText || 'You can revisit these setup details any time. ALF uses them to ground every suggestion in the design studio.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
