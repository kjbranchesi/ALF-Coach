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

const ConversationalIdeation = ({ projectInfo, onComplete, onCancel }) => {
  // Normalize project info at component level
  const normalizeProjectInfo = (info) => {
    const corrections = {
      'MOdern Histry': 'Modern History',
      'Sophmores': 'Sophomores', 
      'Histry': 'History',
      'Sophmore': 'Sophomore',
      'Freshmn': 'Freshmen',
      'elementry': 'elementary',
      'middel': 'middle',
      'highschool': 'high school'
    };
    
    const normalized = { ...info };
    Object.keys(normalized).forEach(key => {
      if (typeof normalized[key] === 'string') {
        // Handle ambiguous terms that need context
        if (key === 'ageGroup') {
          normalized[key] = disambiguateAgeGroup(normalized[key]);
        }
        
        // Apply spelling corrections
        Object.keys(corrections).forEach(mistake => {
          normalized[key] = normalized[key].replace(new RegExp(mistake, 'gi'), corrections[mistake]);
        });
      }
    });
    
    return normalized;
  };

  const disambiguateAgeGroup = (ageGroup) => {
    const lower = ageGroup.toLowerCase();
    
    // Handle Freshman/Freshmen ambiguity with context detection
    if (lower.includes('freshman') || lower.includes('freshmen')) {
      // Look for context clues
      const isHighSchool = lower.includes('high school') || 
                          lower.includes('9th grade') || 
                          lower.includes('grade 9') ||
                          lower.includes('secondary') ||
                          (/\b(14|15)\b/.test(lower));
                          
      const isCollege = lower.includes('college') || 
                       lower.includes('university') || 
                       lower.includes('1st year') ||
                       lower.includes('first year') ||
                       (/\b(18|19)\b/.test(lower));
      
      if (isHighSchool && !isCollege) {
        return ageGroup.replace(/freshm[ae]n/gi, 'High School Freshmen (Ages 14-15)');
      } else if (isCollege && !isHighSchool) {
        return ageGroup.replace(/freshm[ae]n/gi, 'College Freshmen (Ages 18-19)');
      } else {
        // No clear context - add clarification note
        return ageGroup.replace(/freshm[ae]n/gi, 'Freshmen (please specify: high school ~14-15 or college ~18-19)');
      }
    }
    
    // Handle other grade level ambiguities
    if (lower.includes('sophomore')) {
      const isHighSchool = lower.includes('high school') || lower.includes('10th grade') || (/\b(15|16)\b/.test(lower));
      const isCollege = lower.includes('college') || lower.includes('university') || (/\b(19|20)\b/.test(lower));
      
      if (isHighSchool && !isCollege) {
        return ageGroup.replace(/sophomore/gi, 'High School Sophomores (Ages 15-16)');
      } else if (isCollege && !isHighSchool) {
        return ageGroup.replace(/sophomore/gi, 'College Sophomores (Ages 19-20)');
      }
    }
    
    return ageGroup;
  };

  // Validation functions for step completion
  const isCompleteResponse = (content, step) => {
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    
    switch (step) {
      case 'bigIdea':
        // Big Idea should be a complete concept, not just an interest or research topic
        const startsWithWeakPhrase = /^(i want to|i would like to|looking at|examine|study|research|explore)/i.test(trimmed);
        const hasProperStructure = !startsWithWeakPhrase && 
                                  wordCount >= 4 && 
                                  trimmed.length > 20 &&
                                  !trimmed.match(/^(mapping|community|design|planning|sustainability)$/i);
        
        // Should not start with personal intentions but should be a thematic concept
        return hasProperStructure;
      
      case 'essentialQuestion':
        // Essential Question should be an actual question
        return trimmed.includes('?') || 
               trimmed.toLowerCase().startsWith('how ') ||
               trimmed.toLowerCase().startsWith('what ') ||
               trimmed.toLowerCase().startsWith('why ') ||
               trimmed.toLowerCase().startsWith('when ') ||
               trimmed.toLowerCase().startsWith('where ') ||
               (wordCount >= 5 && trimmed.length > 20);
      
      case 'challenge':
        // Challenge should be a complete description of what students will do
        return wordCount >= 5 && 
               trimmed.length > 25 &&
               (trimmed.toLowerCase().includes('student') || 
                trimmed.toLowerCase().includes('create') ||
                trimmed.toLowerCase().includes('design') ||
                trimmed.toLowerCase().includes('develop'));
      
      default:
        return wordCount >= 3;
    }
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
    console.log('🔄 Initializing conversational ideation for', normalizedProjectInfo.subject, 'with', normalizedProjectInfo.ageGroup);
    
    try {
      const systemPrompt = conversationalIdeationPrompts.systemPrompt(normalizedProjectInfo, ideationData);
      const stepPrompt = conversationalIdeationPrompts.stepPrompts.bigIdea(normalizedProjectInfo);
      
      
      const response = await generateJsonResponse([], systemPrompt + `

This is the INITIAL conversation start. You MUST provide GROUNDING-ONLY introduction.

MANDATORY INITIAL RESPONSE RULES:
1. Start with the PROCESS OVERVIEW to ground the educator
2. Explain we're working on the Big Idea (step 1 of 3)
3. Explain what the Big Idea is and why it matters for authentic learning
4. Ask for their initial thoughts or ideas
5. ABSOLUTELY NO SUGGESTIONS - this is pure grounding

REQUIRED JSON RESPONSE:
{
  "chatResponse": "Your grounding message here",
  "currentStep": "bigIdea", 
  "interactionType": "conversationalIdeation",
  "currentStage": "Ideation",
  "suggestions": null,
  "isStageComplete": false,
  "dataToStore": null,
  "ideationProgress": {
    "bigIdea": "",
    "essentialQuestion": "",
    "challenge": ""
  }
}

CRITICAL: suggestions field MUST be null. No arrays, no examples, just null.`);

      console.log('🎯 AI Response received successfully');

      // Prepare fallback grounding message
      const fallbackGroundingMessage = `**Welcome to the IDEATION stage!** 🎯

We're in the IDEATION stage where we build the foundation for authentic learning. We'll define 3 key elements that work together:

1) **Big Idea** - the broad theme that anchors everything
2) **Essential Question** - the driving inquiry that sparks curiosity  
3) **Challenge** - the meaningful work students will create

These create a framework where students don't just learn about ${normalizedProjectInfo.subject} - they DO authentic work that mirrors real professionals.

**Right now we're working on STEP 1: Your Big Idea** 

The Big Idea is the broad theme that will anchor your entire ${normalizedProjectInfo.subject} project for ${normalizedProjectInfo.ageGroup}. It connects your curriculum to real-world issues that students actually care about, making learning feel relevant instead of abstract.

**What themes or ideas are you considering for your Big Idea?** 

Share any initial thoughts - we can explore and develop them together to create something meaningful for your ${normalizedProjectInfo.ageGroup}.`;

      // Ensure we have the right structure and force fallback if needed
      const aiMessage = {
        role: 'assistant',
        chatResponse: (response?.chatResponse && response.chatResponse.trim()) ? response.chatResponse : fallbackGroundingMessage,
        currentStep: response?.currentStep || 'bigIdea',
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: response?.suggestions || null, // Don't fallback to examples for initial grounding
        isStageComplete: false,
        ideationProgress: {
          bigIdea: '',
          essentialQuestion: '',
          challenge: ''
        },
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
      
      if (response.ideationProgress) {
        setIdeationData(response.ideationProgress);
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

      // Better detection of when user provides actual content vs asking for help
      const isHelpRequest = messageContent && (
        messageContent.toLowerCase().includes('not sure') ||
        messageContent.toLowerCase().includes('no idea') ||
        messageContent.toLowerCase().includes('any suggestions') ||
        messageContent.toLowerCase().includes('help') ||
        messageContent.toLowerCase().includes('suggestions?') ||
        messageContent.toLowerCase().includes('give me some') ||
        messageContent.trim().length <= 5
      );

      // Detect if user clicked a "What if" suggestion (these shouldn't be captured as responses)
      const isWhatIfSelection = messageContent && messageContent.toLowerCase().startsWith('what if');

      const userProvidedContent = messageContent && 
        !isHelpRequest &&
        !isWhatIfSelection &&
        isCompleteResponse(messageContent, expectedStep);

      // Check if ideation is complete
      const isIdeationComplete = ideationData.bigIdea && ideationData.essentialQuestion && ideationData.challenge;

      // Determine response type based on content quality
      let responseInstruction;
      if (isIdeationComplete) {
        responseInstruction = `Ideation is complete! Provide a summary of their Big Idea, Essential Question, and Challenge, then ask if they want to move to the Learning Journey stage. Do not provide any more suggestions.`;
      } else if (userProvidedContent) {
        responseInstruction = `User provided complete content: "${messageContent}". Update ideationProgress.${expectedStep} with this content and move to next step. NO "what if" suggestions for complete responses.`;
      } else if (isWhatIfSelection) {
        responseInstruction = `User selected a "What if" suggestion: "${messageContent}". Help them develop this into a complete ${expectedStep}. Ask them to refine or expand it into their own response.`;
      } else if (isHelpRequest) {
        responseInstruction = `User asked for help with ${expectedStep}. Provide 3 clear suggestions and stay on current step.`;
      } else if (messageContent && messageContent.trim().length > 5) {
        // User provided some content but it's incomplete
        responseInstruction = `User provided incomplete content: "${messageContent}". Acknowledge their start but ask them to develop it further into a complete ${expectedStep}. Provide 3 "What if" suggestions to help them expand their thinking. Stay on current step.`;
      } else {
        responseInstruction = `User provided unclear input. Ask for clarification about ${expectedStep}.`;
      }

      const response = await generateJsonResponse(chatHistory, systemPrompt + `

Current step: ${expectedStep}
${responseInstruction}

Respond in JSON format with chatResponse, currentStep, suggestions, and ideationProgress.`);

      console.log('🎯 AI Response:', response);

      const aiMessage = {
        role: 'assistant',
        ...response,
        currentStep: response.currentStep || expectedStep, // Ensure currentStep is always set
        timestamp: Date.now()
      };

      console.log('💬 AI Message to add:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      // Update ideation data - only for complete responses
      if (response.ideationProgress) {
        console.log('📊 AI provided ideation progress:', response.ideationProgress);
        setIdeationData(response.ideationProgress);
      } else if (userProvidedContent) {
        // Manual capture only for complete responses
        const updatedData = { ...ideationData };
        const step = response.currentStep || expectedStep;
        
        if (step === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = messageContent;
          console.log('📝 Manually captured complete Big Idea:', messageContent);
        } else if (step === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = messageContent;
          console.log('📝 Manually captured complete Essential Question:', messageContent);
        } else if (step === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = messageContent;
          console.log('📝 Manually captured complete Challenge:', messageContent);
        }
        
        if (JSON.stringify(updatedData) !== JSON.stringify(ideationData)) {
          setIdeationData(updatedData);
        }
      } else if (isHelpRequest) {
        console.log('📝 User asked for help, no content captured');
      } else {
        console.log('📝 User provided incomplete content, not capturing yet');
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
      console.error('❌ Error sending message:', error.message);
      console.log('🔧 User provided content detected:', userProvidedContent);
      console.log('🔧 Is help request:', isHelpRequest);
      console.log('🔧 Is what if selection:', isWhatIfSelection);
      console.log('🔧 Is complete response:', isCompleteResponse(messageContent, expectedStep));
      console.log('🔧 Expected step:', expectedStep);
      console.log('🔧 Message content:', messageContent);
      
      // Try to manually handle the user's input if it was complete content
      if (userProvidedContent) {
        const updatedData = { ...ideationData };
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = messageContent;
          setIdeationData(updatedData);
          setCurrentStep('essentialQuestion');
          
          const manualResponse = {
            role: 'assistant',
            chatResponse: `Perfect! You've chosen "${messageContent}" as your Big Idea. Now let's work on the Essential Question that will drive student inquiry about this theme.`,
            currentStep: 'essentialQuestion',
            interactionType: 'conversationalIdeation',
            currentStage: 'Ideation',
            suggestions: [
              "How does urban planning shape community identity?",
              "What makes a city truly livable for its residents?",
              "How can young people influence the design of their communities?"
            ],
            isStageComplete: false,
            timestamp: Date.now()
          };
          
          console.log('🔄 Using manual recovery response for complete content');
          setMessages(prev => [...prev, manualResponse]);
          return;
        }
      } else if (messageContent && messageContent.trim().length > 5 && !isHelpRequest) {
        // User provided incomplete content - encourage them to develop it with suggestions
        const generateDevelopmentSuggestions = (fragment, step) => {
          const words = fragment.toLowerCase();
          
          if (step === 'bigIdea') {
            if (words.includes('political') && words.includes('suburb')) {
              return [
                "What if you framed it as: 'Political Landscapes: How Ideology Shapes Suburban Design'",
                "What if you considered: 'Democracy and Development: Politics in Suburban Planning'",
                "What if you explored: 'Contested Spaces: Political Identity in Suburban Communities'"
              ];
            } else if (words.includes('political')) {
              return [
                "What if you expanded to: 'Political Forces Shaping Community Design'",
                "What if you considered: 'Power and Place: Political Influences on Urban Form'",
                "What if you explored: 'Civic Engagement Through Urban Design'"
              ];
            }
          } else if (step === 'essentialQuestion') {
            if (words.includes('community') && words.includes('commons')) {
              return [
                "What if you asked: 'How can shared community spaces strengthen neighborhood bonds?'",
                "What if you explored: 'How do public commons reflect community values?'", 
                "What if you considered: 'What makes community spaces truly inclusive and accessible?'"
              ];
            } else if (words.includes('community')) {
              return [
                "What if you asked: 'How does community input shape better planning decisions?'",
                "What if you explored: 'What makes a community resilient and thriving?'",
                "What if you considered: 'How can communities balance individual needs with collective goals?'"
              ];
            }
          }
          
          // Generic suggestions based on step
          if (step === 'bigIdea') {
            return [
              "What if you developed this into a thematic concept rather than a research interest?",
              "What if you framed this as a broad principle that anchors learning?",
              "What if you made this more conceptual and less about what you want to study?"
            ];
          } else if (step === 'essentialQuestion') {
            return [
              "What if you started with 'How might...' to make it inquiry-based?",
              "What if you asked 'What would happen if...' to explore consequences?",
              "What if you posed 'Why do...' to dig into deeper meanings?"
            ];
          } else {
            return [
              "What if you expanded this into a complete sentence?",
              "What if you added more context about the learning goals?",
              "What if you connected this to real-world applications?"
            ];
          }
        };

        const suggestions = generateDevelopmentSuggestions(messageContent, expectedStep);
        
        const incompleteResponse = {
          role: 'assistant',
          chatResponse: `I see you're thinking about "${messageContent}" - that's a great start! Could you develop this into a more complete ${expectedStep}? ${expectedStep === 'essentialQuestion' ? 'Try forming it as a complete question that would drive student inquiry.' : 'Try expanding this into a full phrase or sentence.'}`,
          currentStep: expectedStep,
          interactionType: 'conversationalIdeation',
          currentStage: 'Ideation',
          suggestions: suggestions,
          isStageComplete: false,
          timestamp: Date.now()
        };
        
        console.log('🔄 Using incomplete content guidance response with suggestions');
        setMessages(prev => [...prev, incompleteResponse]);
        return;
      }
      
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I encountered a technical issue, but I'm still here to help! Could you please try rephrasing your message?",
        currentStep: expectedStep,
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: null,
        isStageComplete: false,
        timestamp: Date.now()
      };
      
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
                        <div className="text-sm leading-relaxed max-w-none">
                          {isUser ? (
                            // Simple white text for user messages (on purple background)
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
                            // Enhanced styling for AI messages (on white background)
                            <div 
                              className="space-y-3"
                              dangerouslySetInnerHTML={{
                                __html: msg.chatResponse
                                  // Process headings (bold text on its own line)
                                  .replace(/^\*\*(.*?)\*\*$/gm, '<h3 class="text-lg font-semibold text-purple-800 mb-2 mt-4">$1</h3>')
                                  // Process numbered lists
                                  .replace(/^(\d+)\)\s+(.*?)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center justify-center mt-0.5">$1</span><span class="text-gray-700">$2</span></div>')
                                  // Process bullet points with emojis or dashes
                                  .replace(/^[•-]\s+(.*?)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2"></span><span class="text-gray-700">$1</span></div>')
                                  // Process remaining bold text
                                  .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-gray-800">$1</span>')
                                  // Process italic text
                                  .replace(/\*(.*?)\*/g, '<em class="text-purple-700">$1</em>')
                                  // Process paragraphs (double line breaks)
                                  .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 leading-relaxed">')
                                  // Process single line breaks
                                  .replace(/\n/g, '<br/>')
                                  // Wrap in paragraph tags
                                  .replace(/^/, '<p class="mb-3 text-gray-700 leading-relaxed">')
                                  .replace(/$/, '</p>')
                                  // Clean up empty paragraphs
                                  .replace(/<p class="[^"]*"><\/p>/g, '')
                              }}
                            />
                          )}
                        </div>
                      )}
                      {!msg.chatResponse && (
                        <div style={{background: 'red', color: 'white', padding: '4px'}}>
                          DEBUG: No chatResponse found!
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-4">
                          {msg.suggestions.map((suggestion, i) => {
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
                          })}
                        </div>
                      )}

                      {/* Completion Button */}
                      {!isUser && (msg.currentStep === 'complete' || (msg.currentStep === 'challenge' && ideationData.bigIdea && ideationData.essentialQuestion && ideationData.challenge)) && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Ideation Complete!</h3>
                            <p className="text-green-700 mb-4">You've successfully defined your project foundation.</p>
                            <button
                              onClick={() => onComplete(ideationData)}
                              className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                            >
                              Continue to Learning Journey →
                            </button>
                          </div>
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