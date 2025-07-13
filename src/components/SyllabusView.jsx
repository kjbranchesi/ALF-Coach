// src/components/SyllabusView.jsx

import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';
import { PROJECT_STAGES } from '../config/constants';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Printer, Edit, Lightbulb, BookOpen, ClipboardCheck, Award } from 'lucide-react';

// A component to display the generated syllabus in a clean, printable format.
// It uses the new Card component system for a structured and modern layout.

const StageCard = ({ title, icon, children, stageKey, onRevise }) => {
    const { reviseProjectStage } = useAppContext();
    const isStageRevisable = [PROJECT_STAGES.IDEATION, PROJECT_STAGES.CURRICULUM, PROJECT_STAGES.ASSIGNMENTS].includes(stageKey);

    const handleReviseClick = () => {
        reviseProjectStage(project.id, stageKey);
        onRevise();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        {icon}
                    </div>
                    <CardTitle>{title}</CardTitle>
                </div>
                {isStageRevisable && (
                    <Button variant="ghost" size="sm" onClick={handleReviseClick} className="print-hidden">
                        <Edit className="mr-2 h-4 w-4" />
                        Revise
                    </Button>
                )}
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
                {children}
            </CardContent>
        </Card>
    );
};

export default function SyllabusView({ project, onRevise }) {
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = project.title.replace(/ /g, '_') || 'ProjectCraft_Syllabus';
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-sm border border-neutral-200 syllabus-print-area">
            <header className="mb-8 pb-6 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-extrabold text-neutral-800">{project.title || 'Untitled Project'}</h1>
                        <p className="mt-2 text-lg text-neutral-600 max-w-3xl">{project.abstract || 'No abstract provided.'}</p>
                    </div>
                    <Button onClick={handlePrint} className="print-hidden">
                        <Printer className="mr-2 h-4 w-4" />
                        Print / PDF
                    </Button>
                </div>
            </header>

            <div className="space-y-8">
                <StageCard title="Ideation" icon={<Lightbulb className="w-6 h-6 text-primary-600" />} stageKey={PROJECT_STAGES.IDEATION} onRevise={onRevise}>
                    <p><strong>Core Idea:</strong> {project.coreIdea || 'Not defined.'}</p>
                    <p><strong>Challenge:</strong> {project.challenge || 'Not defined.'}</p>
                </StageCard>

                <StageCard title="Learning Journey" icon={<BookOpen className="w-6 h-6 text-primary-600" />} stageKey={PROJECT_STAGES.CURRICULUM} onRevise={onRevise}>
                    <Remark remarkPlugins={[remarkGfm]}>
                        {project.curriculumDraft || '*No curriculum draft has been generated yet.*'}
                    </Remark>
                </StageCard>

                <StageCard title="Student Deliverables" icon={<ClipboardCheck className="w-6 h-6 text-primary-600" />} stageKey={PROJECT_STAGES.ASSIGNMENTS} onRevise={onRevise}>
                    {project.assignments && project.assignments.length > 0 ? (
                        project.assignments.map((assign, index) => (
                            <div key={index} className="not-prose space-y-2 mb-4 border-b pb-4 last:border-b-0 last:pb-0">
                                <h4 className="font-bold text-md text-neutral-800">{assign.title}</h4>
                                <div className="prose prose-sm max-w-none">
                                    <Remark remarkPlugins={[remarkGfm]}>{assign.description}</Remark>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="italic text-neutral-500">*No assignments have been created yet.*</p>
                    )}
                </StageCard>
                
                {project.assessmentMethods && (
                    <StageCard title="Summative Assessment" icon={<Award className="w-6 h-6 text-primary-600" />} stageKey={PROJECT_STAGES.SUMMARY} onRevise={onRevise}>
                        <Remark remarkPlugins={[remarkGfm]}>
                            {project.assessmentMethods}
                        </Remark>
                    </StageCard>
                )}
            </div>
        </div>
    );
}
