import React from 'react';
import type { WeekCard } from '../../../types/showcaseV2';
import { getPhaseColor, getPhaseIcon } from '../utils/phaseColors';
import PhaseBeadge from './PhaseBeadge';
import CheckpointAlert from './CheckpointAlert';

interface RunOfShowCardProps {
  card: WeekCard;
  onAssignmentClick: (assignmentId: string) => void;
}

export default function RunOfShowCard({ card, onAssignmentClick }: RunOfShowCardProps) {
  const phaseColor = getPhaseColor(card.kind);
  const phaseIcon = getPhaseIcon(card.kind);

  return (
    <div
      className="group relative squircle-pure border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-300 overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: phaseColor }} />

      {card.repeatable && (
        <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-xs font-medium text-slate-600 dark:text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Repeatable</span>
        </div>
      )}

      <div className="pl-6 pr-5 py-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {card.weekLabel}
              </h3>
              <PhaseBeadge kind={card.kind} />
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
              {card.focus}
            </p>
          </div>
        </div>

        {card.assignments && card.assignments.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400">
              This week's assignments
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {card.assignments.map((assignmentId) => (
                <button
                  key={assignmentId}
                  onClick={() => onAssignmentClick(assignmentId)}
                  className="group/assignment inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-primary-900/30 dark:to-primary-800/20 border border-primary-200/60 dark:border-primary-700/60 text-primary-700 dark:text-primary-300 text-sm font-semibold cursor-pointer hover:from-primary-100 hover:to-primary-200/70 dark:hover:from-primary-800/40 dark:hover:to-primary-700/30 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200"
                  aria-label={`Jump to assignment ${assignmentId}`}
                >
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover/assignment:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {assignmentId}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 py-4">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Deliverables
          </div>
          <div className="space-y-2">
            {card.deliverables.map((deliverable, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{deliverable}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <div className="space-y-2.5 p-4 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 border border-blue-200/40 dark:border-blue-800/40">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-200/50 dark:bg-blue-800/50 flex items-center justify-center">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              Teacher
            </div>
            <div className="space-y-2">
              {card.teacher.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm leading-snug text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-blue-400 dark:bg-blue-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 p-4 rounded-xl bg-gradient-to-br from-violet-50/50 to-violet-100/30 dark:from-violet-950/20 dark:to-violet-900/10 border border-violet-200/40 dark:border-violet-800/40">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-violet-700 dark:text-violet-400 mb-3">
              <div className="w-5 h-5 rounded-md bg-violet-200/50 dark:bg-violet-800/50 flex items-center justify-center">
                <span role="img" aria-hidden="true" className="text-xs">
                  {phaseIcon}
                </span>
              </div>
              Students
            </div>
            <div className="space-y-2">
              {card.students.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm leading-snug text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-violet-400 dark:bg-violet-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {card.checkpoint && card.checkpoint.length > 0 && <CheckpointAlert checkpoints={card.checkpoint} />}
      </div>
    </div>
  );
}
