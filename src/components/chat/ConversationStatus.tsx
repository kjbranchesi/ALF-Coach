import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface ConversationStatusProps {
  currentStage: string;
  phase: string;
  capturedData: Map<string, any>;
  isWaitingForConfirmation: boolean;
}

const stageSteps = {
  IDEATION_INITIATOR: [
    { id: 'welcome', label: 'Welcome' },
    { id: 'start', label: 'Start Journey' }
  ],
  IDEATION_BIG_IDEA: [
    { id: 'explore', label: 'Explore Ideas' },
    { id: 'select', label: 'Select or Create' },
    { id: 'confirm', label: 'Confirm Choice' }
  ],
  IDEATION_EQ: [
    { id: 'explore', label: 'Review Questions' },
    { id: 'select', label: 'Choose Question' },
    { id: 'confirm', label: 'Finalize' }
  ],
  IDEATION_CHALLENGE: [
    { id: 'explore', label: 'Browse Challenges' },
    { id: 'select', label: 'Pick Challenge' },
    { id: 'confirm', label: 'Confirm' }
  ]
};

export function ConversationStatus({ currentStage, phase, capturedData, isWaitingForConfirmation }: ConversationStatusProps) {
  const steps = stageSteps[currentStage] || [];
  
  const getCurrentStep = () => {
    if (phase === 'WELCOME') {return 0;}
    if (isWaitingForConfirmation) {return 2;}
    if (capturedData.has('current')) {return 1;}
    return 0;
  };
  
  const currentStep = getCurrentStep();
  
  if (steps.length === 0) {return null;}
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Current Stage: {currentStage.replace(/_/g, ' ').toLowerCase()}
        </p>
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-1">
                {index < currentStep ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : index === currentStep ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Circle className="w-4 h-4 text-primary-500" />
                  </motion.div>
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-xs ${
                  index <= currentStep ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-gray-400" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {isWaitingForConfirmation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-primary-600 dark:text-primary-400 mt-2"
        >
          Please confirm your choice or click "Refine" to modify
        </motion.p>
      )}
    </motion.div>
  );
}