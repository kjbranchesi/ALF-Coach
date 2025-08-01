/**
 * MessageBubble.tsx - Simple message display component
 */

import React from 'react';
import { type ChatMessage } from '../../core/types/SOPTypes';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`
          max-w-[85%] md:max-w-[70%] 
          px-4 py-3 rounded-2xl
          ${isUser 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-sm' 
            : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
          }
        `}
      >
        <div className="prose prose-sm max-w-none">
          {/* Simple markdown-like formatting */}
          {message.content.split('\n').map((line, i) => {
            // Bold text
            const formattedLine = line.replace(
              /\*\*(.*?)\*\*/g, 
              '<strong class="font-semibold">$1</strong>'
            );
            
            // Bullet points
            if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
              return (
                <div key={i} className="ml-4" 
                  dangerouslySetInnerHTML={{ __html: formattedLine }} 
                />
              );
            }
            
            // Numbered lists
            if (/^\d+\./.test(line.trim())) {
              return (
                <div key={i} className="ml-4" 
                  dangerouslySetInnerHTML={{ __html: formattedLine }} 
                />
              );
            }
            
            // Regular paragraph
            return (
              <p key={i} className="my-1" 
                dangerouslySetInnerHTML={{ __html: formattedLine }} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};