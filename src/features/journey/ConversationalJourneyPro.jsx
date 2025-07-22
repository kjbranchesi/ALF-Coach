// src/features/journey/ConversationalJourneyPro.jsx
// Professional UI with intelligent journey mapping for ALF framework

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StageHeader from '../../components/StageHeader.jsx';
import JourneyProgress from './JourneyProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalJourneyPrompts } from '../../ai/promptTemplates/conversationalJourney.js';
import { useConversationRecovery } from '../../hooks/useConversationRecovery.js';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup, getPedagogicalContext } from '../../lib/textUtils.ts';
import { ProgressionEngine } from '../../utils/ProgressionEngine.js';
import { getFrameworkBuilder } from '../../utils/ComprehensiveFrameworkBuilder.js';

// Reuse icons from ideation
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
  Map: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/>
      <line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  ),
  Milestone: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
    </svg>
  ),
  Activity: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Assessment: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
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

// Journey stage progress indicator
const JourneyStageProgress = ({ currentStep, journeyData }) => {
  const steps = [
    { key: 'milestones', label: 'Milestones', icon: Icons.Milestone, count: journeyData.milestones?.length || 0 },
    { key: 'activities', label: 'Activities', icon: Icons.Activity, count: journeyData.activities?.length || 0 },
    { key: 'assessments', label: 'Assessments', icon: Icons.Assessment, count: journeyData.assessments?.length || 0 }
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm">
      {steps.map((step, index) => {
        const isActive = currentStep === step.key;
        const hasContent = step.count > 0;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all ${
              isActive ? 'bg-white shadow-sm text-gray-900' : 
              hasContent ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Icon />
              <span className="font-medium">{step.label}</span>
              {hasContent && <span className="text-xs bg-green-100 text-green-700 px-1.5 rounded-full">{step.count}</span>}
            </div>
            {index < steps.length - 1 && <Icons.ChevronRight />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Milestone card for visual journey mapping
const MilestoneCard = ({ milestone, index, onClick, isActive }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.1 }}
    onClick={onClick}
    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
      isActive ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
    }`}
  >
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
      }`}>
        {index + 1}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{milestone.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
        {milestone.duration && (
          <span className="text-xs text-gray-500 mt-2 inline-block">Duration: {milestone.duration}</span>
        )}
      </div>
    </div>
  </motion.div>
);

const ConversationalJourneyPro = ({ projectInfo, ideationData, onComplete, onCancel }) => {
  // State management
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [journeyData, setJourneyData] = useState({
    milestones: [],
    activities: [],
    assessments: [],
    timeline: '',
    resources: []
  });
  const [currentStep, setCurrentStep] = useState('milestones');
  const [currentMilestone, setCurrentMilestone] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const progressionEngine = useRef(new ProgressionEngine('Journey', 'milestones'));
  const frameworkBuilder = useRef(getFrameworkBuilder());

  // Extract context with ideation data
  const projectContext = useMemo(() => ({
    ...projectInfo,
    ...ideationData,
    pedagogical: getPedagogicalContext(projectInfo.ageGroup || '')
  }), [projectInfo, ideationData]);

  // Journey-specific validation
  const validateJourneyInput = (content, step) => {
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    
    switch (step) {
      case 'milestones':
        if (wordCount < 3) {
          return { valid: false, feedback: 'Please provide a clear milestone description' };
        }
        return { valid: true, score: 'high' };
        
      case 'activities':
        if (!content.toLowerCase().match(/students will|learners will|they will/)) {
          return { valid: false, feedback: 'Describe what students will DO' };
        }
        return { valid: true, score: 'high' };
        
      case 'assessments':
        if (!content.toLowerCase().match(/assess|evaluate|demonstrate|measure/)) {
          return { valid: false, feedback: 'How will students show their learning?' };
        }
        return { valid: true, score: 'high' };
        
      default:
        return { valid: true, score: 'medium' };
    }
  };

  // Conversation recovery
  const { saveCheckpoint } = useConversationRecovery(
    { journeyData, currentStep, messages },
    setMessages,
    'Journey'
  );

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized && projectInfo && ideationData) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isInitialized, projectInfo, ideationData]);

  const initializeConversation = async () => {
    setIsAiLoading(true);
    
    try {
      const welcomeMessage = `Great work on your project foundation! Now let's design the learning journey.

**Your Project:**
- **Big Idea:** ${ideationData.bigIdea}
- **Essential Question:** ${ideationData.essentialQuestion}
- **Challenge:** ${ideationData.challenge}

Let's map out the **milestones** - the key checkpoints where students will demonstrate progress. 

Think of 3-5 major milestones that will guide students from introduction to completing their ${ideationData.challenge}.

What's your first milestone?`;

      const aiMessage = {
        role: 'assistant',
        chatResponse: welcomeMessage,
        currentStep: 'milestones',
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
    } catch (error) {
      console.error('Init error:', error);
    }
    
    setIsAiLoading(false);
  };

  // Handle message sending
  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;
    
    if (messageContent === userInput) {
      setUserInput('');
    }

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
      // Validate input
      const validation = validateJourneyInput(messageContent, currentStep);
      
      // Build chat history
      const chatHistory = newMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || '' }]
      }));

      // Dynamic instruction based on current step
      let dynamicInstruction = '';
      if (!validation.valid) {
        dynamicInstruction = `Guide the user: ${validation.feedback}`;
      } else if (currentStep === 'milestones' && journeyData.milestones.length < 3) {
        dynamicInstruction = 'Help them add more milestones (need 3-5 total)';
      } else if (currentStep === 'activities' && currentMilestone < journeyData.milestones.length - 1) {
        dynamicInstruction = 'Move to activities for the next milestone';
      } else {
        dynamicInstruction = 'Guide them to the next phase';
      }

      // Get AI response
      const systemPrompt = conversationalJourneyPrompts.systemPrompt(projectInfo, ideationData, journeyData);
      const stepPrompt = conversationalJourneyPrompts.stepPrompts[currentStep]?.(projectInfo, journeyData) || '';
      
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
      
      if (response.journeyProgress) {
        setJourneyData(response.journeyProgress);
        
        // Update framework builder
        frameworkBuilder.current.updateFromJourney(response.journeyProgress);
      }
      
      if (response.currentStep && response.currentStep !== currentStep) {
        setCurrentStep(response.currentStep);
      }

      if (response.isStageComplete) {
        setTimeout(() => onComplete(response.journeyProgress), 2000);
      }

      saveCheckpoint({
        journeyData: response.journeyProgress || journeyData,
        currentStep: response.currentStep || currentStep,
        messages: [...newMessages, aiMessage]
      });

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        chatResponse: "Let me help you design your learning journey.",
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

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-semibold text-gray-900">Project Design: Learning Journey</h1>
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
          <JourneyStageProgress currentStep={currentStep} journeyData={journeyData} />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4">
              <div className="space-y-6">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <Icons.Bot />
                      </div>
                    )}
                    <div className={`max-w-[80%] md:max-w-[70%]`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface border border-slate-200 text-slate-800'
                      }`}>
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={renderMarkdown(String(msg.chatResponse))}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
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

              {/* Visual milestone mapping */}
              {journeyData.milestones.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 p-4 bg-gray-50 rounded-lg"
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Icons.Map /> Your Learning Journey Map
                  </h3>
                  <div className="grid gap-3">
                    {journeyData.milestones.map((milestone, index) => (
                      <MilestoneCard
                        key={index}
                        milestone={milestone}
                        index={index}
                        isActive={currentMilestone === index && currentStep === 'activities'}
                        onClick={() => setCurrentMilestone(index)}
                      />
                    ))}
                  </div>
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
                  placeholder={
                    currentStep === 'milestones' ? "Describe a key milestone..." :
                    currentStep === 'activities' ? "What will students do?" :
                    "How will you assess learning?"
                  }
                  disabled={isAiLoading}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 transition-all"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!userInput.trim() || isAiLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  <Icons.Send />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Progress sidebar */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">Your Progress</h2>
          </div>
          <JourneyProgress 
            journeyData={journeyData}
            currentStep={currentStep}
            ideationData={ideationData}
          />
          
          {/* Framework building preview */}
          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Curriculum Structure
            </h3>
            <div className="space-y-2 text-xs">
              <div className="text-gray-500">
                Building {journeyData.milestones.length} units from your milestones
              </div>
              {journeyData.milestones.map((milestone, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded">
                  <span className="font-medium">Unit {i + 1}:</span> {milestone.title}
                </div>
              ))}
            </div>
          </div>
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
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Your Progress</h2>
                <button 
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Icons.X />
                </button>
              </div>
              <JourneyProgress 
                journeyData={journeyData}
                currentStep={currentStep}
                ideationData={ideationData}
              />
              
              {/* Framework building preview */}
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Curriculum Structure
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="text-gray-500">
                    Building {journeyData.milestones.length} units from your milestones
                  </div>
                  {journeyData.milestones.map((milestone, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded">
                      <span className="font-medium">Unit {i + 1}:</span> {milestone.title}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConversationalJourneyPro;