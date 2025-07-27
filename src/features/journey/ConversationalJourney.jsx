// src/features/journey/ConversationalJourney.jsx
import React, { useState, useEffect, useRef } from 'react';
import StageHeader from '../../components/StageHeader.jsx';
import JourneyProgress from './JourneyProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalJourneyPrompts } from '../../ai/promptTemplates/conversationalJourney.js';

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
    className="block w-full text-left p-3 my-2 bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500 rounded-r-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <p className="font-medium text-blue-800">{suggestion}</p>
  </button>
);

const WhatIfCard = ({ suggestion, onClick, disabled }) => (
  <button
    onClick={() => onClick(suggestion)}
    disabled={disabled}
    className="block w-full text-left p-3 my-2 bg-amber-50 hover:bg-amber-100 border-l-4 border-amber-400 rounded-r-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex items-start gap-2">
      <span className="text-amber-600 font-bold text-sm">💭</span>
      <p className="font-medium text-amber-800">{suggestion}</p>
    </div>
  </button>
);

const QuickSelectCard = ({ suggestion, onClick, disabled, isPrimary = false }) => (
  <button
    onClick={() => onClick(suggestion)}
    disabled={disabled}
    className={`inline-block px-6 py-3 mx-2 my-2 font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
      isPrimary 
        ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600' 
        : 'bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-300 hover:border-blue-400'
    }`}
  >
    {suggestion}
  </button>
);

const HelpButton = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-block px-4 py-2 mx-1 my-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    💡 {children}
  </button>
);

