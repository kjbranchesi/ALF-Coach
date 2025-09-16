/**
 * ProgressBar.tsx - Accurate progress tracking that doesn't show "step 10 of 9"
 */

import React from 'react';
import { type SOPStage, STAGE_METADATA } from '../../core/types/SOPTypes';

interface ProgressBarProps {
  progress: {
    percentage: number;
    currentStepNumber: number;
    totalSteps: number;
  };
  currentStage: SOPStage;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, currentStage }) => {
  const stages: SOPStage[] = ['IDEATION', 'JOURNEY', 'DELIVERABLES'];
  
  const getStageProgress = (stage: SOPStage): 'completed' | 'active' | 'pending' => {
    const stageIndex = stages.indexOf(stage);
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentStage === 'WIZARD') {return 'pending';}
    if (currentStage === 'COMPLETED') {return 'completed';}
    
    if (stageIndex < currentIndex) {return 'completed';}
    if (stageIndex === currentIndex) {return 'active';}
    return 'pending';
  };

  const getStageClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg';
      case 'active':
        return 'bg-gradient-to-br from-primary-600 to-blue-700 text-white ring-4 ring-blue-200 dark:ring-blue-900/50 shadow-xl';
      case 'pending':
        return 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700 shadow-md';
      default:
        return 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700 shadow-md';
    }
  };

  const getConnectorClass = (status: string) => {
    return status === 'completed' ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-200 dark:bg-gray-700';
  };

  return (
    <div className="progress-bar mx-4 mt-2 mb-2">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg px-4 py-3 border border-gray-200/50 dark:border-gray-700/50">
          {/* Compact header with inline layout */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-200">
                {currentStage === 'WIZARD' 
                  ? 'Getting Started' 
                  : STAGE_METADATA[currentStage]?.title || 'Progress'
                }
              </h3>
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-full">
                Step {Math.min(progress.currentStepNumber, progress.totalSteps)} of {progress.totalSteps}
              </span>
            </div>
            
            {/* Compact progress bar */}
            <div className="flex-1 max-w-xs mx-4">
              <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Compact stage indicators - single row */}
          <div className="flex justify-between items-center relative">
            {stages.map((stage, index) => {
              const status = getStageProgress(stage);
              const metadata = STAGE_METADATA[stage];
              
              return (
                <div key={stage} className="flex items-center">
                  {/* Connector line */}
                  {index > 0 && (
                    <div 
                      className={`w-8 h-0.5 ${getConnectorClass(
                        getStageProgress(stages[index - 1])
                      )}`}
                    />
                  )}
                  
                  {/* Compact stage indicator */}
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      transition-all duration-300 ${getStageClass(status)}
                    `}>
                      {status === 'completed' ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Stage label - only show for active stage to save space */}
                    {status === 'active' && (
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400 whitespace-nowrap">
                        {metadata?.title}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};