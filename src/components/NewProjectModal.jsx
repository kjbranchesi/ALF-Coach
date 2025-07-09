// src/components/NewProjectModal.jsx

import React, { useState, useEffect } from 'react';

export default function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [ageGroup, setAgeGroup] = useState('Ages 11-14');
  // Add state for the new fields
  const [projectScope, setProjectScope] = useState('A Full Course/Studio');
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');

  const handleCreate = () => {
    // Pass all the new data back to the create function
    onCreate({ ageGroup, projectScope, subject, location });
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in"
        onClick={onClose} 
    >
      <div 
        className="relative w-full max-w-lg p-8 m-4 bg-white rounded-2xl shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()} 
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create a New Project</h2>
        <p className="text-slate-500 mb-6">Let's set the stage. A little context helps the AI coach provide much better guidance.</p>
        
        <div className="space-y-4">
          {/* Project Scope Dropdown */}
          <div>
            <label htmlFor="project-scope" className="block text-sm font-medium text-slate-700 mb-1">
              Project Scope
            </label>
            <select
              id="project-scope"
              name="project-scope"
              value={projectScope}
              onChange={(e) => setProjectScope(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option>A Full Course/Studio</option>
              <option>A Single Project/Assignment</option>
            </select>
          </div>

          {/* Target Age Group Dropdown */}
          <div>
            <label htmlFor="age-group" className="block text-sm font-medium text-slate-700 mb-1">
              Target Age Group
            </label>
            <select
              id="age-group"
              name="age-group"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            >
              <option>Ages 5-7</option>
              <option>Ages 8-10</option>
              <option>Ages 11-14</option>
              <option>Ages 15-18</option>
              <option>Ages 18+</option>
            </select>
          </div>

          {/* Subject Area Input */}
          <div>
            <label htmlFor="subject-area" className="block text-sm font-medium text-slate-700 mb-1">
              Subject Area <span className="text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="subject-area"
              name="subject-area"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., AP US History, Marine Biology, Art"
            />
          </div>

          {/* Location Input */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">
              Location <span className="text-slate-400">(Optional)</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Scotland, UK; California, USA"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md"
            onClick={handleCreate}
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};
