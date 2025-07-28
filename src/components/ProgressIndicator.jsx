// src/components/ProgressIndicator.jsx

import React from 'react';
import { PROJECT_STAGES } from '../config/constants';

// A simple checkmark icon for completed stages
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// A single stage "pill" in the indicator with tooltip
const Stage = ({ number, text, status }) => {
  const statusStyles = {
    completed: 'bg-green-100 text-green-800',
    current: 'bg-blue-100 text-blue-800 font-bold',
    upcoming: 'bg-slate-100 text-slate-500',
  };

  const iconStyles = {
    completed: 'bg-green-500 text-white',
    current: 'bg-white text-blue-600',
    upcoming: 'bg-slate-300 text-blue-600',
  };

  const tooltips = {
    'Ideation': 'Define your Big Idea and Challenge that drives authentic learning',
    'Learning Journey': 'Map the learning phases and activities that build student capacity',
    'Student Deliverables': 'Design authentic milestones and assessment methods',
  };

  return (
    <div className="relative group">
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all duration-300 ${statusStyles[status]}`}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${iconStyles[status]}`}>
          {status === 'completed' ? <CheckIcon /> : number}
        </div>
        <span className="whitespace-nowrap">{text}</span>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        {tooltips[text]}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};

/**
 * A component to visually display the user's progress through the project stages.
 * @param {string} currentStage - The current stage of the project (e.g., 'Ideation', 'Learning Journey').
 */
export default function ProgressIndicator({ currentStage }) {
  const stages = [PROJECT_STAGES.IDEATION, PROJECT_STAGES.LEARNING_JOURNEY, PROJECT_STAGES.DELIVERABLES];
  const currentIndex = stages.indexOf(currentStage);

  const getStatus = (index) => {
    if (currentStage === PROJECT_STAGES.COMPLETED || currentStage === PROJECT_STAGES.SUMMARY) {
        return 'completed';
    }
    if (index < currentIndex) {return 'completed';}
    if (index === currentIndex) {return 'current';}
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {stages.map((stage, index) => (
        <Stage key={stage} number={index + 1} text={stage} status={getStatus(index)} />
      ))}
    </div>
  );
}
