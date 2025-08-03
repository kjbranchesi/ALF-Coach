import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSM } from '../../context/FSMContext';
import { generatePrompt, generateQuickResponse, type QuickReply } from '../../prompts/journey';
import { 
  Send,
  Sparkles,
  Lightbulb,
  ArrowRight,
  SkipForward,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { Progress } from '../../components/Progress';
import { MessageContent } from './MessageContent';
import { IdeaCardsDisplay } from './IdeaCardsDisplay';
import { parseIdeasFromContent, hasParseableIdeas } from './parseIdeas';
import { StageOverview } from './StageOverview';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  metadata?: {
    stage?: string;
    readyForNext?: boolean;
  };
}

interface ChatProps {
  wizardData: WizardData;
  blueprintId: string;
  chatHistory: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
  onComplete: () => void;
}

// Enhanced system prompt for journey design
const JOURNEY_SYSTEM_PROMPT = `You are ProjectCraft Coach, an inspirational guide helping educators design transformative learning journeys.

Your approach:
- Celebrate educator creativity and vision
- Offer possibilities, not prescriptions  
- Build on their ideas with enthusiasm
- Keep the conversation flowing naturally
- Focus on student engagement and joy

Current context will be provided with each message. Respond to the educator's input while staying aligned with the current journey design stage.

When the educator has provided enough detail for the current stage, end your response with:
{readyForNext: true}

Format any suggestions as quick-reply options, not inline lists.`;

// Icon mapping for quick replies
const quickReplyIcons = {
  ideas: Lightbulb,
  whatif: RefreshCw,
  examples: HelpCircle,
  skip: SkipForward,
  continue: ArrowRight
};

