import React from 'react';
import { motion } from 'framer-motion';
import { ModernProgress } from '../../components/ModernProgress';

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onCancel: () => void;
  showProgress?: boolean;
}

const WIZARD_STEPS = [
  { id: 'goals', label: 'Goals' },
  { id: 'subject', label: 'Subject' },
  { id: 'students', label: 'Students' },
  { id: 'location', label: 'Location' },
  { id: 'resources', label: 'Resources' },
  { id: 'scope', label: 'Scope' },
  { id: 'review', label: 'Review' }
];

export const ModernWizardLayout: React.FC<WizardLayoutProps> = ({
  currentStep,
  totalSteps,
  children,
  onCancel,
  showProgress = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Your Learning Blueprint</h1>
              <p className="mt-2 text-gray-600">Let's design an engaging experience for your students</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          {showProgress && (
            <ModernProgress 
              steps={WIZARD_STEPS} 
              currentStep={currentStep}
              className="mb-12"
            />
          )}
        </motion.div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          {children}
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Need help? Check out our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              blueprint guide
            </a>{' '}
            or{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
              watch a tutorial
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};