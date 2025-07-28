import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, HelpCircle, Lightbulb, Target, CheckCircle } from 'lucide-react';

interface FlowGuidanceProps {
  currentStage: string;
  isFirstTime?: boolean;
  onDismiss?: () => void;
}

const stageGuidance: Record<string, {
  title: string;
  description: string;
  expectedAction: string;
  tips: string[];
  icon: React.ComponentType<{ className?: string }>;
}> = {
  IDEATION_INITIATOR: {
    title: "Welcome to ALF Coach!",
    description: "Let's start by exploring ideas for your learning experience.",
    expectedAction: "Click 'Let's Begin' to start your journey",
    tips: [
      "We'll guide you through each step",
      "You can always ask for help or examples",
      "Your progress is automatically saved"
    ],
    icon: Lightbulb
  },
  IDEATION_BIG_IDEA: {
    title: "Define Your Big Idea",
    description: "What's the core concept you want students to understand?",
    expectedAction: "Choose from the idea cards OR type your own idea",
    tips: [
      "Click on any idea card to select it",
      "Or type your own idea in the text box",
      "Use the 'Ideas' button for more suggestions"
    ],
    icon: Target
  },
  IDEATION_EQ: {
    title: "Essential Question",
    description: "What question will drive student inquiry?",
    expectedAction: "Select or write a thought-provoking question",
    tips: [
      "Questions should be open-ended",
      "Click 'What If?' for creative scenarios",
      "You can always refine your choice"
    ],
    icon: HelpCircle
  },
  IDEATION_CHALLENGE: {
    title: "Design a Challenge",
    description: "Create an authentic challenge for students to solve.",
    expectedAction: "Choose or create a real-world challenge",
    tips: [
      "Think about real-world applications",
      "Make it relevant to your students",
      "Click cards or type your own"
    ],
    icon: CheckCircle
  }
};

export function FlowGuidance({ currentStage, isFirstTime = false, onDismiss }: FlowGuidanceProps) {
  const [isExpanded, setIsExpanded] = useState(isFirstTime);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const guidance = stageGuidance[currentStage];
  
  if (!guidance || isDismissed) {return null;}
  
  const Icon = guidance.icon;
  
  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };
  
  return (
    <AnimatePresence>
      {isExpanded ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden mb-4"
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    {guidance.title}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {guidance.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsExpanded(false); }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {guidance.expectedAction}
              </p>
              <ul className="space-y-1">
                {guidance.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={handleDismiss}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Don't show this again
              </button>
              <button
                onClick={() => { setIsExpanded(false); }}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                Got it!
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setIsExpanded(true); }}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 mb-4"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Need help?</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}