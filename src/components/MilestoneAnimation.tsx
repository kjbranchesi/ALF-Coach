import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { useFSMv2 } from '../context/FSMContextV2';

// Simple confetti animation data (inline for demo - in production, load from JSON files)
const confettiAnimation = {
  "v": "5.5.7",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 200,
  "h": 200,
  "nm": "Confetti",
  "ddd": 0,
  "assets": [],
  "layers": [{
    "ddd": 0,
    "ind": 1,
    "ty": 4,
    "nm": "Particle",
    "sr": 1,
    "ks": {
      "o": { "a": 0, "k": 100 },
      "r": { "a": 1, "k": [{ "t": 0, "s": [0], "e": [360] }, { "t": 60, "s": [360] }] },
      "p": { 
        "a": 1, 
        "k": [{ 
          "t": 0, 
          "s": [100, 100, 0],
          "e": [100, 20, 0],
          "to": [0, -13.33, 0],
          "ti": [0, 13.33, 0]
        }]
      },
      "a": { "a": 0, "k": [0, 0, 0] },
      "s": { "a": 0, "k": [100, 100, 100] }
    },
    "shapes": [{
      "ty": "gr",
      "it": [{
        "ty": "rc",
        "d": 1,
        "s": { "a": 0, "k": [10, 10] },
        "r": { "a": 0, "k": 2 }
      }, {
        "ty": "fl",
        "c": { "a": 0, "k": [0.5, 0.3, 1, 1] },
        "o": { "a": 0, "k": 100 }
      }]
    }]
  }]
};

interface MilestoneAnimationProps {
  milestone: string;
  show: boolean;
}

export function MilestoneAnimation({ milestone, show }: MilestoneAnimationProps) {
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (show && !hasShown) {
      setHasShown(true);
      // Reset after animation completes
      setTimeout(() => { setHasShown(false); }, 3000);
    }
  }, [show, hasShown]);

  const getMilestoneMessage = () => {
    switch (milestone) {
      case 'ideation':
        return 'Brilliant ideas taking shape!';
      case 'journey':
        return 'Your learning path is emerging!';
      case 'deliverables':
        return 'Almost there! Final stretch!';
      case 'complete':
        return 'Congratulations! Project complete!';
      default:
        return 'Great progress!';
    }
  };

  return (
    <AnimatePresence>
      {show && hasShown && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 25
          }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4">
            {/* Lottie Animation */}
            <div className="w-32 h-32">
              <Lottie 
                animationData={confettiAnimation}
                loop={false}
                autoplay={true}
              />
            </div>
            
            {/* Celebration Message */}
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-bold text-gray-800 dark:text-gray-100"
            >
              {getMilestoneMessage()}
            </motion.h3>
            
            {/* Progress Indicator */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
              style={{ width: '200px' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to track milestone completions
export function useMilestoneTracking() {
  const { currentState, progress } = useFSMv2();
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const [currentMilestone, setCurrentMilestone] = useState<string | null>(null);

  useEffect(() => {
    const checkMilestones = () => {
      // Check for ideation completion
      if (currentState.startsWith('JOURNEY') && !completedMilestones.has('ideation')) {
        setCompletedMilestones(prev => new Set([...prev, 'ideation']));
        setCurrentMilestone('ideation');
      }
      // Check for journey completion
      else if (currentState.startsWith('DELIVER') && !completedMilestones.has('journey')) {
        setCompletedMilestones(prev => new Set([...prev, 'journey']));
        setCurrentMilestone('journey');
      }
      // Check for deliverables completion
      else if (currentState.startsWith('PUBLISH') && !completedMilestones.has('deliverables')) {
        setCompletedMilestones(prev => new Set([...prev, 'deliverables']));
        setCurrentMilestone('deliverables');
      }
      // Check for full completion
      else if (progress.current >= progress.total && !completedMilestones.has('complete')) {
        setCompletedMilestones(prev => new Set([...prev, 'complete']));
        setCurrentMilestone('complete');
      }
    };

    checkMilestones();
  }, [currentState, progress, completedMilestones]);

  // Clear current milestone after showing
  useEffect(() => {
    if (currentMilestone) {
      const timer = setTimeout(() => { setCurrentMilestone(null); }, 4000);
      return () => { clearTimeout(timer); };
    }
  }, [currentMilestone]);

  return { currentMilestone, completedMilestones };
}