/**
 * ConversationalOnboarding.tsx
 * 
 * A conversational interface that guides new users through project setup
 * in a progressive, one-question-at-a-time approach.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  MapPin, 
  Package,
  Sparkles,
  ArrowRight,
  SkipForward,
  Check,
  Lightbulb,
  Users,
  Target
} from 'lucide-react';

interface OnboardingData {
  subject: string;
  gradeLevel: string;
  duration: string;
  location: string;
  materials: string;
  completed: boolean;
}

interface ConversationalStep {
  id: string;
  question: string;
  icon: React.ComponentType<{ className?: string }>;
  inputType: 'text' | 'select' | 'chips';
  placeholder?: string;
  options?: string[];
  validation?: (value: string) => string | null;
  followUp?: string;
}

interface QuickStartTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  data: Partial<OnboardingData>;
  tags: string[];
}

interface ConversationalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
  initialData?: Partial<OnboardingData>;
  showSkipOption?: boolean;
}

// Quick starter templates for common scenarios
const quickStartTemplates: QuickStartTemplate[] = [
  {
    id: 'science-project',
    title: 'Science Investigation',
    description: 'Design an inquiry-based science project with the scientific method',
    icon: Lightbulb,
    data: {
      subject: 'Science',
      duration: '4-6 weeks',
      location: 'Classroom & Lab'
    },
    tags: ['STEM', 'Inquiry', 'Hands-on']
  },
  {
    id: 'english-portfolio',
    title: 'Digital Portfolio',
    description: 'Create a comprehensive writing and reflection portfolio',
    icon: BookOpen,
    data: {
      subject: 'English Language Arts',
      duration: '8-10 weeks',
      location: 'Classroom & Computer Lab'
    },
    tags: ['Writing', 'Digital', 'Reflection']
  },
  {
    id: 'interdisciplinary',
    title: 'Cross-Curricular Project',
    description: 'Combine multiple subjects for rich learning experiences',
    icon: Target,
    data: {
      subject: 'Multiple Subjects',
      duration: '6-8 weeks',
      location: 'Various Spaces'
    },
    tags: ['Interdisciplinary', 'Collaboration', 'Real-world']
  },
  {
    id: 'community-project',
    title: 'Community Impact',
    description: 'Address local challenges through student-driven solutions',
    icon: Users,
    data: {
      subject: 'Social Studies',
      duration: '10-12 weeks',
      location: 'Classroom & Community'
    },
    tags: ['Service Learning', 'Civic Engagement', 'Problem Solving']
  }
];

// Conversational steps configuration
const conversationalSteps: ConversationalStep[] = [
  {
    id: 'subject',
    question: 'What subject or topic will you be teaching?',
    icon: BookOpen,
    inputType: 'chips',
    placeholder: 'Enter subject area...',
    options: [
      'Mathematics', 'Science', 'English Language Arts', 'Social Studies',
      'Art', 'Music', 'Physical Education', 'Technology', 'World Languages'
    ],
    validation: (value) => value.length < 2 ? 'Please enter a subject area' : null,
    followUp: 'Perfect! Understanding your subject helps me tailor the experience.'
  },
  {
    id: 'gradeLevel',
    question: 'What grade level are you working with?',
    icon: GraduationCap,
    inputType: 'select',
    options: [
      'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', '5th Grade',
      '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade',
      'Mixed Elementary (K-5)', 'Mixed Middle (6-8)', 'Mixed High School (9-12)', 'Adult Learners'
    ],
    validation: (value) => !value ? 'Please select a grade level' : null,
    followUp: 'Great! Knowing your students\' age helps design appropriate activities.'
  },
  {
    id: 'duration',
    question: 'How long will this learning experience last?',
    icon: Clock,
    inputType: 'select',
    options: [
      '1-2 weeks', '3-4 weeks', '5-6 weeks', '7-8 weeks',
      '9-12 weeks (Quarter)', '13-18 weeks (Semester)', 'Full Year'
    ],
    validation: (value) => !value ? 'Please select a duration' : null,
    followUp: 'Excellent! This timeframe will help structure the learning journey.'
  },
  {
    id: 'location',
    question: 'Where will the learning take place?',
    icon: MapPin,
    inputType: 'chips',
    placeholder: 'Describe your learning spaces...',
    options: [
      'Traditional Classroom', 'Computer Lab', 'Science Lab', 'Art Room',
      'Library/Media Center', 'Gymnasium', 'Outdoor Spaces', 'Home/Remote',
      'Community Locations', 'Multiple Spaces'
    ],
    validation: (value) => value.length < 2 ? 'Please describe your learning environment' : null,
    followUp: 'Perfect! The learning environment shapes how we design activities.'
  },
  {
    id: 'materials',
    question: 'What materials or resources do you have available?',
    icon: Package,
    inputType: 'text',
    placeholder: 'Describe available materials, technology, resources...',
    validation: (value) => value.length < 5 ? 'Please provide some details about available resources' : null,
    followUp: 'Wonderful! This helps ensure all activities are practical and achievable.'
  }
];

export const ConversationalOnboarding: React.FC<ConversationalOnboardingProps> = ({
  onComplete,
  onSkip,
  initialData = {},
  showSkipOption = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>(initialData);
  const [currentInput, setCurrentInput] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const inputRef = useRef<HTMLInputElement>(null);
  const step = conversationalSteps[currentStep];

  // Focus input when step changes
  useEffect(() => {
    if (inputRef.current && !showTemplates) {
      inputRef.current.focus();
    }
  }, [currentStep, showTemplates]);

  // Initialize chips for current step
  useEffect(() => {
    if (step?.inputType === 'chips') {
      const currentValue = data[step.id as keyof OnboardingData] || '';
      setSelectedChips(typeof currentValue === 'string' && currentValue ? currentValue.split(', ').filter(Boolean) : []);
    }
  }, [currentStep, step, data]);

  const handleTemplateSelect = useCallback((template: QuickStartTemplate) => {
    setData(template.data);
    setShowTemplates(false);
    setCurrentStep(0);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, []);

  const handleNext = useCallback(() => {
    if (!step) return;

    // Validate current input
    let value = currentInput;
    if (step.inputType === 'chips') {
      value = selectedChips.join(', ');
    }

    const error = step.validation?.(value);
    if (error) {
      setErrors({ [step.id]: error });
      return;
    }

    // Clear errors and save data
    setErrors({});
    setData(prev => ({ ...prev, [step.id]: value }));
    setCurrentInput('');
    setSelectedChips([]);

    // Move to next step or complete
    if (currentStep < conversationalSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      // Complete onboarding
      const completeData: OnboardingData = {
        subject: data.subject || '',
        gradeLevel: data.gradeLevel || '',
        duration: data.duration || '',
        location: data.location || '',
        materials: value,
        completed: true
      };
      onComplete(completeData);
    }
  }, [step, currentInput, selectedChips, currentStep, data, onComplete]);

  const handleChipToggle = useCallback((chip: string) => {
    setSelectedChips(prev => 
      prev.includes(chip) 
        ? prev.filter(c => c !== chip)
        : [...prev, chip]
    );
  }, []);

  const handleSkip = useCallback(() => {
    const defaultData: OnboardingData = {
      subject: 'General Education',
      gradeLevel: 'Mixed',
      duration: '4-6 weeks',
      location: 'Classroom',
      materials: 'Standard classroom materials',
      completed: true
    };
    onSkip?.();
    onComplete(defaultData);
  }, [onSkip, onComplete]);

  // Show quick start templates first
  if (showTemplates) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 sm:mb-12"
            role="banner"
          >
            <div className="inline-flex p-3 sm:p-4 bg-blue-100 rounded-full mb-4 sm:mb-6">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" aria-hidden="true" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Welcome to ALF Coach
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Let's design an amazing learning experience for your students. 
              Choose a quick start template or create something custom.
            </p>
          </motion.div>

          {/* Quick Start Templates */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
            role="group"
            aria-label="Quick start templates"
          >
            {quickStartTemplates.map((template, index) => (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
                onClick={() => handleTemplateSelect(template)}
                className="p-4 sm:p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left group"
                aria-label={`Select ${template.title} template`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors flex-shrink-0">
                    <template.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {template.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {template.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" aria-hidden="true" />
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Custom Option */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="relative flex items-center justify-center mb-4 sm:mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative bg-white px-4">
                <span className="text-sm text-gray-500">or</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowTemplates(false)}
              className="px-6 sm:px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium text-sm sm:text-base"
              aria-label="Create custom project"
            >
              Create Custom Project
            </button>

            {showSkipOption && (
              <div className="mt-3 sm:mt-4">
                <button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded transition-colors text-sm"
                  aria-label="Skip setup and use default settings"
                >
                  Skip setup and use defaults
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Main conversational interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={conversationalSteps.length}
          aria-label={`Step ${currentStep + 1} of ${conversationalSteps.length}`}
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={() => setShowTemplates(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded transition-colors text-sm"
              aria-label="Go back to templates"
            >
              ← Back to templates
            </button>
            <span className="text-xs sm:text-sm text-gray-500" aria-hidden="true">
              Step {currentStep + 1} of {conversationalSteps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" role="presentation">
            <motion.div 
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / conversationalSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              aria-hidden="true"
            />
          </div>
        </motion.div>

        {/* Current step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 sm:space-y-8"
            role="main"
          >
            {/* Question */}
            <div className="text-center">
              <div className="inline-flex p-3 sm:p-4 bg-blue-100 rounded-full mb-4 sm:mb-6">
                <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" aria-hidden="true" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                {step.question}
              </h2>
              {step.followUp && currentStep > 0 && (
                <p className="text-base sm:text-lg text-gray-600 px-4">
                  {step.followUp}
                </p>
              )}
            </div>

            {/* Input based on type */}
            <div className="space-y-4" role="form">
              {step.inputType === 'text' && (
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                  placeholder={step.placeholder}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label={step.question}
                  aria-describedby={errors[step.id] ? `error-${step.id}` : undefined}
                />
              )}

              {step.inputType === 'select' && step.options && (
                <select
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  aria-label={step.question}
                  aria-describedby={errors[step.id] ? `error-${step.id}` : undefined}
                >
                  <option value="">Select an option...</option>
                  {step.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}

              {step.inputType === 'chips' && (
                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        if (currentInput.trim()) {
                          handleChipToggle(currentInput.trim());
                          setCurrentInput('');
                        } else {
                          handleNext();
                        }
                      }
                    }}
                    placeholder={step.placeholder}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label={step.question}
                    aria-describedby={`${step.id}-help ${errors[step.id] ? `error-${step.id}` : ''}`}
                  />
                  
                  {/* Option chips */}
                  {step.options && (
                    <div className="space-y-2">
                      <p id={`${step.id}-help`} className="text-sm text-gray-600">
                        Select from options below or type your own:
                      </p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Predefined options">
                        {step.options.map(option => (
                          <button
                            key={option}
                            onClick={() => handleChipToggle(option)}
                            className={`px-3 sm:px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${
                              selectedChips.includes(option)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                            }`}
                            aria-pressed={selectedChips.includes(option)}
                            aria-label={`${selectedChips.includes(option) ? 'Remove' : 'Add'} ${option}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected chips display */}
                  {selectedChips.length > 0 && (
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-700 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2" role="list" aria-label="Selected items">
                        {selectedChips.map(chip => (
                          <span
                            key={chip}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                            role="listitem"
                          >
                            {chip}
                            <button
                              onClick={() => handleChipToggle(chip)}
                              className="hover:text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-300 rounded"
                              aria-label={`Remove ${chip}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error message */}
              {errors[step.id] && (
                <motion.p 
                  id={`error-${step.id}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm"
                  role="alert"
                  aria-live="polite"
                >
                  {errors[step.id]}
                </motion.p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4" role="navigation" aria-label="Step navigation">
              <button
                onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : setShowTemplates(true)}
                className="px-4 sm:px-6 py-3 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-xl transition-colors order-2 sm:order-1"
                aria-label={currentStep > 0 ? "Go to previous step" : "Go back to templates"}
              >
                ← Previous
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 order-1 sm:order-2">
                {showSkipOption && (
                  <button
                    onClick={handleSkip}
                    className="px-4 sm:px-6 py-3 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    aria-label="Skip setup and use default settings"
                  >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    Skip Setup
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                  aria-label={currentStep === conversationalSteps.length - 1 ? "Complete setup process" : "Continue to next step"}
                >
                  {currentStep === conversationalSteps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                      Complete Setup
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationalOnboarding;