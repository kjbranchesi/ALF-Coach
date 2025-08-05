// BlueprintBuilderStandalone.jsx - Standalone version that creates project from scratch

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import BlueprintBuilder from './BlueprintBuilder';
import { PROJECT_STAGES } from '../../config/constants';

const BlueprintBuilderStandalone = ({ onComplete, onCancel }) => {
  const { createNewBlueprint, selectedProjectId } = useAppContext();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [tempProjectId, setTempProjectId] = useState(null);

  // Handle blueprint completion
  const handleBlueprintComplete = async (blueprintData) => {
    try {
      // Extract onboarding data from blueprint
      const projectData = {
        subject: blueprintData.subject || 'Project',
        ageGroup: blueprintData.ageGroup || 'Students',
        location: blueprintData.location || '',
        educatorPerspective: blueprintData.motivation || '',
        initialMaterials: blueprintData.materials?.join(', ') || '',
        projectScope: blueprintData.scope || 'Unit',
        ideation: {
          bigIdea: blueprintData.bigIdea,
          essentialQuestion: blueprintData.essentialQuestion,
          challenge: blueprintData.challenge
        }
      };

      // Create the project with all collected data
      if (!selectedProjectId && !tempProjectId) {
        setIsCreatingProject(true);
        const newProjectId = await createNewBlueprint(projectData);
        setTempProjectId(newProjectId);
        
        // Pass complete data to parent
        if (onComplete) {
          onComplete({
            projectId: newProjectId,
            ...blueprintData
          });
        }
      } else {
        // Update existing project
        if (onComplete) {
          onComplete({
            projectId: selectedProjectId || tempProjectId,
            ...blueprintData
          });
        }
      }
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="relative">
      {isCreatingProject && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Creating your project...</p>
          </div>
        </div>
      )}
      
      <BlueprintBuilder 
        onComplete={handleBlueprintComplete}
        onCancel={onCancel}
      />
    </div>
  );
};

export default BlueprintBuilderStandalone;