/**
 * JourneyPhaseSelectorDraggable.tsx - Enhanced phase selector with drag-and-drop reordering
 */

import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Calendar, RefreshCw, GripVertical, X } from 'lucide-react';
import { Button } from '../../ui/Button';

interface Phase {
  id: string;
  title: string;
  description: string;
  duration: string;
  activities?: string[];
}

interface JourneyPhaseSelectorDraggableProps {
  suggestedPhases: Phase[];
  onPhasesSelected: (phases: Phase[]) => void;
  onRequestNewSuggestions: () => void;
  minPhases?: number;
  maxPhases?: number;
}

export const JourneyPhaseSelectorDraggable: React.FC<JourneyPhaseSelectorDraggableProps> = ({
  suggestedPhases,
  onPhasesSelected,
  onRequestNewSuggestions,
  minPhases = 2,
  maxPhases = 6
}) => {
  const [selectedPhases, setSelectedPhases] = useState<Phase[]>([]);
  const [availablePhases, setAvailablePhases] = useState<Phase[]>(suggestedPhases);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setAvailablePhases(suggestedPhases);
  }, [suggestedPhases]);

  const addPhase = (phase: Phase) => {
    if (selectedPhases.length >= maxPhases) {
      setErrorMessage(`Maximum ${maxPhases} phases allowed`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setSelectedPhases(prev => [...prev, phase]);
    setAvailablePhases(prev => prev.filter(p => p.id !== phase.id));
  };

  const removePhase = (phaseId: string) => {
    const removedPhase = selectedPhases.find(p => p.id === phaseId);
    if (removedPhase) {
      setSelectedPhases(prev => prev.filter(p => p.id !== phaseId));
      setAvailablePhases(prev => [...prev, removedPhase]);
    }
  };

  const confirmSelection = () => {
    if (selectedPhases.length < minPhases) {
      setErrorMessage(`Please select at least ${minPhases} phases`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    console.log('[JourneyPhaseSelectorDraggable] Confirming phases:', selectedPhases);
    onPhasesSelected(selectedPhases);
  };

  const canContinue = selectedPhases.length >= minPhases;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Design Your Learning Journey
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select and arrange the phases for your project (choose {minPhases}-{maxPhases} phases)
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
        {/* Left: Selected Phases (Draggable) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Your Learning Phases ({selectedPhases.length})
            </h4>
            {selectedPhases.length > 0 && (
              <span className="text-sm text-gray-500">
                Drag to reorder
              </span>
            )}
          </div>

          {selectedPhases.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No phases selected yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Click on suggestions to add them
              </p>
            </div>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={selectedPhases} 
              onReorder={setSelectedPhases}
              className="space-y-3"
            >
              <AnimatePresence>
                {selectedPhases.map((phase, index) => (
                  <Reorder.Item
                    key={phase.id}
                    value={phase}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative"
                  >
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl cursor-move">
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Phase Number */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {phase.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {phase.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {phase.duration}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removePhase(phase.id)}
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
          {selectedPhases.length > 0 && (
            <Button
              onClick={confirmSelection}
              disabled={!canContinue}
              variant="primary"
              className="w-full"
            >
              Continue with {selectedPhases.length} phase{selectedPhases.length !== 1 ? 's' : ''}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Right: Available Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Suggested Phases
            </h4>
            <button
              onClick={onRequestNewSuggestions}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>

          {availablePhases.length === 0 ? (
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
              {availablePhases.map((phase) => (
                <motion.button
                  key={phase.id}
                  onClick={() => addPhase(phase)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 mt-0.5" />
                    
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {phase.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {phase.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {phase.duration}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-500">
        Selected phases will form the structure of your learning journey. You can reorder them by dragging.
      </p>
    </div>
  );
};