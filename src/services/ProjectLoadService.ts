/**
 * Project Load Service
 *
 * Centralized service for loading project data with cloud-first architecture support.
 * Handles feature flag checks, cloud/local fallbacks, and telemetry tracking.
 *
 * Load Strategy:
 * 1. Check feature flag (cloudFirstReads)
 * 2. If enabled: Try cloud → Try offline snapshot → Try IDB → Fail
 * 3. If disabled: Use legacy UnifiedStorageManager
 *
 * Usage in ReviewScreen:
 * ```typescript
 * const result = await projectLoadService.loadProject(id);
 * if (result.success) {
 *   setShowcase(result.showcase);
 * }
 * ```
 */

import { featureFlags } from '../config/featureFlags';
import { cloudProjectService } from './CloudProjectService';
import { offlineSnapshotService } from './OfflineSnapshotService';
import { unifiedStorage } from './UnifiedStorageManager';
import { telemetry } from './telemetry';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';

export interface ProjectLoadResult {
  success: boolean;
  showcase?: ProjectShowcaseV2;
  metadata?: any;
  source: 'cloud' | 'offline_snapshot' | 'idb' | 'localstorage' | 'firestore';
  error?: {
    code: string;
    message: string;
  };
  rev?: number;
}

class ProjectLoadService {
  /**
   * Load project with automatic cloud/local fallback
   *
   * @param projectId - Project ID to load
   * @returns Load result with showcase data and source attribution
   */
  async loadProject(projectId: string): Promise<ProjectLoadResult> {
    const startTime = Date.now();

    // Phase A: Cloud-first reads (if flag enabled)
    if (featureFlags.cloudFirstReads) {
      return this.loadCloudFirst(projectId, startTime);
    }

    // Legacy path: UnifiedStorageManager
    return this.loadLegacy(projectId, startTime);
  }

  /**
   * Cloud-first load strategy (Phase A)
   *
   * Priority:
   * 1. Cloud (Firebase Storage + Firestore)
   * 2. Offline snapshot (compressed localStorage)
   * 3. IDB (if enabled)
   * 4. localStorage (raw)
   */
  private async loadCloudFirst(
    projectId: string,
    startTime: number
  ): Promise<ProjectLoadResult> {
    console.log(`[ProjectLoadService] 🌥️ Cloud-first load: ${projectId.slice(0, 8)}`);

    // Step 1: Try cloud
    try {
      const cloudResult = await cloudProjectService.loadShowcase(projectId);

      if (cloudResult.success && cloudResult.showcase) {
        const latencyMs = Date.now() - startTime;

        telemetry.track({
          event: 'load_project',
          success: true,
          latencyMs,
          source: cloudResult.source,
          projectId
        });

        console.log(
          `[ProjectLoadService] ✅ Loaded from ${cloudResult.source} ` +
          `(${latencyMs}ms, rev ${cloudResult.metadata?.rev})`
        );

        return {
          success: true,
          showcase: cloudResult.showcase,
          metadata: cloudResult.metadata,
          source: cloudResult.source,
          rev: cloudResult.metadata?.rev
        };
      }
    } catch (cloudError) {
      console.warn('[ProjectLoadService] Cloud load failed, trying fallbacks:', cloudError);
    }

    // Step 2: Try offline snapshot
    if (featureFlags.enableOfflineSnapshot) {
      try {
        const snapshotResult = await offlineSnapshotService.loadSnapshot(projectId);

        if (snapshotResult.showcase) {
          const latencyMs = Date.now() - startTime;

          telemetry.track({
            event: 'load_project',
            success: true,
            latencyMs,
            source: 'offline_snapshot',
            projectId
          });

          console.log(
            `[ProjectLoadService] ✅ Loaded from offline snapshot ` +
            `(${latencyMs}ms, rev ${snapshotResult.rev})`
          );

          return {
            success: true,
            showcase: snapshotResult.showcase,
            source: 'offline_snapshot',
            rev: snapshotResult.rev
          };
        }
      } catch (snapshotError) {
        console.warn('[ProjectLoadService] Offline snapshot failed:', snapshotError);
      }
    }

    // Step 3: Try IDB (if enabled)
    if (featureFlags.enableIDBFallback) {
      try {
        const idbResult = await unifiedStorage.loadProject(projectId);

        if (idbResult && idbResult.showcase) {
          const latencyMs = Date.now() - startTime;

          telemetry.track({
            event: 'load_project',
            success: true,
            latencyMs,
            source: 'idb',
            projectId
          });

          console.log(`[ProjectLoadService] ✅ Loaded from IDB (${latencyMs}ms)`);

          return {
            success: true,
            showcase: idbResult.showcase,
            source: 'idb'
          };
        }
      } catch (idbError) {
        console.warn('[ProjectLoadService] IDB fallback failed:', idbError);
      }
    }

    // Step 4: Try localStorage (last resort)
    try {
      const rawKey = `alf_project_${projectId}`;
      const rawData = localStorage.getItem(rawKey);

      if (rawData) {
        const parsed = JSON.parse(rawData);

        if (parsed.showcase) {
          const latencyMs = Date.now() - startTime;

          telemetry.track({
            event: 'load_project',
            success: true,
            latencyMs,
            source: 'localstorage',
            projectId
          });

          console.log(`[ProjectLoadService] ✅ Loaded from localStorage (${latencyMs}ms)`);

          return {
            success: true,
            showcase: parsed.showcase,
            source: 'localstorage'
          };
        }
      }
    } catch (localStorageError) {
      console.error('[ProjectLoadService] localStorage read failed:', localStorageError);
    }

    // All fallbacks exhausted
    const latencyMs = Date.now() - startTime;

    telemetry.track({
      event: 'load_project',
      success: false,
      latencyMs,
      errorCode: 'NOT_FOUND',
      errorMessage: 'Project not found in any storage',
      projectId
    });

    return {
      success: false,
      source: 'cloud',
      error: {
        code: 'NOT_FOUND',
        message: 'Project not found. It may not be synced to cloud yet.'
      }
    };
  }

