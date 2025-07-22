import React from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Wizard } from './Wizard';
import { WizardData } from './wizardSchema';

interface WizardWrapperProps {
  onComplete: (projectId: string) => void;
  onCancel: () => void;
}

export function WizardWrapper({ onComplete, onCancel }: WizardWrapperProps) {
  const { userId } = useAuth();

  const handleWizardComplete = async (wizardData: WizardData) => {
    try {
      // Transform wizard data to project format
      const projectData = {
        userId,
        projectName: `${wizardData.subject} ${wizardData.scope}`,
        createdAt: new Date(),
        lastUpdated: new Date(),
        status: 'active',
        
        // Store wizard data
        wizardData: {
          motivation: wizardData.motivation,
          subject: wizardData.subject,
          ageGroup: wizardData.ageGroup,
          location: wizardData.location || '',
          materials: wizardData.materials || '',
          scope: wizardData.scope
        },
        
        // Initialize blueprint structure
        blueprint: {
          // Onboarding data from wizard
          motivation: wizardData.motivation,
          subject: wizardData.subject,
          ageGroup: wizardData.ageGroup,
          location: wizardData.location || '',
          materials: wizardData.materials ? wizardData.materials.split(', ') : [],
          scope: wizardData.scope,
          
          // Initialize empty fields for BlueprintBuilder to fill
          bigIdea: '',
          essentialQuestion: '',
          challenge: '',
          phases: [],
          activities: {},
          resources: [],
          milestones: [],
          rubric: {
            criteria: [],
            levels: []
          },
          impactPlan: '',
          
          // Meta
          status: 'in_progress',
          completedFields: 4, // Wizard completes 4 required fields
          totalRequiredFields: 11
        }
      };

      // Create project in Firestore
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      // Navigate to the project
      onComplete(docRef.id);
    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error appropriately
    }
  };

  return (
    <Wizard 
      onComplete={handleWizardComplete}
      onCancel={onCancel}
    />
  );
}