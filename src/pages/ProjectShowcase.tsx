import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Compass,
  Hammer,
  Layers,
  Lightbulb,
  Map,
  NotebookPen,
  PenLine,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  Users
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
    icon: <Sparkles className="h-4 w-4" />
  }
};

const STAGE_META = {
  snapshot: {
    label: 'Vision',
    description: 'Capture the big idea and learner promise.',
    color: 'from-primary-500 to-blue-500',
    icon: <Lightbulb className="h-4 w-4" />
  },
  run: {
    label: 'Learning Journey',
    description: 'Sequence the experience week by week.',
    color: 'from-emerald-500 to-teal-500',
    icon: <Map className="h-4 w-4" />
  },
  outcomes: {
    label: 'Evidence & Impact',
    description: 'Clarify outcomes, audiences, and impact.',
    color: 'from-amber-500 to-orange-500',
    icon: <Target className="h-4 w-4" />
  },
  materials: {
    label: 'Launch Kit',
    description: 'Gather resources and guardrails.',
    color: 'from-indigo-500 to-purple-500',
    icon: <Layers className="h-4 w-4" />
  },
  assignments: {
    label: 'Deliverables',
    description: 'Anchor checkpoints and evidence.',
    color: 'from-rose-500 to-pink-500',
    icon: <NotebookPen className="h-4 w-4" />
  },
  support: {
    label: 'Support',
    description: 'Helpful notes before you launch.',
    color: 'from-slate-500 to-slate-700',
    icon: <Sparkles className="h-4 w-4" />
  }
} as const;

type StageKey = keyof typeof STAGE_META;

const JOURNEY_STEPS: Array<{ key: StageKey; anchor: string }> = [
  { key: 'snapshot', anchor: 'snapshot' },
  { key: 'run', anchor: 'run-of-show' },
  { key: 'outcomes', anchor: 'outcome-menu' },
  { key: 'materials', anchor: 'materials-prep' },
  { key: 'assignments', anchor: 'assignments' },
  { key: 'support', anchor: 'support' }
];

function formatSpecLine(project: ProjectShowcaseV2): string {
  const subjects = project.hero.subjects?.length ? project.hero.subjects.join(', ') : null;
  return [project.hero.timeframe, project.hero.gradeBand, subjects].filter(Boolean).join(' · ');
}

