// src/components/CurriculumModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateChatResponse } from '../services/geminiService.js';
import { buildCurriculumPrompt } from '../prompts/orchestrator.js';

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> );


export default function CurriculumModule() {
  const { selectedProjectId, navigateTo } = useAppContext();
  const [project, setProject] = useState(null);
  const [curriculumDraft, setCurriculumDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  // Listen for real-time updates to the current project
  useEffect(() => {
    if (!selectedProjectId) {
      navigateTo('dashboard');
      return;
    }
    const docRef = doc(db, "projects", selectedProjectId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProject(data);
        setCurriculumDraft(data.curriculumDraft || '');
        if (messages.length === 0) { // Only set initial message once
          const initialMsg = { role: 'assistant', content: `Okay, let's start building the curriculum for **"${data.title}"**. Based on your core idea, I suggest we start by outlining the main learning modules. Does that sound good?` };
          setMessages([initialMsg]);
        }
      } else {
        console.error("Project not found!");
        navigateTo('dashboard');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedProjectId, db, navigateTo]);

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveCurriculum = async () => {
    setIsSaving(true);
    const docRef = doc(db, "projects", selectedProjectId);
    try {
      await updateDoc(docRef, {
        curriculumDraft: curriculumDraft,
        stage: "Curriculum" // Ensure stage is set correctly
      });
      // A more user-friendly notification could be used here instead of alert
      console.log("Curriculum saved successfully!");
    } catch (error) {
      console.error("Error saving curriculum: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isChatLoading) return;
    
    const userMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsChatLoading(true);

    // --- The New Architecture in Action ---
    const systemPrompt = buildCurriculumPrompt(project, curriculumDraft, userInput);
    
    // We need to adapt the geminiService to handle this dual-response format
    // For now, we simulate the expected behavior.
    
    // const response = await geminiService.generateCurriculumResponse(systemPrompt);
    // if(response.chatResponse) setMessages(prev => [...prev, { role: 'assistant', content: response.chatResponse }]);
    // if(response.curriculumAppend) setCurriculumDraft(prev => prev + '\n\n' + response.curriculumAppend);

    setTimeout(() => {
        const simulatedResponse = {
            chatResponse: "That's a great idea for the first module. I've added a basic outline to the draft on the right. How does that look as a starting point?",
            curriculumAppend: `**Module 1: ${userInput}**\n- Lesson 1.1: Introduction to the Core Concepts\n- Lesson 1.2: Key Terminology and History\n- Activity 1.3: Foundational Skill-Building Exercise`
        };

        setMessages(prev => [...prev, { role: 'assistant', content: simulatedResponse.chatResponse }]);
        setCurriculumDraft(prev => prev + '\n\n' + simulatedResponse.curriculumAppend);
        setIsChatLoading(false);
    }, 1500);
  };

  if (isLoading) {
    return <div className="text-center"><h1 className="text-3xl font-bold">Loading Project...</h1></div>;
  }

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <header className="p-4 border-b flex justify-between items-center flex-shrink-0">
        <div>
          <button onClick={() => navigateTo('dashboard')} className="text-sm text-purple-600 hover:text-purple-800 font-semibold">
            &larr; Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold mt-1 text-slate-800">{project?.title}</h2>
        </div>
        <button onClick={handleSaveCurriculum} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 disabled:bg-gray-400">
          <SaveIcon />
          {isSaving ? 'Saving...' : 'Save Curriculum'}
        </button>
      </header>
      <div className="flex flex-col md:flex-row h-[80vh]">
        {/* Left Side: Chat */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border-r border-gray-200">
          <div className="flex-grow p-4 overflow-y-auto space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
                <div className={`max-w-md p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-slate-700'}`} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>
                {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}
              </div>
            ))}
            {isChatLoading && ( <div className="flex items-start gap-3 justify-start"><div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><BotIcon /></div><div className="bg-gray-100 p-4 rounded-2xl"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div> )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center bg-gray-100 rounded-xl p-2">
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Discuss next steps..." className="w-full bg-transparent focus:outline-none px-2" disabled={isChatLoading} />
              <button onClick={handleSendMessage} disabled={isChatLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300">
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
        {/* Right Side: Editor */}
        <div className="w-full md:w-1/2 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-slate-700">Curriculum Draft</h3>
          </div>
          <textarea value={curriculumDraft} onChange={(e) => setCurriculumDraft(e.target.value)} className="w-full h-full p-4 bg-white focus:outline-none resize-none text-slate-800" placeholder="Your curriculum will be generated here..."></textarea>
        </div>
      </div>
    </div>
  );
}
