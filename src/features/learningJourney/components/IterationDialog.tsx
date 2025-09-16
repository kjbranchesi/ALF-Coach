/**
 * IterationDialog.tsx
 * 
 * Modal dialog for documenting iteration decisions
 * Part of Sprint 2: Enhanced iteration support
 * 
 * FEATURES:
 * - Guided iteration types (Quick Loop, Major Pivot, Complete Restart)
 * - Reason documentation with templates
 * - Time impact estimation
 * - Support resource suggestions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Info,
  Target,
  Lightbulb,
  RefreshCw,
  X
} from 'lucide-react';
import { PhaseType, IterationEvent, IterationType } from '../types';

interface IterationOption {
  type: IterationType;
  title: string;
  description: string;
  timeImpact: string;
  icon: React.ElementType;
  color: string;
  reasons: string[];
  strategies: string[];
}

interface IterationDialogProps {
  isOpen: boolean;
  fromPhase: PhaseType;
  toPhase: PhaseType;
  onConfirm: (event: IterationEvent) => void;
  onCancel: () => void;
  currentWeek?: number;
  totalWeeks?: number;
}

const ITERATION_OPTIONS: Record<IterationType, IterationOption> = {
  quick_loop: {
    type: 'quick_loop',
    title: 'Quick Loop Back',
    description: 'Minor adjustments or filling gaps in understanding',
    timeImpact: '1-2 days',
    icon: RotateCcw,
    color: 'blue',
    reasons: [
      'Missing information discovered',
      'Need to clarify understanding',
      'Quick research needed',
      'Minor adjustment required'
    ],
    strategies: [
      'Focused research sprint',
      'Expert consultation',
      'Peer knowledge sharing',
      'Quick prototype test'
    ]
  },
  major_pivot: {
    type: 'major_pivot',
    title: 'Major Pivot',
    description: 'Significant change in approach or direction',
    timeImpact: '3-5 days',
    icon: RefreshCw,
    color: 'orange',
    reasons: [
      'Solution not feasible',
      'Major flaw discovered',
      'Stakeholder feedback requires change',
      'Resource constraints identified'
    ],
    strategies: [
      'Reframe the problem',
      'Alternative solution exploration',
      'Stakeholder re-engagement',
      'Resource reallocation'
    ]
  },
  complete_restart: {
    type: 'complete_restart',
    title: 'Complete Restart',
    description: 'Starting fresh with new understanding',
    timeImpact: 'Full phase duration',
    icon: AlertTriangle,
    color: 'red',
    reasons: [
      'Fundamental misunderstanding',
      'Complete change in requirements',
      'Critical failure in approach',
      'New opportunity identified'
    ],
    strategies: [
      'Full team reset meeting',
      'Comprehensive re-planning',
      'New timeline development',
      'Stakeholder realignment'
    ]
  }
};

const PHASE_NAMES: Record<PhaseType, string> = {
  ANALYZE: 'Analyze',
  BRAINSTORM: 'Brainstorm',
  PROTOTYPE: 'Prototype',
  EVALUATE: 'Evaluate'
};

export const IterationDialog: React.FC<IterationDialogProps> = ({
  isOpen,
  fromPhase,
  toPhase,
  onConfirm,
  onCancel,
  currentWeek = 1,
  totalWeeks = 4
}) => {
  const [selectedType, setSelectedType] = useState<IterationType>('quick_loop');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [estimatedDays, setEstimatedDays] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedType('quick_loop');
      setSelectedReason('');
      setCustomReason('');
      setSelectedStrategies([]);
      setEstimatedDays(1);
      setNotes('');
      setShowConfirmation(false);
    }
  }, [isOpen]);

  // Auto-select iteration type based on phase distance
  useEffect(() => {
    const phaseOrder = ['ANALYZE', 'BRAINSTORM', 'PROTOTYPE', 'EVALUATE'];
    const fromIndex = phaseOrder.indexOf(fromPhase);
    const toIndex = phaseOrder.indexOf(toPhase);
    const distance = fromIndex - toIndex;

    if (distance === 1) {
      setSelectedType('quick_loop');
      setEstimatedDays(1);
    } else if (distance === 2) {
      setSelectedType('major_pivot');
      setEstimatedDays(3);
    } else if (distance >= 3) {
      setSelectedType('complete_restart');
      setEstimatedDays(7);
    }
  }, [fromPhase, toPhase]);

  const handleConfirm = () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    const reason = customReason || selectedReason;
    if (!reason) {
      // TODO: Replace with accessible toast notification
      console.error('Please provide a reason for the iteration');
      return;
    }

    const event: IterationEvent = {
      id: Date.now().toString(),
      fromPhase,
      toPhase,
      reason,
      timestamp: new Date(),
      duration: estimatedDays * 8 * 60, // Convert days to minutes (8 hours per day)
      metadata: {
        iterationType: selectedType,
        strategies: selectedStrategies,
        notes,
        weekNumber: currentWeek,
        estimatedDays
      }
    };

    onConfirm(event);
  };

  const selectedOption = ITERATION_OPTIONS[selectedType];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <RotateCcw className="w-6 h-6" />
                  Document Your Iteration
                </h2>
                <p className="mt-2 text-primary-100">
                  Moving from <span className="font-semibold">{PHASE_NAMES[fromPhase]}</span> back to{' '}
                  <span className="font-semibold">{PHASE_NAMES[toPhase]}</span>
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-gray-50 px-6 py-3 border-b">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Week {currentWeek} of {totalWeeks}
              </span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Time remaining: {totalWeeks - currentWeek} weeks
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {!showConfirmation ? (
              <>
                {/* Iteration Type Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-gray-600" />
                    Select Iteration Type
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {Object.values(ITERATION_OPTIONS).map((option) => (
                      <button
                        key={option.type}
                        onClick={() => {
                          setSelectedType(option.type);
                          setEstimatedDays(
                            option.type === 'quick_loop' ? 1 :
                            option.type === 'major_pivot' ? 3 : 7
                          );
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedType === option.type
                            ? option.type === 'quick_loop' 
                              ? 'border-primary-500 bg-primary-50'
                              : option.type === 'major_pivot'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <option.icon className={`w-5 h-5 mt-0.5 ${
                            option.type === 'quick_loop' ? 'text-primary-600' :
                            option.type === 'major_pivot' ? 'text-orange-600' :
                            'text-red-600'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-gray-900">{option.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Time impact: {option.timeImpact}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-600" />
                    Why are you iterating?
                  </h3>
                  <div className="space-y-2">
                    {selectedOption.reasons.map((reason) => (
                      <label
                        key={reason}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => {
                            setSelectedReason(e.target.value);
                            setCustomReason('');
                          }}
                          className="text-primary-600"
                        />
                        <span className="text-gray-700">{reason}</span>
                      </label>
                    ))}
                    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="reason"
                        value="custom"
                        checked={customReason !== ''}
                        onChange={() => setSelectedReason('')}
                        className="text-primary-600 mt-1"
                      />
                      <div className="flex-1">
                        <span className="text-gray-700">Other reason</span>
                        <textarea
                          value={customReason}
                          onChange={(e) => {
                            setCustomReason(e.target.value);
                            setSelectedReason('');
                          }}
                          placeholder="Describe your specific reason..."
                          className="mt-2 w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                          rows={2}
                          onClick={() => setSelectedReason('')}
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Strategy Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-gray-600" />
                    Support Strategies (select all that apply)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedOption.strategies.map((strategy) => (
                      <label
                        key={strategy}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={strategy}
                          checked={selectedStrategies.includes(strategy)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStrategies([...selectedStrategies, strategy]);
                            } else {
                              setSelectedStrategies(selectedStrategies.filter(s => s !== strategy));
                            }
                          }}
                          className="text-primary-600"
                        />
                        <span className="text-gray-700 text-sm">{strategy}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Estimation */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    Time Estimate
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <div className="text-center min-w-[100px]">
                      <span className="text-2xl font-bold text-gray-900">{estimatedDays}</span>
                      <span className="text-gray-600 ml-1">day{estimatedDays !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    This will impact your timeline by approximately {estimatedDays} day{estimatedDays !== 1 ? 's' : ''}.
                    {estimatedDays > 5 && (
                      <span className="text-orange-600 font-medium ml-1">
                        Consider adjusting other phases to compensate.
                      </span>
                    )}
                  </p>
                </div>

                {/* Additional Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Additional Notes (optional)
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional context or plans for this iteration..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              /* Confirmation Screen */
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Confirm Iteration</h3>
                <div className="text-left bg-gray-50 rounded-lg p-4 mt-4 max-w-md mx-auto">
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Type:</dt>
                      <dd className="font-medium">{selectedOption.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Reason:</dt>
                      <dd className="font-medium text-right max-w-[200px]">
                        {customReason || selectedReason}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Time Impact:</dt>
                      <dd className="font-medium">{estimatedDays} day{estimatedDays !== 1 ? 's' : ''}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Strategies:</dt>
                      <dd className="font-medium">{selectedStrategies.length} selected</dd>
                    </div>
                  </dl>
                </div>
                <p className="text-gray-600 mt-4">
                  This iteration will be documented in your journey history.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {!showConfirmation && (
                <span>
                  Iteration is a normal part of the creative process
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {showConfirmation && (
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!customReason && !selectedReason}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  (!customReason && !selectedReason)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showConfirmation
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {showConfirmation ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Iteration
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};