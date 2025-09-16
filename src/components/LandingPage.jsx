// src/components/LandingPage.jsx

import React, { Suspense, lazy, useState } from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users } from 'lucide-react';
import heroImageMedium from '../images/CoverImageLanding@1200w.png';
import heroImageSmall from '../images/CoverImageLanding@768w.png';
import AlfLogo from './ui/AlfLogo';

const AboutPage = lazy(() => import('./AboutPage'));

const stats = [
  { value: '92%', label: 'Educators report higher student engagement' },
  { value: '65%', label: 'Reduction in planning time after two projects' },
  { value: '3×', label: 'Increase in authentic assessments delivered' },
];

const featureCards = [
  {
    title: 'Blueprints that flex',
    description:
      'Start with proven project templates, remix the components, and watch ALF adapt the flow for your learners.',
    accent: 'bg-primary-100 text-primary-700',
    icon: Sparkles,
  },
  {
    title: 'AI that collaborates',
    description:
      'The coach prompts ideas, drafts rubrics, and refines deliverables—always keeping educator judgment in control.',
    accent: 'bg-ai-100 text-ai-700',
    icon: Lightbulb,
  },
  {
    title: 'Visibility for teams',
    description:
      'Share roadmaps with co-teachers and leaders. Every milestone, resource, and student checkpoint stays aligned.',
    accent: 'bg-coral-100 text-coral-700',
    icon: Users,
  },
];

const frameworkStages = [
  {
    title: 'Ideation',
    summary: 'Translate standards into big ideas, essential questions, and learner-centered challenges.',
    tone: 'border-primary-200 bg-white dark:bg-[#1F2330] text-slate-800 dark:text-slate-100',
  },
  {
    title: 'Journey',
    summary: 'Sequence inquiry arcs, formative feedback moments, and scaffolds that meet every learner where they are.',
    tone: 'border-ai-200 bg-white dark:bg-[#1F2330] text-slate-800 dark:text-slate-100',
  },
  {
    title: 'Deliverables',
    summary: 'Craft rubrics, exemplars, and reflective prompts that make growth visible to students and stakeholders.',
    tone: 'border-coral-200 bg-white dark:bg-[#1F2330] text-slate-800 dark:text-slate-100',
  },
];

const testimony = {
  quote:
    'Our team stopped chasing disconnected lesson plans. ALF keeps the entire project-based experience coherent, accessible, and ready to show to families and district leads.',
  attribution: 'Danielle Morales, Instructional Coach • Santa Cruz USD',
};

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [currentPage, setCurrentPage] = useState('home');

  if (currentPage === 'about') {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-[#F6F6F7] to-[#E6F0FF] dark:from-[#141721] dark:to-[#0F1E4D] flex items-center justify-center">
            <div className="text-center space-y-4">
              <AlfLogo size="lg" className="mx-auto animate-pulse" />
              <p className="text-gray-600 dark:text-gray-300">Loading ALF story…</p>
            </div>
          </div>
        }
      >
        <AboutPage onBack={() => setCurrentPage('home')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6F7] via-white to-[#E6F0FF] dark:from-[#141721] dark:via-[#1B2740] dark:to-[#0F1E4D]">
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-primary-200/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-ai-200/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Guided project design for modern classrooms
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.5rem]">
              <span className="block font-serif text-[1.2em]">Design learning journeys that stick.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-ai-500 to-coral-500">
                ALF Coach keeps every step clear.
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              Move from spark to student-ready deliverables with a coaching experience that blends Apple HIG clarity and
              Material depth. Every interaction keeps accessibility and educator craft at the center.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft"
              >
                Start building now
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-6 py-3 font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
              >
                Sign in to continue
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map(stat => (
                <div key={stat.label} className="rounded-xl border border-gray-200 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/40 shadow-soft">
            <picture>
              <source srcSet={heroImageSmall} media="(max-width: 768px)" />
              <img
                src={heroImageMedium}
                alt="Educators collaborating with ALF Coach"
                className="h-full w-full object-cover"
                loading="lazy"
                fetchpriority="low"
                width={1200}
                height={800}
                decoding="async"
              />
            </picture>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0F1E4D]/40 to-transparent" />
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <header className="mx-auto max-w-3xl text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-ai-50 px-3 py-1 text-sm font-medium text-ai-700">
              <ShieldCheck className="h-4 w-4" />
              Built for instructional leadership
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">
              Everything you need to orchestrate active learning at scale
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              ALF Coach pairs human-centered design with a responsible AI backbone. Consistency, accessibility, and evidence-based practice come standard.
            </p>
          </header>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {featureCards.map(card => (
              <article key={card.title} className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-soft">
                <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{card.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 dark:bg-[#141721]">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">
            A framework that keeps your team aligned
          </h2>
          <p className="mt-4 max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Move through the ALF stages with clarity. Each milestone includes the prompts, scaffolds, and exportable artifacts you need to bring students, leaders, and families along for the ride.
          </p>

          <div className="mt-10 space-y-6">
            {frameworkStages.map(stage => (
              <div key={stage.title} className={`rounded-2xl border-l-4 bg-white p-6 shadow-soft dark:shadow-none ${stage.tone}`}>
                <h3 className="text-2xl font-semibold">{stage.title}</h3>
                <p className="mt-2 text-base leading-relaxed">{stage.summary}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  Built-in prompts, examples, and exports ready for your team
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-primary-500 via-ai-500 to-coral-500 p-10 text-white shadow-soft-lg">
          <div className="space-y-6">
            <p className="font-serif text-2xl leading-relaxed">
              “{testimony.quote}”
            </p>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">{testimony.attribution}</p>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-primary-200 bg-white p-10 shadow-soft dark:bg-[#141721]">
          <div className="space-y-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              <Sparkles className="h-4 w-4" />
              Ready when you are
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Bring ALF Coach to your classroom or network
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Launch with the companion playbook, onboarding workshops, and evidence briefs you need to show impact from day one.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft"
              >
                Schedule a walkthrough
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-6 py-3 font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
              >
                Explore our story
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
