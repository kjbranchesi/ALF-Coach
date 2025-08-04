/**
 * MessageBubble.tsx - Message display component with soft UI design
 * Features soft shadows, rounded corners, and beautiful gradients
 */

import React from 'react';
import { motion } from 'framer-motion';
import { type ChatMessage } from '../../core/types/SOPTypes';
import { Icon } from '../../design-system';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className={`
            flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
            shadow-md
            ${isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800'
            }
          `}
        >
          <Icon 
            name={isUser ? 'user' : 'bot'} 
            size="sm" 
            className={isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
          />
        </motion.div>

        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`
            relative px-5 py-4
            ${isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
            }
            rounded-2xl
            shadow-lg hover:shadow-xl
            transition-all duration-200
            ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
            ${!isUser && 'border border-gray-100 dark:border-gray-700'}
          `}
        >
          {/* Message tail */}
          <div 
            className={`
              absolute bottom-3 w-0 h-0
              ${isUser 
                ? 'right-[-8px] border-l-[8px] border-l-blue-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent' 
                : 'left-[-8px] border-r-[8px] border-r-white dark:border-r-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
              }
            `}
          />

          {/* Content */}
          <div className="space-y-3">
            {message.content.split('\n').map((paragraph, i) => {
              if (!paragraph.trim()) return null;
              
              // Headers (lines starting with ##)
              if (paragraph.startsWith('##')) {
                return (
                  <h3 key={i} className={`font-semibold text-lg mt-4 mb-2 ${isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {paragraph.replace(/^#+\s/, '')}
                  </h3>
                );
              }
              
              // Bold text
              const formattedText = paragraph.replace(
                /\*\*(.*?)\*\*/g, 
                '<strong class="font-semibold">$1</strong>'
              );
              
              // Bullet points
              if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                return (
                  <div key={i} className="flex items-start gap-2 ml-2">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isUser ? 'bg-blue-200' : 'bg-blue-500 dark:bg-blue-400'
                    }`} />
                    <div 
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: formattedText.replace(/^[•-]\s*/, '') }} 
                    />
                  </div>
                );
              }
              
              // Numbered lists
              if (/^\d+\./.test(paragraph.trim())) {
                const [number, ...rest] = paragraph.trim().split('.');
                return (
                  <div key={i} className="flex items-start gap-3 ml-2">
                    <span className={`
                      mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0
                      ${isUser 
                        ? 'bg-blue-400/30 text-white' 
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }
                    `}>
                      {number}
                    </span>
                    <div 
                      className="flex-1"
                      dangerouslySetInnerHTML={{ __html: rest.join('.').trim() }} 
                    />
                  </div>
                );
              }
              
              // Regular paragraphs
              return (
                <div 
                  key={i} 
                  className={`leading-relaxed ${isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                />
              );
            })}
          </div>

          {/* Timestamp */}
          <div className={`
            text-xs mt-3 
            ${isUser ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}
          `}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};