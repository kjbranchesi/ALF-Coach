import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ProjectShowcaseV2 } from '../types/showcaseV2';
import { getProjectV2 } from '../utils/showcaseV2-registry';

function formatSpecLine(project: ProjectShowcaseV2): string {
  const subjects = project.hero.subjects?.length ? project.hero.subjects.join(', ') : null;
  return [project.hero.timeframe, project.hero.gradeBand, subjects].filter(Boolean).join(' · ');
}

export default function ProjectShowcase() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const project = id ? getProjectV2(id) : undefined;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <p className="text-slate-600">Project not found.</p>
        <button className="px-4 py-2 rounded bg-slate-200" onClick={() => navigate('/app/samples')}>
          Back to Gallery
        </button>
      </div>
    );
  }

  const specLine = formatSpecLine(project);
  const sectionAnchors = [
    { id: 'run-of-show', label: 'Run of Show' },
    { id: 'outcome-menu', label: 'Outcome Menu' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'full-overview', label: 'Read full overview ▸' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">{project.hero.title}</h1>
        {project.hero.tagline && <p className="text-lg text-slate-600">{project.hero.tagline}</p>}
        {specLine && <p className="text-sm text-slate-500">{specLine}</p>}
      </header>

      {/* Micro Overview */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Micro Overview</h2>
        <div className="space-y-2 text-slate-700">
          {project.microOverview.map((sentence, index) => (
            <p key={index}>{sentence}</p>
          ))}
        </div>
      </section>

      {/* Section shortcuts */}
      <nav className="flex flex-wrap gap-2">
        {sectionAnchors.map(anchor => (
          <a
            key={anchor.id}
            className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
            href={`#${anchor.id}`}
          >
            {anchor.label}
          </a>
        ))}
      </nav>

      {/* Run of Show */}
      <section id="run-of-show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Run of Show</h2>
          <p className="text-sm text-slate-500">
            {project.schedule.totalWeeks} weeks · {project.schedule.lessonsPerWeek} lessons/week ·{' '}
            {project.schedule.lessonLengthMin}-minute lessons
          </p>
        </div>
        <div className="space-y-4">
          {project.runOfShow.map(card => (
            <article key={card.weekLabel} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                    {card.weekLabel}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-800">{card.focus}</h3>
                  <p className="text-sm text-slate-500">{card.kind}</p>
                  {card.repeatable && <span className="text-xs text-amber-600 font-medium">Repeatable</span>}
                </div>
                {card.assignments && card.assignments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {card.assignments.map(assignmentId => (
                      <span
                        key={assignmentId}
                        className="inline-flex items-center px-2 py-1 rounded-full border border-primary-200 text-primary-700 text-xs font-medium"
                      >
                        {assignmentId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-medium text-slate-700">Teacher focuses</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {card.teacher.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Student experience</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {card.students.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Deliverables</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {card.deliverables.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {card.checkpoint && card.checkpoint.length > 0 && (
                <div>
                  <p className="font-medium text-slate-700">Checkpoint</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {card.checkpoint.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Outcome Menu */}
      <section id="outcome-menu" className="space-y-4">
        <h2 className="text-xl font-semibold">Outcome Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-slate-700">Core</h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              {project.outcomes.core.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-700">Choose extras</h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              {project.outcomes.extras.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-700">Authentic audiences</h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              {project.outcomes.audiences.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Materials & Prep */}
      <section id="materials-prep" className="space-y-4">
        <h2 className="text-xl font-semibold">Materials &amp; Prep</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-slate-700">Core kit</h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              {project.materialsPrep.coreKit.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-700">No-tech fallback</h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              {project.materialsPrep.noTechFallback.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-700">Safety &amp; ethics</h3>
            <ul className="list-disc ml-5 space-y-1 text-slate-600">
              {project.materialsPrep.safetyEthics.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Assignments */}
      <section id="assignments" className="space-y-4">
        <h2 className="text-xl font-semibold">Assignments</h2>
        <div className="space-y-4">
          {project.assignments.map(assignment => (
            <article key={assignment.id} className="border border-slate-200 rounded-lg p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold text-slate-800">
                  {assignment.id} — {assignment.title}
                </h3>
                <p className="text-sm text-slate-500">{assignment.summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-slate-700">Student directions</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {assignment.studentDirections.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Teacher setup</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {assignment.teacherSetup.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Evidence</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {assignment.evidence.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-slate-700">Success criteria</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {assignment.successCriteria.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {assignment.checkpoint && (
                <p className="text-sm text-slate-500">Checkpoint: {assignment.checkpoint}</p>
              )}
              {assignment.aiOptional && (
                <div className="text-sm text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">AI (optional)</p>
                  <p>Tool use: {assignment.aiOptional.toolUse}</p>
                  <p>Critique: {assignment.aiOptional.critique}</p>
                  <p>No-AI alternative: {assignment.aiOptional.noAIAlt}</p>
                </div>
              )}
              {assignment.safety && assignment.safety.length > 0 && (
                <div>
                  <p className="font-medium text-slate-700">Safety notes</p>
                  <ul className="list-disc ml-5 space-y-1 text-slate-600">
                    {assignment.safety.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* Full Overview */}
      {project.fullOverview && (
        <section id="full-overview">
          <details className="border border-slate-200 rounded-lg">
            <summary className="cursor-pointer px-4 py-3 text-primary-600 font-medium">
              Read full overview ▸
            </summary>
            <div className="px-4 pb-4 text-slate-700 whitespace-pre-line">{project.fullOverview}</div>
          </details>
        </section>
      )}

      {/* Polish */}
      {project.polish && (
        <section>
          <details className="border border-slate-200 rounded-lg">
            <summary className="cursor-pointer px-4 py-3 text-primary-600 font-medium">Polish ▸</summary>
            <div className="px-4 pb-4 space-y-3 text-slate-700">
              {project.polish.microRubric && (
                <div>
                  <p className="font-medium text-slate-700">Micro rubric</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {project.polish.microRubric.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {project.polish.checkpoints && (
                <div>
                  <p className="font-medium text-slate-700">Checkpoints</p>
                  <ul className="list-disc ml-5 space-y-1">
                    {project.polish.checkpoints.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {project.polish.tags && (
                <div>
                  <p className="font-medium text-slate-700">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {project.polish.tags.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full border border-slate-200 text-slate-600 text-xs font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        </section>
      )}

      {/* Planning Notes */}
      {project.planningNotes && (
        <section>
          <details className="border border-slate-200 rounded-lg">
            <summary className="cursor-pointer px-4 py-3 text-primary-600 font-medium">
              Planning notes ▸
            </summary>
            <div className="px-4 pb-4 text-slate-700 whitespace-pre-line">{project.planningNotes}</div>
          </details>
        </section>
      )}
    </div>
  );
}
