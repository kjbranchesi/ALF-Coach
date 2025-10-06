import React from 'react';
import { ArrowDown, ArrowUp, PenLine, Plus, Trash2 } from 'lucide-react';

export type JourneyPhaseDraft = {
  id: string;
  name: string;
  focus: string;
  activities: string[];
  checkpoint: string;
};

type JourneyBoardProps = {
  phases: JourneyPhaseDraft[];
  selectedId: string | null;
  onSelect(id: string): void;
  onRename(id: string, nextName: string): void;
  onReorder(from: number, to: number): void;
  onAdd(): void;
  onRemove(id: string): void;
};

export function JourneyBoard({
  phases,
  selectedId,
  onSelect,
  onRename,
  onReorder,
  onAdd,
  onRemove
}: JourneyBoardProps) {
  const handleRename = (phase: JourneyPhaseDraft) => {
    const next = window.prompt('Rename phase', phase.name);
    if (!next) {return;}
    const trimmed = next.trim();
    if (!trimmed || trimmed === phase.name) {return;}
    onRename(phase.id, trimmed);
  };

  const handleReorder = (from: number, direction: -1 | 1) => {
    const target = from + direction;
    if (target < 0 || target >= phases.length) {return;}
    onReorder(from, target);
  };

  const handleRemove = (phase: JourneyPhaseDraft) => {
    if (phases.length <= 1) {
      window.alert('Keep at least one phase. Add another before removing this one.');
      return;
    }
    if (window.confirm(`Remove “${phase.name}”?`)) {
      onRemove(phase.id);
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-primary-600 dark:text-primary-300">Journey plan</p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Zoom out: map the learning arc</h2>
          <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-1">
            Reorder or rename phases, then zoom in to edit goals, activities, and checkpoints.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-4 py-2 text-[12px] font-semibold hover:bg-primary-700"
        >
          <Plus className="w-3.5 h-3.5" />
          Add phase
        </button>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {phases.map((phase, index) => {
          const activities = phase.activities.filter(Boolean);
          return (
            <article
              key={phase.id}
              className={`rounded-2xl border ${
                phase.id === selectedId
                  ? 'border-primary-400 shadow-primary/20'
                  : 'border-gray-200/70 dark:border-gray-800/70'
              } bg-white/95 dark:bg-gray-900/70 shadow-sm transition-colors`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-gray-200/60 dark:border-gray-800/60 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Phase {index + 1}</p>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{phase.name || 'Untitled phase'}</h3>
                  {phase.focus ? (
                    <p className="mt-1 text-[12px] text-gray-600 dark:text-gray-300 line-clamp-2">{phase.focus}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(index, -1)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    disabled={index === 0}
                    aria-label="Move phase up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(index, 1)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                    disabled={index === phases.length - 1}
                    aria-label="Move phase down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="px-4 py-3 space-y-3 text-[12px] text-gray-600 dark:text-gray-300">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Activities</p>
                  {activities.length ? (
                    <ul className="mt-1 space-y-1">
                      {activities.slice(0, 3).map((activity, idx) => (
                        <li key={`${phase.id}-activity-${idx}`} className="leading-snug">
                          • {activity}
                        </li>
                      ))}
                      {activities.length > 3 ? (
                        <li className="text-gray-400">+ {activities.length - 3} more</li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className="mt-1 text-gray-400">Add activities when you zoom in.</p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">Checkpoint</p>
                  <p className="mt-1 leading-snug">
                    {phase.checkpoint ? phase.checkpoint : <span className="text-gray-400">Define how students show progress.</span>}
                  </p>
                </div>
              </div>

              <footer className="flex items-center justify-between gap-2 border-t border-gray-200/60 dark:border-gray-800/60 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onSelect(phase.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
                  >
                    <PenLine className="w-3 h-3" />
                    Zoom in
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRename(phase)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-700 hover:border-gray-400"
                  >
                    Rename
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(phase)}
                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-[11px] font-semibold text-red-600 hover:border-red-300"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

