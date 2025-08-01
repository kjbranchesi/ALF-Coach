/**
 * StepPrompt.tsx - Shows AI response and handles user's next action
 * This appears after each step in the 3-step process
 */

import React from 'react';
import { type QuickReply } from '../../../core/types/SOPTypes';
import { QuickReplyChips } from '../QuickReplyChips';

interface StepPromptProps {
  message: string;
  quickReplies: QuickReply[];
  onAction: (action: string) => void;
  isLoading?: boolean;
}

export const StepPrompt: React.FC<StepPromptProps> = ({
  message,
  quickReplies,
  onAction,
  isLoading
}) => {
  return (
    <div className="step-prompt">
      {/* AI's response message */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Quick reply options */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2 text-center">
          What would you like to do next?
        </p>
        <QuickReplyChips
          replies={quickReplies}
          onSelect={onAction}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};