// ALFOnboarding.tsx - Enhanced onboarding that explains the ALF framework

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Target, Map, Package, ArrowRight, 
  CheckCircle, Users, Brain, Zap, Award
} from 'lucide-react';
import { EntranceAnimation, StageProgressAnimation } from '../../components/SubtleAnimations.jsx';

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  icon: React.ComponentType<any>;
  color: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to ALF Coach',
    subtitle: 'Your partner in creating transformative learning experiences',
    icon: Award,
    color: 'blue',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          ALF Coach helps you design project-based learning experiences that are grounded in 
          20+ years of educational research and proven to increase student engagement by 40%.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-semibold text-sm mb-1">2,000+ Educators</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Trust ALF Coach for their project design</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <Brain className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-semibold text-sm mb-1">Research-Based</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400">Built on cognitive science principles</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'research',
    title: 'Evidence-Based Learning',
    subtitle: 'Built on decades of educational research',
    icon: Brain,
    color: 'indigo',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          ALF Coach is grounded in peer-reviewed research showing that project-based learning:
        </p>
        <div className="space-y-3">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <h4 className="font-semibold text-indigo-900 text-sm mb-1">Academic Achievement</h4>
            <p className="text-xs text-indigo-700">
              Students score 8-10 percentage points higher on standardized tests compared to traditional instruction
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <h4 className="font-semibold text-indigo-900 text-sm mb-1">Future-Ready Skills</h4>
            <p className="text-xs text-indigo-700">
              Develops critical thinking, collaboration, and creativity needed for 65% of future jobs that don't exist yet
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <h4 className="font-semibold text-indigo-900 text-sm mb-1">Engagement & Motivation</h4>
            <p className="text-xs text-indigo-700">
              "All boats rise with the tide" - benefits students across all backgrounds and ability levels
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
          Sources: 2023 meta-analysis of 66 studies, Buck Institute for Education, World Economic Forum
        </p>
      </div>
    )
  },
  {
    id: 'framework',
    title: 'The Active Learning Framework',
    subtitle: 'A proven three-stage process for meaningful learning',
    icon: Zap,
    color: 'purple',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          ALF transforms traditional teaching into active investigation through three interconnected stages:
        </p>
        <div className="space-y-3">
          <motion.div 
            className="flex items-start gap-3 bg-purple-50 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-purple-900">Ideation</h4>
              <p className="text-sm text-purple-700">
                Start with authentic challenges that mirror real-world problems
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-orange-900">Journey</h4>
              <p className="text-sm text-orange-700">
                Build scaffolded learning pathways that develop essential skills
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-3 bg-green-50 p-3 rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-green-900">Deliverables</h4>
              <p className="text-sm text-green-700">
                Create authentic assessments that demonstrate real understanding
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: 'ideation-detail',
    title: 'Stage 1: Ideation',
    subtitle: 'Transform curriculum standards into compelling challenges',
    icon: Lightbulb,
    color: 'blue',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          In the Ideation stage, you'll craft a Big Idea and Challenge that drives authentic learning:
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">What You'll Create:</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>A Big Idea that connects to real-world relevance</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>An authentic Challenge students will solve</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Clear learning objectives aligned to standards</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
          Example: Instead of "Learn about ecosystems," create "Design a sustainable urban garden for our community"
        </p>
      </div>
    )
  },
  {
    id: 'journey-detail',
    title: 'Stage 2: Journey',
    subtitle: 'Design the learning pathway to success',
    icon: Map,
    color: 'orange',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          The Journey stage maps out how students will develop the knowledge and skills needed:
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-900 mb-2">Learning Design Elements:</h4>
          <ul className="space-y-2 text-sm text-orange-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Scaffolded activities that build complexity</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Collaborative learning opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <span>Formative assessments to guide progress</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
          ALF Coach helps you sequence activities for maximum learning impact
        </p>
      </div>
    )
  },
  {
    id: 'deliverables-detail',
    title: 'Stage 3: Deliverables',
    subtitle: 'Authentic demonstrations of learning',
    icon: Package,
    color: 'green',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          Deliverables show what students have learned through authentic products:
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Assessment Design:</h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Real-world products that matter</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Clear rubrics aligned to objectives</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Opportunities for reflection and revision</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 italic">
          Students create portfolios, presentations, or products—not just take tests
        </p>
      </div>
    )
  },
  {
    id: 'get-started',
    title: 'Ready to Transform Your Teaching?',
    subtitle: "Let's create your first ALF project together",
    icon: Target,
    color: 'purple',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          You're about to join thousands of educators who have transformed their classrooms 
          with the Active Learning Framework.
        </p>
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">What happens next:</h4>
          <ol className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">1.</span>
              <span>Tell us about your teaching context and goals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">2.</span>
              <span>ALF Coach guides you through each stage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-purple-600">3.</span>
              <span>Export your complete project plan</span>
            </li>
          </ol>
        </div>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 font-medium">
          Average time to first project: 45 minutes
        </p>
      </div>
    )
  }
];

interface ALFOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export const ALFOnboarding: React.FC<ALFOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  
  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;
  
  const goToNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };
  
  const goToPrevious = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
    green: 'from-green-400 to-green-600'
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClasses[step.color]} p-6 text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <IconComponent className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{step.title}</h2>
              <p className="text-white/80">{step.subtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Progress */}
        <div className="px-6 py-3 border-b border-gray-200">
          <StageProgressAnimation 
            currentStage={currentStep + 1} 
            totalStages={onboardingSteps.length} 
          />
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {step.content}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div>
            {currentStep > 0 ? (
              <button
                onClick={goToPrevious}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
              >
                ← Previous
              </button>
            ) : onSkip ? (
              <button
                onClick={onSkip}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
              >
                Skip overview
              </button>
            ) : null}
          </div>
          
          <button
            onClick={goToNext}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all
              flex items-center gap-2
              ${currentStep === onboardingSteps.length - 1
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
              }
            `}
          >
            {currentStep === onboardingSteps.length - 1 ? (
              <>
                Start Building
                <Zap className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};