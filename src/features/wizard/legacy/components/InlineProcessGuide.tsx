/**
 * InlineProcessGuide.tsx
 * Minimal inline process indicator that shows ALF stages without blocking flow
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Target, BookOpen, Package, Info } from 'lucide-react';

interface ProcessStage {
  id: string;
  name: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  completed: boolean;
}

interface InlineProcessGuideProps {
  currentPhase: 'grounding' | 'journey' | 'complete';
  showTooltip?: boolean;
}

export const InlineProcessGuide: React.FC<InlineProcessGuideProps> = ({ 
  currentPhase, 
  showTooltip = false 
}) => {
  const stages: ProcessStage[] = [
    {
      id: 'grounding',
      name: 'Grounding',
      time: '5-7 min',
      icon: Target,
      current: currentPhase === 'grounding',
      completed: currentPhase === 'journey' || currentPhase === 'complete'
    },
    {
      id: 'journey',
      name: 'Journey',
      time: '5-7 min',
      icon: BookOpen,
      current: currentPhase === 'journey',
      completed: currentPhase === 'complete'
    },
    {
      id: 'complete',
      name: 'Blueprint',
      time: 'Ready',
      icon: Package,
      current: currentPhase === 'complete',
      completed: false
    }
  ];

  const getStageStyles = (stage: ProcessStage) => {
    if (stage.current) {
      return 'bg-primary-500 text-white scale-110';
    }
    if (stage.completed) {
      return 'bg-green-500 text-white';
    }
    return 'bg-gray-200 dark:bg-gray-700 text-gray-400';
  };

  return (
    <div className="relative">
      {/* Minimal timeline bar */}
      <div className="flex items-center justify-between max-w-md mx-auto mb-4">
        {/* Progress line */}
        <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200 dark:bg-gray-700">
          <motion.div 
            className="h-full bg-primary-500"
            initial={{ width: '0%' }}
            animate={{ 
              width: currentPhase === 'grounding' ? '0%' : 
                     currentPhase === 'journey' ? '50%' : 
                     '100%' 
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Stage indicators */}
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <motion.div
              key={stage.id}
              className="relative z-10 group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Stage dot */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-300 ${getStageStyles(stage)}
              `}>
                <Icon className="w-4 h-4" />
              </div>

              {/* Hover tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {stage.name} • {stage.time}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-4 border-transparent border-t-gray-900" />
                </div>
              )}

              {/* Stage label - only show for current */}
              {stage.current && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  {stage.name}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Contextual help button */}
      {showTooltip && (
        <button className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group">
          <Info className="w-3 h-3 text-gray-500 dark:text-gray-400" />
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
              <p className="font-semibold mb-1">ALF Process (12-18 min)</p>
              <p>Grounding: Define core concepts</p>
              <p>Journey: Plan student activities</p>
              <p>Blueprint: Get your project ready</p>
            </div>
            <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-0 h-0 border-4 border-transparent border-l-gray-900" />
          </div>
        </button>
      )}
    </div>
  );
};