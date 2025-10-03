/**
 * ChatInput.tsx - Modern chat input component with soft UI design
 * Features rounded corners, soft shadows, and dark mode support
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../design-system/components/Button';
import { Icon } from '../../design-system/components/Icon';
import { getAriaAttributes, announceToScreenReader } from '../../utils/accessibility';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  showWarning?: boolean;
  warningMessage?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  value,
  onChange,
  onSubmit,
  disabled = false, 
  placeholder = "Type your message...",
  showWarning = false,
  warningMessage = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight  }px`;
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit();
      announceToScreenReader('Message sent', 'polite');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <AnimatePresence>
            {showWarning && warningMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2"
              >
                <div
                  role="alert"
                  aria-live="polite"
                  className="squircle-pure bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/50 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                >
                  <div className="flex items-start gap-2">
                    <Icon name="info" size="sm" className="text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">{warningMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            className={`
              relative flex items-end gap-3 p-2
              bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg
              border transition-all duration-240
              squircle-card
              shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)]
              hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]
              ${isFocused
                ? 'border-primary-400 dark:border-primary-500 ring-2 ring-blue-200/50 dark:ring-blue-900/30'
                : 'border-slate-200/50 dark:border-slate-700/50'
              }
            `}
            animate={{
              scale: isFocused ? 1.005 : 1,
            }}
            transition={{ duration: 0.15 }}
          >
        <div className="flex-1 relative">
          <label htmlFor="chat-input" className="sr-only">Message input</label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...getAriaAttributes({
              label: 'Type your message',
              describedBy: showWarning ? 'chat-warning' : undefined,
              disabled,
              required: true
            })}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={`
              w-full px-4 py-2 pr-12
              bg-gray-50 dark:bg-gray-900/50
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              resize-none overflow-hidden
              rounded-full
              focus:outline-none focus:bg-white dark:focus:bg-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              max-h-32
              transition-colors duration-150
            `}
            style={{ minHeight: '40px' }}
          />
          
          {/* Character count */}
          <AnimatePresence>
            {value.length > 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-600"
              >
                {value.length}/500
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Optional attachment button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-2.5 squircle-pure
              text-gray-400 dark:text-gray-500
              hover:text-gray-600 dark:hover:text-gray-400
              hover:bg-gray-100/80 dark:hover:bg-gray-700/80
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={disabled}
          >
            <Icon name="paperclip" size="sm" />
          </motion.button>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!value.trim() || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              p-2.5 squircle-pure
              transition-all duration-240
              disabled:opacity-50 disabled:cursor-not-allowed
              ${value.trim() && !disabled
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_16px_rgba(59,130,246,0.4)]'
                : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-400 dark:text-gray-500'
              }
            `}
          >
            <motion.div
              animate={{ 
                rotate: value.trim() && !disabled ? 0 : -45,
                scale: value.trim() && !disabled ? 1 : 0.9
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="send" size="sm" />
            </motion.div>
          </motion.button>
        </div>
      </motion.form>

          {/* Typing hints */}
          <div className="mt-3 px-4 text-xs text-gray-400 dark:text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 squircle-pure text-gray-600 dark:text-gray-400 font-mono">Enter</kbd> to send,
            <kbd className="ml-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 squircle-pure text-gray-600 dark:text-gray-400 font-mono">Shift+Enter</kbd> for new line
          </div>
        </div>
      </div>
    </div>
  );
};