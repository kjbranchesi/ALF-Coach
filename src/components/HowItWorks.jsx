// src/components/HowItWorks.jsx

import React, { useState } from 'react';
import { ArrowLeft, Play, ChevronDown, Users, Target, BarChart3, FileText, CheckCircle, Sparkles, Lightbulb, ShieldCheck, Zap, Route, ArrowRight, TrendingUp, Award, Brain, Globe } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import AlfLogo from './ui/AlfLogo';
import '../styles/alf-design-system.css';

export default function HowItWorks({ onBack, onGetStarted }) {
  const [openFAQ, setOpenFAQ] = useState(null);

  const researchStats = [
    {
      value: '93%',
      label: 'of HR executives rank adaptability as the most important skill',
      source: 'McKinsey Global Institute',
      icon: TrendingUp,
      color: 'text-primary-600'
    },
    {
      value: '8-10pts',
      label: 'higher AP exam scores in Project-Based Learning courses',
      source: 'Research controlled studies',
      icon: Award,
      color: 'text-success-600'
    },
    {
      value: '37%',
      label: 'skills gap: employers want collaboration, graduates lack preparation',
      source: 'NACE surveys',
      icon: Brain,
      color: 'text-coral-600'
    }
  ];

  const alfFeatures = [
    {
      title: 'Flexible project frameworks',
      description: 'Start with proven project templates, adapt them to your students, and watch ALF adjust to meet your classroom needs.',
      icon: Sparkles,
      color: 'bg-primary-100 text-primary-700'
    },
    {
      title: 'AI teaching partner',
      description: 'Collaborate with AI to brainstorm ideas, draft rubrics, and refine activities—while you stay in complete control of the learning experience.',
      icon: Lightbulb,
      color: 'bg-ai-100 text-ai-700'
    },
    {
      title: 'Team collaboration tools',
      description: 'Share lesson plans with colleagues and administrators. Keep everyone aligned on student progress and learning goals.',
      icon: Users,
      color: 'bg-coral-100 text-coral-700'
    }
  ];

  const alfProcess = [
    {
      title: 'Ideation',
      summary: 'Translate standards into big ideas, essential questions, and learner-centered challenges.',
      description: 'Transform curriculum requirements into compelling learning experiences that connect to students\' lives and the wider world.',
      icon: Zap,
      gradient: 'from-amber-400 to-orange-500',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      examples: [
        'Turn "photosynthesis" into "How can we solve our school\'s carbon footprint?"',
        'Transform "civil rights" into "What would justice look like in our community?"',
        'Convert "geometry" into "How do architects design earthquake-safe buildings?"'
      ]
    },
    {
      title: 'Journey',
      summary: 'Sequence inquiry arcs, formative feedback moments, and scaffolds that meet every learner where they are.',
      description: 'Design learning pathways that build skills systematically while maintaining student engagement and autonomy.',
      icon: Route,
      gradient: 'from-teal-400 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50',
      examples: [
        'Map prerequisite skills and create just-in-time learning moments',
        'Design collaborative activities that build on individual strengths',
        'Create formative assessment touchpoints that guide, don\'t grade'
      ]
    },
    {
      title: 'Deliverables',
      summary: 'Craft rubrics, exemplars, and reflective prompts that make growth visible to students and stakeholders.',
      description: 'Develop authentic assessment strategies that value both process and product while preparing students for real-world evaluation.',
      icon: Target,
      gradient: 'from-coral-400 to-pink-500',
      bgColor: 'bg-gradient-to-br from-coral-50 to-pink-50',
      examples: [
        'Design rubrics that students can use for self-assessment',
        'Create exemplars that inspire rather than intimidate',
        'Build reflection protocols that deepen learning'
      ]
    }
  ];

  const faqs = [
    {
      question: "Is ALF suitable for teachers new to project-based learning?",
      answer: "Absolutely. ALF is designed specifically for educators at any experience level. Our guided process and built-in templates make it easy to create your first project, while advanced features support seasoned practitioners looking to deepen their practice."
    },
    {
      question: "How much time does it take to create a project using ALF?",
      answer: "Most teachers create their first project in 30-45 minutes. Once you're familiar with the framework, projects typically take 15-20 minutes to design. The time you invest upfront saves hours during implementation and assessment."
    },
    {
      question: "Can ALF projects align with state standards and curriculum requirements?",
      answer: "Yes. ALF includes standards alignment tools and helps you design projects that naturally incorporate required content while enhancing student engagement and understanding. Projects are designed to meet and exceed traditional curriculum goals."
    },
    {
      question: "What if my students aren't used to active learning approaches?",
      answer: "The ALF framework includes scaffolding strategies to help students transition smoothly into more active roles. Our built-in reflection tools and gradual release methods ensure students feel supported throughout their learning journey."
    },
    {
      question: "How does ALF support different learning styles and needs?",
      answer: "ALF emphasizes multiple ways of knowing and demonstrating understanding. Projects naturally accommodate diverse learners through choice in topics, collaborative structures, and varied assessment formats."
    },
    {
      question: "Can I try ALF before committing to a subscription?",
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
              onClick={() => window.location.href = '/'}
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

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="alf-container max-w-4xl">
          <div className="text-center mb-12 alf-animate-fade-in">
            <h1 className="alf-display mb-6">How ALF Transforms Teaching</h1>
            <p className="alf-body-large text-gray-600 max-w-3xl mx-auto">
              Discover why Project-Based Learning works, how ALF makes it accessible, and what you gain
              when you transform your classroom into a space for authentic learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Why PBL Matters - Research Foundation */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-success-50 px-4 py-2 text-sm font-medium text-success-700 mb-6">
              <CheckCircle className="h-4 w-4" />
              Why Project-Based Learning?
            </span>
            <h2 className="alf-heading-2 mb-6">The Evidence is Clear</h2>
            <p className="alf-body-large text-gray-600 max-w-3xl mx-auto mb-8">
              Research consistently shows that well-designed Project-Based Learning doesn't just prepare students
              for the future—it improves academic outcomes today.
            </p>
          </div>

          {/* Future of Work Quote */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <blockquote className="font-serif text-2xl text-slate-700 italic leading-relaxed mb-4">
              "65% of children entering primary school today will work in job categories that don't yet exist."
            </blockquote>
            <cite className="text-sm text-slate-500 font-medium">
              — World Economic Forum, Future of Jobs Report
            </cite>
          </div>

          {/* Research Statistics */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {researchStats.map((stat, index) => (
              <Card key={index} className="shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  <div className="text-sm font-medium text-slate-900 mb-2">{stat.label}</div>
                  <div className="text-xs text-slate-500">Source: {stat.source}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tony Wagner Quote */}
          <div className="max-w-4xl mx-auto text-center mb-8">
            <blockquote className="font-serif text-xl text-slate-700 italic leading-relaxed border-l-4 border-primary-200 pl-6">
              "The world doesn't care what you know. What the world cares about is what you can do with what you know."
            </blockquote>
            <cite className="block text-sm text-slate-500 font-medium mt-4">
              — Tony Wagner, Harvard Innovation Lab
            </cite>
          </div>

          {/* Buck Institute Quote */}
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="font-serif text-lg text-slate-700 italic leading-relaxed">
              "Students learn content as well or better using Project-Based Learning than with traditional instruction.
              Project-Based Learning provides the opportunity to learn and practice skills that traditional instruction
              often ignores—working in groups, making choices, monitoring progress, thinking deeply about a problem
              or challenge, and communicating what has been learned."
            </blockquote>
            <cite className="block text-sm text-slate-500 font-medium mt-4">
              — John Mergendoller, Former Director, Buck Institute for Education
            </cite>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="alf-container max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="alf-heading-2 mb-4">See ALF in Action</h2>
            <p className="alf-body-large text-gray-600">
              Watch how teachers transform standards into engaging projects in minutes, not hours.
            </p>
          </div>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl aspect-video flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors rounded-xl"></div>
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-gray-700" fill="currentColor" />
                  </div>
                  <p className="text-lg font-semibold text-gray-800">Watch ALF Transform Teaching (3 min)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ALF Process Deep Dive */}
      <section className="py-16 px-6 bg-white">
        <div className="alf-container max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-6">
              <Sparkles className="h-4 w-4" />
              How ALF Works
            </span>
            <h2 className="alf-heading-2 mb-6">Three Stages to Transform Learning</h2>
            <p className="alf-body-large text-gray-600 max-w-3xl mx-auto">
              ALF guides you through a systematic process that transforms educational standards into
              meaningful Project-Based Learning experiences.
            </p>
          </div>

          {alfProcess.map((stage, index) => (
            <div key={stage.title} className="mb-20 last:mb-0">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="alf-heading-2 text-primary-600">{stage.title}</h3>
                  <p className="alf-body-large text-gray-600">{stage.summary}</p>
                </div>
              </div>

              <div className="ml-0 md:ml-20">
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                  {/* Left: Description */}
                  <div>
                    <p className="alf-body text-gray-700 mb-6 leading-relaxed">
                      {stage.description}
                    </p>
                    <div className={`${stage.bgColor} rounded-xl p-6`}>
                      <h4 className="font-semibold text-lg mb-4 text-gray-800">Examples in Action:</h4>
                      <ul className="space-y-3">
                        {stage.examples.map((example, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right: Visual Icon */}
                  <div className="flex justify-center">
                    <div className={`w-32 h-32 rounded-2xl ${stage.bgColor} flex items-center justify-center shadow-soft`}>
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center`}>
                        <stage.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ALF Features */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="alf-container max-w-6xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-ai-50 px-4 py-2 text-sm font-medium text-ai-700 mb-6">
              <ShieldCheck className="h-4 w-4" />
              Designed for Educators
            </span>
            <h2 className="alf-heading-2 mb-6">What You Get with ALF</h2>
            <p className="alf-body-large text-gray-600 max-w-3xl mx-auto">
              Everything you need to create meaningful learning experiences, built with your expertise
              and classroom realities in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {alfFeatures.map((feature, index) => (
              <Card key={index} className="shadow-lg h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="alf-body text-slate-600 flex-grow">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                  <Target className="w-6 h-6 text-primary-600" />
                  Standards Alignment Made Easy
                </h3>
                <p className="alf-body text-slate-600">
                  Automatically map your projects to state and national standards. Show administrators
                  how active learning meets and exceeds requirements while engaging students.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary-600" />
                  Progress Tracking & Assessment
                </h3>
                <p className="alf-body text-slate-600">
                  Monitor student progress through each phase. Identify who needs support and celebrate
                  achievements with built-in formative assessment tools.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-white">
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
                    <p className="alf-body mt-4 pb-2 text-slate-600">
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
      <section className="py-16 px-6 bg-gradient-to-r from-primary-600 to-blue-800 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of educators creating meaningful learning experiences that prepare students
            for tomorrow's challenges while exceeding today's academic standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted || onBack}
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              size="lg"
            >
              Start Your First Project Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={onBack}
              variant="ghost"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              size="lg"
            >
              Explore Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-gray-400">
        <div className="alf-container text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} ALF. Empowering educators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}