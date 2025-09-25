import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  ClipboardList,
  Compass,
  Hammer,
  Layers,
  Lightbulb,
  NotebookPen,
  PenLine,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Users,
  CheckCircle2,
  BookOpenCheck,
  ShieldAlert
} from 'lucide-react';
import type { PhaseKind, ProjectShowcaseV2 } from '../types/showcaseV2';
import { getProjectV2 } from '../utils/showcaseV2-registry';

const PHASE_META: Record<PhaseKind, { label: string; accent: string; bg: string; icon: React.ReactNode }> = {
  Foundations: {
    label: 'Foundations',
    accent: 'from-primary-500 to-blue-500',
    bg: 'bg-primary-500/10 border-primary-300/40 text-primary-700',
    icon: <Lightbulb className="h-4 w-4" />
  },
  Planning: {
    label: 'Planning',
    accent: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 border-emerald-300/40 text-emerald-700',
    icon: <PenLine className="h-4 w-4" />
  },
  FieldworkLoop: {
    label: 'Fieldwork loop',
    accent: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10 border-amber-300/40 text-amber-700',
    icon: <Compass className="h-4 w-4" />
  },
  Build: {
    label: 'Build',
    accent: 'from-violet-500 to-indigo-500',
    bg: 'bg-violet-500/10 border-violet-300/40 text-violet-700',
    icon: <Hammer className="h-4 w-4" />
  },
  Exhibit: {
    label: 'Exhibit',
    accent: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10 border-rose-300/40 text-rose-700',
    icon: <Trophy className="h-4 w-4" />
  },
  Extension: {
    label: 'Extension',
    accent: 'from-sky-500 to-cyan-500',
    bg: 'bg-sky-500/10 border-sky-300/40 text-sky-700',
    icon: <Share2 className="h-4 w-4" />
  }
};

function formatSpecLine(project: ProjectShowcaseV2): string {
  const subjects = project.hero.subjects?.length ? project.hero.subjects.join(', ') : null;
  return [project.hero.timeframe, project.hero.gradeBand, subjects].filter(Boolean).join(' · ');
}

interface SectionHeaderProps {
  id?: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
}

function SectionHeader({ id, icon, title, description }: SectionHeaderProps) {
  return (
    <div id={id} className="space-y-2 scroll-mt-32">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
          {icon}
        </span>
        {title}
      </div>
      {description && <p className="max-w-3xl text-slate-600">{description}</p>}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="space-y-2 text-slate-700">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProjectShowcase() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const project = id ? getProjectV2(id) : undefined;

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <p className="text-slate-600">Project not found.</p>
        <button className="rounded bg-slate-200 px-4 py-2" onClick={() => navigate('/app/samples')}>
          Back to Showcase
        </button>
      </div>
    );
  }

  const specLine = formatSpecLine(project);
  const sectionAnchors = [
    { id: 'snapshot', label: 'Snapshot' },
    { id: 'run-of-show', label: 'Run of Show' },
    { id: 'outcome-menu', label: 'Outcomes' },
    { id: 'materials-prep', label: 'Materials' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'full-overview', label: 'Full Overview' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/25 pb-24">
      <div className="max-w-5xl mx-auto px-6 pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-r from-primary-500/15 via-indigo-500/10 to-emerald-500/15 p-8 shadow-xl">
          <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-700 ring-1 ring-primary-200">
                  <Sparkles className="h-4 w-4" /> Showcase Project
                </span>
                <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{project.hero.title}</h1>
                {project.hero.tagline && <p className="text-lg text-slate-600 max-w-2xl">{project.hero.tagline}</p>}
                {specLine && <p className="text-sm text-slate-500">{specLine}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {sectionAnchors.map(anchor => (
                  <a
                    key={anchor.id}
                    href={`#${anchor.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    {anchor.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1">
                  <CalendarDays className="h-4 w-4 text-primary-600" />
                  {project.schedule.totalWeeks} weeks · {project.schedule.lessonsPerWeek} lessons/week ·{' '}
                  {project.schedule.lessonLengthMin}-minute lessons
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1">
                  <ClipboardList className="h-4 w-4 text-primary-600" />
                  {project.assignments.length} assignments
                </span>
              </div>
            </div>
            {project.hero.image && (
              <div className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-2xl">
                <img src={project.hero.image} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-white/10" />
              </div>
            )}
          </div>
        </section>

        {/* Snapshot */}
        <section className="mt-12 space-y-6">
          <SectionHeader
            id="snapshot"
            icon={<Target className="h-4 w-4" />}
            title="Project Snapshot"
            description="What learners experience and why it matters."
          />
          <div className="space-y-3 rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
            {project.microOverview.map((sentence, index) => (
              <p key={index} className="text-slate-700">
                {sentence}
              </p>
            ))}
            {project.fullOverview && (
              <p className="text-slate-700">{project.fullOverview}</p>
            )}
          </div>
        </section>

        {/* Run of Show */}
        <section className="mt-16 space-y-6">
          <SectionHeader
            id="run-of-show"
            icon={<ClipboardList className="h-4 w-4" />}
            title="Run of Show"
            description="Week-by-week phases with teacher moves, student experiences, and deliverables."
          />
          <p className="text-sm text-slate-500">
            {project.schedule.totalWeeks} weeks · {project.schedule.lessonsPerWeek} lessons/week ·{' '}
            {project.schedule.lessonLengthMin}-minute lessons
          </p>
          <div className="space-y-6">
            {project.runOfShow.map(card => {
              const meta = PHASE_META[card.kind];
              return (
                <article
                  key={card.weekLabel}
                  className="relative overflow-hidden rounded-3xl border border-white bg-white/90 p-6 shadow-lg backdrop-blur transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.accent}`} />
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                          {card.weekLabel}
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.bg}`}>
                          {meta.icon}
                          {meta.label}
                        </span>
                        {card.repeatable && (
                          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Sparkles className="h-4 w-4" /> Repeatable loop
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900">{card.focus}</h3>
                    </div>
                    {card.assignments && card.assignments.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {card.assignments.map(assignmentId => (
                          <span
                            key={assignmentId}
                            className="inline-flex items-center gap-2 rounded-full bg-primary-600/10 px-3 py-1 text-xs font-semibold text-primary-700"
                          >
                            {assignmentId}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-6 grid gap-6 md:grid-cols-3">
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        <Users className="h-4 w-4 text-primary-500" /> Teacher focuses
                      </h4>
                      <BulletList items={card.teacher} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        <Sparkles className="h-4 w-4 text-primary-500" /> Student experience
                      </h4>
                      <BulletList items={card.students} />
                    </div>
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                        <CheckCircle2 className="h-4 w-4 text-primary-500" /> Deliverables
                      </h4>
                      <BulletList items={card.deliverables} />
                      {card.checkpoint && card.checkpoint.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                          <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <BookOpenCheck className="h-4 w-4 text-primary-500" /> Checkpoint
                          </p>
                          <ul className="mt-1 space-y-1 text-sm text-slate-600">
                            {card.checkpoint.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Outcomes */}
        <section className="mt-16 space-y-6">
          <SectionHeader
            id="outcome-menu"
            icon={<Target className="h-4 w-4" />}
            title="Learning Outcomes"
            description="Select the guaranteed outcomes and layer in optional pathways to fit your context."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Core', icon: <Sparkles className="h-4 w-4" />, items: project.outcomes.core },
              { title: 'Choose extras', icon: <Layers className="h-4 w-4" />, items: project.outcomes.extras },
              { title: 'Authentic audiences', icon: <Users className="h-4 w-4" />, items: project.outcomes.audiences }
            ].map(({ title, icon, items }) => (
              <div key={title} className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                    {icon}
                  </span>
                  {title}
                </h3>
                <div className="mt-4">
                  <BulletList items={items} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Materials & Prep */}
        <section className="mt-16 space-y-6">
          <SectionHeader
            id="materials-prep"
            icon={<Layers className="h-4 w-4" />}
            title="Materials & Prep"
            description="Core supplies, low-tech alternatives, and safety or ethics reminders."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Core kit', items: project.materialsPrep.coreKit },
              { title: 'No-tech fallback', items: project.materialsPrep.noTechFallback },
              { title: 'Safety & ethics', items: project.materialsPrep.safetyEthics }
            ].map(({ title, items }) => (
              <div key={title} className="rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
                <div className="mt-4">
                  <BulletList items={items} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Assignments */}
        <section className="mt-16 space-y-6">
          <SectionHeader
            id="assignments"
            icon={<NotebookPen className="h-4 w-4" />}
            title="Assignments"
            description="Student-facing tasks, teacher setup, evidence, and success criteria for each checkpoint."
          />
          <div className="space-y-6">
            {project.assignments.map(assignment => (
              <article key={assignment.id} className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-lg backdrop-blur">
                <div className="bg-gradient-to-r from-primary-500/20 via-primary-400/15 to-primary-300/20 px-6 py-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {assignment.id} — {assignment.title}
                      </h3>
                      <p className="text-sm text-slate-600">{assignment.summary}</p>
                    </div>
                    {assignment.aiOptional && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        <Sparkles className="h-4 w-4" /> AI companion available
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <Sparkles className="h-4 w-4 text-primary-500" /> Student directions
                    </h4>
                    <BulletList items={assignment.studentDirections} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <PenLine className="h-4 w-4 text-primary-500" /> Teacher setup
                    </h4>
                    <BulletList items={assignment.teacherSetup} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <CheckCircle2 className="h-4 w-4 text-primary-500" /> Evidence
                    </h4>
                    <BulletList items={assignment.evidence} />
                  </div>
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                      <Target className="h-4 w-4 text-primary-500" /> Success criteria
                    </h4>
                    <BulletList items={assignment.successCriteria} />
                  </div>
                  {assignment.checkpoint && (
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <BookOpenCheck className="h-4 w-4 text-primary-500" /> Checkpoint
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{assignment.checkpoint}</p>
                    </div>
                  )}
                  {assignment.aiOptional && (
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
                        <Sparkles className="h-4 w-4" /> AI workflow (optional)
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-indigo-700">
                        <li>Tool use: {assignment.aiOptional.toolUse}</li>
                        <li>Critique: {assignment.aiOptional.critique}</li>
                        <li>No-AI alternative: {assignment.aiOptional.noAIAlt}</li>
                      </ul>
                    </div>
                  )}
                  {assignment.safety && assignment.safety.length > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                        <ShieldAlert className="h-4 w-4" /> Safety notes
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-amber-700">
                        {assignment.safety.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {(project.polish?.tags?.length || project.planningNotes) && (
          <section className="mt-16 space-y-4">
            <SectionHeader
              id="full-overview"
              icon={<BookOpenCheck className="h-4 w-4" />}
              title="Educator Tips & Resources"
              description="Quick notes to keep planning smooth when you run or remix this project."
            />
            <div className="space-y-3 rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
              {project.planningNotes && (
                <p className="text-slate-700 whitespace-pre-line">{project.planningNotes}</p>
              )}
              {project.polish?.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {project.polish.tags.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
