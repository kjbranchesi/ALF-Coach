// src/components/ChatModule.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';
import PedagogicalRationale from './PedagogicalRationale.jsx';
import GuestSpeakerHints from './GuestSpeakerHints.jsx';
import CommunityEngagement from './CommunityEngagement.jsx';
import RubricGenerator from './RubricGenerator.jsx';
import FrameworkOverview from './FrameworkOverview.jsx';
import { Bot, User, Send, Sparkles, CheckCircle } from 'lucide-react';
import { isDevelopment, isDebugEnabled } from '../utils/environment.js';

// --- Icon Components ---
// Using lucide-react icons with consistent styling
const BotIcon = () => <Bot className="w-6 h-6 text-purple-600 icon-float" />;
const UserIcon = () => <User className="w-6 h-6 text-white" />;
const SendIcon = () => <Send className="w-5 h-5 icon-hover-pulse" />;
const SparkleIcon = ({ className }) => <Sparkles className={`${className || "w-5 h-5"} icon-sparkle`} />;
const GuideIcon = () => <CheckCircle className="w-5 h-5 text-green-700 icon-pulse" />;

// --- Dynamic UI Sub-Components for Chat ---
const LegacyFrameworkOverview = ({ overviewData }) => {
    if (!overviewData) {return null;}
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

// Comprehensive ProjectCraft Method Overview for Chat Integration
const ProjectCraftMethodOverview = () => {
    return (
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="space-y-4 text-sm text-purple-800">
                <div>
                    <h4 className="font-semibold mb-2 text-purple-900">What is ProjectCraft?</h4>
                    <p>
                        ProjectCraft uses the Active Learning Framework (ALF) to guide you through creating 
                        meaningful, authentic learning experiences that engage students in real-world problem-solving.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-semibold mb-2 text-purple-900">The Three Stages:</h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                            <div>
                                <strong>Ideation:</strong> Define your Big Idea and Challenge that drives authentic learning
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                            <div>
                                <strong>Curriculum:</strong> Build the learning journey with scaffolded activities
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-5 h-5 bg-purple-600 text-white rounded-full text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                            <div>
                                <strong>Assignments:</strong> Create authentic assessments that mirror real-world work
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-semibold mb-2 text-purple-900">Why This Approach Works:</h4>
                    <p>
                        By starting with authentic challenges and building backwards, we ensure every activity 
                        serves a clear purpose and prepares students for meaningful demonstration of their learning.
                    </p>
                </div>
            </div>
        </div>
    );
};

const ProcessOverview = ({ processData }) => {
    if (!processData) {return null;}
    return (
        <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">{processData.title}</h3>
            <div className="space-y-3">
                {processData.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 mt-1 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">{index + 1}</div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-slate-800">{step.title}</h4>
                            <p className="text-slate-600 text-sm mt-1">{step.description}</p>
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
    if (!suggestions || suggestions.length === 0) {return null;}
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
    if (!suggestions || suggestions.length === 0) {return null;}
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
    if (!buttons || buttons.length === 0) {return null;}
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

export default function ChatModule({ messages, onSendMessage, onAdvanceStage, isAiLoading, currentStageConfig, projectInfo }) {
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
      if (!userInput.trim()) {return;}
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
            const isStale = msg.role === 'assistant' && msg !== lastAiMessage;
            
            return (
              <div key={index} className={`flex items-start gap-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                  </div>
                )}
                
                <div className={`max-w-2xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-purple-600 text-white' : 'bg-white text-slate-800'}`}>
                  {!isUser && (isDevelopment() || isDebugEnabled()) && (
                    <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mb-2 border border-blue-200">
                      🔍 DEBUG: interactionType = "{msg.interactionType}" | currentStage = "{msg.currentStage}" | turn = {msg.turnNumber}
                    </div>
                  )}
                  {msg.chatResponse && (
                    <div className="text-sm leading-relaxed prose prose-slate max-w-none">
                      <Remark remarkPlugins={[remarkGfm]}>{msg.chatResponse}</Remark>
                    </div>
                  )}
                  
                  {/* FIX: This now renders buttons for Standard, Welcome, and Framework interaction types */}
                  {(msg.interactionType === 'Standard' || msg.interactionType === 'Welcome') && msg.buttons && <ActionButtons buttons={msg.buttons} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                  
                  {msg.interactionType === 'Framework' && (
                    <>
                      {(isDevelopment() || isDebugEnabled()) && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-3 text-sm">
                          ⚠️ DEBUG: Legacy Framework detected! Using old LegacyFrameworkOverview...
                        </div>
                      )}
                      <LegacyFrameworkOverview overviewData={msg.frameworkOverview} />
                      {msg.buttons && <ActionButtons buttons={msg.buttons} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                    </>
                  )}
                  
                  {msg.interactionType === 'ProjectCraftMethod' && (
                    <>
                      {(isDevelopment() || isDebugEnabled()) && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
                          ✅ DEBUG: ProjectCraftMethod detected! Rendering Framework Overview...
                        </div>
                      )}
                      <FrameworkOverview isExpanded={true} />
                      {msg.buttons && <ActionButtons buttons={msg.buttons} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                    </>
                  )}
                  {msg.interactionType === 'Guide' && (
                    <>
                      {msg.process && <ProcessOverview processData={msg.process} />}
                      {msg.suggestions && <GuideSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                    </>
                  )}
                  {msg.interactionType === 'Provocation' && <ProvocationSuggestions suggestions={msg.suggestions} onClick={onSendMessage} disabled={isAiLoading || isStale} />}
                  
                  {/* Sprint 2-4 Components Integration - Show only when contextually relevant */}
                  {!isUser && !isStale && (
                    <div className="space-y-3 mt-4">
                      {/* Show pedagogical rationale only with Guide interaction type that has suggestions */}
                      {msg.interactionType === 'Guide' && msg.suggestions && msg.suggestions.length > 0 && (
                        <PedagogicalRationale 
                          ageGroup={projectInfo?.ageGroup}
                          suggestion={msg.suggestions[0]}
                          isVisible={true}
                        />
                      )}
                      
                      {/* Show guest speaker hints only with Guide interaction type */}
                      {msg.interactionType === 'Guide' && msg.guestSpeakerHints && (
                        <GuestSpeakerHints 
                          hints={msg.guestSpeakerHints}
                          subject={projectInfo?.subject}
                          isVisible={true}
                        />
                      )}
                      
                      {/* Show community engagement ideas only for Curriculum and Assignments stages */}
                      {(msg.currentStage === 'Curriculum' || msg.currentStage === 'Assignments') && (
                        <CommunityEngagement 
                          currentStage={msg.currentStage}
                          subject={projectInfo?.subject}
                          isVisible={true}
                        />
                      )}
                      
                      {/* Show rubric generator for assignments stage */}
                      {msg.currentStage === 'Assignments' && msg.newAssignment && (
                        <RubricGenerator 
                          assignment={msg.newAssignment}
                          ageGroup={projectInfo?.ageGroup}
                          onRubricGenerated={(rubric) => {
                            if (isDevelopment() || isDebugEnabled()) {
                              console.log('Rubric generated:', rubric);
                            }
                          }}
                        />
                      )}
                    </div>
                  )}
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