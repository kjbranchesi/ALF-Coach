import React from 'react';
import { 
  MessageSquare, Lightbulb, FileText, ArrowRight,
  Clock, CheckCircle2, BookOpen, Users, Target
} from 'lucide-react';

// Minimal, honest hero section
const HeroSection = () => {
  return (
    <div className="relative py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
          How ALF Coach Works
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          ALF Coach helps teachers create project-based learning experiences through guided conversation with AI.
        </p>
      </div>
    </div>
  );
};

// Simple process section
const ProcessSection = () => {
  const steps = [
    {
      icon: MessageSquare,
      title: "Start a Conversation",
      description: "Tell ALF about your teaching goals, subject, and grade level. No special prompts needed.",
      example: "Example: \"I want to teach renewable energy to 8th graders\""
    },
    {
      icon: Lightbulb,
      title: "Collaborate on Ideas",
      description: "ALF suggests project frameworks based on educational best practices. You guide the direction.",
      example: "ALF helps you shape activities, assessments, and resources"
    },
    {
      icon: FileText,
      title: "Generate Your Blueprint",
      description: "Get a complete project plan with activities, rubrics, and materials you can adapt.",
      example: "Export as PDF or continue refining with ALF"
    }
  ];

  return (
    <div className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Three Simple Steps
        </h2>
        
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">
                    {step.description}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500 italic">
                    {step.example}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// What ALF provides
const WhatYouGetSection = () => {
  const items = [
    {
      icon: Target,
      title: "Standards Alignment",
      description: "Projects mapped to educational standards when specified"
    },
    {
      icon: Users,
      title: "Differentiation Ideas",
      description: "Suggestions for adapting to different learning needs"
    },
    {
      icon: BookOpen,
      title: "Complete Resources",
      description: "Activity guides, rubrics, and assessment frameworks"
    },
    {
      icon: Clock,
      title: "Time Estimates",
      description: "Realistic timelines for project implementation"
    }
  ];

  return (
    <div className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          What You'll Get
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex gap-4 p-6 rounded-lg bg-white dark:bg-slate-800 shadow-sm"
              >
                <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1 text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Important notes section
const ImportantNotesSection = () => {
  return (
    <div className="py-16 px-6 bg-amber-50 dark:bg-amber-900/10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          Important to Know
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>ALF is a tool, not a replacement.</strong> Your expertise and knowledge of your students is essential for creating meaningful projects.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Quality varies with input.</strong> The more context you provide about your students and goals, the better the output.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Always review and adapt.</strong> AI-generated content should be customized to fit your specific classroom context.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong>This is an early version.</strong> We're actively developing ALF Coach based on teacher feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple FAQ
const FAQSection = () => {
  const faqs = [
    {
      question: "How long does it take to create a project?",
      answer: "Most teachers spend 15-30 minutes in conversation with ALF to create a basic project framework. You can then refine and customize as needed."
    },
    {
      question: "Is ALF Coach free to use?",
      answer: "Yes, the core features are currently free as we develop the platform with teacher feedback."
    },
    {
      question: "Can I edit the projects ALF creates?",
      answer: "Absolutely. Everything ALF generates is meant to be a starting point that you customize for your students."
    },
    {
      question: "Does ALF understand my state's standards?",
      answer: "ALF has knowledge of major educational standards. Be specific about which standards you need to align with for best results."
    },
    {
      question: "What if I don't like what ALF creates?",
      answer: "Just tell ALF what you'd like changed. It's a conversation - you can redirect, refine, or start over anytime."
    }
  ];

  return (
    <div className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Common Questions
        </h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm"
            >
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                {faq.question}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple CTA
const CTASection = () => {
  return (
    <div className="py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          Ready to Try ALF Coach?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
          Start creating your first project-based learning experience.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/app'}
          >
            Get Started
          </button>
          
          <button
            className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/app/samples'}
          >
            View Examples
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component - lightweight and honest
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <HeroSection />
      <ProcessSection />
      <WhatYouGetSection />
      <ImportantNotesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}