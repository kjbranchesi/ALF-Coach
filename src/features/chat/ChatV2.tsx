import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSM } from '../../context/FSMContext';
import { generatePrompt, generateQuickResponse, QuickReply } from '../../prompts/journey';
import { 
  SendIcon, 
  SparklesIcon,
  LightbulbIcon,
  ArrowRightIcon,
  SkipForwardIcon,
  HelpCircleIcon,
  RefreshIcon
} from '../../components/icons/ButtonIcons';
import { Progress } from '../../components/Progress';

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
  ideas: LightbulbIcon,
  whatif: RefreshIcon,
  examples: HelpCircleIcon,
  skip: SkipForwardIcon,
  continue: ArrowRightIcon
};

export function ChatV2({ wizardData, blueprintId, chatHistory, onUpdateHistory, onComplete }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [waitingForProgression, setWaitingForProgression] = useState(false);
  
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
        content: promptData.content,
        timestamp: new Date(),
        quickReplies: promptData.metadata.quickReplies,
        metadata: { stage: currentState }
      };

      const initialHistory = [systemMessage, contextMessage, assistantMessage];
      setMessages(initialHistory);
      onUpdateHistory(initialHistory.filter(m => m.role !== 'system'));
    } catch (error) {
      console.error('Error initializing conversation:', error);
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
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
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
    if (!canSkip()) return;
    
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
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      {/* Header with stage info */}
      <div className="bg-white rounded-t-xl shadow-sm p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{stageContext.title}</h1>
            <p className="text-sm text-slate-600 mt-1">{stageContext.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Stage {useFSM().progress.current} of {useFSM().progress.total}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  {useFSM().progress.percentage}% Complete
                </span>
              </div>
            </div>
            <Progress 
              value={useFSM().progress.percentage} 
              segment={useFSM().progress.segment}
              showLabel={true}
              className="w-64"
            />
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
                          onClick={() => handleQuickReply(reply)}
                          disabled={isStreaming}
                          className={`
                            inline-flex items-center gap-2 px-4 py-2 rounded-full
                            text-sm font-medium transition-all duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed
                            transform hover:scale-[1.03] hover:shadow-soft
                            ${variant === 'primary' 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-soft' 
                              : variant === 'subtle'
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                              : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200 hover:from-blue-100 hover:to-purple-100 dark:from-gray-800 dark:to-gray-800 dark:text-blue-400 dark:border-gray-700'
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
                <span className="text-gray-600 text-sm">Crafting inspirational ideas...</span>
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
            placeholder={
              waitingForProgression 
                ? "Type 'continue' to proceed to the next stage..." 
                : "Share your ideas... (Shift+Enter for new line)"
            }
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