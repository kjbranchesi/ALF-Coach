import React from 'react';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Wizard } from './Wizard';
import { WizardData } from './wizardSchema';
import { v4 as uuidv4 } from 'uuid';

interface WizardWrapperProps {
  onComplete: (blueprintId: string) => void;
  onCancel: () => void;
}

const STORAGE_KEY_PREFIX = 'blueprint_';

export function WizardWrapper({ onComplete, onCancel }: WizardWrapperProps) {
  const { userId } = useAuth();

  const handleWizardComplete = async (wizardData: WizardData) => {
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

      try {
        // Try to save to Firestore
        const docRef = await addDoc(collection(db, 'blueprints'), blueprintData);
        blueprintId = docRef.id;
      } catch (firestoreError) {
        // Silently fallback to localStorage with UUID
        blueprintId = uuidv4();
        const storageData = {
          ...blueprintData,
          id: blueprintId,
          createdAt: blueprintData.createdAt.toISOString(),
          updatedAt: blueprintData.updatedAt.toISOString()
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${blueprintId}`, JSON.stringify(storageData));
      }

      // Also create a project document for backward compatibility
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
      }
      
      // Navigate to the chat
      onComplete(blueprintId);
    } catch (error) {
      console.error('Error creating blueprint:', error);
      // Handle error appropriately
      alert('Error creating blueprint. Please try again.');
    }
  };

  return (
    <Wizard 
      onComplete={handleWizardComplete}
      onCancel={onCancel}
    />
  );
}