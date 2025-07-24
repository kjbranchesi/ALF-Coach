import React from 'react';
import { motion } from 'framer-motion';
import { useFSMv2 } from '../context/FSMContextV2';

export function Progress() {
  const { progress, currentState } = useFSMv2();
  
  // Get segment-specific progress
  const getSegmentInfo = () => {
    if (currentState.startsWith('IDEATION')) {
      return {
        label: 'Ideation',
        color: 'from-blue-500 to-purple-500',
        percentage: (progress.current / 5) * 30 // Ideation is 30% of total
      };
    } else if (currentState.startsWith('JOURNEY')) {
      return {
        label: 'Learning Journey',
        color: 'from-purple-500 to-pink-500',
        percentage: 30 + ((progress.current - 5) / 5) * 40 // Journey is 40% of total
      };
    } else if (currentState.startsWith('DELIVER')) {
      return {
        label: 'Deliverables',
        color: 'from-pink-500 to-red-500',
        percentage: 70 + ((progress.current - 10) / 5) * 25 // Deliverables is 25% of total
      };
    } else {
      return {
        label: 'Publish',
        color: 'from-green-500 to-emerald-500',
        percentage: 95 + ((progress.current - 15) / 2) * 5 // Publish is 5% of total
      };
    }
  };

  const segmentInfo = getSegmentInfo();
  
  // Milestone positions
  const milestones = [
    { position: 30, label: 'Ideation', color: 'blue' },
    { position: 70, label: 'Journey', color: 'purple' },
    { position: 95, label: 'Deliverables', color: 'pink' }
  ];

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700">
          {segmentInfo.label}
        </h3>
        <span className="text-sm text-gray-500">
          Step {progress.current} of {progress.total}
        </span>
      </div>
      
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${segmentInfo.percentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`h-full bg-gradient-to-r ${segmentInfo.color} rounded-full relative`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
        
        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center">
          {milestones.map((milestone) => (
            <div
              key={milestone.position}
              className={`absolute w-3 h-3 bg-white border-2 ${
                milestone.color === 'blue' ? 'border-blue-500' : 
                milestone.color === 'purple' ? 'border-purple-500' : 
                'border-pink-500'
              } rounded-full`}
              style={{ left: `${milestone.position}%`, transform: 'translateX(-50%)' }}
            >
              {segmentInfo.percentage >= milestone.position && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute inset-0 ${
                    milestone.color === 'blue' ? 'bg-blue-500' : 
                    milestone.color === 'purple' ? 'bg-purple-500' : 
                    'bg-pink-500'
                  } rounded-full`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Stage labels */}
      <div className="mt-3 flex justify-between text-xs">
        <span className={`transition-colors ${segmentInfo.percentage >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
          Ideation
        </span>
        <span className={`transition-colors ${segmentInfo.percentage >= 30 ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
          Journey
        </span>
        <span className={`transition-colors ${segmentInfo.percentage >= 70 ? 'text-pink-600 font-medium' : 'text-gray-400'}`}>
          Deliverables
        </span>
        <span className={`transition-colors ${segmentInfo.percentage >= 95 ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
          Publish
        </span>
      </div>
    </div>
  );
}

// Add shimmer animation
if (typeof window !== 'undefined' && !document.getElementById('shimmer-animation')) {
  const style = document.createElement('style');
  style.id = 'shimmer-animation';
  style.textContent = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `;
  document.head.appendChild(style);
}