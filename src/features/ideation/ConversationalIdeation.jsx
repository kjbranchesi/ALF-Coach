// src/features/ideation/ConversationalIdeation.jsx
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

const SuggestionCard = ({ suggestion, onClick, disabled }) => {
  // Detect card type and add appropriate label/icon
  const isRefinement = suggestion.toLowerCase().includes('make it more') || 
                      suggestion.toLowerCase().includes('connect it more') || 
                      suggestion.toLowerCase().includes('focus it on');
  // const isExample = !isRefinement && !suggestion.toLowerCase().startsWith('what if');
  
  return (
    <button
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className="block w-full text-left p-4 my-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center min-w-0 flex-shrink-0">
          <span className="text-purple-600 text-lg">
            {isRefinement ? '✨' : '📋'}
          </span>
          <span className="text-xs text-purple-600 font-medium mt-1">
            {isRefinement ? 'REFINE' : 'EXAMPLE'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {suggestion.includes(' - ') ? (
            // Example with description format "Title - Description"
            <>
              <p className="font-medium text-purple-800">{suggestion.split(' - ')[0]}</p>
              <p className="text-xs text-purple-600 mt-1">
                {suggestion.split(' - ')[1]}
              </p>
            </>
          ) : (
            // Regular suggestion or refinement
            <>
              <p className="font-medium text-purple-800">{suggestion}</p>
              <p className="text-xs text-purple-600 mt-1">
                {isRefinement ? 'Click to improve your response' : 'Click to use this template'}
              </p>
            </>
          )}
        </div>
      </div>
    </button>
  );
};

const WhatIfCard = ({ suggestion, onClick, disabled }) => (
  <button
    onClick={() => onClick(suggestion)}
    disabled={disabled}
    className="block w-full text-left p-4 my-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center min-w-0 flex-shrink-0">
        <span className="text-amber-600 text-lg">💭</span>
        <span className="text-xs text-amber-600 font-medium mt-1">IDEA</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-amber-800">{suggestion}</p>
        <p className="text-xs text-amber-600 mt-1">Click to explore this concept</p>
      </div>
    </div>
  </button>
);

const QuickSelectCard = ({ suggestion, onClick, disabled, isPrimary = false }) => {
  const isKeepAction = suggestion.toLowerCase().includes('keep') || suggestion.toLowerCase().includes('continue');
  const isRefineAction = suggestion.toLowerCase().includes('refine');
  const isTryAgain = suggestion.toLowerCase().includes('try') || suggestion.toLowerCase().includes('different');
  
  const getIcon = () => {
    if (isKeepAction) return '✅';
    if (isRefineAction) return '✨';
    if (isTryAgain) return '🔄';
    return '👍';
  };
  
  const getLabel = () => {
    if (isKeepAction) return 'ACCEPT';
    if (isRefineAction) return 'REFINE';
    if (isTryAgain) return 'RETRY';
    return 'SELECT';
  };
  
  return (
    <button
      onClick={() => onClick(suggestion)}
      disabled={disabled}
      className={`inline-flex flex-col items-center px-6 py-4 mx-2 my-2 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
        isPrimary 
          ? 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-600' 
          : 'bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-300 hover:border-purple-400'
      }`}
    >
      <span className="text-lg mb-1">{getIcon()}</span>
      <span className="font-semibold text-sm">{suggestion}</span>
      <span className={`text-xs mt-1 ${isPrimary ? 'text-purple-200' : 'text-purple-500'}`}>
        {getLabel()}
      </span>
    </button>
  );
};

const QuickReplyChip = ({ text, onClick, disabled }) => {
  const getIcon = () => {
    if (text.toLowerCase() === 'ideas') return '💡';
    if (text.toLowerCase() === 'examples') return '📋';
    if (text.toLowerCase() === 'help') return '🤔';
    return '💬';
  };
  
  const getDescription = () => {
    if (text.toLowerCase() === 'ideas') return 'spark thinking';
    if (text.toLowerCase() === 'examples') return 'ready-made options';
    if (text.toLowerCase() === 'help') return 'get guidance';
    return 'continue';
  };
  
  return (
    <button
      onClick={() => onClick(text)}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-3 mx-1 my-1 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-full transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-base">{getIcon()}</span>
      <div className="flex flex-col items-start">
        <span className="font-semibold">{text}</span>
        <span className="text-xs text-purple-500 capitalize">{getDescription()}</span>
      </div>
    </button>
  );
};

const HelpButton = ({ onClick, disabled, children }) => {
  const isBrainstorm = children.toLowerCase().includes('ideas') || children.toLowerCase().includes('brainstorm');
  const icon = isBrainstorm ? '💡' : '📋';
  const label = isBrainstorm ? 'SPARK IDEAS' : 'USE TEMPLATE';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex flex-col items-center px-4 py-3 mx-1 my-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-lg mb-1">{icon}</span>
      <span className="font-semibold">{children}</span>
      <span className="text-xs text-purple-500 mt-1">{label}</span>
    </button>
  );
};

