import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFSMv2 } from '../context/FSMContextV2';
import { Sparkles, Lightbulb, Map, Target, Rocket, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

interface ProgressProps {
  value?: number;
  className?: string;
}

export function Progress({ value = 0, className = '' }: ProgressProps) {
  const { progress, currentState } = useFSMv2();
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    
    if (currentState.startsWith('IDEATION')) {
      return {
        label: 'Ideation',
        color: 'from-primary-500 to-indigo-600',
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
  
  // Get current phase within stage
  const getCurrentPhase = () => {
    // Map states to phase names
    const phaseMap: Record<string, string> = {
      'IDEATION_INITIATOR': 'Getting Started',
      'IDEATION_BIG_IDEA': 'Big Idea',
      'IDEATION_EQ': 'Essential Question',
      'IDEATION_CHALLENGE': 'Challenge',
      'IDEATION_CLARIFIER': 'Review',
      'JOURNEY_INITIATOR': 'Getting Started',
      'JOURNEY_PHASES': 'Learning Phases',
      'JOURNEY_ACTIVITIES': 'Activities',
      'JOURNEY_RESOURCES': 'Resources',
      'JOURNEY_CLARIFIER': 'Review',
      'DELIVERABLES_INITIATOR': 'Getting Started',
      'DELIVERABLES_MILESTONES': 'Milestones',
      'DELIVERABLES_ASSESSMENT': 'Assessment',
      'DELIVERABLES_IMPACT': 'Impact',
      'DELIVERABLES_CLARIFIER': 'Review',
      'PUBLISH': 'Complete!'
    };
    
    return phaseMap[currentState] || 'In Progress';
  };
  
  // Get all phases for current stage
  const getStagePhases = () => {
    if (currentState.startsWith('IDEATION')) {
      return ['Big Idea', 'Essential Question', 'Challenge'];
    } else if (currentState.startsWith('JOURNEY')) {
      return ['Learning Phases', 'Activities', 'Resources'];
    } else if (currentState.startsWith('DELIVER')) {
      return ['Milestones', 'Assessment', 'Impact'];
    }
    return [];
  };
  
  // Get phase progress within current stage
  const getPhaseProgress = () => {
    const phases = getStagePhases();
    const currentPhase = getCurrentPhase();
    const index = phases.indexOf(currentPhase);
    return index >= 0 ? index + 1 : 0;
  };
  
  // Milestone positions - removed 'Start' as it's unnecessary
  const milestones = [
    { position: 30, label: 'Ideation', icon: Lightbulb, isActive: segmentInfo.percentage >= 30 },
    { position: 70, label: 'Journey', icon: Map, isActive: segmentInfo.percentage >= 70 },
    { position: 95, label: 'Deliverables', icon: Target, isActive: segmentInfo.percentage >= 95 },
    { position: 100, label: 'Complete', icon: Trophy, isActive: segmentInfo.percentage >= 100 }
  ];

  // Debug logging
  console.log('Progress component rendering:', { 
    progress, 
    currentState, 
    segmentInfo,
    value 
  });
  
  // If value prop is provided, show simple progress bar
  if (value !== undefined && value !== 0) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Thin collapsed view */}
      {!isExpanded && (
        <motion.div 
          className="flex items-center justify-between px-3 py-1.5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all border border-gray-200/50 dark:border-gray-700/50"
          onClick={() => { setIsExpanded(true); }}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
        >
          <div className="flex items-center gap-2">
            {React.createElement(segmentInfo.icon, { className: "w-3.5 h-3.5 text-gray-600 dark:text-gray-400" })}
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {segmentInfo.label}: {getCurrentPhase()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              •
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              Step {progress.current || 0} of {progress.total || 17}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mini progress bar */}
            <div className="w-24 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(segmentInfo.percentage, 100)}%` }}
                className={`h-full bg-gradient-to-r ${segmentInfo.color} rounded-full`}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[35px] text-right">
              {Math.round(segmentInfo.percentage)}%
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </motion.div>
      )}

      {/* Expanded view */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md relative">
              {/* Collapse button positioned in top right */}
              <button
                onClick={() => { setIsExpanded(false); }}
                className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title="Collapse"
              >
                <ChevronUp className="w-4 h-4 text-gray-400" />
              </button>

              {/* Original header content */}
              <div className="flex justify-between items-center pr-8">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {React.createElement(segmentInfo.icon, { className: "w-4 h-4 text-gray-700 dark:text-gray-300" })}
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {segmentInfo.label}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getCurrentPhase()} ({getPhaseProgress()}/{getStagePhases().length})
                    </p>
                  </div>
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
          
          // Get phases for this stage
          const stagePhases = stage === 'Ideation' ? ['Big Idea', 'Essential Question', 'Challenge'] :
                             stage === 'Journey' ? ['Learning Phases', 'Activities', 'Resources'] :
                             stage === 'Deliverables' ? ['Milestones', 'Assessment', 'Impact'] :
                             [];
          
          return (
            <motion.div
              key={stage}
              className={`
                flex-1 px-3 py-2 rounded-xl text-center text-xs font-medium
                backdrop-blur-sm transition-all duration-300
                ${isCurrent 
                  ? `bg-gradient-to-r ${  segmentInfo.color  } text-white shadow-lg ${  segmentInfo.glowColor}`
                  : isActive
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500'
                }
              `}
              whileHover={!isCurrent ? { scale: 1.05 } : {}}
              whileTap={!isCurrent ? { scale: 0.95 } : {}}
            >
              <div>{stage}</div>
              {/* Phase dots */}
              {stagePhases.length > 0 && (
                <div className="flex justify-center gap-1 mt-1">
                  {stagePhases.map((phase, phaseIndex) => {
                    const isCurrentPhase = isCurrent && getCurrentPhase() === phase;
                    const isCompletedPhase = isCurrent ? phaseIndex < getPhaseProgress() - 1 : isActive;
                    
                    return (
                      <motion.div
                        key={phase}
                        className={`
                          w-1.5 h-1.5 rounded-full transition-all duration-300
                          ${isCurrentPhase 
                            ? 'bg-white scale-125' 
                            : isCompletedPhase
                              ? isCurrent ? 'bg-white/70' : 'bg-gray-500 dark:bg-gray-400'
                              : isCurrent ? 'bg-white/30' : 'bg-gray-300 dark:bg-gray-600'
                          }
                        `}
                        title={phase}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 * phaseIndex }}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ARCHIVED - Legacy ProgressV2 component