  /**
   * Legacy load strategy (pre-Phase A)
   *
   * Uses UnifiedStorageManager as before
   */
  private async loadLegacy(
    projectId: string,
    startTime: number
  ): Promise<ProjectLoadResult> {
    console.log(`[ProjectLoadService] 📁 Legacy load: ${projectId.slice(0, 8)}`);

    try {
      const result = await unifiedStorage.loadProject(projectId);

      if (result && result.showcase) {
        const latencyMs = Date.now() - startTime;

        telemetry.track({
          event: 'load_project',
          success: true,
          latencyMs,
          source: 'localstorage',
          projectId
        });

        return {
          success: true,
          showcase: result.showcase,
          source: 'localstorage'
        };
      }

      // Try Firestore as fallback
      // (ReviewScreen will handle this via useBlueprintDoc hook)

      return {
        success: false,
        source: 'localstorage',
        error: {
          code: 'NOT_FOUND',
          message: 'Project not found in localStorage'
        }
      };

    } catch (error) {
      const latencyMs = Date.now() - startTime;

      telemetry.track({
        event: 'load_project',
        success: false,
        latencyMs,
        errorCode: (error as Error).name,
        errorMessage: (error as Error).message,
        projectId
      });

      return {
        success: false,
        source: 'localstorage',
        error: {
          code: (error as Error).name || 'UNKNOWN',
          message: (error as Error).message || 'Load failed'
        }
      };
    }
  }

  /**
   * Preload project (for performance optimization)
   *
   * Starts loading in background, result cached by CloudProjectService
   */
  async preloadProject(projectId: string) {
    if (featureFlags.cloudFirstReads) {
      // Fire-and-forget preload
      cloudProjectService.loadShowcase(projectId, { useCache: true }).catch(err => {
        console.warn('[ProjectLoadService] Preload failed:', err);
      });
    }
  }

  /**
   * Invalidate cache for a project
   */
  invalidateCache(projectId: string) {
    if (featureFlags.cloudFirstReads) {
      cloudProjectService.invalidateCache(projectId);
    }
  }
}

/**
 * Singleton instance
 */
export const projectLoadService = new ProjectLoadService();
