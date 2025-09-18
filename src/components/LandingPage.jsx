// src/components/LandingPage.jsx

import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users, Zap, Route, Target, ExternalLink, Clock, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import heroBackgroundImage from '../images/Ideation Stage.png';
import { getHeroProjectsMetadata } from '../utils/hero-projects';
import { AlfLogo } from './ui/AlfLogo';
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

  // Get first 6 hero projects for showcase
  const featuredProjects = getHeroProjectsMetadata().slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6F7] via-white via-[#FAFBFF] to-[#E6F0FF] dark:from-[#141721] dark:via-[#1B2740] dark:to-[#0F1E4D]">
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <FloatingBackground intensity={15} duration={12}>
            <div className="absolute inset-x-0 -top-40 h-80 bg-gradient-to-b from-primary-200/40 to-transparent blur-3xl" />
          </FloatingBackground>
          <FloatingBackground intensity={10} duration={16}>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-ai-200/30 blur-3xl" />
          </FloatingBackground>
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-8">
            {/* ALF Logo Tag - inspired by Clever's clean approach */}
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <div className="inline-flex items-center gap-3 rounded-full bg-white/80 backdrop-blur-sm px-5 py-3 shadow-sm border border-primary-100">
                <AlfLogo size="sm" showText={false} />
                <span className="text-sm font-medium text-slate-700">Active Learning Framework</span>
              </div>
            </ScrollReveal>

            {/* Enhanced headline with improved typography hierarchy */}
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-primary-50 to-ai-50 dark:from-primary-900/30 dark:to-ai-900/30 rounded-full border border-primary-200/50 dark:border-primary-700/50">
                  <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-sm font-medium text-primary-700 dark:text-primary-300 tracking-wide">AI-POWERED CURRICULUM GENERATION</span>
                </div>
                <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50 sm:text-6xl lg:text-7xl leading-[0.9] font-sans tracking-tight">
                  <span className="block">Turn any teaching idea into</span>
                  <span className="block relative text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-ai-500 to-coral-500 mb-2">
                    complete curriculum
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-400/60 to-ai-400/60 rounded-full"></span>
                  </span>
                  <span className="block text-slate-700 dark:text-slate-300 text-4xl sm:text-5xl lg:text-6xl font-semibold">in under 5 minutes</span>
                </h1>
              </div>
            </ScrollReveal>

            {/* Enhanced value proposition with dual-audience appeal */}
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl font-medium">
                No more late nights struggling with lesson plans. ALF's AI instantly generates standards-aligned projects with rubrics, assessments, timelines, and activities—everything you need for engaging project-based learning that prepares students for tomorrow's careers.
              </p>
            </ScrollReveal>

            {/* Enhanced dual benefit cards with metrics and improved design */}
            <ScrollReveal variant="scaleIn" delay={0.5}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-900/20 dark:via-slate-800 dark:to-emerald-900/10 rounded-2xl border border-emerald-200/70 dark:border-emerald-800/50 p-6 group hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800/30 dark:to-emerald-700/20 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg">
                        <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-emerald-800 dark:text-emerald-200">Time Savings</h3>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">10+ Hours</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      saved per project with AI-generated curriculum and assessments
                    </p>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-primary-50/50 dark:from-blue-900/20 dark:via-slate-800 dark:to-primary-900/10 rounded-2xl border border-blue-200/70 dark:border-blue-800/50 p-6 group hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-primary-200 dark:from-blue-800/30 dark:to-primary-700/20 rounded-full -mr-10 -mt-10 opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                        <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">Standards Compliance</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">100%</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      auto-aligned to standards with built-in assessment rubrics
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Enhanced social proof with better visual design */}
            <ScrollReveal variant="fadeUp" delay={0.6}>
              <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex -space-x-3">
                  <div className="relative w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full border-3 border-white dark:border-slate-800 shadow-lg">
                    <div className="absolute inset-2 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-3 border-white dark:border-slate-800 shadow-lg">
                    <div className="absolute inset-2 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-600 rounded-full border-3 border-white dark:border-slate-800 shadow-lg">
                    <div className="absolute inset-2 bg-white/20 rounded-full"></div>
                  </div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-ai-400 to-ai-600 rounded-full border-3 border-white dark:border-slate-800 shadow-lg">
                    <div className="absolute inset-2 bg-white/20 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                    <Star className="h-4 w-4 text-amber-400 fill-current" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Trusted by educators creating <strong className="text-slate-900 dark:text-slate-100">next-generation learning experiences</strong>
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Enhanced CTAs with improved hierarchy and design */}
            <ScrollReveal variant="fadeUp" delay={0.7}>
              <div className="space-y-5 pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={onGetStarted}
                    className="group relative inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-primary-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-[1.02]"
                  >
                    <span className="relative z-10">Create Your First Project</span>
                    <Zap className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => navigate('/app/samples')}
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-8 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Browse Sample Projects
                    <Route className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium">Free to try</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <span className="font-medium">No credit card required</span>
                  <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary-500" />
                    <span className="font-medium">Ready in seconds</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="relative w-full max-w-xl">
            <GentleParallax offset={30} className="relative">
              <ScrollReveal variant="fadeUp" delay={0.4}>
                <img
                  src={heroBackgroundImage}
                  alt="Creative ideation and collaboration"
                  className="w-full h-auto opacity-90"
                  loading="lazy"
                  fetchpriority="low"
                  decoding="async"
                />
              </ScrollReveal>
            </GentleParallax>
          </div>
        </div>
      </section>

      {/* WEF Statistic Bridge */}
      <section className="relative px-6 py-12 bg-gradient-to-b from-transparent via-slate-50/40 to-white/60">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <blockquote className="font-serif text-xl md:text-2xl font-light text-slate-700 dark:text-slate-300 italic leading-relaxed mb-3">
              "65% of children entering primary school today will work in job categories that don't yet exist."
            </blockquote>
            <cite className="text-sm text-slate-500 dark:text-slate-500 font-medium">
              — World Economic Forum, Future of Jobs Report
            </cite>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="relative px-6 py-16 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <ScrollReveal variant="scaleIn" delay={0.1}>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-4">
                <Sparkles className="h-4 w-4" />
                See ALF in Action
              </span>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                Complete Learning Experiences Created with the ALF Project Builder
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                These comprehensive learning experiences were designed in minutes using ALF. Each includes standards alignments, assessment rubrics, and everything educators need for transformative Project-Based Learning.
              </p>
            </ScrollReveal>
          </div>

          <StaggeredReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map((project) => (
              <ScrollAwareCard
                key={project.id}
                className="group bg-white/80 backdrop-blur-xl dark:bg-slate-800/80 rounded-2xl overflow-hidden cursor-pointer border border-white/20 dark:border-slate-600/30 hover:border-primary-200/50"
                onClick={() => navigate(`/app/samples/${project.id}`)}
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
                    {project.description.substring(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {project.gradeLevel}
                    </span>
                    <span>{project.duration}</span>
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
      <section className="px-6 py-12 bg-gradient-to-b from-transparent to-slate-50/50">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.1}>
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
          </ScrollReveal>
        </div>
      </section>

      <section className="px-6 py-20 bg-slate-50/30 backdrop-blur-sm dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Ready to build your next project with the ALF Project Builder?
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Join educators worldwide who are creating engaging, standards-aligned experiences with the ALF Project Builder.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="scaleIn" delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-8 py-4 text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft text-lg font-medium"
              >
                Open ALF Project Builder
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
