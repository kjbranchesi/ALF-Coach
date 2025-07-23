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
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className={`relative ${className}`}>
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div 
              key={step.id}
              className="flex flex-col items-center"
              style={{ flex: index === 0 || index === steps.length - 1 ? '0 0 auto' : '1' }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative z-10"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                    : isCompleted 
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' 
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }
                `}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
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
                  mt-2 text-xs font-medium text-center max-w-[100px]
                  ${isActive ? 'text-indigo-700' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                `}
              >
                {step.label}
              </motion.span>
            </div>
          );
        })}
      </div>
      
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" 
           style={{ 
             left: '5%', 
             right: '5%',
             zIndex: 0
           }}>
        <motion.div
          className="h-full bg-indigo-600"
          initial={{ width: '0%' }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
};