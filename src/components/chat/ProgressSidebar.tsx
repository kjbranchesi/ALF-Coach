/**
 * ProgressSidebar.tsx - Left-aligned progress sidebar showing captured data
 * Clean, minimal design inspired by ChatGPT's chat list
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronDown,
  Check, 
  Circle, 
  Sparkles,
  Target,
  Map,
  Package,
  Eye,
  EyeOff
} from 'lucide-react';
import { type SOPStage, STAGE_METADATA } from '../../core/types/SOPTypes';

interface CapturedData {
  ideation?: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
    gradeLevel?: string;
    subject?: string;
  };
  journey?: {
    objectives?: string[];
    activities?: string[];
    resources?: string[];
  };
  deliverables?: {
    milestones?: string[];
    rubric?: any;
    assessment?: string;
  };
}

interface ProgressSidebarProps {
  currentStage: SOPStage;
  currentStep: string;
  capturedData: CapturedData;
  progress: {
    percentage: number;
    currentStepNumber: number;
    totalSteps: number;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  currentStage,
  currentStep,
  capturedData,
  progress,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [expandedStage, setExpandedStage] = useState<SOPStage | null>(currentStage);
  const stages: SOPStage[] = ['IDEATION', 'JOURNEY', 'DELIVERABLES'];
  
  const getStageIcon = (stage: SOPStage) => {
    switch (stage) {
      case 'IDEATION': return Sparkles;
      case 'JOURNEY': return Map;
      case 'DELIVERABLES': return Package;
      default: return Target;
    }
  };

  const getStageStatus = (stage: SOPStage): 'completed' | 'active' | 'pending' => {
    const stageIndex = stages.indexOf(stage);
    const currentIndex = stages.indexOf(currentStage);
    
    if (currentStage === 'WIZARD') return 'pending';
    if (currentStage === 'COMPLETED') return 'completed';
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const toggleStageExpansion = (stage: SOPStage) => {
    setExpandedStage(expandedStage === stage ? null : stage);
  };

  const formatDataValue = (value: any): string => {
    if (!value) return 'Not set';
    if (Array.isArray(value)) return `${value.length} items`;
    if (typeof value === 'object') return 'Configured';
    return value.length > 50 ? value.substring(0, 50) + '...' : value;
  };

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 250 }}
        animate={{ width: 48 }}
        className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col"
      >
        <button
          onClick={onToggleCollapse}
          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        {/* Collapsed progress dots */}
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          {stages.map(stage => {
            const status = getStageStatus(stage);
            const Icon = getStageIcon(stage);
            return (
              <motion.div
                key={stage}
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                  ${status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400' : ''}
                  ${status === 'pending' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                `}
                whileHover={{ scale: 1.1 }}
                title={STAGE_METADATA[stage]?.title}
              >
                {status === 'completed' ? (
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Icon className={`w-4 h-4 ${
                    status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} />
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* Collapsed progress bar */}
        <div className="p-3">
          <div className="h-32 w-2 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="w-full bg-gradient-to-b from-blue-400 to-blue-600"
              initial={{ height: 0 }}
              animate={{ height: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-center mt-2 text-gray-500">
            {Math.round(progress.percentage)}%
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 48 }}
      animate={{ width: 280 }}
      className="h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Project Progress
          </h3>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
            title="Collapse sidebar"
          >
            <EyeOff className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        {/* Overall progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(progress.percentage)}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="flex-1 overflow-y-auto">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage);
          const Icon = getStageIcon(stage);
          const metadata = STAGE_METADATA[stage];
          const isExpanded = expandedStage === stage;
          const stageData = capturedData[stage.toLowerCase() as keyof CapturedData];
          
          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                border-b border-gray-200 dark:border-gray-800
                ${status === 'active' ? 'bg-blue-50 dark:bg-blue-900/10' : ''}
              `}
            >
              {/* Stage header */}
              <button
                onClick={() => toggleStageExpansion(stage)}
                className="w-full p-4 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                  ${status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                  ${status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                  ${status === 'pending' ? 'bg-gray-100 dark:bg-gray-800' : ''}
                `}>
                  {status === 'completed' ? (
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${
                      status === 'active' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 text-left">
                  <div className={`font-medium text-sm ${
                    status === 'active' ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {metadata?.title}
                  </div>
                  {status === 'active' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Step {progress.currentStepNumber} of {progress.totalSteps}
                    </div>
                  )}
                </div>
                
                {isExpanded ? 
                  <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                }
              </button>

              {/* Stage details */}
              <AnimatePresence>
                {isExpanded && stageData && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-3 space-y-2"
                  >
                    {stage === 'IDEATION' && (
                      <>
                        {stageData.bigIdea && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Big Idea:</span>
                            <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                              {formatDataValue(stageData.bigIdea)}
                            </p>
                          </div>
                        )}
                        {stageData.gradeLevel && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Grade:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {stageData.gradeLevel}
                            </span>
                          </div>
                        )}
                        {stageData.subject && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {stageData.subject}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {stage === 'JOURNEY' && (
                      <>
                        {stageData.objectives && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Objectives:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {formatDataValue(stageData.objectives)}
                            </span>
                          </div>
                        )}
                        {stageData.activities && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Activities:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {formatDataValue(stageData.activities)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {stage === 'DELIVERABLES' && (
                      <>
                        {stageData.milestones && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Milestones:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {formatDataValue(stageData.milestones)}
                            </span>
                          </div>
                        )}
                        {stageData.assessment && (
                          <div className="text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Assessment:</span>
                            <span className="ml-1 text-gray-700 dark:text-gray-300">
                              {formatDataValue(stageData.assessment)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {currentStage === 'COMPLETED' ? (
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              Blueprint Complete
            </span>
          ) : (
            <span>Currently: {currentStep.replace(/_/g, ' ').toLowerCase()}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};