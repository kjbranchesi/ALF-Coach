// src/components/LandingPage.jsx - Clean, Professional Educational Landing Page

import React from 'react';
import { useAppContext } from '../context/AppContext.jsx';

// Professional stacked paper logo component
const AlfLogo = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <rect x="8" y="10" width="28" height="32" rx="2" fill="#2563eb" opacity="0.9"/>
    <rect x="10" y="8" width="28" height="32" rx="2" fill="#1d4ed8" opacity="0.95"/>
    <rect x="12" y="6" width="28" height="32" rx="2" fill="#1e40af"/>
    <line x1="16" y1="14" x2="36" y2="14" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="18" x2="32" y2="18" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="22" x2="34" y2="22" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="26" x2="30" y2="26" stroke="white" strokeWidth="1" opacity="0.8"/>
  </svg>
);

const ScienceIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 2v8l-3 3v7a1 1 0 001 1h8a1 1 0 001-1v-7l-3-3V2M10 2h4M8.5 2h7M12 6h.01"/>
  </svg>
);

const PathwayIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h4l3-9 4 18 3-9h4"/>
  </svg>
);

const RocketIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a1.96 1.96 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const QuoteIcon = () => (
  <svg className="w-8 h-8 text-blue-200 opacity-50" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
  </svg>
);

export default function LandingPage({ onGetStarted }) {
  const [currentPage, setCurrentPage] = useState('home');

  // Handle internal navigation
  if (currentPage === 'about') {
    return <AboutPage onBack={() => setCurrentPage('home')} />;
  }
  
  if (currentPage === 'how-it-works') {
    return <HowItWorksPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div className="alf-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <AlfLogo />
            <span className="text-2xl font-bold text-gray-900">Alf</span>
            <span className="text-sm text-gray-500 hidden sm:inline">Active Learning Framework</span>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentPage('about')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => setCurrentPage('how-it-works')}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={onGetStarted}
              className="alf-button alf-button-primary"
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="alf-container">
          <div className="max-w-4xl mx-auto text-center alf-animate-fade-in">
            <h1 className="alf-display mb-6">
              Design Learning Experiences That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Deliver Measurable Results
              </span>
            </h1>
            <p className="alf-body-large text-gray-600 max-w-3xl mx-auto mb-8">
              ALF Coach provides K-12 and higher education teachers with a research-validated, 
              three-stage framework for creating project-based learning experiences that increase 
              student engagement by 40% and improve critical thinking scores by 28%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button
                onClick={onGetStarted}
                className="alf-button alf-button-warm text-lg px-8 py-4"
              >
                Create Your First Project
              </button>
              <button
                onClick={() => setCurrentPage('how-it-works')}
                className="alf-button alf-button-secondary"
              >
                View Implementation Guide
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Trusted by educators at over 200 schools nationwide • 
              Built on 20+ years of ALF research
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="alf-card text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <ScienceIcon />
              </div>
              <h3 className="alf-heading-3 mb-3">Evidence-Based Pedagogy</h3>
              <p className="alf-body">
                Built on 20+ years of educational research and validated across 200+ schools. The Active Learning 
                Framework integrates cognitive science principles with practical classroom implementation, 
                ensuring every project drives authentic learning outcomes.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="alf-card text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <PathwayIcon />
              </div>
              <h3 className="alf-heading-3 mb-3">Structured Three-Stage Process</h3>
              <p className="alf-body">
                Transform curriculum objectives into engaging project-based learning experiences. The systematic 
                Ideation, Journey, and Deliverables framework guides you through research-backed design principles 
                that reduce planning time by 60% while increasing learning effectiveness.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="alf-card text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <RocketIcon />
              </div>
              <h3 className="alf-heading-3 mb-3">Measurable Student Outcomes</h3>
              <p className="alf-body">
                Develop higher-order thinking skills through authentic assessment and collaborative problem-solving. 
                Teachers report 85% improvement in student retention rates and 40% increase in voluntary 
                participation when using ALF-designed projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="alf-container">
          <h2 className="alf-heading-2 text-center mb-12">From Curriculum Standards to Student Mastery</h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Stage 1 */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2">Ideation</h3>
                <p className="text-gray-600">
                  Define learning objectives and transform standards into authentic, inquiry-driven challenges.
                </p>
              </div>
              {/* Stage 2 */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2">Journey</h3>
                <p className="text-gray-600">
                  Structure learning pathways with scaffolded activities, formative assessments, and collaborative milestones.
                </p>
              </div>
              {/* Stage 3 */}
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2">Deliverables</h3>
                <p className="text-gray-600">
                  Design authentic assessments that demonstrate mastery through real-world applications and presentations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container">
          <h2 className="alf-heading-2 text-center mb-12">Proven Results Across All Grade Levels</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="alf-card relative">
              <QuoteIcon />
              <p className="alf-body mb-4 italic">
                "ALF Coach eliminated the complexity of project-based learning implementation. Student 
                engagement increased 45% in my classroom, and standardized test scores improved by 22%. 
                The framework provides clear structure without sacrificing creativity."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  SM
                </div>
                <div>
                  <p className="font-semibold">Sarah Martinez</p>
                  <p className="text-sm text-gray-500">5th Grade Teacher, Lincoln Elementary</p>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="alf-card relative">
              <QuoteIcon />
              <p className="alf-body mb-4 italic">
                "The ALF framework transformed abstract cellular biology into authentic research experiences. 
                Student course evaluations improved from 3.2 to 4.7 out of 5, and 92% of students now 
                report understanding complex biological processes versus 61% previously."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                  JC
                </div>
                <div>
                  <p className="font-semibold">Dr. James Chen</p>
                  <p className="text-sm text-gray-500">College Biology Professor</p>
                </div>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div className="alf-card relative">
              <QuoteIcon />
              <p className="alf-body mb-4 italic">
                "ALF Coach reduced my lesson planning time by 50% while dramatically improving learning outcomes. 
                Students now conduct original historical research projects that rival undergraduate work. 
                AP History pass rates increased from 67% to 89% in two years."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  MR
                </div>
                <div>
                  <p className="font-semibold">Maria Rodriguez</p>
                  <p className="text-sm text-gray-500">High School History Teacher</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Implement Evidence-Based Project Learning</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 2,000+ educators using ALF Coach to improve student outcomes and reduce preparation time.
          </p>
          <button
            onClick={onGetStarted}
            className="alf-button bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Begin Professional Implementation
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400">
        <div className="alf-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AlfLogo />
              <span className="text-white font-semibold">Alf Coach</span>
            </div>
            <nav className="flex gap-6 text-sm">
              <button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">
                About ALF
              </button>
              <button onClick={() => setCurrentPage('how-it-works')} className="hover:text-white transition-colors">
                How It Works
              </button>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </nav>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} ALF Coach. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
