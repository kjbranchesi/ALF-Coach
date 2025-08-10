import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData, DURATION_LABELS } from '../wizardSchema';
import { Clock, BookOpen, Calendar, Zap, Target, Sparkles, Plus, Info, CheckCircle2, Beaker, Cpu, Palette, Calculator, Globe } from 'lucide-react';
import { getSubjectCombinations, getTimelineExamples } from '../wizardExamples';
import { wizardValidator } from '../wizardValidation';

interface SubjectScopeStepProps {
  data: WizardData;
  updateField: (field: keyof WizardData, value: any) => void;
  error?: string;
}

// STEAM-focused subject categories with icons
const subjectCategories = [
  { id: 'science', label: 'Science', icon: Beaker, color: 'emerald' },
  { id: 'tech', label: 'Technology', icon: Cpu, color: 'blue' },
  { id: 'engineering', label: 'Engineering', icon: Target, color: 'orange' },
  { id: 'arts', label: 'Arts', icon: Palette, color: 'purple' },
  { id: 'math', label: 'Mathematics', icon: Calculator, color: 'indigo' }
];

// Forward-thinking STEAM subjects for competition
const steamSubjects = {
  science: [
    'Environmental Science & Climate Solutions',
    'Biotechnology & Genetic Engineering',
    'Neuroscience & Brain-Computer Interfaces',
    'Quantum Computing Applications',
    'Astrobiology & Space Exploration',
    'Nanotechnology & Materials Science'
  ],
  tech: [
    'Artificial Intelligence & Machine Learning',
    'Robotics & Automation',
    'Virtual/Augmented Reality',
    'Blockchain & Cryptography',
    'Internet of Things (IoT)',
    'Cybersecurity & Digital Privacy'
  ],
  engineering: [
    'Sustainable Engineering & Green Tech',
    'Biomedical Engineering',
    'Aerospace Engineering',
    'Clean Energy Systems',
    'Smart Cities & Infrastructure',
    '3D Printing & Advanced Manufacturing'
  ],
  arts: [
    'Digital Media & Interactive Design',
    'Data Visualization & Infographics',
    'Game Design & Development',
    'Creative Coding & Generative Art',
    'Sound Engineering & Music Technology',
    'Scientific Illustration & Medical Art'
  ],
  math: [
    'Applied Mathematics & Modeling',
    'Statistics & Data Science',
    'Mathematical Biology',
    'Cryptography & Security',
    'Computational Mathematics',
    'Financial Mathematics & FinTech'
  ]
};

const durationDetails = {
  short: {
    icon: Zap,
    title: 'Sprint Project',
    timeframe: '2-3 weeks',
    description: 'Quick exploration or prototype',
    features: ['Focused scope', 'Rapid iteration', 'Quick wins'],
    color: 'green'
  },
  medium: {
    icon: Target,
    title: 'Deep Dive',
    timeframe: '4-8 weeks', 
    description: 'Comprehensive investigation',
    features: ['Multiple phases', 'Rich research', 'Polished outcomes'],
    color: 'blue'
  },
  long: {
    icon: Calendar,
    title: 'Semester Journey',
    timeframe: 'Full semester',
    description: 'Extensive, multi-faceted project',
    features: ['Complex challenges', 'Real partnerships', 'Professional outcomes'],
    color: 'purple'
  }
};

