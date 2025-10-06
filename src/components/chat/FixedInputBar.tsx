/**
 * FixedInputBar.tsx
 *
 * Fixed chat input bar - always visible at bottom with light mode primary design
 * Apple HIG compliant with glassmorphism and smooth interactions
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Sparkles } from 'lucide-react';

interface FixedInputBarProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showAIToggle?: boolean;
  aiEnabled?: boolean;
  onAIToggle?: (enabled: boolean) => void;
}

export function FixedInputBar({
  onSendMessage,
  placeholder = 'Type your message...',
  disabled = false,
  showAIToggle = false,
  aiEnabled = false,
  onAIToggle
}: FixedInputBarProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1030] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50 shadow-lg shadow-gray-900/5 dark:shadow-black/10">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div
          className={`flex items-end gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border transition-all duration-200 ${
            isFocused
              ? 'border-blue-300 dark:border-blue-500/50 shadow-sm shadow-blue-500/10'
              : 'border-gray-200 dark:border-slate-700/50'
          }`}
        >
          {/* AI Toggle (optional) */}
          {showAIToggle && (
            <button
              onClick={() => onAIToggle?.(!aiEnabled)}
              className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
                aiEnabled
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-600 dark:text-slate-400'
              }`}
              aria-label={aiEnabled ? 'AI assistance enabled' : 'AI assistance disabled'}
              title={aiEnabled ? 'AI assistance enabled' : 'AI assistance disabled'}
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}

          {/* Attachment button (optional - currently inactive) */}
          <button
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors opacity-50 cursor-not-allowed"
            disabled
            aria-label="Attach file (coming soon)"
            title="Attach file (coming soon)"
          >
            <Paperclip className="w-4 h-4 text-gray-600 dark:text-slate-400" />
          </button>

          {/* Text input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full bg-transparent text-[13px] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 resize-none outline-none"
              style={{
                maxHeight: '120px',
                minHeight: '24px',
                overflowY: 'auto'
              }}
            />
          </div>

          {/* Send button */}
          <motion.button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            whileTap={{ scale: 0.95 }}
            className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-all ${
              message.trim() && !disabled
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Helper text */}
        <div className="flex items-center justify-between mt-2 px-2">
          <p className="text-[11px] text-gray-500 dark:text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-mono text-[11px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-mono text-[11px]">Shift+Enter</kbd> for new line
          </p>
          {message.length > 0 && (
            <p className={`text-[11px] ${
              message.length > 500 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-slate-500'
            }`}>
              {message.length} / 1000
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
