/**
 * ALFProcessIntro.tsx
 * 
 * Educational introduction to the ALF (Active Learning Framework) process
 * Grounded in Gold Standard Project Based Learning principles
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Map,
  Package,
  CheckCircle,
  Users,
  ArrowRight,
  BookOpen,
  Target,
  Lightbulb,
  Compass,
  Rocket,
  Globe
} from 'lucide-react';

interface ALFProcessIntroProps {
  onContinue: () => void;
  onSkip: () => void;
}

// ALF stages aligned with Gold Standard PBL design elements
const ALF_STAGES = [
  {
    id: 'grounding',
    name: 'Grounding',
    icon: Compass,
    title: 'Ground in Purpose',
    description: 'Connect learning to real-world challenges students care about solving',
    details: [
      'Start with problems students see in their world',
      'Connect to genuine community needs and interests',
      'Align naturally with your curriculum standards',
      'Define real audiences who need student solutions'
    ],
    pblAlignment: 'Challenging Problem & Authenticity',
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'ideation',
    name: 'Ideation',
    icon: Lightbulb,
    title: 'Generate Ideas',
    description: 'Guide students through creative problem-solving and deep investigation',
    details: [
      'Explore multiple approaches to the problem',
      'Research what others have tried and learned',
      'Let student interests shape the investigation',
      'Build in feedback loops for continuous improvement'
    ],
    pblAlignment: 'Sustained Inquiry & Student Voice',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'journey',
    name: 'Journey',
    icon: Rocket,
    title: 'Navigate Learning',
    description: 'Support students as they develop solutions for authentic audiences',
    details: [
      'Develop solutions that matter to real people',
      'Use peer critique to strengthen student work',
      'Reflect on both process and outcomes',
      'Share results with the community who benefits'
    ],
    pblAlignment: 'Public Product & Reflection',
    color: 'from-indigo-400 to-blue-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800'
  }
];

// Research-based benefits (no fake statistics)
const PEDAGOGICAL_FOUNDATIONS = [
  { 
    icon: BookOpen, 
    text: 'Based on Gold Standard PBL',
    detail: 'Buck Institute for Education'
  },
  { 
    icon: Users, 
    text: 'Promotes 21st Century Skills',
    detail: 'Critical thinking, collaboration, communication'
  },
  { 
    icon: Globe, 
    text: 'Authentic Learning',
    detail: 'Real-world relevance and application'
  }
];

export function ALFProcessIntro({ onContinue, onSkip }: ALFProcessIntroProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [selectedFoundation, setSelectedFoundation] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 
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
                       bg-gradient-to-br from-primary-500 to-primary-600 
                       text-white mb-6 shadow-xl shadow-primary-500/25"
          >
            <Sparkles className="w-10 h-10" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
            The Active Learning Framework
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transform your curriculum into meaningful learning experiences where students 
            solve real problems and create authentic work. Built on <span className="font-semibold text-primary-600 dark:text-primary-400">
            Gold Standard Project Based Learning</span> principles.
          </p>

          {/* Pedagogical Foundations */}
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {PEDAGOGICAL_FOUNDATIONS.map((foundation, index) => {
              const Icon = foundation.icon;
              const isSelected = selectedFoundation === index;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedFoundation(isSelected ? null : index)}
                  className={`
                    flex flex-col items-center gap-2 px-6 py-4 
                    bg-white dark:bg-gray-800 rounded-xl shadow-md
                    cursor-pointer transition-all duration-200
                    ${isSelected ? 'ring-2 ring-primary-500 shadow-lg scale-105' : 'hover:shadow-lg hover:scale-102'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {foundation.text}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-gray-500 dark:text-gray-400 text-center"
                      >
                        {foundation.detail}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ALF Stages */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {ALF_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const isHovered = hoveredStage === stage.id;
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                onMouseEnter={() => setHoveredStage(stage.id)}
                onMouseLeave={() => setHoveredStage(null)}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: isHovered ? 1.02 : 1,
                    y: isHovered ? -4 : 0
                  }}
                  className={`
                    relative overflow-hidden rounded-2xl border-2 
                    ${stage.borderColor} ${stage.bgColor}
                    transition-all duration-300 cursor-pointer
                    ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
                  `}
                >
                  {/* Gradient Background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${stage.color} 
                    opacity-5 transition-opacity duration-300
                    ${isHovered ? 'opacity-10' : 'opacity-5'}
                  `} />
                  
                  {/* Stage Label */}
                  <div className="absolute top-4 right-4">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stage {index + 1}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    {/* Icon */}
                    <div className={`
                      inline-flex items-center justify-center w-14 h-14 rounded-xl 
                      bg-gradient-to-br ${stage.color} text-white mb-4
                      shadow-lg
                    `}>
                      <Icon className="w-7 h-7" />
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {stage.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {stage.description}
                    </p>
                    
                    {/* PBL Alignment Badge */}
                    <div className="inline-flex items-center gap-1 px-2 py-1 
                                  bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                      <Target className="w-3 h-3 text-primary-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {stage.pblAlignment}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="space-y-2">
                      {stage.details.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">
                            {detail}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Theoretical Foundation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="max-w-3xl mx-auto">
            <BookOpen className="w-12 h-12 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center tracking-tight">
              Built on What We Know Works
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Research Foundation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ALF draws from decades of learning science research, bringing together 
                  proven approaches including:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Constructivist learning theory (Piaget, Vygotsky)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Experiential learning cycles (Kolb)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Understanding by Design (Wiggins & McTighe)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Gold Standard PBL (Buck Institute)</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Practical Implementation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The framework helps you naturally implement proven teaching practices:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Backward design from learning outcomes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Formative assessment throughout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Differentiation and student agency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>Authentic performance assessment</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actual Workflow Process */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary-50 to-indigo-50 
                     dark:from-primary-900/20 dark:to-indigo-900/20 
                     rounded-2xl p-8 mb-8"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center tracking-tight">
              Your Actual Workflow: What You DO
            </h2>
            
            {/* Process Flow Visual */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span>45-75 minutes total</span> • <span>3 focused stages</span> • <span>Flexible iteration</span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Grounding */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Grounding (20-30 min)
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>You define:</strong>
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>Big Idea (core concept)</li>
                      <li>Essential Question (drives inquiry)</li>
                      <li>Authentic Challenge (real task)</li>
                    </ul>
                    <div className="text-xs text-blue-600 dark:text-blue-400 italic mt-2">
                      "What should students understand and investigate?"
                    </div>
                  </div>
                </div>

                {/* Journey */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Journey (15-25 min)
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>You plan 4 phases:</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-center p-1 bg-green-50 dark:bg-green-900/20 rounded">Analyze</div>
                      <div className="text-center p-1 bg-green-50 dark:bg-green-900/20 rounded">Brainstorm</div>
                      <div className="text-center p-1 bg-green-50 dark:bg-green-900/20 rounded">Prototype</div>
                      <div className="text-center p-1 bg-green-50 dark:bg-green-900/20 rounded">Evaluate</div>
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 italic mt-2">
                      "How will students progress through learning?"
                    </div>
                  </div>
                </div>

                {/* Deliverables */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Deliverables (10-20 min)
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      <strong>You specify:</strong>
                    </div>
                    <ul className="list-disc list-inside text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <li>Student products</li>
                      <li>Assessment rubric</li>
                      <li>Presentation format</li>
                      <li>Success milestones</li>
                    </ul>
                    <div className="text-xs text-purple-600 dark:text-purple-400 italic mt-2">
                      "What will students create and how will you assess it?"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary-500" />
                  Flexible Process
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Go back and refine any stage</li>
                  <li>• Use "Ideas" button when stuck</li>
                  <li>• Try "What if?" scenarios</li>
                  <li>• Iterate until it feels right</li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-500" />
                  Guided Support
                </h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Contextual suggestions for your content</li>
                  <li>• Clear prompts at each step</li>
                  <li>• Examples when you need them</li>
                  <li>• Quality checks before moving forward</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional Empowerment Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 
                        bg-gradient-to-r from-primary-50 to-indigo-50 
                        dark:from-primary-900/20 dark:to-indigo-900/20 
                        rounded-full border border-primary-200 dark:border-primary-800"
          >
            <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              ALF enhances your teaching expertise with structured, research-based design support
            </span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 
                     text-white font-semibold rounded-xl shadow-lg 
                     hover:shadow-xl transition-all duration-200
                     flex items-center gap-2 hover:from-primary-600 hover:to-primary-700"
          >
            Start Designing Your Project
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 dark:text-gray-400 
                     hover:text-gray-700 dark:hover:text-gray-300 
                     transition-colors duration-200"
          >
            Skip introduction
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}