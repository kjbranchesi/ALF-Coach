import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSMv2 } from '../../context/FSMContextV2';
import { 
  type JourneyDataV3, 
  createEmptyJourneyData, 
  StageTransitions 
} from '../../lib/journey-data-v3';
import { 
  Send,
  ArrowRight,
  HelpCircle,
  RefreshCw,
  Edit,
  Lightbulb,
  Layers,
  Rocket,
  Info,
  Check,
  MessageCircle,
  Sparkles,
  Map,
  FileText,
  Brain,
  Target
} from 'lucide-react';
import { Progress } from '../../components/ProgressV2';
import { MessageContent } from './MessageContent';
import { IdeaCardsV2, parseIdeasFromResponse } from './IdeaCardsV2';
import { JourneySummary } from '../../components/JourneySummary';
import { AnimatedButton, AnimatedLoader } from '../../components/RiveInteractions';
import { ErrorRecovery } from '../../components/chat/ErrorRecovery';
import { FlowGuidance } from '../../components/chat/FlowGuidance';
import { ConversationStatus } from '../../components/chat/ConversationStatus';
import { SystemHealth } from '../../components/chat/SystemHealth';
import { validateStageInput } from '../../lib/validation-system';
import { StagePromptTemplates, generateContextualIdeas } from '../../lib/prompt-templates';
import { ResponseContext, enforceResponseLength, generateConstrainedPrompt } from '../../lib/response-guidelines';
import { useButtonState } from '../../hooks/useButtonState';
import { ChatEventHandler } from '../../services';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    eventType?: string;
    isCardSelection?: boolean;
    responseContext?: ResponseContext;
    showIdeaCards?: boolean;
    cardType?: 'ideas' | 'whatif';
    ideaOptions?: any[];
  };
  quickReplies?: any[];
}

interface ChatV5Props {
  wizardData: WizardData;
  blueprintId: string;
  onComplete: () => void;
}

// Icon mapping for buttons
const iconMap: Record<string, any> = {
  Rocket,
  Info,
  Lightbulb,
  RefreshCw,
  HelpCircle,
  Check,
  Edit,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Map,
  FileText,
  Brain,
  Target,
  Layers
};

