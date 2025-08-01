/**
 * FirebaseService.ts - Clean Firebase integration for ALF Coach
 * Handles blueprint persistence with proper error handling
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, isOfflineMode } from '../../firebase/firebase';
import { BlueprintDoc } from '../types/SOPTypes';

export class FirebaseService {
  private readonly collectionName = 'blueprints';
  
  /**
   * Save a blueprint to Firebase
   */
  async saveBlueprint(blueprintId: string, blueprint: BlueprintDoc): Promise<void> {
    if (isOfflineMode) {
      // Fallback to localStorage
      localStorage.setItem(`blueprint_${blueprintId}`, JSON.stringify(blueprint));
      console.log('Blueprint saved to localStorage (offline mode)');
      return;
    }

    try {
      const docRef = doc(collection(db, this.collectionName), blueprintId);
      
      // Convert dates to Firestore timestamps
      const firestoreData = {
        ...blueprint,
        timestamps: {
          created: blueprint.timestamps.created instanceof Date 
            ? Timestamp.fromDate(blueprint.timestamps.created)
            : blueprint.timestamps.created,
          updated: serverTimestamp()
        }
      };
      
      await setDoc(docRef, firestoreData);
      console.log('Blueprint saved to Firebase:', blueprintId);
    } catch (error) {
      console.error('Error saving blueprint:', error);
      // Fallback to localStorage
      localStorage.setItem(`blueprint_${blueprintId}`, JSON.stringify(blueprint));
      throw error;
    }
  }

  /**
   * Load a blueprint from Firebase
   */
  async loadBlueprint(blueprintId: string): Promise<BlueprintDoc | null> {
    if (isOfflineMode) {
      // Load from localStorage
      const localData = localStorage.getItem(`blueprint_${blueprintId}`);
      if (localData) {
        const blueprint = JSON.parse(localData);
        // Convert string dates back to Date objects
        blueprint.timestamps.created = new Date(blueprint.timestamps.created);
        blueprint.timestamps.updated = new Date(blueprint.timestamps.updated);
        return blueprint;
      }
      return null;
    }

    try {
      const docRef = doc(collection(db, this.collectionName), blueprintId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Convert Firestore timestamps to Dates
        const blueprint: BlueprintDoc = {
          ...data,
          id: blueprintId,
          timestamps: {
            created: data.timestamps.created?.toDate() || new Date(),
            updated: data.timestamps.updated?.toDate() || new Date()
          }
        } as BlueprintDoc;
        
        return blueprint;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading blueprint:', error);
      // Try localStorage as fallback
      const localData = localStorage.getItem(`blueprint_${blueprintId}`);
      if (localData) {
        const blueprint = JSON.parse(localData);
        blueprint.timestamps.created = new Date(blueprint.timestamps.created);
        blueprint.timestamps.updated = new Date(blueprint.timestamps.updated);
        return blueprint;
      }
      throw error;
    }
  }

  /**
   * Update a blueprint in Firebase
   */
  async updateBlueprint(blueprintId: string, updates: Partial<BlueprintDoc>): Promise<void> {
    if (isOfflineMode) {
      // Update in localStorage
      const existing = localStorage.getItem(`blueprint_${blueprintId}`);
      if (existing) {
        const blueprint = JSON.parse(existing);
        const updated = { ...blueprint, ...updates };
        localStorage.setItem(`blueprint_${blueprintId}`, JSON.stringify(updated));
      }
      return;
    }

    try {
      const docRef = doc(collection(db, this.collectionName), blueprintId);
      
      await updateDoc(docRef, {
        ...updates,
        'timestamps.updated': serverTimestamp()
      });
      
      console.log('Blueprint updated:', blueprintId);
    } catch (error) {
      console.error('Error updating blueprint:', error);
      throw error;
    }
  }

  /**
   * Generate a new blueprint ID
   */
  generateBlueprintId(): string {
    // More secure ID generation with crypto API
    const timestamp = Date.now().toString(36);
    const randomArray = new Uint8Array(16);
    crypto.getRandomValues(randomArray);
    const randomStr = Array.from(randomArray, byte => byte.toString(36)).join('').substr(0, 12);
    return `bp_${timestamp}_${randomStr}`;
  }

  /**
   * Auto-save helper - saves with debouncing
   */
  private saveTimeout: NodeJS.Timeout | null = null;
  
  autoSave(blueprintId: string, blueprint: BlueprintDoc, delayMs: number = 2000): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveBlueprint(blueprintId, blueprint).catch(error => {
        console.error('Auto-save failed:', error);
      });
    }, delayMs);
  }
  
  /**
   * Cleanup method to prevent memory leaks
   */
  destroy(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();