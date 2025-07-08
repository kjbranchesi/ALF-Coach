// src/components/DraftModule.jsx

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';

// --- Icon Components ---
const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );

/**
 * DraftModule displays the generated project outputs (Curriculum, Assignments).
 * It allows for editing and saving the drafts.
 */
export default function DraftModule({ project }) {
  const { selectedProjectId, navigateTo } = useAppContext();
  const [activeSubTab, setActiveSubTab] = useState('curriculum');
  const [isSaving, setIsSaving] = useState(false);

  // Local state for drafts to allow editing before saving
  const [localCurriculum, setLocalCurriculum] = useState(project.curriculumDraft || '');
  const [localAssignments, setLocalAssignments] = useState(project.assignments || []);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    const docRef = doc(db, "projects", selectedProjectId);
    try {
      await updateDoc(docRef, {
        curriculumDraft: localCurriculum,
        assignments: localAssignments,
      });
      // Optionally show a success toast/message
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFinalizeProject = async () => {
    await handleSaveDraft();
    // Mark stage as completed and navigate to summary
    await updateDoc(doc(db, "projects", selectedProjectId), { stage: "Completed" });
    navigateTo('summary', selectedProjectId);
  };

  const removeAssignment = (indexToRemove) => {
    setLocalAssignments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const SubTabButton = ({ tabName, label }) => {
    const isEnabled = (tabName === 'curriculum' && project.stage !== 'Ideation') || 
                      (tabName === 'assignments' && (project.stage === 'Assignments' || project.stage === 'Completed'));
    
    return (
        <button
          onClick={() => isEnabled && setActiveSubTab(tabName)}
          disabled={!isEnabled}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSubTab === tabName
              ? 'bg-purple-600 text-white'
              : isEnabled 
              ? 'bg-white text-slate-700 hover:bg-slate-100'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {label}
        </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center flex-shrink-0 bg-slate-50">
        <div className="flex items-center gap-2">
          <SubTabButton tabName="curriculum" label="Curriculum" />
          <SubTabButton tabName="assignments" label="Assignments & Rubrics" />
        </div>
        <div className="flex items-center gap-3">
            <button onClick={handleSaveDraft} disabled={isSaving} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-full flex items-center gap-2 disabled:bg-gray-400 text-sm">
              <SaveIcon />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            {project.stage === 'Assignments' && (
                 <button onClick={handleFinalizeProject} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 disabled:bg-gray-400 text-sm">
                    View Summary
                 </button>
            )}
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {activeSubTab === 'curriculum' && (
          <textarea 
            value={localCurriculum}
            onChange={(e) => setLocalCurriculum(e.target.value)}
            className="w-full h-full p-4 bg-white focus:outline-none resize-none text-slate-800 leading-relaxed rounded-lg border"
            placeholder="Your curriculum draft will appear here as you work with the AI Coach..."
          />
        )}

        {activeSubTab === 'assignments' && (
          <div className="space-y-4">
            {localAssignments.length === 0 && <p className="text-slate-500 p-4 text-center">Your generated assignments will appear here.</p>}
            {localAssignments.map((assign, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg text-slate-800">{assign.title}</h4>
                  <button onClick={() => removeAssignment(index)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </div>
                <p className="text-slate-600 mb-3">{assign.description}</p>
                <details className="bg-gray-50 p-2 rounded">
                  <summary className="font-semibold text-sm cursor-pointer">View Rubric</summary>
                  <div className="prose prose-sm mt-2 whitespace-pre-wrap p-2">{assign.rubric}</div>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
