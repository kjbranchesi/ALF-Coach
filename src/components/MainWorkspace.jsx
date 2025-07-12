// src/components/MainWorkspace.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { buildIntakePrompt, buildCurriculumPrompt, buildAssignmentPrompt } from '../prompts/orchestrator.js';

import ProgressIndicator from './ProgressIndicator.jsx';
import ChatModule from './ChatModule.jsx';
import SyllabusView from './SyllabusView.jsx';

// --- Icon Components ---
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 animate-spin text-primary-600"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;


export default function MainWorkspace() {
  const { selectedProjectId, navigateTo, advanceProjectStage } = useAppContext();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [prevStage, setPrevStage] = useState(null);

  const stageConfig = useMemo(() => ({
    Ideation: { chatHistoryKey: 'ideationChat', promptBuilder: buildIntakePrompt, nextStage: 'Curriculum' },
    Curriculum: { chatHistoryKey: 'curriculumChat', promptBuilder: buildCurriculumPrompt, nextStage: 'Assignments' },
    Assignments: { chatHistoryKey: 'assignmentChat', promptBuilder: buildAssignmentPrompt, nextStage: 'Completed' }
  }), []);

  const startConversation = useCallback(async (currentProject, config) => {
    if (!currentProject || !config || isAiLoading) return;
    
    setIsAiLoading(true);
    try {
      const systemPrompt = config.promptBuilder(currentProject);
      const responseJson = await generateJsonResponse([], systemPrompt);

      if (responseJson && !responseJson.error) {
        const aiMessage = { role: 'assistant', ...responseJson };
        await updateDoc(doc(db, "projects", currentProject.id), {
          [config.chatHistoryKey]: [aiMessage]
        });
      } else {
        throw new Error(responseJson?.error?.message || "Failed to start conversation.");
      }
    } catch (err) {
      setError(`Error starting conversation: ${err.message}`);
      console.error("Error starting conversation:", err);
    } finally {
      setIsAiLoading(false);
    }
  }, [isAiLoading]);

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
          if (chatHistory.length === 0) {
             startConversation(projectData, currentConfig);
          }
        }
        
        if (projectData.stage !== prevStage) {
            setActiveTab('chat');
            setPrevStage(projectData.stage);
        }

        if (projectData.stage === 'Completed' && activeTab !== 'syllabus') {
          setActiveTab('syllabus');
        }
      } else {
        setError("Could not find the requested Project.");
      }
      setIsLoading(false);
    }, (err) => {
      setError("There was an error loading your project.");
      console.error("Firestore onSnapshot error:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedProjectId, navigateTo, startConversation, stageConfig, prevStage, activeTab]);

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || isAiLoading || !project) return;

    const currentStageConfig = stageConfig[project.stage];
    if (!currentStageConfig) return;

    setIsAiLoading(true);

    const docRef = doc(db, "projects", selectedProjectId);
    const currentHistory = project[currentStageConfig.chatHistoryKey] || [];
    const userMessage = { role: 'user', chatResponse: messageContent };
    const newHistory = [...currentHistory, userMessage];

    try {
      const systemPrompt = currentStageConfig.promptBuilder(project);
      
      const chatHistoryForApi = newHistory.map(msg => ({ 
          role: msg.role === 'assistant' ? 'model' : 'user', 
          parts: [{ text: JSON.stringify(msg) }]
      }));
      
      const responseJson = await generateJsonResponse(chatHistoryForApi, systemPrompt);
      if (!responseJson || responseJson.error) throw new Error(responseJson?.error?.message || "Invalid response from AI.");

      const aiMessage = { role: 'assistant', ...responseJson };
      const finalHistory = [...newHistory, aiMessage];
      
      const updates = {
        [currentStageConfig.chatHistoryKey]: finalHistory
      };
      
      if (responseJson.summary) {
        updates.title = responseJson.summary.title;
        updates.abstract = responseJson.summary.abstract;
        updates.coreIdea = responseJson.summary.coreIdea;
        updates.challenge = responseJson.summary.challenge;
      }
      if (typeof responseJson.curriculumDraft === 'string') {
        updates.curriculumDraft = responseJson.curriculumDraft;
      }
      if (responseJson.newAssignment) {
        updates.assignments = [...(project.assignments || []), responseJson.newAssignment];
      }
      if (responseJson.assessmentMethods) {
        updates.assessmentMethods = responseJson.assessmentMethods;
      }
      
      await updateDoc(docRef, updates);

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      const errorHistory = [...newHistory, { role: 'assistant', chatResponse: "I'm sorry, I encountered an issue. Please try again." }];
      await updateDoc(docRef, { [currentStageConfig.chatHistoryKey]: errorHistory });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAdvance = () => {
    if (!project) return;
    const currentStageConfig = stageConfig[project.stage];
    if (currentStageConfig && currentStageConfig.nextStage) {
        advanceProjectStage(selectedProjectId, currentStageConfig.nextStage);
    }
  };

  const TabButton = ({ tabName, icon, label }) => (
    <button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${ activeTab === tabName ? 'border-primary-600 text-primary-700' : 'border-transparent text-neutral-500 hover:text-primary-600 hover:border-primary-300' }`}>{icon}{label}</button>
  );

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <LoaderIcon />
        <h1 className="text-2xl font-bold text-neutral-700 mt-4">Loading Blueprint...</h1>
        <p className="text-neutral-500">Please wait while we prepare your workspace.</p>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-neutral-500 mt-2 mb-6">{error}</p>
        <button onClick={() => navigateTo('dashboard')} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-full">Back to Dashboard</button>
    </div>
  );
  if (!project) return null;

  const currentStageConfig = stageConfig[project.stage];
  const messages = (currentStageConfig && project[currentStageConfig.chatHistoryKey]) || [];

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-neutral-200 h-full flex flex-col overflow-hidden">
      <header className="p-4 sm:p-6 border-b border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <button onClick={() => navigateTo('dashboard')} className="text-sm text-primary-600 hover:text-primary-800 font-semibold mb-1">&larr; Back to Dashboard</button>
          <h2 className="text-2xl font-bold text-neutral-800 truncate" title={project.title}>{project.title}</h2>
        </div>
        <div className="self-end sm:self-center">
            <ProgressIndicator currentStage={project.stage} />
        </div>
      </header>
      <div className="px-4 sm:px-6 border-b border-neutral-200 bg-neutral-50/50 flex-shrink-0">
        <nav className="flex items-center gap-2">
          <TabButton tabName="chat" icon={<ChatBubbleIcon />} label="AI Coach" />
          <TabButton tabName="syllabus" icon={<FileTextIcon />} label="Syllabus" />
        </nav>
      </div>
      <div className="flex-grow overflow-y-auto bg-neutral-100">
        {activeTab === 'chat' && (
            <ChatModule 
                messages={messages}
                onSendMessage={handleSendMessage}
                onAdvanceStage={handleAdvance}
                isAiLoading={isAiLoading}
                currentStageConfig={currentStageConfig}
            />
        )}
        {activeTab === 'syllabus' && <SyllabusView project={project} onRevise={() => setActiveTab('chat')} />}
      </div>
    </div>
  );
}
