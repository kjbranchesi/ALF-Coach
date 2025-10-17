/**
 * Cloud Storage Adapter
 *
 * Adapter that wraps CloudProjectService to integrate with UnifiedStorageManager.
 * Provides backward compatibility while enabling cloud-first dual-write pattern.
 *
 * Architecture:
 * - Write Path: Cloud FIRST (atomic) → localStorage SECOND (cache)
 * - Read Path: Cloud with localStorage fallback
 * - Offline: Queue operations via OfflineQueue
 * - Conflicts: Detect and resolve via ConflictResolver
 *
 * Integration Strategy:
 * 1. Phase B: Enable dual-write behind feature flag
 * 2. Phase C: Make cloud-first default
 * 3. Phase D: Deprecate localStorage as primary storage
 *
 * Usage in UnifiedStorageManager:
 * ```typescript
 * // Replace direct cloud writes with adapter
 * if (featureFlags.cloudFirstWrites) {
 *   await cloudStorageAdapter.saveProject(projectId, projectData);
 * } else {
 *   // Legacy localStorage-first path
 * }
 * ```
 */

import { featureFlags } from '../config/featureFlags';
import { cloudProjectService } from './CloudProjectService';
import { offlineQueue } from './OfflineQueue';
import { offlineSnapshotService } from './OfflineSnapshotService';
import { syncStatusManager } from './SyncStatusManager';
import { conflictResolver } from './ConflictResolver';
import { telemetry } from './telemetry';
import { sanitizeShowcase } from '../utils/sanitize';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';

/**
 * Project data structure (matches UnifiedStorageManager format)
 */
export interface ProjectData {
  projectId: string;
  showcase: ProjectShowcaseV2;
  wizardData?: any;
  status?: string;
  stage?: string;
  rev?: number;
  updatedAt?: number;
}

/**
 * Save options
 */
export interface SaveOptions {
  forceOverwrite?: boolean; // Skip conflict detection
  skipOfflineSnapshot?: boolean; // Skip offline snapshot creation
  skipLocalCache?: boolean; // Skip localStorage cache update
}

/**
 * Load options
 */
export interface LoadOptions {
  preferCache?: boolean; // Prefer localStorage cache over cloud
  skipCloudCheck?: boolean; // Skip cloud check entirely (offline mode)
}

/**
 * Cloud Storage Adapter
 *
 * Bridges CloudProjectService with UnifiedStorageManager interface
 */
