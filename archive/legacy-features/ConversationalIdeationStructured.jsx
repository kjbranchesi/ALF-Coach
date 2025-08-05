// ConversationalIdeationStructured.jsx - Structured conversation with clear decision tree

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBlueprint } from '../../context/BlueprintContext';
import { ConversationFlowManager, ConversationStates, ActionCards } from './ConversationFlowManager';
import UnifiedSuggestionCard from '../../components/UnifiedSuggestionCard';
import IdeationProgress from './IdeationProgress';
import { renderMarkdown } from '../../lib/markdown.ts';
import { Sparkles, Edit, RefreshCw, X } from 'lucide-react';
import { generateJsonResponse } from '../../services/geminiService';

// Icons
const Icons = {
  ProjectCraft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
};

// Example Card Component
const ExampleCard = ({ example, onSelect, index }) => (
  <motion.button
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white border border-blue-200 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer text-left w-full"
    onClick={(e) => {
      e.preventDefault();
      console.log('[DEBUG] ExampleCard clicked:', example.text);
      console.log('[DEBUG] onSelect exists:', !!onSelect);
      if (onSelect) {
        onSelect(example.text);
      } else {
        console.error('[ERROR] No onSelect handler!');
      }
    }}
  >
    <h4 className="font-bold text-gray-900 mb-3 text-lg">{example.text}</h4>
    {example.description && (
      <p className="text-base text-gray-600 leading-relaxed">{example.description}</p>
    )}
    {example.focus && (
      <p className="text-sm text-blue-600 mt-3 italic font-medium">{example.focus}</p>
    )}
    {example.outcome && (
      <p className="text-sm text-green-600 mt-3 font-medium">→ {example.outcome}</p>
    )}
  </motion.button>
);

// What-If Card Component
const WhatIfCard = ({ whatif, onSelect, index }) => (
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ scale: 1.02, x: 5 }}
    whileTap={{ scale: 0.98 }}
    className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer text-left w-full"
    onClick={(e) => {
      e.preventDefault();
      console.log('[DEBUG] WhatIfCard clicked:', whatif.text);
      console.log('[DEBUG] onSelect exists:', !!onSelect);
      if (onSelect) {
        onSelect(whatif.text);
      } else {
        console.error('[ERROR] No onSelect handler!');
      }
    }}
  >
    <div className="flex items-start gap-3">
      <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold text-gray-900 mb-2 text-lg">{whatif.text}</h4>
        {whatif.impact && (
          <p className="text-base text-amber-700 font-medium">{whatif.impact}</p>
        )}
      </div>
    </div>
  </motion.button>
);

