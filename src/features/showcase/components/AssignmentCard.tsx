import React, { useState } from 'react';
import type { AssignmentCard as AssignmentCardType } from '../../../types/showcaseV2';
import { getAssignmentColor } from '../utils/phaseColors';

interface AssignmentCardProps {
  assignment: AssignmentCardType;
  weeksUsedIn: string[];
}

export default function AssignmentCard({ assignment, weeksUsedIn }: AssignmentCardProps) {
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const assignmentColor = getAssignmentColor(assignment.id);

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const isStudentExpanded = expandedSections.studentDirections;
  const isTeacherExpanded = expandedSections.teacherSetup;

  return (
    <div
      className="group relative squircle-card border border-slate-200/70 dark:border-slate-700/70 bg-white dark:bg-slate-900 shadow-[0_4px_16px_rgba(15,23,42,0.1)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.15)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden scroll-mt-24"
      id={`assignment-${assignment.id}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: assignmentColor }} />

      <div className="p-6 sm:p-7 space-y-5">
        <div className="space-y-3 pb-5 border-b border-slate-200/70 dark:border-slate-700/70">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-bold tracking-wide shadow-sm">
                {assignment.id}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                {assignment.title}
              </h3>
            </div>
            {assignment.aiOptional && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/30 border border-purple-300/60 dark:border-purple-600/60 text-purple-800 dark:text-purple-300 text-xs font-semibold tracking-wide">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>AI Optional</span>
              </div>
            )}
          </div>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            {assignment.summary}
          </p>
          {weeksUsedIn.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Used in:
              </span>
              {weeksUsedIn.map(week => (
                <span
                  key={week}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-100/70 dark:bg-primary-900/30 border border-primary-300/50 dark:border-primary-700/50 text-primary-800 dark:text-primary-300 text-xs font-semibold"
                >
                  {week}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-cyan-50/30 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/10 border-2 border-emerald-300/50 dark:border-emerald-700/50">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-200/70 dark:bg-emerald-800/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-emerald-800 dark:text-emerald-300">
              Learning Goals (Success Criteria)
            </h4>
          </div>
          <div className="space-y-2.5">
            {assignment.successCriteria.map((criterion, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-md bg-emerald-200/70 dark:bg-emerald-800/40 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-semibold text-emerald-900 dark:text-emerald-100 leading-snug">
                  {criterion}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-violet-50/60 to-purple-50/40 dark:from-violet-950/25 dark:to-purple-950/15 border border-violet-200/50 dark:border-violet-800/50">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-violet-200/60 dark:border-violet-700/60">
              <div className="w-6 h-6 rounded-md bg-violet-200/60 dark:bg-violet-800/50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-violet-700 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-violet-800 dark:text-violet-300">
                For Students
              </h4>
            </div>
            <div className="space-y-2.5">
              {assignment.studentDirections.slice(0, isStudentExpanded ? undefined : 3).map((direction, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm leading-snug">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-violet-200/70 dark:bg-violet-800/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-800 dark:text-violet-300">{idx + 1}</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{direction}</span>
                </div>
              ))}
              {assignment.studentDirections.length > 3 && (
                <button
                  onClick={() => toggleSection('studentDirections')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-700 dark:text-violet-400 hover:bg-violet-100/50 dark:hover:bg-violet-900/30 transition-colors duration-200"
                  aria-expanded={isStudentExpanded}
                  aria-controls="student-directions-full"
                >
                  <span>{isStudentExpanded ? '− Show less' : `+ ${assignment.studentDirections.length - 3} more steps`}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isStudentExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-blue-50/60 to-indigo-50/40 dark:from-blue-950/25 dark:to-indigo-950/15 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2.5 mb-3 pb-2 border-b border-blue-200/60 dark:border-blue-700/60">
              <div className="w-6 h-6 rounded-md bg-blue-200/60 dark:bg-blue-800/50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-blue-800 dark:text-blue-300">
                For Teachers
              </h4>
            </div>
            <div className="space-y-2.5">
              {assignment.teacherSetup.slice(0, isTeacherExpanded ? undefined : 3).map((setup, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm leading-snug">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-blue-200/70 dark:bg-blue-800/50 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300">{idx + 1}</span>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{setup}</span>
                </div>
              ))}
              {assignment.teacherSetup.length > 3 && (
                <button
                  onClick={() => toggleSection('teacherSetup')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors duration-200"
                  aria-expanded={isTeacherExpanded}
                  aria-controls="teacher-setup-full"
                >
                  <span>{isTeacherExpanded ? '− Show less' : `+ ${assignment.teacherSetup.length - 3} more steps`}</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${isTeacherExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-slate-200/70 dark:bg-slate-700/50 flex items-center justify-center">
              <svg className="w-3 h-3 text-slate-700 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-400">
              Evidence of Learning
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {assignment.evidence.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {assignment.aiOptional && (
          <div className="space-y-2">
            <button
              onClick={() => setShowAIDetails(!showAIDetails)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/15 border border-purple-200/60 dark:border-purple-700/60 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/25 transition-colors duration-200 group/ai"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">AI Integration Options</span>
              </div>
              <svg className={`w-4 h-4 text-purple-600 dark:text-purple-400 transition-transform ${showAIDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showAIDetails && (
              <div className="space-y-3 px-4 py-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200/40 dark:border-purple-800/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">Tool Use</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {assignment.aiOptional.toolUse}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">Critique</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {assignment.aiOptional.critique}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6" />
                    </svg>
                    <span className="text-xs uppercase tracking-wider font-bold text-purple-700 dark:text-purple-400">No AI Alternative</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                    {assignment.aiOptional.noAIAlt}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {assignment.checkpoint && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-700/60">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-200/70 dark:bg-amber-800/50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 mb-1">
                Checkpoint
              </div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 leading-snug">
                {assignment.checkpoint}
              </p>
            </div>
          </div>
        )}

        {assignment.safety && assignment.safety.length > 0 && (
          <div className="space-y-2 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border-2 border-red-300/60 dark:border-red-700/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-red-200/70 dark:bg-red-800/50 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-700 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-red-800 dark:text-red-300">
                Safety & Considerations
              </h4>
            </div>
            <ul className="space-y-1">
              {assignment.safety.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-900 dark:text-red-200">
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-red-500 dark:bg-red-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
