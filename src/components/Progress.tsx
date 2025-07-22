import React from 'react';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  max?: number;
  segment?: 'journey' | 'deliver' | 'complete';
  showLabel?: boolean;
  className?: string;
}

export function Progress({ 
  value, 
  max = 100, 
  segment = 'journey',
  showLabel = false,
  className = '' 
}: ProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  
  // Color based on segment
  const getSegmentColor = () => {
    switch (segment) {
      case 'journey':
        return 'from-blue-500 to-purple-500';
      case 'deliver':
        return 'from-purple-500 to-pink-500';
      case 'complete':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  // Milestone markers - journey is 50%, deliver is 30%, review is 20%
  const getSegmentPercentage = () => {
    if (segment === 'journey') {
      // Journey phases are 0-50% of total progress
      return percentage * 0.5;
    } else if (segment === 'deliver') {
      // Deliver phases are 50-80% of total progress
      return 50 + (percentage * 0.3);
    } else {
      // Complete is 80-100%
      return 80 + (percentage * 0.2);
    }
  };

  const segmentPercentage = getSegmentPercentage();

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {/* Background track */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${segmentPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`h-full bg-gradient-to-r ${getSegmentColor()} rounded-full relative`}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
        
        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center">
          {/* Journey complete marker at 50% */}
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          >
            {segmentPercentage >= 50 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-blue-500 rounded-full"
              />
            )}
          </div>
          
          {/* Deliver complete marker at 80% */}
          <div 
            className="absolute w-3 h-3 bg-white border-2 border-purple-500 rounded-full"
            style={{ left: '80%', transform: 'translateX(-50%)' }}
          >
            {segmentPercentage >= 80 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-purple-500 rounded-full"
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Labels */}
      {showLabel && (
        <div className="mt-2 flex justify-between text-xs text-gray-600">
          <span className={segmentPercentage >= 50 ? 'font-medium text-blue-600' : ''}>
            Journey Design
          </span>
          <span className={segmentPercentage >= 80 ? 'font-medium text-purple-600' : ''}>
            Deliverables
          </span>
          <span className={segmentPercentage >= 100 ? 'font-medium text-green-600' : ''}>
            Publish
          </span>
        </div>
      )}
    </div>
  );
}

// Add shimmer animation to tailwind
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
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