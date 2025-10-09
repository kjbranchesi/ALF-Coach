import { storage, auth, isOfflineMode } from '../firebase/firebase';
import { ref, uploadString, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

export type CloudBlobPointer = {
  storage: 'cloud';
  path: string;
  sizeKB: number;
  uploadedAt: string;
  downloadURL?: string;
};

function ensurePath(userId: string, projectId: string, kind: 'showcase' | 'hero') {
  const base = `users/${userId}/projects/${projectId}`;
  return `${base}/${kind}.json`;
}

function ensureSnapshotFolder(userId: string, projectId: string, kind: 'showcase' | 'hero') {
  return `users/${userId}/projects/${projectId}/snapshots/${kind}`;
}

export const CloudBlobService = {
  async uploadJSON(userId: string, projectId: string, kind: 'showcase' | 'hero', data: unknown): Promise<CloudBlobPointer | null> {
    try {
      if (isOfflineMode || !storage) { return null; }
      const json = typeof data === 'string' ? data : JSON.stringify(data);
      const path = ensurePath(userId, projectId, kind);
      const r = ref(storage as any, path);
      await uploadString(r, json, 'raw');
      let downloadURL: string | undefined;
      try { downloadURL = await getDownloadURL(r); } catch {}
      return {
        storage: 'cloud',
        path,
        sizeKB: Math.round(json.length / 1024),
        uploadedAt: new Date().toISOString(),
        downloadURL
      };
    } catch (e) {
      console.warn('[CloudBlobService] Upload failed:', (e as Error).message);
      return null;
    }
  }
  ,
  async downloadJSON(pointer: CloudBlobPointer): Promise<any | null> {
    try {
      if (isOfflineMode || !storage) { return null; }
      const url = pointer.downloadURL || await getDownloadURL(ref(storage as any, pointer.path));
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) { return null; }
      return await res.json();
    } catch {
      return null;
    }
  }
  ,
  async uploadSnapshotJSON(userId: string, projectId: string, kind: 'showcase' | 'hero', data: unknown): Promise<string | null> {
    try {
      if (isOfflineMode || !storage) { return null; }
      const json = typeof data === 'string' ? data : JSON.stringify(data);
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const folder = ensureSnapshotFolder(userId, projectId, kind);
      const path = `${folder}/${ts}.json`;
      const r = ref(storage as any, path);
      await uploadString(r, json, 'raw');
      return path;
    } catch (e) {
      console.warn('[CloudBlobService] Snapshot upload failed:', (e as Error).message);
      return null;
    }
  }
  ,
  async trimSnapshots(userId: string, projectId: string, kind: 'showcase' | 'hero', maxKeep: number = 10): Promise<void> {
    try {
      if (isOfflineMode || !storage) { return; }
      const folder = ensureSnapshotFolder(userId, projectId, kind);
      const r = ref(storage as any, folder);
      const listing = await listAll(r);
      const items = listing.items || [];
      if (items.length <= maxKeep) { return; }
      // Sort by name descending (ISO timestamps in name → lexicographic order)
      const sorted = [...items].sort((a,b) => b.name.localeCompare(a.name));
      const toDelete = sorted.slice(maxKeep);
      await Promise.allSettled(toDelete.map(obj => deleteObject(obj)));
    } catch (e) {
      console.warn('[CloudBlobService] Snapshot trim failed:', (e as Error).message);
    }
  }
};

export default CloudBlobService;