function SectionHeader({ id, icon, title, description, stage }: {
  id?: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  stage?: StageKey;
}) {
  const stageMeta = stage ? STAGE_META[stage] : undefined;
  return (
    <div id={id} className="space-y-2 scroll-mt-32">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            {icon}
          </span>
          {title}
        </div>
        {stageMeta && (
          <span className={clsx('inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm', `bg-gradient-to-r ${stageMeta.color}`)}>
            {stageMeta.icon}
            {stageMeta.label}
          </span>
        )}
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

function MarkdownParagraph({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children: mdChildren }) => <p className="text-slate-700">{mdChildren}</p>,
        strong: ({ children: mdChildren }) => <strong className="font-semibold text-slate-800">{mdChildren}</strong>,
        em: ({ children: mdChildren }) => <em className="text-slate-600">{mdChildren}</em>,
        a: ({ href, children: mdChildren }) => (
          <a className="text-primary-600 underline" href={href} target="_blank" rel="noreferrer">
            {mdChildren}
          </a>
        ),
        ul: ({ children: mdChildren }) => <ul className="ml-6 list-disc space-y-1 text-slate-700">{mdChildren}</ul>
      }}
    >
      {children}
    </ReactMarkdown>
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
  const sectionAnchors = JOURNEY_STEPS.map(({ anchor, key }) => ({ id: anchor, label: STAGE_META[key].label }));

  const hasSupportContent = Boolean(project.planningNotes || project.polish?.tags?.length || project.polish?.microRubric?.length || project.polish?.checkpoints?.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/25 pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pt-28 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-16">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-r from-primary-500/15 via-indigo-500/10 to-emerald-500/15 p-8 shadow-xl">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-700 ring-1 ring-primary-200">
                    <Sparkles className="h-4 w-4" /> Showcase Project
                  </span>
                  <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{project.hero.title}</h1>
                  {project.hero.tagline && <p className="max-w-2xl text-lg text-slate-600">{project.hero.tagline}</p>}
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
          <section className="space-y-6">
            <SectionHeader
              id="snapshot"
              stage="snapshot"
              icon={<Lightbulb className="h-4 w-4" />}
              title="Project Snapshot"
              description="Ground the project vision before diving into the build."
            />
            <div className="space-y-3 rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
              {project.microOverview.map((sentence, index) => (
                <MarkdownParagraph key={index}>{sentence}</MarkdownParagraph>
              ))}
              {project.fullOverview && <MarkdownParagraph>{project.fullOverview}</MarkdownParagraph>}
            </div>
          </section>

          {/* Run of Show */}
          <section className="space-y-6">
            <SectionHeader
              id="run-of-show"
              stage="run"
              icon={<Map className="h-4 w-4" />}
              title="Run of Show"
              description="Track the learning journey week by week, aligned to Alf’s planning rhythm."
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
                          <span
                            className={clsx(
                              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold',
                              meta.bg
                            )}
                          >
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
          <section className="space-y-6">
            <SectionHeader
              id="outcome-menu"
              stage="outcomes"
              icon={<Target className="h-4 w-4" />}
              title="Learning Outcomes"
              description="Choose guaranteed outcomes and add stretch goals or authentic audiences."
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
          <section className="space-y-6">
            <SectionHeader
              id="materials-prep"
              stage="materials"
              icon={<Layers className="h-4 w-4" />}
              title="Materials & Prep"
              description="Pull together what you need, plus low-tech options and guardrails."
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
          <section className="space-y-6">
            <SectionHeader
              id="assignments"
              stage="assignments"
              icon={<NotebookPen className="h-4 w-4" />}
              title="Assignments"
              description="Anchor checkpoints with student directions, teacher setup, evidence, and success criteria."
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

          {/* Support */}
          {hasSupportContent && (
            <section className="space-y-6">
              <SectionHeader
                id="support"
                stage="support"
                icon={<Sparkles className="h-4 w-4" />}
                title="Educator Tips & Resources"
                description="Keep these pointers handy as you adapt or launch the project."
              />
              <div className="space-y-3 rounded-3xl border border-white bg-white/85 p-6 shadow-sm backdrop-blur">
                {project.planningNotes && <MarkdownParagraph>{project.planningNotes}</MarkdownParagraph>}
                {(project.polish?.microRubric?.length || project.polish?.checkpoints?.length) && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {project.polish?.microRubric?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Micro rubric</h4>
                        <BulletList items={project.polish.microRubric} />
                      </div>
                    ) : null}
                    {project.polish?.checkpoints?.length ? (
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Checkpoints</h4>
                        <BulletList items={project.polish.checkpoints} />
                      </div>
                    ) : null}
                  </div>
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

        {/* Journey rail */}
        <aside className="hidden lg:flex lg:flex-col">
          <div className="sticky top-28 space-y-4 rounded-3xl border border-white bg-white/70 p-5 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-600">Alf Builder Journey</p>
            <div className="flex flex-col gap-3 text-sm">
              {JOURNEY_STEPS.map(({ key, anchor }) => {
                const meta = STAGE_META[key];
                return (
                  <a
                    key={key}
                    href={`#${anchor}`}
                    className={clsx(
                      'group flex items-center gap-3 rounded-2xl border border-white px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-md',
                      'bg-gradient-to-r',
                      meta.color,
                      'text-white shadow-sm'
                    )}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-white">
                      {meta.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{meta.label}</p>
                      <p className="text-xs text-white/80">{meta.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
