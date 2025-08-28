/**
 * ALFProcessCards.tsx
 * Clean, elegant presentation of the ALF Process with flip functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Map, Layers, ChevronRight, RotateCw, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
      className="relative h-full"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ 
          rotateY: { duration: 0.6, type: 'spring', stiffness: 100 },
          scale: { duration: 0.2 }
        }}
      >
        {/* Front of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${step.bgGradient} dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden cursor-pointer group`}
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(true)}
        >
          {/* Premium gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
          
          {/* Animated gradient orb */}
          <motion.div 
            className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${step.color} opacity-10 blur-3xl`}
            animate={{
              scale: isHovered ? 1.2 : 1,
              opacity: isHovered ? 0.15 : 0.1
            }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Top gradient bar with shimmer effect */}
          <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${step.color}`} />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: isHovered ? ['0%', '100%'] : '0%'
              }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 1
              }}
            />
          </div>
          
          <div className="relative p-8 h-full flex flex-col">
            {/* Icon and Time */}
            <div className="flex items-start justify-between mb-6">
              <div className="relative">
                <motion.div 
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  animate={{
                    rotate: isHovered ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
                <div className={`absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
              </div>
              <motion.span 
                className="px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                animate={{
                  scale: isHovered ? 1.05 : 1
                }}
                transition={{ duration: 0.2 }}
              >
                {step.time}
              </motion.span>
            </div>

            {/* Content - flex-grow ensures consistent height */}
            <div className="flex-grow flex flex-col">
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 line-clamp-2 min-h-[3.5rem]">
                {step.title}
              </h3>
              <p className={`text-sm font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-3 uppercase tracking-wider`}>
                {step.subtitle}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-grow">
                {step.description}
              </p>
            </div>

            {/* Enhanced flip indicator */}
            <motion.div 
              className="flex items-center justify-start mt-4 group/flip"
              animate={{
                x: isHovered ? 5 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${step.color} bg-opacity-10 backdrop-blur-sm transition-all duration-300 group-hover/flip:bg-opacity-15`}>
                <RotateCw className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">View details</span>
                <ArrowRight className="w-3 h-3 text-gray-600 dark:text-gray-400 group-hover/flip:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>

            {/* Premium step number with gradient */}
            <div className="absolute bottom-6 right-6">
              <div className="relative">
                <span className={`text-7xl font-black bg-gradient-to-br ${step.color} bg-clip-text text-transparent opacity-10`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-700/50 overflow-hidden cursor-pointer`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onClick={() => setIsFlipped(false)}
        >
          {/* Premium mesh gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div className={`absolute top-0 right-0 w-72 h-72 bg-gradient-to-br ${step.color} opacity-20 blur-3xl`} />
            <div className={`absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr ${step.color} opacity-15 blur-3xl`} />
          </div>
          
          {/* Top gradient bar with glass effect */}
          <div className="absolute top-0 left-0 right-0 h-16 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-90`} />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['0%', '200%']
              }}
              transition={{
                duration: 3,
                ease: 'linear',
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          </div>
          
          <div className="relative p-6 h-full flex flex-col">
            {/* Premium header with badge */}
            <div className="flex items-start justify-between mb-8 mt-8">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                    {step.title} Blueprint
                  </h3>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                    Step {index + 1} of 3 • {step.time}
                  </p>
                </div>
              </div>
              <motion.button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className={`p-2.5 rounded-xl bg-gradient-to-br ${step.color} bg-opacity-10 hover:bg-opacity-15 backdrop-blur-sm transition-all duration-200 group`}
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <RotateCw className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </motion.button>
            </div>

            {/* Enhanced sub-phases with premium styling */}
            <div className="space-y-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {step.subPhases.map((subPhase, idx) => (
                <motion.div 
                  key={idx} 
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.3 }}
                >
                  <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-200 group/item">
                    {/* Enhanced numbered badge */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center shadow-md group-hover/item:shadow-lg transition-shadow duration-200`}>
                        <span className="text-white text-sm font-bold">{idx + 1}</span>
                      </div>
                      {idx < step.subPhases.length - 1 && (
                        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b ${step.color} opacity-20`} />
                      )}
                    </div>
                    
                    {/* Content with enhanced typography */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                          {subPhase.title}
                        </h4>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.1 }}
                        >
                          <CheckCircle2 className={`w-4 h-4 text-${step.color.split('-')[1]}-500 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200`} />
                        </motion.div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {subPhase.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Premium footer with progress indicator */}
            <div className="mt-6 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i === index 
                            ? `bg-gradient-to-r ${step.color} shadow-sm` 
                            : i < index 
                            ? 'bg-gray-400 dark:bg-gray-600' 
                            : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Process Step
                  </span>
                </div>
                
                <motion.div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 group/back cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCw className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 group-hover/back:text-primary-500 transition-colors" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover/back:text-primary-500 transition-colors">
                    Flip to overview
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ALFProcessCards: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Enhanced Header with gradient text */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-4xl font-black bg-gradient-to-r from-primary-600 via-ai-600 to-coral-600 bg-clip-text text-transparent mb-3">
          The ALF Process
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Three powerful steps to transform your ideas into engaging project-based learning experiences
        </p>
      </motion.div>

      {/* Process Cards with enhanced container */}
      <div className="relative">
        {/* Connection lines between cards - desktop only */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
          <div className="flex justify-between px-[25%]">
            <motion.div 
              className="w-full h-0.5 bg-gradient-to-r from-primary-500/30 via-ai-500/30 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
            <motion.div 
              className="w-full h-0.5 bg-gradient-to-r from-transparent via-ai-500/30 to-coral-500/30"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {processSteps.map((step, index) => (
            <div 
              key={step.id} 
              className="h-[420px]"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <ProcessCard step={step} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Premium total time indicator with progress visualization */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col items-center gap-4 mt-12"
      >
        {/* Time breakdown bar */}
        <div className="flex items-center gap-2 w-full max-w-md">
          {processSteps.map((step, index) => (
            <motion.div 
              key={step.id}
              className="relative flex-1"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
            >
              <div className={`h-2 bg-gradient-to-r ${step.color} rounded-full shadow-sm`} />
              <motion.div
                className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredCard === index ? 1 : 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {step.time}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced total time badge */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              ))}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Complete process in
              </p>
              <p className="text-lg font-bold bg-gradient-to-r from-primary-600 via-ai-600 to-coral-600 bg-clip-text text-transparent">
                ~30 minutes
              </p>
            </div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 via-ai-500 to-coral-500 rounded-2xl opacity-10 blur-xl" />
        </motion.div>
      </motion.div>
    </div>
  );
};