/**
 * ChatbotFirstInterface.tsx
 * 
 * Primary conversational interface for ALF Coach
 * Mental Model: Teachers DESIGN curriculum, Students JOURNEY through Creative Process
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ChevronRight } from 'lucide-react';
import { ContextualInitiator } from './ContextualInitiator';
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    confirmationNeeded?: string;
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

// Conversation starters for each stage
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
    opening: "Now let's design how YOUR STUDENTS will journey through the Creative Process to tackle this challenge. Remember, you're designing the learning experience FOR them, not participating in it yourself.",
    duration: "How much time do you have for this project? (e.g., '3 weeks', 'one semester', '2 months')",
    phaseIntro: "Perfect! With {duration}, here's how your students could move through the four phases of the Creative Process. Each phase builds on the previous, with room for iteration.",
    phaseDetails: {
      analyze: "In the ANALYZE phase, your students will investigate {essentialQuestion}. What key understandings should they gain?",
      brainstorm: "During BRAINSTORM, students will generate solutions. What creative thinking methods will you introduce?",
      prototype: "In PROTOTYPE, students build and test solutions. What will they create to demonstrate learning?",
      evaluate: "Finally, in EVALUATE, students refine and present. Who will be their authentic audience?"
    }
  },
  
  DELIVERABLES: {
    opening: "Let's define what students will create to demonstrate their learning. These deliverables become both assessment evidence and learning artifacts.",
    rubric: "I'll help you design assessment criteria that values both product quality AND the learning process. What's most important to assess?"
  }
};

export const ChatbotFirstInterface: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
  
  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: CONVERSATION_FLOWS.WELCOME.opening,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);
  
  // Handle user input
  const handleSend = useCallback(async () => {
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
    
    // Process the message and generate response
    const response = await processUserInput(userMessage.content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: response.metadata
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
    
    // Check if we need to show a contextual initiator
    if (response.showInitiator) {
      setProjectState(prev => ({
        ...prev,
        contextualInitiator: {
          type: response.initiatorType,
          value: response.initiatorValue
        }
      }));
    }
  }, [input]);
  
  // Process user input based on current stage
  const processUserInput = async (content: string) => {
    const currentStage = projectState.stage;
    
    // This is where we'd integrate with the AI service for sophisticated processing
    // For now, implementing stage-based logic
    
    switch (currentStage) {
      case 'WELCOME':
        // User provided subject
        return {
          content: "Excellent choice! And what grade level are your students?",
          metadata: { stage: 'WELCOME' }
        };
        
      case 'IDEATION':
        // Handle Big Idea, Essential Question, Challenge
        if (!projectState.ideation.bigIdeaConfirmed) {
          // Process Big Idea
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, bigIdea: content }
          }));
          
          return {
            content: CONVERSATION_FLOWS.IDEATION.bigIdea.validation,
            metadata: { stage: 'IDEATION', confirmationNeeded: 'bigIdea' },
            showInitiator: true,
            initiatorType: 'big-idea' as const,
            initiatorValue: content
          };
        }
        // ... handle other ideation elements
        break;
        
      case 'JOURNEY':
        // Handle journey planning
        return {
          content: "Let's plan that phase in detail...",
          metadata: { stage: 'JOURNEY' }
        };
        
      default:
        return {
          content: "Let's continue designing your curriculum...",
          metadata: {}
        };
    }
    
    return {
      content: "I'm processing that...",
      metadata: {}
    };
  };
  
  // Handle contextual initiator confirmation
  const handleInitiatorConfirm = (value: any) => {
    const initiatorType = projectState.contextualInitiator.type;
    
    switch (initiatorType) {
      case 'big-idea':
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, bigIdea: value, bigIdeaConfirmed: true },
          contextualInitiator: { type: null, value: null }
        }));
        
        // Move to Essential Question
        const questionPrompt: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: CONVERSATION_FLOWS.IDEATION.essentialQuestion.prompt.replace('{bigIdea}', value),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, questionPrompt]);
        break;
        
      // Handle other initiator types...
    }
  };
  
  // Handle contextual initiator dismissal
  const handleInitiatorDismiss = () => {
    setProjectState(prev => ({
      ...prev,
      contextualInitiator: { type: null, value: null }
    }));
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900">
            ALF Coach - Curriculum Design Partner
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Designing learning experiences FOR your students
          </p>
        </div>
      </div>
      
      {/* Chat Area - Full Width, Primary Focus */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
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
            ))}
            
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
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
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
      
      {/* Contextual Initiator */}
      {projectState.contextualInitiator.type && (
        <ContextualInitiator
          type={projectState.contextualInitiator.type}
          value={projectState.contextualInitiator.value}
          onConfirm={handleInitiatorConfirm}
          onDismiss={handleInitiatorDismiss}
        />
      )}
    </div>
  );
};