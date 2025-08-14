/**
 * ProjectOnboardingWizard.tsx
 * 
 * STEAM-focused project setup wizard with engaging visual design
 * Captures: Subject (STEAM), Grade Level, Project Ideas, Materials/Resources
 * Features: Interactive subject cards, visual grade bands, inspiration examples
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft,
  Check,
  Plus,
  X,
  Sparkles,
  Clock,
  MapPin,
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';
import { EnhancedButton } from '../ui/EnhancedButton';
import { 
  STEAM_SUBJECTS, 
  GRADE_BANDS, 
  MATERIAL_CATEGORIES, 
  PROJECT_DURATIONS,
  LEARNING_ENVIRONMENTS,
  type SubjectInfo,
  type SubjectExample,
  type GradeBand
} from './steamData';

interface ProjectSetupData {
  subject: SubjectInfo | null;
  gradeLevel: GradeBand | null;
  duration: string;
  location: string;
  initialIdeas: string[];
  selectedExamples: SubjectExample[];
  materials: {
    digital: string[];
    physical: string[];
    research: string[];
    presentation: string[];
  };
}

interface ProjectOnboardingWizardProps {
  onComplete: (data: ProjectSetupData) => void;
  onSkip?: () => void;
}

const STEPS = [
  { id: 'subject', label: 'STEAM Subject', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'grade', label: 'Grade Level', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'ideas', label: 'Project Ideas', icon: <Star className="w-5 h-5" /> },
  { id: 'materials', label: 'Materials', icon: <Plus className="w-5 h-5" /> },
  { id: 'review', label: 'Review', icon: <Check className="w-5 h-5" /> }
];

export const ProjectOnboardingWizard: React.FC<ProjectOnboardingWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ProjectSetupData>({
    subject: null,
    gradeLevel: null,
    duration: '',
    location: '',
    initialIdeas: [],
    selectedExamples: [],
    materials: {
      digital: [],
      physical: [],
      research: [],
      presentation: []
    }
  });

  // Temporary states for input fields
  const [ideaInput, setIdeaInput] = useState('');
  const [materialInputs, setMaterialInputs] = useState({
    digital: '',
    physical: '',
    research: '',
    presentation: ''
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'subject':
        return data.subject !== null;
      case 'grade':
        return data.gradeLevel !== null;
      case 'ideas':
        return data.initialIdeas.length > 0 || data.selectedExamples.length > 0;
      case 'materials':
        return true; // Materials are optional
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const addItem = (type: 'idea' | 'digital' | 'physical' | 'research' | 'presentation', value: string) => {
    if (!value.trim()) return;
    
    setData(prev => {
      if (type === 'idea') {
        return { ...prev, initialIdeas: [...prev.initialIdeas, value] };
      } else {
        return { 
          ...prev, 
          materials: { ...prev.materials, [type]: [...prev.materials[type], value] }
        };
      }
    });
    
    // Clear the input
    if (type === 'idea') {
      setIdeaInput('');
    } else {
      setMaterialInputs(prev => ({ ...prev, [type]: '' }));
    }
  };

  const addExample = (example: SubjectExample) => {
    setData(prev => ({
      ...prev,
      selectedExamples: prev.selectedExamples.some(e => e.title === example.title)
        ? prev.selectedExamples.filter(e => e.title !== example.title)
        : [...prev.selectedExamples, example]
    }));
  };

  const removeExample = (example: SubjectExample) => {
    setData(prev => ({
      ...prev,
      selectedExamples: prev.selectedExamples.filter(e => e.title !== example.title)
    }));
  };

  const removeItem = (type: 'idea' | 'digital' | 'physical' | 'research' | 'presentation', index: number) => {
    setData(prev => {
      if (type === 'idea') {
        return { 
          ...prev, 
          initialIdeas: prev.initialIdeas.filter((_, i) => i !== index) 
        };
      } else {
        return { 
          ...prev, 
          materials: { 
            ...prev.materials, 
            [type]: prev.materials[type].filter((_, i) => i !== index) 
          }
        };
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 dark:from-gray-900 dark:to-primary-900/20 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200
                    ${index <= currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                    transition-all duration-200
                    ${index < currentStep ? 'bg-success-500 text-white' :
                      index === currentStep ? 'bg-primary-500 text-white ring-4 ring-primary-200 dark:ring-primary-800' :
                      'bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all duration-200
                    ${index < currentStep ? 'bg-success-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-elevation-2 p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Subject & Grade */}
            {STEPS[currentStep].id === 'subject' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Let's start with the basics</h2>
                  <p className="text-gray-600 dark:text-gray-400">What subject and grade level are you teaching?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject Area
                    </label>
                    <input
                      type="text"
                      value={data.subject}
                      onChange={(e) => setData({ ...data, subject: e.target.value })}
                      placeholder="e.g., Science, Math, English, History"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Grade Level
                    </label>
                    <input
                      type="text"
                      value={data.gradeLevel}
                      onChange={(e) => setData({ ...data, gradeLevel: e.target.value })}
                      placeholder="e.g., 9th grade, ages 14-15, college freshmen"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Context */}
            {STEPS[currentStep].id === 'context' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Project Context</h2>
                  <p className="text-gray-600 dark:text-gray-400">How long will this project run and where?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project Duration
                    </label>
                    <select
                      value={data.duration}
                      onChange={(e) => setData({ ...data, duration: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                    >
                      <option value="">Select duration...</option>
                      <option value="1-2 weeks">Quick Sprint (1-2 weeks)</option>
                      <option value="3-4 weeks">Standard Project (3-4 weeks)</option>
                      <option value="5-8 weeks">Deep Dive (5-8 weeks)</option>
                      <option value="semester">Semester-long (12+ weeks)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Learning Environment
                    </label>
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => setData({ ...data, location: e.target.value })}
                      placeholder="e.g., Classroom, Lab, Field, Hybrid, Remote"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Initial Ideas */}
            {STEPS[currentStep].id === 'ideas' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Initial Ideas</h2>
                  <p className="text-gray-600 dark:text-gray-400">What topics or themes are you considering?</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ideaInput}
                      onChange={(e) => setIdeaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('idea', ideaInput)}
                      placeholder="Enter an idea or theme..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200 hover:border-gray-300"
                    />
                    <EnhancedButton
                      onClick={() => addItem('idea', ideaInput)}
                      variant="filled"
                      size="md"
                      leftIcon={<Plus className="w-5 h-5" />}
                    >
                      Add
                    </EnhancedButton>
                  </div>
                  
                  <div className="space-y-2">
                    {data.initialIdeas.map((idea, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{idea}</span>
                        <button
                          onClick={() => removeItem('idea', index)}
                          className="p-1 hover:bg-primary-100 dark:hover:bg-primary-800 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Materials */}
            {STEPS[currentStep].id === 'materials' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Materials & Resources</h2>
                  <p className="text-gray-600 dark:text-gray-400">Add any materials you plan to use (optional)</p>
                </div>
                
                <div className="space-y-6">
                  {/* Readings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Readings & Books
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={readingInput}
                        onChange={(e) => setReadingInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('reading', readingInput)}
                        placeholder="Add a book or article..."
                        className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg 
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => addItem('reading', readingInput)}
                        className="px-3 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {data.materials.readings.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                          <button onClick={() => removeItem('reading', index)}>
                            <X className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tools */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tools & Equipment
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={toolInput}
                        onChange={(e) => setToolInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addItem('tool', toolInput)}
                        placeholder="Add tools or equipment..."
                        className="flex-1 px-3 py-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg 
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => addItem('tool', toolInput)}
                        className="px-3 py-2 bg-primary-500 dark:bg-primary-600 text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {data.materials.tools.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                          <button onClick={() => removeItem('tool', index)}>
                            <X className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {STEPS[currentStep].id === 'review' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Review Your Setup</h2>
                  <p className="text-gray-600 dark:text-gray-400">Everything look good? Let's start designing!</p>
                </div>
                
                <div className="space-y-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Subject</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Grade Level</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.gradeLevel}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.duration}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Location</span>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.location}</p>
                  </div>
                  {data.initialIdeas.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Initial Ideas</span>
                      <ul className="mt-1 space-y-1">
                        {data.initialIdeas.map((idea, index) => (
                          <li key={index} className="font-medium text-gray-900 dark:text-gray-100">• {idea}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(data.materials.readings.length > 0 || 
                    data.materials.tools.length > 0 || 
                    data.materials.resources.length > 0) && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Materials</span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {data.materials.readings.length} readings, {data.materials.tools.length} tools
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <div>
              {currentStep > 0 && (
                <EnhancedButton
                  onClick={handlePrevious}
                  variant="outlined"
                  size="md"
                  leftIcon={<ChevronLeft className="w-5 h-5" />}
                >
                  Previous
                </EnhancedButton>
              )}
            </div>
            
            <div className="flex gap-3">
              {onSkip && currentStep === 0 && (
                <EnhancedButton
                  onClick={onSkip}
                  variant="text"
                  size="md"
                >
                  Skip Setup
                </EnhancedButton>
              )}
              
              <EnhancedButton
                onClick={handleNext}
                disabled={!canProceed()}
                variant="filled"
                size="md"
                rightIcon={
                  currentStep === STEPS.length - 1 ? 
                  <Check className="w-5 h-5" /> : 
                  <ChevronRight className="w-5 h-5" />
                }
              >
                {currentStep === STEPS.length - 1 ? 'Start Designing' : 'Next'}
              </EnhancedButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectOnboardingWizard;