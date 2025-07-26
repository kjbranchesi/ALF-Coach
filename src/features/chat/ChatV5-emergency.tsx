import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSMv2 } from '../../context/FSMContextV2';
import { 
  JourneyDataV3, 
  createEmptyJourneyData 
} from '../../lib/journey-data-v3';
import { 
  Send,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Edit,
  Lightbulb,
  Layers,
  Rocket,
  Info,
  Check,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Progress } from '../../components/ProgressV2';
import { MessageContent } from './MessageContent';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    eventType?: string;
  };
}

interface ChatV5EmergencyProps {
  wizardData: WizardData;
  blueprintId: string;
  onComplete: () => void;
}

// Basic button configuration
const EMERGENCY_BUTTONS = {
  start: {
    id: 'start-journey',
    label: "Let's Begin",
    icon: Rocket,
    variant: 'primary'
  },
  tellMore: {
    id: 'tell-more',
    label: 'Tell Me More',
    icon: Info,
    variant: 'secondary'
  },
  continue: {
    id: 'continue',
    label: 'Continue',
    icon: ArrowRight,
    variant: 'primary'
  },
  help: {
    id: 'help',
    label: 'Get Help',
    icon: HelpCircle,
    variant: 'secondary'
  }
};

export function ChatV5Emergency({ wizardData, blueprintId, onComplete }: ChatV5EmergencyProps) {
  console.log('🚨 EMERGENCY CHAT LOADED - Basic functionality only');
  
  // Run diagnostics in development
  if (process.env.NODE_ENV === 'development') {
    import('./diagnostic').then(({ runDiagnostics }) => runDiagnostics());
  }
  
  // Journey data
  const [journeyData, setJourneyData] = useState<JourneyDataV3>(() => {
    const saved = localStorage.getItem(`journey-v5-${blueprintId}`);
    return saved ? JSON.parse(saved) : createEmptyJourneyData();
  });
  
  // UI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentButtons, setCurrentButtons] = useState([EMERGENCY_BUTTONS.start, EMERGENCY_BUTTONS.tellMore]);
  
  // FSM context
  const { 
    currentState, 
    advance, 
    getCurrentStage
  } = useFSMv2();
  
  // Services
  const { sendMessage, isStreaming } = useGeminiStream();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && wizardData && blueprintId) {
      console.log('🚨 Initializing emergency chat...');
      const welcomeMessage: Message = {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Welcome! I'm Gemini, your learning design assistant. Let's begin creating an amazing ${wizardData.subject || 'learning'} experience for your ${wizardData.ageGroup || 'students'}.

What would you like to explore first?`,
        timestamp: new Date(),
        metadata: { stage: currentState }
      };
      
      setMessages([welcomeMessage]);
    }
  }, [wizardData, blueprintId, currentState]);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Save journey data
  useEffect(() => {
    localStorage.setItem(`journey-v5-${blueprintId}`, JSON.stringify(journeyData));
  }, [journeyData, blueprintId]);
  
  // Handle button clicks
  const handleButtonClick = useCallback(async (buttonId: string) => {
    console.log('🚨 Emergency button click:', buttonId);
    
    if (isProcessing || isStreaming) return;
    
    try {
      setIsProcessing(true);
      
      // Create user message
      let userContent = '';
      switch (buttonId) {
        case 'start-journey':
          userContent = "Let's begin designing my learning experience!";
          break;
        case 'tell-more':
          userContent = "Tell me more about this stage.";
          break;
        case 'continue':
          userContent = "Continue to the next step.";
          break;
        case 'help':
          userContent = "I need help understanding this.";
          break;
        default:
          userContent = "Continue";
      }
      
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Update buttons to show loading state
      setCurrentButtons([
        { id: 'continue', label: 'Continue', icon: ArrowRight, variant: 'primary' },
        { id: 'help', label: 'Get Help', icon: HelpCircle, variant: 'secondary' }
      ]);
      
      // Send to Gemini
      const response = await sendMessage([
        ...messages,
        userMessage
      ], {
        subject: wizardData.subject,
        ageGroup: wizardData.ageGroup,
        currentStage: currentState
      });
      
      if (response) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          metadata: { stage: currentState }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (error) {
      console.error('🚨 Emergency chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or refresh the page if the problem persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isStreaming, messages, sendMessage, wizardData, currentState]);
  
  // Handle text input
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing || isStreaming) return;
    
    console.log('🚨 Emergency text message:', input);
    
    try {
      setIsProcessing(true);
      
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: input,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Send to Gemini
      const response = await sendMessage([
        ...messages,
        userMessage
      ], {
        subject: wizardData.subject,
        ageGroup: wizardData.ageGroup,
        currentStage: currentState
      });
      
      if (response) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          metadata: { stage: currentState }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
      
    } catch (error) {
      console.error('🚨 Emergency chat error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, isStreaming, messages, sendMessage, wizardData, currentState]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Emergency Mode - {wizardData.subject || 'Learning Design'}
              </h1>
              <p className="text-slate-600 mt-1">Basic chat functionality only</p>
            </div>
            <div className="text-sm text-slate-500">
              Stage: {currentState}
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6 h-[500px] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-slate-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            {(isProcessing || isStreaming) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Quick Reply Buttons */}
        {currentButtons.length > 0 && (
          <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
            <div className="flex flex-wrap gap-3">
              {currentButtons.map((button) => {
                const Icon = button.icon;
                return (
                  <button
                    key={button.id}
                    onClick={() => handleButtonClick(button.id)}
                    disabled={isProcessing || isStreaming}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                      ${button.variant === 'primary' 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-100'
                      }
                      ${(isProcessing || isStreaming) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {button.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Input */}
        <div className="bg-white rounded-xl shadow-soft p-4">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              disabled={isProcessing || isStreaming}
              className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isProcessing || isStreaming}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}