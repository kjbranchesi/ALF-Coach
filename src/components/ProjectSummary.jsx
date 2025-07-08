// src/components/ProjectSummary.jsx

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore'; // Changed to onSnapshot
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';

// --- Icon Components ---
const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
        <polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>
    </svg>
);

const SectionIcon = ({ children }) => (
    <div className="absolute -left-5 -top-3 bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center border-4 border-white">
        {children}
    </div>
);

export default function ProjectSummary() {
  const { selectedStudioId, navigateTo } = useAppContext();
  const [studio, setStudio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedStudioId) {
      navigateTo('dashboard');
      return;
    }

    setIsLoading(true);
    setError(null);
    const docRef = doc(db, "projects", selectedStudioId);

    // FIX: Switched from getDoc to onSnapshot for more robust data loading
    // and to prevent race conditions.
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setStudio(docSnap.data());
        } else {
          console.error("No such studio project found!");
          setError("Could not find the requested Studio Project. It may have been deleted.");
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore error in ProjectSummary:", err);
        setError("There was an error loading your project summary.");
        setIsLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [selectedStudioId, navigateTo]);

  if (isLoading) {
    return <div className="text-center p-10"><h1 className="text-2xl font-bold text-purple-600">Loading Studio Summary...</h1></div>;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-slate-500 mt-2 mb-6">{error}</p>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!studio) {
    return null; // Fallback to prevent crash
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 animate-fade-in">
        <div className="flex justify-between items-start mb-8">
            <div>
                <button onClick={() => navigateTo('dashboard')} className="text-sm text-purple-600 hover:text-purple-800 font-semibold mb-4">
                    &larr; Back to Dashboard
                </button>
                <h1 className="text-4xl font-extrabold text-slate-800">{studio.title}</h1>
                <p className="text-slate-500 mt-1">{studio.coreIdea}</p>
            </div>
            <button
                onClick={() => window.print()}
                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
                <PrintIcon />
                Print
            </button>
        </div>

        <div className="space-y-12">
            <div className="relative pl-8 py-4 border-l-2 border-slate-200">
                <SectionIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </SectionIcon>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">Curriculum</h2>
                <div className="prose prose-slate max-w-none whitespace-pre-wrap">
                    {studio.curriculumDraft || "No curriculum has been drafted for this studio project."}
                </div>
            </div>

            <div className="relative pl-8 py-4 border-l-2 border-slate-200">
                <SectionIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </SectionIcon>
                <h2 className="text-2xl font-bold text-slate-700 mb-4">Assignments & Rubrics</h2>
                {studio.assignments && studio.assignments.length > 0 ? (
                    <div className="space-y-6">
                        {studio.assignments.map((assign, index) => (
                            <div key={index} className="bg-slate-50/50 p-6 rounded-lg border border-slate-200">
                                <h3 className="font-bold text-lg text-slate-800 mb-2">{assign.title}</h3>
                                <p className="text-slate-600 mb-4">{assign.description}</p>
                                <details className="bg-white p-4 rounded border">
                                    <summary className="font-semibold text-sm cursor-pointer text-purple-700">View Rubric</summary>
                                    <div className="prose prose-sm mt-4 whitespace-pre-wrap">{assign.rubric}</div>
                                </details>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500">No assignments have been created for this studio project.</p>
                )}
            </div>
        </div>
    </div>
  );
}
