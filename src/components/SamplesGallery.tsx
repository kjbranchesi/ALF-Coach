import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Users, Clock, BookOpen } from 'lucide-react';
import { listProjectsV2 } from '../utils/showcaseV2-registry';

export default function SamplesGallery() {
  const navigate = useNavigate();
  const projects = listProjectsV2();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-28">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-3 tracking-tight">
            ALF Studio Project Showcase
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Explore projects designed inside ALF Studio—the planning builder educators use to shape full learning arcs. Adapt one for your community or remix the flow, deliverables, and supports for your learners.
          </p>
        </header>

        <section className="space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900">Curated Projects</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Each project was drafted inside the Alf Project Builder to demonstrate what you can produce in a focused planning session. Explore the full arc, grab what helps, and remix the flow, assignments, or materials for your learners.
            </p>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-slate-900 mb-2">Showcase projects coming soon</h3>
              <p className="text-slate-600">We’re rebuilding the library. Check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {projects.map(project => {
                const canShowImage = typeof project.image === 'string' && (project.image.startsWith('/') || project.image.startsWith('http') || project.image.startsWith('data:'));

                return (
                <article
                  key={project.id}
                  className="group flex flex-col bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border border-white/60 dark:border-gray-800/60 rounded-[32px] shadow-[0_18px_48px_rgba(15,23,42,0.12)] hover:shadow-[0_22px_54px_rgba(15,23,42,0.18)] transition-shadow overflow-hidden">
                  {canShowImage && (
                    <div className="relative h-44 w-full bg-slate-100 sm:h-48">
                      <img
                        src={project.image}
                        alt={`${project.title} hero`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-4 p-6 sm:p-7">
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
                          <span className="brand-chip">
                            <BookOpen className="w-4 h-4" />
                            {project.subjects.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(59,130,246,0.25)] transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
                        onClick={() => navigate(`/app/showcase/${project.id}`)}
                      >
                        Preview project
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
