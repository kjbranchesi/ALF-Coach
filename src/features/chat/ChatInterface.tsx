// ChatInterface - Pure UI component for chat
// No business logic, only presentation

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Edit, HelpCircle, Lightbulb, RefreshCw, Rocket, Info, ArrowRight } from 'lucide-react';
import { MessageContent } from './MessageContent';
import { IdeaCardsV2 } from './IdeaCardsV2';
import { ChatMessage, QuickReply } from '../../services/chat-service';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  isProcessing: boolean;
  onAction: (action: string, data?: any) => void;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

// Icon mapping
const iconMap: Record<string, any> = {
  Check,
  Edit,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Rocket,
  Info,
  ArrowRight
};

export function ChatInterface({
  messages,
  quickReplies,
  isProcessing,
  onAction,
  progress
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = () => {
    if (!inputValue.trim() || isProcessing) return;
    
    onAction('text', inputValue.trim());
    setInputValue('');
  };

  // Handle button click
  const handleButtonClick = (action: string) => {
    if (isProcessing) return;
    console.log('Button clicked:', action);
    onAction(action);
  };

  // Handle card selection
  const handleCardSelect = (card: any) => {
    if (isProcessing) return;
    onAction('card_select', card);
  };

  // Render button
  const renderButton = (button: QuickReply) => {
    const Icon = button.icon ? (iconMap[button.icon] || null) : null;
    
    return (
      <motion.button
        key={button.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleButtonClick(button.action)}
        disabled={isProcessing}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
          transition-all duration-200 transform-gpu
          ${button.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          ${button.variant === 'secondary' ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50' : ''}
          ${button.variant === 'tertiary' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
          ${button.variant === 'suggestion' ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : ''}
          ${!button.variant ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {button.label}
      </motion.button>
    );
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Step {progress.current} of {progress.total}
            </span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
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
                          onSelect={handleCardSelect}
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
          
          {/* Processing indicator */}
          {isProcessing && (
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

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto p-6">
          {/* Quick Reply Buttons */}
          {quickReplies.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {quickReplies.map(renderButton)}
            </div>
          )}
          
          {/* Text Input - only show when there are no exclusive buttons */}
          {(!quickReplies.length || quickReplies.some(b => b.variant === 'suggestion')) && (
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Share your ideas..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         resize-none min-h-[60px] max-h-[200px]"
                disabled={isProcessing}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                className="self-end p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}