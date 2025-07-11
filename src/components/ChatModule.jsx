// src/components/ChatModule.jsx

import React, { useState, useEffect, useRef } from 'react';

// --- Icon Components ---
const BotIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg> );
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> );
const SendIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" /></svg> );
const SparkleIcon = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/></svg> );

// --- Dynamic UI Sub-Components for Chat ---

// Renders the initial framework overview
const FrameworkOverview = ({ overviewData }) => {
    if (!overviewData) return null;
    return (
        <div className="mt-4 not-prose bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">{overviewData.title}</h3>
            <p className="text-sm text-slate-600 mb-4">{overviewData.introduction}</p>
            <div className="space-y-3">
                {overviewData.stages.map((stage, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold border-4 border-white">{index + 1}</div>
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

// Renders when the AI is in "Guide" mode, providing scaffolded help
const GuideSuggestions = ({ suggestions, onClick, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="mt-4 not-prose">
            {suggestions.map((suggestion, i) => (
                 <button
                    key={i}
                    onClick={() => onClick(suggestion)}
                    disabled={disabled}
                    className="block w-full text-left p-4 my-2 bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500 rounded-r-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <p className="font-semibold text-blue-800">{suggestion}</p>
                </button>
            ))}
        </div>
    );
};

// Renders when the AI is in "Provocation" mode
const ProvocationSuggestions = ({ suggestions, onClick, disabled }) => {
    if (!suggestions || suggestions.length === 0) return null;
    return (
        <div className="mt-4 not-prose">
            {suggestions.map((suggestion, i) => (
                <button
                    key={i}
                    onClick={() => onClick(suggestion)}
                    disabled={disabled}
                    className="block w-full text-left p-4 my-2 bg-amber-100 hover:bg-amber-200 border-l-4 border-amber-500 rounded-r-lg transition-all transform hover:scale-[1.02] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1">
                            <SparkleIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <p className="text-amber-800">{suggestion.replace(/^What if... /i, '')}</p>
                    </div>
                </button>
            ))}
        </div>
    );
};

// ... other sub-components like ProcessSteps, RecapMessage, etc. can remain as they are ...

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
    <div className="flex flex-col h-full bg-gray-50/50">
      <div className="flex-grow p-4 md:p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            
            return (
              <div key={index} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                  </div>
                )}
                
                <div className={`prose prose-sm max-w-xl p-4 rounded-2xl shadow-sm ${isUser ? 'bg-purple-600 text-white prose-invert' : 'bg-white'}`}>
                  {msg.chatResponse && <div dangerouslySetInnerHTML={{ __html: msg.chatResponse.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                  
                  {/* Render UI based on interactionType */}
                  {msg.interactionType === 'Framework' && <FrameworkOverview overviewData={msg.frameworkOverview} />}
                  {msg.interactionType === 'Guide' && <GuideSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading} />}
                  {msg.interactionType === 'Provocation' && <ProvocationSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading} />}
                  
                  {/* Other components can be added here as needed */}

                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <UserIcon />
                  </div>
                )}
              </div>
            )
          })}
          {isAiLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><BotIcon /></div>
              <div className="bg-white p-4 rounded-2xl"><div className="flex items-center space-x-2"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse [animation-delay:0.4s]"></div></div></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="p-4 border-t bg-white flex-shrink-0">
        {isStageReadyToAdvance ? (
          <div className="pb-4 text-center">
            <button onClick={onAdvanceStage} disabled={isAiLoading} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 mx-auto disabled:bg-gray-400 transition-all transform hover:scale-105">
              <SparkleIcon className="w-5 h-5" />
              Proceed to {currentStageConfig?.nextStage}
            </button>
          </div>
        ) : (
          <div className="flex items-center bg-gray-100 rounded-xl p-2">
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
              placeholder="Share your thoughts..."
              className="w-full bg-transparent focus:outline-none px-2 resize-none overflow-y-hidden leading-tight"
              rows="1"
              style={{maxHeight: '100px'}}
              disabled={isAiLoading}
            />
            <button onClick={handleLocalSendMessage} disabled={isAiLoading || !userInput.trim()} className="bg-purple-600 text-white p-2 rounded-lg disabled:bg-gray-300 self-end">
              <SendIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
