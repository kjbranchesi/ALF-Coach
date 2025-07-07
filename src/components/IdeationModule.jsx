// src/components/IdeationModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js'; // Assuming a generic chat service for now

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SparkleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg> );


export default function IdeationModule() {
  const { selectedProjectId, navigateTo } = useAppContext();
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const chatEndRef = useRef(null);

  // Listen for real-time updates to the current project
  useEffect(() => {
    if (!selectedProjectId) return;
    const docRef = doc(db, "projects", selectedProjectId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProject(data);
        setMessages(data.ideationChat || []);
      } else {
        console.error("Project not found in IdeationModule!");
        navigateTo('dashboard');
      }
    });
    return () => unsubscribe();
  }, [selectedProjectId, navigateTo]);

  // Scroll to the bottom of the chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const userMessage = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    
    // Update state immediately for a responsive UI
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    // Auto-save the user's message to Firestore
    const docRef = doc(db, "projects", selectedProjectId);
    await updateDoc(docRef, { ideationChat: newMessages });

    // --- This is where the new architecture shines ---
    // In a real implementation, we would now call our orchestrator and service
    // const systemPrompt = buildIdeationPrompt(project, userInput);
    // const response = await geminiService.generateChatResponse(newMessages, systemPrompt);
    // For now, we'll simulate the response.
    
    setTimeout(async () => {
        const aiResponseText = "That's a very interesting starting point! What age group are you designing this for? Knowing the learners helps us frame the challenge appropriately.";
        const aiMessage = { role: 'assistant', content: aiResponseText };
        const finalMessages = [...newMessages, aiMessage];
        
        setMessages(finalMessages);
        await updateDoc(docRef, { ideationChat: finalMessages }); // Auto-save AI response
        setIsLoading(false);
    }, 1500);
  };

  const handleFinalizeIdeation = async () => {
    setIsSaving(true);
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const summarizationPrompt = `Based on the following conversation, extract a concise project title and a 1-2 sentence "core idea".\n\nConversation:\n${conversation}\n\nRespond with ONLY a JSON object in the format: {"title": "...", "coreIdea": "..."}`;
    
    try {
      // Using our new, clean service for the JSON response
      const summaryJson = await generateJsonResponse(summarizationPrompt);
      
      if (summaryJson && !summaryJson.error) {
        const docRef = doc(db, "projects", selectedProjectId);
        await updateDoc(docRef, {
            title: summaryJson.title,
            coreIdea: summaryJson.coreIdea,
            stage: "Curriculum" // Advance the stage
        });
        navigateTo('dashboard'); // Go back to the dashboard after finalizing
      } else {
          throw new Error(summaryJson.error?.message || "Failed to get a valid summary.");
      }
    } catch (error) {
        console.error("Error finalizing ideation:", error);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[90vh] border border-gray-200 animate-fade-in overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
        <button onClick={() => navigateTo('dashboard')} className="text-sm text-purple-600 hover:text-purple-800 font-semibold">
          &larr; Back to Dashboard
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-purple-600">Phase 1: Ideation & Framing</h2>
        </div>
        <div className="w-36"></div>
      </div>
      <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-gray-50/50">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}
              <div className={`max-w-xl p-4 rounded-2xl shadow-sm ${ msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-white'}`} dangerouslySetInnerHTML={{ __html: msg.content ? msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : '' }}></div>
              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}
            </div>
          ))}
          {isLoading && ( <div className="flex items-start gap-3 justify-start"><div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><BotIcon /></div><div className="bg-white p-4 rounded-2xl"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div></div> )}
          <div ref={chatEndRef} />
        </div>
      </div>
      {messages.length > 2 && (
        <div className="p-4 text-center border-t flex-shrink-0">
          <button 
            onClick={handleFinalizeIdeation} 
            disabled={isSaving} 
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mx-auto disabled:bg-gray-400"
          >
            <SparkleIcon />
            {isSaving ? 'Finalizing...' : 'Finalize Ideation'}
          </button>
        </div>
      )}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex items-center bg-gray-100 rounded-xl p-2">
          <input 
            type="text" 
            value={userInput} 
            onChange={(e) => setUserInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
            placeholder={"Share your thoughts..."} 
            className="w-full bg-transparent focus:outline-none px-2" 
            disabled={isLoading || isSaving} 
          />
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || isSaving || !userInput.trim()} 
            className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
