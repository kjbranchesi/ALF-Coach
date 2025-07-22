import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { 
  SendIcon, 
  SparklesIcon,
  LightbulbIcon,
  ArrowRightIcon
} from '../../components/icons/ButtonIcons';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface ChatProps {
  wizardData: WizardData;
  blueprintId: string;
  chatHistory: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
  onComplete: () => void;
}

const SYSTEM_PROMPT = `You are ProjectCraft Coach, an expert educational AI assistant specializing in project-based learning design. You help educators create engaging, authentic learning experiences tailored to their students' needs.

Your role is to guide educators through creating a comprehensive project blueprint that includes:
1. A compelling Big Idea that anchors the project
2. An Essential Question that drives inquiry
3. An authentic Challenge for students to tackle
4. Well-structured project phases with activities
5. Resources and assessment strategies
6. Community impact plans

Guidelines:
- Be encouraging and supportive
- Provide 2-3 personalized suggestions based on the educator's context
- Use clear, professional language
- Keep responses concise but helpful
- Always consider the educator's subject, age group, location, and available materials
- When providing suggestions, format them as [SUGGESTIONS: suggestion1, suggestion2, suggestion3]

Start by analyzing the educator's context and suggesting 3 Big Ideas for their project.`;

export function Chat({ wizardData, blueprintId, chatHistory, onUpdateHistory, onComplete }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const { sendMessage, isStreaming } = useGeminiStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize conversation on mount
  useEffect(() => {
    if (messages.length === 0) {
      initializeConversation();
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newRows = Math.min(Math.max(Math.ceil(scrollHeight / 24), 1), 5);
      setTextareaRows(newRows);
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const initializeConversation = async () => {
    // Create system message
    const systemMessage: ChatMessage = {
      id: 'system-1',
      role: 'system',
      content: SYSTEM_PROMPT,
      timestamp: new Date(),
    };

    // Create user message with wizard data
    const userMessage: ChatMessage = {
      id: 'user-1',
      role: 'user',
      content: `Here's my teaching context: ${JSON.stringify({
        motivation: wizardData.motivation,
        subject: wizardData.subject,
        ageGroup: wizardData.ageGroup,
        location: wizardData.location || 'Not specified',
        materials: wizardData.materials || 'Standard classroom materials',
        scope: wizardData.scope
      }, null, 2)}`,
      timestamp: new Date(),
    };

    // Send to Gemini
    try {
      const response = await sendMessage([
        { role: 'system', parts: systemMessage.content },
        { role: 'user', parts: userMessage.content }
      ]);

      const assistantMessage: ChatMessage = {
        id: 'assistant-1',
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      const initialHistory = [systemMessage, userMessage, assistantMessage];
      setMessages(initialHistory);
      onUpdateHistory(initialHistory);
    } catch (error) {
      console.error('Error initializing conversation:', error);
      // Show error message
      const errorMessage: ChatMessage = {
        id: 'error-1',
        role: 'assistant',
        content: 'I apologize, but I encountered an error starting our conversation. Please refresh the page to try again.',
        timestamp: new Date(),
      };
      setMessages([systemMessage, userMessage, errorMessage]);
    }
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      // Prepare messages for Gemini (include system prompt)
      const geminiMessages = updatedMessages
        .filter(msg => msg.role !== 'assistant' || !msg.content.includes('I apologize'))
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: msg.content
        }));

      const response = await sendMessage(geminiMessages);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        suggestions: response.suggestions
      };

      const finalHistory = [...updatedMessages, assistantMessage];
      setMessages(finalHistory);
      onUpdateHistory(finalHistory);

      // Check if project is complete
      if (response.text.toLowerCase().includes('blueprint is complete')) {
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      const errorHistory = [...updatedMessages, errorMessage];
      setMessages(errorHistory);
      onUpdateHistory(errorHistory);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    // Auto-send after a brief delay for better UX
    setTimeout(() => {
      handleSendMessage(suggestion);
    }, 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-t-xl shadow-sm p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Blueprint Builder Chat</h1>
            <p className="text-sm text-slate-600 mt-1">
              Let's design your {wizardData.subject} {wizardData.scope} together
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">AI-Powered</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6 space-y-4">
        <AnimatePresence initial={false}>
          {messages.filter(msg => msg.role !== 'system').map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`max-w-[70%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div className={`
                  rounded-2xl px-5 py-3 shadow-sm
                  ${message.role === 'user' 
                    ? 'bg-blue-600/90 text-white' 
                    : 'bg-white border border-gray-100'
                  }
                `}>
                  <p className={`whitespace-pre-wrap ${message.role === 'assistant' ? 'text-gray-800' : ''}`}>
                    {message.content}
                  </p>
                </div>
                
                {/* Quick-reply suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    {message.suggestions.map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isStreaming}
                        className="
                          inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-gradient-to-r from-blue-50 to-purple-50 
                          hover:from-blue-100 hover:to-purple-100
                          text-blue-700 text-sm font-medium
                          border border-blue-200 hover:border-blue-300
                          transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed
                          shadow-sm hover:shadow-md
                        "
                      >
                        <LightbulbIcon className="w-4 h-4" />
                        {suggestion}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center order-2 shadow-md">
                  <span className="text-sm font-bold text-gray-700">
                    {wizardData.subject.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Streaming indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg animate-pulse">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-4 h-4 text-purple-600" />
                </motion.div>
                <span className="text-gray-600 text-sm">Crafting your personalized response...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4 rounded-b-xl shadow-lg">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isStreaming}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={textareaRows}
            className="
              flex-1 px-4 py-3 rounded-xl border-2 border-gray-200
              focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
              disabled:bg-gray-50 disabled:text-gray-500
              transition-all duration-200 resize-none
              text-gray-800 placeholder-gray-400
            "
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="
              px-5 py-3 rounded-xl
              bg-gradient-to-r from-blue-600 to-purple-600 text-white
              hover:from-blue-700 hover:to-purple-700
              disabled:from-gray-300 disabled:to-gray-400
              disabled:cursor-not-allowed transition-all duration-200
              shadow-md hover:shadow-lg
              flex items-center gap-2 self-end
            "
          >
            {isStreaming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <SparklesIcon className="w-5 h-5" />
              </motion.div>
            ) : (
              <SendIcon className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}