/**
 * WizardFlow.tsx - Initial setup wizard for ALF Coach
 * Collects: Grade level, Subject, Duration, ALF Stage focus
 */

import React from 'react';
import { type WizardData } from '../../../core/types/SOPTypes';

interface WizardFlowProps {
  onComplete: (data: WizardData) => void;
  initialData?: Partial<WizardData>;
}

type WizardStep = 'grade' | 'subject' | 'duration' | 'focus' | 'confirm';

const GRADE_LEVELS = [
  'Elementary (K-2)',
  'Elementary (3-5)', 
  'Middle School (6-8)',
  'High School (9-12)',
  'College/University'
];

const SUBJECTS = [
  'English/Language Arts',
  'Mathematics',
  'Science',
  'Social Studies/History',
  'Art/Music',
  'Physical Education',
  'Technology/Computer Science',
  'World Languages',
  'Other'
];

const DURATIONS = [
  '1-2 weeks',
  '3-4 weeks',
  '5-6 weeks',
  '7-8 weeks',
  'Full semester'
];

const ALF_FOCUSES = [
  { value: 'catalyst', label: 'Catalyst', description: 'Focus on identifying problems and opportunities' },
  { value: 'issues', label: 'Issues', description: 'Deep dive into specific challenges' },
  { value: 'method', label: 'Method', description: 'Emphasize solution approaches' },
  { value: 'engagement', label: 'Engagement', description: 'Prioritize student involvement' },
  { value: 'balanced', label: 'Balanced', description: 'Equal focus on all ALF stages' }
];

export const WizardFlow: React.FC<WizardFlowProps> = ({ 
  onComplete, 
  initialData = {} 
}) => {
  const [currentStep, setCurrentStep] = React.useState<WizardStep>('grade');
  const [data, setData] = React.useState<Partial<WizardData>>(initialData);

  const handleNext = () => {
    const steps: WizardStep[] = ['grade', 'subject', 'duration', 'focus', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: WizardStep[] = ['grade', 'subject', 'duration', 'focus', 'confirm'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = () => {
    console.log('Wizard complete button clicked', data);
    if (data.gradeLevel && data.subject && data.duration && data.alfFocus) {
      console.log('All data present, calling onComplete');
      onComplete(data as WizardData);
    } else {
      console.error('Missing required data:', {
        gradeLevel: data.gradeLevel,
        subject: data.subject,
        duration: data.duration,
        alfFocus: data.alfFocus
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'grade':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What grade level are you teaching?</h3>
            <div className="space-y-2">
              {GRADE_LEVELS.map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setData({ ...data, gradeLevel: grade });
                    handleNext();
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    data.gradeLevel === grade 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        );

      case 'subject':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What subject area?</h3>
            <div className="space-y-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => {
                    setData({ ...data, subject });
                    handleNext();
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    data.subject === subject 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>
        );

      case 'duration':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How long will this project run?</h3>
            <div className="space-y-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration}
                  onClick={() => {
                    setData({ ...data, duration });
                    handleNext();
                  }}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    data.duration === duration 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
        );

      case 'focus':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Which ALF stage would you like to emphasize?</h3>
            <div className="space-y-2">
              {ALF_FOCUSES.map((focus) => (
                <button
                  key={focus.value}
                  onClick={() => {
                    setData({ ...data, alfFocus: focus.value });
                    handleNext();
                  }}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    data.alfFocus === focus.value 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{focus.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{focus.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Let's confirm your project setup</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div><span className="font-medium">Grade Level:</span> {data.gradeLevel}</div>
              <div><span className="font-medium">Subject:</span> {data.subject}</div>
              <div><span className="font-medium">Duration:</span> {data.duration}</div>
              <div><span className="font-medium">ALF Focus:</span> {data.alfFocus}</div>
            </div>
            <button
              onClick={handleComplete}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              Start Building Your Project
            </button>
          </div>
        );
    }
  };

  return (
    <div className="wizard-flow max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {['Grade', 'Subject', 'Duration', 'Focus', 'Confirm'].map((label, index) => {
            const steps: WizardStep[] = ['grade', 'subject', 'duration', 'focus', 'confirm'];
            const isActive = steps.indexOf(currentStep) >= index;
            return (
              <div key={label} className="flex-1 text-center">
                <div className={`text-xs font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {label}
                </div>
              </div>
            );
          })}
        </div>
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300"
              style={{ 
                width: `${(['grade', 'subject', 'duration', 'focus', 'confirm'].indexOf(currentStep) + 1) * 20}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Current step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep !== 'grade' && currentStep !== 'confirm' && (
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};