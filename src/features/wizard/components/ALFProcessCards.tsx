/**
 * ALFProcessCards.tsx
 * Clean, elegant presentation of the ALF Process
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Map, Layers } from 'lucide-react';

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
    time: '8-10 min'
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
    time: '10-12 min'
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
    time: '10-12 min'
  }
];

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

      {/* Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {processSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative group"
            >
              {/* Card with subtle gradient background */}
              <div className={`relative bg-gradient-to-br ${step.bgGradient} dark:from-gray-800 dark:to-gray-800/95 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden`}>
                {/* Animated gradient accent */}
                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                {/* Top gradient bar with enhanced visibility */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step.color} transform origin-left group-hover:scale-x-110 transition-transform duration-300`} />
                
                <div className="relative p-8">
                  {/* Icon and Time with enhanced layout */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {/* Subtle glow effect */}
                      <div className={`absolute inset-0 w-14 h-14 rounded-2xl ${step.iconBg} blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300`} />
                    </div>
                    <span className="px-3 py-1.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                      {step.time}
                    </span>
                  </div>

                  {/* Enhanced Content */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Step indicator */}
                  <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                    <span className="text-6xl font-bold text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
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