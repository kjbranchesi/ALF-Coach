// src/features/ideation/ConversationalIdeation.jsx
// Intelligent conversational ideation with clean, modern UI

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, FileText, HelpCircle, MessageCircle, Target, Info, Check } from 'lucide-react';
import StageHeader from '../../components/StageHeader.jsx';
import IdeationProgress from './IdeationProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalIdeationPrompts } from '../../ai/promptTemplates/conversationalIdeation.js';
import { useConversationRecovery } from '../../hooks/useConversationRecovery.js';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup, cleanEducatorInput, paraphraseIdea, getPedagogicalContext } from '../../lib/textUtils.ts';
import { ProgressionEngine } from '../../utils/ProgressionEngine.js';

// Debug Logger Component
const DebugPanel = ({ logs, isOpen, onToggle }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="fixed bottom-4 left-4 w-96 bg-gray-900 text-green-400 soft-rounded-lg shadow-soft-xl overflow-hidden z-50"
      >
        <div className="p-3 border-b border-gray-700 flex justify-between items-center">
          <span className="font-mono text-sm">Debug Console</span>
          <button onClick={onToggle} className="text-gray-400 hover:text-white">×</button>
        </div>
        <div className="p-3 max-h-48 overflow-y-auto font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : ''}`}>
              <span className="text-gray-500">[{log.time}]</span> {log.message}
            </div>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Icons with smooth animations
const BotIcon = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-600">
      <path d="M12 8V4H8"/>
      <rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/>
      <path d="M20 14h2"/>
      <path d="M15 13v2"/>
      <path d="M9 13v2"/>
    </svg>
  </motion.div>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13"/>
    <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
  </svg>
);

// Smart Suggestion Card with type detection and animations
const SmartSuggestionCard = ({ suggestion, onClick, disabled, type, index }) => {
  const getCardStyle = () => {
    const baseStyle = "block w-full text-left p-4 my-2 soft-card soft-rounded soft-transition hover:shadow-soft-lg hover:lift disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (type === 'whatif' || suggestion.toLowerCase().includes('what if')) {
      return `${baseStyle} bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200`;
    } else if (type === 'refine' || suggestion.toLowerCase().includes('make it more') || suggestion.toLowerCase().includes('connect it')) {
      return `${baseStyle} bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200`;
    } else if (type === 'example') {
      return `${baseStyle} bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200`;
    }
    return `${baseStyle} bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200`;
  };

  const getIcon = () => {
    if (type === 'whatif' || suggestion.toLowerCase().includes('what if')) return <MessageCircle className="w-6 h-6 text-purple-600" />;
    if (type === 'refine' || suggestion.toLowerCase().includes('refine')) return <Sparkles className="w-6 h-6 text-amber-600" />;
    if (type === 'example') return <FileText className="w-6 h-6 text-green-600" />;
    return <Lightbulb className="w-6 h-6 text-blue-600" />;
  };

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className={getCardStyle()}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1">
          <p className="font-medium text-gray-800">{suggestion}</p>
          {type === 'whatif' && <p className="text-xs text-purple-600 mt-1">Explore this concept</p>}
          {type === 'refine' && <p className="text-xs text-amber-600 mt-1">Refine your idea</p>}
          {type === 'example' && <p className="text-xs text-green-600 mt-1">Use this template</p>}
        </div>
      </div>
    </motion.button>
  );
};

// Help chip with hover effects
const HelpChip = ({ text, icon, onClick, disabled }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => onClick(text)}
    disabled={disabled}
    className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-full hover:border-purple-400 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <span>{icon}</span>
    <span className="font-medium text-sm">{text}</span>
  </motion.button>
);

// Navigation Breadcrumb (subtle, not intrusive)
const NavigationPath = ({ path, onNavigate }) => {
  if (!path || path.length === 0) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 text-xs text-gray-500"
    >
      <span>Exploring: </span>
      {path.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-1">→</span>}
          <button 
            className="hover:text-purple-600 transition-colors"
            onClick={() => onNavigate(index)}
          >
            {item}
          </button>
        </span>
      ))}
    </motion.div>
  );
};

