/**
 * ChatModuleV2.jsx
 * 
 * Wrapper component that bridges the new ChatbotFirstInterface with existing MainWorkspace
 * This allows gradual migration without breaking existing functionality
 */

import React from 'react';
import { ChatbotFirstInterface } from './chat/ChatbotFirstInterface';

export default function ChatModuleV2({ 
  messages, 
  onSendMessage, 
  onAdvanceStage, 
  isAiLoading, 
  currentStageConfig, 
  projectInfo 
}) {
  // For now, we'll use the new ChatbotFirstInterface
  // Later we can add prop mapping if needed for compatibility
  
  return (
    <ChatbotFirstInterface 
      // Map existing props to new interface as needed
      projectInfo={projectInfo}
      onAdvanceStage={onAdvanceStage}
    />
  );
}