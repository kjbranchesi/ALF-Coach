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
            Project Showcase
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Explore projects created with the Alf Project Builder as a planning companion for teachers. Each one shows how the Builder captures a full learning arc you can adapt for your own community.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map(project => {
                const canShowImage = typeof project.image === 'string' && (project.image.startsWith('/') || project.image.startsWith('http') || project.image.startsWith('data:'));

                return (
                <article
                  key={project.id}
                  className="flex flex-col gap-3 sm:gap-4 bg-white/90 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
                >
                  {canShowImage && (
                    <div className="h-36 w-full overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={project.image}
                        alt={`${project.title} hero`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{project.title}</h3>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        <Users className="w-4 h-4" />
                        {project.gradeBand}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                        <Clock className="w-4 h-4" />
                        {project.timeframe}
                      </span>
                      {project.subjects.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                          <BookOpen className="w-4 h-4" />
                          {project.subjects.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-medium shadow-sm hover:bg-primary-500 transition"
                      onClick={() => navigate(`/app/showcase/${project.id}`)}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-200 text-slate-500 text-sm font-medium"
                    >
                      Use this template
                    </button>
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