export function ChatV2({ wizardData, blueprintId, chatHistory, onUpdateHistory, onComplete }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [waitingForProgression, setWaitingForProgression] = useState(false);
  const [showOverview, setShowOverview] = useState(chatHistory.length === 0);
  
  const { sendMessage, isStreaming } = useGeminiStream();
  const { 
    currentState, 
    journeyData, 
    advance, 
    canSkip, 
    updateData,
    getStageContext,
    saveState,
    loadState 
  } = useFSM();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load FSM state on mount
  useEffect(() => {
    loadState(blueprintId);
  }, [blueprintId, loadState]);

  // Save FSM state on changes
  useEffect(() => {
    saveState(blueprintId);
  }, [currentState, journeyData, blueprintId, saveState]);

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

  // Parse user input and update FSM data based on current stage
  const parseAndUpdateStageData = (userInput: string): boolean => {
    const input = userInput.trim();
    
    switch (currentState) {
      case 'IDEATION_BIG_IDEA': {
        // Check if user selected an option or provided custom big idea
        const optionMatch = input.match(/^[ABC]\)|I['']d like to explore:\s*[ABC]\)|A\)|B\)|C\)/i);
        let bigIdea = '';
        
        if (optionMatch || input.toLowerCase().includes('technology as a force for change')) {
          bigIdea = 'Technology as a Force for Change';
        } else if (input.toLowerCase().includes('hidden technology') || input.toLowerCase().includes('everyday life')) {
          bigIdea = 'The Hidden Technology in Everyday Life';
        } else if (input.toLowerCase().includes('multiple lenses')) {
          bigIdea = 'Technology Through Multiple Lenses';
        } else if (input.length > 10) {
          // Custom big idea
          bigIdea = input;
        }
        
        if (bigIdea) {
          updateData({
            ideation: {
              ...journeyData.ideation,
              bigIdea
            }
          });
          return true;
        }
        break;
      }
      
      case 'IDEATION_EQ': {
        // Check if user selected an option or provided custom question
        const optionMatch = input.match(/^[ABC]\)|I['']d like to explore:\s*[ABC]\)/i);
        let essentialQuestion = '';
        
        if (optionMatch) {
          const option = optionMatch[0].charAt(0).toUpperCase();
          if (option === 'A') {
            essentialQuestion = `How might we use ${wizardData.subject} to ${journeyData.ideation.bigIdea.toLowerCase()}?`;
          } else if (option === 'B') {
            essentialQuestion = `What if ${wizardData.subject} could ${journeyData.ideation.bigIdea.toLowerCase()}?`;
          } else if (option === 'C') {
            essentialQuestion = `Why does ${journeyData.ideation.bigIdea.toLowerCase()} matter to our community?`;
          }
        } else if (input.includes('?')) {
          // Custom question
          essentialQuestion = input;
        }
        
        if (essentialQuestion) {
          updateData({
            ideation: {
              ...journeyData.ideation,
              essentialQuestion
            }
          });
          return true;
        }
        break;
      }
      
      case 'IDEATION_CHALLENGE': {
        // Check if user selected an option or provided custom challenge
        const optionMatch = input.match(/^[ABC]\)|I['']d like to explore:\s*[ABC]\)/i);
        let challenge = '';
        
        if (optionMatch) {
          const option = optionMatch[0].charAt(0).toUpperCase();
          if (option === 'A') {
            challenge = `Create an interactive ${wizardData.subject} exhibition for ${wizardData.location || 'the community'} that addresses: "${journeyData.ideation.essentialQuestion}"`;
          } else if (option === 'B') {
            challenge = `Design and launch a multimedia campaign that uses ${wizardData.subject} to explore: "${journeyData.ideation.essentialQuestion}"`;
          } else if (option === 'C') {
            challenge = `Develop working prototypes or solutions that demonstrate how ${wizardData.subject} answers: "${journeyData.ideation.essentialQuestion}"`;
          }
        } else if (input.length > 20) {
          // Custom challenge
          challenge = input;
        }
        
        if (challenge) {
          updateData({
            ideation: {
              ...journeyData.ideation,
              challenge
            }
          });
          return true;
        }
        break;
      }
    }
    
    return false;
  };

  const initializeConversation = async () => {
    // Generate initial prompt for current stage
    const promptData = generatePrompt({
      wizardData,
      journeyData,
      currentStage: currentState
    });

    const systemMessage: ChatMessage = {
      id: 'system-1',
      role: 'system',
      content: JOURNEY_SYSTEM_PROMPT,
      timestamp: new Date(),
    };

    const contextMessage: ChatMessage = {
      id: 'system-2',
      role: 'system',
      content: `STAGE: ${currentState}\nWizard Data: ${JSON.stringify(wizardData)}\nJourney Data: ${JSON.stringify(journeyData)}`,
      timestamp: new Date(),
    };

    try {
      const response = await sendMessage([
        { role: 'system', parts: systemMessage.content },
        { role: 'system', parts: contextMessage.content },
        { role: 'user', parts: 'Begin journey design' }
      ]);

      const assistantMessage: ChatMessage = {
        id: 'assistant-1',
        role: 'assistant',
        content: response.text || promptData.content,
        timestamp: new Date(),
        quickReplies: promptData.metadata.quickReplies,
        metadata: { stage: currentState }
      };

      const initialHistory = [systemMessage, contextMessage, assistantMessage];
      setMessages(initialHistory);
      onUpdateHistory(initialHistory.filter(m => m.role !== 'system'));
    } catch (error) {
      console.error('Error initializing conversation:', error);
      
      // Show a fallback message if initialization fails
      const fallbackMessage: ChatMessage = {
        id: 'assistant-1',
        role: 'assistant',
        content: promptData.content,
        timestamp: new Date(),
        quickReplies: promptData.metadata.quickReplies,
        metadata: { stage: currentState }
      };
      
      setMessages([fallbackMessage]);
      onUpdateHistory([fallbackMessage]);
    }
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isStreaming) {return;}

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    // Parse user input and update FSM data based on current stage
    const shouldProgressAfterUpdate = parseAndUpdateStageData(messageText.trim());

    // Check if this is a progression command
    const isProgressionCommand = ['continue', 'keep', 'next', 'done'].includes(
      messageText.trim().toLowerCase()
    );

    // Handle typed quick action commands (for backwards compatibility)
    const quickActions = ['ideas', 'whatif', 'examples', 'skip'];
    const isQuickAction = quickActions.includes(messageText.trim().toLowerCase());

    if (isQuickAction) {
      processQuickAction(messageText.trim().toLowerCase());
      return;
    }

    // If waiting for progression and user confirms
    if (waitingForProgression && isProgressionCommand) {
      handleProgression();
      return;
    }
    
    // Auto-progress if data was updated successfully
    if (shouldProgressAfterUpdate) {
      setTimeout(() => {
        handleProgression();
      }, 1000);
      return;
    }

    try {
      // Prepare context for Gemini
      const contextMessage = `STAGE: ${currentState}\nWizard Data: ${JSON.stringify(wizardData)}\nJourney Data: ${JSON.stringify(journeyData)}`;
      
      const geminiMessages = [
        { role: 'system', parts: JOURNEY_SYSTEM_PROMPT },
        { role: 'system', parts: contextMessage },
        ...updatedMessages
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : msg.role,
            parts: msg.content
          }))
      ];

      const response = await sendMessage(geminiMessages);

      // Check if Gemini indicates ready for next stage
      const readyForNext = response.text.includes('{readyForNext: true}') || 
                          response.text.includes('{readyForNext:true}');
      
      // Check for specific next stage (for DELIVER_IMPACT → PUBLISH_REVIEW)
      const nextStageMatch = response.text.match(/\{readyForNext:\s*true,\s*next:\s*"([^"]+)"\}/);
      const specificNextStage = nextStageMatch ? nextStageMatch[1] : null;
      
      // Clean response text
      const cleanedText = response.text
        .replace(/\{readyForNext:\s*true\}/g, '')
        .replace(/\{readyForNext:\s*true,\s*next:\s*"[^"]+"\}/g, '')
        .trim();

      // Get quick replies for current stage
      const promptData = generatePrompt({ wizardData, journeyData, currentStage: currentState });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanedText,
        timestamp: new Date(),
        quickReplies: readyForNext 
          ? [{ label: "Continue", action: "continue" as const, variant: "primary" as const }]
          : promptData.metadata.quickReplies,
        metadata: { 
          stage: currentState,
          readyForNext 
        }
      };

      const finalHistory = [...updatedMessages, assistantMessage];
      setMessages(finalHistory);
      onUpdateHistory(finalHistory.filter(m => m.role !== 'system'));

      if (readyForNext) {
        setWaitingForProgression(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Craft a user-friendly error message based on the error type
      let errorContent = 'I apologize, but I encountered an error. ';
      
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.toLowerCase().includes('overloaded')) {
          errorContent = 'The AI service is currently experiencing high traffic. I\'ve tried several times but couldn\'t connect. Please try again in a few moments.';
        } else if (error.message.includes('API key')) {
          errorContent = 'The AI service is not properly configured. Please contact support or check your API settings.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorContent = 'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.';
        } else {
          errorContent += 'Please try again. If the problem persists, try refreshing the page.';
        }
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        quickReplies: [{
          label: 'Try Again',
          action: 'RETRY',
          variant: 'primary' as const
        }]
      };
      setMessages([...updatedMessages, errorMessage]);
    }
  };

  const handleProgression = async (specificNext?: string) => {
    // Handle specific transitions (e.g., DELIVER_IMPACT → PUBLISH_REVIEW)
    let result;
    if (specificNext === 'PUBLISH_REVIEW' && currentState === 'DELIVER_IMPACT') {
      // Jump directly to PUBLISH_REVIEW
      result = advance(); // This will go to PUBLISH_REVIEW
    } else {
      result = advance();
    }
    
    setWaitingForProgression(false);

    if (result.success) {
      // Generate prompt for new stage
      const promptData = generatePrompt({
        wizardData,
        journeyData,
        currentStage: result.newState
      });

      const transitionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `${result.message}\n\n${promptData.content}`,
        timestamp: new Date(),
        quickReplies: promptData.metadata.quickReplies,
        metadata: { stage: result.newState }
      };

      const newHistory = [...messages, transitionMessage];
      setMessages(newHistory);
      onUpdateHistory(newHistory.filter(m => m.role !== 'system'));

      // Check if journey is complete
      if (result.newState === 'COMPLETE') {
        setTimeout(() => {
          onComplete();
        }, 3000);
      }
    }
  };

  const handleSkip = () => {
    if (!canSkip()) {return;}
    
    // Skip to next stage
    const result = advance();
    if (result.success) {
      const skipMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "No problem! Let's move on to the next part of your journey.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, skipMessage]);
      
      // Add transition message for new stage
      setTimeout(() => {
        handleProgression();
      }, 1000);
    }
  };

  const processQuickAction = async (action: string) => {
    if (action === 'skip' && canSkip()) {
      handleSkip();
      return;
    }
    
    // Handle retry action
    if (action === 'RETRY') {
      // Remove the last error message and retry the previous user message
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      if (lastUserMessage) {
        setInput(lastUserMessage.content);
        // Remove the error message
        setMessages(prev => prev.slice(0, -1));
        // Retry sending the message
        setTimeout(() => handleSendMessage(), 100);
      }
      return;
    }

    const response = generateQuickResponse(action, {
      wizardData,
      journeyData,
      currentStage: currentState
    });

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      quickReplies: generatePrompt({ wizardData, journeyData, currentStage: currentState }).metadata.quickReplies,
      metadata: { stage: currentState }
    };

    setMessages(prev => {
      const newMessages = [...prev, assistantMessage];
      onUpdateHistory(newMessages.filter(m => m.role !== 'system'));
      return newMessages;
    });
  };

  const handleQuickReply = (reply: QuickReply) => {
    // Display the user-friendly label in the chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: reply.label,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Process the action
    setTimeout(() => {
      processQuickAction(reply.action);
    }, 100);
  };

  const stageContext = getStageContext();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full soft-bg">
      {/* Compact header with progress bar */}
      <div className="soft-card border-0 rounded-none rounded-b-2xl">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-1.5 bg-purple-100 rounded-full">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">{stageContext.title}</h2>
                <p className="text-sm text-gray-600 hidden sm:block">{stageContext.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowOverview(!showOverview); }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showOverview ? 'Hide' : 'Show'} Overview
              </button>
              <div className="text-sm text-gray-600">
                {useFSM().progress.current} of {useFSM().progress.total}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Progress 
              value={useFSM().progress.percentage} 
              segment={useFSM().progress.segment}
              showLabel={false}
              className="w-full h-2"
            />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto soft-bg">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Show overview on first visit */}
          {showOverview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <StageOverview />
            </motion.div>
          )}
          
          <AnimatePresence initial={false}>
            {messages.filter(msg => msg.role !== 'system').map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center soft-elevated">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
                {/* Check if message contains ideas that should be displayed as cards */}
                {message.role === 'assistant' && hasParseableIdeas(message.content) ? (
                  <IdeaCardsDisplay
                    ideas={parseIdeasFromContent(message.content)}
                    onSelectIdea={(idea) => {
                      // Directly send the message when idea card is clicked
                      const selectedMessage = `I'd like to explore: ${idea.title} - ${idea.description}`;
                      handleSendMessage(selectedMessage);
                    }}
                  />
                ) : (
                  <div className={`
                    soft-rounded-lg px-6 py-4 soft-transition
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-soft-lg' 
                      : 'soft-card'
                    }
                  `}>
                    {message.role === 'assistant' ? (
                      <MessageContent content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Quick replies */}
                {message.quickReplies && message.quickReplies.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 mt-3"
                  >
                    {message.quickReplies.map((reply, idx) => {
                      const IconComponent = quickReplyIcons[reply.action];
                      const variant = reply.variant || 'secondary';
                      
                      return (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => { handleQuickReply(reply); }}
                          disabled={isStreaming}
                          className={`
                            inline-flex items-center gap-2.5 px-5 py-2.5 soft-rounded-lg
                            text-sm font-medium soft-transition
                            disabled:opacity-50 disabled:cursor-not-allowed
                            hover:lift
                            ${variant === 'primary' 
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-soft-lg hover:shadow-soft-xl' 
                              : variant === 'subtle'
                              ? 'soft-card hover:shadow-soft-lg'
                              : 'soft-card text-purple-700 hover:shadow-soft-lg'
                            }
                          `}
                        >
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {reply.label}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center order-2 shadow-soft">
                  <span className="text-base font-bold text-blue-700">
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
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center soft-elevated animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="soft-card px-6 py-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </motion.div>
                  <span className="text-gray-700 text-base font-medium">Crafting inspirational ideas...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="soft-card rounded-none rounded-t-2xl border-0 soft-elevated">
        <div className="max-w-6xl mx-auto p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isStreaming}
            placeholder={
              waitingForProgression 
                ? "Type 'continue' to proceed to the next stage..." 
                : "Share your ideas... (Shift+Enter for new line)"
            }
            rows={textareaRows}
            className="
              flex-1 px-5 py-4 soft-input soft-rounded
              focus:ring-4 focus:ring-purple-500/10
              disabled:opacity-50 disabled:text-gray-500
              soft-transition resize-none
              text-gray-800 placeholder-gray-500 text-base
            "
            style={{ minHeight: '56px', maxHeight: '144px' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="
              px-6 py-3.5 soft-rounded
              bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium
              hover:from-purple-700 hover:to-blue-700
              disabled:from-gray-300 disabled:to-gray-400
              disabled:cursor-not-allowed soft-transition
              shadow-soft-lg hover:shadow-soft-xl hover:lift
              flex items-center gap-2 self-end
            "
          >
            {isStreaming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
          </form>
        </div>
      </div>
    </div>
  );
}