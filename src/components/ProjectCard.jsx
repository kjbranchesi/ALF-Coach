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

export default function ProjectCard({ project, onDelete }) { 
  const { navigateTo, deleteProject } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenProject = () => {
    if (!project || !project.id) {return;}
    // Navigate to new architecture blueprint view
    window.location.href = `/app/blueprint/${project.id}`;
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Use provided onDelete callback or fallback to context deleteProject
      if (onDelete) {
        await onDelete(project.id);
      } else {
        await deleteProject(project.id);
      }
      console.log('[ProjectCard] Successfully deleted project:', project.id);
    } catch (error) {
      console.error('[ProjectCard] Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
      setIsModalOpen(false);
    }
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
        className="h-full cursor-pointer group overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
        onClick={handleOpenProject}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header Section */}
          <div className="flex-shrink-0 mb-4">
            <Heading 
              level={3} 
              className="truncate mb-2 group-hover:text-primary-600 transition-colors" 
              title={title}
            >
              {title}
            </Heading>
            <Text 
              size="sm" 
              color="secondary" 
              className="line-clamp-2 min-h-[2.5rem]"
            >
              {description}
            </Text>
          </div>
        
          {/* Content Section - Flexible */}
          <div className="flex-grow flex flex-col justify-between min-h-0">
            {/* Timestamps */}
            <div className="mb-4">
              <Caption color="muted" className="block mb-1">
                Created: {formatDate(project.createdAt)}
              </Caption>
              <Caption color="muted" className="block">
                Updated: {formatDate(project.updatedAt)}
              </Caption>
            </div>
            
            {/* Progress Indicator - Contained */}
            <div className="mb-4 overflow-hidden">
              <ProgressIndicator currentStage={currentStage} />
            </div>
            
            {/* Footer Section */}
            <div className="flex-shrink-0">
              <Divider className="mb-4" />
              
              <div className="flex items-center justify-between">
                <IconButton
                  icon="delete"
                  label="Delete project"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="hover:text-red-600 transition-colors"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  rightIcon="forward"
                  onClick={handleOpenProject}
                  className="hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  {buttonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to permanently delete the project "${title}"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        disabled={isDeleting}
      />
    </>
  );
}
