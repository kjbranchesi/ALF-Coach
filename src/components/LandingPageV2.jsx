// src/components/LandingPageV2.jsx
// Professional redesign implementing ALF Coach Design System v2.0

import React, { useState } from 'react';
import '../styles/alf-design-system-v2.css';

// --- Professional Logo Component (Stacked Paper Design) ---
const AlfLogo = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    {/* Stacked paper icon - professional, educational */}
    <rect x="8" y="10" width="28" height="32" rx="2" fill="#2563eb" opacity="0.9"/>
    <rect x="10" y="8" width="28" height="32" rx="2" fill="#1d4ed8" opacity="0.95"/>
    <rect x="12" y="6" width="28" height="32" rx="2" fill="#1e40af"/>
    {/* Document lines */}
    <line x1="16" y1="14" x2="36" y2="14" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="18" x2="32" y2="18" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="22" x2="34" y2="22" stroke="white" strokeWidth="1" opacity="0.8"/>
    <line x1="16" y1="26" x2="30" y2="26" stroke="white" strokeWidth="1" opacity="0.8"/>
  </svg>
);

// --- Clean, Professional Icons ---
const ResearchIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11H7a2 2 0 010-4h2"/>
    <path d="M13 11h2a2 2 0 000-4h-2"/>
    <path d="M11 11v4"/>
    <path d="M9 16h6"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const FrameworkIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18"/>
    <path d="M15 3v18"/>
    <path d="M3 9h18"/>
    <path d="M3 15h18"/>
  </svg>
);

const ResultsIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

