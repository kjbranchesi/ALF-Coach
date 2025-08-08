/**
 * MessageBubble.tsx - Message display component with soft UI design
 * Features soft shadows, rounded corners, and beautiful gradients
 */

import React from 'react';
import { motion } from 'framer-motion';
import { type ChatMessage } from '../../core/types/SOPTypes';
import { Icon } from '../../design-system';
import { getAriaAttributes } from '../../utils/accessibility';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const messageId = `message-${message.id || Date.now()}`;
  
  // Determine message type for visual styling
  const getMessageType = () => {
    if (isUser) return 'user';
    if (isSystem) return 'system';
    
    // Check for popup/stage responses vs regular chat
    if (message.quickReplies && message.quickReplies.length > 0) {
      return 'popup'; // Response to stage questions
    }
    
    if (message.suggestions && message.suggestions.length > 0) {
      return 'suggestions'; // AI providing suggestion cards
    }
    
    return 'chat'; // Regular conversational response
  };
  
  const messageType = getMessageType();
  
  // Get styling based on message type
  const getMessageStyling = () => {
    switch (messageType) {
      case 'system':
        return {
          bubble: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
          avatar: 'bg-gradient-to-br from-amber-400 to-amber-500',
          iconColor: 'text-white',
          icon: 'info'
        };
      case 'popup':
        return {
          bubble: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-gray-800 dark:text-gray-200 border-2 border-blue-200 dark:border-blue-700',
          avatar: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          iconColor: 'text-white',
          icon: 'help-circle'
        };
      case 'suggestions':
        return {
          bubble: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-gray-800 dark:text-gray-200 border-2 border-green-200 dark:border-green-700',
          avatar: 'bg-gradient-to-br from-green-500 to-emerald-600',
          iconColor: 'text-white',
          icon: 'lightbulb'
        };
      case 'user':
        return {
          bubble: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
          avatar: 'bg-gradient-to-br from-blue-500 to-blue-600',
          iconColor: 'text-white',
          icon: 'user'
        };
      default: // Regular chat
        return {
          bubble: 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100/50 dark:border-gray-700/50',
          avatar: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800',
          iconColor: 'text-gray-700 dark:text-gray-300',
          icon: 'bot'
        };
    }
  };
  
  const styling = getMessageStyling();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      {...getAriaAttributes({
        role: 'article',
        label: `${message.role} message`
      })}
    >
      <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className={`
            flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center
            shadow-xl ${styling.avatar}
          `}
        >
          <Icon 
            name={styling.icon as any} 
            size="sm" 
            className={styling.iconColor}
          />
        </motion.div>

        {/* Message Bubble */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className={`
            relative px-6 py-5
            ${styling.bubble}
            rounded-3xl
            shadow-xl hover:shadow-2xl
            transition-all duration-200
            ${isUser ? 'rounded-br-xl' : 'rounded-bl-xl'}
            backdrop-blur-sm
          `}
        >
          {/* Message Type Indicator */}
          {!isUser && messageType !== 'chat' && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
              <Icon name="tag" size="xs" className="text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {messageType === 'popup' ? 'Stage Response' : 
                 messageType === 'suggestions' ? 'AI Suggestions' : 
                 messageType === 'system' ? 'System Notice' : messageType}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="space-y-3">
            {message.content.split('\n').map((paragraph, i) => {
              if (!paragraph.trim()) return null;
              
              // Headers (lines starting with ##)
              if (paragraph.startsWith('##')) {
                return (
                  <h3 key={i} className="font-semibold text-lg mt-4 mb-2">
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
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 flex-shrink-0" />
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
                    <span className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 bg-current/20">
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
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                />
              );
            })}
          </div>

          {/* Timestamp */}
          <div className="text-xs mt-3 opacity-60">
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