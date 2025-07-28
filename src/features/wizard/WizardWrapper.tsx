import React from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db, isOfflineMode } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Wizard } from './Wizard';
import { type WizardData } from './wizardSchema';
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
      // Create blueprint document
      const blueprintData = {
        userId: userId || 'anonymous',
        wizardData,
        createdAt: new Date(),
        updatedAt: new Date(),
        chatHistory: []
      };

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

      // Skip project document creation in offline mode
      if (!isOfflineMode && db.type === 'firestore') {
        try {
          const projectData = {
            userId: userId || 'anonymous',
            blueprintId,
            projectName: `${wizardData.subject} ${wizardData.scope}`,
            createdAt: new Date(),
            lastUpdated: new Date(),
            status: 'active',
            wizardData: {
              motivation: wizardData.motivation,
              subject: wizardData.subject,
              ageGroup: wizardData.ageGroup,
              location: wizardData.location || '',
              materials: wizardData.materials || '',
              scope: wizardData.scope
            }
          };
          
          await addDoc(collection(db, 'projects'), projectData);
        } catch (error) {
          // Continue anyway - blueprint is more important
          console.debug('Project document creation skipped:', error.message);
        }
      }
      
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