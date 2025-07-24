import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { wizardSchema, defaultWizardData, type WizardData } from './wizardSchema';
import { useWizardData } from './useWizardData';
import { ModernWizardLayout } from './ModernWizardLayout';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import '../../styles/design-system.css';

// Step Components
import { MotivationStep } from './steps/MotivationStep';
import { SubjectStep } from './steps/SubjectStep';
import { AgeStep } from './steps/AgeStep';
import { LocationStep } from './steps/LocationStep';
import { MaterialsStep } from './steps/MaterialsStep';
import { ScopeStep } from './steps/ScopeStep';
import { ReviewStep } from './steps/ReviewStep';

interface WizardProps {
  onComplete: (data: WizardData) => void;
  onCancel?: () => void;
}

const steps = [
  { id: 'motivation', label: 'Goals', component: MotivationStep },
  { id: 'subject', label: 'Subject', component: SubjectStep },
  { id: 'age', label: 'Students', component: AgeStep },
  { id: 'location', label: 'Location', component: LocationStep },
  { id: 'materials', label: 'Resources', component: MaterialsStep },
  { id: 'scope', label: 'Scope', component: ScopeStep },
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
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { data, updateField, canProceed } = useWizardData();
  
  const currentStep = steps[currentStepIndex];
  const StepComponent = currentStep.component;

  const handleNext = () => {
    // Validate current step
    try {
      const stepField = currentStep.id as keyof WizardData;
      if (stepField !== 'review') {
        const fieldSchema = wizardSchema.shape[stepField];
        if (fieldSchema) {
          fieldSchema.parse(data[stepField]);
        }
      }
      
      // Clear any errors for this field
      setErrors(prev => ({ ...prev, [stepField]: '' }));
      
      // Move to next step
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const stepField = currentStep.id;
        setErrors(prev => ({ 
          ...prev, 
          [stepField]: error.errors[0]?.message || 'Invalid input' 
        }));
      }
    }
  };

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentStepIndex(prev => prev - 1);
  };

  const handleJumpToStep = (stepIndex: number) => {
    setDirection(stepIndex > currentStepIndex ? 1 : -1);
    setCurrentStepIndex(stepIndex);
  };

  const handleComplete = () => {
    // Final validation
    try {
      const validatedData = wizardSchema.parse(data);
      onComplete(validatedData);
    } catch (error) {
      console.error('Validation error:', error);
      // Handle validation errors
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <ModernWizardLayout
      currentStep={currentStepIndex + 1}
      totalSteps={steps.length}
      onCancel={onCancel || (() => {})}
    >
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
            error={errors[currentStep.id]}
            onJumpToStep={handleJumpToStep}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
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
            disabled={!canProceed(currentStep.id as keyof WizardData)}
            className="modern-button modern-button-primary"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="modern-button bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl px-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Go to Ideation
          </button>
        )}
      </div>
    </ModernWizardLayout>
  );
}