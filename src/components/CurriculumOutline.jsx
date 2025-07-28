// src/components/CurriculumOutline.jsx - ENHANCED VERSION

import React, { useState, useMemo } from 'react';
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

const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-amber-500">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-600">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default function CurriculumOutline({ curriculumDraft, isVisible, projectInfo }) {
  const [expandedPhases, setExpandedPhases] = useState(new Set([1])); // Start with first phase expanded
  const [parseError, setParseError] = useState(false);

  // More robust phase parsing with error handling
  const phases = useMemo(() => {
    if (!curriculumDraft) {return [];}
    
    try {
      setParseError(false);
      const phaseList = [];
      
      // Split by phase markers more reliably
      const lines = curriculumDraft.split('\n');
      let currentPhase = null;
      let currentContent = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line starts a new phase
        const phaseMatch = line.match(/^###\s+Phase\s+(\d+)\s*:\s*(.*)$/);
        
        if (phaseMatch) {
          // Save previous phase if exists
          if (currentPhase) {
            phaseList.push({
              number: parseInt(currentPhase.number),
              title: currentPhase.title,
              content: currentContent.join('\n').trim(),
              hasObjectives: currentContent.some(l => l.includes('Objectives:')),
              hasActivities: currentContent.some(l => l.includes('Activities:') || l.includes('Week')),
              hasDuration: currentContent.some(l => l.includes('Duration:'))
            });
          }
          
          // Start new phase
          currentPhase = {
            number: phaseMatch[1],
            title: phaseMatch[2].trim()
          };
          currentContent = [];
        } else if (currentPhase) {
          // Add line to current phase content
          currentContent.push(line);
        }
      }
      
      // Don't forget the last phase
      if (currentPhase) {
        phaseList.push({
          number: parseInt(currentPhase.number),
          title: currentPhase.title,
          content: currentContent.join('\n').trim(),
          hasObjectives: currentContent.some(l => l.includes('Objectives:')),
          hasActivities: currentContent.some(l => l.includes('Activities:') || l.includes('Week')),
          hasDuration: currentContent.some(l => l.includes('Duration:'))
        });
      }
      
      // Sort by phase number to ensure correct order
      phaseList.sort((a, b) => a.number - b.number);
      
      // Remove any duplicates (shouldn't happen with this approach)
      const uniquePhases = phaseList.filter((phase, index, self) =>
        index === self.findIndex(p => p.number === phase.number)
      );
      
      return uniquePhases;
      
    } catch (error) {
      console.error('Error parsing curriculum phases:', error);
      setParseError(true);
      return [];
    }
  }, [curriculumDraft]);

  const togglePhase = (phaseNumber) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseNumber)) {
      newExpanded.delete(phaseNumber);
    } else {
      newExpanded.add(phaseNumber);
    }
    setExpandedPhases(newExpanded);
  };

  const getPhaseCompleteness = (phase) => {
    const hasAllElements = phase.hasObjectives && phase.hasActivities && phase.hasDuration;
    if (hasAllElements) {return { status: 'complete', icon: <CheckCircleIcon /> };}
    if (phase.hasObjectives || phase.hasActivities) {return { status: 'partial', icon: <AlertCircleIcon /> };}
    return { status: 'empty', icon: null };
  };

  if (!isVisible) {return null;}

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <BookOpenIcon />
        <h3 className="font-semibold text-slate-800">Learning Journey Outline</h3>
      </div>
      
      {/* Progress Summary */}
      {projectInfo && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm">
          <div className="font-medium text-slate-700 mb-1">Project: {projectInfo.title}</div>
          <div className="text-slate-600">
            {phases.length} phase{phases.length !== 1 ? 's' : ''} planned
            {phases.length > 0 && ` • ${phases.filter(p => getPhaseCompleteness(p).status === 'complete').length} complete`}
          </div>
        </div>
      )}
      
      {/* Error State */}
      {parseError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <p>There was an issue displaying the curriculum outline. The content is still being saved.</p>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {phases.length === 0 && !parseError ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 italic mb-2">
              No phases defined yet
            </p>
            <p className="text-xs text-slate-400">
              The curriculum outline will appear here as you build it...
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {phases.map((phase) => {
              const isExpanded = expandedPhases.has(phase.number);
              const completeness = getPhaseCompleteness(phase);
              
              return (
                <div 
                  key={phase.number} 
                  className={`border rounded-lg overflow-hidden transition-all ${
                    completeness.status === 'complete' ? 'border-green-200' : 
                    completeness.status === 'partial' ? 'border-amber-200' : 
                    'border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => togglePhase(phase.number)}
                    className="w-full flex items-center gap-2 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                  >
                    <ChevronRightIcon 
                      className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                    <span className="flex-1">Phase {phase.number}: {phase.title}</span>
                    {completeness.icon && <span className="flex-shrink-0">{completeness.icon}</span>}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-3 text-sm text-slate-600 border-t border-slate-100">
                      {phase.content ? (
                        <div className="prose prose-sm max-w-none mt-3">
                          <Remark remarkPlugins={[remarkGfm]}>
                            {phase.content}
                          </Remark>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic mt-3">No details added yet for this phase.</p>
                      )}
                      
                      {/* Quick status indicators */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${phase.hasDuration ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          Duration {phase.hasDuration ? '✓' : '○'}
                        </span>
                        <span className={`px-2 py-1 rounded ${phase.hasObjectives ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          Objectives {phase.hasObjectives ? '✓' : '○'}
                        </span>
                        <span className={`px-2 py-1 rounded ${phase.hasActivities ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          Activities {phase.hasActivities ? '✓' : '○'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer Tips */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          💡 Click any phase to see details • 
          {phases.length > 0 && ' ✓ = complete, ⚠ = in progress'}
        </p>
      </div>
    </div>
  );
}