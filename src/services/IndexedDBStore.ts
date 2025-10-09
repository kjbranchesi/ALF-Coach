/**
 * Minimal IndexedDB helper for large payloads (no external deps).
 * Stores JSON-serializable objects by store name and key.
 */

type IDBConfig = {
  dbName: string;
  version: number;
  stores: string[]; // object store names to ensure
};

const DEFAULT_CONFIG: IDBConfig = {
  dbName: 'alf-coach-db',
  version: 1,
  stores: ['showcase', 'blobs']
};

function openDB(config: IDBConfig = DEFAULT_CONFIG): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(config.dbName, config.version);

    req.onupgradeneeded = () => {
      const db = req.result;
      config.stores.forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    Promise.resolve(fn(store))
      .then((result) => {
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
      .catch((err) => {
        try { tx.abort(); } catch {}
        reject(err);
      });
  });
}

export const idb = {
  async get<T = unknown>(store: string, key: string): Promise<T | null> {
    return withStore<T | null>(store, 'readonly', (s) => {
      return new Promise((resolve, reject) => {
        const req = s.get(key);
        req.onsuccess = () => resolve((req.result as T) ?? null);
        req.onerror = () => reject(req.error);
      });
    });
  },

  async set(store: string, key: string, value: unknown): Promise<void> {
    return withStore<void>(store, 'readwrite', (s) => {
      return new Promise((resolve, reject) => {
        const req = s.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  },

  async remove(store: string, key: string): Promise<void> {
    return withStore<void>(store, 'readwrite', (s) => {
      return new Promise((resolve, reject) => {
        const req = s.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }
};

export default idb;

