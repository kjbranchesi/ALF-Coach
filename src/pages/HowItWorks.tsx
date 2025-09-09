import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Sparkles, Clock, Shield, ArrowRight, Play, CheckCircle2,
  Lightbulb, Map, Target, Users, Award, BookOpen,
  Brain, Rocket, Heart, Star, ChevronDown, Zap,
  GraduationCap, BarChart3, FileText, Download,
  Grid3x3, Layers, Compass, MessageSquare
} from 'lucide-react';

// Hero Section with immediate value proposition
const HeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/30 to-cyan-50 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900" />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
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
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent leading-tight">
            Transform Your Teaching
            <br />
            <span className="text-4xl md:text-6xl">in 10 Minutes</span>
          </h1>

          {/* Value proposition */}
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            ALF Coach guides you through creating engaging, standards-aligned project-based learning experiences that students actually care about.
          </p>

          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Save 5+ hours per project</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">Standards-aligned</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Students love it</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/signin"
              className="group px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.button
              onClick={() => setIsPlaying(true)}
              className="px-8 py-4 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-lg hover:bg-white dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              Watch 2-min Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-slate-400" />
        </motion.div>
      </div>

      {/* Video modal */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setIsPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-center h-full text-white">
                  {/* Placeholder for video */}
                  <p className="text-xl">Demo video would play here</p>
                </div>
              </div>
              <button
                onClick={() => setIsPlaying(false)}
                className="absolute -top-12 right-0 text-white hover:text-slate-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Visual Process Section
const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      icon: Brain,
      color: 'from-amber-400 to-orange-500',
      title: 'Define Your Vision',
      subtitle: 'Big Idea & Essential Question',
      description: 'Start with what matters. What should students deeply understand? What question will drive their curiosity?',
      time: '3 minutes',
      example: 'Example: "How can we use math to solve real problems in our community?"'
    },
    {
      icon: Compass,
      color: 'from-blue-400 to-cyan-500',
      title: 'Map the Journey',
      subtitle: 'Four Learning Phases',
      description: 'Design a clear path through Analyze, Brainstorm, Prototype, and Evaluate phases.',
      time: '5 minutes',
      example: 'Each phase has specific goals, activities, and outputs that build on each other.'
    },
    {
      icon: Target,
      color: 'from-purple-400 to-pink-500',
      title: 'Set Clear Goals',
      subtitle: 'Deliverables & Assessment',
      description: 'Define what success looks like with milestones, rubrics, and real-world impact.',
      time: '2 minutes',
      example: 'Students present to authentic audiences and create something that matters.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Three Simple Steps
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Create your first project in under 10 minutes
          </p>
        </motion.div>

        {/* Interactive process visualization */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Visual representation */}
          <div className="relative">
            <div className="aspect-square relative">
              {/* Circular progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-200 dark:text-slate-700"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: (activeStep + 1) / 3 }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="gradient">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  key={activeStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  className="text-center"
                >
                  <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-br ${steps[activeStep].color} shadow-2xl mb-4`}>
                    {React.createElement(steps[activeStep].icon, { className: "w-16 h-16 text-white" })}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    Step {activeStep + 1}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {steps[activeStep].time}
                  </div>
                </motion.div>
              </div>

              {/* Step indicators */}
              {steps.map((step, index) => {
                const angle = (index * 120) - 90;
                const x = 50 + 45 * Math.cos(angle * Math.PI / 180);
                const y = 50 + 45 * Math.sin(angle * Math.PI / 180);
                
                return (
                  <motion.button
                    key={index}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index === activeStep
                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white scale-125 shadow-xl'
                        : index < activeStep
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={() => setActiveStep(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {index < activeStep ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right: Step details */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${steps[activeStep].color}`}>
                    {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {steps[activeStep].title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {steps[activeStep].subtitle}
                    </p>
                  </div>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {steps[activeStep].description}
                </p>
                
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                    {steps[activeStep].example}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    {steps[activeStep].time}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex justify-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === activeStep
                      ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'w-2 bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Grid Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Guidance',
      description: 'Get intelligent suggestions tailored to your subject and grade level',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Standards Aligned',
      description: 'Automatically maps to curriculum standards and learning objectives',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Users,
      title: 'Student-Centered',
      description: 'Creates experiences that engage and motivate your specific students',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Track Progress',
      description: 'Built-in assessment tools and milestone tracking',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: FileText,
      title: 'Ready to Share',
      description: 'Export beautiful PDFs for students, parents, and administrators',
      color: 'from-red-400 to-rose-500'
    },
    {
      icon: Rocket,
      title: 'Launch Ready',
      description: 'Everything you need to start teaching immediately',
      color: 'from-indigo-400 to-blue-500'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Powerful features designed specifically for educators
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  {React.createElement(feature.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Social Proof Section
const SocialProofSection = () => {
  const testimonials = [
    {
      quote: "ALF Coach transformed how I plan projects. What used to take hours now takes minutes.",
      author: "Sarah Martinez",
      role: "5th Grade Teacher",
      avatar: "SM"
    },
    {
      quote: "My students are more engaged than ever. They actually ask when the next project is!",
      author: "James Chen",
      role: "High School Science",
      avatar: "JC"
    },
    {
      quote: "The standards alignment feature alone saves me hours of documentation work.",
      author: "Emily Johnson",
      role: "Middle School Math",
      avatar: "EJ"
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Teachers' },
    { number: '50,000+', label: 'Projects Created' },
    { number: '4.9/5', label: 'Average Rating' },
    { number: '5 hours', label: 'Saved per Project' }
  ];

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Join thousands of teachers creating amazing learning experiences
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
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
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-300 mb-4 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Example Projects Section
const ExamplesSection = () => {
  const examples = [
    {
      title: 'Community Garden Project',
      grade: 'Elementary',
      subject: 'Science & Math',
      description: 'Students design and build a sustainable garden for their school',
      icon: Layers,
      color: 'from-green-400 to-emerald-500'
    },
    {
      title: 'Local History Documentary',
      grade: 'Middle School',
      subject: 'Social Studies',
      description: 'Create a documentary about unsung heroes in your community',
      icon: MessageSquare,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      title: 'Climate Solutions App',
      grade: 'High School',
      subject: 'STEM',
      description: 'Design an app to help reduce carbon footprint in daily life',
      icon: Rocket,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            See What's Possible
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Real projects created by teachers like you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200 dark:border-slate-700 h-full transition-all duration-300 group-hover:shadow-xl">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${example.color} mb-4`}>
                  {React.createElement(example.icon, { className: "w-6 h-6 text-white" })}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  {example.title}
                </h3>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {example.grade}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {example.subject}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {example.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">View Project</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <motion.a
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold hover:bg-white dark:hover:bg-slate-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Grid3x3 className="w-5 h-5" />
            Browse All Examples
            <ArrowRight className="w-5 h-5" />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

// FAQ Section with Progressive Disclosure
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How is this different from other lesson planning tools?",
      answer: "ALF Coach specifically focuses on project-based learning using the Active Learning Framework. We guide you through creating engaging, student-centered projects - not traditional lessons. Our AI understands pedagogy and helps you create experiences that students actually care about."
    },
    {
      question: "Do I need experience with project-based learning?",
      answer: "Not at all! ALF Coach is designed for teachers at any experience level. We guide you step-by-step, explain concepts as you go, and provide examples. Many teachers create their first successful project in under 15 minutes."
    },
    {
      question: "How does standards alignment work?",
      answer: "Simply input your subject and grade level, and ALF Coach automatically suggests relevant standards. You can also manually add specific standards you need to meet. Every project element is tagged to show alignment."
    },
    {
      question: "Can I edit projects after creating them?",
      answer: "Yes! Every project is fully editable. You can revise, adapt for different classes, or use projects as templates for future ones. We save everything automatically as you work."
    },
    {
      question: "What if my administration requires specific formats?",
      answer: "ALF Coach exports to multiple formats including PDF and Word. The output includes all the documentation typically required by administrators: standards alignment, assessment rubrics, learning objectives, and timelines."
    }
  ];

  return (
    <section className="py-20 px-6 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
            Common Questions
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Everything you need to know to get started
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Final CTA Section
const CTASection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of educators creating engaging, meaningful learning experiences. Your first project takes less than 10 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <motion.a
              href="/signin"
              className="group px-8 py-4 rounded-full bg-white text-blue-600 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              Start Free Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
            <motion.a
              href="/projects"
              className="px-8 py-4 rounded-full bg-white/20 backdrop-blur-xl border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Eye className="w-5 h-5" />
              View Examples
            </motion.a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Free forever for teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Main Component
export default function HowItWorks() {
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