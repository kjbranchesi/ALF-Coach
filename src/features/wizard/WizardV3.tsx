import React, { useState, useCallback, useReducer, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { ChatFlowStep, ChatFlowSteps } from '../../types/chat';
import { WizardDataV3 } from './wizardSchema';
import { ProjectV3 } from '../../types/alf';
import { normalizeProjectV3 } from '../../utils/normalizeProject';
import { WizardState, WizardAction, ValidationResult } from './types';

// Import step components (we'll create these next)
import { ProjectIntakeStep } from './steps/ProjectIntakeStep';
import { GoalsEQStep } from './steps/GoalsEQStep';
import { StandardsAlignmentStep } from './steps/StandardsAlignmentStep';
import { PhasesMilestonesStep } from './steps/PhasesMilestonesStep';
import { ArtifactsRubricsStep } from './steps/ArtifactsRubricsStep';
import { DifferentiationStep } from './steps/DifferentiationStep';
import { ExhibitionStep } from './steps/ExhibitionStep';
import { EvidenceLogisticsStep } from './steps/EvidenceLogisticsStep';
import { ReviewExportStep } from './steps/ReviewExportStep';

interface WizardV3Props {
  onComplete: (project: ProjectV3) => void;
  onSave?: (partialData: Partial<WizardDataV3>) => void;
  initialData?: Partial<WizardDataV3>;
}

export const WizardV3: React.FC<WizardV3Props> = ({
  onComplete,
  onSave,
  initialData = {}
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<WizardDataV3>>(initialData);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Get current step configuration
  const steps = ChatFlowSteps;
  const step = steps[currentStep];

  // Handle step data updates
  const handleStepUpdate = useCallback((stepData: any) => {
    const updatedData = { ...wizardData, ...stepData };
    setWizardData(updatedData);
    
    // Auto-save if handler provided
    if (onSave) {
      onSave(updatedData);
    }
    
    // Mark step as valid
    setStepValidation(prev => ({ ...prev, [currentStep]: true }));
  }, [wizardData, currentStep, onSave]);

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

  // Render current step component
  const renderStepContent = () => {
    const commonProps = {
      data: wizardData,
      onUpdate: handleStepUpdate,
      onNext: goToNext,
      onBack: goToPrevious
    };

    switch (currentStep) {
      case 0:
        return <ProjectIntakeStep {...commonProps} />;
      case 1:
        return <GoalsEQStep {...commonProps} />;
      case 2:
        return <StandardsAlignmentStep {...commonProps} />;
      case 3:
        return <PhasesMilestonesStep {...commonProps} />;
      case 4:
        return <ArtifactsRubricsStep {...commonProps} />;
      case 5:
        return <DifferentiationStep {...commonProps} />;
      case 6:
        return <ExhibitionStep {...commonProps} />;
      case 7:
        return <EvidenceLogisticsStep {...commonProps} />;
      case 8:
        return <ReviewExportStep {...commonProps} onComplete={handleComplete} />;
      default:
        return null;
    }
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
                    ? 'bg-blue-600 text-white shadow-lg' 
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
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
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
              onClick={() => onSave && onSave(wizardData)}
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
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
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
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Tip:</strong> {step.helpText || 'Complete each step to build your comprehensive PBL blueprint. You can go back to review or edit previous steps at any time.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};