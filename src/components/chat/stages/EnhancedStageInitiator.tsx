/**
 * EnhancedStageInitiator.tsx - Improved stage questions with contextual examples
 * Provides relevant examples based on captured data and action buttons
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type SOPStage } from '../../../core/types/SOPTypes';
import { textStyles } from '../../../design-system/typography.config';
import { Lightbulb, HelpCircle, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface EnhancedStageInitiatorProps {
  stage: SOPStage;
  currentStep: number;
  onStepComplete: (response: string) => void;
  onActionClick?: (action: 'ideas' | 'help') => void;
  isLoading?: boolean;
  capturedData?: any; // Blueprint data for context
}

// Generate contextual examples based on captured data
const getContextualExamples = (stage: SOPStage, step: number, capturedData: any) => {
  const examples: Record<string, string[]> = {
    'JOURNEY-1': [],
    'JOURNEY-2': [],
    'JOURNEY-3': [],
    'DELIVERABLES-1': [],
    'DELIVERABLES-2': [],
    'DELIVERABLES-3': []
  };

  // Journey Phase examples based on the big idea
  if (stage === 'JOURNEY' && step === 1 && capturedData?.ideation?.bigIdea) {
    const bigIdea = capturedData.ideation.bigIdea.toLowerCase();
    
    if (bigIdea.includes('smart city') || bigIdea.includes('accessibility')) {
      examples['JOURNEY-1'] = [
        "Research & Discovery Phase → Design & Prototype Phase → Testing & Refinement Phase → Implementation & Showcase Phase",
        "Understanding the Problem → Ideating Solutions → Building Prototypes → Community Presentation"
      ];
    } else if (bigIdea.includes('art') || bigIdea.includes('design')) {
      examples['JOURNEY-1'] = [
        "Inspiration & Exploration → Technique Development → Creation Process → Exhibition & Critique",
        "Historical Context → Skill Building → Personal Expression → Public Gallery"
      ];
    } else if (bigIdea.includes('science') || bigIdea.includes('environment')) {
      examples['JOURNEY-1'] = [
        "Question & Hypothesis → Investigation & Data Collection → Analysis & Conclusions → Communication & Action",
        "Problem Identification → Research Methods → Experimentation → Solution Implementation"
      ];
    } else {
      examples['JOURNEY-1'] = [
        "Explore & Discover → Plan & Design → Create & Build → Share & Reflect",
        "Foundation Building → Deep Dive → Application → Presentation"
      ];
    }
  }

  // Journey Activities examples based on essential question
  if (stage === 'JOURNEY' && step === 2 && capturedData?.ideation?.essentialQuestion) {
    const eq = capturedData.ideation.essentialQuestion.toLowerCase();
    
    if (eq.includes('ethical') || eq.includes('moral')) {
      examples['JOURNEY-2'] = [
        "Socratic seminars on ethical dilemmas",
        "Case study analysis with role-playing",
        "Community stakeholder interviews",
        "Design thinking workshops for ethical solutions"
      ];
    } else if (eq.includes('create') || eq.includes('design')) {
      examples['JOURNEY-2'] = [
        "Hands-on prototyping sessions",
        "Peer design reviews and feedback cycles",
        "Expert mentorship meetings",
        "Iterative testing and refinement labs"
      ];
    } else {
      examples['JOURNEY-2'] = [
        "Research and investigation activities",
        "Collaborative problem-solving sessions",
        "Hands-on experiments or creations",
        "Presentation preparation workshops"
      ];
    }
  }

  // Journey Resources based on challenge
  if (stage === 'JOURNEY' && step === 3 && capturedData?.ideation?.challenge) {
    const challenge = capturedData.ideation.challenge.toLowerCase();
    
    if (challenge.includes('digital') || challenge.includes('technology')) {
      examples['JOURNEY-3'] = [
        "Design software (Figma, Canva, or Adobe Creative Suite)",
        "Programming platforms (Scratch, Code.org, or Replit)",
        "Digital collaboration tools (Miro, Padlet, or Google Workspace)",
        "Tech expert guest speakers or mentors"
      ];
    } else if (challenge.includes('community') || challenge.includes('public')) {
      examples['JOURNEY-3'] = [
        "Community partnership connections",
        "Public presentation spaces",
        "Survey and interview tools",
        "Local expert speakers and mentors"
      ];
    } else {
      examples['JOURNEY-3'] = [
        "Subject-specific research materials",
        "Creation tools and supplies",
        "Expert guest speakers",
        "Digital collaboration platforms"
      ];
    }
  }

  // Deliverables Milestones based on journey phases
  if (stage === 'DELIVERABLES' && step === 1 && capturedData?.journey?.phases) {
    const phaseCount = capturedData.journey.phases.length || 3;
    examples['DELIVERABLES-1'] = [
      `Week 1: Project launch and team formation`,
      `Week ${Math.floor(phaseCount/2)}: First prototype or draft completed`,
      `Week ${phaseCount}: Peer review and feedback session`,
      `Week ${phaseCount + 1}: Final presentation to authentic audience`
    ];
  }

  // Deliverables Rubric based on subject
  if (stage === 'DELIVERABLES' && step === 2 && capturedData?.wizard?.subject) {
    const subject = capturedData.wizard.subject.toLowerCase();
    
    if (subject.includes('stem') || subject.includes('science')) {
      examples['DELIVERABLES-2'] = [
        "Scientific Method Application (25%)",
        "Data Analysis & Evidence (25%)",
        "Innovation & Problem-Solving (25%)",
        "Communication & Presentation (25%)"
      ];
    } else if (subject.includes('humanities') || subject.includes('english')) {
      examples['DELIVERABLES-2'] = [
        "Critical Thinking & Analysis (30%)",
        "Research & Evidence (25%)",
        "Writing & Communication (25%)",
        "Creativity & Originality (20%)"
      ];
    } else {
      examples['DELIVERABLES-2'] = [
        "Content Knowledge & Understanding (25%)",
        "Critical Thinking & Problem-Solving (25%)",
        "Collaboration & Communication (25%)",
        "Creativity & Innovation (25%)"
      ];
    }
  }

  // Deliverables Impact based on grade level
  if (stage === 'DELIVERABLES' && step === 3 && capturedData?.wizard?.students) {
    const gradeLevel = capturedData.wizard.students?.gradeLevel || 'middle';
    
    if (gradeLevel.includes('elementary')) {
      examples['DELIVERABLES-3'] = [
        "Parents and families → School showcase night",
        "Other classes → Buddy class presentations",
        "School community → Morning announcement features"
      ];
    } else if (gradeLevel.includes('high')) {
      examples['DELIVERABLES-3'] = [
        "Industry professionals → Career day presentations",
        "Community organizations → Public forum or town hall",
        "Online audience → Social media campaign or website"
      ];
    } else {
      examples['DELIVERABLES-3'] = [
        "School community → Exhibition or fair",
        "Local organizations → Community presentation",
        "Peer classes → Student symposium"
      ];
    }
  }

  return examples[`${stage}-${step}`] || [];
};

// Enhanced stage info with better questions
const ENHANCED_STAGE_INFO = {
  IDEATION: {
    title: "Ideation: Building the Foundation",
    context: "We're establishing the conceptual foundation for your learning experience.",
    questions: [
      {
        prompt: "Let's start with your Big Idea. What's the main concept or theme you want students to explore?",
        helper: "This should connect to real-world contexts and help students see your subject differently.",
        placeholder: "Example: 'How can we use art and technology to make our city more accessible?'"
      },
      {
        prompt: "Now for your Essential Question. What's a thought-provoking question that will guide student inquiry?",
        helper: "This should be open-ended and require deep thinking throughout the project.",
        placeholder: "Example: 'What are the ethical considerations of using art to solve social problems?'"
      },
      {
        prompt: "Finally, your Student Challenge. What's the authentic problem or task students will work on?",
        helper: "This should feel meaningful and connect to their lives while building subject skills.",
        placeholder: "Example: 'Design a series of public art installations that address accessibility issues'"
      }
    ]
  },
  JOURNEY: {
    title: "Learning Journey: Designing the Experience",
    context: "We're mapping out how students will progress through their learning adventure.",
    questions: [
      {
        prompt: "Let's design your Learning Phases. What are the key stages students will move through?",
        helper: "Think about the natural progression from introduction to mastery.",
        placeholder: "Example: 'Research Phase → Design Phase → Create Phase → Share Phase'"
      },
      {
        prompt: "Now for Learning Activities. What specific activities will engage students?",
        helper: "Consider a mix of individual, small group, and whole class experiences.",
        placeholder: "Example: 'Field research, design workshops, peer critiques, expert mentorships'"
      },
      {
        prompt: "Finally, Learning Resources. What materials, tools, and supports will students need?",
        helper: "Think about different learning styles and accessibility needs.",
        placeholder: "Example: 'Design software, art supplies, guest speakers, community partnerships'"
      }
    ]
  },
  DELIVERABLES: {
    title: "Student Deliverables: Defining Success",
    context: "We're determining how students will demonstrate learning and impact.",
    questions: [
      {
        prompt: "Let's identify Key Milestones. What are the major checkpoints for student progress?",
        helper: "These should build toward the final outcome with feedback opportunities.",
        placeholder: "Example: 'Week 2: Research complete, Week 4: First prototype, Week 6: Final presentation'"
      },
      {
        prompt: "Now for Assessment Rubrics. What criteria will define success?",
        helper: "Help both you and students understand what excellence looks like.",
        placeholder: "Example: 'Research Quality (25%), Design Process (25%), Final Product (25%), Reflection (25%)'"
      },
      {
        prompt: "Finally, Authentic Impact. Who is the real audience and how will students share?",
        helper: "This should connect to the world beyond the classroom.",
        placeholder: "Example: 'City council members → Public presentation at town hall meeting'"
      }
    ]
  }
} as const;

export const EnhancedStageInitiator: React.FC<EnhancedStageInitiatorProps> = ({
  stage,
  currentStep,
  onStepComplete,
  onActionClick,
  isLoading,
  capturedData
}) => {
  const [response, setResponse] = useState('');
  const [showExamples, setShowExamples] = useState(false);
  
  // Get current stage and question info
  const stageInfo = ENHANCED_STAGE_INFO[stage as keyof typeof ENHANCED_STAGE_INFO];
  const currentQuestion = stageInfo?.questions[currentStep - 1];
  const contextualExamples = getContextualExamples(stage, currentStep, capturedData);

  const handleSubmit = () => {
    if (response.trim()) {
      onStepComplete(response);
      setResponse('');
      setShowExamples(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="stage-initiator p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
      {/* Stage header */}
      <div className="mb-6">
        <h3 className={`${textStyles.stepTitle} mb-2`}>
          {stageInfo?.title} - Step {currentStep} of 3
        </h3>
        <p className={`${textStyles.stageDescription} mb-4`}>
          {stageInfo?.context}
        </p>
        <div className="flex gap-1">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                step <= currentStep 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question with enhanced prompt */}
      <div className="mb-4">
        <p className={`${textStyles.chatAssistant} font-medium mb-2`}>
          {currentQuestion.prompt}
        </p>
        <p className={`${textStyles.helperText} mb-4`}>
          {currentQuestion.helper}
        </p>
        
        {/* Contextual examples if available */}
        {contextualExamples.length > 0 && (
          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Examples based on your project:
                </p>
                <ul className="space-y-1">
                  {contextualExamples.map((example, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">{example}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Response area */}
      <div className="space-y-3">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={currentQuestion.placeholder}
          disabled={isLoading}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${response.trim() 
              ? 'border-blue-400 dark:border-blue-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:border-blue-500 dark:focus:border-blue-400
            focus:shadow-lg focus:shadow-blue-500/10 dark:focus:shadow-blue-400/10
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
          `}
          rows={4}
        />
        
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {/* Ideas button */}
            <button
              type="button"
              onClick={() => onActionClick?.('ideas')}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors border border-blue-200 dark:border-blue-800 disabled:opacity-50"
              title="Get AI-generated suggestions"
            >
              <Lightbulb className="w-4 h-4" />
              Ideas
            </button>
            
            {/* Help button */}
            <button
              type="button"
              onClick={() => onActionClick?.('help')}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 hover:bg-gray-100 dark:hover:bg-gray-900/30 rounded-xl transition-colors border border-gray-200 dark:border-gray-800 disabled:opacity-50"
              title="Get guidance for this step"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
            
            {/* Examples toggle */}
            {contextualExamples.length > 0 && (
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors border border-purple-200 dark:border-purple-800"
                title="Show examples based on your project"
              >
                <Sparkles className="w-4 h-4" />
                {showExamples ? 'Hide' : 'Show'} Examples
              </button>
            )}
          </div>
          
          {/* Continue button */}
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || isLoading}
            className={`
              inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all
              ${response.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper text */}
      <p className={`mt-4 ${textStyles.helperText} text-center`}>
        Need inspiration? Try the <strong>Ideas</strong> button for suggestions, or <strong>Help</strong> for guidance.
      </p>
    </div>
  );
};

export default EnhancedStageInitiator;