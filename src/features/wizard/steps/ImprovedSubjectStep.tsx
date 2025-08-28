import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { 
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Palette,
  Music,
  Code,
  Heart,
  Dumbbell,
  Languages,
  Theater,
  Camera,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  X
} from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

// Core subjects (always visible)
const coreSubjects = [
  { name: 'Mathematics', icon: Calculator, color: 'from-blue-400 to-blue-600' },
  { name: 'Science', icon: Beaker, color: 'from-green-400 to-green-600' },
  { name: 'English Language Arts', icon: BookOpen, color: 'from-purple-400 to-purple-600' },
  { name: 'Social Studies', icon: Globe, color: 'from-orange-400 to-orange-600' },
  { name: 'Art', icon: Palette, color: 'from-pink-400 to-pink-600' },
  { name: 'Technology', icon: Code, color: 'from-cyan-400 to-cyan-600' },
  { name: 'Physical Education', icon: Dumbbell, color: 'from-red-400 to-red-600' },
  { name: 'Health', icon: Heart, color: 'from-rose-400 to-rose-600' },
  { name: 'Music', icon: Music, color: 'from-indigo-400 to-indigo-600' },
  { name: 'World Languages', icon: Languages, color: 'from-teal-400 to-teal-600' },
  { name: 'Theater', icon: Theater, color: 'from-violet-400 to-violet-600' },
  { name: 'Photography', icon: Camera, color: 'from-gray-400 to-gray-600' }
];

// Extended subjects (expandable)
const extendedSubjects = [
  'Biology', 'Chemistry', 'Physics', 'Environmental Science',
  'Computer Science', 'Engineering', 'Psychology', 'Economics',
  'Business', 'Journalism', 'Philosophy', 'Sociology',
  'Astronomy', 'Geology', 'Marine Science', 'Statistics'
];

// Interdisciplinary combinations
const interdisciplinaryCombos = [
  { 
    name: 'STEM Foundation',
    subjects: ['Science', 'Technology', 'Engineering', 'Mathematics'],
    description: 'Integrated science and technology learning',
    color: 'from-blue-500 to-green-500'
  },
  {
    name: 'Digital Arts',
    subjects: ['Art', 'Technology', 'Photography'],
    description: 'Creative expression through digital media',
    color: 'from-pink-500 to-purple-500'
  },
  {
    name: 'Environmental Studies',
    subjects: ['Environmental Science', 'Biology', 'Social Studies'],
    description: 'Understanding human impact on nature',
    color: 'from-green-500 to-teal-500'
  },
  {
    name: 'Humanities Core',
    subjects: ['English Language Arts', 'Social Studies', 'Art'],
    description: 'Literature, history, and creative expression',
    color: 'from-purple-500 to-orange-500'
  },
  {
    name: 'Health & Wellness',
    subjects: ['Physical Education', 'Health', 'Biology'],
    description: 'Physical fitness and life sciences',
    color: 'from-red-500 to-rose-500'
  },
  {
    name: 'Global Perspectives',
    subjects: ['World Languages', 'Social Studies', 'Art'],
    description: 'Cross-cultural understanding and expression',
    color: 'from-teal-500 to-indigo-500'
  }
];

export function ImprovedSubjectStep({ data, updateField, error }: StepProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    data.subject ? data.subject.split(', ').filter(s => s.trim()) : []
  );
  const [customSubject, setCustomSubject] = useState('');
  const [showExtended, setShowExtended] = useState(false);
  const [showCombos, setShowCombos] = useState(false);

  const toggleSubject = (subject: string) => {
    const newSelection = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    
    setSelectedSubjects(newSelection);
    updateField('subject', newSelection.join(', '));
  };

  const selectCombination = (combo: typeof interdisciplinaryCombos[0]) => {
    // Add all subjects from the combination that aren't already selected
    const newSubjects = combo.subjects.filter(s => !selectedSubjects.includes(s));
    const newSelection = [...selectedSubjects, ...newSubjects];
    
    setSelectedSubjects(newSelection);
    updateField('subject', newSelection.join(', '));
  };

  const addCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      const newSelection = [...selectedSubjects, customSubject.trim()];
      setSelectedSubjects(newSelection);
      updateField('subject', newSelection.join(', '));
      setCustomSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    const newSelection = selectedSubjects.filter(s => s !== subject);
    setSelectedSubjects(newSelection);
    updateField('subject', newSelection.join(', '));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-4">
        <div className="inline-flex p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          What subject(s) are you teaching?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select one or more subjects. Interdisciplinary projects create deeper learning!
        </p>
      </div>

      {/* Selected subjects display */}
      {selectedSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-primary-50 to-ai-50 dark:from-primary-900/20 dark:to-ai-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
        >
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mb-3">
            Selected subjects ({selectedSubjects.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map(subject => (
              <motion.span
                key={subject}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 rounded-full text-sm font-medium text-gray-900 dark:text-gray-100"
              >
                {subject}
                <button
                  onClick={() => removeSubject(subject)}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Core subjects grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Core Subjects
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {coreSubjects.map(({ name, icon: Icon, color }) => (
            <motion.button
              key={name}
              onClick={() => toggleSubject(name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200
                ${selectedSubjects.includes(name)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2 mx-auto`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                selectedSubjects.includes(name) 
                  ? 'text-primary-700 dark:text-primary-300' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {name}
              </span>
              {selectedSubjects.includes(name) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Extended subjects (collapsible) */}
      <div className="space-y-3">
        <button
          onClick={() => setShowExtended(!showExtended)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          Additional Subjects
          {showExtended ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {showExtended && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-2">
                {extendedSubjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`
                      px-4 py-2 rounded-lg border transition-all duration-200
                      ${selectedSubjects.includes(subject)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interdisciplinary combinations */}
      <div className="space-y-3">
        <button
          onClick={() => setShowCombos(!showCombos)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-ai-600 dark:hover:text-ai-400 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          Interdisciplinary Combinations
          {showCombos ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <AnimatePresence>
          {showCombos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {interdisciplinaryCombos.map(combo => (
                  <motion.button
                    key={combo.name}
                    onClick={() => selectCombination(combo)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:border-ai-300 dark:hover:border-ai-600 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${combo.color}`}>
                        {combo.name}
                      </h4>
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-ai-500 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {combo.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {combo.subjects.map(s => (
                        <span 
                          key={s} 
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            selectedSubjects.includes(s)
                              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom subject input */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Add Custom Subject
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
            placeholder="Enter a custom subject..."
            className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          <button
            onClick={addCustomSubject}
            disabled={!customSubject.trim()}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}
    </div>
  );
}