/**
 * App.tsx - Main application component for ALF Coach
 * This is a clean rebuild following the SOP architecture
 */

import React, { useState, useEffect } from 'react';
import { SOPFlowManager } from './core/SOPFlowManager';
import { GeminiService } from './services/GeminiService';
import { ChatInterface } from './components/chat/ChatInterface';
import './styles/app.css';

function App() {
  const [flowManager] = useState(() => new SOPFlowManager());
  const [geminiService] = useState(() => new GeminiService());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize services
    const init = async () => {
      try {
        // Check if we have API key
        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
        if (!apiKey) {
          console.warn('Gemini API key not found. Running in demo mode.');
        }

        // Initialize Gemini service
        await geminiService.initialize();
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setIsReady(true); // Continue anyway for demo
      }
    };

    init();
  }, [geminiService]);

  const handleExportBlueprint = () => {
    const blueprint = flowManager.getBlueprint();
    const jsonStr = JSON.stringify(blueprint, null, 2);
    
    // Create download
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALF-Blueprint-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing ALF Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">ALF Coach</h1>
                <p className="text-sm text-blue-100">Active Learning Framework Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                Help
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <ChatInterface 
          flowManager={flowManager}
          geminiService={geminiService}
          onExportBlueprint={handleExportBlueprint}
        />
      </main>
    </div>
  );
}

export default App;