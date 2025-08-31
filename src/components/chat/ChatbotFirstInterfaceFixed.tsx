/**
 * ChatbotFirstInterfaceFixed.tsx
 * 
 * ACTUALLY WORKING chat interface with real AI integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, Lightbulb, Map, Target, Download, HelpCircle, Sparkles, Layers, Menu, X } from 'lucide-react';
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
import { getConfirmationStrategy, generateConfirmationPrompt, checkForProgressSignal, checkForRefinementSignal } from '../../utils/confirmationFramework';

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
  awaitingConfirmation?: {
    type: string;
    value: string;
  };
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Function to format stage labels consistently
  const formatStageLabel = (stage: string): string => {
    const stageLabels: Record<string, string> = {
      'ONBOARDING': 'Onboarding',
      'GROUNDING': 'Grounding',
      'IDEATION_INTRO': 'Getting Started',
      'BIG_IDEA': 'Big Idea',
      'ESSENTIAL_QUESTION': 'Essential Question',
      'CHALLENGE': 'Challenge',
      'JOURNEY': 'Learning Journey',
      'DELIVERABLES': 'Deliverables',
      'COMPLETE': 'Complete'
    };
    return stageLabels[stage] || stage.replace('_', ' ').toLowerCase();
  };
  
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
      stage: hasWizardData ? 'BIG_IDEA' : 'ONBOARDING',
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
    
    // Show welcome message when stage changes to BIG_IDEA (from wizard completion)
    if (projectState.stage === 'BIG_IDEA' && messages.length === 0) {
      console.log('[ChatbotFirstInterfaceFixed] Stage changed to BIG_IDEA, initializing welcome message with context:', wizard);
      
      // Build rich context from wizard data
      const contextSubject = wizard.subjects?.join(' & ') || projectState.context.subject || 'your subject area';
      const contextGrade = wizard.gradeLevel || projectState.context.gradeLevel || 'your students';
      const contextTopic = wizard.projectTopic || 'an engaging project';
      const contextDuration = wizard.duration || projectState.context.duration || 'this project';
      
      let welcomeContent = '';
      
      if (wizard.subjects?.length > 0 || wizard.projectTopic) {
        // Enhanced welcome with full wizard context
        if (wizard.projectTopic) {
          welcomeContent = `Excellent! I see you want to explore "${wizard.projectTopic}" with your ${contextGrade} students in ${contextSubject}. This ${contextDuration} project has great potential!

Let's start by defining the Big Idea - the central concept that will drive deep learning. What overarching theme or principle do you want students to understand through this project?`;
        } else {
          welcomeContent = `Perfect! You're creating a ${contextSubject} project for ${contextGrade} students over ${contextDuration}. Let's design something amazing!

What's the big idea or central theme you'd like your students to explore? Think about a concept that connects to real-world challenges and sparks curiosity.`;
        }
      } else {
        // Fallback welcome message using available context
        welcomeContent = `Welcome! Let's create an amazing Active Learning Framework experience for your students.

What's the big idea or theme you'd like your students to explore? Think about a real-world problem or compelling question that could drive this project.`;
      }
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        metadata: {
          stage: 'BIG_IDEA'
        }
      };
      setMessages([welcomeMessage]);
      console.log('[ChatbotFirstInterfaceFixed] Welcome message set with full context, chat should be visible');
    }
  }, [projectState.stage, projectState.context, messages.length, localWizardData, projectData?.wizardData]);
  
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
- Confirm before progressing to next stage

RESPONSE STRATEGY:
1. ACKNOWLEDGE their input positively ("Excellent! 'X' is a powerful concept...")
2. CONFIRM their choice ("This will help students explore [specific benefit]. Shall we build our Essential Question from this?")
3. WAIT for confirmation before advancing

If they want to refine, help them strengthen it.
If they confirm (yes, continue, etc.), proceed to Essential Question.
Format your response with markdown for clarity.`;
        
        case 'ESSENTIAL_QUESTION':
        case 'IDEATION_EQ':
          return `CURRENT TASK: Help create an Essential Question based on their Big Idea: "${ideation.bigIdea || 'Not yet defined'}"

ACCEPTANCE CRITERIA:
- Accept any question format
- Confirm before progressing to Challenge

RESPONSE STRATEGY:
1. ACKNOWLEDGE their question ("Great question! This will drive meaningful inquiry...")
2. CONFIRM their choice ("Ready to design the Challenge that addresses this question?")
3. WAIT for confirmation

Help refine to be more open-ended if needed, but always accept their input positively.`;
        
        case 'CHALLENGE':
        case 'IDEATION_CHALLENGE':
          return `CURRENT TASK: Help create a real-world Challenge based on their Essential Question: "${ideation.essentialQuestion || 'Not yet defined'}"

ACCEPTANCE CRITERIA:
- Accept any action-oriented task
- Confirm before progressing to Journey

RESPONSE STRATEGY:
1. ACKNOWLEDGE their challenge ("This gives students real purpose...")
2. CONFIRM their choice ("Ready to plan the learning journey?")
3. WAIT for confirmation

Help add authentic elements if needed, but accept their foundation positively.`;
        
        case 'JOURNEY':
          return `CURRENT TASK: Plan the learning journey for the Challenge: "${ideation.challenge || 'Not yet defined'}"

ACCEPTANCE CRITERIA:
- Accept any structured learning plan
- Confirm before progressing to Deliverables

RESPONSE STRATEGY:
1. ACKNOWLEDGE their journey plan ("This provides excellent structure...")
2. CONFIRM their choice ("Ready to define the deliverables and assessment?")
3. WAIT for confirmation

Guide them through phases if needed: Analyze → Brainstorm → Prototype → Evaluate
Use markdown lists and headers to organize the phases clearly.`;
        
        case 'DELIVERABLES':
          return `CURRENT TASK: Define deliverables and assessment for the project

ACCEPTANCE CRITERIA:
- Accept any concrete deliverables
- Confirm before completing

RESPONSE STRATEGY:
1. ACKNOWLEDGE their deliverables ("These will showcase meaningful learning...")
2. CONFIRM completion ("Your project blueprint is complete! Ready to finalize?")
3. WAIT for confirmation

Help them define assessment criteria if needed.
Use markdown tables or lists to present options clearly.`;
        
        default:
          return `CURRENT TASK: Understand the teacher's project context and goals.`;
      }
    };
    
    const stageInstructions = getStageInstructions();
    
    // Build enhanced context string with wizard data
    const subjectText = wizard.subjects?.length > 0 ? wizard.subjects.join(' & ') : projectState.context.subject || 'Not specified';
    const context = `
=== PROJECT CONTEXT ===
Subject Areas: ${subjectText}
Grade Level: ${wizard.gradeLevel || projectState.context.gradeLevel || 'Not specified'}
Project Duration: ${wizard.duration || projectState.context.duration || 'Not specified'}
Project Topic: ${wizard.projectTopic || 'Not specified'}
Learning Goals: ${wizard.learningGoals || 'Not specified'}
Entry Point: ${wizard.entryPoint || 'Standards-based'}
Materials Available: ${wizard.materials || 'Standard classroom resources'}

=== CONVERSATION PROGRESS ===
- Big Idea: ${ideation.bigIdea || 'Not yet defined'}
- Essential Question: ${ideation.essentialQuestion || 'Not yet defined'}
- Challenge: ${ideation.challenge || 'Not yet defined'}

=== CURRENT CONTEXT ===
User is working on: ${projectState.stage.replace('_', ' ')}
Message count in stage: ${projectState.messageCountInStage}
Awaiting confirmation: ${projectState.awaitingConfirmation ? 'Yes - for ' + projectState.awaitingConfirmation.type : 'No'}

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
    // Subtle, professional progress indicator - no emojis
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50';
    notification.innerHTML = `
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="text-sm font-medium">${stageName} saved</p>
        </div>
      </div>
    `;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    document.body.appendChild(notification);
    
    // Fade in
    requestAnimationFrame(() => {
      notification.style.transition = 'all 0.3s ease-out';
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 2.5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  };

  // Helper function to save data to chat service capturedData format
  const saveToBackend = (stageKey: string, value: string, stageLabel: string) => {
    // Save in the format expected by chat-service.ts
    const capturedDataKey = `${projectState.stage.toLowerCase()}.${stageKey}`;
    
    // Call parent component to save to backend
    if (onStageComplete) {
      onStageComplete(stageKey, { 
        [capturedDataKey]: value,
        value: value,
        stage: projectState.stage,
        stageLabel: stageLabel
      });
    }
    
    console.log('[Data Save] Saved to backend:', {
      key: capturedDataKey,
      value: value,
      stageLabel: stageLabel
    });
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
    
    // Note: We now start directly in BIG_IDEA stage after wizard completion
    // No need for GROUNDING -> BIG_IDEA transition
    
    // BIG_IDEA -> ESSENTIAL_QUESTION (simplified progression)
    if (projectState.stage === 'BIG_IDEA') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'bigIdea') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const bigIdea = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] BIG_IDEA -> ESSENTIAL_QUESTION (confirmed)', { bigIdea });
          showStageCompletionCelebration('Big Idea');
          
          // Save to backend FIRST
          saveToBackend('bigIdea', bigIdea, 'Big Idea');
          
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, bigIdea, bigIdeaConfirmed: true },
            stage: 'ESSENTIAL_QUESTION',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine - clear confirmation state
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        } else {
          // User provided new input instead of confirming - treat as refined Big Idea
          const hasSubstance = userInput.trim().length > 5;
          if (hasSubstance) {
            console.log('[Stage Transition] User refined Big Idea, auto-progressing');
            showStageCompletionCelebration('Big Idea');
            
            // Save to backend FIRST
            saveToBackend('bigIdea', userInput, 'Big Idea');
            
            setProjectState(prev => ({
              ...prev,
              ideation: { ...prev.ideation, bigIdea: userInput, bigIdeaConfirmed: true },
              stage: 'ESSENTIAL_QUESTION',
              messageCountInStage: 0,
              awaitingConfirmation: undefined
            }));
            
            return;
          }
        }
      }
      
      // New input - SIMPLIFIED: Accept any substantive input and auto-progress
      const hasSubstance = userInput.trim().length > 3;
      const forceAccept = projectState.messageCountInStage >= 2; // Reduced from 3
      
      if (hasSubstance || forceAccept) {
        // Auto-progress without requiring confirmation
        console.log('[Stage Transition] BIG_IDEA -> ESSENTIAL_QUESTION (auto-progress)', { bigIdea: userInput });
        showStageCompletionCelebration('Big Idea');
        
        // Save to backend FIRST
        saveToBackend('bigIdea', userInput, 'Big Idea');
        
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, bigIdea: userInput, bigIdeaConfirmed: true },
          stage: 'ESSENTIAL_QUESTION',
          messageCountInStage: 0,
          awaitingConfirmation: undefined
        }));
        
        return;
      }
    }
    
    // ESSENTIAL_QUESTION -> CHALLENGE (with confirmation)
    if (projectState.stage === 'ESSENTIAL_QUESTION') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'essentialQuestion') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const essentialQuestion = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] ESSENTIAL_QUESTION -> CHALLENGE (confirmed)', { essentialQuestion });
          showStageCompletionCelebration('Essential Question');
          
          // Save to backend FIRST
          saveToBackend('essentialQuestion', essentialQuestion, 'Essential Question');
          
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, essentialQuestion, essentialQuestionConfirmed: true },
            stage: 'CHALLENGE',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // New input - check if it's a question
      const hasQuestion = input.includes('?') || 
                         (input.includes('how') || input.includes('why') || input.includes('what'));
      const forceAccept = projectState.messageCountInStage >= 3;
      
      if (hasQuestion || forceAccept) {
        // Set up confirmation state
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'essentialQuestion',
            value: userInput
          }
        }));
        return;
      }
    }
    
    // CHALLENGE -> JOURNEY (with confirmation)
    if (projectState.stage === 'CHALLENGE') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'challenge') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const challenge = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] CHALLENGE -> JOURNEY (confirmed)', { challenge });
          showStageCompletionCelebration('Challenge Definition');
          
          // Save to backend FIRST
          saveToBackend('challenge', challenge, 'Challenge Definition');
          
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, challenge, challengeConfirmed: true },
            stage: 'JOURNEY',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // New input - check if it has action
      const hasSubstance = userInput.length > 15;
      const forceAccept = projectState.messageCountInStage >= 3;
      
      if (hasSubstance || forceAccept) {
        // Set up confirmation state
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'challenge',
            value: userInput
          }
        }));
        return;
      }
    }
    
    // JOURNEY -> DELIVERABLES (with confirmation)
    if (projectState.stage === 'JOURNEY') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'journey') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const journeyPlan = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] JOURNEY -> DELIVERABLES (confirmed)', { journeyPlan });
          showStageCompletionCelebration('Learning Journey');
          
          // Save to backend FIRST
          saveToBackend('phases', journeyPlan, 'Learning Journey Phases');
          
          setProjectState(prev => ({
            ...prev,
            stage: 'DELIVERABLES',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // Check for quality content that could be the learning journey plan
      const journeyKeywords = ['research', 'analyze', 'brainstorm', 'prototype', 'create', 'test', 'evaluate', 'phase', 'week', 'timeline'];
      const hasJourneyContent = journeyKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
      
      if (hasJourneyContent && userInput.length > 50) {
        // Save and ask for confirmation
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'journey',
            value: userInput
          }
        }));
        return;
      }
    }
    
    // DELIVERABLES -> COMPLETE (with confirmation)
    if (projectState.stage === 'DELIVERABLES') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'deliverables') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const deliverables = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] DELIVERABLES -> COMPLETE (confirmed)', { deliverables });
          showStageCompletionCelebration('Project Blueprint');
          
          // Save to backend FIRST
          saveToBackend('deliverables', deliverables, 'Deliverables & Assessment');
          
          setProjectState(prev => ({
            ...prev,
            stage: 'COMPLETE',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // Check for quality content that could be deliverables
      const deliverablesKeywords = ['presentation', 'portfolio', 'prototype', 'report', 'assessment', 'rubric', 'showcase', 'exhibition'];
      const hasDeliverablesContent = deliverablesKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
      
      if (hasDeliverablesContent && userInput.length > 50) {
        // Save and ask for confirmation
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'deliverables',
            value: userInput
          }
        }));
        return;
      }
    }
  };
  
  // Handle sending messages with REAL AI
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
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
      content: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = textToSend;
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
        // Generate contextual suggestions using actual wizard data
        const wizard = getWizardData();
        const context = {
          subject: wizard.subjects?.join(', ') || projectState.context.subject || 'your subject area',
          gradeLevel: wizard.gradeLevel || projectState.context.gradeLevel || 'your students',
          projectTopic: wizard.projectTopic || 'your project',
          bigIdea: projectState.ideation.bigIdea,
          essentialQuestion: projectState.ideation.essentialQuestion,
          challenge: projectState.ideation.challenge
        };
        
        // Get contextual suggestions based on actual wizard data
        const stageSuggestions = getStageSuggestions(projectState.stage, undefined, context);
        
        if (stageSuggestions.length > 0) {
          const suggestions = stageSuggestions.slice(0, 3).map(s => 
            typeof s === 'string' ? s : s.text
          );
          
          // Create contextual response based on wizard data
          if (projectState.stage === 'BIG_IDEA') {
            aiResponse = `Here are some Big Idea concepts tailored to your ${context.subject} project with ${context.gradeLevel} students:`;
          } else if (projectState.stage === 'ESSENTIAL_QUESTION') {
            aiResponse = `Based on your Big Idea "${context.bigIdea || 'concept'}", here are Essential Questions for your ${context.subject} students:`;
          } else if (projectState.stage === 'CHALLENGE') {
            aiResponse = `Here are authentic ${context.subject} challenges that connect to your Essential Question and give students real purpose:`;
          } else {
            aiResponse = `Here are some ideas for your ${context.subject} project:`;
          }
          
          // Add suggestions to the message
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
        } else {
          // Fallback to AI response if no contextual suggestions available
          const prompt = generateAIPrompt(userInput);
          aiResponse = await geminiService.current.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 500
          });
        }
      } else {
        // Check if we're in confirmation state
        if (projectState.awaitingConfirmation) {
          // Generate confirmation response based on user input
          const confirmationStrategy = getConfirmationStrategy({
            stage: projectState.stage,
            input: projectState.awaitingConfirmation.value,
            attemptCount: projectState.messageCountInStage,
            isFromSuggestion: false
          });
          
          // If user is confirming or refining, handle in detectStageTransition
          // Otherwise, provide the confirmation prompt
          if (!checkForProgressSignal(userInput) && !checkForRefinementSignal(userInput)) {
            aiResponse = generateConfirmationPrompt(confirmationStrategy, projectState.stage);
          } else {
            // Regular AI response for confirmation/refinement
            const prompt = generateAIPrompt(userInput);
            aiResponse = await geminiService.current.generateResponse(prompt, {
              temperature: 0.7,
              maxTokens: 500
            });
          }
        } else {
          // Regular AI response
          const prompt = generateAIPrompt(userInput);
          aiResponse = await geminiService.current.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 500
          });
        }
      }
      
      // Detect stage transitions (handles confirmation logic)
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
  
  // Handle suggestion click - auto-submit immediately
  const handleSuggestionClick = (suggestion: any) => {
    console.log('[Suggestion Clicked - Auto-submitting]:', suggestion);
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    
    // Set input and immediately submit
    setInput(text);
    setShowSuggestions(false);
    
    // Auto-submit after a brief delay to ensure state updates
    setTimeout(() => {
      handleSend(text); // Pass text directly to ensure it's sent
    }, 50);
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
    
    // Set input and auto-submit
    setInput(processedPrompt);
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSend(processedPrompt);
    }, 50);
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
      stage: 'BIG_IDEA',
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
        stage: 'BIG_IDEA'
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
        status: projectState.stage === 'BIG_IDEA' ? 'completed' : 'completed', // Setup is complete when we reach BIG_IDEA
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
        status: ['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE'].includes(projectState.stage) ? 'in-progress' : 
                ['JOURNEY', 'DELIVERABLES', 'COMPLETE'].includes(projectState.stage) ? 'completed' : 'pending',
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
            stage: 'BIG_IDEA',
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
      {/* Beautiful Pillbox Header - Mobile Responsive */}
      <UniversalHeader title="ALF Coach - Project Design" />
      
      {/* Mobile Progress Menu Button - Floating, positioned to avoid overlap */}
      <div className="lg:hidden fixed top-20 left-4 z-40" style={{ left: 'max(16px, calc(50% - 400px))' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-soft hover:shadow-soft-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Map className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </button>
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Progress Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 max-w-[85vw] h-full bg-white dark:bg-gray-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Progress</h2>
              </div>
              {useProgressSidebar && (
                <ProgressSidebar
                  stages={getProgressStages()}
                  currentStageId={projectState.stage.toLowerCase()}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  onStageClick={(stageId) => {
                    logger.log('Stage clicked:', stageId);
                    setMobileMenuOpen(false);
                  }}
                  className="h-full border-none shadow-none"
                />
              )}
            </motion.div>
          </div>
        )}
        
        {/* Desktop Progress Sidebar */}
        {useProgressSidebar && (
          <div className="hidden lg:block">
            <ProgressSidebar
              stages={getProgressStages()}
              currentStageId={projectState.stage.toLowerCase()}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onStageClick={(stageId) => logger.log('Stage clicked:', stageId)}
              className="h-full"
            />
          </div>
        )}
      
      {/* Main Chat Area - Unified Layout Container */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Mobile-Responsive Step Indicator */}
        {projectState.stage !== 'ONBOARDING' && projectState.stage !== 'COMPLETE' && (
          <div className="absolute top-3 right-3 lg:top-2 lg:right-2 z-10">
            <span className="text-xs px-3 py-1.5 lg:px-2 lg:py-0.5 lg:text-[11px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm font-medium">
              Step {['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'].indexOf(projectState.stage) + 1} of 5
            </span>
          </div>
        )}
        
        {/* Chat Messages - Mobile optimized with desktop alignment */}
        <div className="flex-1 overflow-y-auto px-4 py-4 safe-top pb-32 lg:pb-4">
          <div className="max-w-3xl mx-auto space-y-3 lg:max-w-3xl" style={{ width: '100%', maxWidth: '768px' }}>
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
                    {/* Coach Avatar & Status - Fixed Positioning */}
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      {/* Clean Stage Indicator */}
                      {message.metadata?.stage && (
                        <div className="mt-2 text-center">
                          <div className="w-6 h-0.5 bg-blue-500 dark:bg-blue-400 rounded-full mx-auto"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium">
                            {formatStageLabel(message.metadata.stage)}
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
                              Working on: {formatStageLabel(message.metadata.stage)}
                            </span>
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Building on your {getWizardData().subjects?.join(', ') || 'project'} context
                          </p>
                        </div>
                      )}
                      
                      {/* Main Message */}
                      <div className="p-5">
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
                      
                      <div className="border-2 border-blue-500 dark:border-blue-400 text-gray-900 dark:text-gray-100 px-6 py-4 rounded-2xl rounded-tr-sm bg-transparent">
                        <MessageRenderer content={message.content} role={message.role} />
                      </div>
                      
                      {/* Build Progress Indicator */}
                      <div className="mt-2 text-right">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Added to your project design
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
            
            {/* Progress Context Panel - Clean Modern Design */}
            {messages.length > 2 && (
              <div className="mt-6 mb-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Layers className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Your Project Taking Shape</h3>
                </div>
                
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Big Idea Progress */}
                  <div className={`p-3 rounded-xl border-2 transition-all ${
                    projectState.ideation.bigIdeaConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-500' 
                      : projectState.stage === 'BIG_IDEA' 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.bigIdeaConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
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
                  <div className={`p-3 rounded-xl border-2 transition-all ${
                    projectState.ideation.essentialQuestionConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-500' 
                      : projectState.stage === 'ESSENTIAL_QUESTION' 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.essentialQuestionConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
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
                  <div className={`p-3 rounded-xl border-2 transition-all ${
                    projectState.ideation.challengeConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-500' 
                      : projectState.stage === 'CHALLENGE' 
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-500 ring-1 ring-blue-200 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.challengeConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
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
                
                {/* Clean Progress Connection */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 w-6 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Building your project foundation</span>
                    <div className="h-0.5 w-6 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
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
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700">
                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                {/* Thoughtful Processing Indicator */}
                <div className="flex-1 max-w-2xl">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ALF Coach is thinking...
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="h-1 bg-blue-400 rounded-full w-full opacity-50" />
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
            
            {/* Spacer to ensure last message is visible above input */}
            <div className="h-24" />
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Mobile-Optimized Input Area - Fixed on mobile, aligned on desktop */}
        <div className="fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto safe-bottom bg-gray-50 dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          {/* Gradient fade overlay - taller and more opaque */}
          <div className="absolute inset-x-0 -top-20 h-20 pointer-events-none bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50 dark:from-transparent dark:via-gray-900/80 dark:to-gray-900" />
          
          <div className="max-w-3xl mx-auto relative" style={{ width: '100%', maxWidth: '768px' }}>
            
            {/* Vibrant Suggestion Cards with Icons and Colors */}
            {(showSuggestions || shouldShowAutomaticSuggestions()) && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4"
              >
                {/* Add background to prevent transparency issues */}
                <div className="flex flex-col gap-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-3">
                  {/* Small stage indicator */}
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ideas for {projectState.stage.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  
                  {/* Touch-Optimized suggestion cards */}
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-4 min-h-[48px] bg-white/100 dark:bg-gray-800/100 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-lg active:scale-[0.98] transition-all duration-200 group touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
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
              <div className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-400/70 dark:hover:border-blue-500/70 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-200`}
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
                    className="flex-1 resize-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-base leading-6"
                    style={{ 
                      height: '20px', 
                      minHeight: '20px', 
                      maxHeight: '60px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  />
                  
                  {/* Inline action buttons like ChatGPT */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Ideas button - Touch optimized with circular hover */}
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
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
                      title="Get ideas"
                    >
                      <Lightbulb className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    
                    {/* Send button - Touch optimized with circular shape */}
                    <button
                      onClick={handleSend}
                      disabled={isTyping || !input.trim()}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed active:scale-95 touch-manipulation ${
                        input.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm' 
                          : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Send className="w-5 h-5" />
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