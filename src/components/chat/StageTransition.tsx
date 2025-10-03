/**
 * StageTransition.tsx - Smooth animated transitions between stages
 * Provides visual feedback when moving between major sections
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles, Map, Package } from 'lucide-react';
import { type SOPStage } from '../../core/types/SOPTypes';
import { textStyles } from '../../design-system/typography.config';

interface StageTransitionProps {
  fromStage: SOPStage;
  toStage: SOPStage;
  onComplete: () => void;
  duration?: number;
}

const stageInfo = {
  WIZARD: {
    name: 'Getting Started',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-600'
  },
  IDEATION: {
    name: 'Ideation',
    icon: Sparkles,
    color: 'from-primary-400 to-indigo-600'
  },
  JOURNEY: {
    name: 'Learning Journey',
    icon: Map,
    color: 'from-purple-400 to-pink-600'
  },
  DELIVERABLES: {
    name: 'Deliverables',
    icon: Package,
    color: 'from-green-400 to-teal-600'
  },
  COMPLETED: {
    name: 'Complete!',
    icon: CheckCircle2,
    color: 'from-yellow-400 to-orange-600'
  }
};

export const StageTransition: React.FC<StageTransitionProps> = ({
  fromStage,
  toStage,
  onComplete,
  duration = 3000
}) => {
  const [phase, setPhase] = useState<'exit' | 'transition' | 'enter'>('exit');
  
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('transition'), 500);
    const timer2 = setTimeout(() => setPhase('enter'), 1500);
    const timer3 = setTimeout(() => onComplete(), duration);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [duration, onComplete]);

  const FromIcon = stageInfo[fromStage].icon;
  const ToIcon = stageInfo[toStage].icon;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
    >
      <div className="text-center">
        <AnimatePresence mode="wait">
          {phase === 'exit' && (
            <motion.div
              key="exit"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${stageInfo[fromStage].color} flex items-center justify-center`}>
                <FromIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h3 className={textStyles.stageTitle}>Great work!</h3>
                <p className={textStyles.stageDescription}>
                  {stageInfo[fromStage].name} complete
                </p>
              </div>
            </motion.div>
          )}
          
          {phase === 'transition' && (
            <motion.div
              key="transition"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex items-center gap-8"
            >
              {/* From stage */}
              <motion.div
                animate={{ x: [-20, 0, -20] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2 opacity-50"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stageInfo[fromStage].color} flex items-center justify-center`}>
                  <FromIcon className="w-8 h-8 text-white" />
                </div>
                <span className={textStyles.stepLabel}>{stageInfo[fromStage].name}</span>
              </motion.div>
              
              {/* Arrow */}
              <motion.div
                animate={{ x: [-10, 10, -10] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </motion.div>
              
              {/* To stage */}
              <motion.div
                animate={{ x: [20, 0, 20] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stageInfo[toStage].color} flex items-center justify-center`}>
                  <ToIcon className="w-8 h-8 text-white" />
                </div>
                <span className={textStyles.stepLabel}>{stageInfo[toStage].name}</span>
              </motion.div>
            </motion.div>
          )}
          
          {phase === 'enter' && (
            <motion.div
              key="enter"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${stageInfo[toStage].color} flex items-center justify-center shadow-2xl`}
              >
                <ToIcon className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h3 className={textStyles.stageTitle}>Let's continue!</h3>
                <p className={textStyles.stageDescription}>
                  Starting {stageInfo[toStage].name}
                </p>
              </div>
              
              {/* Progress dots */}
              <div className="flex gap-2 mt-4">
                {['IDEATION', 'JOURNEY', 'DELIVERABLES'].map((stage) => (
                  <div
                    key={stage}
                    className={`w-2 h-2 rounded-full transition-all ${
                      stage === toStage 
                        ? `w-8 bg-gradient-to-r ${  stageInfo[stage].color}`
                        : stageInfo[stage as SOPStage] && fromStage === 'JOURNEY' && stage === 'IDEATION'
                        ? 'bg-green-500'
                        : stageInfo[stage as SOPStage] && fromStage === 'DELIVERABLES' && (stage === 'IDEATION' || stage === 'JOURNEY')
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default StageTransition;