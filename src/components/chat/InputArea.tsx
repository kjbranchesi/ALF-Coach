import React, { useCallback, useEffect, useState } from 'react';
import { Lightbulb, Send, HelpCircle, X } from 'lucide-react';

interface GuidanceContent {
  what?: string;
  why?: string;
  tip?: string;
}

interface InputAreaProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onToggleIdeas: () => void;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  disabled?: boolean;
  onEscape?: () => void;
  lastUserMessage?: string;
  ideasActive?: boolean;
  guidance?: GuidanceContent;
  stageName?: string;
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
  ideasActive = false,
  guidance,
  stageName,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const hasGuidance = guidance && (guidance.what || guidance.why || guidance.tip);
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
    // Auto-resize on initial mount/value changes (allow up to 3 lines)
    const el = inputRef?.current;
    if (!el) {return;}
    el.style.height = '20px';
    el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
  }, [value, inputRef]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <>
      <div className="relative z-30 pointer-events-auto">
        <div
          className={`relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 hover:border-primary-400/80 dark:hover:border-primary-400/80 focus-within:border-primary-500 dark:focus-within:border-primary-400 transition-all duration-240 shadow-[0_8px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)]`}
          style={{ borderRadius: value.includes('\n') ? '24px / 20px' : '9999px' }}
        >
          <div className="flex items-center px-3 py-1.5 gap-2">
            {/* Help button on the left */}
            {hasGuidance && (
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                disabled={disabled}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                title="Need guidance?"
                aria-label="Show guidance"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
            <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              const el = e.currentTarget;
              el.style.height = '20px';
              el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
              const container = el.closest('.relative');
              if (container) {
                const hasMultipleLines = el.scrollHeight > 25 || e.target.value.split('\n').length > 1;
                container.style.borderRadius = hasMultipleLines ? '24px / 20px' : '9999px';
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Message ALF Coach..."
            rows={1}
            className="flex-1 resize-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 text-[12px] leading-snug"
            style={{ height: '20px', minHeight: '20px', maxHeight: '72px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            aria-label="Chat message input"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onToggleIdeas}
              disabled={disabled}
              className={`w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition-all duration-200 disabled:opacity-50 touch-manipulation ${
                ideasActive
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300'
                  : 'hover:bg-gray-100/80 dark:hover:bg-gray-700/80 text-gray-500 dark:text-gray-400'
              }`}
              title="Get ideas"
              aria-label="Get ideas"
            >
              <Lightbulb className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-240 disabled:cursor-not-allowed active:scale-95 touch-manipulation ${
                canSend ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm' : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Inline Guidance Modal */}
      {showHelp && hasGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {stageName || 'Guidance'}
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              {guidance?.what && (
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">What you'll do:</div>
                  <div>{guidance.what}</div>
                </div>
              )}
              {guidance?.why && (
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Why it matters:</div>
                  <div>{guidance.why}</div>
                </div>
              )}
              {guidance?.tip && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Tip:</div>
                      <div className="text-amber-800 dark:text-amber-200">{guidance.tip}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InputArea;
