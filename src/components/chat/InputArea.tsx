import React, { useCallback, useEffect } from 'react';
import { Lightbulb, Send } from 'lucide-react';

interface InputAreaProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onToggleIdeas: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  onEscape?: () => void;
  lastUserMessage?: string;
}

export const InputArea: React.FC<InputAreaProps> = ({
  value,
  onChange,
  onSend,
  onToggleIdeas,
  inputRef,
  disabled = false,
  onEscape,
  lastUserMessage,
}) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.key === 'Enter' && !e.shiftKey) || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onSend();
        return;
      }
      if (e.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (e.key === 'ArrowUp' && !value.trim() && lastUserMessage) {
        onChange(lastUserMessage);
        requestAnimationFrame(() => {
          try {
            const el = inputRef?.current;
            if (el) {
              el.selectionStart = el.selectionEnd = el.value.length;
            }
          } catch {}
        });
      }
    },
    [onSend, onEscape, value, lastUserMessage, onChange, inputRef]
  );

  useEffect(() => {
    // Auto-resize on initial mount/value changes
    const el = inputRef?.current;
    if (!el) return;
    el.style.height = '20px';
    el.style.height = `${Math.min(el.scrollHeight, 60)}px`;
  }, [value, inputRef]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="relative z-30 pointer-events-auto">
      <div
        className={`relative bg-white/95 dark:bg-gray-800 backdrop-blur-sm border border-gray-200/70 dark:border-gray-600 hover:border-primary-400/80 dark:hover:border-primary-400/80 focus-within:border-primary-500 dark:focus-within:border-primary-300 transition-all duration-200`}
        style={{ borderRadius: value.includes('\n') ? '24px' : '9999px' }}
      >
        <div className="flex items-center px-4 py-2.5 gap-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              const el = e.currentTarget;
              el.style.height = '20px';
              el.style.height = `${Math.min(el.scrollHeight, 60)}px`;
              const container = el.closest('.relative') as HTMLDivElement | null;
              if (container) {
                const hasMultipleLines = el.scrollHeight > 25 || e.target.value.split('\n').length > 1;
                container.style.borderRadius = hasMultipleLines ? '24px' : '9999px';
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message ALF Coach..."
            rows={1}
            className="flex-1 resize-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 text-base leading-6"
            style={{ height: '20px', minHeight: '20px', maxHeight: '60px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            aria-label="Chat message input"
          />
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={onToggleIdeas}
              disabled={disabled}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
              title="Get ideas"
              aria-label="Get ideas"
            >
              <Lightbulb className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed active:scale-95 touch-manipulation ${
                canSend ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm' : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputArea;

