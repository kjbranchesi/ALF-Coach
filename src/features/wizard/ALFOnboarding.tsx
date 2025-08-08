// ALFOnboarding.tsx - Refined onboarding that explains the Alf methodology clearly

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, TrendingUp, Clock, ArrowRight, 
  CheckCircle, X, ChevronLeft, Zap, Target, Map
} from 'lucide-react';

interface OnboardingScreen {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const screens: OnboardingScreen[] = [
  {
    id: 'transformation',
    title: 'Stop Fighting for Their Attention',
    subtitle: 'Transform passive learners into engaged problem-solvers',
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* What's Not Working */}
          <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-200 dark:border-red-900/30">
            <h4 className="font-semibold text-red-900 dark:text-red-200 mb-3 flex items-center gap-2">
              <span className="text-red-600">✗</span> What's Not Working
            </h4>
            <ul className="space-y-2 text-sm text-red-800 dark:text-red-300">
              <li>• You rush through curriculum</li>
              <li>• Students memorize for tests, then forget</li>
              <li>• "When will I ever use this?" echoes daily</li>
              <li>• Engagement drops after 10 minutes</li>
            </ul>
          </div>
          
          {/* Your Dream Classroom */}
          <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-xl border border-green-200 dark:border-green-900/30">
            <h4 className="font-semibold text-green-900 dark:text-green-200 mb-3 flex items-center gap-2">
              <span className="text-green-600">✓</span> Your Dream Classroom
            </h4>
            <ul className="space-y-2 text-sm text-green-800 dark:text-green-300">
              <li>• Students lead their own learning</li>
              <li>• They solve problems that matter</li>
              <li>• "Can we keep working on this?" becomes common</li>
              <li>• Learning sticks because it's real</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-200 dark:border-blue-900/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Here's the thing...
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Students using project-based learning score <strong>25% higher</strong> on retention tests 
                and show <strong>40% more engagement</strong>. Not because they're "better students" — 
                but because they finally see why it matters.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">87%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Students Say "I Finally Get It"</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">3x</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">More Likely to Remember After 6 Months</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">100%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Of Your Standards Still Covered</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'method',
    title: 'Skip the Weekend Planning Marathon',
    subtitle: 'Get a complete project blueprint in 15 minutes (really)',
    content: (
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-300">
          You know how project planning usually works? Hours of research, curriculum mapping, 
          rubric creation... Alf does it all while you sip your coffee.
        </p>
        
        <div className="space-y-4">
          {/* Stage 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Step 1: Find Your Hook
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Alf transforms your topic into a real-world challenge students actually care about
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>You'll walk away with:</strong> Big idea, driving question, and authentic challenge 
                  that makes students say "Let's figure this out!"
                </p>
              </div>
            </div>
          </div>
          
          {/* Stage 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Step 2: Map the Learning Journey
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Alf designs activities that build skills naturally — no more "because I said so" lessons
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>You'll walk away with:</strong> Week-by-week plan, differentiated activities, 
                  and resources that actually exist (and are free!)
                </p>
              </div>
            </div>
          </div>
          
          {/* Stage 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Step 3: Create Something Real
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Students produce work they're proud to share — not just another worksheet
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  <strong>You'll walk away with:</strong> Student-friendly rubrics, peer review tools, 
                  and presentation templates they'll actually use
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Get Your Weekend Back
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                What used to take 10+ hours of planning happens in 15 minutes. 
                Export everything to Google Docs and you're ready for Monday.
              </p>
            </div>
          </div>
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
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
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
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Alf Coach</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Project-Based Learning, Simplified</p>
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
              I'm convinced, let's go
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {currentScreen === 0 ? 'Show Me More' : "Start My Blueprint"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};