import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc, updateDoc, collection, addDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { type WizardData } from '../features/wizard/wizardSchema';
import { firestoreOperationWithRetry, createLocalStorageFallback } from '../utils/firestoreWithRetry';
import { auth } from '../firebase/firebase';
import { BlueprintDoc, ChatMessage } from '../core/types/SOPTypes';

// Note: The BlueprintDoc from SOPTypes has a different structure than what was here before.
// It uses 'wizard' instead of 'wizardData' and has different timestamp fields.
// This hook may need updates to work with the standardized type.

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
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${blueprintId}`);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
    }
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
        // Check if user is authenticated first
        const currentUser = auth.currentUser;
        const isAuthenticated = !!currentUser;
        
        if (!isAuthenticated) {
          // Try localStorage for unauthenticated users
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
                chatHistory: data.chatHistory || []
              };
              setBlueprint(blueprintData);
              // Save to localStorage as backup
              saveToLocalStorage(blueprintId, blueprintData);
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

  const updateBlueprint = async (updates: Partial<BlueprintDoc>) => {
    if (!blueprint) {return;}

    const updatedData = {
      ...blueprint,
      ...updates,
      updatedAt: new Date()
    };

    // Update with retry logic
    await firestoreOperationWithRetry(
      async () => {
        const docRef = doc(db, 'blueprints', blueprintId);
        await setDoc(docRef, {
          ...updatedData,
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