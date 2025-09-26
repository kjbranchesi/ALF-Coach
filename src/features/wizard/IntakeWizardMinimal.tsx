import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntakeWizardMinimal() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [classSize, setClassSize] = useState('');
  const [duration, setDuration] = useState('medium');

  const startBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `new-${Date.now()}`;
    const params = new URLSearchParams();
    params.set('skip', 'true');
    if (subject) params.set('subject', subject);
    if (ageGroup) params.set('ageGroup', ageGroup);
    if (classSize) params.set('classSize', classSize);
    if (duration) params.set('duration', duration);
    navigate(`/app/blueprint/${id}?${params.toString()}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Project Setup</h1>
      <form onSubmit={startBuilding} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" placeholder="e.g., Environmental Science" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age Range</label>
          <input value={ageGroup} onChange={e => setAgeGroup(e.target.value)} required className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" placeholder="e.g., Middle School" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class Size (optional)</label>
            <input value={classSize} onChange={e => setClassSize(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2" placeholder="e.g., 28" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2">
              <option value="short">Short (1–2 weeks)</option>
              <option value="medium">Medium (3–5 weeks)</option>
              <option value="long">Long (6+ weeks)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Start Building</button>
        </div>
      </form>
    </div>
  );
}

