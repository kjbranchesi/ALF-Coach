// src/components/SyllabusView.jsx

import React from 'react';
import { useAppContext } from '../context/AppContext';

// --- Icon Components ---
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M6 9H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4"/><polyline points="6 2 18 2 18 7 6 7 6 2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const SectionIcon = ({ children }) => <div className="absolute -left-5 -top-3 bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center border-4 border-white print-hidden">{children}</div>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;

const renderMarkdown = (text) => {
    if (!text) return { __html: '' };
    let html = text
        .replace(/\n/g, '<br />')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/## (.*?)(<br \/>|$)/g, '<h3>$1</h3>')
        .replace(/# (.*?)(<br \/>|$)/g, '<h2>$1</h2>')
        .replace(/\* (.*?)(<br \/>|$)/g, '<li>$1</li>');
    return { __html: html };
};

export default function SyllabusView({ project, onRevise }) {
  const { selectedProjectId, reviseProjectStage } = useAppContext();

  /**
   * FIX: Handles printing the syllabus.
   * Temporarily sets the document title to the project's title, so the
   * "Save as PDF" dialog defaults to a clean, relevant filename.
   * Restores the original title after the print dialog is closed.
   */
  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = project.title.replace(/ /g, '_') || 'ProjectCraft_Syllabus';
    window.print();
    document.title = originalTitle;
  };

  const handleRevise = (stage) => {
    reviseProjectStage(selectedProjectId, stage);
    onRevise();
  };

  const StageCard = ({ title, icon, children, stageKey, isComplete }) => {
    /**
     * FIX: The "Revise" button logic is corrected.
     * A stage can now only be revised if it has been completed (i.e., `isComplete` is true).
     * This prevents users from revising empty or in-progress stages.
     */
    const canRevise = isComplete;

    return (
        <div className="relative pl-8 py-4 border-l-2 border-slate-200">
            <SectionIcon>{icon}</SectionIcon>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-700">{title}</h2>
                <button 
                    onClick={() => handleRevise(stageKey)} 
                    disabled={!canRevise}
                    className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 disabled:text-slate-400 disabled:cursor-not-allowed print-hidden"
                >
                    <EditIcon />
                    Revise
                </button>
            </div>
            <div className="prose prose-slate max-w-none bg-slate-50/70 p-6 rounded-lg">
                {isComplete ? children : <p className="text-slate-400 italic">This stage has not been completed yet.</p>}
            </div>
        </div>
    );
  };

  return (
    <div className="p-4 md:p-8 syllabus-print-area">
        <header className="mb-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800">{project.title || 'Untitled Project'}</h1>
                    <p className="mt-2 text-lg text-slate-600 max-w-2xl">{project.abstract}</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-sm print-hidden"
                >
                    <PrintIcon />
                    Print / Save as PDF
                </button>
            </div>
        </header>

        <div className="space-y-12">
            <StageCard title="Ideation" icon={<LightbulbIcon />} stageKey="Ideation" isComplete={!!project.challenge}>
                <p><strong>Core Idea:</strong> {project.coreIdea}</p>
                <p><strong>Challenge:</strong> {project.challenge}</p>
            </StageCard>

            <StageCard title="Curriculum" icon={<BookOpenIcon />} stageKey="Curriculum" isComplete={!!project.curriculumDraft}>
                <div dangerouslySetInnerHTML={renderMarkdown(project.curriculumDraft)} />
            </StageCard>

            <StageCard title="Assignments" icon={<ClipboardIcon />} stageKey="Assignments" isComplete={project.assignments && project.assignments.length > 0}>
                {project.assignments.map((assign, index) => (
                    <div key={index} className="not-prose space-y-2 mb-6 border-b pb-4 last:border-b-0 last:pb-0">
                        <h4 className="font-bold text-lg text-slate-800">{assign.title}</h4>
                        <p className="text-slate-600">{assign.description}</p>
                        <details className="bg-white p-2 rounded">
                            <summary className="font-semibold text-sm cursor-pointer">View Rubric</summary>
                            <div className="prose prose-sm mt-2 whitespace-pre-wrap p-2">{assign.rubric}</div>
                        </details>
                    </div>
                ))}
            </StageCard>
        </div>
    </div>
  );
}
