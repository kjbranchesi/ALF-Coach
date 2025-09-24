import React from 'react';

interface PolishPanelProps {
  onClose: () => void;
}

const PolishPanel: React.FC<PolishPanelProps> = ({ onClose }) => {
  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Polish checklist</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Close
        </button>
      </div>

      <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <div>
          <p className="font-medium">Standards</p>
          <p>Add or attach standards when you are ready to share broadly.</p>
        </div>
        <div>
          <p className="font-medium">Rubric</p>
          <p>Drop a rubric snapshot or quick criteria table once the project solidifies.</p>
        </div>
        <div>
          <p className="font-medium">Feasibility</p>
          <p>Capture logistics, partnerships, and timing notes before sending to colleagues.</p>
        </div>
      </div>
    </section>
  );
};

export default PolishPanel;
