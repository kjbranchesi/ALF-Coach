import React, { useEffect, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

interface Props {
  storageKey?: string; // remember dismissal
}

const STEPS = [
  {
    title: 'Design with ALF',
    text: 'Create a project in 3 stages: Ideation → Learning Journey → Deliverables.',
  },
  {
    title: 'Start with your context',
    text: 'Pick subjects and grade level so suggestions match your classroom.',
  },
  {
    title: 'Chat to build the plan',
    text: 'Answer one question at a time. We save as you go and show the next step.',
  },
  {
    title: 'Export and share',
    text: 'Preview your blueprint, download as PDF, and share with your team.',
  },
];

export const TourOverlay: React.FC<Props> = ({ storageKey = 'alf_first_run_tour' }) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(storageKey) === 'done';
      if (!seen) setOpen(true);
    } catch {}
  }, [storageKey]);

  if (!open) return null;
  const step = STEPS[index];

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute inset-0 bg-black/30" />
      <div className="pointer-events-auto absolute left-1/2 top-6 -translate-x-1/2 w-[min(92vw,560px)] glass-squircle p-4 border border-gray-200 dark:border-gray-700 shadow-soft">
        <div className="flex items-start gap-2">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{step.text}</p>
          </div>
          <button
            onClick={() => { try { localStorage.setItem(storageKey, 'done'); } catch {}; setOpen(false); }}
            className="ml-auto p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close tour"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
            ))}
          </div>
          <button
            onClick={() => {
              if (index < STEPS.length - 1) setIndex(index + 1);
              else { try { localStorage.setItem(storageKey, 'done'); } catch {}; setOpen(false); }
            }}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-600 text-white text-sm hover:bg-primary-700"
          >
            {index < STEPS.length - 1 ? 'Next' : 'Finish'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourOverlay;

