/**
 * StreamlinedWizard.tsx
 * 
 * Streamlined 3-step wizard based on PBL expert recommendations
 * SOLE SOURCE OF TRUTH for wizard onboarding (v2 schema). All runtime wizard
 * flows should route through this component and `wizardSchema.ts`.
 * Minimal friction with only vision and experience level required
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Clock,
  Users,
  BookText,
  AlertCircle,
  Beaker,
  Monitor,
  Wrench,
  Palette,
  Calculator,
  Globe,
  Book,
  Heart,
  Music,
  FileText,
  Sparkles
} from 'lucide-react';
import { ALFProcessCards } from './components/ALFProcessCards';
import { ALFProcessRibbon } from '../../components/layout/ALFProcessRibbon';
import { featureFlags } from '../../utils/featureFlags';
import { EnhancedSubjectSelector } from './components/EnhancedSubjectSelector';
import { 
  WizardData, 
  EntryPoint,
  defaultWizardData,
  DURATION_INFO,
  GRADE_BANDS
} from './wizardSchema';
import { EnhancedButton } from '../../components/ui/EnhancedButton';

interface StreamlinedWizardProps {
  onComplete: (data: any) => void; // Use any for now to match old wizard
  onSkip?: () => void;
  initialData?: Partial<WizardData>;
}


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
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    ...defaultWizardData,
    ...initialData
  });
  const [errors, setErrors] = useState<string[]>([]);
  
  // Debug logging
  console.log('[StreamlinedWizard] Rendering with:', {
    currentStep,
    wizardData,
    initialData
  });


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

  // Simple validation
  const validateStep = (step: number): string[] => {
    const validationErrors: string[] = [];
    
    if (step === 0) {
      // Validate project topic
      if (!wizardData.projectTopic || wizardData.projectTopic.trim().length < 10) {
        validationErrors.push('Please provide a project topic (at least 10 characters)');
      }
      // Validate learning goals - THIS WAS MISSING
      if (!wizardData.learningGoals || wizardData.learningGoals.trim().length < 10) {
        validationErrors.push('Please provide learning goals (at least 10 characters)');
      }
      // If materials checkbox is checked, validate materials field
      if (wizardData.entryPoint === EntryPoint.MATERIALS_FIRST && 
          (!wizardData.materials || wizardData.materials.trim().length < 10)) {
        validationErrors.push('Please describe your materials (at least 10 characters)');
      }
    } else if (step === 1) {
      if (!wizardData.subjects || wizardData.subjects.length === 0) {
        validationErrors.push('Please select at least one subject area');
      }
      if (!wizardData.gradeLevel) {
        validationErrors.push('Please select a grade level');
      }
      if (!wizardData.duration) {
        validationErrors.push('Please select a project duration');
      }
      // Validate PBL experience - THIS WAS MISSING
      if (!wizardData.pblExperience) {
        validationErrors.push('Please select your experience level with Project-Based Learning');
      }
    }
    
    return validationErrors;
  };

  const handleNext = useCallback(() => {
    const validationErrors = validateStep(currentStep);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
      setErrors([]); // Clear errors when moving to next step
    } else {
      handleComplete();
    }
  }, [currentStep, wizardData]);

  const handleBack = useCallback(() => {
    // Allow going back between wizard steps
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  }, [currentStep]);

  

  const handleComplete = useCallback(() => {
    console.log('[StreamlinedWizard] handleComplete called - Start Project button clicked');
    
    // Ensure wizardData exists and has safe property access
    const safeWizardData = wizardData || {};
    const safeSubjects = Array.isArray(safeWizardData.subjects) ? safeWizardData.subjects : [];
    const safeMaterials = safeWizardData.materials && typeof safeWizardData.materials === 'string' ? safeWizardData.materials : '';
    
    // Transform to match old wizard format for compatibility
    const compatibleData = {
      subject: safeWizardData.primarySubject || safeSubjects[0] || '',
      subjects: safeSubjects,
      gradeLevel: safeWizardData.gradeLevel || 'middle',
      duration: safeWizardData.duration || 'medium',
      location: 'Classroom', // Default for compatibility
      initialIdeas: [],
      materials: safeMaterials ? { 
        readings: [], 
        tools: [], 
        userProvided: safeMaterials 
      } : { readings: [], tools: [] },
      // New PBL-aligned fields
      projectTopic: safeWizardData.projectTopic || '',
      learningGoals: safeWizardData.learningGoals || '',
      entryPoint: safeWizardData.entryPoint || 'learning_goal',
      pblExperience: safeWizardData.pblExperience || 'some',
      specialRequirements: safeWizardData.specialRequirements || '',
      specialConsiderations: safeWizardData.specialConsiderations || ''
    };
    
    console.log('[StreamlinedWizard] Calling onComplete with data:', compatibleData);
    
    // Update wizard metadata safely
    const safeMetadata = safeWizardData.metadata || {};
    updateWizardData({
      metadata: {
        ...safeMetadata,
        wizardCompleted: true
      }
    });
    
    onComplete(compatibleData);
    console.log('[StreamlinedWizard] onComplete called successfully');
  }, [wizardData, onComplete]);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      // Quick start with minimal data
      handleComplete();
    }
  }, [onSkip, wizardData, onComplete]);

  const steps = [
    { id: 0, name: 'Project Focus', icon: Target },
    { id: 1, name: 'Context', icon: BookText }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      {featureFlags.isEnabled('processRibbon') && (
        <ALFProcessRibbon storageKey="alf_ribbon_dismissed_wizard" />
      )}
      <div className="max-w-4xl mx-auto">
        {/* ALF Process Cards */}
        <div className="mb-8">
          <ALFProcessCards />
        </div>
        
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
            {/* Step 1: Project Focus */}
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    What will students work on?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Focus on the topic or area you want to teach.
                  </p>
                </div>

                {/* Project Topic */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What topic or area do you want students to explore?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={wizardData.projectTopic || ''}
                    onChange={(e) => updateWizardData({ projectTopic: e.target.value })}
                    placeholder="E.g., Climate change, Local history, Sustainable design, Community problems..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                             rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             transition-all duration-200 resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Describe the topic or real-world area you want students to focus on
                  </p>
                </div>

                {/* Learning Goals */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    What do you want students to learn?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={wizardData.learningGoals || ''}
                    onChange={(e) => updateWizardData({ learningGoals: e.target.value })}
                    placeholder="E.g., Understand ecosystems, develop critical thinking, learn collaboration..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                             rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             transition-all duration-200 resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    List the key skills or concepts students should master
                  </p>
                </div>

                {/* Materials Checkbox */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wizardData.entryPoint === EntryPoint.MATERIALS_FIRST}
                      onChange={(e) => updateWizardData({ 
                        entryPoint: e.target.checked ? EntryPoint.MATERIALS_FIRST : EntryPoint.LEARNING_GOAL 
                      })}
                      className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded 
                               focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 
                               focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      I have materials to use
                    </span>
                  </label>
                  
                  {/* Materials Input - Show only when checkbox is selected */}
                  {wizardData.entryPoint === EntryPoint.MATERIALS_FIRST && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 ml-8"
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FileText className="inline w-4 h-4 mr-1" />
                        What materials or resources do you have?
                      </label>
                      <textarea
                        value={wizardData.materials || ''}
                        onChange={(e) => updateWizardData({ materials: e.target.value })}
                        placeholder="Describe your existing materials, curriculum, tools, or resources..."
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                                 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-all duration-200 resize-none"
                        rows={3}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 dark:text-red-400">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Context */}
            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Project context
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Help us understand your teaching situation.
                  </p>
                </div>

                {/* Simple Subject Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subject Areas
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <EnhancedSubjectSelector
                    selectedSubjects={wizardData.subjects || []}
                    onSubjectsChange={(subjects) => {
                      updateWizardData({
                        subjects: subjects,
                        primarySubject: subjects[0] || ''
                      });
                    }}
                    gradeLevel={wizardData.gradeLevel}
                    maxSelections={5}
                  />
                  {wizardData.subjects && wizardData.subjects.length > 1 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Interdisciplinary project ready - great for deeper learning!
                    </p>
                  )}
                </div>

                {/* REPLACED WITH ProgressiveSubjectSelector */}
                {/*
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SUBJECTS.map((subject) => {
                      const Icon = subject.icon;
                      const isSelected = wizardData.subjects?.includes(subject.id) || false;
                      return (
                        <motion.button
                          key={subject.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const currentSubjects = wizardData.subjects || [];
                            const newSubjects = isSelected 
                              ? currentSubjects.filter(s => s !== subject.id)
                              : [...currentSubjects, subject.id];
                            updateWizardData({
                              subjects: newSubjects,
                              primarySubject: newSubjects[0] || ''
                            });
                          }}
                          className={`
                            p-3 rounded-xl border-2 transition-all duration-200 text-left
                            ${isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-5 h-5 ${
                              isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                            <span className={`text-sm font-medium ${
                              isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {subject.name}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-primary-500 ml-auto" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select all subjects that apply to your project
                  </p>
                </div>
                */}

                {/* Student Age Group - International */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student Age Group
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {GRADE_BANDS.map((grade) => (
                      <motion.button
                        key={grade.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateWizardData({ gradeLevel: grade.id })}
                        className={`
                          p-4 rounded-xl border-2 transition-all duration-200 text-left
                          ${wizardData.gradeLevel === grade.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {grade.name}
                            </div>
                            <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-1">
                              {grade.range}
                            </div>
                            {grade.examples && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {grade.examples}
                              </div>
                            )}
                          </div>
                          {wizardData.gradeLevel === grade.id && (
                            <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Choose the age range that best matches your students
                  </p>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Project Duration
                    <span className="text-red-500 ml-1">*</span>
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

                {/* PBL Experience */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Experience with Project-Based Learning
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateWizardData({ pblExperience: 'new' })}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200
                        ${wizardData.pblExperience === 'new'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      {/* Replaced Sparkles with BookOpen to avoid runtime ref error */}
                      <BookOpen className="w-5 h-5 mb-2 mx-auto text-primary-600 dark:text-primary-400" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        New to PBL
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        First time trying
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateWizardData({ pblExperience: 'some' })}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200
                        ${wizardData.pblExperience === 'some'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <BookOpen className="w-5 h-5 mb-2 mx-auto text-primary-600 dark:text-primary-400" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Some Experience
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Done a few projects
                      </div>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updateWizardData({ pblExperience: 'experienced' })}
                      className={`
                        p-4 rounded-xl border-2 transition-all duration-200
                        ${wizardData.pblExperience === 'experienced'
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                      `}
                    >
                      <Users className="w-5 h-5 mb-2 mx-auto text-primary-600 dark:text-primary-400" />
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Experienced
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Regular PBL teacher
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        {errors.map((error, index) => (
                          <p key={index} className="text-sm text-red-600 dark:text-red-400">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              {currentStep > 0 && (
                <EnhancedButton
                  variant="outline"
                  onClick={handleBack}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Back
                </EnhancedButton>
              )}
              {currentStep === 0 && onSkip && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Skip Setup
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Removed skip button for required fields */}
              <EnhancedButton
                variant="filled"
                onClick={handleNext}
                rightIcon={
                  currentStep === 1 ? 
                    <Check className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                }
              >
                {currentStep === 1 ? 'Start Project' : 'Next'}
              </EnhancedButton>
            </div>
          </div>
        </motion.div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep === 0 && "Focus on what you want students to learn"}
            {currentStep === 1 && "Help us understand your teaching context"}
          </p>
        </div>
      </div>
    </div>
  );
}
