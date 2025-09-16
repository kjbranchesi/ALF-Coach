/**
 * MinimalProgress.tsx - Clean, minimal progress indicators inspired by modern chat interfaces
 */

import React, { useState } from 'react';
import { ChevronRight, Check, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { type SOPStage, STAGE_METADATA } from '../../core/types/SOPTypes';

interface MinimalProgressProps {
  progress: {
    percentage: number;
    currentStepNumber: number;
    totalSteps: number;
  };
  currentStage: SOPStage;
  variant?: 'top' | 'sidebar';
}

export const MinimalProgress: React.FC<MinimalProgressProps> = ({ 
  progress, 
  currentStage,
  variant = 'top'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const stages: SOPStage[] = ['IDEATION', 'JOURNEY', 'DELIVERABLES'];
  
  const getStageStatus = (stage: SOPStage): 'completed' | 'active' | 'pending' => {
    const stageIndex = stages.indexOf(stage);
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentStage === 'WIZARD') return 'pending';
    if (currentStage === 'COMPLETED') return 'completed';
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (variant === 'top') {
    // Ultra-minimal top bar - just a thin progress line
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Thin progress line */}
        <div className="h-1 bg-gray-100 dark:bg-gray-900">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {/* Minimal stage indicator on hover */}
        <div 
          className="absolute top-1 right-4 opacity-0 hover:opacity-100 transition-opacity duration-200"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-3 py-1.5 text-xs">
            <span className="text-gray-500 dark:text-gray-400">
              {STAGE_METADATA[currentStage]?.title || 'Progress'}
            </span>
            <span className="ml-2 font-medium text-gray-700 dark:text-gray-200">
              {Math.round(progress.percentage)}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar variant - clean vertical progress
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 p-4">
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Compact header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(progress.percentage)}%
            </span>
          </div>
        </div>

        {/* Vertical stage list */}
        <div className="py-2">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage);
            const metadata = STAGE_METADATA[stage];
            
            return (
              <motion.div 
                key={stage}
                className={`
                  flex items-center px-4 py-2 transition-colors duration-200
                  ${status === 'active' ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                  ${status === 'pending' ? 'opacity-50' : ''}
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Stage indicator */}
                <div className="flex-shrink-0 mr-3">
                  {status === 'completed' ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : status === 'active' ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Circle className="w-4 h-4 text-primary-500 fill-current" />
                    </motion.div>
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                  )}
                </div>

                {/* Stage name */}
                <div className="flex-grow">
                  <p className={`
                    text-sm font-medium
                    ${status === 'active' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}
                  `}>
                    {metadata?.title}
                  </p>
                  {status === 'active' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Step {progress.currentStepNumber} of {progress.totalSteps}
                    </p>
                  )}
                </div>

                {/* Chevron for active */}
                {status === 'active' && (
                  <ChevronRight className="w-4 h-4 text-primary-500 flex-shrink-0 ml-2" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

// Floating progress pill - ultra minimal
export const FloatingProgressPill: React.FC<MinimalProgressProps> = ({ progress, currentStage }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-24 right-6 z-40"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <motion.button
          className="bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center gap-2">
            {/* Circular progress */}
            <svg className="w-5 h-5 -rotate-90">
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="10"
                cy="10"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-primary-500"
                strokeDasharray={`${(progress.percentage / 100) * 50.27} 50.27`}
                strokeLinecap="round"
              />
            </svg>
            
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round(progress.percentage)}%
            </span>
          </div>
        </motion.button>

        {/* Expanded details on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {STAGE_METADATA[currentStage]?.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Step {progress.currentStepNumber} of {progress.totalSteps}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};