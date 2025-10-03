/**
 * Teacher Progress Monitoring Dashboard
 * Aggregates formative assessment data for instructional decision-making
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  type ClassProgressDashboard,
  type StudentProgressData,
  PBLStage,
  AssessmentType 
} from '../../types/FormativeAssessmentTypes';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Target,
  Brain,
  MessageSquare,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart,
  User
} from 'lucide-react';

interface ProgressMonitoringDashboardProps {
  dashboardData: ClassProgressDashboard;
  onRefresh: () => void;
  onStudentSelect: (studentId: string) => void;
  onInterventionCreate: (studentIds: string[], type: string) => void;
  onExportData: () => void;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface StudentCardProps {
  student: StudentProgressData;
  onSelect: (studentId: string) => void;
  onIntervention: (studentId: string, type: string) => void;
}

interface AlertPanelProps {
  alerts: ClassProgressDashboard['alerts'];
  onCreateIntervention: (studentIds: string[], type: string) => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendValue, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  };

  const iconColorClasses = {
    blue: 'text-primary-600 dark:text-primary-400',
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-4 rounded-lg border ${colorClasses[color]} transition-all hover:shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800`}>
            <Icon className={`w-5 h-5 ${iconColorClasses[color]}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          </div>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 
            trend === 'down' ? 'text-red-600 dark:text-red-400' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {trendValue}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StudentCard: React.FC<StudentCardProps> = ({ student, onSelect, onIntervention }) => {
  const getEngagementColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'green';
      case 'medium': return 'yellow';
      case 'low': return 'red';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) {return 'text-green-600 dark:text-green-400';}
    if (progress >= 60) {return 'text-yellow-600 dark:text-yellow-400';}
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">{student.studentName}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{student.pblStage.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => onSelect(student.studentId)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className={`font-medium ${getProgressColor(student.completionRate)}`}>
              {student.completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                student.completionRate >= 80 ? 'bg-green-500' :
                student.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${student.completionRate}%` }}
            />
          </div>
        </div>

        {/* Engagement */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Engagement</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            getEngagementColor(student.engagementLevel) === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
            getEngagementColor(student.engagementLevel) === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
          }`}>
            {student.engagementLevel}
          </span>
        </div>

        {/* Areas needing attention */}
        {student.strugglingAreas.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm text-gray-600 dark:text-gray-400">Struggling with:</span>
            <div className="flex flex-wrap gap-1">
              {student.strugglingAreas.slice(0, 2).map((area, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded text-xs"
                >
                  {area}
                </span>
              ))}
              {student.strugglingAreas.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                  +{student.strugglingAreas.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Interventions needed */}
        {student.interventionsNeeded.length > 0 && (
          <div className="flex gap-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            {student.interventionsNeeded.map((intervention, index) => (
              <button
                key={index}
                onClick={() => onIntervention(student.studentId, intervention)}
                className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded text-xs hover:bg-primary-100 dark:hover:bg-primary-800/30 transition-colors"
              >
                {intervention.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AlertPanel: React.FC<AlertPanelProps> = ({ alerts, onCreateIntervention }) => {
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [alerts]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="w-4 h-4 text-primary-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-l-blue-500 bg-primary-50 dark:bg-primary-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Good!</h3>
        <p className="text-gray-600 dark:text-gray-400">No alerts at this time. Students are progressing well.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedAlerts.map((alert, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-l-4 rounded-lg p-4 ${getPriorityColor(alert.priority)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getPriorityIcon(alert.priority)}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  {alert.description}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {alert.studentIds.length} student{alert.studentIds.length > 1 ? 's' : ''} affected
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Suggested action:</strong> {alert.suggestedAction}
                </p>
              </div>
            </div>
            <button
              onClick={() => onCreateIntervention(alert.studentIds, alert.type)}
              className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Take Action
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const ProgressMonitoringDashboard: React.FC<ProgressMonitoringDashboardProps> = ({
  dashboardData,
  onRefresh,
  onStudentSelect,
  onInterventionCreate,
  onExportData
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'students' | 'alerts'>('overview');
  const [filterStage, setFilterStage] = useState<PBLStage | 'all'>('all');

  const { students, classMetrics, alerts } = dashboardData;

  const filteredStudents = useMemo(() => {
    if (filterStage === 'all') {return students;}
    return students.filter(student => student.pblStage === filterStage);
  }, [students, filterStage]);

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(PBLStage).forEach(stage => {
      counts[stage] = students.filter(s => s.pblStage === stage).length;
    });
    return counts;
  }, [students]);

  const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high').length;
  const studentsNeedingIntervention = [...new Set(alerts.flatMap(alert => alert.studentIds))].length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Class Progress Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated: {dashboardData.lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={onExportData}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'students', label: 'Students', icon: Users },
          { key: 'alerts', label: `Alerts (${highPriorityAlerts})`, icon: AlertTriangle }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedView(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedView === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content based on selected view */}
      <AnimatePresence mode="wait">
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Class Average Progress"
                value={`${Math.round(classMetrics.averageProgress)}%`}
                trend="up"
                trendValue="+5%"
                icon={TrendingUp}
                color="blue"
              />
              <MetricCard
                title="Average Engagement"
                value={`${classMetrics.averageEngagement.toFixed(1)}/5`}
                trend="stable"
                icon={Users}
                color="green"
              />
              <MetricCard
                title="Students Needing Support"
                value={studentsNeedingIntervention}
                icon={Target}
                color="yellow"
              />
              <MetricCard
                title="High Priority Alerts"
                value={highPriorityAlerts}
                icon={AlertTriangle}
                color="red"
              />
            </div>

            {/* Stage Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Students by PBL Stage
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stageCounts).map(([stage, count]) => (
                  <div key={stage} className="text-center">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{count}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stage.replace('_', ' ').toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Challenges */}
            {classMetrics.commonChallenges.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Common Challenges
                </h3>
                <div className="flex flex-wrap gap-2">
                  {classMetrics.commonChallenges.map((challenge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 rounded-full text-sm"
                    >
                      {challenge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {selectedView === 'students' && (
          <motion.div
            key="students"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Filter by stage:</span>
              </div>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value as PBLStage | 'all')}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="all">All Stages</option>
                {Object.values(PBLStage).map(stage => (
                  <option key={stage} value={stage}>
                    {stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map(student => (
                <StudentCard
                  key={student.studentId}
                  student={student}
                  onSelect={onStudentSelect}
                  onIntervention={(studentId, type) => onInterventionCreate([studentId], type)}
                />
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No students found for the selected filter.</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedView === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AlertPanel alerts={alerts} onCreateIntervention={onInterventionCreate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};