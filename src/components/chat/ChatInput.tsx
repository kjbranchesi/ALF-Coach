/**
 * ChatInput.tsx - Chat input component with ALF design system
 * Features consistent styling, rounded corners, and enhanced UX
 */

import React, { type KeyboardEvent } from 'react';
import { Button, Icon } from '../../design-system';

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
    <div className="chat-input-container px-4 py-3 border-t border-gray-200 bg-white shadow-sm">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            className={`
              w-full px-4 py-3 rounded-xl border border-gray-200 shadow-sm
              bg-white text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              resize-none transition-all duration-200
              disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400
              ${value.length > 100 ? 'min-h-[80px]' : ''}
            `}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: value.length > 200 ? 'auto' : 'hidden'
            }}
          />
          {value.length > 250 && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <Icon name="info" size="xs" color="#f59e0b" />
              Long response detected - this will be treated as brainstorming
            </p>
          )}
        </div>
        <Button
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          variant="primary"
          size="md"
          rightIcon="forward"
          className="h-[48px] px-6 rounded-xl shadow-md"
        >
          Send
        </Button>
      </div>
    </div>
  );
};