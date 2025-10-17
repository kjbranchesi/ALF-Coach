/**
 * Sync Status Indicator Component
 *
 * Displays real-time sync status for a project with visual feedback.
 * Shows synced/syncing/error/offline/conflict states.
 *
 * Usage:
 * ```tsx
 * <SyncStatusIndicator projectId="abc123" />
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  RefreshCw,
  AlertCircle,
  WifiOff,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { syncStatusManager, type SyncState } from '../services/SyncStatusManager';

interface SyncStatusIndicatorProps {
  projectId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRetry?: () => void;
}

export function SyncStatusIndicator({
  projectId,
  showLabel = true,
  size = 'md',
  onRetry
}: SyncStatusIndicatorProps) {
  const [syncState, setSyncState] = useState<SyncState>(
    syncStatusManager.getStatus(projectId)
  );

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = syncStatusManager.subscribe((id, state) => {
      if (id === projectId) {
        setSyncState(state);
      }
    });

    return unsubscribe;
  }, [projectId]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const statusConfig = {
    synced: {
      icon: CheckCircle,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      label: 'Synced',
      animate: false
    },
    syncing: {
      icon: RefreshCw,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      label: 'Syncing...',
      animate: true
    },
    error: {
      icon: AlertCircle,
      color: 'text-error-600',
      bgColor: 'bg-error-50',
      label: 'Sync Failed',
      animate: false
    },
    offline: {
      icon: WifiOff,
      color: 'text-gray-400',
      bgColor: 'bg-gray-50',
      label: 'Offline',
      animate: false
    },
    conflict: {
      icon: AlertTriangle,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
      label: 'Conflict',
      animate: false
    }
  };

  const config = statusConfig[syncState.status];
  const Icon = config.icon;

  const formatRelativeTime = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) {return 'just now';}
    if (seconds < 3600) {return `${Math.floor(seconds / 60)}m ago`;}
    if (seconds < 86400) {return `${Math.floor(seconds / 3600)}h ago`;}
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      {/* Status Icon */}
      <div className={`flex items-center justify-center p-1.5 rounded-lg ${config.bgColor}`}>
        <Icon
          className={`${iconSizes[size]} ${config.color} ${
            config.animate ? 'animate-spin' : ''
          }`}
        />
      </div>

      {/* Status Label & Details */}
      {showLabel && (
        <div className="flex flex-col">
          <span className={`font-medium ${config.color}`}>
            {config.label}
          </span>

          {/* Additional Info */}
          {syncState.lastSyncedAt && syncState.status === 'synced' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(syncState.lastSyncedAt)}
            </span>
          )}

          {syncState.queuedChanges && syncState.queuedChanges > 0 && (
            <span className="text-xs text-gray-500">
              {syncState.queuedChanges} change{syncState.queuedChanges > 1 ? 's' : ''} queued
            </span>
          )}
        </div>
      )}

      {/* Error Actions */}
      {syncState.status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-primary-600 hover:text-primary-700 hover:underline font-medium"
        >
          Retry
        </button>
      )}

      {/* Error Tooltip */}
      {syncState.status === 'error' && syncState.lastError && (
        <div className="relative group">
          <AlertCircle className="w-4 h-4 text-error-500 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
            <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs shadow-lg">
              <div className="font-semibold mb-1">Error Details:</div>
              <div className="text-gray-300">{syncState.lastError.message}</div>
              {syncState.lastError.retryable && (
                <div className="text-gray-400 mt-1 text-[10px]">
                  This error is retryable
                </div>
              )}
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                <div className="border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact sync status badge (icon only)
 */
export function SyncStatusBadge({ projectId }: { projectId: string }) {
  return <SyncStatusIndicator projectId={projectId} showLabel={false} size="sm" />;
}

/**
 * Global sync status summary (for dashboard)
 */
export function GlobalSyncStatus() {
  const [counts, setCounts] = useState(syncStatusManager.getStatusCounts());

  useEffect(() => {
    const unsubscribe = syncStatusManager.subscribe(() => {
      setCounts(syncStatusManager.getStatusCounts());
    });

    return unsubscribe;
  }, []);

  const hasIssues = counts.error > 0 || counts.conflict > 0 || counts.offline > 0;

  if (!hasIssues && counts.syncing === 0) {
    // All synced - show minimal indicator
    return (
      <div className="flex items-center gap-2 text-sm text-success-600">
        <CheckCircle className="w-4 h-4" />
        <span>All projects synced</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {counts.syncing > 0 && (
        <div className="flex items-center gap-1 text-primary-600">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>{counts.syncing} syncing</span>
        </div>
      )}

      {counts.error > 0 && (
        <div className="flex items-center gap-1 text-error-600">
          <AlertCircle className="w-4 h-4" />
          <span>{counts.error} failed</span>
        </div>
      )}

      {counts.conflict > 0 && (
        <div className="flex items-center gap-1 text-warning-600">
          <AlertTriangle className="w-4 h-4" />
          <span>{counts.conflict} conflicts</span>
        </div>
      )}

      {counts.offline > 0 && (
        <div className="flex items-center gap-1 text-gray-500">
          <WifiOff className="w-4 h-4" />
          <span>{counts.offline} offline</span>
        </div>
      )}
    </div>
  );
}
