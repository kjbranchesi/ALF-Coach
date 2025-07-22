import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { wizardSchema, defaultWizardData, type WizardData } from './wizardSchema';
import { useWizardData } from './useWizardData';
import { 
  ArrowRightIcon, 
  ArrowLeftIcon, 
  CheckIcon, 
  EditIcon 
} from '../../components/icons/ButtonIcons';

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
  { id: 'motivation', label: 'Motivation', component: MotivationStep },
  { id: 'subject', label: 'Subject', component: SubjectStep },
  { id: 'age', label: 'Age Group', component: AgeStep },
  { id: 'location', label: 'Location', component: LocationStep },
  { id: 'materials', label: 'Materials', component: MaterialsStep },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Your Blueprint</h1>
          <p className="text-slate-600">Let's gather some information to help design your perfect learning experience</p>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => index < currentStepIndex && handleJumpToStep(index)}
                  disabled={index > currentStepIndex}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full transition-all
                    ${index === currentStepIndex 
                      ? 'bg-blue-600 text-white' 
                      : index < currentStepIndex 
                        ? 'bg-green-500 text-white cursor-pointer hover:bg-green-600' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {index < currentStepIndex ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div 
                    className={`
                      flex-1 h-1 mx-2 transition-all
                      ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            {steps.map((step, index) => (
              <span 
                key={step.id}
                className={`
                  text-xs transition-all
                  ${index === currentStepIndex 
                    ? 'text-blue-600 font-medium' 
                    : index < currentStepIndex 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                  }
                `}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-soft p-8 min-h-[400px] relative overflow-hidden">
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
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="
                  flex items-center gap-2 px-6 py-3 rounded-lg
                  bg-gray-100 hover:bg-gray-200 text-gray-700
                  transition-all duration-200
                "
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Previous
              </button>
            )}
            
            {!isLastStep ? (
              <button
                onClick={handleNext}
                disabled={!canProceed(currentStep.id as keyof WizardData)}
                className="
                  flex items-center gap-2 px-6 py-3 rounded-lg
                  bg-blue-600 hover:bg-blue-700 text-white
                  disabled:bg-gray-300 disabled:cursor-not-allowed
                  transition-all duration-200
                "
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="
                  flex items-center gap-2 px-8 py-3 rounded-lg
                  bg-gradient-to-r from-blue-600 to-purple-600 text-white
                  hover:from-blue-700 hover:to-purple-700
                  transition-all duration-200 shadow-lg hover:shadow-xl
                "
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <CheckIcon className="w-5 h-5" />
                </motion.div>
                Go to Ideation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}