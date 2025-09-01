import React from 'react';
import { motion } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { Clock, Calendar, Target } from 'lucide-react';

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
    icon: Clock,
    examples: ['Single experiment', 'One-day workshop', 'Guest speaker session']
  },
  {
    value: 'unit' as const,
    label: 'Unit',
    duration: '2-4 weeks',
    description: 'A comprehensive project with multiple components',
    icon: Calendar,
    examples: ['Multi-phase project', 'Research & presentation', 'Design challenge']
  },
  {
    value: 'course' as const,
    label: 'Course/Studio',
    duration: 'Full semester or year',
    description: 'An extensive program with major deliverables',
    icon: Target,
    examples: ['Capstone project', 'Year-long investigation', 'Community partnership']
  }
];

export function ScopeStep({ data, updateField, error }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">What's your project scope?</h2>
        <p className="text-slate-600 dark:text-slate-400">
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
            onClick={() => { updateField('scope', option.value); }}
            className={`
              w-full glass-squircle card-pad-lg anim-ease border-2 text-left
              hover:shadow-lg hover:-translate-y-0.5
              ${data.scope === option.value ? 'glass-border-selected' : 'border-gray-200 dark:border-gray-700'}
            `}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 glass-squircle border border-gray-200 dark:border-gray-700">
                <option.icon className={`w-6 h-6 ${data.scope === option.value ? 'text-blue-600 dark:text-blue-400 icon-bounce' : 'text-gray-700 dark:text-gray-400 icon-hover-bounce'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className={`text-lg font-bold ${data.scope === option.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                    {option.label}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {option.duration}
                  </span>
                </div>
                <p className={`text-sm mb-3 ${data.scope === option.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {option.description}
                </p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {option.examples.map((example) => (
                      <span 
                        key={example}
                        className={`
                          text-xs px-2 py-1 rounded-full
                          ${data.scope === option.value 
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
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

        <div className="glass-squircle card-pad anim-ease border border-amber-100 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Tip:</strong> You can always adjust the scope later as your project evolves. 
            Start with what feels manageable for you and your students.
          </p>
        </div>
      </div>
    </div>
  );
}
