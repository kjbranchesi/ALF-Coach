/**
 * DebugPanel.tsx - Development helper to show current state
 */

import React from 'react';
import { type SOPFlowState } from '../../core/types/SOPTypes';

interface DebugPanelProps {
  flowState: SOPFlowState;
  isVisible?: boolean;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ flowState, isVisible = true }) => {
  if (!isVisible) {
    return null;
  }

  const allowedActions = flowState.allowedActions || [];
  const messages = flowState.messages || flowState.conversationHistory || [];

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 dark:bg-black/95 text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <h3 className="font-bold mb-2">🔧 Debug Panel</h3>
      <div className="space-y-1">
        <div>Stage: <span className="text-green-400">{flowState.currentStage || 'N/A'}</span></div>
        <div>Step: <span className="text-blue-400">{flowState.currentStep || 'N/A'}</span></div>
        <div>Progress: <span className="text-yellow-400">{flowState.stageStep || 0}/3</span></div>
        <div>Can Advance: <span className={allowedActions.includes('continue') ? 'text-green-400' : 'text-red-400'}>
          {allowedActions.includes('continue') ? 'Yes' : 'No'}
        </span></div>
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div>Messages: {messages.length}</div>
          <div>Allowed Actions: {allowedActions.join(', ') || 'none'}</div>
        </div>
      </div>
    </div>
  );
};