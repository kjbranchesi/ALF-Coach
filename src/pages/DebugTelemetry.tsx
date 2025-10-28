/**
 * Telemetry Debug Dashboard
 *
 * Real-time monitoring of cloud-first architecture performance.
 * Shows success rates, latency, cache hits, errors, and recent events.
 *
 * Access: /app/debug/telemetry
 * Only visible when VITE_REVIEW_DEBUG=true
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { telemetry, type TelemetryEvent } from '../services/telemetry';
import { syncStatusManager } from '../services/SyncStatusManager';
import { offlineSnapshotService } from '../services/OfflineSnapshotService';
import { cloudProjectService } from '../services/CloudProjectService';
import { featureFlags } from '../config/featureFlags';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Trash2,
  ArrowLeft,
  Zap,
  WifiOff
} from 'lucide-react';

export default function DebugTelemetry() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(telemetry.getStats());
  const [events, setEvents] = useState<TelemetryEvent[]>(telemetry.getRecentEvents(20));
  const [syncCounts, setSyncCounts] = useState(syncStatusManager.getStatusCounts());
  const [snapshotStats, setSnapshotStats] = useState(offlineSnapshotService.getStats());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [narrativeOnly, setNarrativeOnly] = useState<boolean>(() => typeof localStorage !== 'undefined' && localStorage.getItem('alf_ai_narrative_only') === 'true');
  const [fullRubric, setFullRubric] = useState<boolean>(() => typeof localStorage !== 'undefined' && localStorage.getItem('alf_ai_full_rubric') === 'true');
  const [aiMetrics, setAIMetrics] = useState(telemetry.getAIMetrics());

  // Auto-refresh every 2 seconds
  useEffect(() => {
    if (!autoRefresh) {return;}

    const interval = setInterval(() => {
      setStats(telemetry.getStats());
      setEvents(telemetry.getRecentEvents(20));
      setSyncCounts(syncStatusManager.getStatusCounts());
      setSnapshotStats(offlineSnapshotService.getStats());
      setAIMetrics(telemetry.getAIMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleExport = () => {
    const json = telemetry.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telemetry-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('Clear cloud project cache? This will force reload from cloud on next access.')) {
      cloudProjectService.clearCache();
      import('../utils/toast').then(m => m.showToast('Cache cleared successfully', 'success')).catch(() => {});
    }
  };

  const handleClearTelemetry = () => {
    if (confirm('Clear all telemetry data? This cannot be undone.')) {
      telemetry.clear();
      setStats(telemetry.getStats());
      setEvents(telemetry.getRecentEvents(20));
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99.5) {return 'text-success-600';}
    if (rate >= 95) {return 'text-warning-600';}
    return 'text-error-600';
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 300) {return 'text-success-600';}
    if (ms < 500) {return 'text-warning-600';}
    return 'text-error-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Telemetry Dashboard</h1>
            <p className="text-gray-600 mt-1">Cloud-first architecture monitoring</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin toggles for AI generation modes */}
            <div className="flex items-center gap-4 mr-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={narrativeOnly}
                  onChange={(e) => {
                    setNarrativeOnly(e.target.checked);
                    if (e.target.checked) { localStorage.setItem('alf_ai_narrative_only', 'true'); } else { localStorage.removeItem('alf_ai_narrative_only'); }
                  }}
                />
                <span>Narrative‑only prompts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={fullRubric}
                  onChange={(e) => {
                    setFullRubric(e.target.checked);
                    if (e.target.checked) { localStorage.setItem('alf_ai_full_rubric', 'true'); } else { localStorage.removeItem('alf_ai_full_rubric'); }
                  }}
                />
                <span>Generate full rubric</span>
              </label>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">Auto-refresh</span>
            </label>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={handleClearCache}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cache
            </button>

            <button
              onClick={handleClearTelemetry}
              className="flex items-center gap-2 px-4 py-2 bg-error-100 text-error-700 rounded-lg hover:bg-error-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Data
            </button>
          </div>
        </div>

        {/* Feature Flags */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Flags</h2>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {value ? (
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-700">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Save Success Rate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Save Success</span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-3xl font-bold ${getSuccessRateColor(stats.saveSuccessRate)}`}>
              {stats.saveSuccessRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: {'>'}99.5%
            </div>
          </div>

          {/* Load Success Rate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Load Success</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-3xl font-bold ${getSuccessRateColor(stats.loadSuccessRate)}`}>
              {stats.loadSuccessRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: {'>'}99.5%
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Cache Hits</span>
              <Zap className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-primary-600">
              {stats.cacheHitRate}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: {'>'}60%
            </div>
          </div>

          {/* Avg Load Latency */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Latency</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-3xl font-bold ${getLatencyColor(stats.avgLoadLatency)}`}>
              {stats.avgLoadLatency}ms
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Target: {'<'}500ms
            </div>
          </div>
        </div>

        {/* AI Prompt Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">AI Prompts</span>
            </div>
            <div className="text-3xl font-bold text-primary-600">{aiMetrics.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total prompts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">AI Success</span>
            </div>
            <div className="text-3xl font-bold text-success-600">{aiMetrics.successRate}%</div>
            <div className="text-xs text-gray-500 mt-1">Response parse/use success</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Fallbacks</span>
            </div>
            <div className="text-3xl font-bold text-warning-600">{aiMetrics.fallbacks}</div>
            <div className="text-xs text-gray-500 mt-1">Times we used fallbacks</div>
          </div>
        </div>

        {/* Sync Status & Snapshot Stats */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Sync Status Counts */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Sync Status
            </h2>
            <div className="space-y-3">
              {Object.entries(syncCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 capitalize">{status}</span>
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Snapshots */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <WifiOff className="w-5 h-5" />
              Offline Snapshots
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total Snapshots</span>
                <span className="text-sm font-semibold text-gray-900">
                  {snapshotStats.totalSnapshots}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total Size</span>
                <span className="text-sm font-semibold text-gray-900">
                  {snapshotStats.totalSizeKB}KB
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Avg Compression</span>
                <span className="text-sm font-semibold text-gray-900">
                  {snapshotStats.averageCompressionRatio}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Codes */}
        {Object.keys(stats.errorCodes).length > 0 && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-error-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error Codes
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.errorCodes).map(([code, count]) => (
                <div key={code} className="flex items-center justify-between bg-white rounded px-4 py-2">
                  <span className="text-sm text-gray-700 font-mono">{code}</span>
                  <span className="text-sm font-bold text-error-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Time</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Event</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Project</th>
                  <th className="text-left py-2 px-3 text-gray-600 font-medium">Source</th>
                  <th className="text-right py-2 px-3 text-gray-600 font-medium">Latency</th>
                  <th className="text-center py-2 px-3 text-gray-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-700">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2 px-3 text-gray-900 font-mono text-xs">
                      {event.event}
                    </td>
                    <td className="py-2 px-3 text-gray-700 font-mono text-xs">
                      {event.projectId.slice(0, 8)}...
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {event.source || 'n/a'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-700">
                      {event.latencyMs}ms
                    </td>
                    <td className="py-2 px-3 text-center">
                      {event.success ? (
                        <CheckCircle2 className="w-4 h-4 text-success-600 inline" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-error-600 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
