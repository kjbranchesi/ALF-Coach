import { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, setDoc, DocumentData } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { WizardData } from '../features/wizard/wizardSchema';

interface BlueprintDoc {
  id: string;
  wizardData: WizardData;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  chatHistory?: any[];
}

interface UseBlueprintDocReturn {
  blueprint: BlueprintDoc | null;
  loading: boolean;
  error: Error | null;
  updateBlueprint: (updates: Partial<BlueprintDoc>) => Promise<void>;
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
        // Try Firestore first
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
            console.error('Firestore error, falling back to localStorage:', err);
            // Fallback to localStorage
            const localData = getFromLocalStorage(blueprintId);
            if (localData) {
              setBlueprint(localData);
              setError(null);
            } else {
              setError(err as Error);
            }
            setLoading(false);
          }
        );
      } catch (err) {
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

  const updateBlueprint = async (updates: Partial<BlueprintDoc>) => {
    if (!blueprint) return;

    const updatedData = {
      ...blueprint,
      ...updates,
      updatedAt: new Date()
    };

    try {
      // Try to update Firestore
      const docRef = doc(db, 'blueprints', blueprintId);
      await setDoc(docRef, updatedData, { merge: true });
    } catch (error) {
      console.error('Error updating Firestore, saving to localStorage:', error);
      // Fallback to localStorage
      saveToLocalStorage(blueprintId, updatedData);
      setBlueprint(updatedData);
    }
  };

  return { blueprint, loading, error, updateBlueprint };
}