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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Ultra-clean hero section - everything above the fold */}
      <section className="relative px-6 pt-32 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-4xl mx-auto space-y-8">

            {/* Clean partnership indicator */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full">
              <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Teaching Partnership</span>
            </div>

            {/* Ultra-clean headline with perfect hierarchy */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-slate-50 leading-tight tracking-tight">
                Build custom, relevant
                <span className="block text-primary-600 dark:text-primary-400">PBL</span>
                <span className="block text-4xl md:text-5xl lg:text-6xl font-normal text-slate-700 dark:text-slate-300">
                  with your AI teaching partner
                </span>
              </h1>

              {/* Simple, truthful value proposition */}
              <p className="text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                ALF helps teachers create project-based learning that fits your students and context.
              </p>
            </div>

            {/* Clear, honest CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Start Building Together
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/app/samples')}
                className="inline-flex items-center justify-center gap-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-8 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                See Examples
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Free to try • No credit card required
            </p>

          </div>
        </div>
      </section>

      {/* Minimal examples section - only show if space allows */}
      <section className="px-6 py-16 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
              See ALF in Action
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Real project-based learning experiences created with ALF
            </p>
          </div>

          {/* Simplified examples grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div
              className="group bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-200"
              onClick={() => navigate('/app/samples')}
            >
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Solar-Powered Community
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                High school engineering project with real-world impact
              </p>
              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                Grades 9-12
              </span>
            </div>

            <div
              className="group bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-200"
              onClick={() => navigate('/app/samples')}
            >
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                Local History Documentary
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Middle school social studies research project
              </p>
              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                Grades 6-8
              </span>
            </div>

            <div
              className="group bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-200"
              onClick={() => navigate('/app/samples')}
            >
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                School Garden Ecosystem
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Elementary science and math integration
              </p>
              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-400">
                Grades 3-5
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/samples')}
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            View all examples
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Minimal final CTA */}
      <section className="px-6 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
            Ready to start building?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Join educators creating meaningful learning experiences with ALF
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-4 text-white font-semibold transition-all duration-200 hover:bg-primary-700"
            >
              Start Building
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-8 py-4 font-medium text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
