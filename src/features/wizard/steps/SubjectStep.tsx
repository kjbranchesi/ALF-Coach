import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { 
  BookOpenIcon,
  IdeaIcon,
  DocumentIcon,
  ToolsIcon 
} from '../../../components/icons/ModernIcons';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

// Subject icons mapping
const getSubjectIcon = (subject: string) => {
  const iconMap: Record<string, React.ComponentType<{className?: string}>> = {
    'Science': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    'Mathematics': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    'English': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    'History': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'Art': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    'Technology': ToolsIcon,
    'Physical Education': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'Music': () => (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    )
  };
  
  const Icon = iconMap[subject];
  return Icon ? <Icon /> : <BookOpenIcon className="w-6 h-6" />;
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
        <div className="inline-flex p-3 bg-indigo-50 rounded-full mb-4">
          <BookOpenIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          What subject(s) are you teaching?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
            className="p-4 bg-indigo-50 rounded-xl border border-indigo-200"
          >
            <p className="text-sm font-medium text-indigo-700 mb-2">Selected subjects:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <span
                  key={subject}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-700 border border-indigo-300"
                >
                  {subject}
                  <button
                    onClick={() => toggleSubject(subject)}
                    className="hover:text-indigo-900"
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
                onClick={() => toggleSubject(subject)}
                className={`
                  p-4 rounded-xl border transition-all duration-200
                  hover:shadow-lg hover:-translate-y-1
                  ${isSelected
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700 shadow-md'
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={isSelected ? 'text-indigo-600' : 'text-gray-500'}>
                    {getSubjectIcon(subject)}
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
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative bg-white px-4">
              <span className="text-sm text-gray-500">or add custom subject</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomSubject()}
              placeholder="e.g., Environmental Science, Creative Writing"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:shadow-md
                transition-all duration-200"
            />
            <button
              onClick={addCustomSubject}
              disabled={!customSubject.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium
                hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed
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
          className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-100"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <IdeaIcon className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Interdisciplinary projects
              </h4>
              <p className="text-sm text-gray-600">
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