/**
 * ConfirmationFramework.tsx
 * 
 * Holistic confirmation and refinement system for ALF Coach
 * Implements the acknowledge → review → confirm → progress pattern
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, ArrowRight, Lightbulb, Edit3, Sparkles } from 'lucide-react';

export type ALFStage = 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES';
export type ConfirmationType = 'immediate' | 'review' | 'refine';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfirmationState {
  stage: ALFStage;
  pendingValue: string;
  confirmationMode: ConfirmationType;
  attempts: number;
  lastInteraction: 'typed' | 'suggestion' | 'refinement';
}

interface ProjectContext {
  subject: string;
  gradeLevel: string;
  duration: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
}

// Acknowledgment patterns for consistent language across stages
const ACKNOWLEDGMENT_PATTERNS = {
  BIG_IDEA: {
    positive: [
      "Excellent! '{value}' is a powerful conceptual foundation.",
      "Perfect! '{value}' gives students a rich area to explore.",
      "Great choice! '{value}' connects beautifully with your curriculum."
    ],
    build: [
      "This will help students dive deep into {subject}.",
      "Your {gradeLevel} students will find meaningful connections here.",
      "This opens up authentic learning opportunities."
    ],
    transition: [
      "With that foundation, let's shape the driving question.",
      "Now let's craft the essential question that will guide inquiry.",
      "Ready to develop the question that will spark curiosity?"
    ]
  },
  
  ESSENTIAL_QUESTION: {
    positive: [
      "Brilliant! '{value}' will drive deep inquiry.",
      "Excellent question! '{value}' is open-ended and thought-provoking.",
      "Perfect! '{value}' connects to your big idea beautifully."
    ],
    build: [
      "This question will guide students through meaningful investigation.",
      "Students will explore multiple perspectives with this question.",
      "This creates space for authentic discovery and debate."
    ],
    transition: [
      "Now let's define the real-world challenge students will tackle.",
      "Ready to create the authentic problem students will solve?",
      "Time to design the challenge that makes learning meaningful."
    ]
  },
  
  CHALLENGE: {
    positive: [
      "Outstanding! '{value}' is an authentic, engaging challenge.",
      "Perfect! '{value}' gives students real purpose and audience.",
      "Excellent! '{value}' connects learning to meaningful action."
    ],
    build: [
      "Students will see the real-world impact of their learning.",
      "This challenge creates genuine motivation for deep work.",
      "Your students will develop solutions that truly matter."
    ],
    transition: [
      "Now let's map out how students will work through this challenge.",
      "Ready to design the learning journey through the creative process?",
      "Time to plan the phases that will guide student success."
    ]
  },

  JOURNEY: {
    positive: [
      "Excellent! This learning journey will guide students through meaningful discovery.",
      "Perfect! '{value}' creates a clear path through the creative process.",
      "Great structure! This will help students build deep understanding."
    ],
    build: [
      "Students will develop both skills and knowledge through this journey.",
      "This progression supports authentic learning and growth.",
      "Each phase builds naturally toward the final challenge."
    ],
    transition: [
      "Now let's define what students will create and how you'll assess it.",
      "Ready to design the deliverables and assessment approach?",
      "Time to plan how students will demonstrate their learning."
    ]
  },

  DELIVERABLES: {
    positive: [
      "Excellent! '{value}' provides clear expectations and authentic assessment.",
      "Perfect! This assessment approach honors both process and product.",
      "Outstanding! Students will demonstrate real mastery through these deliverables."
    ],
    build: [
      "This assessment strategy supports deep learning and reflection.",
      "Students will see their growth throughout the entire project.",
      "These deliverables connect directly to your learning objectives."
    ],
    transition: [
      "Your project blueprint is now complete!",
      "Ready to export and begin implementation?",
      "Time to bring this amazing project to your students!"
    ]
  }
};

// Micro-confirmation UI component
interface ConfirmationMicroUIProps {
  type: 'progress-update' | 'build-forward' | 'gentle-question';
  value: string;
  stage: ALFStage;
  confidence: ConfidenceLevel;
  onConfirm: () => void;
  onRefine: () => void;
  context: ProjectContext;
}

const ConfirmationMicroUI: React.FC<ConfirmationMicroUIProps> = ({
  type,
  value,
  stage,
  confidence,
  onConfirm,
  onRefine,
  context
}) => {
  const stageDisplay = stage.toLowerCase().replace('_', ' ');

  switch (type) {
    case 'progress-update':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-l-4 border-green-400 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-green-800 dark:text-green-200 font-medium">
                Added to your {stageDisplay} - moving forward!
              </p>
              <div className="mt-2 w-full bg-green-200 dark:bg-green-800 rounded-full h-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  className="h-1 bg-green-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      );

    case 'build-forward':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 mb-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-blue-900 dark:text-blue-100 text-lg font-medium mb-2">
                "<strong>{value}</strong>" - I can work with this!
              </p>
              <p className="text-blue-700 dark:text-blue-300 mb-4">
                Ready to build on it and move forward?
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Let's continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRefine}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Refine it
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      );

    case 'gentle-question':
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 mb-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-amber-900 dark:text-amber-100 font-medium mb-3">
                I want to make sure I understand your {stageDisplay} correctly:
              </p>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-amber-200 dark:border-amber-700 mb-4">
                <p className="text-gray-900 dark:text-gray-100 italic">"{value}"</p>
              </div>
              <p className="text-amber-800 dark:text-amber-200 mb-4">
                Does this capture what you're thinking?
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Yes, continue
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRefine}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Let me adjust it
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      );

    default:
      return null;
  }
};

// Refinement sidebar component
interface RefinementSidebarProps {
  currentValue: string;
  stage: ALFStage;
  context: ProjectContext;
  onUpdate: (value: string) => void;
  onCancel: () => void;
  suggestions: Array<{ id: string; text: string }>;
}

const RefinementSidebar: React.FC<RefinementSidebarProps> = ({
  currentValue,
  stage,
  context,
  onUpdate,
  onCancel,
  suggestions
}) => {
  const [refinedValue, setRefinedValue] = useState(currentValue);
  const stageDisplay = stage.toLowerCase().replace('_', ' ');

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Refine Your {stageDisplay}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current: "{currentValue}"
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Text editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adjust your input:
              </label>
              <textarea
                value={refinedValue}
                onChange={(e) => setRefinedValue(e.target.value)}
                placeholder={`Refine your ${stageDisplay} here...`}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 resize-none"
              />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Or try one of these approaches:
                </p>
                <div className="space-y-2">
                  {suggestions.map((suggestion) => (
                    <motion.button
                      key={suggestion.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setRefinedValue(suggestion.text)}
                      className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {suggestion.text}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onUpdate(refinedValue)}
              disabled={!refinedValue.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Update & Continue
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Keep Original
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main confirmation framework hook
export const useConfirmationFramework = () => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState | null>(null);
  const [showRefinementSidebar, setShowRefinementSidebar] = useState(false);

  // Determine confirmation type based on input quality and attempts
  const getConfirmationType = (
    value: string, 
    stage: ALFStage, 
    attempts: number,
    source: 'typed' | 'suggestion' | 'refinement'
  ): ConfirmationType => {
    // Quality indicators by stage
    const qualityChecks = {
      BIG_IDEA: value.length > 5 && !value.includes('?'),
      ESSENTIAL_QUESTION: value.includes('?') && value.length > 15,
      CHALLENGE: value.length > 20 && (value.includes('create') || value.includes('design') || value.includes('solve')),
      JOURNEY: value.length > 10,
      DELIVERABLES: value.length > 10
    };

    const passesQuality = qualityChecks[stage] || true;

    // Suggestion cards always get immediate confirmation
    if (source === 'suggestion') return 'immediate';
    
    // High confidence - immediate progress
    if (attempts === 1 && passesQuality && value.length > 15) {
      return 'immediate';
    }
    
    // Medium confidence - gentle check-in
    if (attempts <= 2 && passesQuality) {
      return 'review';
    }
    
    // Low confidence - explicit confirmation needed
    return 'refine';
  };

  // Generate acknowledgment message
  const generateAcknowledgment = (
    value: string, 
    stage: ALFStage, 
    context: ProjectContext
  ): string => {
    const patterns = ACKNOWLEDGMENT_PATTERNS[stage];
    const positive = patterns.positive[Math.floor(Math.random() * patterns.positive.length)]
      .replace('{value}', value);
    const build = patterns.build[Math.floor(Math.random() * patterns.build.length)]
      .replace('{subject}', context.subject || 'your subject')
      .replace('{gradeLevel}', context.gradeLevel || 'your students');
    const transition = patterns.transition[Math.floor(Math.random() * patterns.transition.length)];
    
    return `${positive}\n\n${build}\n\n${transition}`;
  };

  // Should offer refinement based on quality and attempts
  const shouldOfferRefinement = (value: string, stage: ALFStage, attempts: number): boolean => {
    const qualityChecks = {
      BIG_IDEA: value.length > 5,
      ESSENTIAL_QUESTION: value.includes('?') && value.length > 10,
      CHALLENGE: value.length > 15,
      JOURNEY: value.length > 8,
      DELIVERABLES: value.length > 8
    };

    const passesQuality = qualityChecks[stage] || true;
    
    return (!passesQuality && attempts < 3) || value.length < 5;
  };

  return {
    confirmationState,
    showRefinementSidebar,
    setConfirmationState,
    setShowRefinementSidebar,
    getConfirmationType,
    generateAcknowledgment,
    shouldOfferRefinement,
    ConfirmationMicroUI,
    RefinementSidebar
  };
};

// Utility function to get refinement suggestions
export const getRefinementSuggestions = (stage: ALFStage, currentValue: string, context: ProjectContext) => {
  const suggestions = {
    BIG_IDEA: [
      { id: '1', text: `The intersection of ${context.subject} and real-world impact` },
      { id: '2', text: `Systems thinking in ${context.subject}` },
      { id: '3', text: `How ${context.subject} shapes our community` }
    ],
    ESSENTIAL_QUESTION: [
      { id: '1', text: `How might we use ${context.subject} to solve community problems?` },
      { id: '2', text: `Why does ${context.bigIdea || 'this concept'} matter for our future?` },
      { id: '3', text: `What would happen if we reimagined ${context.subject}?` }
    ],
    CHALLENGE: [
      { id: '1', text: `Create a ${context.subject}-based solution that addresses local needs` },
      { id: '2', text: `Design and test a prototype that demonstrates your learning` },
      { id: '3', text: `Develop a presentation for community stakeholders` }
    ],
    JOURNEY: [
      { id: '1', text: 'Students research, analyze, brainstorm, prototype, and present solutions' },
      { id: '2', text: 'Guided discovery through investigation, ideation, creation, and reflection' },
      { id: '3', text: 'Scaffolded progression from understanding to creating to sharing' }
    ],
    DELIVERABLES: [
      { id: '1', text: 'Portfolio, prototype, and public presentation with peer feedback' },
      { id: '2', text: 'Process documentation, final product, and reflection essay' },
      { id: '3', text: 'Research report, solution proposal, and community showcase' }
    ]
  };

  return suggestions[stage] || [];
};

export default ConfirmationFramework;