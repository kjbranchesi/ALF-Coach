/**
 * EnhancedWizard.tsx - Educational wizard that teaches while gathering information
 * Implements progressive disclosure with contextual examples and validation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, BookOpen, Users, Clock, HelpCircle, Lightbulb, 
  ChevronRight, ChevronLeft, AlertCircle, Check, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { VisionStep } from './steps/VisionStep';
import { SubjectTimelineStep } from './steps/SubjectTimelineStep';
import { StudentsStep } from './steps/StudentsStep';
import { ReviewStep } from './steps/ReviewStep';
import { WhatHappensNext } from './steps/WhatHappensNext';
import { wizardSchema, type WizardData } from './wizardSchema';

interface EnhancedWizardProps {
  onComplete: (data: WizardData) => void;
  initialData?: Partial<WizardData>;
}

// Educational content for each step
const STEP_EDUCATION = {
  vision: {
    title: "Let's Start with Your Vision",
    subtitle: "Great projects begin with clear learning goals",
    why: "Your vision drives everything - from activities to assessments. It helps ALF create a project that truly meets your students' needs.",
    examples: [
      "I want students to understand how climate affects local ecosystems",
      "I want students to design solutions for community problems",
      "I want students to explore cultural diversity through storytelling"
    ],
    tips: [
      "Think about both knowledge AND skills",
      "Consider real-world connections",
      "Focus on what excites YOU about this topic"
    ]
  },
  subject: {
    title: "Subject & Timeline",
    subtitle: "Define your scope and constraints",
    why: "Knowing your subject and timeline helps us create realistic, achievable projects that fit your curriculum requirements.",
    tips: [
      "Combine subjects for STEAM projects",
      "Consider assessment deadlines",
      "Factor in holidays and testing schedules"
    ]
  },
  students: {
    title: "Who Are Your Learners?",
    subtitle: "Every group is unique",
    why: "Understanding your students helps us suggest age-appropriate challenges, scaffolding, and engagement strategies.",
    tips: [
      "Consider diverse learning needs",
      "Think about prior knowledge",
      "Include any special considerations"
    ]
  }
};

export const EnhancedWizard: React.FC<EnhancedWizardProps> = ({ 
  onComplete, 
  initialData = {} 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<WizardData>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showEducation, setShowEducation] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const steps = [
    { id: 'vision', label: 'Vision', icon: Target },
    { id: 'subject', label: 'Subject & Time', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'review', label: 'Review', icon: Check }
  ];

  const currentStepId = steps[currentStep].id;
  const education = STEP_EDUCATION[currentStepId as keyof typeof STEP_EDUCATION];

  // Validate current step data
  const validateStep = (stepId: string): boolean => {
    setIsValidating(true);
    const newErrors: Record<string, string> = {};
    
    switch (stepId) {
      case 'vision':
        if (!wizardData.vision || wizardData.vision.trim().length < 20) {
          newErrors.vision = "Please describe your vision in at least 20 characters";
        }
        break;
      
      case 'subject':
        if (!wizardData.subject || wizardData.subject.trim().length === 0) {
          newErrors.subject = "Subject area is required to continue";
        }
        if (!wizardData.timeline) {
          newErrors.timeline = "Please select a project duration";
        }
        break;
      
      case 'students':
        if (!wizardData.gradeLevel && !wizardData.customStudents) {
          newErrors.students = "Please select a grade level or describe your students";
        }
        break;
    }
    
    setErrors(newErrors);
    setIsValidating(false);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Final step - complete wizard
      onComplete(wizardData as WizardData);
      return;
    }

    // Validate before proceeding
    if (validateStep(currentStepId)) {
      setCurrentStep(prev => prev + 1);
      setShowEducation(true); // Show education for new step
      setErrors({});
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const updateWizardData = (field: string, value: any) => {
    setWizardData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full transition-all
                    ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' : ''}
                  `}>
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-1 mx-2 transition-all
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between text-sm">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`
                  flex-1 text-center
                  ${index === currentStep ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}
                  ${index < currentStep ? 'text-green-600 dark:text-green-400' : ''}
                  ${index > currentStep ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </div>
            ))}
          </div>
        </div>

        {/* Educational Context (Collapsible) */}
        {education && showEducation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {education.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {education.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEducation(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="ml-9 space-y-4">
              {/* Why This Matters */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Why this matters:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {education.why}
                    </p>
                  </div>
                </div>
              </div>

              {/* Examples */}
              {education.examples && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Examples to inspire you:
                  </p>
                  <div className="grid gap-2">
                    {education.examples.map((example, idx) => (
                      <div 
                        key={idx}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 italic"
                      >
                        "{example}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {education.tips && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pro tips:
                  </p>
                  <ul className="space-y-1">
                    {education.tips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Sparkles className="w-3 h-3 text-yellow-500 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <VisionStep
                data={wizardData}
                errors={errors}
                onChange={updateWizardData}
                onNext={handleNext}
              />
            )}
            
            {currentStep === 1 && (
              <SubjectTimelineStep
                data={wizardData}
                errors={errors}
                onChange={updateWizardData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 2 && (
              <StudentsStep
                data={wizardData}
                errors={errors}
                onChange={updateWizardData}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 3 && (
              <ReviewStep
                data={wizardData}
                onNext={handleNext}
                onBack={handleBack}
                onEdit={(step) => setCurrentStep(step)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* What Happens Next (shown after review) */}
        {currentStep === steps.length && (
          <WhatHappensNext
            projectType={wizardData.timeline}
            gradeLevel={wizardData.gradeLevel}
            onStart={() => onComplete(wizardData as WizardData)}
          />
        )}
      </div>
    </div>
  );
};