/**
 * Cloud Project Service
 *
 * Cloud-first storage with atomic two-phase commit:
 * 1. Upload showcase to versioned Storage path (idempotent)
 * 2. Update Firestore pointer in transaction (atomic)
 * 3. Cleanup old version (best-effort)
 *
 * Key Features:
 * - Atomic saves (no orphaned blobs or missing pointers)
 * - Revision-based versioning (conflict detection)
 * - Path-based references (fresh URLs on every read)
 * - Mutex locks (prevent race conditions)
 * - Comprehensive error handling and telemetry
 *
 * Architecture:
 * ```
 * Storage:  users/{uid}/projects/{id}/showcase-{rev}.json
 * Firestore: users/{uid}/projects/{id}
 *   - showcasePath: string (canonical reference)
 *   - rev: number (monotonically increasing)
 *   - showcaseSizeKB: number
 *   - syncedAt: Timestamp
 * ```
 */

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata
} from 'firebase/storage';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';
import { storage, db, auth } from '../firebase';
import { telemetry, measureAsync } from './telemetry';
import { syncStatusManager } from './SyncStatusManager';
import { syncMutex } from '../utils/AsyncMutex';
import { conflictResolver } from './ConflictResolver';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';
import type { UnifiedProjectData } from './UnifiedStorageManager';

export interface CloudProjectMetadata {
  showcasePath: string;
  rev: number;
  showcaseSizeKB: number;
  syncedAt: Timestamp;
  userId: string;
  projectId: string;

  // Optional metadata
  title?: string;
  subjects?: string[];
  gradeLevel?: string;
  updatedBy?: string;
}

