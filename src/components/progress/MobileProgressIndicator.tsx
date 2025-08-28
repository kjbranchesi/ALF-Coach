/**
 * MobileProgressIndicator.tsx
 * 
 * Mobile-first progress indicator optimized for small screens
 * Features expandable details and touch-friendly interactions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Circle, ArrowRight } from 'lucide-react';
import { type SOPStage, STAGE_METADATA } from '../../core/types/SOPTypes';
import { STEP_FLOW } from './EnhancedProgressIndicator';

interface MobileProgressProps {
  currentStage: SOPStage;
  currentStep?: string;
  completedSteps: string[];
  onStepTap?: (stepId: string) => void;
}

export const MobileProgressIndicator: React.FC<MobileProgressProps> = ({
  currentStage,
  currentStep,
  completedSteps,
  onStepTap
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate progress
  const getProgress = () => {
    const totalSteps = 9;
    const completedCount = completedSteps.length;
    const currentStepNumber = getCurrentStepNumber();
    
    return {
      completed: completedCount,
      current: currentStepNumber,
      total: totalSteps,
      percentage: Math.round((completedCount / totalSteps) * 100)
    };
  };

  const getCurrentStepNumber = (): number => {
    if (!currentStep || currentStage === 'COMPLETED') return 0;
    
    for (const [, stageData] of Object.entries(STEP_FLOW)) {
      const step = stageData.steps.find(s => s.id === currentStep);
      if (step) return step.stepNumber;
    }
    return 0;
  };

  const progress = getProgress();

  // Get current stage info
  const getCurrentStageInfo = () => {
    if (currentStage === 'COMPLETED') return null;
    
    const stageData = STEP_FLOW[currentStage as keyof typeof STEP_FLOW];
    if (!stageData) return null;
    
    const currentStepInStage = stageData.steps.findIndex(step => step.id === currentStep) + 1;
    
    return {
      title: STAGE_METADATA[currentStage]?.title || 'Unknown Stage',
      stepInStage: currentStepInStage || 1,
      totalStepsInStage: stageData.totalSteps,
      stageNumber: stageData.stageNumber
    };
  };

  const stageInfo = getCurrentStageInfo();

  return (
    <div className="w-full">
      {/* Compact Header - Always Visible */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3"
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Progress Circle and Info */}
          <div className="flex items-center gap-3">
            {/* Circular Progress */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-blue-500"
                  strokeDasharray={`${(progress.percentage / 100) * 100.53} 100.53`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {progress.current}
                </span>
              </div>
            </div>

            {/* Text Info */}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Step {progress.current} of 9
                </h4>
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  {progress.percentage}%
                </span>
              </div>
              {stageInfo && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {stageInfo.title} • Step {stageInfo.stepInStage}/{stageInfo.totalStepsInStage}
                </p>
              )}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.div>
        </div>

        {/* Progress Dots */}
        <div className="mt-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 9 }, (_, i) => {
              const stepNumber = i + 1;
              const isCompleted = stepNumber <= progress.completed;
              const isCurrent = stepNumber === progress.current;
              
              return (
                <div
                  key={stepNumber}
                  className={`
                    h-1 flex-1 rounded-full transition-colors duration-300
                    ${isCompleted ? 'bg-green-500' : ''}
                    ${isCurrent ? 'bg-blue-500' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 dark:bg-gray-700' : ''}
                  `}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4">
              <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Detailed Progress
              </h5>

              {/* Stage Breakdown */}
              <div className="space-y-4">
                {Object.entries(STEP_FLOW).map(([stageKey, stageData]) => {
                  const stage = stageKey as SOPStage;
                  const isCurrentStage = currentStage === stage;
                  const stageCompleted = stageData.steps.every(step => 
                    completedSteps.includes(step.id)
                  );
                  const stageCompletedSteps = stageData.steps.filter(step => 
                    completedSteps.includes(step.id)
                  ).length;

                  return (
                    <div key={stage} className="relative">
                      {/* Stage Header */}
                      <div className={`
                        flex items-center p-2 rounded-lg
                        ${isCurrentStage ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        ${stageCompleted ? 'bg-green-50 dark:bg-green-900/20' : ''}
                      `}>
                        <div className={`
                          flex items-center justify-center w-6 h-6 rounded-full mr-3 flex-shrink-0
                          ${stageCompleted ? 'bg-green-500' : ''}
                          ${isCurrentStage && !stageCompleted ? 'bg-blue-500' : ''}
                          ${!isCurrentStage && !stageCompleted ? 'bg-gray-300 dark:bg-gray-600' : ''}
                        `}>
                          {stageCompleted ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <span className="text-xs font-bold text-white">
                              {stageData.stageNumber}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h6 className={`text-sm font-medium ${
                            isCurrentStage ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {STAGE_METADATA[stage]?.title}
                          </h6>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {stageCompletedSteps}/{stageData.totalSteps} steps
                          </p>
                        </div>

                        {isCurrentStage && (
                          <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Steps for current stage */}
                      {isCurrentStage && (
                        <div className="mt-2 ml-9 space-y-1">
                          {stageData.steps.map((step) => {
                            const isStepCompleted = completedSteps.includes(step.id);
                            const isStepCurrent = currentStep === step.id;
                            
                            return (
                              <motion.div
                                key={step.id}
                                className={`
                                  flex items-center p-2 rounded-md text-sm cursor-pointer
                                  ${isStepCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                                  ${isStepCompleted ? 'bg-green-100 dark:bg-green-900/30' : ''}
                                  ${!isStepCompleted && !isStepCurrent ? 'opacity-60' : ''}
                                `}
                                onClick={() => onStepTap?.(step.id)}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className={`
                                  flex items-center justify-center w-4 h-4 rounded-full mr-2 flex-shrink-0
                                  ${isStepCompleted ? 'bg-green-500' : ''}
                                  ${isStepCurrent ? 'bg-blue-500' : ''}
                                  ${!isStepCompleted && !isStepCurrent ? 'bg-gray-300 dark:bg-gray-600' : ''}
                                `}>
                                  {isStepCompleted ? (
                                    <Check className="w-2 h-2 text-white" />
                                  ) : (
                                    <span className="text-xs font-bold text-white">
                                      {step.stepNumber}
                                    </span>
                                  )}
                                </div>
                                
                                <span className={`font-medium ${
                                  isStepCurrent ? 'text-blue-800 dark:text-blue-200' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {step.label}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};