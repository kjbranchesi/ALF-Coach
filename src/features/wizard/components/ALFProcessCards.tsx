/**
 * ALFProcessCards.tsx
 * Clean, elegant presentation of the ALF Process with flip functionality
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Map, Layers, ChevronRight, RotateCw } from 'lucide-react';

const processSteps = [
  {
    id: 'grounding',
    title: 'Grounding & Ideation',
    subtitle: 'Vision & Innovation',
    description: 'Define objectives while exploring creative possibilities and real-world connections',
    icon: Sparkles,
    color: 'from-primary-500 to-primary-600',
    bgGradient: 'from-primary-50 to-primary-100/50',
    iconBg: 'bg-primary-500',
    time: '8-10 min',
    subPhases: [
      { title: 'Context Setting', description: 'Establish the real-world relevance' },
      { title: 'Objective Definition', description: 'Clear learning goals and outcomes' },
      { title: 'Creative Exploration', description: 'Brainstorm innovative approaches' },
      { title: 'Connection Mapping', description: 'Link to existing knowledge' }
    ]
  },
  {
    id: 'journey',
    title: 'Journey',
    subtitle: 'Design the Path',
    description: 'Map out student activities and learning milestones',
    icon: Map,
    color: 'from-ai-500 to-ai-600',
    bgGradient: 'from-ai-50 to-ai-100/50',
    iconBg: 'bg-ai-500',
    time: '10-12 min',
    subPhases: [
      { title: 'Activity Sequencing', description: 'Order tasks for optimal learning' },
      { title: 'Milestone Planning', description: 'Define key checkpoints' },
      { title: 'Scaffolding Design', description: 'Build progressive challenges' },
      { title: 'Engagement Points', description: 'Create memorable experiences' }
    ]
  },
  {
    id: 'blueprint',
    title: 'Blueprint',
    subtitle: 'Ready to Launch',
    description: 'Your complete project plan with resources and assessments',
    icon: Layers,
    color: 'from-coral-500 to-coral-600',
    bgGradient: 'from-coral-50 to-coral-100/50',
    iconBg: 'bg-coral-500',
    time: '10-12 min',
    subPhases: [
      { title: 'Resource Compilation', description: 'Gather materials and tools' },
      { title: 'Assessment Design', description: 'Create evaluation criteria' },
      { title: 'Timeline Development', description: 'Set realistic deadlines' },
      { title: 'Implementation Guide', description: 'Step-by-step instructions' }
    ]
  }
];

const ProcessCard: React.FC<{ step: typeof processSteps[0], index: number }> = ({ step, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
      className="relative h-full"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} dark:from-gray-800 dark:to-gray-800/95 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer`}
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(true)}
        >
          {/* Animated gradient accent */}
          <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 hover:opacity-5 transition-opacity duration-300`} />
          
          {/* Top gradient bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step.color}`} />
          
          <div className="relative p-8 h-full flex flex-col">
            {/* Icon and Time */}
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className={`absolute inset-0 w-14 h-14 rounded-2xl ${step.iconBg} blur-xl opacity-40`} />
              </div>
              <span className="px-3 py-1.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                {step.time}
              </span>
            </div>

            {/* Content - flex-grow ensures consistent height */}
            <div className="flex-grow flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 min-h-[3.5rem]">
                {step.title}
              </h3>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                {step.subtitle}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                {step.description}
              </p>
            </div>

            {/* Flip indicator */}
            <div className="flex items-center justify-end mt-4 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <span className="text-xs font-medium mr-1">View details</span>
              <RotateCw className="w-3 h-3" />
            </div>

            {/* Step number */}
            <div className="absolute bottom-4 right-4 opacity-10">
              <span className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                {index + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} dark:from-gray-800 dark:to-gray-800/95 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onClick={() => setIsFlipped(false)}
        >
          <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step.color}`} />
          
          <div className="p-8 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {step.title} Details
              </h3>
              <button 
                onClick={() => setIsFlipped(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Sub-phases */}
            <div className="space-y-3 flex-grow">
              {step.subPhases.map((subPhase, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      {subPhase.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {subPhase.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Back to front indicator */}
            <div className="flex items-center justify-center mt-4 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <span className="text-xs font-medium">Click to flip back</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ALFProcessCards: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          The ALF Process
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Three simple steps to create powerful project-based learning
        </p>
      </div>

      {/* Process Cards - fixed height container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {processSteps.map((step, index) => (
          <div key={step.id} className="h-[420px]">
            <ProcessCard step={step} index={index} />
          </div>
        ))}
      </div>

      {/* Enhanced total time indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-8"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full shadow-inner">
          <div className="w-2 h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse" />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Total estimated time: <span className="font-bold text-primary-600 dark:text-primary-400">~30 minutes</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};