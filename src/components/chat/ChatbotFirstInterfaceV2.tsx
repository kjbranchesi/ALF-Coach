/**
 * ChatbotFirstInterfaceV2.tsx
 * 
 * Chat-first (not chat-only) interface with contextual support
 * Implements proper inline help, ideas, and stage initiators
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ChevronRight, Lightbulb, HelpCircle, Check, Edit2, Clock, Target, Users, Rocket } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    showIdeas?: boolean;
    showHelp?: boolean;
    stageInitiator?: {
      type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline';
      value: string;
    };
  };
}

interface ProjectState {
  stage: 'ONBOARDING' | 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  
  context: {
    subject: string;
    gradeLevel: string;
    duration: string;
    location: string;
    classSize: string;
    perspective: string;
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
    confirmed: boolean;
  };
}

// Progress steps for sidebar
const PROGRESS_STEPS = [
  { id: 'setup', label: 'Setup', icon: '📋' },
  { id: 'ideation', label: 'Ideation', icon: '💡' },
  { id: 'journey', label: 'Journey', icon: '🗺️' },
  { id: 'deliverables', label: 'Deliverables', icon: '🎯' },
  { id: 'export', label: 'Export', icon: '📤' }
];

interface ChatbotFirstInterfaceV2Props {
  projectId?: string;
  projectData?: any;
  onStageComplete?: (stage: string, data: any) => void;
  onNavigate?: (target: string) => void;
}

export const ChatbotFirstInterfaceV2: React.FC<ChatbotFirstInterfaceV2Props> = ({ 
  projectId, 
  projectData, 
  onStageComplete,
  onNavigate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'ONBOARDING',
    context: {
      subject: '',
      gradeLevel: '',
      duration: '',
      location: '',
      classSize: '',
      perspective: ''
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
      },
      confirmed: false
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
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Welcome! I'm your curriculum design partner. Together, we'll create a transformative learning experience using the Active Learning Framework. First, what subject do you teach?",
      timestamp: new Date(),
      metadata: {
        stage: 'ONBOARDING'
      }
    };
    setMessages([initialMessage]);
  }, []);
  
  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Process based on current stage
    setTimeout(() => {
      const response = processUserInput(input, projectState);
      setMessages(prev => [...prev, response.message]);
      if (response.stateUpdate) {
        setProjectState(prev => ({ ...prev, ...response.stateUpdate }));
      }
      setIsTyping(false);
    }, 1000);
  };
  
  // Process user input based on stage
  const processUserInput = (input: string, state: ProjectState) => {
    const timestamp = new Date();
    
    if (state.stage === 'ONBOARDING') {
      if (!state.context.subject) {
        return {
          message: {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: `Perfect! ${input} is a great subject with so many real-world connections. What grade level are your students?`,
            timestamp,
            metadata: { showHelp: true }
          },
          stateUpdate: { context: { ...state.context, subject: input } }
        };
      }
      
      if (!state.context.gradeLevel) {
        return {
          message: {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: `Excellent! ${input} students are at a perfect age for project-based learning. How much time do you have for this project?`,
            timestamp,
            metadata: { showIdeas: true }
          },
          stateUpdate: { 
            context: { ...state.context, gradeLevel: input }
          }
        };
      }
      
      if (!state.context.duration) {
        return {
          message: {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: `${input} gives us great flexibility! Now, what's the big idea or topic you want your students to explore? This will be the core concept that drives their entire learning journey.`,
            timestamp,
            metadata: { 
              showHelp: true,
              showIdeas: true,
              stageInitiator: {
                type: 'big-idea',
                value: ''
              }
            }
          },
          stateUpdate: { 
            context: { ...state.context, duration: input },
            stage: 'IDEATION'
          }
        };
      }
    }
    
    if (state.stage === 'IDEATION') {
      if (!state.ideation.bigIdeaConfirmed) {
        return {
          message: {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: `"${input}" is a compelling focus! Let me help you refine this into a clear Big Idea statement.`,
            timestamp,
            metadata: {
              stageInitiator: {
                type: 'big-idea',
                value: input
              }
            }
          },
          stateUpdate: {
            ideation: { ...state.ideation, bigIdea: input }
          }
        };
      }
      
      if (!state.ideation.essentialQuestionConfirmed) {
        return {
          message: {
            id: Date.now().toString(),
            role: 'assistant' as const,
            content: `Great Essential Question! Now, let's define the authentic challenge your students will tackle.`,
            timestamp,
            metadata: {
              showIdeas: true,
              stageInitiator: {
                type: 'challenge',
                value: ''
              }
            }
          },
          stateUpdate: {
            ideation: { ...state.ideation, essentialQuestion: input, essentialQuestionConfirmed: true }
          }
        };
      }
    }
    
    // Default response
    return {
      message: {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: `I understand. Let's continue building your project...`,
        timestamp
      }
    };
  };
  
  // Handle inline actions
  const handleInlineAction = (action: string, messageId: string) => {
    if (action === 'ideas') {
      const exampleIdeas = [
        "Climate change impacts on local ecosystems",
        "How technology shapes our community",
        "The stories that built our town",
        "Designing solutions for real problems"
      ];
      
      const ideasMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are some ideas to inspire you:\n\n${exampleIdeas.map(idea => `• ${idea}`).join('\n')}\n\nThese work well because they're relevant, open-ended, and connect to real-world issues.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, ideasMessage]);
    }
    
    if (action === 'help') {
      const helpMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `A Big Idea is the core concept or understanding you want students to walk away with. It should be:\n\n• Broad enough to explore deeply\n• Relevant to students' lives\n• Connected to real-world applications\n• Transferable beyond this project\n\nFor example: "Systems thinking helps us understand complex problems"`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, helpMessage]);
    }
  };
  
  // Handle stage initiator confirmation
  const handleStageInitiatorConfirm = (type: string, value: string) => {
    if (type === 'big-idea') {
      setProjectState(prev => ({
        ...prev,
        ideation: { ...prev.ideation, bigIdea: value, bigIdeaConfirmed: true }
      }));
      
      const message: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Perfect! Now let's craft an Essential Question that will drive student inquiry. This should be open-ended and require investigation. What question will challenge students to think deeply about "${value}"?`,
        timestamp: new Date(),
        metadata: {
          showIdeas: true,
          showHelp: true
        }
      };
      
      setMessages(prev => [...prev, message]);
    }
  };
  
  // Get current progress step
  const getCurrentStep = () => {
    if (projectState.stage === 'ONBOARDING') return 'setup';
    if (projectState.stage === 'IDEATION') return 'ideation';
    if (projectState.stage === 'JOURNEY') return 'journey';
    if (projectState.stage === 'DELIVERABLES') return 'deliverables';
    return 'export';
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Slim Progress Sidebar */}
      <motion.div 
        className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
      >
        <div className="p-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
        
        <div className="px-4 space-y-2">
          {PROGRESS_STEPS.map((step, index) => {
            const isCurrent = step.id === getCurrentStep();
            const isComplete = PROGRESS_STEPS.findIndex(s => s.id === getCurrentStep()) > index;
            
            return (
              <div
                key={step.id}
                className={`flex items-center p-2 rounded-lg transition-all ${
                  isCurrent ? 'bg-blue-50 text-blue-600' : 
                  isComplete ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <span className="text-xl mr-3">{step.icon}</span>
                {!sidebarCollapsed && (
                  <span className="font-medium">{step.label}</span>
                )}
                {isComplete && !sidebarCollapsed && (
                  <Check className="w-4 h-4 ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
      
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
                  <div className={`max-w-lg px-4 py-3 rounded-xl ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white shadow-sm border border-gray-200'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
                
                {/* Inline action buttons */}
                {message.metadata?.showIdeas || message.metadata?.showHelp ? (
                  <div className="flex gap-2 mt-2 ml-4">
                    {message.metadata.showIdeas && (
                      <button
                        onClick={() => handleInlineAction('ideas', message.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Get Ideas
                      </button>
                    )}
                    {message.metadata.showHelp && (
                      <button
                        onClick={() => handleInlineAction('help', message.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Learn More
                      </button>
                    )}
                  </div>
                ) : null}
                
                {/* Stage Initiator Card */}
                {message.metadata?.stageInitiator && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 ml-4 max-w-md"
                  >
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {message.metadata.stageInitiator.type === 'big-idea' && 'Big Idea'}
                          {message.metadata.stageInitiator.type === 'essential-question' && 'Essential Question'}
                          {message.metadata.stageInitiator.type === 'challenge' && 'Challenge'}
                          {message.metadata.stageInitiator.type === 'phase-timeline' && 'Phase Timeline'}
                        </span>
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        defaultValue={message.metadata.stageInitiator.value || projectState.ideation.bigIdea}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type or edit here..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleStageInitiatorConfirm(
                              message.metadata!.stageInitiator!.type,
                              (e.target as HTMLInputElement).value
                            );
                          }
                        }}
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            const input = document.querySelector(`input`) as HTMLInputElement;
                            handleStageInitiatorConfirm(
                              message.metadata!.stageInitiator!.type,
                              input.value
                            );
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        >
                          Confirm
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                        >
                          Keep Chatting
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white shadow-sm border border-gray-200 px-4 py-3 rounded-xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotFirstInterfaceV2;