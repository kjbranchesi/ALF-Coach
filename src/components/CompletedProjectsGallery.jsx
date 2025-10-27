/**
 * CompletedProjectsGallery
 *
 * Horizontal scrollable catalogue of completed projects
 * Celebrates accomplishments and provides quick access
 */

import React from 'react';
import { CheckCircle, ExternalLink, Copy, Archive, Calendar } from 'lucide-react';
import { getSubjectTheme } from '../utils/projectThemes';

function formatDate(value) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function CompletedProjectsGallery({ projects, onOpen, onDuplicate, onArchive }) {
  if (!projects || projects.length === 0) {
    return null; // Don't show section if no completed projects
  }

  return (
    <section
      className="space-y-4"
      role="region"
      aria-label="Completed projects"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
            <CheckCircle className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              Completed Projects
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} ready to implement
            </p>
          </div>
        </div>

        {projects.length > 4 && (
          <button
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            onClick={() => {/* Could navigate to dedicated gallery view */}}
          >
            View All →
          </button>
        )}
      </div>

      {/* Horizontal scrollable gallery */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {projects.map((project) => {
            const theme = getSubjectTheme(project.wizardData?.primarySubject || project.wizardData?.subject);
            const completedDate = project.stageStatus?.review === 'completed'
              ? project.updatedAt
              : project.updatedAt;

            return (
              <article
                key={project.id}
                className="flex-shrink-0 w-72 squircle-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 hover:shadow-lg transition-all duration-200 group"
              >
                {/* Card Content */}
                <div className="p-5 space-y-4">
                  {/* Header with badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
                        {project.title || 'Untitled Project'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${theme.badgeBg} ${theme.badgeText}`}>
                          {project.wizardData?.primarySubject || project.wizardData?.subject || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Completion badge */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" aria-label="Completed" />
                    </div>
                  </div>

                  {/* Project metadata */}
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {project.wizardData?.ageGroup && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">🎓</span>
                        <span>{project.wizardData.ageGroup}</span>
                      </div>
                    )}
                    {completedDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Completed {formatDate(completedDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => onOpen?.(project)}
                      className="flex-1 squircle-button flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                      aria-label={`View ${project.title}`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onDuplicate?.(project)}
                      className="squircle-button p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-200"
                      aria-label={`Duplicate ${project.title}`}
                      title="Duplicate project"
                    >
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      onClick={() => onArchive?.(project)}
                      className="squircle-button p-2 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition-colors duration-200"
                      aria-label={`Archive ${project.title}`}
                      title="Archive project"
                    >
                      <Archive className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Scroll hint for mobile */}
        {projects.length > 1 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent w-12 h-full" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
