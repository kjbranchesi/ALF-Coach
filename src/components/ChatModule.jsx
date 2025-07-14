// src/components/ChatModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SparkleIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg> );
const GuideIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-700"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;

// --- Dynamic UI Sub-Components for Chat ---
const FrameworkOverview = ({ overviewData }) => {
    if (!overviewData) return null;
    return (
        <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">{overviewData.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{overviewData.introduction}</p>
            <div className="space-y-3">
                {overviewData.stages.map((stage, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold border-4 border-purple-100">{index + 1}</div>
                        <div>
                            <h4 className="font-semibold text-slate-800">{stage.title}</h4>
                            <p className="text-slate-600 text-sm">{stage.purpose}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SuggestionCard = ({ suggestion, onClick, disabled, icon, bgColor, borderColor, textColor, hoverColor }) => (
    <button
        onClick={() => onClick(suggestion)}
        disabled={disabled}
        className={`block w-full text-left p-4 my-2 ${bgColor} hover:${hoverColor} border-l-4 ${borderColor} rounded-r-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
    >
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">{icon}</div>
            <p className={`font-medium ${textColor}`}>{suggestion.replace(/^What if... /i, '')}</p>
        </div>
    </button>
);

const GuideSuggestions = ({ suggestions, onClick, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="mt-4">
            {suggestions.map((suggestion, i) => (
                <SuggestionCard
                    key={i}
                    suggestion={suggestion}
                    onClick={onClick}
                    disabled={disabled}
                    icon={<GuideIcon />}
                    bgColor="bg-green-50"
                    borderColor="border-green-500"
                    textColor="text-green-800"
                    hoverColor="bg-green-100"
                />
            ))}
        </div>
    );
};

const ProvocationSuggestions = ({ suggestions, onClick, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="mt-4">
            {suggestions.map((suggestion, i) => (
                <SuggestionCard
                    key={i}
                    suggestion={suggestion}
                    onClick={onClick}
                    disabled={disabled}
                    icon={<SparkleIcon className="w-5 h-5 text-yellow-600" />}
                    bgColor="bg-yellow-50"
                    borderColor="border-yellow-500"
                    textColor="text-yellow-800"
                    hoverColor="bg-yellow-100"
                />
            ))}
        </div>
    );
};

const ActionButtons = ({ buttons, onClick, disabled }) => {
    if (!buttons || buttons.length === 0) return null;
    return (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {buttons.map((buttonText, i) => (
                <button
                    key={i}
                    onClick={() => onClick(buttonText)}
                    disabled={disabled}
                    className="flex-1 text-left p-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all transform hover:scale-[1.01] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium text-slate-700"
                >
                    {buttonText}
                </button>
            ))}
        </div>
    );
};

export default function ChatModule({ messages, onSendMessage, onAdvanceStage, isAiLoading, currentStageConfig }) {
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isAiLoading && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [messages, isAiLoading]);

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
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            // A message is "stale" if it's not the most recent one from the AI.
            // We disable interactive elements on stale messages.
            const isStale = msg.role === 'assistant' && msg !== lastAiMessage;
            
            return (
              <div key={index} className={`flex items-start gap-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                  </div>
                )}
                
                <div className={`max-w-2xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-purple-600 text-white' : 'bg-white text-slate-800'}`}>
                  {msg.chatResponse && (
                    <div className="text-sm leading-relaxed prose prose-slate max-w-none">
                      <Remark remarkPlugins={[remarkGfm]}>{msg.chatResponse}</Remark>
                    </div>
                  )}
                  
                  {msg.interactionType === 'Welcome' && <ActionButtons buttons={msg.buttons} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                  {msg.interactionType === 'Framework' && <FrameworkOverview overviewData={msg.frameworkOverview} />}
                  {msg.interactionType === 'Guide' && <GuideSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                  {msg.interactionType === 'Provocation' && <ProvocationSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                </div>

                {isUser && (
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <UserIcon />
                  </div>
                )}
              </div>
            )
          })}
          {isAiLoading && (
            <div className="flex items-start gap-4 justify-start animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><BotIcon /></div>
              <div className="bg-white p-4 rounded-2xl shadow-md"><div className="flex items-center space-x-2"><div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse-fast"></div><div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse-fast [animation-delay:0.2s]"></div><div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse-fast [animation-delay:0.4s]"></div></div></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto">
            {isStageReadyToAdvance ? (
            <div className="text-center">
                <button onClick={onAdvanceStage} disabled={isAiLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 mx-auto disabled:bg-slate-400 transition-all transform hover:scale-105 shadow-lg">
                <SparkleIcon className="w-5 h-5" />
                Proceed to {currentStageConfig?.nextStage}
                </button>
            </div>
            ) : (
            <div className="flex items-center bg-slate-100 rounded-xl p-2 border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500">
                <textarea
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
                className="w-full bg-transparent focus:outline-none px-3 py-2 resize-none overflow-y-hidden leading-tight text-slate-800"
                rows="1"
                style={{maxHeight: '120px'}}
                disabled={isAiLoading}
                />
                <button onClick={handleLocalSendMessage} disabled={isAiLoading || !userInput.trim()} className="bg-purple-600 text-white p-3 rounded-lg disabled:bg-slate-300 self-end transition-colors shadow-sm hover:bg-purple-700">
                <SendIcon />
                </button>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}