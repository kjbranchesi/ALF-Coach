// ARCHIVED - ModernProgress
import React from 'react';
import { motion } from 'framer-motion';

interface Step {
  id: string;
  label: string;
}

interface ModernProgressProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ModernProgress: React.FC<ModernProgressProps> = ({ 
  steps, 
  currentStep, 
  className = '' 
}) => {
  const progressPercentage = steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div className={`relative py-8 bg-gray-50 dark:bg-gray-900 ${className}`}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-start relative">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div 
                key={step.id}
                className="flex flex-col items-center relative z-10"
                style={{ flex: '1' }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-3"
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    font-bold text-base transition-all duration-300 shadow-lg
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-blue-500/25 scale-110' 
                      : isCompleted 
                      ? 'bg-green-500 text-white shadow-green-500/25' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 shadow-gray-500/25'
                    }
                  `}>
                    {isCompleted ? (
                      <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                </motion.div>
                
                <motion.span
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className={`
                    text-sm font-semibold text-center px-2
                    ${isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : isCompleted 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </motion.span>
              </div>
            );
          })}
          
          {/* Progress Line - positioned behind the circles */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full"
               style={{ 
                 left: '6%', 
                 right: '6%',
                 zIndex: 0
               }}>
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
