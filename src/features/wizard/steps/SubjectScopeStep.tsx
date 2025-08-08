import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WizardData, DURATION_LABELS } from '../wizardSchema';
import { Clock, BookOpen, Calendar, Zap, Target } from 'lucide-react';

interface SubjectScopeStepProps {
  data: WizardData;
  updateField: (field: keyof WizardData, value: any) => void;
  error?: string;
}

const commonSubjects = [
  'Environmental Science', 'Robotics', 'Digital Arts', 'Biology', 'Chemistry', 
  'Physics', 'Mathematics', 'Engineering Design', 'Computer Science', 'Astronomy',
  'Geology', 'Marine Science', 'Biotechnology', 'Sustainable Energy'
];

const durationDetails = {
  short: {
    icon: Zap,
    title: 'Sprint Project',
    timeframe: '2-3 weeks',
    description: 'Quick exploration or prototype',
    features: ['Focused scope', 'Rapid iteration', 'Quick wins'],
    color: 'green'
  },
  medium: {
    icon: Target,
    title: 'Deep Dive',
    timeframe: '4-8 weeks', 
    description: 'Comprehensive investigation',
    features: ['Multiple phases', 'Rich research', 'Polished outcomes'],
    color: 'blue'
  },
  long: {
    icon: Calendar,
    title: 'Semester Journey',
    timeframe: 'Full semester',
    description: 'Extensive, multi-faceted project',
    features: ['Complex challenges', 'Real partnerships', 'Professional outcomes'],
    color: 'purple'
  }
};

export function SubjectScopeStep({ data, updateField, error }: SubjectScopeStepProps) {
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  
  const filteredSubjects = commonSubjects.filter(subject =>
    subject.toLowerCase().includes(data.subject.toLowerCase())
  ).slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-6 border-b border-gray-100 dark:border-gray-700"
      >
        <div className="inline-flex p-4 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-2xl mb-6 shadow-sm">
          <BookOpen className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          Subject & Timeline
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Tell us the subject area and how much time you have for this project
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Subject Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <label htmlFor="subject" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            <BookOpen className="inline-block w-6 h-6 mr-3" />
            Subject Area
          </label>
          
          <div className="relative">
            <input
              id="subject"
              type="text"
              value={data.subject}
              onChange={(e) => {
                updateField('subject', e.target.value);
                setShowSubjectSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => {
                setSubjectFocused(true);
                setShowSubjectSuggestions(data.subject.length > 0);
              }}
              onBlur={() => {
                setSubjectFocused(false);
                // Delay hiding suggestions to allow for clicks
                setTimeout(() => setShowSubjectSuggestions(false), 200);
              }}
              placeholder="e.g., Environmental Science, Robotics, Digital Arts..."
              className={`
                w-full px-6 py-4 rounded-2xl border text-lg
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                shadow-sm hover:shadow-md focus:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-emerald-500/20
                transition-all duration-300 ease-out
                placeholder:text-gray-500 dark:placeholder:text-gray-400
                ${subjectFocused ? 'transform scale-[1.01]' : ''}
                border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500
              `}
              autoFocus
            />
            
            {/* Subject suggestions dropdown */}
            {showSubjectSuggestions && filteredSubjects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              >
                {filteredSubjects.map((subject, index) => (
                  <button
                    key={subject}
                    onMouseDown={() => {
                      updateField('subject', subject);
                      setShowSubjectSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                  >
                    <span className="text-gray-900 dark:text-gray-100">{subject}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            You can combine subjects like "Math & Environmental Science" for STEAM projects
          </p>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Project Duration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How much time do you have for this project?
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(durationDetails) as Array<keyof typeof durationDetails>).map((duration, index) => {
              const detail = durationDetails[duration];
              const IconComponent = detail.icon;
              const isSelected = data.duration === duration;
              
              return (
                <motion.button
                  key={duration}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  onClick={() => updateField('duration', duration)}
                  className={`
                    relative p-6 rounded-2xl border-2 text-left transition-all duration-200 
                    hover:shadow-lg hover:-translate-y-1 group
                    ${isSelected
                      ? `border-${detail.color}-500 bg-${detail.color}-50 dark:bg-${detail.color}-900/20 shadow-md` 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className={`absolute top-4 right-4 w-6 h-6 bg-${detail.color}-500 rounded-full flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected 
                        ? `bg-${detail.color}-100 dark:bg-${detail.color}-900/30` 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    } transition-colors`}>
                      <IconComponent className={`w-8 h-8 ${
                        isSelected 
                          ? `text-${detail.color}-600 dark:text-${detail.color}-400` 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-2 ${
                        isSelected 
                          ? `text-${detail.color}-900 dark:text-${detail.color}-100` 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {detail.title}
                      </h4>
                      
                      <p className={`font-semibold text-sm mb-2 ${
                        isSelected 
                          ? `text-${detail.color}-700 dark:text-${detail.color}-300` 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {detail.timeframe}
                      </p>
                      
                      <p className={`text-sm mb-4 ${
                        isSelected 
                          ? `text-${detail.color}-600 dark:text-${detail.color}-400` 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {detail.description}
                      </p>
                      
                      <div className="space-y-2">
                        {detail.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isSelected 
                                ? `bg-${detail.color}-500` 
                                : 'bg-gray-400'
                            }`} />
                            <span className={`text-xs ${
                              isSelected 
                                ? `text-${detail.color}-700 dark:text-${detail.color}-300` 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}