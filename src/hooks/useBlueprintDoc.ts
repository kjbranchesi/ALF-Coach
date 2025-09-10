import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, collection, addDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/firebase';
// Type-only import to avoid pulling in the entire schema
type WizardData = any; // Will be properly typed when actually used
import { firestoreOperationWithRetry, createLocalStorageFallback } from '../utils/firestoreWithRetry';
import { auth } from '../firebase/firebase';
import { connectionStatus } from '../services/ConnectionStatusService';
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

function getFromLocalStorage(blueprintId: string): BlueprintDoc | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${blueprintId}`;
    console.log('Attempting to read from localStorage with key:', key);
    const stored = localStorage.getItem(key);
    if (stored) {
      console.log('Found data in localStorage for blueprint:', blueprintId);
      const data = JSON.parse(stored);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        journeyData: transformLegacyJourney(data.journey || data.journeyData)
      };
    }
    console.log('No data found in localStorage for blueprint:', blueprintId);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return null;
}

function saveToLocalStorage(blueprintId: string, data: BlueprintDoc): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${blueprintId}`, JSON.stringify({
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString()
    }));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
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
        // Check if user is authenticated (including anonymous users)
        const currentUser = auth.currentUser;
        const isAuthenticated = !!currentUser;
        const isAnonymous = currentUser?.isAnonymous || false;
        
        // Anonymous users can use Firebase with special userId, only fall back to localStorage for truly unauthenticated users
        if (!isAuthenticated) {
          // Only try localStorage for completely unauthenticated users
          const localData = getFromLocalStorage(blueprintId);
          if (localData) {
            setBlueprint(localData);
            setLoading(false);
            return;
          }
        }
        
        // Try Firestore with retry logic
        const docRef = doc(db, 'blueprints', blueprintId);
        
        // Set up real-time listener
        unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
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
                journeyData: transformLegacyJourney(data.journey || data.journeyData) // Computed property
              };
              setBlueprint(blueprintData);
              // Save to localStorage as backup
              saveToLocalStorage(blueprintId, blueprintData);
              // Report successful Firebase operation
              connectionStatus.reportFirebaseSuccess();
            } else {
              // Try localStorage fallback
              const localData = getFromLocalStorage(blueprintId);
              if (localData) {
                setBlueprint(localData);
              } else {
                setError(new Error('Blueprint not found'));
              }
            }
            setLoading(false);
          },
          (err) => {
            // Report Firebase error to connection status
            connectionStatus.reportFirebaseError(err as Error);
            
            // Only log non-permission errors
            if (err.code !== 'permission-denied') {
              console.warn('Firestore listener error:', err);
            }
            // Silently fallback to localStorage if Firestore fails
            const localData = getFromLocalStorage(blueprintId);
            if (localData) {
              setBlueprint(localData);
              setError(null);
            } else {
              // Only set error if no localStorage fallback and it's not a permission error
              if (err.code !== 'permission-denied') {
                setError(err as Error);
              }
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Error setting up blueprint listener:', err);
        // Try localStorage as last resort
        const localData = getFromLocalStorage(blueprintId);
        if (localData) {
          setBlueprint(localData);
          setError(null);
        } else {
          setError(err as Error);
        }
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