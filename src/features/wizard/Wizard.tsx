import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { wizardSchema, defaultWizardData, type WizardData } from './wizardSchema';
import { useWizardData } from './useWizardData';
import { useWizardFlow } from '../../hooks/useProjectDataHooks';
import { useAuth } from '../../hooks/useAuth';
import { ModernWizardLayout } from './ModernWizardLayout';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { ALFOnboarding } from './ALFOnboarding';
import '../../styles/design-system.css';

// Step Components
import { VisionStep } from './steps/VisionStep';
import { SubjectScopeStep } from './steps/SubjectScopeStep';
import { StudentsStep } from './steps/StudentsStep';
import { ReviewStep } from './steps/ReviewStep';
import { InlineProcessGuide } from './components/InlineProcessGuide';

interface WizardProps {
  onComplete: (projectId: string) => void;
  onCancel?: () => void;
}

  const steps = [
    { id: 'vision', label: 'Vision', component: VisionStep },
    { id: 'subjectScope', label: 'Subject & Time', component: SubjectScopeStep },
    { id: 'students', label: 'Students', component: StudentsStep },
    { id: 'review', label: 'Review', component: ReviewStep }
  ];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export function Wizard({ onComplete, onCancel }: WizardProps) {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [direction, setDirection] = useState(0);
  
  // Use new data framework
  const {
    wizardData,
    currentStep,
    setCurrentStep,
    validationErrors,
    isLoading,
    error,
    updateWizardField,
    canProceedToStep,
    completeWizard
  } = useWizardFlow();
  
  // Legacy compatibility
  const data = wizardData || defaultWizardData;
  const errors = validationErrors;
  const isCompleting = isLoading;
  const currentStepIndex = currentStep;
  
  const updateField = updateWizardField;
  const canProceed = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    return stepIndex >= 0 ? canProceedToStep(stepIndex) : false;
  };
  
  // Use steps directly without filtering
  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep.component;
  
  // Determine current phase for process guide
  const getCurrentPhase = () => {
    if (currentStepIndex <= 2) return 'grounding'; // Vision, Subject, Students
    if (currentStepIndex === 3) return 'journey'; // Review
    return 'complete';
  };

  const handleNext = () => {
    // Check if we can proceed from current step
    if (canProceedToStep(currentStepIndex)) {
      // Move to next step
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
    // Validation errors are handled by the useWizardFlow hook
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const handleJumpToStep = (stepIndex: number) => {
    setDirection(stepIndex > currentStepIndex ? 1 : -1);
    setCurrentStep(stepIndex);
  };

  const handleComplete = async () => {
    if (isCompleting) return; // Prevent double-clicks
    
    try {
      // Get effective user ID for anonymous users
      const userId = user?.uid || (user?.isAnonymous ? 'anonymous' : 'anonymous');
      
      console.log('Creating project with wizard data...');
      const projectId = await completeWizard(userId, data.projectTopic);
      
      console.log('Project created successfully:', projectId);
      await onComplete(projectId);
    } catch (error) {
      console.error('Project creation error:', error);
      // Show user-friendly error message
      alert('Failed to create project. Please check your information and try again.');
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Show ALF onboarding first
  if (showOnboarding) {
    return (
      <ALFOnboarding 
        onComplete={() => setShowOnboarding(false)}
        onSkip={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <ModernWizardLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      onCancel={onCancel || (() => {})}
      showProgress={true}
    >
      {/* Inline Process Guide - shows ALF stages without blocking */}
      <div className="mb-6">
        <InlineProcessGuide 
          currentPhase={getCurrentPhase() as 'grounding' | 'journey' | 'complete'} 
          showTooltip={true}
        />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentStepIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full"
        >
          <StepComponent
            data={data}
            updateField={updateField}
            error={errors[currentStep.id] || Object.values(validationErrors)[0]}
            onJumpToStep={handleJumpToStep}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          {!isFirstStep ? (
            <button
              onClick={handlePrevious}
              className="modern-button modern-button-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}
          
          {!isLastStep ? (
            <button
              onClick={handleNext}
              disabled={!canProceed(currentStep.id)}
              className="modern-button modern-button-primary"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isCompleting || !canProceed('review')}
              className="modern-button bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl px-8 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canProceed('review') ? 'Please complete all required fields' : ''}
            >
              {isCompleting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Blueprint...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Go to Ideation
                </>
              )}
            </button>
          )}
        </div>
    </ModernWizardLayout>
  );
}