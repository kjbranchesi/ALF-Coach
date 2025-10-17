/**
 * Offline Snapshot Service
 *
 * Fallback mechanism for offline editing when cloud is unavailable.
 * Stores compressed "last known good" snapshot in localStorage with strict size cap.
 *
 * Design Decisions:
 * - Size-capped at 300KB compressed (prevents localStorage quota issues)
 * - Uses gzip compression (pako library) for ~70% size reduction
 * - Single snapshot per project (not a queue - use OfflineQueue for that)
 * - Automatic cleanup of expired snapshots
 * - Base64 encoding for localStorage compatibility
 *
 * When to Use:
 * - Tab closes while offline (data would be lost without this)
 * - Network interruption during save
 * - Temporary cloud outage
 *
 * Not a Replacement For:
 * - IDB (can optionally keep IDB behind feature flag)
 * - Cloud storage (this is emergency fallback only)
 * - Offline queue (this is snapshot, not operation log)
 */

import * as pako from 'pako';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';

export interface OfflineSnapshot {
  projectId: string;
  rev: number;
  compressedShowcase: string;  // Base64-encoded gzipped JSON
  sizeKB: number;
  originalSizeKB: number;
  compressionRatio: number;
  capturedAt: number;
  expiresAt: number;
}

export interface SnapshotStats {
  totalSnapshots: number;
  totalSizeKB: number;
  averageSizeKB: number;
  averageCompressionRatio: number;
}

class OfflineSnapshotService {
  private readonly STORAGE_PREFIX = 'alf_offline_snapshot_';
  private readonly SIZE_LIMIT_KB = 300;  // Hard cap
  private readonly EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;  // 7 days

  /**
   * Save offline snapshot (compressed, size-capped)
   *
   * @param projectId - Project ID
   * @param showcase - Showcase data to snapshot
   * @param rev - Current revision number
   * @returns Success status and size info
   */
  async saveSnapshot(
    projectId: string,
    showcase: ProjectShowcaseV2,
    rev: number
  ): Promise<{ success: boolean; sizeKB?: number; skipped?: string }> {
    try {
      // 1. Serialize to JSON
      const json = JSON.stringify(showcase);
      const originalSizeKB = Math.round(json.length / 1024);

      // 2. Compress with gzip
      const compressed = pako.gzip(json);

      // 3. Encode to Base64 for localStorage
      const base64 = this.arrayBufferToBase64(compressed);
      const compressedSizeKB = Math.round(base64.length / 1024);

      // 4. Check size limit
      if (compressedSizeKB > this.SIZE_LIMIT_KB) {
        console.warn(
          `[OfflineSnapshot] Snapshot too large (${compressedSizeKB}KB > ${this.SIZE_LIMIT_KB}KB), skipping`
        );

        return {
          success: false,
          skipped: `Exceeds size limit (${compressedSizeKB}KB)`
        };
      }

      // 5. Create snapshot object
      const snapshot: OfflineSnapshot = {
        projectId,
        rev,
        compressedShowcase: base64,
        sizeKB: compressedSizeKB,
        originalSizeKB,
        compressionRatio: Math.round((1 - compressedSizeKB / originalSizeKB) * 100),
        capturedAt: Date.now(),
        expiresAt: Date.now() + this.EXPIRY_MS
      };

      // 6. Save to localStorage
      const key = this.STORAGE_PREFIX + projectId;
      localStorage.setItem(key, JSON.stringify(snapshot));

      console.log(
        `[OfflineSnapshot] Saved snapshot for ${projectId.slice(0, 8)}: ` +
        `${compressedSizeKB}KB (${snapshot.compressionRatio}% compression)`
      );

      return { success: true, sizeKB: compressedSizeKB };

    } catch (error) {
      console.error('[OfflineSnapshot] Failed to save snapshot:', error);
      return { success: false, skipped: (error as Error).message };
    }
  }

