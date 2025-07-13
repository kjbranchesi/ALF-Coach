// src/components/ProgressIndicator.jsx

import React from 'react';
import { PROJECT_STAGES } from '../config/constants';
import { Check } from 'lucide-react';
import clsx from 'clsx';

// A polished component to visually display the user's progress through the project stages on the dashboard.
// It uses the new color palette and icons for a modern look.

const Stage = ({ text, status }) => {
  const statusStyles = {
    completed: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    current: 'bg-primary-100 text-primary-800 border-primary-200 font-semibold',
    upcoming: 'bg-neutral-100 text-neutral-500 border-neutral-200',
  };

  const iconStyles = {
    completed: 'bg-secondary-500 text-white',
    current: 'bg-primary-600 text-white animate-pulse',
    upcoming: 'bg-neutral-300 text-neutral-600',
  };

  return (
    <div className={clsx('flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-xs transition-all duration-300 border', statusStyles[status])}>
      <div className={clsx('w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0', iconStyles[status])}>
        {status === 'completed' && <Check className="w-3 h-3" />}
      </div>
      <span className="whitespace-nowrap">{text}</span>
    </div>
  );
};

export default function ProgressIndicator({ currentStage }) {
  const stages = [PROJECT_STAGES.IDEATION, PROJECT_STAGES.CURRICULUM, PROJECT_STAGES.ASSIGNMENTS];
  const currentIndex = stages.indexOf(currentStage);

  const getStatus = (index) => {
    if (currentStage === PROJECT_STAGES.COMPLETED || currentStage === PROJECT_STAGES.SUMMARY) {
      return 'completed';
    }
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {stages.map((stage, index) => (
        <Stage key={stage} text={stage} status={getStatus(index)} />
      ))}
    </div>
  );
}
