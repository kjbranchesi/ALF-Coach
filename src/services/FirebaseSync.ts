/**
 * Firebase Sync Service
 * Handles connection monitoring, retry logic, and data synchronization
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  onSnapshot,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  validateBlueprintData, 
  prepareBlueprintForSave, 
  prepareBlueprintForLocalStorage,
  type BlueprintData 
} from '../utils/dataValidator';

const STORAGE_KEY_PREFIX = 'blueprint_';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // Start with 1 second

export class FirebaseSync {
  private static instance: FirebaseSync;
  private connectionStatus: 'online' | 'offline' | 'connecting' = 'online';
  private syncQueue: Map<string, any> = new Map();
  private listeners: Set<(status: string) => void> = new Set();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.initializeConnectionMonitoring();
  }

  static getInstance(): FirebaseSync {
    if (!FirebaseSync.instance) {
      FirebaseSync.instance = new FirebaseSync();
    }
    return FirebaseSync.instance;
  }

  /**
   * Initialize connection monitoring
   */
  private initializeConnectionMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Check Firebase connection periodically
    setInterval(() => this.checkFirebaseConnection(), 30000); // Every 30 seconds
  }

  /**
   * Handle coming online
   */
  private async handleOnline() {
    console.log('🌐 Network connection restored');
    this.setConnectionStatus('connecting');
    
    try {
      await enableNetwork(db);
      this.setConnectionStatus('online');
      this.processSyncQueue();
    } catch (error) {
      console.error('Error enabling Firebase network:', error);
      this.setConnectionStatus('offline');
    }
  }

  /**
   * Handle going offline
   */
  private async handleOffline() {
    console.log('📴 Network connection lost');
    this.setConnectionStatus('offline');
    
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error('Error disabling Firebase network:', error);
    }
  }

  /**
   * Check Firebase connection
   */
  private async checkFirebaseConnection() {
    if (this.connectionStatus === 'offline') {return;}

    try {
      // Try to read a simple document to test connection
      const testDoc = doc(db, '_connection_test', 'test');
      await getDoc(testDoc);
      
      if (this.connectionStatus !== 'online') {
        this.setConnectionStatus('online');
        this.processSyncQueue();
      }
    } catch (error) {
      if (this.connectionStatus === 'online') {
        console.warn('Firebase connection check failed:', error);
        this.setConnectionStatus('offline');
      }
    }
  }

  /**
   * Set connection status and notify listeners
   */
  private setConnectionStatus(status: 'online' | 'offline' | 'connecting') {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.listeners.forEach(listener => listener(status));
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(listener: (status: string) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Save blueprint with retry logic
   */
  async saveBlueprint(blueprintId: string, data: BlueprintData, attempt = 1): Promise<boolean> {
    try {
      // Validate data
      const validated = validateBlueprintData(data);
      const prepared = prepareBlueprintForSave(validated);

      // Save to localStorage immediately
      this.saveToLocalStorage(blueprintId, validated);

      // Try to save to Firebase
      if (this.connectionStatus === 'online') {
        const docRef = doc(db, 'blueprints', blueprintId);
        await setDoc(docRef, prepared, { merge: true });
        console.log(`✅ Blueprint ${blueprintId} saved to Firebase`);
        
        // Remove from sync queue if successful
        this.syncQueue.delete(blueprintId);
        return true;
      } else {
        // Add to sync queue for later
        this.syncQueue.set(blueprintId, prepared);
        console.log(`📋 Blueprint ${blueprintId} queued for sync`);
        return false;
      }
    } catch (error) {
      console.error(`Error saving blueprint (attempt ${attempt}):`, error);

      // Retry logic
      if (attempt < RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`🔄 Retrying save in ${delay}ms...`);
        
        // Clear any existing retry timeout
        const existingTimeout = this.retryTimeouts.get(blueprintId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Set new retry timeout
        const timeout = setTimeout(() => {
          this.saveBlueprint(blueprintId, data, attempt + 1);
          this.retryTimeouts.delete(blueprintId);
        }, delay);
        
        this.retryTimeouts.set(blueprintId, timeout);
      } else {
        console.error(`❌ Failed to save blueprint after ${RETRY_ATTEMPTS} attempts`);
        // Keep in sync queue for manual retry
        this.syncQueue.set(blueprintId, prepareBlueprintForSave(data));
      }
      
      return false;
    }
  }

  /**
   * Update blueprint with retry logic
   */
  async updateBlueprint(blueprintId: string, updates: Partial<BlueprintData>, attempt = 1): Promise<boolean> {
    try {
      // Add update timestamp
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Update localStorage immediately
      const localData = this.getFromLocalStorage(blueprintId);
      if (localData) {
        const merged = { ...localData, ...updates, updatedAt: new Date() };
        this.saveToLocalStorage(blueprintId, merged);
      }

      // Try to update Firebase
      if (this.connectionStatus === 'online') {
        const docRef = doc(db, 'blueprints', blueprintId);
        await updateDoc(docRef, updatesWithTimestamp);
        console.log(`✅ Blueprint ${blueprintId} updated in Firebase`);
        return true;
      } else {
        // Queue the update
        const existing = this.syncQueue.get(blueprintId) || {};
        this.syncQueue.set(blueprintId, { ...existing, ...updatesWithTimestamp });
        console.log(`📋 Blueprint ${blueprintId} update queued for sync`);
        return false;
      }
    } catch (error) {
      console.error(`Error updating blueprint (attempt ${attempt}):`, error);

      // Retry logic
      if (attempt < RETRY_ATTEMPTS) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        setTimeout(() => {
          this.updateBlueprint(blueprintId, updates, attempt + 1);
        }, delay);
      }
      
      return false;
    }
  }

  /**
   * Process sync queue when connection is restored
   */
  private async processSyncQueue() {
    if (this.syncQueue.size === 0) {return;}

    console.log(`📤 Processing sync queue (${this.syncQueue.size} items)`);

    for (const [blueprintId, data] of this.syncQueue.entries()) {
      try {
        const docRef = doc(db, 'blueprints', blueprintId);
        await setDoc(docRef, data, { merge: true });
        console.log(`✅ Synced blueprint ${blueprintId}`);
        this.syncQueue.delete(blueprintId);
      } catch (error) {
        console.error(`Failed to sync blueprint ${blueprintId}:`, error);
        // Keep in queue for next sync attempt
      }
    }
  }

  /**
   * Save to localStorage
   */
  private saveToLocalStorage(blueprintId: string, data: BlueprintData) {
    try {
      const prepared = prepareBlueprintForLocalStorage(data);
      const key = `${STORAGE_KEY_PREFIX}${blueprintId}`;
      localStorage.setItem(key, JSON.stringify(prepared));
      console.log(`💾 Blueprint ${blueprintId} saved to localStorage`);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get from localStorage
   */
  private getFromLocalStorage(blueprintId: string): BlueprintData | null {
    try {
      const key = `${STORAGE_KEY_PREFIX}${blueprintId}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert ISO strings back to Dates
        if (parsed.createdAt) {
          parsed.createdAt = new Date(parsed.createdAt);
        }
        if (parsed.updatedAt) {
          parsed.updatedAt = new Date(parsed.updatedAt);
        }
        return parsed;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return null;
  }

  /**
   * Subscribe to blueprint changes
   */
  subscribeToBlueprint(
    blueprintId: string, 
    onUpdate: (data: BlueprintData | null) => void
  ): () => void {
    // First, try to load from localStorage
    const localData = this.getFromLocalStorage(blueprintId);
    if (localData) {
      onUpdate(localData);
    }

    // Then subscribe to Firebase updates
    const docRef = doc(db, 'blueprints', blueprintId);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() } as BlueprintData;
          const validated = validateBlueprintData(data);
          
          // Update localStorage with latest Firebase data
          this.saveToLocalStorage(blueprintId, validated);
          
          onUpdate(validated);
        } else {
          // Document doesn't exist in Firebase, check localStorage
          const localData = this.getFromLocalStorage(blueprintId);
          onUpdate(localData);
        }
      },
      (error) => {
        console.error('Error in blueprint subscription:', error);
        // Fall back to localStorage on error
        const localData = this.getFromLocalStorage(blueprintId);
        onUpdate(localData);
      }
    );

    return unsubscribe;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'online' | 'offline' | 'connecting' {
    return this.connectionStatus;
  }

  /**
   * Get sync queue size
   */
  getSyncQueueSize(): number {
    return this.syncQueue.size;
  }

  /**
   * Manually trigger sync
   */
  async manualSync(): Promise<void> {
    if (this.connectionStatus === 'online') {
      await this.processSyncQueue();
    } else {
      console.warn('Cannot sync while offline');
    }
  }
}

// Export singleton instance
export const firebaseSync = FirebaseSync.getInstance();