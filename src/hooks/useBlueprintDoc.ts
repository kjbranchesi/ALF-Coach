import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, collection, addDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/firebase';
// Type-only import to avoid pulling in the entire schema
type WizardData = any; // Will be properly typed when actually used
import { firestoreOperationWithRetry, createLocalStorageFallback } from '../utils/firestoreWithRetry';
import { auth } from '../firebase/firebase';
import { connectionStatus } from '../services/ConnectionStatusService';
import { unifiedStorage, type UnifiedProjectData } from '../services/UnifiedStorageManager';
import {
  type EnhancedBlueprintDoc,
  type ChatMessage,
  type JourneyData,
  transformLegacyJourney,
  getJourneyData
} from '../types/blueprint';

// Alias for backward compatibility
interface BlueprintDoc extends EnhancedBlueprintDoc {
  createdAt: Date;
  updatedAt: Date;
  journeyData?: JourneyData; // Computed property that maps to journey
}

interface UseBlueprintDocReturn {
  blueprint: BlueprintDoc | null;
  loading: boolean;
  error: Error | null;
  updateBlueprint: (updates: Partial<BlueprintDoc>) => Promise<void>;
  addMessage: (message: ChatMessage) => Promise<void>;
}

// LocalStorage fallback
const STORAGE_KEY_PREFIX = 'blueprint_';

function convertUnifiedToBlueprint(unified: UnifiedProjectData): BlueprintDoc {
  return {
    id: unified.id,
    wizardData: unified.wizardData,
    createdAt: unified.createdAt,
    updatedAt: unified.updatedAt,
    userId: unified.userId,
    chatHistory: unified.chatHistory || [],
    journey: unified.journey,
    ideation: unified.ideation,
    deliverables: unified.deliverables,
    journeyData: transformLegacyJourney(unified.journey || unified.capturedData),
    capturedData: unified.capturedData,
    projectData: unified.projectData
  };
}

function convertBlueprintToUnified(blueprint: BlueprintDoc): UnifiedProjectData {
  return {
    id: blueprint.id,
    title: blueprint.wizardData?.projectTopic || blueprint.wizardData?.vision || 'Untitled Project',
    userId: blueprint.userId,
    createdAt: blueprint.createdAt,
    updatedAt: blueprint.updatedAt,
    wizardData: blueprint.wizardData,
    projectData: (blueprint as any).projectData,
    capturedData: (blueprint as any).capturedData,
    ideation: blueprint.ideation,
    journey: blueprint.journey,
    deliverables: blueprint.deliverables,
    chatHistory: blueprint.chatHistory,
    version: '3.0',
    syncStatus: 'local'
  };
}

function getFromLocalStorage(blueprintId: string): BlueprintDoc | null {
  try {
    // Try unified storage first
    console.log('Attempting to load from unified storage:', blueprintId);
    return null; // Will be handled by the main fetchBlueprint logic
  } catch (error) {
    console.error('Error reading from unified storage:', error);
    return null;
  }
}

