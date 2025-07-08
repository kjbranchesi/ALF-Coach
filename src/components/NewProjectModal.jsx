// src/components/NewProjectModal.jsx

import React, { useState, useEffect } from 'react';

export default function NewProjectModal({ isOpen, onClose, onCreate }) {
  const [ageGroup, setAgeGroup] = useState('Ages 11-14');

  const handleCreate = () => {
    onCreate(ageGroup);
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
        {/* FIX: Changed UI text from "Studio Project" to "Project" */}
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Create a New Project</h2>
        <p className="text-slate-500 mb-6">First, let's set the stage. Who are you designing for?</p>
        
        <div className="space-y-4">
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
