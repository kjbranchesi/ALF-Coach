// src/components/ProjectCard.jsx

import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export default function ProjectCard({ project }) {
  const { navigateTo } = useAppContext();

  const stageColorMap = {
    Ideation: 'bg-blue-100 text-blue-800',
    Curriculum: 'bg-yellow-100 text-yellow-800',
    Assignments: 'bg-green-100 text-green-800',
  };

  const handleOpenProject = () => {
    // Determine which view to navigate to based on the project's stage
    if (project.stage === 'Ideation') {
      navigateTo('ideation', project.id);
    } else if (project.stage === 'Curriculum') {
      navigateTo('curriculum', project.id);
    } else { // 'Assignments' or other stages
      navigateTo('assignment', project.id);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{project.title}</h3>
        <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden">
          {project.coreIdea}
        </p>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stageColorMap[project.stage] || 'bg-gray-100'}`}>
          {project.stage}
        </span>
        <button onClick={handleOpenProject} className="text-purple-600 hover:text-purple-800 font-semibold text-sm">
          Open
        </button>
      </div>
    </div>
  );
}
