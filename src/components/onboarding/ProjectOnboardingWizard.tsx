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
  TrendingUp,
  Beaker,
  Monitor,
  Wrench,
  Palette,
  Calculator,
  Globe,
  Book,
  Users,
  Heart,
  Music
} from 'lucide-react';
import { EnhancedButton } from '../ui/EnhancedButton';

interface ProjectSetupData {
  subject: string; // Primary subject for backward compatibility
  subjects?: string[]; // Multi-subject support
  gradeLevel: string;
  duration: string;
  location: string;
  initialIdeas: string[];
  materials: {
    readings: string[];
    tools: string[];
  };
}

interface ProjectOnboardingWizardProps {
  onComplete: (data: ProjectSetupData) => void;
  onSkip?: () => void;
}

const SUBJECTS = [
  {
    id: 'science',
    name: 'Science',
    icon: <Beaker className="w-6 h-6" />,
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    examples: [
      'Climate Change & Sustainability',
      'Space Exploration',
      'Genetics & DNA',
      'Renewable Energy',
      'Ocean Conservation'
    ]
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: <Monitor className="w-6 h-6" />,
    color: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    examples: [
      'AI & Machine Learning',
      'App Development',
      'Robotics',
      'Cybersecurity',
      'Game Design'
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    icon: <Wrench className="w-6 h-6" />,
    color: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    examples: [
      'Bridge Design',
      'Solar Car Challenge',
      'Water Filtration',
      'Earthquake-Resistant Buildings',
      'Drone Technology'
    ]
  },
  {
    id: 'arts',
    name: 'Arts',
    icon: <Palette className="w-6 h-6" />,
    color: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    examples: [
      'Digital Storytelling',
      'Music Production',
      'Film Making',
      'Graphic Design',
      'Interactive Art'
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: <Calculator className="w-6 h-6" />,
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    examples: [
      'Data Analysis & Statistics',
      'Cryptography',
      'Game Theory',
      'Financial Modeling',
      'Geometric Art'
    ]
  },
  {
    id: 'social-studies',
    name: 'Social Studies',
    icon: <Globe className="w-6 h-6" />,
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    examples: [
      'Cultural Heritage',
      'Global Issues',
      'Historical Research',
      'Community Mapping',
      'Social Justice'
    ]
  },
  {
    id: 'language-arts',
    name: 'Language Arts',
    icon: <Book className="w-6 h-6" />,
    color: 'from-indigo-400 to-purple-500',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    examples: [
      'Creative Writing',
      'Podcast Production',
      'Digital Journalism',
      'Poetry Slam',
      'Debate & Rhetoric'
    ]
  },
  {
    id: 'health-pe',
    name: 'Health & PE',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-400 to-pink-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    examples: [
      'Nutrition Science',
      'Mental Health Awareness',
      'Sports Analytics',
      'Fitness Technology',
      'Public Health Campaign'
    ]
  },
  {
    id: 'music',
    name: 'Music',
    icon: <Music className="w-6 h-6" />,
    color: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800',
    examples: [
      'Music Production',
      'Sound Engineering',
      'Cultural Music Study',
      'Instrument Design',
      'Music Therapy'
    ]
  },
  {
    id: 'interdisciplinary',
    name: 'Interdisciplinary',
    icon: <Users className="w-6 h-6" />,
    color: 'from-teal-400 to-green-500',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    examples: [
      'Environmental Justice',
      'Smart Cities',
      'Food Systems',
      'Media Literacy',
      'Innovation Lab'
    ]
  }
];

const GRADE_BANDS = [
  { id: 'elementary', name: 'Elementary', range: 'K-5' },
  { id: 'middle', name: 'Middle School', range: '6-8' },
  { id: 'high', name: 'High School', range: '9-12' },
  { id: 'college', name: 'College+', range: 'Higher Ed' }
];

const DURATIONS = [
  { id: 'sprint', name: 'Quick Sprint', time: '1-2 weeks', icon: <Zap className="w-4 h-4" /> },
  { id: 'standard', name: 'Standard Project', time: '3-4 weeks', icon: <Clock className="w-4 h-4" /> },
  { id: 'deep', name: 'Deep Dive', time: '5-8 weeks', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'semester', name: 'Semester-long', time: '12+ weeks', icon: <Star className="w-4 h-4" /> }
];

const ENVIRONMENTS = [
  { id: 'classroom', name: 'Classroom' },
  { id: 'lab', name: 'Lab/Makerspace' },
  { id: 'field', name: 'Field/Outdoor' },
  { id: 'hybrid', name: 'Hybrid' },
  { id: 'remote', name: 'Remote/Online' }
];

const STEPS = [
  { id: 'subject', label: 'Basics', icon: <Sparkles className="w-5 h-5" />, description: 'Choose subjects and grade level' },
  { id: 'ideas', label: 'Project Ideas', icon: <Star className="w-5 h-5" />, description: 'Share your initial ideas' },
  { id: 'materials', label: 'Materials', icon: <Plus className="w-5 h-5" />, description: 'Add resources and tools' },
  { id: 'review', label: 'Review', icon: <Check className="w-5 h-5" />, description: 'Confirm your setup' }
];

export const ProjectOnboardingWizard: React.FC<ProjectOnboardingWizardProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ProjectSetupData>({
    subject: '',
    subjects: [], // Multi-subject support
    gradeLevel: '',
    duration: '',
    location: '',
    initialIdeas: [],
    materials: {
      readings: [],
      tools: []
    }
  });

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]); // Multi-subject support
  const [primarySubject, setPrimarySubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [ideaInput, setIdeaInput] = useState('');
  const [readingInput, setReadingInput] = useState('');
  const [toolInput, setToolInput] = useState('');

  const handleNext = () => {
    try {
      console.log('[Wizard] handleNext called, currentStep:', currentStep, 'of', STEPS.length - 1);
      console.log('[Wizard] Current data state:', data);
      console.log('[Wizard] Selected subjects:', selectedSubjects);
      console.log('[Wizard] Can proceed?', canProceed());
      
      if (currentStep < STEPS.length - 1) {
        console.log('[Wizard] Moving to next step:', currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        // Log data being sent
        console.log('[Wizard] At final step, completing with data:', data);
        // Ensure we have the subjects array populated
        const finalData = {
          ...data,
          subjects: selectedSubjects.length > 0 ? selectedSubjects : [data.subject].filter(Boolean),
          subject: selectedSubjects[0] || data.subject || 'General'
        };
        console.log('[Wizard] About to call onComplete with:', JSON.stringify(finalData, null, 2));
        try {
          onComplete(finalData);
          console.log('[Wizard] onComplete called successfully');
        } catch (error) {
          console.error('[Wizard] Error calling onComplete:', error);
        }
      }
    } catch (error) {
      console.error('[Wizard] Error in handleNext:', error);
      alert('An error occurred. Please check the console for details.');
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
        return selectedSubjects.length > 0 && data.gradeLevel !== '' && data.duration !== '' && data.location !== '';
      case 'ideas':
        return data.initialIdeas.length > 0;
      case 'materials':
        return true; // Materials are optional
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const addItem = (type: 'idea' | 'reading' | 'tool', value: string) => {
    if (!value.trim()) return;
    
    setData(prev => {
      if (type === 'idea') {
        return { ...prev, initialIdeas: [...prev.initialIdeas, value] };
      } else if (type === 'reading') {
        return { 
          ...prev, 
          materials: { ...prev.materials, readings: [...prev.materials.readings, value] }
        };
      } else if (type === 'tool') {
        return { 
          ...prev, 
          materials: { ...prev.materials, tools: [...prev.materials.tools, value] }
        };
      }
      return prev;
    });
    
    if (type === 'idea') {
      setIdeaInput('');
    } else if (type === 'reading') {
      setReadingInput('');
    } else if (type === 'tool') {
      setToolInput('');
    }
  };

  const removeItem = (type: 'idea' | 'reading' | 'tool', index: number) => {
    setData(prev => {
      if (type === 'idea') {
        return { 
          ...prev, 
          initialIdeas: prev.initialIdeas.filter((_, i) => i !== index) 
        };
      } else if (type === 'reading') {
        return { 
          ...prev, 
          materials: { 
            ...prev.materials, 
            readings: prev.materials.readings.filter((_, i) => i !== index) 
          }
        };
      } else if (type === 'tool') {
        return { 
          ...prev, 
          materials: { 
            ...prev.materials, 
            tools: prev.materials.tools.filter((_, i) => i !== index) 
          }
        };
      }
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/20 dark:from-gray-900 dark:to-primary-900/20 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 group
                    ${index <= currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
                  onClick={() => index < currentStep && setCurrentStep(index)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
                    transition-all duration-200 group-hover:scale-110
                    ${index < currentStep ? 'bg-success-500 text-white shadow-lg shadow-success-500/30' :
                      index === currentStep ? 'bg-primary-500 text-white ring-4 ring-primary-200 dark:ring-primary-800 shadow-lg shadow-primary-500/30' :
                      'bg-gray-200 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                  {index === currentStep && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">{step.description}</span>
                  )}
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
                  <p className="text-gray-600 dark:text-gray-400">Select one or more subjects for your interdisciplinary project.</p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">✨ You can select multiple subjects to create cross-curricular connections!</p>
                </div>
                
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Subject Areas {selectedSubjects.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-primary-600 dark:text-primary-400">
                        ({selectedSubjects.length} selected)
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {SUBJECTS.map((subject) => (
                      <motion.button
                        key={subject.id}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          try {
                            console.log('[Wizard] Subject clicked:', subject.name);
                            const isSelected = selectedSubjects.includes(subject.name);
                            if (isSelected) {
                              // Remove subject
                              const newSubjects = selectedSubjects.filter(s => s !== subject.name);
                              console.log('[Wizard] Removing subject, new list:', newSubjects);
                              setSelectedSubjects(newSubjects);
                              setData({ 
                                ...data, 
                                subjects: newSubjects,
                                subject: newSubjects[0] || '' // Keep primary subject
                              });
                              if (primarySubject?.name === subject.name) {
                                setPrimarySubject(SUBJECTS.find(s => s.name === newSubjects[0]) || null);
                              }
                            } else {
                              // Add subject
                              const newSubjects = [...selectedSubjects, subject.name];
                              console.log('[Wizard] Adding subject, new list:', newSubjects);
                              setSelectedSubjects(newSubjects);
                              setData({ 
                                ...data, 
                                subjects: newSubjects,
                                subject: newSubjects[0] // First selected is primary
                              });
                              if (newSubjects.length === 1) {
                                setPrimarySubject(subject);
                              }
                            }
                          } catch (error) {
                            console.error('[Wizard] Error selecting subject:', error);
                          }
                        }}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-200 transform
                          ${selectedSubjects.includes(subject.name)
                            ? `${subject.borderColor} border-opacity-100 ${subject.bgColor} scale-105 shadow-lg`
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:scale-105'
                          }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 rounded-xl
                          ${selectedSubjects.includes(subject.name) ? 'opacity-10' : ''} transition-opacity duration-200`} />
                        {selectedSubjects[0] === subject.name && (
                          <div className="absolute top-1 right-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            Primary
                          </div>
                        )}
                        <div className="relative flex flex-col items-center space-y-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${subject.color} text-white`}>
                            {subject.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {subject.name}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  {selectedSubjects.length > 0 && primarySubject && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Example Projects:</p>
                      <div className="flex flex-wrap gap-2">
                        {primarySubject.examples.map((example, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-white dark:bg-gray-600 rounded-md text-gray-700 dark:text-gray-200">
                            {example}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Grade Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Grade Level
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {GRADE_BANDS.map((grade) => (
                      <motion.button
                        key={grade.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setData({ ...data, gradeLevel: grade.name })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center
                          ${data.gradeLevel === grade.name
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                      >
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{grade.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{grade.range}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Project Duration
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DURATIONS.map((duration) => (
                      <motion.button
                        key={duration.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setData({ ...data, duration: duration.time })}
                        className={`p-3 rounded-lg border-2 transition-all duration-200
                          ${data.duration === duration.time
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                      >
                        <div className="flex items-center space-x-2">
                          {duration.icon}
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{duration.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{duration.time}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Learning Environment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Learning Environment
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {ENVIRONMENTS.map((env) => (
                      <motion.button
                        key={env.id}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setData({ ...data, location: env.name })}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-center
                          ${data.location === env.name
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                      >
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{env.name}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Initial Ideas */}
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
                
                {selectedSubject && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Need inspiration? Here are some trending {selectedSubject.name} topics:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubject.examples.map((example, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addItem('idea', example)}
                          className="px-3 py-1.5 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200
                                   hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors duration-200
                                   border border-gray-200 dark:border-gray-500"
                        >
                          <Plus className="w-3 h-3 inline mr-1" />
                          {example}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ideaInput}
                      onChange={(e) => setIdeaInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addItem('idea', ideaInput)}
                      placeholder="Enter your own idea or theme..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 
                               text-gray-900 dark:text-gray-100 rounded-xl 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
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

            {/* Step 3: Materials */}
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

            {/* Step 4: Review */}
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedSubjects.length > 1 ? 'Subjects (Interdisciplinary)' : 'Subject'}
                      </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedSubjects.map((subjectName, idx) => {
                          const subject = SUBJECTS.find(s => s.name === subjectName);
                          return subject ? (
                            <span key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium
                              bg-gradient-to-r ${subject.color} text-white`}>
                              {subject.icon}
                              {subjectName}
                              {idx === 0 && selectedSubjects.length > 1 && (
                                <span className="text-xs opacity-90 ml-1">(Primary)</span>
                              )}
                            </span>
                          ) : null;
                        })}
                      </div>
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
                      <span className="text-sm text-gray-500 dark:text-gray-400">Environment</span>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{data.location}</p>
                    </div>
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
                    data.materials.tools.length > 0) && (
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