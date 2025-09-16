/**
 * PhasePanel.tsx
 * 
 * Individual phase panel component extracted from main CreativeProcessJourney
 * Addresses code review concerns about component size and separation of concerns
 * 
 * IMPROVEMENTS:
 * - Focused single responsibility
 * - Better accessibility with ARIA attributes
 * - Memoized for performance
 * - Proper error handling
 * - Mobile responsive design
 */

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Users,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Plus,
  AlertCircle
} from 'lucide-react';
import { 
  CreativePhase, 
  PhaseObjective, 
  PhaseActivity, 
  PhaseDeliverable 
} from '../types';

interface PhasePanelProps {
  phase: CreativePhase;
  index: number;
  isExpanded: boolean;
  isCurrent: boolean;
  isComplete: boolean;
  gradeLevel: 'elementary' | 'middle' | 'high';
  examples: any; // Will be properly typed in next iteration
  iterationCount: number;
  onToggle: () => void;
  onAddObjective: (objective: PhaseObjective) => void;
  onAddActivity: (activity: PhaseActivity) => void;
  onAddDeliverable: (deliverable: PhaseDeliverable) => void;
  onRemoveObjective?: (id: string) => void;
  onRemoveActivity?: (id: string) => void;
  onRemoveDeliverable?: (id: string) => void;
}

// Input validation utilities
const validateInput = (value: string, maxLength: number = 200): { valid: boolean; error?: string } => {
  if (!value || !value.trim()) {
    return { valid: false, error: 'This field cannot be empty' };
  }
  if (value.length > maxLength) {
    return { valid: false, error: `Maximum ${maxLength} characters allowed` };
  }
  return { valid: true };
};

