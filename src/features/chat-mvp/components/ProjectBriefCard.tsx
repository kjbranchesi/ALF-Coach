import React from 'react';
import { ChevronDown, ChevronUp, MapPin, Timer, UserSquare2 } from 'lucide-react';
import type { Stage } from '../domain/stages';

type QuickEditField = 'duration' | 'gradeLevel' | 'projectTopic';

type ProjectBriefCardProps = {
  subjects: string[];
  gradeLevel: string;
  duration: string;
  projectTopic: string;
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string;
  collapsed: boolean;
  currentStage: Stage;
  onToggle(): void;
  onQuickEdit?(field: QuickEditField): void;
};

const metaIconClasses = 'w-3.5 h-3.5 text-primary-500';

export function ProjectBriefCard({
  subjects,
  gradeLevel,
  duration,
  projectTopic,
  bigIdea,
  essentialQuestion,
  challenge,
  collapsed,
  currentStage,
  onToggle,
  onQuickEdit
}: ProjectBriefCardProps) {
  const subjectLine = subjects?.length ? subjects.join(', ') : 'Interdisciplinary';
  const summaryItems = [
    { icon: <UserSquare2 className={metaIconClasses} />, label: gradeLevel || 'Grade band TBD', field: 'gradeLevel' as const },
    { icon: <Timer className={metaIconClasses} />, label: duration || 'Timeline TBD', field: 'duration' as const },
    { icon: <MapPin className={metaIconClasses} />, label: projectTopic || 'Project focus TBD', field: 'projectTopic' as const }
  ];

  const stageAnchor: Record<Stage, string> = {
    BIG_IDEA: 'Big Idea',
    ESSENTIAL_QUESTION: 'Essential Question',
    CHALLENGE: 'Challenge',
    JOURNEY: 'Learning Journey',
    DELIVERABLES: 'Deliverables'
  };

  return (
    <section className="rounded-3xl border border-gray-200/70 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/70 backdrop-blur-sm shadow-sm mb-4">
      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Project Context</p>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {subjectLine} • {stageAnchor[currentStage]}
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 dark:text-primary-300"
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          {collapsed ? 'Details' : 'Hide'}
        </button>
      </header>
      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 text-[12px] text-gray-600 dark:text-gray-300">
          <div className="flex flex-wrap items-center gap-3">
            {summaryItems.map(({ icon, label, field }) => (
              <span key={field} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 px-3 py-1.5">
                {icon}
                <span className="font-medium text-gray-700 dark:text-gray-200 truncate max-w-[140px]" title={label}>{label}</span>
                {onQuickEdit ? (
                  <button
                    type="button"
                    onClick={() => onQuickEdit(field)}
                    className="ml-1 text-[10px] font-semibold text-primary-600 dark:text-primary-300"
                  >
                    Edit
                  </button>
                ) : null}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <SnapshotRow label="Big Idea" value={bigIdea} placeholder="Not defined yet" />
            <SnapshotRow label="Essential Question" value={essentialQuestion} placeholder="Not defined yet" />
            <SnapshotRow label="Challenge" value={challenge} placeholder="Not defined yet" />
          </div>
        </div>
      )}
    </section>
  );
}

function SnapshotRow({ label, value, placeholder }: { label: string; value?: string; placeholder: string }) {
  const display = value?.trim();
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-[12px] leading-snug ${display ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600 italic'}`}>
        {display || placeholder}
      </p>
    </div>
  );
}

export type { ProjectBriefCardProps, QuickEditField };
