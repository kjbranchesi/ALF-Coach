import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Plus, X, Award, Star, Target, TrendingUp } from 'lucide-react';
import { Button } from '../../ui/Button';
import { generateSecureId } from '../../../core/utils/idGeneration';
import { validateAndSanitizeInput } from '../../../core/utils/inputSanitization';

interface RubricCriterion {
  id: string;
  category: string;
  description: string;
  weight?: number;
  levels?: {
    level: string;
    description: string;
    points: number;
  }[];
}

interface RubricBuilderProps {
  suggestedCriteria: RubricCriterion[];
  onCriteriaConfirmed: (criteria: RubricCriterion[]) => void;
  onRequestNewSuggestions: () => void;
  minCriteria?: number;
  maxCriteria?: number;
}

const DEFAULT_LEVELS = [
  { level: 'Exceeds', description: 'Exceptional work', points: 4 },
  { level: 'Meets', description: 'Proficient work', points: 3 },
  { level: 'Approaching', description: 'Developing work', points: 2 },
  { level: 'Beginning', description: 'Needs improvement', points: 1 }
];

export const RubricBuilder: React.FC<RubricBuilderProps> = ({
  suggestedCriteria,
  onCriteriaConfirmed,
  onRequestNewSuggestions,
  minCriteria = 3,
  maxCriteria = 8
}) => {
  const [selectedCriteria, setSelectedCriteria] = useState<Set<string>>(new Set());
  const [customCriterion, setCustomCriterion] = useState({ category: '', description: '', weight: 25 });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [localCriteria, setLocalCriteria] = useState(suggestedCriteria);

  const handleToggleCriterion = (criterion: RubricCriterion) => {
    const newSelected = new Set(selectedCriteria);
    if (newSelected.has(criterion.id)) {
      newSelected.delete(criterion.id);
    } else if (newSelected.size < maxCriteria) {
      newSelected.add(criterion.id);
    }
    setSelectedCriteria(newSelected);
  };

  const handleAddCustomCriterion = () => {
    // Validate and sanitize inputs
    const categoryValidation = validateAndSanitizeInput(customCriterion.category, { maxLength: 100, required: true });
    const descriptionValidation = validateAndSanitizeInput(customCriterion.description, { maxLength: 300, required: true });
    
    // Validate weight is within reasonable bounds
    const weight = Math.max(0, Math.min(100, customCriterion.weight || 25));
    
    if (categoryValidation.isValid && descriptionValidation.isValid) {
      const newCriterion: RubricCriterion = {
        id: generateSecureId('criterion'),
        category: categoryValidation.sanitizedValue,
        description: descriptionValidation.sanitizedValue,
        weight: weight,
        levels: DEFAULT_LEVELS
      };
      setLocalCriteria([...localCriteria, newCriterion]);
      setSelectedCriteria(new Set([...selectedCriteria, newCriterion.id]));
      setCustomCriterion({ category: '', description: '', weight: 25 });
      setShowCustomForm(false);
    }
  };

  const handleConfirm = () => {
    const selected = localCriteria.filter(c => selectedCriteria.has(c.id));
    onCriteriaConfirmed(selected);
  };

  const canContinue = selectedCriteria.size >= minCriteria;

  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('quality') || lowerCategory.includes('content')) return <Award className="w-4 h-4" />;
    if (lowerCategory.includes('collaboration') || lowerCategory.includes('team')) return <Target className="w-4 h-4" />;
    if (lowerCategory.includes('presentation') || lowerCategory.includes('communication')) return <Star className="w-4 h-4" />;
    if (lowerCategory.includes('process') || lowerCategory.includes('progress')) return <TrendingUp className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Assessment Rubric</h3>
            <p className="text-sm text-gray-600">
              Select {minCriteria}-{maxCriteria} criteria to evaluate student work
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {localCriteria.map((criterion) => {
              const isSelected = selectedCriteria.has(criterion.id);
              return (
                <motion.div
                  key={criterion.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-md'
                  }`}
                  onClick={() => handleToggleCriterion(criterion)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 transition-colors ${isSelected ? 'text-amber-600' : 'text-gray-400'}`}>
                      {getCategoryIcon(criterion.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{criterion.category}</h4>
                        {criterion.weight && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            {criterion.weight}%
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{criterion.description}</p>
                      
                      {criterion.levels && (
                        <div className="mt-3 flex gap-1">
                          {criterion.levels.map((level, idx) => (
                            <div
                              key={idx}
                              className="flex-1 text-center p-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded text-xs"
                            >
                              <div className="font-medium text-gray-700">{level.level}</div>
                              <div className="text-gray-500">{level.points}pts</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center"
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
            className="mt-4 p-4 bg-white rounded-lg border-2 border-dashed border-amber-300"
          >
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Category (e.g., 'Research Quality')"
                value={customCriterion.category}
                onChange={(e) => setCustomCriterion({ ...customCriterion, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              <textarea
                placeholder="Description of what will be assessed"
                value={customCriterion.description}
                onChange={(e) => setCustomCriterion({ ...customCriterion, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Weight:</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={customCriterion.weight}
                  onChange={(e) => setCustomCriterion({ ...customCriterion, weight: parseInt(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddCustomCriterion}
                  disabled={!customCriterion.category || !customCriterion.description}
                  className="flex-1"
                >
                  Add Criterion
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomCriterion({ category: '', description: '', weight: 25 });
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
            className="mt-4 w-full p-3 border-2 border-dashed border-amber-300 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Custom Criterion
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedCriteria.size} of {minCriteria} minimum criteria selected
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
            Continue ({selectedCriteria.size}/{minCriteria})
          </Button>
        </div>
      </div>
    </div>
  );
};