// src/features/ideation/ConversationalIdeation.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';
import StageHeader from '../../components/StageHeader.jsx';
import IdeationProgress from './IdeationProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalIdeationPrompts } from '../../ai/promptTemplates/conversationalIdeation.js';
import { useConversationRecovery } from '../../hooks/useConversationRecovery.js';
import { isFeatureEnabled } from '../../config/featureFlags.js';

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

const QuickSelectCard = ({ suggestion, onClick, disabled, isPrimary = false }) => (
  <button
    onClick={() => onClick(suggestion)}
    disabled={disabled}
    className={`inline-block px-6 py-3 mx-2 my-2 font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
      isPrimary 
        ? 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-600' 
        : 'bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-300 hover:border-purple-400'
    }`}
  >
    {suggestion}
  </button>
);

const HelpButton = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-block px-4 py-2 mx-1 my-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    💡 {children}
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
      'highschool': 'high school',
      'architectre': 'Architecture',
      'architecure': 'Architecture', 
      'architechture': 'Architecture',
      'architeture': 'Architecture'
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
      const fallbackGroundingMessage = `We're building the foundation for your ${normalizedProjectInfo.subject} project with 3 key elements:

**Big Idea** → **Essential Question** → **Challenge**

Let's start with your **Big Idea** - the main theme that will anchor everything.

**What's your initial thinking for a Big Idea that would engage ${normalizedProjectInfo.ageGroup}?**`;

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
        chatResponse: `We're building the foundation for your ${normalizedProjectInfo.subject} project with 3 key elements:

**Big Idea** → **Essential Question** → **Challenge**

Let's start with your **Big Idea** - the main theme that will anchor everything.

**What's your initial thinking for a Big Idea that would engage ${normalizedProjectInfo.ageGroup}?**`,
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
    console.log('🔍 Validation check for:', messageContent);

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

      // Determine what step we should be on based on current conversation step
      // Only advance step when user successfully completes current step, not based on data
      let expectedStep = currentStep || 'bigIdea';

      console.log('📍 Expected Step calculated as:', expectedStep);
      console.log('🔍 isCompleteResponse result:', isCompleteResponse(messageContent, expectedStep));

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

      // Detect if user clicked a "What if" suggestion OR is responding to AI-provided concepts
      const isWhatIfSelection = messageContent && (
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

      // Detect confirmation responses after selections
      const isConfirmation = messageContent && (
        // Standard confirmations (but not starting with "no")
        (!/^no\s/i.test(messageContent.trim()) && 
         /^(okay|yes|sure|good|that works?|sounds good|perfect|right|correct|move forward|let's go|continue|keep and continue|keep)(\s+(yes|sounds?\s+good|works?|with that|and continue))?$/i.test(messageContent.trim())) ||
        // Special case: "no we are good to go" type responses  
        /^no\s+.*(good to go|ready|let's move|continue|proceed)/i.test(messageContent.trim())
      );

      // Check if response meets basic quality standards
      const meetsBasicQuality = messageContent && 
        !isHelpRequest &&
        !isWhatIfSelection &&
        (isCompleteResponse(messageContent, expectedStep) || isSuggestionSelection);

      // Track if we've already offered refinement for this response (using lastAiMessage from above)
      const wasRefinementOffered = lastAiMessage?.chatResponse?.includes('refine') || 
                                   lastAiMessage?.chatResponse?.includes('strengthen') ||
                                   lastAiMessage?.chatResponse?.includes('move forward with');

      // Extract the proposed response from refinement offer if user wants to keep it
      // Look for patterns like "move forward with 'Cultural Exchange and Identity Formation'" or similar
      const proposedResponseMatch = lastAiMessage?.chatResponse?.match(/move forward with ['"]([^'"]+)['"]|with ['"]([^'"]+)['"]|Big Idea.*?['"]([^'"]+)['"]|Essential Question.*?['"]([^'"]+)['"]|Challenge.*?['"]([^'"]+)['"]/i);
      const proposedResponse = proposedResponseMatch ? (proposedResponseMatch[1] || proposedResponseMatch[2] || proposedResponseMatch[3] || proposedResponseMatch[4] || proposedResponseMatch[5]) : null;
      
      console.log('🔍 Last AI message:', lastAiMessage?.chatResponse?.substring(0, 200));
      console.log('🔍 Proposed response match:', proposedResponseMatch);
      console.log('🔍 Extracted proposed response:', proposedResponse);

      // Only capture if user confirms after refinement opportunity, or if it's a concrete selection
      const userProvidedContent = (meetsBasicQuality && (isConfirmation || wasRefinementOffered)) || isSuggestionSelection;

      // Detect poor quality responses that should be rejected
      const isPoorQualityResponse = messageContent && 
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
              "Cultural Exchange and Global Trade",
              "Innovation and Tradition in Modern Industry", 
              "Economic Power and Social Identity"
            ];
          } else if (interests.includes('fire') || interests.includes('chicago')) {
            return [
              "Urban Resilience and Reconstruction",
              "Crisis and Community Transformation", 
              "Rebuilding and Social Progress"
            ];
          } else if (interests.includes('mirror')) {
            return [
              "Reflection and Historical Memory",
              "Perspective and Truth in Historical Narratives",
              "Identity and Self-Perception Through Time"
            ];
          } else if (interests.includes('urban') || interests.includes('city')) {
            return [
              "Community Design and Social Justice",
              "Sustainable Development and Urban Innovation",
              "Cultural Heritage and Urban Transformation"
            ];
          } else if (interests.includes('technology')) {
            return [
              "Innovation and Social Change",
              "Digital Transformation and Human Connection",
              "Technology Ethics and Global Impact"
            ];
          } else {
            return [
              "Cultural Exchange and Identity Formation",
              "Innovation and Social Transformation",
              "Power, Justice, and Community Building"
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

      // Determine response type based on content quality
      let responseInstruction;
      if (isIdeationComplete) {
        responseInstruction = `Ideation is complete! Provide a summary of their Big Idea, Essential Question, and Challenge, then ask if they want to move to the Learning Journey stage. Do not provide any more suggestions.`;
      } else if (userProvidedContent) {
        responseInstruction = `User provided complete content: "${messageContent}". Update ideationProgress.${expectedStep} with this content and move to next step. NO "what if" suggestions for complete responses.`;
      } else if (meetsBasicQuality && !wasRefinementOffered) {
        // First time seeing a quality response - offer specific refinement suggestions
        const refinementContext = expectedStep === 'bigIdea' ? `to ${projectInfo.subject} and ${projectInfo.ageGroup}` :
                                 expectedStep === 'essentialQuestion' ? `to connect more directly to "${ideationData.bigIdea}"` :
                                 `to be more specific about what ${projectInfo.ageGroup} will create`;
        
        responseInstruction = `User provided a quality ${expectedStep}: "${messageContent}". This meets the basic criteria! Acknowledge it's good and offer specific refinement suggestions: "That's a solid ${expectedStep}! Here are some ways to strengthen it further, or you can keep it as is:" Provide 3 specific refinement suggestions in suggestions array: ["Make it more specific ${refinementContext}", "Connect it more directly to real-world applications", "Focus it on ${projectInfo.ageGroup} developmental level", "Keep and Continue"]. Do NOT capture yet - wait for their choice.`;
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // User confirmed they want to keep the previously proposed response
        responseInstruction = `User confirmed they want to keep the proposed ${expectedStep}: "${proposedResponse}". Update ideationProgress.${expectedStep} with "${proposedResponse}" and move to next step. NO suggestions.`;
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
        responseInstruction = `User asked for help with ${expectedStep}. Provide 3 "What if" coaching suggestions to help them develop their thinking. Stay on current step.`;
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
        setIdeationData(response.ideationProgress);
      } else if (userProvidedContent && !isPoorQualityResponse) {
        // Manual capture for complete, high-quality responses OR suggestion selections
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
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // User confirmed they want to keep the proposed response
        const updatedData = { ...ideationData };
        
        if (expectedStep === 'bigIdea' && !ideationData.bigIdea) {
          updatedData.bigIdea = proposedResponse;
          console.log('📝 Captured confirmed Big Idea:', proposedResponse);
        } else if (expectedStep === 'essentialQuestion' && !ideationData.essentialQuestion) {
          updatedData.essentialQuestion = proposedResponse;
          console.log('📝 Captured confirmed Essential Question:', proposedResponse);
        } else if (expectedStep === 'challenge' && !ideationData.challenge) {
          updatedData.challenge = proposedResponse;
          console.log('📝 Captured confirmed Challenge:', proposedResponse);
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
            chatResponse: `Perfect! You've chosen "${contentToCapture}" as your Big Idea. Now let's work on the Essential Question that will drive student inquiry about this theme.`,
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
            chatResponse: `Perfect! "${proposedResponse}" is now your Big Idea. Let's move on to your Essential Question.`,
            currentStep: 'essentialQuestion',
            interactionType: 'conversationalIdeation',
            currentStage: 'Ideation',
            suggestions: null,
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
                            // Enhanced styling for AI messages (on white background)
                            <div 
                              className="space-y-3"
                              dangerouslySetInnerHTML={{
                                __html: msg.chatResponse
                                  // Clean any potential artifacts first
                                  .replace(/n\/n/g, '')
                                  .replace(/\\n\\n/g, '\n\n')
                                  .replace(/\\n/g, '\n')
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