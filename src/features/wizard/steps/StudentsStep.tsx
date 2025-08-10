import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { Users, BookOpen, Sparkles, Info, CheckCircle2, Heart, Zap, Brain, Globe, Lightbulb } from 'lucide-react';
import { getStudentAdaptations } from '../wizardExamples';
import { wizardValidator } from '../wizardValidation';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

// Enhanced grade ranges with developmental characteristics
const gradeRanges = [
  { 
    label: 'K-2nd Grade', 
    value: 'K-2', 
    ages: 'Ages 5-8',
    characteristics: 'Concrete thinking, hands-on learning, short attention spans',
    icon: '🌱',
    color: 'green'
  },
  { 
    label: '3rd-5th Grade', 
    value: '3-5', 
    ages: 'Ages 8-11',
    characteristics: 'Developing abstract thinking, collaborative learning, curious explorers',
    icon: '🌟',
    color: 'blue'
  },
  { 
    label: '6th-8th Grade', 
    value: '6-8', 
    ages: 'Ages 11-14',
    characteristics: 'Identity formation, peer-focused, real-world connections',
    icon: '🚀',
    color: 'purple'
  },
  { 
    label: '9th-12th Grade', 
    value: '9-12', 
    ages: 'Ages 14-18',
    characteristics: 'Abstract reasoning, future-oriented, autonomy seeking',
    icon: '🎯',
    color: 'orange'
  },
  { 
    label: 'College/University', 
    value: 'College', 
    ages: 'Ages 18+',
    characteristics: 'Self-directed learning, professional preparation, complex thinking',
    icon: '🎓',
    color: 'indigo'
  }
];

// Special considerations for diverse learners
const specialConsiderations = [
  { id: 'ell', label: 'English Language Learners', icon: Globe },
  { id: 'gifted', label: 'Gifted & Talented', icon: Zap },
  { id: 'special', label: 'Special Education', icon: Heart },
  { id: 'mixed', label: 'Mixed Abilities', icon: Brain }
];

