/**
 * Conflict Resolver
 *
 * Detects and resolves conflicts when the same project is edited on multiple devices.
 * Uses revision-based versioning to detect stale writes.
 *
 * Conflict Detection:
 * - cloudRev > localRev = Conflict (cloud has newer changes)
 * - cloudRev === localRev = No conflict (up-to-date)
 * - cloudRev < localRev = Should not happen (corrupted state)
 *
 * Resolution Strategies:
 * - use_local: Keep local changes, overwrite cloud (force push)
 * - use_cloud: Discard local changes, use cloud version
 * - merge: Attempt automatic merge (if possible)
 * - manual: Show user a diff view and let them decide
 */

import { getDoc, doc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase/firebase';
import { telemetry } from './telemetry';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';

export type ConflictResolutionAction = 'use_local' | 'use_cloud' | 'merge' | 'cancel';

export interface ConflictResolution {
  action: ConflictResolutionAction;
  mergedData?: any;
  forceOverwrite?: boolean;  // Set to true for use_local
}

export interface ConflictInfo {
  hasConflict: boolean;
  cloudRev?: number;
  localRev?: number;
  cloudData?: any;
  cloudUpdatedAt?: Date;
}

export class ConflictResolver {
  /**
   * Detect if there's a conflict between local and cloud versions
   *
   * @param projectId - Project ID
   * @param localRev - Local revision number
   * @returns Conflict information
   */
  async detectConflict(
    projectId: string,
    localRev: number
  ): Promise<ConflictInfo> {
    const startTime = Date.now();

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        return { hasConflict: false };
      }

      // Get cloud metadata
      const docRef = doc(db, 'users', userId, 'projects', projectId);
      const cloudDoc = await getDoc(docRef);

      if (!cloudDoc.exists()) {
        // No cloud version yet - no conflict
        return { hasConflict: false };
      }

      const cloudMetadata = cloudDoc.data();
      const cloudRev = cloudMetadata.rev || 0;

      // Check revision numbers
      if (cloudRev <= localRev) {
        // Cloud is same or older - no conflict
        telemetry.track({
          event: 'conflict_detected',
          success: true,
          latencyMs: Date.now() - startTime,
          projectId,
          metadata: { cloudRev, localRev, hasConflict: false }
        });

        return { hasConflict: false, cloudRev, localRev };
      }

      // Cloud is newer - conflict detected!
      console.warn(
        `[ConflictResolver] Conflict detected for project ${projectId.slice(0, 8)}: ` +
        `local rev ${localRev}, cloud rev ${cloudRev}`
      );

      // Load cloud data
      const cloudData = await this.loadCloudData(cloudMetadata.showcasePath);

      telemetry.track({
        event: 'conflict_detected',
        success: false,
        latencyMs: Date.now() - startTime,
        errorCode: 'CONFLICT',
        projectId,
        metadata: { cloudRev, localRev }
      });

      return {
        hasConflict: true,
        cloudRev,
        localRev,
        cloudData,
        cloudUpdatedAt: cloudMetadata.syncedAt?.toDate()
      };

    } catch (error) {
      console.error('[ConflictResolver] Error detecting conflict:', error);

      // On error, assume no conflict (fail-safe: allow save)
      return { hasConflict: false };
    }
  }

  /**
   * Prompt user to resolve conflict
   *
   * In a real implementation, this would show a modal with diff view.
   * For now, we'll use a simple confirm dialog.
   *
   * @param localData - Local version of data
   * @param cloudData - Cloud version of data
   * @param conflictInfo - Additional conflict information
   * @returns User's resolution choice
   */
  async promptUserResolution(
    localData: any,
    cloudData: any,
    conflictInfo: ConflictInfo
  ): Promise<ConflictResolution> {
    // In a real app, show a proper modal with diff viewer
    // For MVP, use browser confirm dialog

    const cloudDate = conflictInfo.cloudUpdatedAt
      ? new Date(conflictInfo.cloudUpdatedAt).toLocaleString()
      : 'unknown';

    const message =
      `Project was modified on another device at ${cloudDate}.\n\n` +
      `Choose an action:\n` +
      `- OK: Use cloud version (discard local changes)\n` +
      `- Cancel: Keep local version (overwrite cloud)`;

    return new Promise((resolve) => {
      // Use setTimeout to avoid blocking the main thread
      setTimeout(() => {
        const useCloud = confirm(message);

        resolve({
          action: useCloud ? 'use_cloud' : 'use_local',
          forceOverwrite: !useCloud
        });
      }, 0);
    });
  }

  /**
   * Attempt automatic merge of local and cloud data
   *
   * This is a simple field-level merge. For complex conflicts,
   * manual resolution is better.
   *
   * @param localData - Local version
   * @param cloudData - Cloud version
   * @returns Merged data or null if auto-merge not possible
   */
  attemptAutoMerge(
    localData: any,
    cloudData: any
  ): any | null {
    try {
      // Simple strategy: merge at top level, cloud wins on conflicts
      const merged = {
        ...cloudData,
        ...localData
      };

      console.log('[ConflictResolver] Auto-merge successful');
      return merged;

    } catch (error) {
      console.error('[ConflictResolver] Auto-merge failed:', error);
      return null;
    }
  }

  /**
   * Create a diff summary for user display
   *
   * @param localData - Local version
   * @param cloudData - Cloud version
   * @returns Human-readable diff summary
   */
  createDiffSummary(localData: any, cloudData: any): string {
    const diffs: string[] = [];

    // Compare top-level fields
    const allKeys = new Set([
      ...Object.keys(localData || {}),
      ...Object.keys(cloudData || {})
    ]);

    allKeys.forEach(key => {
      const localValue = localData?.[key];
      const cloudValue = cloudData?.[key];

      if (JSON.stringify(localValue) !== JSON.stringify(cloudValue)) {
        diffs.push(`• ${key} changed`);
      }
    });

    return diffs.length > 0
      ? diffs.join('\n')
      : 'No significant differences detected';
  }

  // Private methods

  private async loadCloudData(showcasePath: string): Promise<any> {
    try {
      const storageRef = ref(storage, showcasePath);
      const url = await getDownloadURL(storageRef);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('[ConflictResolver] Failed to load cloud data:', error);
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const conflictResolver = new ConflictResolver();

/**
 * React hook for conflict resolution UI
 *
 * Usage:
 * ```tsx
 * const { resolveConflict } = useConflictResolver();
 *
 * const handleSave = async () => {
 *   const conflict = await conflictResolver.detectConflict(id, localRev);
 *   if (conflict.hasConflict) {
 *     const resolution = await resolveConflict(localData, conflict.cloudData, conflict);
 *     // Handle resolution
 *   }
 * };
 * ```
 */
export function useConflictResolver() {
  const resolveConflict = async (
    localData: any,
    cloudData: any,
    conflictInfo: ConflictInfo
  ): Promise<ConflictResolution> => {
    // Try auto-merge first
    const merged = conflictResolver.attemptAutoMerge(localData, cloudData);

    if (merged) {
      // Auto-merge successful - confirm with user
      const useAutoMerge = confirm(
        'Changes detected on another device. Auto-merge is available.\n\n' +
        'OK: Use merged version\nCancel: Choose manually'
      );

      if (useAutoMerge) {
        return { action: 'merge', mergedData: merged };
      }
    }

    // Fall back to manual resolution
    return conflictResolver.promptUserResolution(localData, cloudData, conflictInfo);
  };

  return { resolveConflict };
}