export function ChatV5({ wizardData, blueprintId, onComplete }: ChatV5Props) {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Journey data
  const [journeyData, setJourneyData] = useState<JourneyDataV3>(() => {
    const saved = localStorage.getItem(`journey-v5-${blueprintId}`);
    return saved ? JSON.parse(saved) : createEmptyJourneyData();
  });
  
  // UI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationState, setConversationState] = useState<any>({
    stage: 'IDEATION_INITIATOR',
    phase: 'WELCOME',
    isWaitingForConfirmation: false,
    capturedData: new Map(),
    flags: []
  });
  const [lastError, setLastError] = useState<any>(null);
  const [showGuidance, setShowGuidance] = useState(true);
  
  // FSM context
  const { 
    currentState, 
    advance, 
    getCurrentStage,
    updateData
  } = useFSMv2();
  
  // Services
  const { sendMessage, isStreaming } = useGeminiStream();
  const eventHandler = useMemo(() => {
    try {
      return ChatEventHandler.getInstance();
    } catch (error) {
      console.error('Failed to initialize ChatEventHandler:', error);
      throw new Error('ChatEventHandler initialization failed');
    }
  }, []);
  
  // Use centralized button state
  const { state: buttonSystemState, buttons, dispatchEvent, setLoading } = useButtonState();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Update button state when stage changes
  useEffect(() => {
    if (isInitialized) {
      dispatchEvent({
        type: 'STAGE_CHANGE',
        payload: {
          stage: currentState,
          phase: conversationState.phase || 'ACTIVE'
        }
      });
    }
  }, [currentState, conversationState.phase, isInitialized, dispatchEvent]);
  
  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && wizardData && blueprintId && !isInitialized) {
      initializeConversation();
      setIsInitialized(true);
    }
  }, [wizardData, blueprintId, isInitialized]);
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Save journey data
  useEffect(() => {
    localStorage.setItem(`journey-v5-${blueprintId}`, JSON.stringify(journeyData));
  }, [journeyData, blueprintId]);
  
  const initializeConversation = () => {
    const stageContext = {
      subject: wizardData.subject || 'this subject',
      ageGroup: wizardData.ageGroup || 'students',
      location: wizardData.location,
      bigIdea: journeyData.stageData.ideation?.bigIdea,
      essentialQuestion: journeyData.stageData.ideation?.essentialQuestion
    };
    
    let welcomeContent = '';
    const templates = StagePromptTemplates[currentState as keyof typeof StagePromptTemplates];
    
    if (templates?.welcome) {
      welcomeContent = templates.welcome(stageContext);
    } else {
      welcomeContent = `Welcome! Let's begin designing your ${wizardData.subject} experience.`;
    }
    
    welcomeContent = enforceResponseLength(welcomeContent, ResponseContext.INITIAL_WELCOME);
    
    const welcomeMessage: Message = {
      id: `init-${Date.now()}`,
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date(),
      metadata: { 
        stage: currentState,
        responseContext: ResponseContext.INITIAL_WELCOME
      }
    };
    
    setMessages([welcomeMessage]);
    
    // Initialize button state
    dispatchEvent({
      type: 'STAGE_CHANGE',
      payload: {
        stage: currentState,
        phase: 'WELCOME'
      }
    });
  };
  
  // Handle button clicks through centralized system
  const handleButtonClick = useCallback(async (button: any) => {
    if (isProcessing || isStreaming) {return;}
    
    setLoading(true);
    setIsProcessing(true);
    
    try {
      // Update button state first
      await dispatchEvent({
        type: 'BUTTON_ACTION',
        payload: {
          action: button.action,
          buttonId: button.id
        }
      });
      
      // Process the action
      const chatEvent = {
        type: 'button_click' as const,
        payload: {
          action: button.action,
          buttonId: button.id,
          label: button.label
        }
      };
      
      const processedEvent = await eventHandler.handleEvent(chatEvent);
      
      // Update conversation state
      const newConversationState = ChatEventHandler.updateConversationContext(
        conversationState,
        processedEvent
      );
      setConversationState(newConversationState);
      
      // Handle specific actions
      if (button.action === 'confirm') {
        await handleConfirmation();
      } else if (button.action === 'refine') {
        await handleRefinement();
      } else if (button.action === 'guidance') {
        await handleGuidance();
      } else if (['ideas', 'whatif', 'help'].includes(button.action)) {
        await handleSuggestionRequest(button.action);
      } else if (button.action === 'start') {
        await handleStartJourney();
      } else if (button.action === 'tellmore') {
        await handleTellMore();
      }
    } catch (error) {
      console.error('Error handling button click:', error);
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  }, [isProcessing, isStreaming, setLoading, dispatchEvent, eventHandler, conversationState]);
  
  // Handle confirmation
  const handleConfirmation = async () => {
    const capturedValue = conversationState.capturedData?.get('current') || 
                         conversationState.lastUserInput;
    
    if (capturedValue) {
      // Update journey data
      const newJourneyData = { ...journeyData };
      
      switch (currentState) {
        case 'IDEATION_BIG_IDEA':
          newJourneyData.stageData.ideation.bigIdea = capturedValue;
          break;
        case 'IDEATION_EQ':
          newJourneyData.stageData.ideation.essentialQuestion = capturedValue;
          break;
        case 'IDEATION_CHALLENGE':
          newJourneyData.stageData.ideation.challenge = capturedValue;
          break;
      }
      
      setJourneyData(newJourneyData);
      
      // Progress to next stage
      await progressToNextStage();
    }
  };
  
  // Handle refinement
  const handleRefinement = async () => {
    // Reset to active state
    await dispatchEvent({
      type: 'REFINE',
      payload: {}
    });
    
    const refineMessage: Message = {
      id: `refine-${Date.now()}`,
      role: 'assistant',
      content: "Of course! Feel free to refine your answer. What would you like to change?",
      timestamp: new Date(),
      metadata: {
        stage: currentState
      }
    };
    
    setMessages(prev => [...prev, refineMessage]);
  };
  
  // Handle guidance request
  const handleGuidance = async () => {
    const guidanceMessage: Message = {
      id: `guidance-${Date.now()}`,
      role: 'assistant',
      content: "I'm here to help! Let me provide some guidance for this step...",
      timestamp: new Date(),
      metadata: {
        stage: currentState
      }
    };
    
    setMessages(prev => [...prev, guidanceMessage]);
    
    // Show suggestions after guidance
    setTimeout(() => {
      handleSuggestionRequest('ideas');
    }, 1000);
  };
  
  // Handle suggestion requests
  const handleSuggestionRequest = async (type: string) => {
    const ideas = await generateIdeas(type as 'ideas' | 'whatif');
    
    let content = '';
    if (type === 'ideas') {
      content = "Here are some ideas tailored to your context:";
    } else if (type === 'whatif') {
      content = "Here are some thought-provoking scenarios:";
    } else if (type === 'help') {
      content = "Let me help you with this step:";
    }
    
    const suggestionMessage: Message = {
      id: `suggestion-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        stage: currentState,
        showIdeaCards: true,
        cardType: type as 'ideas' | 'whatif',
        ideaOptions: ideas
      }
    };
    
    setMessages(prev => [...prev, suggestionMessage]);
  };
  
  // Handle start journey
  const handleStartJourney = async () => {
    setConversationState(prev => ({ ...prev, phase: 'ACTIVE' }));
    
    const startMessage: Message = {
      id: `start-${Date.now()}`,
      role: 'assistant',
      content: "Great! Let's begin by establishing your Big Idea. This will be the foundation of your entire learning experience.",
      timestamp: new Date(),
      metadata: {
        stage: currentState
      }
    };
    
    setMessages(prev => [...prev, startMessage]);
    
    // Update button state
    await dispatchEvent({
      type: 'STAGE_CHANGE',
      payload: {
        stage: currentState,
        phase: 'ACTIVE'
      }
    });
  };
  
  // Handle tell more
  const handleTellMore = async () => {
    const infoMessage: Message = {
      id: `info-${Date.now()}`,
      role: 'assistant',
      content: "Let me explain more about this process...",
      timestamp: new Date(),
      metadata: {
        stage: currentState
      }
    };
    
    setMessages(prev => [...prev, infoMessage]);
  };
  
  // Handle card selection
  const handleCardSelection = useCallback(async (option: any) => {
    if (isProcessing) {return;}
    
    setIsProcessing(true);
    
    try {
      // Update button state for card selection
      await dispatchEvent({
        type: 'CARD_SELECTED',
        payload: {
          cardId: option.id,
          value: option.title,
          type: 'idea'
        }
      });
      
      // Add user message showing selection
      const selectionMessage: Message = {
        id: `selection-${Date.now()}`,
        role: 'user',
        content: option.title,
        timestamp: new Date(),
        metadata: {
          isCardSelection: true
        }
      };
      
      setMessages(prev => [...prev, selectionMessage]);
      
      // Update conversation state
      setConversationState(prev => ({
        ...prev,
        capturedData: new Map([...prev.capturedData, ['current', option.title]]),
        lastUserInput: option.title
      }));
      
      // Generate confirmation message
      const confirmMessage: Message = {
        id: `confirm-${Date.now()}`,
        role: 'assistant',
        content: `"${option.title}" - I love this choice! This could really engage your students. Would you like to proceed with this, or would you like to refine it further?`,
        timestamp: new Date(),
        metadata: {
          stage: currentState
        }
      };
      
      setMessages(prev => [...prev, confirmMessage]);
      
    } catch (error) {
      console.error('Error handling card selection:', error);
      // Show user-friendly error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I had trouble processing your selection. Please try clicking the card again, or you can type your choice directly in the text box below.',
        timestamp: new Date(),
        metadata: {
          stage: currentState,
          isError: true
        }
      };
      setMessages(prev => [...prev, errorMessage]);
      setLastError({ type: 'card_selection', message: 'Failed to select card', context: option });
      throw error; // Re-throw to be caught by IdeaCardsV2
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, dispatchEvent, currentState]);
  
  // Handle text input
  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || isStreaming || isProcessing) {return;}
    
    setIsProcessing(true);
    const userText = text.trim();
    
    try {
      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      
      // Check if needs confirmation
      const needsConfirmation = ChatEventHandler.needsConfirmation(
        currentState,
        userText,
        conversationState
      );
      
      // Update button state
      await dispatchEvent({
        type: 'USER_INPUT',
        payload: {
          text: userText,
          needsConfirmation
        }
      });
      
      // Update conversation state
      setConversationState(prev => ({
        ...prev,
        lastUserInput: userText,
        capturedData: new Map([...prev.capturedData, ['current', userText]])
      }));
      
      // Generate response
      if (needsConfirmation) {
        const confirmMessage: Message = {
          id: `confirm-${Date.now()}`,
          role: 'assistant',
          content: `"${userText}" - This is a thoughtful response! Would you like to proceed with this, or would you like to refine it?`,
          timestamp: new Date(),
          metadata: {
            stage: currentState
          }
        };
        
        setMessages(prev => [...prev, confirmMessage]);
      } else {
        // Process with AI
        await processWithAI(userText);
      }
      
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Process with AI
  const processWithAI = async (userInput: string) => {
    const context = {
      stage: currentState,
      subject: wizardData.subject,
      ageGroup: wizardData.ageGroup,
      location: wizardData.location,
      bigIdea: journeyData.stageData.ideation?.bigIdea,
      essentialQuestion: journeyData.stageData.ideation?.essentialQuestion,
      previousMessages: messages.slice(-5)
    };
    
    const prompt = generateConstrainedPrompt(context, userInput);
    
    try {
      const response = await sendMessage(prompt);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          stage: currentState
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI processing error:', error);
    }
  };
  
  // Generate ideas
  const generateIdeas = async (type: 'ideas' | 'whatif' = 'ideas') => {
    const stageContext = {
      subject: wizardData.subject,
      ageGroup: wizardData.ageGroup,
      location: wizardData.location,
      bigIdea: journeyData.stageData.ideation?.bigIdea,
      essentialQuestion: journeyData.stageData.ideation?.essentialQuestion
    };
    
    const ideas = generateContextualIdeas(currentState, stageContext);
    
    if (type === 'whatif') {
      return ideas.map((idea, index) => ({
        id: `whatif-${index + 1}`,
        label: String(index + 1),
        title: idea.startsWith('What if') ? idea : `What if ${idea}`,
        description: 'Explore this possibility'
      }));
    }
    
    return ideas.map((idea, index) => ({
      id: `idea-${index + 1}`,
      label: String(index + 1),
      title: idea,
      description: ''
    }));
  };
  
  // Progress to next stage
  const progressToNextStage = async () => {
    const result = advance();
    
    if (result.success) {
      // Reset conversation state for new stage
      setConversationState({
        stage: result.newState,
        phase: 'WELCOME',
        isWaitingForConfirmation: false,
        capturedData: new Map(),
        flags: []
      });
      
      // Update button state
      await dispatchEvent({
        type: 'STAGE_CHANGE',
        payload: {
          stage: result.newState,
          phase: 'WELCOME'
        }
      });
      
      // Create transition message
      const templates = StagePromptTemplates[result.newState as keyof typeof StagePromptTemplates];
      let transitionContent = '';
      
      if (templates?.welcome) {
        const stageContext = {
          subject: wizardData.subject,
          ageGroup: wizardData.ageGroup,
          location: wizardData.location,
          bigIdea: journeyData.stageData.ideation?.bigIdea,
          essentialQuestion: journeyData.stageData.ideation?.essentialQuestion
        };
        transitionContent = templates.welcome(stageContext);
      } else {
        transitionContent = `Great! Let's continue to the next stage.`;
      }
      
      transitionContent = enforceResponseLength(transitionContent, ResponseContext.TRANSITION);
      
      const transitionMessage: Message = {
        id: `transition-${Date.now()}`,
        role: 'assistant',
        content: transitionContent,
        timestamp: new Date(),
        metadata: {
          stage: result.newState,
          responseContext: ResponseContext.TRANSITION
        }
      };
      
      setMessages(prev => [...prev, transitionMessage]);
      
      if (result.newState === 'COMPLETE') {
        setTimeout(() => { onComplete(); }, 2000);
      }
    }
  };
  
  // Render button with proper styling
  const renderButton = (button: any) => {
    const Icon = iconMap[button.icon || 'MessageCircle'];
    
    return (
      <motion.button
        key={button.id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleButtonClick(button)}
        disabled={!button.enabled || isProcessing}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
          transition-all duration-200 transform-gpu
          ${button.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          ${button.variant === 'secondary' ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50' : ''}
          ${button.variant === 'tertiary' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
          ${button.variant === 'suggestion' ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : ''}
          ${button.variant === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
          ${!button.enabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {button.label}
      </motion.button>
    );
  };
  
  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Journey Summary */}
      <JourneySummary 
        journeyData={journeyData}
        currentStage={currentState}
      />
      
      {/* Progress Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Progress />
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Flow Guidance */}
          {showGuidance && (
            <FlowGuidance 
              currentStage={currentState}
              isFirstTime={messages.length <= 1}
              onDismiss={() => { setShowGuidance(false); }}
            />
          )}
          
          {/* Conversation Status */}
          <ConversationStatus
            currentStage={currentState}
            phase={conversationState.phase}
            capturedData={conversationState.capturedData}
            isWaitingForConfirmation={conversationState.isWaitingForConfirmation}
          />
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`
                    max-w-3xl px-6 py-4 rounded-2xl
                    ${message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md'
                    }
                  `}>
                    {/* Show error recovery for error messages */}
                    {message.metadata?.isError && (
                      <ErrorRecovery
                        error={{
                          type: 'general',
                          message: message.content
                        }}
                        onRetry={() => {
                          // Retry last action
                          setLastError(null);
                        }}
                        onAlternativeAction={() => {
                          // Focus text input
                          textareaRef.current?.focus();
                        }}
                        currentStage={currentState}
                      />
                    )}
                    <MessageContent content={message.content || ''} />
                    
                    {/* Show idea cards if present */}
                    {message.metadata?.showIdeaCards && message.metadata?.ideaOptions && (
                      <div className="mt-4">
                        <IdeaCardsV2
                          options={message.metadata.ideaOptions}
                          onSelect={handleCardSelection}
                          isActive={isLastMessage && !isProcessing}
                          type={message.metadata.cardType || 'ideas'}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Loading indicator */}
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-gray-500"
            >
              <AnimatedLoader />
              <span>Thinking...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area with Buttons */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto p-6">
          {/* Render current buttons */}
          {buttons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {buttons.filter(b => b.visible).map(renderButton)}
            </div>
          )}
          
          {/* Text input */}
          <div className="flex gap-3">
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
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       resize-none min-h-[60px] max-h-[200px]"
              disabled={isStreaming || isProcessing}
            />
            <AnimatedButton
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isStreaming || isProcessing}
              className="self-end"
            >
              <Send className="w-5 h-5" />
            </AnimatedButton>
          </div>
        </div>
      </div>
      
      {/* System Health Indicator */}
      <SystemHealth 
        isProcessing={isProcessing}
        isStreaming={isStreaming}
        lastError={lastError}
      />
    </div>
  );
}