function saveToLocalStorage(blueprintId: string, data: BlueprintDoc): void {
  try {
    // Convert to unified format and save
    const unifiedData = convertBlueprintToUnified(data);
    unifiedStorage.saveProject(unifiedData);
  } catch (error) {
    console.error('Error saving to unified storage:', error);
    // Fallback to old format
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${blueprintId}`, JSON.stringify({
        ...data,
        createdAt: data.createdAt.toISOString(),
        updatedAt: data.updatedAt.toISOString()
      }));
    } catch (fallbackError) {
      console.error('Fallback save also failed:', fallbackError);
    }
  }
}

export function useBlueprintDoc(blueprintId: string): UseBlueprintDocReturn {
  const [blueprint, setBlueprint] = useState<BlueprintDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!blueprintId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    async function fetchBlueprint() {
      try {
        console.log(`[useBlueprintDoc] Loading blueprint: ${blueprintId}`);

        // Try unified storage first (handles all fallbacks internally)
        try {
          const unifiedData = await unifiedStorage.loadProject(blueprintId);
          if (unifiedData) {
            const blueprintData = convertUnifiedToBlueprint(unifiedData);
            setBlueprint(blueprintData);
            setLoading(false);
            console.log(`[useBlueprintDoc] Blueprint loaded from unified storage: ${blueprintId}`);
            return;
          }
        } catch (unifiedError) {
          console.warn(`[useBlueprintDoc] Unified storage failed: ${unifiedError.message}`);
        }

        // Check if user is authenticated (including anonymous users)
        const currentUser = auth.currentUser;
        const isAuthenticated = !!currentUser;

        // If not authenticated, we can only use local storage
        if (!isAuthenticated) {
          console.log(`[useBlueprintDoc] No authentication, checking legacy localStorage: ${blueprintId}`);
          // Try legacy localStorage formats
          const legacyKey = `blueprint_${blueprintId}`;
          const legacyData = localStorage.getItem(legacyKey);
          if (legacyData) {
            try {
              const parsed = JSON.parse(legacyData);
              const blueprintData: BlueprintDoc = {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
                updatedAt: new Date(parsed.updatedAt),
                journeyData: transformLegacyJourney(parsed.journey || parsed.journeyData)
              };
              setBlueprint(blueprintData);
              // Migrate to unified storage
              const unifiedData = convertBlueprintToUnified(blueprintData);
              await unifiedStorage.saveProject(unifiedData);
              console.log(`[useBlueprintDoc] Legacy data migrated to unified storage: ${blueprintId}`);
            } catch (parseError) {
              console.error(`[useBlueprintDoc] Failed to parse legacy data: ${parseError.message}`);
            }
          }
          setLoading(false);
          return;
        }

        // Try Firestore with retry logic for authenticated users
        console.log(`[useBlueprintDoc] Trying Firebase for authenticated user: ${blueprintId}`);
        const docRef = doc(db, 'blueprints', blueprintId);

        // Set up real-time listener
        unsubscribe = onSnapshot(
          docRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const blueprintData: BlueprintDoc = {
                id: snapshot.id,
                wizardData: data.wizardData,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
                userId: data.userId || '',
                chatHistory: data.chatHistory || [],
                journey: data.journey,
                ideation: data.ideation,
                deliverables: data.deliverables,
                journeyData: transformLegacyJourney(data.journey || data.journeyData),
                capturedData: data.capturedData,
                projectData: data.projectData
              };
              setBlueprint(blueprintData);

              // Save to unified storage as backup
              const unifiedData = convertBlueprintToUnified(blueprintData);
              await unifiedStorage.saveProject(unifiedData);

              // Report successful Firebase operation
              connectionStatus.reportFirebaseSuccess();
              console.log(`[useBlueprintDoc] Blueprint loaded from Firebase: ${blueprintId}`);
            } else {
              console.warn(`[useBlueprintDoc] Blueprint not found in Firebase: ${blueprintId}`);
              // Try unified storage fallback again
              const unifiedData = await unifiedStorage.loadProject(blueprintId);
              if (unifiedData) {
                const blueprintData = convertUnifiedToBlueprint(unifiedData);
                setBlueprint(blueprintData);
                console.log(`[useBlueprintDoc] Blueprint found in unified storage fallback: ${blueprintId}`);
              } else {
                setBlueprint(null);
                setError(null);
              }
            }
            setLoading(false);
          },
          async (err) => {
            console.warn(`[useBlueprintDoc] Firebase error: ${err.message}`);
            // Report Firebase error to connection status
            connectionStatus.reportFirebaseError(err as Error);

            // Try unified storage fallback
            try {
              const unifiedData = await unifiedStorage.loadProject(blueprintId);
              if (unifiedData) {
                const blueprintData = convertUnifiedToBlueprint(unifiedData);
                setBlueprint(blueprintData);
                setError(null);
                console.log(`[useBlueprintDoc] Blueprint recovered from unified storage after Firebase error: ${blueprintId}`);
              } else {
                // Only set error if no fallback and it's not a permission error
                if (err.code !== 'permission-denied') {
                  setError(err as Error);
                }
              }
            } catch (fallbackError) {
              console.error(`[useBlueprintDoc] All fallbacks failed: ${fallbackError.message}`);
              if (err.code !== 'permission-denied') {
                setError(err as Error);
              }
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error(`[useBlueprintDoc] Setup failed: ${err.message}`);
        setError(err as Error);
        setLoading(false);
      }
    }

    fetchBlueprint();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [blueprintId]);

  const updateBlueprint = async (updates: Partial<BlueprintDoc> | BlueprintDoc) => {
    // Allow setting a new blueprint if none exists
    if (!blueprint && updates && 'id' in updates) {
      const newBlueprint = updates as BlueprintDoc;
      setBlueprint(newBlueprint);
      // Save to localStorage for persistence
      saveToLocalStorage(blueprintId, newBlueprint);
      setLoading(false);
      return;
    }
    
    // Defensive check - if no blueprint and updates don't contain id, create minimal blueprint
    if (!blueprint) {
      console.warn('updateBlueprint called with no existing blueprint and incomplete data');
      if (updates && typeof updates === 'object') {
        // Create minimal blueprint structure
        const minimalBlueprint: BlueprintDoc = {
          id: blueprintId,
          wizardData: (updates as any).wizardData || {},
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'anonymous',
          chatHistory: []
        };
        setBlueprint(minimalBlueprint);
        saveToLocalStorage(blueprintId, minimalBlueprint);
        return;
      }
      return;
    }

    // Ensure updates is a valid object before spreading
    const safeUpdates = updates && typeof updates === 'object' ? updates : {};
    
    const updatedData = {
      ...blueprint,
      ...safeUpdates,
      updatedAt: new Date()
    };

    // Update with retry logic
    await firestoreOperationWithRetry(
      async () => {
        const currentUser = auth.currentUser;
        const userId = currentUser?.isAnonymous ? 'anonymous' : (currentUser?.uid || 'anonymous');
        
        const docRef = doc(db, 'blueprints', blueprintId);
        await setDoc(docRef, {
          ...updatedData,
          userId: userId, // Ensure anonymous users get 'anonymous' userId
          createdAt: updatedData.createdAt,
          updatedAt: updatedData.updatedAt,
          chatHistory: updatedData.chatHistory?.map(msg => ({
            ...msg,
            timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
          }))
        }, { merge: true });
        return updatedData;
      },
      {
        errorMessage: 'Failed to update blueprint',
        fallback: createLocalStorageFallback(`blueprint_${blueprintId}`, updatedData, 'set')
      }
    );
    
    // Update local state
    setBlueprint(updatedData);
  };

  const addMessage = async (message: ChatMessage) => {
    if (!blueprint) {return;}

    // Add message with retry logic
    await firestoreOperationWithRetry(
      async () => {
        const messagesRef = collection(db, 'blueprints', blueprintId, 'messages');
        await addDoc(messagesRef, {
          ...message,
          timestamp: message.timestamp
        });
        return message;
      },
      {
        errorMessage: 'Failed to add message',
        maxAttempts: 2, // Fewer retries for messages
        fallback: async () => {
          console.log('Using local-only message storage');
          return message;
        }
      }
    );

    // Always update local state and chat history
    const updatedHistory = [...(blueprint.chatHistory || []), message];
    await updateBlueprint({ chatHistory: updatedHistory });
  };

  return { blueprint, loading, error, updateBlueprint, addMessage };
}
