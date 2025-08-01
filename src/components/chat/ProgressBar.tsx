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
        return 'bg-green-500 text-white';
      case 'active':
        return 'bg-indigo-600 text-white ring-4 ring-indigo-200';
      case 'pending':
        return 'bg-gray-200 text-gray-400';
      default:
        return 'bg-gray-200 text-gray-400';
    }
  };

  const getConnectorClass = (status: string) => {
    return status === 'completed' ? 'bg-green-500' : 'bg-gray-200';
  };

  return (
    <div className="progress-bar p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Step counter */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentStage === 'WIZARD' 
            ? 'Getting Started' 
            : STAGE_METADATA[currentStage]?.title || 'Progress'
          }
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Step {Math.min(progress.currentStepNumber, progress.totalSteps)} of {progress.totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {/* Stage indicators */}
      <div className="relative">
        <div className="flex justify-between">
          {stages.map((stage, index) => {
            const status = getStageProgress(stage);
            const metadata = STAGE_METADATA[stage];
            
            return (
              <div key={stage} className="flex-1 flex flex-col items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div 
                    className={`absolute top-5 h-0.5 ${getConnectorClass(
                      getStageProgress(stages[index - 1])
                    )}`}
                    style={{
                      left: `${(100 / stages.length) * (index - 0.5)}%`,
                      width: `${100 / stages.length}%`
                    }}
                  />
                )}
                
                {/* Stage dot */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 ${getStageClass(status)}
                `}>
                  {status === 'completed' ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* Stage label */}
                <span className={`
                  mt-2 text-xs font-medium
                  ${status === 'active' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
                `}>
                  {metadata?.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};