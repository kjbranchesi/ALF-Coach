/**
 * WizardFlow.tsx - Initial setup wizard for ALF Coach
 * Collects: Grade level, Subject, Duration, ALF Stage focus
 * 
 * Dark button aesthetic design:
 * - Dark gray/charcoal rounded buttons with light text
 * - Soft shadows and hover effects
 * - Light gray background in light mode, dark in dark mode
 * - Numbered progress bar with proper dark mode support
 * - Consistent design language across all steps
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../../../core/types/SOPTypes';
import { EnhancedCard as Card, CardContent } from '../../../design-system';
import { Button } from '../../../design-system';
import { Icon } from '../../../design-system';
import { Text, Heading } from '../../../design-system';

interface WizardFlowProps {
  onComplete: (data: WizardData) => void;
  initialData?: Partial<WizardData>;
}

type WizardStep = 'grade' | 'subject' | 'duration' | 'focus' | 'confirm';

const GRADE_LEVELS = [
  { value: 'Elementary (K-2)', icon: 'baby' as const, color: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'Elementary (3-5)', icon: 'users' as const, color: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'Middle School (6-8)', icon: 'school' as const, color: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'High School (9-12)', icon: 'graduationCap' as const, color: 'bg-amber-50 dark:bg-amber-900/20' },
  { value: 'College/University', icon: 'building' as const, color: 'bg-indigo-50 dark:bg-indigo-900/20' }
];

const SUBJECTS = [
  { value: 'English/Language Arts', icon: 'book' as const },
  { value: 'Mathematics', icon: 'calculator' as const },
  { value: 'Science', icon: 'flask' as const },
  { value: 'Social Studies/History', icon: 'globe' as const },
  { value: 'Art/Music', icon: 'palette' as const },
  { value: 'Physical Education', icon: 'activity' as const },
  { value: 'Technology/Computer Science', icon: 'code' as const },
  { value: 'World Languages', icon: 'languages' as const },
  { value: 'Other', icon: 'moreHorizontal' as const }
];

const DURATIONS = [
  { value: '1-2 weeks', icon: 'zap' as const, description: 'Quick sprint project' },
  { value: '3-4 weeks', icon: 'target' as const, description: 'Standard unit length' },
  { value: '5-6 weeks', icon: 'trending' as const, description: 'Extended exploration' },
  { value: '7-8 weeks', icon: 'award' as const, description: 'Deep dive project' },
  { value: 'Full semester', icon: 'calendar' as const, description: 'Comprehensive program' }
];

const ALF_FOCUSES = [
  { 
    value: 'catalyst', 
    label: 'Catalyst', 
    icon: 'lightbulb' as const,
    description: 'Focus on identifying problems and opportunities',
    color: 'from-amber-400 to-orange-500'
  },
  { 
    value: 'issues', 
    label: 'Issues', 
    icon: 'search' as const,
    description: 'Deep dive into specific challenges',
    color: 'from-blue-400 to-cyan-500'
  },
  { 
    value: 'method', 
    label: 'Method', 
    icon: 'tools' as const,
    description: 'Emphasize solution approaches',
    color: 'from-purple-400 to-pink-500'
  },
  { 
    value: 'engagement', 
    label: 'Engagement', 
    icon: 'heart' as const,
    description: 'Prioritize student involvement',
    color: 'from-red-400 to-rose-500'
  },
  { 
    value: 'balanced', 
    label: 'Balanced', 
    icon: 'scales' as const,
    description: 'Equal focus on all ALF stages',
    color: 'from-green-400 to-emerald-500'
  }
];

export const WizardFlow: React.FC<WizardFlowProps> = ({ 
  onComplete, 
  initialData = {} 
}) => {
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('grade');
  const [data, setData] = React.useState<Partial<WizardData>>(initialData);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const steps: WizardStep[] = ['grade', 'subject', 'duration', 'focus', 'confirm'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex + 1]);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex - 1]);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    if (data.gradeLevel && data.subject && data.duration && data.alfFocus) {
      onComplete(data as WizardData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'grade':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <Heading size="lg" className="text-gray-900 dark:text-gray-100 mb-2">
                What grade level are you teaching?
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">
                This helps us tailor the content and complexity
              </Text>
            </div>
            
            <div className="grid gap-4">
              {GRADE_LEVELS.map((grade, index) => (
                <motion.button
                  key={grade.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setData({ ...data, gradeLevel: grade.value });
                    handleNext();
                  }}
                  className={`
                    w-full px-6 py-4 rounded-2xl text-left
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    border border-gray-200 dark:border-gray-700
                    shadow-lg hover:shadow-xl
                    transform transition-all duration-200 
                    hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${data.gradeLevel === grade.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-blue-200/50 dark:shadow-blue-900/50' 
                      : ''
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 shadow-sm">
                      <Icon name={grade.icon} size="md" className="text-blue-500" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {grade.value}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'subject':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <Heading size="lg" className="text-gray-900 dark:text-gray-100 mb-2">
                What subject area?
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">
                We'll customize the project to your curriculum
              </Text>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUBJECTS.map((subject, index) => (
                <motion.button
                  key={subject.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    setData({ ...data, subject: subject.value });
                    handleNext();
                  }}
                  className={`
                    w-full px-6 py-4 rounded-2xl
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    border border-gray-200 dark:border-gray-700
                    shadow-lg hover:shadow-xl
                    transform transition-all duration-200 
                    hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${data.subject === subject.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-blue-200/50 dark:shadow-blue-900/50' 
                      : ''
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={subject.icon} size="sm" className="text-blue-500" />
                    <span className="font-medium text-left">
                      {subject.value}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'duration':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <Heading size="lg" className="text-gray-900 dark:text-gray-100 mb-2">
                How long will this project run?
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">
                We'll pace the activities appropriately
              </Text>
            </div>
            
            <div className="grid gap-4">
              {DURATIONS.map((duration, index) => (
                <motion.button
                  key={duration.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setData({ ...data, duration: duration.value });
                    handleNext();
                  }}
                  className={`
                    w-full px-6 py-5 rounded-2xl text-left
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    border border-gray-200 dark:border-gray-700
                    shadow-lg hover:shadow-xl
                    transform transition-all duration-200 
                    hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${data.duration === duration.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-blue-200/50 dark:shadow-blue-900/50' 
                      : ''
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20 shadow-sm">
                      <Icon name={duration.icon} size="sm" className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {duration.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {duration.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'focus':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <Heading size="lg" className="text-gray-900 dark:text-gray-100 mb-2">
                Which ALF stage would you like to emphasize?
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">
                Choose your pedagogical focus for this project
              </Text>
            </div>
            
            <div className="grid gap-4">
              {ALF_FOCUSES.map((focus, index) => (
                <motion.button
                  key={focus.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setData({ ...data, alfFocus: focus.value });
                    handleNext();
                  }}
                  className={`
                    w-full px-6 py-5 rounded-2xl text-left overflow-hidden
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    border border-gray-200 dark:border-gray-700
                    shadow-lg hover:shadow-xl
                    transform transition-all duration-200 
                    hover:scale-[1.02] hover:bg-gray-50 dark:hover:bg-gray-700
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${data.alfFocus === focus.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20 shadow-blue-200/50 dark:shadow-blue-900/50' 
                      : ''
                    }
                  `}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${focus.color}`} />
                  <div className="flex items-start gap-4 relative">
                    <div className="p-3 rounded-xl bg-blue-500/20 shadow-sm">
                      <Icon name={focus.icon} size="md" className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {focus.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {focus.description}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'confirm':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 mb-4"
              >
                <Icon name="checkCircle" size="xl" className="text-green-600 dark:text-green-400" />
              </motion.div>
              <Heading size="lg" className="text-gray-900 dark:text-gray-100 mb-2">
                Let's confirm your project setup
              </Heading>
              <Text className="text-gray-600 dark:text-gray-400">
                Everything look good? Let's start building!
              </Text>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Icon name="users" size="sm" className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <Text size="sm" className="font-medium text-gray-700 dark:text-gray-300">Grade Level</Text>
                    <Text className="font-semibold text-gray-900 dark:text-gray-100">{data.gradeLevel}</Text>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Icon name="book" size="sm" className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <Text size="sm" className="font-medium text-gray-700 dark:text-gray-300">Subject</Text>
                    <Text className="font-semibold text-gray-900 dark:text-gray-100">{data.subject}</Text>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Icon name="clock" size="sm" className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <Text size="sm" className="font-medium text-gray-700 dark:text-gray-300">Duration</Text>
                    <Text className="font-semibold text-gray-900 dark:text-gray-100">{data.duration}</Text>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Icon name="target" size="sm" className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <Text size="sm" className="font-medium text-gray-700 dark:text-gray-300">ALF Focus</Text>
                    <Text className="font-semibold text-gray-900 dark:text-gray-100">
                      {ALF_FOCUSES.find(f => f.value === data.alfFocus)?.label}
                    </Text>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleComplete}
                variant="primary"
                size="lg"
                fullWidth
                className="shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                leftIcon="rocket"
              >
                Start Building Your Project
              </Button>
            </motion.div>
          </motion.div>
        );
    }
  };

  const stepLabels = ['Grade', 'Subject', 'Duration', 'Focus', 'Confirm'];

  return (
    <div className="wizard-flow max-w-3xl mx-auto p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Progress Indicator */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between mb-6">
          {stepLabels.map((label, index) => {
            const isActive = currentIndex >= index;
            const isCurrent = currentIndex === index;
            return (
              <motion.div 
                key={label} 
                className="flex-1 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative">
                  <motion.div 
                    className={`
                      mx-auto w-12 h-12 rounded-full flex items-center justify-center
                      font-bold text-sm transition-all duration-300 shadow-lg
                      ${isCurrent 
                        ? 'bg-blue-600 text-white shadow-blue-500/25 scale-110' 
                        : isActive 
                          ? 'bg-green-500 text-white shadow-green-500/25' 
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 shadow-gray-500/25'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isActive && !isCurrent ? (
                      <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </motion.div>
                  <Text 
                    size="sm" 
                    className={`
                      mt-3 font-semibold transition-colors duration-200
                      ${isCurrent 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `}
                  >
                    {label}
                  </Text>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Animated Progress Bar */}
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute inset-y-0 bg-white/30 rounded-full"
            initial={{ left: 0 }}
            animate={{ left: `${progress - 5}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{ width: '5%' }}
          />
        </div>
      </div>

      {/* Content Area with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentStep !== 'grade' && currentStep !== 'confirm' && (
        <motion.div 
          className="flex justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleBack}
            variant="ghost"
            size="md"
            leftIcon="chevronLeft"
            className="hover:scale-105 transition-transform"
          >
            Back
          </Button>
        </motion.div>
      )}
    </div>
  );
};