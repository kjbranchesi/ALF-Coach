// src/components/MainWorkspace.jsx - BULLETPROOF UI WITH COMPREHENSIVE FALLBACKS

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { PROJECT_STAGES } from '../config/constants.js';
import { debugLog, debugError } from '../utils/environment.js';
import { SOPFlowManager } from '../core/SOPFlowManager.ts';

import ProgressIndicator from './ProgressIndicator.jsx';
import { ChatInterface } from './chat/ChatInterface';
import SyllabusView from './SyllabusView.jsx';
import { GeminiService } from '../services/GeminiService.ts';
import FrameworkCelebration from './FrameworkCelebration.jsx';

// --- Icon Components ---
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 animate-spin text-purple-600"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;


export default function MainWorkspace() {
  const { selectedProjectId, navigateTo, advanceProjectStage, saveIdeation } = useAppContext();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showFrameworkCelebration, setShowFrameworkCelebration] = useState(false);
  
  // Initialize SOPFlowManager
  const [sopFlowManager, setSopFlowManager] = useState(null);
  const [geminiService] = useState(() => new GeminiService());
  const [sopFlowReady, setSopFlowReady] = useState(false);



  // Initialize Gemini service
  useEffect(() => {
    const initGemini = async () => {
      try {
        await geminiService.initialize();
      } catch (err) {
        console.error('Failed to initialize Gemini:', err);
      }
    };
    initGemini();
  }, [geminiService]);

  // Main effect for Firebase listener and initialization
  // Cleanup SOPFlowManager when component unmounts or project changes
  useEffect(() => {
    return () => {
      if (sopFlowManager) {
        sopFlowManager.destroy();
      }
    };
  }, [sopFlowManager]);

  useEffect(() => {
    if (!selectedProjectId) {
      navigateTo('dashboard');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInitializationAttempted(false);
    
    const docRef = doc(db, "projects", selectedProjectId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const projectData = { id: docSnap.id, ...docSnap.data() };
        setProject(projectData);
        
        // Initialize SOPFlowManager with project data
        if (!sopFlowManager && projectData) {
          // Clean up any existing manager first
          if (sopFlowManager) {
            sopFlowManager.destroy();
          }
          
          const newManager = new SOPFlowManager();
          // Try to load existing blueprint if projectId exists
          newManager.loadFromFirebase(projectData.id).then(loaded => {
            if (!loaded) {
              // Initialize with existing project data if available
              const existingBlueprint = projectData.ideation ? {
                ideation: {
                  bigIdea: projectData.ideation?.bigIdea || '',
                  essentialQuestion: projectData.ideation?.essentialQuestion || '',
                  challenge: projectData.ideation?.challenge || ''
                },
                journey: projectData.learningJourney || { phases: [], activities: [], resources: [] },
                deliverables: projectData.studentDeliverables || { milestones: [], rubric: { criteria: [] }, impact: { audience: '', method: '' } }
              } : undefined;
              
              if (existingBlueprint) {
                // TODO: Load existing data into SOPFlowManager
              }
            }
            setSopFlowManager(newManager);
            setSopFlowReady(true);
          }).catch(error => {
            console.error('Failed to load blueprint:', error);
            setSopFlowManager(newManager);
            setSopFlowReady(true);
          });
        }
        
        // Show framework celebration for completed projects
        if (projectData.stage === PROJECT_STAGES.COMPLETED) {
          setShowFrameworkCelebration(true);
        } else {
          setShowFrameworkCelebration(false);
        }

      } else {
        setError("Project not found. It may have been deleted or you may not have access.");
      }
      setIsLoading(false);
    }, (err) => {
      setError("Unable to load project data. Please check your connection and try again.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedProjectId, navigateTo]);



  const handleExportBlueprint = () => {
    if (!sopFlowManager) return;
    
    const blueprint = sopFlowManager.exportBlueprint();
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


  const handleFrameworkCelebrationDownload = () => {
    // TODO: Implement download functionality
    // TODO: Implement download functionality
  };

  const handleFrameworkCelebrationShare = () => {
    // TODO: Implement share functionality  
    // TODO: Implement share functionality
  };

  const handleFrameworkCelebrationStartNew = () => {
    navigateTo('dashboard');
  };

  // --- UI Components ---

  const TabButton = ({ tabName, icon, label }) => (
    <button 
      onClick={() => setActiveTab(tabName)} 
      className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
        activeTab === tabName 
          ? 'border-purple-600 text-purple-700' 
          : 'border-transparent text-slate-500 hover:text-purple-600 hover:border-purple-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  // --- Loading State ---
  if (isLoading) {return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <LoaderIcon />
        <h1 className="text-2xl font-bold text-slate-700 mt-4">Loading Alf...</h1>
        <p className="text-slate-500 mt-2">Preparing your project workspace</p>
    </div>
  );}

  // --- Error State ---
  if (error) {return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Unable to Load Project</h2>
        <p className="text-slate-500 mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => navigateTo('dashboard')} 
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-6 rounded-full transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
    </div>
  );}

  if (!project) {return null;}


  // Show Framework Celebration if needed
  if (showFrameworkCelebration) {
    return (
      <FrameworkCelebration
        projectInfo={{
          subject: project.subject,
          ageGroup: project.ageGroup,
          title: project.title
        }}
        ideationData={project.ideation || {}}
        journeyData={project.learningJourney || {}}
        deliverablesData={project.studentDeliverables || {}}
        onStartNew={handleFrameworkCelebrationStartNew}
        onDownload={handleFrameworkCelebrationDownload}
        onShare={handleFrameworkCelebrationShare}
      />
    );
  }

  // --- Main Render ---

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
      <header className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <button 
            onClick={() => navigateTo('dashboard')} 
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold mb-1 transition-colors"
          >
            &larr; Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-slate-800 truncate" title={project.title}>
            {project.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {project.subject} • {project.ageGroup}
          </p>
        </div>
        <div className="self-end sm:self-center flex-shrink-0">
            <ProgressIndicator currentStage={project.stage} />
        </div>
      </header>

      <div className="px-4 sm:px-6 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
        <nav className="flex items-center gap-2">
          <TabButton tabName="chat" icon={<ChatBubbleIcon />} label="AI Coach" />
          <TabButton tabName="syllabus" icon={<FileTextIcon />} label="Syllabus" />
        </nav>
      </div>

      <div className="flex-grow bg-slate-100 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex gap-4 p-4">
            <div className="flex-grow h-full overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-grow overflow-hidden">
                  {sopFlowManager && sopFlowReady ? (
                    <ChatInterface 
                      flowManager={sopFlowManager}
                      geminiService={geminiService}
                      onExportBlueprint={handleExportBlueprint}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <LoaderIcon />
                        <p className="text-gray-600 mt-4">Initializing ALF Coach...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'syllabus' && (
          <SyllabusView 
            project={project} 
            onRevise={() => setActiveTab('chat')}
          />
        )}
      </div>
    </div>
  );
}