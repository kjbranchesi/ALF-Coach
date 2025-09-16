// src/components/LandingPage.jsx

import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users, Zap, Route, Target, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroImageMedium from '../images/CoverImageLanding@1200w.png';
import heroImageSmall from '../images/CoverImageLanding@768w.png';
import AlfLogo from './ui/AlfLogo';
import { getHeroProjectsMetadata } from '../utils/hero-projects';

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
    icon: Zap,
    color: 'from-amber-400 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
  },
  {
    title: 'Journey',
    summary: 'Sequence inquiry arcs, formative feedback moments, and scaffolds that meet every learner where they are.',
    icon: Route,
    color: 'from-teal-400 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
  },
  {
    title: 'Deliverables',
    summary: 'Craft rubrics, exemplars, and reflective prompts that make growth visible to students and stakeholders.',
    icon: Target,
    color: 'from-coral-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-coral-50 to-pink-50',
  },
];

const testimony = {
  quote:
    'Our team stopped chasing disconnected lesson plans. ALF keeps the entire project-based experience coherent, accessible, and ready to show to families and district leads.',
  attribution: 'Danielle Morales, Instructional Coach • Santa Cruz USD',
};

export default function LandingPage({ onGetStarted, onSignIn }) {
  const navigate = useNavigate();

  // Get first 6 hero projects for showcase
  const featuredProjects = getHeroProjectsMetadata().slice(0, 6);

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

      {/* Featured Projects Showcase */}
      <section className="px-6 py-16 bg-white dark:bg-slate-800">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-4">
              <Sparkles className="h-4 w-4" />
              See ALF in Action
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
              Real Project-Based Learning Created with ALF
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              These complete project blueprints were designed in minutes using ALF Coach. Each includes standards alignments, assessment rubrics, and everything needed for transformative PBL.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/app/samples/${project.id}`)}
                className="group bg-slate-50 dark:bg-slate-700 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-slate-200 dark:border-slate-600"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {project.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {project.description.substring(0, 120)}...
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500">
                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-lg">
                    {project.gradeLevel}
                  </span>
                  <span>{project.duration}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/app/samples')}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-6 py-3 font-medium text-primary-700 transition-all duration-200 hover:bg-primary-100"
            >
              View All Sample Projects
              <ExternalLink className="h-4 w-4" />
            </button>
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
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl ${stage.bgColor} flex items-center justify-center shadow-soft`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stage.color} flex items-center justify-center`}>
                      <stage.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{stage.title}</h3>
                <p className="text-base leading-relaxed text-slate-600 dark:text-slate-300">{stage.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Ready to transform education with Project-Based Learning?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join educators worldwide who are creating engaging, standards-aligned PBL experiences that prepare students for tomorrow's challenges.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft text-lg font-medium"
              >
                Start building now
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-8 py-4 font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50 text-lg"
              >
                Sign in to continue
              </button>
            </div>
          </div>

          {/* Footer with ALF branding */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <AlfLogo size="md" />
                <div className="text-left">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">ALF Coach</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Learning Framework</p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  Empowering educators to create meaningful Project-Based Learning experiences
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  © 2024 ALF Coach. Transforming education through systematic PBL design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
