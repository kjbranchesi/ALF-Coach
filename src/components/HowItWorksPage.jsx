// src/components/HowItWorksPage.jsx

import React, { useState } from 'react';
import { ArrowLeft, Play, ChevronDown, Users, Target, BarChart3, FileText } from 'lucide-react';
import { Button } from '../design-system/components/Button';
import { Icon } from '../design-system/components/Icon';
import { Card, CardContent } from './ui/Card';
import AlfLogo from './ui/AlfLogo';
import '../styles/alf-design-system.css';

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
            <AlfLogo size="lg" />
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
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl aspect-video flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-gray-700" fill="currentColor" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800">Watch Alf in Action (3 min)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detailed Process Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="alf-container max-w-5xl">
          <h2 className="alf-heading-2 text-center mb-12">The Three-Stage Journey</h2>
          
          {/* Stage 1: Ideation */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="alf-heading-2 text-blue-600">Ideation Stage</h3>
                <p className="alf-body-large">Transform curiosity into compelling learning experiences</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 ml-0 md:ml-20">
              <Card className="shadow-lg">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stage 2: Journey */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="alf-heading-2 text-orange-600">Journey Stage</h3>
                <p className="alf-body-large">Map the learning adventure from discovery to mastery</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 ml-0 md:ml-20">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-3">Learning Phases</h4>
                  <p className="alf-body mb-4">
                    Break down the journey into manageable phases. ALF suggests progression that builds 
                    skills systematically.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm italic text-blue-700">
                      Investigate → Analyze → Create → Implement
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-3">Activities & Experiences</h4>
                  <p className="alf-body mb-4">
                    Design hands-on activities for each phase. Get suggestions tailored to your subject 
                    and grade level.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm italic text-blue-700">
                      Field research, expert interviews, prototype creation
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-3">Resources & Support</h4>
                  <p className="alf-body mb-4">
                    Identify materials, tools, and community connections. ALF helps you think beyond 
                    traditional resources.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm italic text-blue-700">
                      Local experts, online tools, partner organizations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stage 3: Deliverables */}
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="alf-heading-2 text-blue-600">Deliverables Stage</h3>
                <p className="alf-body-large">Make learning visible through authentic assessment</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 ml-0 md:ml-20">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-3">Milestones</h4>
                  <p className="alf-body mb-4">
                    Set meaningful checkpoints that celebrate progress. ALF helps create milestones 
                    that motivate, not just measure.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm italic text-blue-700">
                      Research complete, prototype tested, campaign launched
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-3">Assessment Rubrics</h4>
                  <p className="alf-body mb-4">
                    Create clear, fair evaluation criteria. Our AI generates rubrics that value both 
                    process and product.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm italic text-blue-700">
                      Creativity, collaboration, impact, reflection
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-3">Real-World Impact</h4>
                  <p className="alf-body mb-4">
                    Connect student work to authentic audiences. ALF ensures projects matter beyond 
                    the classroom.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm italic text-blue-700">
                      Present to city council, publish online, implement in community
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Powerful Features for Educators</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  Your Teaching Companion
                </h3>
                <p className="alf-body">
                  Alf understands pedagogy and curriculum, working alongside you to enhance your expertise. 
                  Get suggestions that honor your professional judgment and classroom knowledge.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                  <Target className="w-6 h-6 text-blue-600" />
                  Standards Alignment
                </h3>
                <p className="alf-body">
                  Automatically map your projects to state and national standards. Show administrators 
                  how active learning meets requirements.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  Progress Tracking
                </h3>
                <p className="alf-body">
                  Monitor student progress through each phase. Identify who needs support and celebrate 
                  achievements along the way.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Export Options
                </h3>
                <p className="alf-body">
                  Generate beautiful PDFs for students, detailed guides for substitutes, or share 
                  projects with your teaching team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators creating meaningful learning experiences.
          </p>
          <Button
            onClick={onBack}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Start Your First Project Free
          </Button>
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