// Progress Steps (integrated, not floating)
const IntegratedProgress = ({ currentStep, ideationData }) => {
  const steps = [
    { key: 'bigIdea', label: 'Big Idea', icon: <Lightbulb className="w-5 h-5" /> },
    { key: 'essentialQuestion', label: 'Essential Question', icon: <HelpCircle className="w-5 h-5" /> },
    { key: 'challenge', label: 'Challenge', icon: <Target className="w-5 h-5" /> }
  ];

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => {
        const isComplete = ideationData[step.key];
        const isActive = currentStep === step.key;
        const isPending = !isComplete && !isActive;

        return (
          <React.Fragment key={step.key}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col items-center"
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-lg
                transition-all duration-300
                ${isComplete ? 'bg-green-500 text-white' :
                  isActive ? 'bg-purple-600 text-white ring-4 ring-purple-200' :
                  'bg-gray-200 text-gray-500'}
              `}>
                {isComplete ? <Check className="w-4 h-4" /> : step.icon}
              </div>
              <span className={`text-xs mt-2 font-medium ${
                isActive ? 'text-purple-700' : isComplete ? 'text-green-700' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${
                ideationData[steps[index].key] ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const ConversationalIdeation = ({ projectInfo, onComplete, onCancel }) => {
  // Debug logging
  const [debugLogs, setDebugLogs] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const addLog = useCallback((message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, { time, message, type }].slice(-50));
    console.log(`[${time}] ${message}`);
  }, []);

  // Extract context with location awareness
  const [projectContext] = useState(() => {
    const context = {
      subject: projectInfo.subject || '',
      ageGroup: projectInfo.ageGroup || '',
      scope: projectInfo.projectScope || '',
      perspective: projectInfo.educatorPerspective || '',
      materials: projectInfo.initialMaterials || '',
      // Extract specific details from the perspective
      location: '',
      specificInterest: '',
      pedagogical: getPedagogicalContext(projectInfo.ageGroup || '')
    };

    // Parse the educator perspective for specific details
    if (context.perspective) {
      // Look for Chicago O'Hare or other location mentions
      const locationMatch = context.perspective.match(/(Chicago|O'Hare|O'Hare|airport|city of [^,\.]+)/i);
      if (locationMatch) {
        context.location = locationMatch[0];
      }

      // Extract specific interests
      if (context.perspective.toLowerCase().includes('urban planning')) {
        context.specificInterest = 'urban planning';
        if (context.perspective.toLowerCase().includes('airport')) {
          context.specificInterest = 'airport-adjacent urban planning';
        }
      }
    }

    console.log(`Context extracted: ${context.specificInterest || context.subject} in ${context.location || 'unspecified location'}`);
    return context;
  });
  
  // Core state
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [ideationData, setIdeationData] = useState({
    bigIdea: '',
    essentialQuestion: '',
    challenge: ''
  });
  const [currentStep, setCurrentStep] = useState('bigIdea');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Smart navigation state
  const [navigationPath, setNavigationPath] = useState([]);
  const [explorationDepth, setExplorationDepth] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastSuggestionType, setLastSuggestionType] = useState(null);
  
  // Age-aware depth limits
  const getMaxDepth = () => {
    if (projectContext.pedagogical.developmentalStage === 'Adult/Higher Education') return 4;
    if (projectContext.pedagogical.developmentalStage === 'High/Upper Secondary') return 3;
    return 2;
  };
  
  const maxDepth = getMaxDepth();

  // Progression Engine
  const progressionEngine = useRef(new ProgressionEngine('Ideation', 'bigIdea'));
  
  // Conversation recovery
  const { saveCheckpoint, recoverFromError, validateAiResponse } = useConversationRecovery(
    { ideationData, currentStep, messages },
    setMessages,
    'Ideation'
  );
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll with smooth behavior
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  // Generate contextual intro that uses the actual blueprint data
  const generateContextualIntro = () => {
    let intro = "Building on ";
    
    if (projectContext.location && projectContext.specificInterest) {
      intro += `your interest in ${projectContext.specificInterest} around ${projectContext.location}`;
    } else if (projectContext.specificInterest) {
      intro += `your interest in ${projectContext.specificInterest}`;
    } else if (projectContext.perspective) {
      // Use first 50 chars of perspective
      const snippet = projectContext.perspective.substring(0, 50);
      intro += `what you shared: "${snippet}${projectContext.perspective.length > 50 ? '...' : ''}"`;
    } else {
      intro += `your teaching experience`;
    }
    
    if (projectContext.materials) {
      intro += ` and the materials you mentioned`;
    }
    
    return intro;
  };

  // Initialize conversation
  useEffect(() => {
    addLog('ConversationalIdeation mounted');
    addLog(`ProjectInfo: ${JSON.stringify(projectInfo)}`);
    addLog(`IsInitialized: ${isInitialized}`);
    
    // Check API key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    addLog(`API Key present: ${!!apiKey}`);
    addLog(`API Key length: ${apiKey ? apiKey.length : 0}`);
    
    if (!isInitialized && projectInfo) {
      addLog('Starting initialization...');
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isInitialized, projectInfo, addLog]);

  const initializeConversation = async () => {
    addLog('=== INIT CONVERSATION START ===');
    setIsAiLoading(true);
    
    try {
      addLog(`Project Context: ${JSON.stringify(projectContext)}`);
      const contextualIntro = generateContextualIntro();
      addLog(`Contextual intro: ${contextualIntro}`);
      
      const subject = titleCase(projectContext.subject);
      const ageGroup = formatAgeGroup(projectContext.ageGroup);
      addLog(`Subject: ${subject}, Age Group: ${ageGroup}`);
      
      const welcomeMessage = `### Welcome to Project Design! 🎯

${contextualIntro}, let's build your **${subject}** project foundation in 3 steps:

1. **Big Idea** - Core theme that anchors everything
2. **Essential Question** - Driving inquiry that sparks curiosity  
3. **Challenge** - Meaningful work students create

*Right now: crafting your **Big Idea** for ${ageGroup}*

**What's your initial thinking?** Share a draft Big Idea or click for assistance.`;

      const aiMessage = {
        role: 'assistant',
        chatResponse: welcomeMessage,
        quickReplies: ['💡 Get Ideas', '📋 See Examples', '❓ Get Help'],
        currentStep: 'bigIdea',
        timestamp: Date.now()
      };

      addLog('Setting initial message...');
      setMessages([aiMessage]);
      addLog('=== INIT CONVERSATION SUCCESS ===');
      
    } catch (error) {
      addLog(`=== INIT ERROR: ${error.message} ===`, 'error');
      addLog(`Error stack: ${error.stack}`, 'error');
      const fallbackMessage = {
        role: 'assistant',
        chatResponse: "Welcome! Let's start with your Big Idea. What broad theme would you like to explore?",
        quickReplies: ['Get Ideas', 'See Examples'],
        timestamp: Date.now()
      };
      setMessages([fallbackMessage]);
    }
    
    setIsAiLoading(false);
  };

  // Intelligent response validation
  const validateResponse = (content, step) => {
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const lower = trimmed.toLowerCase();
    
    addLog(`Validating ${step} response: "${trimmed.substring(0, 50)}..."`);
    
    // Age-appropriate validation
    const isCollege = projectContext.pedagogical.developmentalStage === 'Adult/Higher Education';
    
    switch (step) {
      case 'bigIdea':
        // For college, allow theoretical concepts
        if (isCollege && (lower.includes('theory') || lower.includes('paradigm') || lower.includes('framework'))) {
          addLog('College-level theoretical concept accepted');
          return { valid: true, score: 'high', feedback: null };
        }
        
        // Check for common issues
        if (lower.includes('?') || /^(how|what|why|when|where|which)\s/i.test(trimmed)) {
          return { valid: false, score: 'low', feedback: 'Big Ideas should be themes, not questions' };
        }
        
        if (wordCount < 3 || trimmed.length < 15) {
          return { valid: false, score: 'low', feedback: 'Please provide more detail' };
        }
        
        return { valid: true, score: 'medium', feedback: null };
        
      case 'essentialQuestion':
        if (!trimmed.includes('?') && !/^(how|what|why|when|where|which|who)\s/i.test(trimmed)) {
          return { valid: false, score: 'low', feedback: 'Essential Questions should be inquiry-based' };
        }
        
        if (wordCount < 6) {
          return { valid: false, score: 'low', feedback: 'Please make your question more specific' };
        }
        
        return { valid: true, score: 'high', feedback: null };
        
      case 'challenge':
        const hasAction = /(create|design|develop|build|produce|analyze|evaluate|synthesize)/i.test(trimmed);
        
        if (!hasAction) {
          return { valid: false, score: 'low', feedback: 'Challenges should describe what students will DO' };
        }
        
        if (wordCount < 6) {
          return { valid: false, score: 'low', feedback: 'Please be more specific about the deliverable' };
        }
        
        return { valid: true, score: 'high', feedback: null };
        
      default:
        return { valid: true, score: 'medium', feedback: null };
    }
  };

  // Smart branching logic
  const determineBranchingStrategy = (userInput, validation, depth) => {
    addLog(`Determining branching strategy at depth ${depth}`);
    
    // Check if user selected a concrete example
    if (validation.score === 'high' || userInput.includes('Use this')) {
      return { type: 'advance', suggestions: null };
    }
    
    // Check exploration depth
    if (depth >= maxDepth) {
      addLog('Max depth reached - showing concrete examples');
      return { type: 'concrete', suggestions: 'examples' };
    }
    
    // Check interaction count
    if (interactionCount > 5) {
      addLog('Many interactions - time to focus');
      return { type: 'focus', suggestions: 'refined' };
    }
    
    // Default exploration
    return { type: 'explore', suggestions: 'mixed' };
  };

  // Handle message sending with smart routing
  const handleSendMessage = async (messageContent = userInput) => {
    addLog(`=== HANDLE SEND MESSAGE START ===`);
    addLog(`Message content: "${messageContent}"`);
    addLog(`Is AI Loading: ${isAiLoading}`);
    
    if (!messageContent.trim() || isAiLoading) {
      addLog('Message empty or AI loading - returning');
      return;
    }
    
    // Clear input if it's from text field
    if (messageContent === userInput) {
      setUserInput('');
    }

    addLog(`User input: "${messageContent}"`);
    setInteractionCount(prev => prev + 1);

    // Add user message
    const userMessage = {
      role: 'user',
      chatResponse: messageContent,
      timestamp: Date.now()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    
    setIsAiLoading(true);

    try {
      // Track navigation
      if (messageContent.toLowerCase().includes('what if')) {
        setExplorationDepth(prev => prev + 1);
        setNavigationPath(prev => [...prev, messageContent.substring(0, 30) + '...']);
        setLastSuggestionType('whatif');
      } else if (messageContent === '💡 Get Ideas' || messageContent === 'Get Ideas') {
        setLastSuggestionType('ideas');
      } else if (messageContent === '📋 See Examples' || messageContent === 'See Examples') {
        setLastSuggestionType('examples');
        setExplorationDepth(0); // Reset on examples
      } else {
        setExplorationDepth(0); // Reset on concrete selection
      }

      // Validate response
      const validation = validateResponse(messageContent, currentStep);
      
      // Determine branching strategy
      const strategy = determineBranchingStrategy(messageContent, validation, explorationDepth);

      // Build chat history
      const chatHistory = newMessages.map(msg => ({
        role: msg.role,
        content: msg.chatResponse
      }));

      // Create dynamic prompt based on strategy
      let dynamicInstruction = '';
      
      if (!validation.valid) {
        dynamicInstruction = `User's response has issues: ${validation.feedback}. Coach them gently and provide 3 helpful suggestions.`;
      } else if (strategy.type === 'advance') {
        dynamicInstruction = `Excellent response! Capture it and advance to the next step with encouragement.`;
      } else if (strategy.type === 'concrete') {
        dynamicInstruction = `User has explored enough. Provide 3 concrete, ready-to-use ${currentStep} examples. NO more "what if" questions.`;
      } else if (strategy.type === 'focus') {
        dynamicInstruction = `Help the user focus. Provide 2-3 refined suggestions based on their exploration so far.`;
      } else if (lastSuggestionType === 'ideas') {
        dynamicInstruction = `User wants creative inspiration. Provide 3 "What if" prompts to spark their thinking about ${currentStep}.`;
      } else if (lastSuggestionType === 'examples') {
        dynamicInstruction = `User wants concrete examples. Provide 3 complete ${currentStep} examples they can use or adapt.`;
      }

      // Get AI response
      addLog('Building prompts...');
      const systemPrompt = conversationalIdeationPrompts.systemPrompt(projectInfo, ideationData);
      const stepPrompt = conversationalIdeationPrompts.stepPrompts[currentStep] ? 
        conversationalIdeationPrompts.stepPrompts[currentStep](projectInfo) : '';
      
      addLog(`System prompt length: ${systemPrompt.length}`);
      addLog(`Step prompt length: ${stepPrompt.length}`);
      addLog(`Dynamic instruction: ${dynamicInstruction}`);
      addLog(`Chat history length: ${chatHistory.length}`);
      
      addLog('Calling generateJsonResponse...');
      
      const response = await generateJsonResponse(
        chatHistory, 
        systemPrompt + '\n' + stepPrompt + '\n' + dynamicInstruction
      );
      addLog(`Response received: ${JSON.stringify(response).substring(0, 200)}...`);

      // Ensure response structure
      response.interactionType = response.interactionType || 'conversationalIdeation';
      response.currentStage = response.currentStage || 'Ideation';

      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse,
        suggestions: response.suggestions,
        quickReplies: response.quickReplies,
        isStageComplete: response.isStageComplete,
        ideationProgress: response.ideationProgress,
        currentStep: response.currentStep || currentStep,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update ideation data if provided
      if (response.ideationProgress) {
        setIdeationData(response.ideationProgress);
        addLog(`Progress updated: ${JSON.stringify(response.ideationProgress)}`);
      }
      
      // Update step if changed
      if (response.currentStep && response.currentStep !== currentStep) {
        setCurrentStep(response.currentStep);
        setExplorationDepth(0);
        setNavigationPath([]);
        setInteractionCount(0);
        progressionEngine.current.advanceStep(response.currentStep);
        addLog(`Advanced to step: ${response.currentStep}`);
      }

      // Handle completion
      if (response.isStageComplete && response.ideationProgress) {
        const { bigIdea, essentialQuestion, challenge } = response.ideationProgress;
        if (bigIdea && essentialQuestion && challenge) {
          addLog('Ideation complete! Moving to next stage...');
          setTimeout(() => {
            onComplete(response.ideationProgress);
          }, 2000);
        }
      }

      // Save checkpoint
      saveCheckpoint({
        ideationData: response.ideationProgress || ideationData,
        currentStep: response.currentStep || currentStep,
        messages: [...newMessages, aiMessage]
      });

    } catch (error) {
      addLog(`=== SEND MESSAGE ERROR ===`, 'error');
      addLog(`Error message: ${error.message}`, 'error');
      addLog(`Error stack: ${error.stack}`, 'error');
      
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I had trouble processing that. Let me help you another way.",
        quickReplies: ['💡 Get Ideas', '📋 See Examples'],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsAiLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNavigate = (index) => {
    setNavigationPath(prev => prev.slice(0, index));
    setExplorationDepth(index);
    addLog(`Navigated back to depth ${index}`);
  };

  // Check for API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const hasApiKey = apiKey && apiKey !== 'your_api_key_here';

  return (
    <div className="h-screen soft-bg flex flex-col">
      {/* Header with integrated progress */}
      <div className="flex-shrink-0 p-4 soft-card rounded-b-2xl">
        <StageHeader 
          stage={PROJECT_STAGES.IDEATION} 
          showDescription={false}
          className="mb-4"
        />
        
        {/* Integrated Progress Steps */}
        <IntegratedProgress currentStep={currentStep} ideationData={ideationData} />
        
        {/* Context Bar */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Subject: <strong className="text-purple-800">{projectContext.subject}</strong></span>
              <span className="text-gray-600">Age: <strong className="text-purple-800">{projectContext.ageGroup}</strong></span>
              {projectContext.location && (
                <span className="text-gray-600">Focus: <strong className="text-purple-800">{projectContext.location}</strong></span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setShowDebug(!showDebug);
                  addLog(`Debug panel toggled: ${!showDebug}`);
                }}
                className="text-xs text-gray-500 hover:text-purple-600 font-mono bg-gray-100 px-2 py-1 rounded"
              >
                {'</>'} Debug ({debugLogs.length})
              </button>
              <button 
                onClick={onCancel}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex gap-4 px-4 min-h-0">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col soft-card soft-rounded-lg overflow-hidden">
          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Navigation breadcrumb */}
              <NavigationPath path={navigationPath} onNavigate={handleNavigate} />
              
              <AnimatePresence>
                {messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  const isLatest = index === messages.length - 1;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow-soft">
                          <BotIcon />
                        </div>
                      )}
                      
                      <div className={`max-w-2xl ${isUser ? 'order-1' : 'order-2'}`}>
                        <motion.div 
                          className={`soft-rounded-lg px-6 py-4 soft-transition ${
                            isUser ? 'bg-purple-600 text-white shadow-soft-lg' : 'soft-card'
                          }`}
                          whileHover={{ scale: 1.01 }}
                        >
                          {msg.chatResponse && (
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: renderMarkdown(msg.chatResponse) 
                              }}
                            />
                          )}
                        </motion.div>
                      
                        {/* Quick replies */}
                        {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && isLatest && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-3 flex flex-wrap gap-2"
                          >
                            {msg.quickReplies.map((reply, i) => {
                              const icon = reply.includes('Ideas') ? <Lightbulb className="w-4 h-4" /> : 
                                         reply.includes('Examples') ? <FileText className="w-4 h-4" /> : 
                                         reply.includes('Help') ? <HelpCircle className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />;
                              return (
                                <HelpChip
                                  key={i}
                                  text={reply.replace(/[💡📋❓]/g, '').trim()}
                                  icon={icon}
                                  onClick={() => handleSendMessage(reply)}
                                  disabled={isAiLoading}
                                />
                              );
                            })}
                          </motion.div>
                        )}
                      
                        {/* Smart suggestions */}
                        {!isUser && msg.suggestions && msg.suggestions.length > 0 && isLatest && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-4"
                          >
                            {msg.suggestions.map((suggestion, i) => {
                              let type = 'default';
                              if (suggestion.toLowerCase().includes('what if')) type = 'whatif';
                              else if (suggestion.toLowerCase().includes('make it more') || 
                                      suggestion.toLowerCase().includes('connect it')) type = 'refine';
                              else if (lastSuggestionType === 'examples') type = 'example';
                              
                              return (
                                <SmartSuggestionCard
                                  key={i}
                                  index={i}
                                  suggestion={suggestion}
                                  type={type}
                                  onClick={handleSendMessage}
                                  disabled={isAiLoading}
                                />
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    
                      {isUser && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center order-2 shadow-soft">
                          <UserIcon />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              
              {/* Loading animation */}
              {isAiLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <BotIcon />
                  </div>
                  <div className="bg-slate-100 text-slate-600 rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="w-2 h-2 bg-purple-600 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-purple-600 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-2 h-2 bg-purple-600 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, delay: 0.4, repeat: Infinity }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-slate-200 p-4 bg-slate-50">
            <div className="flex items-end gap-4 max-w-3xl mx-auto">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                disabled={isAiLoading}
                className="flex-grow px-4 py-3 soft-input soft-rounded resize-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed soft-transition"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isAiLoading}
                className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white soft-rounded flex items-center justify-center hover:bg-purple-700 soft-transition disabled:bg-slate-300 disabled:cursor-not-allowed shadow-soft-lg hover:shadow-soft-xl hover:lift"
              >
                <SendIcon />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Progress Sidebar */}
        <div className="w-80 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <IdeationProgress 
              ideationData={ideationData}
              currentStep={currentStep}
              onEditStep={() => {}} // Could enable editing
            />
          </motion.div>
        </div>
      </div>

      {/* Debug Panel */}
      <DebugPanel logs={debugLogs} isOpen={showDebug} onToggle={() => setShowDebug(!showDebug)} />
    </div>
  );
};

export default ConversationalIdeation;