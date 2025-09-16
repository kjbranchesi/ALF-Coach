// SubtleAnimations.jsx - Professional animations for ALF Coach

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';

// Animation variants for consistent motion design
export const animationVariants = {
  // Fade and scale for cards
  cardEntry: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Slide animations for stage transitions
  slideFromRight: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  
  // Success celebration
  successPulse: {
    initial: { scale: 0 },
    animate: { 
      scale: [0, 1.2, 1],
      transition: { duration: 0.5, ease: 'backOut' }
    }
  },
  
  // Loading dots
  loadingDot: {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

/**
 * Stage Progress Animation
 */
export const StageProgressAnimation = ({ currentStage, totalStages }) => {
  const progress = (currentStage / totalStages) * 100;
  
  return (
    <div className="relative">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      {/* Milestone markers */}
      <div className="absolute inset-0 flex justify-between px-1">
        {Array.from({ length: totalStages }).map((_, index) => (
          <motion.div
            key={index}
            className={`w-4 h-4 rounded-full -mt-1 ${
              index < currentStage 
                ? 'bg-primary-600' 
                : index === currentStage 
                ? 'bg-purple-600' 
                : 'bg-gray-300'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: index <= currentStage ? 1 : 0.8 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Success Celebration Component
 */
export const SuccessCelebration = ({ show, message = "Great job!" }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
            animate={{ 
              scale: [1, 1.05, 1],
              transition: { duration: 0.5, repeat: 2 }
            }}
          >
            <motion.div
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, ease: 'backOut' }}
            >
              <svg className="w-10 h-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{message}</h3>
            <p className="text-gray-600">You've successfully completed this stage!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Loading State with Professional Animation
 */
export const ProfessionalLoader = ({ size = 'medium', message }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} border-4 border-gray-200 rounded-full`}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <motion.div
            className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">{message}</p>
      )}
    </div>
  );
};

/**
 * Card Hover Effect
 */
export const HoverCard = ({ children, className = '' }) => {
  return (
    <motion.div
      className={`transform transition-all ${className}`}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Entrance Animation Wrapper
 */
export const EntranceAnimation = ({ 
  children, 
  delay = 0, 
  direction = 'up',
  className = '' 
}) => {
  const directions = {
    up: { y: 20, x: 0 },
    down: { y: -20, x: 0 },
    left: { x: 20, y: 0 },
    right: { x: -20, y: 0 }
  };
  
  const initialPosition = directions[direction] || directions.up;
  
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...initialPosition }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Smooth Accordion Component
 */
export const SmoothAccordion = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <motion.svg
          className="w-5 h-5 text-gray-500"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </motion.svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="border-t border-gray-200"
          >
            <div className="px-6 py-4 bg-gray-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Pulse Animation for Important Elements
 */
export const PulseHighlight = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'rgba(59, 130, 246, 0.5)',
    green: 'rgba(34, 197, 94, 0.5)',
    purple: 'rgba(147, 51, 234, 0.5)',
    orange: 'rgba(251, 146, 60, 0.5)'
  };
  
  return (
    <div className="relative inline-block">
      <motion.div
        className="absolute inset-0 rounded-lg"
        animate={{
          boxShadow: [
            `0 0 0 0 ${colors[color]}`,
            `0 0 0 10px transparent`,
            `0 0 0 0 transparent`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut'
        }}
      />
      {children}
    </div>
  );
};