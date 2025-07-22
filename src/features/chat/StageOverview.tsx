import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  LightbulbIcon, 
  MapIcon,
  CheckCircleIcon
} from '../../components/icons/ButtonIcons';

interface Stage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  isActive: boolean;
  isCompleted: boolean;
}

const stages: Stage[] = [
  {
    id: 'ideation',
    title: 'Ideation Stage',
    description: 'Map out your learning journey with creative phases, activities, and resources',
    icon: LightbulbIcon,
    isActive: true,
    isCompleted: false
  },
  {
    id: 'deliverables',
    title: 'Deliverables Stage',
    description: 'Define milestones, create assessment rubrics, and plan authentic impact',
    icon: MapIcon,
    isActive: false,
    isCompleted: false
  },
  {
    id: 'publish',
    title: 'Publish & Share',
    description: 'Review, refine, and export your blueprint for implementation',
    icon: CheckCircleIcon,
    isActive: false,
    isCompleted: false
  }
];

export const StageOverview: React.FC = () => {
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
      
      <div className="grid md:grid-cols-3 gap-6">
        {stages.map((stage, index) => {
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
          animate={{ width: '33%' }}
          transition={{ duration: 1, delay: 0.5 }}
        />
      </div>
    </motion.div>
  );
};