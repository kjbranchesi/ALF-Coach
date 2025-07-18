import React, { useState } from 'react';

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default function GuestSpeakerHints({ hints, isVisible = true }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!isVisible || !hints || hints.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <UsersIcon />
          <span className="text-sm font-medium text-blue-900">
            Guest Speaker Ideas
          </span>
        </div>
        <span className="text-blue-600 text-sm">
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="space-y-3 text-sm text-blue-800">
            <p className="text-xs text-blue-600">
              Enhance your project with authentic expertise and real-world connections
            </p>
            
            <div className="space-y-2">
              {hints.map((hint, index) => (
                <div key={index} className="flex items-start gap-2">
                  <StarIcon />
                  <span>{hint}</span>
                </div>
              ))}
            </div>
            
            <div className="bg-white p-2 rounded border border-blue-200">
              <h4 className="font-semibold mb-1 text-xs">Pro Tips:</h4>
              <ul className="text-xs space-y-1">
                <li>• Reach out to local professionals via LinkedIn or professional associations</li>
                <li>• Parent volunteers often have relevant expertise</li>
                <li>• Virtual presentations expand your speaker possibilities</li>
                <li>• Consider recorded video messages for scheduling flexibility</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}