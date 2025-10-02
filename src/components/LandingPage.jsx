// src/components/LandingPage.jsx

import React from 'react';
import { ArrowRight, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Users, Zap, Route, Target, ExternalLink, Clock, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listProjectsV2 } from '../utils/showcaseV2-registry';
import { AlfLogo } from './ui/AlfLogo';
import SolarSystemAnimation from './ui/SolarSystemAnimation';
import TransformationAnimation from './ui/TransformationAnimation';
import STEAMVennDiagram from './ui/STEAMVennDiagram';
import { AnimationsShowcase } from '../animations/landing';
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
  const showLandingAnimations = import.meta.env.VITE_SHOW_LANDING_ANIMS !== 'false';

  const gradeBandLabels = {
    ES: 'Elementary School',
    MS: 'Middle School',
    HS: 'High School'
  };

  // Use showcase V2 projects for landing page feature grid
  const featuredProjects = listProjectsV2().slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
      <section className="relative overflow-hidden brand-section pt-28">

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
              <div className="inline-flex items-center gap-3 brand-surface px-5 py-3">
                <AlfLogo size="sm" showText={false} />
                <span className="text-sm font-medium text-slate-700">Active Learning Framework</span>
              </div>
            </ScrollReveal>

            {/* Simplified above-the-fold headline */}
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h1 className="text-4xl font-medium text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-5xl leading-[1.4] font-serif">
                <span className="block">Increase STEAM Learning Through</span>
                <span className="block text-slate-900 dark:text-slate-50 font-semibold">
                  <span className="relative inline-block">
                    <span>Personalized</span>
                  </span>{" "}
                  <span className="relative inline-block">
                    Project-Based Curriculum
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full opacity-80"></span>
                  </span>
                </span>
                <span className="block text-slate-700 dark:text-slate-300 mt-3 text-3xl sm:text-4xl lg:text-4xl font-normal">with <span className="font-sans font-bold">Alf Studio</span>, your AI teaching partner</span>
              </h1>
            </ScrollReveal>

            {/* Simple, truthful value proposition */}
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
                <span className="font-sans font-bold">Alf Studio</span> empowers educators to design personalized STEAM project-based learning that fits their students and context—building confidence, skills, and pathways to high-growth STEAM careers.
              </p>
            </ScrollReveal>

            {/* Clear, honest CTAs */}
            <ScrollReveal variant="fadeUp" delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2 squircle-pure bg-primary-500 px-8 py-4 text-lg font-semibold text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft"
                >
                  Start Building Together
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => navigate('/app/samples')}
                  className="inline-flex items-center justify-center gap-2 squircle-pure border border-primary-200 bg-white px-8 py-4 text-lg font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
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

      {/* Trust & Stats Bar */}
      <section className="px-6 py-12 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-5xl mx-auto">
          <StaggeredReveal className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <StaggeredItem delay={0.1}>
              <div className="squircle-pure bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">Pre-K–12</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">All Grade Levels Supported</div>
              </div>
            </StaggeredItem>
            <StaggeredItem delay={0.2}>
              <div className="squircle-pure bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">Real-World</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Authentic Projects</div>
              </div>
            </StaggeredItem>
            <StaggeredItem delay={0.3}>
              <div className="squircle-pure bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
                <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">Minutes</div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Not Weeks to Plan PBL</div>
              </div>
            </StaggeredItem>
          </StaggeredReveal>
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
                  Democratizing Access to Quality STEAM Education
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.2}>
                <p className="text-xl leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-sans font-bold">Alf Studio</span> is an AI teaching companion that addresses critical barriers in STEAM education—making high-quality, personalized project-based learning accessible to all students, regardless of school resources, geography, or background.
                </p>
              </ScrollReveal>
              <ScrollReveal variant="fadeUp" delay={0.3}>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  From project planning to personalized learning paths, <span className="font-sans font-bold">Alf Studio</span> helps educators create engaging, real-world STEAM experiences that build student confidence and identity in STEAM fields.
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
      <section className="brand-section bg-gradient-to-r from-blue-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
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
                  <span className="font-sans font-bold">Alf Studio</span> sits at the intersection of all STEAM fields, helping you create truly interdisciplinary project-based learning experiences.
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

      {/* Educator-Centered Design Section */}
      <section className="brand-section bg-white/80 dark:bg-slate-800/80">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <ScrollReveal variant="fadeUp" delay={0.1}>
              <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Designed For & With Educators
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                <span className="font-sans font-bold">Alf Studio</span> was built through extensive collaboration with K-12 teachers, addressing their #1 challenge: feeling unprepared to teach STEAM subjects effectively.
              </p>
            </ScrollReveal>
          </div>

          <StaggeredReveal className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggeredItem delay={0.1}>
              <div className="squircle-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Save Time</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Reduces PBL planning from weeks to minutes</p>
              </div>
            </StaggeredItem>

            <StaggeredItem delay={0.2}>
              <div className="squircle-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-coral-100 dark:bg-coral-900/30 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-coral-600 dark:text-coral-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Professional Growth</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Provides PD through guided curriculum design</p>
              </div>
            </StaggeredItem>

            <StaggeredItem delay={0.3}>
              <div className="squircle-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Ready to Use</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Creates complete, assessment-ready learning arcs</p>
              </div>
            </StaggeredItem>

            <StaggeredItem delay={0.4}>
              <div className="squircle-card bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 p-6 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-ai-100 dark:bg-ai-900/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-ai-600 dark:text-ai-400" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">All Learners</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Works for students with diverse learning needs</p>
              </div>
            </StaggeredItem>
          </StaggeredReveal>

        </div>
      </section>

      {/* Featured Projects Showcase */}
      <section className="relative brand-section bg-gradient-to-br from-slate-100 via-white to-blue-50/30 dark:from-slate-800 dark:via-slate-900 dark:to-blue-900/20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <ScrollReveal variant="scaleIn" delay={0.1}>
              <span className="brand-chip brand-chip-lg inline-flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4" />
                See <span className="font-sans font-bold">Alf Studio</span> in Action
              </span>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl mb-4">
                Real STEAM Learning Experiences Created in Minutes
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                These interdisciplinary STEAM projects were designed by educators using <span className="font-sans font-bold">Alf Studio</span>. Each connects students to real-world applications, diverse role models, and multiple career pathways—from renewable energy to community health to engineering design.
              </p>
            </ScrollReveal>
          </div>

          <StaggeredReveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.map(project => (
              <ScrollAwareCard
                key={project.id}
                className="group squircle-card overflow-hidden cursor-pointer bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)]"
                onClick={() => navigate(`/app/showcase/${project.id}`)}
                hoverScale={1.02}
                hoverShadow="0 12px 32px rgba(15, 23, 42, 0.12)"
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
                    <span className="brand-chip">
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
                className="inline-flex items-center gap-2 squircle-pure border border-primary-200 bg-primary-50 px-6 py-3 font-medium text-primary-700 transition-all duration-200 hover:bg-primary-100"
              >
                View All Example Learning Experiences
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {showLandingAnimations && (
        <AnimationsShowcase />
      )}

      {/* Simple Learn More Link */}
      <section className="brand-section bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
        <div className="mx-auto max-w-4xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              Want to understand how Project-Based Learning transforms education?
            </p>
            <button
              onClick={() => navigate('/how-it-works')}
              className="inline-flex items-center gap-2 squircle-pure border-2 border-primary-200 bg-white px-6 py-3 text-base font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50"
            >
              Learn How <span className="font-sans font-bold">Alf Studio</span> Works
              <ArrowRight className="h-4 w-4" />
            </button>
          </ScrollReveal>
        </div>
      </section>

      <section className="brand-section bg-gradient-to-r from-primary-600/10 to-purple-600/10 dark:from-primary-900/20 dark:to-purple-900/20">
        <div className="mx-auto max-w-6xl text-center">
          <ScrollReveal variant="fadeUp" delay={0.1}>
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
              Join Educators Transforming STEAM Access Nationwide
            </h2>
          </ScrollReveal>
          <ScrollReveal variant="fadeUp" delay={0.2}>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Help us make quality STEAM education accessible to every learner in America. Whether you're an elementary teacher exploring science education or a high school educator illuminating STEAM career pathways, <span className="font-sans font-bold">Alf Studio</span> is your partner in creating transformative learning experiences.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="scaleIn" delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4 mt-8 md:mt-12">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 squircle-pure bg-primary-500 px-8 py-4 text-white shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-600 hover:shadow-soft text-lg font-medium"
              >
                Open <span className="font-sans font-bold">Alf Studio</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center gap-2 squircle-pure border border-primary-200 bg-white px-8 py-4 font-medium text-primary-600 transition-all duration-200 hover:bg-primary-50 text-lg"
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
