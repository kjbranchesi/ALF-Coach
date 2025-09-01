import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface Props {
  term: 'Big Idea' | 'Essential Question' | 'Challenge';
}

const DEFINITIONS: Record<string, string> = {
  'Big Idea': 'A powerful, transferable concept students should deeply understand by the end of the project.',
  'Essential Question': 'A compelling, open question that drives inquiry and keeps learning meaningful.',
  'Challenge': 'An authentic task or problem that gives students a purpose and audience.'
};

export const TooltipGlossary: React.FC<Props> = ({ term }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label={`What is ${term}?`}
      >
        <HelpCircle className="w-4 h-4 text-gray-500" />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-64 glass-squircle p-3 text-sm text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-soft">
          <div className="flex items-start gap-2">
            <div className="font-semibold text-gray-900 dark:text-gray-100">{term}</div>
            <button onClick={() => setOpen(false)} className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <p className="mt-1 text-gray-700 dark:text-gray-200">{DEFINITIONS[term]}</p>
        </div>
      )}
    </div>
  );
};

export default TooltipGlossary;