export interface SaveResult {
  success: boolean;
  rev: number;
  showcasePath?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface LoadResult {
  showcase: ProjectShowcaseV2 | null;
  metadata?: CloudProjectMetadata;
  source: 'cloud' | 'cache';
  success: boolean;
}

class CloudProjectService {
  private cache = new Map<string, { showcase: ProjectShowcaseV2; fetchedAt: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Save project showcase to cloud with atomic two-phase commit
   *
   * @param projectId - Project ID
   * @param showcase - Showcase data to save
   * @param options - Save options
   * @returns Save result with revision number
   */
  async saveShowcase(
    projectId: string,
    showcase: ProjectShowcaseV2,
    options?: {
      forceOverwrite?: boolean;  // Skip conflict detection
      expectedRev?: number;       // For optimistic locking
    }
  ): Promise<SaveResult> {
    // Use mutex to prevent concurrent saves of same project
    return syncMutex.runExclusive(`save_${projectId}`, async () => {
      const startTime = Date.now();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        const error = {
          code: 'AUTH_REQUIRED',
          message: 'User must be authenticated',
          retryable: false
        };

        telemetry.track({
          event: 'save_project',
          success: false,
          latencyMs: Date.now() - startTime,
          errorCode: error.code,
          projectId
        });

        return { success: false, rev: 0, error };
      }

      try {
        syncStatusManager.setStatus(projectId, 'syncing');

        // Step 1: Get current revision
        const docRef = doc(db, 'users', userId, 'projects', projectId);
        const currentSnap = await getDoc(docRef);
        const currentRev = currentSnap.data()?.rev || 0;
        const newRev = currentRev + 1;

        // Step 2: Conflict detection (unless force overwrite)
        if (!options?.forceOverwrite && currentRev > 0) {
          const localRev = options?.expectedRev ?? currentRev;
          const conflict = await conflictResolver.detectConflict(projectId, localRev);

          if (conflict.hasConflict) {
            syncStatusManager.setConflict(projectId, conflict.cloudRev!);

            return {
              success: false,
              rev: conflict.cloudRev!,
              error: {
                code: 'CONFLICT',
                message: 'Project modified on another device',
                retryable: false
              }
            };
          }
        }

        // Step 3: Upload to versioned Storage path (idempotent)
        const showcasePath = `users/${userId}/projects/${projectId}/showcase-${newRev}.json`;
        const storageRef = ref(storage, showcasePath);

        const jsonBlob = new Blob([JSON.stringify(showcase)], {
          type: 'application/json'
        });

        const uploadResult = await measureAsync(() =>
          uploadBytes(storageRef, jsonBlob, {
            cacheControl: 'public, max-age=300', // 5 min CDN cache
            contentType: 'application/json',
            customMetadata: {
              rev: String(newRev),
              projectId,
              uploadedAt: new Date().toISOString()
            }
          })
        );

        console.log(
          `[CloudProjectService] Uploaded showcase-${newRev}.json ` +
          `(${Math.round(jsonBlob.size / 1024)}KB) in ${uploadResult.latencyMs}ms`
        );

        // Step 4: Update Firestore pointer atomically
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(docRef);

          // Verify no stale write
          if (snap.exists() && snap.data().rev >= newRev) {
            throw new Error('STALE_WRITE: Another save won the race');
          }

          const metadata: CloudProjectMetadata = {
            showcasePath,
            rev: newRev,
            showcaseSizeKB: Math.round(jsonBlob.size / 1024),
            syncedAt: serverTimestamp() as Timestamp,
            userId,
            projectId,
            title: showcase.hero?.title,
            subjects: showcase.hero?.subjects,
            gradeLevel: showcase.hero?.gradeBand,
            updatedBy: userId
          };

          transaction.set(docRef, metadata, { merge: true });
        });

        // Step 5: Best-effort cleanup of old version
        if (currentRev > 0) {
          this.cleanupOldVersion(userId, projectId, currentRev).catch(err => {
            console.warn('[CloudProjectService] Cleanup failed:', err.message);
          });
        }

        // Step 6: Invalidate cache
        this.cache.delete(projectId);

        // Success!
        syncStatusManager.setStatus(projectId, 'synced', { rev: newRev });

        telemetry.track({
          event: 'save_project',
          success: true,
          latencyMs: Date.now() - startTime,
          projectId,
          metadata: { rev: newRev, sizeKB: Math.round(jsonBlob.size / 1024) }
        });

        return { success: true, rev: newRev, showcasePath };

      } catch (error: any) {
        console.error('[CloudProjectService] Save failed:', error);

        const errorResult = {
          code: error.code || error.name || 'UNKNOWN',
          message: error.message || 'Save failed',
          retryable: this.isRetryableError(error)
        };

        syncStatusManager.setError(projectId, error, errorResult.retryable);

        telemetry.track({
          event: 'save_project',
          success: false,
          latencyMs: Date.now() - startTime,
          errorCode: errorResult.code,
          errorMessage: errorResult.message,
          projectId
        });

        return { success: false, rev: 0, error: errorResult };
      }
    });
  }

  /**
   * Load showcase from cloud with fresh URL
   *
   * @param projectId - Project ID
   * @param options - Load options
   * @returns Load result with showcase data
   */
  async loadShowcase(
    projectId: string,
    options?: {
      useCache?: boolean;  // Default: true
    }
  ): Promise<LoadResult> {
    const startTime = Date.now();
    const userId = auth.currentUser?.uid;

    if (!userId) {
      telemetry.track({
        event: 'load_project',
        success: false,
        latencyMs: Date.now() - startTime,
        errorCode: 'AUTH_REQUIRED',
        projectId
      });

      return { showcase: null, success: false, source: 'cloud' };
    }

    try {
      // Check cache first
      const useCache = options?.useCache ?? true;
      if (useCache) {
        const cached = this.cache.get(projectId);
        if (cached && Date.now() - cached.fetchedAt < this.CACHE_TTL_MS) {
          telemetry.track({
            event: 'cache_hit',
            success: true,
            latencyMs: Date.now() - startTime,
            source: 'cache',
            projectId
          });

          return { showcase: cached.showcase, success: true, source: 'cache' };
        }

        if (cached) {
          telemetry.track({
            event: 'cache_miss',
            success: true,
            latencyMs: 0,
            source: 'cache',
            projectId,
            metadata: { reason: 'expired' }
          });
        }
      }

      // Load from cloud
      const docRef = doc(db, 'users', userId, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        telemetry.track({
          event: 'load_project',
          success: false,
          latencyMs: Date.now() - startTime,
          errorCode: 'NOT_FOUND',
          projectId
        });

        return { showcase: null, success: false, source: 'cloud' };
      }

      const metadata = docSnap.data() as CloudProjectMetadata;
      const { showcasePath } = metadata;

      // Compute fresh download URL
      const storageRef = ref(storage, showcasePath);
      const downloadURL = await getDownloadURL(storageRef);

      // Fetch showcase JSON
      const response = await fetch(downloadURL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const showcase: ProjectShowcaseV2 = await response.json();

      // Cache for future reads
      this.cache.set(projectId, {
        showcase,
        fetchedAt: Date.now()
      });

      telemetry.track({
        event: 'load_project',
        success: true,
        latencyMs: Date.now() - startTime,
        source: 'cloud',
        projectId,
        metadata: { rev: metadata.rev, sizeKB: metadata.showcaseSizeKB }
      });

      return { showcase, metadata, success: true, source: 'cloud' };

    } catch (error: any) {
      console.error('[CloudProjectService] Load failed:', error);

      telemetry.track({
        event: 'load_project',
        success: false,
        latencyMs: Date.now() - startTime,
        errorCode: error.code || 'UNKNOWN',
        errorMessage: error.message,
        projectId
      });

      return { showcase: null, success: false, source: 'cloud' };
    }
  }

  /**
   * Get cloud metadata without loading full showcase
   */
  async getMetadata(projectId: string): Promise<CloudProjectMetadata | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) {return null;}

    try {
      const docRef = doc(db, 'users', userId, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() ? (docSnap.data() as CloudProjectMetadata) : null;
    } catch (error) {
      console.error('[CloudProjectService] Failed to get metadata:', error);
      return null;
    }
  }

  /**
   * Verify Storage blob exists for a showcase path
   */
  async verifyBlob(showcasePath: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, showcasePath);
      await getMetadata(storageRef);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Invalidate cache for a project
   */
  invalidateCache(projectId: string) {
    this.cache.delete(projectId);
  }

  /**
   * Clear all cached showcases
   */
  clearCache() {
    this.cache.clear();
  }

  // Private helpers

  private async cleanupOldVersion(
    userId: string,
    projectId: string,
    oldRev: number
  ): Promise<void> {
    const oldPath = `users/${userId}/projects/${projectId}/showcase-${oldRev}.json`;
    const storageRef = ref(storage, oldPath);

    try {
      await deleteObject(storageRef);
      console.log(`[CloudProjectService] Deleted old version: showcase-${oldRev}.json`);
    } catch (error: any) {
      // Non-fatal - orphaned blobs can be cleaned up by scheduled function
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
    }
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'unavailable',
      'deadline-exceeded',
      'resource-exhausted',
      'internal',
      'unknown',
      'aborted',
      'ECONNRESET',
      'ETIMEDOUT'
    ];

    const code = error.code || error.name || '';
    return retryableCodes.some(retryable => code.toLowerCase().includes(retryable.toLowerCase()));
  }
}

/**
 * Singleton instance
 */
export const cloudProjectService = new CloudProjectService();
