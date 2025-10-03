import React from 'react';

const STAGES: Array<{
  id: number;
  title: string;
  description: string;
}> = [
  {
    id: 1,
    title: 'Big Idea',
    description: 'The transferable concept students should carry forward.'
  },
  {
    id: 2,
    title: 'Essential Question',
    description: 'An inquiry-driving question that keeps learning focused.'
  },
  {
    id: 3,
    title: 'Challenge',
    description: 'An authentic problem and audience that give work purpose.'
  },
  {
    id: 4,
    title: 'Learning Journey',
    description: 'Phases and key activities that build momentum.'
  },
  {
    id: 5,
    title: 'Deliverables',
    description: 'Artifacts, milestones, and rubric cues for quality.'
  }
];

export function StageRoadmapPreview() {
  return (
    <section
      className="rounded-2xl border border-blue-100/70 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/10 px-4 py-5 sm:px-6"
      aria-label="Design roadmap"
    >
      <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-200">
            What happens next
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            We’ll co-design your project in five short moves.
          </p>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-300 font-medium">
          ~12 minutes • Autosaves as you go
        </p>
      </header>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="list">
        {STAGES.map((stage) => (
          <li
            key={stage.id}
            className="flex items-start gap-3 rounded-xl border border-blue-100/80 dark:border-blue-900/30 bg-white/70 dark:bg-gray-900/50 px-3 py-2"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold uppercase text-white">
              {stage.id}
            </span>
            <div className="text-xs text-gray-700 dark:text-gray-300">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{stage.title}</p>
              <p className="leading-snug">{stage.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default StageRoadmapPreview;
