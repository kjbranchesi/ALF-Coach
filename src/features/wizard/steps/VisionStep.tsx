import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { Target, Lightbulb, ChevronDown, Package, Sparkles, Info, CheckCircle2, AlertCircle, BookOpen, Palette, Globe } from 'lucide-react';
import { getRelevantExamples } from '../wizardExamples';
import { wizardValidator } from '../wizardValidation';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

// Categories for vision examples
const visionCategories = [
  { id: 'skills', label: 'Skills', icon: Target, color: 'blue' },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen, color: 'green' },
  { id: 'creativity', label: 'Creativity', icon: Palette, color: 'purple' },
  { id: 'impact', label: 'Impact', icon: Globe, color: 'orange' }
];

export function VisionStep({ data, updateField, error }: StepProps) {
  const [showOptional, setShowOptional] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showEducationalPanel, setShowEducationalPanel] = useState(true);
  
  const characterCount = data.vision?.length || 0;
  const minCharacters = 20;
  const maxCharacters = 500;
  
  // Get dynamic examples based on input
  const examples = getRelevantExamples('vision', data.vision);
  
  // Validate on change
  useEffect(() => {
    if (hasInteracted) {
      const result = wizardValidator.validateField('vision', data.vision);
      setValidationResult(result);
    }
  }, [data.vision, hasInteracted]);
  
  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section with Educational Context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl" />
          <div className="relative glass-squircle card-pad-lg anim-ease border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl shadow-indigo-500/20">
              <Target className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Let's Define Your Vision
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
              Your vision drives the entire project. It shapes the challenges, activities, and outcomes.
            </p>
            
            {/* Why This Matters - Educational Panel */}
            <AnimatePresence>
              {showEducationalPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 glass-squircle card-pad anim-ease border border-blue-200/50 dark:border-blue-700/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 glass-squircle shadow-soft border border-gray-200 dark:border-gray-700">
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Why your vision matters in PBL
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Clear vision = engaged students who understand the "why"</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>ALF uses your vision to generate aligned activities and assessments</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Strong visions connect learning to real-world application</span>
                        </li>
                      </ul>
                    </div>
                    <button
                      onClick={() => setShowEducationalPanel(false)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Main Content with Enhanced UI */}
      <div className="space-y-6">
        <div className="relative">
          <div className="flex justify-between items-start mb-3">
            <div>
              <label htmlFor="vision" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Your vision statement
                <span className="text-red-500 ml-1" aria-label="required">*</span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                What do you want students to learn, create, or achieve?
              </p>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium transition-colors ${
                characterCount < minCharacters ? 'text-amber-600 dark:text-amber-400' :
                characterCount > maxCharacters ? 'text-red-600 dark:text-red-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {characterCount}/{maxCharacters}
              </span>
              {validationResult && hasInteracted && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs mt-1 ${
                    validationResult.isValid 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {validationResult.message}
                </motion.p>
              )}
            </div>
          </div>
          <textarea
            id="vision"
            name="vision"
            value={data.vision}
            onChange={(e) => {
              updateField('vision', e.target.value);
              if (!hasInteracted) setHasInteracted(true);
            }}
            onFocus={() => {
              if (!hasInteracted) setHasInteracted(true);
            }}
            placeholder="I want students to..."
            aria-required="true"
            aria-invalid={!!error || (validationResult && !validationResult.isValid)}
            aria-describedby={error ? "vision-error" : "vision-description"}
            className={`
              w-full px-5 py-4 rounded-2xl border-2 resize-none
              bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100
              backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-indigo-500/10
              transition-all duration-300 text-lg
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              ${error || (validationResult && !validationResult.isValid && hasInteracted)
                ? 'border-red-300 dark:border-red-600 focus:border-red-400' 
                : validationResult?.isValid && hasInteracted
                ? 'border-green-300 dark:border-green-600 focus:border-green-400'
                : 'border-gray-200 dark:border-gray-700 focus:border-indigo-400 dark:focus:border-indigo-500'
              }
            `}
            rows={5}
            maxLength={maxCharacters}
          />
          {/* Enhanced character count progress bar */}
          <div className="mt-3 relative">
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className={`h-full transition-all ${
                  characterCount < minCharacters ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                  characterCount > maxCharacters * 0.9 ? 'bg-gradient-to-r from-red-400 to-red-500' :
                  'bg-gradient-to-r from-green-400 to-emerald-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((characterCount / maxCharacters) * 100, 100)}%` }}
              />
            </div>
            {characterCount >= minCharacters && characterCount <= maxCharacters && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              </motion.div>
            )}
          </div>
          {/* Enhanced validation feedback */}
          {validationResult?.suggestion && hasInteracted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {validationResult.suggestion}
                </p>
              </div>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </motion.div>
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

        {/* Enhanced Inspiration Section with Categories */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/20">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  Need inspiration?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Click any example below or write your own vision
                </p>
              </div>
            </div>
          </div>
          
          {/* Category Pills */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Examples
            </button>
            {visionCategories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Example Cards Grid */}
          <div className="grid gap-3 md:grid-cols-2">
            {examples.map((example, index) => (
              <motion.button
                key={example.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  updateField('vision', example.title);
                  setHasInteracted(true);
                }}
                className="
                  relative text-left p-5 rounded-2xl border-2
                  bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800
                  border-gray-200 dark:border-gray-700
                  hover:border-indigo-400 dark:hover:border-indigo-500
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300 group overflow-hidden
                "
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg">
                      {example.category}
                    </span>
                    <motion.div
                      whileHover={{ rotate: 15 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                    </motion.div>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-2 line-clamp-2">
                    {example.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {example.description}
                  </p>
                  
                  {example.tags && (
                    <div className="flex gap-1 mt-3 flex-wrap">
                      {example.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Enhanced Pro Tip Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-2xl" />
          <div className="relative p-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                  <Info className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Pro Tips for a Strong Vision
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Be specific:</span> "Create a water filtration system" is better than "Learn about water"
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Include action:</span> Use verbs like design, build, solve, investigate, or create
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Think outcomes:</span> What will students produce or be able to do?
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
