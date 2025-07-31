/**
 * StageClarifier.tsx - Final stage clarification before moving to next stage
 * According to SOP: "Final alignment before transition"
 */

import React from 'react';
import { SOPStage, QuickReply } from '../../../core/types/SOPTypes';
import { QuickReplyChips } from '../QuickReplyChips';

interface StageClarifierProps {
  stage: SOPStage;
  summary: {
    step1: string;
    step2: string;
    step3: string;
  };
  onAction: (action: string) => void;
  isLoading?: boolean;
}

// Stage transition messages
const STAGE_TRANSITIONS = {
  IDEATION: {
    title: "Great! Let's review your ideation",
    nextStage: "Ready to design the learning journey?",
    prompt: "Based on our conversation, here's what we've developed for your project idea:"
  },
  JOURNEY: {
    title: "Excellent! Your learning journey is taking shape",
    nextStage: "Ready to define the deliverables?",
    prompt: "Here's the learning experience we've designed together:"
  },
  DELIVERABLES: {
    title: "Perfect! Your project plan is complete",
    nextStage: "Ready to generate your final materials?",
    prompt: "Here's the complete project framework we've created:"
  }
} as const;

export const StageClarifier: React.FC<StageClarifierProps> = ({
  stage,
  summary,
  onAction,
  isLoading
}) => {
  const transition = STAGE_TRANSITIONS[stage as keyof typeof STAGE_TRANSITIONS];
  
  const quickReplies: QuickReply[] = [
    { action: 'continue', label: 'Continue to Next Stage' },
    { action: 'refine', label: 'Refine This Stage' },
    { action: 'help', label: 'Get Help' }
  ];

  if (!transition) {
    return null;
  }

  return (
    <div className="stage-clarifier p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{transition.title}</h3>
        <p className="text-gray-700 mt-1">{transition.prompt}</p>
      </div>

      {/* Summary of the 3 steps */}
      <div className="space-y-3 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-1">Step 1: Foundation</h4>
          <p className="text-gray-700">{summary.step1}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-1">Step 2: Development</h4>
          <p className="text-gray-700">{summary.step2}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-1">Step 3: Refinement</h4>
          <p className="text-gray-700">{summary.step3}</p>
        </div>
      </div>

      {/* Next stage prompt */}
      <div className="bg-indigo-100 p-4 rounded-lg mb-4">
        <p className="text-indigo-800 font-medium text-center">
          {transition.nextStage}
        </p>
      </div>

      {/* Action buttons */}
      <QuickReplyChips
        replies={quickReplies}
        onSelect={onAction}
        disabled={isLoading}
      />

      {/* Progress indicator */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {stage === 'IDEATION' && 'Next: Journey Design'}
          {stage === 'JOURNEY' && 'Next: Deliverables Planning'}
          {stage === 'DELIVERABLES' && 'Next: Generate Final Materials'}
        </p>
      </div>
    </div>
  );
};