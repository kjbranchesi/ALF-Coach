/**
 * MinimalChatBubbles.tsx - Ultra-clean chat bubbles inspired by ChatGPT/Gemini
 * High-tech minimal design with hairline borders
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { type ChatMessage } from '../../core/types/ChatMessage';
import ReactMarkdown from 'react-markdown';
import { Bot, User, CheckCircle2 } from 'lucide-react';
import { textStyles } from '../../design-system/typography.config';

interface MinimalChatBubblesProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  className?: string;
}

export const MinimalChatBubbles: React.FC<MinimalChatBubblesProps> = ({
  messages,
  isLoading = false,
  className = ''
}) => {
  return (
    <div className={`space-y-0 ${className}`}>
      {messages.map((message, index) => (
        <motion.div
          key={message.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`
            group relative
            ${message.role === 'user' ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-900/50'}
            ${index > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}
            hover:bg-gray-50 dark:hover:bg-gray-900/70 transition-colors duration-150
          `}
        >
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex gap-6">
              {/* Minimal avatar - just a subtle icon */}
              <div className="flex-shrink-0 w-6 pt-1">
                {message.role === 'user' ? (
                  <div className="w-6 h-6 rounded-md bg-gray-900 dark:bg-gray-100 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>

              {/* Message content */}
              <div className="flex-1 min-w-0">
                {message.role === 'user' ? (
                  <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
                    {message.content}
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        // Custom styling for markdown elements
                        p: ({ children }) => (
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-1 mb-3 ml-4">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-700 dark:text-gray-300 flex items-start">
                            <span className="text-primary-500 mr-2 mt-1.5 text-xs">•</span>
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block p-3 bg-gray-900 dark:bg-black text-gray-100 rounded-lg text-sm font-mono overflow-x-auto">
                              {children}
                            </code>
                          );
                        },
                        h3: ({ children }) => (
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
                            {children}
                          </h3>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900 dark:text-gray-100">
                            {children}
                          </strong>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-primary-500 pl-4 my-3 text-gray-600 dark:text-gray-400 italic">
                            {children}
                          </blockquote>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Timestamp - appears on hover */}
                {message.timestamp && (
                  <div className="mt-2 text-xs text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800"
        >
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-6 pt-1">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Alternative version with no avatars at all (even more minimal)
interface UltraMinimalChatBubblesProps extends MinimalChatBubblesProps {
  onAcceptSuggestion?: (suggestion: string) => void;
}

export const UltraMinimalChatBubbles: React.FC<UltraMinimalChatBubblesProps> = ({
  messages,
  isLoading = false,
  className = '',
  onAcceptSuggestion
}) => {
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<string>>(new Set());

  // Extract bold suggestions from markdown content
  const extractBoldSuggestions = (content: string): string[] => {
    const boldPattern = /\*\*(.*?)\*\*/g;
    const matches = content.match(boldPattern);
    if (!matches) return [];
    
    // Filter to only meaningful suggestions (longer than 10 chars, not headers)
    return matches
      .map(m => m.replace(/\*\*/g, ''))
      .filter(text => 
        text.length > 10 && 
        !text.includes(':') && 
        !text.endsWith('?') &&
        !text.startsWith('Note') &&
        !text.startsWith('Important')
      );
  };

  const handleAcceptSuggestion = (suggestion: string) => {
    setAcceptedSuggestions(prev => new Set(prev).add(suggestion));
    onAcceptSuggestion?.(suggestion);
  };

  return (
    <div className={`${className}`}>
      {messages.map((message, index) => {
        const suggestions = message.role === 'assistant' ? extractBoldSuggestions(message.content) : [];
        
        return (
          <motion.div
          key={message.id || index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={`
            group
            ${message.role === 'user' 
              ? 'bg-white dark:bg-gray-900' 
              : 'bg-gradient-to-r from-gray-50/30 to-gray-50/10 dark:from-gray-900/30 dark:to-gray-900/10'
            }
            ${index > 0 ? 'border-t border-gray-100/50 dark:border-gray-800/50' : ''}
          `}
        >
          <div className="max-w-3xl mx-auto px-6 py-5">
            {/* Small role indicator */}
            <div className="flex items-start gap-0">
              <div className="flex-1">
                {/* Minimal role label */}
                <div className={`
                  ${textStyles.chatRole} mb-2
                  ${message.role === 'user' 
                    ? '' 
                    : 'text-primary-500 dark:text-primary-400'
                  }
                `}>
                  {message.role === 'user' ? 'You' : 'ALF Coach'}
                </div>

                {/* Message content with ultra-clean styling */}
                <div className={
                  message.role === 'user' 
                    ? textStyles.chatUser
                    : textStyles.chatAssistant
                }>
                  {message.role === 'user' ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-3 last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="space-y-1 mb-3 ml-3">{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li className="flex items-start">
                            <span className="text-primary-400 mr-2 text-xs mt-1">→</span>
                            <span className="flex-1">{children}</span>
                          </li>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline ? (
                            <code className="px-1 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded text-xs font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className="block p-3 bg-gray-900 dark:bg-black text-gray-100 rounded text-xs font-mono overflow-x-auto my-3">
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                  
                  {/* Inline suggestion buttons for AI messages with bold suggestions */}
                  {message.role === 'assistant' && suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {suggestions.map((suggestion, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="inline-flex items-center gap-2"
                        >
                          {!acceptedSuggestions.has(suggestion) ? (
                            <button
                              onClick={() => handleAcceptSuggestion(suggestion)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-full transition-colors border border-primary-200 dark:border-blue-800"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Use "{suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}"
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Accepted
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        );
      })}

      {/* Ultra-minimal loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-gray-100/50 dark:border-gray-800/50"
        >
          <div className="max-w-3xl mx-auto px-6 py-5">
            <div className="text-[10px] font-medium uppercase tracking-wider mb-2 text-primary-500 dark:text-primary-400">
              ALF Coach
            </div>
            <div className="flex gap-1">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    duration: 1.2, 
                    repeat: Infinity,
                    delay 
                  }}
                  className="w-1.5 h-1.5 bg-primary-400 dark:bg-primary-500 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};