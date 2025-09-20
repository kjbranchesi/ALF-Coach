import React from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db, isOfflineMode } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Wizard } from './Wizard';
import { type WizardData } from './wizardSchema';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { v4 as uuidv4 } from 'uuid';

interface WizardWrapperProps {
  onComplete: (blueprintId: string) => void;
  onCancel: () => void;
}

const STORAGE_KEY_PREFIX = 'blueprint_';

export function WizardWrapper({ onComplete, onCancel }: WizardWrapperProps) {
  const { userId } = useAuth();

  const handleWizardComplete = async (wizardData: WizardData) => {
    console.log('Wizard completed with data:', wizardData);

    try {
      // Basic validation
      const requiredFields = ['subject', 'ageGroup'];
      const missingFields = requiredFields.filter(field => !wizardData[field as keyof WizardData]);
      if (missingFields.length > 0) {
        console.warn('Missing required wizard fields:', missingFields);
      }

      // Use unified storage manager for reliable persistence
      const projectData = {
        title: wizardData.vision || 'New Project',
        userId: userId || 'anonymous',
        wizardData: wizardData,
        stage: 'wizard_complete',
        source: 'wizard' as const,
        // Legacy compatibility
        ideation: {
          bigIdea: '',
          essentialQuestion: '',
          challenge: ''
        },
        journey: {
          phases: [],
          activities: [],
          resources: []
        },
        deliverables: {
          milestones: [],
          rubric: { criteria: [] },
          impact: { audience: '', method: '' }
        },
        chatHistory: []
      };

      // Save with unified storage manager - handles all fallbacks and compatibility
      const blueprintId = await unifiedStorage.saveProject(projectData);

      console.log('✅ Project saved with unified storage, ID:', blueprintId);

      // Navigate to the chat
      onComplete(blueprintId);
    } catch (error) {
      console.error('Error creating blueprint:', error);

      // Even if unified storage fails, try basic localStorage fallback
      try {
        const fallbackId = uuidv4();
        const fallbackData = {
          id: fallbackId,
          userId: userId || 'anonymous',
          wizardData: wizardData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          chatHistory: []
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${fallbackId}`, JSON.stringify(fallbackData));
        console.log('🔄 Fallback save successful:', fallbackId);
        onComplete(fallbackId);
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError);
        alert(`Error creating blueprint: ${error.message || 'Unknown error'}. Please check your browser storage settings and try again.`);
      }
    }
  };

  return (
    <Wizard 
      onComplete={handleWizardComplete}
      onCancel={onCancel}
    />
  );
}