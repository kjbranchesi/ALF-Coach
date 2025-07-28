// Test page for running chat system debug tests

import React from 'react';
import { ChatDebugPanel } from '../components/chat/ChatDebugPanel';

// Sample wizard data for testing
const testWizardData = {
  subject: 'Science',
  ageGroup: 'Middle School (11-14)',
  location: 'San Francisco, CA',
  duration: '4 weeks',
  groupSize: '25-30 students'
};

const testBlueprintId = `test-blueprint-${  Date.now()}`;

export default function TestChatDebug() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Chat System Debug Test</h1>
      <ChatDebugPanel 
        wizardData={testWizardData} 
        blueprintId={testBlueprintId} 
      />
      
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        <pre className="text-sm bg-white p-4 rounded border">
{JSON.stringify(testWizardData, null, 2)}
        </pre>
      </div>
    </div>
  );
}