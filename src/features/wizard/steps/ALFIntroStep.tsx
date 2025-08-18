import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  Map, 
  Package, 
  ArrowRight, 
  CheckCircle2,
  Users,
  Clock,
  Target,
  Sparkles,
  BookOpen,
  Award
} from 'lucide-react';

interface ALFIntroStepProps {
  onContinue: () => void;
  onSkip: () => void;
}

interface ProcessPhase {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  benefits: string[];
  gradient: string;
  iconBg: string;
}

const PROCESS_PHASES: ProcessPhase[] = [
  {
    id: 'analyze',
    name: 'Analyze',
    description: 'Understand your context & craft the challenge',
    icon: Target,
    benefits: ['Student interests & readiness', 'Standards alignment', 'Driving question development'],
    gradient: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  },
  {
    id: 'layout',
    name: 'Layout',
    description: 'Design the inquiry journey',
    icon: Map,
    benefits: ['Sustained inquiry path', 'Student voice & choice', 'Critique & revision cycles'],
    gradient: 'from-green-500 to-emerald-600',
    iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
  },
  {
    id: 'formulate',
    name: 'Formulate',
    description: 'Create authentic assessments & products',
    icon: Package,
    benefits: ['Public products', 'Real-world audience', 'Standards-based rubrics'],
    gradient: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
  }
];

const STATS = [
  { icon: Users, value: '10,000+', label: 'Educators helped' },
  { icon: Clock, value: '~30min', label: 'Average setup time' },
  { icon: Award, value: '4.8/5', label: 'Teacher satisfaction' }
];

export const ALFIntroStep: React.FC<ALFIntroStepProps> = ({ onContinue, onSkip }) => {
  const [activePhase, setActivePhase] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      {/* Header with confidence-building message */}
      <motion.div 
        variants={itemVariants}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Trusted by educators worldwide
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Meet ALF: Your PBL Design Partner
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          ALF helps you create Gold Standard Project Based Learning experiences that engage students with real-world challenges. 
          <strong className="text-gray-900 dark:text-gray-100"> You bring the expertise—we provide research-backed PBL scaffolding.</strong>
        </p>
      </motion.div>

      {/* Social proof stats */}
      <motion.div 
        variants={itemVariants}
        className="flex justify-center gap-8 md:gap-16 mb-12 text-center"
      >
        {STATS.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-2">
              <stat.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ALF Process Overview - Interactive */}
      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center mb-8">
          The ALF Process: Gold Standard PBL Made Accessible
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {PROCESS_PHASES.map((phase, index) => (
            <motion.div
              key={phase.id}
              variants={itemVariants}
              className={`
                relative p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700
                cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1
                ${activePhase === phase.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}
              `}
              onHoverStart={() => setActivePhase(phase.id)}
              onHoverEnd={() => setActivePhase(null)}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Phase number indicator */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl ${phase.iconBg} flex items-center justify-center mb-4`}>
                <phase.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {phase.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">
                {phase.description}
              </p>

              {/* Benefits - show on hover/active */}
              <AnimatePresence>
                {activePhase === phase.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3"
                  >
                    {phase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Confidence building message */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-200 dark:border-blue-800 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Built on Gold Standard PBL Principles
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              ALF incorporates research from Buck Institute, High Tech High, and decades of PBL best practices. 
              Every suggestion aligns with essential elements: authentic challenges, sustained inquiry, student voice, and public products—while you maintain full control to adapt for your unique context.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <button
          onClick={onContinue}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Let's Create Something Amazing
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <button
          onClick={onSkip}
          className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors text-sm font-medium"
        >
          Skip Overview →
        </button>
      </motion.div>

      {/* Help link */}
      <motion.div 
        variants={itemVariants}
        className="text-center mt-6"
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Want to learn more?{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
            Watch a quick demo
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
};