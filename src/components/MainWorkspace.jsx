// src/components/MainWorkspace.jsx

import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';

import ProgressIndicator from './ProgressIndicator.jsx';
import ChatModule from './ChatModule.jsx';
import DraftModule from './DraftModule.jsx';

// --- Icon Components for Tabs ---
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;

export default function MainWorkspace() {
  const { selectedStudioId, navigateTo } = useAppContext();
  const [studio, setStudio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Add an error state
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!selectedStudioId) {
      navigateTo('dashboard');
      return;
    }

    setIsLoading(true);
    setError(null); // Reset error on new ID
    const docRef = doc(db, "projects", selectedStudioId);
    
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setStudio(docSnap.data());
        } else {
          // FIX: Instead of navigating away, set an error message.
          // This prevents the redirect during a temporary data fetch lag.
          console.error("Workspace: Studio Project not found with ID:", selectedStudioId);
          setError("Could not find the requested Studio Project. It may have been deleted.");
        }
        setIsLoading(false);
      },
      (err) => {
        // Handle actual errors from Firestore
        console.error("Firestore error in MainWorkspace:", err);
        setError("There was an error loading your project.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedStudioId, navigateTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <h1 className="text-2xl font-bold text-purple-600 animate-pulse">Loading Studio...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-slate-500 mt-2 mb-6">{error}</p>
        <button 
          onClick={() => navigateTo('dashboard')} 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }
  
  if (!studio) {
    // This state can be reached if loading is done but the studio is still null without an error.
    // It's a fallback to prevent a crash.
    return null;
  }

  const TabButton = ({ tabName, icon, label }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
        activeTab === tabName
          ? 'bg-white text-purple-700 border-b-2 border-purple-700'
          : 'bg-transparent text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
      <header className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
        <div>
          <button onClick={() => navigateTo('dashboard')} className="text-sm text-purple-600 hover:text-purple-800 font-semibold">
            &larr; Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold mt-1 text-slate-800" title={studio.title}>
            {studio.title}
          </h2>
        </div>
        <ProgressIndicator currentStage={studio.stage} />
      </header>
      <div className="px-4 border-b border-gray-200 bg-slate-50 flex-shrink-0">
        <nav className="flex items-center gap-2">
          <TabButton tabName="chat" icon={<ChatBubbleIcon />} label="AI Coach" />
          <TabButton tabName="draft" icon={<FileTextIcon />} label="Studio Draft" />
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto">
        {activeTab === 'chat' && <ChatModule studio={studio} />}
        {activeTab === 'draft' && <DraftModule studio={studio} />}
      </div>
    </div>
  );
}
