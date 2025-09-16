/**
 * CelebrationSystem.tsx
 * Professional celebration and completion messages that acknowledge teacher expertise
 * Maintains Apple-like sophistication without emojis or cutesy language
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Award, Sparkles, Users, Target, Lightbulb, ArrowRight } from 'lucide-react';

interface CelebrationSystemProps {
  type: 'milestone' | 'stage_complete' | 'breakthrough' | 'blueprint_complete';
  achievement: string;
  context?: {
    stage?: string;
    step?: number;
    details?: string;
    nextAction?: string;
  };
  onContinue?: () => void;
  onReview?: () => void;
}

interface CelebrationConfig {
  icon: React.ComponentType<any>;
  title: string;
  message: string;
  acknowledgment: string;
  nextSteps?: string;
  color: 'blue' | 'green' | 'purple' | 'gold';
}

export const CelebrationSystem: React.FC<CelebrationSystemProps> = ({
  type,
  achievement,
  context,
  onContinue,
  onReview
}) => {
  
  const getCelebrationConfig = (): CelebrationConfig => {
    switch (type) {
      case 'milestone':
        return {
          icon: CheckCircle,
          title: "Milestone Achieved",
          message: getMilestoneMessage(achievement, context),
          acknowledgment: "Your educational expertise is evident in this thoughtful design work.",
          color: 'blue'
        };

      case 'stage_complete':
        return {
          icon: Award,
          title: getStageCompleteTitle(achievement),
          message: getStageCompleteMessage(achievement, context),
          acknowledgment: "This demonstrates sophisticated curriculum design thinking.",
          nextSteps: getNextStepsMessage(achievement),
          color: 'green'
        };

      case 'breakthrough':
        return {
          icon: Lightbulb,
          title: "Design Breakthrough",
          message: getBreakthroughMessage(achievement, context),
          acknowledgment: "That insight will significantly enhance your students' learning experience.",
          color: 'purple'
        };

      case 'blueprint_complete':
        return {
          icon: Award,
          title: "Blueprint Complete",
          message: "You've created a comprehensive learning experience that demonstrates exceptional educational design. Your students will benefit from the thoughtful progression, authentic challenges, and clear success framework you've established.",
          acknowledgment: "This is curriculum design at its finest. Your students are fortunate to have an educator who creates such engaging, purposeful learning experiences.",
          nextSteps: "Your implementation materials are ready for download. You have everything needed to guide your students through this transformative creative process.",
          color: 'gold'
        };

      default:
        return {
          icon: CheckCircle,
          title: "Excellent Progress",
          message: "Your design work continues to show real educational insight.",
          acknowledgment: "This thoughtful approach will create meaningful learning for your students.",
          color: 'blue'
        };
    }
  };

  const config = getCelebrationConfig();
  const Icon = config.icon;
  const colorClasses = getColorClasses(config.color);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`relative ${colorClasses.bg} ${colorClasses.border} rounded-2xl p-6 shadow-xl border backdrop-blur-sm`}
      >
        {/* Celebration Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 ${colorClasses.iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className={`w-8 h-8 ${colorClasses.icon}`} />
          </div>
          
          <div className="flex-1">
            <h3 className={`text-xl font-semibold ${colorClasses.title} mb-1`}>
              {config.title}
            </h3>
            {context?.stage && (
              <p className={`text-sm ${colorClasses.subtitle}`}>
                {context.stage} {context.step && `• Step ${context.step}`}
              </p>
            )}
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-4">
          <p className={`text-base leading-relaxed ${colorClasses.text} mb-3`}>
            {config.message}
          </p>
          
          {/* Professional Acknowledgment */}
          <div className={`${colorClasses.acknowledgmentBg} rounded-xl p-4 border ${colorClasses.acknowledgmentBorder}`}>
            <p className={`text-sm font-medium ${colorClasses.acknowledgmentText}`}>
              {config.acknowledgment}
            </p>
          </div>
        </div>

        {/* Next Steps (if applicable) */}
        {config.nextSteps && (
          <div className="mb-4">
            <div className={`${colorClasses.nextStepsBg} rounded-xl p-4 border ${colorClasses.nextStepsBorder}`}>
              <p className={`text-sm ${colorClasses.nextStepsText}`}>
                <strong>Next:</strong> {config.nextSteps}
              </p>
            </div>
          </div>
        )}

        {/* Context Details */}
        {context?.details && (
          <div className="mb-4">
            <p className={`text-sm ${colorClasses.details} italic`}>
              {context.details}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex gap-3">
            {onReview && (
              <button
                onClick={onReview}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${colorClasses.secondaryButton}`}
              >
                <Target className="w-4 h-4" />
                Review Design
              </button>
            )}
          </div>
          
          {onContinue && context?.nextAction && (
            <button
              onClick={onContinue}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all transform hover:-translate-y-0.5 ${colorClasses.primaryButton}`}
            >
              {context.nextAction}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper functions for dynamic content

const getMilestoneMessage = (achievement: string, context: any): string => {
  const milestoneMessages: Record<string, string> = {
    'AUTHENTIC_CONNECTION': "Perfect. You've created a meaningful connection to your students' world. This authenticity will drive engagement throughout the learning experience.",
    'BREAKTHROUGH_MOMENT': "Excellent insight. That approach shows deep understanding of how learning happens. Your students will benefit from this thoughtful design choice.",
    'STUDENT_CENTERED_DESIGN': "Beautiful student-centered thinking. You're designing with your students' needs and interests at the center, which is the hallmark of exceptional curriculum design.",
    'CREATIVE_SOLUTION': "Innovative approach. You're thinking creatively about how to engage students while meeting learning objectives. This balance of creativity and rigor is sophisticated design work."
  };

  return milestoneMessages[achievement] || "Your design work shows real educational insight and will create meaningful learning for your students.";
};

const getStageCompleteTitle = (achievement: string): string => {
  const titles: Record<string, string> = {
    'IDEATION_COMPLETE': "Foundation Excellence",
    'JOURNEY_COMPLETE': "Learning Path Mastery",
    'DELIVERABLES_COMPLETE': "Success Framework Complete"
  };

  return titles[achievement] || "Stage Complete";
};

const getStageCompleteMessage = (achievement: string, context: any): string => {
  const messages: Record<string, string> = {
    'IDEATION_COMPLETE': "Outstanding conceptual design. You've established a learning foundation that will engage students with meaningful ideas, guide deep thinking through essential questions, and connect learning to authentic challenges. Your students will begin their creative journey with clear purpose and direction.",
    
    'JOURNEY_COMPLETE': "Exceptional learning progression design. You've created a journey that guides students through logical phases, provides varied and meaningful experiences, and supports success with necessary resources. Your students will have a clear roadmap from curiosity to creation.",
    
    'DELIVERABLES_COMPLETE': "Masterful success framework. You've established clear progress checkpoints, defined success criteria that inspire excellence, and created authentic impact opportunities. Your students will know exactly what success looks like and how their work matters beyond the classroom."
  };

  return messages[achievement] || "This stage demonstrates sophisticated educational design thinking.";
};

const getNextStepsMessage = (achievement: string): string => {
  const nextSteps: Record<string, string> = {
    'IDEATION_COMPLETE': "Ready to design the learning progression your students will follow?",
    'JOURNEY_COMPLETE': "Ready to establish the success framework that ensures every student succeeds?",
    'DELIVERABLES_COMPLETE': "Ready to review your complete blueprint and prepare implementation materials?"
  };

  return nextSteps[achievement] || "Ready to continue to the next design phase?";
};

const getBreakthroughMessage = (achievement: string, context: any): string => {
  return "That insight demonstrates your deep understanding of effective learning design. This thoughtful approach will significantly enhance your students' experience and outcomes.";
};

const getColorClasses = (color: 'blue' | 'green' | 'purple' | 'gold') => {
  const colorMap = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20',
      border: 'border-primary-200 dark:border-blue-800',
      iconBg: 'bg-gradient-to-br from-primary-500 to-indigo-600',
      icon: 'text-white',
      title: 'text-primary-900 dark:text-primary-100',
      subtitle: 'text-primary-600 dark:text-primary-400',
      text: 'text-primary-800 dark:text-primary-200',
      acknowledgmentBg: 'bg-primary-100 dark:bg-primary-900/30',
      acknowledgmentBorder: 'border-primary-200 dark:border-blue-700',
      acknowledgmentText: 'text-primary-800 dark:text-primary-200',
      nextStepsBg: 'bg-white dark:bg-gray-800',
      nextStepsBorder: 'border-primary-200 dark:border-blue-700',
      nextStepsText: 'text-primary-700 dark:text-primary-300',
      details: 'text-primary-600 dark:text-primary-400',
      primaryButton: 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white hover:from-primary-600 hover:to-indigo-700 shadow-lg hover:shadow-xl',
      secondaryButton: 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-blue-600 hover:bg-primary-50 dark:hover:bg-gray-600'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      icon: 'text-white',
      title: 'text-green-900 dark:text-green-100',
      subtitle: 'text-green-600 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200',
      acknowledgmentBg: 'bg-green-100 dark:bg-green-900/30',
      acknowledgmentBorder: 'border-green-200 dark:border-green-700',
      acknowledgmentText: 'text-green-800 dark:text-green-200',
      nextStepsBg: 'bg-white dark:bg-gray-800',
      nextStepsBorder: 'border-green-200 dark:border-green-700',
      nextStepsText: 'text-green-700 dark:text-green-300',
      details: 'text-green-600 dark:text-green-400',
      primaryButton: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl',
      secondaryButton: 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-600 hover:bg-green-50 dark:hover:bg-gray-600'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      icon: 'text-white',
      title: 'text-purple-900 dark:text-purple-100',
      subtitle: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-800 dark:text-purple-200',
      acknowledgmentBg: 'bg-purple-100 dark:bg-purple-900/30',
      acknowledgmentBorder: 'border-purple-200 dark:border-purple-700',
      acknowledgmentText: 'text-purple-800 dark:text-purple-200',
      nextStepsBg: 'bg-white dark:bg-gray-800',
      nextStepsBorder: 'border-purple-200 dark:border-purple-700',
      nextStepsText: 'text-purple-700 dark:text-purple-300',
      details: 'text-purple-600 dark:text-purple-400',
      primaryButton: 'bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 shadow-lg hover:shadow-xl',
      secondaryButton: 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-600 hover:bg-purple-50 dark:hover:bg-gray-600'
    },
    gold: {
      bg: 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
      icon: 'text-white',
      title: 'text-amber-900 dark:text-amber-100',
      subtitle: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-800 dark:text-amber-200',
      acknowledgmentBg: 'bg-amber-100 dark:bg-amber-900/30',
      acknowledgmentBorder: 'border-amber-200 dark:border-amber-700',
      acknowledgmentText: 'text-amber-800 dark:text-amber-200',
      nextStepsBg: 'bg-white dark:bg-gray-800',
      nextStepsBorder: 'border-amber-200 dark:border-amber-700',
      nextStepsText: 'text-amber-700 dark:text-amber-300',
      details: 'text-amber-600 dark:text-amber-400',
      primaryButton: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl',
      secondaryButton: 'bg-white dark:bg-gray-700 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-gray-600'
    }
  };

  return colorMap[color];
};

export default CelebrationSystem;