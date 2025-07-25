import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFSMv2 } from '../context/FSMContextV2';
import { Sparkles, Lightbulb, Map, Target, Rocket, Flag, Trophy } from 'lucide-react';

export function Progress() {
  const { progress, currentState } = useFSMv2();
  
  // Add null checks and default values
  if (!progress || !currentState) {
    console.log('Progress component: Missing progress or currentState data', { progress, currentState });
    return (
      <div className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading progress...</p>
      </div>
    );
  }
  
  // Get segment-specific progress
  const getSegmentInfo = () => {
    const current = progress.current || 0;
    const total = progress.total || 17; // Default total steps
    
    if (currentState.startsWith('IDEATION')) {
      return {
        label: 'Ideation',
        color: 'from-blue-500 to-indigo-600',
        glowColor: 'shadow-blue-500/25',
        percentage: (current / 5) * 30, // Ideation is 30% of total
        icon: Lightbulb
      };
    } else if (currentState.startsWith('JOURNEY')) {
      return {
        label: 'Learning Journey',
        color: 'from-indigo-500 to-purple-600',
        glowColor: 'shadow-purple-500/25',
        percentage: 30 + ((current - 5) / 5) * 40, // Journey is 40% of total
        icon: Map
      };
    } else if (currentState.startsWith('DELIVER')) {
      return {
        label: 'Deliverables',
        color: 'from-purple-500 to-pink-600',
        glowColor: 'shadow-pink-500/25',
        percentage: 70 + ((current - 10) / 5) * 25, // Deliverables is 25% of total
        icon: Target
      };
    } else {
      return {
        label: 'Publish',
        color: 'from-emerald-500 to-teal-600',
        glowColor: 'shadow-emerald-500/25',
        percentage: 95 + ((current - 15) / 2) * 5, // Publish is 5% of total
        icon: Rocket
      };
    }
  };

  const segmentInfo = getSegmentInfo();
  
  // Milestone positions
  const milestones = [
    { position: 0, label: 'Start', icon: Flag, isActive: true },
    { position: 30, label: 'Ideation', icon: Lightbulb, isActive: segmentInfo.percentage >= 30 },
    { position: 70, label: 'Journey', icon: Map, isActive: segmentInfo.percentage >= 70 },
    { position: 95, label: 'Deliverables', icon: Target, isActive: segmentInfo.percentage >= 95 },
    { position: 100, label: 'Complete', icon: Trophy, isActive: segmentInfo.percentage >= 100 }
  ];

  // Debug logging
  console.log('Progress component rendering:', { 
    progress, 
    currentState, 
    segmentInfo 
  });

  return (
    <div className="w-full space-y-3">
      {/* Header with modern glass effect */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {React.createElement(segmentInfo.icon, { className: "w-4 h-4 text-gray-700 dark:text-gray-300" })}
          </motion.div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {segmentInfo.label}
          </h3>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          Step {progress.current || 0} of {progress.total || 17}
        </span>
      </div>
      
      {/* Modern progress bar with gradient and glow */}
      <div className="relative">
        {/* Background track with subtle gradient */}
        <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden">
          {/* Animated progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(segmentInfo.percentage, 100)}%` }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.1, 0.25, 1.0] // Custom cubic-bezier for smooth motion
            }}
            className={`h-full bg-gradient-to-r ${segmentInfo.color} rounded-full relative`}
          >
            {/* Subtle glow effect at the progress tip */}
            <motion.div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md opacity-60`}
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
        
        {/* Milestone markers with modern design */}
        <div className="absolute inset-0 flex items-center">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.position}
              className="absolute"
              style={{ left: `${milestone.position}%`, transform: 'translateX(-50%)' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: milestone.isActive ? 1 : 0.8,
                opacity: 1 
              }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            >
              {/* Milestone indicator */}
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs
                ${milestone.isActive 
                  ? 'bg-white dark:bg-gray-900 shadow-lg scale-110' 
                  : 'bg-gray-100 dark:bg-gray-700 opacity-60'
                }
                transition-all duration-300
              `}>
                {milestone.isActive && milestone.position === Math.floor(segmentInfo.percentage) ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                  >
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                  </motion.div>
                ) : (
                  React.createElement(milestone.icon, { className: "w-3 h-3 text-gray-600 dark:text-gray-400" })
                )}
              </div>
              
              {/* Milestone label (hidden on mobile) */}
              <AnimatePresence>
                {milestone.isActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-8 left-1/2 -translate-x-1/2 hidden sm:block"
                  >
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {milestone.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Modern stage indicators with glassmorphism */}
      <div className="flex gap-2 mt-8">
        {['Ideation', 'Journey', 'Deliverables', 'Publish'].map((stage, index) => {
          const stageProgress = [30, 70, 95, 100][index];
          const isActive = segmentInfo.percentage >= stageProgress;
          const isCurrent = segmentInfo.label === stage;
          
          return (
            <motion.div
              key={stage}
              className={`
                flex-1 px-3 py-2 rounded-xl text-center text-xs font-medium
                backdrop-blur-sm transition-all duration-300
                ${isCurrent 
                  ? 'bg-gradient-to-r ' + segmentInfo.color + ' text-white shadow-lg ' + segmentInfo.glowColor
                  : isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'
                }
              `}
              whileHover={!isCurrent ? { scale: 1.05 } : {}}
              whileTap={!isCurrent ? { scale: 0.95 } : {}}
            >
              {stage}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}