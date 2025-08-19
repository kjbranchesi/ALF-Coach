import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  RefreshCw, 
  Lightbulb, 
  MessageSquare,
  Clock,
  TrendingDown,
  ArrowRight,
  X,
  LifeBuoy,
  Zap,
  Target,
  HelpCircle
} from 'lucide-react';

interface StuckSignal {
  type: 'idle_time' | 'repeated_actions' | 'no_progress' | 'error_frequency' | 'help_requests';
  severity: 'low' | 'medium' | 'high';
  duration: number;
  context: any;
}

interface RecoveryAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  type: 'guidance' | 'inspiration' | 'simplification' | 'alternative' | 'help';
  action: () => void;
  estimatedTime?: number;
}

interface StuckDetectionSystemProps {
  isActive: boolean;
  currentStage: string;
  currentStep: string;
  userType: 'new' | 'experienced' | 'expert';
  onStuckDetected: (signals: StuckSignal[]) => void;
  onRecoveryAction: (actionId: string) => void;
  onGetHelp: () => void;
  onGetIdeas: () => void;
  onSimplifyTask: () => void;
  onTryAlternative: () => void;
}

export function StuckDetectionSystem({
  isActive,
  currentStage,
  currentStep,
  userType,
  onStuckDetected,
  onRecoveryAction,
  onGetHelp,
  onGetIdeas,
  onSimplifyTask,
  onTryAlternative
}: StuckDetectionSystemProps) {
  const [detectedSignals, setDetectedSignals] = useState<StuckSignal[]>([]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [sessionMetrics, setSessionMetrics] = useState({
    idleTime: 0,
    lastAction: Date.now(),
    actionCount: 0,
    repeatedActions: 0,
    helpRequests: 0,
    errorCount: 0,
    progressMade: false
  });

  // Detection thresholds based on user type
  const getThresholds = useCallback(() => {
    const baseThresholds = {
      new: {
        idleTime: 60000, // 1 minute
        repeatedActions: 3,
        noProgress: 180000, // 3 minutes
        helpRequests: 2
      },
      experienced: {
        idleTime: 120000, // 2 minutes
        repeatedActions: 5,
        noProgress: 300000, // 5 minutes
        helpRequests: 3
      },
      expert: {
        idleTime: 180000, // 3 minutes
        repeatedActions: 7,
        noProgress: 600000, // 10 minutes
        helpRequests: 1 // Experts asking for help is a strong signal
      }
    };
    return baseThresholds[userType];
  }, [userType]);

  // Track user activity
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - sessionMetrics.lastAction;
      
      setSessionMetrics(prev => ({
        ...prev,
        idleTime
      }));

      // Detect stuck signals
      const signals: StuckSignal[] = [];
      const thresholds = getThresholds();

      // Idle time detection
      if (idleTime > thresholds.idleTime) {
        signals.push({
          type: 'idle_time',
          severity: idleTime > thresholds.idleTime * 2 ? 'high' : 'medium',
          duration: idleTime,
          context: { stage: currentStage, step: currentStep }
        });
      }

      // Repeated actions without progress
      if (prev.repeatedActions >= thresholds.repeatedActions && !prev.progressMade) {
        signals.push({
          type: 'repeated_actions',
          severity: 'medium',
          duration: idleTime,
          context: { actionCount: prev.repeatedActions }
        });
      }

      // No progress for extended time
      if (!prev.progressMade && idleTime > thresholds.noProgress) {
        signals.push({
          type: 'no_progress',
          severity: 'high',
          duration: idleTime,
          context: { stage: currentStage, step: currentStep }
        });
      }

      // Multiple help requests
      if (prev.helpRequests >= thresholds.helpRequests) {
        signals.push({
          type: 'help_requests',
          severity: userType === 'expert' ? 'high' : 'medium',
          duration: idleTime,
          context: { helpCount: prev.helpRequests }
        });
      }

      if (signals.length > 0) {
        setDetectedSignals(signals);
        onStuckDetected(signals);
        
        // Show recovery modal for significant stuck signals
        const hasHighSeverity = signals.some(s => s.severity === 'high');
        const hasMultipleSignals = signals.length > 1;
        
        if (hasHighSeverity || hasMultipleSignals) {
          setShowRecoveryModal(true);
        }
      }
      
      return prev;
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isActive, sessionMetrics.lastAction, currentStage, currentStep, userType, getThresholds, onStuckDetected]);

  // Track user actions
  const trackAction = useCallback((actionType: string) => {
    setSessionMetrics(prev => ({
      ...prev,
      lastAction: Date.now(),
      actionCount: prev.actionCount + 1,
      idleTime: 0,
      repeatedActions: actionType === 'repeat' ? prev.repeatedActions + 1 : 0,
      helpRequests: actionType === 'help' ? prev.helpRequests + 1 : prev.helpRequests,
      errorCount: actionType === 'error' ? prev.errorCount + 1 : prev.errorCount,
      progressMade: actionType === 'progress' ? true : prev.progressMade
    }));
  }, []);

  // Generate recovery actions based on detected signals
  const getRecoveryActions = useCallback((): RecoveryAction[] => {
    const actions: RecoveryAction[] = [];
    
    const hasIdleTime = detectedSignals.some(s => s.type === 'idle_time');
    const hasRepeatedActions = detectedSignals.some(s => s.type === 'repeated_actions');
    const hasNoProgress = detectedSignals.some(s => s.type === 'no_progress');
    const hasHelpRequests = detectedSignals.some(s => s.type === 'help_requests');

    if (hasIdleTime || hasNoProgress) {
      actions.push({
        id: 'get-ideas',
        label: 'Get Inspiration',
        description: 'See examples and ideas to spark your thinking',
        icon: Lightbulb,
        type: 'inspiration',
        action: onGetIdeas,
        estimatedTime: 2
      });
    }

    if (hasRepeatedActions || hasNoProgress) {
      actions.push({
        id: 'try-alternative',
        label: 'Try Different Approach',
        description: 'Explore alternative ways to tackle this step',
        icon: ArrowRight,
        type: 'alternative',
        action: onTryAlternative,
        estimatedTime: 3
      });
    }

    if (userType === 'new' || hasHelpRequests) {
      actions.push({
        id: 'get-help',
        label: 'Get Guided Help',
        description: 'Learn more about this step with detailed guidance',
        icon: HelpCircle,
        type: 'help',
        action: onGetHelp,
        estimatedTime: 5
      });
    }

    if (detectedSignals.some(s => s.severity === 'high')) {
      actions.push({
        id: 'simplify',
        label: 'Simplify This Step',
        description: 'Break this down into smaller, manageable parts',
        icon: Target,
        type: 'simplification',
        action: onSimplifyTask,
        estimatedTime: 1
      });
    }

    // Default recovery action
    if (actions.length === 0) {
      actions.push({
        id: 'get-guidance',
        label: 'Get Guidance',
        description: 'Let me help you move forward',
        icon: MessageSquare,
        type: 'guidance',
        action: onGetHelp,
        estimatedTime: 2
      });
    }

    return actions;
  }, [detectedSignals, userType, onGetIdeas, onGetHelp, onSimplifyTask, onTryAlternative]);

  // Visual indicator for stuck state
  const StuckIndicator = () => {
    if (detectedSignals.length === 0) return null;

    const maxSeverity = detectedSignals.reduce((max, signal) => {
      const severityLevels = { low: 1, medium: 2, high: 3 };
      return severityLevels[signal.severity] > severityLevels[max] ? signal.severity : max;
    }, 'low' as 'low' | 'medium' | 'high');

    const colors = {
      low: 'yellow',
      medium: 'orange', 
      high: 'red'
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed top-20 right-4 p-3 bg-${colors[maxSeverity]}-100 border border-${colors[maxSeverity]}-200 rounded-lg shadow-lg z-40 max-w-sm`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-full bg-${colors[maxSeverity]}-500 flex items-center justify-center flex-shrink-0`}>
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h4 className={`font-medium text-${colors[maxSeverity]}-900 text-sm`}>
              {maxSeverity === 'high' ? 'Need Help?' : 
               maxSeverity === 'medium' ? 'Stuck?' : 'Taking Your Time?'}
            </h4>
            <p className={`text-xs text-${colors[maxSeverity]}-700 mt-1`}>
              {maxSeverity === 'high' ? 'It looks like you might be stuck. Would you like some help?' :
               maxSeverity === 'medium' ? 'I notice you\'ve been working on this for a while. Need ideas?' :
               'No rush! Let me know if you need inspiration.'}
            </p>
            <button
              onClick={() => setShowRecoveryModal(true)}
              className={`mt-2 text-xs text-${colors[maxSeverity]}-600 hover:text-${colors[maxSeverity]}-800 font-medium`}
            >
              Get Help →
            </button>
          </div>
          <button
            onClick={() => setDetectedSignals([])}
            className={`text-${colors[maxSeverity]}-400 hover:text-${colors[maxSeverity]}-600`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  // Recovery Modal
  const RecoveryModal = () => (
    <AnimatePresence>
      {showRecoveryModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowRecoveryModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <LifeBuoy className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Let's Get You Moving Forward
                </h3>
                <p className="text-gray-600 text-sm">
                  I noticed you might be stuck on this step. Here are some ways I can help:
                </p>
              </div>
              <button
                onClick={() => setShowRecoveryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {getRecoveryActions().map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      action.action();
                      onRecoveryAction(action.id);
                      setShowRecoveryModal(false);
                      setDetectedSignals([]);
                    }}
                    className="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ActionIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {action.label}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {action.description}
                        </p>
                        {action.estimatedTime && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {action.estimatedTime} min
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Remember: There's no rush. Take your time to create something meaningful.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Expose tracking function for parent components
  useEffect(() => {
    window.trackUserAction = trackAction;
    return () => {
      delete window.trackUserAction;
    };
  }, [trackAction]);

  return (
    <>
      <StuckIndicator />
      <RecoveryModal />
    </>
  );
}

// Helper hook for components to report user actions
export function useStuckDetection() {
  const trackAction = useCallback((actionType: string) => {
    if (window.trackUserAction) {
      window.trackUserAction(actionType);
    }
  }, []);

  return { trackAction };
}

// Declare global function type
declare global {
  interface Window {
    trackUserAction?: (actionType: string) => void;
  }
}