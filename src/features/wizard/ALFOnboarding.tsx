// ALFOnboarding.tsx - Clean, sophisticated onboarding for ALF Coach

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Target, Map, Package, ArrowRight, 
  CheckCircle, X, ChevronLeft
} from 'lucide-react';

interface OnboardingScreen {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const screens: OnboardingScreen[] = [
  {
    id: 'welcome',
    title: 'Welcome to ALF Coach',
    subtitle: 'Create engaging project-based learning experiences',
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300">
          ALF Coach guides you through designing meaningful learning projects that connect 
          to real-world challenges and inspire deep student engagement.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">Big Ideas</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Connect learning to real-world relevance
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
              <Map className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">Guided Journey</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Scaffold learning with purposeful activities
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-sm mb-1 text-gray-900 dark:text-gray-100">Authentic Products</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Students create work that matters
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'process',
    title: 'Your Journey in Three Stages',
    subtitle: 'A proven framework for project-based learning',
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Ideation: Spark the Big Idea
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Define a compelling challenge that connects curriculum to real-world issues
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">2</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Journey: Map the Learning Path
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Design activities and experiences that build knowledge and skills progressively
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Deliverables: Create & Celebrate
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Students produce authentic work and share their learning with real audiences
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Ready in 15 minutes:</strong> Get a complete project blueprint with assessments, 
            rubrics, and implementation timeline.
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
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">ALF Coach</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Your Teaching Adventure Begins</p>
            </div>
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
                  ? 'bg-blue-600' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="px-6 py-6">
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
              Skip intro
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {currentScreen === screens.length - 1 ? "Let's Build Something Amazing" : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};