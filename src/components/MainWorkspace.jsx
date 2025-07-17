// src/components/MainWorkspace.jsx - HOLISTIC REPAIR VERSION

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from '../prompts/workflows.js';
import { PROJECT_STAGES } from '../config/constants.js';

import ProgressIndicator from './ProgressIndicator.jsx';
import ChatModule from './ChatModule.jsx';
import SyllabusView from './SyllabusView.jsx';
import CurriculumOutline from './CurriculumOutline.jsx';

// --- Icon Components ---
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 animate-spin text-purple-600"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;

export default function MainWorkspace() {
  const { selectedProjectId, navigateTo, advanceProjectStage } = useAppContext();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  // CRITICAL: This config is the single source of truth for stage logic.
  // The `chatHistoryKey` MUST match the field names in your Firebase documents.
  const stageConfig = useMemo(() => ({
    [PROJECT_STAGES.IDEATION]: { 
      chatHistoryKey: 'ideationChat',
      promptBuilder: getIntakeWorkflow, 
      nextStage: PROJECT_STAGES.CURRICULUM 
    },
    [PROJECT_STAGES.CURRICULUM]: { 
      chatHistoryKey: 'learningJourneyChat',
      promptBuilder: getCurriculumWorkflow, 
      nextStage: PROJECT_STAGES.ASSIGNMENTS 
    },
    [PROJECT_STAGES.ASSIGNMENTS]: { 
      chatHistoryKey: 'studentDeliverablesChat',
      promptBuilder: getAssignmentWorkflow, 
      nextStage: PROJECT_STAGES.COMPLETED 
    }
  }), []);

  // Effect to listen for real-time project updates from Firebase
  useEffect(() => {
    if (!selectedProjectId) {
      navigateTo('dashboard');
      return;
    }

    setIsLoading(true);
    const docRef = doc(db, "projects", selectedProjectId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const projectData = { id: docSnap.id, ...docSnap.data() };
        setProject(projectData);
        
        const currentConfig = stageConfig[projectData.stage];
        if (currentConfig) {
          const chatHistory = projectData[currentConfig.chatHistoryKey] || [];
          
          // Generate the initial message ONLY if the chat history is empty
          if (chatHistory.length === 0 && !isAiLoading) {
            // Set loading state immediately to prevent re-triggers
            setIsAiLoading(true); 
            
            const systemPrompt = currentConfig.promptBuilder(projectData, []);
            generateJsonResponse([], systemPrompt).then(async (responseJson) => {
              if (responseJson && !responseJson.error) {
                const aiMessage = { role: 'assistant', ...responseJson };
                await updateDoc(doc(db, "projects", projectData.id), {
                  [currentConfig.chatHistoryKey]: [aiMessage]
                });
              } else {
                setError("The AI assistant could not be initialized. Please try again.");
                console.error("Error generating initial message:", responseJson?.error);
              }
            }).catch(err => {
              setError(`Error starting conversation: ${err.message}`);
              console.error("Catch block for initial message:", err);
            }).finally(() => {
              setIsAiLoading(false);
            });
          }
        }
        
        if (projectData.stage === PROJECT_STAGES.COMPLETED && activeTab !== 'syllabus') {
          setActiveTab('syllabus');
        }

      } else {
        setError("Could not find the requested project.");
      }
      setIsLoading(false);
    }, (err) => {
      setError("There was an error loading your project.");
      console.error("Firestore onSnapshot error:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedProjectId, navigateTo, stageConfig]); // Removed isAiLoading from deps to prevent loops

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || isAiLoading || !project) return;

    const currentConfig = stageConfig[project.stage];
    if (!currentConfig) return;

    setIsAiLoading(true);
    const docRef = doc(db, "projects", selectedProjectId);
    
    const currentHistory = project[currentConfig.chatHistoryKey] || [];
    const userMessage = { role: 'user', chatResponse: messageContent };
    const newHistory = [...currentHistory, userMessage];

    // Update UI immediately with user's message
    await updateDoc(docRef, { [currentConfig.chatHistoryKey]: newHistory });

    try {
      const systemPrompt = currentConfig.promptBuilder(project, newHistory);
      const chatHistoryForApi = newHistory.slice(-6).map(msg => ({ 
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.chatResponse || JSON.stringify(msg) }]
      }));

      const responseJson = await generateJsonResponse(chatHistoryForApi, systemPrompt);

      const aiMessage = { role: 'assistant', ...responseJson };
      const finalHistory = [...newHistory, aiMessage];

      const updates = { [currentConfig.chatHistoryKey]: finalHistory };

      // If the stage is complete, update the project summary fields
      if (responseJson.isStageComplete && responseJson.summary) {
        Object.keys(responseJson.summary).forEach(key => {
            if (responseJson.summary[key] && !responseJson.summary[key].includes('[')) {
                updates[key] = responseJson.summary[key];
            }
        });
      }
      // Stage-specific data updates
      if (project.stage === PROJECT_STAGES.CURRICULUM && typeof responseJson.curriculumDraft === 'string') {
        updates.curriculumDraft = responseJson.curriculumDraft;
      }
      if (project.stage === PROJECT_STAGES.ASSIGNMENTS && responseJson.newAssignment) {
        updates.assignments = [...(project.assignments || []), responseJson.newAssignment];
      }

      await updateDoc(docRef, updates);

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      const errorHistory = [...newHistory, { role: 'assistant', chatResponse: "I'm sorry, I encountered an error. Could you please try rephrasing your message?" }];
      await updateDoc(docRef, { [currentConfig.chatHistoryKey]: errorHistory });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAdvance = () => {
    if (!project) return;
    const currentConfig = stageConfig[project.stage];
    if (currentConfig?.nextStage) {
        advanceProjectStage(selectedProjectId, currentConfig.nextStage);
    }
  };

  // --- UI Rendering ---

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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <LoaderIcon />
        <h1 className="text-2xl font-bold text-slate-700 mt-4">Loading Blueprint...</h1>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-slate-500 mt-2 mb-6">{error}</p>
        <button onClick={() => navigateTo('dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full">Back to Dashboard</button>
    </div>
  );

  if (!project) return null;

  const currentConfig = stageConfig[project.stage];
  const messages = (currentConfig && project[currentConfig.chatHistoryKey]) || [];

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
      <header className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <button onClick={() => navigateTo('dashboard')} className="text-sm text-purple-600 hover:text-purple-800 font-semibold mb-1">&larr; Back to Dashboard</button>
          <h2 className="text-2xl font-bold text-slate-800 truncate" title={project.title}>{project.title}</h2>
        </div>
        <div className="self-end sm:self-center">
            <ProgressIndicator currentStage={project.stage} />
        </div>
      </header>

      <div className="px-4 sm:px-6 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
        <nav className="flex items-center gap-2">
          <TabButton tabName="chat" icon={<ChatBubbleIcon />} label="AI Coach" />
          <TabButton tabName="syllabus" icon={<FileTextIcon />} label="Syllabus" />
        </nav>
      </div>

      <div className="flex-grow bg-slate-100 overflow-y-hidden">
        {activeTab === 'chat' && (
          <div className={`h-full ${project.stage === PROJECT_STAGES.CURRICULUM ? 'flex gap-4 p-4' : 'flex flex-col'}`}>
            <div className={project.stage === PROJECT_STAGES.CURRICULUM ? 'flex-grow h-full overflow-y-auto' : 'w-full h-full flex-grow'}>
              <ChatModule 
                messages={messages}
                onSendMessage={handleSendMessage}
                onAdvanceStage={handleAdvance}
                isAiLoading={isAiLoading}
                currentStageConfig={currentConfig}
              />
            </div>
            {project.stage === PROJECT_STAGES.CURRICULUM && (
              <div className="w-96 hidden lg:block flex-shrink-0">
                <CurriculumOutline 
                  curriculumDraft={project.curriculumDraft}
                  isVisible={true}
                  projectInfo={{ title: project.title }}
                />
              </div>
            )}
          </div>
        )}
        {activeTab === 'syllabus' && <SyllabusView project={project} onRevise={() => setActiveTab('chat')} />}
      </div>
    </div>
  );
}