export function SubjectScopeStep({ data, updateField, error }: SubjectScopeStepProps) {
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSTEAMCombos, setShowSTEAMCombos] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  // Get all subjects for filtering
  const allSubjects = Object.values(steamSubjects).flat();
  const filteredSubjects = allSubjects.filter(subject =>
    subject.toLowerCase().includes(data.subject.toLowerCase())
  ).slice(0, 8);
  
  // Get STEAM combinations based on input
  const steamCombinations = data.subject ? getSubjectCombinations(data.subject) : [];
  
  // Validate on change
  useEffect(() => {
    if (hasInteracted) {
      const subjectResult = wizardValidator.validateField('subject', data.subject);
      const timelineResult = wizardValidator.validateField('timeline', data.duration);
      setValidationResult({ subject: subjectResult, timeline: timelineResult });
    }
  }, [data.subject, data.duration, hasInteracted]);

  return (
    <div className="space-y-8">
      {/* Enhanced Header with STEAM Focus */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 blur-3xl" />
          <div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="inline-flex p-4 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl mb-6 shadow-xl shadow-emerald-500/20">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4">
              Subject & Timeline
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6">
              Choose your STEAM focus area and project duration
            </p>
            
            {/* STEAM Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Forward-Thinking STEAM Education
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {/* Enhanced Subject Area with STEAM Categories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <label htmlFor="subject" className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                STEAM Subject Area
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a category or type your subject
              </p>
            </div>
            {validationResult?.subject && hasInteracted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  validationResult.subject.isValid
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}
              >
                {validationResult.subject.isValid ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
                <span>{validationResult.subject.message}</span>
              </motion.div>
            )}
          </div>
          
          {/* STEAM Category Selector */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {subjectCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.id;
              
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : category.id)}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all
                    ${isSelected
                      ? `border-${category.color}-500 bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 dark:from-${category.color}-900/20 dark:to-${category.color}-800/20`
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 ${
                    isSelected
                      ? `text-${category.color}-600 dark:text-${category.color}-400`
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span className={`text-xs font-medium ${
                    isSelected
                      ? `text-${category.color}-700 dark:text-${category.color}-300`
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {category.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -top-2 -right-2 w-6 h-6 bg-${category.color}-500 rounded-full flex items-center justify-center`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          <div className="relative">
            <div className="relative">
              <input
                id="subject"
                type="text"
                value={data.subject}
                onChange={(e) => {
                  updateField('subject', e.target.value);
                  setShowSubjectSuggestions(e.target.value.length > 0);
                  if (!hasInteracted) setHasInteracted(true);
                }}
                onFocus={() => {
                  setSubjectFocused(true);
                  setShowSubjectSuggestions(true);
                  if (!hasInteracted) setHasInteracted(true);
                }}
                onBlur={() => {
                  setSubjectFocused(false);
                  // Delay hiding suggestions to allow for clicks
                  setTimeout(() => setShowSubjectSuggestions(false), 200);
                }}
                placeholder="e.g., AI & Machine Learning, Bioengineering, Climate Solutions..."
                className={`
                  w-full px-6 py-4 rounded-2xl border-2 text-lg
                  bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100
                  backdrop-blur-sm shadow-sm hover:shadow-md focus:shadow-xl
                  focus:outline-none focus:ring-4 focus:ring-emerald-500/10
                  transition-all duration-300
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  ${subjectFocused ? 'transform scale-[1.01]' : ''}
                  ${validationResult?.subject && !validationResult.subject.isValid && hasInteracted
                    ? 'border-red-300 dark:border-red-600'
                    : validationResult?.subject?.isValid && hasInteracted
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-gray-200 dark:border-gray-700 focus:border-emerald-400'
                  }
                `}
              />
              
              {/* STEAM Combination Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSTEAMCombos(!showSTEAMCombos)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl transition-all"
                title="Combine subjects for STEAM"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Enhanced Subject Suggestions with Categories */}
            <AnimatePresence>
              {showSubjectSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-64 overflow-y-auto"
                >
                  {selectedCategory !== 'all' ? (
                    // Show subjects from selected category
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {subjectCategories.find(c => c.id === selectedCategory)?.label} Subjects
                      </p>
                      {steamSubjects[selectedCategory as keyof typeof steamSubjects].map((subject) => (
                        <button
                          key={subject}
                          onMouseDown={() => {
                            updateField('subject', subject);
                            setShowSubjectSuggestions(false);
                            setHasInteracted(true);
                          }}
                          className="w-full px-4 py-3 text-left rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all group"
                        >
                          <span className="text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
                            {subject}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Show filtered subjects or all if no filter
                    <div className="p-2">
                      {filteredSubjects.length > 0 ? (
                        <>
                          <p className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Suggested Subjects
                          </p>
                          {filteredSubjects.map((subject) => (
                            <button
                              key={subject}
                              onMouseDown={() => {
                                updateField('subject', subject);
                                setShowSubjectSuggestions(false);
                                setHasInteracted(true);
                              }}
                              className="w-full px-4 py-3 text-left rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all group"
                            >
                              <span className="text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
                                {subject}
                              </span>
                            </button>
                          ))}
                        </>
                      ) : (
                        <p className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          Type to search or select a category above
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* STEAM Combinations Panel */}
          <AnimatePresence>
            {showSTEAMCombos && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800"
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Suggested STEAM Combinations
                </h4>
                {steamCombinations.length > 0 ? (
                  <div className="space-y-2">
                    {steamCombinations.map((combo, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          updateField('subject', `${combo.primary} & ${combo.secondary}`);
                          setShowSTEAMCombos(false);
                        }}
                        className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all group"
                      >
                        <div className="font-medium text-indigo-600 dark:text-indigo-400 mb-1">
                          {combo.primary} + {combo.secondary}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {combo.projectIdea}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updateField('subject', 'AI & Creative Arts')}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all text-left"
                    >
                      <div className="font-medium text-indigo-600 dark:text-indigo-400 text-sm mb-1">
                        AI + Arts
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Generative art & creative AI
                      </div>
                    </button>
                    <button
                      onClick={() => updateField('subject', 'Bioengineering & Design')}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all text-left"
                    >
                      <div className="font-medium text-indigo-600 dark:text-indigo-400 text-sm mb-1">
                        Bio + Design
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Biomimicry solutions
                      </div>
                    </button>
                    <button
                      onClick={() => updateField('subject', 'Data Science & Storytelling')}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all text-left"
                    >
                      <div className="font-medium text-indigo-600 dark:text-indigo-400 text-sm mb-1">
                        Data + Story
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Visual data narratives
                      </div>
                    </button>
                    <button
                      onClick={() => updateField('subject', 'Robotics & Music')}
                      className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-md transition-all text-left"
                    >
                      <div className="font-medium text-indigo-600 dark:text-indigo-400 text-sm mb-1">
                        Robotics + Music
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Musical robots & synthesis
                      </div>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Project Duration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                How much time do you have for this project?
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(durationDetails) as Array<keyof typeof durationDetails>).map((duration, index) => {
              const detail = durationDetails[duration];
              const IconComponent = detail.icon;
              const isSelected = data.duration === duration;
              
              return (
                <motion.button
                  key={duration}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  onClick={() => updateField('duration', duration)}
                  className={`
                    relative p-6 rounded-2xl border-2 text-left transition-all duration-200 
                    hover:shadow-lg hover:-translate-y-1 group
                    ${isSelected
                      ? `border-${detail.color}-500 bg-${detail.color}-50 dark:bg-${detail.color}-900/20 shadow-md` 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className={`absolute top-4 right-4 w-6 h-6 bg-${detail.color}-500 rounded-full flex items-center justify-center`}>
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      isSelected 
                        ? `bg-${detail.color}-100 dark:bg-${detail.color}-900/30` 
                        : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                    } transition-colors`}>
                      <IconComponent className={`w-8 h-8 ${
                        isSelected 
                          ? `text-${detail.color}-600 dark:text-${detail.color}-400` 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-2 ${
                        isSelected 
                          ? `text-${detail.color}-900 dark:text-${detail.color}-100` 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {detail.title}
                      </h4>
                      
                      <p className={`font-semibold text-sm mb-2 ${
                        isSelected 
                          ? `text-${detail.color}-700 dark:text-${detail.color}-300` 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {detail.timeframe}
                      </p>
                      
                      <p className={`text-sm mb-4 ${
                        isSelected 
                          ? `text-${detail.color}-600 dark:text-${detail.color}-400` 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {detail.description}
                      </p>
                      
                      <div className="space-y-2">
                        {detail.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isSelected 
                                ? `bg-${detail.color}-500` 
                                : 'bg-gray-400'
                            }`} />
                            <span className={`text-xs ${
                              isSelected 
                                ? `text-${detail.color}-700 dark:text-${detail.color}-300` 
                                : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}