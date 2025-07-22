// src/features/ideation/ConversationalIdeationPro.jsx
// Professional UI with ChatGPT/Gemini aesthetics + ALF's sophisticated intelligence

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
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
      {steps.map((step, index) => {
        const isComplete = ideationData[step.key];
        const isActive = currentStep === step.key;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${
              isActive ? 'bg-white shadow-sm text-gray-900' : 
              isComplete ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Icon />
              <span className="font-medium">{step.label}</span>
              {isComplete && <span className="text-green-600">✓</span>}
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
    if (type === 'whatif') return 'border-purple-200 hover:border-purple-400 hover:bg-purple-50';
    if (type === 'refine') return 'border-amber-200 hover:border-amber-400 hover:bg-amber-50';
    if (type === 'example') return 'border-green-200 hover:border-green-400 hover:bg-green-50';
    return 'border-gray-200 hover:border-gray-400 hover:bg-gray-50';
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${getStyle()} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <p className="text-gray-700">{suggestion}</p>
    </motion.button>
  );
};

// Clean message bubble
const Message = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
  >
    {!isUser && (
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
        <Icons.Bot />
      </div>
    )}
    <div className={`max-w-[80%] md:max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
      <div className={`rounded-2xl px-4 py-2 ${
        isUser ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        {message.chatResponse && (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.chatResponse) }}
          />
        )}
      </div>
    </div>
  </motion.div>
);

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
  
  // Intelligent flow control
  const [navigationPath, setNavigationPath] = useState([]);
  const [explorationDepth, setExplorationDepth] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [lastSuggestionType, setLastSuggestionType] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const progressionEngine = useRef(new ProgressionEngine('Ideation', 'bigIdea'));
  const frameworkBuilder = useRef(getFrameworkBuilder());
  const branchingStrategy = useRef(null);

  // Debug logging
  const addLog = useCallback((message, type = 'info') => {
    if (showDebug) {
      const time = new Date().toLocaleTimeString();
      setDebugLogs(prev => [...prev, { time, message, type }].slice(-50));
      console.log(`[${time}] ${message}`);
    }
  }, [showDebug]);

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
      const subject = titleCase(projectContext.subject);
      const ageGroup = formatAgeGroup(projectContext.ageGroup);
      
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
      console.error('Init error:', error);
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
    addLog(`Branching decision: depth=${depth}, score=${validation.score}, interactions=${interactionCount}`);
    
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

      // Build chat history
      const chatHistory = newMessages.map(msg => ({
        role: msg.role,
        content: msg.chatResponse
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
      const stepPrompt = conversationalIdeationPrompts.stepPrompts[currentStep]?.(projectInfo) || '';
      
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
        
        addLog('Framework builder updated with ideation progress');
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
      console.error('Error:', error);
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
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Project Design: Ideation</h1>
            <button 
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Exit
            </button>
          </div>
          <StageProgress currentStep={currentStep} ideationData={ideationData} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <Message key={index} message={msg} isUser={msg.role === 'user'} />
            ))}
            
            {isAiLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icons.Bot />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <motion.div className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }} />
                    <motion.div className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }} />
                    <motion.div className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }} />
                  </div>
                </div>
              </div>
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
      <div className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isAiLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!userInput.trim() || isAiLoading}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icons.Send />
            </button>
          </div>
          
          {/* Quick actions */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleSendMessage('💡 Get Ideas')}
              disabled={isAiLoading}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              💡 Get Ideas
            </button>
            <button
              onClick={() => handleSendMessage('📋 See Examples')}
              disabled={isAiLoading}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              📋 See Examples
            </button>
            <button
              onClick={() => handleSendMessage('❓ Help')}
              disabled={isAiLoading}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              ❓ Help
            </button>
          </div>
        </div>
      </div>

      {/* Mobile-optimized progress sidebar - slides in from right */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform translate-x-full lg:translate-x-0 transition-transform z-40">
        <div className="h-full overflow-y-auto">
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
                    <span className="font-medium text-green-700">✓ Course Theme:</span>
                    <p className="text-gray-600 mt-1">{ideationData.bigIdea}</p>
                  </div>
                )}
                {ideationData.essentialQuestion && (
                  <div className="p-2 bg-green-50 rounded">
                    <span className="font-medium text-green-700">✓ Driving Question:</span>
                    <p className="text-gray-600 mt-1">{ideationData.essentialQuestion}</p>
                  </div>
                )}
                {ideationData.challenge && (
                  <div className="p-2 bg-green-50 rounded">
                    <span className="font-medium text-green-700">✓ Student Challenge:</span>
                    <p className="text-gray-600 mt-1">{ideationData.challenge}</p>
                  </div>
                )}
                
                <div className="pt-3 text-gray-500">
                  <p className="font-medium">Next Steps:</p>
                  <ul className="mt-1 space-y-1">
                    <li>→ Design learning journey</li>
                    <li>→ Create assessments</li>
                    <li>→ Generate course materials</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Debug panel - minimal, professional */}
      {showDebug && (
        <div className="fixed bottom-4 right-4 w-96 max-w-[90vw] bg-gray-900 text-gray-100 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <span className="font-mono text-sm">Debug Console</span>
            <button onClick={() => setShowDebug(false)} className="text-gray-400 hover:text-white">×</button>
          </div>
          <div className="p-3 max-h-48 overflow-y-auto font-mono text-xs">
            {debugLogs.map((log, i) => (
              <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                [{log.time}] {log.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating debug toggle */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 left-4 p-2 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 transition-colors text-xs font-mono"
      >
        {showDebug ? 'Hide' : 'Debug'}
      </button>
    </div>
  );
};

export default ConversationalIdeationPro;