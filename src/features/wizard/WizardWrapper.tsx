import React from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db, isOfflineMode } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Wizard } from './Wizard';
import { type WizardData } from './wizardSchema';
import { DataFlowService } from '../../services/DataFlowService';
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
      // Validate wizard data first
      const validation = DataFlowService.validateWizardData(wizardData);
      if (!validation.isValid) {
        console.warn('Missing required wizard fields:', validation.missingFields);
        // Continue anyway but log the issue
      }
      
      // Use DataFlowService to ensure proper data transformation
      const blueprintData = DataFlowService.transformWizardToBlueprint(wizardData, userId || 'anonymous');

      let blueprintId: string;

      if (isOfflineMode || db.type === 'offline') {
        // Use localStorage directly in offline mode
        blueprintId = uuidv4();
        const storageData = {
          ...blueprintData,
          id: blueprintId,
          createdAt: blueprintData.createdAt.toISOString(),
          updatedAt: blueprintData.updatedAt.toISOString()
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${blueprintId}`, JSON.stringify(storageData));
        console.log('💾 Saved to localStorage with ID:', blueprintId);
      } else {
        try {
          // Try to save to Firestore
          console.log('☁️ Saving to cloud...');
          const docRef = await addDoc(collection(db, 'blueprints'), blueprintData);
          blueprintId = docRef.id;
          console.log('✅ Saved to cloud with ID:', blueprintId);
          
          // Also save to localStorage as backup
          const storageData = {
            ...blueprintData,
            id: blueprintId,
            createdAt: blueprintData.createdAt.toISOString(),
            updatedAt: blueprintData.updatedAt.toISOString()
          };
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${blueprintId}`, JSON.stringify(storageData));
        } catch (firestoreError) {
          console.warn('⚠️ Cloud save failed, using local storage:', firestoreError.message);
          // Fallback to localStorage
          blueprintId = uuidv4();
          const storageData = {
            ...blueprintData,
            id: blueprintId,
            createdAt: blueprintData.createdAt.toISOString(),
            updatedAt: blueprintData.updatedAt.toISOString()
          };
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${blueprintId}`, JSON.stringify(storageData));
          console.log('💾 Saved to localStorage with ID:', blueprintId);
        }
      }

      // Removed duplicate save to projects collection - using blueprints collection only
      
      // Navigate to the chat
      console.log('Calling onComplete with blueprintId:', blueprintId);
      onComplete(blueprintId);
    } catch (error) {
      console.error('Error creating blueprint:', error);
      // Handle error appropriately
      alert(`Error creating blueprint: ${error.message || 'Unknown error'}. Please check the console for details.`);
    }
  };

  return (
    <Wizard 
      onComplete={handleWizardComplete}
      onCancel={onCancel}
    />
  );
}