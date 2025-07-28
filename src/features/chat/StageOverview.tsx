import React from 'react';
import { motion } from 'framer-motion';
import { useFSM } from '../../context/FSMContext';

interface Stage {
  id: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
}

const baseStages = [
  {
    id: 'ideation',
    title: 'Ideation',
    subtitle: 'Big ideas & questions'
  },
  {
    id: 'journey',
    title: 'Journey',
    subtitle: 'Activities & phases'
  },
  {
    id: 'deliverables',
    title: 'Deliverables',
    subtitle: 'Milestones & rubrics'
  },
  {
    id: 'publish',
    title: 'Publish',
    subtitle: 'Review & export'
  }
];

export const StageOverview: React.FC = () => {
  const { currentState, progress } = useFSM();
  
  // Determine which stages are active/completed based on current FSM state
  const getStageStatus = (stageId: string): { isActive: boolean; isCompleted: boolean } => {
    const stageMap: Record<string, string[]> = {
      ideation: ['IDEATION_BIG_IDEA', 'IDEATION_EQ', 'IDEATION_CHALLENGE'],
      journey: ['JOURNEY_PHASES', 'JOURNEY_ACTIVITIES', 'JOURNEY_RESOURCES', 'JOURNEY_REVIEW'],
      deliverables: ['DELIVER_MILESTONES', 'DELIVER_RUBRIC', 'DELIVER_IMPACT'],
      publish: ['PUBLISH_REVIEW', 'COMPLETE']
    };
    
    const currentStages = stageMap[stageId] || [];
    const isActive = currentStages.includes(currentState);
    
    // Check if stage is completed by comparing with current state order
    const stageOrder = ['ideation', 'journey', 'deliverables', 'publish'];
    const currentStageIndex = stageOrder.findIndex(id => 
      (stageMap[id] || []).includes(currentState)
    );
    const targetStageIndex = stageOrder.indexOf(stageId);
    const isCompleted = targetStageIndex < currentStageIndex;
    
    return { isActive, isCompleted };
  };
  
  // Calculate progress width (0-100%)
  const calculateProgressWidth = (): string => {
    const stageProgress = {
      ideation: 25,
      journey: 50,
      deliverables: 75,
      publish: 100
    };
    
    // Find which macro stage we're in
    if (currentState.startsWith('IDEATION')) {return `${stageProgress.ideation}%`;}
    if (currentState.startsWith('JOURNEY')) {return `${stageProgress.journey}%`;}
    if (currentState.startsWith('DELIVER')) {return `${stageProgress.deliverables}%`;}
    if (currentState === 'PUBLISH_REVIEW' || currentState === 'COMPLETE') {return `${stageProgress.publish}%`;}
    
    return '0%';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="soft-card p-4 mb-6"
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Blueprint Progress</h3>
      
      {/* Compact progress steps */}
      <div className="flex items-center justify-between relative">
        {/* Progress line background */}
        <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-200 shadow-soft-inset rounded-full" />
        
        {/* Active progress line */}
        <motion.div
          className="absolute top-6 left-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"
          initial={{ width: '0%' }}
          animate={{ width: `calc(${calculateProgressWidth()} - 4rem)` }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Stage indicators */}
        {baseStages.map((baseStage, index) => {
          const { isActive, isCompleted } = getStageStatus(baseStage.id);
          const stage = { ...baseStage, isActive, isCompleted };
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center z-10"
            >
              {/* Stage dot */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center soft-transition
                ${stage.isActive 
                  ? 'bg-indigo-600 text-white shadow-soft-lg ring-4 ring-indigo-100' 
                  : stage.isCompleted
                  ? 'bg-green-500 text-white shadow-soft'
                  : 'bg-gray-300 text-gray-600 shadow-soft-sm'
                }
              `}>
                {stage.isCompleted ? (
                  <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              
              {/* Stage label */}
              <div className="mt-2 text-center">
                <p className={`
                  text-xs font-semibold
                  ${stage.isActive 
                    ? 'text-indigo-700' 
                    : stage.isCompleted
                    ? 'text-green-700'
                    : 'text-gray-500'
                  }
                `}>
                  {stage.title}
                </p>
                <p className={`
                  text-xs mt-0.5
                  ${stage.isActive 
                    ? 'text-indigo-600' 
                    : stage.isCompleted
                    ? 'text-green-600'
                    : 'text-gray-400'
                  }
                `}>
                  {stage.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};