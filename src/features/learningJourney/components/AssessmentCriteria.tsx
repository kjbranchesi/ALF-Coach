/**
 * AssessmentCriteria.tsx
 * 
 * Dynamic assessment criteria management and application
 * Part of Sprint 4: Assessment and Rubrics
 * 
 * FEATURES:
 * - Real-time assessment scoring
 * - Evidence collection
 * - Feedback generation
 * - Standards alignment tracking
 * - Self-assessment tools
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  CheckCircle,
  AlertCircle,
  Info,
  MessageSquare,
  Upload,
  Link,
  Calendar,
  User,
  Users,
  BarChart,
  TrendingUp,
  FileText,
  Camera,
  Mic,
  Video,
  ChevronRight,
  Plus,
  X,
  Edit3,
  Save,
  Clock,
  Award,
  HelpCircle
} from 'lucide-react';
import { 
  PhaseType, 
  GradeLevel,
  CreativePhase 
} from '../types';
import {
  Rubric,
  RubricCriterion,
  PerformanceLevel,
  RubricLevel
} from './RubricBuilder';

export interface AssessmentScore {
  criterionId: string;
  level: PerformanceLevel;
  points: number;
  evidence: Evidence[];
  feedback: string;
  assessorId: string;
  assessorType: 'teacher' | 'peer' | 'self';
  timestamp: Date;
}

export interface Evidence {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'link' | 'file';
  content: string;
  description: string;
  phaseType?: PhaseType;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  studentName: string;
  rubricId: string;
  projectId: string;
  scores: AssessmentScore[];
  totalScore: number;
  percentage: number;
  status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'returned';
  submittedAt?: Date;
  gradedAt?: Date;
  comments: string;
  strengths: string[];
  improvements: string[];
}

interface AssessmentCriteriaProps {
  rubric: Rubric;
  student: {
    id: string;
    name: string;
  };
  projectPhases: CreativePhase[];
  existingAssessment?: Assessment;
  mode: 'teacher' | 'peer' | 'self';
  onSave: (assessment: Assessment) => void;
  onSubmit?: (assessment: Assessment) => void;
  allowEvidence?: boolean;
  className?: string;
}

// Feedback templates based on performance level
const FEEDBACK_TEMPLATES: Record<PerformanceLevel, string[]> = {
  exemplary: [
    'Outstanding work demonstrating mastery of the concept',
    'Exceptional understanding and application shown',
    'Goes above and beyond expectations with creative solutions'
  ],
  proficient: [
    'Solid understanding demonstrated throughout',
    'Meets all requirements with good quality work',
    'Shows competent application of concepts'
  ],
  developing: [
    'Making good progress toward mastery',
    'Some areas need additional development',
    'Consider reviewing the concepts and trying again'
  ],
  beginning: [
    'Early stages of understanding',
    'Would benefit from additional support and practice',
    'Let\'s work together to strengthen these skills'
  ]
};

// Strength identifiers
const STRENGTH_PATTERNS = {
  creativity: ['innovative', 'creative', 'original', 'unique'],
  analysis: ['thorough', 'detailed', 'comprehensive', 'systematic'],
  collaboration: ['teamwork', 'cooperative', 'helpful', 'supportive'],
  communication: ['clear', 'articulate', 'well-presented', 'organized'],
  effort: ['hardworking', 'persistent', 'dedicated', 'committed']
};

export const AssessmentCriteria: React.FC<AssessmentCriteriaProps> = ({
  rubric,
  student,
  projectPhases,
  existingAssessment,
  mode,
  onSave,
  onSubmit,
  allowEvidence = true,
  className = ''
}) => {
  const [assessment, setAssessment] = useState<Assessment>(existingAssessment || {
    id: Date.now().toString(),
    studentId: student.id,
    studentName: student.name,
    rubricId: rubric.id,
    projectId: Date.now().toString(),
    scores: [],
    totalScore: 0,
    percentage: 0,
    status: 'not_started',
    comments: '',
    strengths: [],
    improvements: []
  });

  const [activeCriterion, setActiveCriterion] = useState<string | null>(
    rubric.criteria[0]?.id || null
  );
  const [showFeedbackHelper, setShowFeedbackHelper] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [evidenceModal, setEvidenceModal] = useState<{
    criterionId: string;
    show: boolean;
  } | null>(null);

  // Calculate total score and percentage
  const calculations = useMemo(() => {
    let totalPoints = 0;
    let maxPoints = 0;
    let weightedScore = 0;
    let completedCriteria = 0;

    rubric.criteria.forEach(criterion => {
      const score = assessment.scores.find(s => s.criterionId === criterion.id);
      if (score) {
        totalPoints += score.points;
        completedCriteria++;
        
        // Calculate weighted score if analytical rubric
        if (rubric.type === 'analytical') {
          const maxLevel = Math.max(...criterion.levels.map(l => l.points));
          weightedScore += (score.points / maxLevel) * criterion.weight;
        }
      }
      
      const maxLevel = Math.max(...criterion.levels.map(l => l.points));
      maxPoints += maxLevel;
    });

    const percentage = rubric.type === 'analytical' 
      ? Math.round(weightedScore)
      : maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

    const progress = (completedCriteria / rubric.criteria.length) * 100;

    return {
      totalPoints,
      maxPoints,
      percentage,
      progress,
      completedCriteria,
      isPassing: percentage >= rubric.passingScore
    };
  }, [assessment.scores, rubric]);

  // Update score for a criterion
  const updateScore = useCallback((
    criterionId: string,
    level: PerformanceLevel,
    points: number
  ) => {
    setAssessment(prev => {
      const existingScoreIndex = prev.scores.findIndex(s => s.criterionId === criterionId);
      const newScore: AssessmentScore = {
        criterionId,
        level,
        points,
        evidence: existingScoreIndex >= 0 ? prev.scores[existingScoreIndex].evidence : [],
        feedback: existingScoreIndex >= 0 ? prev.scores[existingScoreIndex].feedback : '',
        assessorId: student.id, // In real app, would be current user
        assessorType: mode,
        timestamp: new Date()
      };

      const newScores = [...prev.scores];
      if (existingScoreIndex >= 0) {
        newScores[existingScoreIndex] = newScore;
      } else {
        newScores.push(newScore);
      }

      return {
        ...prev,
        scores: newScores,
        status: 'in_progress'
      };
    });
    setUnsavedChanges(true);
  }, [mode, student.id]);

  // Update feedback for a criterion
  const updateFeedback = useCallback((criterionId: string, feedback: string) => {
    setAssessment(prev => {
      const scoreIndex = prev.scores.findIndex(s => s.criterionId === criterionId);
      if (scoreIndex >= 0) {
        const newScores = [...prev.scores];
        newScores[scoreIndex] = {
          ...newScores[scoreIndex],
          feedback
        };
        return { ...prev, scores: newScores };
      }
      return prev;
    });
    setUnsavedChanges(true);
  }, []);

  // Add evidence to a criterion
  const addEvidence = useCallback((criterionId: string, evidence: Evidence) => {
    setAssessment(prev => {
      const scoreIndex = prev.scores.findIndex(s => s.criterionId === criterionId);
      if (scoreIndex >= 0) {
        const newScores = [...prev.scores];
        newScores[scoreIndex] = {
          ...newScores[scoreIndex],
          evidence: [...newScores[scoreIndex].evidence, evidence]
        };
        return { ...prev, scores: newScores };
      }
      return prev;
    });
    setUnsavedChanges(true);
  }, []);

  // Remove evidence
  const removeEvidence = useCallback((criterionId: string, evidenceId: string) => {
    setAssessment(prev => {
      const scoreIndex = prev.scores.findIndex(s => s.criterionId === criterionId);
      if (scoreIndex >= 0) {
        const newScores = [...prev.scores];
        newScores[scoreIndex] = {
          ...newScores[scoreIndex],
          evidence: newScores[scoreIndex].evidence.filter(e => e.id !== evidenceId)
        };
        return { ...prev, scores: newScores };
      }
      return prev;
    });
    setUnsavedChanges(true);
  }, []);

  // Auto-generate strengths and improvements
  const generateInsights = useCallback(() => {
    const strengths: string[] = [];
    const improvements: string[] = [];

    assessment.scores.forEach(score => {
      const criterion = rubric.criteria.find(c => c.id === score.criterionId);
      if (!criterion) return;

      if (score.level === 'exemplary' || score.level === 'proficient') {
        strengths.push(`Strong performance in ${criterion.name}`);
      } else if (score.level === 'beginning') {
        improvements.push(`Focus on improving ${criterion.name}`);
      }
    });

    // Add specific strength categories
    Object.entries(STRENGTH_PATTERNS).forEach(([category, keywords]) => {
      const hasStrength = assessment.scores.some(score => 
        score.feedback && keywords.some(keyword => 
          score.feedback.toLowerCase().includes(keyword)
        )
      );
      if (hasStrength) {
        strengths.push(`Demonstrates strong ${category} skills`);
      }
    });

    setAssessment(prev => ({
      ...prev,
      strengths: [...new Set(strengths)].slice(0, 3),
      improvements: [...new Set(improvements)].slice(0, 3)
    }));
  }, [assessment.scores, rubric.criteria]);

  // Save assessment
  const handleSave = useCallback(() => {
    const updatedAssessment = {
      ...assessment,
      totalScore: calculations.totalPoints,
      percentage: calculations.percentage,
      status: 'in_progress' as const
    };
    onSave(updatedAssessment);
    setUnsavedChanges(false);
  }, [assessment, calculations, onSave]);

  // Submit assessment
  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      const finalAssessment = {
        ...assessment,
        totalScore: calculations.totalPoints,
        percentage: calculations.percentage,
        status: mode === 'teacher' ? 'graded' as const : 'submitted' as const,
        submittedAt: new Date(),
        gradedAt: mode === 'teacher' ? new Date() : undefined
      };
      onSubmit(finalAssessment);
      setUnsavedChanges(false);
    }
  }, [assessment, calculations, mode, onSubmit]);

  // Get evidence icon
  const getEvidenceIcon = (type: Evidence['type']) => {
    switch (type) {
      case 'image': return Camera;
      case 'video': return Video;
      case 'audio': return Mic;
      case 'link': return Link;
      case 'file': return FileText;
      default: return FileText;
    }
  };

  // Get performance level color
  const getLevelColor = (level: PerformanceLevel) => {
    switch (level) {
      case 'exemplary': return 'green';
      case 'proficient': return 'blue';
      case 'developing': return 'yellow';
      case 'beginning': return 'gray';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6" />
              {mode === 'teacher' ? 'Grade' : mode === 'peer' ? 'Peer Review' : 'Self-Assessment'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {student.name} • {rubric.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {calculations.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {calculations.totalPoints}/{calculations.maxPoints} points
              </div>
            </div>
            {calculations.isPassing ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-orange-500" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Assessment Progress</span>
            <span>{calculations.completedCriteria}/{rubric.criteria.length} criteria</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${calculations.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        {unsavedChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Criteria Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {rubric.criteria.map((criterion, idx) => {
            const score = assessment.scores.find(s => s.criterionId === criterion.id);
            const isActive = activeCriterion === criterion.id;
            const isScored = !!score;
            
            return (
              <button
                key={criterion.id}
                onClick={() => setActiveCriterion(criterion.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : isScored
                    ? 'border-transparent text-green-600 hover:text-green-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isScored && <CheckCircle className="w-4 h-4" />}
                  <span>{idx + 1}. {criterion.name}</span>
                  {criterion.essential && (
                    <span className="text-xs text-red-500">*</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Criterion Assessment */}
      {activeCriterion && (() => {
        const criterion = rubric.criteria.find(c => c.id === activeCriterion);
        if (!criterion) return null;
        
        const currentScore = assessment.scores.find(s => s.criterionId === criterion.id);
        
        return (
          <div className="p-6">
            {/* Criterion Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {criterion.name}
                {criterion.essential && (
                  <span className="ml-2 text-sm text-red-600">(Essential)</span>
                )}
              </h3>
              {criterion.description && (
                <p className="text-gray-600">{criterion.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Weight: {criterion.weight}%</span>
                {criterion.phaseAlignment && (
                  <span>Phase: {criterion.phaseAlignment}</span>
                )}
              </div>
            </div>

            {/* Performance Level Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Select Performance Level</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {criterion.levels.map(level => {
                  const isSelected = currentScore?.level === level.level;
                  const color = getLevelColor(level.level);
                  
                  return (
                    <button
                      key={level.level}
                      onClick={() => updateScore(criterion.id, level.level, level.points)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${color}-500 bg-${color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-medium ${
                        isSelected ? `text-${color}-700` : 'text-gray-900'
                      }`}>
                        {level.level.charAt(0).toUpperCase() + level.level.slice(1)}
                      </div>
                      <div className={`text-2xl font-bold my-2 ${
                        isSelected ? `text-${color}-600` : 'text-gray-700'
                      }`}>
                        {level.points}
                      </div>
                      <div className="text-xs text-gray-600 text-left">
                        {level.description}
                      </div>
                      {level.indicators.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {level.indicators.slice(0, 2).map((indicator, idx) => (
                            <li key={idx} className="text-xs text-gray-500 text-left">
                              • {indicator}
                            </li>
                          ))}
                        </ul>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evidence Collection */}
            {allowEvidence && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Evidence</h4>
                  <button
                    onClick={() => setEvidenceModal({ criterionId: criterion.id, show: true })}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Evidence
                  </button>
                </div>
                
                {currentScore?.evidence && currentScore.evidence.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentScore.evidence.map(evidence => {
                      const Icon = getEvidenceIcon(evidence.type);
                      return (
                        <div
                          key={evidence.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-2">
                              <Icon className="w-4 h-4 text-gray-600 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  {evidence.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(evidence.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeEvidence(criterion.id, evidence.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
                    No evidence attached yet
                  </div>
                )}
              </div>
            )}

            {/* Feedback */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Feedback</h4>
                <button
                  onClick={() => setShowFeedbackHelper(!showFeedbackHelper)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <HelpCircle className="w-4 h-4" />
                  Suggestions
                </button>
              </div>
              
              {showFeedbackHelper && currentScore && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2">Suggested feedback:</p>
                  <div className="space-y-1">
                    {FEEDBACK_TEMPLATES[currentScore.level].map((template, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateFeedback(criterion.id, template)}
                        className="text-xs text-blue-700 hover:text-blue-800 block text-left"
                      >
                        • {template}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <textarea
                value={currentScore?.feedback || ''}
                onChange={(e) => updateFeedback(criterion.id, e.target.value)}
                placeholder="Provide specific, constructive feedback..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const currentIdx = rubric.criteria.findIndex(c => c.id === criterion.id);
                  if (currentIdx > 0) {
                    setActiveCriterion(rubric.criteria[currentIdx - 1].id);
                  }
                }}
                disabled={rubric.criteria[0].id === criterion.id}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <button
                onClick={() => {
                  const currentIdx = rubric.criteria.findIndex(c => c.id === criterion.id);
                  if (currentIdx < rubric.criteria.length - 1) {
                    setActiveCriterion(rubric.criteria[currentIdx + 1].id);
                  }
                }}
                disabled={rubric.criteria[rubric.criteria.length - 1].id === criterion.id}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        );
      })()}

      {/* Overall Comments Section */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
            <div className="space-y-2">
              {assessment.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-sm text-green-900">{strength}</span>
                </div>
              ))}
              <button
                onClick={generateInsights}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Generate insights
              </button>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Areas for Improvement</h4>
            <div className="space-y-2">
              {assessment.improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                  <Info className="w-4 h-4 text-orange-600 mt-0.5" />
                  <span className="text-sm text-orange-900">{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Comments */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Comments</h4>
          <textarea
            value={assessment.comments}
            onChange={(e) => {
              setAssessment(prev => ({ ...prev, comments: e.target.value }));
              setUnsavedChanges(true);
            }}
            placeholder="Provide overall feedback and next steps..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {assessment.status === 'graded' ? 'Graded' :
               assessment.status === 'submitted' ? 'Submitted' :
               assessment.status === 'in_progress' ? 'In Progress' :
               'Not Started'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            {onSubmit && (
              <button
                onClick={handleSubmit}
                disabled={calculations.completedCriteria < rubric.criteria.length}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {mode === 'teacher' ? 'Submit Grades' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evidence Modal */}
      <AnimatePresence>
        {evidenceModal?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEvidenceModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Evidence</h3>
              
              <div className="grid grid-cols-3 gap-3">
                {(['image', 'video', 'file'] as const).map(type => {
                  const Icon = getEvidenceIcon(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        const evidence: Evidence = {
                          id: Date.now().toString(),
                          type,
                          content: '',
                          description: `${type} evidence`,
                          uploadedAt: new Date(),
                          uploadedBy: student.id
                        };
                        addEvidence(evidenceModal.criterionId, evidence);
                        setEvidenceModal(null);
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                      <span className="text-sm text-gray-700 capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setEvidenceModal(null)}
                className="mt-4 w-full px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};