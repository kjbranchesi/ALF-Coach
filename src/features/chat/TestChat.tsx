import React from 'react';
import { ChatInterface } from './ChatInterface';
import { ChatMessage, QuickReply } from '../../services/chat-service';

export function TestChat() {
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the Blueprint Coach! I\'m here to guide you through creating an engaging learning experience.',
      timestamp: Date.now()
    }
  ];

  const quickReplies: QuickReply[] = [
    {
      id: 'start',
      label: 'Get Started',
      action: 'start',
      variant: 'primary',
      icon: 'Rocket'
    }
  ];

  const progress = {
    current: 3,
    total: 10,
    percentage: 30
  };

  return (
    <ChatInterface
      messages={messages}
      quickReplies={quickReplies}
      isProcessing={false}
      onAction={(action) => console.log('Action:', action)}
      progress={progress}
    />
  );
}