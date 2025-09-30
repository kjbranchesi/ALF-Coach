import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectV2 } from '../../utils/showcaseV2-registry';

export default function ProjectShowcasePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const data = useMemo(() => (id ? getProjectV2(id) : undefined), [id]);
  const [expandOverview, setExpandOverview] = useState(false);

  if (!id || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm text-center space-y-3">
          <div className="text-lg font-semibold">Showcase project not found</div>
          <p className="text-sm text-gray-500">The project you’re looking for may have been moved or renamed.</p>
          <button className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium" onClick={() => navigate('/app/samples')}>
            Back to Showcase
          </button>
        </div>
      </div>
    );
  }

  const { hero, microOverview, fullOverview, schedule, runOfShow, outcomes, materialsPrep, assignments, polish, planningNotes } = data;

  const handleExport = () => {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${id}-project.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{hero.title}</h1>
            <p className="text-slate-600 text-sm sm:text-base">{hero.tagline}</p>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1">{hero.gradeBand}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1">{hero.timeframe}</span>
              {hero.subjects.map((subject) => (
                <span key={subject} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1">
                  {subject}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={() => navigate('/app/samples')}>
              Back to Showcase
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-semibold shadow-sm hover:bg-primary-500" onClick={handleExport}>
              Download JSON
            </button>
          </div>
        </header>

        <section className="bg-white/90 dark:bg-gray-900/90 backdrop-blur rounded-3xl border border-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.12)] p-6 sm:p-8 mb-8 space-y-5">
          <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
          <ul className="space-y-2 text-slate-700 text-sm sm:text-base">
            {microOverview.map((item, index) => (
              <li key={index} className="leading-relaxed">• {item}</li>
            ))}
          </ul>
          {fullOverview && (
            <div className="border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setExpandOverview((prev) => !prev)}
                className="text-primary-600 text-sm font-medium hover:underline"
              >
                {expandOverview ? 'Hide detailed overview' : 'Read full overview'}
              </button>
              {expandOverview && (
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{fullOverview}</p>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Total weeks</div>
              <div className="text-base font-semibold text-slate-900">{schedule.totalWeeks}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Lessons / week</div>
              <div className="text-base font-semibold text-slate-900">{schedule.lessonsPerWeek}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Lesson length</div>
              <div className="text-base font-semibold text-slate-900">{schedule.lessonLengthMin} minutes</div>
            </div>
          </div>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Run of show</h2>
          <div className="space-y-3">
            {runOfShow.map((card, index) => (
              <div key={card.weekLabel + index} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">{card.weekLabel}</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{card.kind}</span>
                  <span className="text-sm text-slate-500">{card.focus}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Teacher</div>
                    <ul className="space-y-1 leading-snug">
                      {card.teacher.map((item, idx) => <li key={idx}>• {item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Students</div>
                    <ul className="space-y-1 leading-snug">
                      {card.students.map((item, idx) => <li key={idx}>• {item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Deliverables</div>
                    <ul className="space-y-1 leading-snug">
                      {card.deliverables.map((item, idx) => <li key={idx}>• {item}</li>)}
                    </ul>
                    {card.checkpoint?.length ? (
                      <div className="mt-2 text-xs text-primary-600">Checkpoints: {card.checkpoint.join(', ')}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Assignments</h2>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <details key={assignment.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 flex items-center justify-between">
                  <span>{assignment.id} · {assignment.title}</span>
                  <span className="text-xs text-primary-600">Expand</span>
                </summary>
                <div className="px-4 pb-4 space-y-3 text-sm text-slate-600">
                  <p>{assignment.summary}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Student directions</div>
                      <ul className="space-y-1 leading-snug">
                        {assignment.studentDirections.map((item, idx) => <li key={idx}>• {item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Teacher setup</div>
                      <ul className="space-y-1 leading-snug">
                        {assignment.teacherSetup.map((item, idx) => <li key={idx}>• {item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Evidence & success</div>
                      <ul className="space-y-1 leading-snug">
                        {assignment.evidence.map((item, idx) => <li key={idx}>• {item}</li>)}
                      </ul>
                      <div className="mt-2 text-xs text-slate-500">Success criteria: {assignment.successCriteria.join(', ')}</div>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Core outcomes</div>
            <ul className="space-y-1 leading-snug">
              {outcomes.core.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Extended outcomes</div>
            <ul className="space-y-1 leading-snug">
              {outcomes.extras.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Authentic audiences</div>
            <ul className="space-y-1 leading-snug">
              {outcomes.audiences.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Core kit</div>
            <ul className="space-y-1 leading-snug">
              {materialsPrep.coreKit.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">No-tech fallback</div>
            <ul className="space-y-1 leading-snug">
              {materialsPrep.noTechFallback.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-2">Safety & ethics</div>
            <ul className="space-y-1 leading-snug">
              {materialsPrep.safetyEthics.map((item, idx) => <li key={idx}>• {item}</li>)}
            </ul>
          </div>
        </section>

        {polish?.microRubric?.length && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm text-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Polish</h2>
            {polish.microRubric?.length ? (
              <div className="mb-3">
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Micro rubric</div>
                <ul className="space-y-1 leading-snug">
                  {polish.microRubric.map((item, idx) => <li key={idx}>• {item}</li>)}
                </ul>
              </div>
            ) : null}
            {polish.checkpoints?.length ? (
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">Checkpoints</div>
                <ul className="space-y-1 leading-snug">
                  {polish.checkpoints.map((item, idx) => <li key={idx}>• {item}</li>)}
                </ul>
              </div>
            ) : null}
          </section>
        )}

        {planningNotes && (
          <section className="mb-12 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm text-sm text-slate-600">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Planning notes</h2>
            <p className="leading-relaxed">{planningNotes}</p>
          </section>
        )}
      </div>
    </div>
  );
}
