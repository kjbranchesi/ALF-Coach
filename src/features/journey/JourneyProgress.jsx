// src/features/journey/JourneyProgress.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const JourneyProgressCard = ({ 
  title, 
  value, 
  description, 
  isComplete, 
  isCurrent,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-300
        ${isCurrent 
          ? 'border-blue-300 bg-blue-50 shadow-md ring-2 ring-blue-100' 
          : isComplete 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-200 bg-gray-50'
        }
      `}
    >
      {/* Status Icon */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`
            flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold
            ${isCurrent 
              ? 'bg-blue-200 text-blue-700' 
              : isComplete 
                ? 'bg-green-200 text-green-700' 
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {isComplete ? <CheckIcon /> : isCurrent ? '•' : '○'}
          </div>
          <h3 className={`
            font-semibold text-sm
            ${isCurrent ? 'text-blue-800' : isComplete ? 'text-green-800' : 'text-gray-600'}
          `}>
            {title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 mb-3">{description}</p>

      {/* Value */}
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="value"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              p-3 rounded border font-medium text-sm
              ${isComplete 
                ? 'bg-white border-green-200 text-green-800' 
                : 'bg-white border-blue-200 text-blue-800'
              }
            `}
          >
            {Array.isArray(value) ? (
              <div className="space-y-1">
                {value.map((item, index) => (
                  <div key={index} className="text-xs">
                    • {item}
                  </div>
                ))}
              </div>
            ) : (
              `"${value}"`
            )}
          </motion.div>
        ) : isCurrent ? (
          <motion.div
            key="current"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded border-2 border-dashed border-blue-300 text-blue-600 text-sm italic"
          >
            Working on this now...
          </motion.div>
        ) : (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded border border-gray-200 text-gray-500 text-sm italic"
          >
            Coming up next...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const JourneyProgress = ({ journeyData = {}, currentStep }) => {
  const { phases = [], resources } = journeyData;

  const steps = [
    {
      key: 'phases',
      title: '🗺️ Learning Phases',
      description: 'Process-based stages that scaffold cognitive development',
      value: phases.length > 0 ? phases.map(p => p.title || p).join(' → ') : null,
      isComplete: phases.length > 0,
      isCurrent: currentStep === 'phases'
    },
    {
      key: 'activities', 
      title: '🎯 Active Engagement',
      description: 'Authentic tasks that mirror professional practice',
      value: phases.length > 0 && phases.every(p => p.activities) ? 
        phases.map(p => `${p.title}: ${p.activities}`).slice(0, 2).join('; ') + (phases.length > 2 ? '...' : '') : 
        null,
      isComplete: phases.length > 0 && phases.every(p => p.activities),
      isCurrent: currentStep === 'activities'
    },
    {
      key: 'resources',
      title: '🛠️ Expert Resources',
      description: 'Professional tools, authentic materials, and human expertise',
      value: resources,
      isComplete: !!resources,
      isCurrent: currentStep === 'resources'
    }
  ];

  const completedCount = steps.filter(step => step.isComplete).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <div className="bg-white rounded-xl border border-blue-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-blue-800">
            Learning Journey Progress
          </h3>
          <span className="text-sm font-medium text-blue-600">
            {completedCount}/3 Complete
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-blue-100 rounded-full h-2">
          <motion.div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Progress Cards */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <JourneyProgressCard
            key={step.key}
            title={step.title}
            value={step.value}
            description={step.description}
            isComplete={step.isComplete}
            isCurrent={step.isCurrent}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Completion Message */}
      {completedCount === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckIcon />
            <h4 className="font-semibold text-green-800">Learning Journey Expertly Designed!</h4>
          </div>
          <p className="text-sm text-green-700">
            Your phases follow research-based progressions, activities mirror professional practice, and resources connect to authentic expertise. This journey transforms students from learners to practitioners!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default JourneyProgress;