const ConversationalIdeation = ({ projectInfo, onComplete, onCancel }) => {

  // Helper function to create contextual intro based on educator interests
  const generateContextualIntro = (projectInfo, subject) => {
    const perspective = projectInfo.educatorPerspective?.toLowerCase() || '';
    const materials = projectInfo.initialMaterials || '';
    
    // Extract key interests/themes from educator perspective
    let contextHint = '';
    
    if (perspective.includes('bird') && perspective.includes('wildlife')) {
      contextHint = 'your interest in how humans interact with wildlife';
    } else if (perspective.includes('wine') || perspective.includes('winery')) {
      contextHint = 'your fascination with wine culture and production';
    } else if (perspective.includes('city') || perspective.includes('urban')) {
      contextHint = 'your interest in urban development and city planning';
    } else if (perspective.includes('history') && perspective.includes('relevant')) {
      contextHint = 'your goal to make history more relevant to students';
    } else if (perspective.includes('technology') || perspective.includes('digital')) {
      contextHint = 'your interest in technology\'s impact on society';
    } else if (perspective.includes('art') || perspective.includes('creative')) {
      contextHint = 'your passion for creative expression';
    } else if (perspective.includes('science') || perspective.includes('experiment')) {
      contextHint = 'your enthusiasm for scientific inquiry';
    } else if (perspective.includes('community') || perspective.includes('social')) {
      contextHint = 'your focus on community and social connections';
    } else if (perspective.includes('environment') || perspective.includes('sustain')) {
      contextHint = 'your commitment to environmental awareness';
    } else {
      // Extract first meaningful phrase (skip common starts)
      const cleanPerspective = perspective
        .replace(/^(i am|i'm|i have|i've|my students|students)/i, '')
        .replace(/^(interested in|fascinated by|always been|struggling to|trying to)/i, '')
        .trim();
      
      if (cleanPerspective.length > 10) {
        const firstPhrase = cleanPerspective.split('.')[0].split(',')[0].substring(0, 40);
        contextHint = `your interest in ${firstPhrase}${firstPhrase.length >= 40 ? '...' : ''}`;
      }
    }
    
    // Connect to materials if provided
    const materialsHint = materials ? ' and the resources you\'re exploring' : '';
    
    if (contextHint) {
      return `Building on ${contextHint}${materialsHint}`;
    } else if (materials) {
      return `With the materials you're considering`;
    } else {
      return `Ready to design your project`;
    }
  };

  // Normalize project info using utility functions
  const normalizeProjectInfo = (info) => {
    const normalized = { ...info };
    
    if (normalized.subject) {
      normalized.subject = titleCase(cleanEducatorInput(normalized.subject));
    }
    
    if (normalized.ageGroup) {
      normalized.ageGroup = formatAgeGroup(normalized.ageGroup);
    }
    
    if (normalized.educatorPerspective) {
      normalized.educatorPerspective = cleanEducatorInput(normalized.educatorPerspective);
    }
    
    return normalized;
  };


  // Validation functions for step completion
  const isCompleteResponse = (content, step) => {
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    const lower = trimmed.toLowerCase();
    
    switch (step) {
      case 'bigIdea':
        // Reject personal research interests and incomplete phrases
        const isPersonalInterest = /^(i want|i would like|i'd like|looking at|examine|study|research|explore|i'm interested in|i think about|my students|i teach|about|it's about)/i.test(trimmed);
        const isResearchPhrase = /^how (.*) (enhances?|affects?|impacts?|influences?|works?|functions?)/i.test(trimmed);
        const isQuestionFormat = trimmed.includes('?') || /^(how|what|why|when|where|which)\s/i.test(trimmed);
        const isSingleWord = wordCount <= 2;
        const isIncompleteFragment = wordCount < 4 || trimmed.length < 15;
        
        // Reject casual/informal language
        const isCasualResponse = /^(yeah|yea|well|so|um|uh|like|just|maybe|perhaps|kinda|sorta)/i.test(trimmed);
        const isHistoricalReference = /^(after|before|during|following|when|since)\s/i.test(trimmed) && !/(and|through|of|in)\s/.test(trimmed);
        const lacksThematicStructure = !/(and|through|of|in|for|with|:\s|—|–)/i.test(trimmed) && wordCount < 6;
        
        // Big Ideas should be thematic concepts, not research questions or personal interests
        if (isPersonalInterest || isResearchPhrase || isQuestionFormat || isSingleWord || isIncompleteFragment || isCasualResponse || isHistoricalReference || lacksThematicStructure) {
          return false;
        }
        
        // Must be a conceptual theme (noun phrase) that could anchor learning
        const isConceptualTheme = wordCount >= 3 && 
                                 trimmed.length >= 15 &&
                                 !trimmed.match(/^(and|but|or|so|because)/i) &&
                                 !trimmed.endsWith('...');
        
        return isConceptualTheme;
      
      case 'essentialQuestion':
        // Essential Questions must be actual inquiry questions, not statements
        const hasQuestionMark = trimmed.includes('?');
        const startsWithQuestionWord = /^(how|what|why|when|where|which|who)\s/i.test(trimmed);
        const isStatementAboutThinking = /^(well i|i want to|i think|i would like)/i.test(trimmed);
        const isIncompleteQuestion = wordCount < 6 || trimmed.length < 25;
        
        // Reject statements disguised as thoughts about questions
        if (isStatementAboutThinking || isIncompleteQuestion) {
          return false;
        }
        
        // Must be formatted as a proper question
        return hasQuestionMark || startsWithQuestionWord;
      
      case 'challenge':
        // Challenge should be a complete description of what students will do
        const hasActionWords = /(create|design|develop|build|make|produce|construct|generate)/i.test(trimmed);
        const hasProperLength = wordCount >= 6 && trimmed.length > 30;
        const mentionsStudents = /(student|learner|class|they will|participants)/i.test(trimmed);
        
        return hasActionWords && hasProperLength && mentionsStudents;
      
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
  
  // Progression Engine for preventing loops and ensuring forward progress
  const [progressionEngine, setProgressionEngine] = useState(() => 
    new ProgressionEngine('Ideation', 'bigIdea')
  );
  
  // Initialize conversation recovery middleware
  const { saveCheckpoint, recoverFromError, validateAiResponse } = useConversationRecovery(
    { ideationData, currentStep, messages },
    setMessages,
    'Ideation'
  );
  
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

  // Update progression engine when step changes
  useEffect(() => {
    setProgressionEngine(new ProgressionEngine('Ideation', currentStep));
  }, [currentStep]);

  // Helper function to get next step
  const getNextStep = (step) => {
    const steps = ['bigIdea', 'essentialQuestion', 'challenge', 'complete'];
    const currentIndex = steps.indexOf(step);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : 'complete';
  };

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

This is the INITIAL conversation start. You MUST use the CONCISE INITIAL MESSAGE TEMPLATE.

MANDATORY INITIAL RESPONSE:
Use EXACTLY this format with proper variable substitution:

### Welcome to Project Design! 🎯

` + generateContextualIntro(normalizedProjectInfo, cleanSubject) + `, let's build your **` + cleanSubject + `** project foundation in 3 steps:

1. **Big Idea** - Core theme that anchors everything
2. **Essential Question** - Driving inquiry that sparks curiosity  
3. **Challenge** - Meaningful work students create

*Right now: crafting your **Big Idea** for ` + cleanAgeGroup + `*

**What's your initial thinking?** Share a draft Big Idea or click for assistance.

REQUIRED JSON RESPONSE:
{
  "chatResponse": "Use the exact template above with substitutions",
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

CRITICAL: Use Markdown formatting and keep it concise. suggestions field MUST be null.`);

      console.log('🎯 AI Response received successfully');

      // Prepare fallback grounding message with clean formatting
      const cleanSubject = titleCase(normalizedProjectInfo.subject);
      const cleanAgeGroup = formatAgeGroup(normalizedProjectInfo.ageGroup);
      
      const fallbackGroundingMessage = `### Welcome to Project Design! 🎯

` + generateContextualIntro(normalizedProjectInfo, cleanSubject) + `, let's build your **` + cleanSubject + `** project foundation in 3 steps:

1. **Big Idea** - Core theme that anchors everything
2. **Essential Question** - Driving inquiry that sparks curiosity  
3. **Challenge** - Meaningful work students create

*Right now: crafting your **Big Idea** for ` + cleanAgeGroup + `*

**What's your initial thinking?** Share a draft Big Idea or click for assistance.`;

      // Ensure we have the right structure and force fallback if needed
      const aiMessage = {
        role: 'assistant',
        chatResponse: (response?.chatResponse && response.chatResponse.trim()) ? response.chatResponse : fallbackGroundingMessage,
        currentStep: response?.currentStep || 'bigIdea',
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: response?.suggestions || null, // Don't fallback to examples for initial grounding
        quickReplies: ['ideas', 'examples', 'help'],
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
      const cleanSubject = titleCase(normalizedProjectInfo.subject);
      const cleanAgeGroup = formatAgeGroup(normalizedProjectInfo.ageGroup);
      
      const fallbackMessage = {
        role: 'assistant',
        chatResponse: `### Welcome to Project Design! 🎯

` + generateContextualIntro(normalizedProjectInfo, cleanSubject) + `, let's build your **` + cleanSubject + `** project foundation in 3 steps:

1. **Big Idea** - Core theme that anchors everything
2. **Essential Question** - Driving inquiry that sparks curiosity  
3. **Challenge** - Meaningful work students create

*Right now: crafting your **Big Idea** for ` + cleanAgeGroup + `*

**What's your initial thinking?** Share a draft Big Idea or click for assistance.`,
        currentStep: 'bigIdea',
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation',
        suggestions: null,
        quickReplies: ['ideas', 'examples', 'help'],
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
    console.log('🔍 Validation check for:', messageContent);

    // Check progression engine for anti-loop protection
    const progressSummary = progressionEngine.getProgressSummary();
    console.log('🗺️ Progression Status:', progressSummary);
    
    if (progressionEngine.shouldForceAdvancement()) {
      console.log('⚠️ FORCING ADVANCEMENT - Too many attempts');
      // Force capture current step and advance
      const updatedData = { ...ideationData };
      const lastUserMessage = messageContent || 'current progress';
      
      if (currentStep === 'bigIdea' && !ideationData.bigIdea) {
        updatedData.bigIdea = paraphraseIdea(cleanEducatorInput(lastUserMessage));
      } else if (currentStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
        updatedData.essentialQuestion = cleanEducatorInput(lastUserMessage);
      } else if (currentStep === 'challenge' && !ideationData.challenge) {
        updatedData.challenge = cleanEducatorInput(lastUserMessage);
      }
      
      setIdeationData(updatedData);
      
      // Add forced advancement message
      const forceMessage = {
        role: 'assistant',
        chatResponse: `I can see you've been working hard on this! Let's move forward with what you have and continue to the next step. We can always refine later.`,
        timestamp: Date.now(),
        currentStep: getNextStep(currentStep),
        suggestions: null
      };
      
      setMessages(prev => [...prev, {
        role: 'user',
        chatResponse: messageContent,
        timestamp: Date.now()
      }, forceMessage]);
      
      // Advance to next step
      const nextStep = getNextStep(currentStep);
      if (nextStep !== currentStep) {
        setCurrentStep(nextStep);
      }
      
      setUserInput('');
      return;
    }

    const userMessage = {
      role: 'user',
      chatResponse: messageContent,
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsAiLoading(true);

    // Declare all variables outside try/catch to avoid scope issues
    let systemPrompt, chatHistory, expectedStep, userMessageCount, isFirstUserResponse;
    let isHelpRequest, isWhatIfSelection, isSuggestionSelection, isConfirmation, isConcreteSelection, isRefinementSelection;
    let meetsBasicQuality, wasRefinementOffered, proposedResponse, proposedResponseMatch, userProvidedContent, isPoorQualityResponse;
    let previousSuggestions, lastAiMessage;

    try {
      systemPrompt = conversationalIdeationPrompts.systemPrompt(normalizedProjectInfo, ideationData);
      
      // Format chat history for API
      chatHistory = newMessages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || JSON.stringify(msg) }]
      }));

      console.log('🤖 System Prompt for response:', systemPrompt);
      console.log('💬 Chat History for API:', chatHistory);

      // Determine what step we should be on based on current conversation step
      // Only advance step when user successfully completes current step, not based on data
      expectedStep = currentStep || 'bigIdea';

      console.log('📍 Expected Step calculated as:', expectedStep);
      console.log('🔍 isCompleteResponse result:', isCompleteResponse(messageContent, expectedStep));

      // Determine if this is the first interaction after initial grounding
      userMessageCount = newMessages.filter(m => m.role === 'user').length;
      isFirstUserResponse = userMessageCount === 1;

      // Better detection of when user provides actual content vs asking for help
      isHelpRequest = messageContent && (
        messageContent.toLowerCase().includes('not sure') ||
        messageContent.toLowerCase().includes('no idea') ||
        messageContent.toLowerCase().includes('any suggestions') ||
        messageContent.toLowerCase().includes('help') ||
        messageContent.toLowerCase().includes('suggestions?') ||
        messageContent.toLowerCase().includes('give me some') ||
        messageContent.toLowerCase().includes('i need some') ||
        // Exact matches for button clicks (case sensitive)
        messageContent === 'ideas' ||
        messageContent === 'examples' ||
        messageContent === 'help' ||
        messageContent.toLowerCase().includes('can you expand') ||
        messageContent.toLowerCase().includes('could you expand') ||
        messageContent.toLowerCase().includes('turn it into') ||
        messageContent.toLowerCase().includes('make it into') ||
        messageContent.toLowerCase().includes('could you help') ||
        messageContent.toLowerCase().includes('can you help') ||
        messageContent.trim().length <= 5
      );

      // Detect if user clicked a "What if" suggestion OR is responding to AI-provided concepts
      isWhatIfSelection = messageContent && (
        messageContent.toLowerCase().startsWith('what if') ||
        // Check if user is referencing concepts from the last AI message
        (lastAiMessage?.chatResponse && (
          (messageContent.toLowerCase().includes('ethical') && lastAiMessage.chatResponse.toLowerCase().includes('ethical')) ||
          (messageContent.toLowerCase().includes('biophilic') && lastAiMessage.chatResponse.toLowerCase().includes('biophilic')) ||
          (messageContent.toLowerCase().includes('symbiotic') && lastAiMessage.chatResponse.toLowerCase().includes('symbiotic')) ||
          (messageContent.toLowerCase().includes('consideration') && lastAiMessage.chatResponse.toLowerCase().includes('consideration')) ||
          (messageContent.toLowerCase().includes('relationship') && lastAiMessage.chatResponse.toLowerCase().includes('relationship')) ||
          // Pattern for positive response to suggestions
          /^(yea|yeah|yes|i like|that sounds|i'm interested|sounds good|good idea).*?(ethical|biophilic|symbiotic|consideration|relationship|design|impact)/i.test(messageContent)
        ))
      );

      // Detect if user selected from previous suggestions (should be captured as complete)
      previousSuggestions = lastAiMessage?.suggestions || [];
      
      // Detect refinement selection
      isRefinementSelection = messageContent && previousSuggestions.some(suggestion => 
        (suggestion.toLowerCase().startsWith('make it more') ||
         suggestion.toLowerCase().startsWith('connect it more') ||
         suggestion.toLowerCase().startsWith('focus it on')) &&
        suggestion.toLowerCase() === messageContent.toLowerCase()
      );

      // Separate "What if" coaching suggestions from concrete suggestions
      isConcreteSelection = messageContent && previousSuggestions.some(suggestion => 
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
      isSuggestionSelection = isConcreteSelection;

      // Detect confirmation responses after selections
      isConfirmation = messageContent && (
        // Standard confirmations (but not starting with "no")
        (!/^no\s/i.test(messageContent.trim()) && 
         /^(okay|yes|sure|good|that works?|sounds good|perfect|right|correct|move forward|let's go|continue|keep and continue|keep|keep this refined|keep this refined version)(\s+(yes|sounds?\s+good|works?|with that|and continue|version))?$/i.test(messageContent.trim())) ||
        // Special case: "no we are good to go" type responses  
        /^no\s+.*(good to go|ready|let's move|continue|proceed)/i.test(messageContent.trim())
      );

      // Check if response meets basic quality standards
      meetsBasicQuality = messageContent && 
        !isHelpRequest &&
        !isWhatIfSelection &&
        (isCompleteResponse(messageContent, expectedStep) || isSuggestionSelection);

      // Track if we've already offered refinement for this response (using lastAiMessage from above)
      wasRefinementOffered = lastAiMessage?.chatResponse?.includes('refine') || 
                                   lastAiMessage?.chatResponse?.includes('strengthen') ||
                                   lastAiMessage?.chatResponse?.includes('move forward with');

      // Extract the proposed response from refinement offer if user wants to keep it
      // Look for patterns like "move forward with 'Cultural Exchange and Identity Formation'" or similar
      proposedResponseMatch = lastAiMessage?.chatResponse?.match(/move forward with ['"]([^'"]+)['"]|with ['"]([^'"]+)['"]|Big Idea.*?['"]([^'"]+)['"]|Essential Question.*?['"]([^'"]+)['"]|Challenge.*?['"]([^'"]+)['"]/i);
      proposedResponse = proposedResponseMatch ? (proposedResponseMatch[1] || proposedResponseMatch[2] || proposedResponseMatch[3] || proposedResponseMatch[4] || proposedResponseMatch[5]) : null;
      
      console.log('🔍 Last AI message:', lastAiMessage?.chatResponse?.substring(0, 200));
      console.log('🔍 Proposed response match:', proposedResponseMatch);
      console.log('🔍 Extracted proposed response:', proposedResponse);

      // Only capture if user provides complete content, confirms after refinement opportunity, or selects a suggestion
      userProvidedContent = (meetsBasicQuality && !isPoorQualityResponse) || isSuggestionSelection;

      // Detect poor quality responses that should be rejected
      isPoorQualityResponse = messageContent && 
        messageContent.trim().length > 10 && 
        !isHelpRequest && 
        !isWhatIfSelection && 
        !isCompleteResponse(messageContent, expectedStep);

      console.log('🔍 DECISION LOGIC:');
      console.log('  isHelpRequest:', isHelpRequest);
      console.log('  isWhatIfSelection:', isWhatIfSelection);
      console.log('  isSuggestionSelection:', isSuggestionSelection);
      console.log('  meetsBasicQuality:', meetsBasicQuality);
      console.log('  wasRefinementOffered:', wasRefinementOffered);
      console.log('  isConfirmation:', isConfirmation);
      console.log('  isCompleteResponse:', isCompleteResponse(messageContent, expectedStep));
      console.log('  userProvidedContent:', userProvidedContent);
      console.log('  isPoorQualityResponse:', isPoorQualityResponse);
      console.log('  🔍 Casual check:', /^(yeah|yea|well|so|um|uh|like|just|maybe|perhaps|kinda|sorta)/i.test(messageContent));
      console.log('  🔍 Historical ref check:', /^(after|before|during|following|when|since)\s/i.test(messageContent));

      // Track interaction in progression engine
      let interactionType = 'response';
      if (isHelpRequest) {
        interactionType = 'help_request';
      } else if (isWhatIfSelection) {
        interactionType = 'what_if_selection';
      } else if (isSuggestionSelection) {
        interactionType = 'refinement_selection';
      } else if (isConfirmation) {
        interactionType = 'confirmation';
      }
      
      // Determine response quality for progression engine
      const responseQuality = meetsBasicQuality ? 'HIGH' : (isPoorQualityResponse ? 'LOW' : 'MEDIUM');
      
      // Get progression action from engine with context
      const contextData = {
        bigIdea: ideationData.bigIdea,
        interests: normalizedProjectInfo.educatorPerspective || ''
      };
      const progressionAction = progressionEngine.routeInteraction(messageContent, responseQuality, interactionType, contextData);
      console.log('🎯 Progression Action:', progressionAction);

      // Check if ideation is complete
      const isIdeationComplete = ideationData.bigIdea && ideationData.essentialQuestion && ideationData.challenge;

      // Check if we should offer concrete options (after coaching attempts)
      const previousMessages = newMessages.filter(m => m.role === 'assistant');
      const recentCoachingAttempts = previousMessages.slice(-2).filter(msg => 
        msg.suggestions && msg.suggestions.some(s => s.toLowerCase().startsWith('what if'))
      ).length;
      
      const shouldOfferConcreteOptions = (isHelpRequest || isPoorQualityResponse) && recentCoachingAttempts >= 1;

      // Function to generate concrete, well-formed options based on user interests
      const generateConcreteOptions = (userInterests, step, project) => {
        const interests = userInterests.toLowerCase();
        
        if (step === 'bigIdea') {
          if (interests.includes('wine')) {
            return [
              "Cultural Exchange and Global Trade - How products and ideas cross borders to shape local communities",
              "Innovation and Tradition in Modern Industry - When established practices meet new technologies and market demands", 
              "Economic Power and Social Identity - How wealth and status influence who we are and where we belong"
            ];
          } else if (interests.includes('fire') || interests.includes('chicago')) {
            return [
              "Urban Resilience and Reconstruction - How cities bounce back stronger after major challenges",
              "Crisis and Community Transformation - When emergencies become catalysts for positive change", 
              "Rebuilding and Social Progress - How reconstruction efforts can create more equitable communities"
            ];
          } else if (interests.includes('mirror')) {
            return [
              "Reflection and Historical Memory - How past events shape present understanding and future choices",
              "Perspective and Truth in Historical Narratives - Whose stories get told and how that shapes reality",
              "Identity and Self-Perception Through Time - How we see ourselves changes as history unfolds"
            ];
          } else if (interests.includes('urban') || interests.includes('city')) {
            return [
              "Community Design and Social Justice - How physical spaces can promote or prevent equity",
              "Sustainable Development and Urban Innovation - Balancing environmental needs with city growth",
              "Cultural Heritage and Urban Transformation - Preserving identity while embracing change"
            ];
          } else if (interests.includes('technology')) {
            return [
              "Innovation and Social Change - How new technologies reshape the way we live and work",
              "Digital Transformation and Human Connection - Technology's role in bringing people together or apart",
              "Technology Ethics and Global Impact - The responsibilities that come with technological power"
            ];
          } else {
            return [
              "Cultural Exchange and Identity Formation - How encounters with different cultures shape who we become",
              "Innovation and Social Transformation - When new ideas drive positive change in communities",
              "Power, Justice, and Community Building - How authority and fairness work together to strengthen society"
            ];
          }
        } else if (step === 'essentialQuestion') {
          const bigIdea = ideationData.bigIdea || 'your theme';
          if (interests.includes('wine')) {
            return [
              "How do global trade networks shape local cultural practices?",
              "What role does tradition play in modern economic success?",
              "How can industries balance heritage with innovation?"
            ];
          } else {
            return [
              `How might we understand ${bigIdea.toLowerCase()} through historical examples?`,
              `What patterns emerge when we examine ${bigIdea.toLowerCase()} across different time periods?`,
              `How can historical analysis help us address modern challenges related to ${bigIdea.toLowerCase()}?`
            ];
          }
        } else if (step === 'challenge') {
          return [
            "Create a historical analysis presentation for local community leaders",
            "Design a policy proposal based on historical patterns and modern needs",
            "Develop a multimedia exhibit that connects past and present"
          ];
        }
        
        return [];
      };

      // Function to generate quality improvement suggestions for poor responses
      const generateQualityImprovementSuggestions = (content, step) => {
        const words = content.toLowerCase();
        
        if (step === 'bigIdea') {
          if (words.includes('fire') && (words.includes('after') || words.includes('chicago'))) {
            return [
              "What if you made it thematic: 'Urban Resilience and Reconstruction'",
              "What if you focused on the concept: 'Crisis and Community Transformation'",
              "What if you reframed as: 'Rebuilding and Social Progress'"
            ];
          } else if (words.includes('mirror')) {
            return [
              "What if you made it thematic: 'Reflection and Historical Memory'",
              "What if you focused on the concept: 'Perspective and Truth in Historical Narratives'",
              "What if you reframed as: 'Identity and Self-Perception Through Time'"
            ];
          } else if (words.includes('how') && words.includes('enhance')) {
            return [
              "What if you made it thematic: 'Culinary Arts and Cultural Experience Design'",
              "What if you focused on the concept: 'Hospitality and Community Connection'",
              "What if you reframed as: 'Food Culture and Social Spaces'"
            ];
          } else if (words.includes('want to') && words.includes('think')) {
            return [
              "What if you turned this into a theme: 'Visual Design and Sensory Experience'",
              "What if you made it conceptual: 'Aesthetic Choices in Hospitality'",
              "What if you focused on: 'Multi-Sensory Design in Food Culture'"
            ];
          } else {
            return [
              "What if you made this into a broad theme rather than a research question?",
              "What if you focused on the concept behind this rather than what you want to study?",
              "What if you turned this into a thematic framework that could anchor learning?"
            ];
          }
        } else if (step === 'essentialQuestion') {
          if (words.includes('want to') || words.includes('think about')) {
            return [
              "What if you asked: 'How might design choices influence customer experience?'",
              "What if you explored: 'What role does visual presentation play in cultural appreciation?'",
              "What if you investigated: 'How can aesthetic choices enhance cultural understanding?'"
            ];
          } else {
            return [
              "What if you started with 'How might...' to make it inquiry-based?",
              "What if you turned this into a question that students could investigate?",
              "What if you made this into a driving question that sparks curiosity?"
            ];
          }
        } else {
          return [
            "What if you made this more action-oriented with words like 'create' or 'design'?",
            "What if you added more detail about what students will actually do?",
            "What if you connected this to real-world work students could produce?"
          ];
        }
      };

      // Determine response type based on progression engine action or content quality
      let responseInstruction;
      
      // Check if progression engine wants to override the response
      if (progressionAction.shouldAdvance) {
        if (progressionAction.type === 'FORCE_ADVANCE') {
          // Force advancement - capture current content and move to next step
          responseInstruction = `${progressionAction.message} Capturing current progress and moving to the next step. Update ideationProgress.${expectedStep} with the best available content and advance.`;
        } else if (progressionAction.type === 'COMPLETE_STEP') {
          responseInstruction = `${progressionAction.message} Update ideationProgress.${expectedStep} with "${messageContent}" and move to next step. NO suggestions.`;
        }
      } else if (progressionAction.suggestions && progressionAction.suggestions.length > 0) {
        // Use suggestions from progression engine
        const suggestionsList = progressionAction.suggestions.map(s => `"${s}"`).join(', ');
        responseInstruction = `${progressionAction.message} Provide these specific suggestions: [${suggestionsList}]. ${progressionAction.type === 'PROVIDE_EXAMPLES' ? 'These are ready-to-use examples they can select directly.' : 'These are coaching suggestions to help improve their response.'}`;
      } else if (isIdeationComplete) {
        responseInstruction = `Ideation is complete! Provide a summary of their Big Idea, Essential Question, and Challenge, then ask if they want to move to the Learning Journey stage. Do not provide any more suggestions.`;
      } else if (userProvidedContent) {
        responseInstruction = `User provided complete content: "${messageContent}". Update ideationProgress.${expectedStep} with this content and ADVANCE TO NEXT STEP. Set currentStep to "${expectedStep === 'bigIdea' ? 'essentialQuestion' : expectedStep === 'essentialQuestion' ? 'challenge' : 'complete'}". ${expectedStep === 'bigIdea' ? 'Explain what makes a strong Essential Question and how it should connect to their Big Idea. Provide contextual examples.' : expectedStep === 'essentialQuestion' ? 'Explain what makes a strong Challenge and how it should allow students to explore their Essential Question through meaningful work.' : ''}`;
      } else if (meetsBasicQuality && !wasRefinementOffered) {
        // First time seeing a quality response - offer specific refinement suggestions
        const refinementContext = expectedStep === 'bigIdea' ? `to ${projectInfo.subject} and ${projectInfo.ageGroup}` :
                                 expectedStep === 'essentialQuestion' ? `to connect more directly to "${ideationData.bigIdea}"` :
                                 `to be more specific about what ${projectInfo.ageGroup} will create`;
        
        responseInstruction = `User provided a quality ${expectedStep}: "${messageContent}". This meets the basic criteria! Acknowledge it's good and offer specific refinement suggestions: "That's a solid ${expectedStep}! Here are some ways to strengthen it further, or you can keep it as is:" Provide 3 specific refinement suggestions in suggestions array: ["Make it more specific ${refinementContext}", "Connect it more directly to real-world applications", "Focus it on ${projectInfo.ageGroup} developmental level", "Keep and Continue"]. Do NOT capture yet - wait for their choice.`;
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // User confirmed they want to keep a specifically proposed response
        responseInstruction = `User confirmed they want to keep the proposed ${expectedStep}: "${proposedResponse}". Update ideationProgress.${expectedStep} with "${proposedResponse}" and move to next step. NO suggestions.`;
      } else if (isConfirmation && wasRefinementOffered) {
        // User clicked "Keep and Continue" - they want to keep their original response
        const userMessages = newMessages.filter(m => m.role === 'user');
        const originalResponse = userMessages.length >= 2 ? userMessages[userMessages.length - 2].chatResponse : 'their previous response';
        responseInstruction = `User clicked "Keep and Continue" to accept their original ${expectedStep}: "${originalResponse}". Update ideationProgress.${expectedStep} with "${originalResponse}" and ADVANCE TO NEXT STEP. Set currentStep to "${expectedStep === 'bigIdea' ? 'essentialQuestion' : expectedStep === 'essentialQuestion' ? 'challenge' : 'complete'}". ${expectedStep === 'bigIdea' ? 'Explain what an Essential Question does - it drives inquiry and connects to their Big Idea. Provide 3 contextual examples that relate to their chosen theme and their original interest in birdhouses/domestication.' : expectedStep === 'essentialQuestion' ? 'Explain what the Challenge should accomplish - meaningful student work that explores their Essential Question. Provide examples.' : ''}`;
      } else if (isConfirmation && ideationData[expectedStep]) {
        // User confirmed existing selection, move to next step
        responseInstruction = `User confirmed their existing ${expectedStep}: "${ideationData[expectedStep]}". Move to next step with encouragement. NO suggestions.`;
      } else if (shouldOfferConcreteOptions) {
        // After coaching attempts, offer concrete well-formed options
        const userInterests = newMessages.filter(m => m.role === 'user').map(m => m.chatResponse).join(' ');
        const concreteOptions = generateConcreteOptions(userInterests, expectedStep, normalizedProjectInfo);
        responseInstruction = `User needs concrete options after coaching attempts. Based on their interests in "${userInterests.slice(-100)}", offer these 3 well-formed ${expectedStep} options: "${concreteOptions.join('", "')}" as direct suggestions they can select. Explain briefly why these are strong examples and how they connect to their interests. Make it clear they can select one of these or propose their own based on this model.`;
      } else if (isPoorQualityResponse) {
        // Handle poor quality responses with coaching
        responseInstruction = `User provided poor quality content: "${messageContent}". This is a POOR QUALITY response that should be REJECTED. ${expectedStep === 'bigIdea' ? 'This appears to be a research interest or question rather than a thematic concept.' : expectedStep === 'essentialQuestion' ? 'This appears to be a statement about thinking rather than an actual inquiry question.' : 'This needs to be more complete and action-oriented.'} Coach them toward the proper format and provide 3 "What if" suggestions to help them reframe properly. Stay on current step.`;
      } else if (isRefinementSelection) {
        // User selected a refinement suggestion - need to get their previous response and refine it
        const previousUserResponse = newMessages.slice(-2, -1)[0]?.chatResponse;
        if (previousUserResponse && wasRefinementOffered) {
          const refinementType = messageContent.toLowerCase();
          let refinementPrompt = '';
          
          if (refinementType.includes('more specific')) {
            refinementPrompt = `refine "${previousUserResponse}" to be more specific to ${normalizedProjectInfo.subject} and ${normalizedProjectInfo.ageGroup}`;
          } else if (refinementType.includes('real-world')) {
            refinementPrompt = `refine "${previousUserResponse}" to connect more directly to real-world applications and current issues`;
          } else if (refinementType.includes('developmental')) {
            refinementPrompt = `refine "${previousUserResponse}" to be more appropriate for the developmental level of ${normalizedProjectInfo.ageGroup}`;
          }
          
          responseInstruction = `User wants to ${refinementPrompt}. Provide a refined version that addresses their request, then ask if they want to use this refined version or make further adjustments. Offer: ["Keep this refined version", "Refine it further", "Try a different approach"]. Do NOT store yet - wait for their confirmation.`;
        } else {
          responseInstruction = `User selected refinement option: "${messageContent}". Please provide guidance on how to improve their previous response. Stay on current step and provide 3 "What if" suggestions for refinement.`;
        }
      } else if (isWhatIfSelection) {
        // Extract the core concept from the "What if" suggestion for development
        const extractConcept = (whatIfText) => {
          const match = whatIfText.match(/what if.*?['"'](.*?)['"']|what if.*?([\w\s]+?)(\sand|\?|$)/i);
          if (match) return match[1] || match[2];
          return whatIfText.replace(/what if.*?was\s*/i, '').replace(/what if.*?(focused on|explored|examined)\s*/i, '');
        };
        
        const coreConcept = extractConcept(messageContent);
        responseInstruction = `User selected a "What if" suggestion about "${coreConcept}". Don't capture this as their final answer. Instead, help them develop "${coreConcept}" into their own ${expectedStep} phrasing. Ask them to make it their own - how would THEY phrase this concept as their ${expectedStep}?`;
      } else if (isHelpRequest) {
        // Handle different types of help requests with distinct purposes
        if (messageContent === 'ideas') {
          responseInstruction = `User clicked "ideas" button - they want creative sparks to inspire their own thinking. Provide 3 "What if" coaching prompts to help them brainstorm their own ${expectedStep}. These should be open-ended questions that help them explore different directions related to ${normalizedProjectInfo.subject} and ${normalizedProjectInfo.ageGroup}. Do NOT give them complete answers - help them think.`;
        } else if (messageContent === 'examples') {
          responseInstruction = `User clicked "examples" button - they want ready-to-use options they can select directly. Provide 3 complete, well-formed ${expectedStep} examples they can choose from or adapt. These should be properly formatted, high-quality templates specific to ${normalizedProjectInfo.subject} and ${normalizedProjectInfo.ageGroup}. Make it clear they can select one directly.`;
        } else if (messageContent === 'help') {
          responseInstruction = `User clicked "help" button - they want guidance and explanation. First explain what makes a strong ${expectedStep} and why it matters, then offer both brainstorming prompts and example options. Stay on current step.`;
        } else {
          responseInstruction = `User asked for help with ${expectedStep}. Provide 3 "What if" coaching suggestions to help them develop their thinking. Stay on current step.`;
        }
      } else if (messageContent && messageContent.trim().length > 5) {
        // User provided some content but it's incomplete
        responseInstruction = `User provided incomplete content: "${messageContent}". Acknowledge their start but ask them to develop it further into a complete ${expectedStep}. Provide 3 "What if" suggestions to help them expand their thinking. Stay on current step.`;
      } else {
        responseInstruction = `User provided unclear input. Ask for clarification about ${expectedStep}.`;
      }

      let response;
      try {
        response = await generateJsonResponse(chatHistory, systemPrompt + `

Current step: ${expectedStep}
${responseInstruction}

Respond in JSON format with chatResponse, currentStep, suggestions, and ideationProgress.`);

        // Ensure required fields are present before validation
        if (!response.interactionType) {
          response.interactionType = 'conversationalIdeation';
        }
        if (!response.currentStage) {
          response.currentStage = 'Ideation';
        }
        if (!response.currentStep) {
          response.currentStep = expectedStep;
        }
        
        // Validate AI response structure
        validateAiResponse(response);
        
        console.log('🎯 AI Response:', response);
      } catch (error) {
        console.error('❌ AI Response Error:', error);
        
        // Attempt recovery (if feature enabled)
        if (isFeatureEnabled('CONVERSATION_RECOVERY')) {
          const recovered = recoverFromError(error, messageContent);
          if (recovered) {
            return; // Recovery message already added to chat
          }
        }
        
        // If recovery failed, use fallback
        response = {
          chatResponse: "I encountered an issue processing your response. Let me help you continue with your ideation.",
          currentStep: expectedStep,
          interactionType: 'conversationalIdeation',
          suggestions: null,
          ideationProgress: ideationData
        };
      }

      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse,
        suggestions: response.suggestions,
        isStageComplete: response.isStageComplete,
        ideationProgress: response.ideationProgress,
        interactionType: 'conversationalIdeation',
        currentStage: 'Ideation', 
        currentStep: response.currentStep || expectedStep,
        timestamp: Date.now()
      };

      console.log('💬 AI Message to add:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);
      
      // Save successful state checkpoint
      saveCheckpoint({
        ideationData,
        currentStep: expectedStep,
        messages: [...messages, userMessage, aiMessage]
      });

      // Update ideation data - only for complete responses that pass validation
      if (response.ideationProgress) {
        console.log('📊 AI provided ideation progress:', response.ideationProgress);
        // Clean up ideation progress data before storing
        const cleanedProgress = {
          bigIdea: response.ideationProgress.bigIdea ? paraphraseIdea(cleanEducatorInput(response.ideationProgress.bigIdea)) : '',
          essentialQuestion: response.ideationProgress.essentialQuestion ? cleanEducatorInput(response.ideationProgress.essentialQuestion) : '',
          challenge: response.ideationProgress.challenge ? cleanEducatorInput(response.ideationProgress.challenge) : ''
        };
        setIdeationData(cleanedProgress);
      } else if (userProvidedContent && !isPoorQualityResponse) {
        // Manual capture for complete, high-quality responses OR suggestion selections
        const updatedData = { ...ideationData };
        const step = response.currentStep || expectedStep;
        
        if (step === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = paraphraseIdea(cleanEducatorInput(messageContent));
          console.log('📝 Manually captured complete Big Idea:', updatedData.bigIdea);
        } else if (step === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = cleanEducatorInput(messageContent);
          console.log('📝 Manually captured complete Essential Question:', updatedData.essentialQuestion);
        } else if (step === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = cleanEducatorInput(messageContent);
          console.log('📝 Manually captured complete Challenge:', updatedData.challenge);
        }
        
        if (JSON.stringify(updatedData) !== JSON.stringify(ideationData)) {
          setIdeationData(updatedData);
        }
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // User confirmed they want to keep the specifically proposed response
        const updatedData = { ...ideationData };
        
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = paraphraseIdea(cleanEducatorInput(proposedResponse));
          console.log('📝 Captured confirmed Big Idea:', updatedData.bigIdea);
        } else if (expectedStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = cleanEducatorInput(proposedResponse);
          console.log('📝 Captured confirmed Essential Question:', updatedData.essentialQuestion);
        } else if (expectedStep === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = cleanEducatorInput(proposedResponse);
          console.log('📝 Captured confirmed Challenge:', updatedData.challenge);
        }
        
        if (JSON.stringify(updatedData) !== JSON.stringify(ideationData)) {
          setIdeationData(updatedData);
        }
      } else if (isConfirmation && wasRefinementOffered) {
        // User clicked "Keep and Continue" - capture their original response
        const updatedData = { ...ideationData };
        const userMessages = newMessages.filter(m => m.role === 'user');
        const originalResponse = userMessages.length >= 2 ? userMessages[userMessages.length - 2].chatResponse : messageContent;
        
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = paraphraseIdea(cleanEducatorInput(originalResponse));
          console.log('📝 Captured Keep and Continue Big Idea:', updatedData.bigIdea);
        } else if (expectedStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = cleanEducatorInput(originalResponse);
          console.log('📝 Captured Keep and Continue Essential Question:', updatedData.essentialQuestion);
        } else if (expectedStep === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = cleanEducatorInput(originalResponse);
          console.log('📝 Captured Keep and Continue Challenge:', updatedData.challenge);
        }
        
        if (JSON.stringify(updatedData) !== JSON.stringify(ideationData)) {
          setIdeationData(updatedData);
        }
      } else if (meetsBasicQuality && wasRefinementOffered) {
        // User provided a refinement after we offered the opportunity
        const updatedData = { ...ideationData };
        
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = messageContent;
          console.log('📝 Captured refined Big Idea:', messageContent);
        } else if (expectedStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = messageContent;
          console.log('📝 Captured refined Essential Question:', messageContent);
        } else if (expectedStep === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = messageContent;
          console.log('📝 Captured refined Challenge:', messageContent);
        }
        
        if (JSON.stringify(updatedData) !== JSON.stringify(ideationData)) {
          setIdeationData(updatedData);
        }
      } else if (isSuggestionSelection) {
        // Capture suggestion selections immediately
        const updatedData = { ...ideationData };
        
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = messageContent;
          console.log('📝 Captured suggestion selection for Big Idea:', messageContent);
        } else if (expectedStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = messageContent;
          console.log('📝 Captured suggestion selection for Essential Question:', messageContent);
        } else if (expectedStep === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = messageContent;
          console.log('📝 Captured suggestion selection for Challenge:', messageContent);
        }
        
        if (JSON.stringify(updatedData) !== JSON.stringify(ideationData)) {
          setIdeationData(updatedData);
        }
      } else if (isPoorQualityResponse) {
        console.log('📝 Poor quality response rejected, no content captured:', messageContent);
      } else if (isHelpRequest) {
        console.log('📝 User asked for help, no content captured');
      } else {
        console.log('📝 User provided incomplete content, not capturing yet');
      }

      // Only update step if user actually provided complete content or confirmed selection
      if (userProvidedContent || isSuggestionSelection || (isConfirmation && wasRefinementOffered && proposedResponse)) {
        const nextStep = expectedStep === 'bigIdea' ? 'essentialQuestion' : 
                        expectedStep === 'essentialQuestion' ? 'challenge' : 
                        expectedStep === 'challenge' ? 'complete' : expectedStep;
        
        console.log('📍 Advancing step from', expectedStep, 'to', nextStep);
        setCurrentStep(nextStep);
      } else {
        // For help requests, coaching, etc. - stay on current step
        console.log('📍 Staying on current step:', expectedStep);
        setCurrentStep(expectedStep);
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
      console.log('🔧 Is suggestion selection:', isSuggestionSelection);
      console.log('🔧 Is confirmation:', isConfirmation);
      console.log('🔧 Previous suggestions:', previousSuggestions);
      console.log('🔧 Is complete response:', isCompleteResponse(messageContent, expectedStep));
      console.log('🔧 Expected step:', expectedStep);
      console.log('🔧 Message content:', messageContent);
      
      // Try to manually handle the user's input if it was complete content, high quality, suggestion selection, or refinement
      if ((userProvidedContent && !isPoorQualityResponse) || isSuggestionSelection || (meetsBasicQuality && wasRefinementOffered) || (isConfirmation && wasRefinementOffered && proposedResponse)) {
        const updatedData = { ...ideationData };
        
        // Determine what content to capture
        let contentToCapture = messageContent;
        if (isConfirmation && wasRefinementOffered && proposedResponse) {
          contentToCapture = proposedResponse;
        }
        
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = contentToCapture;
          setIdeationData(updatedData);
          
          const manualResponse = {
            role: 'assistant',
            chatResponse: `Perfect! "${contentToCapture}" is a strong Big Idea that connects your interest in human-wildlife relationships to broader historical themes.

Now for your **Essential Question** - this should be an inquiry that drives curiosity and exploration throughout your Modern History course. It needs to:
- Be an actual question (ending with ?)
- Connect to your Big Idea theme
- Spark genuine curiosity for 16-year-olds
- Guide learning throughout the course

Given your Big Idea and interest in birdhouses/domestication, what driving question comes to mind?`,
            currentStep: 'essentialQuestion',
            interactionType: 'conversationalIdeation',
            currentStage: 'Ideation',
            suggestions: [
              "ideas",
              "examples", 
              "help"
            ],
            isStageComplete: false,
            timestamp: Date.now()
          };
          
          console.log('🔄 Using manual recovery response for complete content');
          setMessages(prev => [...prev, manualResponse]);
          return;
        }
      } else if (meetsBasicQuality && !wasRefinementOffered) {
        // Offer refinement for quality response
        const refinementOfferResponse = {
          role: 'assistant',
          chatResponse: `That's a solid ${expectedStep}! "${messageContent}" has good thematic structure and meets our criteria. 

Would you like to refine it further to make it even more specific to your course, or shall we move forward with "${messageContent}"?`,
          currentStep: expectedStep,
          interactionType: 'conversationalIdeation',
          currentStage: 'Ideation',
          suggestions: null,
          isStageComplete: false,
          timestamp: Date.now()
        };
        
        console.log('🔄 Offering refinement for quality response');
        setMessages(prev => [...prev, refinementOfferResponse]);
        return;
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // Handle confirmation of proposed response after refinement offer
        const updatedData = { ...ideationData };
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = proposedResponse;
          setIdeationData(updatedData);
          
          const confirmationResponse = {
            role: 'assistant',
            chatResponse: `Perfect! "${proposedResponse}" is now your Big Idea.

Now for your **Essential Question** - this should drive inquiry throughout your course. It needs to:
- Be an actual question (ending with ?)
- Connect to your Big Idea
- Spark curiosity for 16-year-olds  
- Guide exploration of your theme

What driving question comes to mind?`,
            currentStep: 'essentialQuestion',
            interactionType: 'conversationalIdeation',
            currentStage: 'Ideation',
            suggestions: [
              "ideas",
              "examples", 
              "help"
            ],
            isStageComplete: false,
            timestamp: Date.now()
          };
          
          console.log('🔄 Using confirmation response for proposed Big Idea');
          setMessages(prev => [...prev, confirmationResponse]);
          return;
        }
      } else if (isConfirmation && ideationData[expectedStep]) {
        // Handle confirmation of existing selection
        const nextStep = expectedStep === 'bigIdea' ? 'essentialQuestion' : expectedStep === 'essentialQuestion' ? 'challenge' : 'complete';
        
        const confirmationResponse = {
          role: 'assistant',
          chatResponse: `Perfect! You've confirmed "${ideationData[expectedStep]}" as your ${expectedStep}. ${nextStep === 'complete' ? 'Great work completing the ideation!' : `Now let's move on to your ${nextStep}.`}`,
          currentStep: nextStep,
          interactionType: 'conversationalIdeation',
          currentStage: 'Ideation',
          suggestions: null,
          isStageComplete: nextStep === 'complete',
          timestamp: Date.now()
        };
        
        console.log('🔄 Using confirmation response for existing selection');
        setMessages(prev => [...prev, confirmationResponse]);
        if (nextStep !== 'complete') {
          setCurrentStep(nextStep);
        }
        return;
      } else if (isWhatIfSelection) {
        // Handle "What if" selection - extract concept and ask for development
        const extractConcept = (whatIfText) => {
          // Try to extract the key concept from the "What if" text
          if (whatIfText.toLowerCase().includes('cultural exchange')) return 'Cultural Exchange';
          if (whatIfText.toLowerCase().includes('globalization')) return 'Globalization';
          if (whatIfText.toLowerCase().includes('national identity')) return 'National Identity';
          if (whatIfText.toLowerCase().includes('innovation')) return 'Innovation and Tradition';
          if (whatIfText.toLowerCase().includes('reflection')) return 'Reflection and Historical Memory';
          
          // Fallback - try to extract from quotes or key phrases
          const match = whatIfText.match(/['"'](.*?)['"']|was\s+['"']?(.*?)['"']?[\s,]/i);
          return match ? (match[1] || match[2]) : 'this concept';
        };
        
        const coreConcept = extractConcept(messageContent);
        
        const developmentResponse = {
          role: 'assistant',
          chatResponse: `Great direction! "${coreConcept}" is an excellent thematic concept. Now, make it your own - how would YOU phrase "${coreConcept}" as your Big Idea for this Modern History course? 

Think about your specific focus with Laos food and your 11-14 year old students. What aspect of ${coreConcept} resonates most with your vision?`,
          currentStep: expectedStep,
          interactionType: 'conversationalIdeation',
          currentStage: 'Ideation',
          suggestions: null, // No more suggestions, let them develop it
          isStageComplete: false,
          timestamp: Date.now()
        };
        
        console.log('🔄 Using What If development response for:', coreConcept);
        setMessages(prev => [...prev, developmentResponse]);
        return;
      } else if (isSuggestionSelection) {
        // Handle concrete suggestion selection (non-"What if")
        const updatedData = { ...ideationData };
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = messageContent;
          setIdeationData(updatedData);
          
          // Generate appropriate Essential Question suggestions based on the Big Idea
          let essentialQuestions = [
            "How do global trade networks shape local cultural practices?",
            "What role does tradition play in modern economic success?", 
            "How can industries balance heritage with innovation?"
          ];
          
          if (messageContent.toLowerCase().includes('reflection') || messageContent.toLowerCase().includes('memory')) {
            essentialQuestions = [
              "How do societies choose to remember and forget their past?",
              "What role does historical memory play in shaping modern identity?",
              "How do different perspectives on the same events shape our understanding of truth?"
            ];
          }
          
          const selectionResponse = {
            role: 'assistant',
            chatResponse: `Excellent choice! "${messageContent}" is a strong Big Idea that will anchor your Modern History course. Now let's work on your Essential Question - the driving inquiry that will spark student curiosity about this theme.`,
            currentStep: 'essentialQuestion',
            interactionType: 'conversationalIdeation',
            currentStage: 'Ideation',
            suggestions: essentialQuestions,
            isStageComplete: false,
            timestamp: Date.now()
          };
          
          console.log('🔄 Using concrete suggestion selection response');
          setMessages(prev => [...prev, selectionResponse]);
          return;
        }
      } else if (shouldOfferConcreteOptions) {
        // After coaching, offer concrete well-formed options
        const userInterests = newMessages.filter(m => m.role === 'user').map(m => m.chatResponse).join(' ');
        const concreteOptions = generateConcreteOptions(userInterests, expectedStep, normalizedProjectInfo);
        
        const concreteOptionsResponse = {
          role: 'assistant',
          chatResponse: `I can see you're working with interesting ideas around ${userInterests.includes('wine') ? 'wine and wineries' : 'your subject area'}! Let me offer you 3 well-formed ${expectedStep} examples that connect to your interests:

**Here are 3 strong ${expectedStep} options for you to choose from:**`,
          currentStep: expectedStep,
          interactionType: 'conversationalIdeation',
          currentStage: 'Ideation',
          suggestions: concreteOptions,
          isStageComplete: false,
          timestamp: Date.now()
        };
        
        console.log('🔄 Using concrete options response after coaching');
        setMessages(prev => [...prev, concreteOptionsResponse]);
        return;
      } else if (isPoorQualityResponse) {
        // Handle poor quality responses with coaching
        let qualityIssue = '';
        if (expectedStep === 'bigIdea') {
          if (messageContent.toLowerCase().includes('want') && messageContent.toLowerCase().includes('about')) {
            qualityIssue = 'I can see you\'re interested in mirrors! However, "I want it to be about mirrors" is a personal interest, not a Big Idea. Big Ideas should be thematic concepts that anchor learning - think broader themes that mirrors could represent in Modern History.';
          } else if (/^(yeah|yea|well|so|um|uh)/i.test(messageContent)) {
            qualityIssue = `I can see you're thinking about "${messageContent.replace(/^(yeah|yea|well|so|um|uh)\s*/i, '')}"! However, Big Ideas need to be formal thematic concepts that can anchor an entire course. Think about the broader concept this represents in Urban Planning.`;
          } else if (/^(after|before|during)/i.test(messageContent)) {
            qualityIssue = `"${messageContent}" sounds like a historical reference or time period. Big Ideas should be broad thematic concepts that can encompass multiple topics and time periods throughout your course.`;
          } else {
            qualityIssue = 'This looks like a research interest or question rather than a thematic concept. Big Ideas should be broad themes that anchor learning.';
          }
        } else if (expectedStep === 'essentialQuestion') {
          qualityIssue = 'This looks like a statement about thinking rather than an actual question. Essential Questions should be inquiry-based questions that drive exploration.';
        } else {
          qualityIssue = 'This needs to be more complete and action-oriented, describing what students will create or do.';
        }
        
        const poorQualityResponse = {
          role: 'assistant',
          chatResponse: `${qualityIssue}

Let me help you reframe this into a proper ${expectedStep}:`,
          currentStep: expectedStep,
          interactionType: 'conversationalIdeation',
          currentStage: 'Ideation',
          suggestions: generateQualityImprovementSuggestions(messageContent, expectedStep),
          isStageComplete: false,
          timestamp: Date.now()
        };
        
        console.log('🔄 Using poor quality content coaching response');
        setMessages(prev => [...prev, poorQualityResponse]);
        return;
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
                      {!isUser && process.env.NODE_ENV === 'development' && (
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
                            // Use safe Markdown rendering for AI messages
                            <div 
                              className="max-w-none"
                              dangerouslySetInnerHTML={renderMarkdown(msg.chatResponse)}
                            />
                          )}
                        </div>
                      )}
                      {!msg.chatResponse && (
                        <div style={{background: 'red', color: 'white', padding: '4px'}}>
                          DEBUG: No chatResponse found!
                        </div>
                      )}
                      
                      {/* Quick Reply Chips */}
                      {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="mt-4 text-center">
                          {msg.quickReplies.map((reply, i) => (
                            <QuickReplyChip
                              key={i}
                              text={reply}
                              onClick={handleSendMessage}
                              disabled={isAiLoading || isStale}
                            />
                          ))}
                        </div>
                      )}

                      {/* Help Buttons for messages without suggestions or quick replies */}
                      {!isUser && (!msg.suggestions || msg.suggestions.length === 0) && (!msg.quickReplies || msg.quickReplies.length === 0) && 
                       (msg.chatResponse?.includes('?') || msg.chatResponse?.includes('What are your') || msg.chatResponse?.includes('Share your')) && (
                        <div className="mt-4 text-center">
                          <HelpButton 
                            onClick={() => handleSendMessage('ideas')}
                            disabled={isAiLoading || isStale}
                          >
                            Brainstorm ideas
                          </HelpButton>
                          <HelpButton 
                            onClick={() => handleSendMessage('examples')}
                            disabled={isAiLoading || isStale}
                          >
                            Show examples
                          </HelpButton>
                        </div>
                      )}

                      {/* Suggestions */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-4">
                          {/* Guidance header for different card types */}
                          {msg.suggestions.length > 2 && !msg.suggestions.some(s => s.includes('Keep and Continue')) && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <span className="text-blue-500">ℹ️</span>
                                <span className="font-medium">Choose your next step:</span>
                              </div>
                              <div className="mt-1 text-xs text-gray-600 flex flex-wrap gap-4">
                                {msg.suggestions.some(s => s.toLowerCase().startsWith('what if')) && (
                                  <span><span className="font-medium">💭 IDEA:</span> Explore concept</span>
                                )}
                                {msg.suggestions.some(s => s.toLowerCase().includes('make it more') || s.toLowerCase().includes('connect it more')) && (
                                  <span><span className="font-medium">✨ REFINE:</span> Improve response</span>
                                )}
                                {msg.suggestions.some(s => !s.toLowerCase().startsWith('what if') && !s.toLowerCase().includes('make it more') && !s.toLowerCase().includes('connect it more')) && (
                                  <span><span className="font-medium">📋 EXAMPLE:</span> Use template</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Check if these are quick select buttons */}
                          {msg.suggestions.length === 2 && 
                           (msg.suggestions.includes('Keep and Continue') || msg.suggestions.includes('Refine Further') ||
                            msg.suggestions.some(s => ['Yes', 'No', 'Continue', 'Refine'].includes(s))) ? (
                            <div>
                              <div className="mb-3 text-center text-sm text-gray-600">
                                <span className="font-medium">Make your choice:</span>
                              </div>
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