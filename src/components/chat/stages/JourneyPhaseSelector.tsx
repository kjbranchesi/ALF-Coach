/**
 * JourneyPhaseSelector.tsx - Multi-select phase builder for Journey stage
 * Replaces single-select suggestion cards for phase selection
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '../../design-system';

interface Phase {
  id: string;
  title: string;
  description: string;
  duration: string;
  activities?: string[];
}

interface JourneyPhaseSelectorProps {
  suggestedPhases: Phase[];
  onPhasesSelected: (phases: Phase[]) => void;
  onRequestNewSuggestions: () => void;
  minPhases?: number;
  maxPhases?: number;
}

export const JourneyPhaseSelector: React.FC<JourneyPhaseSelectorProps> = ({
  suggestedPhases,
  onPhasesSelected,
  onRequestNewSuggestions,
  minPhases = 2,
  maxPhases = 6
}) => {
  const [selectedPhaseIds, setSelectedPhaseIds] = useState<string[]>([]);
  const [showError, setShowError] = useState(false);

  const togglePhase = (phaseId: string) => {
    setSelectedPhaseIds(prev => {
      if (prev.includes(phaseId)) {
        return prev.filter(id => id !== phaseId);
      }
      if (prev.length >= maxPhases) {
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        return prev;
      }
      return [...prev, phaseId];
    });
  };

  const confirmSelection = () => {
    if (selectedPhaseIds.length < minPhases) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const selectedPhases = suggestedPhases.filter(p => selectedPhaseIds.includes(p.id));
    onPhasesSelected(selectedPhases);
  };

  const canContinue = selectedPhaseIds.length >= minPhases;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Design Your Learning Journey
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select the phases for your project (choose {minPhases}-{maxPhases} phases)
        </p>
      </div>

      {/* Error Message */}
      {showError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
        >
          {selectedPhaseIds.length < minPhases
            ? `Please select at least ${minPhases} phases`
            : `Maximum ${maxPhases} phases allowed`}
        </motion.div>
      )}

      {/* Phase Cards */}
      <div className="space-y-3">
        {suggestedPhases.map((phase, index) => {
          const isSelected = selectedPhaseIds.includes(phase.id);
          
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => togglePhase(phase.id)}
              className={`
                relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className={`
                  flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center mt-0.5
                  ${isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-300 dark:border-gray-600'}
                `}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {phase.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {phase.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {phase.duration}
                    </span>
                    {phase.activities && phase.activities.length > 0 && (
                      <span className="text-gray-500 dark:text-gray-500">
                        {phase.activities.length} suggested activities
                      </span>
                    )}
                  </div>
                </div>

                {/* Phase Number (when selected) */}
                {isSelected && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {selectedPhaseIds.indexOf(phase.id) + 1}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={confirmSelection}
          disabled={!canContinue}
          variant="primary"
          className="flex-1"
        >
          Continue with {selectedPhaseIds.length} phase{selectedPhaseIds.length !== 1 ? 's' : ''}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        
        <Button
          onClick={onRequestNewSuggestions}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Different Suggestions
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-500">
        Selected phases will form the structure of your learning journey
      </p>
    </div>
  );
};