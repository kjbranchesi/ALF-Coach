// src/components/LandingPage.jsx

import React, { useState } from 'react';
import { FlaskConical, TrendingUp, Rocket, CheckCircle } from 'lucide-react';
import { Button } from '../design-system/components/Button';
import { Icon } from '../design-system/components/Icon';
import { Card, CardContent } from './ui/Card';
import AlfLogo from './ui/AlfLogo';
import '../styles/alf-design-system.css';

// Import new About and HowItWorks pages that we'll create
import AboutPage from './AboutPage';
import HowItWorksPage from './HowItWorksPage';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm z-50">
        <div className="alf-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <AlfLogo size="lg" />
            <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">Active Learning Framework</span>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentPage('about')}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </button>
            <button 
              onClick={() => setCurrentPage('how-it-works')}
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              How It Works
            </button>
            <Button
              onClick={onGetStarted}
              variant="primary"
            >
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="alf-container">
          <div className="max-w-4xl mx-auto text-center alf-animate-fade-in">
            <h1 className="alf-display mb-6 text-gray-900 dark:text-gray-100">
              Design Learning Experiences That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Deliver Measurable Results
              </span>
            </h1>
            <p className="alf-body-large text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              ALF Coach provides K-12 and higher education teachers with a research-validated, 
              three-stage framework for creating project-based learning experiences that increase 
              student engagement by 40% and improve critical thinking scores by 28%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Button
                onClick={onGetStarted}
                variant="primary"
                size="lg"
                className="px-8 py-4"
              >
                Create Your First Project
              </Button>
              <Button
                onClick={() => setCurrentPage('how-it-works')}
                variant="secondary"
                size="lg"
              >
                View Implementation Guide
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Trusted by educators at over 200 schools nationwide • 
              Built on 20+ years of ALF research
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="alf-container">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center group shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon name="search" size="lg" />
                </div>
                <h3 className="alf-heading-3 mb-3 text-gray-900 dark:text-gray-100">Evidence-Based Pedagogy</h3>
                <p className="alf-body text-gray-600 dark:text-gray-300">
                  Built on 20+ years of educational research and validated across 200+ schools. The Active Learning 
                  Framework integrates cognitive science principles with practical classroom implementation, 
                  ensuring every project drives authentic learning outcomes.
                </p>
              </CardContent>
            </Card>
            {/* Feature 2 */}
            <Card className="text-center group shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon name="journey" size="lg" />
                </div>
                <h3 className="alf-heading-3 mb-3 text-gray-900 dark:text-gray-100">Structured Three-Stage Process</h3>
                <p className="alf-body text-gray-600 dark:text-gray-300">
                  Transform curriculum objectives into engaging project-based learning experiences. The systematic 
                  Ideation, Journey, and Deliverables framework guides you through research-backed design principles 
                  that reduce planning time by 60% while increasing learning effectiveness.
                </p>
              </CardContent>
            </Card>
            {/* Feature 3 */}
            <Card className="text-center group shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Icon name="rocket" size="lg" />
                </div>
                <h3 className="alf-heading-3 mb-3 text-gray-900 dark:text-gray-100">Measurable Student Outcomes</h3>
                <p className="alf-body text-gray-600 dark:text-gray-300">
                  Develop higher-order thinking skills through authentic assessment and collaborative problem-solving. 
                  Teachers report 85% improvement in student retention rates and 40% increase in voluntary 
                  participation when using ALF-designed projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
        <div className="alf-container">
          <h2 className="alf-heading-2 text-center mb-12 text-gray-900 dark:text-gray-100">From Curriculum Standards to Student Mastery</h2>
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
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
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

      {/* Educational Principles */}
      <section className="py-16 px-6 bg-white dark:bg-gray-800">
        <div className="alf-container">
          <h2 className="alf-heading-2 text-center mb-12 text-gray-900 dark:text-gray-100">Research-Based Learning Framework</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Principle 1 */}
            <Card className="relative shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Active Learning Principles</h3>
                <p className="alf-body mb-4">
                  Research in cognitive science shows that students learn best when they actively construct 
                  knowledge through meaningful experiences. The ALF framework applies constructivist learning 
                  theory to help students connect academic content to real-world applications.
                </p>
                <div className="text-sm text-gray-500">
                  Based on work by Piaget, Vygotsky, and modern learning scientists
                </div>
              </CardContent>
            </Card>
            {/* Principle 2 */}
            <Card className="relative shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Authentic Assessment</h3>
                <p className="alf-body mb-4">
                  Traditional testing often fails to capture deep understanding. ALF Coach helps educators 
                  design performance-based assessments where students demonstrate mastery through authentic 
                  products and presentations to real audiences.
                </p>
                <div className="text-sm text-gray-500">
                  Grounded in Wiggins' authentic assessment framework
                </div>
              </CardContent>
            </Card>
            {/* Principle 3 */}
            <Card className="relative shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-3">Project-Based Learning</h3>
                <p className="alf-body mb-4">
                  Well-designed projects engage students in sustained inquiry around meaningful questions. 
                  The ALF framework provides structure for projects that develop critical thinking, 
                  collaboration, and communication skills essential for success.
                </p>
                <div className="text-sm text-gray-500">
                  Aligned with Gold Standard PBL criteria
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Implement Evidence-Based Project Learning</h2>
          <p className="text-xl mb-8 opacity-90">
            Join 2,000+ educators using ALF Coach to improve student outcomes and reduce preparation time.
          </p>
          <Button
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Begin Professional Implementation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400">
        <div className="alf-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AlfLogo size="md" className="text-white" />
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
