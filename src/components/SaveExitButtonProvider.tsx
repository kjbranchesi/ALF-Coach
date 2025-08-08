/**
 * Save & Exit Button Provider
 * Provides context and state management for Save & Exit functionality
 * across different components and wizard flows
 */

import React, { createContext, useContext, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { logger } from '../utils/logger';

interface SaveExitContextType {
  isSaving: boolean;
  saveAndExit: (projectId: string, capturedData: Record<string, any>, currentStage: string) => Promise<void>;
  saveProgress: (projectId: string, capturedData: Record<string, any>, currentStage: string) => Promise<void>;
}

const SaveExitContext = createContext<SaveExitContextType | undefined>(undefined);

export const useSaveExit = () => {
  const context = useContext(SaveExitContext);
  if (!context) {
    throw new Error('useSaveExit must be used within a SaveExitProvider');
  }
  return context;
};

interface SaveExitProviderProps {
  children: React.ReactNode;
}

export const SaveExitProvider: React.FC<SaveExitProviderProps> = ({ children }) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const saveProgress = async (
    projectId: string, 
    capturedData: Record<string, any>, 
    currentStage: string
  ): Promise<void> => {
    if (!projectId) return;

    try {
      const docRef = doc(db, "projects", projectId);
      await updateDoc(docRef, {
        ...capturedData,
        lastSaved: serverTimestamp(),
        stage: currentStage
      });
      
      logger.info('Progress saved successfully');
    } catch (error) {
      logger.error('Failed to save progress:', error);
      throw error;
    }
  };

  const saveAndExit = async (
    projectId: string, 
    capturedData: Record<string, any>, 
    currentStage: string
  ): Promise<void> => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      await saveProgress(projectId, capturedData, currentStage);
      
      // Add a slight delay for UX feedback
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 600);
      
    } catch (error) {
      logger.error('Save and exit failed:', error);
      // Still navigate on error since autosave likely has the data
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 300);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 1000);
    }
  };

  const value: SaveExitContextType = {
    isSaving,
    saveAndExit,
    saveProgress
  };

  return (
    <SaveExitContext.Provider value={value}>
      {children}
    </SaveExitContext.Provider>
  );
};

export default SaveExitProvider;