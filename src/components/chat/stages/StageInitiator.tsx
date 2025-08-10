/**
 * StageInitiator.tsx - Handles the initial 3-step process for each stage
 * According to SOP: "Assume role and engage in 3-step process"
 */

import React from 'react';
import { type SOPStage } from '../../../core/types/SOPTypes';
import { textStyles } from '../../../design-system/typography.config';

interface StageInitiatorProps {
  stage: SOPStage;
  currentStep: number;
  onStepComplete: (response: string) => void;
  isLoading?: boolean;
}

// Define stage context and questions
const STAGE_INFO = {
  IDEATION: {
    title: "Ideation: Building the Foundation",
    context: "We're establishing the conceptual foundation for your learning experience. This stage helps identify the 'big idea' that will drive student engagement and meaningful learning.",
    questions: [
      "Let's start with your Big Idea. What's the main concept or theme you want students to explore? This should be something that connects to real-world contexts and helps students see your subject differently.",
      "Now for your Essential Question. What's a thought-provoking question that will guide student inquiry throughout the entire project? This question should be open-ended and require students to think deeply.",
      "Finally, your Student Challenge. What's the authentic problem or task students will work on? This should feel meaningful and connect to their lives while incorporating subject-specific skills."
    ]
  },
  JOURNEY: {
    title: "Learning Journey: Designing the Experience", 
    context: "We're mapping out how students will progress through their learning. This stage focuses on creating engaging activities, meaningful phases, and the resources students need for success.",
    questions: [
      "Let's design your Learning Phases. What are the key stages students will move through in this project? Think about the natural progression from introduction to mastery.",
      "Now for Learning Activities. What specific activities will engage students and help them develop the skills they need? Consider a mix of individual, small group, and whole class experiences.",
      "Finally, Learning Resources. What materials, tools, and supports will students need to succeed? Think about different learning styles and accessibility needs."
    ]
  },
  DELIVERABLES: {
    title: "Student Deliverables: Defining Success",
    context: "We're determining how students will demonstrate their learning and share their work with authentic audiences. This stage ensures clear expectations and meaningful assessment.",
    questions: [
      "Let's identify Key Milestones. What are the major checkpoints where students will show their progress? These should build toward the final outcome and provide opportunities for feedback.",
      "Now for Assessment Rubrics. How will you evaluate student work? What criteria will help both you and your students understand what success looks like?",
      "Finally, Authentic Impact. Who is the real audience for student work, and how will they share it? This should feel meaningful and connect to the world beyond the classroom."
    ]
  }
} as const;

export const StageInitiator: React.FC<StageInitiatorProps> = ({
  stage,
  currentStep,
  onStepComplete,
  isLoading
}) => {
  const [response, setResponse] = React.useState('');
  
  // Get the current stage info
  const stageInfo = STAGE_INFO[stage as keyof typeof STAGE_INFO];
  const currentQuestion = stageInfo?.questions[currentStep - 1];

  const handleSubmit = () => {
    if (response.trim()) {
      onStepComplete(response);
      setResponse('');
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
    <div className="stage-initiator p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
              className={`h-2 flex-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className={textStyles.chatAssistant}>{currentQuestion}</p>
      </div>

      {/* Response area */}
      <div className="space-y-3">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Share your thoughts..."
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={4}
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!response.trim() || isLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>

      {/* Helper text */}
      <p className={`mt-3 ${textStyles.helperText}`}>
        Take your time to think through your response. The AI will help you refine your ideas.
      </p>
    </div>
  );
};