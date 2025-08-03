/**
 * Progress Monitoring Dashboard Component
 * Provides real-time progress tracking and insights for ALF Coach projects
 */

import React, { useState, useEffect } from 'react';
import { ProgressTrackingIntegration, ProgressData, LearningProgression, ProgressInsight } from '../../services/progress-tracking-integration';
import { BlueprintDoc, SOPStep } from '../../core/types/SOPTypes';

interface ProgressMonitoringDashboardProps {
  blueprint: BlueprintDoc;
  currentStep: SOPStep;
  onInsightAction?: (insight: ProgressInsight) => void;
}

interface StudentProgress {
  studentId: string;
  name: string;
  progressData: ProgressData[];
  progressions: LearningProgression[];
  insights: ProgressInsight[];
}

export const ProgressMonitoringDashboard: React.FC<ProgressMonitoringDashboardProps> = ({
  blueprint,
  currentStep,
  onInsightAction
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'individual' | 'insights'>('overview');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const progressTracker = new ProgressTrackingIntegration();

  // Simulate loading progress data
  useEffect(() => {
    loadProgressData();
  }, [blueprint]);

  const loadProgressData = async () => {
    setIsLoading(true);
    
    // Simulate loading student progress data
    const mockStudents: StudentProgress[] = [
      {
        studentId: 'student-1',
        name: 'Alex Johnson',
        progressData: generateMockProgressData('student-1'),
        progressions: [],
        insights: []
      },
      {
        studentId: 'student-2',
        name: 'Sam Williams',
        progressData: generateMockProgressData('student-2'),
        progressions: [],
        insights: []
      },
      {
        studentId: 'student-3',
        name: 'Jordan Davis',
        progressData: generateMockProgressData('student-3'),
        progressions: [],
        insights: []
      }
    ];

    // Generate progressions and insights for each student
    mockStudents.forEach(student => {
      student.progressData.forEach(data => {
        const progression = progressTracker.generateProgression(data.objectiveId, data);
        student.progressions.push(progression);
      });
      student.insights = progressTracker.generateInsights(student.progressData);
    });

    setStudentProgress(mockStudents);
    setIsLoading(false);
  };

  const generateMockProgressData = (studentId: string): ProgressData[] => {
    // Generate mock data based on blueprint learning objectives
    const objectives = extractLearningObjectives(blueprint);
    return objectives.map((obj, index) => ({
      studentId,
      objectiveId: `obj-${index}`,
      currentLevel: randomLevel(),
      attempts: Math.floor(Math.random() * 5) + 1,
      successRate: Math.floor(Math.random() * 40) + 60,
      timeSpent: Math.floor(Math.random() * 120) + 30,
      lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      growthRate: Math.random() * 0.8 + 0.2
    }));
  };

  const randomLevel = (): ProgressData['currentLevel'] => {
    const levels: ProgressData['currentLevel'][] = ['novice', 'developing', 'proficient', 'advanced'];
    return levels[Math.floor(Math.random() * levels.length)];
  };

  const extractLearningObjectives = (blueprint: BlueprintDoc): string[] => {
    // Extract learning objectives from blueprint
    const objectives: string[] = [];
    
    if (blueprint.ideation?.challenge) {
      objectives.push(`Master the ${blueprint.ideation.challenge} challenge`);
    }
    
    if (blueprint.journey?.phases) {
      blueprint.journey.phases.forEach(phase => {
        objectives.push(`Complete ${phase.title} phase`);
      });
    }
    
    return objectives.length > 0 ? objectives : ['Objective 1', 'Objective 2', 'Objective 3'];
  };

  const getProgressSummary = () => {
    let totalStudents = studentProgress.length;
    let onTrack = 0;
    let needSupport = 0;
    let excelling = 0;

    studentProgress.forEach(student => {
      const avgSuccess = student.progressData.reduce((sum, data) => sum + data.successRate, 0) / student.progressData.length;
      
      if (avgSuccess >= 85) excelling++;
      else if (avgSuccess >= 70) onTrack++;
      else needSupport++;
    });

    return { totalStudents, onTrack, needSupport, excelling };
  };

  const renderOverviewTab = () => {
    const summary = getProgressSummary();
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Students"
            value={summary.totalStudents}
            icon="👥"
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <SummaryCard
            title="On Track"
            value={summary.onTrack}
            icon="✅"
            color="bg-green-50 dark:bg-green-900/20"
          />
          <SummaryCard
            title="Need Support"
            value={summary.needSupport}
            icon="🤝"
            color="bg-yellow-50 dark:bg-yellow-900/20"
          />
          <SummaryCard
            title="Excelling"
            value={summary.excelling}
            icon="⭐"
            color="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>

        {/* Class Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Class Progress Overview</h3>
          <div className="space-y-4">
            {extractLearningObjectives(blueprint).map((objective, index) => {
              const avgProgress = calculateAverageProgress(index);
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{objective}</span>
                    <span className="font-medium">{avgProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {getRecentActivities().map((activity, index) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                <span className="text-2xl">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderIndividualTab = () => {
    if (!selectedStudent) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {studentProgress.map(student => (
            <button
              key={student.studentId}
              onClick={() => setSelectedStudent(student.studentId)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
            >
              <h4 className="font-semibold text-lg mb-2">{student.name}</h4>
              <div className="space-y-2">
                {student.progressions.slice(0, 2).map((progression, index) => (
                  <div key={index} className="text-sm">
                    {progressTracker.createProgressVisualization(progression)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Click to view detailed progress →
              </p>
            </button>
          ))}
        </div>
      );
    }

    const student = studentProgress.find(s => s.studentId === selectedStudent);
    if (!student) return null;

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          ← Back to all students
        </button>

        {/* Student Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">{student.name}'s Progress</h3>
          
          {/* Progress Details */}
          <div className="space-y-6">
            {student.progressions.map((progression, index) => (
              <div key={index} className="border-t pt-4 first:border-0 first:pt-0">
                <h4 className="font-medium mb-3">
                  {extractLearningObjectives(blueprint)[index] || `Objective ${index + 1}`}
                </h4>
                
                {/* Visual Progress */}
                <div className="mb-3">
                  {progressTracker.createProgressVisualization(progression)}
                </div>
                
                {/* Milestones */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {progression.milestones.map((milestone, mIndex) => (
                    <div
                      key={mIndex}
                      className={`p-3 rounded-lg text-center ${
                        milestone.achieved
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <p className="text-xs font-medium">{milestone.description}</p>
                      <p className="text-lg mt-1">{milestone.achieved ? '✓' : milestone.requiredScore + '%'}</p>
                    </div>
                  ))}
                </div>
                
                {/* Additional Info */}
                <div className="mt-3 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Projected Mastery: {progression.projectedMastery.toLocaleDateString()}</span>
                  {progression.supportNeeded && (
                    <span className="text-yellow-600 dark:text-yellow-400">🤝 Support Recommended</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual Insights */}
        {student.insights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Personalized Insights</h4>
            <div className="space-y-3">
              {student.insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} onAction={onInsightAction} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInsightsTab = () => {
    const allInsights = studentProgress.flatMap(student => 
      student.insights.map(insight => ({ ...insight, studentName: student.name }))
    );

    const highPriority = allInsights.filter(i => i.urgency === 'high');
    const mediumPriority = allInsights.filter(i => i.urgency === 'medium');
    const lowPriority = allInsights.filter(i => i.urgency === 'low');

    return (
      <div className="space-y-6">
        {/* High Priority Insights */}
        {highPriority.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-800 dark:text-red-200">
              🚨 High Priority Actions
            </h3>
            <div className="space-y-3">
              {highPriority.map((insight, index) => (
                <InsightCard 
                  key={index} 
                  insight={insight} 
                  studentName={(insight as any).studentName}
                  onAction={onInsightAction} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority Insights */}
        {mediumPriority.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-800 dark:text-yellow-200">
              ⚡ Recommended Actions
            </h3>
            <div className="space-y-3">
              {mediumPriority.map((insight, index) => (
                <InsightCard 
                  key={index} 
                  insight={insight} 
                  studentName={(insight as any).studentName}
                  onAction={onInsightAction} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Low Priority Insights */}
        {lowPriority.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-800 dark:text-green-200">
              💡 Opportunities
            </h3>
            <div className="space-y-3">
              {lowPriority.map((insight, index) => (
                <InsightCard 
                  key={index} 
                  insight={insight} 
                  studentName={(insight as any).studentName}
                  onAction={onInsightAction} 
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const calculateAverageProgress = (objectiveIndex: number): number => {
    const progressions = studentProgress.flatMap(s => s.progressions);
    const relevantProgressions = progressions.filter((_, index) => index % studentProgress.length === objectiveIndex);
    
    if (relevantProgressions.length === 0) return 0;
    
    const avgMilestones = relevantProgressions.reduce((sum, p) => 
      sum + (p.milestones.filter(m => m.achieved).length / p.milestones.length), 0
    ) / relevantProgressions.length;
    
    return Math.round(avgMilestones * 100);
  };

  const getRecentActivities = () => {
    const activities = [];
    
    studentProgress.forEach(student => {
      student.progressData.forEach(data => {
        if (data.successRate >= 85) {
          activities.push({
            icon: '🎉',
            message: `${student.name} mastered an objective!`,
            time: getRelativeTime(data.lastActivity)
          });
        }
      });
    });

    return activities.slice(0, 5);
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading progress data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Progress Monitoring
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track student progress and get actionable insights for {blueprint.ideation?.bigIdea || 'your project'}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <TabButton
          active={activeView === 'overview'}
          onClick={() => setActiveView('overview')}
          icon="📊"
          label="Overview"
        />
        <TabButton
          active={activeView === 'individual'}
          onClick={() => setActiveView('individual')}
          icon="👤"
          label="Individual Progress"
        />
        <TabButton
          active={activeView === 'insights'}
          onClick={() => setActiveView('insights')}
          icon="💡"
          label="Insights & Actions"
        />
      </div>

      {/* Content */}
      <div className="transition-all">
        {activeView === 'overview' && renderOverviewTab()}
        {activeView === 'individual' && renderIndividualTab()}
        {activeView === 'insights' && renderInsightsTab()}
      </div>
    </div>
  );
};

// Helper Components

interface SummaryCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-lg p-6`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
      active
        ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
    }`}
  >
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

interface InsightCardProps {
  insight: ProgressInsight;
  studentName?: string;
  onAction?: (insight: ProgressInsight) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, studentName, onAction }) => {
  const getInsightIcon = () => {
    switch (insight.type) {
      case 'celebration': return '🎉';
      case 'support': return '🤝';
      case 'challenge': return '🚀';
      case 'next-step': return '➡️';
      default: return '💡';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getInsightIcon()}</span>
        <div className="flex-1">
          {studentName && (
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{studentName}</p>
          )}
          <p className="text-gray-700 dark:text-gray-300">{insight.message}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{insight.recommendation}</p>
          {onAction && (
            <button
              onClick={() => onAction(insight)}
              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Take Action →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressMonitoringDashboard;