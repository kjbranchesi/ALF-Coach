/**
 * ChatInput.tsx - Simple input component that actually works
 * No complex state management that breaks
 */

import React, { type KeyboardEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Type your response...'
}) => {
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="chat-input-container px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex gap-2 items-end">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={`
            flex-1 px-4 py-2 rounded-lg
            border border-gray-300 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            resize-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
            transition-all duration-200
            ${value.length > 100 ? 'min-h-[80px]' : ''}
          `}
          style={{
            minHeight: '44px',
            maxHeight: '120px',
            overflowY: value.length > 200 ? 'auto' : 'hidden'
          }}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className={`
            px-4 py-2 rounded-lg
            bg-indigo-600 text-white font-medium
            hover:bg-indigo-700
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-all duration-200
            flex items-center gap-2
            h-[44px]
          `}
        >
          <span>Send</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
            />
          </svg>
        </button>
      </div>
      {value.length > 250 && (
        <p className="text-xs text-gray-500 mt-1">
          Long response detected - this will be treated as brainstorming
        </p>
      )}
    </div>
  );
};