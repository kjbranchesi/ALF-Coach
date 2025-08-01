/**
 * StageInitiator.tsx - Handles the initial 3-step process for each stage
 * According to SOP: "Assume role and engage in 3-step process"
 */

import React from 'react';
import { type SOPStage } from '../../../core/types/SOPTypes';

interface StageInitiatorProps {
  stage: SOPStage;
  currentStep: number;
  onStepComplete: (response: string) => void;
  isLoading?: boolean;
}

// Define the 3-step questions for each stage
const STAGE_QUESTIONS = {
  IDEATION: [
    "Let's start with your catalyst. What's the main challenge or opportunity you want to address? Tell me about the problem you're seeing.",
    "What specific issues or pain points are you noticing? How are these affecting your students or classroom?",
    "What methods or approaches have you considered? What might work well for your context?"
  ],
  JOURNEY: [
    "How do you envision students engaging with this project? What will get them excited?",
    "What learning objectives do you want to achieve? What skills will students develop?",
    "How will you know students are successful? What will they produce or demonstrate?"
  ],
  DELIVERABLES: [
    "What specific products or outcomes will students create? Be as detailed as possible.",
    "How will students share or present their work? Who is the audience?",
    "What resources and timeline do you need? How will you support different learners?"
  ]
} as const;

export const StageInitiator: React.FC<StageInitiatorProps> = ({
  stage,
  currentStep,
  onStepComplete,
  isLoading
}) => {
  const [response, setResponse] = React.useState('');
  
  // Get the current question based on stage and step
  const questions = STAGE_QUESTIONS[stage as keyof typeof STAGE_QUESTIONS];
  const currentQuestion = questions?.[currentStep - 1];

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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {stage} - Step {currentStep} of 3
        </h3>
        <div className="mt-2 flex gap-1">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                step <= currentStep ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentQuestion}</p>
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
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Take your time to think through your response. The AI will help you refine your ideas.
      </p>
    </div>
  );
};