/**
 * TeacherGuidance.tsx
 * 
 * Teacher-specific guidance and facilitation tools
 * Part of Sprint 3: Full Iteration Support System
 * 
 * FEATURES:
 * - Facilitation strategies
 * - Student support recommendations
 * - Class-wide patterns
 * - Intervention suggestions
 * - Parent communication templates
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Heart,
  Target,
  Calendar,
  Mail,
  FileText,
  Lightbulb,
  ChevronRight,
  Info,
  Shield,
  Sparkles,
  Clock,
  BarChart3
} from 'lucide-react';
import { PhaseType, IterationEvent, GradeLevel } from '../types';

interface TeacherGuidanceProps {
  studentIterations: Map<string, IterationEvent[]>; // studentId -> iterations
  currentPhase: PhaseType;
  gradeLevel: GradeLevel;
  classSize: number;
  projectWeek: number;
  totalWeeks: number;
  onActionClick?: (action: GuidanceAction) => void;
  className?: string;
}

interface GuidanceAction {
  id: string;
  type: 'intervention' | 'communication' | 'facilitation' | 'assessment';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetStudents?: string[];
  suggestedTiming: string;
  resources: string[];
}

interface ClassPattern {
  id: string;
  type: 'positive' | 'concern' | 'neutral';
  pattern: string;
  affectedCount: number;
  recommendation: string;
}

interface FacilitationTip {
  id: string;
  phase: PhaseType;
  situation: string;
  strategy: string;
  example?: string;
  gradeSpecific: boolean;
}

const FACILITATION_TIPS: FacilitationTip[] = [
  {
    id: 'analyze-1',
    phase: 'ANALYZE',
    situation: 'Students struggling to define the problem',
    strategy: 'Use the "5 Whys" technique to help students dig deeper into root causes',
    example: 'Why is playground safety important? Why do accidents happen? Keep asking why...',
    gradeSpecific: false
  },
  {
    id: 'analyze-2',
    phase: 'ANALYZE',
    situation: 'Analysis paralysis - too much research',
    strategy: 'Set clear research boundaries with time limits and source requirements',
    example: 'You have 2 class periods and need 3 credible sources minimum, 5 maximum',
    gradeSpecific: false
  },
  {
    id: 'brainstorm-1',
    phase: 'BRAINSTORM',
    situation: 'Limited idea generation',
    strategy: 'Use SCAMPER method to expand thinking',
    example: 'Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse',
    gradeSpecific: false
  },
  {
    id: 'prototype-1',
    phase: 'PROTOTYPE',
    situation: 'Perfectionism preventing progress',
    strategy: 'Emphasize "fail fast, learn faster" mindset',
    example: 'Your first prototype should be ugly but functional - we call it the "ugly duckling" stage',
    gradeSpecific: false
  },
  {
    id: 'evaluate-1',
    phase: 'EVALUATE',
    situation: 'Superficial reflection',
    strategy: 'Use structured reflection prompts with specific examples',
    example: 'Describe one specific moment when you had to change your approach. What triggered it?',
    gradeSpecific: false
  }
];

const PARENT_TEMPLATES = {
  iteration_update: {
    subject: 'Project Update: Creative Process Journey',
    body: `Dear Parent/Guardian,

I wanted to update you on [STUDENT_NAME]'s progress in our current project. 

Your child is demonstrating excellent problem-solving skills by recognizing when adjustments are needed in their work. They recently made a strategic decision to revisit the [PHASE_NAME] phase to strengthen their project foundation.

This type of iteration is a valuable part of the creative process and shows:
- Critical thinking about their work quality
- Willingness to improve rather than settle
- Understanding of the iterative design process

How you can support at home:
- Ask about what they learned from this adjustment
- Celebrate the courage it takes to revise work
- Emphasize that iteration leads to better outcomes

Please let me know if you have any questions.

Best regards,
[TEACHER_NAME]`
  },
  struggling_student: {
    subject: 'Support Opportunity: Project-Based Learning',
    body: `Dear Parent/Guardian,

I'm reaching out regarding [STUDENT_NAME]'s current project work.

I've noticed they could benefit from additional support in the [PHASE_NAME] phase. This is completely normal - different students excel at different stages of the creative process.

Specific areas where support would help:
[SUPPORT_AREAS]

Suggestions for home support:
- Set aside 15-20 minutes to discuss the project
- Help break down large tasks into smaller steps
- Encourage questions and curiosity
- Celebrate small wins along the way

I'm providing additional support during class and am confident [STUDENT_NAME] will succeed with our combined efforts.

Would you like to schedule a brief call to discuss strategies?

Best regards,
[TEACHER_NAME]`
  }
};

export const TeacherGuidance: React.FC<TeacherGuidanceProps> = ({
  studentIterations,
  currentPhase,
  gradeLevel,
  classSize,
  projectWeek,
  totalWeeks,
  onActionClick,
  className = ''
}) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'patterns' | 'facilitation' | 'communication'>('overview');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof PARENT_TEMPLATES | null>(null);

  // Analyze class-wide patterns
  const classPatterns = useMemo<ClassPattern[]>(() => {
    const patterns: ClassPattern[] = [];
    
    // Count students with iterations
    const studentsWithIterations = studentIterations.size;
    const iterationRate = (studentsWithIterations / classSize) * 100;
    
    if (iterationRate > 70) {
      patterns.push({
        id: 'high-iteration',
        type: 'concern',
        pattern: 'Majority of class requiring iterations',
        affectedCount: studentsWithIterations,
        recommendation: 'Consider whole-class reteaching of current phase concepts'
      });
    } else if (iterationRate < 20 && projectWeek > 1) {
      patterns.push({
        id: 'low-iteration',
        type: 'positive',
        pattern: 'Strong initial planning across class',
        affectedCount: classSize - studentsWithIterations,
        recommendation: 'Highlight successful planning strategies in class discussion'
      });
    }
    
    // Check for students with multiple iterations
    let multipleIterationCount = 0;
    studentIterations.forEach(iterations => {
      if (iterations.length > 3) multipleIterationCount++;
    });
    
    if (multipleIterationCount > classSize * 0.2) {
      patterns.push({
        id: 'multiple-iterations',
        type: 'concern',
        pattern: 'Several students with repeated iterations',
        affectedCount: multipleIterationCount,
        recommendation: 'Form small support groups for targeted assistance'
      });
    }
    
    // Check phase-specific issues
    const phaseIterations: Record<PhaseType, number> = {
      ANALYZE: 0,
      BRAINSTORM: 0,
      PROTOTYPE: 0,
      EVALUATE: 0
    };
    
    studentIterations.forEach(iterations => {
      iterations.forEach(iter => {
        phaseIterations[iter.toPhase]++;
      });
    });
    
    const problematicPhase = Object.entries(phaseIterations).find(([_, count]) => 
      count > studentsWithIterations * 2
    );
    
    if (problematicPhase) {
      patterns.push({
        id: 'phase-difficulty',
        type: 'concern',
        pattern: `${problematicPhase[0]} phase causing difficulties`,
        affectedCount: problematicPhase[1],
        recommendation: `Review ${problematicPhase[0].toLowerCase()} phase requirements and provide additional scaffolding`
      });
    }
    
    // Positive patterns
    if (projectWeek > totalWeeks * 0.5 && iterationRate < 50) {
      patterns.push({
        id: 'good-progress',
        type: 'positive',
        pattern: 'Class maintaining good progress past midpoint',
        affectedCount: classSize,
        recommendation: 'Continue current facilitation approach'
      });
    }
    
    return patterns;
  }, [studentIterations, classSize, projectWeek, totalWeeks]);

  // Generate guidance actions
  const guidanceActions = useMemo<GuidanceAction[]>(() => {
    const actions: GuidanceAction[] = [];
    
    // Check for students needing immediate intervention
    const strugglingStudents: string[] = [];
    studentIterations.forEach((iterations, studentId) => {
      if (iterations.length > 3 || 
          iterations.some(i => i.metadata?.iterationType === 'complete_restart')) {
        strugglingStudents.push(studentId);
      }
    });
    
    if (strugglingStudents.length > 0) {
      actions.push({
        id: 'intervention-1',
        type: 'intervention',
        priority: 'urgent',
        title: 'Students Needing Support',
        description: `${strugglingStudents.length} student(s) showing signs of significant struggle`,
        targetStudents: strugglingStudents,
        suggestedTiming: 'Today or tomorrow',
        resources: ['One-on-one conferencing guide', 'Differentiation strategies']
      });
    }
    
    // Phase transition support
    if (projectWeek % Math.floor(totalWeeks / 4) === 0) {
      actions.push({
        id: 'facilitation-1',
        type: 'facilitation',
        priority: 'high',
        title: 'Phase Transition Check-in',
        description: 'Conduct whole-class review before phase transition',
        suggestedTiming: 'End of this week',
        resources: ['Phase transition checklist', 'Reflection prompts']
      });
    }
    
    // Parent communication
    if (strugglingStudents.length > classSize * 0.15) {
      actions.push({
        id: 'communication-1',
        type: 'communication',
        priority: 'medium',
        title: 'Parent Update Recommended',
        description: 'Send project update to parents about iteration process',
        suggestedTiming: 'Within 2-3 days',
        resources: ['Parent email template', 'Project overview handout']
      });
    }
    
    // Assessment preparation
    if (projectWeek >= totalWeeks - 1) {
      actions.push({
        id: 'assessment-1',
        type: 'assessment',
        priority: 'high',
        title: 'Final Assessment Preparation',
        description: 'Review rubrics and prepare for final presentations',
        suggestedTiming: 'This week',
        resources: ['Presentation rubric', 'Peer evaluation forms']
      });
    }
    
    return actions.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [studentIterations, classSize, projectWeek, totalWeeks]);

  // Get relevant facilitation tips
  const relevantTips = useMemo(() => {
    return FACILITATION_TIPS.filter(tip => 
      tip.phase === currentPhase || !tip.gradeSpecific
    );
  }, [currentPhase]);

  // Calculate class statistics
  const classStats = useMemo(() => {
    let totalIterations = 0;
    let totalTime = 0;
    const iterationTypes: Record<string, number> = {
      quick_loop: 0,
      major_pivot: 0,
      complete_restart: 0
    };
    
    studentIterations.forEach(iterations => {
      iterations.forEach(iter => {
        totalIterations++;
        totalTime += iter.duration || 0;
        if (iter.metadata?.iterationType) {
          iterationTypes[iter.metadata.iterationType]++;
        }
      });
    });
    
    return {
      averageIterationsPerStudent: totalIterations / Math.max(1, studentIterations.size),
      totalClassIterations: totalIterations,
      averageIterationTime: totalTime / Math.max(1, totalIterations),
      iterationTypes,
      studentsOnTrack: classSize - studentIterations.size
    };
  }, [studentIterations, classSize]);

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Teacher Guidance
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Facilitation strategies and class insights for Week {projectWeek} of {totalWeeks}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{classSize} students</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{currentPhase} phase</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-900">
              {classStats.studentsOnTrack}
            </div>
            <div className="text-xs text-green-700">Students on track</div>
          </div>
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary-900">
              {classStats.averageIterationsPerStudent.toFixed(1)}
            </div>
            <div className="text-xs text-primary-700">Avg iterations/student</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-900">
              {Math.round((projectWeek / totalWeeks) * 100)}%
            </div>
            <div className="text-xs text-purple-700">Project progress</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-4 h-4 inline-block mr-2" />
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('patterns')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'patterns'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline-block mr-2" />
            Patterns
          </button>
          <button
            onClick={() => setSelectedTab('facilitation')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'facilitation'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lightbulb className="w-4 h-4 inline-block mr-2" />
            Facilitation
          </button>
          <button
            onClick={() => setSelectedTab('communication')}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === 'communication'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-2" />
            Communication
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Recommended Actions</h3>
              {guidanceActions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p>No urgent actions needed. Class is progressing well!</p>
                </div>
              ) : (
                guidanceActions.map(action => (
                  <motion.div
                    key={action.id}
                    className={`border rounded-lg p-4 ${
                      action.priority === 'urgent' ? 'border-red-300 bg-red-50' :
                      action.priority === 'high' ? 'border-orange-300 bg-orange-50' :
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {action.type === 'intervention' && <AlertCircle className="w-4 h-4 text-red-600" />}
                          {action.type === 'communication' && <Mail className="w-4 h-4 text-primary-600" />}
                          {action.type === 'facilitation' && <Users className="w-4 h-4 text-green-600" />}
                          {action.type === 'assessment' && <Target className="w-4 h-4 text-purple-600" />}
                          <h4 className="font-medium text-gray-900">{action.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            action.priority === 'urgent' ? 'bg-red-200 text-red-700' :
                            action.priority === 'high' ? 'bg-orange-200 text-orange-700' :
                            action.priority === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {action.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{action.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {action.suggestedTiming}
                          </span>
                          {action.targetStudents && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {action.targetStudents.length} students
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => onActionClick && onActionClick(action)}
                        className="ml-3 p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {selectedTab === 'patterns' && (
            <motion.div
              key="patterns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Class-Wide Patterns</h3>
              {classPatterns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No significant patterns detected yet</p>
                </div>
              ) : (
                classPatterns.map(pattern => (
                  <div
                    key={pattern.id}
                    className={`p-4 rounded-lg border ${
                      pattern.type === 'positive' ? 'bg-green-50 border-green-200' :
                      pattern.type === 'concern' ? 'bg-amber-50 border-amber-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {pattern.type === 'positive' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : pattern.type === 'concern' ? (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        ) : (
                          <Info className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{pattern.pattern}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Affecting {pattern.affectedCount} student{pattern.affectedCount !== 1 ? 's' : ''}
                        </p>
                        <div className={`text-sm mt-2 ${
                          pattern.type === 'positive' ? 'text-green-700' :
                          pattern.type === 'concern' ? 'text-amber-700' :
                          'text-gray-700'
                        }`}>
                          <strong>Recommendation:</strong> {pattern.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {selectedTab === 'facilitation' && (
            <motion.div
              key="facilitation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Facilitation Strategies</h3>
              {relevantTips.map(tip => (
                <div key={tip.id} className="bg-primary-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-primary-900">{tip.situation}</h4>
                      <p className="text-sm text-primary-700 mt-1">{tip.strategy}</p>
                      {tip.example && (
                        <div className="mt-2 p-2 bg-white rounded text-sm text-gray-700 italic">
                          Example: "{tip.example}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {selectedTab === 'communication' && (
            <motion.div
              key="communication"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-gray-900 mb-3">Parent Communication Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(PARENT_TEMPLATES).map(([key, template]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTemplate(key as keyof typeof PARENT_TEMPLATES)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      selectedTemplate === key
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {key === 'iteration_update' ? 'Iteration Update' : 'Support Request'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.subject}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedTemplate && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Email Template</h4>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Copy to Clipboard
                    </button>
                  </div>
                  <div className="bg-white rounded p-3 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {PARENT_TEMPLATES[selectedTemplate].body}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};