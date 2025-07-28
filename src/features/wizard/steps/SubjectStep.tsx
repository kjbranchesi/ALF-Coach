import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type WizardData } from '../wizardSchema';
import { 
  Beaker,
  Calculator,
  BookOpen,
  Building,
  Palette,
  Wrench,
  Globe,
  Music,
  Lightbulb
} from 'lucide-react';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

// Subject icons mapping
const getSubjectIcon = (subject: string) => {
  const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
    'Science': Beaker,
    'Mathematics': Calculator,
    'English': BookOpen,
    'History': Building,
    'Art': Palette,
    'Technology': Wrench,
    'Physical Education': Globe,
    'Music': Music
  };
  
  const Icon = iconMap[subject];
  return Icon || BookOpen;
};

const popularSubjects = [
  'Science',
  'Mathematics', 
  'English',
  'History',
  'Art',
  'Technology',
  'Physical Education',
  'Music'
];

export function SubjectStep({ data, updateField, error }: StepProps) {
  // Parse existing subjects from comma-separated string
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    data.subject ? data.subject.split(', ').filter(s => s.trim()) : []
  );
  const [customSubject, setCustomSubject] = useState('');

  const toggleSubject = (subject: string) => {
    const newSelection = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject];
    
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6">
        <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          What subject(s) are you teaching?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select one or more subjects for your learning experience. 
          Interdisciplinary projects are encouraged!
        </p>
      </div>

      <div className="space-y-6">
        {/* Selected subjects display */}
        {selectedSubjects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800"
          >
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">Selected subjects:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700"
                >
                  {subject}
                  <button
                    onClick={() => { toggleSubject(subject); }}
                    className="hover:text-indigo-900 dark:hover:text-indigo-200"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Subject grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularSubjects.map((subject, index) => {
            const isSelected = selectedSubjects.includes(subject);
            return (
              <motion.button
                key={subject}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => { toggleSubject(subject); }}
                className={`
                  p-4 soft-card soft-rounded soft-transition
                  hover:shadow-soft-lg hover:lift
                  ${isSelected
                    ? 'ring-2 ring-indigo-400 dark:ring-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'dark:bg-gray-800 dark:text-gray-300'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}>
                    {React.createElement(getSubjectIcon(subject), { className: 'w-8 h-8' })}
                  </div>
                  <div className="text-sm font-semibold">{subject}</div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Custom subject input */}
        <div>
          <div className="relative flex items-center justify-center mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative bg-white dark:bg-slate-900 px-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">or add custom subject</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customSubject}
              onChange={(e) => { setCustomSubject(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
              placeholder="e.g., Environmental Science, Creative Writing"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 focus:shadow-md
                transition-all duration-200"
            />
            <button
              onClick={addCustomSubject}
              disabled={!customSubject.trim()}
              className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-medium
                hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed
                transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Add
            </button>
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}

        {/* Info box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Interdisciplinary projects
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Combining subjects creates rich learning experiences. For example, 
                "Science & Art" for scientific illustration or "History & Technology" 
                for digital storytelling.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}