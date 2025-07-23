import React from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { TargetIcon, IdeaIcon } from '../../../components/icons/ModernIcons';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const suggestions = [
  {
    title: "Connect learning to real-world impact",
    description: "Students apply concepts to solve authentic community challenges or create meaningful projects"
  },
  {
    title: "Foster deep inquiry and critical thinking",
    description: "Guide students to ask big questions, investigate complexities, and develop their own perspectives"
  },
  {
    title: "Build collaborative problem-solving skills",
    description: "Create opportunities for teamwork, peer learning, and collective innovation"
  },
  {
    title: "Develop creative expression and design thinking",
    description: "Encourage students to prototype, iterate, and showcase their unique solutions"
  }
];

export function MotivationStep({ data, updateField, error }: StepProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-6 border-b border-gray-100"
      >
        <div className="inline-flex p-3 bg-indigo-50 rounded-full mb-4">
          <TargetIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          What are your goals for this learning experience?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share your initial ideas and what you hope to accomplish. 
          It's okay if you're still exploring — we'll refine these together.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        <div>
          <label htmlFor="motivation" className="block text-sm font-semibold text-gray-700 mb-2">
            Describe your vision
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
              w-full px-4 py-3 rounded-xl border resize-none
              shadow-sm focus:shadow-md
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20
              transition-all duration-200
              ${error 
                ? 'border-red-300 focus:border-red-500' 
                : 'border-gray-200 focus:border-indigo-500'
              }
            `}
            rows={4}
          />
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2 flex items-center gap-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </motion.p>
          )}
        </div>

        {/* Inspiration Cards */}
        <div>
          <p className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700">
            <IdeaIcon className="w-5 h-5 text-indigo-600" />
            Select a goal to start with, or write your own:
          </p>
          <div className="grid gap-3">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => updateField('motivation', suggestion.title)}
                className="
                  text-left p-4 rounded-xl border border-gray-200 bg-white
                  hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md
                  transition-all duration-200 group
                "
              >
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                  {suggestion.description}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Info Box */}
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
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Why we're asking
              </h4>
              <p className="text-sm text-gray-600">
                Your goals help us tailor the blueprint to your vision. We'll suggest 
                activities, resources, and assessment methods that align with what you want 
                to achieve.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}