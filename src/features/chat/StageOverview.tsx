import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  LightbulbIcon, 
  MapIcon,
  CheckCircleIcon
} from '../../components/icons/ButtonIcons';
import { useFSM } from '../../context/FSMContext';

interface Stage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  isActive: boolean;
  isCompleted: boolean;
}

const baseStages = [
  {
    id: 'ideation',
    title: 'Ideation (Catalyst)',
    description: 'Anchor with a big idea, frame essential questions, and define authentic challenges',
    icon: LightbulbIcon
  },
  {
    id: 'journey',
    title: 'Learning Journey (Issues)',
    description: 'Design phases, create activities, and gather resources for deep exploration',
    icon: MapIcon
  },
  {
    id: 'deliverables',
    title: 'Deliverables (Method)',
    description: 'Set milestones, create rubrics, and plan for authentic impact',
    icon: SparklesIcon
  },
  {
    id: 'publish',
    title: 'Publish (Engagement)',
    description: 'Review, refine, and export your blueprint for real-world implementation',
    icon: CheckCircleIcon
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
    if (currentState.startsWith('IDEATION')) return `${stageProgress.ideation}%`;
    if (currentState.startsWith('JOURNEY')) return `${stageProgress.journey}%`;
    if (currentState.startsWith('DELIVER')) return `${stageProgress.deliverables}%`;
    if (currentState === 'PUBLISH_REVIEW' || currentState === 'COMPLETE') return `${stageProgress.publish}%`;
    
    return '0%';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white rounded-full shadow-lg">
          <SparklesIcon className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Blueprint Journey</h2>
          <p className="text-gray-600">Transform ideas into actionable learning experiences</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-4 gap-6">
        {baseStages.map((baseStage, index) => {
          const { isActive, isCompleted } = getStageStatus(baseStage.id);
          const stage = { ...baseStage, isActive, isCompleted };
          const Icon = stage.icon;
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300
                ${stage.isActive 
                  ? 'bg-white border-purple-400 shadow-lg' 
                  : stage.isCompleted
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
                }
              `}
            >
              {/* Stage number */}
              <div className={`
                absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${stage.isActive 
                  ? 'bg-purple-600 text-white' 
                  : stage.isCompleted
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-400 text-white'
                }
              `}>
                {index + 1}
              </div>
              
              {/* Icon */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center mb-4
                ${stage.isActive 
                  ? 'bg-purple-100' 
                  : stage.isCompleted
                  ? 'bg-green-100'
                  : 'bg-gray-100'
                }
              `}>
                <Icon className={`
                  w-6 h-6
                  ${stage.isActive 
                    ? 'text-purple-600' 
                    : stage.isCompleted
                    ? 'text-green-600'
                    : 'text-gray-400'
                  }
                `} />
              </div>
              
              {/* Content */}
              <h3 className={`
                font-bold text-lg mb-2
                ${stage.isActive 
                  ? 'text-purple-900' 
                  : stage.isCompleted
                  ? 'text-green-900'
                  : 'text-gray-600'
                }
              `}>
                {stage.title}
              </h3>
              <p className={`
                text-sm
                ${stage.isActive 
                  ? 'text-gray-700' 
                  : stage.isCompleted
                  ? 'text-green-700'
                  : 'text-gray-500'
                }
              `}>
                {stage.description}
              </p>
              
              {/* Status indicator */}
              {stage.isActive && (
                <motion.div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <div className="w-4 h-4 bg-purple-600 rounded-full shadow-lg" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Progress line */}
      <div className="relative mt-8">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2" />
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 transform -translate-y-1/2"
          initial={{ width: '0%' }}
          animate={{ width: calculateProgressWidth() }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};