class CloudStorageAdapter {
  /**
   * Save project with cloud-first dual-write
   *
   * Write Strategy:
   * 1. Check if online
   * 2. If offline → queue operation, update localStorage, return success
   * 3. If online → detect conflicts
   * 4. Save to cloud (atomic two-phase commit)
   * 5. Update localStorage cache
   * 6. Create offline snapshot
   * 7. Update sync status
   *
   * @param projectData - Project data to save
   * @param options - Save options
   * @returns Success/failure with revision number
   */
  async saveProject(
    projectData: ProjectData,
    options: SaveOptions = {}
  ): Promise<{ success: boolean; rev?: number; error?: any }> {
    const startTime = Date.now();
    const { projectId, showcase } = projectData;

    try {
      console.log(
        `[CloudStorageAdapter] Saving project ${projectId.slice(0, 8)} ` +
        `(cloud-first writes: ${featureFlags.cloudFirstWrites})`
      );

      // Sanitize showcase before saving
      const sanitizedShowcase = sanitizeShowcase(showcase);

      // Check if online
      if (!navigator.onLine) {
        console.log('[CloudStorageAdapter] Offline - queueing operation');

        // Queue for later sync
        await offlineQueue.enqueue(projectId, 'save', {
          showcase: sanitizedShowcase,
          localRev: projectData.rev
        });

        // Still update localStorage so user can continue working
        this.saveToLocalStorage(projectId, {
          ...projectData,
          showcase: sanitizedShowcase
        });

        syncStatusManager.setStatus(projectId, 'offline', {
          queuedChanges: 1
        });

        return { success: true, rev: projectData.rev };
      }

      // Check feature flag
      if (!featureFlags.cloudFirstWrites) {
        console.log('[CloudStorageAdapter] Cloud-first writes disabled, using legacy path');
        // Fall back to localStorage-only save
        return this.saveToLocalStorageOnly(projectId, {
          ...projectData,
          showcase: sanitizedShowcase
        });
      }

      // Update sync status
      syncStatusManager.setStatus(projectId, 'syncing');

      // Conflict detection (unless force overwrite)
      if (!options.forceOverwrite && projectData.rev) {
        const conflict = await conflictResolver.detectConflict(projectId, projectData.rev);

        if (conflict.hasConflict) {
          console.warn(
            `[CloudStorageAdapter] Conflict detected: ` +
            `local rev ${conflict.localRev} vs cloud rev ${conflict.cloudRev}`
          );

          // Prompt user for resolution
          const resolution = await conflictResolver.promptUserResolution(
            sanitizedShowcase,
            conflict.cloudData
          );

          if (resolution.action === 'use_cloud') {
            // User chose cloud version - load and cache it
            syncStatusManager.setStatus(projectId, 'synced', {
              rev: conflict.cloudRev
            });

            // Update localStorage with cloud version
            this.saveToLocalStorage(projectId, {
              projectId,
              showcase: conflict.cloudData,
              rev: conflict.cloudRev
            });

            return { success: true, rev: conflict.cloudRev };
          }

          // User chose local version - proceed with save (force overwrite)
          console.log('[CloudStorageAdapter] User chose local version, forcing save');
        }
      }

      // PHASE 1: Save to cloud (atomic two-phase commit)
      const cloudResult = await cloudProjectService.saveShowcase(
        projectId,
        sanitizedShowcase,
        { forceOverwrite: options.forceOverwrite || false }
      );

      if (!cloudResult.success) {
        // Cloud save failed
        console.error('[CloudStorageAdapter] Cloud save failed:', cloudResult.error);

        // If it's a conflict, don't queue - let user resolve
        if (cloudResult.error?.code === 'CONFLICT') {
          syncStatusManager.setStatus(projectId, 'conflict', {
            error: {
              code: 'CONFLICT',
              message: 'Project was modified on another device',
              timestamp: Date.now()
            }
          });

          return { success: false, error: cloudResult.error };
        }

        // Other errors - queue for retry
        await offlineQueue.enqueue(projectId, 'save', {
          showcase: sanitizedShowcase,
          localRev: projectData.rev
        });

        syncStatusManager.setStatus(projectId, 'error', {
          error: {
            code: cloudResult.error?.code || 'UNKNOWN',
            message: cloudResult.error?.message || 'Save failed',
            timestamp: Date.now()
          }
        });

        // Still save to localStorage so user doesn't lose work
        this.saveToLocalStorage(projectId, {
          ...projectData,
          showcase: sanitizedShowcase
        });

        return { success: false, error: cloudResult.error };
      }

      // PHASE 2: Update localStorage cache
      if (!options.skipLocalCache) {
        this.saveToLocalStorage(projectId, {
          ...projectData,
          showcase: sanitizedShowcase,
          rev: cloudResult.rev,
          updatedAt: Date.now()
        });
      }

      // PHASE 3: Create offline snapshot (for offline reads)
      if (!options.skipOfflineSnapshot && featureFlags.enableOfflineSnapshot) {
        offlineSnapshotService
          .saveSnapshot(projectId, sanitizedShowcase, cloudResult.rev!)
          .catch(err => {
            console.warn('[CloudStorageAdapter] Offline snapshot failed:', err);
            // Non-fatal - continue
          });
      }

      // PHASE 4: Update sync status
      syncStatusManager.setStatus(projectId, 'synced', {
        rev: cloudResult.rev
      });

      // Track telemetry
      telemetry.track({
        event: 'save_project',
        success: true,
        latencyMs: Date.now() - startTime,
        source: 'cloud',
        projectId
      });

      console.log(
        `[CloudStorageAdapter] ✅ Saved successfully ` +
        `(rev ${cloudResult.rev}, ${Date.now() - startTime}ms)`
      );

      return { success: true, rev: cloudResult.rev };
    } catch (error) {
      console.error('[CloudStorageAdapter] Save failed:', error);

      // Queue for retry
      try {
        await offlineQueue.enqueue(projectId, 'save', {
          showcase: sanitizeShowcase(showcase),
          localRev: projectData.rev
        });
      } catch (queueError) {
        console.error('[CloudStorageAdapter] Failed to queue operation:', queueError);
      }

      telemetry.track({
        event: 'save_project',
        success: false,
        latencyMs: Date.now() - startTime,
        errorCode: (error as Error).name,
        errorMessage: (error as Error).message,
        projectId
      });

      return {
        success: false,
        error: {
          code: (error as Error).name || 'UNKNOWN',
          message: (error as Error).message || 'Save failed'
        }
      };
    }
  }

