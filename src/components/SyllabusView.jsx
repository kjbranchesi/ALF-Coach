// src/components/SyllabusView.jsx

import React from 'react';
import { useAppContext } from '../context/AppContext';
import Remark from 'react-remark';
import remarkGfm from 'remark-gfm';
import { PROJECT_STAGES } from '../config/constants';

// --- Icon Components ---
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2"><path d="M6 9H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-4"/><polyline points="6 2 18 2 18 7 6 7 6 2"/><rect x="6" y="14" width="12" height="8"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const SectionIcon = ({ children }) => (<div className="absolute -left-5 -top-3 bg-purple-600 text-white rounded-full h-10 w-10 flex items-center justify-center border-4 border-white print-hidden">{children}</div>);
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const ClipboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// A more robust markdown renderer
const RubricDisplay = ({ rubricText }) => {
    if (!rubricText || typeof rubricText !== 'string') {
        return <p className="text-slate-500 italic mt-4">No rubric provided.</p>;
    }
    
    const criteria = rubricText.split('**').filter(s => s.trim() !== '' && s.includes(':')).map(part => {
        const [title, ...levels] = part.split('\n').filter(line => line.trim() !== '');
        return {
            title: title ? title.replace(/:$/, '').trim() : 'Unnamed Criterion',
            levels: levels.map(level => {
                const [levelName, ...descParts] = level.split(':');
                return {
                    name: levelName ? level.trim().split(':')[0] : 'Unnamed Level',
                    description: descParts.join(':').trim()
                };
            }).filter(l => l.name && l.description)
        };
    }).filter(c => c.title && c.levels.length > 0);

    if (criteria.length === 0) { // Fallback to basic rendering if structured parsing fails
        return <div className="prose prose-sm mt-4" dangerouslySetInnerHTML={{ __html: rubricText.replace(/\n/g, '<br/>') }} />;
    }

    return (
        <div className="space-y-4 mt-4 border-t pt-4">
            {criteria.map((crit, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 text-sm">
                    <div className="md:col-span-3 font-bold text-slate-700 bg-slate-100 p-3 rounded-md flex items-center">{crit.title}</div>
                    <div className="md:col-span-9 space-y-2">
                        {crit.levels.map((level, lvlIndex) => (
                            <div key={lvlIndex} className="grid grid-cols-12 items-start">
                                <div className="col-span-3 font-semibold text-slate-600 p-2 bg-slate-50 rounded-l-md">{level.name}</div>
                                <div className="col-span-9 p-2 bg-white border border-l-0 border-slate-200 rounded-r-md prose prose-sm max-w-none">
                                    <Remark remarkPlugins={[remarkGfm]}>{level.description}</Remark>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function SyllabusView({ project, onRevise }) {
  const { reviseProjectStage } = useAppContext();

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = project.title.replace(/ /g, '_') || 'ProjectCraft_Syllabus';
    window.print();
    document.title = originalTitle;
  };

  const handleReviseClick = (stage) => {
    reviseProjectStage(project.id, stage);
    onRevise(stage); // This function should switch the tab back to 'chat'
  };

  const StageCard = ({ title, icon, children, stageKey, isComplete = true }) => {
    const isStageRevisable = [PROJECT_STAGES.IDEATION, PROJECT_STAGES.CURRICULUM, PROJECT_STAGES.ASSIGNMENTS].includes(stageKey);
    return (
        <div className="relative pl-8 py-4 border-l-2 border-slate-200">
            <SectionIcon>{icon}</SectionIcon>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-700">{title}</h2>
                {isStageRevisable && (
                    <button 
                        onClick={() => handleReviseClick(stageKey)} 
                        className="flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 disabled:text-slate-400 disabled:cursor-not-allowed print-hidden"
                    >
                        <EditIcon />
                        Revise
                    </button>
                )}
            </div>
            <div className="prose prose-slate max-w-none bg-slate-50/70 p-6 rounded-lg">
                {isComplete ? children : <p className="text-slate-400 italic print-hidden">This stage has not been completed yet.</p>}
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
                <button onClick={handlePrint} className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors shadow-sm print-hidden">
                    <PrintIcon />
                    Print / Save as PDF
                </button>
            </div>
        </header>

        <div className="space-y-12">
            <StageCard title="Ideation" icon={<LightbulbIcon />} stageKey={PROJECT_STAGES.IDEATION} isComplete={!!project.challenge}>
                <p><strong>Core Idea:</strong> {project.coreIdea}</p>
                <p><strong>Challenge:</strong> {project.challenge}</p>
            </StageCard>

            <StageCard title="Learning Journey" icon={<BookOpenIcon />} stageKey={PROJECT_STAGES.CURRICULUM} isComplete={!!project.curriculumDraft}>
                <Remark remarkPlugins={[remarkGfm]}>
                    {project.curriculumDraft}
                </Remark>
            </StageCard>

            <StageCard title="Student Deliverables" icon={<ClipboardIcon />} stageKey={PROJECT_STAGES.ASSIGNMENTS} isComplete={project.assignments && project.assignments.length > 0}>
                {project.assignments?.map((assign, index) => (
                    <div key={index} className="not-prose space-y-4 mb-6 border-t border-slate-200 pt-6 first:pt-0 first:border-t-0">
                        <h4 className="font-bold text-lg text-slate-800">{assign.title}</h4>
                        <Remark remarkPlugins={[remarkGfm]}>{assign.description}</Remark>
                        <details className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <summary className="font-semibold text-sm cursor-pointer text-purple-700">View Rubric</summary>
                            <RubricDisplay rubricText={assign.rubric} />
                        </details>
                    </div>
                ))}
            </StageCard>
            
            {project.assessmentMethods && (
                <StageCard title="Summative Assessment" icon={<CheckCircleIcon />} stageKey={PROJECT_STAGES.SUMMARY} isComplete={true}>
                    <Remark remarkPlugins={[remarkGfm]}>
                        {project.assessmentMethods}
                    </Remark>
                </StageCard>
            )}
        </div>
    </div>
  );
}