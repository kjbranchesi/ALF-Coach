// src/components/OnboardingWizard.jsx - Unified onboarding flow

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useBlueprint } from '../context/BlueprintContext';
import clsx from 'clsx';
import { Check, ChevronRight, ChevronLeft, Lightbulb, BookOpen, Users, Target, Sparkles } from '../components/icons';
import { LottieAnimation, LottieSuccess, LottieCelebration } from './animations/LottieAnimation';
import educationAnimation from '../animations/lottie/education-icons.json';

// Schema
const wizardSchema = z.object({
    educatorPerspective: z.string().min(1, { message: "Please share your vision or initial ideas for this project" }),
    subject: z.string().min(1, { message: "Subject or theme is required" }),
    initialMaterials: z.string().optional(),
    ageGroup: z.string().min(1, { message: "Please describe who will do this project" }),
    location: z.string().optional(),
    projectScope: z.string(),
    // Add ideation fields with default empty strings for backward compatibility
    ideation: z.object({
        bigIdea: z.string().default(""),
        essentialQuestion: z.string().default(""),
        challenge: z.string().default("")
    }).default({
        bigIdea: "",
        essentialQuestion: "",
        challenge: ""
    })
});

// Icon mapping for easier usage
const Icons = {
  Check,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Book: BookOpen,
  Users,
  Target,
  Sparkles
};

// Step Progress
const StepProgress = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <motion.div className="flex flex-col items-center">
            <motion.div 
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 text-sm",
                {
                  'bg-green-500 text-white': currentStep > index,
                  'bg-blue-600 text-white ring-4 ring-blue-100': currentStep === index,
                  'bg-gray-200 text-gray-500': currentStep < index
                }
              )}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep > index ? <Check className="w-4 h-4 icon-check-animate" /> : index + 1}
            </motion.div>
            <p className={clsx(
              "mt-2 text-xs font-medium transition-colors duration-300",
              currentStep >= index ? 'text-gray-700' : 'text-gray-400'
            )}>
              {step}
            </p>
          </motion.div>
          {index < steps.length - 1 && (
            <div className={clsx(
              "flex-1 h-0.5 mx-2 transition-all duration-500",
              currentStep > index ? 'bg-green-500' : 'bg-gray-300'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ALF Overview Panel
const ALFOverviewPanel = ({ isOpen, onClose, onContinue, formData }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Success Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-32 h-32 mx-auto mb-4">
                <LottieSuccess size={128} onComplete={() => console.log('Success animation complete')} />
              </div>
              <LottieCelebration duration={3000} />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Blueprint Ready!</h2>
              <p className="text-gray-600">
                Here's how we'll turn <strong className="text-blue-600">{formData.subject}</strong> for{' '}
                <strong className="text-blue-600">{formData.ageGroup}</strong> into authentic learning:
              </p>
            </motion.div>

            {/* ALF Steps */}
            <div className="space-y-4 mb-8">
              <motion.div 
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Ideation</h3>
                    <p className="text-gray-600 text-sm">
                      Craft a Big Idea, Essential Question, and Challenge that ignite curiosity
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Learning Journey</h3>
                    <p className="text-gray-600 text-sm">
                      Map phases & student activities from exploration to mastery
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Authentic Deliverables</h3>
                    <p className="text-gray-600 text-sm">
                      Design real-world milestones & meaningful assessment
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div 
              className="flex items-center justify-between pt-6 border-t"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Need a refresher on ALF?
              </button>
              <button
                onClick={onContinue}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                Begin Ideation
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main Component
export default function OnboardingWizard({ onCancel }) {
  const { createNewBlueprint } = useAppContext();
  const { initializeWithProjectInfo } = useBlueprint();
  const [currentStep, setCurrentStep] = useState(0);
  const [showALFOverview, setShowALFOverview] = useState(false);
  
  const steps = ['Perspective', 'Topic', 'Audience', 'Scope'];
  
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      educatorPerspective: '',
      subject: '',
      initialMaterials: '',
      ageGroup: '',
      location: '',
      projectScope: 'Multi-week Unit',
      ideation: {
        bigIdea: '',
        essentialQuestion: '',
        challenge: ''
      }
    },
  });

  const formData = watch();

  const handleNext = async () => {
    const stepFields = [
      ['educatorPerspective'],
      ['subject'],
      ['ageGroup'],
      ['projectScope']
    ];
    
    const isValid = await trigger(stepFields[currentStep]);
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (currentStep === steps.length - 1) {
        // Only show ALF overview after the last step (Scope)
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data) => {
    setShowALFOverview(true);
  };

  const handleBeginIdeation = () => {
    // Initialize Blueprint context with project info
    initializeWithProjectInfo(formData);
    // Create new blueprint in Firebase
    createNewBlueprint(formData);
  };

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-3 overflow-hidden">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="flex justify-center mb-2">
              <LottieAnimation 
                animationData={educationAnimation} 
                style={{ width: 80, height: 80 }}
                className="opacity-80"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Capture your vision in 3 quick steps
            </h1>
            <p className="text-gray-600 text-sm">
              Let's start building your project blueprint
            </p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <StepProgress currentStep={currentStep} steps={steps} />
          </div>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center"
            >
              {/* Step 1: Perspective */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-1">
                      What's your initial vision for this project?
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Share your ideas, goals, or inspiration for this learning experience
                    </p>
                    <textarea
                      {...register('educatorPerspective')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                      placeholder="Example: I want students to redesign local spaces using sustainable practices..."
                      autoFocus
                    />
                    {errors.educatorPerspective && (
                      <p className="mt-2 text-sm text-red-600">{errors.educatorPerspective.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Topic */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      What subject or theme?
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      This will be the core of your blueprint
                    </p>
                    <input
                      {...register('subject')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Modern History or Environmental Science"
                      autoFocus
                    />
                    {errors.subject && (
                      <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Materials you already have
                      <span className="text-sm font-normal text-gray-500 ml-2">(optional)</span>
                    </label>
                    <textarea
                      {...register('initialMaterials')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
                      placeholder="Paste links, book titles, or resources..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Audience */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Who will do this project?
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Grade, age range, or course name
                    </p>
                    <input
                      {...register('ageGroup')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 11th graders, 17-year-olds, AP Biology"
                      autoFocus
                    />
                    {errors.ageGroup && (
                      <p className="mt-2 text-sm text-red-600">{errors.ageGroup.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Teaching location
                      <span className="text-sm font-normal text-gray-500 ml-2">(optional)</span>
                    </label>
                    <p className="text-sm text-gray-600 mb-4">
                      Helps suggest local examples
                    </p>
                    <input
                      {...register('location')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Chicago, rural Vermont..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Scope */}
              {currentStep === 3 && (
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Scale of the project
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the scope that fits your timeline
                  </p>
                  <select
                    {...register('projectScope')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    autoFocus
                  >
                    <option value="Single Lesson">Single Lesson</option>
                    <option value="Multi-week Unit">Multi-week Unit</option>
                    <option value="Full Course/Studio">Full Course/Studio</option>
                  </select>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors",
                  currentStep === 0 && "invisible"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              
              {currentStep < steps.length - 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
              
              {currentStep === steps.length - 1 && (
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Create Blueprint
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </motion.div>

      {/* ALF Overview Panel */}
      <ALFOverviewPanel
        isOpen={showALFOverview}
        onClose={() => setShowALFOverview(false)}
        onContinue={handleBeginIdeation}
        formData={formData}
      />
    </div>
  );
}