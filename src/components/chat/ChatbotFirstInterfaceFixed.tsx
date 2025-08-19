/**
 * ChatbotFirstInterfaceFixed.tsx
 * 
 * ACTUALLY WORKING chat interface with real AI integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, Lightbulb, Map, Target, Download, HelpCircle } from 'lucide-react';
import { ContextualInitiator } from './ContextualInitiator';
import { ProgressSidebar, Stage } from './ProgressSidebar';
import { InlineActionButton, InlineHelpContent } from './UIGuidanceSystemV2';
import { ImprovedSuggestionCards } from './ImprovedSuggestionCards';
import { StageInitiatorCards } from './StageInitiatorCards';
import { ConversationalOnboarding } from './ConversationalOnboarding';
import { SmartSuggestionButton } from './SmartSuggestionButton';
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

Your role is to:
1. Guide teachers through designing projects where STUDENTS journey through the Creative Process
2. Be conversational but professional
3. Ask one question at a time
4. Provide specific, actionable suggestions
5. Remember: Teachers DESIGN the curriculum, Students DO the creative process

Current conversation stage:
- WELCOME: Gather subject, grade level, duration
- IDEATION: Help define Big Idea, Essential Question, and Challenge
- JOURNEY: Design how students move through Analyze, Brainstorm, Prototype, Evaluate
- DELIVERABLES: Define assessment and milestones

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
    const ideation = projectData?.ideation;
    
    // Use WizardHandoffService system prompt if we have wizard data
    if (wizard.projectTopic || wizard.subjects?.length > 0) {
      const handoff = WizardHandoffService.generateHandoff(wizard);
      
      const context = `
${handoff.systemPrompt}

=== USER INPUT ===
"${userInput}"

=== CONVERSATION PROGRESS ===
- Big Idea: ${ideation?.bigIdea || projectState.ideation.bigIdea || 'Not defined'}
- Essential Question: ${ideation?.essentialQuestion || projectState.ideation.essentialQuestion || 'Not defined'}
- Challenge: ${ideation?.challenge || projectState.ideation.challenge || 'Not defined'}
`;
      return SYSTEM_PROMPT.replace('{stage}', projectState.stage).replace('{context}', context);
    }
    
    // Fallback to basic context for non-wizard flows
    const context = `
=== PROJECT CONTEXT ===
Stage: ${projectState.stage}
Subject Areas: ${projectState.context.subject || 'Not specified'}
Grade Level: ${projectState.context.gradeLevel || 'Not specified'}
Duration: ${projectState.context.duration || 'Not specified'}

=== USER INPUT ===
"${userInput}"
`;
    
    return SYSTEM_PROMPT.replace('{stage}', projectState.stage).replace('{context}', context);
  };
  
  // Detect what stage/step we should be in based on conversation
  const detectStageTransition = (userInput: string, aiResponse: string) => {
    const input = userInput.toLowerCase();
    
    // Track message count in current stage
    setProjectState(prev => ({
      ...prev,
      messageCountInStage: prev.messageCountInStage + 1
    }));
    
    // Update context during GROUNDING stage
    if (projectState.stage === 'GROUNDING') {
      if (!projectState.context.subject && input.length > 2) {
        setProjectState(prev => ({
          ...prev,
          context: { ...prev.context, subject: userInput },
          conversationStep: 1
        }));
      } else if (projectState.context.subject && !projectState.context.gradeLevel && input.length > 2) {
        setProjectState(prev => ({
          ...prev,
          context: { ...prev.context, gradeLevel: userInput },
          conversationStep: 2
        }));
      } else if (projectState.context.gradeLevel && !projectState.context.duration && input.length > 2) {
        setProjectState(prev => ({
          ...prev,
          context: { ...prev.context, duration: userInput },
          stage: 'IDEATION_INTRO',
          messageCountInStage: 0,
          conversationStep: 0
        }));
      }
    }
    
    // Progress through ideation stages
    if (projectState.stage === 'IDEATION_INTRO' && projectState.messageCountInStage >= 2) {
      setProjectState(prev => ({
        ...prev,
        stage: 'BIG_IDEA',
        messageCountInStage: 0
      }));
    } else if (projectState.stage === 'BIG_IDEA' && projectState.ideation.bigIdeaConfirmed) {
      setProjectState(prev => ({
        ...prev,
        stage: 'ESSENTIAL_QUESTION',
        messageCountInStage: 0
      }));
    } else if (projectState.stage === 'ESSENTIAL_QUESTION' && projectState.ideation.essentialQuestionConfirmed) {
      setProjectState(prev => ({
        ...prev,
        stage: 'CHALLENGE',
        messageCountInStage: 0
      }));
    } else if (projectState.stage === 'CHALLENGE' && projectState.ideation.challengeConfirmed) {
      setProjectState(prev => ({
        ...prev,
        stage: 'JOURNEY',
        messageCountInStage: 0
      }));
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
                
                {/* Smart Suggestion Button - Single intelligent button */}
                {useInlineUI && message.role === 'assistant' && !isTyping && (
                  <div className="mt-3 ml-4">
                    <SmartSuggestionButton
                      stage={projectState.stage}
                      messageContent={message.content}
                      onSuggestionSelect={handleSuggestionSelect}
                      disabled={isTyping}
                    />
                  </div>
                )}
                
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
            {/* Help Button Only - Connection status moved to console */}
            <div className="mb-3 flex items-center justify-end">
              <button
                onClick={() => setShowContextualHelp(!showContextualHelp)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                title="Get contextual help for your current stage"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Contextual Help</span>
                <span className="sm:hidden">Help</span>
              </button>
            </div>
            
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm hover:shadow-md"
              />
              <EnhancedButton
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                variant="filled"
                size="md"
                leftIcon={<Send className="w-5 h-5" />}
              >
                Send
              </EnhancedButton>
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