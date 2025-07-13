// src/components/BlueprintBuilder.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// --- Icon Components ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary-700"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary-700"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary-700"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// --- Step Indicator Component ---
const StepIndicator = ({ currentStep }) => {
    const steps = ["Perspective", "Topic", "Audience", "Scope"];
    return (
        <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${currentStep > index ? 'bg-secondary-500 border-secondary-500 text-white' : ''} ${currentStep === index + 1 ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-100' : ''} ${currentStep < index + 1 ? 'bg-neutral-100 border-neutral-300 text-neutral-400' : ''}`}>
                            {currentStep > index + 1 ? <CheckCircleIcon /> : index + 1}
                        </div>
                        <p className={`mt-2 text-sm font-semibold w-24 transition-all duration-300 ${currentStep >= index + 1 ? 'text-neutral-700' : 'text-neutral-500'} ${currentStep === index + 1 ? 'text-primary-700' : ''}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-auto h-1 mx-4 transition-all duration-500 ${currentStep > index + 1 ? 'bg-secondary-500' : 'bg-neutral-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Main Component ---
export default function BlueprintBuilder({ onCancel }) {
    const { createNewBlueprint } = useAppContext();
    const [step, setStep] = useState(1);
    const [educatorPerspective, setEducatorPerspective] = useState('');
    const [subject, setSubject] = useState('');
    const [initialMaterials, setInitialMaterials] = useState('');
    const [ageGroup, setAgeGroup] = useState('Ages 11-14');
    const [projectScope, setProjectScope] = useState('A Full Course/Studio');

    const handleNext = () => {
        if (step === 1 && educatorPerspective.trim()) {
            setStep(2);
        } else if (step === 2 && subject.trim()) {
            setStep(3);
        } else {
            const inputId = step === 1 ? 'educator-perspective' : (step === 2 ? 'subject-area' : '');
            const input = document.getElementById(inputId);
            // No validation for step 3 (Audience/Scope) as selects have default values
            if (step === 3) { setStep(4); return; }
            if (input) {
                input.focus();
                input.classList.add('ring-2', 'ring-red-500');
                setTimeout(() => input.classList.remove('ring-2', 'ring-red-500'), 2000);
            }
        }
    };

    const handleCreate = () => {
        if (!subject.trim() || !educatorPerspective.trim()) {
            alert("Please ensure all required fields are filled out.");
            return;
        }
        createNewBlueprint({ educatorPerspective, subject, ageGroup, projectScope, initialMaterials });
    };

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onCancel]);

    const StepCard = ({ icon, title, subtitle, children }) => (
        <div className="bg-neutral-50 border-l-4 border-primary-500 p-6 rounded-lg shadow-sm">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary-100 p-3 rounded-full">{icon}</div>
                <div className="w-full">
                    <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
                    <p className="text-sm text-neutral-600 mb-4">{subtitle}</p>
                    {children}
                </div>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <StepCard
                            icon={<EditIcon />}
                            title="What's your motivation or initial thought?"
                            subtitle="This helps us understand your vision. Think of it as a journal entry."
                        >
                            <textarea
                                id="educator-perspective"
                                value={educatorPerspective}
                                onChange={(e) => setEducatorPerspective(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base h-36 resize-none"
                                placeholder="e.g., 'I've always been fascinated by how cities evolve...' or 'My students are struggling to see the relevance of history...'"
                                autoFocus
                            />
                        </StepCard>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in space-y-6">
                        <StepCard
                            icon={<LightbulbIcon />}
                            title="What is the core subject or topic?"
                            subtitle="This will be the title of our blueprint."
                        >
                            <input
                                type="text"
                                id="subject-area"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                                placeholder="e.g., Urban Planning, The Cold War, Marine Biology"
                                autoFocus
                            />
                        </StepCard>
                        <StepCard
                            icon={<LightbulbIcon />}
                            title="Any initial ideas on materials or resources?"
                            subtitle="Optional: list any articles, books, or videos you're already thinking of."
                        >
                             <textarea
                                id="initial-materials"
                                value={initialMaterials}
                                onChange={(e) => setInitialMaterials(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-base h-24 resize-none"
                                placeholder="e.g., 'The first chapter of 'The Death and Life of Great American Cities' by Jane Jacobs...'"
                            />
                        </StepCard>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-fade-in">
                        <StepCard
                            icon={<UsersIcon />}
                            title="Define The Scope"
                            subtitle="Select the scale of your project."
                        >
                             <select
                                id="project-scope"
                                value={projectScope}
                                onChange={(e) => setProjectScope(e.target.value)}
                                className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option>A Full Course/Studio</option>
                                <option>A Single Project/Assignment</option>
                            </select>
                        </StepCard>
                    </div>
                );


            default: // Covers Step 3 and any unexpected step values
                return (
                    <div className="animate-fade-in">
                        <StepCard
                            icon={<UsersIcon />}
                            title="Who is this project for?"
                            subtitle="Select the target age group for your learners."
                        >
                            <select id="age-group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full px-3 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option>Ages 5-7</option>
                                <option>Ages 8-10</option>
                                <option>Ages 11-14</option>
                                <option>Ages 15-18</option>
                                <option>Ages 18+</option>
                            </select>
                        </StepCard>
                    </div>
);
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-neutral-100 overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-2xl bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-neutral-200">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-neutral-800 mb-2">The Educator's Notebook</h2>
                        <p className="text-neutral-600 max-w-lg mx-auto">Let's start by capturing your vision. This is the foundation of our collaboration.</p>
                    </div>
                    <StepIndicator currentStep={step} />
                    {renderStepContent()}
                    <div className="mt-10 pt-6 border-t flex justify-between items-center">
                        <div>
                            {step > 1 && (
                                <button type="button" className="px-6 py-3 text-sm font-semibold text-neutral-700 hover:text-neutral-900" onClick={() => setStep(step - 1)}>
                                    &larr; Back
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" className="px-6 py-3 text-sm font-semibold text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded-lg" onClick={onCancel}>
                                Cancel
                            </button>
                            {step < 3 ? (
                                <button type="button" className="px-8 py-3 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm" onClick={handleNext}>
                                    Next &rarr;
                                </button>
                            ) : (
                                <button type="button" className="px-8 py-3 text-sm font-semibold text-white bg-secondary-600 hover:bg-secondary-700 rounded-lg shadow-sm flex items-center gap-2" onClick={handleCreate}>
                                    <CheckCircleIcon />
                                    Create Blueprint
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
