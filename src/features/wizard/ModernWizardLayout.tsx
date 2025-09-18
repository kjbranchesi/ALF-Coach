import React from 'react';
import { motion } from 'framer-motion';
import { ModernProgress } from '../../components/ModernProgress';
import { Icon } from '../../design-system/components/Icon';
import { Heading, Text } from '../../design-system/components/Typography';
import { Button } from '../../design-system/components/Button';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <Text className="text-sm font-medium uppercase tracking-wide text-primary-600 dark:text-primary-300 mb-1">
                Welcome to the ALF Project Builder
              </Text>
              <Heading size="2xl" className="text-gray-900 dark:text-gray-100">
                Design your learning blueprint
              </Heading>
              <Text className="mt-2 text-gray-600 dark:text-gray-400">
                The ALF Project Builder guides you step-by-step so you can shape a project that fits your classroom.
              </Text>
            </div>
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              leftIcon="x"
            />
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
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
              blueprint guide
            </a>{' '}
            or{' '}
            <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors">
              watch a tutorial
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
