import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, MessageSquare, HelpCircle } from 'lucide-react';
import { AnimatedButton } from '../RiveInteractions';

interface ErrorRecoveryProps {
  error: {
    type: 'card_selection' | 'network' | 'validation' | 'general';
    message: string;
    context?: any;
  };
  onRetry?: () => void;
  onAlternativeAction?: () => void;
  currentStage?: string;
}

export function ErrorRecovery({ error, onRetry, onAlternativeAction, currentStage }: ErrorRecoveryProps) {
  const getRecoveryOptions = () => {
    switch (error.type) {
      case 'card_selection':
        return {
          icon: AlertTriangle,
          title: "Card Selection Issue",
          description: "The card couldn't be selected. This might be a temporary issue.",
          actions: [
            {
              label: "Try Again",
              icon: RefreshCw,
              action: onRetry,
              variant: 'primary' as const
            },
            {
              label: "Type Your Answer",
              icon: MessageSquare,
              action: onAlternativeAction,
              variant: 'secondary' as const
            }
          ],
          tips: [
            "Click the card one more time",
            "Or type your choice in the text box below",
            "You can also ask for different options"
          ]
        };
      
      case 'network':
        return {
          icon: AlertTriangle,
          title: "Connection Issue",
          description: "We're having trouble connecting. Please check your internet connection.",
          actions: [
            {
              label: "Retry",
              icon: RefreshCw,
              action: onRetry,
              variant: 'primary' as const
            }
          ],
          tips: [
            "Check your internet connection",
            "Refresh the page if the issue persists",
            "Your progress has been saved"
          ]
        };
      
      case 'validation':
        return {
          icon: HelpCircle,
          title: "Input Validation",
          description: error.message || "Your input needs some adjustment.",
          actions: [
            {
              label: "Get Help",
              icon: HelpCircle,
              action: onAlternativeAction,
              variant: 'primary' as const
            }
          ],
          tips: [
            "Make sure your response is complete",
            "Click 'Get Help' for guidance",
            "You can also see examples by clicking the 'Ideas' button"
          ]
        };
      
      default:
        return {
          icon: AlertTriangle,
          title: "Something Went Wrong",
          description: error.message || "We encountered an unexpected issue.",
          actions: [
            {
              label: "Try Again",
              icon: RefreshCw,
              action: onRetry,
              variant: 'primary' as const
            },
            {
              label: "Get Help",
              icon: HelpCircle,
              action: onAlternativeAction,
              variant: 'secondary' as const
            }
          ],
          tips: [
            "Don't worry, your progress is saved",
            "Try the action again",
            "Or use the text input as an alternative"
          ]
        };
    }
  };

  const recovery = getRecoveryOptions();
  const Icon = recovery.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 my-4"
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
            {recovery.title}
          </h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {recovery.description}
          </p>
          
          {/* Recovery Actions */}
          <div className="flex gap-2 mb-3">
            {recovery.actions.map((action, index) => (
              <AnimatedButton
                key={index}
                onClick={action.action}
                variant={action.variant}
                icon={action.icon}
                className="text-sm"
              >
                {action.label}
              </AnimatedButton>
            ))}
          </div>
          
          {/* Helpful Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              What you can do:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              {recovery.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-red-400">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}