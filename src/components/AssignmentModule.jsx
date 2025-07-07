// src/components/AssignmentModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { buildAssignmentPrompt } from '../prompts/orchestrator.js';

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );


export default function AssignmentModule() {
  const { selectedProjectId, navigateTo } = useAppContext();
  const [project, setProject] = useState(null);
  const [assignments, setAssignments] = useState([]);
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
        setAssignments(data.assignments || []);
        if (messages.length === 0) {
          const initialMsg = { role: 'assistant', content: `Let's create some assignments for **"${data.title}"**. We can create a new assignment, or you can ask me to refine an existing one. What should we work on first?` };
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSaveAssignments = async () => {
    setIsSaving(true);
    const docRef = doc(db, "projects", selectedProjectId);
    try {
      await updateDoc(docRef, {
        assignments: assignments,
        stage: "Assignments"
      });
      console.log("Assignments saved successfully!");
    } catch (error) {
      console.error("Error saving assignments: ", error);
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
    const systemPrompt = buildAssignmentPrompt(project, userInput);
    
    // const response = await geminiService.generateJsonResponse(systemPrompt);
    // if (response && !response.error) {
    //   if (response.chatResponse) setMessages(prev => [...prev, { role: 'assistant', content: response.chatResponse }]);
    //   if (response.newAssignment) setAssignments(prev => [...prev, response.newAssignment]);
    // } else {
    //   setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble with that request." }]);
    // }

    // Simulate the response for now
    setTimeout(() => {
        const simulatedResponse = {
            chatResponse: "Excellent suggestion. I've drafted a new assignment based on your idea and added it to the list. Take a look and let me know if you'd like to refine it.",
            newAssignment: {
                title: `Project Milestone: ${userInput}`,
                description: "This is a detailed description of the new assignment, based on the educator's input and the project's curriculum.",
                rubric: "Exemplary: [Criteria...]\nAccomplished: [Criteria...]\nDeveloping: [Criteria...]"
            }
        };
        setMessages(prev => [...prev, { role: 'assistant', content: simulatedResponse.chatResponse }]);
        setAssignments(prev => [...prev, simulatedResponse.newAssignment]);
        setIsChatLoading(false);
    }, 1500);
  };

  const removeAssignment = (indexToRemove) => {
    setAssignments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  if (isLoading) {
    return <div className="text-center"><h1 className="text-3xl font-bold">Loading Project...</h1></div>;
  }

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      <header className="p-4 border-b flex justify-between items-center">
        <div>
          <button onClick={() => navigateTo('dashboard')} className="text-sm text-purple-600 font-semibold">&larr; Back to Dashboard</button>
          <h2 className="text-2xl font-bold mt-1 text-slate-800">{project?.title}</h2>
        </div>
        <button onClick={handleSaveAssignments} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 disabled:bg-gray-400">
          <SaveIcon />
          {isSaving ? 'Saving...' : 'Save Assignments'}
        </button>
      </header>
      <div className="flex flex-col md:flex-row h-[80vh]">
        {/* Left Side: Chat */}
        <div className="w-full md:w-1/3 flex flex-col bg-white border-r border-gray-200">
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
              <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Create an assignment..." className="w-full bg-transparent focus:outline-none px-2" disabled={isChatLoading} />
              <button onClick={handleSendMessage} disabled={isChatLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300">
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
        {/* Right Side: Assignments List */}
        <div className="w-full md:w-2/3 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-slate-700">Assignments & Rubrics</h3>
          </div>
          <div className="p-4 overflow-y-auto space-y-4">
            {assignments.length === 0 && <p className="text-slate-500 p-4 text-center">Your generated assignments will appear here.</p>}
            {assignments.map((assign, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg text-slate-800">{assign.title}</h4>
                  <button onClick={() => removeAssignment(index)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </div>
                <p className="text-slate-600 mb-3">{assign.description}</p>
                <details className="bg-gray-50 p-2 rounded">
                  <summary className="font-semibold text-sm cursor-pointer">View Rubric</summary>
                  <div className="prose prose-sm mt-2 whitespace-pre-wrap p-2">{assign.rubric}</div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
