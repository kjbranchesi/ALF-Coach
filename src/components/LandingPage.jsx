// src/components/LandingPage.jsx

import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users } from 'lucide-react';
import heroImageMedium from '../images/CoverImageLanding@1200w.png';
import heroImageSmall from '../images/CoverImageLanding@768w.png';
import ideationStageImage from '../images/Ideation Stage.png';
import journeyStageImage from '../images/Journey Stage.png';
import deliverablesStageImage from '../images/Deliverables Stage.png';

const stats = [
  { value: '8pts', label: 'Higher standardized science scores in PBL schools' },
  { value: '98%', label: 'College enrollment at High Tech High network' },
  { value: '51%', label: 'Improvement in problem-solving scores' },
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
    image: ideationStageImage,
  },
  {
    title: 'Journey',
    summary: 'Sequence inquiry arcs, formative feedback moments, and scaffolds that meet every learner where they are.',
    image: journeyStageImage,
  },
  {
    title: 'Deliverables',
    summary: 'Craft rubrics, exemplars, and reflective prompts that make growth visible to students and stakeholders.',
    image: deliverablesStageImage,
  },
];

const testimony = {
  quote:
    'Our team stopped chasing disconnected lesson plans. ALF keeps the entire project-based experience coherent, accessible, and ready to show to families and district leads.',
  attribution: 'Danielle Morales, Instructional Coach • Santa Cruz USD',
};

export default function LandingPage({ onGetStarted, onSignIn }) {

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6F7] via-white to-[#E6F0FF] dark:from-[#141721] dark:via-[#1B2740] dark:to-[#0F1E4D]">
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-primary-200/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-ai-200/30 blur-3xl" />
        </div>

        {/* Full-width WEF Quote - spans entire section */}
        <div className="relative z-10 mx-auto max-w-6xl px-6 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm mb-6">
              <Sparkles className="h-4 w-4" />
              The Future of Work is Here
            </div>
            <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl font-light text-slate-700 dark:text-slate-300 italic leading-relaxed mb-4 max-w-5xl mx-auto">
              "65% of children entering primary school today will work in job categories that don't yet exist."
            </blockquote>
            <cite className="text-sm text-slate-500 dark:text-slate-500 font-medium">
              — World Economic Forum, Future of Jobs Report
            </cite>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
          <div className="max-w-xl space-y-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.5rem]">
              <span className="block font-serif text-[1.2em]">Prepare students for jobs that don't exist yet.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-ai-500 to-coral-500">
                ALF Coach makes it systematic.
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              <strong>Active Learning Framework (ALF)</strong> transforms standards into engaging Project-Based Learning (PBL) experiences that develop the skills executives value most: adaptability, communication, and collaborative problem-solving.
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
              <div className="rounded-xl border border-gray-200 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400">93%</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">of HR executives rank adaptability as the most important skill</p>
                <p className="text-xs text-slate-500 mt-1">Source: McKinsey Global Institute</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold text-success-600 dark:text-success-400">8-10pts</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">higher AP exam scores in Project-Based Learning courses</p>
                <p className="text-xs text-slate-500 mt-1">Source: Research controlled studies</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                <p className="text-2xl font-semibold text-coral-600 dark:text-coral-400">37%</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">skills gap: employers want collaboration, graduates lack preparation</p>
                <p className="text-xs text-slate-500 mt-1">Source: NACE surveys</p>
              </div>
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

      {/* Why Project-Based Learning Section */}
      <section className="px-6 py-16 bg-slate-50 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-sm font-medium text-success-700 mb-6">
              <CheckCircle className="h-4 w-4" />
              Why Project-Based Learning (PBL)?
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
              Research shows PBL works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Rigorous studies confirm that well-designed Project-Based Learning doesn't just prepare students for the future—it improves academic outcomes today.
            </p>
          </div>

          {/* Tony Wagner Quote - moved here */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <blockquote className="font-serif text-xl text-slate-700 dark:text-slate-300 italic leading-relaxed border-l-4 border-primary-200 pl-6">
              "The world doesn't care what you know. What the world cares about is what you can do with what you know."
            </blockquote>
            <cite className="block text-sm text-slate-500 dark:text-slate-500 font-medium mt-4">
              — Tony Wagner, Harvard Innovation Lab
            </cite>
          </div>

          {/* Research Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft text-center">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">8-10pts</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Higher AP Exam Pass Rates</div>
              <div className="text-xs text-slate-500 dark:text-slate-500">in Project-Based Learning courses</div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft text-center">
              <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">51%</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Improvement in Problem-Solving</div>
              <div className="text-xs text-slate-500 dark:text-slate-500">25.5 vs 16.9 out of 30 points</div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft text-center">
              <div className="text-3xl font-bold text-coral-600 dark:text-coral-400 mb-2">2x</div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Better Long-term Retention</div>
              <div className="text-xs text-slate-500 dark:text-slate-500">compared to traditional instruction</div>
            </div>
          </div>

          {/* Expert Quote */}
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="font-serif text-xl text-slate-700 dark:text-slate-300 italic leading-relaxed">
              "Students learn content as well or better using Project-Based Learning than with traditional instruction. PBL provides the opportunity to learn and practice skills that traditional instruction often ignores—working in groups, making choices, monitoring progress, thinking deeply about a problem or challenge, and communicating what has been learned."
            </blockquote>
            <cite className="block text-sm text-slate-500 dark:text-slate-500 font-medium mt-4">
              — John Mergendoller, Former Director, Buck Institute for Education
            </cite>
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
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-6">
              <Sparkles className="h-4 w-4" />
              How ALF Works
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
              Active Learning Framework (ALF) Process
            </h2>
            <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-300 mx-auto">
              ALF transforms educational standards into engaging Project-Based Learning experiences through three systematic stages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {frameworkStages.map((stage, index) => (
              <div key={stage.title} className="text-center">
                <div className="mb-6">
                  <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-2xl bg-white shadow-soft">
                    <img
                      src={stage.image}
                      alt={`${stage.title} stage illustration`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{stage.title}</h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">{stage.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Ready to transform your classroom?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Start creating engaging Project-Based Learning experiences with ALF Coach.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
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
          </div>
        </div>
      </section>
    </div>
  );
}
