/**
 * ALFProcessCards.tsx
 * Clean, elegant presentation of the ALF Process
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Map, Package } from 'lucide-react';

const processSteps = [
  {
    id: 'grounding',
    title: 'Grounding',
    subtitle: 'Define Your Vision',
    description: 'Establish the core learning objectives and real-world connections',
    icon: Lightbulb,
    color: 'from-blue-500 to-blue-600',
    time: '5-7 min'
  },
  {
    id: 'journey',
    title: 'Journey',
    subtitle: 'Design the Path',
    description: 'Map out student activities and learning milestones',
    icon: Map,
    color: 'from-purple-500 to-purple-600',
    time: '5-7 min'
  },
  {
    id: 'blueprint',
    title: 'Blueprint',
    subtitle: 'Ready to Launch',
    description: 'Your complete project plan with resources and assessments',
    icon: Package,
    color: 'from-green-500 to-green-600',
    time: '2-3 min'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {processSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`} />
              
              <div className="p-6">
                {/* Icon and Time */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {step.time}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {step.subtitle}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total time indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total time: ~15 minutes
        </p>
      </div>
    </div>
  );
};