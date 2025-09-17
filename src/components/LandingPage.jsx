// src/components/LandingPage.jsx

import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users, Zap, Route, Target, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBackgroundImage from '../images/Ideation Stage.png';
import { getHeroProjectsMetadata } from '../utils/hero-projects';
import { AlfLogo } from './ui/AlfLogo';

const stats = [
  { value: '8pts', label: 'Higher standardized science scores in Project-Based Learning schools' },
  { value: '98%', label: 'College enrollment at High Tech High network' },
  { value: '51%', label: 'Improvement in problem-solving scores' },
];

const featureCards = [
  {
    title: 'Flexible project frameworks',
    description:
      'Start with proven project units, adapt them to your students, and watch ALF adjust to meet your classroom needs.',
    accent: 'bg-primary-100 text-primary-700',
    icon: Sparkles,
  },
  {
    title: 'Your AI teaching partner',
    description:
      'Collaborate with AI to brainstorm ideas, draft rubrics, and refine activities—while you stay in complete control of the learning experience.',
    accent: 'bg-ai-100 text-ai-700',
    icon: Lightbulb,
  },
  {
    title: 'Team collaboration made easy',
    description:
      'Share lesson plans with colleagues and administrators. Keep everyone aligned on student progress and learning goals.',
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


export default function LandingPage({ onGetStarted, onSignIn }) {
  const navigate = useNavigate();

  // Get first 6 hero projects for showcase
  const featuredProjects = getHeroProjectsMetadata().slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6F7] via-white via-[#FAFBFF] to-[#E6F0FF] dark:from-[#141721] dark:via-[#1B2740] dark:to-[#0F1E4D]">
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-primary-200/40 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-ai-200/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-8">
            {/* ALF Logo Tag - inspired by Clever's clean approach */}
            <div className="inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-sm px-5 py-3 shadow-sm border border-primary-100">
              <AlfLogo size="sm" showText={false} />
              <span className="text-sm font-medium text-slate-700">Active Learning Framework</span>
            </div>

            {/* Warmer headline with serif elegance but approachable tone */}
            <h1 className="text-5xl font-medium text-slate-900 dark:text-slate-50 sm:text-6xl lg:text-6xl leading-[1.15] font-serif">
              <span className="block">Build on your</span>
              <span className="block relative text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-ai-500 to-coral-500">
                teaching expertise
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400/60 to-ai-400/60 rounded-full"></span>
              </span>
            </h1>

            {/* Warmer, more conversational value proposition */}
            <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
              AI helps you turn standards into engaging projects, while you stay in complete control of the learning experience.
            </p>

            {/* Warm benefit callout - bringing back engagement */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-primary-50 dark:from-blue-900/20 dark:to-primary-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-base text-blue-700 dark:text-blue-300">
                Design meaningful projects that leverage your classroom knowledge
              </p>
            </div>

            {/* Warmer CTA structure */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft"
              >
                Explore ALF
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/app/samples')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-8 py-4 text-lg font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
              >
                See Examples
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-xl">
            <img
              src={heroBackgroundImage}
              alt="Creative ideation and collaboration"
              className="w-full h-auto opacity-90"
              loading="lazy"
              fetchpriority="low"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* WEF Statistic Bridge */}
      <section className="relative px-6 py-12 bg-gradient-to-b from-transparent via-slate-50/40 to-white/60">
        <div className="mx-auto max-w-4xl text-center">
          <blockquote className="font-serif text-xl md:text-2xl font-light text-slate-700 dark:text-slate-300 italic leading-relaxed mb-3">
            "65% of children entering primary school today will work in job categories that don't yet exist."
          </blockquote>
          <cite className="text-sm text-slate-500 dark:text-slate-500 font-medium">
            — World Economic Forum, Future of Jobs Report
          </cite>
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="relative px-6 py-16 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-4">
              <Sparkles className="h-4 w-4" />
              See ALF in Action
            </span>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
              Complete Learning Experiences Created with ALF
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              These comprehensive learning experiences were designed in minutes using ALF. Each includes standards alignments, assessment rubrics, and everything educators need for transformative Project-Based Learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/app/samples/${project.id}`)}
                className="group bg-white/80 backdrop-blur-xl dark:bg-slate-800/80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-white/20 dark:border-slate-600/30 hover:border-primary-200/50"
              >
                {project.image && (
                  <div className="relative w-full h-40 mb-4">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                    {project.description.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {project.gradeLevel}
                    </span>
                    <span>{project.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/app/samples')}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-6 py-3 font-medium text-primary-700 transition-all duration-200 hover:bg-primary-100"
            >
              View All Example Learning Experiences
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Simple Learn More Link */}
      <section className="px-6 py-12 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
            Want to understand how Project-Based Learning transforms education?
          </p>
          <button
            onClick={() => navigate('/how-it-works')}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-6 py-3 text-base font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
          >
            Learn How ALF Works
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="px-6 py-20 bg-slate-50/30 backdrop-blur-sm dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Ready to transform education with Project-Based Learning?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
            Join educators worldwide who are creating engaging, standards-aligned Project-Based Learning experiences that prepare students for tomorrow's challenges.
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
      </section>
    </div>
  );
}
