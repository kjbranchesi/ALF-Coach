import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSMv2 } from '../../context/FSMContextV2';
import { 
  JourneyDataV3, 
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
import { ChatEvent } from '../../lib/chat-architecture-v2';
import { validateStageInput } from '../../lib/validation-system';
import { StagePromptTemplates, generateContextualIdeas } from '../../lib/prompt-templates';
import { ResponseContext, enforceResponseLength, generateConstrainedPrompt } from '../../lib/response-guidelines';
import { useButtonState } from '../../hooks/useButtonState';
import ChatEventHandler from '../../services/chat-event-handler';
import { ButtonContext } from '../../services/button-state-manager';

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
  
  // FSM context
  const { 
    currentState, 
    advance, 
    getCurrentStage,
    updateData
  } = useFSMv2();
  
  // Services
  const { sendMessage, isStreaming } = useGeminiStream();
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Initialize services
  const eventHandler = useMemo(() => ChatEventHandler.getInstance(), []);
  
  // Use centralized button state
  const { buttons, dispatchEvent, setLoading } = useButtonState();
  
  // Get current button context
  const buttonContext = useMemo<ButtonContext>(() => ({
    stage: currentState,
    phase: conversationState.phase,
    conversationState: conversationState.conversationState,
    waitingForConfirmation: conversationState.isWaitingForConfirmation,
    activeCard: conversationState.activeCard,
    messageCount: messages.length,
    flags: new Set(conversationState.flags || [])
  }), [currentState, conversationState, messages.length]);
  
  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0 && wizardData && blueprintId) {
      initializeConversation();
    }
  }, [wizardData, blueprintId]);
  
  // Update event handler stage
  useEffect(() => {
    chatEventHandler.setCurrentStage(currentState);
  }, [currentState]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chatEventHandler.clearAll();
    };
  }, []);
  
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
      // Fallback
      welcomeContent = `Welcome! Let's begin designing your ${wizardData.subject} experience.`;
    }
    
    // Enforce length limit
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
    
    // Set initial button state
    if (currentState === 'IDEATION_INITIATOR') {
      setButtonContext('default');
    }
  };
  
  // Handle all user interactions through centralized event handler
  const handleUserInteraction = async (event: ChatEvent) => {
    setIsProcessing(true);
    
    try {
      // Process event through centralized handler
      const response = await chatEventHandler.handleEvent(event);
      
      // Handle response
      if (response.message) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          metadata: {
            stage: currentState,
            eventType: event.type,
            responseContext: response.metadata?.responseContext,
            showIdeaCards: response.metadata?.showIdeaCards,
            cardType: response.metadata?.cardType
          }
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Generate idea cards if needed
        if (response.metadata?.showIdeaCards) {
          const ideaOptions = await generateIdeas(response.metadata.cardType || 'ideas');
          // Update the last message with idea options
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1].metadata!.ideaOptions = ideaOptions;
            return updated;
          });
        }
      }
      
      // Update button context based on response
      if (response.metadata?.buttonContext) {
        setButtonContext(response.metadata.buttonContext);
      }
      
      // Handle progression
      if (response.shouldProgress) {
        await progressToNextStage();
      }
      
      // Handle stage transition
      if (response.metadata?.transitionTo) {
        // This would trigger FSM transition
        advance();
      }
      
    } catch (error) {
      console.error('Error processing interaction:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle text input
  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || isStreaming || isProcessing) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Create text event
    const event: ChatEvent = {
      type: 'USER_TEXT',
      payload: {
        text: text.trim(),
        stage: currentState
      },
      metadata: {
        stage: currentState,
        source: 'text_input'
      }
    };
    
    await handleUserInteraction(event);
  };
  
  // Handle card selection - CENTRALIZED
  const handleCardSelection = useCallback(async (option: any, isCardClick: boolean) => {
    if (!isCardClick) {
      // Should not happen with proper implementation
      console.warn('Card selection called without card click');
      return;
    }
    
    // Create card selection event
    const event: ChatEvent = {
      type: 'CARD_SELECTION',
      payload: {
        cardValue: option.title,
        cardType: 'idea',
        stage: currentState,
        fullOption: option
      },
      metadata: {
        stage: currentState,
        source: 'card_click'
      }
    };
    
    // Add a visual indicator that card was selected
    const selectionMessage: ChatMessage = {
      id: `selection-${Date.now()}`,
      role: 'user',
      content: option.title,
      timestamp: new Date(),
      metadata: {
        isCardSelection: true
      }
    };
    
    setMessages(prev => [...prev, selectionMessage]);
    
    // Process the card selection
    await handleUserInteraction(event);
  }, [currentState]);
  
  // Generate stage-appropriate ideas
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
      // Transform to what-if format
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
    // Get captured value from event handler
    const capturedValue = chatEventHandler.getCapturedValue(currentState);
    
    if (capturedValue) {
      // Update journey data
      const newJourneyData = { ...journeyData };
      const stageKey = getCurrentStage().toLowerCase() as 'ideation' | 'journey' | 'deliverables';
      
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
      updateData({ [stageKey]: newJourneyData.stageData[stageKey] });
    }
    
    // Generate recap
    const recap = StageTransitions.generateRecap(stageKey, journeyData);
    
    // Advance FSM
    const result = advance();
    
    if (result.success) {
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
      
      // Enforce length limit
      transitionContent = enforceResponseLength(transitionContent, ResponseContext.TRANSITION);
      
      const transitionMessage: ChatMessage = {
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
      
      // Reset button context for new stage
      setButtonContext('default');
      
      if (result.newState === 'COMPLETE') {
        setTimeout(() => onComplete(), 2000);
      }
    }
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
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => {
              const nextMessage = messages[index + 1];
              const showIdeaCards = message.content.includes('Here are some ideas') && 
                                   (!nextMessage || nextMessage.role !== 'user');
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  {message.role === 'assistant' ? (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="flex-1 max-w-2xl">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm px-6 py-4">
                          <MessageContent content={message.content} />
                          
                          {/* Show idea cards if message contains them */}
                          {message.metadata?.showIdeaCards && message.metadata?.ideaOptions && (
                            <IdeaCardsV2
                              options={message.metadata.ideaOptions}
                              onSelect={handleCardSelection}
                              type={message.metadata.cardType || 'ideas'}
                            />
                          )}
                        </div>
                        {/* Render buttons only for the last message */}
                        {index === messages.length - 1 && !isProcessing && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-wrap gap-2 mt-4"
                          >
                            {buttons.map((button, btnIndex) => {
                              const Icon = getButtonIcon(button.icon);
                              
                              return (
                                <motion.div
                                  key={button.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: btnIndex * 0.1 }}
                                >
                                  <AnimatedButton
                                    onClick={() => buttonStateManager.updateButtonState(
                                      `${currentState}_${buttonContext}`, 
                                      button.id, 
                                      'loading'
                                    )}
                                    variant={button.variant || 'secondary'}
                                    icon={Icon}
                                    size="small"
                                    disabled={button.state === 'disabled' || button.state === 'loading'}
                                  >
                                    {button.state === 'loading' ? (
                                      <AnimatedLoader size="small" />
                                    ) : (
                                      button.label
                                    )}
                                  </AnimatedButton>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-2xl">
                      <div className={`rounded-2xl px-6 py-4 shadow-md ${
                        message.metadata?.isCardSelection 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      }`}>
                        {message.metadata?.isCardSelection && (
                          <div className="text-xs opacity-80 mb-1">Selected:</div>
                        )}
                        {message.content}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
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
              placeholder="Share your ideas..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
              disabled={isStreaming || isProcessing}
            />
            <AnimatedButton
              type="submit"
              disabled={!input.trim() || isStreaming || isProcessing}
              variant="primary"
              icon={isStreaming || isProcessing ? undefined : Send}
            >
              {isStreaming || isProcessing ? (
                <AnimatedLoader size="small" />
              ) : (
                'Send'
              )}
            </AnimatedButton>
          </form>
        </div>
      </div>
    </div>
  );
  
  // Helper function to get icon component
  function getButtonIcon(iconName: string): React.ElementType | undefined {
    const icons: Record<string, React.ElementType> = {
      ArrowRight,
      HelpCircle,
      RefreshCw,
      Edit,
      Lightbulb,
      Rocket,
      Info,
      Check,
      MessageCircle,
      Sparkles,
      Map,
      FileText,
      Layers,
      Brain,
      Target
    };
    
    return icons[iconName];
  }
}