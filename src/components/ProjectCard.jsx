// src/components/ProjectCard.jsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import ProgressIndicator from './ProgressIndicator.jsx';

// Design System imports
import { 
  Card, 
  Stack, 
  Heading, 
  Text, 
  Button, 
  IconButton,
  Divider,
  Caption 
} from '../design-system';

export default function ProjectCard({ project }) { 
  const { navigateTo, deleteProject } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProject = () => {
    if (!project || !project.id) {return;}
    // Navigate to new architecture blueprint view
    window.location.href = `/app/blueprint/${project.id}`;
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteProject(project.id);
    setIsModalOpen(false);
  };

  // Extract meaningful information from project data
  // Support both old (wizardData) and new (wizard) structures
  const wizardInfo = project.wizard || project.wizardData;
  const title = wizardInfo?.subject 
    ? `${wizardInfo.subject} Blueprint` 
    : 'Learning Blueprint';
  
  const description = wizardInfo 
    ? `${wizardInfo.ageGroup || 'Students'} • ${wizardInfo.scope || 'unit'} project`
    : 'Educational experience design';

  // Get current stage from new architecture (currentStep) or old (currentState)
  const currentStep = project.currentStep || project.currentState || project.fsmState || 'IDEATION_INITIATOR';
  
  // Map new architecture steps to stages for ProgressIndicator
  const mapStepToStage = (step) => {
    if (step.startsWith('IDEATION_') || step === 'IDEATION_INITIATOR') return 'Ideation';
    if (step.startsWith('JOURNEY_') || step === 'LEARNING_JOURNEY') return 'Learning Journey';
    if (step.startsWith('DELIVERABLES_') || step === 'STUDENT_DELIVERABLES') return 'Student Deliverables';
    if (step === 'COMPLETE' || step === 'PUBLISH') return 'Completed';
    return 'Ideation'; // Default
  };
  
  const currentStage = mapStepToStage(currentStep);
  const isCompleted = currentStep === 'COMPLETE' || currentStep === 'PUBLISH';
  const buttonText = isCompleted ? "View Blueprint" : "Continue Project";

  // Format timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) {return '';}
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Card 
        hover
        className="h-full cursor-pointer"
        onClick={handleOpenProject}
      >
        <Stack spacing={4} className="h-full justify-between">
          <div>
            <Heading level={3} className="truncate mb-2" title={title}>
              {title}
            </Heading>
            <Text size="sm" color="secondary" className="line-clamp-2">
              {description}
            </Text>
          </div>
        
          <Stack spacing={3}>
            {/* Timestamps */}
            <div>
              <Caption color="muted">Created: {formatDate(project.createdAt)}</Caption>
              <Caption color="muted">Updated: {formatDate(project.updatedAt)}</Caption>
            </div>
            
            <div className="flex justify-center">
              <ProgressIndicator currentStage={currentStage} />
            </div>
            
            <Divider />
            
            <div className="flex items-center justify-between pt-2">
              <IconButton
                icon="delete"
                label="Delete project"
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="hover:text-red-600"
              />
              <Button 
                variant="ghost" 
                size="sm"
                rightIcon="forward"
                onClick={handleOpenProject}
              >
                {buttonText}
              </Button>
            </div>
          </Stack>
        </Stack>
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete the project "${title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
}
