import React from 'react';

interface Props {
  blueprint: any;
}

export const ReviewChecklist: React.FC<Props> = ({ blueprint }) => {
  const ideation = blueprint?.ideation || {};
  const journey = blueprint?.journey || {};
  const deliverables = blueprint?.deliverables || {};

  const items: { label: string; done: boolean }[] = [
    { label: 'Big Idea', done: !!ideation.bigIdea },
    { label: 'Essential Question', done: !!ideation.essentialQuestion },
    { label: 'Challenge', done: !!ideation.challenge },
    { label: 'Phases', done: Array.isArray(journey.phases) ? journey.phases.length > 0 : !!journey.phases },
    { label: 'Activities', done: !!journey.activities },
    { label: 'Resources', done: !!journey.resources },
    { label: 'Milestones (3+)', done: Array.isArray(deliverables.milestones) ? deliverables.milestones.length >= 3 : false },
    { label: 'Rubric Criteria', done: !!deliverables?.rubric?.criteria?.length },
    { label: 'Exhibition Audience', done: !!deliverables?.impact?.audience },
    { label: 'Exhibition Method', done: !!deliverables?.impact?.method }
  ];

  const remaining = items.filter(i => !i.done).length;

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Review Checklist</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${remaining === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {remaining === 0 ? 'Complete' : `${remaining} to go`}
        </span>
      </div>
      <ul className="space-y-1 text-sm">
        {items.map(item => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`inline-block w-2 h-2 rounded-full ${item.done ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
            <span className={`${item.done ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewChecklist;

