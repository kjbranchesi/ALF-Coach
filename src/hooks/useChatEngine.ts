// useChatEngine.ts
// Reducer-based chat engine for messages, input, suggestions, and typing state.
// First pass: keep responsibilities minimal to integrate gradually.

import { useCallback, useEffect, useReducer, useRef } from 'react';

export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface State {
  messages: ChatMessage[];
  input: string;
  isTyping: boolean;
  showSuggestions: boolean;
}

type Action =
  | { type: 'set_input'; value: string }
  | { type: 'append_message'; message: ChatMessage }
  | { type: 'set_messages'; messages: ChatMessage[] }
  | { type: 'set_typing'; value: boolean }
  | { type: 'toggle_suggestions'; value?: boolean };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set_input':
      return { ...state, input: action.value };
    case 'append_message':
      return { ...state, messages: [...state.messages, action.message] };
    case 'set_messages':
      return { ...state, messages: action.messages };
    case 'set_typing':
      return { ...state, isTyping: action.value };
    case 'toggle_suggestions':
      return { ...state, showSuggestions: action.value ?? !state.showSuggestions };
    default:
      return state;
  }
}

export interface UseChatEngineOptions {
  initialMessages?: ChatMessage[];
}

export function useChatEngine(opts: UseChatEngineOptions = {}) {
  const [state, dispatch] = useReducer(reducer, {
    messages: opts.initialMessages || [],
    input: '',
    isTyping: false,
    showSuggestions: false,
  });

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const setInput = useCallback((v: string) => dispatch({ type: 'set_input', value: v }), []);
  const appendMessage = useCallback((m: ChatMessage) => dispatch({ type: 'append_message', message: m }), []);
  const setMessages = useCallback((arr: ChatMessage[]) => dispatch({ type: 'set_messages', messages: arr }), []);
  const setTyping = useCallback((v: boolean) => dispatch({ type: 'set_typing', value: v }), []);
  const toggleSuggestions = useCallback((v?: boolean) => dispatch({ type: 'toggle_suggestions', value: v }), []);

  // Convenience: clear input and reset DOM textarea height
  const clearInput = useCallback(() => {
    dispatch({ type: 'set_input', value: '' });
    try {
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.style.height = '20px';
      }
    } catch {}
  }, []);

  useEffect(() => {
    // Auto-focus hook helper (optional use by caller)
    if (inputRef.current) {
      inputRef.current.style.height = '20px';
    }
  }, []);

  return {
    state,
    inputRef,
    // state accessors
    messages: state.messages,
    input: state.input,
    isTyping: state.isTyping,
    showSuggestions: state.showSuggestions,
    // actions
    setInput,
    setMessages,
    appendMessage,
    setTyping,
    toggleSuggestions,
    clearInput,
  } as const;
}

export default useChatEngine;

