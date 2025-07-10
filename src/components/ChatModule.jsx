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

// --- Dynamic UI Sub-Components for Chat ---

const SuggestionCard = ({ suggestion, onClick, disabled }) => {
    const title = suggestion.includes(':') ? suggestion.split(':')[0] : suggestion;
    const description = suggestion.includes(':') ? suggestion.substring(suggestion.indexOf(':') + 1) : '';
    
    return (
        <button
            onClick={() => onClick(suggestion)}
            disabled={disabled}
            className="block w-full text-left p-4 my-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <p className="font-semibold text-purple-800">{title}</p>
            {description && <p className="text-sm text-purple-700 mt-1">{description.trim()}</p>}
        </button>
    );
};

const ProcessSteps = ({ processData }) => (
    <div className="mt-4 space-y-1 bg-white p-4 rounded-lg border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-3">{processData.title}</h3>
        {processData.steps.map((step, index) => (
            <div key={index} className="relative pl-12 py-2">
                <div className="absolute left-3.5 top-3.5 h-full border-l-2 border-purple-200"></div>
                <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-4 border-white">{index + 1}</div>
                <h4 className="font-bold text-slate-800">{step.title}</h4>
                <p className="text-slate-600 text-sm">{step.description}</p>
            </div>
        ))}
    </div>
);

const RecapMessage = ({ recap }) => (
    <div className="mt-4 border-t-2 border-purple-200 pt-4">
        <h3 className="font-bold text-sm text-purple-800 uppercase tracking-wider">{recap.title}</h3>
        <p className="text-slate-600 italic">{recap.content}</p>
    </div>
);


export default function ChatModule({ project, revisionContext, onRevisionHandled }) {
  const { selectedProjectId, advanceProjectStage } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null); // FIX: Changed from inputRef to textareaRef

  const stageConfig = {
    Ideation: {
      chatHistoryKey: 'ideationChat',
      promptBuilder: (proj) => buildIntakePrompt(proj),
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

  const currentStageConfig = project.stage !== 'Completed' ? stageConfig[project.stage] : null;

  useEffect(() => {
    if (!project || !currentStageConfig) return;

    if (revisionContext) {
      const { stage, project: revisedProject } = revisionContext;
      let recapMessage = `Okay, let's revisit the **${stage}** stage.`;
      if (stage === 'Curriculum') {
        recapMessage += `\n\n*Previously, we established the project's core idea: **${revisedProject.coreIdea}**.*`;
      } else if (stage === 'Assignments') {
         recapMessage += `\n\n*Previously, we designed the learning journey. Now we're ready to create the specific assignments.*`;
      }
      setMessages([{ role: 'assistant', chatResponse: recapMessage }]);
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
    if (!isAiLoading && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [messages, isAiLoading]);

  // FIX: Add useEffect to auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [userInput]);

  const startConversation = async () => {
    if (!project || !currentStageConfig) return;
    setIsAiLoading(true);
    try {
        const systemPrompt = currentStageConfig.promptBuilder(project, '', '');
        const responseJson = await generateJsonResponse([], systemPrompt);

        if (responseJson && !responseJson.error) {
            const aiMessage = { role: 'assistant', ...responseJson };
            setMessages([aiMessage]);
            await updateDoc(doc(db, "projects", selectedProjectId), {
                [currentStageConfig.chatHistoryKey]: [aiMessage]
            });
        } else {
            throw new Error(responseJson?.error?.message || "Failed to start conversation.");
        }
    } catch (error) {
        console.error("Error starting conversation:", error);
        setMessages([{ role: 'assistant', chatResponse: "A critical error occurred. Please try refreshing." }]);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (messageContent) => {
    const content = typeof messageContent === 'string' ? messageContent : userInput;
    if (!content.trim() || isAiLoading || !project || !currentStageConfig) return;

    const userMessage = { role: 'user', chatResponse: content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsAiLoading(true);

    await updateDoc(doc(db, "projects", selectedProjectId), {
        [currentStageConfig.chatHistoryKey]: newMessages
    });

    try {
      const systemPrompt = currentStageConfig.promptBuilder(project, project.curriculumDraft, content);
      // FIX: Defensive mapping to prevent errors if chatResponse is missing.
      const chatHistory = newMessages.map(msg => ({ 
          role: msg.role === 'assistant' ? 'model' : 'user', 
          parts: [{ text: msg.chatResponse || '' }] 
      }));
      
      const responseJson = await generateJsonResponse(chatHistory, systemPrompt);

      if (!responseJson || responseJson.error) {
        throw new Error(responseJson?.error?.message || "Invalid response from AI.");
      }

      const aiMessage = { role: 'assistant', ...responseJson };
      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      const updates = { [currentStageConfig.chatHistoryKey]: finalMessages };
      
      if (responseJson.summary) {
        updates.title = responseJson.summary.title;
        updates.abstract = responseJson.summary.abstract;
        updates.coreIdea = responseJson.summary.coreIdea;
        updates.challenge = responseJson.summary.challenge;
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
      setMessages(prev => [...prev, { role: 'assistant', chatResponse: "I'm sorry, I encountered an issue. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    if (currentStageConfig && currentStageConfig.nextStage) {
        const nextStage = currentStageConfig.nextStage;
        await advanceProjectStage(selectedProjectId, nextStage);
        if (nextStage !== 'Completed') {
            setMessages([]); // Clear messages for the new stage
        }
    }
  };
  
  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop();
  const isStageReadyToAdvance = lastAiMessage?.isStageComplete === true;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
              
              <div className={`prose prose-sm max-w-xl p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white prose-invert' : 'bg-white'}`}>
                <div dangerouslySetInnerHTML={{ __html: msg.chatResponse ? msg.chatResponse.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : '' }} />
                {msg.recap && <RecapMessage recap={msg.recap} />}
                {msg.suggestions && (
                    <div className="mt-4 not-prose">
                        {msg.suggestions.map((s, i) => <SuggestionCard key={i} suggestion={s} onClick={handleSendMessage} disabled={isAiLoading} />)}
                    </div>
                )}
                 {msg.process && (
                    <div className="mt-4 not-prose">
                        <ProcessSteps processData={msg.process} />
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
        {isStageReadyToAdvance ? (
          <div className="pb-4 text-center">
            <button onClick={handleAdvanceStage} disabled={isAiLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mx-auto disabled:bg-gray-400 transition-all transform hover:scale-105">
              <SparkleIcon />
              Proceed to {currentStageConfig.nextStage}
            </button>
          </div>
        ) : (
          <div className="flex items-center bg-gray-100 rounded-xl p-2">
            {/* FIX: Changed input to textarea for wrapping and auto-sizing */}
            <textarea
              ref={textareaRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(userInput);
                }
              }}
              placeholder="Share your thoughts..."
              className="w-full bg-transparent focus:outline-none px-2 resize-none overflow-y-hidden leading-tight"
              rows="1"
              style={{maxHeight: '100px'}}
              disabled={isAiLoading}
            />
            <button onClick={() => handleSendMessage(userInput)} disabled={isAiLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300 self-end">
              <SendIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
