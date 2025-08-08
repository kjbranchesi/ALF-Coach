import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, Plus, X, Target, Flag } from 'lucide-react';
import { Button } from '../../ui/Button';
import { generateSecureId } from '../../../core/utils/idGeneration';
import { validateAndSanitizeInput } from '../../../core/utils/inputSanitization';

interface Milestone {
  id: string;
  title: string;
  description: string;
  timeline: string;
  deliverable?: string;
}

interface MilestoneSelectorProps {
  suggestedMilestones: Milestone[];
  onMilestonesConfirmed: (milestones: Milestone[]) => void;
  onRequestNewSuggestions: () => void;
  minMilestones?: number;
  maxMilestones?: number;
}

export const MilestoneSelector: React.FC<MilestoneSelectorProps> = memo(({
  suggestedMilestones,
  onMilestonesConfirmed,
  onRequestNewSuggestions,
  minMilestones = 3,
  maxMilestones = 8
}) => {
  const [selectedMilestones, setSelectedMilestones] = useState<Set<string>>(new Set());
  const [customMilestone, setCustomMilestone] = useState({ title: '', timeline: '', description: '' });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [localMilestones, setLocalMilestones] = useState(suggestedMilestones);

  const handleToggleMilestone = (milestone: Milestone) => {
    const newSelected = new Set(selectedMilestones);
    if (newSelected.has(milestone.id)) {
      newSelected.delete(milestone.id);
    } else if (newSelected.size < maxMilestones) {
      newSelected.add(milestone.id);
    }
    setSelectedMilestones(newSelected);
  };

  const handleAddCustomMilestone = () => {
    // Validate and sanitize inputs
    const titleValidation = validateAndSanitizeInput(customMilestone.title, { maxLength: 100, required: true });
    const timelineValidation = validateAndSanitizeInput(customMilestone.timeline, { maxLength: 50, required: true });
    const descriptionValidation = validateAndSanitizeInput(customMilestone.description, { maxLength: 300, required: false });

    if (titleValidation.isValid && timelineValidation.isValid && descriptionValidation.isValid) {
      const newMilestone: Milestone = {
        id: generateSecureId('milestone'),
        title: titleValidation.sanitizedValue,
        timeline: timelineValidation.sanitizedValue,
        description: descriptionValidation.sanitizedValue || `Complete ${titleValidation.sanitizedValue}`
      };
      setLocalMilestones([...localMilestones, newMilestone]);
      setSelectedMilestones(new Set([...selectedMilestones, newMilestone.id]));
      setCustomMilestone({ title: '', timeline: '', description: '' });
      setShowCustomForm(false);
    }
  };

  const handleConfirm = () => {
    const selected = localMilestones.filter(m => selectedMilestones.has(m.id));
    onMilestonesConfirmed(selected);
  };

  const canContinue = useMemo(() => 
    selectedMilestones.size >= minMilestones, 
    [selectedMilestones.size, minMilestones]
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Flag className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Milestones</h3>
            <p className="text-sm text-gray-600">
              Select {minMilestones}-{maxMilestones} key checkpoints for your project
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {localMilestones.map((milestone) => {
              const isSelected = selectedMilestones.has(milestone.id);
              return (
                <motion.div
                  key={milestone.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                  }`}
                  onClick={() => handleToggleMilestone(milestone)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 transition-colors ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}>
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{milestone.timeline}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
                      {milestone.deliverable && (
                        <div className="mt-2 px-2 py-1 bg-purple-100 rounded text-xs text-purple-700 inline-block">
                          Deliverable: {milestone.deliverable}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">✓</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {showCustomForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-purple-300"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Milestone title (e.g., 'Research Complete')"
                value={customMilestone.title}
                onChange={(e) => setCustomMilestone({ ...customMilestone, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Timeline (e.g., 'Week 2' or 'March 15')"
                value={customMilestone.timeline}
                onChange={(e) => setCustomMilestone({ ...customMilestone, timeline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <textarea
                placeholder="Description (optional)"
                value={customMilestone.description}
                onChange={(e) => setCustomMilestone({ ...customMilestone, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCustomMilestone}
                  disabled={!customMilestone.title || !customMilestone.timeline}
                  className="flex-1"
                >
                  Add Milestone
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomMilestone({ title: '', timeline: '', description: '' });
                  }}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowCustomForm(true)}
            className="mt-4 w-full p-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Milestone
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedMilestones.size} of {minMilestones} minimum milestones selected
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onRequestNewSuggestions}
            variant="secondary"
          >
            Get New Suggestions
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canContinue}
            className="min-w-[120px]"
          >
            Continue ({selectedMilestones.size}/{minMilestones})
          </Button>
        </div>
      </div>
    </div>
  );
});