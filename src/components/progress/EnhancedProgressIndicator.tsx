/**
 * EnhancedProgressIndicator.tsx
 * 
 * Comprehensive progress indicator system for ALF Coach
 * Shows detailed step progress across the 9-step flow with stage breakdown
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, ChevronRight, Info, ArrowRight } from 'lucide-react';
import { type SOPStage, STAGE_METADATA } from '../../core/types/SOPTypes';
import { tokens } from '../../design-system/tokens';

// Step mapping for the complete 9-step flow
export const STEP_FLOW = {
  // Ideation Stage (Steps 1-3)
  IDEATION: {
    steps: [
      { id: 'BIG_IDEA', label: 'Big Idea', stepNumber: 1, description: 'Define the core concept that drives authentic learning' },
      { id: 'ESSENTIAL_QUESTION', label: 'Essential Question', stepNumber: 2, description: 'Craft the question that guides student inquiry' },
      { id: 'CHALLENGE', label: 'Challenge', stepNumber: 3, description: 'Design the authentic problem students will solve' }
    ],
    stageNumber: 1,
    totalSteps: 3
  },
  // Journey Stage (Steps 4-6)
  JOURNEY: {
    steps: [
      { id: 'PHASES', label: 'Learning Phases', stepNumber: 4, description: 'Map the creative process phases students will navigate' },
      { id: 'ACTIVITIES', label: 'Activities', stepNumber: 5, description: 'Define engaging activities for each phase' },
      { id: 'RESOURCES', label: 'Resources', stepNumber: 6, description: 'Curate materials and tools students need' }
    ],
    stageNumber: 2,
    totalSteps: 3
  },
  // Deliverables Stage (Steps 7-9)
  DELIVERABLES: {
    steps: [
      { id: 'MILESTONES', label: 'Milestones', stepNumber: 7, description: 'Set checkpoints and deliverables' },
      { id: 'RUBRIC', label: 'Assessment', stepNumber: 8, description: 'Create rubric and success criteria' },
      { id: 'IMPACT', label: 'Real Impact', stepNumber: 9, description: 'Define how students share their work with the world' }
    ],
    stageNumber: 3,
    totalSteps: 3
  }
} as const;

interface ProgressData {
  currentStage: SOPStage;
  currentStep?: string;
  completedSteps: string[];
  totalSteps: number;
}

interface EnhancedProgressIndicatorProps {
  progress: ProgressData;
  variant?: 'horizontal' | 'compact' | 'floating';
  showDetails?: boolean;
  className?: string;
  onStepClick?: (stepId: string) => void;
}

export const EnhancedProgressIndicator: React.FC<EnhancedProgressIndicatorProps> = ({
  progress,
  variant = 'horizontal',
  showDetails = true,
  className = '',
  onStepClick
}) => {
  const [expandedStage, setExpandedStage] = useState<SOPStage | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Calculate overall progress
  const getOverallProgress = () => {
    const totalCompleted = progress.completedSteps.length;
    const currentStepNumber = getCurrentStepNumber();
    const activeStepProgress = currentStepNumber > 0 ? 1 : 0;
    return {
      completed: totalCompleted,
      current: currentStepNumber,
      total: 9,
      percentage: Math.round((totalCompleted / 9) * 100)
    };
  };

  // Get current step number (1-9)
  const getCurrentStepNumber = (): number => {
    if (!progress.currentStep || progress.currentStage === 'COMPLETED') {return 0;}
    
    for (const [stage, data] of Object.entries(STEP_FLOW)) {
      const step = data.steps.find(s => s.id === progress.currentStep);
      if (step) {return step.stepNumber;}
    }
    return 0;
  };

  // Get step status
  const getStepStatus = (stepId: string): 'completed' | 'current' | 'upcoming' => {
    if (progress.completedSteps.includes(stepId)) {return 'completed';}
    if (progress.currentStep === stepId) {return 'current';}
    return 'upcoming';
  };

  // Render horizontal desktop version
  if (variant === 'horizontal') {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm ${className}`}>
        {/* Overall Progress Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Progress
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Step {getCurrentStepNumber()} of 9 • {getOverallProgress().percentage}% Complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {getOverallProgress().percentage}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getOverallProgress().completed} completed
              </div>
            </div>
          </div>
          
          {/* Overall Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getOverallProgress().percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Stages and Steps */}
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(STEP_FLOW).map(([stageKey, stageData]) => {
              const stage = stageKey as SOPStage;
              const isCurrentStage = progress.currentStage === stage;
              const stageCompleted = stageData.steps.every(step => 
                progress.completedSteps.includes(step.id)
              );
              
              return (
                <div key={stage} className="relative">
                  {/* Stage Header */}
                  <div className="flex items-center mb-4">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2 mr-3
                      ${stageCompleted ? 'bg-green-500 border-green-500' : ''}
                      ${isCurrentStage && !stageCompleted ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''}
                      ${!isCurrentStage && !stageCompleted ? 'border-gray-300 dark:border-gray-600' : ''}
                    `}>
                      {stageCompleted ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span className={`text-sm font-semibold ${
                          isCurrentStage ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {stageData.stageNumber}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${
                        isCurrentStage ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {STAGE_METADATA[stage]?.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stageData.steps.length} steps
                      </p>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="ml-11 space-y-2">
                    {stageData.steps.map((step, index) => {
                      const status = getStepStatus(step.id);
                      const isLast = index === stageData.steps.length - 1;
                      
                      return (
                        <motion.div
                          key={step.id}
                          className={`
                            relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${status === 'current' ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-700' : ''}
                            ${status === 'completed' ? 'bg-green-50 dark:bg-green-900/20' : ''}
                            ${status === 'upcoming' ? 'opacity-60' : ''}
                            hover:shadow-sm
                          `}
                          onClick={() => onStepClick?.(step.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          {/* Step connector line */}
                          {!isLast && (
                            <div className="absolute left-4 top-12 w-px h-6 bg-gray-200 dark:bg-gray-600" />
                          )}
                          
                          {/* Step indicator */}
                          <div className={`
                            flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mr-3
                            ${status === 'completed' ? 'bg-green-500 text-white' : ''}
                            ${status === 'current' ? 'bg-primary-500 text-white' : ''}
                            ${status === 'upcoming' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400' : ''}
                          `}>
                            {status === 'completed' ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span className="text-xs font-semibold">{step.stepNumber}</span>
                            )}
                          </div>

                          {/* Step content */}
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <h5 className={`text-sm font-medium ${
                                status === 'current' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {step.label}
                              </h5>
                              {status === 'current' && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className="flex items-center text-primary-600 dark:text-primary-400"
                                >
                                  <span className="text-xs font-medium mr-1">Current</span>
                                  <ArrowRight className="w-3 h-3" />
                                </motion.div>
                              )}
                            </div>
                            {showDetails && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {step.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Compact variant for mobile/sidebar
  if (variant === 'compact') {
    const overallProgress = getOverallProgress();
    
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-4">
          {/* Compact header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Progress
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {overallProgress.current}/9
            </span>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 9 }, (_, i) => {
              const stepNumber = i + 1;
              const isCompleted = stepNumber <= overallProgress.completed;
              const isCurrent = stepNumber === overallProgress.current;
              
              return (
                <div
                  key={stepNumber}
                  className={`
                    w-2 h-2 rounded-full transition-colors duration-200
                    ${isCompleted ? 'bg-green-500' : ''}
                    ${isCurrent ? 'bg-primary-500' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 dark:bg-gray-700' : ''}
                  `}
                />
              );
            })}
          </div>

          {/* Current stage info */}
          {progress.currentStage !== 'COMPLETED' && (
            <div className="text-center">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {STAGE_METADATA[progress.currentStage]?.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {overallProgress.percentage}% Complete
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Floating pill variant
  return (
    <motion.div
      className={`fixed bottom-20 right-4 z-40 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="flex items-center gap-2">
          {/* Circular progress */}
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 -rotate-90">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary-500"
                strokeDasharray={`${(getOverallProgress().percentage / 100) * 62.83} 62.83`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {getCurrentStepNumber()}
              </span>
            </div>
          </div>
          
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getOverallProgress().percentage}%
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};