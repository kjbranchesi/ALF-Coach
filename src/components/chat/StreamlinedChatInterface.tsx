/**
 * StreamlinedChatInterface.tsx
 *
 * Clean, focused chat interface with proper UX patterns
 * Replaces the overcomplicated ChatbotFirstInterfaceFixed component
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronLeft, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { ConversationFlowEngine, ConversationState, ProjectContext } from './ConversationFlowEngine';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  error?: boolean;
}

interface StreamlinedChatInterfaceProps {
  projectId?: string;
  initialContext?: ProjectContext;
  onStageComplete?: (stage: string, data: any) => void;
  onProjectComplete?: (projectData: any) => void;
}

export const StreamlinedChatInterface: React.FC<StreamlinedChatInterfaceProps> = ({
  projectId,
  initialContext = {},
  onStageComplete,
  onProjectComplete
}) => {
  // Core state
  const [flowEngine] = useState(() => new ConversationFlowEngine(initialContext));
  const [conversationState, setConversationState] = useState<ConversationState>(flowEngine.getState());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // UI state
  const [showHelp, setShowHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to conversation state changes
  useEffect(() => {
    const unsubscribe = flowEngine.subscribe((newState) => {
      setConversationState(newState);
    });
    return unsubscribe;
  }, [flowEngine]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: flowEngine.getStagePrompt(conversationState.currentStage),
      timestamp: new Date(),
      suggestions: [
        'Science project for grade 7',
        'Math exploration for elementary',
        'Social studies investigation'
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  /**
   * Handle user input with validation
   */
  const handleSendMessage = useCallback(async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || isProcessing) return;

    setIsProcessing(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Process through conversation engine
    const result = flowEngine.processInput(messageText);

    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.message,
      timestamp: new Date(),
      suggestions: result.suggestions,
      error: !result.success
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Handle stage completion
    if (result.stageComplete) {
      onStageComplete?.(conversationState.currentStage, conversationState.projectData);
    }

    // Check if project is complete
    if (conversationState.currentStage === 'LEARNING_JOURNEY' &&
        conversationState.completedStages.includes('LEARNING_JOURNEY')) {
      onProjectComplete?.(conversationState.projectData);
    }

    setIsProcessing(false);
  }, [input, isProcessing, flowEngine, conversationState, onStageComplete, onProjectComplete]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  /**
   * Navigate between stages
   */
  const navigateToStage = useCallback((direction: 'prev' | 'next') => {
    // Implementation for stage navigation
    // This would be called when users click navigation buttons
  }, []);

  /**
   * Get current stage progress
   */
  const getProgressPercentage = (): number => {
    const totalStages = 4;
    const completedCount = conversationState.completedStages.length;
    return (completedCount / totalStages) * 100;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Progress */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Project Design Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {conversationState.completedStages.length} of 4 steps
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Stage Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                {conversationState.currentStage.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Toggle help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
          >
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <h3 className="font-medium mb-2">Current Stage: {conversationState.currentStage.replace('_', ' ')}</h3>
                <p>{getStageHelpText(conversationState.currentStage)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onSuggestionClick={handleSuggestionClick}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={getInputPlaceholder(conversationState.currentStage)}
                className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         placeholder-gray-500 dark:placeholder-gray-400 resize-none
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isProcessing}
              />
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isProcessing}
              className={`p-3 rounded-lg transition-all duration-200 ${
                input.trim() && !isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual message component
 */
const MessageCard: React.FC<{
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
}> = ({ message, onSuggestionClick }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-3xl ${isAssistant ? 'mr-12' : 'ml-12'}`}>
        <div
          className={`p-4 rounded-lg ${
            isAssistant
              ? message.error
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
              : 'bg-blue-600 text-white'
          }`}
        >
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Error state indicator */}
          {message.error && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              Please try rephrasing your response.
            </div>
          )}
        </div>

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700
                         text-gray-700 dark:text-gray-300 rounded-full
                         hover:bg-gray-200 dark:hover:bg-gray-600
                         transition-colors duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper functions
 */
function getStageHelpText(stage: string): string {
  switch (stage) {
    case 'CONTEXT':
      return 'Share basic information about your project: subject area, grade level, and project duration.';
    case 'BIG_IDEA':
      return 'Describe the central theme or concept students will explore. Think big picture and real-world connections.';
    case 'ESSENTIAL_QUESTION':
      return 'Craft a driving question that will spark student inquiry and investigation throughout the project.';
    case 'LEARNING_JOURNEY':
      return 'Outline how students will progress through the project, including key activities and assessment points.';
    default:
      return 'Follow the conversation prompts to design your project step by step.';
  }
}

function getInputPlaceholder(stage: string): string {
  switch (stage) {
    case 'CONTEXT':
      return 'e.g., "Grade 7 science project about environmental sustainability, 3 weeks long"';
    case 'BIG_IDEA':
      return 'e.g., "Students explore how human actions impact local ecosystems"';
    case 'ESSENTIAL_QUESTION':
      return 'e.g., "How can we become better stewards of our local environment?"';
    case 'LEARNING_JOURNEY':
      return 'e.g., "Students research → design solutions → test with community → present findings"';
    default:
      return 'Type your response...';
  }
}

export default StreamlinedChatInterface;