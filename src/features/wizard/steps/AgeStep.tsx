import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { Users, BookOpen, Info } from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const ageRanges = [
  { label: '5-7 years', value: '5-7' },
  { label: '8-10 years', value: '8-10' },
  { label: '11-13 years', value: '11-13' },
  { label: '14-16 years', value: '14-16' },
  { label: '17-18 years', value: '17-18' },
  { label: '18+ years', value: '18+' }
];

const gradeRanges = [
  { label: 'K-2', value: 'K-2' },
  { label: '3-5', value: '3-5' },
  { label: '6-8', value: '6-8' },
  { label: '9-12', value: '9-12' },
  { label: 'College', value: 'College' }
];

export function AgeStep({ data, updateField, error }: StepProps) {
  const [inputMode, setInputMode] = React.useState<'age' | 'grade' | 'custom'>('age');

  return (
    <div className="space-y-6">
      <div className="text-center pb-6">
        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
          <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">Who are your students?</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Select an age range, grade level, or describe your student group
        </p>
      </div>

      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setInputMode('age')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200
              ${inputMode === 'age' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-600' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            By Age
          </button>
          <button
            onClick={() => setInputMode('grade')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200
              ${inputMode === 'grade' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-600' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            By Grade
          </button>
          <button
            onClick={() => setInputMode('custom')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200
              ${inputMode === 'custom' 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-600' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            Custom
          </button>
        </div>

        {/* Age ranges */}
        {inputMode === 'age' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {ageRanges.map((range, index) => (
              <motion.button
                key={range.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => updateField('ageGroup', range.label)}
                className={`
                  p-6 rounded-xl border transition-all duration-200
                  hover:shadow-lg hover:-translate-y-1
                  ${data.ageGroup === range.label
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                  }
                `}
              >
                <Users className="w-6 h-6 mx-auto mb-3 opacity-70" />
                <div className="text-base font-semibold">{range.label}</div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Grade levels */}
        {inputMode === 'grade' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {gradeRanges.map((grade, index) => (
              <motion.button
                key={grade.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => updateField('ageGroup', grade.label)}
                className={`
                  p-6 rounded-xl border transition-all duration-200
                  hover:shadow-lg hover:-translate-y-1
                  ${data.ageGroup === grade.label
                    ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
                  }
                `}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-3 opacity-70" />
                <div className="text-base font-semibold">{grade.label}</div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Custom input */}
        {inputMode === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Describe your student group
              </span>
              <input
                type="text"
                value={data.ageGroup}
                onChange={(e) => updateField('ageGroup', e.target.value)}
                placeholder="e.g., Mixed ages 12-15, Adult learners, Special needs 10-12"
                className={`
                  w-full px-4 py-3 rounded-xl border shadow-sm
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md
                  transition-all duration-200
                  ${error 
                    ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400'
                  }
                `}
              />
            </label>
          </motion.div>
        )}

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Why this matters</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We'll tailor activities, language complexity, and project scope to match your students' developmental stage.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}