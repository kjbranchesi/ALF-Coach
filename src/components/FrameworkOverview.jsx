import React, { useState } from 'react';

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="l 12,8 12,12"></path>
    <path d="l 12,16 12.01,16"></path>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default function FrameworkOverview() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <InfoIcon />
          <span className="font-semibold text-purple-900">About ProjectCraft Method</span>
        </div>
        <ChevronDownIcon />
      </button>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-purple-200">
          <div className="space-y-4 text-sm text-purple-800">
            <div>
              <h4 className="font-semibold mb-2">What is ProjectCraft?</h4>
              <p>
                ProjectCraft uses the Active Learning Framework (ALF) to guide you through creating 
                meaningful, authentic learning experiences that engage students in real-world problem-solving.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">The Three Stages:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <div>
                    <strong>Ideation:</strong> Define your Big Idea and Challenge that drives authentic learning
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <div>
                    <strong>Curriculum:</strong> Build the learning journey with scaffolded activities
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <div>
                    <strong>Assignments:</strong> Create authentic assessments that mirror real-world work
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Why This Approach Works:</h4>
              <p>
                By starting with authentic challenges and building backwards, we ensure every activity 
                serves a clear purpose and prepares students for meaningful demonstration of their learning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}