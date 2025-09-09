import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Clock, Shield, ArrowRight, Play, CheckCircle2,
  Lightbulb, Map, Target, Users, Award, BookOpen,
  Brain, Rocket, Heart, Star, ChevronDown, Zap,
  GraduationCap, BarChart3, FileText,
  Grid3x3, Layers, Compass, MessageSquare
} from 'lucide-react';

// Hero Section with immediate value proposition
const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-cyan-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Trust badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-purple-200 dark:border-purple-800 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Trusted by 10,000+ educators worldwide
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transform Your Teaching
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">
              in 10 Minutes
            </span>
          </h1>

          {/* Value proposition */}
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Create comprehensive, standards-aligned Project-Based Learning experiences 
            with the power of AI. No templates. No compromises. Just amazing projects.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Clock className="w-5 h-5 text-green-600" />
              <span>Save 20+ hours per project</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Standards-aligned automatically</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Engage every student</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/app'}
            >
              <Sparkles className="w-5 h-5" />
              Start Creating Free
            </motion.button>
            
            <motion.button
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(true)}
            >
              <Play className="w-5 h-5" />
              Watch 2-min Demo
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Process Section
const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      title: "Tell ALF Your Goal",
      time: "3 min",
      description: "Share your teaching objectives, subject area, and grade level",
      example: "\"I want to teach renewable energy to 8th graders\"",
      output: "ALF creates a complete project framework instantly"
    },
    {
      title: "Customize Your Blueprint", 
      time: "5 min",
      description: "Work with ALF to refine activities, resources, and assessments",
      example: "\"Add more hands-on experiments and local field trips\"",
      output: "Get a personalized blueprint with all materials ready"
    },
    {
      title: "Launch With Students",
      time: "2 min", 
      description: "Export or share your complete project package",
      example: "Download PDF, share link, or integrate with LMS",
      output: "Students engage with authentic, meaningful learning"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Three Simple Steps
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            From idea to implementation in under 10 minutes
          </p>
        </motion.div>

        {/* Interactive steps */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`relative p-6 rounded-2xl transition-all cursor-pointer ${
                activeStep === index 
                  ? 'bg-white dark:bg-slate-800 shadow-2xl scale-105 border-2 border-purple-500' 
                  : 'bg-white/50 dark:bg-slate-800/50 shadow-lg border border-slate-200 dark:border-slate-700'
              }`}
              onClick={() => setActiveStep(index)}
              whileHover={{ y: -5 }}
            >
              {/* Step number */}
              <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                activeStep === index 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'bg-slate-400 dark:bg-slate-600'
              }`}>
                {index + 1}
              </div>

              {/* Time badge */}
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">{step.time}</span>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                {step.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {step.description}
              </p>

              <AnimatePresence mode="wait">
                {activeStep === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        Example: {step.example}
                      </p>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        → {step.output}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                activeStep === index 
                  ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600' 
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Features Grid
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Design",
      description: "ALF understands pedagogy and creates educationally sound projects"
    },
    {
      icon: Target,
      title: "Standards Alignment",
      description: "Automatically maps to Common Core, NGSS, and state standards"
    },
    {
      icon: Layers,
      title: "Complete Resources",
      description: "Rubrics, worksheets, presentations, and assessments included"
    },
    {
      icon: Users,
      title: "Differentiation Built-In",
      description: "Adapts for different learning styles and ability levels"
    },
    {
      icon: Rocket,
      title: "Real-World Connection",
      description: "Projects connect to authentic problems and careers"
    },
    {
      icon: Heart,
      title: "Student Engagement",
      description: "Choice, voice, and relevance drive intrinsic motivation"
    }
  ];

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Powerful features designed for real classrooms
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Examples Section
const ExamplesSection = () => {
  const examples = [
    {
      title: "Climate Solutions Summit",
      grade: "Grades 9-12",
      subject: "Science",
      description: "Students research, propose, and present solutions to local climate challenges"
    },
    {
      title: "Community Heritage Museum",
      grade: "Grades 4-6",
      subject: "Social Studies",
      description: "Students create exhibits celebrating their community's diverse history"
    },
    {
      title: "Math in Motion",
      grade: "Grades 7-8",
      subject: "Mathematics",
      description: "Design a mini golf course using geometry and physics principles"
    }
  ];

  return (
    <div className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See What's Possible
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Real projects created by teachers using ALF Coach
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex gap-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-lg">
                  {example.subject}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-lg">
                  {example.grade}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {example.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {example.description}
              </p>
              
              <button className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                View Project
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.button
            className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold shadow-lg border border-slate-200 dark:border-slate-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/app/samples'}
          >
            Browse All Projects →
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Social Proof
const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "8th Grade Science Teacher",
      quote: "ALF saved me weeks of planning. My students were more engaged than ever!",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "High School History",
      quote: "The standards alignment is perfect. Admin loves it, students love it, I love it.",
      rating: 5
    },
    {
      name: "Emily Johnson",
      role: "Elementary Specialist",
      quote: "Finally, PBL that actually works for younger students. Game-changer!",
      rating: 5
    }
  ];

  return (
    <div className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { number: "10,000+", label: "Teachers" },
            { number: "50,000+", label: "Projects Created" },
            { number: "98%", label: "Satisfaction" },
            { number: "20hrs", label: "Avg. Time Saved" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "{testimonial.quote}"
              </p>
              
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">
                  {testimonial.name}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "Is ALF Coach really free?",
      answer: "Yes! The core features are free forever. We offer premium features for schools and districts."
    },
    {
      question: "How is this different from ChatGPT?",
      answer: "ALF is specifically trained on educational pedagogy, understands standards, and creates complete project packages - not just text responses."
    },
    {
      question: "Do I need to know about AI?",
      answer: "Not at all! Just describe what you want to teach in plain English. ALF handles all the complexity."
    },
    {
      question: "Can I edit the projects?",
      answer: "Absolutely! Every project is fully customizable. Add, remove, or modify anything to fit your needs."
    },
    {
      question: "Is my data safe?",
      answer: "Yes. We use enterprise-grade security, never train on your data, and you own everything you create."
    }
  ];

  return (
    <div className="py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`w-5 h-5 text-slate-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of educators creating amazing learning experiences
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <motion.button
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/app'}
            >
              Start Creating Free
            </motion.button>
            
            <motion.button
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold shadow-lg border border-white/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/app/samples'}
            >
              View Examples
            </motion.button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              No credit card required
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Free forever
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Cancel anytime
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main Component
export default function HowItWorksFixed() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <HeroSection />
      <ProcessSection />
      <FeaturesSection />
      <ExamplesSection />
      <SocialProofSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}