/**
 * ChatbotOnboarding.tsx
 * 
 * First-time user onboarding for the ChatbotFirst interface
 * Teaches the mental model: Teachers DESIGN, Students JOURNEY
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Users, 
  Compass, 
  Sparkles, 
  CheckCircle,
  RotateCcw,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface ChatbotOnboardingProps {
  onComplete: () => void;
  userName?: string;
}

interface OnboardingStep {
  id: number;
  title: string;
  content: string;
  icon: React.ReactNode;
  highlight?: string;
  visual?: React.ReactNode;
}

export const ChatbotOnboarding: React.FC<ChatbotOnboardingProps> = ({ 
  onComplete, 
  userName = 'Educator' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenBefore, setHasSeenBefore] = useState(false);
  
  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: `Welcome, ${userName}!`,
      content: "I'm your AI curriculum design partner. Together, we'll create transformative learning experiences using the Creative Process framework.",
      icon: <Sparkles className="w-8 h-8 text-blue-500" />,
      highlight: "AI-powered design partner"
    },
    {
      id: 2,
      title: "Your Role: Curriculum Designer",
      content: "You DESIGN the learning experience. You're not going through the Creative Process yourself - you're planning how YOUR STUDENTS will journey through it.",
      icon: <BookOpen className="w-8 h-8 text-purple-500" />,
      highlight: "You design FOR students",
      visual: (
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-purple-600 font-semibold">Teacher</div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="text-gray-600">Designs Curriculum</div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="text-green-600 font-semibold">Students Experience</div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "The Creative Process: 4 Phases",
      content: "Your students will journey through four phases of creation. Each phase builds on the previous, with room for iteration and growth.",
      icon: <Compass className="w-8 h-8 text-green-500" />,
      visual: (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1/4 bg-blue-500 text-white p-2 rounded text-sm">Analyze 25%</div>
            <span className="text-xs text-gray-600">Investigate & understand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1/4 bg-purple-500 text-white p-2 rounded text-sm">Brainstorm 25%</div>
            <span className="text-xs text-gray-600">Generate ideas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[35%] bg-green-500 text-white p-2 rounded text-sm">Prototype 35%</div>
            <span className="text-xs text-gray-600">Build & test</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[15%] bg-orange-500 text-white p-2 rounded text-sm">Evaluate 15%</div>
            <span className="text-xs text-gray-600">Reflect & refine</span>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Iteration is Learning",
      content: "The Creative Process celebrates iteration! Students can loop back, pivot, or restart. This isn't failure - it's deep learning in action.",
      icon: <RotateCcw className="w-8 h-8 text-orange-500" />,
      highlight: "Iteration ≠ Failure",
      visual: (
        <div className="mt-4 flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 rounded-lg">
            <RotateCcw className="w-3 h-3" />
            Quick Loop
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 rounded-lg">
            <ArrowRight className="w-3 h-3" />
            Major Pivot
          </button>
          <button className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 rounded-lg">
            <Sparkles className="w-3 h-3" />
            Fresh Start
          </button>
        </div>
      )
    },
    {
      id: 5,
      title: "How We'll Work Together",
      content: "Through conversation, I'll help you design each element: Big Idea, Essential Question, Challenge, and the journey phases. I'll offer suggestions when helpful, but you're always in control.",
      icon: <Lightbulb className="w-8 h-8 text-yellow-500" />,
      highlight: "Conversational design process",
      visual: (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Natural conversation, not forms</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>AI suggestions when you need them</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Visual timeline of student journey</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Everything saves automatically</span>
          </div>
        </div>
      )
    }
  ];
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save that user has completed onboarding
      localStorage.setItem('alf-onboarding-complete', 'true');
      onComplete();
    }
  };
  
  const handleSkip = () => {
    localStorage.setItem('alf-onboarding-complete', 'true');
    onComplete();
  };
  
  // Check if user has seen onboarding before
  React.useEffect(() => {
    const hasCompleted = localStorage.getItem('alf-onboarding-complete');
    if (hasCompleted) {
      setHasSeenBefore(true);
    }
  }, []);
  
  const currentStepData = steps[currentStep];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
        >
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep 
                    ? 'w-8 bg-blue-600' 
                    : index < currentStep 
                    ? 'bg-blue-400' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {currentStepData.icon}
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-900">
            {currentStepData.title}
          </h2>
          
          {/* Highlight */}
          {currentStepData.highlight && (
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {currentStepData.highlight}
              </span>
            </div>
          )}
          
          {/* Content */}
          <p className="text-gray-600 text-center mb-6">
            {currentStepData.content}
          </p>
          
          {/* Visual */}
          {currentStepData.visual && (
            <div className="mb-6">
              {currentStepData.visual}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              {hasSeenBefore ? 'Skip reminder' : 'Skip tour'}
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              {currentStep === steps.length - 1 ? "Let's Start!" : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};