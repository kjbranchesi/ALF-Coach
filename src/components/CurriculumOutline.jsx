// src/components/CurriculumOutline.jsx

import React, { useState } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';

// Icon Components
const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "w-4 h-4"}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default function CurriculumOutline({ curriculumDraft, isVisible }) {
  // Track which phases are expanded
  const [expandedPhases, setExpandedPhases] = useState(new Set());

  if (!isVisible || !curriculumDraft) return null;

  // More robust phase parsing
  const parsePhases = (draft) => {
    const phases = [];
    
    // Try multiple patterns to catch different phase formats
    const patterns = [
      /### Phase (\d+):(.*?)(?=### Phase \d+:|$)/gs,
      /### Phase (\d+)\s*:\s*(.*?)(?=### Phase \d+|$)/gs,
      /###\s+Phase\s+(\d+)\s*:\s*(.*?)(?=###\s+Phase\s+\d+|$)/gs
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(draft)) !== null) {
        const phaseNumber = match[1];
        const fullContent = match[0];
        
        // Extract title more carefully
        const titleMatch = fullContent.match(/###\s*Phase\s*\d+\s*:\s*(.+?)(\n|$)/);
        const title = titleMatch ? titleMatch[1].trim() : `Phase ${phaseNumber}`;
        
        // Clean up the content
        const content = fullContent
          .replace(/###\s*Phase\s*\d+\s*:\s*.*?\n/, '') // Remove the title line
          .trim();
        
        phases.push({
          number: phaseNumber,
          title: title,
          content: content || 'No details yet.'
        });
      }
    }
    
    // If no phases found, try to show the entire draft
    if (phases.length === 0 && draft.trim()) {
      phases.push({
        number: '1',
        title: 'Draft Content',
        content: draft
      });
    }
    
    return phases;
  };

  const togglePhase = (phaseNumber) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseNumber)) {
      newExpanded.delete(phaseNumber);
    } else {
      newExpanded.add(phaseNumber);
    }
    setExpandedPhases(newExpanded);
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
          {phases.map((phase, index) => {
            const isExpanded = expandedPhases.has(phase.number);
            
            return (
              <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => togglePhase(phase.number)}
                  className="w-full flex items-center gap-2 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <ChevronRightIcon 
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                  <span>Phase {phase.number}: {phase.title}</span>
                </button>
                
                {isExpanded && (
                  <div className="px-4 pb-3 text-sm text-slate-600">
                    <div className="prose prose-sm max-w-none">
                      <Remark remarkPlugins={[remarkGfm]}>
                        {phase.content}
                      </Remark>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          💡 Click on any phase to expand/collapse details
        </p>
      </div>
    </div>
  );
}