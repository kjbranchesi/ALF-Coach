// src/components/ChatModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { buildIntakePrompt, buildCurriculumPrompt, buildAssignmentPrompt } from '../prompts/orchestrator.js';

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SparkleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg> );

// FIX: New component to render AI suggestions as visually distinct cards.
const SuggestionCard = ({ suggestion, onClick }) => (
    <button
        onClick={() => onClick(suggestion)}
        className="block w-full text-left p-4 my-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all transform hover:scale-[1.02]"
    >
        <p className="font-semibold text-purple-800">{suggestion.split(':')[0]}</p>
        <p className="text-sm text-purple-700">{suggestion.substring(suggestion.indexOf(':') + 1)}</p>
    </button>
);

export default function ChatModule({ project, revisionContext, onRevisionHandled }) {
  const { selectedProjectId, advanceProjectStage } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const stageConfig = {
    Ideation: {
      chatHistoryKey: 'ideationChat',
      promptBuilder: (proj) => buildIntakePrompt(proj),
      nextStage: 'Curriculum',
      isComplete: (proj, lastMessage) => lastMessage?.isStageComplete === true,
    },
    Curriculum: {
      chatHistoryKey: 'curriculumChat',
      promptBuilder: (proj, draft, input) => buildCurriculumPrompt(proj, draft, input),
      nextStage: 'Assignments',
      isComplete: (proj, lastMessage) => lastMessage?.isStageComplete === true,
    },
    Assignments: {
        chatHistoryKey: 'assignmentChat',
        promptBuilder: (proj, _, input) => buildAssignmentPrompt(proj, input),
        nextStage: 'Completed',
        isComplete: (proj, lastMessage) => lastMessage?.isStageComplete === true,
    }
  };

  const currentStageConfig = project.stage !== 'Completed' ? stageConfig[project.stage] : null;

  useEffect(() => {
    if (!project || !currentStageConfig) return;

    if (revisionContext) {
      setMessages(prev => [...prev, { role: 'assistant', content: revisionContext }]);
      onRevisionHandled();
      return;
    }

    const chatHistory = project[currentStageConfig.chatHistoryKey] || [];
    if (messages.length === 0 && chatHistory.length > 0) {
      setMessages(chatHistory);
    } else if (chatHistory.length === 0 && !isAiLoading) {
      startConversation();
    }
  }, [project, currentStageConfig, revisionContext]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isAiLoading && inputRef.current) {
        inputRef.current.focus();
    }
  }, [messages, isAiLoading]);

  const startConversation = async () => {
    if (!project || !currentStageConfig) return;
    setIsAiLoading(true);
    try {
        const systemPrompt = currentStageConfig.promptBuilder(project, '', '');
        const responseJson = await generateJsonResponse([], systemPrompt);

        if (responseJson && !responseJson.error) {
            const aiMessage = { role: 'assistant', content: responseJson.chatResponse, ...responseJson };
            setMessages([aiMessage]);
            await updateDoc(doc(db, "projects", selectedProjectId), {
                [currentStageConfig.chatHistoryKey]: [aiMessage],
                ...(responseJson.curriculumDraft && { curriculumDraft: responseJson.curriculumDraft })
            });
        } else {
            throw new Error(responseJson?.error?.message || "Failed to start conversation.");
        }
    } catch (error) {
        console.error("Error starting conversation:", error);
        setMessages([{ role: 'assistant', content: "A critical error occurred. Please try refreshing." }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => {
    const content = typeof messageContent === 'string' ? messageContent : userInput;
    if (!content.trim() || isAiLoading || !project || !currentStageConfig) return;

    const userMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsAiLoading(true);

    await updateDoc(doc(db, "projects", selectedProjectId), {
        [currentStageConfig.chatHistoryKey]: newMessages
    });

    try {
      const systemPrompt = currentStageConfig.promptBuilder(project, project.curriculumDraft, content);
      const chatHistory = newMessages.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
      const responseJson = await generateJsonResponse(chatHistory, systemPrompt);

      if (!responseJson || responseJson.error) {
        throw new Error(responseJson?.error?.message || "Invalid response from AI.");
      }

      const aiMessage = { role: 'assistant', content: responseJson.chatResponse, ...responseJson };
      setMessages(prev => [...prev, aiMessage]);

      const updates = { [currentStageConfig.chatHistoryKey]: [...newMessages, aiMessage] };
      
      if (responseJson.summary) {
        if(responseJson.summary.title) updates.title = responseJson.summary.title;
        if(responseJson.summary.abstract) updates.abstract = responseJson.summary.abstract;
        if(responseJson.summary.coreIdea) updates.coreIdea = responseJson.summary.coreIdea;
        if(responseJson.summary.challenge) updates.challenge = responseJson.summary.challenge;
      }
      if (responseJson.curriculumDraft) {
        updates.curriculumDraft = responseJson.curriculumDraft;
      }
      if (responseJson.newAssignment) {
        updates.assignments = [...(project.assignments || []), responseJson.newAssignment];
      }
      
      await updateDoc(doc(db, "projects", selectedProjectId), updates);

    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an issue. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    if (currentStageConfig && currentStageConfig.nextStage) {
        const nextStage = currentStageConfig.nextStage;
        await advanceProjectStage(selectedProjectId, nextStage);
        if (nextStage !== 'Completed') {
            setMessages([]);
        }
    }
  };
  
  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop();
  const isStageReadyToAdvance = currentStageConfig?.isComplete(project, lastAiMessage);

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
              <div className={`prose prose-sm max-w-xl p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white prose-invert' : 'bg-white'}`}>
                <div dangerouslySetInnerHTML={{ __html: msg.content ? msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : '' }} />
                {msg.suggestions && (
                    <div className="mt-4">
                        {msg.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} onClick={() => handleSendMessage(s)} />)}
                    </div>
                )}
              </div>
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
        {isStageReadyToAdvance && (
          <div className="pb-4 text-center">
            <button onClick={handleAdvanceStage} disabled={isAiLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mx-auto disabled:bg-gray-400 transition-all transform hover:scale-105">
              <SparkleIcon />
              Proceed to {currentStageConfig.nextStage}
            </button>
          </div>
        )}
        <div className="flex items-center bg-gray-100 rounded-xl p-2">
          <input ref={inputRef} type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Share your thoughts..." className="w-full bg-transparent focus:outline-none px-2" disabled={isAiLoading || isStageReadyToAdvance} />
          <button onClick={() => handleSendMessage(userInput)} disabled={isAiLoading || isStageReadyToAdvance || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300">
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