// Message Component
const Message = ({ message, isUser }) => {
  if (!message || typeof message !== 'object') {return null;}

  const content = message.content || message.chatResponse || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      {!isUser ? (
        <motion.div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Icons.ProjectCraft />
        </motion.div>
      ) : (
        <motion.div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          <Icons.User />
        </motion.div>
      )}

      {/* Message Content */}
      <motion.div className={`flex-1 max-w-3xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-3xl px-6 py-5 ${
          isUser 
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-soft-xl' 
            : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-soft-lg border border-gray-100/50'
        }`}>
          {isUser ? (
            <p className="text-white">{content}</p>
          ) : (
            <div 
              className="prose prose-sm max-w-none prose-slate"
              dangerouslySetInnerHTML={renderMarkdown(String(content))}
            />
          )}
        </div>

        {/* Examples */}
        {message.examples && (
          <div className="mt-4 space-y-3 w-full">
            {message.examples.map((example, i) => (
              <ExampleCard 
                key={i} 
                example={example} 
                onSelect={message.onSelect}
                index={i}
              />
            ))}
            {/* Create My Own button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: message.examples.length * 0.1 }}
              className="w-full p-6 border-2 border-dashed border-blue-300 rounded-2xl hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white transition-all text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
              onClick={(e) => {
                e.preventDefault();
                console.log('[DEBUG] Create My Own button clicked');
                console.log('[DEBUG] message.onCardClick exists:', !!message.onCardClick);
                if (message.onCardClick) {
                  message.onCardClick('Create My Own');
                } else {
                  console.error('[ERROR] No onCardClick handler on message!');
                }
              }}
            >
              <Edit className="w-5 h-5" />
              Create My Own
            </motion.button>
          </div>
        )}

        {/* What-Ifs */}
        {message.whatifs && (
          <div className="mt-4 space-y-3 w-full">
            {message.whatifs.map((whatif, i) => (
              <WhatIfCard 
                key={i} 
                whatif={whatif} 
                onSelect={message.onSelect}
                index={i}
              />
            ))}
            {/* More Ideas button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: message.whatifs.length * 0.1 }}
              className="w-full p-6 border-2 border-dashed border-amber-300 rounded-2xl hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-50 hover:to-white transition-all text-amber-700 hover:text-amber-800 font-medium flex items-center justify-center gap-2 shadow-soft hover:shadow-soft-lg"
              onClick={(e) => {
                e.preventDefault();
                console.log('[DEBUG] More Ideas button clicked');
                console.log('[DEBUG] message.onCardClick exists:', !!message.onCardClick);
                if (message.onCardClick) {
                  message.onCardClick('More Ideas Aligned to My Context');
                } else {
                  console.error('[ERROR] No onCardClick handler on message!');
                }
              }}
            >
              <RefreshCw className="w-5 h-5" />
              More Ideas Aligned to My Context
            </motion.button>
          </div>
        )}

        {/* Action Cards */}
        {message.cards && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.cards.map((card, i) => {
              return (
                <UnifiedSuggestionCard
                  key={i}
                  text={card.text}
                  type={card.type}
                  icon={card.icon}
                  onClick={() => {
                    console.log('[DEBUG] UnifiedSuggestionCard clicked:', card.text);
                    console.log('[DEBUG] message.onCardClick exists:', !!message.onCardClick);
                    
                    if (message.onCardClick) {
                      message.onCardClick(card.text);
                    } else {
                      console.error('[ERROR] No onCardClick handler on message!');
                    }
                  }}
                  fullWidth={false}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Main Component
const ConversationalIdeationStructured = ({ projectInfo, onComplete, onCancel }) => {
  const { blueprint, updateIdeation } = useBlueprint();
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [flowManager, setFlowManager] = useState(null);
  
  const chatEndRef = useRef(null);
  const ideationData = blueprint.ideation;
  
  // Create a ref to store the handler to avoid closure issues
  const handleCardActionRef = useRef(null);

  // Store handleCardAction in ref to avoid stale closures
  handleCardActionRef.current = async (cardText) => {
    console.log('[DEBUG] handleCardAction called with:', cardText);
    console.log('[DEBUG] flowManager exists:', !!flowManager);
    console.log('[DEBUG] Current state:', flowManager?.currentState);
    
    if (!flowManager) {
      console.error('[ERROR] No flowManager available!');
      return;
    }

    // Special handling for "More Ideas" - don't add as user message
    const isMoreIdeasRequest = cardText === 'More Ideas Aligned to My Context';
    
    if (!isMoreIdeasRequest) {
      // For action cards (See Examples, What-Ifs, etc), we want to hide the intro message
      // and only show the new content
      const isActionCard = ['See Examples', 'Explore What-Ifs', 'Why This Matters'].includes(cardText);
      
      if (isActionCard) {
        // Remove the last assistant message (the intro with cards)
        setMessages(prev => {
          const filtered = [...prev];
          // Find the last assistant message with cards
          for (let i = filtered.length - 1; i >= 0; i--) {
            if (filtered[i].role === 'assistant' && filtered[i].cards) {
              filtered.splice(i, 1);
              break;
            }
          }
          return filtered;
        });
      } else {
        // Add user message for other actions
        setMessages(prev => {
          console.log('[DEBUG] Adding user message to messages array');
          return [...prev, {
            role: 'user',
            content: cardText,
            timestamp: Date.now()
          }];
        });
      }
    }

    setIsAiLoading(true);

    // Transition state
    const newState = flowManager.transitionState(cardText);
    const response = flowManager.getStateResponse(newState, { ...ideationData });

    // Create assistant message with appropriate handlers
    const assistantMessage = {
      role: 'assistant',
      content: response.message,
      timestamp: Date.now()
    };

    // Add examples with selection handler
    if (response.examples) {
      assistantMessage.examples = response.examples;
      assistantMessage.onSelect = (selected) => handleExampleSelection(selected);
    }

    // Add what-ifs with selection handler
    if (response.whatifs) {
      assistantMessage.whatifs = response.whatifs;
      assistantMessage.onSelect = (selected) => handleWhatIfSelection(selected);
    }

    // Add cards with click handler
    if (response.cards) {
      assistantMessage.cards = response.cards;
      assistantMessage.onCardClick = (text) => {
        console.log('[DEBUG] Assistant message onCardClick called with:', text);
        handleCardActionRef.current(text);
      };
    }

    console.log('[DEBUG] Creating assistant message:', {
      hasContent: !!assistantMessage.content,
      hasCards: !!assistantMessage.cards,
      hasOnCardClick: !!assistantMessage.onCardClick,
      cardsCount: assistantMessage.cards?.length
    });

    setMessages(prev => {
      console.log('[DEBUG] Adding assistant message to messages array');
      
      // If this is a "More Ideas" response, replace the last assistant message
      if (isMoreIdeasRequest && prev.length > 0) {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.whatifs) {
          // Replace the last message with updated what-ifs
          return [...prev.slice(0, -1), assistantMessage];
        }
      }
      
      return [...prev, assistantMessage];
    });
    setIsAiLoading(false);
  };

  // Initialize flow manager
  useEffect(() => {
    console.log('[DEBUG] Initializing flow manager with:', { projectInfo, ideationData });
    const manager = new ConversationFlowManager(projectInfo, ideationData);
    setFlowManager(manager);
    
    // Start conversation
    const initialResponse = manager.getStateResponse(ConversationStates.BIG_IDEA_INTRO);
    console.log('[DEBUG] Initial response:', initialResponse);
    
    setMessages([{
      role: 'assistant',
      content: initialResponse.message,
      cards: initialResponse.cards,
      onCardClick: (cardText) => {
        console.log('[DEBUG] onCardClick handler called from initial message with:', cardText);
        handleCardActionRef.current(cardText);
      },
      timestamp: Date.now()
    }]);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Handle example selection
  const handleExampleSelection = async (selectedText) => {
    handleUserInput(selectedText);
  };

  // Handle what-if selection
  const handleWhatIfSelection = async (selectedText) => {
    // Process what-if as a prompt for refinement
    const prompt = `The educator is interested in: "${selectedText}". How would this shape their ${flowManager.getCurrentPhase()}?`;
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: `I'm interested in: "${selectedText}"`,
      timestamp: Date.now()
    }]);

    setIsAiLoading(true);

    try {
      const response = await generateJsonResponse(prompt, {
        currentPhase: flowManager.getCurrentPhase(),
        projectInfo,
        ideationData
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.suggestion || `That's a fascinating direction! Here's how we could incorporate "${selectedText}" into your project...`,
        cards: [
          { text: 'Use This Approach', type: 'success', icon: 'Check' },
          { text: 'Explore More Options', type: 'secondary', icon: 'Refresh' },
          { text: 'Create My Own', type: 'primary', icon: 'Edit' }
        ],
        onCardClick: (text) => handleCardAction(text),
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('AI response error:', error);
    }

    setIsAiLoading(false);
  };

  // Handle user text input
  const handleUserInput = async (input) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !flowManager) {return;}

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now()
    }]);

    setUserInput('');
    setIsAiLoading(true);

    // Update ideation data based on current phase
    const currentPhase = flowManager.getCurrentPhase();
    if (currentPhase === 'bigIdea') {
      updateIdeation({ bigIdea: trimmedInput });
    } else if (currentPhase === 'essentialQuestion') {
      updateIdeation({ essentialQuestion: trimmedInput });
    } else if (currentPhase === 'challenge') {
      updateIdeation({ challenge: trimmedInput });
    }

    // Transition state
    const newState = flowManager.transitionState(null, trimmedInput);
    const response = flowManager.getStateResponse(newState, { 
      ...ideationData,
      [currentPhase]: trimmedInput 
    });

    // Create response message
    const assistantMessage = {
      role: 'assistant',
      content: response.message,
      timestamp: Date.now()
    };

    if (response.cards) {
      assistantMessage.cards = response.cards;
      assistantMessage.onCardClick = (text) => handleCardAction(text);
    }

    setMessages(prev => [...prev, assistantMessage]);
    setIsAiLoading(false);

    // Check for completion
    if (newState === ConversationStates.COMPLETE) {
      setTimeout(() => onComplete(ideationData), 2000);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserInput(userInput);
  };

  if (!flowManager) {return <div>Loading...</div>;}

  // Debug panel (only in development)
  const DebugPanel = () => (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div>Current State: {flowManager?.currentState}</div>
      <div>Messages Count: {messages.length}</div>
      <div>Is Loading: {isAiLoading ? 'Yes' : 'No'}</div>
      <div>Last Message Has Cards: {messages[messages.length - 1]?.cards ? 'Yes' : 'No'}</div>
      <div>Last Message Has Handler: {messages[messages.length - 1]?.onCardClick ? 'Yes' : 'No'}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Debug panel in development */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Ideation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Let's create a meaningful learning experience for your {projectInfo.ageGroup} students
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {messages.map((msg, i) => (
              <Message 
                key={i} 
                message={msg} 
                isUser={msg.role === 'user'}
              />
            ))}
            {isAiLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icons.ProjectCraft />
                </div>
                <div className="bg-white rounded-2xl px-6 py-4 shadow-soft">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-5 shadow-soft">
            <div className="flex gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your idea or select an option above..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl shadow-soft-inset focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isAiLoading}
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isAiLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-soft hover:shadow-soft-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Icons.Send />
                Send
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Progress */}
        <div className="w-96 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6 overflow-y-auto">
          <IdeationProgress 
            ideationData={ideationData}
            currentStep={flowManager.getCurrentPhase()}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationalIdeationStructured;