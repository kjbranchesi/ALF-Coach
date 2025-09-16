/**
 * RubricBuilder.tsx
 * 
 * Comprehensive rubric creation and management system
 * Part of Sprint 4: Assessment and Rubrics
 * 
 * FEATURES:
 * - Customizable assessment criteria
 * - Multiple rubric types (holistic, analytical, single-point)
 * - Grade-level appropriate language
 * - Standards alignment
 * - Export functionality
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3,
  Plus,
  Trash2,
  Edit3,
  Save,
  Download,
  Upload,
  Copy,
  Check,
  AlertCircle,
  Info,
  Star,
  Target,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
  Unlock
} from 'lucide-react';
import { PhaseType, GradeLevel } from '../types';

export type RubricType = 'holistic' | 'analytical' | 'single_point' | 'developmental';

export type PerformanceLevel = 'exemplary' | 'proficient' | 'developing' | 'beginning';

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // Percentage weight (0-100)
  levels: RubricLevel[];
  essential: boolean; // Must meet to pass
  phaseAlignment?: PhaseType;
  standardsAlignment?: string[];
}

export interface RubricLevel {
  level: PerformanceLevel;
  description: string;
  points: number;
  indicators: string[];
}

export interface Rubric {
  id: string;
  name: string;
  type: RubricType;
  description: string;
  gradeLevel: GradeLevel;
  criteria: RubricCriterion[];
  totalPoints: number;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  published: boolean;
}

interface RubricBuilderProps {
  initialRubric?: Rubric;
  gradeLevel: GradeLevel;
  projectPhases: PhaseType[];
  onSave: (rubric: Rubric) => void;
  onPublish?: (rubric: Rubric) => void;
  templates?: Rubric[];
  className?: string;
}

// Default performance levels with grade-appropriate language
const PERFORMANCE_LEVELS: Record<GradeLevel, Record<PerformanceLevel, { label: string; color: string; points: number }>> = {
  elementary: {
    exemplary: { label: 'Amazing!', color: 'green', points: 4 },
    proficient: { label: 'Great Job!', color: 'blue', points: 3 },
    developing: { label: 'Getting There', color: 'yellow', points: 2 },
    beginning: { label: 'Keep Trying', color: 'gray', points: 1 }
  },
  middle: {
    exemplary: { label: 'Exceeds Expectations', color: 'green', points: 4 },
    proficient: { label: 'Meets Expectations', color: 'blue', points: 3 },
    developing: { label: 'Approaching', color: 'yellow', points: 2 },
    beginning: { label: 'Beginning', color: 'gray', points: 1 }
  },
  high: {
    exemplary: { label: 'Exemplary', color: 'green', points: 4 },
    proficient: { label: 'Proficient', color: 'blue', points: 3 },
    developing: { label: 'Developing', color: 'yellow', points: 2 },
    beginning: { label: 'Emerging', color: 'gray', points: 1 }
  }
};

// Sample criteria templates
const CRITERIA_TEMPLATES: Partial<RubricCriterion>[] = [
  {
    name: 'Problem Understanding',
    description: 'Demonstrates clear understanding of the problem and its context',
    weight: 20,
    essential: true,
    phaseAlignment: 'ANALYZE'
  },
  {
    name: 'Creative Solutions',
    description: 'Generates innovative and feasible solutions',
    weight: 20,
    essential: false,
    phaseAlignment: 'BRAINSTORM'
  },
  {
    name: 'Implementation Quality',
    description: 'Executes solution with attention to detail and quality',
    weight: 25,
    essential: true,
    phaseAlignment: 'PROTOTYPE'
  },
  {
    name: 'Critical Reflection',
    description: 'Reflects thoughtfully on process and outcomes',
    weight: 15,
    essential: false,
    phaseAlignment: 'EVALUATE'
  },
  {
    name: 'Collaboration',
    description: 'Works effectively with team members',
    weight: 10,
    essential: false
  },
  {
    name: 'Communication',
    description: 'Presents ideas clearly and professionally',
    weight: 10,
    essential: false
  }
];

export const RubricBuilder: React.FC<RubricBuilderProps> = ({
  initialRubric,
  gradeLevel,
  projectPhases,
  onSave,
  onPublish,
  templates = [],
  className = ''
}) => {
  const [rubric, setRubric] = useState<Rubric>(initialRubric || {
    id: Date.now().toString(),
    name: 'New Assessment Rubric',
    type: 'analytical',
    description: '',
    gradeLevel,
    criteria: [],
    totalPoints: 0,
    passingScore: 70,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    published: false
  });

  const [editingCriterion, setEditingCriterion] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  // Calculate total points and weights
  const calculations = useMemo(() => {
    const totalWeight = rubric.criteria.reduce((sum, c) => sum + c.weight, 0);
    const maxPoints = rubric.criteria.reduce((sum, c) => {
      const maxLevel = Math.max(...c.levels.map(l => l.points));
      return sum + maxLevel;
    }, 0);
    
    const weightedMaxPoints = rubric.criteria.reduce((sum, c) => {
      const maxLevel = Math.max(...c.levels.map(l => l.points));
      return sum + (maxLevel * c.weight / 100);
    }, 0);

    return {
      totalWeight,
      maxPoints,
      weightedMaxPoints,
      isWeightValid: Math.abs(totalWeight - 100) < 0.01
    };
  }, [rubric.criteria]);

  // Add new criterion
  const addCriterion = useCallback((template?: Partial<RubricCriterion>) => {
    const performanceLevels = PERFORMANCE_LEVELS[gradeLevel];
    const newCriterion: RubricCriterion = {
      id: Date.now().toString(),
      name: template?.name || 'New Criterion',
      description: template?.description || '',
      weight: template?.weight || 10,
      levels: Object.entries(performanceLevels).map(([level, config]) => ({
        level: level as PerformanceLevel,
        description: '',
        points: config.points,
        indicators: []
      })),
      essential: template?.essential || false,
      phaseAlignment: template?.phaseAlignment,
      standardsAlignment: template?.standardsAlignment || []
    };

    setRubric(prev => ({
      ...prev,
      criteria: [...prev.criteria, newCriterion],
      updatedAt: new Date()
    }));
  }, [gradeLevel]);

  // Update criterion
  const updateCriterion = useCallback((criterionId: string, updates: Partial<RubricCriterion>) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => 
        c.id === criterionId ? { ...c, ...updates } : c
      ),
      updatedAt: new Date()
    }));
  }, []);

  // Delete criterion
  const deleteCriterion = useCallback((criterionId: string) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.filter(c => c.id !== criterionId),
      updatedAt: new Date()
    }));
  }, []);

  // Update level description
  const updateLevelDescription = useCallback((
    criterionId: string,
    level: PerformanceLevel,
    description: string
  ) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => {
        if (c.id === criterionId) {
          return {
            ...c,
            levels: c.levels.map(l => 
              l.level === level ? { ...l, description } : l
            )
          };
        }
        return c;
      }),
      updatedAt: new Date()
    }));
  }, []);

  // Add indicator to level
  const addIndicator = useCallback((
    criterionId: string,
    level: PerformanceLevel,
    indicator: string
  ) => {
    if (!indicator.trim()) return;

    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => {
        if (c.id === criterionId) {
          return {
            ...c,
            levels: c.levels.map(l => 
              l.level === level 
                ? { ...l, indicators: [...l.indicators, indicator] }
                : l
            )
          };
        }
        return c;
      }),
      updatedAt: new Date()
    }));
  }, []);

  // Remove indicator
  const removeIndicator = useCallback((
    criterionId: string,
    level: PerformanceLevel,
    indicatorIndex: number
  ) => {
    setRubric(prev => ({
      ...prev,
      criteria: prev.criteria.map(c => {
        if (c.id === criterionId) {
          return {
            ...c,
            levels: c.levels.map(l => 
              l.level === level 
                ? { ...l, indicators: l.indicators.filter((_, i) => i !== indicatorIndex) }
                : l
            )
          };
        }
        return c;
      }),
      updatedAt: new Date()
    }));
  }, []);

  // Validate rubric
  const validateRubric = useCallback((): boolean => {
    const errors: string[] = [];

    if (!rubric.name.trim()) {
      errors.push('Rubric name is required');
    }

    if (rubric.criteria.length === 0) {
      errors.push('At least one criterion is required');
    }

    if (!calculations.isWeightValid && rubric.type === 'analytical') {
      errors.push('Criterion weights must total 100%');
    }

    rubric.criteria.forEach(criterion => {
      if (!criterion.name.trim()) {
        errors.push(`Criterion "${criterion.name}" needs a name`);
      }
      
      const hasDescriptions = criterion.levels.some(l => l.description.trim());
      if (!hasDescriptions) {
        errors.push(`Criterion "${criterion.name}" needs at least one level description`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  }, [rubric, calculations]);

  // Save rubric
  const handleSave = useCallback(() => {
    if (validateRubric()) {
      const updatedRubric = {
        ...rubric,
        totalPoints: calculations.maxPoints,
        updatedAt: new Date(),
        version: rubric.version + 1
      };
      onSave(updatedRubric);
    }
  }, [rubric, calculations, validateRubric, onSave]);

  // Publish rubric
  const handlePublish = useCallback(() => {
    if (validateRubric() && onPublish) {
      const publishedRubric = {
        ...rubric,
        published: true,
        updatedAt: new Date()
      };
      onPublish(publishedRubric);
    }
  }, [rubric, validateRubric, onPublish]);

  // Export rubric
  const exportRubric = useCallback((format: 'json' | 'csv' | 'pdf') => {
    const data = {
      ...rubric,
      exportDate: new Date().toISOString(),
      gradeLevel,
      calculations
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${rubric.name.replace(/\s+/g, '_')}_rubric.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
    // Additional export formats can be implemented
  }, [rubric, gradeLevel, calculations]);

  // Import rubric from template
  const importTemplate = useCallback((template: Rubric) => {
    setRubric({
      ...template,
      id: Date.now().toString(),
      gradeLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      published: false
    });
    setShowTemplates(false);
  }, [gradeLevel]);

  const performanceLevels = PERFORMANCE_LEVELS[gradeLevel];

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={rubric.name}
              onChange={(e) => setRubric(prev => ({ ...prev, name: e.target.value }))}
              className="text-xl font-bold text-gray-900 bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="Rubric Name"
              disabled={previewMode}
            />
            <textarea
              value={rubric.description}
              onChange={(e) => setRubric(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a description..."
              className="mt-2 w-full text-sm text-gray-600 bg-transparent resize-none focus:outline-none"
              rows={2}
              disabled={previewMode}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                previewMode
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {previewMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Upload className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => exportRubric('json')}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Rubric Type Selector */}
        <div className="mt-4 flex items-center gap-4">
          <label className="text-sm text-gray-600">Type:</label>
          <select
            value={rubric.type}
            onChange={(e) => setRubric(prev => ({ ...prev, type: e.target.value as RubricType }))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={previewMode}
          >
            <option value="analytical">Analytical</option>
            <option value="holistic">Holistic</option>
            <option value="single_point">Single Point</option>
            <option value="developmental">Developmental</option>
          </select>
          <div className="flex-1" />
          <div className="text-sm text-gray-600">
            Total Weight: <span className={calculations.isWeightValid ? 'text-green-600' : 'text-red-600'}>
              {calculations.totalWeight}%
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Max Points: <span className="font-medium">{calculations.maxPoints}</span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-900">Please fix the following issues:</h4>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {validationErrors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Templates Panel */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Add Criteria</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CRITERIA_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => addCriterion(template)}
                    className="p-2 text-left bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500 mt-1">Weight: {template.weight}%</div>
                  </button>
                ))}
              </div>
              
              {templates.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-700 mt-4 mb-3">Saved Templates</h3>
                  <div className="space-y-2">
                    {templates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => importTemplate(template)}
                        className="w-full p-3 text-left bg-white border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{template.name}</div>
                            <div className="text-sm text-gray-600">{template.description}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {template.criteria.length} criteria
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Criteria Grid */}
      <div className="p-6">
        {rubric.criteria.length === 0 ? (
          <div className="text-center py-12">
            <Grid3x3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Criteria Yet</h3>
            <p className="text-gray-600 mb-4">Start building your rubric by adding assessment criteria</p>
            <button
              onClick={() => addCriterion()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Criterion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {rubric.criteria.map((criterion, criterionIdx) => (
              <motion.div
                key={criterion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Criterion Header */}
                <div className="bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingCriterion === criterion.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={criterion.name}
                            onChange={(e) => updateCriterion(criterion.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Criterion name"
                          />
                          <textarea
                            value={criterion.description}
                            onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Description"
                            rows={2}
                          />
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">Weight:</label>
                              <input
                                type="number"
                                value={criterion.weight}
                                onChange={(e) => updateCriterion(criterion.id, { weight: parseInt(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={criterion.essential}
                                onChange={(e) => updateCriterion(criterion.id, { essential: e.target.checked })}
                                className="text-primary-600"
                              />
                              <span className="text-gray-600">Essential</span>
                            </label>
                            <button
                              onClick={() => setEditingCriterion(null)}
                              className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{criterion.name}</h4>
                            {criterion.essential && (
                              <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                                Essential
                              </span>
                            )}
                            {criterion.phaseAlignment && (
                              <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                                {criterion.phaseAlignment}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">({criterion.weight}%)</span>
                          </div>
                          {criterion.description && (
                            <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {!previewMode && (
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingCriterion(
                            editingCriterion === criterion.id ? null : criterion.id
                          )}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCriterion(criterion.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Levels Grid */}
                <div className="grid grid-cols-4 divide-x divide-gray-200">
                  {Object.entries(performanceLevels).map(([level, config]) => {
                    const levelData = criterion.levels.find(l => l.level === level);
                    return (
                      <div key={level} className="p-4">
                        <div className={`text-sm font-medium mb-2 text-${config.color}-700`}>
                          {config.label}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          {config.points} points
                        </div>
                        
                        {!previewMode ? (
                          <textarea
                            value={levelData?.description || ''}
                            onChange={(e) => updateLevelDescription(criterion.id, level as PerformanceLevel, e.target.value)}
                            placeholder="Describe this performance level..."
                            className="w-full p-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-gray-700">
                            {levelData?.description || <span className="text-gray-400 italic">No description</span>}
                          </p>
                        )}

                        {/* Indicators */}
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-600 mb-1">Indicators:</div>
                          <ul className="space-y-1">
                            {levelData?.indicators.map((indicator, idx) => (
                              <li key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                                <span className="text-gray-400">•</span>
                                <span className="flex-1">{indicator}</span>
                                {!previewMode && (
                                  <button
                                    onClick={() => removeIndicator(criterion.id, level as PerformanceLevel, idx)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                          {!previewMode && (
                            <button
                              onClick={() => {
                                const indicator = prompt('Add indicator:');
                                if (indicator) {
                                  addIndicator(criterion.id, level as PerformanceLevel, indicator);
                                }
                              }}
                              className="mt-2 text-xs text-primary-600 hover:text-primary-700"
                            >
                              + Add indicator
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}

            {!previewMode && (
              <button
                onClick={() => addCriterion()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Criterion
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {rubric.published ? (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="w-4 h-4" />
                Published
              </span>
            ) : (
              <span>Draft • Version {rubric.version}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!calculations.isWeightValid && rubric.type === 'analytical'}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            {onPublish && (
              <button
                onClick={handlePublish}
                disabled={!calculations.isWeightValid && rubric.type === 'analytical'}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Publish Rubric
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};