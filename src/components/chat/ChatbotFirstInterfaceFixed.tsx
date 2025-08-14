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
import { ConnectionIndicator } from '../ui/ConnectionIndicator';
import { ConversationalOnboarding } from './ConversationalOnboarding';
import { MessageRenderer } from './MessageRenderer';
import { EnhancedButton } from '../ui/EnhancedButton';
import { UniversalHeader } from '../layout/UniversalHeader';
import { ProjectOnboardingWizard } from '../onboarding/ProjectOnboardingWizard';
import { ContextualHelp } from './ContextualHelp';
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';
import { firebaseSync } from '../../services/FirebaseSync';
import { useFeatureFlag } from '../../utils/featureFlags';
import { logger } from '../../utils/logger';
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
  stage: 'GROUNDING' | 'IDEATION_INTRO' | 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
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
  
  // Feature flags
  const useInlineUI = useFeatureFlag('inlineUIGuidance');
  const useProgressSidebar = useFeatureFlag('progressSidebar');
  const useStageInitiators = useFeatureFlag('stageInitiatorCards');
  
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'GROUNDING',
    conversationStep: 0,
    messageCountInStage: 0,
    context: {
      subject: projectData?.subject || '',
      gradeLevel: projectData?.gradeLevel || '',
      duration: projectData?.duration || '',
      location: projectData?.location || '',
      materials: projectData?.materials || ''
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
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef(new GeminiService());
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize with proper grounding message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: getStageMessage('GROUNDING', 'initial'),
      timestamp: new Date(),
      metadata: {
        stage: 'GROUNDING'
      }
    };
    setMessages([welcomeMessage]);
  }, []);
  
  // Generate contextual AI prompt
  const generateAIPrompt = (userInput: string): string => {
    const context = `
Stage: ${projectState.stage}
Subject: ${projectState.context.subject || 'Not specified'}
Grade: ${projectState.context.gradeLevel || 'Not specified'}
Duration: ${projectState.context.duration || 'Not specified'}

User said: "${userInput}"

Previous context:
- Big Idea: ${projectState.ideation.bigIdea || 'Not defined'}
- Essential Question: ${projectState.ideation.essentialQuestion || 'Not defined'}
- Challenge: ${projectState.ideation.challenge || 'Not defined'}
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
    setProjectState(prev => ({
      ...prev,
      stage: 'WELCOME'
    }));

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Welcome! I'm your curriculum design partner. Together, we'll create a transformative learning experience using the Active Learning Framework. What subject do you teach?",
      timestamp: new Date(),
      metadata: {
        stage: 'WELCOME'
      }
    };
    setMessages([welcomeMessage]);
  }, []);
  
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
      <ProjectOnboardingWizard
        onComplete={(data) => {
          // Update project state with onboarding data
          setProjectState(prev => ({
            ...prev,
            stage: 'GROUNDING',
            context: {
              subject: data.subject,
              gradeLevel: data.gradeLevel,
              duration: data.duration,
              location: data.location,
              materials: data.materials,
              initialIdeas: data.initialIdeas
            }
          }));
          
          // Create initial message with context
          const contextMessage = `Great! I see you're teaching ${data.subject} to ${data.gradeLevel} students for ${data.duration} in a ${data.location} setting.`;
          const ideasMessage = data.initialIdeas.length > 0 
            ? `\n\nYou mentioned these initial ideas: ${data.initialIdeas.join(', ')}.` 
            : '';
          
          setMessages([{
            id: 'onboarding-complete',
            role: 'assistant',
            content: contextMessage + ideasMessage + '\n\n' + getStageMessage('GROUNDING', 'initial'),
            timestamp: new Date()
          }]);
        }}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20">
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
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-transparent to-gray-50/50">
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
                        : 'bg-white shadow-elevation-1 hover:shadow-elevation-2 border border-gray-100 text-gray-900'
                    }`}
                  >
                    <MessageRenderer content={message.content} role={message.role} />
                  </div>
                </motion.div>
                
                {/* Inline UI Guidance - Only show for assistant messages */}
                {useInlineUI && message.role === 'assistant' && (message.metadata?.showIdeas || message.metadata?.showHelp) && (
                  <div className="mt-2 ml-4 flex gap-2">
                    {message.metadata.showIdeas && (
                      <InlineActionButton
                        type="ideas"
                        onClick={() => handleInlineAction('ideas', message.id)}
                      />
                    )}
                    {message.metadata.showHelp && (
                      <InlineActionButton
                        type="help"
                        onClick={() => handleInlineAction('help', message.id)}
                      />
                    )}
                  </div>
                )}
                
                {/* Show improved suggestions when Ideas clicked */}
                {showSuggestionsForMessage === message.id && (
                  <div className="mt-3 ml-4 max-w-2xl">
                    <ImprovedSuggestionCards
                      suggestions={getStageSuggestions(projectState.stage).map(s => ({
                        id: s.id,
                        text: s.text,
                        category: s.category as 'idea' | 'whatif' | 'resource'
                      }))}
                      onSelect={(suggestion) => handleSuggestionSelect(suggestion.text)}
                      onDismiss={() => setShowSuggestionsForMessage(null)}
                    />
                  </div>
                )}
                
                {/* Show help when Help clicked */}
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
                <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="glass-medium border-t border-gray-200/50 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            {/* Connection Status and Help Button */}
            <div className="mb-3 flex items-center justify-between">
              <ConnectionIndicator detailed={true} />
              <button
                onClick={() => setShowContextualHelp(!showContextualHelp)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm text-gray-600"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </button>
            </div>
            
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-primary-300 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
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