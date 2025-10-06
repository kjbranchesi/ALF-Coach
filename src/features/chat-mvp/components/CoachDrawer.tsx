import React, { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

export type CoachAction = {
  id: string;
  label: string;
  onSelect(): void;
};

type CoachDrawerProps = {
  actions: CoachAction[];
  title?: string;
};

export function CoachDrawer({ actions, title = 'Coach suggestions' }: CoachDrawerProps) {
  const [open, setOpen] = useState(false);

  if (!actions.length) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-72 max-w-[90vw]">
      {open ? (
        <div className="rounded-3xl border border-primary-200/70 bg-white/95 dark:bg-gray-900/95 shadow-xl shadow-primary/20 overflow-hidden">
          <header className="flex items-center justify-between gap-2 bg-primary-600 px-4 py-3 text-white">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="w-4 h-4" />
              {title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </header>
          <div className="px-4 py-3 space-y-2 text-sm text-gray-700 dark:text-gray-200">
            {actions.map(action => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  action.onSelect();
                }}
                className="w-full rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 px-3 py-2 text-left leading-snug hover:border-primary-300 hover:text-primary-700"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary-700"
        >
          <Lightbulb className="w-4 h-4" />
          Coach tips
        </button>
      )}
    </div>
  );
}

