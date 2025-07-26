// ChatContainer - Connects ChatService to ChatInterface
// Manages the service lifecycle and state updates

import React, { useEffect, useState, useMemo } from 'react';
import { WizardData } from '../wizard/wizardSchema';
import { ChatInterface } from './ChatInterface';
import { createChatService, ChatService, ChatState } from '../../services/chat-service';

interface ChatContainerProps {
  wizardData: WizardData;
  blueprintId: string;
  onComplete: () => void;
}

export function ChatContainer({ wizardData, blueprintId, onComplete }: ChatContainerProps) {
  const [chatState, setChatState] = useState<ChatState | null>(null);
  
  // Create service instance
  const chatService = useMemo(() => {
    const service = createChatService(wizardData, blueprintId);
    
    // Subscribe to state changes
    service.on('stateChange', (newState: ChatState) => {
      setChatState(newState);
      
      // Check if complete
      if (newState.phase === 'complete') {
        setTimeout(() => onComplete(), 2000);
      }
    });
    
    return service;
  }, [wizardData, blueprintId, onComplete]);

  // Initialize
  useEffect(() => {
    setChatState(chatService.getState());
  }, [chatService]);

  // Handle actions from UI
  const handleAction = async (action: string, data?: any) => {
    await chatService.processAction(action, data);
  };

  // Loading state
  if (!chatState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  // Calculate progress
  const progress = {
    current: chatState.completedSteps + 1,
    total: chatState.totalSteps,
    percentage: Math.round((chatState.completedSteps / chatState.totalSteps) * 100)
  };

  return (
    <ChatInterface
      messages={chatState.messages}
      quickReplies={chatService.getQuickReplies()}
      isProcessing={chatState.isProcessing}
      onAction={handleAction}
      progress={progress}
    />
  );
}