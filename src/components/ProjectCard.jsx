// src/components/ProjectCard.jsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import ConfirmationModal from './ConfirmationModal.jsx';
import ProgressIndicator from './ProgressIndicator.jsx'; // Import the new component

// --- Icon for the delete button ---
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);


export default function ProjectCard({ project }) {
  const { navigateTo, deleteProject } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenProject = () => {
    if (!project || !project.id) return;

    if (project.stage === 'Completed' || project.stage === 'Assignments') {
        navigateTo('summary', project.id);
    } else if (project.stage === 'Curriculum') {
        navigateTo('curriculum', project.id);
    } else { // Ideation
        navigateTo('ideation', project.id);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent the card's open action from firing
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteProject(project.id);
    setIsModalOpen(false);
  };

  const buttonText = (project.stage === 'Assignments' || project.stage === 'Completed') 
    ? "View Summary" 
    : "Continue Project";

  return (
    <>
      <div 
        className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col justify-between h-full cursor-pointer"
        onClick={handleOpenProject}
      >
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 truncate" title={project.title}>
            {project.title}
          </h3>
          <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden">
            {project.coreIdea}
          </p>
        </div>
        <div className="flex justify-between items-center mt-4">
          {/* TASK 1.8.4: Replaced the old stage pill with the new ProgressIndicator */}
          <ProgressIndicator currentStage={project.stage} />
          
          <div className="flex items-center gap-2">
            <button
                onClick={handleDeleteClick}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Delete project"
            >
                <TrashIcon />
            </button>
            <button onClick={handleOpenProject} className="text-purple-600 hover:text-purple-800 font-semibold text-sm whitespace-nowrap">
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
        message={`Are you sure you want to permanently delete the project "${project.title}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </>
  );
}
