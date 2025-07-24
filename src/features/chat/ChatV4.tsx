import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSMv2 } from '../../context/FSMContextV2';
import { 
  JourneyDataV3, 
  createEmptyJourneyData, 
  StageTransitions,
  DataExtractors 
} from '../../lib/journey-data-v3';
import { 
  generateStagePrompt, 
  generateAIPrompt, 
  validateResponse,
  PromptContext 
} from '../../prompts/journey-v3';
import { 
  Send,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Edit,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import { Progress } from '../../components/ProgressV2';
import { MessageContent } from './MessageContent';
import { IdeaCardsV2, parseIdeasFromResponse } from './IdeaCardsV2';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  metadata?: {
    stage?: string;
    isConfirmation?: boolean;
  };
}

interface QuickReply {
  label: string;
  action: string;
  icon?: string;
}

interface ChatV4Props {
  wizardData: WizardData;
  blueprintId: string;
  onComplete: () => void;
}

// Stage-aware system prompt
const SYSTEM_PROMPT = `You are an educational design coach helping teachers create transformative learning experiences.

Current conversation rules:
1. Be conversational and encouraging
2. Validate and gently guide when responses seem off-track
3. Build on previous stage recaps when available
4. Focus only on the current stage - don't jump ahead
5. Use natural language - avoid rigid formatting unless specifically helpful

Remember: Each stage builds on the last, but conversations are stage-specific.`;

