// src/components/CurriculumOutline.jsx

import React from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';

// Icon Components
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function CurriculumOutline({ curriculumDraft, isVisible }) {
  if (!isVisible || !curriculumDraft) return null;

  // Parse the curriculum to extract phases - more robust parsing
  const parsePhases = (draft) => {
    const phases = [];
    const phaseRegex = /### Phase (\d+):(.*?)(?=### Phase \d+:|$)/gs;
    let match;
    
    while ((match = phaseRegex.exec(draft)) !== null) {
      const phaseNumber = match[1];
      const fullContent = match[0];
      const titleMatch = fullContent.match(/### Phase \d+:\s*(.+)/);
      const title = titleMatch ? titleMatch[1].trim() : `Phase ${phaseNumber}`;
      
      phases.push({
        number: phaseNumber,
        title: title,
        content: fullContent
      });
    }
    
    return phases;
  };

  const phases = parsePhases(curriculumDraft);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-full overflow-y-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <BookOpenIcon />
        <h3 className="font-semibold text-slate-800">Curriculum Outline</h3>
      </div>
      
      {phases.length === 0 ? (
        <p className="text-sm text-slate-500 italic">
          The curriculum outline will appear here as you build it...
        </p>
      ) : (
        <div className="space-y-3">
          {phases.map((phase, index) => (
            <details key={index} className="group" open={false}>
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors select-none">
                <ChevronRightIcon className="transition-transform group-open:rotate-90" />
                <span>Phase {phase.number}: {phase.title}</span>
              </summary>
              <div className="mt-2 ml-6 text-sm text-slate-600 prose prose-sm max-w-none">
                <Remark remarkPlugins={[remarkGfm]}>
                  {phase.content}
                </Remark>
              </div>
            </details>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          💡 This outline updates automatically as you design your curriculum
        </p>
      </div>
    </div>
  );
}