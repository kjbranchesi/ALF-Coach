import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore';

// --- Firebase Configuration (Secure Version) ---
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');


// --- Helper Components for Icons ---
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SparkleIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg> );
const PlusIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg> );
const HomeIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> );
const SaveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> );


// --- Main App Component ---
export default function App() {
  const [currentView, setCurrentView] = useState('loading'); // loading, dashboard, ideation, curriculum, assignment
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [firebaseInstances, setFirebaseInstances] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase config is missing!");
        return;
    }
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    setFirebaseInstances({ auth, db });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setCurrentView('dashboard'); 
      } else {
        signInAnonymously(auth).catch(error => console.error("Anonymous sign-in failed:", error));
      }
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (view, projectId = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
  };

  const handleCreateNewProject = async () => {
    if (!firebaseInstances || !userId) return;
    try {
      const newProjectRef = await addDoc(collection(firebaseInstances.db, "projects"), {
        userId: userId,
        title: "Untitled Project",
        coreIdea: "A new idea waiting to be explored.",
        stage: "Ideation",
        createdAt: serverTimestamp(),
        curriculumDraft: "",
        assignments: [],
        ideationChat: [{ role: 'assistant', content: "Welcome! Let's start a new project. What's the core idea?" }],
      });
      navigateTo('ideation', newProjectRef.id);
    } catch (error) {
      console.error("Could not create a new project. This is likely a Firestore security rule issue.", error);
    }
  };

  const handleOpenProject = async (projectId) => {
      const docRef = doc(firebaseInstances.db, "projects", projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
          const projectStage = docSnap.data().stage;
          if (projectStage === 'Ideation') {
              navigateTo('ideation', projectId);
          } else if (projectStage === 'Curriculum') {
              navigateTo('curriculum', projectId);
          } else { // 'Assignments' or other stages
              navigateTo('assignment', projectId);
          }
      } else {
          console.error("Project not found!");
      }
  };

  const renderContent = () => {
    if (!firebaseInstances || !userId || currentView === 'loading') {
      return ( <div className="text-center flex items-center justify-center h-screen"><h1 className="text-3xl font-bold text-purple-600">Loading ProjectCraft...</h1></div> );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard db={firebaseInstances.db} userId={userId} onNewProject={handleCreateNewProject} onOpenProject={handleOpenProject} />;
      case 'ideation':
        return <IdeationModule db={firebaseInstances.db} projectId={selectedProjectId} onFinalize={() => navigateTo('dashboard')} onBackToDashboard={() => navigateTo('dashboard')} />;
      case 'curriculum':
        return <CurriculumModule db={firebaseInstances.db} projectId={selectedProjectId} onBackToDashboard={() => navigateTo('dashboard')} />;
      case 'assignment':
        return <AssignmentModule db={firebaseInstances.db} projectId={selectedProjectId} onBackToDashboard={() => navigateTo('dashboard')} />;
      default:
        return <Dashboard db={firebaseInstances.db} userId={userId} onNewProject={handleCreateNewProject} onOpenProject={handleOpenProject} />;
    }
  };

  return (
    <div className="bg-gray-50 font-sans min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}


// --- Dashboard & ProjectCard Components ---
function Dashboard({ db, userId, onNewProject, onOpenProject }) {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        if (!userId) return;
        setIsLoading(true);
        const q = query(collection(db, "projects"), where("userId", "==", userId));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(projectsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, userId]);
    return (
        <div className="animate-fade-in">
            <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
                <div className="flex items-center gap-3"><HomeIcon className="text-purple-600" /><h1 className="text-4xl font-bold text-slate-800">Dashboard</h1></div>
                <button onClick={onNewProject} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all"><PlusIcon />New Project</button>
            </header>
            {isLoading ? ( <p className="text-center text-slate-500">Loading projects...</p> ) : projects.length === 0 ? (
                <div className="text-center bg-white p-12 rounded-2xl border border-gray-200"><h2 className="text-2xl font-semibold text-slate-700">Welcome to ProjectCraft!</h2><p className="mt-2 mb-6 text-slate-500">You don't have any projects yet. Let's create your first one.</p><button onClick={onNewProject} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-all">Start Your First Project</button></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{projects.map(project => ( <ProjectCard key={project.id} project={project} onOpenProject={onOpenProject} /> ))}</div>
            )}
        </div>
    );
}

