// src/features/deliverables/ConversationalDeliverables.jsx
import React, { useState, useEffect, useRef } from 'react';
import StageHeader from '../../components/StageHeader.jsx';
import DeliverablesProgress from './DeliverablesProgress.jsx';
import { PROJECT_STAGES } from '../../config/constants.js';
import { generateJsonResponse } from '../../services/geminiService.js';
import { conversationalDeliverablesPrompts } from '../../ai/promptTemplates/conversationalDeliverables.js';

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
    className="block w-full text-left p-3 my-2 bg-emerald-50 hover:bg-emerald-100 border-l-4 border-emerald-500 rounded-r-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <p className="font-medium text-emerald-800">{suggestion}</p>
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
        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600' 
        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:border-emerald-400'
    }`}
  >
    {suggestion}
  </button>
);

const HelpButton = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-block px-4 py-2 mx-1 my-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    💡 {children}
  </button>
);

const ConversationalDeliverables = ({ projectInfo, ideationData, journeyData, onComplete, onCancel }) => {
  // Validation functions for step completion
  const isCompleteResponse = (content, step) => {
    const trimmed = content.trim();
    const wordCount = trimmed.split(/\s+/).length;
    switch (step) {
      case 'milestones': {
        // Reject learning activities and casual language
        const isLearningActivity = /^(students|they|learners).*(learn|study|research|explore|understand|practice|work on|focus on)/i.test(trimmed);
        const isPersonalInterest = /^(i want|i would like|i'd like|looking at|examine|study|research|explore|i'm interested in|i think about|my students|i teach|about|it's about)/i.test(trimmed);
        const isCasualResponse = /^(yeah|yea|well|so|um|uh|like|just|maybe|perhaps|kinda|sorta)/i.test(trimmed);
        const isIncompleteFragment = wordCount < 2 || trimmed.length < 8;
        
        if (isLearningActivity || isPersonalInterest || isCasualResponse || isIncompleteFragment) {
          return false;
        }
        
        // Should contain deliverable language
        const hasDeliverableLanguage = /(report|presentation|proposal|design|portfolio|product|document|plan|analysis|recommendation|solution|prototype|model|showcase|exhibition)/i.test(trimmed);
        return hasDeliverableLanguage && wordCount >= 2;
      }
      
      case 'descriptions': {
        // Descriptions should specify audience, format, and purpose
        const hasAudience = /(community|stakeholders|experts|officials|members|peers|professionals|public|audience)/i.test(trimmed);
        const hasFormat = /(page|minute|section|visual|interactive|digital|physical|written|oral|presented|shared|displayed)/i.test(trimmed);
        const isDetailed = wordCount >= 10 && trimmed.length > 40;
        
        return hasAudience && hasFormat && isDetailed;
      }
      
      case 'assessment': {
        // Assessment should be authentic and growth-oriented
        const hasAuthenticAssessment = /(feedback|reflection|portfolio|peer|community|expert|stakeholder|authentic|professional|real|growth|development)/i.test(trimmed);
        const notTraditional = !/^(test|quiz|exam|grade|score|traditional|multiple choice|true false)/i.test(trimmed);
        const isSpecific = wordCount >= 6 && trimmed.length > 25;
        
        return hasAuthenticAssessment && notTraditional && isSpecific;
      }
      
      default:
        return wordCount >= 3;
    }
  };

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deliverablesData, setDeliverablesData] = useState({
    milestones: [], // Will contain objects like { title: "Milestone Name", description: "Details" }
    assessmentMethods: []
  });
  const [currentStep, setCurrentStep] = useState('milestones');
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
    console.log('🔄 Initializing conversational student deliverables for', projectInfo.subject);
    
    try {
      const systemPrompt = conversationalDeliverablesPrompts.systemPrompt(projectInfo, ideationData, journeyData, deliverablesData);
      
      const response = await generateJsonResponse([], systemPrompt + `

This is the INITIAL conversation start. You MUST provide STAGE TRANSITION and grounding.

MANDATORY INITIAL RESPONSE RULES:
1. Acknowledge the completed learning journey (phases and progression)
2. Explain the Student Deliverables stage and why it matters
3. Explain we're working on Key Milestones (step 1 of 3)
4. Ask for their initial thoughts on key milestones
5. ABSOLUTELY NO SUGGESTIONS - this is pure grounding

REQUIRED JSON RESPONSE:
{
  "chatResponse": "Your stage transition and grounding message here",
  "currentStep": "milestones", 
  "interactionType": "conversationalDeliverables",
  "currentStage": "Student Deliverables",
  "suggestions": null,
  "isStageComplete": false,
  "dataToStore": null,
  "deliverablesProgress": {
    "milestones": [],
    "assessmentMethods": []
  }
}

CRITICAL: suggestions field MUST be null. No arrays, no examples, just null.`);

      console.log('🎯 AI Response received successfully');

      // Prepare fallback grounding message with educational sophistication
      const pedagogicalContext = getPedagogicalContext(projectInfo.ageGroup);
      const fallbackGroundingMessage = `**Outstanding learning design! Your journey is expertly crafted.** 🎯

Your Learning Progression: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Thoughtfully scaffolded phases'}

Now we advance to **STUDENT DELIVERABLES** - where learning becomes visible through authentic creation. Research on assessment (Grant Wiggins) shows that when students create real products for real audiences, they develop both deeper understanding and transferable skills.

**We begin with Key Milestones** - the portfolio-worthy deliverables ${projectInfo.ageGroup || 'your students'} will create. ${pedagogicalContext?.developmentalStage === 'Elementary/Primary' ? 'Elementary students thrive when creating "real" products that matter beyond the classroom.' : pedagogicalContext?.developmentalStage === 'Middle/Lower Secondary' ? 'Adolescents need deliverables that feel professional and contribute meaningfully.' : 'These should meet professional standards while scaffolding student growth.'}

**Essential distinction:** Milestones are PRODUCTS students create (like "Research Report"), not ACTIVITIES they do (like "research the topic").

**What are your initial thoughts on 2-4 key deliverables that will demonstrate authentic learning for "${ideationData.challenge}"?**

Consider what professionals in ${projectInfo.subject || 'this field'} actually create and share.`;

      // Ensure we have the right structure and force fallback if needed
      const aiMessage = {
        role: 'assistant',
        chatResponse: (response?.chatResponse && response.chatResponse.trim()) ? response.chatResponse : fallbackGroundingMessage,
        currentStep: response?.currentStep || 'milestones',
        interactionType: 'conversationalDeliverables',
        currentStage: 'Student Deliverables',
        suggestions: response?.suggestions || null,
        isStageComplete: false,
        deliverablesProgress: {
          milestones: [],
          assessmentMethods: []
        },
        timestamp: Date.now()
      };

      setMessages([aiMessage]);
      
      if (response.deliverablesProgress) {
        setDeliverablesData(response.deliverablesProgress);
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
        chatResponse: `**Excellent! Your learning journey is mapped** 🎯

Your Learning Phases: ${journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Your defined progression'}

Now we're moving to the **STUDENT DELIVERABLES** stage where we define what students will create, produce, and share to demonstrate their learning. These aren't traditional assignments - they're authentic products that mirror real professional work and showcase student growth.

**We're starting with Key Milestones** - the major deliverables ${projectInfo.ageGroup || 'your students'} will create throughout their journey. These should be PRODUCTS students create (like "Research Report" or "Community Presentation"), not activities they do (like "research the topic").

**What are your initial thoughts on the key deliverables that will showcase student learning and preparation for "${ideationData.challenge}"?**

Think about the authentic products professionals create in this field.`,
        currentStep: 'milestones',
        interactionType: 'conversationalDeliverables',
        currentStage: 'Student Deliverables',
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
    console.log('💡 Current Deliverables Data:', deliverablesData);
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
      const systemPrompt = conversationalDeliverablesPrompts.systemPrompt(projectInfo, ideationData, journeyData, deliverablesData);
      
      // Format chat history for API
      const chatHistory = newMessages.slice(-6).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.chatResponse || JSON.stringify(msg) }]
      }));

      // Determine what step we should be on based on current conversation step
      // Only advance step when user successfully completes current step, not based on data
      let expectedStep = currentStep || 'milestones';

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
      // Look for patterns like "move forward with 'Milestone Name'" or similar
      const proposedResponseMatch = lastAiMessage?.chatResponse?.match(/move forward with ['"]([^'"]+)['"]|with ['"]([^'"]+)['"]|milestones.*?['"]([^'"]+)['"]|description.*?['"]([^'"]+)['"]|assessment.*?['"]([^'"]+)['"]/i);
      const proposedResponse = proposedResponseMatch ? (proposedResponseMatch[1] || proposedResponseMatch[2] || proposedResponseMatch[3] || proposedResponseMatch[4] || proposedResponseMatch[5]) : null;

      // Detect confirmation responses after selections
      const isConfirmation = messageContent && /^(okay|yes|sure|good|that works?|sounds good|perfect|right|correct|move forward|let's go|continue|keep and continue|keep)(\s+(yes|sounds?\s+good|works?|with that|and continue))?$/i.test(messageContent.trim());

      // Detect poor quality responses that should be rejected
      const isPoorQualityResponse = messageContent && 
        messageContent.trim().length > 10 && 
        !isHelpRequest && 
        !isWhatIfSelection && 
        !isCompleteResponse(messageContent, expectedStep);

      // Check if deliverables are complete
      const isDeliverablesComplete = deliverablesData.milestones?.length > 0 && 
                                   deliverablesData.milestones.every(m => m.description) && 
                                   deliverablesData.assessmentMethods?.length > 0;

      // Determine response type based on content quality
      let responseInstruction;
      if (isDeliverablesComplete) {
        responseInstruction = `Student Deliverables are complete! Provide a summary of their milestones and assessment methods, then congratulate them on completing the full ALF design. Do not provide any more suggestions.`;
      } else if (meetsBasicQuality && !wasRefinementOffered) {
        // First time seeing a quality response - offer refinement
        responseInstruction = `User provided a quality ${expectedStep}: "${messageContent}". This meets the basic criteria! Acknowledge it's good, but offer refinement opportunity. Say something like "That's a solid ${expectedStep}! Would you like to refine it further to make it even more specific to your course, or shall we move forward with '${messageContent}'?" Do NOT capture yet - wait for their choice.`;
      } else if (isConfirmation && wasRefinementOffered && proposedResponse) {
        // User confirmed they want to keep the previously proposed response
        responseInstruction = `User confirmed they want to keep the proposed ${expectedStep}: "${proposedResponse}". Update deliverablesProgress with "${proposedResponse}" and move to next step. NO suggestions.`;
      } else if (meetsBasicQuality && wasRefinementOffered && !isConfirmation) {
        // User provided a refinement after we offered the opportunity
        responseInstruction = `User provided a refined ${expectedStep}: "${messageContent}". Update deliverablesProgress with this refined content and move to next step. NO suggestions.`;
      } else if (isPoorQualityResponse) {
        // Handle poor quality responses with coaching
        responseInstruction = `User provided poor quality content: "${messageContent}". This is a POOR QUALITY response that should be REJECTED. ${expectedStep === 'milestones' ? 'This appears to be learning activities rather than student deliverables.' : expectedStep === 'descriptions' ? 'This needs more specificity about audience, format, and purpose.' : 'This appears to be traditional assessment rather than authentic evaluation.'} Coach them toward the proper format and provide 3 "What if" suggestions to help them reframe properly. Stay on current step.`;
      } else if (isWhatIfSelection) {
        // Extract the core concept from the "What if" suggestion for development
        const extractConcept = (whatIfText) => {
          if (whatIfText.toLowerCase().includes('report')) return 'Research Report';
          if (whatIfText.toLowerCase().includes('presentation')) return 'Community Presentation';
          if (whatIfText.toLowerCase().includes('proposal')) return 'Design Proposal';
          const match = whatIfText.match(/["''](.*?)["'']|was\s+["']?(.*?)["']?[\s,]/i);
          return match ? (match[1] || match[2]) : 'this concept';
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

      const response = await generateJsonResponse(chatHistory, systemPrompt + `

Current step: ${expectedStep}
${responseInstruction}

Respond in JSON format with chatResponse, currentStep, suggestions, and deliverablesProgress.`);

      console.log('🎯 AI Response:', response);

      const aiMessage = {
        role: 'assistant',
        chatResponse: response.chatResponse,
        suggestions: response.suggestions,
        isStageComplete: response.isStageComplete,
        deliverablesProgress: response.deliverablesProgress,
        interactionType: response.interactionType || 'conversationalDeliverables',
        currentStage: response.currentStage || 'Student Deliverables',
        currentStep: response.currentStep || expectedStep,
        timestamp: Date.now()
      };

      console.log('💬 AI Message to add:', aiMessage);
      setMessages(prev => [...prev, aiMessage]);

      // Update deliverables data
      if (response.deliverablesProgress) {
        console.log('📊 AI provided deliverables progress:', response.deliverablesProgress);
        setDeliverablesData(response.deliverablesProgress);
      }

      // Only update step if user actually provided complete content or confirmed selection
      const userProvidedContent = (meetsBasicQuality && (isConfirmation || wasRefinementOffered)) || isSuggestionSelection;
      
      if (userProvidedContent || isSuggestionSelection || (isConfirmation && wasRefinementOffered && proposedResponse)) {
        const nextStep = expectedStep === 'milestones' ? 'descriptions' : 
                        expectedStep === 'descriptions' ? 'assessment' : 
                        expectedStep === 'assessment' ? 'complete' : expectedStep;
        
        console.log('📍 Advancing step from', expectedStep, 'to', nextStep);
        setCurrentStep(nextStep);
      } else {
        // For help requests, coaching, etc. - stay on current step
        console.log('📍 Staying on current step:', expectedStep);
        setCurrentStep(expectedStep);
      }

      // Handle completion
      if (response.isStageComplete && response.deliverablesProgress) {
        console.log('🎉 Student Deliverables complete! Final data:', response.deliverablesProgress);
        setTimeout(() => {
          onComplete(response.deliverablesProgress);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Error sending message:', error.message);
      
      const errorMessage = {
        role: 'assistant',
        chatResponse: "I encountered a technical issue, but I'm still here to help! Could you please try rephrasing your message?",
        currentStep: currentStep,
        interactionType: 'conversationalDeliverables',
        currentStage: 'Student Deliverables',
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
          stage={PROJECT_STAGES.DELIVERABLES} 
          showDescription={false}
          className="mb-4"
        />
        
        {/* Project Context */}
        <div className="bg-white border border-emerald-200 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Challenge:</span>
              <div className="font-medium text-gray-800">{ideationData.challenge}</div>
            </div>
            <div>
              <span className="text-gray-600">Learning Phases:</span>
              <div className="font-medium text-gray-800">
                {journeyData.phases ? journeyData.phases.map(p => p.title).join(' → ') : 'Defined'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Age Group:</span>
              <div className="font-medium text-gray-800">{projectInfo.ageGroup}</div>
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
                    
                    <div className={`max-w-xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'}`}>
                      {!isUser && import.meta.env.DEV && (
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
                                  .replace(/^\*\*(.*?)\*\*$/gm, '<h3 class="text-lg font-semibold text-emerald-800 mb-2 mt-4">$1</h3>')
                                  .replace(/^(\d+)\)\s+(.*?)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center justify-center mt-0.5">$1</span><span class="text-gray-700">$2</span></div>')
                                  .replace(/^[•-]\s+(.*?)$/gm, '<div class="flex items-start gap-2 mb-2"><span class="flex-shrink-0 w-2 h-2 bg-emerald-400 rounded-full mt-2"></span><span class="text-gray-700">$1</span></div>')
                                  .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-gray-800">$1</span>')
                                  .replace(/\*(.*?)\*/g, '<em class="text-emerald-700">$1</em>')
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
                        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-emerald-800 mb-3">🎉 Active Learning Framework Complete!</h3>
                            <p className="text-emerald-700 mb-3 font-medium">Congratulations! You've designed a transformative learning experience.</p>
                            <div className="text-sm text-emerald-600 mb-4 space-y-2 max-w-lg mx-auto">
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-500">🎯</span>
                                <span>Big Idea → Essential Question → Authentic Challenge</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-500">🚀</span>
                                <span>Learning phases that build expertise progressively</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-500">🏆</span>
                                <span>Professional deliverables with authentic assessment</span>
                              </div>
                            </div>
                            <p className="text-emerald-600 text-sm mb-5 italic">
                              "The best teachers are those who show you where to look but don't tell you what to see." - A. Trenfor
                            </p>
                            <button
                              onClick={() => onComplete(deliverablesData)}
                              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-10 py-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                              View Your Complete ALF Design →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
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
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex items-center bg-slate-100 rounded-xl p-2 border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500">
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
                className="bg-emerald-600 text-white p-3 rounded-lg disabled:bg-slate-300 self-end transition-colors shadow-sm hover:bg-emerald-700"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Sidebar */}
        <div className="w-80 flex-shrink-0">
          <DeliverablesProgress 
            deliverablesData={deliverablesData}
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
            ← Back to Learning Journey
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationalDeliverables;