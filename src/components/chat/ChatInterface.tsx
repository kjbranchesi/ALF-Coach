/**
 * DEPRECATED - This is a stub file for backward compatibility
 * The actual interface is ChatbotFirstInterface
 * This file prevents import errors in legacy/disabled code
 */

import React from 'react';

interface ChatInterfaceProps {
  flowManager?: any;
  geminiService?: any;
  onExportBlueprint?: any;
  onUpdateBlueprint?: any;
}

// Stub component that just shows a message
export const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Legacy Interface Disabled
        </h1>
        <p className="text-gray-600">
          This component has been replaced with ChatbotFirstInterface.
        </p>
        <p className="text-sm text-gray-500 mt-4">
          If you're seeing this, please check your route configuration.
        </p>
      </div>
    </div>
  );
};

// For backward compatibility with SimpleChatInterface imports
export const SimpleChatInterface = ChatInterface;