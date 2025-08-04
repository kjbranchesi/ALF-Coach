/**
 * MessageBubble.tsx - Message display component with ALF design system
 * Features soft shadows, rounded corners, and consistent styling
 */

import React from 'react';
import { type ChatMessage } from '../../core/types/SOPTypes';
import { Card } from '../../design-system';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <Card
        padding="md"
        className={`
          max-w-[85%] md:max-w-[70%] 
          ${isUser 
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md rounded-br-md' 
            : 'bg-white text-gray-800 shadow-md rounded-bl-md border border-gray-100'
          }
          transition-all duration-200 hover:shadow-lg
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
                <div key={i} className="ml-4 my-1" 
                  dangerouslySetInnerHTML={{ __html: formattedLine }} 
                />
              );
            }
            
            // Numbered lists
            if (/^\d+\./.test(line.trim())) {
              return (
                <div key={i} className="ml-4 my-1" 
                  dangerouslySetInnerHTML={{ __html: formattedLine }} 
                />
              );
            }
            
            // Regular paragraph - skip empty lines
            if (line.trim()) {
              return (
                <p key={i} className="my-1 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: formattedLine }} 
                />
              );
            }
            
            return <br key={i} />;
          })}
        </div>
      </Card>
    </div>
  );
};