/**
 * StageAIAssistant - Reusable AI assistant panel for stage-separated builder
 *
 * Provides suggestion chips and compact chat interface.
 * Adapts to desktop (right sidebar) and mobile (collapsible drawer).
 *
 * Feature flag: VITE_FEATURE_STAGE_ASSISTANT=true
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Send, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStageAI } from '../hooks/useStageAI';
import { SuggestionChips } from '../../chat-mvp/components/SuggestionChips';
import { trackEvent } from '../../../utils/analytics';

type StageId = 'ideation' | 'journey' | 'deliverables';
type IdeationField = 'bigIdea' | 'essentialQuestion' | 'challenge';

interface StageAIAssistantProps {
  stage: StageId;
  currentData: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
    wizard?: any;
    phases?: any[]; // For journey stage
  };
  onAccept: (field: IdeationField, text: string) => void;
  onQuickActionResult?: (result: any) => void; // Handle Quick Action results
  collapsed?: boolean;
  onToggle?: (open: boolean) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export function StageAIAssistant({
  stage,
  currentData,
  onAccept,
  onQuickActionResult,
  collapsed = false,
  onToggle
}: StageAIAssistantProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedPhaseForAction, setSelectedPhaseForAction] = useState<string>('0');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    isAIAvailable,
    suggestions,
    loading,
    error,
    healthChecking,
    checkAIHealth,
    sendMessage,
    quickActions,
    actionExecuting,
    executeAction
  } = useStageAI({
    stage,
    currentData
  });

  // Track panel open/close
  useEffect(() => {
    if (!isCollapsed) {
      trackEvent('assistant_opened', { stage });
    } else {
      trackEvent('assistant_closed', { stage });
    }
  }, [isCollapsed, stage]);

  // Track suggestions shown
  useEffect(() => {
    if (suggestions.length > 0) {
      trackEvent('ai_suggestions_shown', {
        stage,
        source: isAIAvailable ? 'ai' : 'static',
        count: suggestions.length
      });
    }
  }, [suggestions, stage, isAIAvailable]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Track AI gate shown
  useEffect(() => {
    if (!isCollapsed && !isAIAvailable && !healthChecking) {
      trackEvent('ai_gate_shown', { stage, error });
    }
  }, [isCollapsed, isAIAvailable, healthChecking, stage, error]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onToggle?.(newState);
  };

  const handleSuggestionSelect = (text: string, index: number) => {
    // Determine which field to fill based on current state
    let targetField: IdeationField = 'bigIdea';
    if (currentData.bigIdea && !currentData.essentialQuestion) {
      targetField = 'essentialQuestion';
    } else if (currentData.essentialQuestion && !currentData.challenge) {
      targetField = 'challenge';
    }

    trackEvent('ai_suggestion_accepted', {
      stage,
      target: targetField,
      index
    });

    onAccept(targetField, text);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || sendingMessage) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev.slice(-3), userMessage]);
    setChatInput('');
    setSendingMessage(true);

    try {
      const response = await sendMessage(chatInput);

      if (response) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          text: response,
          timestamp: new Date()
        };

        setChatMessages(prev => [...prev.slice(-3), assistantMessage]);
      }
    } catch (error) {
      console.error('[StageAIAssistant] Send message failed', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRetry = async () => {
    trackEvent('ai_gate_retry', { stage });
    const success = await checkAIHealth();
    if (success) {
      trackEvent('ai_health_recovered', { stage });
    }
  };

  const handleDiagnostics = () => {
    trackEvent('ai_diagnostics_opened', { stage });
    console.group('🔍 AI Diagnostics');
    console.log('Feature Enabled:', import.meta.env.VITE_FEATURE_STAGE_ASSISTANT);
    console.log('Gemini Enabled:', import.meta.env.VITE_GEMINI_ENABLED);
    console.log('AI Available:', isAIAvailable);
    console.log('Error:', error);
    console.groupEnd();
  };

  const handleQuickAction = async (actionId: string, requiresInput?: boolean) => {
    try {
      const params = requiresInput ? { phaseIndex: selectedPhaseForAction } : undefined;
      const result = await executeAction(actionId, params);

      if (result && onQuickActionResult) {
        onQuickActionResult(result);
      }
    } catch (error) {
      console.error('[StageAIAssistant] Quick Action failed:', error);
      // Could show a toast here in the future
    }
  };

  // Don't render if feature disabled
  if (import.meta.env.VITE_FEATURE_STAGE_ASSISTANT !== 'true') {
    return null;
  }

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-lg">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-xl"
        aria-expanded={!isCollapsed}
        aria-controls="ai-assistant-panel"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-50">
            AI Assistant
          </span>
          {loading && (
            <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div id="ai-assistant-panel" className="px-4 pb-4 space-y-4">
          {/* AI Unavailable Gate - Blocking */}
          {!isAIAvailable && (
            <div className="space-y-4 py-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-1">
                    AI Assistant Unavailable
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {error || 'AI is required to use this feature'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleRetry}
                  disabled={healthChecking}
                  className="w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {healthChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Retry Connection'
                  )}
                </button>

                <Link
                  to="/app/setup/ai"
                  onClick={() => trackEvent('ai_setup_opened', { stage, source: 'gate' })}
                  className="block w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-50 font-medium text-center transition-colors"
                >
                  AI Setup
                </Link>

                <button
                  onClick={handleDiagnostics}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition-colors"
                >
                  Show Diagnostics
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                This app requires AI to function. Please configure your AI settings to continue.
              </div>
            </div>
          )}

          {/* AI Available - Normal Content */}
          {isAIAvailable && (
            <>
              {/* Quick Actions Section */}
              {quickActions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Quick Actions
                  </p>
                  {quickActions.map(action => (
                    <div key={action.id} className="space-y-2">
                      {action.requiresInput && action.inputOptions && (
                        <select
                          value={selectedPhaseForAction}
                          onChange={(e) => setSelectedPhaseForAction(e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {action.inputOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => handleQuickAction(action.id, action.requiresInput)}
                        disabled={actionExecuting === action.id}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        {actionExecuting === action.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <span>{action.label}</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions Section */}
              {suggestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Suggestions
                  </p>
                  <SuggestionChips
                    items={suggestions}
                    onSelect={handleSuggestionSelect}
                  />
                </div>
              )}

              {/* Chat Section */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Ask Assistant
                </p>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {chatMessages.slice(-4).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`text-sm p-2 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 ml-4'
                            : 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 mr-4'
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={sendingMessage}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || sendingMessage}
                    className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>

              {/* Loading State */}
              {loading && suggestions.length === 0 && (
                <div className="flex items-center justify-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Loading suggestions...
                </div>
              )}

              {/* No Suggestions State */}
              {!loading && suggestions.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-500 dark:text-slate-400">
                  Complete the fields to see suggestions
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
