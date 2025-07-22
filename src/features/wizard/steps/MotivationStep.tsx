import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { LightbulbIcon, SparklesIcon } from '../../../components/icons/ButtonIcons';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const suggestions = [
  "I want to help students see the real-world applications of what they're learning",
  "I'm passionate about making learning more engaging and hands-on for my students",
  "I believe in project-based learning that connects to students' lives and communities",
  "I want to inspire creativity and critical thinking through authentic challenges"
];

export function MotivationStep({ data, updateField, error }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What motivates you?</h2>
        <p className="text-slate-600">
          Tell us why you're excited about creating this learning experience. 
          What do you hope to achieve?
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="motivation" className="text-sm font-medium text-slate-700 block">
            Your motivation
            <span className="text-red-500 ml-1" aria-label="required">*</span>
          </label>
          <textarea
            id="motivation"
            name="motivation"
            value={data.motivation}
            onChange={(e) => updateField('motivation', e.target.value)}
            placeholder="I want to create a learning experience that..."
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? "motivation-error" : "motivation-description"}
            className={`
              w-full px-4 py-3 rounded-lg border-2 resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
              transition-all duration-200
              ${error 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-500'
              }
            `}
            rows={4}
          />
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-2"
            >
              {error}
            </motion.p>
          )}
        </label>

        <div className="text-sm text-slate-600">
          <p className="flex items-center gap-2 mb-3">
            <LightbulbIcon className="w-4 h-4 text-amber-500" />
            <span className="font-medium">Need inspiration? Try one of these:</span>
          </p>
          <div className="grid gap-2">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => updateField('motivation', suggestion)}
                className="
                  text-left p-3 rounded-lg border border-gray-200
                  hover:border-blue-300 hover:bg-blue-50
                  transition-all duration-200 group
                "
              >
                <span className="text-gray-700 group-hover:text-blue-700">
                  {suggestion}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-lg">
          <SparklesIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Be specific about your goals. This helps us suggest 
            the best activities and resources for your project.
          </p>
        </div>
      </div>
    </div>
  );
}