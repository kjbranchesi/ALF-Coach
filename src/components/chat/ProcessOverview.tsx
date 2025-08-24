/**
 * ProcessOverview.tsx - Shows the user's journey through the project creation process
 * Provides clear context about what's been done and what's coming next
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Sparkles,
  Map,
  Package,
  Target
} from 'lucide-react';
import { type SOPStage } from '../../core/types/SOPTypes';
import { textStyles } from '../../design-system/typography.config';

interface ProcessOverviewProps {
  currentStage: SOPStage;
  completedStages: SOPStage[];
  className?: string;
}

interface StageInfo {
  id: SOPStage;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: string[];
}

const STAGES: StageInfo[] = [
  {
    id: 'IDEATION',
    name: 'Grounding',
    description: 'Define your project\'s conceptual foundation (20-30 min)',
    icon: Sparkles,
    steps: ['Big Idea', 'Essential Question', 'Authentic Challenge']
  },
  {
    id: 'JOURNEY',
    name: 'Learning Journey',
    description: 'Map student progression through 4 phases (15-25 min)',
    icon: Map,
    steps: ['Analyze', 'Brainstorm', 'Prototype', 'Evaluate']
  },
  {
    id: 'DELIVERABLES',
    name: 'Deliverables',
    description: 'Define outputs and assessment criteria (10-20 min)',
    icon: Package,
    steps: ['Products', 'Rubrics', 'Presentation', 'Timeline']
  }
];

export const ProcessOverview: React.FC<ProcessOverviewProps> = ({
  currentStage,
  completedStages,
  className = ''
}) => {
  const getStageStatus = (stageId: SOPStage): 'completed' | 'current' | 'upcoming' => {
    if (completedStages.includes(stageId)) return 'completed';
    if (currentStage === stageId) return 'current';
    return 'upcoming';
  };

  const getCurrentStageInfo = () => {
    return STAGES.find(s => s.id === currentStage);
  };

  const getNextStageInfo = () => {
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    if (currentIndex < STAGES.length - 1) {
      return STAGES[currentIndex + 1];
    }
    return null;
  };

  const currentStageInfo = getCurrentStageInfo();
  const nextStageInfo = getNextStageInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 ${className}`}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className={`${textStyles.stageTitle} mb-2`}>
          Your Project Journey
        </h3>
        <p className={textStyles.stageDescription}>
          Track your progress through the project creation process
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700" />
        
        {/* Stages */}
        <div className="relative flex justify-between">
          {STAGES.map((stage, index) => {
            const status = getStageStatus(stage.id);
            const Icon = stage.icon;
            
            return (
              <motion.div
                key={stage.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center relative"
              >
                {/* Stage circle */}
                <div className={`
                  relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${status === 'completed' 
                    ? 'bg-green-500 text-white' 
                    : status === 'current'
                    ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                    : 'bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-300 dark:border-gray-600'
                  }
                `}>
                  {status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                {/* Stage label */}
                <div className="mt-3 text-center">
                  <div className={`
                    ${textStyles.stepLabel}
                    ${status === 'current' ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}
                  `}>
                    {stage.name}
                  </div>
                  
                  {/* Show steps for current stage */}
                  {status === 'current' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2"
                    >
                      <div className="flex flex-col gap-1">
                        {stage.steps.map((step, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="text-[11px] text-gray-500 dark:text-gray-500"
                          >
                            {step}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current & Next Stage Details */}
      {currentStageInfo && (
        <div className="mt-8 space-y-4">
          {/* Current stage */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className={`${textStyles.cardTitle} mb-1`}>
                  Currently: {currentStageInfo.name}
                </h4>
                <p className={textStyles.cardDescription}>
                  {currentStageInfo.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentStageInfo.steps.map((step, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Next stage preview */}
          {nextStageInfo && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 opacity-75">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className={`${textStyles.cardTitle} mb-1 text-gray-600 dark:text-gray-400`}>
                    Up Next: {nextStageInfo.name}
                  </h4>
                  <p className={`${textStyles.cardDescription} text-gray-500 dark:text-gray-500`}>
                    {nextStageInfo.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actionable guidance message */}
      <div className="mt-6 text-center">
        <p className={`${textStyles.helperText} italic`}>
          {currentStage === 'IDEATION' && "Focus on: What concept should students understand? What question will drive their inquiry?"}
          {currentStage === 'JOURNEY' && "Focus on: How will students research, brainstorm, create, and present their work?"}
          {currentStage === 'DELIVERABLES' && "Focus on: What will students create? How will you assess their success?"}
          {currentStage === 'COMPLETED' && "Your actionable project blueprint is ready to implement with students!"}
        </p>
      </div>
    </motion.div>
  );
};

export default ProcessOverview;