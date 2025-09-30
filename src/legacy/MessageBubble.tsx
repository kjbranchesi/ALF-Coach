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
          bubble: 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50',
          avatar: 'bg-gradient-to-br from-amber-400 to-amber-500',
          iconColor: 'text-white',
          icon: 'info'
        };
      case 'popup':
        return {
          bubble: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 text-gray-800 dark:text-gray-200 border border-primary-200/50 dark:border-blue-700/50',
          avatar: 'bg-gradient-to-br from-primary-500 to-indigo-600',
          iconColor: 'text-white',
          icon: 'help-circle'
        };
      case 'suggestions':
        return {
          bubble: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-gray-800 dark:text-gray-200 border border-green-200/50 dark:border-green-700/50',
          avatar: 'bg-gradient-to-br from-green-500 to-emerald-600',
          iconColor: 'text-white',
          icon: 'lightbulb'
        };
      case 'user':
        return {
          bubble: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0',
          avatar: 'bg-gradient-to-br from-primary-500 to-primary-600',
          iconColor: 'text-white',
          icon: 'user'
        };
      default: // Regular chat
        return {
          bubble: 'bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-200 border border-slate-200/50 dark:border-slate-700/50',
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
            flex-shrink-0 w-12 h-12 squircle-pure flex items-center justify-center
            shadow-[0_4px_12px_rgba(15,23,42,0.12)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)] ${styling.avatar}
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
            squircle-card
            shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
            hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]
            transition-all duration-240
            ${isUser ? 'rounded-br-lg' : 'rounded-bl-lg'}
            backdrop-blur-lg
          `}
        >
          {/* Message Type Indicator - REMOVED: Redundant labeling */}
          {/* Only show indicators for system notices, not regular responses */}
          {!isUser && messageType === 'system' && (
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-600">
              <Icon name="tag" size="xs" className="text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                System Notice
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