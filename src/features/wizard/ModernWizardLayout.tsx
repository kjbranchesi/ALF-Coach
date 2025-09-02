import React from 'react';
import { motion } from 'framer-motion';
import { ModernProgress } from '../../components/ModernProgress';
import { Icon } from '../../design-system/components/Icon';
import { Heading, Text } from '../../design-system/components/Typography';
import { Button } from '../../design-system/components/Button';
import { UniversalHeader } from '../../components/layout/UniversalHeader';

interface WizardLayoutProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onCancel: () => void;
  showProgress?: boolean;
}

const WIZARD_STEPS = [
  { id: 'vision', label: 'Vision' },
  { id: 'subjectScope', label: 'Subject & Time' },
  { id: 'students', label: 'Students' },
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 font-sans overflow-hidden">
      {/* Use UniversalHeader for consistency */}
      <div className="print-hidden flex-shrink-0 z-50">
        <UniversalHeader title="Create Your Learning Blueprint" />
      </div>
      
      <main className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Wizard-specific header content */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <Text className="text-gray-600 dark:text-gray-400">Let's design an engaging experience for your students</Text>
              </div>
            </div>

            {/* Progress Indicator */}
            {showProgress && (
              <ModernProgress 
                steps={WIZARD_STEPS} 
                currentStep={currentStep}
                className="mb-8"
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
            className={`
              transition-all duration-200
              ${showProgress 
                ? 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 p-6 md:p-8 lg:p-10'
                : 'bg-transparent'
              }
            `}
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Need help? Check out our{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                blueprint guide
              </a>{' '}
              or{' '}
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                watch a tutorial
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};