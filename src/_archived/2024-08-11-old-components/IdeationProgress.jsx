// src/features/ideation/IdeationProgress.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const IdeationProgressCard = ({ 
  title, 
  value, 
  description, 
  isComplete, 
  isCurrent, 
  onEdit,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`
        relative p-4 soft-rounded soft-transition
        ${isCurrent 
          ? 'soft-card ring-2 ring-blue-300' 
          : isComplete 
            ? 'soft-card bg-green-50' 
            : 'soft-card'
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
        
        {/* Edit Button */}
        {isComplete && onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2 py-1 text-xs text-green-700 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
          >
            <EditIcon />
            Edit
          </button>
        )}
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
            "{value}"
          </motion.div>
        ) : isCurrent ? (
          <motion.div
            key="current"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 soft-rounded border-2 border-dashed border-blue-300 text-blue-600 text-sm italic shadow-soft-inset"
          >
            Working on this now...
          </motion.div>
        ) : (
          <motion.div
            key="pending"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 soft-rounded shadow-soft-inset text-gray-500 text-sm italic"
          >
            Coming up next...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const IdeationProgress = ({ ideationData = {}, currentStep, onEditStep }) => {
  const { bigIdea, essentialQuestion, challenge } = ideationData;

  const steps = [
    {
      key: 'bigIdea',
      title: 'Big Idea',
      description: 'The broad theme that anchors your project',
      value: bigIdea,
      isComplete: !!bigIdea,
      isCurrent: currentStep === 'bigIdea'
    },
    {
      key: 'essentialQuestion', 
      title: 'Essential Question',
      description: 'The driving inquiry that sparks curiosity',
      value: essentialQuestion,
      isComplete: !!essentialQuestion,
      isCurrent: currentStep === 'essentialQuestion'
    },
    {
      key: 'challenge',
      title: 'Challenge',
      description: 'The meaningful work students will accomplish',
      value: challenge,
      isComplete: !!challenge,
      isCurrent: currentStep === 'challenge'
    }
  ];

  const completedCount = steps.filter(step => step.isComplete).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  return (
    <div className="soft-card soft-rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-blue-800">
            Your Project Foundation
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
          <IdeationProgressCard
            key={step.key}
            title={step.title}
            value={step.value}
            description={step.description}
            isComplete={step.isComplete}
            isCurrent={step.isCurrent}
            onEdit={onEditStep ? () => onEditStep(step.key) : null}
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
            <h4 className="font-semibold text-green-800">Foundation Complete!</h4>
          </div>
          <p className="text-sm text-green-700">
            You've built a strong foundation for authentic learning. These three elements will guide the entire project design.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default IdeationProgress;