/**
 * ActivityBuilder.tsx - Accumulating activity builder for Journey stage
 * Allows adding multiple activities instead of single selection
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Lightbulb, RefreshCw, Check, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';

interface Activity {
  id: string;
  title: string;
  description: string;
  duration?: string;
  type?: 'individual' | 'group' | 'class';
  phase?: string;
}

interface ActivityBuilderProps {
  suggestedActivities: Activity[];
  currentPhase?: string;
  onActivitiesConfirmed: (activities: Activity[]) => void;
  onRequestNewSuggestions: () => void;
  minActivities?: number;
  maxActivities?: number;
}

export const ActivityBuilder: React.FC<ActivityBuilderProps> = ({
  suggestedActivities,
  currentPhase,
  onActivitiesConfirmed,
  onRequestNewSuggestions,
  minActivities = 2,
  maxActivities = 10
}) => {
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [availableSuggestions, setAvailableSuggestions] = useState(suggestedActivities);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const addActivity = (activity: Activity) => {
    if (selectedActivities.length >= maxActivities) {
      setErrorMessage(`Maximum ${maxActivities} activities allowed`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSelectedActivities(prev => [...prev, activity]);
    // Remove from available suggestions
    setAvailableSuggestions(prev => prev.filter(a => a.id !== activity.id));
  };

  const removeActivity = (activityId: string) => {
    const removedActivity = selectedActivities.find(a => a.id === activityId);
    if (removedActivity) {
      setSelectedActivities(prev => prev.filter(a => a.id !== activityId));
      // Add back to available suggestions
      setAvailableSuggestions(prev => [...prev, removedActivity]);
    }
  };

  const confirmActivities = () => {
    if (selectedActivities.length < minActivities) {
      setErrorMessage(`Please select at least ${minActivities} activities`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    onActivitiesConfirmed(selectedActivities);
  };

  const getNewSuggestions = () => {
    // Keep selected activities, get new suggestions
    onRequestNewSuggestions();
  };

  const canContinue = selectedActivities.length >= minActivities;

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'group': return '👥';
      case 'individual': return '👤';
      case 'class': return '🏫';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Build Your Learning Activities
          {currentPhase && <span className="text-blue-600 dark:text-blue-400"> - {currentPhase}</span>}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add activities to create an engaging learning experience ({minActivities}-{maxActivities} activities)
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Selected Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Your Activities ({selectedActivities.length})
            </h4>
            {selectedActivities.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedActivities.length}/{maxActivities}
              </span>
            )}
          </div>

          {selectedActivities.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No activities selected yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Click on suggestions to add them
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {selectedActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getActivityIcon(activity.type)}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Activity {index + 1}: {activity.title}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                          {activity.description}
                        </p>
                        {activity.duration && (
                          <div className="flex items-center gap-1 mt-2 ml-7 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {activity.duration}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeActivity(activity.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Continue Button (for selected activities) */}
          {selectedActivities.length > 0 && (
            <Button
              onClick={confirmActivities}
              disabled={!canContinue}
              variant="primary"
              className="w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Continue with {selectedActivities.length} Activities
            </Button>
          )}
        </div>

        {/* Right: Available Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Suggested Activities
            </h4>
            <button
              onClick={getNewSuggestions}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {availableSuggestions.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                All suggestions added!
              </p>
              <Button
                onClick={getNewSuggestions}
                variant="ghost"
                size="sm"
              >
                Get More Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {availableSuggestions.map((activity) => (
                <motion.button
                  key={activity.id}
                  onClick={() => addActivity(activity)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                      <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {activity.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.description}
                      </p>
                      {activity.duration && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {activity.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 Tip: Mix different activity types to create an engaging and varied learning experience
        </p>
      </div>
    </div>
  );
};