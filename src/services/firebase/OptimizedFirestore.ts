/**
 * Optimized Firestore Operations
 * Batch operations, transactions, and size optimization for Firestore writes.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  serverTimestamp,
  collection,
  type Firestore,
} from 'firebase/firestore';
import { db, isOfflineMode } from '../../firebase/firebase';
import { CloudError, CloudErrorCode, CloudErrorFactory, CloudErrorTelemetry } from './CloudErrors';
import { CloudStorageService } from './CloudStorageService';

export interface FirestoreWriteOptions {
  merge?: boolean;
  validateSize?: boolean;
  splitLargeData?: boolean;
  useTransaction?: boolean;
}

export interface BatchOperation {
  type: 'set' | 'update' | 'delete';
  path: string;
  data?: any;
  options?: { merge?: boolean };
}

const FIRESTORE_DOC_SIZE_LIMIT = 1_048_576; // 1MB
const SAFE_DOC_SIZE_LIMIT = 900_000; // 900KB to be safe
const MAX_BATCH_SIZE = 500; // Firestore batch limit

export class OptimizedFirestore {
  /**
   * Sanitize data for Firestore (remove undefined values)
   */
  private static sanitizeForFirestore(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeForFirestore(item));
    }

    if (obj instanceof Date) {
      return obj;
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip undefined and functions
        if (value === undefined || typeof value === 'function') {
          continue;
        }
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeForFirestore(value);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Calculate document size in bytes
   */
  private static calculateSize(data: any): number {
    try {
      const json = JSON.stringify(data);
      // UTF-8 encoding approximation
      return new Blob([json]).size;
    } catch (error) {
      console.error('[OptimizedFirestore] Size calculation failed', error);
      return 0;
    }
  }

  /**
   * Validate document size
   */
  private static validateSize(data: any, operation: string): void {
    const size = this.calculateSize(data);

    if (size > FIRESTORE_DOC_SIZE_LIMIT) {
      throw new CloudError(
        CloudErrorCode.FIRESTORE_DOCUMENT_TOO_LARGE,
        `Document size ${size} bytes exceeds Firestore limit of ${FIRESTORE_DOC_SIZE_LIMIT} bytes`,
        { operation, dataSize: size },
        { isRetryable: false }
      );
    }

    if (size > SAFE_DOC_SIZE_LIMIT) {
      console.warn(
        `[OptimizedFirestore] Document approaching size limit: ${size} bytes (${(size / FIRESTORE_DOC_SIZE_LIMIT * 100).toFixed(1)}%)`
      );
    }
  }

  /**
   * Write document with optimizations
   */
  static async writeDocument(
    userId: string,
    projectId: string,
    data: any,
    options: FirestoreWriteOptions = {}
  ): Promise<void> {
    const operation = 'writeDocument';

    if (isOfflineMode || !db || db.type !== 'firestore') {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    try {
      // Sanitize data
      const sanitized = this.sanitizeForFirestore(data);

      // Validate size if requested
      if (options.validateSize !== false) {
        this.validateSize(sanitized, operation);
      }

      const docRef = doc(collection(db as Firestore, 'users', userId, 'projectDrafts'), projectId);

      if (options.useTransaction) {
        // Use transaction for atomic operations
        await runTransaction(db as Firestore, async (transaction) => {
          transaction.set(
            docRef,
            {
              ...sanitized,
              metadata: {
                ...sanitized.metadata,
                updatedAt: serverTimestamp(),
              },
            },
            { merge: options.merge ?? true }
          );
        });
      } else {
        // Regular write
        await setDoc(
          docRef,
          {
            ...sanitized,
            metadata: {
              ...sanitized.metadata,
              updatedAt: serverTimestamp(),
            },
          },
          { merge: options.merge ?? true }
        );
      }

      console.log(`[OptimizedFirestore] Document written: ${projectId}`);
    } catch (error: any) {
      const cloudError = CloudErrorFactory.fromFirebaseError(error, operation, {
        userId,
        projectId,
      });
      CloudErrorTelemetry.record(cloudError);
      throw cloudError;
    }
  }

  /**
   * Write document with large data splitting
   * Automatically offloads large fields to Cloud Storage
   */
  static async writeDocumentWithSplit(
    userId: string,
    projectId: string,
    data: any,
    options: FirestoreWriteOptions = {}
  ): Promise<void> {
    const operation = 'writeDocumentWithSplit';

    // Calculate total size
    const sanitized = this.sanitizeForFirestore(data);
    const totalSize = this.calculateSize(sanitized);

    // If under safe limit, write directly
    if (totalSize < SAFE_DOC_SIZE_LIMIT) {
      return await this.writeDocument(userId, projectId, sanitized, options);
    }

    console.log(`[OptimizedFirestore] Document too large (${totalSize} bytes), splitting...`);

    // Split large fields
    const firestoreDoc: any = { ...sanitized };
    const largeFields: string[] = [];

    // Identify large fields (showcase, projectData, etc.)
    for (const [key, value] of Object.entries(sanitized)) {
      if (!value || typeof value !== 'object') {continue;}

      const fieldSize = this.calculateSize(value);
      if (fieldSize > 100_000) { // 100KB threshold
        largeFields.push(key);
      }
    }

    // Upload large fields to Cloud Storage
    for (const field of largeFields) {
      try {
        const fieldData = sanitized[field];
        const pointer = await CloudStorageService.uploadJSON(
          userId,
          projectId,
          field as any, // Cast to expected types
          fieldData,
          { validateUpload: true }
        );

        // Replace with pointer
        firestoreDoc[field] = null;
        firestoreDoc[`${field}Ref`] = pointer;

        console.log(`[OptimizedFirestore] Offloaded ${field} to Cloud Storage (${pointer.sizeKB} KB)`);
      } catch (error) {
        console.error(`[OptimizedFirestore] Failed to offload ${field}`, error);
        // Keep original data if upload fails
      }
    }

    // Write the optimized document
    await this.writeDocument(userId, projectId, firestoreDoc, options);
  }

  /**
   * Batch write multiple documents
   */
  static async batchWrite(
    userId: string,
    operations: BatchOperation[]
  ): Promise<void> {
    const operation = 'batchWrite';

    if (isOfflineMode || !db || db.type !== 'firestore') {
      throw CloudErrorFactory.networkOffline(operation, { userId });
    }

    if (operations.length === 0) {
      return;
    }

    if (operations.length > MAX_BATCH_SIZE) {
      throw new CloudError(
        CloudErrorCode.FIRESTORE_BATCH_FAILED,
        `Batch size ${operations.length} exceeds maximum ${MAX_BATCH_SIZE}`,
        { operation, userId },
        { isRetryable: false }
      );
    }

    try {
      const batch = writeBatch(db as Firestore);

      for (const op of operations) {
        const docRef = doc(db as Firestore, op.path);

        switch (op.type) {
          case 'set':
            if (!op.data) {
              throw new Error(`Set operation requires data: ${op.path}`);
            }
            batch.set(
              docRef,
              this.sanitizeForFirestore(op.data),
              op.options || {}
            );
            break;

          case 'update':
            if (!op.data) {
              throw new Error(`Update operation requires data: ${op.path}`);
            }
            batch.update(docRef, this.sanitizeForFirestore(op.data));
            break;

          case 'delete':
            batch.delete(docRef);
            break;
        }
      }

      await batch.commit();
      console.log(`[OptimizedFirestore] Batch write committed: ${operations.length} operations`);
    } catch (error: any) {
      const cloudError = CloudErrorFactory.fromFirebaseError(error, operation, { userId });
      CloudErrorTelemetry.record(cloudError);
      throw cloudError;
    }
  }

  /**
   * Read document with caching
   */
  static async readDocument(
    userId: string,
    projectId: string
  ): Promise<any | null> {
    const operation = 'readDocument';

    if (isOfflineMode || !db || db.type !== 'firestore') {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    try {
      const docRef = doc(collection(db as Firestore, 'users', userId, 'projectDrafts'), projectId);
      const snapshot = await getDoc(docRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();

      // Rehydrate any offloaded fields
      for (const [key, value] of Object.entries(data)) {
        if (key.endsWith('Ref') && value && typeof value === 'object') {
          const fieldName = key.slice(0, -3); // Remove 'Ref' suffix
          if (data[fieldName] === null && (value as any).storage === 'cloud') {
            try {
              const rehydrated = await CloudStorageService.downloadJSON(value as any);
              data[fieldName] = rehydrated;
            } catch (error) {
              console.warn(`[OptimizedFirestore] Failed to rehydrate ${fieldName}`, error);
            }
          }
        }
      }

      return data;
    } catch (error: any) {
      const cloudError = CloudErrorFactory.fromFirebaseError(error, operation, {
        userId,
        projectId,
      });
      CloudErrorTelemetry.record(cloudError);
      throw cloudError;
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(
    userId: string,
    projectId: string
  ): Promise<void> {
    const operation = 'deleteDocument';

    if (isOfflineMode || !db || db.type !== 'firestore') {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    try {
      const docRef = doc(collection(db as Firestore, 'users', userId, 'projectDrafts'), projectId);
      await deleteDoc(docRef);

      console.log(`[OptimizedFirestore] Document deleted: ${projectId}`);
    } catch (error: any) {
      const cloudError = CloudErrorFactory.fromFirebaseError(error, operation, {
        userId,
        projectId,
      });
      CloudErrorTelemetry.record(cloudError);
      throw cloudError;
    }
  }

  /**
   * Update document fields atomically
   */
  static async updateDocument(
    userId: string,
    projectId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const operation = 'updateDocument';

    if (isOfflineMode || !db || db.type !== 'firestore') {
      throw CloudErrorFactory.networkOffline(operation, { userId, projectId });
    }

    try {
      const docRef = doc(collection(db as Firestore, 'users', userId, 'projectDrafts'), projectId);
      const sanitized = this.sanitizeForFirestore(updates);

      await updateDoc(docRef, {
        ...sanitized,
        'metadata.updatedAt': serverTimestamp(),
      });

      console.log(`[OptimizedFirestore] Document updated: ${projectId}`);
    } catch (error: any) {
      const cloudError = CloudErrorFactory.fromFirebaseError(error, operation, {
        userId,
        projectId,
      });
      CloudErrorTelemetry.record(cloudError);
      throw cloudError;
    }
  }
}

export default OptimizedFirestore;
