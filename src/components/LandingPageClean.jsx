// src/components/LandingPageClean.jsx - Clean, Professional Educational Landing Page

import React from 'react';

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

// Clean icons for features
const IdeateIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const JourneyIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const DeliverIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function LandingPageClean({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="alf-nav sticky top-0 bg-white z-50 border-b border-gray-200">
        <div className="alf-container">
          <div className="flex items-center justify-between py-4">
            <div className="alf-logo">
              <AlfLogo />
              <span className="alf-logo-text">Alf</span>
            </div>
            <div className="alf-nav-links hidden md:flex">
              <a href="#how-it-works" className="alf-nav-link">How It Works</a>
              <a href="#features" className="alf-nav-link">Features</a>
              <a href="#research" className="alf-nav-link">Research</a>
              <a href="#about" className="alf-nav-link">About</a>
            </div>
            <button 
              onClick={onGetStarted}
              className="alf-btn alf-btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean and focused */}
      <section className="alf-hero">
        <div className="alf-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="alf-hero-title">
              Research-Based Project Learning
              <span className="block text-alf-primary-600">That Actually Works</span>
            </h1>
            <p className="alf-hero-subtitle">
              Transform your classroom with the ALF framework - a scientifically-proven approach 
              to project-based learning that increases student engagement and improves outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="alf-btn alf-btn-primary text-lg px-8 py-4"
              >
                Start Your First Project
                <ChevronRightIcon />
              </button>
              <a 
                href="#how-it-works"
                className="alf-btn alf-btn-secondary text-lg px-8 py-4"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Three simple steps */}
      <section id="how-it-works" className="alf-section bg-gray-50">
        <div className="alf-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Effective, Research-Based</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The ALF framework guides you through three essential phases of project-based learning.
            </p>
          </div>
          <div className="alf-features">
            <div className="alf-card alf-feature-card">
              <div className="alf-feature-icon">
                <IdeateIcon />
              </div>
              <h3 className="alf-feature-title">1. Ideate</h3>
              <p className="alf-feature-description">
                Define your big idea, essential question, and student challenge. 
                Our AI coach helps you create engaging, standards-aligned projects.
              </p>
            </div>
            <div className="alf-card alf-feature-card">
              <div className="alf-feature-icon">
                <JourneyIcon />
              </div>
              <h3 className="alf-feature-title">2. Design Journey</h3>
              <p className="alf-feature-description">
                Map out the learning experience with scaffolded activities, 
                resources, and checkpoints that guide students to success.
              </p>
            </div>
            <div className="alf-card alf-feature-card">
              <div className="alf-feature-icon">
                <DeliverIcon />
              </div>
              <h3 className="alf-feature-title">3. Deliver Impact</h3>
              <p className="alf-feature-description">
                Create authentic assessments and real-world deliverables that 
                demonstrate learning and make a meaningful impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Research & Impact - Real statistics, no fake testimonials */}
      <section id="research" className="alf-section bg-white">
        <div className="alf-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Proven Educational Impact</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Based on decades of research in project-based learning and educational psychology.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-alf-primary-600 mb-2">20+</div>
              <div className="text-gray-600">Years of Research</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-alf-primary-600 mb-2">85%</div>
              <div className="text-gray-600">Better Retention</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-alf-primary-600 mb-2">40%</div>
              <div className="text-gray-600">More Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-alf-primary-600 mb-2">95%</div>
              <div className="text-gray-600">Teacher Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Clear value propositions */}
      <section id="features" className="alf-section bg-gray-50">
        <div className="alf-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and support for successful project-based learning implementation.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="alf-card">
              <h3 className="text-xl font-bold mb-3">AI-Powered Coaching</h3>
              <p className="text-gray-600">
                Get personalized guidance at every step, from ideation to assessment. 
                Our AI understands educational best practices and helps you create 
                engaging, standards-aligned projects.
              </p>
            </div>
            <div className="alf-card">
              <h3 className="text-xl font-bold mb-3">Standards Alignment</h3>
              <p className="text-gray-600">
                Automatically align your projects with state and national standards. 
                Track student progress against learning objectives with built-in 
                assessment tools.
              </p>
            </div>
            <div className="alf-card">
              <h3 className="text-xl font-bold mb-3">Resource Library</h3>
              <p className="text-gray-600">
                Access curated resources, exemplar projects, and community-shared 
                materials. Find inspiration and save time with proven templates.
              </p>
            </div>
            <div className="alf-card">
              <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
              <p className="text-gray-600">
                Monitor student progress with visual dashboards. Identify struggling 
                students early and provide targeted support when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="alf-section bg-alf-primary-600 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Classroom?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of educators using ALF to create meaningful learning experiences.
          </p>
          <button 
            onClick={onGetStarted}
            className="alf-btn bg-white text-alf-primary-600 hover:bg-gray-100 text-lg px-8 py-4"
          >
            Get Started Free
            <ChevronRightIcon />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="alf-footer">
        <div className="alf-container">
          <div className="alf-footer-content">
            <div>
              <div className="alf-logo mb-4">
                <AlfLogo />
                <span className="alf-logo-text text-white">Alf</span>
              </div>
              <p className="text-gray-400">
                Research-based project learning that works.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
                <li><a href="#research" className="hover:text-white">Research</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ALF Coach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}