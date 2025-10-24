import React, { useState } from 'react';

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);

const engagementIdeas = {
  'Curriculum': [
    'Invite community experts as guest speakers',
    'Plan field trips to relevant local sites',
    'Create partnerships with local businesses',
    'Design service learning components'
  ],
  'Assignments': [
    'Present findings to community stakeholders',
    'Create solutions for real community challenges',
    'Showcase work at community events',
    'Develop resources for community use'
  ]
};

// ARCHIVED - CommunityEngagement
export default function CommunityEngagement({ currentStage, subject, isVisible = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isVisible) {return null;}

  const stageIdeas = engagementIdeas[currentStage] || [];

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <HeartIcon />
          <span className="text-sm font-medium text-rose-900">
            Community Engagement Ideas
          </span>
        </div>
        <span className="text-rose-600 text-sm">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-rose-200">
          <div className="space-y-3 text-sm text-rose-800">
            <p className="text-xs text-rose-600">
              Connect your {subject} project with the local community for authentic impact
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold">For the {currentStage} Stage:</h4>
              <ul className="space-y-1">
                {stageIdeas.map((idea, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-3 rounded border border-rose-200">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ShareIcon />
                Community Impact Benefits
              </h4>
              <ul className="text-xs space-y-1">
                <li>• Students see the real-world relevance of their learning</li>
                <li>• Authentic audiences provide meaningful feedback</li>
                <li>• Community partners offer professional mentorship</li>
                <li>• Projects create lasting value beyond the classroom</li>
                <li>• Students develop civic responsibility and engagement</li>
              </ul>
            </div>
            
            <div className="bg-rose-100 p-2 rounded">
              <p className="text-xs">
                <strong>Next Steps:</strong> Consider reaching out to local organizations, 
                chambers of commerce, or community centers to identify potential partnerships 
                that align with your {subject} project goals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
