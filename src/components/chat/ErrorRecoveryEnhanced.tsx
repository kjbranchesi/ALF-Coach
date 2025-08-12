/**
 * ErrorRecoveryEnhanced.tsx
 * Enhanced error recovery for teacher confusion about roles and mental model
 * Professional, supportive tone that redirects back to curriculum design mindset
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, MessageSquare, HelpCircle, User, Users, Lightbulb } from 'lucide-react';

interface ErrorRecoveryEnhancedProps {
  error: {
    type: 'role_confusion' | 'scope_confusion' | 'implementation_confusion' | 'content_confusion' | 'network' | 'validation' | 'general';
    message: string;
    context?: any;
    originalInput?: string;
  };
  onRetry?: () => void;
  onClarifyRole?: () => void;
  onGetHelp?: () => void;
  currentStage?: string;
}

export function ErrorRecoveryEnhanced({ 
  error, 
  onRetry, 
  onClarifyRole, 
  onGetHelp,
  currentStage 
}: ErrorRecoveryEnhancedProps) {
  
  const getRecoveryConfig = () => {
    switch (error.type) {
      case 'role_confusion':
        return {
          icon: Users,
          title: "Design Role Clarification",
          description: "I notice you're thinking about including students in the design process. Let me clarify our current work.",
          explanation: `**Right now:** You're designing the learning experience framework
**Later:** Your students will journey through what you create
**Your role:** Curriculum architect and learning designer
**Students' role:** Creative explorers within your designed framework

We're creating the structure, activities, and guidelines that will guide your students through their creative process. They'll have plenty of choice and agency within the framework you design.`,
          actions: [
            {
              label: "Continue Designing",
              icon: User,
              action: onRetry,
              variant: 'primary' as const,
              description: "Focus on designing the learning experience for your students"
            },
            {
              label: "Clarify My Role",
              icon: HelpCircle,
              action: onClarifyRole,
              variant: 'secondary' as const,
              description: "Get more explanation about the design process"
            }
          ],
          tips: [
            "You're the professional educator making curriculum decisions",
            "Your students will experience what you design during implementation",
            "This is planning phase, not teaching phase"
          ]
        };

      case 'scope_confusion':
        return {
          icon: MessageSquare,
          title: "Design Session Scope",
          description: "This design session is for you as the educator. Your students aren't part of this conversation.",
          explanation: `Think of this like architectural planning: we're creating the blueprint for an amazing learning experience. Your students will inhabit and explore the "building" we design, but right now we're in the planning phase.

You're making professional decisions about curriculum design based on your expertise and knowledge of your students.`,
          actions: [
            {
              label: "Continue Designing",
              icon: User,
              action: onRetry,
              variant: 'primary' as const,
              description: "Focus on the curriculum design process"
            },
            {
              label: "Understand Process",
              icon: Lightbulb,
              action: onGetHelp,
              variant: 'secondary' as const,
              description: "Learn more about the design methodology"
            }
          ],
          tips: [
            "You have professional expertise about your students' needs",
            "Design decisions are based on your teaching experience",
            "Students will engage with the framework you create"
          ]
        };

      case 'implementation_confusion':
        return {
          icon: RefreshCw,
          title: "Design vs Implementation",
          description: "Great question about implementation. Here's the distinction:",
          explanation: `**Design Phase (now):** We create the complete learning framework
**Implementation Phase (later):** You facilitate students through the experience we design

Right now we're establishing what your students will do, learn, and create. When you implement this blueprint, you'll guide them through each phase we design.

The beauty of this approach is that you'll have a complete roadmap before you begin teaching, making implementation smooth and confident.`,
          actions: [
            {
              label: "Focus on Design",
              icon: User,
              action: onRetry,
              variant: 'primary' as const,
              description: "Continue creating the learning framework"
            },
            {
              label: "Learn About Process",
              icon: HelpCircle,
              action: onGetHelp,
              variant: 'secondary' as const,
              description: "Understand the design-to-implementation flow"
            }
          ],
          tips: [
            "Design first, implementation follows naturally",
            "Complete framework makes teaching easier",
            "You'll have clear guidance for every phase"
          ]
        };

      case 'content_confusion':
        return {
          icon: Lightbulb,
          title: "Curriculum Integration Approach",
          description: "Excellent educator thinking. You're absolutely right to consider curriculum alignment and content coverage.",
          explanation: `**What we're designing:** A project-based learning experience that naturally integrates your content standards
**How it works:** Students master curriculum content while working on meaningful, authentic challenges
**Your expertise:** You'll see how traditional content fits naturally into this engaging framework

This approach doesn't replace curriculum—it makes curriculum come alive through purposeful application. Students learn content more deeply when it's connected to real challenges.`,
          actions: [
            {
              label: "Continue Design",
              icon: User,
              action: onRetry,
              variant: 'primary' as const,
              description: "Design the engaging approach to your curriculum"
            },
            {
              label: "Learn Integration",
              icon: Lightbulb,
              action: onGetHelp,
              variant: 'secondary' as const,
              description: "Understand how content integrates into projects"
            }
          ],
          tips: [
            "Project-based learning enhances curriculum coverage",
            "Students master content through authentic application",
            "Standards alignment happens naturally through good design"
          ]
        };

      case 'validation':
        return {
          icon: HelpCircle,
          title: "Input Refinement",
          description: error.message || "Your response could use some refinement to help create the best learning experience.",
          explanation: `This happens to all great educators during the design process. Sometimes our initial thoughts need a bit of expansion or clarification to create the most powerful learning experience for students.

Your educational expertise is valuable—let's just refine this response to capture your full vision.`,
          actions: [
            {
              label: "Try Again",
              icon: RefreshCw,
              action: onRetry,
              variant: 'primary' as const,
              description: "Revise your response with more detail"
            },
            {
              label: "Get Examples",
              icon: Lightbulb,
              action: onGetHelp,
              variant: 'secondary' as const,
              description: "See examples to inspire your thinking"
            }
          ],
          tips: [
            "Think about what would engage your specific students",
            "Consider real-world connections they would value",
            "Draw from your teaching experience and insights"
          ]
        };

      case 'network':
        return {
          icon: AlertTriangle,
          title: "Connection Issue",
          description: "We're having trouble with the connection. Your design work is important, so let's get this resolved.",
          explanation: `Don't worry—your progress in designing this learning experience has been saved. Network issues happen, but your educational expertise and design work are preserved.`,
          actions: [
            {
              label: "Retry Connection",
              icon: RefreshCw,
              action: onRetry,
              variant: 'primary' as const,
              description: "Try to reconnect and continue designing"
            }
          ],
          tips: [
            "Check your internet connection",
            "Your design progress has been saved",
            "Refresh the page if the issue persists"
          ]
        };

      default:
        return {
          icon: AlertTriangle,
          title: "Let's Get Back on Track",
          description: "We encountered a small issue, but your design work is valuable and we can continue.",
          explanation: `Your expertise as an educator is creating something meaningful for your students. Let's resolve this quickly and get back to designing their learning experience.`,
          actions: [
            {
              label: "Continue Designing",
              icon: RefreshCw,
              action: onRetry,
              variant: 'primary' as const,
              description: "Resume the curriculum design process"
            },
            {
              label: "Get Support",
              icon: HelpCircle,
              action: onGetHelp,
              variant: 'secondary' as const,
              description: "Get help with the design process"
            }
          ],
          tips: [
            "Your design progress is preserved",
            "We can continue from where you left off",
            "Your educational expertise is guiding this process"
          ]
        };
    }
  };

  const recovery = getRecoveryConfig();
  const Icon = recovery.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 my-4 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-2">
            {recovery.title}
          </h4>
          
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            {recovery.description}
          </p>
          
          {/* Detailed Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {recovery.explanation}
            </div>
          </div>
          
          {/* Recovery Actions */}
          <div className="flex flex-wrap gap-3 mb-4">
            {recovery.actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all transform hover:-translate-y-0.5 ${
                  action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-600'
                }`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>
          
          {/* Professional Guidance Tips */}
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-2">
              Professional Guidance:
            </h5>
            <ul className="space-y-1">
              {recovery.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Stage Context */}
      {currentStage && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Current Design Phase: <span className="font-medium">{currentStage}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default ErrorRecoveryEnhanced;