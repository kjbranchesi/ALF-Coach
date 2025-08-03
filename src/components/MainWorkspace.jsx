// src/components/MainWorkspace.jsx - BULLETPROOF UI WITH COMPREHENSIVE FALLBACKS

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import { useAppContext } from '../context/AppContext.jsx';
import { generateJsonResponse } from '../services/geminiService.js';
import { getIntakeWorkflow, getCurriculumWorkflow, getAssignmentWorkflow } from '../prompts/workflows.js';
import { PROJECT_STAGES } from '../config/constants.js';
import { debugLog, debugError } from '../utils/environment.js';
import { SOPFlowManager } from '../core/SOPFlowManager.ts';

import ProgressIndicator from './ProgressIndicator.jsx';
import ChatModule from './ChatModule.jsx';
import SyllabusView from './SyllabusView.jsx';
import CurriculumOutline from './CurriculumOutline.jsx';
import ConversationalIdeationPro from '../features/ideation/ConversationalIdeationPro.jsx';
import IdeationPro from '../features/ideation/IdeationPro.jsx';
import ConversationalIdeationEnhanced from '../features/ideation/ConversationalIdeationEnhanced.jsx';
import ConversationalIdeationStructured from '../features/ideation/ConversationalIdeationStructured.jsx';
import BlueprintBuilder from '../features/ideation/BlueprintBuilder.jsx';
// import ConversationalJourney from '../features/journey/ConversationalJourneyPro.jsx'; // Removed - using new architecture
import LearningJourneyPro from '../features/learningJourney/LearningJourneyPro.jsx';
import ConversationalDeliverables from '../features/deliverables/ConversationalDeliverablesPro.jsx';
import AuthenticDeliverablesPro from '../features/deliverables/AuthenticDeliverablesPro.jsx';
import LiveFrameworkBuilder from './LiveFrameworkBuilder.jsx';
import FrameworkCelebration from './FrameworkCelebration.jsx';

// --- Icon Components ---
const ChatBubbleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const LoaderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 animate-spin text-purple-600"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>;

/**
 * Validates and sanitizes chat messages to prevent UI crashes
 * @param {Array} messages - Raw messages from Firebase
 * @param {object} project - Project data for context
 * @param {string} stage - Current project stage
 * @returns {Array} - Sanitized messages array
 */
const sanitizeMessages = (messages, project, stage) => {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.map((msg, index) => {
    // Create a copy to avoid mutations
    const sanitized = { ...msg };

    // Ensure essential fields exist
    if (!sanitized.role) {
      sanitized.role = index === 0 ? 'assistant' : 'user';
    }

    // Critical: Ensure chatResponse is never empty for assistant messages
    if (sanitized.role === 'assistant' && (!sanitized.chatResponse || sanitized.chatResponse.trim() === '')) {
      sanitized.chatResponse = generateFallbackMessage(project, stage, index === 0);
    }

    // Ensure user messages have some content
    if (sanitized.role === 'user' && (!sanitized.chatResponse || sanitized.chatResponse.trim() === '')) {
      sanitized.chatResponse = "Let's continue with the project design.";
    }

    return sanitized;
  });
};

/**
 * Generates contextual fallback messages when AI responses are empty
 * @param {object} project - Project data for context
 * @param {string} stage - Current project stage  
 * @param {boolean} isInitial - Whether this is the initial welcome message
 * @returns {string} - Contextual fallback message
 */
const generateFallbackMessage = (project, stage, isInitial = false) => {
  const subject = project?.subject || "your subject area";
  const ageGroup = project?.ageGroup || "your students";
  
  if (isInitial) {
    // Initial welcome fallback
    return `Welcome to ProjectCraft! I'm excited to help you design a meaningful ${subject} project for your ${ageGroup}. Let's start by exploring your vision and transforming it into an engaging learning experience. What aspects of your project idea would you like to develop first?`;
  }

  // Stage-specific fallbacks
  const stageFallbacks = {
    'Ideation': `Let's continue developing your ${subject} project! I'm here to help you refine the Big Idea and Challenge that will drive student engagement. What direction would you like to explore?`,
    'Curriculum': `Now let's build the learning journey for your ${subject} project! I'll help you create activities that prepare ${ageGroup} for success. What key skills should students develop?`,
    'Assignments': `Time to design meaningful assessments for your ${subject} project! Let's create ways for ${ageGroup} to demonstrate their learning. What would showcase their mastery best?`,
    'default': `I'm here to help you create an amazing ${subject} learning experience! What would you like to work on together?`
  };

  return stageFallbacks[stage] || stageFallbacks.default;
};

export default function MainWorkspace() {
  const { selectedProjectId, navigateTo, advanceProjectStage, saveIdeation } = useAppContext();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  const [showIdeationWizard, setShowIdeationWizard] = useState(false);
  const [showJourneyWizard, setShowJourneyWizard] = useState(false);
  const [showDeliverablesWizard, setShowDeliverablesWizard] = useState(false);
  const [showFrameworkCelebration, setShowFrameworkCelebration] = useState(false);
  
  // Initialize SOPFlowManager
  const [sopFlowManager] = useState(() => {
    // Initialize with existing project data if available
    const existingBlueprint = project?.ideation ? {
      ideation: {
        bigIdea: project.ideation.bigIdea || '',
        essentialQuestion: project.ideation.essentialQuestion || '',
        challenge: project.ideation.challenge || ''
      },
      journey: project.learningJourney || { phases: [], activities: [], resources: [] },
      deliverables: project.studentDeliverables || { milestones: [], rubric: { criteria: [] }, impact: { audience: '', method: '' } }
    } : undefined;
    
    return new SOPFlowManager(existingBlueprint, selectedProjectId);
  });

  // Stage configuration - single source of truth
  const stageConfig = useMemo(() => ({
    [PROJECT_STAGES.IDEATION]: { 
      chatHistoryKey: 'ideationChat',
      promptBuilder: getIntakeWorkflow, 
      nextStage: PROJECT_STAGES.LEARNING_JOURNEY 
    },
    [PROJECT_STAGES.LEARNING_JOURNEY]: { 
      chatHistoryKey: 'learningJourneyChat',
      promptBuilder: getCurriculumWorkflow, 
      nextStage: PROJECT_STAGES.DELIVERABLES 
    },
    [PROJECT_STAGES.DELIVERABLES]: { 
      chatHistoryKey: 'studentDeliverablesChat',
      promptBuilder: getAssignmentWorkflow, 
      nextStage: PROJECT_STAGES.COMPLETED 
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

  // Memoized function to initialize AI conversation
  const initializeConversation = useCallback(async (projectData, config) => {
    if (isAiLoading || initializationAttempted) {return;}
    
    setIsAiLoading(true);
    setInitializationAttempted(true);

    try {
      const systemPrompt = config.promptBuilder(projectData, []);
      const responseJson = await generateJsonResponse([], systemPrompt);

      // Create AI message with only necessary fields - same fix as handleSendMessage
      const aiMessage = { 
        role: 'assistant', 
        chatResponse: responseJson.chatResponse || `Welcome! Let's work on your ${projectData.subject} project together.`,
        interactionType: responseJson.interactionType,
        currentStage: responseJson.currentStage,
        suggestions: responseJson.suggestions,
        buttons: responseJson.buttons,
        isStageComplete: responseJson.isStageComplete,
        frameworkOverview: responseJson.frameworkOverview,
        process: responseJson.process
      };
      
      await updateDoc(doc(db, "projects", projectData.id), {
        [config.chatHistoryKey]: [aiMessage]
      });
    } catch (err) {
      
      // Create manual fallback message
      const fallbackMessage = {
        role: 'assistant',
        interactionType: 'Welcome',
        currentStage: projectData.stage,
        chatResponse: generateFallbackMessage(projectData, projectData.stage, true),
        isStageComplete: false,
        buttons: ["Let's start designing!", "Tell me more about the process"],
        suggestions: null,
        frameworkOverview: null,
        summary: null,
        curriculumDraft: null,
        newAssignment: null,
        assessmentMethods: null,
        guestSpeakerHints: null
      };

      try {
        await updateDoc(doc(db, "projects", projectData.id), {
          [config.chatHistoryKey]: [fallbackMessage]
        });
      } catch (updateError) {
          setError("Unable to initialize the AI assistant. Please refresh the page.");
      }
    } finally {
      setIsAiLoading(false);
    }
  }, [isAiLoading, initializationAttempted]);

  // Main effect for Firebase listener and initialization
  useEffect(() => {
    if (!selectedProjectId) {
      navigateTo('dashboard');
      return;
    }

    setIsLoading(true);
    setError(null);
    setInitializationAttempted(false);
    
    const docRef = doc(db, "projects", selectedProjectId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const projectData = { id: docSnap.id, ...docSnap.data() };
        setProject(projectData);
        
        const currentConfig = stageConfig[projectData.stage];
        
        // Handle conversational stages with dedicated wizards
        if (projectData.stage === PROJECT_STAGES.IDEATION) {
            // ALWAYS show ideation wizard when on ideation stage
            setShowIdeationWizard(true);
            setShowJourneyWizard(false);
            setShowDeliverablesWizard(false);
            setShowFrameworkCelebration(false);
        } else if (projectData.stage === PROJECT_STAGES.LEARNING_JOURNEY) {
            // ALWAYS show journey wizard when on learning journey stage
            setShowIdeationWizard(false);
            setShowJourneyWizard(true);
            setShowDeliverablesWizard(false);
            setShowFrameworkCelebration(false);
        } else if (projectData.stage === PROJECT_STAGES.DELIVERABLES) {
            // ALWAYS show deliverables wizard when on deliverables stage
            setShowIdeationWizard(false);
            setShowJourneyWizard(false);
            setShowDeliverablesWizard(true);
            setShowFrameworkCelebration(false);
        } else if (projectData.stage === PROJECT_STAGES.COMPLETED) {
            // Show Framework Celebration for completed projects
            setShowIdeationWizard(false);
            setShowJourneyWizard(false);
            setShowDeliverablesWizard(false);
            setShowFrameworkCelebration(true);
        } else if (currentConfig) {
            // For other stages with config, use legacy chat
            const chatHistory = projectData[currentConfig.chatHistoryKey] || [];
            setShowIdeationWizard(false);
            setShowJourneyWizard(false);
            setShowDeliverablesWizard(false);
            setShowFrameworkCelebration(false);
            // FIX: Always attempt initialization if no messages exist
            // This ensures chat loads on first view without requiring "Continue" click
            if (chatHistory.length === 0 && !initializationAttempted) {
              debugLog('Initializing chat for stage:', projectData.stage);
              initializeConversation(projectData, currentConfig);
            }
        } else {
            // No config for this stage
            setShowIdeationWizard(false);
            setShowJourneyWizard(false);
            setShowDeliverablesWizard(false);
            setShowFrameworkCelebration(false);
        }
        
        // Note: Framework Celebration now handles completed projects instead of auto-switching to syllabus

      } else {
        setError("Project not found. It may have been deleted or you may not have access.");
      }
      setIsLoading(false);
    }, (err) => {
      setError("Unable to load project data. Please check your connection and try again.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedProjectId, navigateTo, stageConfig, initializeConversation, activeTab]);

  // Enhanced message sending with comprehensive error handling
  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || isAiLoading || !project) {
      return;
    }

    const currentConfig = stageConfig[project.stage];
    if (!currentConfig) {
      return;
    }

    setIsAiLoading(true);
    const docRef = doc(db, "projects", selectedProjectId);
    
    try {
      const currentHistory = sanitizeMessages(project[currentConfig.chatHistoryKey] || [], project, project.stage);
      const userMessage = { role: 'user', chatResponse: messageContent };
      const newHistory = [...currentHistory, userMessage];

      // Update UI immediately with user's message
      await updateDoc(docRef, { [currentConfig.chatHistoryKey]: newHistory });

      // Generate AI response
      const systemPrompt = currentConfig.promptBuilder(project, newHistory);
      const chatHistoryForApi = newHistory.slice(-6).map(msg => ({ 
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.chatResponse || JSON.stringify(msg) }]
      }));

      const responseJson = await generateJsonResponse(chatHistoryForApi, systemPrompt);

      // Create AI message with only necessary fields - FIX for JSON display issue
      const aiMessage = { 
        role: 'assistant', 
        chatResponse: responseJson.chatResponse || "I'm here to help! Let's continue working on your project.",
        // Keep only UI-relevant fields, not the entire JSON structure
        interactionType: responseJson.interactionType,
        currentStage: responseJson.currentStage,
        suggestions: responseJson.suggestions,
        buttons: responseJson.buttons,
        isStageComplete: responseJson.isStageComplete,
        // Keep any special UI components
        frameworkOverview: responseJson.frameworkOverview,
        process: responseJson.process,
        guestSpeakerHints: responseJson.guestSpeakerHints,
        turnNumber: responseJson.turnNumber
      };
      const finalHistory = [...newHistory, aiMessage];

      // Prepare update object
      const updates = { [currentConfig.chatHistoryKey]: finalHistory };

      // Handle granular data storage from dataToStore field (Gold-Path)
      if (responseJson.dataToStore) {
        Object.keys(responseJson.dataToStore).forEach(key => {
          const value = responseJson.dataToStore[key];
          if (value !== null && value !== undefined) {
            updates[key] = value;
          }
        });
      }

      // Handle stage completion
      if (responseJson.isStageComplete && responseJson.summary) {
        Object.keys(responseJson.summary).forEach(key => {
            // Only update if the value doesn't contain template literals
            const value = responseJson.summary[key];
            if (value && typeof value === 'string' && !value.includes('${')) {
                updates[key] = value;
            }
        });
      }

      // Handle individual field updates based on user responses
      if (messageContent && !responseJson.isStageComplete) {
        const lastMessage = newHistory[newHistory.length - 2]; // Previous AI message
        if (lastMessage?.dataToStore?.currentTurn) {
          const fieldName = lastMessage.dataToStore.currentTurn;
          if (fieldName && !project[fieldName]) {
            updates[fieldName] = messageContent.trim();
          }
        }
      }

      // Stage-specific data updates (legacy support)
      if (project.stage === PROJECT_STAGES.CURRICULUM && typeof responseJson.curriculumDraft === 'string') {
        updates.curriculumDraft = responseJson.curriculumDraft;
      }
      if (project.stage === PROJECT_STAGES.ASSIGNMENTS && responseJson.newAssignment) {
        updates.assignments = [...(project.assignments || []), responseJson.newAssignment];
      }

      await updateDoc(docRef, updates);

    } catch (error) {
      
      // Create error recovery message
      const currentHistory = project[currentConfig.chatHistoryKey] || [];
      const userMessage = { role: 'user', chatResponse: messageContent };
      const errorMessage = { 
        role: 'assistant', 
        chatResponse: "I encountered a technical issue, but I'm still here to help! Could you please try rephrasing your message, or let me know what specific aspect of your project you'd like to work on?",
        interactionType: 'Standard',
        currentStage: project.stage,
        isStageComplete: false,
        buttons: ["Let's try again", "I need help"],
        suggestions: null,
        frameworkOverview: null,
        summary: null,
        curriculumDraft: null,
        newAssignment: null,
        assessmentMethods: null,
        guestSpeakerHints: null
      };
      
      const errorHistory = [...currentHistory, userMessage, errorMessage];
      
      try {
        await updateDoc(docRef, { [currentConfig.chatHistoryKey]: errorHistory });
      } catch (updateError) {
          setError("Communication error. Please refresh the page and try again.");
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAdvance = () => {
    if (!project) {return;}
    const currentConfig = stageConfig[project.stage];
    if (currentConfig?.nextStage) {
        advanceProjectStage(selectedProjectId, currentConfig.nextStage);
    }
  };

  const handleIdeationComplete = async (ideationData) => {
    if (!selectedProjectId) {return;}
    
    try {
      await saveIdeation(selectedProjectId, ideationData);
      setShowIdeationWizard(false);
      // The wizard automatically advances to Learning Journey stage
    } catch (error) {
    }
  };

  const handleIdeationCancel = () => {
    navigateTo('dashboard');
  };

  const handleJourneyComplete = async (journeyData) => {
    if (!selectedProjectId) {return;}
    
    try {
      const docRef = doc(db, "projects", selectedProjectId);
      await updateDoc(docRef, { 
        learningJourney: journeyData,
        stage: PROJECT_STAGES.DELIVERABLES
      });
      setShowJourneyWizard(false);
    } catch (error) {
    }
  };

  const handleJourneyCancel = async () => {
    // Go back to ideation
    try {
      const docRef = doc(db, "projects", selectedProjectId);
      await updateDoc(docRef, { stage: PROJECT_STAGES.IDEATION });
    } catch (error) {
      debugError("Error going back to ideation:", error);
    }
  };

  const handleDeliverablesComplete = async (deliverablesData) => {
    if (!selectedProjectId) {return;}
    
    try {
      const docRef = doc(db, "projects", selectedProjectId);
      await updateDoc(docRef, { 
        studentDeliverables: deliverablesData,
        stage: PROJECT_STAGES.COMPLETED
      });
      setShowDeliverablesWizard(false);
    } catch (error) {
    }
  };

  const handleDeliverablesCancel = async () => {
    // Go back to journey
    try {
      const docRef = doc(db, "projects", selectedProjectId);
      await updateDoc(docRef, { stage: PROJECT_STAGES.LEARNING_JOURNEY });
    } catch (error) {
      debugError("Error going back to journey:", error);
    }
  };


  const handleFrameworkCelebrationDownload = () => {
    // TODO: Implement download functionality
    // TODO: Implement download functionality
  };

  const handleFrameworkCelebrationShare = () => {
    // TODO: Implement share functionality  
    // TODO: Implement share functionality
  };

  const handleFrameworkCelebrationStartNew = () => {
    navigateTo('dashboard');
  };

  // --- UI Components ---

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

  // --- Loading State ---
  if (isLoading) {return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <LoaderIcon />
        <h1 className="text-2xl font-bold text-slate-700 mt-4">Loading ProjectCraft...</h1>
        <p className="text-slate-500 mt-2">Preparing your project workspace</p>
    </div>
  );}

  // --- Error State ---
  if (error) {return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Unable to Load Project</h2>
        <p className="text-slate-500 mb-6 max-w-md">{error}</p>
        <div className="flex gap-3">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => navigateTo('dashboard')} 
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-6 rounded-full transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
    </div>
  );}

  if (!project) {return null;}


  // Show Framework Celebration if needed
  if (showFrameworkCelebration) {
    return (
      <FrameworkCelebration
        projectInfo={{
          subject: project.subject,
          ageGroup: project.ageGroup,
          title: project.title
        }}
        ideationData={project.ideation || {}}
        journeyData={project.learningJourney || {}}
        deliverablesData={project.studentDeliverables || {}}
        onStartNew={handleFrameworkCelebrationStartNew}
        onDownload={handleFrameworkCelebrationDownload}
        onShare={handleFrameworkCelebrationShare}
      />
    );
  }

  // Show Conversational Ideation if needed
  if (showIdeationWizard) {
    // Ensure project data exists
    const projectInfo = {
      subject: project?.subject || '',
      ageGroup: project?.ageGroup || '',
      projectScope: project?.projectScope || 'Full Course',
      educatorPerspective: project?.educatorPerspective || '',
      initialMaterials: project?.initialMaterials || ''
    };
    
    return (
      <BlueprintBuilder
        onComplete={handleIdeationComplete}
        onCancel={handleIdeationCancel}
        sopFlowManager={sopFlowManager}
      />
    );
  }

  // Show Conversational Journey if needed
  if (showJourneyWizard) {
    return (
      <LearningJourneyPro
        projectInfo={{
          subject: project.subject,
          ageGroup: project.ageGroup,
          projectScope: project.projectScope,
          educatorPerspective: project.educatorPerspective
        }}
        ideationData={project.ideation || {}}
        onComplete={handleJourneyComplete}
        onCancel={handleJourneyCancel}
      />
    );
  }

  // Show Conversational Deliverables if needed
  if (showDeliverablesWizard) {
    return (
      <AuthenticDeliverablesPro
        projectInfo={{
          subject: project.subject,
          ageGroup: project.ageGroup,
          projectScope: project.projectScope,
          educatorPerspective: project.educatorPerspective
        }}
        ideationData={project.ideation || {}}
        journeyData={project.learningJourney || {}}
        onComplete={handleDeliverablesComplete}
        onCancel={handleDeliverablesCancel}
      />
    );
  }

  // --- Main Render ---
  const currentConfig = stageConfig[project.stage];
  const rawMessages = (currentConfig && project[currentConfig.chatHistoryKey]) || [];
  const messages = sanitizeMessages(rawMessages, project, project.stage);

  return (
    <div className="animate-fade-in bg-white rounded-2xl shadow-lg border border-slate-200 h-full flex flex-col overflow-hidden">
      <header className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <button 
            onClick={() => navigateTo('dashboard')} 
            className="text-sm text-purple-600 hover:text-purple-800 font-semibold mb-1 transition-colors"
          >
            &larr; Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-slate-800 truncate" title={project.title}>
            {project.title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {project.subject} • {project.ageGroup}
          </p>
        </div>
        <div className="self-end sm:self-center flex-shrink-0">
            <ProgressIndicator currentStage={project.stage} />
        </div>
      </header>

      <div className="px-4 sm:px-6 border-b border-slate-200 bg-slate-50/50 flex-shrink-0">
        <nav className="flex items-center gap-2">
          <TabButton tabName="chat" icon={<ChatBubbleIcon />} label="AI Coach" />
          <TabButton tabName="syllabus" icon={<FileTextIcon />} label="Syllabus" />
        </nav>
      </div>

      <div className="flex-grow bg-slate-100 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex gap-4 p-4">
            <div className="flex-grow h-full overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex-grow overflow-hidden">
                  <ChatModule 
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onAdvanceStage={handleAdvance}
                    isAiLoading={isAiLoading}
                    currentStageConfig={currentConfig}
                    projectInfo={{ subject: project.subject, ageGroup: project.ageGroup }}
                  />
                </div>
              </div>
            </div>
            
            {/* Show LiveFrameworkBuilder for conversational stages */}
            {(project.stage === PROJECT_STAGES.IDEATION || 
              project.stage === PROJECT_STAGES.LEARNING_JOURNEY || 
              project.stage === PROJECT_STAGES.DELIVERABLES) && (
              <div className="w-80 hidden lg:block flex-shrink-0">
                <LiveFrameworkBuilder
                  projectInfo={{
                    subject: project.subject,
                    ageGroup: project.ageGroup,
                    title: project.title
                  }}
                  ideationData={project.ideation || {}}
                  journeyData={project.learningJourney || {}}
                  deliverablesData={project.studentDeliverables || {}}
                  currentStage={project.stage}
                  className="h-full"
                />
              </div>
            )}
            
            {/* Show CurriculumOutline for legacy curriculum stage */}
            {project.stage === PROJECT_STAGES.CURRICULUM && (
              <div className="w-96 hidden lg:block flex-shrink-0">
                <CurriculumOutline 
                  curriculumDraft={project.curriculumDraft}
                  isVisible={true}
                  projectInfo={{ title: project.title, subject: project.subject }}
                />
              </div>
            )}
          </div>
        )}
        {activeTab === 'syllabus' && (
          <SyllabusView 
            project={project} 
            onRevise={() => setActiveTab('chat')}
          />
        )}
      </div>
    </div>
  );
}