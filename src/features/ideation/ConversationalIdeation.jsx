// src/features/ideation/ConversationalIdeation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';
import StageHeader from '../../components/StageHeader.jsx';
import IdeationProgress from './IdeationProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalIdeationPrompts } from '../../ai/promptTemplates/conversationalIdeation.js';

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

const SuggestionCard = ({ suggestion, onClick, disabled }) => (
  <button
    onClick={() => onClick(suggestion)}
    disabled={disabled}
    className="block w-full text-left p-3 my-2 bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-500 rounded-r-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <p className="font-medium text-purple-800">{suggestion}</p>
  </button>
);

const ConversationalIdeation = ({ projectInfo, onComplete, onCancel }) => {
  // Normalize project info at component level
  const normalizeProjectInfo = (info) => {
    const corrections = {
      'MOdern Histry': 'Modern History',
      'Sophmores': 'Sophomores', 
      'Histry': 'History',
      'Sophmore': 'Sophomore',
      'elementry': 'elementary',
      'middel': 'middle',
      'highschool': 'high school'
    };
    
    const normalized = { ...info };
    Object.keys(normalized).forEach(key => {
      if (typeof normalized[key] === 'string') {
        Object.keys(corrections).forEach(mistake => {
          normalized[key] = normalized[key].replace(new RegExp(mistake, 'gi'), corrections[mistake]);
        });
      }
    });
    
    return normalized;
  };

  const normalizedProjectInfo = normalizeProjectInfo(projectInfo);

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
  
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isAiLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [messages, isAiLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  // Initialize conversation
  useEffect(() => {
    if (!isInitialized) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const initializeConversation = async () => {
    setIsAiLoading(true);
    console.log('🔄 Initializing conversational ideation...');
    console.log('📋 Original Project Info:', projectInfo);
    console.log('📋 Normalized Project Info:', normalizedProjectInfo);
    console.log('💡 Initial Ideation Data:', ideationData);
    
    try {
      const systemPrompt = conversationalIdeationPrompts.systemPrompt(normalizedProjectInfo, ideationData);
      const stepPrompt = conversationalIdeationPrompts.stepPrompts.bigIdea(normalizedProjectInfo);
      
      console.log('🤖 System Prompt:', systemPrompt);
      console.log('📝 Step Prompt:', stepPrompt.prompt);
      
      const response = await generateJsonResponse([], systemPrompt + `

This is the initial conversation start. You MUST provide a GROUNDING-ONLY introduction.

CRITICAL INSTRUCTIONS:
1. Start with the PROCESS OVERVIEW to ground the educator
2. Explain we're working on the Big Idea (step 1 of 3)
3. Explain what the Big Idea is and why it matters for authentic learning
4. Ask for their initial thoughts or ideas
5. DO NOT provide suggestions yet - this is pure grounding

Your chatResponse should ONLY include:
- Process grounding: "We're in the IDEATION stage where we build the foundation..."
- Step explanation: What the Big Idea is and why it matters
- Clear ask: "What themes or ideas are you considering for your Big Idea?"

CRITICAL: 
- currentStep MUST be "bigIdea"
- suggestions MUST be null (no suggestions in initial grounding)
- Focus on explanation and asking for their thoughts
- Keep it conversational but educational

Provide the response in the required JSON format.`);

      console.log('🎯 AI Response:', response);

      // Ensure we have the right structure
      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse || stepPrompt.prompt,
        currentStep: response.currentStep || 'bigIdea',
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: response.suggestions || stepPrompt.examples,
        isStageComplete: false,
        ideationProgress: {
          bigIdea: '',
          essentialQuestion: '',
          challenge: ''
        },
        timestamp: Date.now()
      };

      console.log('💬 AI Message:', aiMessage);
      setMessages([aiMessage]);
      
      if (response.ideationProgress) {
        setIdeationData(response.ideationProgress);
      }
      
      if (response.currentStep) {
        setCurrentStep(response.currentStep);
      }
      
    } catch (error) {
      console.error('❌ Error initializing conversation:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      // Fallback message with proper grounding (NO suggestions)
      const fallbackMessage = {
        role: 'assistant',
        chatResponse: `**Welcome to the IDEATION stage!** 🎯

We're in the IDEATION stage where we build the foundation for authentic learning. We'll define 3 key elements that work together:

1) **Big Idea** - the broad theme that anchors everything
2) **Essential Question** - the driving inquiry that sparks curiosity  
3) **Challenge** - the meaningful work students will create

These create a framework where students don't just learn about ${normalizedProjectInfo.subject} - they DO authentic work that mirrors real professionals.

**Right now we're working on STEP 1: Your Big Idea** 

The Big Idea is the broad theme that will anchor your entire ${normalizedProjectInfo.subject} project for ${normalizedProjectInfo.ageGroup}. It connects your curriculum to real-world issues that students actually care about, making learning feel relevant instead of abstract.

**What themes or ideas are you considering for your Big Idea?** 

Share any initial thoughts - we can explore and develop them together to create something meaningful for your ${normalizedProjectInfo.ageGroup}.`,
        currentStep: 'bigIdea',
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: null,
        isStageComplete: false,
        timestamp: Date.now()
      };
      
      console.log('🔄 Using fallback message:', fallbackMessage);
      setMessages([fallbackMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;

    console.log('📤 Sending message:', messageContent);
    console.log('💡 Current Ideation Data:', ideationData);
    console.log('📍 Current Step:', currentStep);

    const userMessage = {
      role: 'user',
      chatResponse: messageContent,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsAiLoading(true);

    try {
      const systemPrompt = conversationalIdeationPrompts.systemPrompt(normalizedProjectInfo, ideationData);
      
      // Format chat history for API
      const chatHistory = newMessages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || JSON.stringify(msg) }]
      }));

      console.log('🤖 System Prompt for response:', systemPrompt);
      console.log('💬 Chat History for API:', chatHistory);

      // Determine what step we should be on based on data (with fallback)
      let expectedStep = currentStep || 'bigIdea'; // Use current step as fallback
      if (ideationData.bigIdea?.trim() && !ideationData.essentialQuestion?.trim()) {
        expectedStep = 'essentialQuestion';
      } else if (ideationData.bigIdea?.trim() && ideationData.essentialQuestion?.trim() && !ideationData.challenge?.trim()) {
        expectedStep = 'challenge';
      } else if (ideationData.bigIdea?.trim() && ideationData.essentialQuestion?.trim() && ideationData.challenge?.trim()) {
        expectedStep = 'complete';
      } else if (!ideationData.bigIdea?.trim()) {
        expectedStep = 'bigIdea';
      }

      console.log('📍 Expected Step calculated as:', expectedStep);

      // Determine if this is the first interaction after initial grounding
      const userMessageCount = newMessages.filter(m => m.role === 'user').length;
      const isFirstUserResponse = userMessageCount === 1;

      const response = await generateJsonResponse(chatHistory, systemPrompt + `

CRITICAL INSTRUCTION FOR THIS RESPONSE:

Current progress indicates we should be working on: ${expectedStep}
This is ${isFirstUserResponse ? 'the FIRST user response - now provide suggestions' : 'a subsequent response'}.

You MUST:
1. Start with process grounding: "We're in the IDEATION stage..."
2. Clearly state which step we're on: "${expectedStep}"
3. Explain why this step matters for authentic learning
4. Make progress context clear
5. ${isFirstUserResponse ? 'NOW provide specific ask and 3 contextual suggestions' : 'Provide specific ask and 3 suggestions'}

FOLLOW THE MANDATORY RESPONSE STRUCTURE exactly.
- currentStep MUST be "${expectedStep}"
- Include process explanation every time
- ${isFirstUserResponse ? 'Now you can include suggestions since user has engaged' : 'Include suggestions as normal'}
- Ground the educator before giving suggestions`);

      console.log('🎯 AI Response:', response);

      const aiMessage = {
        role: 'assistant',
        ...response,
        timestamp: Date.now()
      };

      console.log('💬 AI Message to add:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      // Detect if user provided an answer that should be captured
      const isAnswerProvided = messageContent && !messageContent.toLowerCase().includes('help') && 
                               !messageContent.toLowerCase().includes('not sure') &&
                               !messageContent.toLowerCase().includes('?');
      
      // Update ideation data if provided
      if (response.ideationProgress) {
        console.log('📊 Updating ideation data:', response.ideationProgress);
        setIdeationData(response.ideationProgress);
      } else if (isAnswerProvided) {
        // If AI didn't provide progress update but user gave an answer, try to capture it
        const updatedData = { ...ideationData };
        if (currentStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = messageContent;
          console.log('📝 Captured Big Idea:', messageContent);
        } else if (currentStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = messageContent;
          console.log('📝 Captured Essential Question:', messageContent);
        } else if (currentStep === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = messageContent;
          console.log('📝 Captured Challenge:', messageContent);
        }
        setIdeationData(updatedData);
      }

      // Update current step (with fallback to prevent undefined)
      if (response.currentStep) {
        console.log('📍 Updating current step to:', response.currentStep);
        setCurrentStep(response.currentStep);
      } else if (!currentStep) {
        // Fallback if currentStep is somehow undefined
        console.log('📍 Fallback: Setting current step to bigIdea');
        setCurrentStep('bigIdea');
      }

      // Handle completion
      if (response.isStageComplete && response.ideationProgress) {
        const { bigIdea, essentialQuestion, challenge } = response.ideationProgress;
        if (bigIdea && essentialQuestion && challenge) {
          console.log('🎉 Ideation complete! Final data:', response.ideationProgress);
          setTimeout(() => {
            onComplete(response.ideationProgress);
          }, 2000); // Give time to read completion message
        }
      }

    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I encountered a technical issue, but I'm still here to help! Could you please try rephrasing your message?",
        currentStep,
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: null,
        isStageComplete: false,
        timestamp: Date.now()
      };
      
      console.log('🔄 Using error message:', errorMessage);
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEditStep = (stepKey) => {
    // Allow editing of previous steps
    setCurrentStep(stepKey);
    
    const editMessage = {
      role: 'assistant',
      chatResponse: `Let's revise your ${stepKey === 'bigIdea' ? 'Big Idea' : stepKey === 'essentialQuestion' ? 'Essential Question' : 'Challenge'}. 

What would you like to change or refine?`,
      currentStep: stepKey,
      interactionType: 'conversationalIdeation',
      currentStage: 'Ideation',
      suggestions: null,
      isStageComplete: false,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, editMessage]);
  };

  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop();

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <StageHeader 
          stage={PROJECT_STAGES.IDEATION} 
          showDescription={false}
          className="mb-4"
        />
        
        {/* Project Context */}
        <div className="bg-white border border-purple-200 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Subject:</span>
              <div className="font-medium text-gray-800">{normalizedProjectInfo.subject}</div>
            </div>
            <div>
              <span className="text-gray-600">Age Group:</span>
              <div className="font-medium text-gray-800">{normalizedProjectInfo.ageGroup}</div>
            </div>
            <div>
              <span className="text-gray-600">Scope:</span>
              <div className="font-medium text-gray-800">{normalizedProjectInfo.projectScope}</div>
            </div>
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
                const isStale = msg.role === 'assistant' && msg !== lastAiMessage;
                
                return (
                  <div key={index} className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {!isUser && (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <BotIcon />
                      </div>
                    )}
                    
                    <div className={`max-w-xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-purple-600 text-white' : 'bg-white text-slate-800'}`}>
                      {!isUser && (
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mb-2 border border-blue-200">
                          🔍 DEBUG: interactionType = "{msg.interactionType || 'undefined'}" | currentStage = "{msg.currentStage || 'undefined'}" | currentStep = "{msg.currentStep || 'undefined'}" | isStageComplete = {msg.isStageComplete ? 'true' : 'false'}
                        </div>
                      )}
                      {msg.chatResponse && (
                        <div className="text-sm leading-relaxed prose prose-slate max-w-none">
                          <Remark remarkPlugins={[remarkGfm]}>{msg.chatResponse}</Remark>
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-4">
                          {msg.suggestions.map((suggestion, i) => (
                            <SuggestionCard
                              key={i}
                              suggestion={suggestion}
                              onClick={handleSendMessage}
                              disabled={isAiLoading || isStale}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <UserIcon />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Loading */}
              {isAiLoading && (
                <div className="flex items-start gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <BotIcon />
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></div>
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex items-center bg-slate-100 rounded-xl p-2 border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500">
              <textarea
                ref={textareaRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Share your thoughts..."
                className="w-full bg-transparent focus:outline-none px-3 py-2 resize-none overflow-y-hidden leading-tight text-slate-800"
                rows="1"
                style={{maxHeight: '120px'}}
                disabled={isAiLoading}
              />
              <button 
                onClick={() => handleSendMessage()}
                disabled={isAiLoading || !userInput.trim()} 
                className="bg-purple-600 text-white p-3 rounded-lg disabled:bg-slate-300 self-end transition-colors shadow-sm hover:bg-purple-700"
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
            onEditStep={handleEditStep}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4">
        <div className="text-center">
          <button 
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalIdeation;