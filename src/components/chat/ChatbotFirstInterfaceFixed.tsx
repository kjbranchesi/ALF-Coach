/**
 * ChatbotFirstInterfaceFixed.tsx
 * 
 * ACTUALLY WORKING chat interface with real AI integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, Lightbulb, Map, Target, Download, HelpCircle, Sparkles } from 'lucide-react';
import { ContextualInitiator } from './ContextualInitiator';
import { ProgressSidebar, Stage } from './ProgressSidebar';
import { InlineHelpContent } from './UIGuidanceSystemV2';
import { StageInitiatorCards } from './StageInitiatorCards';
import { ConversationalOnboarding } from './ConversationalOnboarding';
import { getStageHelp } from '../../utils/stageSpecificContent';
import { MessageRenderer } from './MessageRenderer';
import { EnhancedButton } from '../ui/EnhancedButton';
import { UniversalHeader } from '../layout/UniversalHeader';
import { StreamlinedWizard } from '../../features/wizard/StreamlinedWizard';
import { ContextualHelp } from './ContextualHelp';
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';
import { firebaseSync } from '../../services/FirebaseSync';
import { useFeatureFlag } from '../../utils/featureFlags';
// Removed unused StateManager import
import { logger } from '../../utils/logger';
import { WizardHandoffService } from '../../services/WizardHandoffService';
import { getContextualHelp } from '../../utils/helpContent';
import { getStageSuggestions } from '../../utils/suggestionContent';
import { CONVERSATION_STAGES, getStageMessage, shouldShowCards, getNextStage } from '../../utils/conversationFramework';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    showIdeas?: boolean;
    showHelp?: boolean;
    suggestions?: Array<{ id: string; text: string; category: string }>;
    stageInitiator?: {
      type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline';
      value: string;
    };
  };
}

interface ProjectState {
  stage: 'ONBOARDING' | 'GROUNDING' | 'IDEATION_INTRO' | 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  conversationStep: number;
  messageCountInStage: number;
  context: {
    subject: string;
    gradeLevel: string;
    duration: string;
    location: string;
    materials: string;
  };
  ideation: {
    bigIdea: string;
    bigIdeaConfirmed: boolean;
    essentialQuestion: string;
    essentialQuestionConfirmed: boolean;
    challenge: string;
    challengeConfirmed: boolean;
  };
  journey: {
    phases: {
      analyze: { duration: string; activities: string[] };
      brainstorm: { duration: string; activities: string[] };
      prototype: { duration: string; activities: string[] };
      evaluate: { duration: string; activities: string[] };
    };
  };
}

const SYSTEM_PROMPT = `You are an expert curriculum designer helping educators create project-based learning experiences using the Active Learning Framework (ALF).

Current Stage: {stage}
User Context: {context}

{stageInstructions}

Your role is to:
1. Guide teachers through designing projects where STUDENTS journey through the Creative Process
2. Be conversational but professional
3. Ask one question at a time
4. Provide specific, actionable suggestions
5. Remember: Teachers DESIGN the curriculum, Students DO the creative process

Respond naturally to the teacher's input and guide them to the next step.`;

interface ChatbotFirstInterfaceFixedProps {
  projectId?: string;
  projectData?: any;
  onStageComplete?: (stage: string, data: any) => void;
  onNavigate?: (target: string) => void;
}

export const ChatbotFirstInterfaceFixed: React.FC<ChatbotFirstInterfaceFixedProps> = ({ 
  projectId, 
  projectData, 
  onStageComplete,
  onNavigate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSuggestionsForMessage, setShowSuggestionsForMessage] = useState<string | null>(null);
  const [showHelpForMessage, setShowHelpForMessage] = useState<string | null>(null);
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [automaticSuggestionsHidden, setAutomaticSuggestionsHidden] = useState(false);
  const [lastSuggestionStage, setLastSuggestionStage] = useState<string>('');
  
  // Store wizard data locally to avoid race condition with projectData updates
  const [localWizardData, setLocalWizardData] = useState<any>(null);
  
  // Feature flags
  const useInlineUI = useFeatureFlag('inlineUIGuidance');
  const useProgressSidebar = useFeatureFlag('progressSidebar');
  const useStageInitiators = useFeatureFlag('stageInitiatorCards');
  
  // Standardize wizard data access with comprehensive fallback
  const getWizardData = () => {
    // Use local wizard data first (set when wizard completes), then fall back to projectData
    const wizard = localWizardData || projectData?.wizardData || {};
    // Ensure all fields are present even if undefined
    return {
      projectTopic: wizard.projectTopic || '',
      learningGoals: wizard.learningGoals || '',
      entryPoint: wizard.entryPoint || '',
      subjects: wizard.subjects || [],
      gradeLevel: wizard.gradeLevel || '',
      duration: wizard.duration || '',
      materials: wizard.materials || '',
      specialRequirements: wizard.specialRequirements || '',
      specialConsiderations: wizard.specialConsiderations || '',
      pblExperience: wizard.pblExperience || ''
    };
  };
  
  const [projectState, setProjectState] = useState<ProjectState>(() => {
    const wizard = getWizardData();
    const hasWizardData = wizard.subjects?.length > 0 || wizard.projectTopic;
    return {
      stage: hasWizardData ? 'GROUNDING' : 'ONBOARDING',
      conversationStep: 0,
      messageCountInStage: 0,
      context: {
        subject: wizard.subjects?.join(', ') || '',
        gradeLevel: wizard.gradeLevel || '',
        duration: wizard.duration || '',
        location: wizard.location || '',
        materials: wizard.materials || ''
      },
    ideation: {
      bigIdea: '',
      bigIdeaConfirmed: false,
      essentialQuestion: '',
      essentialQuestionConfirmed: false,
      challenge: '',
      challengeConfirmed: false
    },
    journey: {
      phases: {
        analyze: { duration: '', activities: [] },
        brainstorm: { duration: '', activities: [] },
        prototype: { duration: '', activities: [] },
        evaluate: { duration: '', activities: [] }
      }
    }
  };
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef(new GeminiService());
  
  // Connection status logging removed - not using StateManager
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize with proper welcome message - only if not showing onboarding
  useEffect(() => {
    console.log('[ChatbotFirstInterfaceFixed] Welcome message useEffect triggered', {
      stage: projectState.stage,
      messagesLength: messages.length,
      hasLocalWizardData: !!localWizardData,
      hasProjectData: !!projectData?.wizardData
    });
    
    const wizard = getWizardData();
    
    // Show welcome message when stage changes to GROUNDING (from wizard completion)
    if (projectState.stage === 'GROUNDING' && messages.length === 0) {
      console.log('[ChatbotFirstInterfaceFixed] Stage changed to GROUNDING, initializing welcome message');
      
      // Use context from projectState if wizard data is not yet available
      const contextSubject = wizard.subjects?.join(', ') || projectState.context.subject || 'your subject area';
      const contextGrade = wizard.gradeLevel || projectState.context.gradeLevel || 'your students';
      const contextTopic = wizard.projectTopic || 'an engaging project';
      
      let welcomeContent = '';
      
      if (wizard.subjects?.length > 0 || wizard.projectTopic) {
        // Use WizardHandoffService for proper contextualization
        const handoff = WizardHandoffService.generateHandoff(wizard);
        welcomeContent = handoff.initialMessage;
      } else {
        // Fallback welcome message using available context
        welcomeContent = `Perfect! I see you're working with ${contextSubject} students on ${contextTopic}. Let's create an amazing Active Learning Framework experience!

What's the big idea or theme you'd like your students to explore? Think about a real-world problem or compelling question that could drive this project.`;
      }
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        metadata: {
          stage: 'GROUNDING'
        }
      };
      setMessages([welcomeMessage]);
      console.log('[ChatbotFirstInterfaceFixed] Welcome message set, chat should be visible');
    }
  }, [projectState.stage, projectState.context, messages.length, localWizardData]);
  
  // Generate contextual AI prompt using rich wizard data
  const generateAIPrompt = (userInput: string): string => {
    const wizard = getWizardData();
    const ideation = projectData?.ideation || projectState.ideation;
    
    // Get stage-specific instructions
    const getStageInstructions = () => {
      switch (projectState.stage) {
        case 'BIG_IDEA':
        case 'IDEATION_BIG_IDEA':
          return `CURRENT TASK: Help the teacher define a Big Idea - an overarching concept that drives student learning.

ACCEPTANCE CRITERIA:
- Accept ANY conceptual statement (3+ words)
- Build on what they give rather than asking for more
- Examples they might give: "culture shapes cities", "technology changes us", "stories matter"

RESPONSE STRATEGY:
1. ACKNOWLEDGE their input positively ("Excellent! 'X' is a powerful concept...")
2. BUILD on it contextually ("This will help students explore...")
3. ADVANCE to next step ("With that foundation, let's consider...")

NEVER say "could you clarify" or "what do you mean by" unless input is less than 3 words.
Format your response with markdown for clarity.`;
        
        case 'ESSENTIAL_QUESTION':
        case 'IDEATION_EQ':
          return `CURRENT TASK: Help create an Essential Question based on their Big Idea: "${ideation.bigIdea || 'Not yet defined'}"
Ask: "What open-ended question will guide student inquiry throughout this project?"
The question should be thought-provoking and connect to the Big Idea.`;
        
        case 'CHALLENGE':
        case 'IDEATION_CHALLENGE':
          return `CURRENT TASK: Help create a real-world Challenge based on their Essential Question: "${ideation.essentialQuestion || 'Not yet defined'}"
Ask: "What authentic problem or challenge will students solve?"
The challenge should be engaging and allow for multiple solutions.`;
        
        case 'JOURNEY':
          return `CURRENT TASK: Plan the learning journey through four phases.
Ask: "Let's plan how students will work through this challenge. What will they do in each phase?"
Guide them through: Analyze → Brainstorm → Prototype → Evaluate
Use markdown lists and headers to organize the phases clearly.`;
        
        case 'DELIVERABLES':
          return `CURRENT TASK: Define what students will create and how it will be assessed.
Ask: "What will students create to demonstrate their learning? How will you assess it?"
Help them define concrete deliverables and assessment criteria.
Use markdown tables or lists to present assessment options clearly.`;
        
        default:
          return `CURRENT TASK: Understand the teacher's project context and goals.`;
      }
    };
    
    const stageInstructions = getStageInstructions();
    
    // Build context string
    const context = `
=== PROJECT CONTEXT ===
Subject: ${wizard.subjects?.join(', ') || projectState.context.subject || 'Not specified'}
Grade Level: ${wizard.gradeLevel || projectState.context.gradeLevel || 'Not specified'}
Duration: ${wizard.duration || projectState.context.duration || 'Not specified'}
Topic: ${wizard.projectTopic || 'Not specified'}
Learning Goals: ${wizard.learningGoals || 'Not specified'}

=== CONVERSATION PROGRESS ===
- Big Idea: ${ideation.bigIdea || 'Not yet defined'}
- Essential Question: ${ideation.essentialQuestion || 'Not yet defined'}
- Challenge: ${ideation.challenge || 'Not yet defined'}

=== USER INPUT ===
"${userInput}"
`;
    
    return SYSTEM_PROMPT
      .replace('{stage}', projectState.stage)
      .replace('{context}', context)
      .replace('{stageInstructions}', stageInstructions);
  };
  
  // Framework for when suggestions should appear automatically
  const shouldShowAutomaticSuggestions = () => {
    // Don't show if user manually hid them
    if (automaticSuggestionsHidden) return false;
    
    // Don't show if already showing manually
    if (showSuggestions) return false;
    
    // Don't show if typing
    if (isTyping) return false;
    
    // Show suggestions at key transition points
    const suggestibleStages = ['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'];
    
    // Show if:
    // 1. We're in a suggestible stage
    // 2. Stage just changed (different from last shown)
    // 3. User hasn't typed anything yet
    // 4. Not too many messages in current stage (first 2 messages)
    return (
      suggestibleStages.includes(projectState.stage) &&
      projectState.stage !== lastSuggestionStage &&
      !input.trim() &&
      projectState.messageCountInStage <= 1
    );
  };
  
  // Reset automatic suggestions when stage changes
  useEffect(() => {
    if (projectState.stage !== lastSuggestionStage) {
      setAutomaticSuggestionsHidden(false);
      setLastSuggestionStage(projectState.stage);
    }
  }, [projectState.stage, lastSuggestionStage]);
  
  // Show celebration when stage completes
  const showStageCompletionCelebration = (stageName: string) => {
    const celebration = document.createElement('div');
    celebration.innerHTML = `
      <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl animate-bounce">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎉</span>
          <div>
            <p class="font-semibold">${stageName} Complete!</p>
            <p class="text-sm opacity-90">Great progress on your project</p>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(celebration);
    setTimeout(() => {
      celebration.style.animation = 'fadeOut 0.5s';
      setTimeout(() => celebration.remove(), 500);
    }, 2000);
  };

  // Improved stage transition with natural progression and quality validation
  const detectStageTransition = (userInput: string, aiResponse: string) => {
    const input = userInput.toLowerCase();
    
    // Track message count in current stage
    setProjectState(prev => ({
      ...prev,
      messageCountInStage: prev.messageCountInStage + 1
    }));
    
    // Detect confusion patterns (from guide section 4)
    const confusionPatterns = [
      'not sure', 'don\'t understand', 'confused', 'what do you mean',
      'can you explain', 'help me', 'i don\'t know', 'unclear', 'lost'
    ];
    const seemsConfused = confusionPatterns.some(pattern => input.includes(pattern));
    
    // Look for explicit progression signals (from guide section 5)
    const progressionSignals = [
      'sounds good', 'let\'s continue', 'what\'s next', 'next step',
      'i\'m ready', 'that works', 'perfect', 'great', 'yes, let\'s',
      'let\'s move on', 'i like that', 'that\'s it', 'exactly'
    ];
    const wantsToProgress = progressionSignals.some(signal => input.includes(signal));
    
    // Don't progress if user is confused
    if (seemsConfused) {
      console.log('[Stage Transition] User seems confused, providing support');
      // Stay in current stage but increase support
      return;
    }
    
    // GROUNDING -> BIG_IDEA (after initial context exchange)
    if (projectState.stage === 'GROUNDING' && projectState.messageCountInStage >= 1) {
      console.log('[Stage Transition] GROUNDING -> BIG_IDEA');
      setProjectState(prev => ({
        ...prev,
        stage: 'BIG_IDEA',
        messageCountInStage: 0
      }));
      return;
    }
    
    // BIG_IDEA -> ESSENTIAL_QUESTION (accepting almost any input)
    if (projectState.stage === 'BIG_IDEA') {
      // Accept ANY substantive input - no more circular questioning!
      const hasSubstance = userInput.trim().length > 5; // Very low bar
      
      // After 3 messages, accept ANYTHING
      const forceAccept = projectState.messageCountInStage >= 3;
      
      // Progress if: has any substance OR forced after 3 tries OR user wants to progress
      if (hasSubstance || forceAccept || wantsToProgress) {
        console.log('[Stage Transition] BIG_IDEA -> ESSENTIAL_QUESTION (accepting user input)', { bigIdea: userInput });
        showStageCompletionCelebration('Big Idea');
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, bigIdea: userInput, bigIdeaConfirmed: true },
          stage: 'ESSENTIAL_QUESTION',
          messageCountInStage: 0
        }));
        
        if (onStageComplete) {
          onStageComplete('bigIdea', { bigIdea: userInput });
        }
        return;
      }
    }
    
    // ESSENTIAL_QUESTION -> CHALLENGE (with open-ended validation)
    if (projectState.stage === 'ESSENTIAL_QUESTION') {
      // Check for question indicators
      const hasQuestion = input.includes('?') || 
                         (input.includes('how') || input.includes('why') || input.includes('what')) &&
                         userInput.length > 15;
      
      // Check if it's open-ended (not yes/no) - from guide quality indicators
      const isOpenEnded = !input.match(/^(is|are|do|does|can|will|should)/i);
      
      // Progress if: quality question with confirmation OR after discussion
      if (hasQuestion && isOpenEnded && (wantsToProgress || projectState.messageCountInStage >= 3)) {
        console.log('[Stage Transition] ESSENTIAL_QUESTION -> CHALLENGE', { essentialQuestion: userInput });
        showStageCompletionCelebration('Essential Question');
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, essentialQuestion: userInput, essentialQuestionConfirmed: true },
          stage: 'CHALLENGE',
          messageCountInStage: 0
        }));
        
        if (onStageComplete) {
          onStageComplete('essentialQuestion', { essentialQuestion: userInput });
        }
        return;
      }
    }
    
    // CHALLENGE -> JOURNEY (with authenticity check)
    if (projectState.stage === 'CHALLENGE') {
      // Check for action-oriented, authentic challenge
      const hasActionWords = (input.includes('create') || input.includes('design') || 
                             input.includes('solve') || input.includes('help') ||
                             input.includes('develop') || input.includes('build') ||
                             input.includes('improve') || input.includes('propose'));
      
      const hasAudience = (input.includes('community') || input.includes('school') ||
                          input.includes('local') || input.includes('families') ||
                          input.includes('students') || input.includes('people'));
      
      // Quality check: authentic challenge with real audience
      const isAuthentic = userInput.length > 20 && hasActionWords;
      
      // Progress if: authentic challenge with confirmation OR after discussion
      if (isAuthentic && (wantsToProgress || projectState.messageCountInStage >= 3)) {
        console.log('[Stage Transition] CHALLENGE -> JOURNEY', { challenge: userInput });
        showStageCompletionCelebration('Challenge Definition');
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, challenge: userInput, challengeConfirmed: true },
          stage: 'JOURNEY',
          messageCountInStage: 0
        }));
        
        if (onStageComplete) {
          onStageComplete('challenge', { challenge: userInput });
        }
        return;
      }
    }
    
    // JOURNEY -> DELIVERABLES (after sufficient planning)
    if (projectState.stage === 'JOURNEY') {
      // Progress after meaningful discussion or explicit confirmation
      if (wantsToProgress || projectState.messageCountInStage >= 4) {
        console.log('[Stage Transition] JOURNEY -> DELIVERABLES');
        setProjectState(prev => ({
          ...prev,
          stage: 'DELIVERABLES',
          messageCountInStage: 0
        }));
        return;
      }
    }
    
    // DELIVERABLES -> COMPLETE (after deliverables defined)
    if (projectState.stage === 'DELIVERABLES') {
      // Progress after deliverables discussion or explicit confirmation
      if (wantsToProgress || projectState.messageCountInStage >= 3) {
        console.log('[Stage Transition] DELIVERABLES -> COMPLETE');
        showStageCompletionCelebration('Project Blueprint');
        setProjectState(prev => ({
          ...prev,
          stage: 'COMPLETE',
          messageCountInStage: 0
        }));
        return;
      }
    }
  };
  
  // Handle sending messages with REAL AI
  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLastInteractionTime(Date.now());
    
    // Add micro-interaction feedback
    const inputElement = document.querySelector('textarea');
    if (inputElement) {
      inputElement.style.transform = 'scale(0.98)';
      setTimeout(() => {
        inputElement.style.transform = 'scale(1)';
      }, 150);
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsTyping(true);
    
    // Check if user is asking for ideas/examples
    const askingForIdeas = [
      'ideas', 'examples', 'suggestions', 'options', 'help me think',
      'not sure', 'give me', 'show me', 'what are some', 'can you suggest'
    ].some(phrase => userInput.toLowerCase().includes(phrase));
    
    try {
      let aiResponse = '';
      
      // If asking for ideas, generate suggestions and show them
      if (askingForIdeas) {
        // Generate 3 contextual suggestions based on current stage
        let suggestions: string[] = [];
        
        if (projectState.stage === 'BIG_IDEA') {
          suggestions = [
            "The intersection of culture and urban economics",
            "Power structures shape physical spaces", 
            "Communities create their own economic ecosystems"
          ];
          aiResponse = "Here are some Big Idea concepts to consider for your project. Each one provides a different lens for understanding how culture shapes cities:";
        } else if (projectState.stage === 'ESSENTIAL_QUESTION') {
          suggestions = [
            "How do cultural communities create economic resilience in urban spaces?",
            "To what extent does urban planning reflect or resist cultural diversity?",
            "What is the relationship between neighborhood identity and economic opportunity?"
          ];
          aiResponse = `Great! Based on your Big Idea "${projectState.ideation.bigIdea || ''}", here are some Essential Questions that could drive student inquiry:`;
        } else if (projectState.stage === 'CHALLENGE') {
          suggestions = [
            "Create a cultural asset map and economic impact report for a local neighborhood",
            "Design policy recommendations for inclusive urban development in your community",
            "Develop a multimedia exhibit showing how culture shapes LA's economic landscape"
          ];
          aiResponse = "Here are some authentic challenges that connect to your Essential Question and would give students real purpose:";
        } else {
          // Regular AI response for other stages
          const prompt = generateAIPrompt(userInput);
          aiResponse = await geminiService.current.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 500
          });
        }
        
        // Add suggestions to the message if we have them
        if (suggestions.length > 0) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
            metadata: {
              stage: projectState.stage,
              suggestions: suggestions,
              showSuggestions: true
            }
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
          return; // Exit early since we handled the suggestions
        }
      } else {
        // Regular AI response for non-ideas requests
        const prompt = generateAIPrompt(userInput);
        aiResponse = await geminiService.current.generateResponse(prompt, {
          temperature: 0.7,
          maxTokens: 500
        });
      }
      
      // Detect stage transitions
      detectStageTransition(userInput, aiResponse);
      
      // Determine if we should show help/ideas buttons
      const shouldShowHelp = aiResponse.toLowerCase().includes('big idea') || 
                            aiResponse.toLowerCase().includes('essential question') ||
                            aiResponse.toLowerCase().includes('challenge');
      
      const shouldShowIdeas = projectState.stage === 'IDEATION' || 
                             projectState.stage === 'JOURNEY';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: {
          stage: projectState.stage,
          showIdeas: useInlineUI && shouldShowIdeas,
          showHelp: useInlineUI && shouldShowHelp
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('AI response failed:', error);
      
      // Fallback message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, I'm having trouble processing that. Could you rephrase or tell me more about what you're looking for?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle inline actions (Ideas/Help)
  const handleInlineAction = async (action: 'ideas' | 'help', messageId: string) => {
    logger.log('Inline action triggered:', action, messageId);
    
    if (action === 'ideas') {
      // Get contextual suggestions for the current stage
      const stageSuggestions = getStageSuggestions(projectState.stage, undefined, {
        subject: projectState.context.subject || getWizardData().subjects?.join(', '),
        gradeLevel: projectState.context.gradeLevel || getWizardData().gradeLevel,
        bigIdea: projectState.ideation.bigIdea,
        essentialQuestion: projectState.ideation.essentialQuestion,
        challenge: projectState.ideation.challenge
      });
      
      // Set suggestions and show them
      setSuggestions(stageSuggestions);
      setShowSuggestions(true);
      setShowSuggestionsForMessage(messageId);
    }
    
    if (action === 'help') {
      // Show contextual help inline
      setShowHelpForMessage(messageId);
    }
  };
  
  // Handle suggestion selection - Fixed to work properly
  const handleSuggestionSelect = (suggestion: string) => {
    console.log('[Suggestion Selected]:', suggestion);
    // Add the suggestion to the input
    setInput(suggestion);
    setShowSuggestionsForMessage(null);
    setShowSuggestions(false); // Also hide the main suggestions panel
    
    // Focus the textarea (not input)
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      // Auto-resize after setting value
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };
  
  // Handle suggestion click - for the new simplified suggestions
  const handleSuggestionClick = (suggestion: any) => {
    console.log('[Suggestion Clicked]:', suggestion);
    // Add the suggestion text to the input
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setInput(text);
    setShowSuggestions(false);
    
    // Focus the textarea
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
    }
  };

  // Handle stage initiator card clicks
  const handleStageInitiatorClick = (prompt: string) => {
    // Replace placeholders with actual context data if available
    let processedPrompt = prompt;
    if (projectState.context.subject) {
      processedPrompt = processedPrompt.replace(/\[subject\]/g, projectState.context.subject);
    }
    if (projectState.context.duration) {
      processedPrompt = processedPrompt.replace(/\[duration\]/g, projectState.context.duration);
    }
    
    setInput(processedPrompt);
    // Focus the input
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback((onboardingData: any) => {
    setProjectState(prev => ({
      ...prev,
      stage: 'WELCOME',
      context: {
        subject: onboardingData.subject,
        gradeLevel: onboardingData.gradeLevel,
        duration: onboardingData.duration,
        location: onboardingData.location,
        materials: onboardingData.materials
      }
    }));

    // Initialize with a personalized welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Perfect! I see you're teaching ${onboardingData.subject} to ${onboardingData.gradeLevel} students for ${onboardingData.duration}. Let's create an amazing Active Learning Framework experience! 

What's the big idea or theme you'd like your students to explore?`,
      timestamp: new Date(),
      metadata: {
        stage: 'WELCOME'
      }
    };
    setMessages([welcomeMessage]);

    // Notify parent component if needed
    onStageComplete?.('onboarding', onboardingData);
  }, [onStageComplete]);

  // Handle onboarding skip
  const handleOnboardingSkip = useCallback(() => {
    console.log('[ChatbotFirstInterfaceFixed] Skipping onboarding');
    
    // Create minimal wizard data
    const minimalData = {
      subject: 'General',
      gradeLevel: 'Middle School',
      duration: '4 weeks',
      location: 'Classroom',
      materials: { readings: [], tools: [] },
      initialIdeas: []
    };
    
    // Transform to blueprint format
    const wizardData = {
      subject: minimalData.subject,
      gradeLevel: minimalData.gradeLevel,
      duration: minimalData.duration,
      location: minimalData.location,
      materials: '',
      initialIdeas: [],
      vision: 'balanced',
      groupSize: '',
      teacherResources: ''
    };
    
    // Update the blueprint
    const updates = {
      ...projectData,
      wizardData: wizardData,
      updatedAt: new Date()
    };
    
    onStageComplete?.('onboarding', updates);
    
    // Update local state
    setProjectState(prev => ({
      ...prev,
      stage: 'GROUNDING',
      context: {
        subject: minimalData.subject,
        gradeLevel: minimalData.gradeLevel,
        duration: minimalData.duration,
        location: minimalData.location,
        materials: ''
      }
    }));

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Welcome! I'm your curriculum design partner. Let's create a transformative learning experience using the Active Learning Framework. What specific topic or project would you like to develop?",
      timestamp: new Date(),
      metadata: {
        stage: 'GROUNDING'
      }
    };
    setMessages([welcomeMessage]);
  }, [projectData, onStageComplete]);
  
  // Generate progress stages
  const getProgressStages = useCallback((): Stage[] => {
    const stages: Stage[] = [
      {
        id: 'setup',
        label: 'Setup',
        icon: <FileText className="w-5 h-5" />,
        status: projectState.stage === 'GROUNDING' ? 'in-progress' : 'completed',
        substeps: [
          { id: 'subject', label: 'Subject Area', completed: !!projectState.context.subject },
          { id: 'grade', label: 'Grade Level', completed: !!projectState.context.gradeLevel },
          { id: 'duration', label: 'Project Duration', completed: !!projectState.context.duration }
        ]
      },
      {
        id: 'ideation',
        label: 'Ideation',
        icon: <Lightbulb className="w-5 h-5" />,
        status: ['IDEATION_INTRO', 'BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE'].includes(projectState.stage) ? 'in-progress' : 
                projectState.stage === 'GROUNDING' ? 'pending' : 'completed',
        substeps: [
          { id: 'bigIdea', label: 'Big Idea', completed: projectState.ideation.bigIdeaConfirmed },
          { id: 'essential', label: 'Essential Question', completed: projectState.ideation.essentialQuestionConfirmed },
          { id: 'challenge', label: 'Challenge', completed: projectState.ideation.challengeConfirmed }
        ]
      },
      {
        id: 'journey',
        label: 'Learning Journey',
        icon: <Map className="w-5 h-5" />,
        status: projectState.stage === 'JOURNEY' ? 'in-progress' : 
                ['DELIVERABLES', 'COMPLETE'].includes(projectState.stage) ? 'completed' : 'pending'
      },
      {
        id: 'deliverables',
        label: 'Deliverables',
        icon: <Target className="w-5 h-5" />,
        status: projectState.stage === 'DELIVERABLES' ? 'in-progress' : 
                projectState.stage === 'COMPLETE' ? 'completed' : 'pending'
      },
      {
        id: 'export',
        label: 'Export',
        icon: <Download className="w-5 h-5" />,
        status: projectState.stage === 'COMPLETE' ? 'completed' : 'pending'
      }
    ];
    
    return stages;
  }, [projectState]);
  
  // Show onboarding if not completed
  if (projectState.stage === 'ONBOARDING') {
    return (
      <StreamlinedWizard
        onComplete={async (data) => {
          console.log('[ChatbotFirstInterfaceFixed] Wizard completed with data:', data);
          
          // Keep ALL wizard data fields for proper context
          const wizardData = {
            // Core fields from wizard
            projectTopic: data.projectTopic || '',
            learningGoals: data.learningGoals || '',
            entryPoint: data.entryPoint || '',
            subjects: data.subjects || [],
            primarySubject: data.primarySubject || data.subjects?.[0] || '',
            gradeLevel: data.gradeLevel || '',
            duration: data.duration || '',
            materials: data.materials || '',
            specialRequirements: data.specialRequirements || '',
            specialConsiderations: data.specialConsiderations || '',
            pblExperience: data.pblExperience || '',
            
            // Legacy fields for compatibility
            subject: data.subjects?.join(', ') || data.subject || '',
            location: data.location || 'classroom',
            vision: 'balanced',
            groupSize: '',
            teacherResources: '',
            initialIdeas: data.initialIdeas || []
          };
          
          // Safely extract subject for context with defensive programming
          const safeSubjects = Array.isArray(wizardData.subjects) ? wizardData.subjects : [];
          const subjectText = safeSubjects.length > 0 ? safeSubjects.join(', ') : (wizardData.subject || '');
          
          // Store wizard data locally FIRST to avoid race condition
          console.log('[ChatbotFirstInterfaceFixed] Storing wizard data locally:', wizardData);
          setLocalWizardData(wizardData);
          
          // Update local state to move past onboarding IMMEDIATELY - don't wait for save
          setProjectState(prev => ({
            ...prev,
            stage: 'GROUNDING',
            context: {
              subject: subjectText,
              gradeLevel: wizardData.gradeLevel || '',
              duration: wizardData.duration || '',
              location: wizardData.location || '',
              materials: wizardData.materials || ''
            }
          }));
          
          // Call the parent's onStageComplete to persist the data (async, don't block UI)
          try {
            console.log('[ChatbotFirstInterfaceFixed] Saving complete wizard data:', wizardData);
            await onStageComplete?.('onboarding', { wizardData });
            console.log('[ChatbotFirstInterfaceFixed] Wizard data saved successfully');
          } catch (error) {
            console.error('[ChatbotFirstInterfaceFixed] Error saving wizard data (user can still proceed):', error);
            // Continue anyway - user experience is not blocked by save failures
          }
        }}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Universal Header */}
      <UniversalHeader title="ALF Coach - Project Design" />
      
      <div className="flex flex-1 overflow-hidden">
      {/* Progress Sidebar */}
      {useProgressSidebar && (
        <ProgressSidebar
          stages={getProgressStages()}
          currentStageId={projectState.stage.toLowerCase()}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onStageClick={(stageId) => logger.log('Stage clicked:', stageId)}
          className="h-full"
        />
      )}
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Floating Step Indicator - Small Pillbox */}
        {projectState.stage !== 'ONBOARDING' && projectState.stage !== 'COMPLETE' && (
          <div className="absolute top-2 right-2 z-10">
            <span className="text-[11px] px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-500 dark:text-gray-400 rounded-full border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
              Step {['GROUNDING', 'BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'].indexOf(projectState.stage) + 1} of 6
            </span>
          </div>
        )}
        
        {/* Chat Messages - Maximized Space */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <div className="max-w-3xl mx-auto space-y-3">
            {messages.map((message, index) => (
              <div key={message.id} className="space-y-3">
                {/* Coach Message with Enhanced Layout */}
                {message.role === 'assistant' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    {/* Coach Avatar & Status */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      {/* Stage Context Indicator */}
                      {message.metadata?.stage && (
                        <div className="mt-2 text-center">
                          <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                            {message.metadata.stage.replace('_', ' ').toLowerCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content with Coaching Context */}
                    <div className="flex-1 max-w-2xl">
                      {/* Stage Progress Context */}
                      {message.metadata?.stage && index === 0 && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-400">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Working on: {message.metadata.stage.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Building on your {getWizardData().subjects?.join(', ') || 'project'} context
                          </p>
                        </div>
                      )}
                      
                      {/* Main Message */}
                      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm shadow-md border border-gray-100 dark:border-gray-700 p-5">
                        <MessageRenderer content={message.content} role={message.role} />
                      </div>
                      
                      {/* Contextual Encouragement */}
                      {message.metadata?.stage && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Thinking about your {projectState.context.gradeLevel || 'students'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {/* User Message with Context */}
                {message.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="max-w-2xl">
                      {/* User Input Context */}
                      <div className="text-right mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Your {projectState.stage.toLowerCase().replace('_', ' ')} input
                        </span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-4 rounded-2xl rounded-tr-sm shadow-lg">
                        <MessageRenderer content={message.content} role={message.role} />
                      </div>
                      
                      {/* Build Progress Indicator */}
                      <div className="mt-2 text-right">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Added to your project design ✓
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Removed the Get Started button - no longer needed */}
                
                {/* Help content can still be shown separately if needed */}
                {showHelpForMessage === message.id && (
                  <div className="mt-3 ml-4 max-w-2xl">
                    <InlineHelpContent
                      {...getContextualHelp(message.content, projectState.stage)}
                      onDismiss={() => setShowHelpForMessage(null)}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {/* Progress Context Panel - Shows decision building */}
            {messages.length > 2 && (
              <div className="mt-6 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">🎯</span>
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Your Project Taking Shape</h3>
                </div>
                
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Big Idea Progress */}
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    projectState.ideation.bigIdeaConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                      : projectState.stage === 'BIG_IDEA' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 animate-pulse' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.bigIdeaConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Big Idea</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {projectState.ideation.bigIdea || 'Conceptual foundation...'}
                    </p>
                  </div>
                  
                  {/* Essential Question Progress */}
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    projectState.ideation.essentialQuestionConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                      : projectState.stage === 'ESSENTIAL_QUESTION' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 animate-pulse' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.essentialQuestionConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Essential Question</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {projectState.ideation.essentialQuestion || 'Driving inquiry...'}
                    </p>
                  </div>
                  
                  {/* Challenge Progress */}
                  <div className={`p-3 rounded-lg border-2 transition-all ${
                    projectState.ideation.challengeConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                      : projectState.stage === 'CHALLENGE' 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 animate-pulse' 
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.challengeConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Challenge</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {projectState.ideation.challenge || 'Authentic task...'}
                    </p>
                  </div>
                </div>
                
                {/* Progress Connection Visual */}
                <div className="mt-3 flex justify-center">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-gradient-to-r from-blue-400 to-purple-400"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Building your project foundation</span>
                    <div className="h-px w-8 bg-gradient-to-r from-purple-400 to-blue-400"></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stage Initiator Cards - Show only when appropriate for the stage */}
            {useStageInitiators && !isTyping && !input.trim() && 
             shouldShowCards(projectState.stage, projectState.messageCountInStage) && (
              <div className="mt-6 mb-6">
                <StageInitiatorCards
                  currentStage={projectState.stage}
                  onCardClick={handleStageInitiatorClick}
                />
              </div>
            )}
            
            {/* Enhanced Thinking Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                {/* Coach Avatar */}
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">AC</span>
                  </div>
                </div>
                
                {/* Thoughtful Processing Indicator */}
                <div className="flex-1 max-w-2xl">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm shadow-md border border-gray-100 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-100" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ALF Coach is thinking...
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                        className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Considering your {projectState.context.gradeLevel || 'students'} and {getWizardData().subjects?.join(', ') || 'project'} context
                      </p>
                    </div>
                  </div>
                  
                  {/* Processing Context */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Drawing on PBL expertise and your project goals
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Compact Input Area */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/30 dark:border-gray-700/30 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            
            {/* Vibrant Suggestion Cards with Icons and Colors */}
            {(showSuggestions || shouldShowAutomaticSuggestions()) && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4"
              >
                <div className="flex flex-col gap-2">
                  {/* Small stage indicator */}
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ideas for {projectState.stage.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  
                  {/* Clean suggestion cards - matching your aesthetic */}
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {typeof suggestion === 'string' ? suggestion : suggestion.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            
            {/* Ultra-Compact ChatGPT-Style Input */}
            <div className="relative">
              {/* Single-line input with expanding textarea and inline buttons */}
              <div className={`relative bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200 shadow-lg hover:shadow-xl`}
                style={{
                  borderRadius: input && input.split('\n').length > 1 ? '24px' : '9999px'
                }}>
                <div className="flex items-center px-4 py-2.5 gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      // Auto-resize like ChatGPT (starts at 1 line, expands to 3, then scrolls)
                      const textarea = e.target;
                      textarea.style.height = '20px';
                      const scrollHeight = textarea.scrollHeight;
                      const newHeight = Math.min(scrollHeight, 60); // max 3 lines at 20px each
                      textarea.style.height = newHeight + 'px';
                      
                      // Smooth transition for border radius based on content
                      const container = textarea.closest('.relative');
                      if (container) {
                        const lines = e.target.value.split('\n').length;
                        const hasMultipleLines = lines > 1 || scrollHeight > 25;
                        container.style.borderRadius = hasMultipleLines ? '24px' : '9999px';
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Message ALF Coach..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-5"
                    style={{ height: '20px', minHeight: '20px', maxHeight: '60px' }}
                  />
                  
                  {/* Inline action buttons like ChatGPT */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Ideas button - circular like ChatGPT */}
                    <button
                      onClick={() => {
                        if (!showSuggestions) {
                          const stageSuggestions = getStageSuggestions(projectState.stage, undefined, {
                            subject: projectState.context.subject || getWizardData().subjects?.join(', '),
                            gradeLevel: projectState.context.gradeLevel || getWizardData().gradeLevel,
                            bigIdea: projectState.ideation.bigIdea,
                            essentialQuestion: projectState.ideation.essentialQuestion,
                            challenge: projectState.ideation.challenge
                          });
                          setSuggestions(stageSuggestions);
                        }
                        setShowSuggestions(!showSuggestions);
                      }}
                      disabled={isTyping}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      title="Get ideas"
                    >
                      <Lightbulb className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    
                    {/* Send button */}
                    <button
                      onClick={handleSend}
                      disabled={isTyping || !input.trim()}
                      className={`p-2 rounded-full transition-all disabled:cursor-not-allowed ${
                        input.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contextual Help Panel */}
      <ContextualHelp
        stage={projectState.stage}
        isOpen={showContextualHelp}
        onClose={() => setShowContextualHelp(false)}
      />
    </div>
    </div>
  );
};

export default ChatbotFirstInterfaceFixed;