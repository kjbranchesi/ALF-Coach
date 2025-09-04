// [ARCHIVED 2025-08-31] ChatInterface - Enhanced UI component with robustness features (unused)
// Includes error handling, state recovery, and connection awareness

import React, { useState, useRef, useEffect, useCallback, Component, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Check, Edit, HelpCircle, Lightbulb, RefreshCw, Rocket, Info, ArrowRight, AlertCircle } from 'lucide-react';
import { MessageContent } from './MessageContent';
import { IdeaCardsV2 } from './IdeaCardsV2';
import { type ChatMessage, type QuickReply } from '../../services/chat-service';
import { createDebouncer, createThrottler } from '../../utils/rate-limiter';
import { useConnectionStatus } from '../../components/ConnectionStatus';

// Simple error boundary for message content
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Message rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  quickReplies: QuickReply[];
  isProcessing: boolean;
  onAction: (action: string, data?: any) => void;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
}

// Icon mapping
const iconMap: Record<string, any> = {
  Check,
  Edit,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Rocket,
  Info,
  ArrowRight
};

export function SimpleChatInterface({
  messages,
  quickReplies,
  isProcessing,
  onAction,
  progress
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Connection monitoring
  const { isOnline, connectionQuality } = useConnectionStatus();
  
  // Create debounced and throttled versions of actions
  const debouncedTextInput = useRef(
    createDebouncer((text: string) => {
      onAction('text', text);
    }, 1000)
  ).current;
  
  const throttledButtonClick = useRef(
    createThrottler((action: string) => {
      handleButtonClickInternal(action);
    }, 500)
  ).current;
  
  // Determine input state
  const showSuggestionButtons = quickReplies.some(b => b.variant === 'suggestion');
  const showConfirmButtons = quickReplies.some(b => b.action === 'continue');
  const inputDisabled = isProcessing || showConfirmButtons;

  // Enhanced auto-scroll with performance optimization
  useEffect(() => {
    // Clear any pending scroll
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Debounce scroll for performance
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        const shouldScroll = isUserNearBottom();
        if (shouldScroll) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      }
    }, 100);
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);
  
  // Check if user is near bottom of scroll
  const isUserNearBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement;
    if (!container) {return true;}
    
    const threshold = 100; // pixels from bottom
    const position = container.scrollTop + container.clientHeight;
    const height = container.scrollHeight;
    
    return position > height - threshold;
  }, []);
  
  // Clear local error after timeout
  useEffect(() => {
    if (localError) {
      const timer = setTimeout(() => { setLocalError(null); }, 5000);
      return () => { clearTimeout(timer); };
    }
  }, [localError]);

  // Enhanced send with error handling
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isProcessing) {return;}
    
    const text = inputValue.trim();
    
    // Check connection
    if (!isOnline) {
      setLocalError('You\'re offline. Your message will be sent when connection is restored.');
      // Store for later sending
      storePendingMessage(text);
      return;
    }
    
    try {
      setPendingActions(prev => new Set(prev).add('text'));
      setInputValue(''); // Clear immediately for better UX
      
      await onAction('text', text);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputValue(text); // Restore input on error
      setLocalError('Failed to send message. Please try again.');
      
      // Attempt retry for network errors
      if (retryCount < 3 && isNetworkError(error)) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleSend();
        }, 1000 * Math.pow(2, retryCount));
      }
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete('text');
        return next;
      });
    }
  }, [inputValue, isProcessing, isOnline, onAction, retryCount]);

  // Enhanced button click with throttling
  const handleButtonClick = useCallback((action: string) => {
    if (isProcessing || pendingActions.has(action)) {return;}
    
    // Check if action is already pending
    if (pendingActions.has(action)) {
      console.log('Action already pending:', action);
      return;
    }
    
    console.log('Button clicked:', action);
    throttledButtonClick(action);
  }, [isProcessing, pendingActions, throttledButtonClick]);
  
  const handleButtonClickInternal = useCallback(async (action: string) => {
    if (!isOnline && !isOfflineCapableAction(action)) {
      setLocalError('This action requires an internet connection.');
      return;
    }
    
    try {
      setPendingActions(prev => new Set(prev).add(action));
      await onAction(action);
    } catch (error) {
      console.error(`Failed to process action ${action}:`, error);
      setLocalError(`Failed to process action. Please try again.`);
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete(action);
        return next;
      });
    }
  }, [isOnline, onAction]);

  // Enhanced card selection
  const handleCardSelect = useCallback(async (card: any) => {
    if (isProcessing || !card) {return;}
    
    try {
      setPendingActions(prev => new Set(prev).add('card_select'));
      await onAction('card_select', card);
    } catch (error) {
      console.error('Failed to select card:', error);
      setLocalError('Failed to select option. Please try again.');
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete('card_select');
        return next;
      });
    }
  }, [isProcessing, onAction]);

  // Render button with improved hierarchy
  const renderButton = (button: QuickReply) => {
    const Icon = button.icon ? (iconMap[button.icon] || null) : null;
    
    const getButtonClasses = () => {
      const base = "inline-flex items-center gap-2 font-medium transition-all duration-200";
      
      switch (button.variant) {
        case 'primary':
          return `${base} bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                  px-6 py-3 rounded-xl shadow-lg hover:shadow-xl 
                  transform hover:-translate-y-0.5`;
        case 'secondary':
          return `${base} bg-white dark:bg-gray-800 border-2 border-slate-300 dark:border-gray-600 
                  text-slate-700 dark:text-gray-200 px-6 py-3 rounded-xl 
                  hover:border-blue-400 hover:text-blue-700 dark:hover:border-blue-400`;
        case 'tertiary':
          return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  px-5 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600`;
        case 'suggestion':
          return `${base} bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 
                  text-slate-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm
                  hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 
                  dark:hover:bg-gray-700 dark:hover:border-blue-500`;
        default:
          return `${base} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                  px-4 py-2.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600`;
      }
    };
    
    return (
      <motion.button
        key={button.id}
        whileHover={{ scale: button.variant === 'primary' ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { handleButtonClick(button.action); }}
        disabled={isProcessing}
        className={`${getButtonClasses()} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {Icon && <Icon className={button.variant === 'suggestion' ? "w-4 h-4" : "w-5 h-5"} />}
        {button.label}
      </motion.button>
    );
  };

  // Get placeholder text based on state
  const getPlaceholderText = () => {
    if (isProcessing) {return "Coach is thinking...";}
    if (showConfirmButtons) {return "Choose an option above to continue";}
    if (messages.length === 1) {return "Type 'start' to begin...";}
    return "Share your ideas...";
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      {/* Progress Bar with Rounded Edges */}
      <div className="flex-shrink-0 pt-2">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-gray-800 dark:text-white">
                  Step {progress.current} of {progress.total}
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {progress.current <= 3 ? 'Ideation' : progress.current <= 6 ? 'Journey' : 'Deliverables'}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                {progress.percentage}% complete
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {localError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{localError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-4" onScroll={() => {
        // Track scroll position for auto-scroll logic
      }}>
        <div className="max-w-4xl mx-auto px-6 pb-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`
                    max-w-3xl px-6 py-4 rounded-2xl
                    ${message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                    }
                  `}>
                    {/* Wrap MessageContent in error boundary */}
                    <ErrorBoundary fallback={<div className="text-red-500">Error rendering message content</div>}>
                      <MessageContent content={message.content || ''} />
                    </ErrorBoundary>
                    
                    {/* Show idea cards if present */}
                    {message.metadata?.showCards && message.metadata?.cardOptions && (
                      <div className="mt-4">
                        <ErrorBoundary fallback={<div className="text-orange-500">Unable to display options. Please try again.</div>}>
                          <IdeaCardsV2
                            options={message.metadata.cardOptions}
                            onSelect={handleCardSelect}
                            isActive={isLastMessage && !isProcessing}
                            variant={message.metadata.cardType || 'ideas'}
                          />
                        </ErrorBoundary>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Enhanced Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-6 py-4"
            >
              <div className="flex gap-1">
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <motion.span 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
              </div>
              <span className="text-sm text-slate-500 dark:text-gray-400">
                Coach is crafting your personalized guidance...
              </span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0">
        <div className="max-w-4xl mx-auto px-6 pb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {/* Quick Reply Buttons */}
          {quickReplies.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {quickReplies.map(renderButton)}
            </div>
          )}
          
          {/* Text Input - always visible */}
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !inputDisabled) {
                  e.preventDefault();
                  handleSend();
                }
                // Note: Backspace navigation prevention is handled globally by useBackspaceNavigation hook
              }}
              placeholder={getPlaceholderText()}
              className={`flex-1 px-4 py-3 rounded-xl border 
                       ${inputDisabled 
                         ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' 
                         : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                       }
                       text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       resize-none min-h-[60px] max-h-[200px]
                       transition-all duration-200`}
              disabled={inputDisabled}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || inputDisabled || !isOnline}
              className={`self-end p-3 rounded-lg transition-all duration-200 relative
                       ${inputDisabled || !isOnline
                         ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                         : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                       }`}
              title={!isOnline ? 'No internet connection' : ''}
            >
              <Send className="w-5 h-5" />
              {pendingActions.has('text') && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function isNetworkError(error: any): boolean {
  const message = error?.message?.toLowerCase() || '';
  return message.includes('network') || 
         message.includes('fetch') || 
         message.includes('timeout') ||
         message.includes('connection');
}

function isOfflineCapableAction(action: string): boolean {
  // These actions can work offline
  const offlineActions = ['help', 'tellmore', 'refine'];
  return offlineActions.includes(action);
}

function storePendingMessage(message: string): void {
  try {
    const pending = JSON.parse(localStorage.getItem('pendingMessages') || '[]');
    pending.push({
      message,
      timestamp: Date.now(),
      id: `pending-${Date.now()}`
    });
    localStorage.setItem('pendingMessages', JSON.stringify(pending));
  } catch (error) {
    console.error('Failed to store pending message:', error);
  }
}
