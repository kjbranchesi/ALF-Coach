import React, { useState, useEffect } from 'react';
import { ChatV5Emergency } from './ChatV5-emergency';
import { ChatMinimal } from './ChatMinimal';
import { AlertTriangle } from 'lucide-react';

interface ChatFallbackLoaderProps {
  wizardData: any;
  blueprintId: string;
  onComplete: () => void;
}

export function ChatFallbackLoader({ wizardData, blueprintId, onComplete }: ChatFallbackLoaderProps) {
  const [chatVersion, setChatVersion] = useState<'emergency' | 'minimal' | 'error'>('emergency');
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    console.log('🚨 ChatFallbackLoader: Attempting to load chat version:', chatVersion);
  }, [chatVersion]);
  
  // Try emergency version first
  if (chatVersion === 'emergency') {
    try {
      return (
        <div>
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p className="font-medium">Emergency Mode Active</p>
            </div>
            <p className="text-sm mt-1">
              The chat is running in emergency mode with limited features.
            </p>
          </div>
          <ChatV5Emergency 
            wizardData={wizardData}
            blueprintId={blueprintId}
            onComplete={onComplete}
          />
        </div>
      );
    } catch (err) {
      console.error('🚨 Emergency chat failed:', err);
      setError(err as Error);
      setChatVersion('minimal');
    }
  }
  
  // Fallback to minimal version
  if (chatVersion === 'minimal') {
    return <ChatMinimal blueprintId={blueprintId} wizardData={wizardData} />;
  }
  
  // Final error state
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Chat System Failed</h1>
            <p className="text-gray-600 mb-4">
              All chat versions have failed to load.
            </p>
            <div className="bg-red-50 p-4 rounded mb-4">
              <p className="text-sm text-red-800 font-mono">
                {error?.message || 'Unknown error'}
              </p>
            </div>
            <button
              onClick={() => { window.location.reload(); }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}