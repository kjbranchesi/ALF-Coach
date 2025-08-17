/**
 * StreamlinedWizard.tsx
 * 
 * Streamlined 3-step wizard based on PBL expert recommendations
 * Minimal friction with only vision and experience level required
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  Compass, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Clock,
  Users,
  BookText,
  Sparkles,
  AlertCircle,
  Zap,
  Star,
  GraduationCap,
  Beaker,
  Monitor,
  Wrench,
  Palette,
  Calculator,
  Globe,
  Book,
  Heart,
  Music
} from 'lucide-react';
import { 
  WizardData, 
  EntryPoint, 
  PBLExperience, 
  defaultWizardData,
  DURATION_INFO,
  GRADE_BANDS,
  validateWizardStep,
  isWizardComplete,
  generateDrivingQuestionSuggestions
} from './wizardSchema';
import { EnhancedButton } from '../../components/ui/EnhancedButton';

interface StreamlinedWizardProps {
  onComplete: (data: any) => void; // Use any for now to match old wizard
  onSkip?: () => void;
  initialData?: Partial<WizardData>;
}

// Entry point options with icons and descriptions
const ENTRY_POINTS = [
  {
    id: EntryPoint.LEARNING_GOAL,
    icon: Target,
    title: 'I have a learning goal',
    description: 'Start with specific standards or objectives',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  },
  {
    id: EntryPoint.MATERIALS_FIRST,
    icon: BookOpen,
    title: 'I have materials to use',
    description: 'Build around resources you already have',
    color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  },
  {
    id: EntryPoint.EXPLORE,
    icon: Compass,
    title: 'Let me explore',
    description: 'Browse examples and get inspired',
    color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  }
];

// PBL Experience levels
const EXPERIENCE_LEVELS = [
  {
    id: PBLExperience.NEW,
    icon: Sparkles,
    title: 'New to PBL',
    description: 'I\'m just getting started with project-based learning',
    guidance: 'Maximum support and explanations'
  },
  {
    id: PBLExperience.SOME,
    icon: Zap,
    title: 'Some Experience',
    description: 'I\'ve done a few projects but want to improve',
    guidance: 'Moderate guidance and suggestions'
  },
  {
    id: PBLExperience.EXPERIENCED,
    icon: Star,
    title: 'Experienced',
    description: 'I\'m comfortable with PBL and want advanced strategies',
    guidance: 'Minimal scaffolding, focus on optimization'
  }
];

// Subject areas for selection
const SUBJECTS = [
  { id: 'science', name: 'Science', icon: Beaker, color: 'science' },
  { id: 'technology', name: 'Technology', icon: Monitor, color: 'technology' },
  { id: 'engineering', name: 'Engineering', icon: Wrench, color: 'engineering' },
  { id: 'arts', name: 'Arts', icon: Palette, color: 'arts' },
  { id: 'mathematics', name: 'Mathematics', icon: Calculator, color: 'mathematics' },
  { id: 'social-studies', name: 'Social Studies', icon: Globe, color: 'social-studies' },
  { id: 'language-arts', name: 'Language Arts', icon: Book, color: 'language-arts' },
  { id: 'health-pe', name: 'Health & PE', icon: Heart, color: 'health' },
  { id: 'music', name: 'Music', icon: Music, color: 'music' },
  { id: 'interdisciplinary', name: 'Interdisciplinary', icon: Users, color: 'interdisciplinary' }
];

export function StreamlinedWizard({ onComplete, onSkip, initialData }: StreamlinedWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    ...defaultWizardData,
    ...initialData
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showDrivingQuestions, setShowDrivingQuestions] = useState(false);

  const updateWizardData = useCallback((updates: Partial<WizardData>) => {
    setWizardData(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        lastModified: new Date()
      }
    }));
    setErrors([]); // Clear errors on update
  }, []);

  const handleNext = useCallback(() => {
    const validationErrors = validateWizardStep(currentStep, wizardData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Track skipped fields
      if (currentStep === 2) {
        const skipped = [];
        if (!wizardData.gradeLevel) skipped.push('gradeLevel');
        if (!wizardData.duration) skipped.push('duration');
        if (!wizardData.subjects || wizardData.subjects.length === 0) skipped.push('subjects');
        updateWizardData({
          metadata: {
            ...wizardData.metadata,
            skippedFields: skipped
          }
        });
      }
    } else {
      handleComplete();
    }
  }, [currentStep, wizardData]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    // Transform to match old wizard format for compatibility
    const compatibleData = {
      subject: wizardData.primarySubject || wizardData.subjects?.[0] || '',
      subjects: wizardData.subjects || [],
      gradeLevel: wizardData.gradeLevel || '6-8',
      duration: wizardData.duration || 'medium',
      location: 'Classroom', // Default for compatibility
      initialIdeas: [],
      materials: { readings: [], tools: [] },
      // New fields
      vision: wizardData.vision,
      drivingQuestion: wizardData.drivingQuestion,
      entryPoint: wizardData.entryPoint,
      pblExperience: wizardData.pblExperience,
      specialRequirements: wizardData.specialRequirements,
      specialConsiderations: wizardData.specialConsiderations
    };
    
    updateWizardData({
      metadata: {
        ...wizardData.metadata,
        wizardCompleted: true
      }
    });
    
    onComplete(compatibleData);
  }, [wizardData, onComplete]);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      // Quick start with minimal data
      handleComplete();
    }
  }, [onSkip, handleComplete]);

  const steps = [
    { id: 1, name: 'Entry & Vision', icon: Target },
    { id: 2, name: 'Context', icon: BookText },
    { id: 3, name: 'Experience', icon: GraduationCap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: currentStep >= step.id ? 1 : 0.8,
                      opacity: currentStep >= step.id ? 1 : 0.5
                    }}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${currentStep >= step.id 
                        ? 'bg-primary-500 text-white shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    `}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span className={`ml-3 text-sm font-medium ${
                    currentStep >= step.id 
                      ? 'text-gray-900 dark:text-gray-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Entry & Vision */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Let's start your project journey
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    How would you like to begin?
                  </p>
                </div>

                {/* Entry Point Selection */}
                <div className="space-y-3">
                  {ENTRY_POINTS.map((entry) => {
                    const Icon = entry.icon;
                    return (
                      <motion.button
                        key={entry.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateWizardData({ entryPoint: entry.id })}
                        className={`
                          w-full p-4 rounded-xl border-2 transition-all duration-200
                          ${wizardData.entryPoint === entry.id
                            ? `${entry.color} border-primary-500 ring-2 ring-primary-500/20`
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            wizardData.entryPoint === entry.id 
                              ? 'bg-primary-100 dark:bg-primary-900/30' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {entry.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {entry.description}
                            </div>
                          </div>
                          {wizardData.entryPoint === entry.id && (
                            <Check className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Vision Statement */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What's your vision for this project?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={wizardData.vision}
                    onChange={(e) => updateWizardData({ vision: e.target.value })}
                    onBlur={() => {
                      if (wizardData.vision.length >= 20) {
                        setShowDrivingQuestions(true);
                      }
                    }}
                    placeholder="Describe what you hope students will learn or achieve..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                             rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             transition-all duration-200 resize-none"
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${
                      wizardData.vision.length < 20 ? 'text-gray-500' : 'text-green-600'
                    }`}>
                      {wizardData.vision.length}/20 characters minimum
                    </span>
                  </div>
                </div>

                {/* Driving Question Suggestions */}
                {showDrivingQuestions && wizardData.vision.length >= 20 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Driving Question (optional)
                    </label>
                    <input
                      type="text"
                      value={wizardData.drivingQuestion || ''}
                      onChange={(e) => updateWizardData({ drivingQuestion: e.target.value })}
                      placeholder="What essential question will guide the project?"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                               rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {generateDrivingQuestionSuggestions(wizardData.vision).map((suggestion, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateWizardData({ drivingQuestion: suggestion })}
                          className="text-xs px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 
                                   text-primary-700 dark:text-primary-300 rounded-lg
                                   hover:bg-primary-100 dark:hover:bg-primary-900/30"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {errors[0]}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Context (Optional) */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Add context (optional)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    These details help personalize your project, but you can skip them.
                  </p>
                </div>

                {/* Subject Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject Areas
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SUBJECTS.map((subject) => {
                      const Icon = subject.icon;
                      const isSelected = wizardData.subjects?.includes(subject.name) || false;
                      return (
                        <motion.button
                          key={subject.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const currentSubjects = wizardData.subjects || [];
                            if (isSelected) {
                              updateWizardData({
                                subjects: currentSubjects.filter(s => s !== subject.name),
                                primarySubject: currentSubjects.filter(s => s !== subject.name)[0]
                              });
                            } else {
                              const newSubjects = [...currentSubjects, subject.name];
                              updateWizardData({
                                subjects: newSubjects,
                                primarySubject: newSubjects[0]
                              });
                            }
                          }}
                          className={`
                            p-3 rounded-xl border-2 transition-all duration-200
                            ${isSelected
                              ? `subject-bg-${subject.color} subject-border-${subject.color} ring-2 ring-primary-500/20`
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }
                          `}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 ${
                            isSelected ? 'text-primary-600' : 'text-gray-600 dark:text-gray-400'
                          }`} />
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {subject.name}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Grade Level */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Grade Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GRADE_BANDS.map((grade) => (
                      <motion.button
                        key={grade.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateWizardData({ gradeLevel: grade.id })}
                        className={`
                          p-3 rounded-xl border-2 transition-all duration-200
                          ${wizardData.gradeLevel === grade.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {grade.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {grade.range}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Duration
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.entries(DURATION_INFO).map(([key, info]) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateWizardData({ duration: key as 'short' | 'medium' | 'long' })}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-200
                          ${wizardData.duration === key
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <Clock className="w-5 h-5 mb-2 mx-auto text-primary-600 dark:text-primary-400" />
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {info.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {info.description}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {info.details}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Special Requirements (optional)
                  </label>
                  <textarea
                    value={wizardData.specialRequirements || ''}
                    onChange={(e) => updateWizardData({ specialRequirements: e.target.value })}
                    placeholder="Any specific materials, constraints, or requirements?"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                             rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             resize-none"
                    rows={2}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Experience */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Your PBL experience
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    This helps us provide the right level of guidance.
                  </p>
                </div>

                {/* Experience Level Selection */}
                <div className="space-y-3">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const Icon = level.icon;
                    return (
                      <motion.button
                        key={level.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateWizardData({ pblExperience: level.id })}
                        className={`
                          w-full p-4 rounded-xl border-2 transition-all duration-200
                          ${wizardData.pblExperience === level.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-lg ${
                            wizardData.pblExperience === level.id 
                              ? 'bg-primary-100 dark:bg-primary-900/30' 
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {level.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {level.description}
                            </div>
                            <div className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                              {level.guidance}
                            </div>
                          </div>
                          {wizardData.pblExperience === level.id && (
                            <Check className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Special Considerations */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Any special considerations? (optional)
                  </label>
                  <textarea
                    value={wizardData.specialConsiderations || ''}
                    onChange={(e) => updateWizardData({ specialConsiderations: e.target.value })}
                    placeholder="E.g., ELL students, special needs, limited technology access..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                             rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             resize-none"
                    rows={3}
                  />
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {errors[0]}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {currentStep > 1 && (
                <EnhancedButton
                  variant="outline"
                  onClick={handleBack}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </EnhancedButton>
              )}
              {currentStep === 1 && onSkip && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Skip Setup
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {currentStep === 2 && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Skip to next
                </button>
              )}
              <EnhancedButton
                variant="filled"
                onClick={handleNext}
                rightIcon={
                  currentStep === 3 ? 
                    <Check className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                }
                disabled={currentStep === 1 && wizardData.vision.length < 20}
              >
                {currentStep === 3 ? 'Start Project' : 'Next'}
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep === 1 && "Only your vision is required - everything else is optional"}
            {currentStep === 2 && "Add as much or as little context as you'd like"}
            {currentStep === 3 && "We'll gather more details as we work together"}
          </p>
        </div>
      </div>
    </div>
  );
}