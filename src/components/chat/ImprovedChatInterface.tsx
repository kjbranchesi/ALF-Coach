// Improved Chat Interface with Natural Coaching Conversations
// This component focuses on adaptive coaching rather than rigid data collection

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Lightbulb, HelpCircle, Sparkles, ChevronRight, User, BookOpen } from 'lucide-react';
import { improvedGeminiService } from '../../services/GeminiServiceImproved';
import { MessageRenderer } from './MessageRenderer';
import { StageSpecificSuggestions } from './StageSpecificSuggestions';
import { logger } from '../../utils/logger';
import confetti from 'canvas-confetti';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    suggestions?: string[];
    isCoaching?: boolean;
  };
}

interface ProjectState {
  stage: 'GROUNDING' | 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  conversationHistory: Message[];
  ideation: {
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  };
  journey?: any;
  deliverables?: any;
  userEngagement: {
    confusionCount: number;
    helpRequests: number;
    progressVelocity: 'slow' | 'normal' | 'fast';
  };
}

interface Props {
  wizardData: any;
  initialContext?: string;
  onStageComplete?: (stage: string, data: any) => void;
}

export const ImprovedChatInterface: React.FC<Props> = ({
  wizardData,
  initialContext,
  onStageComplete
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'GROUNDING',
    conversationHistory: [],
    ideation: {},
    userEngagement: {
      confusionCount: 0,
      helpRequests: 0,
      progressVelocity: 'normal'
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize with welcoming message
  useEffect(() => {
    if (messages.length === 0 && initialContext) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: initialContext,
        timestamp: new Date(),
        metadata: { stage: 'GROUNDING', isCoaching: true }
      };
      setMessages([welcomeMessage]);
    }
  }, [initialContext]);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Natural stage progression based on conversation quality
  const assessStageProgression = useCallback((userInput: string, aiResponse: string, currentStage: string) => {
    const input = userInput.toLowerCase();
    
    // Look for explicit progression signals
    const wantsToProgress = [
      'sounds good', 'let\'s continue', 'what\'s next',
      'i\'m ready', 'that works', 'perfect', 'great'
    ].some(phrase => input.includes(phrase));

    // Look for confusion signals
    const seemsConfused = [
      'not sure', 'don\'t understand', 'confused',
      'what do you mean', 'can you explain', 'help'
    ].some(phrase => input.includes(phrase));

    if (seemsConfused) {
      setProjectState(prev => ({
        ...prev,
        userEngagement: {
          ...prev.userEngagement,
          confusionCount: prev.userEngagement.confusionCount + 1
        }
      }));
      return; // Don't progress if confused
    }

    // Natural progression based on content quality
    switch (currentStage) {
      case 'GROUNDING':
        // Move to BIG_IDEA after initial exchange
        if (messages.length >= 2) {
          transitionToStage('BIG_IDEA');
        }
        break;

      case 'BIG_IDEA':
        // Check if user has provided a conceptual idea (not a question or activity)
        const hasConceptualIdea = userInput.length > 15 && 
                                  !input.includes('?') && 
                                  !input.includes('activity') &&
                                  !input.includes('project') &&
                                  !input.includes('students will');
        
        if (hasConceptualIdea && (wantsToProgress || messages.filter(m => m.metadata?.stage === 'BIG_IDEA').length >= 3)) {
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, bigIdea: userInput }
          }));
          celebrateProgress('Big Idea');
          transitionToStage('ESSENTIAL_QUESTION');
        }
        break;

      case 'ESSENTIAL_QUESTION':
        // Check if user has provided an open-ended question
        const hasQuestion = input.includes('?') || 
                          (input.includes('how') || input.includes('why') || input.includes('what')) &&
                          userInput.length > 15;
        
        if (hasQuestion && (wantsToProgress || messages.filter(m => m.metadata?.stage === 'ESSENTIAL_QUESTION').length >= 3)) {
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, essentialQuestion: userInput }
          }));
          celebrateProgress('Essential Question');
          transitionToStage('CHALLENGE');
        }
        break;

      case 'CHALLENGE':
        // Check if user has defined an authentic challenge
        const hasChallenge = userInput.length > 20 &&
                            (input.includes('create') || input.includes('design') || 
                             input.includes('solve') || input.includes('help') ||
                             input.includes('develop') || input.includes('build'));
        
        if (hasChallenge && (wantsToProgress || messages.filter(m => m.metadata?.stage === 'CHALLENGE').length >= 3)) {
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, challenge: userInput }
          }));
          celebrateProgress('Challenge');
          transitionToStage('JOURNEY');
        }
        break;

      case 'JOURNEY':
        // Progress after sufficient journey planning
        if (wantsToProgress || messages.filter(m => m.metadata?.stage === 'JOURNEY').length >= 4) {
          transitionToStage('DELIVERABLES');
        }
        break;

      case 'DELIVERABLES':
        // Complete after deliverables defined
        if (wantsToProgress || messages.filter(m => m.metadata?.stage === 'DELIVERABLES').length >= 3) {
          transitionToStage('COMPLETE');
        }
        break;
    }
  }, [messages]);

  // Smooth stage transitions with context
  const transitionToStage = (newStage: string) => {
    logger.log(`[Stage Transition] ${projectState.stage} -> ${newStage}`);
    
    setProjectState(prev => ({
      ...prev,
      stage: newStage as ProjectState['stage']
    }));

    // Notify parent component
    if (onStageComplete) {
      onStageComplete(projectState.stage, projectState.ideation);
    }
  };

  // Celebrate progress with subtle animation
  const celebrateProgress = (stageName: string) => {
    // Subtle confetti from the top
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0, x: 0.5 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      ticks: 40,
      gravity: 0.8,
      scalar: 0.8
    });

    // Add celebration message
    const celebrationMessage: Message = {
      id: `celebrate-${Date.now()}`,
      role: 'system',
      content: `✨ Excellent! Your ${stageName} is taking shape beautifully.`,
      timestamp: new Date(),
      metadata: { isCoaching: true }
    };
    
    setMessages(prev => [...prev, celebrationMessage]);
  };

  // Handle sending messages
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      metadata: { stage: projectState.stage }
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get coaching response
      const response = await improvedGeminiService.generateCoachingResponse(
        projectState.stage,
        input,
        {
          wizard: wizardData,
          ideation: projectState.ideation,
          conversationHistory: messages.slice(-10)
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          stage: projectState.stage,
          suggestions: response.suggestions,
          isCoaching: true
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Assess if we should progress stages
      if (response.shouldProgress) {
        assessStageProgression(input, response.message, projectState.stage);
      }

    } catch (error) {
      logger.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Let's try that again - what were you thinking about for your project?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = async (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    // Auto-send the suggestion
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  // Get contextual placeholder text
  const getPlaceholder = () => {
    const placeholders = {
      'GROUNDING': "Share what you're hoping to create for your students...",
      'BIG_IDEA': "What deeper understanding should students gain? (e.g., 'The power of collective action')",
      'ESSENTIAL_QUESTION': "What open question will drive their inquiry? (e.g., 'How might we...?')",
      'CHALLENGE': "What authentic problem will students tackle?",
      'JOURNEY': "How will students progress through this work?",
      'DELIVERABLES': "What will students create to demonstrate their learning?",
      'COMPLETE': "Any final thoughts or adjustments?"
    };
    return placeholders[projectState.stage] || "Share your thoughts...";
  };

  // Get stage progress indicator
  const getStageProgress = () => {
    const stages = ['GROUNDING', 'BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES', 'COMPLETE'];
    const currentIndex = stages.indexOf(projectState.stage);
    return {
      current: currentIndex + 1,
      total: stages.length,
      percentage: ((currentIndex + 1) / stages.length) * 100
    };
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      {/* Header with Progress */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ALF Coach
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your Project Design Partner
              </p>
            </div>
          </div>
          
          {/* Stage Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {projectState.stage.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${getStageProgress().percentage}%` }}
          />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-3xl ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {message.role !== 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">AC</span>
                  </div>
                )}
                
                {/* Message Content */}
                <div className={`
                  px-4 py-3 rounded-2xl
                  ${message.role === 'user' 
                    ? 'bg-blue-600 text-white ml-auto' 
                    : message.role === 'system'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'}
                `}>
                  {message.role === 'assistant' ? (
                    <MessageRenderer content={message.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                  
                  {/* Suggestions if available */}
                  {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        💡 Consider these ideas:
                      </p>
                      <div className="space-y-2">
                        {message.metadata.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">AC</span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    Thinking about your {projectState.stage.toLowerCase().replace('_', ' ')}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Contextual Suggestions */}
      {showSuggestions && (
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <StageSpecificSuggestions
            stage={projectState.stage}
            context={{
              ...wizardData,
              ...projectState.ideation
            }}
            onSuggestionClick={handleSuggestionClick}
            onClose={() => setShowSuggestions(false)}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        {/* Context Helper */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span>
              {projectState.stage === 'BIG_IDEA' && "Let's find the perfect concept for your project"}
              {projectState.stage === 'ESSENTIAL_QUESTION' && "Let's craft a question that sparks curiosity"}
              {projectState.stage === 'CHALLENGE' && "Let's design something authentic and engaging"}
              {projectState.stage === 'JOURNEY' && "Let's map out the learning adventure"}
              {projectState.stage === 'DELIVERABLES' && "Let's define how students will shine"}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Get ideas"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setInput("I'm not sure I understand. Can you help clarify?");
                handleSend();
              }}
              className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Get help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Input Field */}
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={getPlaceholder()}
            className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            rows={3}
          />
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`
              p-3 rounded-xl transition-all transform
              ${input.trim() && !isLoading
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'}
            `}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};