/**
 * IterationHistory.tsx
 * 
 * Comprehensive iteration history visualization and management
 * Part of Sprint 3: Full Iteration Support System
 * 
 * FEATURES:
 * - Timeline view of all iterations
 * - Filtering and sorting capabilities
 * - Detailed iteration insights
 * - Export functionality
 * - Pattern recognition
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Calendar,
  BarChart3,
  FileText,
  Search,
  X,
  ArrowRight,
  Info
} from 'lucide-react';
import { type IterationEvent, type PhaseType, type IterationType } from '../types';

interface IterationHistoryProps {
  iterations: IterationEvent[];
  currentPhase: PhaseType;
  projectDuration: number;
  onIterationClick?: (iteration: IterationEvent) => void;
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
  className?: string;
}

interface IterationStats {
  totalIterations: number;
  averageDuration: number;
  mostCommonType: IterationType | null;
  mostIteratedPhase: PhaseType | null;
  timeImpact: number;
  patterns: IterationPattern[];
}

interface IterationPattern {
  type: 'frequent_return' | 'escalating' | 'early_stage' | 'late_stage';
  description: string;
  severity: 'info' | 'warning' | 'success';
  count: number;
}

const PHASE_NAMES: Record<PhaseType, string> = {
  ANALYZE: 'Analyze',
  BRAINSTORM: 'Brainstorm',
  PROTOTYPE: 'Prototype',
  EVALUATE: 'Evaluate'
};

const ITERATION_TYPE_CONFIG: Record<IterationType, { label: string; color: string; icon: React.ElementType }> = {
  quick_loop: { label: 'Quick Loop', color: 'blue', icon: RotateCcw },
  major_pivot: { label: 'Major Pivot', color: 'orange', icon: TrendingUp },
  complete_restart: { label: 'Complete Restart', color: 'red', icon: AlertCircle }
};

export const IterationHistory: React.FC<IterationHistoryProps> = ({
  iterations,
  currentPhase,
  projectDuration,
  onIterationClick,
  onExport,
  className = ''
}) => {
  const [expandedIteration, setExpandedIteration] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<IterationType | 'all'>('all');
  const [filterPhase, setFilterPhase] = useState<PhaseType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'type'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | 'week' | 'month'>('all');

  // Calculate iteration statistics
  const stats = useMemo<IterationStats>(() => {
    if (iterations.length === 0) {
      return {
        totalIterations: 0,
        averageDuration: 0,
        mostCommonType: null,
        mostIteratedPhase: null,
        timeImpact: 0,
        patterns: []
      };
    }

    // Count iteration types
    const typeCounts: Record<IterationType, number> = {
      quick_loop: 0,
      major_pivot: 0,
      complete_restart: 0
    };

    // Count phases
    const phaseCounts: Record<PhaseType, number> = {
      ANALYZE: 0,
      BRAINSTORM: 0,
      PROTOTYPE: 0,
      EVALUATE: 0
    };

    let totalDuration = 0;
    const patterns: IterationPattern[] = [];

    iterations.forEach(iter => {
      if (iter.metadata?.iterationType) {
        typeCounts[iter.metadata.iterationType]++;
      }
      phaseCounts[iter.toPhase]++;
      totalDuration += iter.duration;
    });

    // Find most common type
    const mostCommonType = Object.entries(typeCounts).reduce((max, [type, count]) => 
      count > (typeCounts[max as IterationType] || 0) ? type : max
    , 'quick_loop') as IterationType;

    // Find most iterated phase
    const mostIteratedPhase = Object.entries(phaseCounts).reduce((max, [phase, count]) =>
      count > (phaseCounts[max as PhaseType] || 0) ? phase : max
    , 'ANALYZE') as PhaseType;

    // Detect patterns
    if (phaseCounts.ANALYZE > iterations.length * 0.4) {
      patterns.push({
        type: 'frequent_return',
        description: 'Frequent returns to Analyze phase suggest unclear requirements',
        severity: 'warning',
        count: phaseCounts.ANALYZE
      });
    }

    const recentIterations = iterations.slice(-3);
    if (recentIterations.every(i => i.metadata?.iterationType === 'major_pivot' || i.metadata?.iterationType === 'complete_restart')) {
      patterns.push({
        type: 'escalating',
        description: 'Recent iterations show escalating severity',
        severity: 'warning',
        count: 3
      });
    }

    const earlyIterations = iterations.filter((_, i) => i < iterations.length / 2);
    if (earlyIterations.length > iterations.length * 0.7) {
      patterns.push({
        type: 'early_stage',
        description: 'Most iterations occurred early, indicating good problem resolution',
        severity: 'success',
        count: earlyIterations.length
      });
    }

    return {
      totalIterations: iterations.length,
      averageDuration: totalDuration / iterations.length,
      mostCommonType,
      mostIteratedPhase,
      timeImpact: totalDuration / (projectDuration * 40 * 60) * 100, // Percentage of project time
      patterns
    };
  }, [iterations, projectDuration]);

  // Filter and sort iterations
  const filteredIterations = useMemo(() => {
    let filtered = [...iterations];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(i => i.metadata?.iterationType === filterType);
    }

    // Apply phase filter
    if (filterPhase !== 'all') {
      filtered = filtered.filter(i => i.toPhase === filterPhase);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(i => 
        i.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.metadata?.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply time range filter
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const timeLimit = selectedTimeRange === 'week' ? 7 : 30;
      const cutoff = new Date(now.getTime() - timeLimit * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(i => new Date(i.timestamp) >= cutoff);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return b.duration - a.duration;
        case 'type':
          return (a.metadata?.iterationType || '').localeCompare(b.metadata?.iterationType || '');
        case 'date':
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

    return filtered;
  }, [iterations, filterType, filterPhase, searchQuery, selectedTimeRange, sortBy]);

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 8); // 8-hour work days
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Handle export
  const handleExport = useCallback((format: 'json' | 'csv' | 'pdf') => {
    if (onExport) {
      onExport(format);
    } else {
      // Default export implementation
      const data = filteredIterations.map(iter => ({
        date: formatDate(iter.timestamp),
        from: PHASE_NAMES[iter.fromPhase],
        to: PHASE_NAMES[iter.toPhase],
        type: iter.metadata?.iterationType || 'unknown',
        reason: iter.reason,
        duration: formatDuration(iter.duration),
        strategies: iter.metadata?.strategies?.join(', ') || '',
        notes: iter.metadata?.notes || ''
      }));

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iteration-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        // Clean up to prevent memory leak
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const headers = Object.keys(data[0] || {}).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iteration-history-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        // Clean up to prevent memory leak
        URL.revokeObjectURL(url);
      }
    }
  }, [filteredIterations, onExport]);

  if (iterations.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Iterations Yet</h3>
        <p className="text-gray-600">
          Your journey is progressing smoothly without any iterations so far.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-6 h-6" />
              Iteration History
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {stats.totalIterations} iteration{stats.totalIterations !== 1 ? 's' : ''} • 
              {' '}{Math.round(stats.timeImpact)}% of project time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
            >
              <BarChart3 className="w-4 h-4" />
              {showStats ? 'Hide' : 'Show'} Stats
            </button>
            <div className="relative group">
              <button className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-50"
                >
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search iterations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-primary-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as IterationType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="quick_loop">Quick Loop</option>
            <option value="major_pivot">Major Pivot</option>
            <option value="complete_restart">Complete Restart</option>
          </select>

          <select
            value={filterPhase}
            onChange={(e) => setFilterPhase(e.target.value as PhaseType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Phases</option>
            <option value="ANALYZE">Analyze</option>
            <option value="BRAINSTORM">Brainstorm</option>
            <option value="PROTOTYPE">Prototype</option>
            <option value="EVALUATE">Evaluate</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'duration' | 'type')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="duration">Sort by Duration</option>
            <option value="type">Sort by Type</option>
          </select>

          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as 'all' | 'week' | 'month')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
        </div>
      </div>

      {/* Statistics Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Most Common Type</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.mostCommonType ? ITERATION_TYPE_CONFIG[stats.mostCommonType].label : 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Most Returned Phase</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stats.mostIteratedPhase ? PHASE_NAMES[stats.mostIteratedPhase] : 'N/A'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Avg. Duration</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDuration(Math.round(stats.averageDuration))}
                  </div>
                </div>
              </div>

              {/* Patterns */}
              {stats.patterns.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Detected Patterns</h4>
                  <div className="space-y-2">
                    {stats.patterns.map((pattern, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          pattern.severity === 'warning' ? 'bg-amber-50' :
                          pattern.severity === 'success' ? 'bg-green-50' :
                          'bg-primary-50'
                        }`}
                      >
                        <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          pattern.severity === 'warning' ? 'text-amber-600' :
                          pattern.severity === 'success' ? 'text-green-600' :
                          'text-primary-600'
                        }`} />
                        <div className="flex-1">
                          <p className={`text-sm ${
                            pattern.severity === 'warning' ? 'text-amber-900' :
                            pattern.severity === 'success' ? 'text-green-900' :
                            'text-primary-900'
                          }`}>
                            {pattern.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iterations List */}
      <div className="p-6 space-y-3 max-h-[600px] overflow-y-auto">
        {filteredIterations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No iterations match your filters
          </div>
        ) : (
          filteredIterations.map((iteration) => {
            const iterationType = iteration.metadata?.iterationType || 'quick_loop';
            const config = ITERATION_TYPE_CONFIG[iterationType];
            const Icon = config.icon;
            const isExpanded = expandedIteration === iteration.id;

            return (
              <motion.div
                key={iteration.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setExpandedIteration(isExpanded ? null : iteration.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`iteration-details-${iteration.id}`}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} iteration details`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        iterationType === 'quick_loop' ? 'bg-primary-100' :
                        iterationType === 'major_pivot' ? 'bg-orange-100' :
                        'bg-red-100'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          iterationType === 'quick_loop' ? 'text-primary-600' :
                          iterationType === 'major_pivot' ? 'text-orange-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {PHASE_NAMES[iteration.fromPhase]}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {PHASE_NAMES[iteration.toPhase]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {iteration.reason}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(iteration.timestamp)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(iteration.duration)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            iterationType === 'quick_loop' ? 'bg-primary-100 text-primary-700' :
                            iterationType === 'major_pivot' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {config.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-3">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      id={`iteration-details-${iteration.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 p-4 bg-gray-50"
                    >
                      {iteration.metadata?.strategies && iteration.metadata.strategies.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Strategies Applied</h5>
                          <div className="flex flex-wrap gap-2">
                            {iteration.metadata.strategies.map((strategy, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-full"
                              >
                                {strategy}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {iteration.metadata?.notes && (
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Additional Notes</h5>
                          <p className="text-sm text-gray-600">{iteration.metadata.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Week {iteration.metadata?.weekNumber || 'N/A'} • 
                          Estimated {iteration.metadata?.estimatedDays || 0} days
                        </div>
                        {onIterationClick && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onIterationClick(iteration);
                            }}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};