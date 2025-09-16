/**
 * HeaderProgressBar.tsx
 * 
 * Minimal header progress bar that shows overall completion
 * Designed to integrate seamlessly with the existing chat interface
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ChevronDown } from 'lucide-react';
import { type SOPStage, STAGE_METADATA } from '../../core/types/SOPTypes';
import { STEP_FLOW } from './EnhancedProgressIndicator';

interface HeaderProgressBarProps {
  currentStage: SOPStage;
  currentStep?: string;
  completedSteps: string[];
  className?: string;
  showStageInfo?: boolean;
}

export const HeaderProgressBar: React.FC<HeaderProgressBarProps> = ({
  currentStage,
  currentStep,
  completedSteps,
  className = '',
  showStageInfo = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
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
    if (!currentStep || currentStage === 'COMPLETED') return 9;
    
    for (const [, stageData] of Object.entries(STEP_FLOW)) {
      const step = stageData.steps.find(s => s.id === currentStep);
      if (step) return step.stepNumber;
    }
    return 0;
  };

  const getCurrentStageInfo = () => {
    if (currentStage === 'COMPLETED') return null;
    
    const stageData = STEP_FLOW[currentStage as keyof typeof STEP_FLOW];
    if (!stageData) return null;
    
    const currentStepInStage = stageData.steps.findIndex(step => step.id === currentStep) + 1;
    const currentStepData = stageData.steps.find(step => step.id === currentStep);
    
    return {
      title: STAGE_METADATA[currentStage]?.title || 'Unknown Stage',
      stepLabel: currentStepData?.label || 'Unknown Step',
      stepInStage: currentStepInStage || 1,
      totalStepsInStage: stageData.totalSteps,
      stageNumber: stageData.stageNumber
    };
  };

  const progress = getProgress();
  const stageInfo = getCurrentStageInfo();

  return (
    <div className={`relative ${className}`}>
      {/* Main Progress Bar */}
      <div className="relative">
        {/* Background */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* Progress Fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 via-indigo-500 to-primary-600 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Stage Markers */}
        <div className="absolute inset-0 flex items-center">
          {/* Ideation Complete at 33% */}
          <div 
            className="absolute w-2 h-2 bg-white dark:bg-gray-800 border border-primary-500 rounded-full transform -translate-x-1/2"
            style={{ left: '33.33%' }}
          >
            {progress.completed >= 3 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-primary-500 rounded-full"
              />
            )}
          </div>
          
          {/* Journey Complete at 66% */}
          <div 
            className="absolute w-2 h-2 bg-white dark:bg-gray-800 border border-indigo-500 rounded-full transform -translate-x-1/2"
            style={{ left: '66.67%' }}
          >
            {progress.completed >= 6 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-indigo-500 rounded-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Stage Information Bar */}
      {showStageInfo && stageInfo && (
        <motion.div
          className="mt-2 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Current Stage Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stageInfo.stepLabel}
              </span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {stageInfo.title}
            </span>
          </div>

          {/* Progress Info */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Step {progress.current} of 9
            </span>
            <div 
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Info className="w-3 h-3 text-gray-400 cursor-help" />
              
              {/* Tooltip */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg whitespace-nowrap shadow-lg z-50"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="space-y-1">
                      <div>Overall: {progress.percentage}% complete</div>
                      <div>{stageInfo.title}: Step {stageInfo.stepInStage} of {stageInfo.totalStepsInStage}</div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full right-3 border-4 border-transparent border-t-gray-800 dark:border-t-gray-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Utility function to add shimmer animation styles
export const addShimmerStyles = () => {
  if (typeof window !== 'undefined') {
    const existingStyle = document.getElementById('progress-shimmer-styles');
    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'progress-shimmer-styles';
      style.textContent = `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }
};

// Auto-add styles when component is imported
addShimmerStyles();