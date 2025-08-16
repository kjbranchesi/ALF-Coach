/**
 * SystemHealthDashboard - Real-time system health monitoring
 * CRITICAL: Helps developers and users understand system status
 */

import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../services/PerformanceMonitor';
import { connectionStatus } from '../services/ConnectionStatusService';
import { useStateManager } from '../services/StateManager';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Wifi, 
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface HealthMetric {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}

export function SystemHealthDashboard() {
  const [isVisible, setIsVisible] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [performanceStatus, setPerformanceStatus] = useState(performanceMonitor.getPerformanceStatus());
  const appState = useStateManager();

  // Toggle dashboard visibility (for development/admin)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'H') {
        setIsVisible(!isVisible);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      const connStatus = connectionStatus.getStatus();
      const perfStatus = performanceMonitor.getPerformanceStatus();
      
      setPerformanceStatus(perfStatus);
      
      const metrics: HealthMetric[] = [
        {
          label: 'Overall System',
          value: getOverallStatus(connStatus, perfStatus),
          status: getOverallStatusLevel(connStatus, perfStatus),
          icon: getOverallStatusIcon(connStatus, perfStatus)
        },
        {
          label: 'Network',
          value: connStatus.online ? 'Online' : 'Offline',
          status: connStatus.online ? 'good' : 'warning',
          icon: connStatus.online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />
        },
        {
          label: 'Gemini API',
          value: connStatus.geminiApi === 'available' ? 'Available' : 
                 connStatus.geminiApi === 'rate-limited' ? 'Rate Limited' : 'Unavailable',
          status: connStatus.geminiApi === 'available' ? 'good' : 
                  connStatus.geminiApi === 'rate-limited' ? 'warning' : 'critical'
        },
        {
          label: 'Firebase',
          value: connStatus.firebase === 'connected' ? 'Connected' : 
                 connStatus.firebase === 'offline' ? 'Offline' : 'Error',
          status: connStatus.firebase === 'connected' ? 'good' : 
                  connStatus.firebase === 'offline' ? 'warning' : 'critical',
          icon: <Database className="w-4 h-4" />
        },
        {
          label: 'Performance Score',
          value: `${perfStatus.score}/100`,
          status: perfStatus.status,
          icon: <Activity className="w-4 h-4" />
        },
        {
          label: 'Data Source',
          value: appState.connectionStatus.source === 'firebase' ? 'Cloud' : 'Local',
          status: appState.connectionStatus.source === 'firebase' ? 'good' : 'warning'
        },
        {
          label: 'Memory Usage',
          value: `${Math.round(perfStatus.metrics.memoryUsage / 1024 / 1024)}MB`,
          status: perfStatus.metrics.memoryUsage > 50 * 1024 * 1024 ? 'warning' : 'good'
        },
        {
          label: 'Error Count',
          value: perfStatus.metrics.errorCount,
          status: perfStatus.metrics.errorCount > 5 ? 'critical' : 
                  perfStatus.metrics.errorCount > 0 ? 'warning' : 'good'
        }
      ];

      setHealthMetrics(metrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [appState]);

  if (!isVisible) {
    // Small health indicator in corner
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={() => setIsVisible(true)}
        title="System Health (Ctrl+Shift+H)"
      >
        <div className={`w-3 h-3 rounded-full ${getStatusColor(performanceStatus.status)}`} />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          System Health
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      {/* Overall Status */}
      <div className={`p-3 rounded-lg mb-4 ${getStatusBgColor(performanceStatus.status)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Overall Status
          </span>
          <div className="flex items-center space-x-2">
            {getOverallStatusIcon(connectionStatus.getStatus(), performanceStatus)}
            <span className="text-sm">
              {getOverallStatus(connectionStatus.getStatus(), performanceStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="space-y-2">
        {healthMetrics.slice(1).map((metric, index) => (
          <div key={index} className="flex items-center justify-between py-2 px-3 rounded bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center space-x-2">
              {metric.icon}
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {metric.label}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${getStatusTextColor(metric.status)}`}>
                {metric.value}
              </span>
              <div className={`w-2 h-2 rounded-full ${getStatusColor(metric.status)}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Performance Issues */}
      {performanceStatus.issues.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Performance Issues
          </h4>
          <ul className="space-y-1">
            {performanceStatus.issues.slice(0, 3).map((issue, index) => (
              <li key={index} className="text-xs text-amber-700 dark:text-amber-300">
                • {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              const report = performanceMonitor.generateReport();
              console.log('Performance Report:', report);
            }}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded"
          >
            Report
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Press Ctrl+Shift+H to toggle
      </div>
    </div>
  );
}

// Helper functions

function getOverallStatus(connStatus: any, perfStatus: any): string {
  if (!connStatus.online) return 'Offline Mode';
  if (perfStatus.status === 'critical') return 'Performance Issues';
  if (connStatus.geminiApi === 'unavailable') return 'Limited Functionality';
  if (perfStatus.status === 'warning') return 'Minor Issues';
  return 'All Systems Operational';
}

function getOverallStatusLevel(connStatus: any, perfStatus: any): 'good' | 'warning' | 'critical' {
  if (!connStatus.online || perfStatus.status === 'critical') return 'critical';
  if (connStatus.geminiApi === 'unavailable' || perfStatus.status === 'warning') return 'warning';
  return 'good';
}

function getOverallStatusIcon(connStatus: any, perfStatus: any) {
  const level = getOverallStatusLevel(connStatus, perfStatus);
  switch (level) {
    case 'good':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
  }
}

function getStatusColor(status: 'good' | 'warning' | 'critical'): string {
  switch (status) {
    case 'good':
      return 'bg-green-500';
    case 'warning':
      return 'bg-amber-500';
    case 'critical':
      return 'bg-red-500';
  }
}

function getStatusBgColor(status: 'good' | 'warning' | 'critical'): string {
  switch (status) {
    case 'good':
      return 'bg-green-50 dark:bg-green-900/20';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/20';
    case 'critical':
      return 'bg-red-50 dark:bg-red-900/20';
  }
}

function getStatusTextColor(status: 'good' | 'warning' | 'critical'): string {
  switch (status) {
    case 'good':
      return 'text-green-700 dark:text-green-300';
    case 'warning':
      return 'text-amber-700 dark:text-amber-300';
    case 'critical':
      return 'text-red-700 dark:text-red-300';
  }
}

export default SystemHealthDashboard;