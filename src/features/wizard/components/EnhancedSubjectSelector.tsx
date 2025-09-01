/**
 * EnhancedSubjectSelector.tsx
 * 
 * Improved subject selection without confusing search
 * Shows 12 core subjects, expandable additional subjects, and interdisciplinary combinations
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Users,
  TreePine,
  Microscope,
  Zap,
  Briefcase
} from 'lucide-react';

interface EnhancedSubjectSelectorProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
  gradeLevel?: number;
  maxSelections?: number;
  className?: string;
}

// Core subjects (always visible) - 12 subjects
const CORE_SUBJECTS = [
  { name: 'Mathematics', icon: Calculator, color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { name: 'Science', icon: Beaker, color: 'from-green-400 to-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  { name: 'English Language Arts', icon: BookOpen, color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  { name: 'Social Studies', icon: Globe, color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  { name: 'Art', icon: Palette, color: 'from-pink-400 to-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20' },
  { name: 'Technology', icon: Code, color: 'from-cyan-400 to-cyan-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
  { name: 'Physical Education', icon: Dumbbell, color: 'from-red-400 to-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  { name: 'Health', icon: Heart, color: 'from-rose-400 to-rose-600', bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
  { name: 'Music', icon: Music, color: 'from-indigo-400 to-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { name: 'World Languages', icon: Languages, color: 'from-teal-400 to-teal-600', bgColor: 'bg-teal-50 dark:bg-teal-900/20' },
  { name: 'Theater', icon: Theater, color: 'from-violet-400 to-violet-600', bgColor: 'bg-violet-50 dark:bg-violet-900/20' },
  { name: 'Photography', icon: Camera, color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900/20' }
];

// Extended subjects (expandable)
const EXTENDED_SUBJECTS = [
  { name: 'Biology', icon: Microscope, color: 'from-green-500 to-green-700' },
  { name: 'Chemistry', icon: Beaker, color: 'from-blue-500 to-blue-700' },
  { name: 'Physics', icon: Zap, color: 'from-purple-500 to-purple-700' },
  { name: 'Environmental Science', icon: TreePine, color: 'from-emerald-500 to-emerald-700' },
  { name: 'Computer Science', icon: Code, color: 'from-slate-500 to-slate-700' },
  { name: 'Engineering', icon: Zap, color: 'from-orange-500 to-orange-700' },
  { name: 'Psychology', icon: Users, color: 'from-pink-500 to-pink-700' },
  { name: 'Economics', icon: Briefcase, color: 'from-amber-500 to-amber-700' },
  { name: 'Business', icon: Briefcase, color: 'from-gray-500 to-gray-700' },
  { name: 'Journalism', icon: BookOpen, color: 'from-red-500 to-red-700' },
  { name: 'Philosophy', icon: BookOpen, color: 'from-indigo-500 to-indigo-700' },
  { name: 'Sociology', icon: Users, color: 'from-cyan-500 to-cyan-700' },
  { name: 'Astronomy', icon: Sparkles, color: 'from-blue-600 to-blue-800' },
  { name: 'Geology', icon: Globe, color: 'from-brown-500 to-brown-700' },
  { name: 'Marine Science', icon: Globe, color: 'from-teal-500 to-teal-700' },
  { name: 'Statistics', icon: Calculator, color: 'from-gray-600 to-gray-800' }
];

// Interdisciplinary combinations
const INTERDISCIPLINARY_COMBOS = [
  { 
    name: 'STEM Foundation',
    subjects: ['Science', 'Technology', 'Engineering', 'Mathematics'],
    description: 'Integrated science and technology learning',
    color: 'from-blue-500 to-green-500',
    icon: Zap
  },
  {
    name: 'Digital Arts',
    subjects: ['Art', 'Technology', 'Photography'],
    description: 'Creative expression through digital media',
    color: 'from-pink-500 to-purple-500',
    icon: Palette
  },
  {
    name: 'Environmental Studies',
    subjects: ['Environmental Science', 'Biology', 'Social Studies'],
    description: 'Understanding human impact on nature',
    color: 'from-green-500 to-teal-500',
    icon: TreePine
  },
  {
    name: 'Humanities Core',
    subjects: ['English Language Arts', 'Social Studies', 'Art'],
    description: 'Literature, history, and creative expression',
    color: 'from-purple-500 to-orange-500',
    icon: BookOpen
  },
  {
    name: 'Health & Wellness',
    subjects: ['Physical Education', 'Health', 'Biology'],
    description: 'Physical fitness and life sciences',
    color: 'from-red-500 to-rose-500',
    icon: Heart
  },
  {
    name: 'Global Perspectives',
    subjects: ['World Languages', 'Social Studies', 'Art'],
    description: 'Cross-cultural understanding and expression',
    color: 'from-teal-500 to-indigo-500',
    icon: Globe
  }
];

export function EnhancedSubjectSelector({ 
  selectedSubjects, 
  onSubjectsChange, 
  gradeLevel = 6,
  maxSelections = 5,
  className = ''
}: EnhancedSubjectSelectorProps) {
  const [showExtended, setShowExtended] = useState(false);
  const [showCombos, setShowCombos] = useState(false);
  const [customSubject, setCustomSubject] = useState('');

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      onSubjectsChange(selectedSubjects.filter(s => s !== subject));
    } else if (selectedSubjects.length < maxSelections) {
      onSubjectsChange([...selectedSubjects, subject]);
    }
  };

  const selectCombination = (combo: typeof INTERDISCIPLINARY_COMBOS[0]) => {
    const newSubjects = combo.subjects.filter(s => !selectedSubjects.includes(s));
    const updatedSelection = [...selectedSubjects, ...newSubjects].slice(0, maxSelections);
    onSubjectsChange(updatedSelection);
  };

  const addCustomSubject = () => {
    if (customSubject.trim() && 
        !selectedSubjects.includes(customSubject.trim()) && 
        selectedSubjects.length < maxSelections) {
      onSubjectsChange([...selectedSubjects, customSubject.trim()]);
      setCustomSubject('');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected subjects display */}
      {selectedSubjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-gradient-to-br from-primary-50 to-ai-50 dark:from-primary-900/20 dark:to-ai-900/20 rounded-xl border border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300">
              Selected ({selectedSubjects.length}/{maxSelections})
            </p>
            {selectedSubjects.length > 1 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                ✓ Interdisciplinary
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map(subject => (
              <motion.span
                key={subject}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-700 rounded-full text-xs font-medium text-gray-900 dark:text-gray-100"
              >
                {subject}
                <button
                  onClick={() => toggleSubject(subject)}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Core subjects grid - Always visible */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
          Core Subjects
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {CORE_SUBJECTS.map(({ name, icon: Icon, color, bgColor }) => {
            const isSelected = selectedSubjects.includes(name);
            return (
              <motion.button
                key={name}
                onClick={() => toggleSubject(name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!isSelected && selectedSubjects.length >= maxSelections}
                className={`
                  relative p-3 transition-all duration-200 glass-squircle ${
                  isSelected
                    ? 'glass-border-selected'
                    : 'border border-gray-200 dark:border-gray-700'
                } ${!isSelected && selectedSubjects.length >= maxSelections ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 glass-squircle-icon bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs font-medium ${
                    isSelected 
                      ? 'text-primary-700 dark:text-primary-300' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {name}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center shadow-soft"
                  >
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Extended subjects (collapsible) */}
      <div>
        <button
          onClick={() => setShowExtended(!showExtended)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          Additional Subjects
          {showExtended ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        
        <AnimatePresence>
          {showExtended && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-3">
                {EXTENDED_SUBJECTS.map(({ name, icon: Icon, color }) => {
                  const isSelected = selectedSubjects.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleSubject(name)}
                      disabled={!isSelected && selectedSubjects.length >= maxSelections}
                      className={`
                        px-3 py-1.5 glass-squircle text-xs font-medium transition-all duration-200 flex items-center gap-1.5
                        ${isSelected
                          ? 'glass-border-selected text-primary-700 dark:text-primary-300'
                          : 'border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                        } ${!isSelected && selectedSubjects.length >= maxSelections ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <Icon className="w-3 h-3" />
                      {name}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interdisciplinary combinations */}
      <div>
        <button
          onClick={() => setShowCombos(!showCombos)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:text-ai-600 dark:hover:text-ai-400 transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          Interdisciplinary Combinations
          {showCombos ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        
        <AnimatePresence>
          {showCombos && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {INTERDISCIPLINARY_COMBOS.map(combo => {
                  const ComboIcon = combo.icon;
                  return (
                    <motion.button
                      key={combo.name}
                      onClick={() => selectCombination(combo)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={selectedSubjects.length >= maxSelections - 1}
                      className={`p-3 rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:border-ai-300 dark:hover:border-ai-600 transition-all text-left group ${
                        selectedSubjects.length >= maxSelections - 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded bg-gradient-to-br ${combo.color} flex items-center justify-center`}>
                            <ComboIcon className="w-3 h-3 text-white" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {combo.name}
                          </h4>
                        </div>
                        <Plus className="w-3 h-3 text-gray-400 group-hover:text-ai-500 transition-colors" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {combo.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {combo.subjects.map(s => (
                          <span 
                            key={s} 
                            className={`text-xs px-1.5 py-0.5 rounded-full ${
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
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom subject input */}
      <div>
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Add Custom Subject
        </label>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
            placeholder="Enter a custom subject..."
            disabled={selectedSubjects.length >= maxSelections}
            className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={addCustomSubject}
            disabled={!customSubject.trim() || selectedSubjects.length >= maxSelections}
            className="px-4 py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
