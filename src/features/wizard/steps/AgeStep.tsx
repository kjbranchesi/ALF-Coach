import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { UserIcon } from '../../../components/icons/ButtonIcons';

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
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Who are your students?</h2>
        <p className="text-slate-600">
          Select an age range, grade level, or enter a custom description
        </p>
      </div>

      <div className="space-y-4">
        {/* Mode selector */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setInputMode('age')}
            className={`
              flex-1 py-2 px-4 rounded-md transition-all duration-200
              ${inputMode === 'age' 
                ? 'bg-white shadow-sm text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            By Age
          </button>
          <button
            onClick={() => setInputMode('grade')}
            className={`
              flex-1 py-2 px-4 rounded-md transition-all duration-200
              ${inputMode === 'grade' 
                ? 'bg-white shadow-sm text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            By Grade
          </button>
          <button
            onClick={() => setInputMode('custom')}
            className={`
              flex-1 py-2 px-4 rounded-md transition-all duration-200
              ${inputMode === 'custom' 
                ? 'bg-white shadow-sm text-blue-600 font-medium' 
                : 'text-gray-600 hover:text-gray-800'
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
                  p-4 rounded-lg border-2 transition-all duration-200
                  hover:shadow-md hover:-translate-y-0.5
                  ${data.ageGroup === range.label
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <UserIcon className="w-5 h-5 mx-auto mb-2 opacity-50" />
                <div className="text-sm font-medium">{range.label}</div>
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
                  p-4 rounded-lg border-2 transition-all duration-200
                  hover:shadow-md hover:-translate-y-0.5
                  ${data.ageGroup === grade.label
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300'
                  }
                `}
              >
                <div className="text-lg font-bold text-gray-400 mb-1">📚</div>
                <div className="text-sm font-medium">{grade.label}</div>
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
                  w-full px-4 py-3 rounded-lg border-2
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  transition-all duration-200
                  ${error 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-blue-500'
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

        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Why this matters:</strong> We'll tailor activities, language complexity, 
            and project scope to match your students' developmental stage.
          </p>
        </div>
      </div>
    </div>
  );
}