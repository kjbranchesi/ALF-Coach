/**
 * ALFProcessIntro.tsx
 * 
 * Visual introduction to the ALF (Active Learning Framework) process
 * Integrated as Step 0 of the wizard for first-time users
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Map,
  Package,
  CheckCircle,
  Clock,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb
} from 'lucide-react';

interface ALFProcessIntroProps {
  onContinue: () => void;
  onSkip: () => void;
}

const ALF_PHASES = [
  {
    id: 'analyze',
    name: 'Analyze',
    icon: Sparkles,
    title: 'Define Your Vision',
    description: 'Clarify learning goals and craft your driving question',
    details: [
      'Develop compelling driving question',
      'Identify real-world connections',
      'Assess student interests & readiness',
      'Align with standards'
    ],
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: Map,
    title: 'Design the Journey',
    description: 'Map out the learning experience and student inquiry path',
    details: [
      'Create sustained inquiry path',
      'Build in student voice & choice',
      'Plan critique & revision cycles',
      'Design collaboration structures'
    ],
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'formulate',
    name: 'Formulate',
    icon: Package,
    title: 'Create Deliverables',
    description: 'Define public products and authentic assessment criteria',
    details: [
      'Design public products',
      'Identify real-world audience',
      'Create standards-based rubrics',
      'Plan celebration & reflection'
    ],
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
];

const TEACHER_BENEFITS = [
  { icon: Clock, text: '~30 minutes to complete blueprint' },
  { icon: Users, text: 'Join 10,000+ PBL educators' },
  { icon: Star, text: '4.8/5 teacher satisfaction' }
];

export function ALFProcessIntro({ onContinue, onSkip }: ALFProcessIntroProps) {
  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full 
                       bg-gradient-to-br from-primary-400 to-primary-600 
                       text-white mb-6 shadow-xl"
          >
            <Lightbulb className="w-10 h-10" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Meet ALF: Your PBL Design Partner
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            The <span className="font-semibold text-primary-600 dark:text-primary-400">
            Active Learning Framework</span> guides you through 
            Gold Standard Project Based Learning design in three simple phases.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {TEACHER_BENEFITS.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 
                           rounded-full shadow-md"
                >
                  <Icon className="w-5 h-5 text-primary-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {benefit.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Process Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {ALF_PHASES.map((phase, index) => {
            const Icon = phase.icon;
            const isHovered = hoveredPhase === phase.id;
            
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                onMouseEnter={() => setHoveredPhase(phase.id)}
                onMouseLeave={() => setHoveredPhase(null)}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.02 : 1,
                    y: isHovered ? -4 : 0
                  }}
                  className={`
                    relative overflow-hidden rounded-2xl border-2 
                    ${phase.borderColor} ${phase.bgColor}
                    transition-all duration-300 cursor-pointer
                    ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
                  `}
                >
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${phase.color} 
                    opacity-5 transition-opacity duration-300
                    ${isHovered ? 'opacity-10' : 'opacity-5'}
                  `} />
                  
                  {/* Phase Number */}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full 
                                bg-white/80 dark:bg-gray-800/80 
                                flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    {/* Icon */}
                    <div className={`
                      inline-flex items-center justify-center w-14 h-14 rounded-xl 
                      bg-gradient-to-br ${phase.color} text-white mb-4
                      shadow-lg
                    `}>
                      <Icon className="w-7 h-7" />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {phase.description}
                    </p>
                    
                    {/* Details (shown on hover or always on mobile) */}
                    <AnimatePresence>
                      {(isHovered || window.innerWidth < 768) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {phase.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-700 dark:text-gray-300">
                                {detail}
                              </span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How ALF Works
            </h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 
                              flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">1</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Answer guided questions
                  </span> about your project topic, learning goals, and context
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 
                              flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">2</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Collaborate with our AI coach
                  </span> to develop your driving question and project framework
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 
                              flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400">3</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    Receive your complete PBL blueprint
                  </span> with rubrics, milestones, and resources
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reassurance Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 
                        bg-gradient-to-r from-emerald-50 to-teal-50 
                        dark:from-emerald-900/20 dark:to-teal-900/20 
                        rounded-full border border-emerald-200 dark:border-emerald-800"
          >
            <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              You remain in control—ALF enhances your expertise, not replaces it
            </span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 
                     text-white font-semibold rounded-xl shadow-lg 
                     hover:shadow-xl transition-all duration-200
                     flex items-center gap-2"
          >
            Let's Create Something Amazing
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 dark:text-gray-400 
                     hover:text-gray-700 dark:hover:text-gray-300 
                     transition-colors duration-200"
          >
            I've used ALF before - Skip intro
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}