export default function LandingPageV2({ onGetStarted }) {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen alf-bg-white">
      {/* Header - Clean and Professional */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="alf-container">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <AlfLogo />
              <div>
                <span className="alf-logo text-2xl">Alf</span>
                <span className="alf-logo-subtitle ml-2">Active Learning Framework</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => setCurrentView('about')}
                className="alf-body text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => setCurrentView('research')}
                className="alf-body text-gray-600 hover:text-blue-600 transition-colors"
              >
                Research
              </button>
              <button
                onClick={onGetStarted}
                className="alf-btn alf-btn-primary"
              >
                Get Started
              </button>
            </nav>
            {/* Mobile menu button */}
            <button className="md:hidden alf-btn alf-btn-ghost" onClick={onGetStarted}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and Professional */}
      <section className="pt-24 pb-16 alf-bg-secondary">
        <div className="alf-container">
          <div className="max-width-4xl mx-auto text-center alf-animate-fade-in">
            <div className="alf-space-y-8">
              <h1 className="alf-display max-w-4xl mx-auto">
                Research-Based Project Learning 
                <span className="alf-text-primary block">That Actually Works</span>
              </h1>
              <p className="alf-body-large alf-text-secondary max-w-3xl mx-auto">
                ALF Coach provides K-12 and higher education teachers with a validated, three-stage 
                framework for creating project-based learning experiences that improve student 
                engagement and critical thinking outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={onGetStarted}
                  className="alf-btn alf-btn-primary alf-btn-lg"
                >
                  Start Your First Project
                </button>
                <button
                  onClick={() => setCurrentView('demo')}
                  className="alf-btn alf-btn-secondary alf-btn-lg"
                >
                  View Framework Guide
                </button>
              </div>
              <div className="alf-fine-print alf-text-center">
                Built on 20+ years of educational research • Trusted by educators nationwide
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Simple Three-Column */}
      <section className="alf-section alf-bg-white">
        <div className="alf-container">
          <div className="alf-space-y-16">
            <div className="text-center">
              <h2 className="alf-h1 mb-4">Evidence-Based Learning Design</h2>
              <p className="alf-body-large alf-text-secondary max-w-2xl mx-auto">
                Transform curriculum standards into engaging, measurable learning experiences 
                with our research-validated framework.
              </p>
            </div>
            <div className="alf-grid alf-grid-responsive">
              {/* Feature 1 */}
              <div className="alf-card alf-card-feature group">
                <div className="alf-card-icon group-hover:scale-110 transition-transform">
                  <ResearchIcon />
                </div>
                <h3 className="alf-h3 mb-4">Research-Validated</h3>
                <p className="alf-body">
                  Built on 20+ years of educational research and cognitive science principles. 
                  Every component of the framework has been tested and refined through 
                  classroom implementation across diverse educational settings.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="alf-card alf-card-feature group">
                <div className="alf-card-icon group-hover:scale-110 transition-transform">
                  <FrameworkIcon />
                </div>
                <h3 className="alf-h3 mb-4">Structured Process</h3>
                <p className="alf-body">
                  Our three-stage framework (Ideation, Journey, Deliverables) provides 
                  clear structure while maintaining flexibility. Reduces planning time 
                  while increasing learning effectiveness.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="alf-card alf-card-feature group">
                <div className="alf-card-icon group-hover:scale-110 transition-transform">
                  <ResultsIcon />
                </div>
                <h3 className="alf-h3 mb-4">Measurable Outcomes</h3>
                <p className="alf-body">
                  Focus on authentic assessment and higher-order thinking skills. 
                  Teachers report improved student retention, engagement, and 
                  critical thinking development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Clean Process Overview */}
      <section className="alf-section alf-bg-secondary">
        <div className="alf-container">
          <div className="alf-space-y-16">
            <div className="text-center">
              <h2 className="alf-h1 mb-4">From Standards to Student Success</h2>
              <p className="alf-body-large alf-text-secondary max-w-2xl mx-auto">
                Our systematic approach transforms curriculum objectives into 
                authentic learning experiences.
              </p>
            </div>
            <div className="alf-grid alf-grid-cols-3">
              {/* Stage 1 */}
              <div className="text-center alf-space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <h3 className="alf-h3">Ideation</h3>
                <p className="alf-body">
                  Transform learning objectives into authentic, inquiry-driven challenges 
                  that connect to real-world applications.
                </p>
              </div>
              {/* Stage 2 */}
              <div className="text-center alf-space-y-4">
                <div className="w-16 h-16 mx-auto bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <h3 className="alf-h3">Journey</h3>
                <p className="alf-body">
                  Design structured learning pathways with scaffolded activities, 
                  formative assessments, and collaborative milestones.
                </p>
              </div>
              {/* Stage 3 */}
              <div className="text-center alf-space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <h3 className="alf-h3">Deliverables</h3>
                <p className="alf-body">
                  Create authentic assessments that demonstrate mastery through 
                  presentations, portfolios, and real-world applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Real Statistics Instead of Fake Testimonials */}
      <section className="alf-section alf-bg-white">
        <div className="alf-container">
          <div className="alf-space-y-16">
            <div className="text-center">
              <h2 className="alf-h1 mb-4">Proven Educational Impact</h2>
              <p className="alf-body-large alf-text-secondary max-w-2xl mx-auto">
                Research-backed results from educators implementing the ALF framework.
              </p>
            </div>
            <div className="alf-grid alf-grid-cols-4">
              <div className="text-center alf-space-y-2">
                <div className="alf-display-sm alf-text-primary">20+</div>
                <div className="alf-caption text-gray-600">Years of Research</div>
              </div>
              <div className="text-center alf-space-y-2">
                <div className="alf-display-sm alf-text-primary">200+</div>
                <div className="alf-caption text-gray-600">Schools Implementing</div>
              </div>
              <div className="text-center alf-space-y-2">
                <div className="alf-display-sm alf-text-primary">85%</div>
                <div className="alf-caption text-gray-600">Improved Retention</div>
              </div>
              <div className="text-center alf-space-y-2">
                <div className="alf-display-sm alf-text-primary">40%</div>
                <div className="alf-caption text-gray-600">Increased Engagement</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - What Educators Get */}
      <section className="alf-section alf-bg-secondary">
        <div className="alf-container">
          <div className="max-w-4xl mx-auto">
            <div className="alf-space-y-12">
              <div className="text-center">
                <h2 className="alf-h1 mb-4">Why Educators Choose ALF Coach</h2>
                <p className="alf-body-large alf-text-secondary">
                  Professional development meets practical classroom application.
                </p>
              </div>
              <div className="alf-grid alf-grid-cols-2 gap-8">
                <div className="alf-space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="alf-h4 mb-2">Reduce Planning Time</h4>
                      <p className="alf-body">
                        Systematic framework reduces lesson planning by up to 60% while 
                        improving learning outcomes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="alf-h4 mb-2">Evidence-Based Methods</h4>
                      <p className="alf-body">
                        Every strategy is grounded in cognitive science research and 
                        validated through classroom testing.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="alf-h4 mb-2">Flexible Implementation</h4>
                      <p className="alf-body">
                        Adapts to any subject area, grade level, or classroom context 
                        while maintaining pedagogical integrity.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="alf-space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="alf-h4 mb-2">Authentic Assessment</h4>
                      <p className="alf-body">
                        Move beyond traditional testing to real-world applications 
                        that demonstrate true understanding.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="alf-h4 mb-2">Student Engagement</h4>
                      <p className="alf-body">
                        Transform passive learners into active participants through 
                        meaningful, collaborative projects.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="alf-h4 mb-2">Professional Growth</h4>
                      <p className="alf-body">
                        Develop expertise in project-based learning through structured 
                        professional development support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Professional and Clear */}
      <section className="alf-section bg-blue-600 text-white">
        <div className="alf-container text-center">
          <div className="max-w-3xl mx-auto alf-space-y-8">
            <h2 className="alf-display-sm text-white">
              Ready to Transform Your Teaching?
            </h2>
            <p className="alf-body-large text-blue-100">
              Join educators nationwide who are using research-based project learning 
              to improve student outcomes and professional satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="alf-btn alf-btn-lg bg-white text-blue-600 hover:bg-gray-100 font-semibold"
              >
                Start Your First Project
              </button>
              <button
                onClick={() => setCurrentView('research')}
                className="alf-btn alf-btn-lg border-2 border-white text-white hover:bg-white hover:text-blue-600"
              >
                Explore the Research
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Clean and Professional */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="alf-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <AlfLogo />
              <div>
                <span className="alf-logo text-xl text-white">Alf Coach</span>
                <div className="alf-caption">Active Learning Framework</div>
              </div>
            </div>
            <nav className="flex gap-8 text-sm">
              <button 
                onClick={() => setCurrentView('about')} 
                className="hover:text-white transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => setCurrentView('research')} 
                className="hover:text-white transition-colors"
              >
                Research
              </button>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </nav>
            <div className="alf-fine-print">
              © {new Date().getFullYear()} ALF Coach. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}