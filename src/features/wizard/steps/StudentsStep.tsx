import React from 'react';
import { motion } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { Users, BookOpen } from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const gradeRanges = [
  { label: 'K-2nd Grade', value: 'K-2', ages: 'Ages 5-8' },
  { label: '3rd-5th Grade', value: '3-5', ages: 'Ages 8-11' },
  { label: '6th-8th Grade', value: '6-8', ages: 'Ages 11-14' },
  { label: '9th-12th Grade', value: '9-12', ages: 'Ages 14-18' },
  { label: 'College/University', value: 'College', ages: 'Ages 18+' }
];

export function StudentsStep({ data, updateField, error }: StepProps) {
  const [inputMode, setInputMode] = React.useState<'grade' | 'custom'>('grade');

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-6 border-b border-gray-100 dark:border-gray-700"
      >
        <div className="inline-flex p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-2xl mb-6 shadow-sm">
          <Users className="w-10 h-10 text-violet-600 dark:text-violet-400" />
        </div>
        <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">Who are your students?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
          This helps us tailor content to the right developmental level and learning style
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Mode selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center"
        >
          <div className="flex gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <button
              onClick={() => setInputMode('grade')}
              className={`
                flex items-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-200 relative
                ${inputMode === 'grade' 
                  ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-md transform scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <BookOpen className="w-5 h-5" />
              Grade Level
              {inputMode === 'grade' && (
                <motion.div
                  layoutId="selector-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl"
                />
              )}
            </button>
            <button
              onClick={() => setInputMode('custom')}
              className={`
                flex items-center gap-3 py-3 px-6 rounded-xl font-semibold transition-all duration-200 relative
                ${inputMode === 'custom' 
                  ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-md transform scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              <Users className="w-5 h-5" />
              Custom Description
              {inputMode === 'custom' && (
                <motion.div
                  layoutId="selector-indicator"
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl"
                />
              )}
            </button>
          </div>
        </motion.div>

        {/* Grade Range Selection */}
        {inputMode === 'grade' && (
          <motion.div
            key="grade-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {gradeRanges.map((range, index) => {
              const isSelected = data.gradeLevel === range.label;
              
              return (
                <motion.button
                  key={range.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (index * 0.1) }}
                  onClick={() => updateField('gradeLevel', range.label)}
                  className={`
                    relative p-6 rounded-2xl border-2 text-left transition-all duration-200 group
                    hover:shadow-lg hover:-translate-y-1
                    ${isSelected
                      ? 'border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md'
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                  
                  {/* Age range indicator */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isSelected 
                        ? 'bg-violet-100 dark:bg-violet-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/20'
                    }`}>
                      <Users className={`w-6 h-6 ${
                        isSelected 
                          ? 'text-violet-600 dark:text-violet-400' 
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                      isSelected 
                        ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-700 dark:group-hover:bg-violet-900/20 dark:group-hover:text-violet-300'
                    }`}>
                      {range.ages}
                    </span>
                  </div>
                  
                  <div className={`font-bold text-lg transition-colors ${
                    isSelected 
                      ? 'text-violet-900 dark:text-violet-100' 
                      : 'text-gray-900 dark:text-gray-100 group-hover:text-violet-800 dark:group-hover:text-violet-200'
                  }`}>
                    {range.label}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Custom Input */}
        {inputMode === 'custom' && (
          <motion.div
            key="custom-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-8 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl border border-violet-200 dark:border-violet-800">
              <label htmlFor="custom-grade" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                <Users className="inline-block w-6 h-6 mr-3" />
                Describe your student group
              </label>
              
              <input
                id="custom-grade"
                type="text"
                value={data.gradeLevel}
                onChange={(e) => updateField('gradeLevel', e.target.value)}
                placeholder="e.g., Mixed-age 10-12, Advanced 8th grade, Adult learners"
                className="w-full px-6 py-4 rounded-2xl border text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-violet-500"
              />
              
              <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-violet-700 dark:text-violet-300 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Be specific about age, skill level, learning needs, or any special characteristics that would help us customize the project
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}