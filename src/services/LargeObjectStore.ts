import { idb } from './IndexedDBStore';

/**
 * LargeObjectStore: opinionated helper for storing large JSON payloads
 * (e.g., project showcases) in IndexedDB to avoid localStorage quota limits.
 */

export type LargeRef = {
  driver: 'idb';
  store: 'showcase' | 'blobs';
  key: string; // e.g., alf_showcase_{projectId}
  sizeKB?: number;
};

export const LargeObjectStore = {
  async saveShowcase(projectId: string, payload: unknown): Promise<LargeRef> {
    const key = `alf_showcase_${projectId}`;
    const json = JSON.stringify(payload);
    await idb.set('showcase', key, json);
    return { driver: 'idb', store: 'showcase', key, sizeKB: Math.round(json.length / 1024) };
  },

  async loadShowcase(ref: LargeRef | null | undefined): Promise<any | null> {
    if (!ref || ref.driver !== 'idb' || ref.store !== 'showcase') { return null; }
    const raw = await idb.get<string>('showcase', ref.key);
    if (!raw) { return null; }
    try { return JSON.parse(raw); } catch { return null; }
  },

  async removeShowcase(projectId: string): Promise<void> {
    const key = `alf_showcase_${projectId}`;
    try { await idb.remove('showcase', key); } catch {}
  }
};

export default LargeObjectStore;

