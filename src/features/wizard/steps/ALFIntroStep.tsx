/**
 * ALFIntroStep.tsx
 * 
 * THIS IS THE MAIN ALF INTRODUCTION COMPONENT SHOWN IN THE WIZARD
 * Edit this file for any changes to the ALF process introduction screen
 * 
 * Note: ALFProcessIntro.tsx has been archived to prevent confusion
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ALFIntroStepProps {
  onContinue: () => void;
  onSkip: () => void;
}

interface ProcessCard {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string[];
  color: string;
}

const PROCESS_CARDS: ProcessCard[] = [
  {
    id: 1,
    title: "Welcome to ALF",
    subtitle: "Active Learning Framework",
    icon: Sparkles,
    content: [
      "Design meaningful projects in 12-18 minutes",
      "Built on Gold Standard PBL principles",
      "Transform any topic into authentic learning"
    ],
    color: "blue"
  },
  {
    id: 2,
    title: "Step 1: Grounding",
    subtitle: "5-7 minutes",
    icon: Target,
    content: [
      "Define the big concept students will explore",
      "Create an essential question to guide inquiry",
      "Design a real-world challenge to solve"
    ],
    color: "indigo"
  },
  {
    id: 3,
    title: "Step 2: Journey",
    subtitle: "5-7 minutes",
    icon: BookOpen,
    content: [
      "Map how students will research the problem",
      "Plan brainstorming and ideation activities",
      "Design building and testing phases"
    ],
    color: "emerald"
  },
  {
    id: 4,
    title: "What You'll Get",
    subtitle: "Ready to use",
    icon: Clock,
    content: [
      "Complete project blueprint",
      "Assessment rubric aligned to standards",
      "Student deliverables and timeline",
      "Everything you need to start teaching"
    ],
    color: "purple"
  }
];

export const ALFIntroStep: React.FC<ALFIntroStepProps> = ({ onContinue }) => {
  const [currentCard, setCurrentCard] = useState(0);
  
  const currentCardData = PROCESS_CARDS[currentCard];
  const Icon = currentCardData.icon;
  
  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-primary-500 to-primary-600",
      indigo: "from-indigo-500 to-indigo-600",
      emerald: "from-emerald-500 to-emerald-600",
      purple: "from-purple-500 to-purple-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const handleNext = () => {
    if (currentCard < PROCESS_CARDS.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const handlePrev = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  const handleStart = () => {
    if (currentCard === PROCESS_CARDS.length - 1) {
      onContinue();
    } else {
      setCurrentCard(PROCESS_CARDS.length - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Simple header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          The Active Learning Framework
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transform any topic into meaningful learning
        </p>
      </div>

      {/* Card container */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8"
          >
            {/* Card header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getColorClasses(currentCardData.color)} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {currentCardData.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentCardData.subtitle}
                </p>
              </div>
            </div>

            {/* Card content */}
            <div className="space-y-3 mb-8">
              {currentCardData.content.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mt-2 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {PROCESS_CARDS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCard(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentCard
                      ? 'w-8 bg-primary-500'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentCard === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentCard === 0
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                {currentCard === PROCESS_CARDS.length - 1 ? 'Start Designing' : 'Start Now'}
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={handleNext}
                disabled={currentCard === PROCESS_CARDS.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentCard === PROCESS_CARDS.length - 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom note */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Based on Gold Standard PBL principles
        </p>
      </div>
    </div>
  );
};