// Controlled input modal component
const InputModal: React.FC<{
  isOpen: boolean;
  title: string;
  fields: Array<{
    name: string;
    label: string;
    placeholder: string;
    required?: boolean;
    maxLength?: number;
    type?: 'text' | 'textarea';
  }>;
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}> = ({ isOpen, title, fields, onSubmit, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    fields.forEach(field => {
      if (field.required) {
        const validation = validateInput(values[field.name] || '', field.maxLength);
        if (!validation.valid) {
          newErrors[field.name] = validation.error!;
          hasErrors = true;
        }
      }
    });
    
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(values);
    setValues({});
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <h3 id="modal-title" className="text-lg font-semibold mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label 
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  value={values[field.name] || ''}
                  onChange={(e) => {
                    setValues(prev => ({ ...prev, [field.name]: e.target.value }));
                    setErrors(prev => ({ ...prev, [field.name]: '' }));
                  }}
                  placeholder={field.placeholder}
                  className={`w-full p-2 border rounded-lg resize-none ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  maxLength={field.maxLength}
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                />
              ) : (
                <input
                  id={field.name}
                  type="text"
                  value={values[field.name] || ''}
                  onChange={(e) => {
                    setValues(prev => ({ ...prev, [field.name]: e.target.value }));
                    setErrors(prev => ({ ...prev, [field.name]: '' }));
                  }}
                  placeholder={field.placeholder}
                  className={`w-full p-2 border rounded-lg ${
                    errors[field.name] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  maxLength={field.maxLength}
                  aria-invalid={!!errors[field.name]}
                  aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                />
              )}
              {errors[field.name] && (
                <p id={`${field.name}-error`} className="text-red-500 text-sm mt-1">
                  {errors[field.name]}
                </p>
              )}
              {field.maxLength && (
                <p className="text-gray-500 text-xs mt-1">
                  {values[field.name]?.length || 0}/{field.maxLength} characters
                </p>
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export const PhasePanel: React.FC<PhasePanelProps> = memo(({
  phase,
  index,
  isExpanded,
  isCurrent,
  isComplete,
  gradeLevel,
  examples,
  iterationCount,
  onToggle,
  onAddObjective,
  onAddActivity,
  onAddDeliverable,
  onRemoveObjective,
  onRemoveActivity,
  onRemoveDeliverable
}) => {
  const [showObjectiveModal, setShowObjectiveModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  // Handle adding objective with validation
  const handleAddObjective = useCallback((values: Record<string, string>) => {
    const newObjective: PhaseObjective = {
      id: Date.now().toString(),
      text: values.objective,
      required: true
    };
    onAddObjective(newObjective);
  }, [onAddObjective]);

  // Handle adding activity with validation
  const handleAddActivity = useCallback((values: Record<string, string>) => {
    const newActivity: PhaseActivity = {
      id: Date.now().toString(),
      name: values.name,
      description: values.description,
      duration: values.duration,
      resources: values.resources ? values.resources.split(',').map(r => r.trim()) : [],
      studentChoice: values.studentChoice === 'true'
    };
    onAddActivity(newActivity);
  }, [onAddActivity]);

  // Handle adding deliverable with validation
  const handleAddDeliverable = useCallback((values: Record<string, string>) => {
    const newDeliverable: PhaseDeliverable = {
      id: Date.now().toString(),
      name: values.name,
      format: values.format,
      assessmentCriteria: values.criteria ? values.criteria.split(',').map(c => c.trim()) : []
    };
    onAddDeliverable(newDeliverable);
  }, [onAddDeliverable]);

  // Determine phase status for styling
  const borderColor = isCurrent ? 'border-primary-500' : isComplete ? 'border-green-500' : 'border-gray-200';
  const phaseColors = {
    ANALYZE: { bg: 'bg-primary-100', icon: 'text-primary-600' },
    BRAINSTORM: { bg: 'bg-yellow-100', icon: 'text-yellow-600' },
    PROTOTYPE: { bg: 'bg-purple-100', icon: 'text-purple-600' },
    EVALUATE: { bg: 'bg-green-100', icon: 'text-green-600' }
  };

  const colors = phaseColors[phase.type] || { bg: 'bg-gray-100', icon: 'text-gray-600' };

  return (
    <>
      <motion.div
        className={`bg-white rounded-lg shadow-sm border-2 transition-all ${borderColor}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* Phase Header */}
        <button
          onClick={onToggle}
          className="w-full p-4 sm:p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          aria-expanded={isExpanded}
          aria-controls={`phase-content-${index}`}
        >
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg ${colors.bg}`}>
                <phase.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.icon}`} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Phase {index + 1}: {phase.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{phase.description}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    Duration: {phase.duration}
                  </span>
                  {isComplete && (
                    <span className="text-xs sm:text-sm text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Complete
                    </span>
                  )}
                  {isCurrent && !isComplete && (
                    <span className="text-xs sm:text-sm text-primary-600 font-medium">
                      Current Phase
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {iterationCount > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-primary-100 rounded-full">
                  <RotateCcw className="w-3 h-3 text-primary-600" />
                  <span className="text-xs text-primary-600">
                    {iterationCount} iteration{iterationCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {/* Phase Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id={`phase-content-${index}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 overflow-hidden"
              role="region"
              aria-labelledby={`phase-${index}-heading`}
            >
              <div className="p-4 sm:p-6 space-y-6">
                {/* Learning Objectives */}
                <section aria-labelledby={`objectives-${index}`}>
                  <h4 id={`objectives-${index}`} className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Learning Objectives
                    <span className="text-sm font-normal text-gray-500">
                      ({phase.objectives.length} added)
                    </span>
                  </h4>
                  
                  {/* Objectives list */}
                  <ul className="space-y-2 mb-3" role="list">
                    {phase.objectives.map((objective) => (
                      <li key={objective.id} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 flex-1">{objective.text}</span>
                        {onRemoveObjective && (
                          <button
                            onClick={() => onRemoveObjective(objective.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            aria-label={`Remove objective: ${objective.text}`}
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Show examples if available */}
                  {phase.objectives.length === 0 && examples?.objectives && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Example objectives for {gradeLevel} level:
                      </p>
                      <ul className="space-y-1">
                        {examples.objectives.slice(0, showExamples ? undefined : 2).map((obj: string, i: number) => (
                          <li key={i} className="text-sm text-gray-700">• {obj}</li>
                        ))}
                      </ul>
                      {examples.objectives.length > 2 && (
                        <button
                          onClick={() => setShowExamples(!showExamples)}
                          className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                        >
                          {showExamples ? 'Show less' : `Show ${examples.objectives.length - 2} more`}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          examples.objectives.forEach((obj: string) => 
                            handleAddObjective({ objective: obj })
                          );
                        }}
                        className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium block"
                      >
                        Use these examples
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setShowObjectiveModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add objective
                  </button>
                </section>

                {/* Key Activities */}
                <section aria-labelledby={`activities-${index}`}>
                  <h4 id={`activities-${index}`} className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Key Activities
                    <span className="text-sm font-normal text-gray-500">
                      ({phase.activities.length} added)
                    </span>
                  </h4>
                  
                  <div className="space-y-3 mb-3">
                    {phase.activities.map((activity) => (
                      <div key={activity.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{activity.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                Duration: {activity.duration}
                              </span>
                              {activity.studentChoice && (
                                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                                  Student choice
                                </span>
                              )}
                            </div>
                          </div>
                          {onRemoveActivity && (
                            <button
                              onClick={() => onRemoveActivity(activity.id)}
                              className="text-red-500 hover:text-red-700 text-sm ml-2"
                              aria-label={`Remove activity: ${activity.name}`}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowActivityModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add activity
                  </button>
                </section>

                {/* Phase Deliverables */}
                <section aria-labelledby={`deliverables-${index}`}>
                  <h4 id={`deliverables-${index}`} className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Phase Deliverables
                    <span className="text-sm font-normal text-gray-500">
                      ({phase.deliverables.length} added)
                    </span>
                  </h4>
                  
                  <ul className="space-y-2 mb-3" role="list">
                    {phase.deliverables.map((deliverable) => (
                      <li key={deliverable.id} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {deliverable.name}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({deliverable.format})
                          </span>
                        </div>
                        {onRemoveDeliverable && (
                          <button
                            onClick={() => onRemoveDeliverable(deliverable.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            aria-label={`Remove deliverable: ${deliverable.name}`}
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowDeliverableModal(true)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add deliverable
                  </button>
                </section>

                {/* Iteration Support */}
                <div className="bg-primary-50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-900 mb-2 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Iteration Support
                  </h4>
                  <div className="text-sm text-primary-800 space-y-2">
                    <div>
                      <strong>When students might need to iterate:</strong>
                      <ul className="mt-1 ml-4">
                        {phase.iterationSupport.triggers.slice(0, 2).map((trigger, i) => (
                          <li key={i}>• {trigger}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Time buffer:</strong> {phase.iterationSupport.timeBuffer}% of phase time
                    </div>
                  </div>
                </div>

                {/* Student Agency */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Student Agency & Choice
                  </h4>
                  <div className="text-sm text-green-800">
                    <ul className="ml-4">
                      {phase.studentAgency.slice(0, 2).map((choice, i) => (
                        <li key={i}>• {choice}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <InputModal
        isOpen={showObjectiveModal}
        title="Add Learning Objective"
        fields={[
          {
            name: 'objective',
            label: 'Learning Objective',
            placeholder: 'e.g., Students will understand the causes of climate change',
            required: true,
            maxLength: 200,
            type: 'textarea'
          }
        ]}
        onSubmit={handleAddObjective}
        onClose={() => setShowObjectiveModal(false)}
      />

      <InputModal
        isOpen={showActivityModal}
        title="Add Activity"
        fields={[
          {
            name: 'name',
            label: 'Activity Name',
            placeholder: 'e.g., Research Investigation',
            required: true,
            maxLength: 100
          },
          {
            name: 'description',
            label: 'Description',
            placeholder: 'What will students do?',
            required: true,
            maxLength: 300,
            type: 'textarea'
          },
          {
            name: 'duration',
            label: 'Duration',
            placeholder: 'e.g., 2 class periods',
            required: true,
            maxLength: 50
          },
          {
            name: 'resources',
            label: 'Resources (comma-separated)',
            placeholder: 'e.g., Computers, Research guides',
            maxLength: 200
          }
        ]}
        onSubmit={handleAddActivity}
        onClose={() => setShowActivityModal(false)}
      />

      <InputModal
        isOpen={showDeliverableModal}
        title="Add Deliverable"
        fields={[
          {
            name: 'name',
            label: 'Deliverable Name',
            placeholder: 'e.g., Research Report',
            required: true,
            maxLength: 100
          },
          {
            name: 'format',
            label: 'Format',
            placeholder: 'e.g., Written report, Presentation, Model',
            required: true,
            maxLength: 100
          },
          {
            name: 'criteria',
            label: 'Assessment Criteria (comma-separated)',
            placeholder: 'e.g., Clarity, Evidence, Analysis',
            maxLength: 300
          }
        ]}
        onSubmit={handleAddDeliverable}
        onClose={() => setShowDeliverableModal(false)}
      />
    </>
  );
});

PhasePanel.displayName = 'PhasePanel';