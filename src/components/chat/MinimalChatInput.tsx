/**
 * MinimalChatInput.tsx - Ultra-clean chat input like ChatGPT/Gemini
 * High-tech but super minimal smart aesthetic
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, StopCircle, Lightbulb, HelpCircle, Info } from 'lucide-react';

interface MinimalChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  onStop?: () => void;
  showHelpHint?: boolean; // Control whether to show the help hint
}

export const MinimalChatInput: React.FC<MinimalChatInputProps> = ({ 
  value,
  onChange,
  onSubmit,
  disabled = false, 
  placeholder = "Message ALF Coach...",
  isLoading = false,
  onStop,
  showHelpHint = false // Default to false - only show when explicitly enabled
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inactivityTimer = useRef<NodeJS.Timeout>();

  // Show hint after 15 seconds of inactivity when input is empty AND showHelpHint is true
  useEffect(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    
    // Only show hint if explicitly enabled via prop
    if (showHelpHint && !value && !disabled && !isLoading) {
      inactivityTimer.current = setTimeout(() => {
        setShowHint(true);
      }, 15000);
    } else {
      setShowHint(false);
    }

    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [value, disabled, isLoading, showHelpHint]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 200) + 'px';
    }
  }, [value]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim() && !disabled && !isLoading) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative">
      {/* Contextual hint when user seems stuck */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-primary-700 dark:text-primary-300">
                <p className="font-medium mb-1">Need help getting started?</p>
                <p className="text-xs opacity-90">
                  Try clicking the <Lightbulb className="w-3 h-3 inline mx-1" /> <strong>Ideas</strong> button for suggestions, 
                  or <HelpCircle className="w-3 h-3 inline mx-1" /> <strong>Help</strong> for guidance on this step.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="relative">
      <div className={`
        relative flex items-end
        border-2 rounded-full transition-all duration-200
        ${isFocused 
          ? 'border-primary-500 dark:border-primary-400 shadow-lg shadow-blue-500/20 dark:shadow-blue-400/20' 
          : 'border-gray-300 dark:border-gray-700'
        }
        bg-white dark:bg-gray-900
      `}>
        {/* Optional attachment button */}
        <button
          type="button"
          className="p-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          title="Attach file (coming soon)"
          disabled
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text input - ultra clean */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={`
            flex-1 py-3 pr-3 bg-transparent resize-none
            text-[15px] leading-relaxed
            text-gray-900 dark:text-gray-100
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            min-h-[24px] max-h-[200px]
          `}
          rows={1}
        />

        {/* Send/Stop button - minimal style */}
        <div className="p-2 pr-3">
          {isLoading ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title="Stop generating"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              className={`
                p-2 rounded-full transition-all
                ${value.trim()
                  ? 'text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300'
                  : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                }
              `}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Character count - subtle, only shows on long messages */}
      <AnimatePresence>
        {value.length > 1500 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 right-2 text-[11px] text-gray-400 dark:text-gray-600"
          >
            {value.length}/2000
          </motion.div>
        )}
      </AnimatePresence>
    </form>
    </div>
  );
};