export function ChatV4({ wizardData, blueprintId, onComplete }: ChatV4Props) {
  // Initialize journey data
  const [journeyData, setJourneyData] = useState<JourneyDataV3>(() => {
    const saved = localStorage.getItem(`journey-v4-${blueprintId}`);
    return saved ? JSON.parse(saved) : createEmptyJourneyData();
  });

  // Current stage messages only
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStageTransition, setShowStageTransition] = useState(false);
  
  const { sendMessage, isStreaming } = useGeminiStream();
  const { 
    currentState, 
    advance, 
    isInitiator,
    isClarifier,
    getCurrentStage,
    saveStageRecap,
    generateStageRecap
  } = useFSMv2();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save journey data to localStorage
  useEffect(() => {
    localStorage.setItem(`journey-v4-${blueprintId}`, JSON.stringify(journeyData));
  }, [journeyData, blueprintId]);

  // Initialize conversation for current stage
  useEffect(() => {
    if (messages.length === 0) {
      initializeStageConversation();
    }
  }, [currentState]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeStageConversation = () => {
    const context: PromptContext = {
      wizardData,
      journeyData,
      currentStage: currentState,
      previousRecaps: Object.values(journeyData.recaps).filter(Boolean)
    };

    const stagePrompt = generateStagePrompt(context);
    
    const welcomeMessage: ChatMessage = {
      id: `init-${Date.now()}`,
      role: 'assistant',
      content: stagePrompt,
      timestamp: new Date(),
      quickReplies: getStageQuickReplies(),
      metadata: { stage: currentState }
    };

    setMessages([welcomeMessage]);
  };

  const getStageQuickReplies = (): QuickReply[] => {
    // Special case for very first message
    if (currentState === 'IDEATION_INITIATOR' && messages.length === 1) {
      return [
        { label: 'Start Journey', action: 'start', icon: 'ArrowRight' }
      ];
    }
    
    if (isInitiator()) {
      return [
        { label: 'Start', action: 'start', icon: 'ArrowRight' },
        { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    if (isClarifier()) {
      return [
        { label: 'Continue', action: 'continue', icon: 'ArrowRight' },
        { label: 'Edit', action: 'edit', icon: 'Edit' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    return [
      { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
      { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
      { label: 'Help', action: 'help', icon: 'HelpCircle' }
    ];
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isStreaming || isProcessing) return;

    setIsProcessing(true);
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
      // Handle quick actions
      if (messageText.startsWith('action:')) {
        await handleQuickAction(messageText.replace('action:', ''), updatedMessages);
        return;
      }

      // Handle stage progression commands
      if (['continue', 'next', 'proceed'].includes(messageText.toLowerCase()) && isClarifier()) {
        await progressToNextStage();
        return;
      }

      // Validate response
      const validation = validateResponse(messageText, currentState, {
        wizardData,
        journeyData,
        currentStage: currentState
      });

      if (!validation.isValid && validation.severity === 'error') {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: validation.suggestions || 'Please try again.',
          timestamp: new Date(),
          quickReplies: getStageQuickReplies()
        };
        setMessages([...updatedMessages, errorMessage]);
        return;
      }

      // Process and store the response
      await processUserResponse(messageText, updatedMessages);
      
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (action: string, currentMessages: ChatMessage[]) => {
    switch (action) {
      case 'ideas':
      case 'whatif':
        await generateSuggestions(action as 'ideas' | 'whatif', currentMessages);
        break;
        
      case 'help':
        await showHelp(currentMessages);
        break;
        
      case 'start':
        if (currentState === 'IDEATION_INITIATOR' && messages.length === 1) {
          // Show ideation overview after process overview
          const ideationOverview: ChatMessage = {
            id: `ideation-overview-${Date.now()}`,
            role: 'assistant',
            content: `Welcome to the **Ideation Stage**!

This is where we transform your teaching context into an inspiring foundation. Together, we'll craft:

**1. Big Idea** - A resonant concept that anchors the entire unit
**2. Essential Question** - An open-ended inquiry that drives exploration
**3. Challenge** - An authentic task that showcases student learning

Each element builds on the last, creating a cohesive learning experience that matters to your students.

Ready to begin with your Big Idea? Type your idea or click Ideas for inspiration tailored to ${wizardData.subject}.`,
            timestamp: new Date(),
            quickReplies: getStageQuickReplies(),
            metadata: { stage: currentState }
          };
          // Add the overview message
          const newMessages = [...currentMessages, ideationOverview];
          setMessages(newMessages);
          
          // Advance to BIG_IDEA state and show that prompt
          const result = advance();
          if (result.success) {
            // Generate the Big Idea prompt
            const bigIdeaPrompt = generateStagePrompt({
              wizardData,
              journeyData,
              currentStage: result.newState,
              previousRecaps: Object.values(journeyData.recaps).filter(Boolean)
            });
            
            const bigIdeaMessage: ChatMessage = {
              id: `big-idea-${Date.now()}`,
              role: 'assistant',
              content: bigIdeaPrompt,
              timestamp: new Date(),
              quickReplies: [
                { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
                { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
                { label: 'Help', action: 'help', icon: 'HelpCircle' }
              ],
              metadata: { stage: result.newState }
            };
            
            setTimeout(() => {
              setMessages([...newMessages, bigIdeaMessage]);
            }, 1000);
          }
        } else if (isInitiator()) {
          // Regular initiator start
          await progressToNextStage();
        }
        break;
        
      case 'continue':
        if (isClarifier()) {
          await progressToNextStage();
        }
        break;
        
      default:
        console.warn('Unknown action:', action);
    }
  };

  const generateSuggestions = async (type: 'ideas' | 'whatif', currentMessages: ChatMessage[]) => {
    try {
      const prompt = generateAIPrompt(type, {
        wizardData,
        journeyData,
        currentStage: currentState
      });

      const geminiMessages = [
        { role: 'system' as const, parts: SYSTEM_PROMPT },
        { role: 'user' as const, parts: prompt }
      ];

      const response = await sendMessage(geminiMessages);
      
      const suggestionMessage: ChatMessage = {
        id: `suggestion-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        quickReplies: getStageQuickReplies()
      };

      setMessages([...currentMessages, suggestionMessage]);
      
    } catch (error) {
      console.error('Error generating suggestions:', error);
      const fallbackMessage: ChatMessage = {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: 'I had trouble generating suggestions. Please share your own ideas.',
        timestamp: new Date(),
        quickReplies: getStageQuickReplies()
      };
      setMessages([...currentMessages, fallbackMessage]);
    }
  };

  const showHelp = async (currentMessages: ChatMessage[]) => {
    const helpMessage: ChatMessage = {
      id: `help-${Date.now()}`,
      role: 'assistant',
      content: getStageHelp(),
      timestamp: new Date(),
      quickReplies: getStageQuickReplies()
    };
    setMessages([...currentMessages, helpMessage]);
  };

  const getStageHelp = (): string => {
    // Context-aware help based on current stage
    const helps: Record<string, string> = {
      IDEATION_BIG_IDEA: `A Big Idea should:
• Capture an enduring understanding
• Connect to students' lives
• Spark curiosity

Examples:
- "Movement as expression"
- "Systems shape our world"
- "Stories connect us"`,
      IDEATION_EQ: `An Essential Question should:
• Be open-ended (no single answer)
• Drive investigation
• Matter beyond school

Start with: How, Why, What if, In what ways...`,
      IDEATION_CHALLENGE: `A Challenge should:
• Have real purpose/audience
• Allow creative solutions
• Demonstrate understanding

Use action verbs: Create, Design, Build, Solve...`
    };
    
    return helps[currentState] || 'How can I help you with this stage?';
  };

  const processUserResponse = async (response: string, currentMessages: ChatMessage[]) => {
    // Update journey data based on stage
    updateJourneyData(response);
    
    // Generate confirmation or next prompt
    const confirmationMessage: ChatMessage = {
      id: `confirm-${Date.now()}`,
      role: 'assistant',
      content: generateConfirmationMessage(response),
      timestamp: new Date(),
      quickReplies: [
        { label: 'Continue', action: 'continue', icon: 'ArrowRight' },
        { label: 'Refine', action: 'refine', icon: 'Edit' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ]
    };
    
    setMessages([...currentMessages, confirmationMessage]);
  };

  const updateJourneyData = (response: string) => {
    const newData = { ...journeyData };
    const stageKey = getCurrentStage().toLowerCase() as 'ideation' | 'journey' | 'deliverables';
    
    // Update based on current specific state
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        newData.stageData.ideation.bigIdea = response;
        break;
      case 'IDEATION_EQ':
        newData.stageData.ideation.essentialQuestion = response;
        break;
      case 'IDEATION_CHALLENGE':
        newData.stageData.ideation.challenge = response;
        break;
      // Add more cases...
    }
    
    // Update timestamp
    newData.metadata.updatedAt = new Date();
    
    // Store current message in stage messages
    newData.currentStageMessages = messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    }));
    
    setJourneyData(newData);
  };

  const generateConfirmationMessage = (response: string): string => {
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        return `Great! "${response}" is a powerful big idea that can anchor your entire unit.

This concept will guide everything that follows. Ready to craft an essential question that explores this idea?`;
        
      case 'IDEATION_EQ':
        return `Excellent question! "${response}" will drive deep inquiry.

This question connects perfectly to your big idea and invites exploration. Ready to define the challenge?`;
        
      case 'IDEATION_CHALLENGE':
        return `Inspiring challenge! "${response}" gives students authentic purpose.

This will showcase their understanding in meaningful ways. Let's review your complete ideation.`;
        
      default:
        return `Got it! "${response}" captured. Ready to continue?`;
    }
  };

  const progressToNextStage = async () => {
    setShowStageTransition(true);
    
    // Generate and save recap for current stage
    const currentStageKey = getCurrentStage().toLowerCase() as 'ideation' | 'journey' | 'deliverables';
    const recap = StageTransitions.generateRecap(currentStageKey, journeyData);
    
    // Update journey data with recap
    const newData = { ...journeyData };
    newData.recaps[currentStageKey] = recap;
    newData.currentStageMessages = []; // Clear messages for new stage
    setJourneyData(newData);
    
    // Advance FSM
    const result = advance();
    
    if (result.success) {
      // Clear current messages
      setTimeout(() => {
        setMessages([]);
        setShowStageTransition(false);
        initializeStageConversation();
      }, 1500);
      
      if (result.newState === 'COMPLETE') {
        setTimeout(() => onComplete(), 2000);
      }
    } else {
      setShowStageTransition(false);
      const errorMessage: ChatMessage = {
        id: `advance-error-${Date.now()}`,
        role: 'assistant',
        content: result.message || 'Please complete this stage before continuing.',
        timestamp: new Date(),
        quickReplies: getStageQuickReplies()
      };
      setMessages([...messages, errorMessage]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Progress />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
              >
                {message.role === 'assistant' ? (
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      PC
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
                        <MessageContent content={message.content} />
                        {/* Check if this message contains idea options */}
                        {message.quickReplies?.some(qr => qr.action === 'ideas' || qr.action === 'whatif') && 
                         message.content.includes('Option') && (
                          <IdeaCardsV2 
                            options={parseIdeasFromResponse(message.content, 
                              message.quickReplies.find(qr => qr.action === 'whatif') ? 'whatif' : 'ideas'
                            )}
                            onSelect={(option) => handleSendMessage(option.title)}
                            type={message.quickReplies.find(qr => qr.action === 'whatif') ? 'whatif' : 'ideas'}
                          />
                        )}
                      </div>
                      {renderQuickReplies(message.quickReplies)}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl px-6 py-4 shadow-md">
                      {message.content}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Stage Transition Overlay */}
      <AnimatePresence>
        {showStageTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4"
            >
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h3 className="text-xl font-semibold">Stage Complete!</h3>
              <p className="text-gray-600">Moving to the next stage...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
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
              placeholder={getInputPlaceholder()}
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isStreaming || isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming || isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isStreaming || isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  function renderQuickReplies(quickReplies?: QuickReply[]) {
    if (!quickReplies || quickReplies.length === 0) return null;

    const icons: Record<string, React.ElementType> = {
      ArrowRight,
      HelpCircle,
      RefreshCw,
      Edit,
      Lightbulb
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 mt-4"
      >
        {quickReplies.map((reply, index) => {
          const Icon = reply.icon ? icons[reply.icon] : null;
          
          return (
            <motion.button
              key={reply.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSendMessage(`action:${reply.action}`)}
              className={`inline-flex items-center gap-2 ${
                reply.action === 'start' && currentState === 'IDEATION_INITIATOR' && messages.length === 1
                  ? 'px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow'
              } rounded-full transition-all duration-200`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {reply.label}
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  function getInputPlaceholder(): string {
    if (isInitiator()) return "Type 'start' to begin...";
    if (isClarifier()) return "Type 'continue' to proceed or describe what to edit...";
    return "Share your ideas...";
  }
}