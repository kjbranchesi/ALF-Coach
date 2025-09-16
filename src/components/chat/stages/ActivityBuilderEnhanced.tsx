/**
 * ActivityBuilderEnhanced.tsx - Enhanced activity builder with proper accumulation and persistence
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Lightbulb, RefreshCw, Check, Clock, Users, User, School, BookOpen } from 'lucide-react';
import { Button } from '../../ui/Button';

interface Activity {
  id: string;
  title: string;
  description: string;
  duration?: string;
  type?: 'individual' | 'group' | 'class' | 'field';
  phase?: string;
  resources?: string[];
}

interface ActivityBuilderEnhancedProps {
  suggestedActivities: Activity[];
  currentPhase?: string;
  existingActivities?: Activity[]; // Activities already saved from previous phases
  onActivitiesConfirmed: (activities: Activity[]) => void;
  onRequestNewSuggestions: () => void;
  minActivities?: number;
  maxActivities?: number;
}

export const ActivityBuilderEnhanced: React.FC<ActivityBuilderEnhancedProps> = ({
  suggestedActivities,
  currentPhase,
  existingActivities = [],
  onActivitiesConfirmed,
  onRequestNewSuggestions,
  minActivities = 2,
  maxActivities = 10
}) => {
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [availableSuggestions, setAvailableSuggestions] = useState(suggestedActivities);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewMode, setViewMode] = useState<'add' | 'review'>('add');

  // Initialize with existing activities if any
  useEffect(() => {
    if (existingActivities.length > 0) {
      console.log('[ActivityBuilderEnhanced] Loading existing activities:', existingActivities);
      setSelectedActivities(existingActivities);
    }
  }, []);

  useEffect(() => {
    setAvailableSuggestions(suggestedActivities);
  }, [suggestedActivities]);

  const addActivity = (activity: Activity) => {
    const totalActivities = selectedActivities.length + existingActivities.length;
    if (totalActivities >= maxActivities) {
      setErrorMessage(`Maximum ${maxActivities} activities allowed across all phases`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // Add current phase to activity if specified
    const activityWithPhase = {
      ...activity,
      phase: currentPhase || activity.phase
    };

    setSelectedActivities(prev => [...prev, activityWithPhase]);
    setAvailableSuggestions(prev => prev.filter(a => a.id !== activity.id));
    
    console.log('[ActivityBuilderEnhanced] Added activity:', activityWithPhase);
  };

  const removeActivity = (activityId: string) => {
    const removedActivity = selectedActivities.find(a => a.id === activityId);
    if (removedActivity) {
      setSelectedActivities(prev => prev.filter(a => a.id !== activityId));
      // Add back to available suggestions only if it was from suggestions
      if (suggestedActivities.find(a => a.id === activityId)) {
        setAvailableSuggestions(prev => [...prev, removedActivity]);
      }
      console.log('[ActivityBuilderEnhanced] Removed activity:', removedActivity);
    }
  };

  const confirmActivities = () => {
    const totalActivities = selectedActivities.length + existingActivities.length;
    if (totalActivities < minActivities) {
      setErrorMessage(`Please select at least ${minActivities} activities total`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // Combine existing and new activities
    const allActivities = [...existingActivities, ...selectedActivities];
    console.log('[ActivityBuilderEnhanced] Confirming all activities:', allActivities);
    onActivitiesConfirmed(allActivities);
  };

  const getNewSuggestions = () => {
    onRequestNewSuggestions();
  };

  const canContinue = selectedActivities.length + existingActivities.length >= minActivities;

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'group': return <Users className="w-4 h-4" />;
      case 'individual': return <User className="w-4 h-4" />;
      case 'class': return <School className="w-4 h-4" />;
      case 'field': return <BookOpen className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getActivityTypeLabel = (type?: string) => {
    switch (type) {
      case 'group': return 'Group Activity';
      case 'individual': return 'Individual Work';
      case 'class': return 'Class Activity';
      case 'field': return 'Field Work';
      default: return 'Activity';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Build Your Learning Activities
          {currentPhase && <span className="text-primary-600 dark:text-primary-400"> - {currentPhase}</span>}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add activities to create an engaging learning experience ({minActivities}-{maxActivities} activities total)
        </p>
        {existingActivities.length > 0 && (
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
            You already have {existingActivities.length} activities from previous phases
          </p>
        )}
      </div>

      {/* View Mode Tabs */}
      {existingActivities.length > 0 && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setViewMode('add')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'add' 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Add New Activities
            </button>
            <button
              onClick={() => setViewMode('review')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'review' 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Review All ({existingActivities.length + selectedActivities.length})
            </button>
          </div>
        </div>
      )}

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

      {viewMode === 'add' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Selected Activities for Current Phase */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                New Activities ({selectedActivities.length})
              </h4>
              {selectedActivities.length > 0 && (
                <span className="text-sm text-gray-500">
                  Total: {selectedActivities.length + existingActivities.length}/{maxActivities}
                </span>
              )}
            </div>

            {selectedActivities.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No new activities added yet
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
                      className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getActivityIcon(activity.type)}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {activity.title}
                            </span>
                            <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                              {getActivityTypeLabel(activity.type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                            {activity.description}
                          </p>
                          {activity.duration && (
                            <div className="flex items-center gap-1 mt-2 ml-6 text-xs text-gray-500">
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

            {/* Continue Button */}
            <Button
              onClick={confirmActivities}
              disabled={!canContinue}
              variant="primary"
              className="w-full"
            >
              <Check className="w-4 h-4 mr-2" />
              Continue with {selectedActivities.length + existingActivities.length} Total Activities
            </Button>
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
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
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
                    className="w-full p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                        <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900 dark:text-gray-100">
                            {activity.title}
                          </h5>
                          {getActivityIcon(activity.type)}
                        </div>
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
      ) : (
        /* Review Mode - Show all activities organized by phase */
        <div className="space-y-6">
          <div className="grid gap-4">
            {/* Group activities by phase */}
            {Array.from(new Set([...existingActivities, ...selectedActivities].map(a => a.phase || 'General'))).map(phase => {
              const phaseActivities = [...existingActivities, ...selectedActivities].filter(a => (a.phase || 'General') === phase);
              return (
                <div key={phase} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {phase} ({phaseActivities.length} activities)
                  </h4>
                  <div className="space-y-2">
                    {phaseActivities.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-semibold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getActivityIcon(activity.type)}
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {activity.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={confirmActivities}
              disabled={!canContinue}
              variant="primary"
              size="lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Confirm All {selectedActivities.length + existingActivities.length} Activities
            </Button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 Tip: Mix different activity types to create an engaging and varied learning experience. 
          Activities are accumulated across all phases.
        </p>
      </div>
    </div>
  );
};