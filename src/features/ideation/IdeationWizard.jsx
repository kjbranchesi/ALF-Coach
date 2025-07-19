// src/features/ideation/IdeationWizard.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

// --- Zod Schema for Ideation ---
const ideationSchema = z.object({
  bigIdea: z.string().min(1, { message: "Big Idea is required." }),
  essentialQuestion: z.string().min(1, { message: "Essential Question is required." }),
  challenge: z.string().min(1, { message: "Challenge statement is required." })
});

// --- Icon Components ---
const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-700">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/>
    <path d="M10 22h4"/>
  </svg>
);

const QuestionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-700">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <path d="M12 17h.01"/>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-700">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

// --- Step Info Card Component ---
const StepInfoCard = ({ icon, title, subtitle, children }) => (
  <div className="bg-slate-50 border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">{icon}</div>
      <div className="w-full">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{subtitle}</p>
        {children}
      </div>
    </div>
  </div>
);

// --- Step Indicator Component ---
const StepIndicator = ({ currentStep }) => {
  const steps = ["Big Idea", "Essential Question", "Challenge"];
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center text-center">
            <div className={clsx(`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300`, {
              'bg-green-500 border-green-500 text-white': currentStep > index + 1,
              'bg-white border-purple-600 text-purple-600 ring-4 ring-purple-100': currentStep === index + 1,
              'bg-slate-100 border-slate-300 text-slate-400': currentStep < index + 1
            })}>
              {currentStep > index + 1 ? <CheckCircleIcon /> : index + 1}
            </div>
            <p className={clsx(`mt-2 text-sm font-semibold w-24 transition-all duration-300`, {
              'text-slate-700': currentStep >= index + 1,
              'text-slate-500': currentStep < index + 1,
              'text-purple-700': currentStep === index + 1
            })}>{step}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={clsx(`flex-auto h-1 mx-4 transition-all duration-500`, {
              'bg-green-500': currentStep > index + 1,
              'bg-slate-300': currentStep <= index + 1
            })}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// --- Form Error Component ---
const FormError = ({ message }) => message ? (
  <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
    <AlertCircleIcon />
    <span>{message}</span>
  </div>
) : null;

// --- Help Examples Component ---
const HelpExamples = ({ type, onSelectExample }) => {
  const examples = {
    bigIdea: [
      "Sustainable Cities",
      "Renewable Energy",
      "Human Migration"
    ],
    essentialQuestion: [
      "How might we reduce waste on campus?",
      "How can we design more inclusive public spaces?",
      "How might technology help solve climate change?"
    ],
    challenge: [
      "Design a zero-waste lunch system for our school",
      "Create a community garden that brings neighbors together",
      "Build a prototype renewable energy system for your home"
    ]
  };

  if (!examples[type]) return null;

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">Need inspiration? Try one of these:</h4>
      <div className="space-y-2">
        {examples[type].map((example, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelectExample(example)}
            className="block w-full text-left p-2 text-sm text-blue-700 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Toast Component ---
const Toast = ({ message, type = 'success', show, onClose }) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={clsx('fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2', {
        'bg-green-500 text-white': type === 'success',
        'bg-red-500 text-white': type === 'error'
      })}
    >
      <CheckCircleIcon />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
    </motion.div>
  );
};

// --- Main IdeationWizard Component ---
export default function IdeationWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [showHelp, setShowHelp] = useState({});
  const [showToast, setShowToast] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(ideationSchema),
    defaultValues: {
      bigIdea: '',
      essentialQuestion: '',
      challenge: ''
    }
  });

  const watchedValues = watch();

  const handleNextStep = async () => {
    const fieldsToValidate = step === 1 ? ['bigIdea'] : step === 2 ? ['essentialQuestion'] : [];
    const isValid = await trigger(fieldsToValidate);
    if (isValid && step < 3) setStep(s => s + 1);
  };

  const handleSelectExample = (fieldName, example) => {
    setValue(fieldName, example);
    setShowHelp(prev => ({ ...prev, [fieldName]: false }));
  };

  const toggleHelp = (fieldName) => {
    setShowHelp(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const onSubmit = (data) => {
    // Show toast
    setShowToast(true);
    
    // Auto-hide toast and complete after 2 seconds
    setTimeout(() => {
      setShowToast(false);
      onComplete(data);
    }, 2000);
  };

  const formatEssentialQuestion = (value) => {
    if (!value) return 'How might we...?';
    if (!value.toLowerCase().startsWith('how might we')) {
      return `How might we ${value.toLowerCase()}?`;
    }
    return value.endsWith('?') ? value : `${value}?`;
  };

  const motionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-100 overflow-y-auto">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Card as="form" onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Define Your Project Catalyst</h2>
                <p className="text-slate-600 max-w-lg mx-auto">
                  Let's clarify the three pillars that will drive your project forward.
                </p>
              </div>
              
              <StepIndicator currentStep={step} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  variants={motionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {step === 1 && (
                    <StepInfoCard 
                      icon={<LightbulbIcon />} 
                      title="🧠 What's your Big Idea?" 
                      subtitle="Define the broad theme or concept that anchors your project."
                    >
                      <Input
                        {...register('bigIdea')}
                        type="text"
                        id="big-idea"
                        variant={errors.bigIdea ? 'error' : 'default'}
                        placeholder="e.g., Sustainable Cities"
                        autoFocus
                        value={watchedValues.bigIdea || ''}
                      />
                      <FormError message={errors.bigIdea?.message} />
                      
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHelp('bigIdea')}
                        >
                          {showHelp.bigIdea ? 'Hide examples' : 'Need help? Show examples'}
                        </Button>
                      </div>
                      
                      {showHelp.bigIdea && (
                        <HelpExamples 
                          type="bigIdea" 
                          onSelectExample={(example) => handleSelectExample('bigIdea', example)} 
                        />
                      )}
                    </StepInfoCard>
                  )}

                  {step === 2 && (
                    <StepInfoCard 
                      icon={<QuestionIcon />} 
                      title="❓ What's your Essential Question?" 
                      subtitle="Craft the driving inquiry that will guide student exploration."
                    >
                      <Textarea
                        {...register('essentialQuestion')}
                        id="essential-question"
                        variant={errors.essentialQuestion ? 'error' : 'default'}
                        className="h-24"
                        placeholder="How might we...?"
                        autoFocus
                        value={watchedValues.essentialQuestion || ''}
                        onBlur={(e) => {
                          const formatted = formatEssentialQuestion(e.target.value);
                          setValue('essentialQuestion', formatted);
                        }}
                      />
                      <FormError message={errors.essentialQuestion?.message} />
                      
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHelp('essentialQuestion')}
                        >
                          {showHelp.essentialQuestion ? 'Hide examples' : 'Need help? Show examples'}
                        </Button>
                      </div>
                      
                      {showHelp.essentialQuestion && (
                        <HelpExamples 
                          type="essentialQuestion" 
                          onSelectExample={(example) => handleSelectExample('essentialQuestion', example)} 
                        />
                      )}
                    </StepInfoCard>
                  )}

                  {step === 3 && (
                    <StepInfoCard 
                      icon={<TargetIcon />} 
                      title="🎯 What's the Challenge?" 
                      subtitle="Create a student-friendly action statement that defines what they'll accomplish."
                    >
                      <Textarea
                        {...register('challenge')}
                        id="challenge"
                        variant={errors.challenge ? 'error' : 'default'}
                        className="h-32"
                        placeholder="Try phrasing as an action statement..."
                        autoFocus
                        value={watchedValues.challenge || ''}
                      />
                      <FormError message={errors.challenge?.message} />
                      
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHelp('challenge')}
                        >
                          {showHelp.challenge ? 'Hide examples' : 'Need help? Show examples'}
                        </Button>
                      </div>
                      
                      {showHelp.challenge && (
                        <HelpExamples 
                          type="challenge" 
                          onSelectExample={(example) => handleSelectExample('challenge', example)} 
                        />
                      )}
                    </StepInfoCard>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 pt-6 border-t flex justify-between items-center">
                <div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className={step === 1 ? 'invisible' : ''} 
                    onClick={() => setStep(s => s - 1)}
                  >
                    ← Back
                  </Button>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="cancel" size="sm" onClick={onCancel}>
                    Cancel
                  </Button>
                  {step < 3 && (
                    <Button type="button" variant="primary" size="sm" onClick={handleNextStep}>
                      Next →
                    </Button>
                  )}
                  {step === 3 && (
                    <Button type="submit" variant="secondary" size="sm">
                      <CheckCircleIcon />
                      <span className="ml-2">Complete Ideation</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Toast
        message="Ideation complete – moving to Learning Journey"
        type="success"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}