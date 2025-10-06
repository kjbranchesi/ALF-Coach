import React from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Edit2 } from 'lucide-react';

export type JourneyPreviewCardProps = {
  phases: Array<{
    name: string;
    duration?: string;
    summary?: string;
    activities: string[];
  }>;
  onAcceptAll(): void;
  onMakeShorter(): void;
  onDifferentApproach(): void;
  onRenamePhase(index: number, name: string): void;
  onReorderPhase(from: number, to: number): void;
};

export function JourneyPreviewCard({
  phases,
  onAcceptAll,
  onMakeShorter,
  onDifferentApproach,
  onRenamePhase,
  onReorderPhase
}: JourneyPreviewCardProps) {
  const handleRename = (index: number) => {
    const current = phases[index]?.name || '';
    const next = window.prompt('Rename phase', current);
    if (next && next.trim() && next.trim() !== current) {
      onRenamePhase(index, next.trim());
    }
  };

  const handleReorder = (from: number, direction: -1 | 1) => {
    const target = from + direction;
    if (target < 0 || target >= phases.length) {return;}
    onReorderPhase(from, target);
  };

  return (
    <section className="rounded-3xl border border-gray-200/50 dark:border-gray-800/50 bg-white/95 dark:bg-gray-900/80 shadow-lg px-4 py-4 space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-primary-600 dark:text-primary-300">Proposed learning journey</p>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{phases.length} phases mapped</h2>
          <p className="text-[12px] text-gray-600 dark:text-gray-300 mt-1">Review, tweak, then accept or regenerate.</p>
        </div>
        <CheckCircle2 className="w-6 h-6 text-primary-500" />
      </header>

      <ol className="space-y-3">
        {phases.map((phase, index) => (
          <li key={`${phase.name}-${index}`} className="rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-white/90 dark:bg-gray-900/60 px-3 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold text-primary-600 dark:text-primary-300 uppercase">Phase {index + 1}</p>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  {phase.name}
                  {phase.duration ? (
                    <span className="inline-flex items-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-semibold px-2 py-0.5 dark:bg-primary-900/40 dark:text-primary-200">
                      {phase.duration}
                    </span>
                  ) : null}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(index, -1)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                  disabled={index === 0}
                  aria-label="Move phase up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, 1)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                  disabled={index === phases.length - 1}
                  aria-label="Move phase down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRename(index)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Rename phase"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {phase.summary ? (
              <p className="mt-2 text-[12px] text-gray-600 dark:text-gray-300 leading-snug">{phase.summary}</p>
            ) : null}
            {phase.activities?.length ? (
              <ul className="mt-2 space-y-1">
                {phase.activities.map((activity, idx) => (
                  <li key={idx} className="text-[12px] text-gray-600 dark:text-gray-300 flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary-300 dark:bg-primary-500" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>

      <footer className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAcceptAll}
          className="inline-flex items-center rounded-full bg-primary-600 text-white px-4 py-1.5 text-[12px] font-semibold hover:bg-primary-700"
        >
          Yes, use this journey
        </button>
        <button
          type="button"
          onClick={onMakeShorter}
          className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-semibold text-gray-700 hover:border-gray-400"
        >
          Make it shorter
        </button>
        <button
          type="button"
          onClick={onDifferentApproach}
          className="inline-flex items-center rounded-full border border-gray-300 px-4 py-1.5 text-[12px] font-semibold text-gray-700 hover:border-gray-400"
        >
          Different approach
        </button>
      </footer>
    </section>
  );
}