function ProjectCard({ project, onOpenProject }) {
    const stageColorMap = { Ideation: 'bg-blue-100 text-blue-800', Curriculum: 'bg-yellow-100 text-yellow-800', Assignments: 'bg-green-100 text-green-800' };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-200 flex flex-col justify-between h-full">
            <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{project.title}</h3>
                <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden">{project.coreIdea}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${stageColorMap[project.stage] || 'bg-gray-100'}`}>{project.stage}</span>
                <button onClick={() => onOpenProject(project.id)} className="text-purple-600 hover:text-purple-800 font-semibold text-sm">Open</button>
            </div>
        </div>
    );
}


// --- Ideation Module ---
function IdeationModule({ db, projectId, onFinalize, onBackToDashboard }) {
  const [project, setProject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;
    const docRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setProject(data);
        setMessages(data.ideationChat || []);
      }
    });
    return () => unsubscribe();
  }, [db, projectId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    const userMessage = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);

    const docRef = doc(db, "projects", projectId);
    await updateDoc(docRef, { ideationChat: newMessages });

    try {
        const chatHistory = newMessages.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
        const payload = { contents: chatHistory };
        const apiKey = ""; 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();
        const aiResponseText = result.candidates[0].content.parts[0].text;
        const finalMessages = [...newMessages, { role: 'assistant', content: aiResponseText }];
        setMessages(finalMessages);
        await updateDoc(docRef, { ideationChat: finalMessages });
    } catch (error) {
        console.error("Error calling Gemini API:", error);
    } finally { setIsLoading(false); }
  };

  const handleFinalizeIdeation = async () => {
    setIsSaving(true);
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const summarizationPrompt = `Based on the following conversation, extract a concise project title and a 1-2 sentence "core idea".\n\nConversation:\n${conversation}\n\nRespond with ONLY a JSON object in the format: {"title": "...", "coreIdea": "..."}`;
    try {
        const payload = { contents: [{ role: 'user', parts: [{ text: summarizationPrompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();
        const summaryJson = JSON.parse(result.candidates[0].content.parts[0].text);
        
        const docRef = doc(db, "projects", projectId);
        await updateDoc(docRef, {
            title: summaryJson.title,
            coreIdea: summaryJson.coreIdea,
            stage: "Curriculum"
        });
        onFinalize();
    } catch (error) {
        console.error("Error finalizing ideation:", error);
    } finally { setIsSaving(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl flex flex-col h-[90vh] border border-gray-200 animate-fade-in overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
        <button onClick={onBackToDashboard} className="text-sm text-purple-600 hover:text-purple-800 font-semibold">&larr; Back to Dashboard</button>
        <div className="text-center"><h2 className="text-xl font-bold text-purple-600">Phase 1: Ideation & Framing</h2></div>
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
      {messages.length > 2 && ( <div className="p-4 text-center border-t flex-shrink-0"><button onClick={handleFinalizeIdeation} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mx-auto disabled:bg-gray-400"><SparkleIcon />{isSaving ? 'Finalizing...' : 'Finalize Ideation'}</button></div> )}
      <div className="p-4 border-t bg-white flex-shrink-0">
        <div className="flex items-center bg-gray-100 rounded-xl p-2">
          <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={"Share your thoughts..."} className="w-full bg-transparent focus:outline-none px-2" disabled={isLoading || isSaving} />
          <button onClick={handleSendMessage} disabled={isLoading || isSaving || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300"><SendIcon /></button>
        </div>
      </div>
    </div>
  );
}


// --- Curriculum Module ---
function CurriculumModule({ db, projectId, onBackToDashboard }) {
    const [project, setProject] = useState(null);
    const [curriculumDraft, setCurriculumDraft] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!projectId) return;
        const docRef = doc(db, "projects", projectId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProject(data);
                setCurriculumDraft(data.curriculumDraft || '');
                if (messages.length === 0) {
                    const initialMsg = { role: 'assistant', content: `Okay, let's start building the curriculum for **"${data.title}"**. Based on your core idea, I suggest we start by outlining the main learning modules. Does that sound good?`};
                    setMessages([initialMsg]);
                }
            } else { console.error("Project not found!"); }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, projectId]);
    
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSaveCurriculum = async () => {
        setIsSaving(true);
        const docRef = doc(db, "projects", projectId);
        try {
            await updateDoc(docRef, { curriculumDraft: curriculumDraft, stage: "Curriculum" });
            console.log("Curriculum saved successfully!");
        } catch (error) { console.error("Error saving curriculum: ", error); } finally { setIsSaving(false); }
    };

    const handleSendMessage = async () => {
      if (!userInput.trim() || isChatLoading) return;
      const userMessage = { role: 'user', content: userInput };
      setMessages(prev => [...prev, userMessage]);
      setUserInput('');
      setIsChatLoading(true);

      const systemPrompt = `You are an expert curriculum designer. Project Title: ${project.title}. Core Idea: ${project.coreIdea}. Current Draft: ${curriculumDraft}. User said: "${userInput}". Your response MUST be a JSON object with two keys: "chatResponse" (a friendly reply) and "curriculumAppend" (new markdown text for the draft).`;
      try {
        const payload = { contents: [{ role: 'user', parts: [{ text: systemPrompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API call failed: ${response.status}`);
        const result = await response.json();
        const responseObject = JSON.parse(result.candidates[0].content.parts[0].text);
        if (responseObject.chatResponse) setMessages(prev => [...prev, { role: 'assistant', content: responseObject.chatResponse }]);
        if (responseObject.curriculumAppend) setCurriculumDraft(prev => prev + '\n\n' + responseObject.curriculumAppend);
      } catch (error) {
          console.error("Error processing AI response:", error);
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that." }]);
      } finally { setIsChatLoading(false); }
    };

    if (isLoading) return <div className="text-center"><h1 className="text-3xl font-bold">Loading Project...</h1></div>;

    return (
        <div className="animate-fade-in bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <header className="p-4 border-b flex justify-between items-center">
                <div><button onClick={onBackToDashboard} className="text-sm text-purple-600 font-semibold">&larr; Back to Dashboard</button><h2 className="text-2xl font-bold mt-1">{project?.title}</h2></div>
                <button onClick={handleSaveCurriculum} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 disabled:bg-gray-400"><SaveIcon />{isSaving ? 'Saving...' : 'Save Curriculum'}</button>
            </header>
            <div className="flex flex-col md:flex-row h-[80vh]">
                <div className="w-full md:w-1/2 flex flex-col bg-white border-r">
                    <div className="flex-grow p-4 overflow-y-auto space-y-6">{messages.map((msg, index) => ( <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}<div className={`max-w-md p-3 rounded-2xl shadow-sm ${ msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>{msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}</div> ))}<div ref={chatEndRef} /></div>
                    <div className="p-4 border-t"><div className="flex items-center bg-gray-100 rounded-xl p-2"><input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Discuss next steps..." className="w-full bg-transparent focus:outline-none px-2" disabled={isChatLoading} /><button onClick={handleSendMessage} disabled={isChatLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300"><SendIcon /></button></div></div>
                </div>
                <div className="w-full md:w-1/2 flex flex-col bg-gray-50"><div className="p-4 border-b"><h3 className="font-bold">Curriculum Draft</h3></div><textarea value={curriculumDraft} onChange={(e) => setCurriculumDraft(e.target.value)} className="w-full h-full p-4 bg-white focus:outline-none resize-none"></textarea></div>
            </div>
        </div>
    );
}

// --- Assignment & Rubric Module ---
function AssignmentModule({ db, projectId, onBackToDashboard }) {
    const [project, setProject] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (!projectId) return;
        const docRef = doc(db, "projects", projectId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProject(data);
                setAssignments(data.assignments || []);
                if (messages.length === 0) {
                    const initialMsg = { role: 'assistant', content: `Let's create some assignments for **"${data.title}"**. We can create a new assignment, or you can ask me to refine an existing one. What should we work on first?` };
                    setMessages([initialMsg]);
                }
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [db, projectId]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const handleSaveAssignments = async () => {
        setIsSaving(true);
        const docRef = doc(db, "projects", projectId);
        try {
            await updateDoc(docRef, { assignments: assignments, stage: "Assignments" });
            console.log("Assignments saved successfully!");
        } catch (error) { console.error("Error saving assignments: ", error); } finally { setIsSaving(false); }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || isChatLoading) return;
        const userMessage = { role: 'user', content: userInput };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');
        setIsChatLoading(true);

        const systemPrompt = `You are an expert curriculum designer. Project Title: ${project.title}. Curriculum: ${project.curriculumDraft}. User said: "${userInput}". Your response MUST be a JSON object with two keys: "chatResponse" (a friendly reply) and "newAssignment" (a JSON object for the new assignment: {title, description, rubric}, or null).`;
        try {
            const payload = { contents: [{ role: 'user', parts: [{ text: systemPrompt }] }], generationConfig: { responseMimeType: "application/json" } };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            const result = await response.json();
            const responseObject = JSON.parse(result.candidates[0].content.parts[0].text);
            if (responseObject.chatResponse) setMessages(prev => [...prev, { role: 'assistant', content: responseObject.chatResponse }]);
            if (responseObject.newAssignment) setAssignments(prev => [...prev, responseObject.newAssignment]);
        } catch (error) {
            console.error("Error processing AI response:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble with that request." }]);
        } finally { setIsChatLoading(false); }
    };

    const removeAssignment = (indexToRemove) => {
        setAssignments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    if (isLoading) return <div className="text-center"><h1 className="text-3xl font-bold">Loading Project...</h1></div>;

    return (
        <div className="animate-fade-in bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <header className="p-4 border-b flex justify-between items-center">
                <div><button onClick={onBackToDashboard} className="text-sm text-purple-600 font-semibold">&larr; Back to Dashboard</button><h2 className="text-2xl font-bold mt-1">{project?.title}</h2></div>
                <button onClick={handleSaveAssignments} disabled={isSaving} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-full flex items-center gap-2 disabled:bg-gray-400"><SaveIcon />{isSaving ? 'Saving...' : 'Save Assignments'}</button>
            </header>
            <div className="flex flex-col md:flex-row h-[80vh]">
                <div className="w-full md:w-1/3 flex flex-col bg-white border-r">
                    <div className="flex-grow p-4 overflow-y-auto space-y-6">{messages.map((msg, index) => ( <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>{msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><BotIcon /></div>}<div className={`max-w-md p-3 rounded-2xl shadow-sm ${ msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></div>{msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0"><UserIcon /></div>}</div> ))}<div ref={chatEndRef} /></div>
                    <div className="p-4 border-t"><div className="flex items-center bg-gray-100 rounded-xl p-2"><input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Create an assignment..." className="w-full bg-transparent focus:outline-none px-2" disabled={isChatLoading} /><button onClick={handleSendMessage} disabled={isChatLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300"><SendIcon /></button></div></div>
                </div>
                <div className="w-full md:w-2/3 flex flex-col bg-gray-50">
                    <div className="p-4 border-b"><h3 className="font-bold text-slate-700">Assignments & Rubrics</h3></div>
                    <div className="p-4 overflow-y-auto space-y-4">
                        {assignments.length === 0 && <p className="text-slate-500 p-4 text-center">Your generated assignments will appear here.</p>}
                        {assignments.map((assign, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
                                <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-lg text-slate-800">{assign.title}</h4><button onClick={() => removeAssignment(index)} className="text-red-500 hover:text-red-700"><TrashIcon /></button></div>
                                <p className="text-slate-600 mb-3">{assign.description}</p>
                                <details className="bg-gray-50 p-2 rounded"><summary className="font-semibold text-sm cursor-pointer">View Rubric</summary><div className="prose prose-sm mt-2 whitespace-pre-wrap">{assign.rubric}</div></details>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
