/**
 * Sync Status Manager
 *
 * Tracks sync status for each project and notifies listeners of changes.
 * Provides visibility into cloud sync operations that were previously silent.
 *
 * Status States:
 * - synced: Successfully saved to cloud, up-to-date
 * - syncing: Save operation in progress
 * - error: Save failed, manual retry available
 * - offline: No network connection, queued for sync
 * - conflict: Detected conflicting changes from another device
 */

import { telemetry } from './telemetry';

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline' | 'conflict';

export interface SyncError {
  code: string;
  message: string;
  timestamp: number;
  retryable: boolean;
}

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt?: number;
  lastError?: SyncError;
  rev?: number;  // Current revision number (for conflict detection)
  queuedChanges?: number;  // Number of changes waiting to sync
}

type SyncListener = (projectId: string, state: SyncState) => void;

class SyncStatusManager {
  private statusMap = new Map<string, SyncState>();
  private listeners = new Set<SyncListener>();
  private persistenceKey = 'alf_sync_status';

  constructor() {
    // Load persisted status on init
    this.loadPersistedStatus();

    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Set sync status for a project
   */
  setStatus(projectId: string, status: SyncStatus, metadata?: { rev?: number }) {
    const current = this.getStatus(projectId);
    const newState: SyncState = {
      ...current,
      status,
      lastSyncedAt: status === 'synced' ? Date.now() : current.lastSyncedAt,
      rev: metadata?.rev ?? current.rev
    };

    // Clear error when transitioning to syncing or synced
    if (status === 'syncing' || status === 'synced') {
      delete newState.lastError;
    }

    this.statusMap.set(projectId, newState);
    this.persistStatus();
    this.notifyListeners(projectId);
  }

  /**
   * Set error status for a project
   */
  setError(projectId: string, error: Error, retryable = true) {
    const current = this.getStatus(projectId);
    const syncError: SyncError = {
      code: error.name || 'UNKNOWN_ERROR',
      message: this.sanitizeErrorMessage(error.message),
      timestamp: Date.now(),
      retryable
    };

    const newState: SyncState = {
      ...current,
      status: 'error',
      lastError: syncError
    };

    this.statusMap.set(projectId, newState);
    this.persistStatus();
    this.notifyListeners(projectId);

    // Track in telemetry
    telemetry.track({
      event: 'sync_error',
      success: false,
      latencyMs: 0,
      errorCode: syncError.code,
      errorMessage: syncError.message,
      projectId
    });
  }

  /**
   * Set conflict status
   */
  setConflict(projectId: string, cloudRev: number) {
    const current = this.getStatus(projectId);
    const newState: SyncState = {
      ...current,
      status: 'conflict',
      rev: cloudRev
    };

    this.statusMap.set(projectId, newState);
    this.persistStatus();
    this.notifyListeners(projectId);

    telemetry.track({
      event: 'conflict_detected',
      success: false,
      latencyMs: 0,
      errorCode: 'CONFLICT',
      projectId,
      metadata: { cloudRev, localRev: current.rev }
    });
  }

  /**
   * Increment queued changes counter
   */
  addQueuedChange(projectId: string) {
    const current = this.getStatus(projectId);
    const newState: SyncState = {
      ...current,
      queuedChanges: (current.queuedChanges || 0) + 1
    };

    this.statusMap.set(projectId, newState);
    this.persistStatus();
    this.notifyListeners(projectId);
  }

  /**
   * Clear queued changes (after successful sync)
   */
  clearQueuedChanges(projectId: string) {
    const current = this.getStatus(projectId);
    if (current.queuedChanges) {
      const newState: SyncState = {
        ...current,
        queuedChanges: 0
      };

      this.statusMap.set(projectId, newState);
      this.persistStatus();
      this.notifyListeners(projectId);
    }
  }

  /**
   * Get current sync status for a project
   */
  getStatus(projectId: string): SyncState {
    return this.statusMap.get(projectId) || {
      status: navigator.onLine ? 'synced' : 'offline'
    };
  }

  /**
   * Get all projects with specific status
   */
  getProjectsByStatus(status: SyncStatus): string[] {
    return Array.from(this.statusMap.entries())
      .filter(([, state]) => state.status === status)
      .map(([projectId]) => projectId);
  }

  /**
   * Subscribe to status changes
   */
  subscribe(callback: SyncListener): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Check if any projects have errors
   */
  hasErrors(): boolean {
    return Array.from(this.statusMap.values()).some(state => state.status === 'error');
  }

  /**
   * Get count of projects by status
   */
  getStatusCounts(): Record<SyncStatus, number> {
    const counts: Record<SyncStatus, number> = {
      synced: 0,
      syncing: 0,
      error: 0,
      offline: 0,
      conflict: 0
    };

    this.statusMap.forEach(state => {
      counts[state.status]++;
    });

    return counts;
  }

  /**
   * Clear status for a project (e.g., when deleted)
   */
  clearStatus(projectId: string) {
    this.statusMap.delete(projectId);
    this.persistStatus();
  }

  // Private methods

  private notifyListeners(projectId: string) {
    const state = this.getStatus(projectId);
    this.listeners.forEach(callback => {
      try {
        callback(projectId, state);
      } catch (error) {
        console.error('[SyncStatusManager] Listener error:', error);
      }
    });
  }

  private handleOnline() {
    console.log('[SyncStatusManager] Network online, transitioning offline projects');

    // Transition all offline projects to syncing (queue will process them)
    this.statusMap.forEach((state, projectId) => {
      if (state.status === 'offline') {
        this.setStatus(projectId, 'syncing');
      }
    });
  }

  private handleOffline() {
    console.log('[SyncStatusManager] Network offline, marking active syncs as offline');

    // Mark syncing projects as offline
    this.statusMap.forEach((state, projectId) => {
      if (state.status === 'syncing') {
        this.setStatus(projectId, 'offline');
      }
    });
  }

  private persistStatus() {
    try {
      const serialized = JSON.stringify(
        Array.from(this.statusMap.entries())
      );
      localStorage.setItem(this.persistenceKey, serialized);
    } catch (error) {
      console.warn('[SyncStatusManager] Failed to persist status:', error);
    }
  }

  private loadPersistedStatus() {
    try {
      const serialized = localStorage.getItem(this.persistenceKey);
      if (serialized) {
        const entries: [string, SyncState][] = JSON.parse(serialized);
        this.statusMap = new Map(entries);

        // Clean up stale 'syncing' status on load (tab was closed mid-sync)
        this.statusMap.forEach((state, projectId) => {
          if (state.status === 'syncing') {
            this.statusMap.set(projectId, {
              ...state,
              status: navigator.onLine ? 'synced' : 'offline'
            });
          }
        });
      }
    } catch (error) {
      console.warn('[SyncStatusManager] Failed to load persisted status:', error);
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive info from error messages
    return message
      .replace(/uid=[a-zA-Z0-9]+/g, 'uid=***')
      .replace(/token=[a-zA-Z0-9]+/g, 'token=***')
      .replace(/key=[a-zA-Z0-9]+/g, 'key=***');
  }
}

// Singleton instance
export const syncStatusManager = new SyncStatusManager();
