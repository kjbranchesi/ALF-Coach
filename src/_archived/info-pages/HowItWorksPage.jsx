// [ARCHIVED] src/components/HowItWorksPage.jsx moved on 2025-09-02
// Reason: superseded by src/pages/HowItWorks.tsx

import React, { useState } from 'react';
import { ArrowLeft, Play, ChevronDown, Users, Target, BarChart3, FileText } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Icon } from '../../design-system/components/Icon';
import { Card, CardContent } from '../../components/ui/Card';
import AlfLogo from '../../components/ui/AlfLogo';
import '../../styles/alf-design-system.css';

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
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-sm z-50">
        <div className="alf-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
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

      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="alf-container max-w-5xl">
          <h2 className="alf-heading-2 text-center mb-12">The Three-Stage Journey</h2>
          {/* Content omitted for brevity in archive */}
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Powerful Features for Educators</h2>
          {/* Content omitted for brevity in archive */}
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Frequently Asked Questions</h2>
          {/* Content omitted for brevity in archive */}
        </div>
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-primary-600 to-blue-800 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of educators creating meaningful learning experiences.
          </p>
          <Button
            onClick={onBack}
            className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Start Your First Project Free
          </Button>
        </div>
      </section>

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

