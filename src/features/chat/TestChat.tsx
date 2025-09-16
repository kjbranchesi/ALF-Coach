import React, { useState } from 'react';
import { SimpleChatInterface } from './ChatInterface';
import { type ChatMessage, type QuickReply } from '../../services/chat-service';

export function TestChat() {
  const [phase, setPhase] = useState<'welcome' | 'step_entry' | 'step_confirm'>('welcome');
  
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the Blueprint Coach! I\'m here to guide you through creating an engaging learning experience.',
      timestamp: new Date()
    }
  ];

  // Different quick replies based on phase
  const getQuickReplies = (): QuickReply[] => {
    switch (phase) {
      case 'welcome':
        return [{
          id: 'start',
          label: "Okay let's begin",
          action: 'start',
          variant: 'primary'
        }];
      
      case 'step_entry':
        return [
          { id: 'ideas', label: 'Ideas', action: 'ideas', icon: 'Lightbulb', variant: 'suggestion' },
          { id: 'whatif', label: 'What-If', action: 'whatif', icon: 'RefreshCw', variant: 'suggestion' },
          { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' }
        ];
      
      case 'step_confirm':
        return [
          { id: 'continue', label: 'Continue', action: 'continue', icon: 'Check', variant: 'primary' },
          { id: 'refine', label: 'Refine', action: 'refine', icon: 'Edit', variant: 'secondary' },
          { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' }
        ];
      
      default:
        return [];
    }
  };

  const handleAction = (action: string) => {
    console.log('Action:', action);
    
    // Simulate phase transitions
    if (action === 'start') {
      setPhase('step_entry');
    } else if (action === 'ideas' || action === 'whatif') {
      setPhase('step_confirm');
    } else if (action === 'continue') {
      setPhase('step_entry');
    } else if (action === 'refine') {
      setPhase('step_entry');
    }
  };

  const progress = {
    current: 3,
    total: 10,
    percentage: 30
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">Test Chat - Phase: {phase}</h2>
        <div className="mt-2 space-x-2">
          <button 
            onClick={() => { setPhase('welcome'); }}
            className="px-3 py-1 bg-primary-500 text-white rounded text-sm"
          >
            Welcome
          </button>
          <button 
            onClick={() => { setPhase('step_entry'); }}
            className="px-3 py-1 bg-primary-500 text-white rounded text-sm"
          >
            Step Entry
          </button>
          <button 
            onClick={() => { setPhase('step_confirm'); }}
            className="px-3 py-1 bg-primary-500 text-white rounded text-sm"
          >
            Step Confirm
          </button>
        </div>
      </div>
      <div className="flex-1">
        <SimpleChatInterface
          messages={messages}
          quickReplies={getQuickReplies()}
          isProcessing={false}
          onAction={handleAction}
          progress={progress}
        />
      </div>
    </div>
  );
}