// ALFOnboarding.tsx - Educational overview of the ALF process

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Map, Package, ArrowRight, 
  X, ChevronLeft, ChevronRight
} from 'lucide-react';

interface OnboardingScreen {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const screens: OnboardingScreen[] = [
  {
    id: 'overview',
    title: 'The ALF Process',
    subtitle: 'A structured approach to project-based learning',
    content: (
      <div className="space-y-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            ALF (Active Learning Framework) helps you design project-based learning experiences 
            that connect curriculum standards to real-world challenges. The process has three main stages:
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Ideation */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Stage 1: Ideation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Define the core concept and driving question for your project
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Identify a <strong>Big Idea</strong> that connects to curriculum standards</li>
                  <li>• Develop an <strong>Essential Question</strong> to guide inquiry</li>
                  <li>• Create an <strong>Authentic Challenge</strong> with real-world relevance</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Journey */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Stage 2: Learning Journey
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Design the sequence of activities and milestones
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Plan <strong>weekly milestones</strong> with clear objectives</li>
                  <li>• Design <strong>scaffolded activities</strong> that build skills progressively</li>
                  <li>• Include <strong>formative assessments</strong> to track progress</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Deliverables */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Stage 3: Deliverables
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Define the final products and assessment criteria
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                  <li>• Create <strong>rubrics</strong> aligned with learning objectives</li>
                  <li>• Design <strong>presentation formats</strong> for sharing work</li>
                  <li>• Develop <strong>reflection activities</strong> for metacognition</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'workflow',
    title: 'How the ALF Project Builder Works',
    subtitle: 'Your role in the process',
    content: (
      <div className="space-y-6">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            The ALF Project Builder, paired with ALF Coach, guides you through each stage with AI assistance. Here's what to expect:
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Builder Setup */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                1
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Set up the ALF Project Builder
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your vision, subject area, student demographics, and timeline so the ALF Project Builder understands your context and constraints.
              </p>
            </div>
          </div>
          
          {/* Collaboration */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                2
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Collaborate with ALF
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                At each stage, ALF will generate suggestions based on your input. You can accept, 
                modify, or request alternatives. Use the action buttons (Ideas, What If, Help) to 
                explore different directions.
              </p>
            </div>
          </div>
          
          {/* Review */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                3
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Review and Refine
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                After each stage, review the generated content. You can always go back to make 
                changes or ask for refinements. Your expertise guides the process.
              </p>
            </div>
          </div>
          
          {/* Export */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                4
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Export Your Blueprint
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Once complete, export your project blueprint as a formatted document. You'll have 
                everything needed to implement the project in your classroom.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg border border-primary-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong className="text-primary-900 dark:text-primary-100">Remember:</strong> You're the expert 
            on your students and context. ALF provides structure and suggestions, but your judgment 
            shapes the final project.
          </p>
        </div>
      </div>
    )
  }
];

interface ALFOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const ALFOnboarding: React.FC<ALFOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const screen = screens[currentScreen];
  
  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  const handleBack = () => {
    if (currentScreen > 0) {
      setCurrentScreen(prev => prev - 1);
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Getting Started with ALF</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Understanding the project design process</p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Skip introduction"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress dots */}
        <div className="px-6 py-3 flex justify-center gap-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentScreen 
                  ? 'bg-primary-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {screen.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {screen.subtitle}
              </p>
              {screen.content}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentScreen === 0}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentScreen === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              {currentScreen === screens.length - 1 ? 'Begin Setup' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
