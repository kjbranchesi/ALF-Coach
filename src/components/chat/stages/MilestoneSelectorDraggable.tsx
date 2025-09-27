/**
 * MilestoneSelectorDraggable.tsx - Enhanced milestone selector with drag-and-drop timeline manipulation
 */

import React, { useState, useMemo, memo } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Plus, X, Target, Flag, GripVertical, Clock } from 'lucide-react';
import { Button } from '../../ui/Button';
import { generateSecureId } from '../../../core/utils/idGeneration';
import { validateAndSanitizeInput } from '../../../core/utils/inputSanitization';

interface Milestone {
  id: string;
  title: string;
  description: string;
  timeline: string;
  weekNumber?: number;
  deliverable?: string;
}

interface MilestoneSelectorDraggableProps {
  suggestedMilestones: Milestone[];
  projectDuration?: number; // in weeks
  onMilestonesConfirmed: (milestones: Milestone[]) => void;
  onRequestNewSuggestions: () => void;
  minMilestones?: number;
  maxMilestones?: number;
}

export const MilestoneSelectorDraggable: React.FC<MilestoneSelectorDraggableProps> = memo(({
  suggestedMilestones,
  projectDuration = 4,
  onMilestonesConfirmed,
  onRequestNewSuggestions,
  minMilestones = 3,
  maxMilestones = 8
}) => {
  const [selectedMilestones, setSelectedMilestones] = useState<Milestone[]>([]);
  const [availableMilestones, setAvailableMilestones] = useState<Milestone[]>(suggestedMilestones);
  const [customMilestone, setCustomMilestone] = useState({ title: '', timeline: '', description: '' });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate week distribution for milestones
  const distributeWeeks = (milestones: Milestone[]) => {
    const count = milestones.length;
    if (count === 0) return milestones;
    
    const weekInterval = projectDuration / (count + 1);
    return milestones.map((m, index) => ({
      ...m,
      weekNumber: Math.round(weekInterval * (index + 1)),
      timeline: `Week ${Math.round(weekInterval * (index + 1))}`
    }));
  };

  const addMilestone = (milestone: Milestone) => {
    if (selectedMilestones.length >= maxMilestones) {
      setErrorMessage(`Maximum ${maxMilestones} milestones allowed`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const newMilestones = [...selectedMilestones, milestone];
    setSelectedMilestones(distributeWeeks(newMilestones));
    setAvailableMilestones(prev => prev.filter(m => m.id !== milestone.id));
    
    console.log('[MilestoneSelectorDraggable] Added milestone:', milestone);
  };

  const removeMilestone = (milestoneId: string) => {
    const removed = selectedMilestones.find(m => m.id === milestoneId);
    if (removed) {
      const newMilestones = selectedMilestones.filter(m => m.id !== milestoneId);
      setSelectedMilestones(distributeWeeks(newMilestones));
      
      // Add back to available if it was from suggestions
      if (suggestedMilestones.find(m => m.id === milestoneId)) {
        setAvailableMilestones(prev => [...prev, removed]);
      }
    }
  };

  const handleReorder = (newOrder: Milestone[]) => {
    setSelectedMilestones(distributeWeeks(newOrder));
    console.log('[MilestoneSelectorDraggable] Reordered milestones:', newOrder);
  };

  const handleAddCustomMilestone = () => {
    // Validate and sanitize inputs
    const titleValidation = validateAndSanitizeInput(customMilestone.title, { maxLength: 100, required: true });
    const descriptionValidation = validateAndSanitizeInput(customMilestone.description, { maxLength: 300, required: false });

    if (titleValidation.isValid) {
      const newMilestone: Milestone = {
        id: generateSecureId('milestone'),
        title: titleValidation.sanitizedValue,
        timeline: 'TBD',
        description: descriptionValidation.sanitizedValue || `Complete ${titleValidation.sanitizedValue}`
      };
      
      addMilestone(newMilestone);
      setCustomMilestone({ title: '', timeline: '', description: '' });
      setShowCustomForm(false);
    }
  };

  const adjustWeek = (milestoneId: string, delta: number) => {
    setSelectedMilestones(prev => prev.map(m => {
      if (m.id === milestoneId) {
        const newWeek = Math.max(1, Math.min(projectDuration, (m.weekNumber || 1) + delta));
        return {
          ...m,
          weekNumber: newWeek,
          timeline: `Week ${newWeek}`
        };
      }
      return m;
    }));
  };

  const handleConfirm = () => {
    if (selectedMilestones.length < minMilestones) {
      setErrorMessage(`Please select at least ${minMilestones} milestones`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }
    
    console.log('[MilestoneSelectorDraggable] Confirming milestones:', selectedMilestones);
    onMilestonesConfirmed(selectedMilestones);
  };

  const canContinue = selectedMilestones.length >= minMilestones;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Design Your Project Timeline
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Add milestones and arrange them on your {projectDuration}-week timeline ({minMilestones}-{maxMilestones} milestones)
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Timeline with Selected Milestones */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Project Timeline
            </h4>
            {selectedMilestones.length > 0 && (
              <span className="text-sm text-gray-500">
                Drag to reorder • Use arrows to adjust timing
              </span>
            )}
          </div>

          {/* Timeline Visualization */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <div className="flex justify-between mb-2 text-xs text-gray-600 dark:text-gray-400">
              <span>Week 1</span>
              <span>Week {Math.floor(projectDuration / 2)}</span>
              <span>Week {projectDuration}</span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full opacity-30" />
              {selectedMilestones.map((m) => {
                const position = ((m.weekNumber || 1) / projectDuration) * 100;
                return (
                  <div
                    key={m.id}
                    className="absolute w-4 h-4 bg-purple-600 rounded-full border-2 border-white dark:border-gray-800 shadow-lg"
                    style={{ left: `${position}%`, top: '-4px' }}
                    title={m.title}
                  />
                );
              })}
            </div>
          </div>

          {selectedMilestones.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No milestones added yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Click on suggestions to add them
              </p>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={selectedMilestones} 
              onReorder={handleReorder}
              className="space-y-3"
            >
              <AnimatePresence>
                {selectedMilestones.map((milestone, index) => (
                  <Reorder.Item
                    key={milestone.id}
                    value={milestone}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative"
                  >
                    <div className="p-4 bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 rounded-xl cursor-move">
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Milestone Number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {milestone.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {milestone.description}
                          </p>
                          
                          {/* Timeline Controls */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg px-2 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adjustWeek(milestone.id, -1);
                                }}
                                className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                              <span className="text-sm font-medium text-purple-700 dark:text-purple-300 px-1">
                                {milestone.timeline}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  adjustWeek(milestone.id, 1);
                                }}
                                className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </div>
                            
                            {milestone.deliverable && (
                              <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                                {milestone.deliverable}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMilestone(milestone.id);
                          }}
                          className="flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}

          {/* Continue Button */}
          {selectedMilestones.length > 0 && (
            <Button
              onClick={handleConfirm}
              disabled={!canContinue}
              variant="primary"
              className="w-full"
            >
              Continue with {selectedMilestones.length} Milestone{selectedMilestones.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Right: Available Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Flag className="w-5 h-5 text-purple-500" />
              Suggested Milestones
            </h4>
            <button
              onClick={onRequestNewSuggestions}
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {availableMilestones.length === 0 ? (
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-3">
                All suggestions added!
              </p>
              <Button
                onClick={onRequestNewSuggestions}
                variant="ghost"
                size="sm"
              >
                Get More Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {availableMilestones.map((milestone) => (
                <motion.button
                  key={milestone.id}
                  onClick={() => addMilestone(milestone)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                      <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {milestone.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {milestone.description}
                      </p>
                      {milestone.deliverable && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded">
                          Deliverable: {milestone.deliverable}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Custom Milestone Form */}
          {showCustomForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-3"
            >
              <input
                type="text"
                placeholder="Milestone title"
                value={customMilestone.title}
                onChange={(e) => setCustomMilestone({ ...customMilestone, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <textarea
                placeholder="Description (optional)"
                value={customMilestone.description}
                onChange={(e) => setCustomMilestone({ ...customMilestone, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCustomMilestone}
                  variant="primary"
                  size="sm"
                  disabled={!customMilestone.title.trim()}
                >
                  Add Milestone
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomMilestone({ title: '', timeline: '', description: '' });
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowCustomForm(true)}
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-purple-400 dark:hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Milestone
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Tip: Space milestones evenly throughout your project. Use the timeline controls to fine-tune when each checkpoint occurs.
        </p>
      </div>
    </div>
  );
});
