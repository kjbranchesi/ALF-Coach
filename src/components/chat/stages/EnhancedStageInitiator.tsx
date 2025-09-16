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

// Generate contextual examples based on captured data and grade level
const getContextualExamples = (stage: SOPStage, step: number, capturedData: any) => {
  const examples: Record<string, string[]> = {
    'JOURNEY-1': [],
    'JOURNEY-2': [],
    'JOURNEY-3': [],
    'DELIVERABLES-1': [],
    'DELIVERABLES-2': [],
    'DELIVERABLES-3': []
  };

  // Get grade level for appropriate scaffolding
  const gradeLevel = capturedData?.wizard?.students?.gradeLevel || 'middle';
  const isElementary = gradeLevel.toLowerCase().includes('elementary');
  const isMiddle = gradeLevel.toLowerCase().includes('middle');
  const isHigh = gradeLevel.toLowerCase().includes('high');
  const isUniversity = gradeLevel.toLowerCase().includes('university') || gradeLevel.toLowerCase().includes('college');

  // Journey Progression examples based on grade level and project
  if (stage === 'JOURNEY' && step === 1) {
    if (isElementary) {
      examples['JOURNEY-1'] = [
        "Week 1: Explore the problem together → Weeks 2-3: Create our solutions → Final days: Share with families",
        "Days 1-3: Learn about the topic → Days 4-8: Make our project → Day 9-10: Show what we learned",
        "First: Discover → Next: Build → Last: Celebrate"
      ];
    } else if (isMiddle) {
      examples['JOURNEY-1'] = [
        "Week 1: Investigate the challenge → Week 2: Design solutions → Weeks 3-4: Build and test → Final days: Present to community",
        "Days 1-5: Research phase → Days 6-10: Planning phase → Days 11-15: Creation phase → Days 16-18: Presentation",
        "Understand → Plan → Create → Share (with 2-3 days for each stage)"
      ];
    } else if (isHigh) {
      examples['JOURNEY-1'] = [
        "Weeks 1-2: Deep research and problem analysis → Weeks 3-4: Design and prototype → Week 5: Test with users → Week 6: Refine and present",
        "Phase 1: Investigation (1.5 weeks) → Phase 2: Innovation (2 weeks) → Phase 3: Implementation (1.5 weeks) → Phase 4: Impact (3 days)",
        "Research → Ideate → Prototype → Test → Iterate → Present (flexible timing based on project needs)"
      ];
    } else if (isUniversity) {
      examples['JOURNEY-1'] = [
        "Define your own progression based on project requirements and timeline",
        "Consider: Literature review → Methodology → Implementation → Analysis → Dissemination",
        "Student-driven timeline with instructor checkpoints at key milestones"
      ];
    } else {
      examples['JOURNEY-1'] = [
        "Week 1: Explore → Weeks 2-3: Design → Week 4: Create → Final days: Present",
        "Understanding phase → Development phase → Implementation phase → Sharing phase"
      ];
    }
  }

  // Journey Activities examples based on grade level and progression
  if (stage === 'JOURNEY' && step === 2) {
    const challenge = capturedData?.ideation?.challenge?.toLowerCase() || '';
    
    if (isElementary) {
      examples['JOURNEY-2'] = [
        "Explore: Take a walking field trip, interview a guest expert, watch videos about the topic",
        "Create: Draw designs, build models with blocks/cardboard, make posters",
        "Share: Practice presentations with partners, set up a classroom gallery, present to families",
        "Mix of: Whole class learning → Small group work → Individual creation → Sharing circles"
      ];
    } else if (isMiddle) {
      examples['JOURNEY-2'] = [
        "Investigate: Research online and in books, conduct surveys, interview community members",
        "Design: Brainstorm in groups, sketch solutions, create digital designs, get peer feedback",
        "Build: Construct prototypes, test with users, document process, refine based on feedback",
        "Present: Create presentation slides, practice public speaking, present to authentic audience"
      ];
    } else if (isHigh) {
      examples['JOURNEY-2'] = [
        "Research: Literature review, expert interviews, data collection, competitive analysis",
        "Design: Design thinking workshops, CAD modeling, user journey mapping, feasibility studies",
        "Prototype: Build working models, conduct user testing, iterate based on feedback, document process",
        "Present: Professional presentations, create marketing materials, pitch to stakeholders"
      ];
    } else if (isUniversity) {
      examples['JOURNEY-2'] = [
        "Self-directed research with periodic check-ins",
        "Student-designed methodology and implementation",
        "Peer review and collaborative critique sessions",
        "Professional conference-style presentations"
      ];
    } else {
      examples['JOURNEY-2'] = [
        "Research activities appropriate for your grade level",
        "Creative and design activities",
        "Building and testing activities",
        "Presentation and reflection activities"
      ];
    }
  }

  // Journey Resources based on grade level and activities
  if (stage === 'JOURNEY' && step === 3) {
    if (isElementary) {
      examples['JOURNEY-3'] = [
        "Materials: Construction paper, markers, glue, basic building materials (blocks, cardboard)",
        "Technology: Tablets for research, kid-friendly websites, simple presentation tools",
        "People: Parent volunteers, local community helpers, older student buddies",
        "Learning aids: Picture books, videos, graphic organizers, sentence starters"
      ];
    } else if (isMiddle) {
      examples['JOURNEY-3'] = [
        "Materials: Poster boards, art supplies, basic construction materials, science equipment",
        "Technology: Chromebooks/laptops, Google Workspace, Canva, simple coding tools",
        "People: Subject experts, community partners, peer mentors, parent volunteers",
        "Learning resources: Research databases, how-to guides, rubrics, exemplars"
      ];
    } else if (isHigh) {
      examples['JOURNEY-3'] = [
        "Materials: Professional-grade supplies, prototyping materials, lab equipment",
        "Technology: Design software, coding platforms, 3D printers, professional tools",
        "People: Industry professionals, university professors, community stakeholders",
        "Resources: Academic journals, professional standards, industry examples"
      ];
    } else if (isUniversity) {
      examples['JOURNEY-3'] = [
        "Define your own resource needs based on project scope",
        "Consider: Research access, professional software, industry connections",
        "Budget considerations and resource allocation",
        "Partnership opportunities with organizations"
      ];
    } else {
      examples['JOURNEY-3'] = [
        "Materials and supplies for creating",
        "Technology tools for research and creation",
        "Human resources and expertise",
        "Learning materials and references"
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
    title: "Learning Journey: From Start to Impact",
    context: "Let's map out a clear, manageable path for your students - no educational jargon, just practical steps.",
    questions: [
      {
        prompt: "How will students move through this project from start to finish?",
        helper: "Think about the natural flow - what needs to happen first, second, third? Keep it simple and logical.",
        placeholder: "Example: 'Week 1-2: Research the problem → Week 3-4: Design solutions → Week 5: Test and present'"
      },
      {
        prompt: "What will students actually DO during each part of the journey?",
        helper: "Be specific about activities - mix individual work, group collaboration, and sharing opportunities.",
        placeholder: "Example: 'Research: interviews with community members, online investigation → Design: brainstorming sessions, prototype building → Present: create posters, present to real audience'"
      },
      {
        prompt: "What support, tools, and materials will students need to succeed?",
        helper: "Consider different types: physical materials, digital tools, human support, and learning resources.",
        placeholder: "Example: 'Materials: poster board, markers, tablets → People: guest expert, parent volunteers → Tools: survey forms, presentation space'"
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
                  ? 'bg-gradient-to-r from-primary-500 to-indigo-600' 
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
                className="mb-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-blue-800"
              >
                <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Examples based on your project:
                </p>
                <ul className="space-y-1">
                  {contextualExamples.map((example, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1">•</span>
                      <span className="text-sm text-primary-600 dark:text-primary-400">{example}</span>
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
            w-full px-6 py-4 rounded-3xl border-2 transition-all duration-200
            ${response.trim() 
              ? 'border-primary-400 dark:border-primary-500 shadow-lg shadow-blue-500/20' 
              : 'border-gray-300 dark:border-gray-600'
            }
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:border-primary-500 dark:focus:border-primary-400
            focus:shadow-xl focus:shadow-blue-500/20 dark:focus:shadow-blue-400/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
          `}
          rows={3}
        />
        
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {/* Ideas button */}
            <button
              type="button"
              onClick={() => onActionClick?.('ideas')}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-xl transition-colors border border-primary-200 dark:border-blue-800 disabled:opacity-50"
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
                ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white hover:from-primary-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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