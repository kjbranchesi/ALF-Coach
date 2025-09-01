import React, { useEffect, useState } from 'react';
import { Lightbulb, Map, Target, X } from 'lucide-react';

interface Props {
  storageKey?: string; // localStorage key to remember dismissal
}

export const ALFProcessRibbon: React.FC<Props> = ({ storageKey = 'alf_ribbon_dismissed' }) => {
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === 'true');
    } catch {}
  }, [storageKey]);

  if (dismissed) return null;

  return (
    <div className="px-4 pt-2">
      <div className="glass-squircle dark glass-border-selected border-0 px-4 py-3 flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
        <span className="font-semibold text-gray-900 dark:text-gray-100">Active Learning Framework</span>
        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <Lightbulb className="w-4 h-4 text-amber-500" /> Ideation
        </span>
        <span className="text-gray-400">•</span>
        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <Map className="w-4 h-4 text-blue-500" /> Learning Journey
        </span>
        <span className="text-gray-400">•</span>
        <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
          <Target className="w-4 h-4 text-green-600" /> Deliverables
        </span>
        <a
          className="ml-auto text-xs underline text-blue-600 dark:text-blue-400 hover:opacity-80"
          href="/how-it-works"
        >
          How it works
        </a>
        <button
          className="ml-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Dismiss overview"
          onClick={() => {
            try { localStorage.setItem(storageKey, 'true'); } catch {}
            setDismissed(true);
          }}
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
