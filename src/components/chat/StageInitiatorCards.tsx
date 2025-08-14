/**
 * StageInitiatorCards.tsx
 * Stage initiator cards that help users start each major stage of the curriculum design process
 * 
 * Features:
 * - Color-coded cards by type (blue for ideation, orange for what-if, purple for resources)
 * - Contextual cards based on current stage (WELCOME, IDEATION, JOURNEY, DELIVERABLES)
 * - Click to populate chat input with starter prompts
 * - Smooth animations with framer-motion
 * - Responsive grid layout
 * - Integration with feature flag 'stageInitiatorCards'
 * 
 * Usage:
 * - Shows automatically in ChatbotFirstInterfaceFixed when conditions are met
 * - Cards appear when user needs guidance (few messages, no typing, appropriate stage)
 * - Replaces placeholder values like [subject] and [duration] with actual context data
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  HelpCircle, 
  Target, 
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface StageInitiatorCard {
  id: string;
  title: string;
  description: string;
  example: string;
  icon: React.ReactNode;
  color: 'blue' | 'orange' | 'purple';
  starterPrompt: string;
}

interface StageInitiatorCardsProps {
  currentStage: string;
  onCardClick: (prompt: string) => void;
  className?: string;
}

const STAGE_CARDS: Record<string, StageInitiatorCard[]> = {
  WELCOME: [
    {
      id: 'big-idea-starter',
      title: 'Big Idea Starter',
      description: 'Begin with a compelling theme or concept that will anchor your entire learning experience',
      example: 'e.g., "Climate change impacts on our local community"',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'blue',
      starterPrompt: 'I want to explore a big idea around [topic]. Could you help me develop a compelling theme that will engage my students and connect to real-world issues?'
    },
    {
      id: 'essential-question-builder',
      title: 'Essential Question Builder',
      description: 'Craft an open-ended question that drives inquiry and critical thinking throughout the project',
      example: 'e.g., "How might we reduce our school\'s environmental impact?"',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'orange',
      starterPrompt: 'I need help creating an essential question that will drive student inquiry. My subject is [subject] and I want students to explore [topic/theme].'
    }
  ],
  IDEATION: [
    {
      id: 'big-idea-starter',
      title: 'Big Idea Starter',
      description: 'Begin with a compelling theme or concept that will anchor your entire learning experience',
      example: 'e.g., "Climate change impacts on our local community"',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'blue',
      starterPrompt: 'I want to explore a big idea around [topic]. Could you help me develop a compelling theme that will engage my students and connect to real-world issues?'
    },
    {
      id: 'essential-question-builder',
      title: 'Essential Question Builder',
      description: 'Craft an open-ended question that drives inquiry and critical thinking throughout the project',
      example: 'e.g., "How might we reduce our school\'s environmental impact?"',
      icon: <HelpCircle className="w-5 h-5" />,
      color: 'orange',
      starterPrompt: 'I need help creating an essential question that will drive student inquiry. My subject is [subject] and I want students to explore [topic/theme].'
    },
    {
      id: 'challenge-designer',
      title: 'Challenge Designer',
      description: 'Define an authentic problem or challenge that students will work to solve',
      example: 'e.g., "Design a solution to reduce food waste in our cafeteria"',
      icon: <Target className="w-5 h-5" />,
      color: 'purple',
      starterPrompt: 'I want to create an authentic challenge for my students to solve. The challenge should connect to [topic/theme] and allow them to make a real impact.'
    }
  ],
  JOURNEY: [
    {
      id: 'phase-timeline-creator',
      title: 'Phase Timeline Creator',
      description: 'Structure how students will move through the creative process phases',
      example: 'e.g., "Week 1-2: Analyze, Week 3: Brainstorm, Week 4-5: Prototype"',
      icon: <Clock className="w-5 h-5" />,
      color: 'blue',
      starterPrompt: 'I need help structuring the learning journey phases for my project. My project duration is [duration] and I want students to progress through Analyze, Brainstorm, Prototype, and Evaluate phases.'
    },
    {
      id: 'challenge-designer',
      title: 'Challenge Designer',
      description: 'Define an authentic problem or challenge that students will work to solve',
      example: 'e.g., "Design a solution to reduce food waste in our cafeteria"',
      icon: <Target className="w-5 h-5" />,
      color: 'purple',
      starterPrompt: 'I want to create an authentic challenge for my students to solve. The challenge should connect to [topic/theme] and allow them to make a real impact.'
    }
  ],
  DELIVERABLES: [
    {
      id: 'phase-timeline-creator',
      title: 'Phase Timeline Creator',
      description: 'Structure how students will move through the creative process phases',
      example: 'e.g., "Week 1-2: Analyze, Week 3: Brainstorm, Week 4-5: Prototype"',
      icon: <Clock className="w-5 h-5" />,
      color: 'blue',
      starterPrompt: 'I need help structuring the learning journey phases for my project. My project duration is [duration] and I want students to progress through Analyze, Brainstorm, Prototype, and Evaluate phases.'
    }
  ]
};

const getColorClasses = (color: 'blue' | 'orange' | 'purple') => {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        hoverBorder: 'hover:border-blue-400',
        icon: 'text-blue-600',
        title: 'text-blue-900'
      };
    case 'orange':
      return {
        bg: 'bg-gradient-to-r from-orange-50 to-yellow-50',
        border: 'border-orange-200',
        hoverBorder: 'hover:border-orange-400',
        icon: 'text-orange-600',
        title: 'text-orange-900'
      };
    case 'purple':
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
        border: 'border-purple-200',
        hoverBorder: 'hover:border-purple-400',
        icon: 'text-purple-600',
        title: 'text-purple-900'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-white',
        border: 'border-gray-200',
        hoverBorder: 'hover:border-gray-400',
        icon: 'text-gray-600',
        title: 'text-gray-900'
      };
  }
};

export const StageInitiatorCards: React.FC<StageInitiatorCardsProps> = ({
  currentStage,
  onCardClick,
  className = ''
}) => {
  const cards = STAGE_CARDS[currentStage] || [];

  if (cards.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Get Started</h3>
        <span className="text-sm text-gray-500">
          Choose a starting point for your curriculum design
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const colorClasses = getColorClasses(card.color);
          
          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCardClick(card.starterPrompt)}
              className={`
                text-left p-6 rounded-xl border transition-all duration-200
                ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hoverBorder}
                hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              `}
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-white ${colorClasses.icon}`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm ${colorClasses.title}`}>
                    {card.title}
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                {card.description}
              </p>

              {/* Example */}
              <div className="text-xs text-gray-500 italic">
                {card.example}
              </div>

              {/* Hover indicator */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/50">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click to start
                </span>
                <motion.div
                  initial={{ x: -5, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="group"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-6"
      >
        <p className="text-sm text-gray-500">
          These prompts will help you get started. You can always customize them or start with your own approach.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default StageInitiatorCards;