/**
 * NewArchitectureTest.tsx - Wrapper to test the new architecture
 * Accessible at /new route for parallel testing
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SOPFlowManager } from '../core/SOPFlowManager';
import { GeminiService } from '../services/GeminiService.ts';
import { ChatInterface } from './chat/ChatInterface';
import { firebaseService } from '../core/services/FirebaseService';
import '../styles/app.css';

export const NewArchitectureTest: React.FC = () => {
  const { id, projectId } = useParams<{ id?: string; projectId?: string }>();
  const [flowManager, setFlowManager] = useState<SOPFlowManager | null>(null);
  const [geminiService] = useState(() => new GeminiService());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprintId, setBlueprintId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        await geminiService.initialize();
        
        // Check URL params or query string for blueprint ID
        const urlParams = new URLSearchParams(window.location.search);
        const loadBlueprintId = id || projectId || urlParams.get('blueprint');
        
        if (loadBlueprintId && !loadBlueprintId.startsWith('new-')) {
          // Try to load existing blueprint
          const tempManager = new SOPFlowManager();
          const loaded = await tempManager.loadFromFirebase(loadBlueprintId);
          
          if (loaded) {
            setFlowManager(tempManager);
            setBlueprintId(loadBlueprintId);
          } else {
            // Create new if load failed
            const newManager = new SOPFlowManager();
            setFlowManager(newManager);
            setBlueprintId(newManager.getBlueprintId());
          }
        } else {
          // Create new blueprint (including when ID starts with 'new-')
          const newManager = new SOPFlowManager();
          setFlowManager(newManager);
          setBlueprintId(newManager.getBlueprintId());
          
          // Update URL to use real blueprint ID
          if (loadBlueprintId?.startsWith('new-')) {
            window.history.replaceState({}, '', `/app/blueprint/${newManager.getBlueprintId()}`);
          }
        }
        
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError('Failed to initialize services');
        setIsReady(true); // Continue anyway for demo
      }
    };

    init();
  }, [geminiService]);

  const handleExportBlueprint = () => {
    if (!flowManager) return;
    
    const blueprint = flowManager.exportBlueprint();
    const jsonStr = JSON.stringify(blueprint, null, 2);
    
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
  
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/new?blueprint=${blueprintId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  if (!isReady || !flowManager) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing NEW ALF Coach...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <p className="text-sm mt-2">Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* New Architecture Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">ALF Coach (NEW)</h1>
                <p className="text-sm text-indigo-100">Testing New Architecture</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {blueprintId && (
                <button
                  onClick={copyShareLink}
                  className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  title="Copy link to share this blueprint"
                >
                  📋 Share
                </button>
              )}
              <span className="text-xs opacity-70">
                ID: {blueprintId.slice(0, 12)}...
              </span>
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
};