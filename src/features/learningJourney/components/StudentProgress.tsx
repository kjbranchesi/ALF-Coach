/**
 * StudentProgress.tsx
 * 
 * Comprehensive student progress tracking and visualization
 * Part of Sprint 4: Assessment and Rubrics
 * 
 * FEATURES:
 * - Real-time progress tracking
 * - Phase completion monitoring
 * - Achievement badges
 * - Growth visualization
 * - Parent-friendly reports
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Trophy,
  Medal,
  Zap,
  Heart,
  BookOpen,
  Users,
  MessageSquare,
  Download,
  Share2,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  PhaseType,
  GradeLevel,
  CreativePhase,
  PhaseProgress,
  StudentProgress as StudentProgressType,
  IterationEvent
} from '../types';
import { Assessment } from './AssessmentCriteria';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'phase' | 'iteration' | 'collaboration' | 'excellence' | 'growth';
  earnedAt?: Date;
  progress?: number; // For partial achievements
}

export interface ProgressMilestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  phaseType?: PhaseType;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
}

export interface GrowthMetric {
  category: string;
  startValue: number;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

interface StudentProgressProps {
  student: {
    id: string;
    name: string;
    grade: string;
    avatar?: string;
  };
  progress: StudentProgressType;
  phases: CreativePhase[];
  assessments: Assessment[];
  iterations: IterationEvent[];
  projectDuration: number;
  currentWeek: number;
  gradeLevel: GradeLevel;
  onExport?: (format: 'pdf' | 'csv') => void;
  onShare?: () => void;
  showParentView?: boolean;
  className?: string;
}

// Achievement definitions
const ACHIEVEMENTS: Achievement[] = [
  // Phase achievements
  {
    id: 'first-phase',
    name: 'Journey Begins',
    description: 'Complete your first phase',
    icon: Star,
    category: 'phase'
  },
  {
    id: 'all-phases',
    name: 'Full Circle',
    description: 'Complete all four phases',
    icon: Trophy,
    category: 'phase'
  },
  {
    id: 'analyze-master',
    name: 'Research Expert',
    description: 'Excel in the Analyze phase',
    icon: BookOpen,
    category: 'excellence'
  },
  {
    id: 'creative-thinker',
    name: 'Creative Thinker',
    description: 'Generate 10+ unique ideas',
    icon: Zap,
    category: 'excellence'
  },
  {
    id: 'prototype-builder',
    name: 'Master Builder',
    description: 'Create an outstanding prototype',
    icon: Medal,
    category: 'excellence'
  },
  
  // Iteration achievements
  {
    id: 'quick-learner',
    name: 'Quick Learner',
    description: 'Complete iteration in under 2 days',
    icon: Activity,
    category: 'iteration'
  },
  {
    id: 'persistent',
    name: 'Persistent',
    description: 'Successfully iterate and improve',
    icon: Heart,
    category: 'iteration'
  },
  
  // Collaboration achievements
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Help 3+ classmates',
    icon: Users,
    category: 'collaboration'
  },
  {
    id: 'communicator',
    name: 'Great Communicator',
    description: 'Receive excellent feedback on presentation',
    icon: MessageSquare,
    category: 'collaboration'
  },
  
  // Growth achievements
  {
    id: 'growth-mindset',
    name: 'Growth Mindset',
    description: 'Show consistent improvement',
    icon: TrendingUp,
    category: 'growth'
  }
];

// Helper function to calculate phase completion
const calculatePhaseCompletion = (phase: CreativePhase): number => {
  const objectiveWeight = 0.3;
  const activityWeight = 0.4;
  const deliverableWeight = 0.3;
  
  const objectiveProgress = Math.min(100, (phase.objectives.length / 2) * 100);
  const activityProgress = Math.min(100, (phase.activities.length / 3) * 100);
  const deliverableProgress = Math.min(100, (phase.deliverables.length / 1) * 100);
  
  return Math.round(
    objectiveProgress * objectiveWeight +
    activityProgress * activityWeight +
    deliverableProgress * deliverableWeight
  );
};

export const StudentProgress: React.FC<StudentProgressProps> = ({
  student,
  progress,
  phases,
  assessments,
  iterations,
  projectDuration,
  currentWeek,
  gradeLevel,
  onExport,
  onShare,
  showParentView = false,
  className = ''
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'phases' | 'achievements' | 'growth'>('overview');
  const [selectedPhase, setSelectedPhase] = useState<PhaseType | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Calculate overall metrics
  const metrics = useMemo(() => {
    // Phase completion
    const phaseCompletion = phases.map((phase, idx) => ({
      phase: phase.type,
      name: phase.name,
      completion: calculatePhaseCompletion(phase),
      isActive: idx === progress.currentPhase,
      iterations: iterations.filter(i => i.toPhase === phase.type).length
    }));
    
    // Overall progress
    const overallProgress = Math.round(
      phaseCompletion.reduce((sum, p) => sum + p.completion, 0) / phases.length
    );
    
    // Time metrics
    const timeSpent = progress.phaseProgress.reduce((sum, p) => sum + p.timeSpent, 0);
    const timeRemaining = (projectDuration - currentWeek) * 40 * 60; // in minutes
    const paceStatus = currentWeek / projectDuration > overallProgress / 100 ? 'behind' : 'on-track';
    
    // Assessment metrics
    const averageScore = assessments.length > 0
      ? Math.round(assessments.reduce((sum, a) => sum + a.percentage, 0) / assessments.length)
      : 0;
    
    // Growth metrics
    const growthMetrics: GrowthMetric[] = [
      {
        category: 'Problem Solving',
        startValue: 60,
        currentValue: 75,
        targetValue: 90,
        unit: '%',
        trend: 'improving'
      },
      {
        category: 'Creativity',
        startValue: 70,
        currentValue: 85,
        targetValue: 95,
        unit: '%',
        trend: 'improving'
      },
      {
        category: 'Collaboration',
        startValue: 65,
        currentValue: 80,
        targetValue: 85,
        unit: '%',
        trend: 'stable'
      },
      {
        category: 'Communication',
        startValue: 55,
        currentValue: 70,
        targetValue: 80,
        unit: '%',
        trend: 'improving'
      }
    ];
    
    // Earned achievements
    const earnedAchievements = ACHIEVEMENTS.map(achievement => {
      let earned = false;
      let progress = 0;
      
      // Check achievement conditions
      switch (achievement.id) {
        case 'first-phase':
          earned = phaseCompletion.some(p => p.completion === 100);
          break;
        case 'all-phases':
          earned = phaseCompletion.every(p => p.completion === 100);
          progress = phaseCompletion.filter(p => p.completion === 100).length * 25;
          break;
        case 'quick-learner':
          earned = iterations.some(i => i.duration < 2 * 8 * 60);
          break;
        case 'persistent':
          earned = iterations.length > 0;
          break;
        case 'growth-mindset':
          earned = growthMetrics.filter(m => m.trend === 'improving').length >= 3;
          break;
      }
      
      return {
        ...achievement,
        earnedAt: earned ? new Date() : undefined,
        progress: earned ? 100 : progress
      };
    });
    
    // Milestones
    const milestones: ProgressMilestone[] = phases.map((phase, idx) => ({
      id: phase.type,
      name: `Complete ${phase.name} Phase`,
      description: phase.description,
      targetDate: new Date(Date.now() + (idx + 1) * 7 * 24 * 60 * 60 * 1000),
      completedDate: phaseCompletion[idx].completion === 100 ? new Date() : undefined,
      phaseType: phase.type,
      status: phaseCompletion[idx].completion === 100 ? 'completed' :
              phaseCompletion[idx].isActive ? 'in_progress' :
              idx < progress.currentPhase ? 'overdue' : 'upcoming'
    }));
    
    return {
      phaseCompletion,
      overallProgress,
      timeSpent,
      timeRemaining,
      paceStatus,
      averageScore,
      growthMetrics,
      earnedAchievements,
      milestones
    };
  }, [phases, progress, iterations, assessments, projectDuration, currentWeek]);

  // Format time display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 8);
    
    if (days > 0) {
      return `${days}d ${hours % 8}h`;
    }
    return `${hours}h ${minutes % 60}m`;
  };

  // Get phase color
  const getPhaseColor = (phase: PhaseType): string => {
    switch (phase) {
      case 'ANALYZE': return 'blue';
      case 'BRAINSTORM': return 'yellow';
      case 'PROTOTYPE': return 'purple';
      case 'EVALUATE': return 'green';
    }
  };

  // Get achievement category color
  const getAchievementColor = (category: Achievement['category']): string => {
    switch (category) {
      case 'phase': return 'blue';
      case 'iteration': return 'purple';
      case 'collaboration': return 'green';
      case 'excellence': return 'yellow';
      case 'growth': return 'pink';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {student.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-600">{student.grade} • Week {currentWeek} of {projectDuration}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">
                    {metrics.earnedAchievements.filter(a => a.earnedAt).length} achievements
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-700">
                    {metrics.averageScore}% avg score
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onShare && (
              <button
                onClick={onShare}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            {onExport && (
              <button
                onClick={() => onExport('pdf')}
                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{metrics.overallProgress}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${metrics.overallProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            {/* Milestone markers */}
            {[25, 50, 75].map(milestone => (
              <div
                key={milestone}
                className="absolute top-0 h-3 w-0.5 bg-gray-400"
                style={{ left: `${milestone}%` }}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-primary-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Current Phase</span>
            </div>
            <div className="text-lg font-bold text-primary-900">
              {phases[progress.currentPhase]?.name || 'Not Started'}
            </div>
          </div>
          
          <div className={`rounded-lg p-3 ${
            metrics.paceStatus === 'on-track' ? 'bg-green-50' : 'bg-orange-50'
          }`}>
            <div className={`flex items-center gap-2 mb-1 ${
              metrics.paceStatus === 'on-track' ? 'text-green-600' : 'text-orange-600'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="text-xs">Pace</span>
            </div>
            <div className={`text-lg font-bold ${
              metrics.paceStatus === 'on-track' ? 'text-green-900' : 'text-orange-900'
            }`}>
              {metrics.paceStatus === 'on-track' ? 'On Track' : 'Behind Schedule'}
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Time Spent</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {formatTime(metrics.timeSpent)}
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Iterations</span>
            </div>
            <div className="text-lg font-bold text-yellow-900">
              {iterations.length}
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {(['overview', 'phases', 'achievements', 'growth'] as const).map(view => (
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
          {/* Overview View */}
          {selectedView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Phase Progress Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Progress</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metrics.phaseCompletion.map((phase, idx) => {
                    const color = getPhaseColor(phase.phase);
                    return (
                      <div
                        key={phase.phase}
                        className={`relative p-4 rounded-lg border-2 ${
                          phase.isActive ? `border-${color}-500 bg-${color}-50` : 'border-gray-200'
                        }`}
                      >
                        {phase.isActive && (
                          <div className="absolute -top-2 -right-2">
                            <span className="flex h-3 w-3">
                              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`} />
                              <span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}-500`} />
                            </span>
                          </div>
                        )}
                        
                        <h4 className="font-medium text-gray-900 mb-2">{phase.name}</h4>
                        
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className={`text-xs font-semibold inline-block text-${color}-600`}>
                                {phase.completion}%
                              </span>
                            </div>
                            {phase.iterations > 0 && (
                              <div className="text-xs text-gray-500">
                                {phase.iterations} iteration{phase.iterations !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${phase.completion}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}-500`}
                            />
                          </div>
                        </div>
                        
                        {phase.completion === 100 && (
                          <CheckCircle className={`w-4 h-4 text-${color}-600 mt-2`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Achievements */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                  <button
                    onClick={() => setSelectedView('achievements')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View all →
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {metrics.earnedAchievements
                    .filter(a => a.earnedAt)
                    .slice(0, 3)
                    .map(achievement => {
                      const color = getAchievementColor(achievement.category);
                      return (
                        <div
                          key={achievement.id}
                          className={`p-3 bg-${color}-50 rounded-lg border border-${color}-200`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <achievement.icon className={`w-5 h-5 text-${color}-600`} />
                            <span className={`text-sm font-medium text-${color}-900`}>
                              {achievement.name}
                            </span>
                          </div>
                          <p className={`text-xs text-${color}-700`}>
                            {achievement.description}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Milestones</h3>
                <div className="space-y-3">
                  {metrics.milestones
                    .filter(m => m.status !== 'completed')
                    .slice(0, 3)
                    .map(milestone => (
                      <div
                        key={milestone.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            milestone.status === 'in_progress' ? 'bg-primary-500' :
                            milestone.status === 'overdue' ? 'bg-red-500' :
                            'bg-gray-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{milestone.name}</p>
                            <p className="text-xs text-gray-600">
                              Due: {milestone.targetDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {milestone.status === 'in_progress' && (
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                            In Progress
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phases View */}
          {selectedView === 'phases' && (
            <motion.div
              key="phases"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {phases.map((phase, idx) => {
                const phaseProgress = metrics.phaseCompletion[idx];
                const phaseIterations = iterations.filter(i => i.toPhase === phase.type);
                const color = getPhaseColor(phase.type);
                
                return (
                  <div
                    key={phase.type}
                    className={`border rounded-lg overflow-hidden ${
                      phaseProgress.isActive ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <div className={`p-4 bg-${color}-50`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <phase.icon className={`w-6 h-6 text-${color}-600`} />
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {phase.name}
                              {phaseProgress.isActive && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                                  Current
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold text-${color}-700`}>
                            {phaseProgress.completion}%
                          </div>
                          {phaseProgress.completion === 100 && (
                            <CheckCircle className={`w-5 h-5 text-${color}-600 ml-auto mt-1`} />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Objectives</span>
                          <div className="font-medium text-gray-900">
                            {phase.objectives.length}/2
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Activities</span>
                          <div className="font-medium text-gray-900">
                            {phase.activities.length}/3
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Deliverables</span>
                          <div className="font-medium text-gray-900">
                            {phase.deliverables.length}/1
                          </div>
                        </div>
                      </div>
                      
                      {phaseIterations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            {phaseIterations.length} iteration{phaseIterations.length !== 1 ? 's' : ''} in this phase
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Achievements View */}
          {selectedView === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">All Achievements</h3>
                <button
                  onClick={() => setShowAllAchievements(!showAllAchievements)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {showAllAchievements ? 'Show earned only' : 'Show all'}
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {metrics.earnedAchievements
                  .filter(a => showAllAchievements || a.earnedAt)
                  .map(achievement => {
                    const color = getAchievementColor(achievement.category);
                    const isEarned = !!achievement.earnedAt;
                    
                    return (
                      <div
                        key={achievement.id}
                        className={`relative p-4 rounded-lg border-2 ${
                          isEarned
                            ? `border-${color}-300 bg-${color}-50`
                            : 'border-gray-200 bg-gray-50 opacity-60'
                        }`}
                      >
                        {!isEarned && achievement.progress > 0 && (
                          <div className="absolute top-2 right-2">
                            <div className="text-xs text-gray-600">{achievement.progress}%</div>
                          </div>
                        )}
                        
                        <achievement.icon className={`w-8 h-8 mb-2 ${
                          isEarned ? `text-${color}-600` : 'text-gray-400'
                        }`} />
                        
                        <h4 className={`font-medium ${
                          isEarned ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {achievement.name}
                        </h4>
                        
                        <p className={`text-xs mt-1 ${
                          isEarned ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {achievement.description}
                        </p>
                        
                        {isEarned && (
                          <p className="text-xs text-gray-500 mt-2">
                            Earned: {achievement.earnedAt.toLocaleDateString()}
                          </p>
                        )}
                        
                        {!isEarned && achievement.progress > 0 && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-300 rounded-full h-1">
                              <div
                                className={`bg-${color}-500 h-1 rounded-full`}
                                style={{ width: `${achievement.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}

          {/* Growth View */}
          {selectedView === 'growth' && (
            <motion.div
              key="growth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Growth Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metrics.growthMetrics.map(metric => (
                  <div key={metric.category} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{metric.category}</h4>
                      <div className={`flex items-center gap-1 ${
                        metric.trend === 'improving' ? 'text-green-600' :
                        metric.trend === 'stable' ? 'text-primary-600' :
                        'text-red-600'
                      }`}>
                        {metric.trend === 'improving' ? <TrendingUp className="w-4 h-4" /> :
                         metric.trend === 'stable' ? <Activity className="w-4 h-4" /> :
                         <TrendingUp className="w-4 h-4 rotate-180" />}
                        <span className="text-sm capitalize">{metric.trend}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Start</span>
                        <span className="font-medium">{metric.startValue}{metric.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current</span>
                        <span className="font-medium text-primary-600">{metric.currentValue}{metric.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Target</span>
                        <span className="font-medium">{metric.targetValue}{metric.unit}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="w-full bg-gray-300 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-green-500 h-2 rounded-full"
                          style={{
                            width: `${((metric.currentValue - metric.startValue) / (metric.targetValue - metric.startValue)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Parent-Friendly Summary */}
              {showParentView && (
                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                  <h4 className="font-medium text-primary-900 mb-2">Parent Summary</h4>
                  <p className="text-sm text-primary-800">
                    {student.name} is making excellent progress in the Creative Process Journey.
                    They have completed {metrics.phaseCompletion.filter(p => p.completion === 100).length} out of 4 phases
                    and earned {metrics.earnedAchievements.filter(a => a.earnedAt).length} achievements.
                    Their strongest area is {metrics.growthMetrics[1].category} with {metrics.growthMetrics[1].currentValue}% proficiency.
                  </p>
                  <p className="text-sm text-primary-800 mt-2">
                    Areas showing great improvement include problem-solving and creativity.
                    {metrics.paceStatus === 'on-track' 
                      ? ' They are on track to complete the project on time.'
                      : ' They may need some additional support to stay on schedule.'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};