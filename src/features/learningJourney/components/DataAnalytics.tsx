/**
 * DataAnalytics.tsx
 * 
 * Advanced data analytics and insights for Learning Journey
 * Part of Sprint 5: Data Analytics and Reporting
 * 
 * FEATURES:
 * - Real-time learning analytics
 * - Performance trend analysis
 * - Predictive insights
 * - Comparative analysis across students
 * - Interactive data visualizations
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Share2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Brain,
  Eye,
  RefreshCw,
  Settings
} from 'lucide-react';
import {
  PhaseType,
  GradeLevel,
  CreativePhase,
  StudentProgress,
  IterationEvent
} from '../types';
import { Assessment } from './AssessmentCriteria';
import { PeerReview } from './PeerEvaluation';

export interface LearningAnalytics {
  studentId: string;
  studentName: string;
  overallProgress: number;
  phaseCompletionTimes: Record<PhaseType, number>;
  iterationFrequency: number;
  assessmentTrends: number[];
  engagementScore: number;
  collaborationScore: number;
  creativityIndex: number;
  persistenceMetric: number;
  predictionScore?: number;
}

export interface ClassroomAnalytics {
  totalStudents: number;
  averageProgress: number;
  phaseDistribution: Record<PhaseType, number>;
  iterationPatterns: {
    highIterators: string[];
    lowIterators: string[];
    averageIterations: number;
  };
  performanceTrends: {
    improving: number;
    stable: number;
    declining: number;
  };
  collaborationNetwork: {
    nodeId: string;
    connections: string[];
    strength: number;
  }[];
  riskStudents: string[];
  topPerformers: string[];
}

export interface PredictiveInsight {
  type: 'success_prediction' | 'risk_alert' | 'intervention_needed' | 'opportunity';
  confidence: number; // 0-100
  title: string;
  description: string;
  recommendations: string[];
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  studentIds?: string[];
}

interface DataAnalyticsProps {
  students: Array<{
    id: string;
    name: string;
    grade: string;
  }>;
  studentProgress: StudentProgress[];
  assessments: Assessment[];
  peerReviews: PeerReview[];
  iterations: IterationEvent[];
  phases: CreativePhase[];
  gradeLevel: GradeLevel;
  projectDuration: number;
  currentWeek: number;
  onExport?: (data: any, format: 'pdf' | 'csv' | 'json') => void;
  onShare?: (insights: PredictiveInsight[]) => void;
  className?: string;
}

// Analytics calculation utilities
const calculateEngagementScore = (
  progress: StudentProgress,
  assessments: Assessment[],
  iterations: IterationEvent[]
): number => {
  const progressWeight = 0.4;
  const assessmentWeight = 0.3;
  const iterationWeight = 0.3;

  const progressScore = progress.overallProgress;
  const assessmentScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length
    : 0;
  const iterationScore = Math.min(100, iterations.length * 20);

  return Math.round(
    progressScore * progressWeight +
    assessmentScore * assessmentWeight +
    iterationScore * iterationWeight
  );
};

const calculateCreativityIndex = (
  assessments: Assessment[],
  peerReviews: PeerReview[]
): number => {
  // Based on assessment scores in creative criteria and peer feedback
  const creativityCriteria = ['creativity', 'innovation', 'ideas', 'creative'];
  
  const assessmentCreativity = assessments
    .flatMap(a => a.scores)
    .filter(s => creativityCriteria.some(c => 
      s.criterionId.toLowerCase().includes(c)
    ))
    .reduce((sum, s) => sum + s.points, 0);

  const peerCreativity = peerReviews
    .flatMap(r => r.recognition)
    .filter(rec => rec.type === 'creativity')
    .length * 10;

  return Math.min(100, assessmentCreativity + peerCreativity);
};

const generatePredictiveInsights = (
  analytics: LearningAnalytics[],
  classroomData: ClassroomAnalytics,
  currentWeek: number,
  totalWeeks: number
): PredictiveInsight[] => {
  const insights: PredictiveInsight[] = [];
  const remainingWeeks = totalWeeks - currentWeek;
  const progressThreshold = (currentWeek / totalWeeks) * 100;

  // Risk identification
  const riskStudents = analytics.filter(a => 
    a.overallProgress < progressThreshold - 20 && a.engagementScore < 60
  );

  if (riskStudents.length > 0) {
    insights.push({
      type: 'risk_alert',
      confidence: 85,
      title: 'Students at Risk',
      description: `${riskStudents.length} students are falling behind and need intervention`,
      recommendations: [
        'Schedule one-on-one check-ins',
        'Provide additional scaffolding resources',
        'Consider peer mentoring partnerships'
      ],
      timeline: 'Within 1 week',
      priority: 'high',
      studentIds: riskStudents.map(s => s.studentId)
    });
  }

  // Success predictions
  const highPerformers = analytics.filter(a => 
    a.overallProgress > progressThreshold + 10 && 
    a.engagementScore > 80 &&
    a.creativityIndex > 70
  );

  if (highPerformers.length > 0) {
    insights.push({
      type: 'success_prediction',
      confidence: 92,
      title: 'Excellence Trajectory',
      description: `${highPerformers.length} students are on track for exceptional outcomes`,
      recommendations: [
        'Provide advanced challenges',
        'Consider leadership roles in peer collaboration',
        'Document exemplary work for portfolios'
      ],
      timeline: 'Rest of project',
      priority: 'medium',
      studentIds: highPerformers.map(s => s.studentId)
    });
  }

  // Iteration patterns
  const lowIterators = analytics.filter(a => a.iterationFrequency < 0.5);
  if (lowIterators.length > classroomData.totalStudents * 0.3) {
    insights.push({
      type: 'intervention_needed',
      confidence: 78,
      title: 'Low Iteration Activity',
      description: 'Many students are not engaging in iterative improvement',
      recommendations: [
        'Introduce structured iteration prompts',
        'Share iteration success stories',
        'Reduce perfectionism through growth mindset activities'
      ],
      timeline: 'Next 2 weeks',
      priority: 'medium',
      studentIds: lowIterators.map(s => s.studentId)
    });
  }

  // Collaboration opportunities
  const isolatedStudents = analytics.filter(a => a.collaborationScore < 40);
  if (isolatedStudents.length > 0) {
    insights.push({
      type: 'opportunity',
      confidence: 70,
      title: 'Collaboration Enhancement',
      description: 'Some students could benefit from stronger peer connections',
      recommendations: [
        'Create structured collaboration opportunities',
        'Form diverse working groups',
        'Implement peer mentoring system'
      ],
      timeline: 'Next phase',
      priority: 'low',
      studentIds: isolatedStudents.map(s => s.studentId)
    });
  }

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

export const DataAnalytics: React.FC<DataAnalyticsProps> = ({
  students,
  studentProgress,
  assessments,
  peerReviews,
  iterations,
  phases,
  gradeLevel,
  projectDuration,
  currentWeek,
  onExport,
  onShare,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'individuals' | 'predictions' | 'trends'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate comprehensive analytics
  const analytics = useMemo((): {
    individual: LearningAnalytics[];
    classroom: ClassroomAnalytics;
    insights: PredictiveInsight[];
  } => {
    // Individual analytics
    const individualAnalytics: LearningAnalytics[] = students.map(student => {
      const progress = studentProgress.find(p => p.studentId === student.id);
      const studentAssessments = assessments.filter(a => a.studentId === student.id);
      const studentReviews = peerReviews.filter(r => r.revieweeId === student.id);
      const studentIterations = iterations.filter(i => 
        progress?.iterationEvents.some(ie => ie.id === i.id)
      );

      const phaseCompletionTimes: Record<PhaseType, number> = phases.reduce((acc, phase) => {
        const phaseProgress = progress?.phaseProgress.find(p => p.phaseType === phase.type);
        acc[phase.type] = phaseProgress?.timeSpent || 0;
        return acc;
      }, {} as Record<PhaseType, number>);

      const assessmentTrends = studentAssessments
        .sort((a, b) => (a.gradedAt?.getTime() || 0) - (b.gradedAt?.getTime() || 0))
        .map(a => a.percentage);

      const engagementScore = calculateEngagementScore(
        progress || { studentId: student.id, phaseProgress: [], currentPhase: 'ANALYZE', overallProgress: 0, iterationEvents: [] },
        studentAssessments,
        studentIterations
      );

      const collaborationScore = Math.min(100, studentReviews.length * 15 + 
        studentReviews.filter(r => r.recognition.some(rec => rec.type === 'collaboration')).length * 25
      );

      const creativityIndex = calculateCreativityIndex(studentAssessments, studentReviews);
      
      const persistenceMetric = Math.min(100, studentIterations.length * 25);

      return {
        studentId: student.id,
        studentName: student.name,
        overallProgress: progress?.overallProgress || 0,
        phaseCompletionTimes,
        iterationFrequency: studentIterations.length / Math.max(1, currentWeek),
        assessmentTrends,
        engagementScore,
        collaborationScore,
        creativityIndex,
        persistenceMetric
      };
    });

    // Classroom analytics
    const totalStudents = students.length;
    const averageProgress = individualAnalytics.reduce((sum, a) => sum + a.overallProgress, 0) / totalStudents;

    const phaseDistribution: Record<PhaseType, number> = phases.reduce((acc, phase) => {
      acc[phase.type] = studentProgress.filter(p => p.currentPhase === phase.type).length;
      return acc;
    }, {} as Record<PhaseType, number>);

    const allIterations = individualAnalytics.flatMap(a => iterations.filter(i => 
      studentProgress.find(p => p.studentId === a.studentId)?.iterationEvents.some(ie => ie.id === i.id)
    ));
    
    const averageIterations = allIterations.length / totalStudents;
    const highIterators = individualAnalytics
      .filter(a => a.iterationFrequency > averageIterations * 1.5)
      .map(a => a.studentId);
    const lowIterators = individualAnalytics
      .filter(a => a.iterationFrequency < averageIterations * 0.5)
      .map(a => a.studentId);

    const performanceTrends = {
      improving: individualAnalytics.filter(a => {
        const recent = a.assessmentTrends.slice(-2);
        return recent.length >= 2 && recent[1] > recent[0];
      }).length,
      stable: individualAnalytics.filter(a => {
        const recent = a.assessmentTrends.slice(-2);
        return recent.length >= 2 && Math.abs(recent[1] - recent[0]) <= 5;
      }).length,
      declining: individualAnalytics.filter(a => {
        const recent = a.assessmentTrends.slice(-2);
        return recent.length >= 2 && recent[1] < recent[0];
      }).length
    };

    // Simplified collaboration network
    const collaborationNetwork = individualAnalytics.map(student => ({
      nodeId: student.studentId,
      connections: peerReviews
        .filter(r => r.reviewerId === student.studentId || r.revieweeId === student.studentId)
        .map(r => r.reviewerId === student.studentId ? r.revieweeId : r.reviewerId)
        .filter(id => id !== student.studentId),
      strength: Math.min(100, peerReviews.filter(r => 
        r.reviewerId === student.studentId || r.revieweeId === student.studentId
      ).length * 10)
    }));

    const riskThreshold = (currentWeek / projectDuration) * 100 - 20;
    const riskStudents = individualAnalytics
      .filter(a => a.overallProgress < riskThreshold && a.engagementScore < 60)
      .map(a => a.studentId);

    const topPerformers = individualAnalytics
      .filter(a => a.overallProgress > averageProgress + 15 && a.engagementScore > 80)
      .sort((a, b) => b.overallProgress - a.overallProgress)
      .slice(0, Math.ceil(totalStudents * 0.2))
      .map(a => a.studentId);

    const classroomAnalytics: ClassroomAnalytics = {
      totalStudents,
      averageProgress,
      phaseDistribution,
      iterationPatterns: {
        highIterators,
        lowIterators,
        averageIterations
      },
      performanceTrends,
      collaborationNetwork,
      riskStudents,
      topPerformers
    };

    // Generate predictive insights
    const insights = generatePredictiveInsights(
      individualAnalytics,
      classroomAnalytics,
      currentWeek,
      projectDuration
    );

    return {
      individual: individualAnalytics,
      classroom: classroomAnalytics,
      insights
    };
  }, [students, studentProgress, assessments, peerReviews, iterations, phases, currentWeek, projectDuration]);

  // Export analytics data
  const handleExport = useCallback((format: 'pdf' | 'csv' | 'json') => {
    if (onExport) {
      const exportData = {
        timestamp: new Date().toISOString(),
        projectWeek: currentWeek,
        individual: analytics.individual,
        classroom: analytics.classroom,
        insights: analytics.insights,
        metadata: {
          gradeLevel,
          projectDuration,
          totalStudents: students.length
        }
      };
      onExport(exportData, format);
    }
  }, [analytics, onExport, currentWeek, gradeLevel, projectDuration, students.length]);

  // Share insights
  const handleShareInsights = useCallback(() => {
    if (onShare) {
      onShare(analytics.insights);
    }
  }, [analytics.insights, onShare]);

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) return { icon: TrendingUp, color: 'green', direction: 'up' };
    if (current < previous) return { icon: TrendingDown, color: 'red', direction: 'down' };
    return { icon: Activity, color: 'blue', direction: 'stable' };
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  // Get priority color
  const getPriorityColor = (priority: PredictiveInsight['priority']): string => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Learning Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Data-driven insights into learning progress and outcomes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                showAdvanced
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
            {onShare && (
              <button
                onClick={handleShareInsights}
                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            )}
            {onExport && (
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs">Students</span>
            </div>
            <div className="text-2xl font-bold text-primary-900">
              {analytics.classroom.totalStudents}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Avg Progress</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {formatPercentage(analytics.classroom.averageProgress)}
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs">Avg Iterations</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">
              {analytics.classroom.iterationPatterns.averageIterations.toFixed(1)}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Brain className="w-4 h-4" />
              <span className="text-xs">Insights</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {analytics.insights.length}
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {(['overview', 'individuals', 'predictions', 'trends'] as const).map(view => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                selectedView === view
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* Overview */}
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Phase Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Distribution</h3>
                <div className="grid grid-cols-4 gap-4">
                  {phases.map(phase => {
                    const count = analytics.classroom.phaseDistribution[phase.type];
                    const percentage = (count / analytics.classroom.totalStudents) * 100;
                    return (
                      <div key={phase.type} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <phase.icon className="w-5 h-5" style={{ color: phase.color }} />
                          <span className="font-medium text-gray-900">{phase.name}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-700">{count}</div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage(percentage)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: phase.color, 
                              width: `${percentage}%` 
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Performance Trends */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Improving</span>
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      {analytics.classroom.performanceTrends.improving}
                    </div>
                    <div className="text-sm text-green-600">
                      {formatPercentage((analytics.classroom.performanceTrends.improving / analytics.classroom.totalStudents) * 100)} of students
                    </div>
                  </div>

                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-primary-900">Stable</span>
                    </div>
                    <div className="text-3xl font-bold text-primary-700">
                      {analytics.classroom.performanceTrends.stable}
                    </div>
                    <div className="text-sm text-primary-600">
                      {formatPercentage((analytics.classroom.performanceTrends.stable / analytics.classroom.totalStudents) * 100)} of students
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">Declining</span>
                    </div>
                    <div className="text-3xl font-bold text-red-700">
                      {analytics.classroom.performanceTrends.declining}
                    </div>
                    <div className="text-sm text-red-600">
                      {formatPercentage((analytics.classroom.performanceTrends.declining / analytics.classroom.totalStudents) * 100)} of students
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
                <div className="space-y-3">
                  {analytics.insights.slice(0, 3).map((insight, idx) => {
                    const color = getPriorityColor(insight.priority);
                    return (
                      <div
                        key={idx}
                        className={`p-4 bg-${color}-50 border border-${color}-200 rounded-lg`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {insight.type === 'risk_alert' && <AlertTriangle className={`w-5 h-5 text-${color}-600`} />}
                              {insight.type === 'success_prediction' && <CheckCircle className={`w-5 h-5 text-${color}-600`} />}
                              {insight.type === 'intervention_needed' && <Eye className={`w-5 h-5 text-${color}-600`} />}
                              {insight.type === 'opportunity' && <Zap className={`w-5 h-5 text-${color}-600`} />}
                              <span className={`font-medium text-${color}-900`}>{insight.title}</span>
                            </div>
                            <p className={`text-sm text-${color}-800 mb-2`}>{insight.description}</p>
                            <div className="text-xs text-gray-600">
                              Confidence: {insight.confidence}% • Timeline: {insight.timeline}
                            </div>
                          </div>
                          <span className={`px-2 py-1 bg-${color}-100 text-${color}-700 text-xs rounded-full capitalize`}>
                            {insight.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Individual Analytics */}
          {selectedView === 'individuals' && (
            <motion.div
              key="individuals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Individual Student Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.individual.map(student => (
                  <div
                    key={student.studentId}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedStudent(
                      selectedStudent === student.studentId ? null : student.studentId
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{student.studentName}</h4>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        student.overallProgress >= 80 ? 'bg-green-100 text-green-800' :
                        student.overallProgress >= 60 ? 'bg-primary-100 text-primary-800' :
                        student.overallProgress >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {formatPercentage(student.overallProgress)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Engagement</div>
                        <div className="text-sm font-medium">{student.engagementScore}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Creativity</div>
                        <div className="text-sm font-medium">{student.creativityIndex}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Collaboration</div>
                        <div className="text-sm font-medium">{student.collaborationScore}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Iterations</div>
                        <div className="text-sm font-medium">{student.iterationFrequency.toFixed(1)}</div>
                      </div>
                    </div>

                    {selectedStudent === student.studentId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Phase Time Distribution</h5>
                            <div className="space-y-1">
                              {Object.entries(student.phaseCompletionTimes).map(([phase, time]) => (
                                <div key={phase} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">{phase}</span>
                                  <span className="font-medium">
                                    {Math.round(time / 60)} hours
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {student.assessmentTrends.length > 1 && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Assessment Trend</h5>
                              <div className="flex items-center gap-2">
                                {student.assessmentTrends.map((score, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                                    <span className="text-xs text-gray-600">{score}%</span>
                                    {idx < student.assessmentTrends.length - 1 && (
                                      <ArrowUpRight className="w-3 h-3 text-gray-400" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Predictive Insights */}
          {selectedView === 'predictions' && (
            <motion.div
              key="predictions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Predictive Insights</h3>
              
              <div className="space-y-4">
                {analytics.insights.map((insight, idx) => {
                  const color = getPriorityColor(insight.priority);
                  return (
                    <div
                      key={idx}
                      className={`border border-${color}-200 rounded-lg overflow-hidden`}
                    >
                      <div className={`p-4 bg-${color}-50`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {insight.type === 'risk_alert' && <AlertTriangle className={`w-6 h-6 text-${color}-600 mt-0.5`} />}
                            {insight.type === 'success_prediction' && <CheckCircle className={`w-6 h-6 text-${color}-600 mt-0.5`} />}
                            {insight.type === 'intervention_needed' && <Eye className={`w-6 h-6 text-${color}-600 mt-0.5`} />}
                            {insight.type === 'opportunity' && <Zap className={`w-6 h-6 text-${color}-600 mt-0.5`} />}
                            <div>
                              <h4 className={`font-semibold text-${color}-900`}>{insight.title}</h4>
                              <p className={`text-${color}-800 mt-1`}>{insight.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className={`text-${color}-700`}>
                                  Confidence: {insight.confidence}%
                                </span>
                                <span className={`text-${color}-700`}>
                                  Timeline: {insight.timeline}
                                </span>
                                {insight.studentIds && (
                                  <span className={`text-${color}-700`}>
                                    {insight.studentIds.length} students
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 bg-${color}-100 text-${color}-700 text-sm rounded-full capitalize`}>
                            {insight.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        <h5 className="font-medium text-gray-900 mb-2">Recommended Actions:</h5>
                        <ul className="space-y-1">
                          {insight.recommendations.map((rec, recIdx) => (
                            <li key={recIdx} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-gray-400 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Trends */}
          {selectedView === 'trends' && (
            <motion.div
              key="trends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
              
              {/* Iteration Patterns */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Iteration Patterns</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {analytics.classroom.iterationPatterns.highIterators.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">High Iterators</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {">"} {analytics.classroom.iterationPatterns.averageIterations.toFixed(1)} avg
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.classroom.iterationPatterns.averageIterations.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Average Iterations</div>
                      <div className="text-xs text-gray-500 mt-1">per student</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.classroom.iterationPatterns.lowIterators.length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Low Iterators</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {"<"} {(analytics.classroom.iterationPatterns.averageIterations * 0.5).toFixed(1)} avg
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Risk vs Success Distribution */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Success vs Risk Distribution</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-900">Top Performers</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {analytics.classroom.topPerformers.length}
                    </div>
                    <div className="text-sm text-green-700">
                      {formatPercentage((analytics.classroom.topPerformers.length / analytics.classroom.totalStudents) * 100)} of class
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-900">At Risk</span>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {analytics.classroom.riskStudents.length}
                    </div>
                    <div className="text-sm text-red-700">
                      {formatPercentage((analytics.classroom.riskStudents.length / analytics.classroom.totalStudents) * 100)} of class
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Progress Projection */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Progress Projection</h4>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    Current Week: {currentWeek} of {projectDuration}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round(((projectDuration - currentWeek) / projectDuration) * 100)}% time remaining
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-green-500 h-4 rounded-full"
                      style={{ width: `${(currentWeek / projectDuration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-600">
                    <span>Week 1</span>
                    <span>Week {Math.floor(projectDuration / 2)}</span>
                    <span>Week {projectDuration}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};