const ConversationalJourney = ({ projectInfo, ideationData, onComplete, onCancel }) => {
  // Validation functions for step completion
  const isCompleteResponse = (content, step) => {
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const lower = trimmed.toLowerCase();
    
    switch (step) {
      case 'phases':
        // Reject content topics and casual language
        const isPersonalInterest = /^(i want|i would like|i'd like|looking at|examine|study|research|explore|i'm interested in|i think about|my students|i teach|about|it's about)/i.test(trimmed);
        const isContentTopic = /^(the |a |an )(civil war|world war|renaissance|industrial revolution|photosynthesis|ecosystems|algebra|geometry)/i.test(trimmed);
        const isCasualResponse = /^(yeah|yea|well|so|um|uh|like|just|maybe|perhaps|kinda|sorta)/i.test(trimmed);
        const isIncompleteFragment = wordCount < 3 || trimmed.length < 10;
        
        if (isPersonalInterest || isContentTopic || isCasualResponse || isIncompleteFragment) {
          return false;
        }
        
        // Should contain process-oriented language
        const hasProcessLanguage = /(research|investigate|analyze|develop|create|design|explore|build|present|communicate|reflect)/i.test(trimmed);
        return hasProcessLanguage && wordCount >= 2;
      
      case 'activities':
        // Activities should describe what students DO
        const hasActionWords = /(students|teams|individuals|learners).*(conduct|analyze|create|design|develop|build|investigate|explore|present|communicate|collaborate|document)/i.test(trimmed);
        const isSpecific = wordCount >= 8 && trimmed.length > 30;
        const notVague = !/(learn about|study|read about|understand|know)/i.test(trimmed);
        
        return hasActionWords && isSpecific && notVague;
      
      case 'resources':
        // Resources should be specific and actionable
        const hasSpecificResources = /(expert|specialist|professional|database|tool|equipment|site|archive|collection|platform)/i.test(trimmed);
        const isDetailed = wordCount >= 5 && trimmed.length > 20;
        
        return hasSpecificResources && isDetailed;
      
      default:
        return wordCount >= 3;
    }
  };

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [journeyData, setJourneyData] = useState({
    phases: [], // Will contain objects like { title: "Phase Name", activities: "Description" }
    resources: []
  });
  const [currentStep, setCurrentStep] = useState('phases');
  const [isInitialized, setIsInitialized] = useState(false);
  const [consecutiveHelpRequests, setConsecutiveHelpRequests] = useState(0);
  const [contextShown, setContextShown] = useState(false);
  
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
    console.log('🔄 Initializing conversational learning journey for', projectInfo.subject);
    
    try {
      const systemPrompt = conversationalJourneyPrompts.systemPrompt(projectInfo, ideationData, journeyData);
      
      const response = await generateJsonResponse([], systemPrompt + `

This is the INITIAL conversation start. You MUST provide STAGE TRANSITION and grounding.

MANDATORY INITIAL RESPONSE RULES:
1. Acknowledge the completed ideation (Big Idea, Essential Question, Challenge)
2. Explain the Learning Journey stage and why it matters
3. Explain we're working on Learning Phases (step 1 of 3)
4. Ask for their initial thoughts on learning phases
5. ABSOLUTELY NO SUGGESTIONS - this is pure grounding

REQUIRED JSON RESPONSE:
{
  "chatResponse": "Your stage transition and grounding message here",
  "currentStep": "phases", 
  "interactionType": "conversationalJourney",
  "currentStage": "Learning Journey",
  "suggestions": null,
  "isStageComplete": false,
  "dataToStore": null,
  "journeyProgress": {
    "phases": [],
    "resources": []
  }
}

CRITICAL: suggestions field MUST be null. No arrays, no examples, just null.`);

      console.log('🎯 AI Response received successfully');

      // Prepare fallback grounding message with educational sophistication
      const pedagogicalContext = getPedagogicalContext(projectInfo.ageGroup);
      const fallbackGroundingMessage = `**Exceptional work! Your ideation foundation is pedagogically sound.** 🎯

You've established:
- **Big Idea:** "${ideationData.bigIdea}"
- **Essential Question:** "${ideationData.essentialQuestion}"  
- **Challenge:** "${ideationData.challenge}"

Now we enter the **LEARNING JOURNEY** stage - where we architect HOW students develop mastery. Educational research (Wiggins & McTighe's Understanding by Design) emphasizes backward design: starting with your authentic Challenge and mapping the learning progression to get there.

**We begin with Learning Phases** - the major cognitive stages ${projectInfo.ageGroup || 'your students'} will progress through. ${pedagogicalContext?.developmentalStage === 'Elementary/Primary' ? 'Research shows elementary learners need concrete investigation phases that build systematically.' : pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ? 'Adolescent development research indicates phases should balance structure with autonomy.' : 'These should mirror professional practice in your field.'}

**Critical distinction:** Phases describe learning PROCESSES (like "Research & Investigation"), not content TOPICS (like "The Civil War").

**What are your initial thoughts on the 2-4 major learning phases that will prepare students for "${ideationData.challenge}"?**

Consider the cognitive progression and skill development needed for authentic work.`;

      // Ensure we have the right structure and force fallback if needed
      const aiMessage = {
        role: 'assistant',
        chatResponse: (response?.chatResponse && response.chatResponse.trim()) ? response.chatResponse : fallbackGroundingMessage,
        currentStep: response?.currentStep || 'phases',
        interactionType: 'conversationalJourney',
        currentStage: 'Learning Journey',
        suggestions: response?.suggestions || null,
        isStageComplete: false,
        journeyProgress: {
          phases: [],
          resources: []
        },
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
      setContextShown(true); // Mark that we've shown the initial context
      
      if (response.journeyProgress) {
        setJourneyData(response.journeyProgress);
      }
      
      if (response.currentStep) {
        setCurrentStep(response.currentStep);
      }
      
    } catch (error) {
      console.error('❌ Error initializing conversation:', error.message);
      console.log('🔧 Using fallback message');
      
      // Fallback message with proper grounding (NO suggestions)
      const fallbackMessage = {
        role: 'assistant',
        chatResponse: `**Excellent! Your ideation foundation is complete** 🎯

Your Big Idea: "${ideationData.bigIdea}"
Essential Question: "${ideationData.essentialQuestion}"  
Challenge: "${ideationData.challenge}"

Now we're moving to the **LEARNING JOURNEY** stage where we map HOW students will develop the knowledge and skills needed for your Challenge. We'll design the learning process in phases that build toward authentic work, not just content coverage.

**We're starting with Learning Phases** - the major stages ${projectInfo.ageGroup || 'your students'} will move through. These should be process-based (like "Research & Investigation") rather than content-based (like "The Civil War").

**What are your initial thoughts on the major learning phases that will prepare students for "${ideationData.challenge}"?**

Think about the logical progression of skills and knowledge they'll need to build.`,
        currentStep: 'phases',
        interactionType: 'conversationalJourney',
        currentStage: 'Learning Journey',
        suggestions: null,
        isStageComplete: false,
        timestamp: Date.now()
      };
      
      setMessages([fallbackMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async (messageContent = userInput) => {
    if (!messageContent.trim() || isAiLoading) return;

    console.log('📤 Sending message:', messageContent);
    console.log('💡 Current Journey Data:', journeyData);
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
      const systemPrompt = conversationalJourneyPrompts.systemPrompt(projectInfo, ideationData, journeyData);
      
      // Format chat history for API
      const chatHistory = newMessages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || msg.content || 'Continuing conversation...' }]
      }));

      // Determine what step we should be on based on actual journey data completion
      // This prevents premature step advancement and resource requests
      const hasMinimumPhases = journeyData.phases?.length >= 2;
      const hasPhaseActivities = journeyData.phases?.length > 0 && journeyData.phases.every(p => p.activities);
      
      let expectedStep;
      if (!hasMinimumPhases) {
        expectedStep = 'phases';
      } else if (hasMinimumPhases && !hasPhaseActivities) {
        expectedStep = 'activities'; 
      } else if (hasPhaseActivities && !journeyData.resources?.length) {
        expectedStep = 'resources';
      } else {
        expectedStep = 'complete';
      }
      
      // Override with current step only if it's not ahead of data completion
      if (currentStep === 'phases' || (currentStep === 'activities' && hasMinimumPhases) || (currentStep === 'resources' && hasPhaseActivities)) {
        expectedStep = currentStep;
      }

      // Better detection of when user provides actual content vs asking for help
      const isHelpRequest = messageContent && (
        messageContent.toLowerCase().includes('not sure') ||
        messageContent.toLowerCase().includes('no idea') ||
        messageContent.toLowerCase().includes('any suggestions') ||
        messageContent.toLowerCase().includes('help') ||
        messageContent.toLowerCase().includes('suggestions?') ||
        messageContent.toLowerCase().includes('give me some') ||
        messageContent.toLowerCase().includes('i need some') ||
        messageContent.toLowerCase().includes('ideas') ||
        messageContent.toLowerCase().includes('examples') ||
        messageContent.toLowerCase().includes('can you expand') ||
        messageContent.toLowerCase().includes('could you expand') ||
        messageContent.toLowerCase().includes('turn it into') ||
        messageContent.toLowerCase().includes('make it into') ||
        messageContent.toLowerCase().includes('could you help') ||
        messageContent.toLowerCase().includes('can you help') ||
        messageContent.trim().length <= 5
      );

      // Detect if user clicked a "What if" suggestion
      const isWhatIfSelection = messageContent && messageContent.toLowerCase().startsWith('what if');

      // Detect if user selected from previous suggestions (should be captured as complete)
      const previousSuggestions = lastAiMessage?.suggestions || [];
      
      // Separate "What if" coaching suggestions from concrete suggestions
      const isConcreteSelection = messageContent && previousSuggestions.some(suggestion => 
        !suggestion.toLowerCase().startsWith('what if') && 
        !suggestion.toLowerCase().startsWith('make it more') &&
        !suggestion.toLowerCase().startsWith('connect it more') &&
        !suggestion.toLowerCase().startsWith('focus it on') &&
        !suggestion.toLowerCase().includes('refine') &&
        !suggestion.toLowerCase().includes('keep and continue') &&
        (
          suggestion.toLowerCase().includes(messageContent.toLowerCase().trim()) ||
          messageContent.toLowerCase().trim().includes(suggestion.toLowerCase()) ||
          messageContent.toLowerCase().trim() === suggestion.toLowerCase()
        )
      );
      
      // This is for concrete suggestions that can be captured directly
      const isSuggestionSelection = isConcreteSelection;

      // Check if response meets basic quality standards
      const meetsBasicQuality = messageContent && 
        !isHelpRequest &&
        !isWhatIfSelection &&
        isCompleteResponse(messageContent, expectedStep);

      // Track if we've already offered refinement for this response (using lastAiMessage from above)
      const wasRefinementOffered = lastAiMessage?.chatResponse?.includes('refine') || 
                                   lastAiMessage?.chatResponse?.includes('strengthen') ||
                                   lastAiMessage?.chatResponse?.includes('move forward with');

      // Extract the proposed response from refinement offer if user wants to keep it
      // Look for patterns like "move forward with 'Learning Phase'" or similar
      const proposedResponseMatch = lastAiMessage?.chatResponse?.match(/move forward with ['"]([^'"]+)['"]|with ['"]([^'"]+)['"]|phases.*?['"]([^'"]+)['"]|activities.*?['"]([^'"]+)['"]|resources.*?['"]([^'"]+)['"]/i);
      const proposedResponse = proposedResponseMatch ? (proposedResponseMatch[1] || proposedResponseMatch[2] || proposedResponseMatch[3] || proposedResponseMatch[4] || proposedResponseMatch[5]) : null;

      // Detect confirmation responses after selections
      const isConfirmation = messageContent && /^(okay|yes|sure|good|that works?|sounds good|perfect|right|correct|move forward|let's go|continue|keep and continue|keep)(\s+(yes|sounds?\s+good|works?|with that|and continue))?$/i.test(messageContent.trim());

      // Detect poor quality responses that should be rejected
      const isPoorQualityResponse = messageContent && 
        messageContent.trim().length > 10 && 
        !isHelpRequest && 
        !isWhatIfSelection && 
        !isCompleteResponse(messageContent, expectedStep);

      // Check if journey is complete - all data captured and user is on complete step
      const isJourneyComplete = currentStep === 'complete';

      // Track consecutive help requests for throttling
      if (isHelpRequest) {
        setConsecutiveHelpRequests(prev => prev + 1);
      } else if (meetsBasicQuality || isConfirmation || isSuggestionSelection) {
        // Reset counter when user provides actual content
        setConsecutiveHelpRequests(0);
      }

      // Check if we should throttle help requests
      const shouldThrottleHelp = consecutiveHelpRequests >= 2;

      // Determine response type based on content quality
      let responseInstruction;
      if (isJourneyComplete) {
        responseInstruction = `Learning Journey is complete! Provide a summary of their learning phases and resources, then ask if they want to move to Student Deliverables stage. Do not provide any more suggestions.`;
      } else if (meetsBasicQuality && !wasRefinementOffered) {
        // First time seeing a quality response - offer refinement
        responseInstruction = `User provided a quality ${expectedStep}: "${messageContent}". This meets the basic criteria! Acknowledge it's good, but offer refinement opportunity. Say something like "That's a solid ${expectedStep}! Would you like to refine it further to make it even more specific to your course, or shall we move forward with '${messageContent}'?" Do NOT capture yet - wait for their choice.`;
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // User confirmed they want to keep the previously proposed response
        responseInstruction = `User confirmed they want to keep the proposed ${expectedStep}: "${proposedResponse}". Update journeyProgress.phases with this new phase titled "${proposedResponse}". Check if we have minimum 2 phases total - if yes, offer to move to next step. If not, ask for one more phase. NO suggestions.`;
      } else if (meetsBasicQuality && wasRefinementOffered && !isConfirmation) {
        // User provided a refinement after we offered the opportunity
        responseInstruction = `User provided a refined ${expectedStep}: "${messageContent}". Update journeyProgress.phases with this new phase. Check if we have minimum 2 phases total - if yes, offer to move to next step. If not, ask for one more phase. NO suggestions.`;
      } else if (isPoorQualityResponse) {
        // Handle poor quality responses with coaching
        responseInstruction = `User provided poor quality content: "${messageContent}". This is a POOR QUALITY response that should be REJECTED. ${expectedStep === 'phases' ? 'This appears to be content topics rather than learning processes.' : expectedStep === 'activities' ? 'This appears to be passive learning rather than active student engagement.' : 'This needs to be more specific and actionable.'} Coach them toward the proper format and provide 3 "What if" suggestions to help them reframe properly. Stay on current step.`;
      } else if (isWhatIfSelection) {
        // Extract the core concept from the "What if" suggestion for development
        const extractConcept = (whatIfText) => {
          if (whatIfText.toLowerCase().includes('research')) return 'Research & Investigation';
          if (whatIfText.toLowerCase().includes('analysis')) return 'Analysis & Interpretation';
          if (whatIfText.toLowerCase().includes('creation')) return 'Creation & Development';
          const match = whatIfText.match(/['"'](.*?)['"']|was\s+['"']?(.*?)['"']?[\s,]/i);
          return match ? (match[1] || match[2]) : 'this concept';
        };
        
        const coreConcept = extractConcept(messageContent);
        responseInstruction = `User selected a "What if" suggestion about "${coreConcept}". Don't capture this as their final answer. Instead, help them develop "${coreConcept}" into their own ${expectedStep} phrasing. Ask them to make it their own - how would THEY phrase this concept as their ${expectedStep}?`;
      } else if (isHelpRequest && !shouldThrottleHelp) {
        responseInstruction = `User asked for help with ${expectedStep}. Provide 3 "What if" coaching suggestions to help them develop their thinking. Stay on current step.`;
      } else if (isHelpRequest && shouldThrottleHelp) {
        responseInstruction = `User has requested help ${consecutiveHelpRequests} times. Provide gentle encouragement to move forward: "I can see you're looking for the perfect ${expectedStep}! Let's try locking in one option and moving forward. You can always refine later. Would you like to choose from previous suggestions or share your own approach?"`;
      } else if (expectedStep === 'phases' && messageContent && messageContent.toLowerCase().includes('resource')) {
        // Prevent premature resource discussions
        responseInstruction = `User mentioned resources but we need to capture learning phases first. Redirect: "I can see you're thinking ahead to resources! That's great planning. But first, let's nail down the learning phases students will go through. What are the major stages of learning for this project?"`;
      } else if (messageContent && messageContent.trim().length > 5) {
        // User provided some content but it's incomplete
        responseInstruction = `User provided incomplete content: "${messageContent}". Acknowledge their start but ask them to develop it further into a complete ${expectedStep}. Provide 3 "What if" suggestions to help them expand their thinking. Stay on current step.`;
      } else {
        responseInstruction = `User provided unclear input. Ask for clarification about ${expectedStep}.`;
      }

      const response = await generateJsonResponse(chatHistory, systemPrompt + `

Current step: ${expectedStep}
Context shown before: ${contextShown}
${responseInstruction}

CONTEXT RULES:
- If contextShown is true, do NOT repeat full Big Idea, Essential Question, or Challenge again
- Use brief references like "For your [project theme]" or "Building toward your Challenge"
- Keep responses focused on current step, not project overview

Respond in JSON format with chatResponse, currentStep, suggestions, and journeyProgress.`);

      console.log('🎯 AI Response:', response);

      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse,
        suggestions: response.suggestions,
        isStageComplete: response.isStageComplete,
        journeyProgress: response.journeyProgress,
        interactionType: 'conversationalJourney', // Force correct interaction type
        currentStage: 'Learning Journey', // Force correct stage
        currentStep: response.currentStep || expectedStep,
        timestamp: Date.now()
      };

      console.log('💬 AI Message to add:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      // Update journey data
      if (response.journeyProgress) {
        console.log('📊 AI provided journey progress:', response.journeyProgress);
        setJourneyData(response.journeyProgress);
      }

      // Only update step if user actually provided complete content or confirmed selection
      const userProvidedContent = (meetsBasicQuality && (isConfirmation || wasRefinementOffered)) || isSuggestionSelection;
      
      if (userProvidedContent || isSuggestionSelection || (isConfirmation && wasRefinementOffered && proposedResponse)) {
        const nextStep = expectedStep === 'phases' ? 'activities' : 
                        expectedStep === 'activities' ? 'resources' : 
                        expectedStep === 'resources' ? 'complete' : expectedStep;
        
        console.log('📍 Advancing step from', expectedStep, 'to', nextStep);
        setCurrentStep(nextStep);
      } else {
        // For help requests, coaching, etc. - stay on current step
        console.log('📍 Staying on current step:', expectedStep);
        setCurrentStep(expectedStep);
      }

      // Handle completion
      if (response.isStageComplete && response.journeyProgress) {
        console.log('🎉 Learning Journey complete! Final data:', response.journeyProgress);
        setTimeout(() => {
          onComplete(response.journeyProgress);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I encountered a technical issue, but I'm still here to help! Could you please try rephrasing your message?",
        currentStep: currentStep,
        interactionType: 'conversationalJourney',
        currentStage: 'Learning Journey',
        suggestions: null,
        isStageComplete: false,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop();

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4">
        <StageHeader 
          stage={PROJECT_STAGES.LEARNING_JOURNEY} 
          showDescription={false}
          className="mb-4"
        />
        
        {/* Project Context */}
        <div className="bg-white border border-blue-200 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Big Idea:</span>
              <div className="font-medium text-gray-800">{ideationData.bigIdea}</div>
            </div>
            <div>
              <span className="text-gray-600">Essential Question:</span>
              <div className="font-medium text-gray-800">{ideationData.essentialQuestion}</div>
            </div>
            <div>
              <span className="text-gray-600">Challenge:</span>
              <div className="font-medium text-gray-800">{ideationData.challenge}</div>
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
                    
                    <div className={`max-w-xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'}`}>
                      {!isUser && process.env.NODE_ENV === 'development' && (
                        <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded mb-2 border border-green-200">
                          🔍 DEBUG: interactionType = "{msg.interactionType || 'undefined'}" | currentStage = "{msg.currentStage || 'undefined'}" | currentStep = "{msg.currentStep || 'undefined'}" | isStageComplete = {msg.isStageComplete ? 'true' : 'false'}
                        </div>
                      )}
                      {msg.chatResponse && (
                        <div className="text-sm leading-relaxed max-w-none">
                          {isUser ? (
                            <div 
                              className="text-white"
                              style={{whiteSpace: 'pre-wrap'}}
                              dangerouslySetInnerHTML={{
                                __html: msg.chatResponse
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                  .replace(/\n/g, '<br/>')
                              }}
                            />
                          ) : (
                            <div 
                              className="space-y-3"
                              dangerouslySetInnerHTML={{
                                __html: msg.chatResponse
                                  .replace(/^\*\*(.*?)\*\*$/gm, '<h3 class="text-lg font-semibold text-blue-800 mb-2 mt-4">$1</h3>')
                                  .replace(/^(\d+)\)\s+(.*?)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center justify-center mt-0.5">$1</span><span class="text-gray-700">$2</span></div>')
                                  .replace(/^[•-]\s+(.*?)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-2"></span><span class="text-gray-700">$1</span></div>')
                                  .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-gray-800">$1</span>')
                                  .replace(/\*(.*?)\*/g, '<em class="text-blue-700">$1</em>')
                                  .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 leading-relaxed">')
                                  .replace(/\n/g, '<br/>')
                                  .replace(/^/, '<p class="mb-3 text-gray-700 leading-relaxed">')
                                  .replace(/$/, '</p>')
                                  .replace(/<p class="[^"]*"><\/p>/g, '')
                              }}
                            />
                          )}
                        </div>
                      )}
                      
                      {/* Help Buttons for messages without suggestions */}
                      {!isUser && (!msg.suggestions || msg.suggestions.length === 0) && 
                       (msg.chatResponse?.includes('?') || msg.chatResponse?.includes('What are your') || msg.chatResponse?.includes('Share your')) && (
                        <div className="mt-4 text-center">
                          <HelpButton 
                            onClick={() => handleSendMessage('I need some ideas and examples')}
                            disabled={isAiLoading || isStale}
                          >
                            Give me some ideas
                          </HelpButton>
                          <HelpButton 
                            onClick={() => handleSendMessage('Can you provide examples?')}
                            disabled={isAiLoading || isStale}
                          >
                            Show examples
                          </HelpButton>
                        </div>
                      )}

                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-4">
                          {/* Check if these are quick select buttons */}
                          {msg.suggestions.length === 2 && 
                           (msg.suggestions.includes('Keep and Continue') || msg.suggestions.includes('Refine Further') ||
                            msg.suggestions.some(s => ['Yes', 'No', 'Continue', 'Refine'].includes(s))) ? (
                            <div className="text-center">
                              {msg.suggestions.map((suggestion, i) => (
                                <QuickSelectCard
                                  key={i}
                                  suggestion={suggestion}
                                  onClick={handleSendMessage}
                                  disabled={isAiLoading || isStale}
                                  isPrimary={suggestion.includes('Continue') || suggestion.includes('Keep') || suggestion === 'Yes'}
                                />
                              ))}
                            </div>
                          ) : (
                            /* Regular suggestion cards */
                            msg.suggestions.map((suggestion, i) => {
                              const isWhatIf = suggestion.toLowerCase().startsWith('what if');
                              const CardComponent = isWhatIf ? WhatIfCard : SuggestionCard;
                              
                              return (
                                <CardComponent
                                  key={i}
                                  suggestion={suggestion}
                                  onClick={handleSendMessage}
                                  disabled={isAiLoading || isStale}
                                />
                              );
                            })
                          )}
                        </div>
                      )}

                      {/* Completion Button */}
                      {!isUser && (msg.currentStep === 'complete' || currentStep === 'complete') && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">🎉 Learning Journey Masterfully Designed!</h3>
                            <p className="text-blue-700 mb-2">Your journey scaffolds authentic learning through:</p>
                            <div className="text-sm text-blue-600 mb-4 space-y-1">
                              <div>✓ Research-based phase progression</div>
                              <div>✓ Professional practice activities</div>
                              <div>✓ Expert resource connections</div>
                            </div>
                            <p className="text-blue-700 mb-4 font-medium">Ready to design the deliverables that showcase this learning?</p>
                            <button
                              onClick={() => onComplete(journeyData)}
                              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
                            >
                              Design Student Deliverables →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
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
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex items-center bg-slate-100 rounded-xl p-2 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500">
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
                className="bg-blue-600 text-white p-3 rounded-lg disabled:bg-slate-300 self-end transition-colors shadow-sm hover:bg-blue-700"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Sidebar */}
        <div className="w-80 flex-shrink-0">
          <JourneyProgress 
            journeyData={journeyData}
            currentStep={currentStep}
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
            ← Back to Ideation
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalJourney;