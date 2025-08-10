import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { 
  Target,
  BookOpen,
  Users,
  Clock,
  Package,
  FileText,
  Check,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Rocket,
  Trophy,
  Brain,
  Palette,
  Globe,
  Edit3,
  CheckCircle2,
  Info,
  Heart
} from 'lucide-react';
import { wizardValidator } from '../wizardValidation';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
  onJumpToStep?: (stepIndex: number) => void;
}

export function ReviewStep({ data, onJumpToStep }: StepProps) {
  const [expandedPreview, setExpandedPreview] = useState(false);
  
  // Validate all fields
  const visionValid = wizardValidator.validateField('vision', data.vision).isValid;
  const subjectValid = wizardValidator.validateField('subject', data.subject).isValid;
  const timelineValid = wizardValidator.validateField('timeline', data.duration).isValid;
  const studentsValid = wizardValidator.validateField('gradeLevel', data.gradeLevel).isValid;
  
  const allFieldsValid = visionValid && subjectValid && timelineValid && studentsValid;
  const completionPercentage = [visionValid, subjectValid, timelineValid, studentsValid].filter(Boolean).length * 25;
  
  const fields = [
    { 
      label: 'Learning Vision', 
      value: data.vision, 
      icon: Target,
      stepIndex: 0,
      required: true,
      category: 'foundation',
      color: 'indigo',
      isValid: visionValid,
      emoji: '🎯'
    },
    { 
      label: 'Tools & Resources', 
      value: data.requiredResources || 'Standard classroom materials', 
      icon: Package,
      stepIndex: 0,
      required: false,
      category: 'foundation',
      color: 'gray',
      isValid: true,
      emoji: '🛠️'
    },
    { 
      label: 'STEAM Subject', 
      value: data.subject, 
      icon: Brain,
      stepIndex: 1,
      required: true,
      category: 'content',
      color: 'emerald',
      isValid: subjectValid,
      emoji: '🧬'
    },
    { 
      label: 'Project Timeline', 
      value: data.duration === 'short' ? '⚡ Sprint (2-3 weeks)' : data.duration === 'medium' ? '🎯 Deep Dive (4-8 weeks)' : '📅 Semester Journey', 
      icon: Clock,
      stepIndex: 1,
      required: true,
      category: 'content',
      color: 'blue',
      isValid: timelineValid,
      emoji: '⏰'
    },
    { 
      label: 'Student Profile', 
      value: data.gradeLevel, 
      icon: Users,
      stepIndex: 2,
      required: true,
      category: 'audience',
      color: 'purple',
      isValid: studentsValid,
      emoji: '👥'
    },
    {
      label: 'Special Considerations',
      value: data.customStudents || 'None specified',
      icon: Heart,
      stepIndex: 2,
      required: false,
      category: 'audience',
      color: 'pink',
      isValid: true,
      emoji: '💝'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 blur-3xl" />
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-xl shadow-green-500/20">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Review Your Blueprint
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
              Let's review your project details before creating your personalized STEAM experience
            </p>
            
            {/* Progress Indicator */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completion Status
                </span>
                <span className={`text-sm font-bold ${
                  allFieldsValid ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {completionPercentage}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              {!allFieldsValid && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  {wizardValidator.getEncouragementMessage(completionPercentage)}
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Review Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field, index) => {
          const IconComponent = field.icon;
          const isEmpty = field.required && (!field.value || field.value === 'Not specified');
          
          return (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <button
                onClick={() => onJumpToStep?.(field.stepIndex)}
                className={`
                  relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300
                  backdrop-blur-sm overflow-hidden
                  ${field.isValid
                    ? `bg-white dark:bg-gray-900/50 border-${field.color}-200 dark:border-${field.color}-800 hover:border-${field.color}-400 hover:shadow-xl` 
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700 hover:border-amber-400 hover:shadow-xl'
                  }
                `}
              >
                {/* Gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
                  field.isValid ? `from-${field.color}-500/5 to-${field.color}-600/5` : 'from-amber-500/10 to-orange-500/10'
                }`} />
                
                {/* Status indicator */}
                {field.required && (
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${
                    field.isValid 
                      ? 'bg-green-500 shadow-lg shadow-green-500/30' 
                      : 'bg-amber-500 shadow-lg shadow-amber-500/30'
                  }`}>
                    {field.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-white text-xs font-bold">!</span>
                    )}
                  </div>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${field.isValid
                        ? `bg-gradient-to-br from-${field.color}-100 to-${field.color}-200 dark:from-${field.color}-900/30 dark:to-${field.color}-800/30` 
                        : 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30'
                      }
                    `}>
                      <span className="text-2xl">{field.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-bold text-sm uppercase tracking-wider ${
                          field.isValid 
                            ? `text-${field.color}-700 dark:text-${field.color}-300` 
                            : 'text-amber-700 dark:text-amber-300'
                        }`}>
                          {field.label}
                        </h3>
                        <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className={`
                        text-sm font-medium line-clamp-2
                        ${isEmpty 
                          ? 'text-amber-600 dark:text-amber-400 italic' 
                          : 'text-gray-700 dark:text-gray-300'
                        }
                      `}>
                        {isEmpty ? 'Click to add' : field.value}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Project Preview Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <button
          onClick={() => setExpandedPreview(!expandedPreview)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          {expandedPreview ? 'Hide' : 'Preview'} Your Project
          <motion.div
            animate={{ rotate: expandedPreview ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowRight className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} />
          </motion.div>
        </button>
      </motion.div>
      
      {/* Expanded Project Preview */}
      <AnimatePresence>
        {expandedPreview && allFieldsValid && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Personalized STEAM Project
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">Project Type</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      A {data.duration === 'short' ? 'fast-paced sprint' : data.duration === 'medium' ? 'comprehensive exploration' : 'deep semester journey'} in {data.subject} 
                      designed for {data.gradeLevel} learners
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Learning Outcomes</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {data.vision}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Key Features</h4>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Age-appropriate challenges and scaffolding</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Real-world STEAM applications</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Assessment rubrics and tools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        <span>Differentiation strategies included</span>
                      </li>
                    </ul>
                  </div>
                  
                  {data.requiredResources && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                      <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Resources</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Optimized for: {data.requiredResources}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced What Happens Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl" />
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-xl shadow-indigo-500/20">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Your Journey Begins Here
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">AI-Powered Ideation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Explore innovative {data.subject || 'STEAM'} project ideas perfect for {data.gradeLevel || 'your students'}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Complete Blueprint</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Detailed plans with milestones for your {data.duration === 'short' ? '2-3 week sprint' : data.duration === 'medium' ? '4-8 week exploration' : 'semester journey'}
                      </p>
                    </div>
                  </motion.div>
                </div>
                
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Ready Resources</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Rubrics, worksheets, and activities tailored for {data.gradeLevel || 'your learners'}
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Continuous Support</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ongoing AI assistance and community resources throughout your project
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Ready Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-center"
      >
        {allFieldsValid ? (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-300">
              Perfect! Your blueprint is ready. Click "Go to Ideation" to begin!
            </span>
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
        ) : (
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full">
            <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-700 dark:text-amber-300">
              Please complete all required fields before continuing
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}