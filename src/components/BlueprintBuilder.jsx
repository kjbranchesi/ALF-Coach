// src/components/BlueprintBuilder.jsx

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

// --- Icon Components ---
const ArrowRight = () => <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>;
const CheckCircle = () => <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const InfoIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

// --- Framework Explanation (Left Column) ---
const FrameworkGuide = () => (
    <div className="bg-slate-50 p-8 rounded-2xl h-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Your Design Partner</h2>
        <p className="text-slate-600 mb-8">
            Welcome to ProjectCraft. We'll co-design a transformative learning experience using the <strong>Active Learning Framework (ALF)</strong>. This structured process ensures your final syllabus is innovative, engaging, and pedagogically sound.
        </p>
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-4 border-white shadow-md">1</div>
                <div>
                    <h3 className="font-bold text-slate-800">Ideation: The Spark</h3>
                    <p className="text-sm text-slate-600">We'll transform your initial topic into a compelling project by defining a core challenge and an essential question.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-4 border-white shadow-md">2</div>
                <div>
                    <h3 className="font-bold text-slate-800">Learning Journey</h3>
                    <p className="text-sm text-slate-600">We'll architect the student experience, outlining the modules, activities, and skills they'll develop.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-4 border-white shadow-md">3</div>
                <div>
                    <h3 className="font-bold text-slate-800">Student Deliverables</h3>
                    <p className="text-sm text-slate-600">We'll design authentic assignments and clear rubrics to guide student work and assess their learning.</p>
                </div>
            </div>
        </div>
    </div>
);

export default function BlueprintBuilder({ onCancel }) {
    const { createNewBlueprint } = useAppContext();
    const [subject, setSubject] = useState('');
    const [ageGroup, setAgeGroup] = useState('Ages 11-14');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!subject.trim()) {
            setError('Please provide a subject or topic to get started.');
            return;
        }
        createNewBlueprint({ subject, ageGroup });
    };

    return (
        <div className="animate-fade-in p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Left Column */}
                <FrameworkGuide />

                {/* Right Column */}
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Create a New Blueprint</h1>
                    <p className="text-slate-500 mb-8">Let's start with two key ingredients.</p>

                    <div className="space-y-6">
                        {/* Input 1: Subject */}
                        <div>
                            <label htmlFor="subject-area" className="block text-lg font-semibold text-slate-700 mb-2">
                                1. What is the core subject or topic?
                            </label>
                            <input
                                type="text"
                                id="subject-area"
                                value={subject}
                                onChange={(e) => { setSubject(e.target.value); setError(''); }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                                placeholder="e.g., The Cold War, Marine Biology, The Great Gatsby"
                                autoFocus
                            />
                            {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-2"><InfoIcon/>{error}</p>}
                        </div>

                        {/* Input 2: Age Group */}
                        <div>
                            <label htmlFor="age-group" className="block text-lg font-semibold text-slate-700 mb-2">
                                2. Who are the learners?
                            </label>
                            <select 
                                id="age-group" 
                                value={ageGroup} 
                                onChange={(e) => setAgeGroup(e.target.value)} 
                                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-lg"
                            >
                                <option>Ages 5-7</option>
                                <option>Ages 8-10</option>
                                <option>Ages 11-14</option>
                                <option>Ages 15-18</option>
                                <option>Ages 18+</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="mt-10 pt-6 border-t flex justify-end items-center gap-4">
                        <button onClick={onCancel} className="text-slate-600 font-semibold px-6 py-3 rounded-md hover:bg-slate-100">
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreate} 
                            className="bg-purple-600 text-white font-bold px-8 py-3 rounded-md hover:bg-purple-700 transition-all transform hover:scale-105 flex items-center"
                        >
                            Start Designing <ArrowRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
