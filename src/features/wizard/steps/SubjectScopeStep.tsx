import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WizardData, DURATION_LABELS } from '../wizardSchema';
import { Clock, BookOpen, CheckCircle2, Info } from 'lucide-react';
import { wizardValidator } from '../wizardValidation';
import { IntelligentSubjectSelector } from '../components/IntelligentSubjectSelector';
import { ProjectPreviewGenerator } from '../components/ProjectPreviewGenerator';

interface SubjectScopeStepProps {
  data: WizardData;
  updateField: (field: keyof WizardData, value: any) => void;
  error?: string;
}

// Duration details for project timeline
const durationDetails = {
  'short': {
    label: 'Short',
    description: '2-3 weeks',
    details: 'Mini-projects, skill builders',
    icon: Clock,
    color: 'blue',
    examples: ['Design Sprint', 'Quick Prototype', 'Data Collection']
  },
  'medium': {
    label: 'Medium', 
    description: '4-8 weeks',
    details: 'Standard PBL units',
    icon: Clock,
    color: 'emerald',
    examples: ['Research Project', 'Community Solution', 'Product Development']
  },
  'long': {
    label: 'Long',
    description: 'Semester',
    details: 'Comprehensive, multi-phase projects',
    icon: Clock,
    color: 'purple',
    examples: ['Innovation Challenge', 'Social Enterprise', 'Scientific Study']
  }
};

export function SubjectScopeStep({ data, updateField, error }: SubjectScopeStepProps) {
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showProjectPreviews, setShowProjectPreviews] = useState(false);
  
  // Parse grade level for the intelligent selector
  const gradeLevel = data.gradeLevel ? 
    (data.gradeLevel.includes('-') ? 
      parseInt(data.gradeLevel.split('-')[0]) : 
      parseInt(data.gradeLevel)) 
    : 7;

  useEffect(() => {
    if (data && hasInteracted) {
      const result = wizardValidator.validateStep('subjectScope', data);
      setValidationResult(result);
    }
  }, [data, hasInteracted]);

  const handleSubjectsChange = (subjects: string[]) => {
    updateField('subjects', subjects);
    if (subjects.length > 0 && !data.primarySubject) {
      updateField('primarySubject', subjects[0]);
    }
    setShowProjectPreviews(subjects.length >= 2);
    if (!hasInteracted) setHasInteracted(true);
  };

  const handleContextSelect = (contextId: string) => {
    updateField('problemContext', contextId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
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
              Design Your Project
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Start with real-world problems to create meaningful interdisciplinary connections
            </p>
          </div>
        </div>
      </motion.div>

      <div className="space-y-8">
        {/* Intelligent Subject Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <IntelligentSubjectSelector
            selectedSubjects={data.subjects || []}
            onSubjectsChange={handleSubjectsChange}
            gradeLevel={gradeLevel}
            onContextSelect={handleContextSelect}
            maxSubjects={5}
          />
        </motion.div>

        {/* Project Duration Selection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Project Duration
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                How long will students work on this project?
              </p>
            </div>
            {validationResult?.duration && hasInteracted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  validationResult.duration.isValid
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}
              >
                {validationResult.duration.isValid ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Info className="w-4 h-4" />
                )}
                <span>{validationResult.duration.message}</span>
              </motion.div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(durationDetails).map(([duration, detail], index) => {
              const isSelected = data.duration === duration;
              const IconComponent = detail.icon;
              
              return (
                <motion.button
                  key={duration}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  onClick={() => {
                    updateField('duration', duration);
                    if (!hasInteracted) setHasInteracted(true);
                  }}
                  className={`
                    relative glass-squircle card-pad-lg anim-ease border text-left 
                    hover:shadow-lg hover:-translate-y-1 group
                    ${isSelected ? 'glass-border-selected' : 'border-gray-200 dark:border-gray-700'}
                  `}
                >
                  {isSelected && (
                    <div className={`absolute top-4 right-4 w-6 h-6 bg-${detail.color}-500 rounded-full flex items-center justify-center`}>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className={`p-3 glass-squircle transition-colors ${isSelected ? '' : ''}`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected 
                          ? `text-${detail.color}-600 dark:text-${detail.color}-400` 
                          : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${
                        isSelected 
                          ? `text-${detail.color}-700 dark:text-${detail.color}-300` 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {detail.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {detail.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                        {detail.details}
                      </p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Example projects:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {detail.examples.map((example, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 rounded-full text-gray-600 dark:text-gray-400"
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Project Preview Generator */}
        {showProjectPreviews && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ProjectPreviewGenerator
              selectedSubjects={data.subjects || []}
              problemContext={data.problemContext}
              gradeLevel={gradeLevel}
              onSelectProject={(project) => {
                // Could store selected project template for later use
                console.log('Selected project template:', project);
              }}
            />
          </motion.div>
        )}

        {/* Special Requirements (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
            Special Requirements
            <span className="text-sm font-normal text-gray-500 ml-2">(optional)</span>
          </label>
          <textarea
            value={data.specialRequirements || ''}
            onChange={(e) => updateField('specialRequirements', e.target.value)}
            placeholder="Any specific materials, constraints, or requirements? (e.g., limited budget, no field trips, specific standards to address)"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 
                     bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100
                     placeholder:text-gray-400 dark:placeholder:text-gray-500
                     focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400
                     transition-all duration-200 resize-none"
            rows={3}
          />
        </motion.div>
      </div>

      {/* Validation Summary */}
      {error && hasInteracted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 glass-squircle border border-red-200 dark:border-red-800"
        >
          <p className="text-red-700 dark:text-red-300 text-sm">
            {error}
          </p>
        </motion.div>
      )}
    </div>
  );
}
