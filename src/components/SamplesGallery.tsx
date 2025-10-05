import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Clock, BookOpen } from 'lucide-react';
import { listProjectsV2 } from '../utils/showcaseV2-registry';

export default function SamplesGallery() {
  const navigate = useNavigate();
  const allProjects = listProjectsV2();
  const [band, setBand] = useState<'All' | 'ES' | 'MS' | 'HS'>('All');
  const [subject, setSubject] = useState<string>('All');

  const subjects = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => p.subjects.forEach(s => set.add(s)));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allProjects]);

  const projects = useMemo(() => {
    return allProjects.filter(p => (band === 'All' || p.gradeBand === band) && (subject === 'All' || p.subjects.includes(subject)));
  }, [allProjects, band, subject]);

  return (
    <div className="relative min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,118,255,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-32">
        <header className="text-center mb-16 space-y-3">
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white mb-1 tracking-tight">
            Alf Studio Project Showcase
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Explore projects designed inside Alf Studio—the planning builder educators use to shape full learning arcs. Adapt one for your community or remix the flow, deliverables, and supports for your learners.
          </p>
        </header>

        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Curated Projects</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              Each project was drafted inside the Alf Project Builder to demonstrate what you can produce in a focused planning session. Explore the full arc, grab what helps, and remix the flow, assignments, or materials for your learners.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="band" className="text-sm text-slate-600 dark:text-slate-300">Grade band</label>
              <select id="band" className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" value={band} onChange={(e) => setBand(e.target.value as any)}>
                {['All','ES','MS','HS'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="subject" className="text-sm text-slate-600 dark:text-slate-300">Subject</label>
              <select id="subject" className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" value={subject} onChange={(e) => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">Showcase projects coming soon</h3>
              <p className="text-slate-600">We’re rebuilding the library. Check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-fr">
              {projects.map(project => {
                const canShowImage = typeof project.image === 'string' && (project.image.startsWith('/') || project.image.startsWith('http') || project.image.startsWith('data:'));
                const subjectPreview = project.subjects.slice(0, 4).join(', ');
                const subjectOverflow = project.subjects.length > 4;

                return (
                <article
                  key={project.id}
                  className="squircle-card group flex flex-col h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)] hover:scale-[1.01] active:scale-[0.99] overflow-hidden">
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 sm:h-48 overflow-hidden">
                    {canShowImage ? (
                      <img
                        src={project.image}
                        alt={`${project.title} hero`}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-4 p-6 sm:p-7 flex-1">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        <span className="brand-chip">
                          <Users className="w-4 h-4" />
                          {project.gradeBand}
                        </span>
                        <span className="brand-chip">
                          <Clock className="w-4 h-4" />
                          {project.timeframe}
                        </span>
                        {project.subjects.length > 0 && (
                          <span className="brand-chip max-w-full">
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {subjectPreview}{subjectOverflow ? `, +${project.subjects.length - 4} more` : ''}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 mt-auto">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(59,130,246,0.25)] transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onClick={() => navigate(`/app/showcase/${project.id}`)}
                      >
                        View project
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
