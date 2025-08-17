/**
 * StreamlinedWizard.tsx
 * 
 * Streamlined 3-step wizard implementing PBL expert recommendations:
 * Step 1: Entry Point + Vision/Driving Question (required)
 * Step 2: Grade Level, Duration, Subject (optional)
 * Step 3: PBL Experience + Special Considerations (optional)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Compass, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Users,
  Clock,
  BookText,
  Star,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { WizardData, ENTRY_POINTS, PBL_EXPERIENCE, defaultWizardData } from './wizardSchema';
import { EnhancedButton } from '../../components/ui/EnhancedButton';

interface StreamlinedWizardProps {
  onComplete: (data: WizardData) => void;
  onSkip?: () => void;
  initialData?: Partial<WizardData>;
}

const ENTRY_POINT_ICONS = {
  goal: Target,
  materials: BookOpen,
  explore: Compass
};

export function StreamlinedWizard({ onComplete, onSkip, initialData }: StreamlinedWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    ...defaultWizardData,
    ...initialData
  });

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => ({ ...prev, ...updates }));
  };

  const canProceedFromStep1 = wizardData.entryPoint && 
    wizardData.vision.length >= 20 && 
    wizardData.drivingQuestion.length >= 10;

  const canCompleteWizard = wizardData.pblExperience;

  const handleComplete = () => {
    onComplete(wizardData);
  };

  const handleSkipToChat = () => {
    // Ensure minimum required data is present
    const minimalData: WizardData = {
      ...wizardData,
      entryPoint: wizardData.entryPoint || 'explore',
      vision: wizardData.vision || 'Help students develop critical thinking and problem-solving skills',
      drivingQuestion: wizardData.drivingQuestion || 'How can we solve real-world problems?',
      pblExperience: wizardData.pblExperience || 'some'
    };
    onComplete(minimalData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                  ${currentStep >= step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                  }
                `}>
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8"
          layout
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Let's Start Your Project
                  </h2>
                  <p className="text-gray-600">
                    Choose your starting point and describe your vision
                  </p>
                </div>

                {/* Entry Point Selection */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you like to start?
                  </label>
                  <div className="grid gap-3">
                    {Object.entries(ENTRY_POINTS).map(([key, point]) => {
                      const IconComponent = ENTRY_POINT_ICONS[key as keyof typeof ENTRY_POINT_ICONS];
                      return (
                        <button
                          key={key}
                          onClick={() => updateWizardData({ entryPoint: key as any })}
                          className={`p-4 border-2 rounded-lg text-left transition-all ${
                            wizardData.entryPoint === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <IconComponent className={`w-5 h-5 mt-0.5 ${
                              wizardData.entryPoint === key ? 'text-blue-600' : 'text-gray-500'
                            }`} />
                            <div>
                              <div className="font-medium text-gray-900">{point.label}</div>
                              <div className="text-sm text-gray-600">{point.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vision Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    What's your learning vision for students? *
                  </label>
                  <textarea
                    value={wizardData.vision}
                    onChange={(e) => updateWizardData({ vision: e.target.value })}
                    placeholder="Describe what you want students to learn, experience, or achieve..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="text-xs text-gray-500">
                    {wizardData.vision.length}/20 characters minimum
                  </div>
                </div>

                {/* Driving Question Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    What driving question should guide this project? *
                  </label>
                  <input
                    type="text"
                    value={wizardData.drivingQuestion}
                    onChange={(e) => updateWizardData({ drivingQuestion: e.target.value })}
                    placeholder="How might we...? What if...? Why does...?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-gray-500">
                    A good driving question sparks curiosity and guides inquiry
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={onSkip}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Skip wizard
                  </button>
                  <EnhancedButton
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedFromStep1}
                    icon={<ChevronRight className="w-4 h-4" />}
                    iconPosition="right"
                  >
                    Continue
                  </EnhancedButton>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Project Context
                  </h2>
                  <p className="text-gray-600">
                    These details help create a better project (optional)
                  </p>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subject Area
                  </label>
                  <input
                    type="text"
                    value={wizardData.subject || ''}
                    onChange={(e) => updateWizardData({ subject: e.target.value })}
                    placeholder="Science, Math, English, History, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Grade Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Grade Level or Age Group
                  </label>
                  <input
                    type="text"
                    value={wizardData.gradeLevel || ''}
                    onChange={(e) => updateWizardData({ gradeLevel: e.target.value })}
                    placeholder="7th grade, Ages 12-14, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Project Duration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'short', label: 'Short', desc: '2-3 weeks' },
                      { key: 'medium', label: 'Medium', desc: '4-8 weeks' },
                      { key: 'long', label: 'Long', desc: 'Full semester' }
                    ].map(({ key, label, desc }) => (
                      <button
                        key={key}
                        onClick={() => updateWizardData({ duration: key as any })}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          wizardData.duration === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{label}</div>
                        <div className="text-xs text-gray-600">{desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <EnhancedButton
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Back
                  </EnhancedButton>
                  <div className="space-x-3">
                    <button
                      onClick={handleSkipToChat}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Skip to chat
                    </button>
                    <EnhancedButton
                      onClick={() => setCurrentStep(3)}
                      icon={<ChevronRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Continue
                    </EnhancedButton>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Personalization
                  </h2>
                  <p className="text-gray-600">
                    Help us tailor the experience to your needs
                  </p>
                </div>

                {/* PBL Experience */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Your PBL Experience Level *
                  </label>
                  <div className="space-y-3">
                    {Object.entries(PBL_EXPERIENCE).map(([key, experience]) => (
                      <button
                        key={key}
                        onClick={() => updateWizardData({ pblExperience: key as any })}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          wizardData.pblExperience === key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <Star className={`w-5 h-5 mt-0.5 ${
                            wizardData.pblExperience === key ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          <div>
                            <div className="font-medium text-gray-900">{experience.label}</div>
                            <div className="text-sm text-gray-600">{experience.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Considerations */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Special Considerations
                  </label>
                  <textarea
                    value={wizardData.specialConsiderations || ''}
                    onChange={(e) => updateWizardData({ specialConsiderations: e.target.value })}
                    placeholder="Any constraints, requirements, or special needs to consider?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                  <div className="text-xs text-gray-500">
                    e.g., technology limitations, time constraints, accessibility needs
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <EnhancedButton
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Back
                  </EnhancedButton>
                  <EnhancedButton
                    onClick={handleComplete}
                    disabled={!canCompleteWizard}
                    icon={<Lightbulb className="w-4 h-4" />}
                    iconPosition="right"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Start Designing Project
                  </EnhancedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Helper text */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-1">
            <HelpCircle className="w-4 h-4" />
            <span>You can always add more details in the conversation</span>
          </div>
        </div>
      </div>
    </div>
  );
}