  /**
   * Load offline snapshot (decompressed)
   *
   * @param projectId - Project ID
   * @returns Showcase data or null if not found/expired
   */
  async loadSnapshot(projectId: string): Promise<{
    showcase: ProjectShowcaseV2 | null;
    rev?: number;
    expired?: boolean;
  }> {
    try {
      // 1. Load from localStorage
      const key = this.STORAGE_PREFIX + projectId;
      const item = localStorage.getItem(key);

      if (!item) {
        return { showcase: null };
      }

      // 2. Parse snapshot metadata
      const snapshot: OfflineSnapshot = JSON.parse(item);

      // 3. Check expiry
      if (Date.now() > snapshot.expiresAt) {
        console.warn(
          `[OfflineSnapshot] Snapshot expired for ${projectId.slice(0, 8)}, removing`
        );
        this.removeSnapshot(projectId);
        return { showcase: null, expired: true };
      }

      // 4. Decode Base64
      const compressed = this.base64ToArrayBuffer(snapshot.compressedShowcase);

      // 5. Decompress with gunzip
      const json = pako.ungzip(compressed, { to: 'string' });

      // 6. Parse JSON
      const showcase: ProjectShowcaseV2 = JSON.parse(json);

      console.log(
        `[OfflineSnapshot] Loaded snapshot for ${projectId.slice(0, 8)} ` +
        `(rev ${snapshot.rev}, ${snapshot.sizeKB}KB)`
      );

      return { showcase, rev: snapshot.rev };

    } catch (error) {
      console.error('[OfflineSnapshot] Failed to load snapshot:', error);

      // Clean up corrupted snapshot
      this.removeSnapshot(projectId);

      return { showcase: null };
    }
  }

  /**
   * Check if snapshot exists and is valid
   */
  hasSnapshot(projectId: string): boolean {
    const key = this.STORAGE_PREFIX + projectId;
    const item = localStorage.getItem(key);

    if (!item) {return false;}

    try {
      const snapshot: OfflineSnapshot = JSON.parse(item);
      return Date.now() <= snapshot.expiresAt;
    } catch {
      return false;
    }
  }

  /**
   * Get snapshot metadata without loading full data
   */
  getSnapshotInfo(projectId: string): Omit<OfflineSnapshot, 'compressedShowcase'> | null {
    const key = this.STORAGE_PREFIX + projectId;
    const item = localStorage.getItem(key);

    if (!item) {return null;}

    try {
      const snapshot: OfflineSnapshot = JSON.parse(item);
      const { compressedShowcase, ...info } = snapshot;
      return info;
    } catch {
      return null;
    }
  }

  /**
   * Remove snapshot for a project
   */
  removeSnapshot(projectId: string) {
    const key = this.STORAGE_PREFIX + projectId;
    localStorage.removeItem(key);
  }

  /**
   * Clean up expired snapshots
   */
  cleanupExpired(): number {
    let removed = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key?.startsWith(this.STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (!item) {continue;}

          const snapshot: OfflineSnapshot = JSON.parse(item);

          if (Date.now() > snapshot.expiresAt) {
            localStorage.removeItem(key);
            removed++;
            console.log(`[OfflineSnapshot] Removed expired snapshot: ${key}`);
          }
        } catch {
          // Corrupted - remove it
          localStorage.removeItem(key);
          removed++;
        }
      }
    }

    if (removed > 0) {
      console.log(`[OfflineSnapshot] Cleaned up ${removed} expired snapshots`);
    }

    return removed;
  }

  /**
   * Get statistics about all snapshots
   */
  getStats(): SnapshotStats {
    const snapshots: OfflineSnapshot[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key?.startsWith(this.STORAGE_PREFIX)) {
        try {
          const item = localStorage.getItem(key);
          if (!item) {continue;}

          const snapshot: OfflineSnapshot = JSON.parse(item);

          // Only count non-expired
          if (Date.now() <= snapshot.expiresAt) {
            snapshots.push(snapshot);
          }
        } catch {
          // Skip corrupted
        }
      }
    }

    const totalSizeKB = snapshots.reduce((sum, s) => sum + s.sizeKB, 0);
    const totalCompressionRatio = snapshots.reduce((sum, s) => sum + s.compressionRatio, 0);

    return {
      totalSnapshots: snapshots.length,
      totalSizeKB,
      averageSizeKB: snapshots.length > 0 ? Math.round(totalSizeKB / snapshots.length) : 0,
      averageCompressionRatio: snapshots.length > 0 ? Math.round(totalCompressionRatio / snapshots.length) : 0
    };
  }

  /**
   * Clear all snapshots (for testing)
   */
  clearAll() {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_PREFIX)) {
        keys.push(key);
      }
    }

    keys.forEach(key => localStorage.removeItem(key));

    console.log(`[OfflineSnapshot] Cleared ${keys.length} snapshots`);
  }

  // Private helpers

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const len = buffer.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i]);
    }

    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const len = binary.length;
    const buffer = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i);
    }

    return buffer;
  }
}

/**
 * Singleton instance
 */
export const offlineSnapshotService = new OfflineSnapshotService();

/**
 * Auto-cleanup on app load (once per session)
 */
if (typeof window !== 'undefined') {
  // Run cleanup after 5 seconds (don't block initial load)
  setTimeout(() => {
    offlineSnapshotService.cleanupExpired();
  }, 5000);
}
