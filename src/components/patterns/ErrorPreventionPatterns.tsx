/**
 * ErrorPreventionPatterns.tsx
 *
 * Reusable components that prevent common UX errors in the chat interface
 * Implements design patterns that guide users toward success
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, X, Lightbulb } from 'lucide-react';

/**
 * Confirmation Modal - Prevents accidental actions
 */
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'success' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  const icons = {
    warning: AlertTriangle,
    success: CheckCircle2,
    info: HelpCircle
  };

  const colors = {
    warning: 'text-amber-600 bg-amber-100',
    success: 'text-green-600 bg-green-100',
    info: 'text-blue-600 bg-blue-100'
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${colors[type]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {message}
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700
                             hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={onConfirm}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {confirmText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Progressive Disclosure - Shows information gradually
 */
interface ProgressiveDisclosureProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  helpText?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  children,
  defaultOpen = false,
  helpText
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700
                   flex items-center justify-between transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {helpText && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{helpText}</p>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Input with Validation Feedback - Provides real-time guidance
 */
interface ValidatedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder: string;
  validationRules: Array<{
    test: (value: string) => boolean;
    message: string;
    type: 'error' | 'warning' | 'success';
  }>;
  helpText?: string;
  disabled?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  validationRules,
  helpText,
  disabled = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const validation = validationRules.map(rule => ({
    ...rule,
    passed: rule.test(value)
  }));

  const hasErrors = validation.some(v => v.type === 'error' && !v.passed);
  const hasWarnings = validation.some(v => v.type === 'warning' && !v.passed);

  const borderColor = hasErrors ? 'border-red-500' :
                     hasWarnings ? 'border-amber-500' :
                     value ? 'border-green-500' : 'border-gray-300';

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit?.();
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full p-3 border-2 ${borderColor} rounded-lg resize-none
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          rows={3}
        />

        {/* Character count or other indicators */}
        {value && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length} characters
          </div>
        )}
      </div>

      {/* Help text */}
      {helpText && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{helpText}</p>
      )}

      {/* Validation feedback */}
      <AnimatePresence>
        {(isFocused || value) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            {validation.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-2 text-sm ${
                  rule.passed
                    ? 'text-green-600 dark:text-green-400'
                    : rule.type === 'error'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {rule.passed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{rule.message}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Smart Suggestions - Contextual help that appears when needed
 */
interface SmartSuggestionsProps {
  suggestions: Array<{
    text: string;
    explanation?: string;
    category?: string;
  }>;
  onSuggestionClick: (suggestion: string) => void;
  title?: string;
  maxVisible?: number;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  title = 'Suggestions',
  maxVisible = 3
}) => {
  const [showAll, setShowAll] = useState(false);
  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, maxVisible);

  if (suggestions.length === 0) {return null;}

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h4 className="font-medium text-blue-800 dark:text-blue-200">{title}</h4>
      </div>

      <div className="space-y-2">
        {visibleSuggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="w-full text-left p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                     rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {suggestion.text}
                </p>
                {suggestion.explanation && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {suggestion.explanation}
                  </p>
                )}
              </div>
              {suggestion.category && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                  {suggestion.category}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {suggestions.length > maxVisible && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {showAll ? 'Show less' : `Show ${suggestions.length - maxVisible} more`}
        </button>
      )}
    </motion.div>
  );
};

/**
 * Stage Guard - Prevents navigation without completion
 */
interface StageGuardProps {
  canProceed: boolean;
  blockedReason: string;
  onComplete: () => void;
  children: React.ReactNode;
}

export const StageGuard: React.FC<StageGuardProps> = ({
  canProceed,
  blockedReason,
  onComplete,
  children
}) => {
  const [showWarning, setShowWarning] = useState(false);

  const handleAttemptProceed = useCallback(() => {
    if (canProceed) {
      onComplete();
    } else {
      setShowWarning(true);
    }
  }, [canProceed, onComplete]);

  return (
    <>
      <div className={canProceed ? '' : 'opacity-75 pointer-events-none'}>
        {children}
      </div>

      {!canProceed && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{blockedReason}</p>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showWarning}
        title="Cannot Proceed"
        message={blockedReason}
        confirmText="I Understand"
        cancelText=""
        onConfirm={() => setShowWarning(false)}
        onCancel={() => setShowWarning(false)}
        type="warning"
      />
    </>
  );
};

/**
 * Context-Aware Help - Shows help based on user behavior
 */
interface ContextualHelpProps {
  userStruggles: {
    emptyInputAttempts: number;
    invalidInputAttempts: number;
    timeOnStage: number;
  };
  stage: string;
  onHelpDismiss: () => void;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  userStruggles,
  stage,
  onHelpDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Determine if help should be shown based on user behavior
  React.useEffect(() => {
    const shouldShowHelp =
      userStruggles.emptyInputAttempts >= 2 ||
      userStruggles.invalidInputAttempts >= 3 ||
      userStruggles.timeOnStage > 120000; // 2 minutes

    setIsVisible(shouldShowHelp);
  }, [userStruggles]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    onHelpDismiss();
  }, [onHelpDismiss]);

  if (!isVisible) {return null;}

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                 rounded-lg shadow-lg p-4 z-40"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Need help?</h4>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        {getHelpMessageForStage(stage, userStruggles)}
      </p>

      <button
        onClick={handleDismiss}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
      >
        Got it, thanks!
      </button>
    </motion.div>
  );
};

/**
 * Helper function to get contextual help messages
 */
function getHelpMessageForStage(stage: string, struggles: any): string {
  if (struggles.emptyInputAttempts >= 2) {
    return `I notice you're having trouble getting started. Try using one of the suggestions below the input field, or describe your ideas in your own words.`;
  }

  if (struggles.invalidInputAttempts >= 3) {
    return `It looks like you might be unsure what I'm looking for. Click the help icon (?) to see examples and guidance for this step.`;
  }

  if (struggles.timeOnStage > 120000) {
    return `You've been on this step for a while. If you're stuck, try clicking one of the example suggestions or ask me for clarification.`;
  }

  switch (stage) {
    case 'CONTEXT':
      return 'Start by telling me about your subject area, grade level, or project duration.';
    case 'BIG_IDEA':
      return 'Describe a broad theme or real-world issue students could explore.';
    case 'ESSENTIAL_QUESTION':
      return 'Create an open-ended question that ends with a question mark.';
    case 'LEARNING_JOURNEY':
      return 'Outline the main phases students will go through in this project.';
    default:
      return 'If you need help with this step, try the suggestions or ask for clarification.';
  }
}