// src/components/HowItWorks.jsx

import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle, Sparkles, Lightbulb, Users, Zap, Route, Target, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Design System imports
import { Container, Text, Button, Card } from '../design-system';

export default function HowItWorks() {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState(null);

  // ALF Process stages using design system
  const alfProcess = [
    {
      title: 'Ideation',
      summary: 'Transform standards into big ideas, essential questions, and learner-centered challenges.',
      description: 'Start with your curriculum standards and transform them into compelling questions that connect to students\' lives and the wider world.',
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

  // Comprehensive research-based FAQs
  const faqs = [
    {
      question: "How does ALF's three-stage approach address the documented challenges teachers face when implementing PBL?",
      answer: "Research shows educators struggle with PBL due to lack of systematic guidance and time management issues. ALF's Ideation → Journey → Deliverables structure provides research-backed framework that mirrors natural curriculum design thinking. The Ideation stage resolves vague project goals through Big Ideas and Essential Questions, Journey tackles time management with scaffolded progressions, and Deliverables addresses assessment concerns with authentic performance tasks and clear rubrics."
    },
    {
      question: "What makes ALF different from other project-based learning frameworks?",
      answer: "Unlike traditional frameworks that assume extensive PBL experience, ALF addresses the pedagogical implementation gap with AI-enhanced guidance that keeps educators in complete control. ALF offers intelligent recommendations based on your specific context while maintaining backward design integration that ensures every component aligns with learning objectives and standards—something many frameworks fail to provide systematically."
    },
    {
      question: "How does ALF ensure projects cover required academic standards without sacrificing rigor?",
      answer: "ALF cross-references Big Ideas and Essential Questions against academic standards, flagging gaps and suggesting connections. The Journey stage incorporates learning progressions that scaffold from introductory to mastery-level understanding, while Deliverables use performance-based rubrics measuring both content mastery and 21st-century skills. This approach actually increases retention compared to traditional coverage models."
    },
    {
      question: "How does ALF help manage classroom complexity with diverse learners?",
      answer: "ALF embeds Universal Design for Learning principles throughout the framework, prompting teachers to consider multiple means of representation, engagement, and expression from the outset. The milestone mapping creates natural checkpoints for targeted support, while authentic assessment provides multiple ways for students to demonstrate mastery—often revealing capabilities in students who struggle with traditional assessments."
    },
    {
      question: "How does ALF's AI assistance work without undermining teacher professional judgment?",
      answer: "ALF positions AI as an intelligent collaborator rather than replacement, offering research-based suggestions while teachers maintain complete control over decisions. The AI provides contextual recommendations based on your specific context, but you control what to accept, modify, or reject. Rather than prescriptive templates, ALF offers starting points for creativity that amplify rather than replace professional judgment."
    },
    {
      question: "How can ALF help create meaningful projects with limited planning time?",
      answer: "ALF's guided conversation interface allows complete project blueprints in 15-30 minutes through intelligent automation of time-intensive tasks like research, activity suggestions, and rubric creation. Smart defaults based on your context eliminate time-consuming decisions, while modular design allows implementation in phases, building confidence gradually rather than attempting comprehensive transformation immediately."
    },
    {
      question: "What evidence exists that ALF-designed projects improve student learning outcomes?",
      answer: "While ALF is newer, it incorporates evidence-based practices that research links to improved outcomes. Meta-analytic research shows well-implemented PBL produces effect sizes of 0.71 for academic achievement and 0.59 for critical thinking. Early ALF implementation data shows increased student engagement, improved collaboration skills, and enhanced ability to transfer learning to novel contexts."
    },
    {
      question: "How does ALF ensure all students, not just high achievers, can succeed?",
      answer: "ALF addresses achievement gap concerns through scaffolding strategies and strength-based approaches. The Journey stage incorporates knowledge-building activities ensuring all students develop necessary background knowledge, while multiple entry points allow different starting points to access the same objectives. Authentic contexts often reveal capabilities in students who struggle with traditional academics."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6F6F7] via-white to-[#E6F0FF] dark:from-[#141721] dark:via-[#1B2740] dark:to-[#0F1E4D]">
      {/* Hero Section - Using design system spacing */}
      <section className="pt-28 pb-16 px-6">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-slate-50 leading-tight">
              How ALF Transforms Teaching
            </h1>
            <Text size="xl" color="secondary" className="max-w-3xl mx-auto">
              Discover why Project-Based Learning works, how ALF makes it accessible, and what you gain
              when you transform your classroom into a space for authentic learning experiences.
            </Text>
          </div>
        </Container>
      </section>

      {/* Tony Wagner Quote - Key Context without duplicating WEF */}
      <section className="py-12 px-6 bg-white/60 backdrop-blur-sm dark:bg-slate-800/60">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="font-serif text-2xl text-slate-700 dark:text-slate-300 italic leading-relaxed mb-4">
              "The world doesn't care what you know. What the world cares about is what you can do with what you know."
            </blockquote>
            <cite className="text-sm text-slate-500 dark:text-slate-500 font-medium">
              — Tony Wagner, Harvard Innovation Lab
            </cite>
          </div>
        </Container>
      </section>

      {/* ALF Process - Following brand guidelines */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900">
        <Container>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 mb-6">
              <Sparkles className="h-4 w-4" />
              How ALF Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Three Stages to Transform Learning
            </h2>
            <Text size="lg" color="secondary" className="max-w-3xl mx-auto">
              ALF guides you through a systematic process that transforms educational standards into
              meaningful Project-Based Learning experiences.
            </Text>
          </div>

          {alfProcess.map((stage, index) => (
            <div key={stage.title} className="mb-20 last:mb-0">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Content */}
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center font-bold text-xl">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stage.title}</h3>
                      <Text color="secondary">{stage.summary}</Text>
                    </div>
                  </div>

                  <Text className="mb-6 leading-relaxed">{stage.description}</Text>

                  <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 border-0">
                    <h4 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-200">Examples in Action:</h4>
                    <div className="space-y-3">
                      {stage.examples.map((example, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                          <Text size="sm" className="text-slate-700 dark:text-slate-300">{example}</Text>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Visual */}
                <div className={`flex justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className={`w-32 h-32 rounded-2xl ${stage.bgColor} flex items-center justify-center shadow-lg`}>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center`}>
                      <stage.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ALF Features - Brief overview */}
      <section className="py-16 px-6 bg-slate-50/40 backdrop-blur-sm dark:bg-slate-900/50">
        <Container>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-ai-50 px-4 py-2 text-sm font-medium text-ai-700 mb-6">
              <Lightbulb className="h-4 w-4" />
              What You Get with ALF
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Built for Real Classrooms
            </h2>
            <Text size="lg" color="secondary" className="max-w-3xl mx-auto">
              Everything you need to create meaningful learning experiences, designed with your expertise
              and classroom realities in mind.
            </Text>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Teaching Partner',
                description: 'Collaborate with AI to brainstorm ideas and draft materials while you stay in complete control.',
                icon: Lightbulb,
                color: 'bg-ai-100 text-ai-700'
              },
              {
                title: 'Flexible Frameworks',
                description: 'Start with proven templates, adapt to your students, and watch ALF adjust to your needs.',
                icon: Sparkles,
                color: 'bg-primary-100 text-primary-700'
              },
              {
                title: 'Seamless Collaboration',
                description: 'Share plans with colleagues and keep everyone aligned on student progress and goals.',
                icon: Users,
                color: 'bg-coral-100 text-coral-700'
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6 h-full">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                <Text color="secondary">{feature.description}</Text>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Comprehensive FAQs */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Frequently Asked Questions
              </h2>
              <Text size="lg" color="secondary">
                Research-based answers to common questions about implementing ALF in your classroom.
              </Text>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="overflow-hidden">
                  <button
                    className="w-full text-left p-6 flex justify-between items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  >
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 pr-4">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transform transition-transform flex-shrink-0 mt-1 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <Text className="leading-relaxed text-slate-700 dark:text-slate-300">
                        {faq.answer}
                      </Text>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary-600 to-blue-800 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Teaching?</h2>
            <Text size="xl" className="mb-8 opacity-90">
              Join educators creating meaningful learning experiences that prepare students
              for tomorrow's challenges while exceeding today's academic standards.
            </Text>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/signin')}
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 hover:bg-blue-50 hover:text-blue-900 px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200 rounded-lg"
              >
                Start Your First Project
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/app/samples')}
                className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-blue-800 px-8 py-4 text-lg font-semibold transition-all duration-200 rounded-lg"
              >
                Explore Examples
              </button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}