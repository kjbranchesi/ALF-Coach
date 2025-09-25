// src/components/LandingPage.jsx

import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users, Zap, Route, Target, ExternalLink, Clock, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listProjectsV2 } from '../utils/showcaseV2-registry';
import { AlfLogo } from './ui/AlfLogo';
import SolarSystemAnimation from './ui/SolarSystemAnimation';
import TransformationAnimation from './ui/TransformationAnimation';
import STEAMVennDiagram from './ui/STEAMVennDiagram';
import {
  ScrollReveal,
  StaggeredReveal,
  StaggeredItem,
  GentleParallax,
  ScrollAwareCard,
  FloatingBackground,
  CountUp,
  SequentialText,
  useReducedMotion
} from './animations/ScrollAnimations';



export default function LandingPage({ onGetStarted, onSignIn }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const gradeBandLabels = {
    ES: 'Elementary School',
    MS: 'Middle School',
    HS: 'High School'
  };

  // Use showcase V2 projects for landing page feature grid
  const featuredProjects = listProjectsV2().slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
      <section className="relative overflow-hidden pt-28 pb-20">

        <div className="absolute inset-0 pointer-events-none">
          <FloatingBackground intensity={15} duration={12}>
            <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-primary-200/20 to-transparent blur-3xl" />
          </FloatingBackground>
          <FloatingBackground intensity={10} duration={16}>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-ai-200/20 blur-3xl" />
          </FloatingBackground>
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-8">
            {/* Clean partnership indicator */}
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-sm px-5 py-3 shadow-sm border border-primary-100">
                <AlfLogo size="sm" showText={false} />
                <span className="text-sm font-medium text-slate-700">Active Learning Framework</span>
              </div>
            </ScrollReveal>

            {/* Simplified above-the-fold headline */}
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h1 className="text-4xl font-medium text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-5xl leading-[1.4] font-serif">
                <span className="block">Build custom, relevant</span>
                <span className="block text-slate-900 dark:text-slate-50 font-semibold">
                  <span className="relative inline-block">
                    Project-Based Learning
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full opacity-80"></span>
                  </span>{" "}
                  <span>Curriculum</span>
                </span>
                <span className="block text-slate-700 dark:text-slate-300 mt-3 text-3xl sm:text-4xl lg:text-4xl font-normal">with <span className="font-sans font-bold">Alf</span>, your teaching partner</span>
              </h1>
            </ScrollReveal>

            {/* Simple, truthful value proposition */}
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
                <span className="font-sans font-bold">Alf</span> helps teachers create project-based learning that fits your students and context.
              </p>
            </ScrollReveal>

            {/* Clear, honest CTAs */}
            <ScrollReveal variant="fadeUp" delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft"
                >
                  Start Building Together
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/app/samples')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-8 py-4 text-lg font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
                >
                  See Examples
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Transformation Animation */}
          <div className="relative w-full max-w-lg flex justify-center lg:justify-end">
            <ScrollReveal variant="fadeUp" delay={0.4}>
              <div className="relative w-96 h-96">
                <TransformationAnimation />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WEF Statistic Bridge */}
      <section className="relative px-6 py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <blockquote className="font-serif text-xl md:text-2xl font-light text-slate-700 dark:text-slate-300 italic leading-relaxed mb-3">
              "65% of children entering primary school today will work in job categories that don't yet exist."
            </blockquote>
            <cite className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              — World Economic Forum, Future of Jobs Report
            </cite>
          </ScrollReveal>
        </div>
      </section>

      {/* What is Alf Section */}
      <section className="relative px-6 py-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="space-y-6">
              <ScrollReveal variant="fadeUp" delay={0.1}>
                <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-slate-100">
                  What is Alf?
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.2}>
                <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-sans font-bold">Alf</span> is an AI teaching companion designed specifically for education that helps teachers create custom project-based learning experiences that fit their students, context, and curriculum goals.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.3}>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  From standards alignment to collaborative projects, Alf orchestrates all the essential components of effective project-based learning in one integrated ecosystem.
                </p>
              </ScrollReveal>
            </div>

            {/* Solar System Animation */}
            <div className="flex justify-center lg:justify-end">
              <ScrollReveal variant="scaleIn" delay={0.4}>
                <div className="relative">
                  <SolarSystemAnimation className="w-80 h-80 sm:w-96 sm:h-96" />

                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-coral-50/50 dark:from-primary-900/20 dark:to-coral-900/20 rounded-full blur-3xl -z-10 scale-150" />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* STEAM Integration Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* STEAM Venn Diagram */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <ScrollReveal variant="scaleIn" delay={0.2}>
                <STEAMVennDiagram />
              </ScrollReveal>
            </div>

            {/* Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <ScrollReveal variant="fadeUp" delay={0.1}>
                <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-slate-100">
                  Integrated STEAM Learning
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.2}>
                <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-sans font-bold">Alf</span> sits at the intersection of all STEAM fields, helping you create truly interdisciplinary project-based learning experiences.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.3}>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Science, Technology, Engineering, Arts, and Mathematics converge to create rich, real-world learning opportunities that prepare students for tomorrow's challenges.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="relative px-6 py-16 bg-gradient-to-br from-slate-100 via-white to-blue-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-blue-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <ScrollReveal variant="scaleIn" delay={0.1}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-4">
                <Sparkles className="h-4 w-4" />
                See <span className="font-sans font-bold">Alf</span> in Action
              </span>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                Complete Learning Experiences Created with the <span className="font-sans font-bold">Alf</span> Project Builder
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                These comprehensive learning experiences were designed in minutes using <span className="font-sans font-bold">Alf</span>. Each includes standards alignments, assessment rubrics, and everything educators need for transformative Project-Based Learning.
              </p>
            </ScrollReveal>
          </div>

          <StaggeredReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map(project => (
              <ScrollAwareCard
                key={project.id}
                className="group bg-white/80 backdrop-blur-xl dark:bg-slate-800/80 rounded-2xl overflow-hidden cursor-pointer border border-white/20 dark:border-slate-600/30 hover:border-primary-200/50"
                onClick={() => navigate(`/app/showcase/${project.id}`)}
                hoverScale={1.03}
                hoverShadow="0 25px 50px rgba(0, 0, 0, 0.15)"
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
                    {project.tagline || 'Explore this project to see the full experience.'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {gradeBandLabels[project.gradeBand] ?? project.gradeBand}
                    </span>
                    <span>{project.timeframe}</span>
                  </div>
                </div>
              </ScrollAwareCard>
            ))}
          </StaggeredReveal>

          <ScrollReveal variant="fadeUp" delay={0.2}>
            <div className="text-center">
              <button
                onClick={() => navigate('/app/samples')}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-6 py-3 font-medium text-primary-700 transition-all duration-200 hover:bg-primary-100"
              >
                View All Example Learning Experiences
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Simple Learn More Link */}
      <section className="px-6 py-12 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Want to understand how Project-Based Learning transforms education?
            </p>
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-primary-200 bg-white px-6 py-3 text-base font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
            >
              Learn How <span className="font-sans font-bold">Alf</span> Works
              <ArrowRight className="h-4 w-4" />
            </button>
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-20 bg-gradient-to-r from-primary-600/10 to-purple-600/10 dark:from-primary-900/20 dark:to-purple-900/20">
        <div className="mx-auto max-w-6xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Ready to build your next project with the <span className="font-sans font-bold">Alf</span> Project Builder?
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join educators worldwide who are creating engaging, standards-aligned experiences with the <span className="font-sans font-bold">Alf</span> Project Builder.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="scaleIn" delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft text-lg font-medium"
              >
                Open <span className="font-sans font-bold">Alf</span> Project Builder
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-8 py-4 font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50 text-lg"
              >
                Sign in to continue
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
