// src/components/ProgressIndicator.jsx

import React from 'react';

// A simple checkmark icon for completed stages
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// A single stage "pill" in the indicator
const Stage = ({ number, text, status }) => {
  // Define styles for each status to provide clear visual cues
  const statusStyles = {
    completed: 'bg-green-100 text-green-800',
    current: 'bg-purple-100 text-purple-800 font-bold',
    upcoming: 'bg-slate-100 text-slate-500',
  };

  const iconStyles = {
    completed: 'bg-green-500 text-white',
    current: 'bg-purple-600 text-white',
    upcoming: 'bg-slate-300 text-slate-600',
  };

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs transition-all duration-300 ${statusStyles[status]}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${iconStyles[status]}`}>
        {status === 'completed' ? <CheckIcon /> : number}
      </div>
      <span className="hidden sm:inline">{text}</span>
    </div>
  );
};

/**
 * A component to visually display the user's progress through the project stages.
 * @param {string} currentStage - The current stage of the project (e.g., 'Ideation', 'Curriculum').
 */
export default function ProgressIndicator({ currentStage }) {
  const stages = ['Ideation', 'Curriculum', 'Assignments'];
  const currentIndex = stages.indexOf(currentStage);

  // Determines the status of a stage based on the current project stage
  const getStatus = (index) => {
    // If the project is done, all stages are complete
    if (currentStage === 'Completed' || currentStage === 'Summary') {
        return 'completed';
    }
    // Stages before the current one are completed
    if (index < currentIndex) return 'completed';
    // The stage at the current index is the current one
    if (index === currentIndex) return 'current';
    // All other stages are upcoming
    return 'upcoming';
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {stages.map((stage, index) => (
        <Stage key={stage} number={index + 1} text={stage} status={getStatus(index)} />
      ))}
    </div>
  );
}
