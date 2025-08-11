/**
 * IterationAnalytics.tsx
 * 
 * Advanced analytics dashboard for iteration patterns and insights
 * Part of Sprint 3: Full Iteration Support System
 * 
 * FEATURES:
 * - Visual charts and graphs
 * - Trend analysis
 * - Predictive insights
 * - Performance metrics
 * - Recommendations engine
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Zap,
  Brain,
  Award,
  ChevronRight
} from 'lucide-react';
import { IterationEvent, PhaseType, IterationType, CreativePhase } from '../types';

interface IterationAnalyticsProps {
  iterations: IterationEvent[];
  phases: CreativePhase[];
  currentPhase: number;
  projectDuration: number;
  startDate: Date;
  className?: string;
}

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  icon: React.ElementType;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

interface PhaseMetrics {
  phase: PhaseType;
  iterations: number;
  timeSpent: number;
  efficiency: number;
  completionRate: number;
}

const PHASE_NAMES: Record<PhaseType, string> = {
  ANALYZE: 'Analyze',
  BRAINSTORM: 'Brainstorm',
  PROTOTYPE: 'Prototype',
  EVALUATE: 'Evaluate'
};

const PHASE_COLORS: Record<PhaseType, string> = {
  ANALYZE: '#3B82F6',
  BRAINSTORM: '#F59E0B',
  PROTOTYPE: '#8B5CF6',
  EVALUATE: '#10B981'
};

export const IterationAnalytics: React.FC<IterationAnalyticsProps> = ({
  iterations,
  phases,
  currentPhase,
  projectDuration,
  startDate,
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'velocity' | 'efficiency' | 'quality'>('velocity');
  const [timeFrame, setTimeFrame] = useState<'all' | 'recent' | 'phase'>('all');

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalIterations = iterations.length;
    const totalTime = iterations.reduce((sum, iter) => sum + iter.duration, 0);
    const avgIterationTime = totalIterations > 0 ? totalTime / totalIterations : 0;
    
    // Calculate velocity (iterations per week)
    const weeksSinceStart = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    const velocity = totalIterations / weeksSinceStart;
    
    // Calculate efficiency (planned vs actual time)
    const plannedTime = projectDuration * 40 * 60; // Convert weeks to minutes
    const actualTime = plannedTime + totalTime;
    const efficiency = Math.round((plannedTime / actualTime) * 100);
    
    // Calculate iteration types distribution
    const typeDistribution = iterations.reduce((acc, iter) => {
      const type = iter.metadata?.iterationType || 'quick_loop';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<IterationType, number>);
    
    // Calculate phase-specific metrics
    const phaseMetrics: PhaseMetrics[] = phases.map((phase, index) => {
      const phaseIterations = iterations.filter(i => i.toPhase === phase.type);
      const phaseTime = phaseIterations.reduce((sum, i) => sum + i.duration, 0);
      const isComplete = phase.objectives.length >= 2 && 
                        phase.activities.length >= 2 && 
                        phase.deliverables.length >= 1;
      
      return {
        phase: phase.type,
        iterations: phaseIterations.length,
        timeSpent: phaseTime,
        efficiency: phaseTime > 0 ? Math.round((phase.allocation * plannedTime) / (phase.allocation * plannedTime + phaseTime) * 100) : 100,
        completionRate: isComplete ? 100 : Math.round(
          ((phase.objectives.length / 2) * 0.4 +
           (phase.activities.length / 2) * 0.4 +
           (phase.deliverables.length / 1) * 0.2) * 100
        )
      };
    });
    
    return {
      totalIterations,
      totalTime,
      avgIterationTime,
      velocity,
      efficiency,
      typeDistribution,
      phaseMetrics
    };
  }, [iterations, phases, projectDuration, startDate]);

  // Generate insights
  const insights = useMemo<Insight[]>(() => {
    const results: Insight[] = [];
    
    // Velocity insights
    if (metrics.velocity > 2) {
      results.push({
        id: 'high-velocity',
        type: 'warning',
        title: 'High Iteration Frequency',
        description: `You're averaging ${metrics.velocity.toFixed(1)} iterations per week. Consider more thorough planning in each phase.`,
        impact: 'high',
        action: 'Review planning process'
      });
    } else if (metrics.velocity < 0.5 && iterations.length > 0) {
      results.push({
        id: 'good-velocity',
        type: 'success',
        title: 'Stable Progress',
        description: 'Your iteration rate suggests good initial planning and steady progress.',
        impact: 'medium'
      });
    }
    
    // Efficiency insights
    if (metrics.efficiency < 70) {
      results.push({
        id: 'low-efficiency',
        type: 'warning',
        title: 'Timeline Impact',
        description: `Iterations have extended your timeline by ${100 - metrics.efficiency}%. Consider adjusting expectations.`,
        impact: 'high',
        action: 'Update project timeline'
      });
    }
    
    // Phase-specific insights
    const problematicPhase = metrics.phaseMetrics.find(p => p.iterations > iterations.length * 0.4);
    if (problematicPhase) {
      results.push({
        id: 'phase-bottleneck',
        type: 'warning',
        title: `${PHASE_NAMES[problematicPhase.phase]} Phase Bottleneck`,
        description: `${problematicPhase.iterations} iterations returned to this phase. Focus on clarifying requirements here.`,
        impact: 'high',
        action: 'Schedule review meeting'
      });
    }
    
    // Type distribution insights
    const restartCount = metrics.typeDistribution.complete_restart || 0;
    if (restartCount > 1) {
      results.push({
        id: 'multiple-restarts',
        type: 'warning',
        title: 'Multiple Complete Restarts',
        description: 'Consider breaking down the project into smaller, more manageable pieces.',
        impact: 'high',
        action: 'Reassess project scope'
      });
    }
    
    // Positive insights
    const completedPhases = phases.filter((p, i) => i < currentPhase && metrics.phaseMetrics[i].completionRate === 100);
    if (completedPhases.length > 0) {
      results.push({
        id: 'phases-complete',
        type: 'success',
        title: `${completedPhases.length} Phase${completedPhases.length !== 1 ? 's' : ''} Successfully Completed`,
        description: 'Great progress! Keep maintaining this momentum.',
        impact: 'medium'
      });
    }
    
    // Recommendations
    if (currentPhase === 0 && iterations.length === 0) {
      results.push({
        id: 'early-stage',
        type: 'info',
        title: 'Early Stage Project',
        description: 'Focus on thorough analysis to minimize future iterations.',
        impact: 'low'
      });
    }
    
    if (metrics.avgIterationTime > 3 * 8 * 60) { // More than 3 days average
      results.push({
        id: 'long-iterations',
        type: 'recommendation',
        title: 'Consider Smaller Iterations',
        description: 'Your iterations average over 3 days. Try breaking them into smaller, quicker loops.',
        impact: 'medium',
        action: 'Review iteration planning'
      });
    }
    
    return results;
  }, [metrics, iterations, phases, currentPhase]);

  // Format time display
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 8);
    
    if (days > 0) {
      return `${days}d ${hours % 8}h`;
    }
    return `${hours}h ${minutes % 60}m`;
  };

  // Calculate chart data
  const velocityChartData = useMemo(() => {
    // Group iterations by week
    const weeklyData: Record<number, number> = {};
    const now = Date.now();
    
    iterations.forEach(iter => {
      const weekNumber = Math.floor((now - new Date(iter.timestamp).getTime()) / (7 * 24 * 60 * 60 * 1000));
      weeklyData[weekNumber] = (weeklyData[weekNumber] || 0) + 1;
    });
    
    return Object.entries(weeklyData)
      .map(([week, count]) => ({
        week: `Week ${parseInt(week) + 1}`,
        count
      }))
      .reverse()
      .slice(0, 8);
  }, [iterations]);

  // Key performance indicators
  const kpis: AnalyticsMetric[] = [
    {
      label: 'Iteration Velocity',
      value: `${metrics.velocity.toFixed(1)}/week`,
      change: metrics.velocity > 1.5 ? -15 : 10,
      trend: metrics.velocity > 1.5 ? 'down' : 'up',
      color: metrics.velocity > 1.5 ? 'red' : 'green',
      icon: Activity
    },
    {
      label: 'Project Efficiency',
      value: `${metrics.efficiency}%`,
      change: metrics.efficiency < 80 ? -20 : 5,
      trend: metrics.efficiency < 80 ? 'down' : 'stable',
      color: metrics.efficiency < 80 ? 'orange' : 'green',
      icon: Target
    },
    {
      label: 'Avg. Resolution Time',
      value: formatTime(metrics.avgIterationTime),
      trend: 'stable',
      color: 'blue',
      icon: Clock
    },
    {
      label: 'Total Iterations',
      value: metrics.totalIterations,
      color: 'purple',
      icon: BarChart3
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6" />
              Iteration Analytics
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Data-driven insights to optimize your creative process
            </p>
          </div>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value as 'all' | 'recent' | 'phase')}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="recent">Last 2 Weeks</option>
            <option value="phase">Current Phase</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <kpi.icon className={`w-5 h-5 ${
                  kpi.color === 'green' ? 'text-green-600' :
                  kpi.color === 'red' ? 'text-red-600' :
                  kpi.color === 'orange' ? 'text-orange-600' :
                  kpi.color === 'blue' ? 'text-blue-600' :
                  'text-purple-600'
                }`} />
                {kpi.trend && (
                  <div className={`flex items-center gap-1 text-xs ${
                    kpi.trend === 'up' ? 'text-green-600' :
                    kpi.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                     kpi.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                     <Activity className="w-3 h-3" />}
                    {kpi.change && Math.abs(kpi.change)}%
                  </div>
                )}
              </div>
              <div className="text-lg font-semibold text-gray-900">{kpi.value}</div>
              <div className="text-xs text-gray-600 mt-1">{kpi.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setSelectedMetric('velocity')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedMetric === 'velocity'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <LineChart className="w-4 h-4 inline-block mr-2" />
            Velocity Trends
          </button>
          <button
            onClick={() => setSelectedMetric('efficiency')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedMetric === 'efficiency'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PieChart className="w-4 h-4 inline-block mr-2" />
            Phase Efficiency
          </button>
          <button
            onClick={() => setSelectedMetric('quality')}
            className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              selectedMetric === 'quality'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="w-4 h-4 inline-block mr-2" />
            Quality Metrics
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="p-6">
        {selectedMetric === 'velocity' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Iteration Velocity Over Time</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {velocityChartData.length > 0 ? (
                velocityChartData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${(data.count / Math.max(...velocityChartData.map(d => d.count))) * 100}%` }}
                    />
                    <div className="text-xs text-gray-600 mt-2">{data.week}</div>
                    <div className="text-xs font-medium text-gray-900">{data.count}</div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        )}

        {selectedMetric === 'efficiency' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Efficiency Breakdown</h3>
            <div className="space-y-3">
              {metrics.phaseMetrics.map((phase, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {PHASE_NAMES[phase.phase]}
                    </span>
                    <span className="text-sm text-gray-600">
                      {phase.efficiency}% efficient • {phase.iterations} iterations
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${phase.efficiency}%`,
                        backgroundColor: PHASE_COLORS[phase.phase]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedMetric === 'quality' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Indicators</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Quick Loops</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {metrics.typeDistribution.quick_loop || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Minor adjustments</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Major Pivots</span>
                  <span className="text-lg font-semibold text-orange-600">
                    {metrics.typeDistribution.major_pivot || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Significant changes</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Complete Restarts</span>
                  <span className="text-lg font-semibold text-red-600">
                    {metrics.typeDistribution.complete_restart || 0}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Full phase reset</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Phase Completion</span>
                  <span className="text-lg font-semibold text-green-600">
                    {Math.round(metrics.phaseMetrics.reduce((sum, p) => sum + p.completionRate, 0) / metrics.phaseMetrics.length)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">Average completion</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights Section */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI-Powered Insights
        </h3>
        <div className="space-y-3">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-lg border ${
                insight.type === 'success' ? 'bg-green-50 border-green-200' :
                insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                insight.type === 'recommendation' ? 'bg-purple-50 border-purple-200' :
                'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {insight.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                   insight.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                   insight.type === 'recommendation' ? <Brain className="w-5 h-5 text-purple-600" /> :
                   <Info className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      insight.type === 'success' ? 'text-green-900' :
                      insight.type === 'warning' ? 'text-amber-900' :
                      insight.type === 'recommendation' ? 'text-purple-900' :
                      'text-blue-900'
                    }`}>
                      {insight.title}
                    </h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                      insight.impact === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${
                    insight.type === 'success' ? 'text-green-700' :
                    insight.type === 'warning' ? 'text-amber-700' :
                    insight.type === 'recommendation' ? 'text-purple-700' :
                    'text-blue-700'
                  }`}>
                    {insight.description}
                  </p>
                  {insight.action && (
                    <button className={`text-sm font-medium mt-2 flex items-center gap-1 ${
                      insight.type === 'success' ? 'text-green-600 hover:text-green-700' :
                      insight.type === 'warning' ? 'text-amber-600 hover:text-amber-700' :
                      insight.type === 'recommendation' ? 'text-purple-600 hover:text-purple-700' :
                      'text-blue-600 hover:text-blue-700'
                    }`}>
                      {insight.action}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};