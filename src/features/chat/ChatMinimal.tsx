import React, { useState, useEffect } from 'react';
import { MessageCircle, AlertCircle } from 'lucide-react';

interface MinimalChatProps {
  blueprintId: string;
  wizardData: any;
}

export function ChatMinimal({ blueprintId, wizardData }: MinimalChatProps) {
  const [messages, setMessages] = useState<string[]>([]);
  
  useEffect(() => {
    console.log('🆘 MINIMAL CHAT LOADED - Ultra basic mode');
    setMessages([
      `Welcome to ${wizardData?.subject || 'Learning Design'}!`,
      'This is a minimal chat interface.',
      'The full chat system is currently experiencing issues.',
      'You can still view your journey data below.'
    ]);
  }, [wizardData]);
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h1 className="text-xl font-bold">Minimal Chat Mode</h1>
          </div>
          
          <div className="space-y-3 mb-6">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400 mt-1" />
                <p className="text-gray-700">{msg}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <h2 className="font-semibold mb-2">Blueprint Information:</h2>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(wizardData, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <p className="text-sm text-yellow-800">
              Please refresh the page or contact support if this issue persists.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}