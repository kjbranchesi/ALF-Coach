import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb } from 'lucide-react';
import { type WizardData } from '../wizardSchema';
import { ProgressiveSubjectSelector } from '../components/ProgressiveSubjectSelector';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

export function EnhancedSubjectStep({ data, updateField, error }: StepProps) {
  // Parse existing subjects from comma-separated string
  const selectedSubjects = data.subject ? data.subject.split(', ').filter(s => s.trim()) : [];
  
  // Determine grade level for progressive disclosure
  const gradeLevel = data.age ? Math.min(Math.max(data.age - 5, 1), 12) : 6;

  const handleSubjectsChange = (subjects: string[]) => {
    updateField('subject', subjects.join(', '));
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
          Interdisciplinary projects create the most engaging learning opportunities!
        </p>
      </div>

      {/* Progressive Subject Selector */}
      <ProgressiveSubjectSelector
        selectedSubjects={selectedSubjects}
        onSubjectsChange={handleSubjectsChange}
        gradeLevel={gradeLevel}
        maxSelections={5}
      />

      {/* Error Display */}
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm flex items-center gap-1 justify-center"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}

      {/* Educational Benefits Info */}
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
              Why interdisciplinary projects work
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Combining subjects mirrors real-world problem solving, increases student engagement, 
              and develops critical thinking skills. Students see connections between disciplines 
              and understand how knowledge applies beyond the classroom.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                Deeper learning
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                Real-world relevance
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                Student engagement
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}