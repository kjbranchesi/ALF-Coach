// src/components/MainWorkspace.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { buildIntakePrompt, buildCurriculumPrompt, buildAssignmentPrompt } from '../prompts/orchestrator.js';
import { PROJECT_STAGES } from '../config/constants.js';

import ProgressIndicator from './ProgressIndicator.jsx';
import ChatModule from './ChatModule.jsx';
import SyllabusView from './SyllabusView.jsx';
import { Button } from './ui/Button.jsx';
import { ArrowLeft, MessageSquare, BookCopy, Loader } from 'lucide-react';

// The main workspace where users interact with the AI coach and view the syllabus.
// This component now implements the split-view layout described in the redesign plan.

export default function MainWorkspace() {
  const { selectedProjectId, navigateTo, advanceProjectStage } = useAppContext();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');

  const stageConfig = useMemo(() => ({
    [PROJECT_STAGES.IDEATION]: { chatHistoryKey: 'ideationChat', promptBuilder: buildIntakePrompt, nextStage: PROJECT_STAGES.CURRICULUM },
    [PROJECT_STAGES.CURRICULUM]: { chatHistoryKey: 'curriculumChat', promptBuilder: buildCurriculumPrompt, nextStage: PROJECT_STAGES.ASSIGNMENTS },
    [PROJECT_STAGES.ASSIGNMENTS]: { chatHistoryKey: 'assignmentChat', promptBuilder: buildAssignmentPrompt, nextStage: PROJECT_STAGES.COMPLETED }
  }), []);

  // Effect to fetch and listen to project data
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
        // If project is completed, default to syllabus view
        if (projectData.stage === PROJECT_STAGES.COMPLETED) {
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
  }, [selectedProjectId, navigateTo]);

  // Function to handle sending a message to the AI
  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || isAiLoading || !project) return;
    const currentStageConfig = stageConfig[project.stage];
    if (!currentStageConfig) return;
    setIsAiLoading(true);

    const docRef = doc(db, "projects", selectedProjectId);
    const currentHistory = project[currentStageConfig.chatHistoryKey] || [];
    const userMessage = { role: 'user', chatResponse: messageContent };
    const newHistory = [...currentHistory, userMessage];
    
    // Optimistically update the UI with the user's message
    await updateDoc(docRef, { [currentStageConfig.chatHistoryKey]: newHistory });

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
      
      const updates = { [currentStageConfig.chatHistoryKey]: finalHistory };
      
      // Update project fields based on AI response
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
    if (currentStageConfig?.nextStage) {
        advanceProjectStage(selectedProjectId, currentStageConfig.nextStage);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader className="w-12 h-12 animate-spin text-primary-600" />
        <h1 className="text-2xl font-bold text-neutral-700 mt-4">Loading Workspace...</h1>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
        <p className="text-neutral-500 mt-2 mb-6">{error}</p>
        <Button onClick={() => navigateTo('dashboard')}>Back to Dashboard</Button>
    </div>
  );
  if (!project) return null;

  const currentStageConfig = stageConfig[project.stage];
  const messages = (currentStageConfig && project[currentStageConfig.chatHistoryKey]) || [];

  return (
    <div className="h-full flex flex-col">
        {/* Workspace Header */}
        <header className="flex-shrink-0 mb-6">
            <Button variant="ghost" onClick={() => navigateTo('dashboard')} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-neutral-800 truncate" title={project.title}>
                    {project.title}
                </h2>
                <ProgressIndicator currentStage={project.stage} />
            </div>
        </header>
        
        {/* Main Content Area - Split View */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 lg:gap-8 min-h-0">
            {/* Left Column: Syllabus View (or main content on smaller screens) */}
            <div className={activeTab === 'syllabus' ? 'block' : 'hidden lg:block'}>
                <SyllabusView project={project} onRevise={() => setActiveTab('chat')} />
            </div>

            {/* Right Column: Chat Module (or main content on smaller screens) */}
            <div className={activeTab === 'chat' ? 'block' : 'hidden lg:block'}>
                <ChatModule 
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onAdvanceStage={handleAdvance}
                    isAiLoading={isAiLoading}
                    currentStageConfig={currentStageConfig}
                />
            </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around">
            <Button variant={activeTab === 'syllabus' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('syllabus')}>
                <BookCopy className="mr-2 h-4 w-4" />
                Syllabus
            </Button>
            <Button variant={active-tab === 'chat' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('chat')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                AI Coach
            </Button>
        </div>
    </div>
  );
}
