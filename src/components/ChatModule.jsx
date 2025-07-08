// src/components/ChatModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { buildIntakePrompt, buildCurriculumPrompt, buildAssignmentPrompt } from '../prompts/orchestrator.js';
import StageTransitionModal from './StageTransitionModal.jsx';

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SparkleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg> );

/**
 * ChatModule handles all conversational interactions with the AI coach.
 * It dynamically adjusts its behavior based on the project's current stage.
 */
export default function ChatModule({ project }) {
  const { selectedProjectId, navigateTo } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isStageComplete, setIsStageComplete] = useState(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [finalSummary, setFinalSummary] = useState(null);
  const chatEndRef = useRef(null);

  const stageConfig = {
    Ideation: {
      chatHistoryKey: 'ideationChat',
      promptBuilder: (proj) => buildIntakePrompt(proj.ageGroup),
      nextStage: 'Curriculum',
    },
    Curriculum: {
      chatHistoryKey: 'curriculumChat',
      promptBuilder: (proj, draft, input) => buildCurriculumPrompt(proj, draft, input),
      nextStage: 'Assignments',
    },
    Assignments: {
        chatHistoryKey: 'assignmentChat',
        promptBuilder: (proj, _, input) => buildAssignmentPrompt(proj, input),
        nextStage: 'Completed',
    }
  };

  const currentStageConfig = stageConfig[project.stage];

  useEffect(() => {
    const chatHistory = project[currentStageConfig.chatHistoryKey] || [];
    if (messages.length === 0 && chatHistory.length > 0) {
      setMessages(chatHistory);
    } else if (chatHistory.length === 0 && !isAiLoading) {
      // Start the conversation if it hasn't begun
      startConversation();
    }
  }, [project, currentStageConfig]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async () => {
    setIsAiLoading(true);
    const systemPrompt = currentStageConfig.promptBuilder(project, '', '');
    const responseJson = await generateJsonResponse([], systemPrompt);

    if (responseJson && !responseJson.error) {
      const aiMessage = { role: 'assistant', content: responseJson.chatResponse };
      setMessages([aiMessage]);
      await updateDoc(doc(db, "projects", selectedProjectId), {
        [currentStageConfig.chatHistoryKey]: [aiMessage]
      });
    } else {
      const errorMessage = { role: 'assistant', content: "I'm sorry, I had trouble starting our conversation." };
      setMessages([errorMessage]);
    }
    setIsAiLoading(false);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isAiLoading) return;

    const userMessage = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsAiLoading(true);

    // Persist user message immediately
    await updateDoc(doc(db, "projects", selectedProjectId), {
        [currentStageConfig.chatHistoryKey]: newMessages
    });

    try {
      const systemPrompt = currentStageConfig.promptBuilder(project, project.curriculumDraft, userInput);
      const chatHistory = newMessages.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
      const responseJson = await generateJsonResponse(chatHistory, systemPrompt);

      if (!responseJson || responseJson.error) {
        throw new Error(responseJson?.error?.message || "Invalid response from AI.");
      }

      const aiMessage = { role: 'assistant', content: responseJson.chatResponse };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      // Persist AI response and any data changes
      const updates = { [currentStageConfig.chatHistoryKey]: finalMessages };
      if (responseJson.curriculumAppend) {
        updates.curriculumDraft = (project.curriculumDraft || '').trim() + '\n\n' + responseJson.curriculumAppend;
      }
      if (responseJson.newAssignment) {
        updates.assignments = [...(project.assignments || []), responseJson.newAssignment];
      }
      await updateDoc(doc(db, "projects", selectedProjectId), updates);

      if (responseJson.isStageComplete) {
        setIsStageComplete(true);
      }

    } catch (error) {
      console.error("Error calling Gemini API:", error);
      const errorMessage = { role: 'assistant', content: "I'm sorry, I encountered an issue. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalizeStage = async () => {
    if (project.stage === 'Ideation') {
        const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const summarizationPrompt = `Based on the following conversation, extract a concise project title (3-5 words) and a 1-2 sentence "coreIdea".\n\nConversation:\n${conversation}\n\nRespond with ONLY a valid JSON object in the format: {"title": "...", "coreIdea": "..."}`;
        const summaryJson = await generateJsonResponse([], summarizationPrompt);
        setFinalSummary(summaryJson);
        setIsTransitionModalOpen(true);
    } else {
        // For other stages, just move to the next one directly
        await updateDoc(doc(db, "projects", selectedProjectId), { stage: currentStageConfig.nextStage });
    }
  };

  const handleContinueFromModal = async () => {
    if (!finalSummary) return;
    await updateDoc(doc(db, "projects", selectedProjectId), {
        title: finalSummary.title,
        coreIdea: finalSummary.coreIdea,
        stage: currentStageConfig.nextStage
    });
    setIsTransitionModalOpen(false);
  };
  
  return (
    <>
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
              <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white'}`} dangerouslySetInnerHTML={{ __html: msg.content ? msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : '' }}></div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}
            </div>
          ))}
          {isAiLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><BotIcon /></div>
              <div className="bg-white p-4 rounded-2xl"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t bg-white flex-shrink-0">
        {isStageComplete && (
          <div className="pb-4 text-center">
            <button onClick={handleFinalizeStage} disabled={isAiLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mx-auto disabled:bg-gray-400">
              <SparkleIcon />
              Finalize {project.stage}
            </button>
          </div>
        )}
        <div className="flex items-center bg-gray-100 rounded-xl p-2">
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Share your thoughts..." className="w-full bg-transparent focus:outline-none px-2" disabled={isAiLoading} />
          <button onClick={handleSendMessage} disabled={isAiLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
    
    <StageTransitionModal
        isOpen={isTransitionModalOpen}
        onContinue={handleContinueFromModal}
        title="Ideation Complete!"
        summaryContent={
          finalSummary && (
            <div>
              <p className="font-semibold text-slate-800">Your new project has been framed:</p>
              <blockquote className="mt-2 pl-4 border-l-4 border-purple-300">
                <p className="font-bold text-purple-700">{finalSummary.title}</p>
                <p className="text-slate-600">{finalSummary.coreIdea}</p>
              </blockquote>
            </div>
          )
        }
        continueText={`Continue to ${currentStageConfig.nextStage}`}
      />
    </>
  );
}
