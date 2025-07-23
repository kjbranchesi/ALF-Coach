import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { UsersIcon, BookOpenIcon } from '../../../components/icons/ModernIcons';

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
        <div className="inline-flex p-3 bg-indigo-50 rounded-full mb-4">
          <UsersIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Who are your students?</h2>
        <p className="text-lg text-gray-600">
          Select an age range, grade level, or describe your student group
        </p>
      </div>

      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200">
          <button
            onClick={() => setInputMode('age')}
            className={`
              flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-200
              ${inputMode === 'age' 
                ? 'bg-white shadow-sm text-indigo-600 border border-indigo-200' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                ? 'bg-white shadow-sm text-indigo-600 border border-indigo-200' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                ? 'bg-white shadow-sm text-indigo-600 border border-indigo-200' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                  }
                `}
              >
                <UsersIcon className="w-6 h-6 mx-auto mb-3 opacity-70" />
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
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                  }
                `}
              >
                <BookOpenIcon className="w-6 h-6 mx-auto mb-3 opacity-70" />
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
              <span className="text-sm font-medium text-slate-700 mb-2 block">
                Describe your student group
              </span>
              <input
                type="text"
                value={data.ageGroup}
                onChange={(e) => updateField('ageGroup', e.target.value)}
                placeholder="e.g., Mixed ages 12-15, Adult learners, Special needs 10-12"
                className={`
                  w-full px-4 py-3 rounded-xl border shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:shadow-md
                  transition-all duration-200
                  ${error 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-indigo-500'
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
          className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Why this matters</h4>
              <p className="text-sm text-gray-600">
                We'll tailor activities, language complexity, and project scope to match your students' developmental stage.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}