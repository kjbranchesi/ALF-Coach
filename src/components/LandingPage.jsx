// src/components/LandingPage.jsx

import React, { useState, Suspense, lazy } from 'react';
import { FlaskConical, TrendingUp, Rocket, CheckCircle } from 'lucide-react';
import { Button } from '../design-system/components/Button';
import { Icon } from '../design-system/components/Icon';
import { Card, CardContent } from './ui/Card';
import AlfLogo from './ui/AlfLogo';
import '../styles/alf-design-system.css';

// Lazy load heavy components that may not be used initially
const ResearchBacking = lazy(() => import('./ResearchBacking').then(module => ({ default: module.ResearchBacking })));
const AboutPage = lazy(() => import('./AboutPage'));
const HowItWorksPage = lazy(() => import('./HowItWorksPage'));

export default function LandingPage({ onGetStarted, onSignIn }) {
  const [currentPage, setCurrentPage] = useState('home');

  // Handle internal navigation with Suspense for lazy loading
  if (currentPage === 'about') {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <AlfLogo size="lg" className="mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      }>
        <AboutPage onBack={() => setCurrentPage('home')} />
      </Suspense>
    );
  }
  
  if (currentPage === 'how-it-works') {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <AlfLogo size="lg" className="mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      }>
        <HowItWorksPage onBack={() => setCurrentPage('home')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full z-50">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-b-2xl shadow-md border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
              <AlfLogo size="lg" className="transition-transform duration-300 group-hover:scale-105" />
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">Active Learning Framework</span>
            </div>
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => setCurrentPage('about')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 font-medium"
              >
                About
              </button>
              <button 
                onClick={() => (window.location.href = '/how-it-works')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105 font-medium"
              >
                How It Works
              </button>
              <Button
                onClick={onSignIn || onGetStarted}
                variant="primary"
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                Sign In
              </Button>
            </nav>
          </div>
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
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-gray-900 dark:text-gray-100 leading-tight">
              Prepare Your Students for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-400 dark:via-blue-500 dark:to-blue-600">
                Jobs That Don't Exist Yet
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Imagine walking into your classroom knowing every project you design will spark curiosity, 
              build real-world skills, and prepare students for an uncertain future. With 65% of today's 
              students destined for careers that don't exist yet, shouldn't we teach them to think, 
              create, and collaborate like never before?
            </p>
            
            <div className="flex justify-center items-center mb-16">
              <Button
                onClick={onGetStarted}
                className="bg-blue-600 text-white hover:bg-blue-700 px-10 py-5 rounded-xl font-semibold text-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                Get Started
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Turn any lesson into an adventure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Watch creativity flourish</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>All students succeed together</span>
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
              Why Your Students Need This Now
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              The world is changing faster than ever. Your students need more than facts—they need to think critically, collaborate naturally, and create boldly. Here's how project-based learning transforms both learning and lives.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <Card className="text-center group bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden border-0">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="search" size="lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">The Future Is Uncertain, Skills Are Forever</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  When 65% of your students will work in jobs that don't exist yet, teaching facts isn't enough. 
                  Project-based learning develops the creativity, critical thinking, and collaboration skills 
                  they'll need to thrive in any future—no matter what comes next.
                </p>
              </CardContent>
            </Card>
            {/* Feature 2 */}
            <Card className="text-center group bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden border-0">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="journey" size="lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">From Overwhelmed to Organized</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Stop scrambling for engaging activities. Our three-stage framework—Ideation, Journey, and 
                  Deliverables—turns any curriculum standard into an exciting project adventure. You'll have 
                  clear direction, students will have clear purpose, and everyone wins.
                </p>
              </CardContent>
            </Card>
            {/* Feature 3 */}
            <Card className="text-center group bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden border-0">
              <CardContent className="p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon name="rocket" size="lg" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">All Boats Rise With the Tide</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Research shows project-based learning lifts every student—struggling readers, advanced learners, 
                  and everyone in between. Students using PBL score 8-10 percentage points higher on tests while 
                  developing real-world skills no standardized test can measure.
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

      {/* Research Story Section */}
      <section className="py-24 px-6 bg-white dark:bg-gray-800 relative overflow-hidden">
        <div className="alf-container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Built on Proven Educational Research
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Every feature is grounded in cognitive science and validated through real classroom implementation.
              </p>
            </div>
            
            {/* Story-driven research points */}
            <div className="space-y-20">
              {/* Evidence-Based Pedagogy */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Evidence-Based Pedagogy
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Built on decades of educational research, the Active Learning Framework integrates cognitive science 
                    principles with practical classroom implementation, ensuring every project drives authentic learning outcomes.
                  </p>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Students retain 75% more when actively engaged vs. passive listening
                    </p>
                  </div>
                </div>
                <div className="flex-1 order-1 md:order-2">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <FlaskConical size={56} />
                    </div>
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
              
              {/* Structured Three-Stage Process */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <TrendingUp size={56} />
                    </div>
                    <div className="absolute -top-4 -left-4 w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-xl"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Structured Three-Stage Process
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Transform curriculum objectives into engaging project-based learning experiences. The systematic Ideation, 
                    Journey, and Deliverables process guides you through research-backed design principles that reduce planning 
                    time by 60% while increasing learning effectiveness.
                  </p>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Projects designed with clear stages show 40% better completion rates
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Measurable Student Outcomes */}
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Measurable Student Outcomes
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    Develop higher-order thinking skills through authentic assessment and collaborative problem-solving. ALF-designed 
                    projects promote deeper engagement and improved learning outcomes across all student demographics.
                  </p>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Students score 8-10 percentage points higher on standardized assessments
                    </p>
                  </div>
                </div>
                <div className="flex-1 order-1 md:order-2">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <Rocket size={56} />
                    </div>
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-100 dark:bg-amber-900/20 rounded-full blur-xl"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Supporting research link */}
            <div className="text-center mt-16">
              <button 
                onClick={() => setCurrentPage('about')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center gap-2 group"
              >
                <span>Learn more about our research foundation</span>
                <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Teaching?
            </h2>
            
            <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed max-w-3xl mx-auto">
              Build real projects that students actually want to work on.
            </p>
            
            <div className="flex justify-center items-center">
              <Button
                onClick={onGetStarted}
                className="bg-white dark:bg-gray-800 text-blue-700 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700 px-10 py-5 text-xl font-semibold rounded-xl shadow-2xl hover:shadow-white/25 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 border-2 border-white/20 dark:border-gray-600"
              >
                Get Started
              </Button>
            </div>
            
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-blue-100 opacity-75">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>Your students will thank you</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
        <div className="alf-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <AlfLogo size="md" className="" />
            </div>
            <nav className="flex gap-6 text-sm">
              <button onClick={() => setCurrentPage('about')} className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                About ALF
              </button>
              <button onClick={() => (window.location.href = '/how-it-works')} className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                How It Works
              </button>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors">Terms</a>
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
