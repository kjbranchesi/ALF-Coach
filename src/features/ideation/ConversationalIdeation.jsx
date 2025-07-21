// src/features/ideation/ConversationalIdeation.jsx
// Simplified version with integrated context and minimal UI clutter

import React, { useState, useEffect, useRef } from 'react';
import StageHeader from '../../components/StageHeader.jsx';
import IdeationProgress from './IdeationProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalIdeationPrompts } from '../../ai/promptTemplates/conversationalIdeation.js';
import { useConversationRecovery } from '../../hooks/useConversationRecovery.js';
import { isFeatureEnabled } from '../../config/featureFlags.js';
import { renderMarkdown } from '../../lib/markdown.ts';
import { titleCase, formatAgeGroup, cleanEducatorInput, paraphraseIdea } from '../../lib/textUtils.ts';
import { ProgressionEngine } from '../../utils/ProgressionEngine.js';

// Icons
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-600">
    <path d="M12 8V4H8"/>
    <rect width="16" height="12" x="4" y="8" rx="2"/>
    <path d="M2 14h2"/>
    <path d="M20 14h2"/>
    <path d="M15 13v2"/>
    <path d="M9 13v2"/>
  </svg>
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

// Simple, clean suggestion card
const SuggestionCard = ({ suggestion, onClick, disabled, type = 'default' }) => {
  const styles = {
    idea: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    example: 'bg-green-50 hover:bg-green-100 border-green-200',
    refine: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    default: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  };

  const getType = () => {
    if (suggestion.toLowerCase().includes('what if')) return 'idea';
    if (suggestion.toLowerCase().includes('refine') || suggestion.toLowerCase().includes('improve')) return 'refine';
    return 'example';
  };

  return (
    <button
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className={`block w-full text-left p-4 my-2 ${styles[type || getType()]} border rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <p className="font-medium text-gray-800">{suggestion}</p>
    </button>
  );
};

// Help buttons - clean and simple
const HelpButton = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 mx-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const ConversationalIdeation = ({ projectInfo, onComplete, onCancel }) => {
  // Extract specific context from projectInfo
  const extractContext = () => {
    const context = {
      subject: projectInfo.subject || '',
      ageGroup: projectInfo.ageGroup || '',
      scope: projectInfo.projectScope || '',
      perspective: projectInfo.educatorPerspective || '',
      materials: projectInfo.initialMaterials || '',
      // Extract specific details from the perspective
      location: '',
      specificInterest: ''
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

    return context;
  };

  const projectContext = extractContext();
  
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
  
  // Simple depth tracking (no complex flow controller)
  const [explorationDepth, setExplorationDepth] = useState(0);
  const maxDepth = 2; // Keep it simple

  // Progression Engine for preventing loops
  const progressionEngine = useRef(new ProgressionEngine('Ideation', 'bigIdea'));
  
  // Initialize conversation recovery
  const { saveCheckpoint, recoverFromError, validateAiResponse } = useConversationRecovery(
    { ideationData, currentStep, messages },
    setMessages,
    'Ideation'
  );
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    if (!isInitialized && projectInfo) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isInitialized, projectInfo]);

  const initializeConversation = async () => {
    setIsAiLoading(true);
    
    try {
      const contextualIntro = generateContextualIntro();
      const subject = titleCase(projectContext.subject);
      const ageGroup = formatAgeGroup(projectContext.ageGroup);
      
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
        quickReplies: ['ideas', 'examples', 'help'],
        currentStep: 'bigIdea',
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
      
    } catch (error) {
      console.error('Error initializing conversation:', error);
      // Simple fallback
      const fallbackMessage = {
        role: 'assistant',
        chatResponse: "Welcome! Let's start with your Big Idea. What broad theme would you like to explore?",
        quickReplies: ['ideas', 'examples'],
        timestamp: Date.now()
      };
      setMessages([fallbackMessage]);
    }
    
    setIsAiLoading(false);
  };

  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;
    
    // Clear input
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
      // Track depth for "what if" selections
      if (messageContent.toLowerCase().includes('what if')) {
        setExplorationDepth(prev => prev + 1);
      } else {
        setExplorationDepth(0); // Reset on concrete selection
      }

      // Build chat history
      const chatHistory = newMessages.map(msg => ({
        role: msg.role,
        content: msg.chatResponse
      }));

      // Get AI response
      const systemPrompt = conversationalIdeationPrompts.systemPrompt(projectInfo, ideationData);
      const stepPrompt = conversationalIdeationPrompts.stepPrompts[currentStep] ? 
        conversationalIdeationPrompts.stepPrompts[currentStep](projectInfo) : '';
      
      // Simple depth check
      let depthInstruction = '';
      if (explorationDepth >= maxDepth && messageContent !== 'examples') {
        depthInstruction = ' The user has explored enough options. Provide 3 concrete examples they can select from. NO more "what if" questions.';
      }
      
      const response = await generateJsonResponse(
        chatHistory, 
        systemPrompt + '\n' + stepPrompt + depthInstruction
      );

      // Ensure response structure
      if (!response.interactionType) {
        response.interactionType = 'conversationalIdeation';
      }
      if (!response.currentStage) {
        response.currentStage = 'Ideation';
      }

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
      }
      
      // Update step if changed
      if (response.currentStep && response.currentStep !== currentStep) {
        setCurrentStep(response.currentStep);
        setExplorationDepth(0); // Reset depth for new step
      }

      // Handle completion
      if (response.isStageComplete && response.ideationProgress) {
        const { bigIdea, essentialQuestion, challenge } = response.ideationProgress;
        if (bigIdea && essentialQuestion && challenge) {
          setTimeout(() => {
            onComplete(response.ideationProgress);
          }, 2000);
        }
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I had trouble processing that. Could you try rephrasing?",
        quickReplies: ['ideas', 'examples'],
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
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <StageHeader 
          stage={PROJECT_STAGES.IDEATION} 
          showDescription={false}
          className="mb-4"
        />
        
        {/* Project Context Bar */}
        <div className="bg-white border border-purple-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Subject: <strong>{projectContext.subject}</strong></span>
              <span className="text-gray-600">Age: <strong>{projectContext.ageGroup}</strong></span>
              {projectContext.location && (
                <span className="text-gray-600">Focus: <strong>{projectContext.location}</strong></span>
              )}
            </div>
            <button 
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex gap-4 px-4 min-h-0">
        {/* Chat Area */}
        <div className="flex-grow flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Messages */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                
                return (
                  <div key={index} className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <BotIcon />
                      </div>
                    )}
                    
                    <div className={`max-w-2xl ${isUser ? 'order-1' : 'order-2'}`}>
                      <div className={`rounded-2xl px-6 py-4 ${
                        isUser ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {msg.chatResponse && (
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ 
                              __html: renderMarkdown(msg.chatResponse) 
                            }}
                          />
                        )}
                      </div>
                      
                      {/* Quick replies - simple inline buttons */}
                      {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && index === messages.length - 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.quickReplies.map((reply, i) => (
                            <HelpButton
                              key={i}
                              onClick={() => handleSendMessage(reply)}
                              disabled={isAiLoading}
                            >
                              {reply === 'ideas' ? '💡 Get Ideas' :
                               reply === 'examples' ? '📋 See Examples' :
                               reply === 'help' ? '❓ Get Help' : reply}
                            </HelpButton>
                          ))}
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && index === messages.length - 1 && (
                        <div className="mt-4">
                          {msg.suggestions.map((suggestion, i) => (
                            <SuggestionCard
                              key={i}
                              suggestion={suggestion}
                              onClick={handleSendMessage}
                              disabled={isAiLoading}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isUser && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center order-2">
                        <UserIcon />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {isAiLoading && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <BotIcon />
                  </div>
                  <div className="bg-slate-100 text-slate-600 rounded-2xl px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-slate-200 p-4">
            <div className="flex items-end gap-4 max-w-3xl mx-auto">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts..."
                disabled={isAiLoading}
                className="flex-grow px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!userInput.trim() || isAiLoading}
                className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Sidebar */}
        <div className="w-80 flex-shrink-0">
          <IdeationProgress 
            ideationData={ideationData}
            currentStep={currentStep}
            onEditStep={() => {}} // Disable editing for now
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationalIdeation;