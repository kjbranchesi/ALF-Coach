// Test page to verify chat stability fixes
import React, { useEffect, useState } from 'react';
import { createChatService, type ChatService, type ChatState } from '../services/chat-service';
import { type WizardData } from '../features/wizard/wizardSchema';

export default function TestChatStability() {
  const [chatService, setChatService] = useState<ChatService | null>(null);
  const [chatState, setChatState] = useState<ChatState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create test wizard data
    const testWizardData: WizardData = {
      educatorName: 'Test Teacher',
      subject: 'Science',
      ageGroup: '11-13',
      location: 'Test School',
      experience: 'intermediate',
      techComfort: 'comfortable',
      interests: ['stem', 'creativity']
    };

    try {
      const service = createChatService(testWizardData, 'test-blueprint');
      
      // Subscribe to state changes
      service.on('stateChange', (newState: ChatState) => {
        setChatState(newState);
        console.log('State updated:', {
          phase: newState.phase,
          pendingValue: newState.pendingValue,
          isProcessing: newState.isProcessing,
          messagesCount: newState.messages.length
        });
      });
      
      setChatService(service);
      setChatState(service.getState());
    } catch (err) {
      setError((err as Error).message);
      console.error('Failed to create chat service:', err);
    }
  }, []);

  const handleAction = async (action: string, data?: any) => {
    if (!chatService) {return;}
    
    try {
      await chatService.processAction(action, data);
    } catch (err) {
      console.error('Action failed:', err);
      setError((err as Error).message);
    }
  };

  const getButtonVisibilityInfo = () => {
    if (!chatService || !chatState) {return null;}
    
    const quickReplies = chatService.getQuickReplies();
    
    return {
      phase: chatState.phase,
      pendingValue: chatState.pendingValue,
      isProcessing: chatState.isProcessing,
      buttonCount: quickReplies.length,
      buttons: quickReplies.map(b => ({
        action: b.action,
        label: b.label,
        variant: b.variant
      }))
    };
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600">
        <h2 className="text-lg font-semibold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!chatState) {
    return <div className="p-4">Loading...</div>;
  }

  const visibilityInfo = getButtonVisibilityInfo();

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat Stability Test</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Current State</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Phase: <code className="bg-white px-1 rounded">{chatState.phase}</code></div>
          <div>Stage: <code className="bg-white px-1 rounded">{chatState.stage}</code></div>
          <div>Step Index: <code className="bg-white px-1 rounded">{chatState.stepIndex}</code></div>
          <div>Processing: <code className="bg-white px-1 rounded">{chatState.isProcessing ? 'true' : 'false'}</code></div>
          <div>Pending Value: <code className="bg-white px-1 rounded">{chatState.pendingValue || 'null'}</code></div>
          <div>Messages: <code className="bg-white px-1 rounded">{chatState.messages.length}</code></div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Button Visibility Logic</h2>
        <div className="text-sm">
          <p>Buttons shown: {visibilityInfo?.buttonCount || 0}</p>
          {visibilityInfo?.buttons.map((b, i) => (
            <div key={i} className="ml-4">
              • {b.action} - "{b.label}" ({b.variant})
            </div>
          ))}
          <div className="mt-2 text-xs text-gray-600">
            Rule: {chatState.phase === 'step_confirm' && !chatState.pendingValue ? 
              'No confirm buttons shown because pendingValue is null' : 
              'Buttons based on phase'}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded p-4 mb-4 max-h-96 overflow-y-auto">
        <h2 className="font-semibold mb-2">Messages</h2>
        {chatState.messages.map((msg, i) => (
          <div key={msg.id} className={`mb-2 p-2 rounded ${
            msg.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
          }`}>
            <div className="text-xs text-gray-600">{msg.role}</div>
            <div className="text-sm">{msg.content.substring(0, 100)}...</div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-2">Test Actions</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleAction('start')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={chatState.isProcessing}
          >
            Start
          </button>
          <button 
            onClick={() => handleAction('text', 'Test input text')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={chatState.isProcessing}
          >
            Send Text
          </button>
          <button 
            onClick={() => handleAction('continue')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            disabled={chatState.isProcessing}
          >
            Continue
          </button>
          <button 
            onClick={() => handleAction('refine')}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            disabled={chatState.isProcessing}
          >
            Refine
          </button>
          <button 
            onClick={() => handleAction('ideas')}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            disabled={chatState.isProcessing}
          >
            Ideas
          </button>
        </div>
      </div>
    </div>
  );
}