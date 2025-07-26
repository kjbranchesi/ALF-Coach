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
  
  // Determine input state
  const showSuggestionButtons = quickReplies.some(b => b.variant === 'suggestion');
  const showConfirmButtons = quickReplies.some(b => b.action === 'continue');
  const inputDisabled = isProcessing || showConfirmButtons;

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

  // Render button with improved hierarchy
  const renderButton = (button: QuickReply) => {
    const Icon = button.icon ? (iconMap[button.icon] || null) : null;
    
    const getButtonClasses = () => {
      const base = "inline-flex items-center gap-2 font-medium transition-all duration-200";
      
      switch (button.variant) {
        case 'primary':
          return `${base} bg-gradient-to-r from-purple-600 to-blue-600 text-white 
                  px-6 py-3 rounded-xl shadow-lg hover:shadow-xl 
                  transform hover:-translate-y-0.5`;
        case 'secondary':
          return `${base} bg-white dark:bg-gray-800 border-2 border-slate-300 dark:border-gray-600 
                  text-slate-700 dark:text-gray-200 px-6 py-3 rounded-xl 
                  hover:border-purple-400 hover:text-purple-700 dark:hover:border-purple-400`;
        case 'tertiary':
          return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  px-5 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600`;
        case 'suggestion':
          return `${base} bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 
                  text-slate-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm
                  hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 
                  dark:hover:bg-gray-700 dark:hover:border-purple-500`;
        default:
          return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600`;
      }
    };
    
    return (
      <motion.button
        key={button.id}
        whileHover={{ scale: button.variant === 'primary' ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleButtonClick(button.action)}
        disabled={isProcessing}
        className={`${getButtonClasses()} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {Icon && <Icon className={button.variant === 'suggestion' ? "w-4 h-4" : "w-5 h-5"} />}
        {button.label}
      </motion.button>
    );
  };

  // Get placeholder text based on state
  const getPlaceholderText = () => {
    if (isProcessing) return "Coach is thinking...";
    if (showConfirmButtons) return "Choose an option above to continue";
    if (messages.length === 1) return "Type 'start' to begin...";
    return "Share your ideas...";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Progress Bar with Better Visibility */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-gray-800 dark:text-white">
                Step {progress.current} of {progress.total}
              </span>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                {progress.current <= 3 ? 'Ideation' : progress.current <= 6 ? 'Journey' : 'Deliverables'}
              </span>
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              {progress.percentage}% complete
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-md"
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
          
          {/* Enhanced Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-6 py-4"
            >
              <div className="flex gap-1">
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
              </div>
              <span className="text-sm text-slate-500 dark:text-gray-400">
                Coach is crafting your personalized guidance...
              </span>
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
          
          {/* Text Input - always visible */}
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !inputDisabled) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={getPlaceholderText()}
              className={`flex-1 px-4 py-3 rounded-xl border 
                       ${inputDisabled 
                         ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' 
                         : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                       }
                       text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       resize-none min-h-[60px] max-h-[200px]
                       transition-all duration-200`}
              disabled={inputDisabled}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || inputDisabled}
              className={`self-end p-3 rounded-lg transition-all duration-200
                       ${inputDisabled
                         ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                         : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                       }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}