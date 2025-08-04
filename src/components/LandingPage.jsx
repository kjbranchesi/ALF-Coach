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
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
            >
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl"></div>
        
        <div className="alf-container relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-200/50 dark:border-blue-700/50">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Trusted by 200+ schools nationwide
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
              Design Learning Experiences That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600">
                Deliver Results
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Research-validated framework for K-12 and higher education teachers to create 
              project-based learning experiences that increase student engagement by{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">40%</span> and 
              improve critical thinking scores by{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">28%</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button
                onClick={onGetStarted}
                className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-5 rounded-xl font-semibold text-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                Create Your First Project
              </Button>
              <Button
                onClick={() => setCurrentPage('how-it-works')}
                className="bg-white/80 backdrop-blur-sm text-gray-900 border border-gray-200 hover:bg-white hover:border-gray-300 px-10 py-5 rounded-xl font-semibold text-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 dark:bg-gray-800/80 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                View Implementation Guide
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>20+ years of ALF research</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Evidence-based pedagogy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Measurable outcomes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-800 relative">
        <div className="alf-container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Built on Proven Educational Research
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Every feature is grounded in cognitive science and validated through real classroom implementation.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <Card className="text-center group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="search" size="lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Evidence-Based Pedagogy</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Built on 20+ years of educational research and validated across 200+ schools. The Active Learning 
                  Framework integrates cognitive science principles with practical classroom implementation, 
                  ensuring every project drives authentic learning outcomes.
                </p>
              </CardContent>
            </Card>
            {/* Feature 2 */}
            <Card className="text-center group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="journey" size="lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Structured Three-Stage Process</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Transform curriculum objectives into engaging project-based learning experiences. The systematic 
                  Ideation, Journey, and Deliverables framework guides you through research-backed design principles 
                  that reduce planning time by 60% while increasing learning effectiveness.
                </p>
              </CardContent>
            </Card>
            {/* Feature 3 */}
            <Card className="text-center group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="rocket" size="lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Measurable Student Outcomes</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
      <section className="py-24 px-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="alf-container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              From Curriculum Standards to Student Mastery
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our three-stage framework guides you through a proven process that transforms learning objectives into engaging, measurable experiences.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connection lines */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 z-0"></div>
              
              {/* Stage 1 */}
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl">
                    1
                  </div>
                  <div className="absolute -inset-2 bg-blue-100 dark:bg-blue-900/20 rounded-3xl -z-10 animate-pulse"></div>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900 dark:text-gray-100">Ideation</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  Define learning objectives and transform standards into authentic, inquiry-driven challenges.
                </p>
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Key Focus:</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Problem identification & goal setting</div>
                </div>
              </div>
              
              {/* Stage 2 */}
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl">
                    2
                  </div>
                  <div className="absolute -inset-2 bg-purple-100 dark:bg-purple-900/20 rounded-3xl -z-10 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900 dark:text-gray-100">Journey</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  Structure learning pathways with scaffolded activities, formative assessments, and collaborative milestones.
                </p>
                <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Key Focus:</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Skill building & collaborative learning</div>
                </div>
              </div>
              
              {/* Stage 3 */}
              <div className="text-center relative z-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl">
                    3
                  </div>
                  <div className="absolute -inset-2 bg-amber-100 dark:bg-amber-900/20 rounded-3xl -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900 dark:text-gray-100">Deliverables</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  Design authentic assessments that demonstrate mastery through real-world applications and presentations.
                </p>
                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50">
                  <div className="text-sm font-medium text-amber-700 dark:text-amber-300">Key Focus:</div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">Assessment & demonstration</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Principles */}
      <section className="py-24 px-6 bg-white dark:bg-gray-800 relative">
        <div className="alf-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Research-Based Learning Framework
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our approach is grounded in decades of educational research and cognitive science.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Principle 1 */}
            <Card className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    A
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100">Active Learning Principles</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Research in cognitive science shows that students learn best when they actively construct 
                  knowledge through meaningful experiences. The ALF framework applies constructivist learning 
                  theory to help students connect academic content to real-world applications.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Based on work by Piaget, Vygotsky, and modern learning scientists</span>
                </div>
              </CardContent>
            </Card>
            {/* Principle 2 */}
            <Card className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    B
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100">Authentic Assessment</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Traditional testing often fails to capture deep understanding. ALF Coach helps educators 
                  design performance-based assessments where students demonstrate mastery through authentic 
                  products and presentations to real audiences.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Grounded in Wiggins' authentic assessment framework</span>
                </div>
              </CardContent>
            </Card>
            {/* Principle 3 */}
            <Card className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    C
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 dark:text-gray-100">Project-Based Learning</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Well-designed projects engage students in sustained inquiry around meaningful questions. 
                  The ALF framework provides structure for projects that develop critical thinking, 
                  collaboration, and communication skills essential for success.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Aligned with Gold Standard PBL criteria</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="alf-container text-center relative">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Join 2,000+ educators already using ALF Coach
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Teaching?
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto">
              Start creating evidence-based project learning experiences that improve student outcomes 
              and reduce your preparation time by up to 60%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                onClick={onGetStarted}
                className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-5 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                Begin Professional Implementation
              </Button>
              <Button
                onClick={() => setCurrentPage('how-it-works')}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 px-10 py-5 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                View Demo
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-blue-100 opacity-75">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Free professional development resources</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Research-backed methodology</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 dark:bg-gray-950 text-gray-400 dark:text-gray-500">
        <div className="alf-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AlfLogo size="md" className="" />
            </div>
            <nav className="flex gap-6 text-sm">
              <button onClick={() => setCurrentPage('about')} className="hover:text-white dark:hover:text-gray-200 transition-colors">
                About ALF
              </button>
              <button onClick={() => setCurrentPage('how-it-works')} className="hover:text-white dark:hover:text-gray-200 transition-colors">
                How It Works
              </button>
              <a href="#" className="hover:text-white dark:hover:text-gray-200 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white dark:hover:text-gray-200 transition-colors">Terms</a>
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
