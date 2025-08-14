/**
 * RubricBuilder.tsx
 * 
 * Advanced rubric component that auto-generates from learning journey
 * and provides full editing capabilities for educators
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Download, 
  Copy, 
  Save,
  ChevronDown,
  ChevronRight,
  Edit3,
  Check,
  X,
  FileText,
  Target,
  Users,
  Lightbulb,
  MessageSquare
} from 'lucide-react';
import { EnhancedButton } from '../ui/EnhancedButton';

// Types
export interface RubricLevel {
  label: string;
  description: string;
  points: number;
}

export interface RubricCriterion {
  id: string;
  category: 'content' | 'process' | 'product' | '21st-century';
  skill: string;
  description: string;
  levels: {
    emerging: RubricLevel;
    developing: RubricLevel;
    proficient: RubricLevel;
    advanced: RubricLevel;
  };
  weight: number; // Percentage of total grade
  source?: 'journey' | 'manual' | 'template'; // Where this criterion came from
}

export interface RubricTemplate {
  id: string;
  name: string;
  description: string;
  criteria: RubricCriterion[];
  gradeLevel: string[];
  subject: string[];
}

interface RubricBuilderProps {
  projectData: any; // Will contain journey phases and activities
  onSave: (rubric: RubricCriterion[]) => void;
  initialRubric?: RubricCriterion[];
  readOnly?: boolean;
}

// Icon mapping for categories
const categoryIcons = {
  'content': <FileText className="w-4 h-4" />,
  'process': <Target className="w-4 h-4" />,
  'product': <Lightbulb className="w-4 h-4" />,
  '21st-century': <Users className="w-4 h-4" />
};

const categoryColors = {
  'content': 'primary',
  'process': 'coral',
  'product': 'success',
  '21st-century': 'ai'
};

// Default 21st Century Skills that should be in every rubric
const default21stCenturySkills: Partial<RubricCriterion>[] = [
  {
    category: '21st-century',
    skill: 'Critical Thinking',
    description: 'Analyzes information, evaluates evidence, and makes reasoned decisions',
    weight: 15
  },
  {
    category: '21st-century',
    skill: 'Collaboration',
    description: 'Works effectively with others, contributes to team goals, and resolves conflicts',
    weight: 15
  },
  {
    category: '21st-century',
    skill: 'Communication',
    description: 'Clearly expresses ideas through writing, speaking, and visual media',
    weight: 15
  },
  {
    category: '21st-century',
    skill: 'Creativity',
    description: 'Generates innovative solutions and approaches problems from multiple perspectives',
    weight: 15
  }
];

// Rubric templates for common project types
const rubricTemplates: RubricTemplate[] = [
  {
    id: 'research-project',
    name: 'Research Project',
    description: 'Comprehensive rubric for research-based projects',
    gradeLevel: ['9-12'],
    subject: ['Science', 'Social Studies', 'English'],
    criteria: [
      {
        id: 'research-1',
        category: 'content',
        skill: 'Research Quality',
        description: 'Uses credible sources and demonstrates thorough investigation',
        levels: {
          emerging: { label: 'Emerging', description: 'Uses 1-2 sources, limited investigation', points: 1 },
          developing: { label: 'Developing', description: 'Uses 3-4 sources, basic investigation', points: 2 },
          proficient: { label: 'Proficient', description: 'Uses 5+ credible sources, thorough investigation', points: 3 },
          advanced: { label: 'Advanced', description: 'Uses diverse, scholarly sources with deep investigation', points: 4 }
        },
        weight: 20,
        source: 'template'
      },
      // Add more template criteria...
    ]
  },
  {
    id: 'design-challenge',
    name: 'Design Challenge',
    description: 'Rubric for engineering and design thinking projects',
    gradeLevel: ['6-12'],
    subject: ['STEM', 'Engineering', 'Art'],
    criteria: [
      {
        id: 'design-1',
        category: 'process',
        skill: 'Design Process',
        description: 'Follows iterative design process with testing and refinement',
        levels: {
          emerging: { label: 'Emerging', description: 'Minimal iteration, limited testing', points: 1 },
          developing: { label: 'Developing', description: 'Some iteration, basic testing', points: 2 },
          proficient: { label: 'Proficient', description: 'Multiple iterations with systematic testing', points: 3 },
          advanced: { label: 'Advanced', description: 'Extensive iteration with data-driven refinements', points: 4 }
        },
        weight: 25,
        source: 'template'
      }
    ]
  }
];

export const RubricBuilder: React.FC<RubricBuilderProps> = ({
  projectData,
  onSave,
  initialRubric = [],
  readOnly = false
}) => {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(initialRubric);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [totalWeight, setTotalWeight] = useState(0);

  // Auto-generate criteria from journey phases on mount
  useEffect(() => {
    if (criteria.length === 0 && projectData?.journey?.phases) {
      generateCriteriaFromJourney();
    }
  }, [projectData]);

  // Calculate total weight whenever criteria change
  useEffect(() => {
    const total = criteria.reduce((sum, c) => sum + c.weight, 0);
    setTotalWeight(total);
  }, [criteria]);

  // Generate criteria from journey phases
  const generateCriteriaFromJourney = () => {
    const generatedCriteria: RubricCriterion[] = [];
    
    // Extract skills from each journey phase
    if (projectData?.journey?.phases) {
      projectData.journey.phases.forEach((phase: any, index: number) => {
        if (phase.name && phase.activities) {
          // Create a criterion for each phase
          generatedCriteria.push({
            id: `journey-${index}`,
            category: 'process',
            skill: `${phase.name} Phase Completion`,
            description: `Successfully completes activities and achieves goals of the ${phase.name} phase`,
            levels: {
              emerging: {
                label: 'Emerging',
                description: `Minimal completion of ${phase.name} activities`,
                points: 1
              },
              developing: {
                label: 'Developing',
                description: `Partial completion with basic understanding`,
                points: 2
              },
              proficient: {
                label: 'Proficient',
                description: `Full completion with solid understanding`,
                points: 3
              },
              advanced: {
                label: 'Advanced',
                description: `Exceeds expectations with innovative approach`,
                points: 4
              }
            },
            weight: 10,
            source: 'journey'
          });
        }
      });
    }

    // Add default 21st century skills
    default21stCenturySkills.forEach((skill, index) => {
      generatedCriteria.push({
        id: `21c-${index}`,
        ...skill,
        levels: {
          emerging: {
            label: 'Emerging',
            description: `Beginning to develop ${skill.skill?.toLowerCase()} skills`,
            points: 1
          },
          developing: {
            label: 'Developing',
            description: `Developing ${skill.skill?.toLowerCase()} with some guidance`,
            points: 2
          },
          proficient: {
            label: 'Proficient',
            description: `Consistently demonstrates ${skill.skill?.toLowerCase()}`,
            points: 3
          },
          advanced: {
            label: 'Advanced',
            description: `Exceptional ${skill.skill?.toLowerCase()} beyond grade level`,
            points: 4
          }
        },
        source: 'manual'
      } as RubricCriterion);
    });

    // Add content mastery criterion
    if (projectData?.ideation?.bigIdea) {
      generatedCriteria.unshift({
        id: 'content-mastery',
        category: 'content',
        skill: 'Content Mastery',
        description: `Demonstrates understanding of ${projectData.ideation.bigIdea}`,
        levels: {
          emerging: {
            label: 'Emerging',
            description: 'Basic understanding with significant gaps',
            points: 1
          },
          developing: {
            label: 'Developing',
            description: 'Developing understanding with some misconceptions',
            points: 2
          },
          proficient: {
            label: 'Proficient',
            description: 'Solid understanding of key concepts',
            points: 3
          },
          advanced: {
            label: 'Advanced',
            description: 'Deep understanding with ability to apply and extend',
            points: 4
          }
        },
        weight: 20,
        source: 'journey'
      });
    }

    setCriteria(generatedCriteria);
  };

  // Add new criterion
  const addCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: `custom-${Date.now()}`,
      category: 'content',
      skill: 'New Criterion',
      description: 'Click to edit description',
      levels: {
        emerging: { label: 'Emerging', description: '', points: 1 },
        developing: { label: 'Developing', description: '', points: 2 },
        proficient: { label: 'Proficient', description: '', points: 3 },
        advanced: { label: 'Advanced', description: '', points: 4 }
      },
      weight: 10,
      source: 'manual'
    };
    setCriteria([...criteria, newCriterion]);
    setEditingId(newCriterion.id);
  };

  // Delete criterion
  const deleteCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  // Update criterion
  const updateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Update level description
  const updateLevel = (
    criterionId: string, 
    level: 'emerging' | 'developing' | 'proficient' | 'advanced',
    field: 'description' | 'points',
    value: string | number
  ) => {
    setCriteria(criteria.map(c => {
      if (c.id === criterionId) {
        return {
          ...c,
          levels: {
            ...c.levels,
            [level]: {
              ...c.levels[level],
              [field]: value
            }
          }
        };
      }
      return c;
    }));
  };

  // Apply template
  const applyTemplate = (template: RubricTemplate) => {
    setCriteria([...criteria, ...template.criteria]);
    setShowTemplates(false);
  };

  // Export functions
  const exportAsPDF = () => {
    // This would integrate with a PDF library
    console.log('Exporting as PDF...');
  };

  const copyToClipboard = () => {
    // Format rubric as text and copy
    const rubricText = formatRubricAsText();
    navigator.clipboard.writeText(rubricText);
  };

  const formatRubricAsText = () => {
    let text = 'PROJECT RUBRIC\n\n';
    
    criteria.forEach(c => {
      text += `${c.skill} (${c.weight}%)\n`;
      text += `${c.description}\n\n`;
      text += 'Advanced (4): ' + c.levels.advanced.description + '\n';
      text += 'Proficient (3): ' + c.levels.proficient.description + '\n';
      text += 'Developing (2): ' + c.levels.developing.description + '\n';
      text += 'Emerging (1): ' + c.levels.emerging.description + '\n';
      text += '\n---\n\n';
    });
    
    return text;
  };

  // Group criteria by category
  const groupedCriteria = criteria.reduce((acc, criterion) => {
    if (!acc[criterion.category]) {
      acc[criterion.category] = [];
    }
    acc[criterion.category].push(criterion);
    return acc;
  }, {} as Record<string, RubricCriterion[]>);

  const categoryLabels = {
    'content': 'Content Knowledge',
    'process': 'Process Skills',
    'product': 'Product Quality',
    '21st-century': '21st Century Skills'
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Rubric</h2>
        <p className="text-gray-600">
          Auto-generated from your learning journey. Click any field to edit.
        </p>
      </div>

      {/* Weight Status Bar */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Total Weight:</span>
          <span className={`text-sm font-bold ${totalWeight === 100 ? 'text-success-600' : 'text-warning-600'}`}>
            {totalWeight}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              totalWeight === 100 ? 'bg-success-500' : totalWeight > 100 ? 'bg-error-500' : 'bg-warning-500'
            }`}
            style={{ width: `${Math.min(totalWeight, 100)}%` }}
          />
        </div>
        {totalWeight !== 100 && (
          <p className="text-xs text-warning-600 mt-1">
            Weights should total 100% for proper grading
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {!readOnly && (
        <div className="flex flex-wrap gap-3 mb-6">
          <EnhancedButton
            variant="filled"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={addCriterion}
          >
            Add Criterion
          </EnhancedButton>
          
          <EnhancedButton
            variant="tonal"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            onClick={() => setShowTemplates(!showTemplates)}
          >
            Use Template
          </EnhancedButton>
          
          <div className="ml-auto flex gap-2">
            <EnhancedButton
              variant="outlined"
              size="sm"
              leftIcon={<Copy className="w-4 h-4" />}
              onClick={copyToClipboard}
            >
              Copy
            </EnhancedButton>
            
            <EnhancedButton
              variant="outlined"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={exportAsPDF}
            >
              Export PDF
            </EnhancedButton>
            
            <EnhancedButton
              variant="filled"
              size="sm"
              color="success"
              leftIcon={<Save className="w-4 h-4" />}
              onClick={() => onSave(criteria)}
            >
              Save Rubric
            </EnhancedButton>
          </div>
        </div>
      )}

      {/* Template Selector */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <div className="p-4 bg-primary-50 rounded-xl border-2 border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-3">Available Templates</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {rubricTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-4 bg-white rounded-lg border border-primary-200 hover:border-primary-400 
                             transition-all duration-200 text-left hover:shadow-md"
                  >
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                        {template.gradeLevel.join(', ')}
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        {template.criteria.length} criteria
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rubric Table */}
      <div className="space-y-4">
        {Object.entries(groupedCriteria).map(([category, categoryCriteria]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => {
                const newCollapsed = new Set(collapsedCategories);
                if (newCollapsed.has(category)) {
                  newCollapsed.delete(category);
                } else {
                  newCollapsed.add(category);
                }
                setCollapsedCategories(newCollapsed);
              }}
              className={`w-full px-6 py-3 flex items-center justify-between
                       bg-gradient-to-r from-${categoryColors[category as keyof typeof categoryColors]}-50 
                       to-${categoryColors[category as keyof typeof categoryColors]}-100
                       hover:from-${categoryColors[category as keyof typeof categoryColors]}-100 
                       hover:to-${categoryColors[category as keyof typeof categoryColors]}-150
                       transition-colors duration-200`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-white rounded-lg text-${categoryColors[category as keyof typeof categoryColors]}-600`}>
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                <span className="text-sm text-gray-600">
                  ({categoryCriteria.length} criteria, {categoryCriteria.reduce((sum, c) => sum + c.weight, 0)}% weight)
                </span>
              </div>
              {collapsedCategories.has(category) ? 
                <ChevronRight className="w-5 h-5 text-gray-600" /> : 
                <ChevronDown className="w-5 h-5 text-gray-600" />
              }
            </button>

            {/* Category Criteria */}
            <AnimatePresence>
              {!collapsedCategories.has(category) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {categoryCriteria.map(criterion => (
                      <RubricRow
                        key={criterion.id}
                        criterion={criterion}
                        isEditing={editingId === criterion.id}
                        editingField={editingField}
                        readOnly={readOnly}
                        onEdit={() => setEditingId(criterion.id)}
                        onDelete={() => deleteCriterion(criterion.id)}
                        onUpdate={(updates) => updateCriterion(criterion.id, updates)}
                        onUpdateLevel={(level, field, value) => 
                          updateLevel(criterion.id, level, field, value)
                        }
                        onStopEditing={() => {
                          setEditingId(null);
                          setEditingField(null);
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {criteria.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Criteria Yet</h3>
          <p className="text-gray-600 mb-4">
            Start by adding criteria or using a template
          </p>
          <EnhancedButton
            variant="filled"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={addCriterion}
          >
            Add First Criterion
          </EnhancedButton>
        </div>
      )}
    </div>
  );
};

// Rubric Row Component
const RubricRow: React.FC<{
  criterion: RubricCriterion;
  isEditing: boolean;
  editingField: string | null;
  readOnly: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<RubricCriterion>) => void;
  onUpdateLevel: (
    level: 'emerging' | 'developing' | 'proficient' | 'advanced',
    field: 'description' | 'points',
    value: string | number
  ) => void;
  onStopEditing: () => void;
}> = ({
  criterion,
  isEditing,
  editingField,
  readOnly,
  onEdit,
  onDelete,
  onUpdate,
  onUpdateLevel,
  onStopEditing
}) => {
  const [localSkill, setLocalSkill] = useState(criterion.skill);
  const [localDescription, setLocalDescription] = useState(criterion.description);
  const [localWeight, setLocalWeight] = useState(criterion.weight);

  const handleSave = () => {
    onUpdate({
      skill: localSkill,
      description: localDescription,
      weight: localWeight
    });
    onStopEditing();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={localSkill}
                onChange={(e) => setLocalSkill(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Skill name"
              />
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Description"
                rows={2}
              />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Weight:</label>
                <input
                  type="number"
                  value={localWeight}
                  onChange={(e) => setLocalWeight(Number(e.target.value))}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-600">%</span>
              </div>
            </div>
          ) : (
            <>
              <h4 className="font-semibold text-gray-900">{criterion.skill}</h4>
              <p className="text-sm text-gray-600 mt-1">{criterion.description}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                  {criterion.weight}% weight
                </span>
                {criterion.source === 'journey' && (
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                    From Journey
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2 ml-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="p-1 text-success-600 hover:bg-success-50 rounded"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={onStopEditing}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1 text-error-600 hover:bg-error-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Performance Levels */}
      <div className="grid grid-cols-4 gap-2">
        {(['advanced', 'proficient', 'developing', 'emerging'] as const).map(level => (
          <div key={level} className="space-y-2">
            <div className={`px-3 py-1 rounded-lg text-center text-sm font-medium
              ${level === 'advanced' ? 'bg-success-100 text-success-700' :
                level === 'proficient' ? 'bg-primary-100 text-primary-700' :
                level === 'developing' ? 'bg-warning-100 text-warning-700' :
                'bg-gray-100 text-gray-700'}`}
            >
              {criterion.levels[level].label} ({criterion.levels[level].points})
            </div>
            {readOnly ? (
              <p className="text-xs text-gray-600 px-2">
                {criterion.levels[level].description}
              </p>
            ) : (
              <textarea
                value={criterion.levels[level].description}
                onChange={(e) => onUpdateLevel(level, 'description', e.target.value)}
                className="w-full px-2 py-1 text-xs border border-gray-200 rounded 
                         focus:ring-1 focus:ring-primary-500 resize-none"
                placeholder={`${level} level description`}
                rows={3}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RubricBuilder;