  /**
   * Load project with cloud-first reads
   *
   * Read Strategy:
   * 1. Check cache preference
   * 2. Try localStorage cache (if preferCache=true)
   * 3. Try cloud load
   * 4. Try offline snapshot
   * 5. Try raw localStorage
   *
   * @param projectId - Project ID to load
   * @param options - Load options
   * @returns Project data or null
   */
  async loadProject(
    projectId: string,
    options: LoadOptions = {}
  ): Promise<ProjectData | null> {
    const startTime = Date.now();

    try {
      console.log(`[CloudStorageAdapter] Loading project ${projectId.slice(0, 8)}`);

      // Check if cloud-first reads enabled
      if (!featureFlags.cloudFirstReads && !options.skipCloudCheck) {
        console.log('[CloudStorageAdapter] Cloud-first reads disabled, using localStorage');
        return this.loadFromLocalStorage(projectId);
      }

      // If prefer cache, try localStorage first
      if (options.preferCache) {
        const cached = this.loadFromLocalStorage(projectId);
        if (cached) {
          console.log('[CloudStorageAdapter] Loaded from cache');
          telemetry.track({
            event: 'load_project',
            success: true,
            latencyMs: Date.now() - startTime,
            source: 'cache',
            projectId
          });
          return cached;
        }
      }

      // Try cloud load (unless skipCloudCheck)
      if (!options.skipCloudCheck && navigator.onLine) {
        const cloudResult = await cloudProjectService.loadShowcase(projectId);

        if (cloudResult.success && cloudResult.showcase) {
          const projectData: ProjectData = {
            projectId,
            showcase: cloudResult.showcase,
            rev: cloudResult.metadata?.rev,
            updatedAt: cloudResult.metadata?.syncedAt
          };

          // Cache in localStorage
          this.saveToLocalStorage(projectId, projectData);

          telemetry.track({
            event: 'load_project',
            success: true,
            latencyMs: Date.now() - startTime,
            source: cloudResult.source,
            projectId
          });

          return projectData;
        }
      }

      // Try offline snapshot
      if (featureFlags.enableOfflineSnapshot) {
        const snapshotResult = await offlineSnapshotService.loadSnapshot(projectId);

        if (snapshotResult.showcase) {
          console.log('[CloudStorageAdapter] Loaded from offline snapshot');

          const projectData: ProjectData = {
            projectId,
            showcase: snapshotResult.showcase,
            rev: snapshotResult.rev
          };

          telemetry.track({
            event: 'load_project',
            success: true,
            latencyMs: Date.now() - startTime,
            source: 'offline_snapshot',
            projectId
          });

          return projectData;
        }
      }

      // Try raw localStorage as last resort
      const localData = this.loadFromLocalStorage(projectId);
      if (localData) {
        telemetry.track({
          event: 'load_project',
          success: true,
          latencyMs: Date.now() - startTime,
          source: 'localstorage',
          projectId
        });
        return localData;
      }

      // Not found anywhere
      console.warn(`[CloudStorageAdapter] Project ${projectId.slice(0, 8)} not found`);

      telemetry.track({
        event: 'load_project',
        success: false,
        latencyMs: Date.now() - startTime,
        errorCode: 'NOT_FOUND',
        errorMessage: 'Project not found',
        projectId
      });

      return null;
    } catch (error) {
      console.error('[CloudStorageAdapter] Load failed:', error);

      telemetry.track({
        event: 'load_project',
        success: false,
        latencyMs: Date.now() - startTime,
        errorCode: (error as Error).name,
        errorMessage: (error as Error).message,
        projectId
      });

      return null;
    }
  }

