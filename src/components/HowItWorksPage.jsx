// src/components/HowItWorksPage.jsx

import React, { useState } from 'react';
import { ArrowLeft, Play, ChevronDown, Users, Target, BarChart3, FileText } from 'lucide-react';
import '../styles/alf-design-system.css';

const AlfLogo = () => (
  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none">
    <path d="M24 4L8 20V40H16V28H32V40H40V20L24 4Z" fill="url(#alfGradient)" stroke="white" strokeWidth="2"/>
    <path d="M20 16H28V20H20V16Z" fill="white"/>
    <defs>
      <linearGradient id="alfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A90E2" />
        <stop offset="100%" stopColor="#357ABD" />
      </linearGradient>
    </defs>
  </svg>
);

// Removed BackIcon - using Lucide ArrowLeft instead

// Removed PlayIcon - using Lucide Play instead

// Removed ChevronDownIcon - using Lucide ChevronDown instead

export default function HowItWorksPage({ onBack }) {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "Is Alf suitable for teachers new to project-based learning?",
      answer: "Absolutely. Alf is designed specifically for educators at any experience level. Our guided process and built-in templates make it easy to create your first project, while advanced features support seasoned practitioners looking to deepen their practice."
    },
    {
      question: "How much time does it take to create a project using Alf?",
      answer: "Most teachers create their first project in 30-45 minutes. Once you're familiar with the framework, projects typically take 15-20 minutes to design. The time you invest upfront saves hours during implementation and assessment."
    },
    {
      question: "Can ALF projects align with state standards and curriculum requirements?",
      answer: "Yes. Alf includes standards alignment tools and helps you design projects that naturally incorporate required content while enhancing student engagement and understanding."
    },
    {
      question: "What if my students aren't used to active learning approaches?",
      answer: "The ALF framework includes scaffolding strategies to help students transition smoothly into more active roles. Our built-in reflection tools and gradual release methods ensure students feel supported throughout their learning journey."
    },
    {
      question: "Is there support available if I need help implementing ALF projects?",
      answer: "We provide comprehensive video tutorials, downloadable guides, and access to our educator community forum. Our support team is also available to answer specific questions about your projects."
    },
    {
      question: "Can I try Alf before committing to a subscription?",
      answer: "Yes. Start with our free account to explore the platform and create your first project. Experience the ALF framework firsthand before deciding if you'd like to upgrade for additional features and unlimited projects."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div className="alf-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <AlfLogo />
            <span className="text-2xl font-bold text-gray-900">Alf</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="alf-container max-w-4xl">
          <div className="text-center mb-12 alf-animate-fade-in">
            <h1 className="alf-display mb-6">How Alf Works</h1>
            <p className="alf-body-large text-gray-600 max-w-3xl mx-auto">
              Transform your teaching in three guided stages. Alf walks alongside you through every step, 
              from initial inspiration to classroom implementation.
            </p>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container max-w-4xl">
          <div className="alf-card">
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg aspect-video flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors rounded-lg"></div>
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-gray-700" fill="currentColor" />
                </div>
                <p className="text-lg font-semibold text-gray-800">Watch Alf in Action (3 min)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Process Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="alf-container max-w-5xl">
          <h2 className="alf-heading-2 text-center mb-12">The Three-Stage Journey</h2>
          
          {/* Stage 1: Ideation */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="alf-heading-2 text-blue-600">Ideation Stage</h3>
                <p className="alf-body-large">Transform curiosity into compelling learning experiences</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 ml-0 md:ml-20">
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Big Idea</h4>
                <p className="alf-body mb-4">
                  Start with a concept that matters. Alf helps you identify themes that connect 
                  to students' lives and the wider world.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm italic text-blue-700">
                    Example: "How can we make our community more sustainable?"
                  </p>
                </div>
              </div>
              
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Essential Question</h4>
                <p className="alf-body mb-4">
                  Craft open-ended questions that spark investigation. Our AI suggests thought-provoking 
                  angles based on your big idea.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm italic text-blue-700">
                    Example: "What would happen if everyone in our town made one eco-friendly change?"
                  </p>
                </div>
              </div>
              
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Challenge</h4>
                <p className="alf-body mb-4">
                  Define a real-world problem students will solve. ALF ensures challenges are achievable 
                  yet meaningful.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm italic text-blue-700">
                    Example: "Design a sustainability campaign for local businesses"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 2: Journey */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="alf-heading-2 text-orange-600">Journey Stage</h3>
                <p className="alf-body-large">Map the learning adventure from discovery to mastery</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 ml-0 md:ml-20">
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Learning Phases</h4>
                <p className="alf-body mb-4">
                  Break down the journey into manageable phases. ALF suggests progression that builds 
                  skills systematically.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm italic text-orange-700">
                    Investigate → Analyze → Create → Implement
                  </p>
                </div>
              </div>
              
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Activities & Experiences</h4>
                <p className="alf-body mb-4">
                  Design hands-on activities for each phase. Get suggestions tailored to your subject 
                  and grade level.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm italic text-orange-700">
                    Field research, expert interviews, prototype creation
                  </p>
                </div>
              </div>
              
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Resources & Support</h4>
                <p className="alf-body mb-4">
                  Identify materials, tools, and community connections. ALF helps you think beyond 
                  traditional resources.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm italic text-orange-700">
                    Local experts, online tools, partner organizations
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 3: Deliverables */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="alf-heading-2 text-purple-600">Deliverables Stage</h3>
                <p className="alf-body-large">Make learning visible through authentic assessment</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 ml-0 md:ml-20">
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Milestones</h4>
                <p className="alf-body mb-4">
                  Set meaningful checkpoints that celebrate progress. ALF helps create milestones 
                  that motivate, not just measure.
                </p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm italic text-purple-700">
                    Research complete, prototype tested, campaign launched
                  </p>
                </div>
              </div>
              
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Assessment Rubrics</h4>
                <p className="alf-body mb-4">
                  Create clear, fair evaluation criteria. Our AI generates rubrics that value both 
                  process and product.
                </p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm italic text-purple-700">
                    Creativity, collaboration, impact, reflection
                  </p>
                </div>
              </div>
              
              <div className="alf-card">
                <h4 className="font-semibold text-lg mb-3">Real-World Impact</h4>
                <p className="alf-body mb-4">
                  Connect student work to authentic audiences. ALF ensures projects matter beyond 
                  the classroom.
                </p>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm italic text-purple-700">
                    Present to city council, publish online, implement in community
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Powerful Features for Educators</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="alf-card">
              <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                Your Teaching Companion
              </h3>
              <p className="alf-body">
                Alf understands pedagogy and curriculum, working alongside you to enhance your expertise. 
                Get suggestions that honor your professional judgment and classroom knowledge.
              </p>
            </div>
            <div className="alf-card">
              <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                <Target className="w-6 h-6 text-orange-600" />
                Standards Alignment
              </h3>
              <p className="alf-body">
                Automatically map your projects to state and national standards. Show administrators 
                how active learning meets requirements.
              </p>
            </div>
            <div className="alf-card">
              <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Progress Tracking
              </h3>
              <p className="alf-body">
                Monitor student progress through each phase. Identify who needs support and celebrate 
                achievements along the way.
              </p>
            </div>
            <div className="alf-card">
              <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-600" />
                Export Options
              </h3>
              <p className="alf-body">
                Generate beautiful PDFs for students, detailed guides for substitutes, or share 
                projects with your teaching team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="alf-card">
                <button
                  className="w-full text-left flex justify-between items-center gap-4"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 transform transition-transform ${
                      openFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFAQ === index && (
                  <p className="alf-body mt-4 pb-2">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators creating meaningful learning experiences.
          </p>
          <button
            onClick={onBack}
            className="alf-button bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
          >
            Start Your First Project Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400">
        <div className="alf-container text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Alf. Empowering educators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}