import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Clock, BookOpen, Presentation } from 'lucide-react';
import { listProjectsV2 } from '../utils/showcaseV2-registry';
import './SamplesGallery.css';

export default function SamplesGallery() {
  const navigate = useNavigate();
  const allProjects = listProjectsV2();
  const [band, setBand] = useState<'All' | 'ES' | 'MS' | 'HS'>('All');
  const [subject, setSubject] = useState<string>('All');

  // Helper: expand project subjects to include rollups like "STEM"
  const expandSubjects = (list: string[]): string[] => {
    const norm = (s: string) => s.trim().toLowerCase();
    const exact = new Set(list.map(norm));

    const isStemExact = (
      s: string
    ) =>
      [
        // Science family
        'science',
        'environmental science',
        'earth & space science',
        'biology',
        'marine biology',
        'chemistry',
        'physics',
        'earth science',
        'space science',
        'geology',
        'astronomy',
        'oceanography',
        'ecology',
        'neuroscience',
        'health sciences',
        'nutrition',
        'materials science',
        'life science',
        'physical science',
        // Technology family
        'technology',
        'computer science',
        'data science',
        'artificial intelligence',
        'ai',
        'machine learning',
        'robotics',
        'sensors',
        'digital fabrication',
        // Engineering family
        'engineering',
        'design engineering',
        'bioengineering',
        'systems engineering',
        'architecture',
        // Mathematics family
        'math',
        'mathematics',
        'statistics',
        'data & statistics',
        // Energy/Power (treated as STEM context in our showcases)
        'energy',
        // Legacy catch-all
        'stem lab'
      ].includes(s);

    const isStem = Array.from(exact).some(isStemExact);
    const out = new Set(list);
    if (isStem) out.add('STEM');
    return Array.from(out);
  };

  const subjects = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach(p => expandSubjects(p.subjects).forEach(s => set.add(s)));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [allProjects]);

  const projects = useMemo(() => {
    return allProjects.filter(p => {
      if (band !== 'All' && p.gradeBand !== band) return false;
      if (subject === 'All') return true;
      const expanded = expandSubjects(p.subjects);
      return expanded.includes(subject);
    });
  }, [allProjects, band, subject]);

  const truncate = (text: string, max = 180): string => {
    if (!text) return text;
    if (text.length <= max) return text;
    const slice = text.slice(0, max);
    const lastBreak = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf(' '));
    return (lastBreak > 60 ? slice.slice(0, lastBreak) : slice).trimEnd() + '…';
  };

  return (
    <div className="relative min-h-screen transition-colors bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-[#040b1a] dark:via-[#040b1a] dark:to-[#0a1628]">
      <div className="hidden dark:block pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(94,118,255,0.28),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.18),transparent_55%)] opacity-80" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-32">
        <header className="text-center mb-16 space-y-5">
          {/* Animated floating badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 animate-float">
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Built with ALF Studio
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Real Projects, Ready to Remix
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Every project here was designed in a single planning session with ALF Studio.
            Explore the full learning arc, steal what works, and adapt the flow for your students and community.
          </p>
        </header>

        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Browse the Collection</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
              From sustainability campaigns to AI ethics audits—each project shows what's possible
              when you co-design with ALF.
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
                const canShowImage = typeof project.image === 'string' && project.image.length > 0;
                const subjectPreview = project.subjects.slice(0, 4).join(', ');
                const subjectOverflow = project.subjects.length > 4;

                // Hover reveals COMPLETELY different info
                const whatStudentsCreate = project.coreOutcomes[0] || '';
                const whoTheyPresentTo = project.primaryAudience;
                const projectSummary = project.microOverview[0] || project.tagline;

                return (
                <article
                  key={project.id}
                  className="magnetic-card group relative overflow-hidden rounded-[22px] border border-black/8 dark:border-white/8 bg-white dark:bg-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)_inset] dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.02)_inset] focus-within:ring-2 focus-within:ring-primary-300 h-[480px]">

                  {/* Image - stays visible, gets overlay on hover */}
                  <div className="image-container relative h-44 w-full bg-slate-100 dark:bg-slate-800 sm:h-48 overflow-hidden">
                    {canShowImage && (
                      <img
                        src={project.image as string}
                        alt={`${project.title} hero`}
                        className="magnetic-image h-full w-full object-cover"
                        loading="lazy"
                      />
                    )}

                    {/* Full overlay with summary on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/98 via-primary-900/95 to-primary-900/80 backdrop-blur-md flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-[450ms]">
                      <p className="text-sm text-white/95 leading-relaxed font-medium tracking-tight text-center">
                        {projectSummary}
                      </p>
                    </div>
                  </div>

                  {/* DEFAULT CONTENT - visible by default, fades out on hover */}
                  <div className="default-content absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-7 bg-white dark:bg-slate-900 opacity-100 group-hover:opacity-0 transition-opacity duration-[450ms] pointer-events-none group-hover:pointer-events-none">
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
                  </div>

                  {/* HOVER CONTENT - completely different information, hidden by default */}
                  <div className="hover-content absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:p-7 bg-white dark:bg-slate-900 opacity-0 group-hover:opacity-100 transition-all duration-[450ms] pointer-events-none group-hover:pointer-events-auto">

                    {/* What students accomplish */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Presentation className="w-5 h-5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
                            Students Present To
                          </div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {whoTheyPresentTo}
                          </div>
                        </div>
                      </div>

                      {whatStudentsCreate && (
                        <div className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {whatStudentsCreate}
                        </div>
                      )}
                    </div>

                    {/* CTA stays at bottom */}
                    <div className="pt-2">
                      <button
                        type="button"
                        className="magnetic-button group/btn inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(59,130,246,0.25)] transition-all duration-300 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onClick={() => navigate(`/app/showcase/${project.id}`)}
                      >
                        <span>View full project</span>
                        <svg
                          className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
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
