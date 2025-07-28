import React, { useState } from 'react';

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M9 21h6"></path>
    <path d="M12 17v4"></path>
    <path d="M12 3a6 6 0 0 0-6 6c0 2.7 1.8 5.1 4.2 5.8"></path>
    <path d="M18 9a6 6 0 0 1-6 6c-2.7 0-5.1-1.8-5.8-4.2"></path>
  </svg>
);

const rationaleDatabase = {
  'Ages 5-7': {
    title: 'Early Primary Focus',
    rationale: 'At this age, children learn through play and concrete experiences. They need clear structure and hands-on activities to build foundational skills.',
    strategies: ['Visual and tactile learning', 'Short activity bursts', 'Clear success criteria', 'Celebration of effort']
  },
  'Ages 8-10': {
    title: 'Primary Development',
    rationale: 'Students can now handle multi-step problems and benefit from structured collaboration. They\'re ready for more complex challenges with scaffolding.',
    strategies: ['Collaborative problem-solving', 'Public presentations', 'Choice within structure', 'Real-world connections']
  },
  'Ages 11-14': {
    title: 'Middle School Authenticity',
    rationale: 'Authenticity becomes crucial as students seek meaning. They need real-world problems and increasing autonomy in their learning.',
    strategies: ['Authentic challenges', 'Student-led management', 'Technology integration', 'Social impact focus']
  },
  'Ages 15-18': {
    title: 'High School Professionalism',
    rationale: 'Students should engage in professional-quality work that mirrors expert practice. They need genuine responsibility and public accountability.',
    strategies: ['Professional standards', 'Expert audiences', 'Independent research', 'Career connections']
  },
  'Ages 18+': {
    title: 'Adult/University Independence',
    rationale: 'Learning should foster intellectual independence and original contribution. Methodological rigor and scholarly standards are essential.',
    strategies: ['Research methodology', 'Original contribution', 'Peer review', 'Professional dissemination']
  }
};

export default function PedagogicalRationale({ ageGroup, suggestion, isVisible = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isVisible || !ageGroup) {return null;}

  const rationale = rationaleDatabase[ageGroup];
  
  if (!rationale) {return null;}

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <LightbulbIcon />
          <span className="text-sm font-medium text-amber-900">
            Why this works for {ageGroup}
          </span>
        </div>
        <span className="text-amber-600 text-sm">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-amber-200">
          <div className="space-y-3 text-sm text-amber-800">
            <div>
              <h4 className="font-semibold mb-1">{rationale.title}</h4>
              <p>{rationale.rationale}</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Key Strategies:</h4>
              <ul className="list-disc list-inside space-y-1">
                {rationale.strategies.map((strategy, index) => (
                  <li key={index}>{strategy}</li>
                ))}
              </ul>
            </div>
            
            {suggestion && (
              <div className="bg-white p-2 rounded border border-amber-200">
                <h4 className="font-semibold mb-1">Applied to your suggestion:</h4>
                <p className="text-xs italic">"{suggestion}"</p>
                <p className="text-xs mt-1">
                  This suggestion aligns with {ageGroup} development by providing the right balance of challenge and support.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}