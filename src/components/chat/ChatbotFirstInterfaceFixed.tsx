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
import { InlineActionButton, InlineHelpContent } from './UIGuidanceSystemV2';
import { ImprovedSuggestionCards } from './ImprovedSuggestionCards';
import { StageInitiatorCards } from './StageInitiatorCards';
import { ConversationalOnboarding } from './ConversationalOnboarding';
import { SmartSuggestionButton } from './SmartSuggestionButton';
import { StageSpecificSuggestions } from './StageSpecificSuggestions';
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
  const [showHelp, setShowHelp] = useState(false);
  
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
Ask: "What fundamental understanding do you want students to gain from this project?"
Guide them to think beyond facts to deeper, transferable concepts.`;
        
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
Guide them through: Analyze → Brainstorm → Prototype → Evaluate`;
        
        case 'DELIVERABLES':
          return `CURRENT TASK: Define what students will create and how it will be assessed.
Ask: "What will students create to demonstrate their learning? How will you assess it?"
Help them define concrete deliverables and assessment criteria.`;
        
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
  
  // Detect what stage/step we should be in based on conversation
  const detectStageTransition = (userInput: string, aiResponse: string) => {
    const input = userInput.toLowerCase();
    
    // Track message count in current stage
    setProjectState(prev => ({
      ...prev,
      messageCountInStage: prev.messageCountInStage + 1
    }));
    
    // Simple stage progression for MVP
    // Check for keywords that indicate the user has provided what we need
    
    // GROUNDING -> BIG_IDEA (if we have basic context)
    if (projectState.stage === 'GROUNDING' && projectState.messageCountInStage >= 1) {
      // Move to Big Idea stage after initial context
      setProjectState(prev => ({
        ...prev,
        stage: 'BIG_IDEA',
        messageCountInStage: 0
      }));
      return;
    }
    
    // BIG_IDEA -> ESSENTIAL_QUESTION (when user provides a big idea)
    if (projectState.stage === 'BIG_IDEA' && userInput.length > 10) {
      // Check if response seems like a big idea (not a question)
      if (!input.includes('?') && !input.includes('help') && !input.includes('example')) {
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, bigIdea: userInput, bigIdeaConfirmed: true },
          stage: 'ESSENTIAL_QUESTION',
          messageCountInStage: 0
        }));
        return;
      }
    }
    
    // ESSENTIAL_QUESTION -> CHALLENGE (when user provides a question)
    if (projectState.stage === 'ESSENTIAL_QUESTION' && userInput.length > 10) {
      // Check if response includes a question or is substantive
      if (input.includes('?') || userInput.split(' ').length > 5) {
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, essentialQuestion: userInput, essentialQuestionConfirmed: true },
          stage: 'CHALLENGE',
          messageCountInStage: 0
        }));
        return;
      }
    }
    
    // CHALLENGE -> JOURNEY (when user provides a challenge)
    if (projectState.stage === 'CHALLENGE' && userInput.length > 10) {
      if (!input.includes('help') && !input.includes('example')) {
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, challenge: userInput, challengeConfirmed: true },
          stage: 'JOURNEY',
          messageCountInStage: 0
        }));
        return;
      }
    }
    
    // JOURNEY -> DELIVERABLES (after planning phases)
    if (projectState.stage === 'JOURNEY' && projectState.messageCountInStage >= 2) {
      setProjectState(prev => ({
        ...prev,
        stage: 'DELIVERABLES',
        messageCountInStage: 0
      }));
      return;
    }
    
    // DELIVERABLES -> COMPLETE
    if (projectState.stage === 'DELIVERABLES' && projectState.messageCountInStage >= 2) {
      setProjectState(prev => ({
        ...prev,
        stage: 'COMPLETE',
        messageCountInStage: 0
      }));
      return;
    }
  };
  
  // Handle sending messages with REAL AI
  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLastInteractionTime(Date.now());
    
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
    
    try {
      // Generate AI response using GeminiService
      const prompt = generateAIPrompt(userInput);
      const aiResponse = await geminiService.current.generateResponse(prompt, {
        temperature: 0.7,
        maxTokens: 500
      });
      
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
      // Get contextual suggestions
      const suggestions = getStageSuggestions(projectState.stage);
      setShowSuggestionsForMessage(messageId);
    }
    
    if (action === 'help') {
      // Show contextual help inline
      setShowHelpForMessage(messageId);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    // Add the suggestion to the input
    setInput(suggestion);
    setShowSuggestionsForMessage(null);
    // Focus the input
    const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
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
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-transparent to-gray-50/50 dark:from-transparent dark:to-gray-900/50">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl transition-all duration-200 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-elevation-2 shadow-primary/20'
                        : 'bg-white dark:bg-gray-800 shadow-elevation-1 hover:shadow-elevation-2 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <MessageRenderer content={message.content} role={message.role} />
                  </div>
                </motion.div>
                
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
            
            {/* Stage Initiator Cards - Show only when appropriate for the stage */}
            {useStageInitiators && !isTyping && !input.trim() && 
             shouldShowCards(projectState.stage, projectState.messageCountInStage) && (
              <div className="mt-8 mb-6">
                <StageInitiatorCards
                  currentStage={projectState.stage}
                  onCardClick={handleStageInitiatorClick}
                />
              </div>
            )}
            
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            
            {/* Stage-specific suggestions panel - cleaner positioning */}
            {showSuggestions && (
              <div className="mb-4">
                <StageSpecificSuggestions
                  stage={projectState.stage}
                  context={{
                    subject: projectState.context.subject,
                    gradeLevel: projectState.context.gradeLevel,
                    bigIdea: projectState.ideation.bigIdea,
                    essentialQuestion: projectState.ideation.essentialQuestion,
                    challenge: projectState.ideation.challenge
                  }}
                  onSelectSuggestion={(suggestion) => {
                    setInput(suggestion);
                    setShowSuggestions(false);
                    // Focus the textarea
                    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                    if (textarea) {
                      textarea.focus();
                      // Auto-resize after setting value
                      textarea.style.height = 'auto';
                      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                    }
                  }}
                  isVisible={true}
                />
              </div>
            )}
            
            {/* Help panel - more subtle design */}
            {showHelp && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {getStageHelp(projectState.stage).title}
                  </h3>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                  {getStageHelp(projectState.stage).content}
                </p>
                <div className="space-y-2">
                  {getStageHelp(projectState.stage).tips.map((tip, i) => (
                    <div key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="relative">
              <div className="flex items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-200 dark:border-gray-700">
                {/* Multi-line textarea that expands */}
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    // Auto-resize textarea
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; // Max ~5 lines
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Message ALF Coach..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent border-0 outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[24px] max-h-[120px] py-0"
                  style={{ lineHeight: '24px' }}
                />
                
                {/* Action buttons inside input area */}
                <div className="flex items-center gap-2 pb-0.5">
                  {/* Ideas button */}
                  <button
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    disabled={isTyping}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    title="Get ideas"
                  >
                    <Lightbulb className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {/* Help button */}
                  <button
                    onClick={() => setShowHelp(!showHelp)}
                    disabled={isTyping}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    title="Get help"
                  >
                    <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {/* Send button - only show when there's input */}
                  {input.trim() ? (
                    <button
                      onClick={handleSend}
                      disabled={isTyping || !input.trim()}
                      className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="p-2 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
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