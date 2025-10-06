/**
 * FlexibleSubjectInput.tsx
 * 
 * Flexible subject selection with presets and custom input
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Hash, Sparkles } from 'lucide-react';

// Comprehensive subject categories
export const SUBJECT_CATEGORIES = {
  'Core Academic': [
    'Mathematics',
    'Science',
    'English Language Arts', 
    'Social Studies',
    'History',
    'Geography',
    'Physical Education',
    'Health'
  ],
  'STEM': [
    'Computer Science',
    'Engineering',
    'Physics',
    'Chemistry',
    'Biology',
    'Environmental Science',
    'Data Science',
    'Robotics'
  ],
  'Arts & Humanities': [
    'Visual Arts',
    'Music',
    'Theater',
    'Dance',
    'Creative Writing',
    'Literature',
    'Philosophy',
    'Psychology'
  ],
  'Modern & Specialized': [
    'Digital Media',
    'Game Design',
    'Entrepreneurship',
    'Financial Literacy',
    'Sustainability',
    'Global Studies',
    'Media Studies',
    'Design Thinking'
  ],
  'Languages': [
    'World Languages',
    'Spanish',
    'French',
    'Mandarin',
    'ESL/ELL',
    'Sign Language'
  ],
  'Interdisciplinary': [
    'STEAM',
    'Project-Based Learning',
    'Maker Space',
    'Innovation Lab',
    'Research Methods',
    'Cross-Curricular'
  ]
};

// Popular combinations
export const POPULAR_COMBINATIONS = [
  { name: 'STEAM', subjects: ['Science', 'Technology', 'Engineering', 'Arts', 'Mathematics'] },
  { name: 'Humanities & Tech', subjects: ['History', 'Technology', 'Digital Media'] },
  { name: 'Environmental Studies', subjects: ['Science', 'Social Studies', 'Sustainability'] },
  { name: 'Digital Arts', subjects: ['Visual Arts', 'Computer Science', 'Design'] }
];

interface FlexibleSubjectInputProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
  maxSelections?: number;
}

export const FlexibleSubjectInput: React.FC<FlexibleSubjectInputProps> = ({
  selectedSubjects,
  onSubjectsChange,
  maxSelections = 5
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddSubject = (subject: string) => {
    if (selectedSubjects.length < maxSelections && !selectedSubjects.includes(subject)) {
      onSubjectsChange([...selectedSubjects, subject]);
    }
  };

  const handleRemoveSubject = (subject: string) => {
    onSubjectsChange(selectedSubjects.filter(s => s !== subject));
  };

  const handleCustomSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customInput.trim()) {
      handleAddSubject(customInput.trim());
      setCustomInput('');
    }
  };

  const handleApplyCombination = (combination: typeof POPULAR_COMBINATIONS[0]) => {
    const newSubjects = [...new Set([...selectedSubjects, ...combination.subjects])];
    onSubjectsChange(newSubjects.slice(0, maxSelections));
  };

  return (
    <div className="space-y-4">
      {/* Selected Subjects Tags */}
      <AnimatePresence>
        {selectedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedSubjects.map((subject) => (
              <motion.div
                key={subject}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 
                         text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
              >
                <Hash className="w-3 h-3" />
                <span>{subject}</span>
                <button
                  onClick={() => handleRemoveSubject(subject)}
                  className="hover:text-primary-900 dark:hover:text-primary-100 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
            {selectedSubjects.length >= 2 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 
                         text-green-700 dark:text-green-300 rounded-full text-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Interdisciplinary</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomSubmit}
          placeholder={
            selectedSubjects.length >= maxSelections
              ? `Maximum ${maxSelections} subjects selected`
              : "Type a subject or click categories below..."
          }
          disabled={selectedSubjects.length >= maxSelections}
          className="w-full px-4 py-3 pr-32 border-2 border-gray-200 dark:border-gray-600 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                   rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   transition-all duration-200 disabled:opacity-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {customInput && (
            <button
              onClick={() => {
                handleAddSubject(customInput.trim());
                setCustomInput('');
              }}
              className="px-3 py-1 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
            >
              Add
            </button>
          )}
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 
                     text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Browse
          </button>
        </div>
      </div>

      {/* Quick Combinations */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Popular Combinations
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_COMBINATIONS.map((combo) => (
            <button
              key={combo.name}
              onClick={() => handleApplyCombination(combo)}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 
                       dark:from-purple-900/30 dark:to-pink-900/30
                       text-purple-700 dark:text-purple-300 
                       rounded-lg text-sm font-medium hover:shadow-md transition-all"
            >
              {combo.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Browser */}
      {showCategories && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          {Object.entries(SUBJECT_CATEGORIES).map(([category, subjects]) => (
            <div key={category}>
              <button
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 hover:text-primary-600 dark:hover:text-primary-400"
              >
                {category} {activeCategory === category ? '−' : '+'}
              </button>
              {activeCategory === category && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-2 mt-2"
                >
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => handleAddSubject(subject)}
                      disabled={selectedSubjects.includes(subject) || selectedSubjects.length >= maxSelections}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm transition-all
                        ${selectedSubjects.includes(subject)
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${selectedSubjects.length >= maxSelections && !selectedSubjects.includes(subject) ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {selectedSubjects.includes(subject) && '✓ '}
                      {subject}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {selectedSubjects.length === 0 && "Select subjects or enter your own. Multiple selections create interdisciplinary projects."}
        {selectedSubjects.length === 1 && "Add more subjects for an interdisciplinary approach."}
        {selectedSubjects.length >= 2 && `Great! You've selected ${selectedSubjects.length} subjects for an interdisciplinary project.`}
      </p>
    </div>
  );
};