  /**
   * Delete project (cloud + localStorage)
   */
  async deleteProject(projectId: string): Promise<{ success: boolean }> {
    try {
      console.log(`[CloudStorageAdapter] Deleting project ${projectId.slice(0, 8)}`);

      // Delete from cloud (if enabled and online)
      if (featureFlags.cloudFirstWrites && navigator.onLine) {
        // TODO: Implement deleteShowcase in CloudProjectService
        console.warn('[CloudStorageAdapter] Cloud deletion not yet implemented');
      }

      // Delete from localStorage
      const rawKey = `alf_project_${projectId}`;
      localStorage.removeItem(rawKey);

      // Delete offline snapshot
      offlineSnapshotService.removeSnapshot(projectId);

      // Clear sync status
      syncStatusManager.clearStatus(projectId);

      console.log('[CloudStorageAdapter] Project deleted successfully');

      return { success: true };
    } catch (error) {
      console.error('[CloudStorageAdapter] Delete failed:', error);
      return { success: false };
    }
  }

  /**
   * Check if project exists
   */
  async projectExists(projectId: string): Promise<boolean> {
    // Check localStorage first (fast)
    const localData = this.loadFromLocalStorage(projectId);
    if (localData) return true;

    // Check cloud if online
    if (navigator.onLine && featureFlags.cloudFirstReads) {
      try {
        const cloudResult = await cloudProjectService.loadShowcase(projectId);
        return cloudResult.success && !!cloudResult.showcase;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Save to localStorage (cache)
   */
  private saveToLocalStorage(projectId: string, data: ProjectData): void {
    try {
      const rawKey = `alf_project_${projectId}`;
      localStorage.setItem(rawKey, JSON.stringify(data));
    } catch (error) {
      console.error('[CloudStorageAdapter] localStorage save failed:', error);
      // Non-fatal - cloud save succeeded
    }
  }

  /**
   * Load from localStorage (cache)
   */
  private loadFromLocalStorage(projectId: string): ProjectData | null {
    try {
      const rawKey = `alf_project_${projectId}`;
      const rawData = localStorage.getItem(rawKey);

      if (!rawData) return null;

      const parsed = JSON.parse(rawData);

      // Handle legacy format (just showcase)
      if (parsed.showcase) {
        return {
          projectId,
          showcase: parsed.showcase,
          wizardData: parsed.wizardData,
          status: parsed.status,
          stage: parsed.stage,
          rev: parsed.rev,
          updatedAt: parsed.updatedAt
        };
      }

      return null;
    } catch (error) {
      console.error('[CloudStorageAdapter] localStorage read failed:', error);
      return null;
    }
  }

  /**
   * Save to localStorage only (legacy path)
   */
  private saveToLocalStorageOnly(
    projectId: string,
    data: ProjectData
  ): { success: boolean; rev?: number } {
    try {
      this.saveToLocalStorage(projectId, data);

      telemetry.track({
        event: 'save_project',
        success: true,
        latencyMs: 0,
        source: 'localstorage',
        projectId
      });

      return { success: true, rev: data.rev };
    } catch (error) {
      console.error('[CloudStorageAdapter] localStorage-only save failed:', error);

      telemetry.track({
        event: 'save_project',
        success: false,
        latencyMs: 0,
        errorCode: (error as Error).name,
        errorMessage: (error as Error).message,
        projectId
      });

      return { success: false };
    }
  }
}

/**
 * Singleton instance
 */
export const cloudStorageAdapter = new CloudStorageAdapter();
