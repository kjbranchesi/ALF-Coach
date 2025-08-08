import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { Target, Lightbulb, ChevronDown, Package } from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const suggestions = [
  {
    title: "Connect learning to real-world impact",
    description: "Students apply STEM concepts to solve authentic community challenges"
  },
  {
    title: "Foster deep inquiry and scientific thinking",
    description: "Guide students through the scientific method with hands-on investigation"
  },
  {
    title: "Build collaborative problem-solving skills",
    description: "Create opportunities for teamwork, peer learning, and innovation"
  },
  {
    title: "Develop creative design and engineering mindset",
    description: "Encourage students to prototype, iterate, and showcase solutions"
  }
];

export function VisionStep({ data, updateField, error }: StepProps) {
  const [showOptional, setShowOptional] = useState(false);
  const characterCount = data.vision?.length || 0;
  const minCharacters = 20;
  const maxCharacters = 500;
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-6 border-b border-gray-100 dark:border-gray-700"
      >
        <div className="inline-flex p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-4">
          <Target className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-3">
          What's your learning vision?
        </h2>
        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Describe what you want students to accomplish through this project-based learning experience.
        </p>
      </motion.div>

      {/* Main Content */}
      <div className="space-y-6">
        <div className="relative">
          <div className="flex justify-between items-end mb-2">
            <label htmlFor="vision" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Your vision for this PBL experience
              <span className="text-red-500 ml-1" aria-label="required">*</span>
            </label>
            <span className={`text-xs transition-colors ${
              characterCount < minCharacters ? 'text-gray-400' :
              characterCount > maxCharacters ? 'text-red-500' :
              'text-green-600'
            }`}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
          <textarea
            id="vision"
            name="vision"
            value={data.vision}
            onChange={(e) => updateField('vision', e.target.value)}
            placeholder="I want students to..."
            aria-required="true"
            aria-invalid={!!error}
            aria-describedby={error ? "vision-error" : "vision-description"}
            className={`
              w-full px-4 py-3 rounded-xl border resize-none
              bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
              shadow-sm focus:shadow-lg focus:scale-[1.01]
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20
              transition-all duration-200
              placeholder:text-gray-500 dark:placeholder:text-gray-400
              ${error 
                ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500'
              }
            `}
            rows={4}
            maxLength={maxCharacters}
          />
          {/* Character count progress bar */}
          <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full transition-all ${
                characterCount < minCharacters ? 'bg-gray-400' :
                characterCount > maxCharacters * 0.9 ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((characterCount / maxCharacters) * 100, 100)}%` }}
            />
          </div>
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

        {/* Optional Resources Accordion */}
        <motion.div
          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
          initial={false}
        >
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Specific tools or materials? (Optional)
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Help us tailor suggestions to your available resources
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showOptional ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </button>
          
          <AnimatePresence>
            {showOptional && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <input
                    type="text"
                    value={data.requiredResources || ''}
                    onChange={(e) => updateField('requiredResources', e.target.value)}
                    placeholder="e.g., 3D printer, Chromebooks, science lab, limited budget"
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    We'll adapt activities and suggestions based on what you have available
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Inspiration Cards */}
        <div>
          <p className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            Click a suggestion for inspiration, or write your own:
          </p>
          <div className="grid gap-3">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => updateField('vision', suggestion.title)}
                className="
                  text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                  hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 
                  dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 hover:shadow-lg hover:-translate-y-1
                  transition-all duration-200 group
                "
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 mb-1">
                  {suggestion.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
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
          className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                This drives everything
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your vision shapes the entire project. We'll use it to generate appropriate 
                challenges, activities, and assessments aligned with your goals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}