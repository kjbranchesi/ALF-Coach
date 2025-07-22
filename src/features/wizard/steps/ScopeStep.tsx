import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const scopeOptions = [
  {
    value: 'lesson' as const,
    label: 'Lesson',
    duration: '1-2 class periods',
    description: 'A focused activity or mini-project',
    icon: '⏱️',
    examples: ['Single experiment', 'One-day workshop', 'Guest speaker session']
  },
  {
    value: 'unit' as const,
    label: 'Unit',
    duration: '2-4 weeks',
    description: 'A comprehensive project with multiple components',
    icon: '📅',
    examples: ['Multi-phase project', 'Research & presentation', 'Design challenge']
  },
  {
    value: 'course' as const,
    label: 'Course/Studio',
    duration: 'Full semester or year',
    description: 'An extensive program with major deliverables',
    icon: '🎯',
    examples: ['Capstone project', 'Year-long investigation', 'Community partnership']
  }
];

export function ScopeStep({ data, updateField, error }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What's your project scope?</h2>
        <p className="text-slate-600">
          Choose the duration and depth that best fits your curriculum
        </p>
      </div>

      <div className="space-y-4">
        {scopeOptions.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => updateField('scope', option.value)}
            className={`
              w-full p-6 rounded-xl border-2 text-left
              transition-all duration-200 hover:shadow-lg
              ${data.scope === option.value
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 hover:-translate-y-0.5'
              }
            `}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-lg font-bold ${data.scope === option.value ? 'text-blue-700' : 'text-gray-800'}`}>
                    {option.label}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {option.duration}
                  </span>
                </div>
                <p className={`text-sm mb-3 ${data.scope === option.value ? 'text-blue-600' : 'text-gray-600'}`}>
                  {option.description}
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {option.examples.map((example) => (
                      <span 
                        key={example}
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${data.scope === option.value 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}

        <div className="p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Tip:</strong> You can always adjust the scope later as your project evolves. 
            Start with what feels manageable for you and your students.
          </p>
        </div>
      </div>
    </div>
  );
}