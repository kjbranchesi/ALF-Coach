// src/features/ideation/ConversationalIdeationPro.jsx
// Professional UI with proper responsive layout - no overlapping elements

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StageHeader from '../../components/StageHeader.jsx';
import IdeationProgress from './IdeationProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalIdeationPrompts } from '../../ai/promptTemplates/conversationalIdeation.js';
import { useConversationRecovery } from '../../hooks/useConversationRecovery.js';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup, cleanEducatorInput, paraphraseIdea, getPedagogicalContext } from '../../lib/textUtils.ts';
import { ProgressionEngine } from '../../utils/ProgressionEngine.js';
import { getFrameworkBuilder } from '../../utils/ComprehensiveFrameworkBuilder.js';
import { getBranchingStrategy } from '../../utils/BranchingStrategies.js';

// Modern, minimal icons
const Icons = {
  Bot: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2" ry="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L14.09 8.36L21 9.27L16.5 13.97L17.82 21L12 17.77L6.18 21L7.5 13.97L3 9.27L9.91 8.36L12 2z"/>
    </svg>
  ),
  Lightbulb: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
      <path d="M9 21h6"/>
    </svg>
  ),
  Target: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
};

// Clean progress indicator (like ChatGPT's model selector)
const StageProgress = ({ currentStep, ideationData }) => {
  const steps = [
    { key: 'bigIdea', label: 'Big Idea', icon: Icons.Lightbulb },
    { key: 'essentialQuestion', label: 'Essential Question', icon: Icons.Sparkles },
    { key: 'challenge', label: 'Challenge', icon: Icons.Target }
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm overflow-x-auto">
      {steps.map((step, index) => {
        const isComplete = ideationData[step.key];
        const isActive = currentStep === step.key;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all whitespace-nowrap ${
              isActive ? 'bg-white shadow-sm text-gray-900' : 
              isComplete ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Icon />
              <span className="font-medium hidden sm:inline">{step.label}</span>
              {isComplete && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-600">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            {index < steps.length - 1 && (
              <Icons.ChevronRight />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Minimal suggestion button (like ChatGPT's suggested prompts)
const SuggestionButton = ({ suggestion, onClick, disabled, type, index }) => {
  const getStyle = () => {
    if (type === 'whatif') return 'bg-blue-50 hover:bg-blue-100 text-blue-700 shadow hover:shadow-md';
    if (type === 'refine') return 'bg-amber-50 hover:bg-amber-100 text-amber-700 shadow hover:shadow-md';
    if (type === 'example') return 'bg-green-50 hover:bg-green-100 text-green-700 shadow hover:shadow-md';
    return 'bg-slate-50 hover:bg-slate-100 text-slate-700 shadow hover:shadow-md';
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      transition={{ 
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 17
      }}
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${getStyle()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <p className="text-gray-700">{suggestion}</p>
    </motion.button>
  );
};

// Clean message bubble
const Message = ({ message, isUser }) => {
  // Ensure we have a valid message object
  if (!message || typeof message !== 'object') {
    return null;
  }
  
  // Extract the actual message content
  const messageContent = message.chatResponse || message.content || message.text || '';
  
  // If still no content, show a fallback
  if (!messageContent) {
    return (
      <div className="text-gray-500 italic">Loading message...</div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <motion.div 
          className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Icons.Bot />
        </motion.div>
      )}
      <motion.div 
        className={`max-w-[85%] sm:max-w-[80%] md:max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <div className={`rounded-2xl px-4 py-2.5 transition-all duration-200 ${
          isUser 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl' 
            : 'bg-white shadow-md hover:shadow-lg text-slate-800'
        }`}>
          <div 
            className={`prose prose-sm max-w-none ${
              isUser ? 'prose-invert' : ''
            }`}
            dangerouslySetInnerHTML={renderMarkdown(String(messageContent))}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

const ConversationalIdeationPro = ({ projectInfo, onComplete, onCancel }) => {
  // State management
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
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Intelligent flow control
  const [navigationPath, setNavigationPath] = useState([]);
  const [explorationDepth, setExplorationDepth] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastSuggestionType, setLastSuggestionType] = useState(null);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const progressionEngine = useRef(new ProgressionEngine('Ideation', 'bigIdea'));
  const frameworkBuilder = useRef(getFrameworkBuilder());
  const branchingStrategy = useRef(null);

  // Extract context
  const projectContext = useMemo(() => {
    const context = {
      subject: projectInfo.subject || '',
      ageGroup: projectInfo.ageGroup || '',
      scope: projectInfo.projectScope || '',
      perspective: projectInfo.educatorPerspective || '',
      materials: projectInfo.initialMaterials || '',
      location: '',
      specificInterest: '',
      pedagogical: getPedagogicalContext(projectInfo.ageGroup || '')
    };

    if (context.perspective) {
      const locationMatch = context.perspective.match(/(Chicago|O'Hare|airport|city of [^,\.]+)/i);
      if (locationMatch) {
        context.location = locationMatch[0];
      }

      if (context.perspective.toLowerCase().includes('urban planning')) {
        context.specificInterest = 'urban planning';
        if (context.perspective.toLowerCase().includes('airport')) {
          context.specificInterest = 'airport-adjacent urban planning';
        }
      }
    }

    // Initialize branching strategy with context
    branchingStrategy.current = getBranchingStrategy(context);

    return context;
  }, [projectInfo]);

  // Age-aware depth limits
  const getMaxDepth = () => {
    const stage = projectContext.pedagogical?.developmentalStage;
    if (stage === 'Adult/Higher Education') return 4;
    if (stage === 'High/Upper Secondary') return 3;
    return 2;
  };

  const maxDepth = getMaxDepth();

  // Conversation recovery
  const { saveCheckpoint } = useConversationRecovery(
    { ideationData, currentStep, messages },
    setMessages,
    'Ideation'
  );

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized && projectInfo) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isInitialized, projectInfo]);

  const initializeConversation = async () => {
    setIsAiLoading(true);
    
    try {
      const subject = titleCase(projectContext.subject || 'your subject');
      const ageGroup = formatAgeGroup(projectContext.ageGroup || 'your students');
      
      let contextualIntro = "Welcome! ";
      if (projectContext.location && projectContext.specificInterest) {
        contextualIntro += `Building on your ${projectContext.specificInterest} focus around ${projectContext.location}, `;
      }
      
      const welcomeMessage = `${contextualIntro}let's design your ${subject} project in three steps:

**Big Idea** → **Essential Question** → **Challenge**

Starting with your Big Idea - what core theme will anchor your ${ageGroup} students' learning?`;

      const aiMessage = {
        role: 'assistant',
        chatResponse: welcomeMessage,
        currentStep: 'bigIdea',
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
    } catch (error) {
      // Fallback message
      const fallbackMessage = {
        role: 'assistant',
        chatResponse: "Welcome! Let's design your project. What broad theme or big idea would you like to explore?",
        currentStep: 'bigIdea',
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
    
    const isCollege = projectContext.pedagogical?.developmentalStage === 'Adult/Higher Education';
    
    switch (step) {
      case 'bigIdea':
        if (isCollege && (lower.includes('theory') || lower.includes('paradigm'))) {
          return { valid: true, score: 'high', feedback: null };
        }
        if (lower.includes('?') || /^(how|what|why|when|where|which)\s/i.test(trimmed)) {
          return { valid: false, score: 'low', feedback: 'Big Ideas should be themes, not questions' };
        }
        if (wordCount < 3) {
          return { valid: false, score: 'low', feedback: 'Please provide more detail' };
        }
        return { valid: true, score: 'medium', feedback: null };
        
      case 'essentialQuestion':
        if (!trimmed.includes('?')) {
          return { valid: false, score: 'low', feedback: 'Essential Questions should end with ?' };
        }
        if (wordCount < 5) {
          return { valid: false, score: 'low', feedback: 'Please make your question more specific' };
        }
        return { valid: true, score: 'high', feedback: null };
        
      case 'challenge':
        const hasAction = /(create|design|develop|build|produce|analyze)/i.test(trimmed);
        if (!hasAction) {
          return { valid: false, score: 'low', feedback: 'Challenges should describe what students will DO' };
        }
        return { valid: true, score: 'high', feedback: null };
        
      default:
        return { valid: true, score: 'medium', feedback: null };
    }
  };

  // Smart branching strategy
  const determineBranchingStrategy = (userInput, validation, depth) => {
    if (validation.score === 'high' || userInput.includes('Use this')) {
      return { type: 'advance', suggestions: null };
    }
    
    if (depth >= maxDepth) {
      return { type: 'concrete', suggestions: 'examples' };
    }
    
    if (interactionCount > 5) {
      return { type: 'focus', suggestions: 'refined' };
    }
    
    return { type: 'explore', suggestions: 'mixed' };
  };

  // Handle message sending
  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;
    
    if (messageContent === userInput) {
      setUserInput('');
    }

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
      } else if (messageContent.includes('Get Ideas')) {
        setLastSuggestionType('ideas');
      } else if (messageContent.includes('See Examples')) {
        setLastSuggestionType('examples');
        setExplorationDepth(0);
      } else {
        setExplorationDepth(0);
      }

      // Validate and strategize
      const validation = validateResponse(messageContent, currentStep);
      const strategy = determineBranchingStrategy(messageContent, validation, explorationDepth);

      // Build chat history in Gemini's expected format
      const chatHistory = newMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || '' }]
      }));

      // Dynamic instruction based on strategy
      let dynamicInstruction = '';
      if (!validation.valid) {
        // Get context-aware validation message
        const contextualMessage = branchingStrategy.current?.getValidationMessage(
          currentStep, 
          validation.feedback, 
          projectContext
        ) || validation.feedback;
        dynamicInstruction = `User's response needs guidance: ${contextualMessage}. Coach them gently.`;
      } else if (strategy.type === 'advance') {
        dynamicInstruction = `Excellent response! Capture it and advance to the next step.`;
      } else if (strategy.type === 'concrete') {
        dynamicInstruction = `Provide 3 concrete, ready-to-use ${currentStep} examples.`;
      } else if (strategy.type === 'focus') {
        dynamicInstruction = `Help the user focus with 2-3 refined suggestions.`;
      }
      
      // Get subject/age specific suggestions if available
      const enhancedStrategy = branchingStrategy.current?.getStrategy(currentStep, lastSuggestionType);
      if (enhancedStrategy?.combined?.suggestions) {
        dynamicInstruction += ` Suggestions: ${enhancedStrategy.combined.suggestions.join(', ')}`;
      }

      // Get AI response
      const systemPrompt = conversationalIdeationPrompts.systemPrompt(projectInfo, ideationData);
      const stepPromptObj = conversationalIdeationPrompts.stepPrompts[currentStep]?.(projectInfo);
      const stepPrompt = typeof stepPromptObj === 'object' ? stepPromptObj.prompt : stepPromptObj || '';
      
      const response = await generateJsonResponse(
        chatHistory, 
        systemPrompt + '\n' + stepPrompt + '\n' + dynamicInstruction
      );

      // Process response
      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse,
        suggestions: response.suggestions,
        currentStep: response.currentStep || currentStep,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.ideationProgress) {
        setIdeationData(response.ideationProgress);
        
        // Update framework builder
        frameworkBuilder.current.updateFromIdeation({
          ...response.ideationProgress,
          context: projectContext
        });
      }
      
      if (response.currentStep && response.currentStep !== currentStep) {
        setCurrentStep(response.currentStep);
        setExplorationDepth(0);
        setNavigationPath([]);
        setInteractionCount(0);
      }

      if (response.isStageComplete) {
        setTimeout(() => onComplete(response.ideationProgress), 2000);
      }

      saveCheckpoint({
        ideationData: response.ideationProgress || ideationData,
        currentStep: response.currentStep || currentStep,
        messages: [...newMessages, aiMessage]
      });

    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I had trouble processing that. Let me help you another way.",
        suggestions: ['💡 Get Ideas', '📋 See Examples'],
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

  // Get current suggestions from latest message
  const currentSuggestions = messages[messages.length - 1]?.suggestions || [];
  const showSuggestions = !isAiLoading && currentSuggestions.length > 0 && 
                         messages[messages.length - 1]?.role === 'assistant';

  return (
    <motion.div 
      className="h-screen flex flex-col bg-slate-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="bg-white shadow-md flex-shrink-0 rounded-b-xl">
        <div className="px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h1 className="text-xl font-semibold text-gray-900">Project Design: Ideation</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Icons.Menu />
              </button>
              <button 
                onClick={onCancel}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Exit
              </button>
            </div>
          </div>
          <StageProgress currentStep={currentStep} ideationData={ideationData} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-h-0 p-4 gap-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-lg min-h-0">
            <div className="max-w-3xl mx-auto p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Icons.Bot />
                    <p className="mt-2">Initializing conversation...</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <Message key={index} message={msg} isUser={msg.role === 'user'} />
                  ))
                )}
                
                {isAiLoading && (
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icons.Bot />
                    </motion.div>
                    <div className="bg-white shadow-md rounded-2xl px-4 py-3">
                      <div className="flex gap-1.5">
                        <motion.div className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }} />
                        <motion.div className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-2"
                >
                  {currentSuggestions.map((suggestion, i) => {
                    let type = 'default';
                    if (suggestion.toLowerCase().includes('what if')) type = 'whatif';
                    else if (suggestion.toLowerCase().includes('make it more')) type = 'refine';
                    else if (lastSuggestionType === 'examples') type = 'example';
                    
                    return (
                      <SuggestionButton
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
          </div>

          {/* Input area */}
          <div className="bg-white rounded-xl shadow-lg flex-shrink-0">
            <div className="max-w-3xl mx-auto p-4 sm:p-5">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your response..."
                  disabled={isAiLoading}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
                />
                <motion.button
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || isAiLoading}
                  whileHover={userInput.trim() && !isAiLoading ? { scale: 1.05 } : {}}
                  whileTap={userInput.trim() && !isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <Icons.Send />
                </motion.button>
              </div>
              
              {/* Quick actions */}
              <div className="flex gap-2 mt-3 flex-wrap">
                <motion.button
                  onClick={() => handleSendMessage('Get Ideas')}
                  disabled={isAiLoading}
                  whileHover={!isAiLoading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white shadow hover:shadow-md font-medium transition-all inline-flex items-center gap-1.5"
                >
                  <Icons.Lightbulb />
                  <span>Get Ideas</span>
                </motion.button>
                <motion.button
                  onClick={() => handleSendMessage('See Examples')}
                  disabled={isAiLoading}
                  whileHover={!isAiLoading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white shadow hover:shadow-md font-medium transition-all inline-flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="9"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <span>See Examples</span>
                </motion.button>
                <motion.button
                  onClick={() => handleSendMessage('Help')}
                  disabled={isAiLoading}
                  whileHover={!isAiLoading ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isAiLoading ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-white shadow hover:shadow-md font-medium transition-all inline-flex items-center gap-1.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <span>Help</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Progress sidebar */}
        <div className="hidden lg:block w-80 bg-white shadow-lg m-4 ml-0 rounded-xl overflow-y-auto flex-shrink-0">
          <div className="sticky top-0 bg-white p-4">
            <h2 className="font-semibold text-gray-900">Your Progress</h2>
          </div>
          <IdeationProgress 
            ideationData={ideationData}
            currentStep={currentStep}
            onEditStep={() => {}}
          />
          
          {/* Framework Preview */}
          {ideationData.bigIdea && (
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Building Your Course Framework
              </h3>
              <div className="space-y-3 text-xs">
                {ideationData.bigIdea && (
                  <div className="p-2 bg-green-50 rounded">
                    <span className="font-medium text-green-700 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Course Theme:
                    </span>
                    <p className="text-gray-600 mt-1">{ideationData.bigIdea}</p>
                  </div>
                )}
                {ideationData.essentialQuestion && (
                  <div className="p-2 bg-green-50 rounded">
                    <span className="font-medium text-green-700 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Driving Question:
                    </span>
                    <p className="text-gray-600 mt-1">{ideationData.essentialQuestion}</p>
                  </div>
                )}
                {ideationData.challenge && (
                  <div className="p-2 bg-green-50 rounded">
                    <span className="font-medium text-green-700 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Student Challenge:
                    </span>
                    <p className="text-gray-600 mt-1">{ideationData.challenge}</p>
                  </div>
                )}
                
                <div className="pt-3 text-gray-500">
                  <p className="font-medium">Next Steps:</p>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      Design learning journey
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      Create assessments
                    </li>
                    <li className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                      Generate course materials
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black lg:hidden z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Your Progress</h2>
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Icons.X />
                </button>
              </div>
              <IdeationProgress 
                ideationData={ideationData}
                currentStep={currentStep}
                onEditStep={() => {}}
              />
              
              {/* Framework Preview */}
              {ideationData.bigIdea && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Building Your Course Framework
                  </h3>
                  <div className="space-y-3 text-xs">
                    {ideationData.bigIdea && (
                      <div className="p-2 bg-green-50 rounded">
                        <span className="font-medium text-green-700 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Course Theme:
                    </span>
                        <p className="text-gray-600 mt-1">{ideationData.bigIdea}</p>
                      </div>
                    )}
                    {ideationData.essentialQuestion && (
                      <div className="p-2 bg-green-50 rounded">
                        <span className="font-medium text-green-700 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Driving Question:
                    </span>
                        <p className="text-gray-600 mt-1">{ideationData.essentialQuestion}</p>
                      </div>
                    )}
                    {ideationData.challenge && (
                      <div className="p-2 bg-green-50 rounded">
                        <span className="font-medium text-green-700 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Student Challenge:
                    </span>
                        <p className="text-gray-600 mt-1">{ideationData.challenge}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConversationalIdeationPro;