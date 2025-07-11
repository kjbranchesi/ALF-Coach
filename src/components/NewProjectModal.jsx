// src/components/NewProjectModal.jsx

import React, { useState, useEffect } from 'react';

// --- Icon Components ---
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-amber-500"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-blue-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;

// --- Step Indicator Component ---
const StepIndicator = ({ currentStep }) => {
    const steps = ["The Spark", "The Audience"];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${currentStep >= index + 1 ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                            {currentStep > index + 1 ? <CheckCircleIcon /> : index + 1}
                        </div>
                        <p className={`mt-2 text-xs font-semibold transition-all duration-300 ${currentStep >= index + 1 ? 'text-purple-700' : 'text-slate-500'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-auto h-1 mx-2 transition-all duration-300 ${currentStep > index + 1 ? 'bg-purple-600' : 'bg-slate-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};


export default function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState('');
  const [ageGroup, setAgeGroup] = useState('Ages 11-14');
  const [projectScope, setProjectScope] = useState('A Full Course/Studio');
  
  const handleNext = () => {
    if (step === 1 && subject.trim()) {
        setStep(2);
    } else {
        // Add validation feedback if subject is empty
        const input = document.getElementById('subject-area');
        if(input) {
            input.focus();
            input.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => input.classList.remove('ring-2', 'ring-red-500'), 2000);
        }
    }
  };

  const handleCreate = () => {
    onCreate({ subject, ageGroup, projectScope });
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in"
        onClick={onClose} 
    >
      <div 
        className="relative w-full max-w-2xl p-8 m-4 bg-white rounded-2xl shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()} 
      >
        <StepIndicator currentStep={step} />
        
        {step === 1 && (
            <div className="animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Let's Plant a Seed</h2>
                    <p className="text-slate-500 max-w-md mx-auto">Every great project starts with an idea. What's a topic, theme, or problem you want to explore?</p>
                </div>
                <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-amber-200 p-2 rounded-full"><LightbulbIcon /></div>
                        <div>
                            <label htmlFor="subject-area" className="block text-lg font-bold text-amber-900">What is the core subject or topic?</label>
                            <p className="text-sm text-amber-800 mb-3">This is the most important input to get us started.</p>
                            <input
                              type="text"
                              id="subject-area"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              className="w-full px-4 py-3 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-lg"
                              placeholder="e.g., The Cold War, Marine Biology, The Great Gatsby"
                              autoFocus
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Define The Audience</h2>
                    <p className="text-slate-500 max-w-md mx-auto">A little context about your learners helps us tailor the pedagogical approach.</p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 bg-blue-200 p-2 rounded-full"><UsersIcon /></div>
                        <div>
                            <h3 className="text-lg font-bold text-blue-900">Who is this project for?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="age-group" className="block text-sm font-medium text-slate-700 mb-1">Target Age Group</label>
                                    <select id="age-group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500">
                                      <option>Ages 5-7</option>
                                      <option>Ages 8-10</option>
                                      <option>Ages 11-14</option>
                                      <option>Ages 15-18</option>
                                      <option>Ages 18+</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="project-scope" className="block text-sm font-medium text-slate-700 mb-1">Project Scope</label>
                                    <select id="project-scope" value={projectScope} onChange={(e) => setProjectScope(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500">
                                      <option>A Full Course/Studio</option>
                                      <option>A Single Project/Assignment</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="mt-8 flex justify-between items-center">
            <div>
                {step > 1 && (
                    <button type="button" className="px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900" onClick={() => setStep(step - 1)}>
                        &larr; Back
                    </button>
                )}
            </div>
            <div className="flex gap-3">
                <button type="button" className="px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md" onClick={onClose}>
                    Cancel
                </button>
                {step === 1 && (
                    <button type="button" className="px-8 py-3 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md" onClick={handleNext}>
                        Next &rarr;
                    </button>
                )}
                {step === 2 && (
                    <button type="button" className="px-8 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2" onClick={handleCreate}>
                        <CheckCircleIcon />
                        Create Project
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
