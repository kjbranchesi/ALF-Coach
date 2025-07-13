// src/components/ChatModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import { Bot, User, Send, Sparkles, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';

// --- Sub-components for different AI message types ---

const SuggestionCard = ({ suggestion, onClick, disabled, icon, bgColor, borderColor, textColor, hoverColor }) => (
    <motion.button
        onClick={() => onClick(suggestion)}
        disabled={disabled}
        className={`block w-full text-left p-4 my-2 ${bgColor} hover:${hoverColor} border-l-4 ${borderColor} rounded-r-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">{icon}</div>
            <p className={`font-medium ${textColor}`}>{suggestion.replace(/^What if... /i, '')}</p>
        </div>
    </motion.button>
);

const GuideSuggestions = ({ suggestions, onClick, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="mt-4 not-prose">
            <h4 className="text-sm font-semibold text-neutral-600 mb-2">Here are a few paths we can explore:</h4>
            {suggestions.map((suggestion, i) => (
                <SuggestionCard
                    key={i}
                    suggestion={suggestion}
                    onClick={onClick}
                    disabled={disabled}
                    icon={<Compass className="w-5 h-5 text-secondary-700" />}
                    bgColor="bg-secondary-50"
                    borderColor="border-secondary-500"
                    textColor="text-secondary-800"
                    hoverColor="bg-secondary-100"
                />
            ))}
        </div>
    );
};

const ProvocationSuggestions = ({ suggestions, onClick, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="mt-4 not-prose">
             <h4 className="text-sm font-semibold text-neutral-600 mb-2">To make this truly innovative, consider these:</h4>
            {suggestions.map((suggestion, i) => (
                <SuggestionCard
                    key={i}
                    suggestion={suggestion}
                    onClick={onClick}
                    disabled={disabled}
                    icon={<Sparkles className="w-5 h-5 text-accent-600" />}
                    bgColor="bg-accent-50"
                    borderColor="border-accent-500"
                    textColor="text-accent-800"
                    hoverColor="bg-accent-100"
                />
            ))}
        </div>
    );
};


// --- Main ChatModule Component ---

export default function ChatModule({ messages, onSendMessage, onAdvanceStage, isAiLoading, currentStageConfig }) {
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  const handleLocalSendMessage = () => {
      if (!userInput.trim()) return;
      onSendMessage(userInput);
      setUserInput('');
  }
  
  const lastAiMessage = messages.filter(m => m.role === 'assistant').pop();
  const isStageReadyToAdvance = lastAiMessage?.isStageComplete === true;

  return (
    <div className="flex flex-col h-full bg-neutral-100">
      {/* Message Display Area */}
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 border-2 border-white">
                      <Bot className="w-5 h-5 text-primary-600" />
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-xl p-4 rounded-xl shadow-md ${isUser ? 'bg-primary-600 text-white prose-invert' : 'bg-white text-neutral-800'}`}>
                    <Remark remarkPlugins={[remarkGfm]}>{msg.chatResponse || ''}</Remark>
                    {msg.interactionType === 'Guide' && <GuideSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading} />}
                    {msg.interactionType === 'Provocation' && <ProvocationSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading} />}
                  </div>
                  {isUser && (
                    <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 border-2 border-white">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
          {isAiLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0 border-2 border-white"><Bot className="w-5 h-5 text-primary-600" /></div>
              <div className="bg-white p-4 rounded-xl shadow-md"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-fast"></div><div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-fast [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-fast [animation-delay:0.4s]"></div></div></div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto">
            {isStageReadyToAdvance ? (
            <div className="text-center">
                <Button onClick={onAdvanceStage} disabled={isAiLoading} size="lg" variant="secondary">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Proceed to {currentStageConfig?.nextStage}
                </Button>
            </div>
            ) : (
            <div className="flex items-center bg-white rounded-xl p-2 border border-neutral-300 focus-within:ring-2 focus-within:ring-primary-500">
                <Textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleLocalSendMessage();
                      }
                  }}
                  placeholder="Share your thoughts, or ask for help..."
                  className="w-full bg-transparent focus:outline-none border-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                  rows="1"
                  style={{maxHeight: '120px'}}
                  disabled={isAiLoading}
                />
                <Button onClick={handleLocalSendMessage} disabled={isAiLoading || !userInput.trim()} size="icon" className="flex-shrink-0">
                  <Send className="w-5 h-5" />
                </Button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}
