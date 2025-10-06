/**
 * ScrollableChatArea.tsx
 *
 * Independent scrollable chat message area with light mode primary design
 * Sits between fixed header and input bar, scrolls independently from sidebar
 */

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  suggestions?: string[];
  actions?: MessageAction[];
}

interface MessageAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface ScrollableChatAreaProps {
  messages: Message[];
  isTyping?: boolean;
  autoScroll?: boolean;
}

export function ScrollableChatArea({
  messages,
  isTyping = false,
  autoScroll = true
}: ScrollableChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, autoScroll]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-slate-500"
      style={{
        marginTop: '60px', // CompactHeader height
        marginBottom: '120px', // FixedInputBar approximate height
        marginLeft: '280px' // FixedProgressSidebar expanded width (adjust based on sidebar state)
      }}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: index * 0.02
              }}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.role === 'assistant'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
              }`}>
                {message.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : message.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">!</span>
                )}
              </div>

              {/* Message bubble */}
              <div className={`flex-1 min-w-0 ${
                message.role === 'user' ? 'flex flex-col items-end' : ''
              }`}>
                <div className={`inline-block max-w-full px-4 py-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700/50 shadow-sm'
                }`}>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Timestamp */}
                  {message.timestamp && (
                    <p className={`text-[11px] mt-2 ${
                      message.role === 'user'
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700/50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={action.onClick}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          action.variant === 'primary'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700/50'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/50 shadow-sm">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="ml-2 text-[13px] text-gray-600 dark:text-slate-400">
                  ALF is thinking...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(209 213 219 / 0.5);
          border-radius: 3px;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105 / 0.5);
        }
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background-color: rgb(156 163 175 / 0.7);
        }
        .dark .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background-color: rgb(71 85 105 / 0.7);
        }
      `}</style>
    </div>
  );
}
