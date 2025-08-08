import React from 'react';
import { motion } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { 
  Target,
  BookOpen,
  Users,
  MapPin,
  Wrench,
  FileText,
  Check,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
  onJumpToStep?: (stepIndex: number) => void;
}

export function ReviewStep({ data, onJumpToStep }: StepProps) {
  const fields = [
    { 
      label: 'Learning Vision', 
      value: data.vision, 
      icon: Target,
      stepIndex: 0,
      required: true,
      category: 'foundation'
    },
    { 
      label: 'Required Resources', 
      value: data.requiredResources || 'None specified', 
      icon: BookOpen,
      stepIndex: 0,
      required: false,
      category: 'foundation'
    },
    { 
      label: 'Subject Area', 
      value: data.subject, 
      icon: FileText,
      stepIndex: 1,
      required: true,
      category: 'content'
    },
    { 
      label: 'Project Duration', 
      value: data.duration === 'short' ? '2-3 weeks' : data.duration === 'medium' ? '4-8 weeks' : 'Full semester', 
      icon: Check,
      stepIndex: 1,
      required: true,
      category: 'content'
    },
    { 
      label: 'Student Group', 
      value: data.gradeLevel, 
      icon: Users,
      stepIndex: 2,
      required: true,
      category: 'audience'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6">
        <div className="inline-flex p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-4">
          <Check className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Review Your Learning Blueprint
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Let's review everything before we create your personalized learning experience. 
          Click any section to make changes.
        </p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field, index) => {
          const IconComponent = field.icon;
          const isEmpty = !field.required && (field.value === 'Not specified' || !field.value);
          
          return (
            <motion.div
              key={field.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <button
                onClick={() => onJumpToStep?.(field.stepIndex)}
                className={`
                  w-full text-left p-5 rounded-xl border transition-all duration-200
                  hover:shadow-lg hover:-translate-y-1
                  ${isEmpty 
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-2.5 rounded-xl transition-colors duration-200
                    ${isEmpty 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500' 
                      : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40'
                    }
                  `}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-semibold ${isEmpty ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {field.label}
                      </h3>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </div>
                    </div>
                    <p className={`
                      text-sm line-clamp-2
                      ${isEmpty ? 'text-gray-400 dark:text-gray-500 italic' : 'text-gray-600 dark:text-gray-400'}
                    `}>
                      {field.value}
                    </p>
                    {field.required && isEmpty && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-amber-600 dark:text-amber-400">
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Required field
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* What happens next section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-indigo-100 dark:border-indigo-800"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-md">
              <Lightbulb className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Here's what happens next
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">AI-Powered Ideation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chat with our AI to explore creative project ideas tailored to your {data.subject || 'chosen subject'} curriculum
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Custom Blueprint</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get a detailed project plan with activities, timelines, and assessments for your {data.duration === 'short' ? 'sprint project' : data.duration === 'medium' ? 'deep dive project' : 'semester-long journey'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Teaching Resources</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Access rubrics, handouts, and materials designed for {data.gradeLevel || 'your student group'} learners
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Ongoing Support</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Continue refining your project with AI assistance throughout implementation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ready indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          All set! Click "Go to Ideation" to start creating your project
        </p>
      </motion.div>
    </div>
  );
}