/**
 * ClassicChatInterface.tsx - Clean, classic chat layout like ChatGPT/Gemini
 * Left sidebar for progress, center for messages, input at bottom
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, StopCircle } from 'lucide-react';
import { type ChatMessage } from '../../core/types/ChatMessage';
import { type SOPStage } from '../../core/types/SOPTypes';
import { ProgressSidebar } from './ProgressSidebar';
import { UltraMinimalChatBubbles } from './MinimalChatBubbles';

interface ClassicChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentStage: SOPStage;
  currentStep: string;
  capturedData: any;
  progress: any;
  onSendMessage: (message: string) => void;
  onStopGeneration?: () => void;
  showProgressSidebar?: boolean;
  onToggleSidebar?: () => void;
}

export const ClassicChatInterface: React.FC<ClassicChatInterfaceProps> = ({
  messages,
  isLoading,
  currentStage,
  currentStep,
  capturedData,
  progress,
  onSendMessage,
  onStopGeneration,
  showProgressSidebar = true,
  onToggleSidebar
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full bg-white dark:bg-gray-950">
      {/* Progress Sidebar - Left side like ChatGPT's chat history */}
      <ProgressSidebar
        currentStage={currentStage}
        currentStep={currentStep}
        capturedData={capturedData}
        progress={progress}
        isCollapsed={!showProgressSidebar}
        onToggleCollapse={onToggleSidebar}
      />

      {/* Main Chat Area - Classic centered layout */}
      <div className="flex-1 flex flex-col">
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <UltraMinimalChatBubbles
            messages={messages}
            isLoading={isLoading}
          />
          <div ref={messagesEndRef} />
          
          {/* Spacer to ensure last message isn't hidden behind input */}
          <div className="h-32" />
        </div>

        {/* Input Area - Fixed at bottom like ChatGPT */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-3xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="relative">
              <div className={`
                relative flex items-end gap-2 
                border rounded-2xl transition-all duration-200
                ${isFocused 
                  ? 'border-gray-400 dark:border-gray-600 shadow-sm' 
                  : 'border-gray-300 dark:border-gray-700'
                }
                bg-white dark:bg-gray-900
              `}>
                {/* Attachment button (optional) */}
                <button
                  type="button"
                  className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Text input */}
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Message ALF Coach..."
                  disabled={isLoading}
                  className={`
                    flex-1 py-3 pr-3 bg-transparent resize-none
                    text-gray-900 dark:text-gray-100
                    placeholder-gray-500 dark:placeholder-gray-400
                    focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    min-h-[24px] max-h-[200px]
                  `}
                  rows={1}
                />

                {/* Send/Stop button */}
                <button
                  type={isLoading ? "button" : "submit"}
                  onClick={isLoading ? onStopGeneration : undefined}
                  disabled={!isLoading && !inputValue.trim()}
                  className={`
                    p-3 rounded-lg m-1 transition-all duration-200
                    ${isLoading 
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                      : inputValue.trim()
                        ? 'text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }
                  `}
                  title={isLoading ? "Stop generating" : "Send message"}
                >
                  {isLoading ? (
                    <StopCircle className="w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Character count (optional, shows on long messages) */}
              <AnimatePresence>
                {inputValue.length > 500 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-6 right-2 text-xs text-gray-500 dark:text-gray-400"
                  >
                    {inputValue.length}/2000
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Helper text */}
            <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
              ALF Coach can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};