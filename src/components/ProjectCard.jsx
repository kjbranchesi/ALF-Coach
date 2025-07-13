// src/components/ProjectCard.jsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import ProgressIndicator from './ProgressIndicator.jsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// This component displays a single project on the dashboard.
// It now uses the toast notification system to provide feedback on successful deletion.

export default function ProjectCard({ project }) { 
  const { navigateTo, deleteProject } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProject = () => {
    if (!project || !project.id) return;
    navigateTo('workspace', project.id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent the card's onClick from firing
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProject(project.id);
      toast.success(`Blueprint "${project.title}" was deleted.`);
    } catch (error) {
      toast.error("Failed to delete the blueprint.");
      console.error("Deletion error:", error);
    } finally {
      setIsModalOpen(false);
    }
  };

  const buttonText = project.stage === 'Completed' ? "View Syllabus" : "Continue Blueprint";

  return (
    <>
      <Card 
        className="flex flex-col justify-between h-full cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
        onClick={handleOpenProject}
      >
        <CardHeader>
          <CardTitle className="truncate" title={project.title}>
            {project.title}
          </CardTitle>
          <CardDescription className="h-10 overflow-hidden">
            {project.coreIdea || `An exploration of ${project.subject}.`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
            <ProgressIndicator currentStage={project.stage} />
        </CardContent>

        <CardFooter className="flex justify-between items-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="text-neutral-400 hover:text-destructive hover:bg-red-50"
                aria-label="Delete project"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="link" onClick={handleOpenProject} className="font-semibold">
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blueprint"
        message={`Are you sure you want to permanently delete the blueprint "${project.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
}
