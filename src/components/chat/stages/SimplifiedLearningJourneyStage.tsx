/**
 * SimplifiedLearningJourneyStage.tsx - Simplified Learning Journey with concrete, teacher-friendly questions
 * 
 * ADDRESSES ORIGINAL PROBLEMS:
 * 1. Replaces abstract "phases" with concrete "How will students progress?"
 * 2. Provides scaffolding with grade-level examples and templates
 * 3. Embeds student agency guidance for different levels
 * 4. Creates cohesive flow connecting progression -> activities -> resources
 * 5. Results in clear, actionable learning journey plan
 * 
 * DESIGN PRINCIPLES:
 * - Uses established EnhancedStageInitiator pattern for consistency
 * - Three concrete questions instead of abstract concepts
 * - Progressive scaffolding with contextual examples
 * - Grade-level appropriate student agency guidance
 * - Cohesive information architecture
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedStageInitiator } from './EnhancedStageInitiator';
import { Lightbulb, HelpCircle, Users, Clock, Target, BookOpen, Users2, Wrench } from 'lucide-react';

interface SimplifiedLearningJourneyStageProps {
  currentStep: number;
  onStepComplete: (response: string) => void;
  onActionClick?: (action: 'ideas' | 'help') => void;
  isLoading?: boolean;
  capturedData?: any;
}

// Grade-level specific scaffolding
const getGradeLevelGuidance = (gradeLevel: string) => {
  const guidance = {
    elementary: {
      timeframe: "2-3 weeks",
      stages: "3 simple stages",
      studentAgency: "Students choose their specific focus and creative expression within teacher-guided steps",
      examples: {
        progression: [
          "Week 1: Explore & Discover → Week 2: Create & Test → Week 3: Share & Celebrate",
          "Learn About It → Make Something → Show Everyone",
          "Investigate → Design → Present"
        ],
        activities: [
          "Hands-on experiments, group investigations, creative projects, show-and-tell presentations",
          "Field trips, guest speakers, art creation, peer sharing circles",
          "Research games, building challenges, classroom exhibitions"
        ],
        resources: [
          "Simple tools (scissors, glue, cardboard), picture books, classroom supplies",
          "Parent volunteers, community helpers, library resources",
          "Art supplies, building materials, presentation space in classroom"
        ]
      }
    },
    middle: {
      timeframe: "3-4 weeks", 
      stages: "4 developmental stages",
      studentAgency: "Students have voice in pacing, method selection, and how they demonstrate learning",
      examples: {
        progression: [
          "Research & Explore → Plan & Design → Create & Refine → Present & Reflect",
          "Investigate the Problem → Brainstorm Solutions → Build Prototypes → Showcase Results",
          "Background Research → Hypothesis Development → Testing & Data → Conclusions & Action"
        ],
        activities: [
          "Research projects, collaborative problem-solving, prototype building, peer feedback sessions",
          "Interviews with experts, design thinking workshops, iterative testing, public presentations",
          "Data collection, analysis workshops, creative communication, reflection journals"
        ],
        resources: [
          "Online research tools, collaborative platforms (Padlet, Flipgrid), basic prototyping materials",
          "Expert guest speakers (virtual or in-person), peer reviewers from other classes",
          "Technology tools (tablets, cameras), presentation spaces, display materials"
        ]
      }
    },
    high: {
      timeframe: "4-6 weeks",
      stages: "4-5 comprehensive stages", 
      studentAgency: "Students design their own learning pathways, choose assessment methods, and drive project direction",
      examples: {
        progression: [
          "Research & Analysis → Strategic Planning → Implementation & Testing → Evaluation & Iteration → Impact & Dissemination",
          "Problem Definition → Solution Design → Prototype Development → Testing & Refinement → Community Implementation",
          "Literature Review → Methodology Development → Data Collection → Analysis & Findings → Publication & Advocacy"
        ],
        activities: [
          "Independent research, stakeholder interviews, professional-level prototyping, conference-style presentations",
          "Community partnerships, internship experiences, peer review processes, public policy proposals",
          "Academic writing, data visualization, media creation, advocacy campaigns"
        ],
        resources: [
          "Professional software, academic databases, laboratory equipment, industry connections",
          "Mentors from relevant fields, community partners, academic institutions",
          "Advanced technology, professional presentation venues, publication platforms"
        ]
      }
    }
  };

  // Default to middle school if grade level not found
  return guidance[gradeLevel as keyof typeof guidance] || guidance.middle;
};

// Enhanced stage configuration for simplified journey
const SIMPLIFIED_JOURNEY_CONFIG = {
  title: "Learning Journey: From Start to Impact",
  context: "Let's map out a clear, manageable path for your students - no educational jargon, just practical steps.",
  questions: [
    {
      id: "progression",
      prompt: "How will students move through this project from start to finish?",
      helper: "Think about the natural flow - what needs to happen first, second, third? Keep it simple and logical.",
      placeholder: "Example: 'Week 1-2: Research the problem → Week 3-4: Design solutions → Week 5: Test and present'",
      icon: Target,
      purpose: "Create a clear timeline and progression that students can understand and follow"
    },
    {
      id: "activities", 
      prompt: "What will students actually DO during each part of the journey?",
      helper: "Be specific about activities - mix individual work, group collaboration, and sharing opportunities.",
      placeholder: "Example: 'Research: interviews with community members, online investigation → Design: brainstorming sessions, prototype building → Present: create posters, present to real audience'",
      icon: Users2,
      purpose: "Define engaging, meaningful activities that build skills and knowledge"
    },
    {
      id: "resources",
      prompt: "What support, tools, and materials will students need to succeed?",
      helper: "Consider different types: physical materials, digital tools, human support, and learning resources.",
      placeholder: "Example: 'Materials: poster board, markers, tablets → People: guest expert, parent volunteers → Tools: survey forms, presentation space'",
      icon: Wrench,
      purpose: "Ensure students have everything they need for success, including accessibility support"
    }
  ]
};

export const SimplifiedLearningJourneyStage: React.FC<SimplifiedLearningJourneyStageProps> = ({
  currentStep,
  onStepComplete,
  onActionClick,
  isLoading,
  capturedData
}) => {
  const [showGuidance, setShowGuidance] = useState(false);
  
  // Get grade level from captured data for scaffolding
  const gradeLevel = capturedData?.wizard?.students?.gradeLevel || 'middle';
  const gradeLevelKey = gradeLevel.toLowerCase().includes('elementary') ? 'elementary' :
                        gradeLevel.toLowerCase().includes('high') ? 'high' : 'middle';
  
  const guidance = getGradeLevelGuidance(gradeLevelKey);
  const currentQuestion = SIMPLIFIED_JOURNEY_CONFIG.questions[currentStep - 1];

  if (!currentQuestion) {
    return null;
  }

  // Enhanced action click handler to provide specific help
  const handleActionClick = (action: 'ideas' | 'help') => {
    if (action === 'help') {
      setShowGuidance(!showGuidance);
    } else {
      onActionClick?.(action);
    }
  };

  return (
    <div className="simplified-journey-stage">
      {/* Custom stage header with clear purpose */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
          <currentQuestion.icon className="w-6 h-6 text-blue-600" />
          {SIMPLIFIED_JOURNEY_CONFIG.title} - Step {currentStep} of 3
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {SIMPLIFIED_JOURNEY_CONFIG.context}
        </p>
        
        {/* Purpose for current step */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
            Step {currentStep} Purpose:
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {currentQuestion.purpose}
          </p>
        </div>
      </div>

      {/* Grade-level specific guidance panel */}
      <AnimatePresence>
        {showGuidance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800"
          >
            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Guidance for {gradeLevelKey.charAt(0).toUpperCase() + gradeLevelKey.slice(1)} Level
            </h4>
            
            <div className="space-y-4">
              {/* Student Agency Guidance */}
              <div>
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-2">
                  <Users2 className="w-4 h-4" />
                  Student Voice & Choice:
                </h5>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {guidance.studentAgency}
                </p>
              </div>

              {/* Time Frame */}
              <div>
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Typical Timeline:
                </h5>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {guidance.timeframe} with {guidance.stages}
                </p>
              </div>

              {/* Examples for current step */}
              <div>
                <h5 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Examples for Step {currentStep}:
                </h5>
                <div className="space-y-1">
                  {guidance.examples[currentQuestion.id as keyof typeof guidance.examples].map((example, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span className="text-sm text-green-600 dark:text-green-400">{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Use the established EnhancedStageInitiator pattern with our simplified questions */}
      <EnhancedStageInitiator
        stage="JOURNEY"
        currentStep={currentStep}
        onStepComplete={onStepComplete}
        onActionClick={handleActionClick}
        isLoading={isLoading}
        capturedData={{
          ...capturedData,
          // Override the journey questions with our simplified approach
          simplifiedJourney: {
            currentQuestion: currentQuestion,
            guidance: guidance,
            gradeLevel: gradeLevelKey
          }
        }}
      />

      {/* Connection indicator showing how this step builds on the last */}
      {currentStep > 1 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {currentStep === 2 && "Your activities will be organized around the progression you just created"}
            {currentStep === 3 && "Your resources will support the specific activities you defined"}
          </p>
        </div>
      )}

      {/* Help reminder with grade-level context */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
          <button 
            onClick={() => setShowGuidance(!showGuidance)}
            className="font-medium underline hover:no-underline"
          >
            Click here for {gradeLevelKey}-level guidance
          </button>
          {" "}or use the <strong>Ideas</strong> button for AI suggestions based on your project.
        </p>
      </div>
    </div>
  );
};

export default SimplifiedLearningJourneyStage;