export function StudentsStep({ data, updateField, error }: StepProps) {
  const [inputMode, setInputMode] = useState<'grade' | 'custom'>('grade');
  const [selectedConsiderations, setSelectedConsiderations] = useState<string[]>([]);
  const [showAdaptations, setShowAdaptations] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Get adaptations based on selected grade
  const adaptations = data.gradeLevel ? getStudentAdaptations(data.gradeLevel) : null;
  
  // Validate on change
  useEffect(() => {
    if (hasInteracted) {
      const result = wizardValidator.validateField('gradeLevel', data.gradeLevel);
      setValidationResult(result);
    }
  }, [data.gradeLevel, hasInteracted]);
  
  // Update custom students field with considerations
  useEffect(() => {
    if (selectedConsiderations.length > 0) {
      const considerationsText = selectedConsiderations.join(', ');
      updateField('customStudents', `Special considerations: ${considerationsText}`);
    }
  }, [selectedConsiderations]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Educational Context */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-purple-500/10 blur-3xl" />
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex p-4 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-6 shadow-xl shadow-violet-500/20">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Who Are Your Learners?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
              Understanding your students helps us create age-appropriate challenges and scaffolding
            </p>
            
            {/* Educational Note */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 rounded-full">
              <Lightbulb className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                We'll adapt complexity, pacing, and support based on your students
              </span>
            </div>
          </div>
        </div>
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

        {/* Enhanced Grade Range Selection */}
        <AnimatePresence mode="wait">
          {inputMode === 'grade' && (
            <motion.div
              key="grade-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradeRanges.map((range, index) => {
                  const isSelected = data.gradeLevel === range.label;
                  
                  return (
                    <motion.button
                      key={range.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + (index * 0.05) }}
                      onClick={() => {
                        updateField('gradeLevel', range.label);
                        setHasInteracted(true);
                        setShowAdaptations(true);
                      }}
                      className={`
                        relative p-5 rounded-2xl border-2 text-left transition-all duration-300 group overflow-hidden
                        hover:shadow-xl hover:-translate-y-1
                        ${isSelected
                          ? `border-${range.color}-500 bg-gradient-to-br from-${range.color}-50 to-${range.color}-100 dark:from-${range.color}-900/20 dark:to-${range.color}-800/20 shadow-lg` 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                    >
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${
                        isSelected ? `from-${range.color}-500/10 to-${range.color}-600/10` : 'from-violet-500/5 to-indigo-500/5'
                      }`} />
                      
                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute top-3 right-3 w-6 h-6 bg-${range.color}-500 rounded-full flex items-center justify-center shadow-lg`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                      
                      {/* Content */}
                      <div className="relative z-10">
                        {/* Icon and Age */}
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-2xl">{range.icon}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            isSelected 
                              ? `bg-${range.color}-100 text-${range.color}-700 dark:bg-${range.color}-900/30 dark:text-${range.color}-300` 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {range.ages}
                          </span>
                        </div>
                        
                        <div className={`font-bold text-lg mb-2 transition-colors ${
                          isSelected 
                            ? `text-${range.color}-900 dark:text-${range.color}-100` 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {range.label}
                        </div>
                        
                        <p className={`text-xs leading-relaxed ${
                          isSelected
                            ? `text-${range.color}-700 dark:text-${range.color}-300`
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {range.characteristics}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Special Considerations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      Special Considerations (Optional)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Select any that apply to your student group
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {specialConsiderations.map((consideration) => {
                    const IconComponent = consideration.icon;
                    const isSelected = selectedConsiderations.includes(consideration.id);
                    
                    return (
                      <motion.button
                        key={consideration.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setSelectedConsiderations(prev => 
                            isSelected 
                              ? prev.filter(id => id !== consideration.id)
                              : [...prev, consideration.id]
                          );
                        }}
                        className={`
                          p-3 rounded-xl border-2 transition-all flex items-center gap-2
                          ${isSelected
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-indigo-300'
                          }
                        `}
                      >
                        <IconComponent className={`w-4 h-4 ${
                          isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {consideration.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
              
              {/* Adaptations Preview */}
              <AnimatePresence>
                {showAdaptations && adaptations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      How we'll adapt for your students
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Characteristics:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{adaptations.characteristics}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Our adaptations:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{adaptations.adaptations}</p>
                      </div>
                      {adaptations.exampleProjects && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Example projects:</p>
                          <div className="flex flex-wrap gap-2">
                            {adaptations.exampleProjects.map((project: string) => (
                              <span key={project} className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
                                {project}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Custom Input */}
        <AnimatePresence mode="wait">
          {inputMode === 'custom' && (
            <motion.div
              key="custom-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 blur-2xl" />
                <div className="relative p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border-2 border-violet-200/50 dark:border-violet-700/50">
                  <label htmlFor="custom-grade" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    <Users className="inline-block w-6 h-6 mr-3" />
                    Describe your unique student group
                  </label>
                  
                  <textarea
                    id="custom-grade"
                    value={data.gradeLevel}
                    onChange={(e) => {
                      updateField('gradeLevel', e.target.value);
                      if (!hasInteracted) setHasInteracted(true);
                    }}
                    placeholder="e.g., Mixed-age 10-12 with diverse abilities, Advanced 8th grade STEM program, Adult learners returning to education..."
                    className="w-full px-6 py-4 rounded-2xl border-2 text-lg bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100 backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 border-gray-200 dark:border-gray-700 focus:border-violet-400 dark:focus:border-violet-500 resize-none"
                    rows={3}
                  />
                  
                  {/* Example prompts */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Consider including:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Age range & grade levels',
                        'Prior knowledge & skills',
                        'Learning differences',
                        'Language considerations',
                        'Available class time',
                        'Group size'
                      ].map(prompt => (
                        <div key={prompt} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle2 className="w-3 h-3 text-violet-500" />
                          <span>{prompt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-xl">
                    <p className="text-sm text-violet-700 dark:text-violet-300 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      The more details you provide, the better we can tailor activities, pacing, and support structures
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Validation feedback */}
        {validationResult && hasInteracted && !validationResult.isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  {validationResult.message}
                </p>
                {validationResult.suggestion && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    {validationResult.suggestion}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
          >
            <p className="text-sm text-red-700 dark:text-red-300">
              {error}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}