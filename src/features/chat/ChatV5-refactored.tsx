import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
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
  Check,
  MessageCircle
} from 'lucide-react';
import { Progress } from '../../components/ProgressV2';
import { MessageContent } from './MessageContent';
import { IdeaCardsV2 } from './IdeaCardsV2';
import { JourneySummary } from '../../components/JourneySummary';
import { AnimatedButton } from '../../components/RiveInteractions';
import { getConversationStateMachine } from '../../services/conversation-state-machine';
import { QUICK_REPLIES } from '../../lib/chat-flow-config';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    step?: string;
    phase?: string;
    quickReplies?: any[];
    showCards?: boolean;
    cardType?: 'ideas' | 'whatif';
    cardOptions?: any[];
  };
}

interface ChatV5RefactoredProps {
  wizardData: WizardData;
  blueprintId: string;
  onComplete: () => void;
}

// Icon mapping
const iconMap: Record<string, any> = {
  Check,
  Edit,
  Lightbulb,
  RefreshCw,
  HelpCircle,
  MessageCircle,
  ArrowRight
};

export function ChatV5Refactored({ wizardData, blueprintId, onComplete }: ChatV5RefactoredProps) {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationState, setConversationState] = useState<any>(null);
  const [journeyData, setJourneyData] = useState<JourneyDataV3>(() => {
    const saved = localStorage.getItem(`journey-v5-${blueprintId}`);
    return saved ? JSON.parse(saved) : createEmptyJourneyData();
  });

  // Services
  const { sendMessage, isStreaming } = useGeminiStream();
  const stateMachine = useMemo(() => getConversationStateMachine(), []);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (!conversationState && wizardData) {
      const initialState = stateMachine.initialize(wizardData);
      setConversationState(initialState.state);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: "Welcome to ALF Coach! I'll guide you through creating an engaging learning experience using the Active Learning Framework. We'll work together through three stages: Ideation, Journey, and Deliverables.",
        timestamp: new Date(),
        metadata: {}
      };
      
      setMessages([welcomeMessage]);
      
      // Add stage initiator message after a short delay
      setTimeout(() => {
        handleStateMachineResponse(initialState);
      }, 1500);
    }
  }, [wizardData, conversationState, stateMachine]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save journey data
  useEffect(() => {
    if (conversationState?.capturedData) {
      // Update journey data from state machine
      const newJourneyData = { ...journeyData };
      
      // Map captured data to journey data structure
      Object.entries(conversationState.capturedData).forEach(([key, value]) => {
        const [section, field] = key.split('.');
        if (section === 'ideation' && newJourneyData.stageData.ideation) {
          (newJourneyData.stageData.ideation as any)[field] = value;
        }
        // Add other sections as needed
      });
      
      setJourneyData(newJourneyData);
      localStorage.setItem(`journey-v5-${blueprintId}`, JSON.stringify(newJourneyData));
    }
  }, [conversationState?.capturedData, blueprintId]);

  // Handle state machine response
  const handleStateMachineResponse = useCallback((response: any) => {
    setConversationState(response.state);
    
    if (response.message) {
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.message.content,
        timestamp: new Date(),
        metadata: response.message.metadata
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }
    
    if (response.isComplete) {
      setTimeout(() => onComplete(), 2000);
    }
  }, [onComplete]);

  // Handle button clicks
  const handleButtonClick = useCallback(async (action: string) => {
    if (isProcessing || isStreaming) return;
    
    console.log('Button clicked:', action);
    setIsProcessing(true);
    
    try {
      const response = stateMachine.processInput('', action);
      handleStateMachineResponse(response);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, isStreaming, stateMachine, handleStateMachineResponse]);

  // Handle card selection
  const handleCardSelection = useCallback(async (option: any) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message showing selection
      const selectionMessage: Message = {
        id: `selection-${Date.now()}`,
        role: 'user',
        content: option.title,
        timestamp: new Date(),
        metadata: {
          stage: conversationState?.stage,
          step: conversationState?.step
        }
      };
      
      setMessages(prev => [...prev, selectionMessage]);
      
      // Process with state machine
      const response = stateMachine.processInput(option, 'card_select');
      handleStateMachineResponse(response);
      
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, conversationState, stateMachine, handleStateMachineResponse]);

  // Handle text input
  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || isStreaming || isProcessing) return;
    
    setIsProcessing(true);
    const userText = text.trim();
    
    try {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Special commands
      if (userText.toLowerCase() === 'start') {
        const response = stateMachine.processInput('', 'start');
        handleStateMachineResponse(response);
      } else if (userText.toLowerCase() === 'proceed') {
        const response = stateMachine.processInput('', 'proceed');
        handleStateMachineResponse(response);
      } else if (userText.toLowerCase().startsWith('edit ')) {
        const stepId = userText.substring(5);
        const response = stateMachine.processInput(stepId, 'edit');
        handleStateMachineResponse(response);
      } else {
        // Regular text input
        const response = stateMachine.processInput(userText, 'text');
        handleStateMachineResponse(response);
      }
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Get current buttons based on message metadata
  const getCurrentButtons = useCallback(() => {
    if (!messages.length) return [];
    
    const lastMessage = messages[messages.length - 1];
    const quickReplies = lastMessage.metadata?.quickReplies || [];
    
    return quickReplies.map((reply: any) => ({
      id: reply.action,
      label: reply.label,
      action: reply.action,
      icon: reply.icon || iconMap[reply.icon] || 'MessageCircle',
      variant: reply.variant || 'secondary',
      enabled: true
    }));
  }, [messages]);

  // Render button
  const renderButton = (button: any) => {
    const Icon = iconMap[button.icon] || MessageCircle;
    
    return (
      <motion.button
        key={button.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleButtonClick(button.action)}
        disabled={!button.enabled || isProcessing}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
          transition-all duration-200 transform-gpu
          ${button.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          ${button.variant === 'secondary' ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50' : ''}
          ${button.variant === 'tertiary' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
          ${!button.variant ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : ''}
          ${!button.enabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {button.label}
      </motion.button>
    );
  };

  const currentButtons = getCurrentButtons();
  const showTextInput = conversationState?.needsInput || conversationState?.phase === 'stage_init';

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Journey Summary */}
      <JourneySummary 
        journeyData={journeyData}
        currentStage={conversationState?.stage || 'IDEATION'}
      />
      
      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm mt-16">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {conversationState?.stage} • {conversationState?.progress?.currentStep || 1} of {conversationState?.progress?.total || 16}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {conversationState?.progress?.percentage || 0}%
            </div>
          </div>
          <Progress value={conversationState?.progress?.percentage || 0} />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`
                    max-w-3xl px-6 py-4 rounded-2xl
                    ${message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                    }
                  `}>
                    <MessageContent content={message.content || ''} />
                    
                    {/* Show idea cards if present */}
                    {message.metadata?.showCards && message.metadata?.cardOptions && (
                      <div className="mt-4">
                        <IdeaCardsV2
                          options={message.metadata.cardOptions}
                          onSelect={(option) => handleCardSelection(option)}
                          isActive={isLastMessage && !isProcessing}
                          variant={message.metadata.cardType || 'ideas'}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-gray-500"
            >
              <div className="animate-pulse">Thinking...</div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area with Buttons */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto p-6">
          {/* Render current buttons */}
          {currentButtons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {currentButtons.map(renderButton)}
            </div>
          )}
          
          {/* Text input - only show when needed */}
          {showTextInput && (
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
                placeholder={
                  conversationState?.phase === 'stage_init' 
                    ? "Type 'start' to begin..." 
                    : "Share your ideas..."
                }
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         resize-none min-h-[60px] max-h-[200px]"
                disabled={isStreaming || isProcessing}
              />
              <AnimatedButton
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isStreaming || isProcessing}
                className="self-end"
              >
                <Send className="w-5 h-5" />
              </AnimatedButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}