/**
 * ChatbotFirstInterfaceImproved.tsx
 * 
 * Enhanced chat-first interface with all new features integrated via feature flags
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { ContextualInitiator } from './ContextualInitiator';
import { ChatbotOnboarding } from './ChatbotOnboarding';
import { ProgressSidebar, Stage } from './ProgressSidebar';
import { UIGuidanceSystemV2, InlineActionButton, InlineSuggestionCards, InlineHelpContent } from './UIGuidanceSystemV2';
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';
import { firebaseSync } from '../../services/FirebaseSync';
import { useFeatureFlag } from '../../utils/featureFlags';
import { logger } from '../../utils/logger';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    showIdeas?: boolean;
    showHelp?: boolean;
    confirmationNeeded?: string;
    stageInitiator?: {
      type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline';
      value: string;
    };
  };
}

interface ProjectState {
  stage: 'WELCOME' | 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  
  ideation: {
    bigIdea: string;
    bigIdeaConfirmed: boolean;
    essentialQuestion: string;
    essentialQuestionConfirmed: boolean;
    challenge: string;
    challengeConfirmed: boolean;
  };
  
  journey: {
    projectDuration: string;
    phaseBreakdown: {
      analyze: { duration: string; activities: string[] };
      brainstorm: { duration: string; activities: string[] };
      prototype: { duration: string; activities: string[] };
      evaluate: { duration: string; activities: string[] };
    };
    iterationStrategy: string;
  };
  
  contextualInitiator: {
    type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline' | null;
    value: any;
  };
}

// Conversation flow templates
const CONVERSATION_FLOWS = {
  WELCOME: {
    opening: "Welcome! I'm your curriculum design partner. Together, we'll create a transformative learning experience that guides your students through a structured creative process. What subject do you teach?",
    followUp: "Excellent! And what grade level are your students?"
  },
  
  IDEATION: {
    bigIdea: {
      prompt: "Let's start with your Big Idea - the core concept you want your students to explore. What topic or theme excites both you and your students?",
      validation: "That's a compelling focus! In your local context, what specific aspect would resonate most with your students?",
      confirmation: "Perfect! Ready to lock in '{value}' as your Big Idea?"
    },
    essentialQuestion: {
      prompt: "Now for your Essential Question - this will drive student inquiry throughout the project. What open-ended question will challenge students to think deeply about {bigIdea}?",
      validation: "Good start! Essential Questions work best when they require investigation and can't be answered with yes/no. Could we rephrase it to begin with 'How might...' or 'Why does...'?",
      confirmation: "Excellent question! Ready to confirm '{value}'?"
    },
    challenge: {
      prompt: "Finally, let's define the authentic challenge your students will tackle. What real-world problem related to {bigIdea} will they solve?",
      validation: "That's authentic! To make it even more real, who specifically will benefit from student solutions? Where might their work be implemented?",
      confirmation: "Outstanding! Ready to lock in this challenge: '{value}'?"
    }
  },
  
  JOURNEY: {
    opening: "Now let's design how YOUR STUDENTS will journey through the Creative Process to tackle this challenge.",
    duration: "How much time do you have for this project? (e.g., '3 weeks', 'one semester', '2 months')",
    phaseIntro: "Perfect! With {duration}, here's how your students could move through the four phases of the Creative Process."
  }
};

interface ChatbotFirstInterfaceImprovedProps {
  projectId?: string;
  projectData?: any;
  onStageComplete?: (stage: string, data: any) => void;
  onNavigate?: (target: string) => void;
}

export const ChatbotFirstInterfaceImproved: React.FC<ChatbotFirstInterfaceImprovedProps> = ({ 
  projectId, 
  projectData, 
  onStageComplete,
  onNavigate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [userContext, setUserContext] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Feature flags
  const useInlineUI = useFeatureFlag('inlineUIGuidance');
  const useProgressSidebar = useFeatureFlag('progressSidebar');
  const useStageInitiators = useFeatureFlag('stageInitiatorCards');
  const useImprovedSuggestions = useFeatureFlag('improvedSuggestionCards');
  const useConversationalOnboarding = useFeatureFlag('conversationalOnboarding');
  
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'WELCOME',
    ideation: {
      bigIdea: '',
      bigIdeaConfirmed: false,
      essentialQuestion: '',
      essentialQuestionConfirmed: false,
      challenge: '',
      challengeConfirmed: false
    },
    journey: {
      projectDuration: '',
      phaseBreakdown: {
        analyze: { duration: '', activities: [] },
        brainstorm: { duration: '', activities: [] },
        prototype: { duration: '', activities: [] },
        evaluate: { duration: '', activities: [] }
      },
      iterationStrategy: ''
    },
    contextualInitiator: {
      type: null,
      value: null
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef(new GeminiService());
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize conversation
  useEffect(() => {
    logger.log('Initializing ChatbotFirstInterfaceImproved with features:', {
      useInlineUI,
      useProgressSidebar,
      useStageInitiators,
      useImprovedSuggestions,
      useConversationalOnboarding
    });
    
    // Check for onboarding data
    const onboardingDataStr = sessionStorage.getItem('onboardingData');
    if (onboardingDataStr) {
      try {
        const onboardingData = JSON.parse(onboardingDataStr);
        setUserContext(onboardingData);
        sessionStorage.removeItem('onboardingData');
        
        // Start with context
        const contextualMessage: Message = {
          id: '1',
          role: 'assistant',
          content: `Great! I see you're planning a ${onboardingData.subject} project for ${onboardingData.ageGroup}. Let's develop this into a complete Active Learning Framework project.`,
          timestamp: new Date(),
          metadata: {
            stage: 'IDEATION',
            showIdeas: useInlineUI,
            showHelp: useInlineUI
          }
        };
        setMessages([contextualMessage]);
        return;
      } catch (e) {
        logger.error('Failed to parse onboarding data:', e);
      }
    }
    
    // Default welcome message
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: CONVERSATION_FLOWS.WELCOME.opening,
      timestamp: new Date(),
      metadata: {
        stage: 'WELCOME',
        showHelp: useInlineUI
      }
    };
    setMessages([welcomeMessage]);
  }, [useInlineUI, useConversationalOnboarding]);
  
  // Generate progress stages
  const getProgressStages = useCallback((): Stage[] => {
    const stages: Stage[] = [
      {
        id: 'setup',
        label: 'Setup',
        icon: '📋',
        status: projectState.stage === 'WELCOME' ? 'in-progress' : 'completed',
        substeps: [
          { id: 'subject', label: 'Subject Area', completed: !!userContext?.subject },
          { id: 'grade', label: 'Grade Level', completed: !!userContext?.ageGroup },
          { id: 'duration', label: 'Project Duration', completed: !!projectState.journey.projectDuration }
        ]
      },
      {
        id: 'ideation',
        label: 'Ideation',
        icon: '💡',
        status: projectState.stage === 'IDEATION' ? 'in-progress' : 
                projectState.stage === 'WELCOME' ? 'pending' : 'completed',
        substeps: [
          { id: 'bigIdea', label: 'Big Idea', completed: projectState.ideation.bigIdeaConfirmed },
          { id: 'essential', label: 'Essential Question', completed: projectState.ideation.essentialQuestionConfirmed },
          { id: 'challenge', label: 'Challenge', completed: projectState.ideation.challengeConfirmed }
        ]
      },
      {
        id: 'journey',
        label: 'Learning Journey',
        icon: '🗺️',
        status: projectState.stage === 'JOURNEY' ? 'in-progress' : 
                ['WELCOME', 'IDEATION'].includes(projectState.stage) ? 'pending' : 'completed',
        substeps: [
          { id: 'analyze', label: 'Analyze Phase', completed: projectState.journey.phaseBreakdown.analyze.activities.length > 0 },
          { id: 'brainstorm', label: 'Brainstorm Phase', completed: projectState.journey.phaseBreakdown.brainstorm.activities.length > 0 },
          { id: 'prototype', label: 'Prototype Phase', completed: projectState.journey.phaseBreakdown.prototype.activities.length > 0 },
          { id: 'evaluate', label: 'Evaluate Phase', completed: projectState.journey.phaseBreakdown.evaluate.activities.length > 0 }
        ]
      },
      {
        id: 'deliverables',
        label: 'Deliverables',
        icon: '🎯',
        status: projectState.stage === 'DELIVERABLES' ? 'in-progress' : 
                projectState.stage === 'COMPLETE' ? 'completed' : 'pending'
      },
      {
        id: 'export',
        label: 'Export',
        icon: '📤',
        status: projectState.stage === 'COMPLETE' ? 'completed' : 'pending'
      }
    ];
    
    return stages;
  }, [projectState, userContext]);
  
  // Handle user input
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
    setInput('');
    setIsTyping(true);
    
    // Process message and generate response
    // This is simplified - in real implementation, connect to AI service
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand. Let me help you with that...',
        timestamp: new Date(),
        metadata: {
          showIdeas: useInlineUI && Math.random() > 0.5,
          showHelp: useInlineUI && Math.random() > 0.7
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Handle inline actions
  const handleInlineAction = (action: 'ideas' | 'help', messageId: string) => {
    logger.log('Inline action triggered:', action, messageId);
    
    if (action === 'ideas') {
      const ideasMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Here are some ideas to inspire you:\n\n• Climate change impacts on local ecosystems\n• How technology shapes our community\n• The stories that built our town',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, ideasMessage]);
    }
    
    if (action === 'help') {
      const helpMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Let me explain: A Big Idea is the core concept that drives your entire project. It should be broad enough to explore deeply, relevant to students\' lives, and connected to real-world applications.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, helpMessage]);
    }
  };
  
  // Handle stage initiator confirmation
  const handleInitiatorConfirm = (value: any) => {
    logger.log('Stage initiator confirmed:', projectState.contextualInitiator.type, value);
    
    // Update project state based on initiator type
    if (projectState.contextualInitiator.type === 'big-idea') {
      setProjectState(prev => ({
        ...prev,
        ideation: { ...prev.ideation, bigIdea: value, bigIdeaConfirmed: true },
        contextualInitiator: { type: null, value: null }
      }));
    }
    // Add other types...
  };
  
  const handleInitiatorDismiss = () => {
    setProjectState(prev => ({
      ...prev,
      contextualInitiator: { type: null, value: null }
    }));
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
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
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
                
                {/* Inline UI Guidance */}
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
                
                {/* Stage Initiator Card */}
                {useStageInitiators && message.metadata?.stageInitiator && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 ml-4"
                  >
                    <ContextualInitiator
                      type={message.metadata.stageInitiator.type}
                      value={message.metadata.stageInitiator.value}
                      onConfirm={handleInitiatorConfirm}
                      onDismiss={handleInitiatorDismiss}
                    />
                  </motion.div>
                )}
              </div>
            ))}
            
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
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotFirstInterfaceImproved;