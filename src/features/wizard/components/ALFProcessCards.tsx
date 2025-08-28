/**
 * ALFProcessCards.tsx
 * Clean, professional presentation of the ALF Process
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Map, Layers, ArrowRight, Info } from 'lucide-react';

const processSteps = [
  {
    id: 'grounding',
    title: 'Grounding & Ideation',
    subtitle: 'Vision & Innovation',
    description: 'Define objectives while exploring creative possibilities and real-world connections',
    icon: Sparkles,
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    borderColor: 'border-primary-200 dark:border-primary-800',
    iconBg: 'bg-primary-500',
    time: '8-10 min',
    keyElements: [
      'Big Idea',
      'Essential Question',
      'Challenge Statement',
      'Real-World Context'
    ],
    flow: 'Start with WHY - Connect learning to real-world relevance'
  },
  {
    id: 'journey',
    title: 'Journey',
    subtitle: 'Design the Path',
    description: 'Map out student activities and learning milestones',
    icon: Map,
    color: 'from-ai-500 to-ai-600',
    bgColor: 'bg-ai-50 dark:bg-ai-900/20',
    borderColor: 'border-ai-200 dark:border-ai-800',
    iconBg: 'bg-ai-500',
    time: '10-12 min',
    keyElements: [
      'Activity Sequence',
      'Scaffolding',
      'Milestones',
      'Engagement Points'
    ],
    flow: 'Design HOW - Create the learning experience pathway'
  },
  {
    id: 'blueprint',
    title: 'Blueprint',
    subtitle: 'Ready to Launch',
    description: 'Your complete project plan with resources and assessments',
    icon: Layers,
    color: 'from-coral-500 to-coral-600',
    bgColor: 'bg-coral-50 dark:bg-coral-900/20',
    borderColor: 'border-coral-200 dark:border-coral-800',
    iconBg: 'bg-coral-500',
    time: '10-12 min',
    keyElements: [
      'Deliverables',
      'Resources',
      'Assessment Rubrics',
      'Timeline'
    ],
    flow: 'Define WHAT - Concrete outcomes and materials'
  }
];

export const ALFProcessCards: React.FC = () => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          The ALF Process
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Three powerful steps to transform your ideas into engaging project-based learning experiences
        </p>
      </div>

      {/* Process Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {processSteps.map((step, index) => {
          const Icon = step.icon;
          const isExpanded = expandedCard === step.id;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Card - fixed min-height for uniformity */}
              <div className={`relative ${step.bgColor} rounded-xl border ${step.borderColor} overflow-hidden transition-all duration-300 min-h-[420px] flex flex-col`}>
                {/* Top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color}`} />
                
                <div className="p-6 flex flex-col flex-grow">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2 py-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                      {step.time}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {step.description}
                  </p>

                  {/* Flow Description */}
                  <div className="mb-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {step.flow}
                    </p>
                  </div>

                  {/* Spacer to push button to bottom */}
                  <div className="flex-grow"></div>

                  {/* View Details Button */}
                  <button
                    onClick={() => toggleCard(step.id)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    {isExpanded ? 'Hide' : 'View'} key elements
                  </button>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        Key Elements:
                      </p>
                      <div className="space-y-2">
                        {step.keyElements.map((element, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                              <span className="text-[10px] text-white font-bold">{idx + 1}</span>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {element}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Step Number (subtle) */}
                <div className="absolute bottom-4 right-4 opacity-5">
                  <span className="text-7xl font-bold text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </span>
                </div>
              </div>

              {/* Connection Arrow (between cards on desktop) */}
              {index < processSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Process Flow Indicator */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Why</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-ai-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">How</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-coral-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">What</span>
        </div>
      </div>

      {/* Total time indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete process in <span className="font-medium text-gray-900 dark:text-gray-100">~30 minutes</span>
          </p>
        </div>
      </div>
    </div>
  );
};