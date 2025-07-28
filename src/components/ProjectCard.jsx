// src/components/ProjectCard.jsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import ProgressIndicator from './ProgressIndicator.jsx';

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

export default function ProjectCard({ project }) { 
  const { navigateTo, deleteProject } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProject = () => {
    if (!project || !project.id) {return;}
    // Navigate directly to the chat view with React Router
    window.location.href = `/app/blueprint/${project.id}/chat`;
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
  const title = project.wizardData?.subject 
    ? `${project.wizardData.subject} Blueprint` 
    : 'Learning Blueprint';
  
  const description = project.wizardData 
    ? `${project.wizardData.ageGroup || 'Students'} • ${project.wizardData.scope || 'unit'} project`
    : 'Educational experience design';

  // Get current stage from FSM state or journey data
  const currentStage = project.currentState || project.fsmState || 'IDEATION_INITIATOR';
  const isCompleted = currentStage === 'COMPLETE' || currentStage === 'PUBLISH';
  const buttonText = isCompleted ? "View Blueprint" : "Continue Project";

  // Format timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) {return '';}
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div 
        className="soft-card p-6 soft-rounded-lg hover:shadow-soft-xl hover:lift soft-transition flex flex-col justify-between h-full cursor-pointer"
        onClick={handleOpenProject}
      >
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 truncate" title={title}>
            {title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 h-10 overflow-hidden">
            {description}
          </p>
        </div>
        
        <div className="mt-4 space-y-3">
          {/* Timestamps */}
          <div className="text-xs text-slate-400 dark:text-slate-500">
            <div>Created: {formatDate(project.createdAt)}</div>
            <div>Updated: {formatDate(project.updatedAt)}</div>
          </div>
          
          <div className="flex justify-center">
            <ProgressIndicator currentStage={currentStage} />
          </div>
          
          <div className="flex items-center justify-between border-t pt-3">
            <button
                onClick={handleDeleteClick}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                aria-label="Delete project"
            >
                <TrashIcon />
            </button>
            <button onClick={handleOpenProject} className="text-blue-600 hover:text-blue-800 font-semibold text-sm whitespace-nowrap">
              {buttonText} &rarr;
            </button>
          </div>
        </div>
      </div>

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
