// src/components/StageTransitionModal.jsx

import React, { useEffect } from 'react';

// --- Icon for the modal ---
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default function StageTransitionModal({
  isOpen,
  onContinue,
  title,
  summaryContent, // This can be a string or JSX for more complex summaries
  continueText = "Continue"
}) {

  // This modal does not close on 'Escape' or backdrop click by design,
  // to ensure the user actively acknowledges the transition.

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg p-8 m-4 bg-white rounded-2xl shadow-xl transform transition-all animate-fade-in"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-start gap-4">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
            <CheckCircleIcon />
          </div>
          <div className="flex-1">
            <h3 className="text-xl leading-6 font-bold text-slate-900" id="modal-title">
              {title}
            </h3>
            <div className="mt-2 text-sm text-slate-600 prose prose-sm max-w-none">
              {summaryContent}
            </div>
          </div>
        </div>
        <div className="mt-8 text-right">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
            onClick={onContinue}
          >
            {continueText}
          </button>
        </div>
      </div>
    </div>
  );
}
