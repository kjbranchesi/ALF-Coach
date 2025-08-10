/**
 * RubricBuilderEnhanced.tsx - Enhanced rubric builder with automatic weight balancing
 */

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Plus, X, Award, Star, Target, TrendingUp, Percent, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { generateSecureId } from '../../../core/utils/idGeneration';
import { validateAndSanitizeInput } from '../../../core/utils/inputSanitization';

interface RubricCriterion {
  id: string;
  category: string;
  description: string;
  weight: number;
  levels?: {
    level: string;
    description: string;
    points: number;
  }[];
}

interface RubricBuilderEnhancedProps {
  suggestedCriteria: RubricCriterion[];
  onCriteriaConfirmed: (criteria: RubricCriterion[]) => void;
  onRequestNewSuggestions: () => void;
  minCriteria?: number;
  maxCriteria?: number;
}

const DEFAULT_LEVELS = [
  { level: 'Exceeds', description: 'Exceptional work that goes beyond expectations', points: 4 },
  { level: 'Meets', description: 'Proficient work that meets all requirements', points: 3 },
  { level: 'Approaching', description: 'Developing work that shows progress', points: 2 },
  { level: 'Beginning', description: 'Initial attempts that need improvement', points: 1 }
];

export const RubricBuilderEnhanced: React.FC<RubricBuilderEnhancedProps> = memo(({
  suggestedCriteria,
  onCriteriaConfirmed,
  onRequestNewSuggestions,
  minCriteria = 3,
  maxCriteria = 8
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<RubricCriterion[]>([]);
  const [availableCriteria, setAvailableCriteria] = useState<RubricCriterion[]>(suggestedCriteria);
  const [customCriterion, setCustomCriterion] = useState({ category: '', description: '', weight: 25 });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [autoBalance, setAutoBalance] = useState(true);

  // Initialize suggested criteria with default weights
  useEffect(() => {
    const criteriaWithWeights = suggestedCriteria.map(c => ({
      ...c,
      weight: c.weight || Math.floor(100 / suggestedCriteria.length),
      levels: c.levels || DEFAULT_LEVELS
    }));
    setAvailableCriteria(criteriaWithWeights);
  }, [suggestedCriteria]);

  // Calculate total weight
  const totalWeight = useMemo(() => {
    return selectedCriteria.reduce((sum, c) => sum + c.weight, 0);
  }, [selectedCriteria]);

  // Auto-balance weights when enabled
  const rebalanceWeights = (criteria: RubricCriterion[]) => {
    if (!autoBalance || criteria.length === 0) return criteria;
    
    const equalWeight = Math.floor(100 / criteria.length);
    const remainder = 100 - (equalWeight * criteria.length);
    
    return criteria.map((c, index) => ({
      ...c,
      weight: equalWeight + (index < remainder ? 1 : 0)
    }));
  };

  const addCriterion = (criterion: RubricCriterion) => {
    if (selectedCriteria.length >= maxCriteria) {
      setErrorMessage(`Maximum ${maxCriteria} criteria allowed`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    const newCriteria = [...selectedCriteria, criterion];
    const balanced = autoBalance ? rebalanceWeights(newCriteria) : newCriteria;
    setSelectedCriteria(balanced);
    setAvailableCriteria(prev => prev.filter(c => c.id !== criterion.id));
    
    console.log('[RubricBuilderEnhanced] Added criterion:', criterion);
    console.log('[RubricBuilderEnhanced] New weights:', balanced.map(c => ({ id: c.id, weight: c.weight })));
  };

  const removeCriterion = (criterionId: string) => {
    const removed = selectedCriteria.find(c => c.id === criterionId);
    if (removed) {
      const newCriteria = selectedCriteria.filter(c => c.id !== criterionId);
      const balanced = autoBalance ? rebalanceWeights(newCriteria) : newCriteria;
      setSelectedCriteria(balanced);
      
      // Add back to available if it was from suggestions
      if (suggestedCriteria.find(c => c.id === criterionId)) {
        setAvailableCriteria(prev => [...prev, removed]);
      }
    }
  };

  const updateCriterionWeight = (criterionId: string, newWeight: number) => {
    const weight = Math.max(0, Math.min(100, newWeight));
    
    setSelectedCriteria(prev => prev.map(c => 
      c.id === criterionId ? { ...c, weight } : c
    ));
    
    console.log('[RubricBuilderEnhanced] Updated weight for', criterionId, 'to', weight);
  };

  const handleAddCustomCriterion = () => {
    // Validate and sanitize inputs
    const categoryValidation = validateAndSanitizeInput(customCriterion.category, { maxLength: 100, required: true });
    const descriptionValidation = validateAndSanitizeInput(customCriterion.description, { maxLength: 300, required: true });
    
    if (categoryValidation.isValid && descriptionValidation.isValid) {
      const newCriterion: RubricCriterion = {
        id: generateSecureId('criterion'),
        category: categoryValidation.sanitizedValue,
        description: descriptionValidation.sanitizedValue,
        weight: customCriterion.weight,
        levels: DEFAULT_LEVELS
      };
      
      addCriterion(newCriterion);
      setCustomCriterion({ category: '', description: '', weight: 25 });
      setShowCustomForm(false);
    }
  };

  const handleConfirm = () => {
    if (selectedCriteria.length < minCriteria) {
      setErrorMessage(`Please select at least ${minCriteria} criteria`);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    // Ensure weights sum to 100
    if (Math.abs(totalWeight - 100) > 0.01) {
      const balanced = rebalanceWeights(selectedCriteria);
      console.log('[RubricBuilderEnhanced] Auto-balancing weights before confirmation');
      onCriteriaConfirmed(balanced);
    } else {
      onCriteriaConfirmed(selectedCriteria);
    }
    
    console.log('[RubricBuilderEnhanced] Confirmed criteria with weights:', selectedCriteria.map(c => ({ 
      category: c.category, 
      weight: c.weight 
    })));
  };

  const canContinue = selectedCriteria.length >= minCriteria;

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('quality') || lowerCategory.includes('content')) return <Award className="w-4 h-4" />;
    if (lowerCategory.includes('collaboration') || lowerCategory.includes('team')) return <Target className="w-4 h-4" />;
    if (lowerCategory.includes('presentation') || lowerCategory.includes('communication')) return <Star className="w-4 h-4" />;
    if (lowerCategory.includes('process') || lowerCategory.includes('progress')) return <TrendingUp className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Build Your Assessment Rubric
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Select {minCriteria}-{maxCriteria} criteria to evaluate student work
        </p>
      </div>

      {/* Weight Balance Toggle */}
      <div className="flex justify-center">
        <label className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={autoBalance}
            onChange={(e) => {
              setAutoBalance(e.target.checked);
              if (e.target.checked) {
                setSelectedCriteria(rebalanceWeights(selectedCriteria));
              }
            }}
            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Auto-balance weights equally
          </span>
        </label>
      </div>

      {/* Weight Status */}
      {selectedCriteria.length > 0 && (
        <div className={`text-center p-3 rounded-lg ${
          Math.abs(totalWeight - 100) < 0.01 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {Math.abs(totalWeight - 100) < 0.01 ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="font-medium">
              Total Weight: {totalWeight}%
              {Math.abs(totalWeight - 100) > 0.01 && ` (should be 100%)`}
            </span>
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
            className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm text-center"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Selected Criteria */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Your Rubric Criteria ({selectedCriteria.length})
            </h4>
          </div>

          {selectedCriteria.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No criteria selected yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Click on suggestions to add them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {selectedCriteria.map((criterion, index) => (
                  <motion.div
                    key={criterion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-amber-600 dark:text-amber-400 mt-1">
                          {getCategoryIcon(criterion.category)}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                            {criterion.category}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {criterion.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeCriterion(criterion.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    {/* Weight Adjustment */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Weight:</span>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={criterion.weight}
                          onChange={(e) => updateCriterionWeight(criterion.id, parseInt(e.target.value))}
                          disabled={autoBalance}
                          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <div className="flex items-center gap-1 min-w-[60px]">
                          <Percent className="w-3 h-3 text-gray-500" />
                          <span className="font-medium text-amber-700 dark:text-amber-300">
                            {criterion.weight}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Level Preview */}
                    {criterion.levels && (
                      <div className="mt-3 grid grid-cols-4 gap-1">
                        {criterion.levels.map((level, idx) => (
                          <div
                            key={idx}
                            className="text-center p-2 bg-white dark:bg-gray-800 rounded text-xs"
                          >
                            <div className="font-medium text-gray-700 dark:text-gray-300">{level.level}</div>
                            <div className="text-gray-500 dark:text-gray-400">{level.points}pts</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Continue Button */}
          {selectedCriteria.length > 0 && (
            <Button
              onClick={handleConfirm}
              disabled={!canContinue}
              variant="primary"
              className="w-full"
            >
              Continue with {selectedCriteria.length} Criteria
            </Button>
          )}
        </div>

        {/* Right: Available Suggestions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Suggested Criteria
            </h4>
            <button
              onClick={onRequestNewSuggestions}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {availableCriteria.length === 0 ? (
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
              {availableCriteria.map((criterion) => (
                <motion.button
                  key={criterion.id}
                  onClick={() => addCriterion(criterion)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                      <Plus className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {criterion.category}
                        </h5>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-full">
                          {criterion.weight}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {criterion.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Custom Criterion Form */}
          {showCustomForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg space-y-3"
            >
              <input
                type="text"
                placeholder="Category (e.g., 'Research Quality')"
                value={customCriterion.category}
                onChange={(e) => setCustomCriterion({ ...customCriterion, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <textarea
                placeholder="Description of what will be assessed"
                value={customCriterion.description}
                onChange={(e) => setCustomCriterion({ ...customCriterion, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCustomCriterion}
                  variant="primary"
                  size="sm"
                  disabled={!customCriterion.category.trim() || !customCriterion.description.trim()}
                >
                  Add Criterion
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomCriterion({ category: '', description: '', weight: 25 });
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
              className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Custom Criterion
            </button>
          )}
        </div>
      </div>

      {/* Helper Text */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          💡 Tip: Weights determine how much each criterion contributes to the final grade. 
          {autoBalance ? ' Auto-balance is on - weights will be distributed equally.' : ' Adjust weights manually to emphasize important criteria.'}
        </p>
      </div>
    </div>
  );
});