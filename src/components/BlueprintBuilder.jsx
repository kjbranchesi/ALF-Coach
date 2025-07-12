// src/components/BlueprintBuilder.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

// --- Icon Components ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-orange-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-teal-500"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// --- Step Indicator Component with Corrected Colors and Visible Numbers ---
const StepIndicator = ({ currentStep }) => {
    const steps = [
        { name: "Your Perspective", color: "orange" },
        { name: "The Topic", color: "teal" },
        { name: "The Audience", color: "blue" }
    ];

    // Helper to get Tailwind classes dynamically
    const getStepClasses = (step, index) => {
        const isCompleted = currentStep > index + 1;
        const isCurrent = currentStep === index + 1;
        
        let ringColor = 'ring-transparent';
        let bgColor = 'bg-slate-100';
        let borderColor = 'border-slate-300';
        let textColor = 'text-slate-400';
        let labelColor = 'text-slate-500';

        if (isCompleted) {
            bgColor = `bg-${step.color}-500`;
            borderColor = `border-${step.color}-500`;
            textColor = 'text-white';
            labelColor = 'text-slate-700';
        } else if (isCurrent) {
            ringColor = `ring-${step.color}-200`;
            bgColor = 'bg-white';
            borderColor = `border-${step.color}-500`;
            textColor = `text-${step.color}-500`;
            labelColor = `text-${step.color}-600`;
        }
        
        return { ringColor, bgColor, borderColor, textColor, labelColor };
    };

    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => {
                const { ringColor, bgColor, borderColor, textColor, labelColor } = getStepClasses(step, index);
                const isCompleted = currentStep > index + 1;

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ring-4 ${ringColor} ${bgColor} ${borderColor} ${textColor}`}>
                                {isCompleted ? <CheckCircleIcon /> : index + 1}
                            </div>
                            <p className={`mt-2 text-xs font-semibold w-24 transition-all duration-300 ${labelColor}`}>
                                {step.name}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-auto h-1 mx-2 transition-all duration-500 ${currentStep > index + 1 ? `bg-${steps[index+1].color}-500` : 'bg-slate-300'}`}></div>
                        )}
                    </React.Fragment>
                )
            })}
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

    const handleNext = () => {
        if (step === 1 && educatorPerspective.trim()) {
            setStep(2);
        } else if (step === 2 && subject.trim()) {
            setStep(3);
        } else {
            const inputId = step === 1 ? 'educator-perspective' : 'subject-area';
            const input = document.getElementById(inputId);
            if(input) {
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
        createNewBlueprint({ educatorPerspective, subject, ageGroup, initialMaterials });
    };

    useEffect(() => {
        const handleEsc = (event) => {
          if (event.keyCode === 27) onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onCancel]);

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">The Educator's Notebook</h2>
                            <p className="text-slate-500 max-w-md mx-auto">Let's start with your perspective. Why this topic? What's the story or passion behind it?</p>
                        </div>
                        <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-orange-200 p-2 rounded-full"><EditIcon /></div>
                                <div>
                                    <label htmlFor="educator-perspective" className="block text-lg font-bold text-orange-900">What's your motivation or initial thought? <span className="text-red-500">*</span></label>
                                    <p className="text-sm text-orange-800 mb-3">This helps us understand your vision. Think of it as a journal entry.</p>
                                    <textarea
                                      id="educator-perspective"
                                      value={educatorPerspective}
                                      onChange={(e) => setEducatorPerspective(e.target.value)}
                                      className="w-full px-4 py-3 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg h-32 resize-none"
                                      placeholder="e.g., 'I've always been fascinated by how cities evolve...' or 'My students are struggling to see the relevance of history...'"
                                      autoFocus
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                 return (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">The Topic & Materials</h2>
                            <p className="text-slate-500 max-w-md mx-auto">Now, let's distill your perspective into a core topic and note any initial resources you have in mind.</p>
                        </div>
                        <div className="bg-teal-50 border-l-4 border-teal-400 p-6 rounded-lg space-y-6">
                            {/* Subject Area Input */}
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-teal-200 p-2 rounded-full"><LightbulbIcon /></div>
                                <div>
                                    <label htmlFor="subject-area" className="block text-lg font-bold text-teal-900">What is the core subject or topic? <span className="text-red-500">*</span></label>
                                    <p className="text-sm text-teal-800 mb-3">This will be the title of our blueprint.</p>
                                    <input
                                      type="text"
                                      id="subject-area"
                                      value={subject}
                                      onChange={(e) => setSubject(e.target.value)}
                                      className="w-full px-4 py-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
                                      placeholder="e.g., Urban Planning, The Cold War, Marine Biology"
                                      autoFocus
                                    />
                                </div>
                            </div>
                            {/* Initial Materials Input */}
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-teal-200 p-2 rounded-full invisible"></div>
                                <div>
                                    <label htmlFor="initial-materials" className="block text-lg font-bold text-teal-900">Any initial ideas on materials or resources?</label>
                                    <p className="text-sm text-teal-800 mb-3">Optional: list any articles, books, or videos you're already thinking of.</p>
                                    <textarea
                                      id="initial-materials"
                                      value={initialMaterials}
                                      onChange={(e) => setInitialMaterials(e.target.value)}
                                      className="w-full px-4 py-3 border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-base h-24 resize-none"
                                      placeholder="e.g., 'The first chapter of 'The Death and Life of Great American Cities' by Jane Jacobs...'"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-fade-in">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">The Audience</h2>
                            <p className="text-slate-500 max-w-md mx-auto">Finally, who are the learners we're designing this for?</p>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 bg-blue-200 p-2 rounded-full"><UsersIcon /></div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900">Who is this project for? <span className="text-red-500">*</span></h3>
                                    <div className="mt-4">
                                        <label htmlFor="age-group" className="block text-sm font-medium text-slate-700 mb-1">Target Age Group</label>
                                        <select id="age-group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500">
                                          <option>Ages 5-7</option>
                                          <option>Ages 8-10</option>
                                          <option>Ages 11-14</option>
                                          <option>Ages 15-18</option>
                                          <option>Ages 18+</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-slate-100 overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                 <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
                    <StepIndicator currentStep={step} />
                    {renderStepContent()}
                    <div className="mt-8 pt-6 border-t flex justify-between items-center">
                        <div>
                            {step > 1 && (
                                <button type="button" className="px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900" onClick={() => setStep(step - 1)}>
                                    &larr; Back
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button type="button" className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md" onClick={onCancel}>
                                Cancel
                            </button>
                            {step < 3 ? (
                                <button type="button" className="px-8 py-3 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md" onClick={handleNext}>
                                    Next &rarr;
                                </button>
                            ) : (
                                <button type="button" className="px-8 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2" onClick={handleCreate}>
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
