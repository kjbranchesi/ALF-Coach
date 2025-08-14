/**
 * ProgressVisualization.tsx
 * 
 * Simple, clean progress tracking for educators
 * No gamification - just clear status indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Clock } from 'lucide-react';

interface ProgressStage {
  id: string;
  name: string;
  status: 'completed' | 'in-progress' | 'pending';
  percentage: number;
  substeps?: {
    name: string;
    completed: boolean;
  }[];
}

interface ProgressVisualizationProps {
  stages: ProgressStage[];
  currentStage: string;
  compact?: boolean;
}

export const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  stages,
  currentStage,
  compact = false
}) => {
  // Calculate overall progress
  const overallProgress = stages.reduce((sum, stage) => sum + stage.percentage, 0) / stages.length;

  if (compact) {
    // Compact horizontal progress bar
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Progress</h3>
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{Math.round(overallProgress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>
        
        {/* Stage Indicators */}
        <div className="flex justify-between mt-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                ${stage.status === 'completed' ? 'bg-success-500 text-white' :
                  stage.status === 'in-progress' ? 'bg-primary-500 text-white animate-pulse' :
                  'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}>
                {stage.status === 'completed' ? (
                  <Check className="w-4 h-4" />
                ) : stage.status === 'in-progress' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full detailed view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Progress</h2>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(overallProgress)}%</span>
        </div>
        
        {/* Main Progress Bar */}
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
          />
        </div>
      </div>

      {/* Stage Details */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={stage.id} className={`border rounded-lg p-4 transition-all duration-200
            ${stage.status === 'in-progress' ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20' :
              stage.status === 'completed' ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20' :
              'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'}`}>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${stage.status === 'completed' ? 'bg-success-500 text-white' :
                    stage.status === 'in-progress' ? 'bg-primary-500 text-white' :
                    'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                  {stage.status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : stage.status === 'in-progress' ? (
                    <span className="text-sm font-bold">{index + 1}</span>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{stage.name}</h3>
                  <span className={`text-xs
                    ${stage.status === 'completed' ? 'text-success-600 dark:text-success-400' :
                      stage.status === 'in-progress' ? 'text-primary-600 dark:text-primary-400' :
                      'text-gray-500 dark:text-gray-400'}`}>
                    {stage.status === 'completed' ? 'Completed' :
                     stage.status === 'in-progress' ? 'In Progress' :
                     'Not Started'}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{stage.percentage}%</span>
            </div>

            {/* Stage Progress Bar */}
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stage.percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                className={`absolute left-0 top-0 h-full rounded-full
                  ${stage.status === 'completed' ? 'bg-success-500' :
                    stage.status === 'in-progress' ? 'bg-primary-500' :
                    'bg-gray-300'}`}
              />
            </div>

            {/* Substeps */}
            {stage.substeps && stage.substeps.length > 0 && (
              <div className="mt-3 space-y-1">
                {stage.substeps.map((substep, subIndex) => (
                  <div key={subIndex} className="flex items-center gap-2 text-sm">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                      ${substep.completed ? 'border-success-500 bg-success-500' : 'border-gray-300 dark:border-gray-600'}`}>
                      {substep.completed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={substep.completed ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}>
                      {substep.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressVisualization;