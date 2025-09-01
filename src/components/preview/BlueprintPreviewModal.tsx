import React from 'react';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  blueprint?: any;
}

export const BlueprintPreviewModal: React.FC<Props> = ({ open, onClose, blueprint }) => {
  if (!open) return null;
  const ideation = blueprint?.ideation || {};
  const journey = blueprint?.journey || {};
  const deliverables = blueprint?.deliverables || {};
  const wizard = blueprint?.wizardData || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[min(92vw,900px)] max-h-[85vh] overflow-y-auto glass-squircle p-5 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold">Project Blueprint Preview</h3>
          <button className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="text-sm text-gray-700 dark:text-gray-200 space-y-4">
          <section>
            <h4 className="font-semibold">Context</h4>
            <p>Subjects: {Array.isArray(wizard.subjects) ? wizard.subjects.join(', ') : wizard.subject}</p>
            <p>Grade: {wizard.gradeLevel || '—'} • Duration: {wizard.duration || '—'}</p>
            {wizard.projectTopic && <p>Topic: {wizard.projectTopic}</p>}
            {wizard.learningGoals && <p>Goals: {wizard.learningGoals}</p>}
          </section>

          <section>
            <h4 className="font-semibold">Ideation</h4>
            <p>Big Idea: {ideation.bigIdea || '—'}</p>
            <p>Essential Question: {ideation.essentialQuestion || '—'}</p>
            <p>Challenge: {ideation.challenge || '—'}</p>
          </section>

          <section>
            <h4 className="font-semibold">Learning Journey</h4>
            <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">{JSON.stringify(journey, null, 2)}</pre>
          </section>

          <section>
            <h4 className="font-semibold">Deliverables</h4>
            <pre className="whitespace-pre-wrap text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">{JSON.stringify(deliverables, null, 2)}</pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BlueprintPreviewModal;

