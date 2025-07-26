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
import { AnimatedButton } from '../../components/RiveInteractions';
import { validateStageInput } from '../../lib/validation-system';
import { StagePromptTemplates, generateContextualIdeas } from '../../lib/prompt-templates';
import { ResponseContext, enforceResponseLength } from '../../lib/response-guidelines';

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
  // Journey data
  const [journeyData, setJourneyData] = useState<JourneyDataV3>(() => {
    const saved = localStorage.getItem(`journey-v5-${blueprintId}`);
    return saved ? JSON.parse(saved) : createEmptyJourneyData();
  });
  
  // UI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [capturedValue, setCapturedValue] = useState('');
  
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
  
  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
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
    }
  }, []); // Only run once on mount
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Save journey data
  useEffect(() => {
    localStorage.setItem(`journey-v5-${blueprintId}`, JSON.stringify(journeyData));
  }, [journeyData, blueprintId]);
  
  // Get current buttons based on state
  const getCurrentButtons = useCallback(() => {
    const isFirstMessage = messages.length <= 1;
    
    // If waiting for confirmation
    if (waitingForConfirmation) {
      return [
        { id: 'confirm', label: "Yes, let's go!", action: 'confirm', icon: 'Check', variant: 'primary' },
        { id: 'refine', label: 'Let me refine this', action: 'refine', icon: 'Edit', variant: 'secondary' },
        { id: 'guidance', label: 'I need guidance', action: 'guidance', icon: 'HelpCircle', variant: 'tertiary' }
      ];
    }
    
    // Initial state buttons
    if (currentState === 'IDEATION_INITIATOR' && isFirstMessage) {
      return [
        { id: 'start', label: "Let's Begin", action: 'start', icon: 'Rocket', variant: 'primary' },
        { id: 'tellmore', label: 'Tell Me More', action: 'tellmore', icon: 'Info', variant: 'secondary' }
      ];
    }
    
    // Default suggestion buttons
    return [
      { id: 'ideas', label: 'Ideas', action: 'ideas', icon: 'Lightbulb', variant: 'suggestion' },
      { id: 'whatif', label: 'What-If', action: 'whatif', icon: 'RefreshCw', variant: 'suggestion' },
      { id: 'help', label: 'Help', action: 'help', icon: 'HelpCircle', variant: 'tertiary' }
    ];
  }, [currentState, messages.length, waitingForConfirmation]);
  
  // Handle button clicks
  const handleButtonClick = useCallback(async (button: any) => {
    console.log('Button clicked:', button);
    console.log('Current state:', { isProcessing, isStreaming, messagesLength: messages.length });
    
    if (isProcessing || isStreaming) {
      console.log('Blocked: processing or streaming');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      switch (button.action) {
        case 'confirm':
          await handleConfirmation();
          break;
        case 'refine':
          setWaitingForConfirmation(false);
          setCapturedValue('');
          const refineMessage: Message = {
            id: `refine-${Date.now()}`,
            role: 'assistant',
            content: "Of course! Feel free to refine your answer. What would you like to change?",
            timestamp: new Date(),
            metadata: { stage: currentState }
          };
          setMessages(prev => [...prev, refineMessage]);
          break;
        case 'guidance':
          const guidanceMessage: Message = {
            id: `guidance-${Date.now()}`,
            role: 'assistant',
            content: "I'm here to help! Let me provide some guidance for this step...",
            timestamp: new Date(),
            metadata: { stage: currentState }
          };
          setMessages(prev => [...prev, guidanceMessage]);
          break;
        case 'start':
          const startMessage: Message = {
            id: `start-${Date.now()}`,
            role: 'assistant',
            content: `Great! Let's begin by establishing your Big Idea. This will be the foundation of your entire learning experience.

A Big Idea is a conceptual lens that:
• Connects ${wizardData.subject} to students' lives
• Sparks genuine curiosity
• Guides deep learning

Think about an overarching concept that could make ${wizardData.subject} feel urgent and relevant to your ${wizardData.ageGroup} students. What big idea would you like to explore?`,
            timestamp: new Date(),
            metadata: { stage: currentState }
          };
          setMessages(prev => [...prev, startMessage]);
          break;
        case 'tellmore':
          const infoMessage: Message = {
            id: `info-${Date.now()}`,
            role: 'assistant',
            content: `The ALF Coach helps you design learning experiences using the ALF framework:

**Big Idea**: A transformative concept that makes learning relevant
**Essential Question**: An open-ended question that drives inquiry
**Challenge**: An authentic task where students apply their learning

We'll work together through each stage, and I'll provide ideas and guidance tailored to your ${wizardData.subject} curriculum for ${wizardData.ageGroup} students.

Ready to begin? Click "Let's Begin" when you're ready!`,
            timestamp: new Date(),
            metadata: { stage: currentState }
          };
          setMessages(prev => [...prev, infoMessage]);
          break;
        case 'ideas':
        case 'whatif':
        case 'help':
          await handleSuggestionRequest(button.action);
          break;
      }
    } catch (error) {
      console.error('Button action error:', error);
    } finally {
      // Small delay to ensure state updates have propagated
      setTimeout(() => setIsProcessing(false), 100);
    }
  }, [isProcessing, isStreaming, currentState, wizardData, messages.length]);
  
  // Handle confirmation
  const handleConfirmation = async () => {
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
      setWaitingForConfirmation(false);
      setCapturedValue('');
      
      // Progress to next stage
      await progressToNextStage();
    }
  };
  
  // Handle suggestion requests
  const handleSuggestionRequest = async (type: string) => {
    if (type === 'help') {
      // For help, provide stage-specific guidance
      const templates = StagePromptTemplates[currentState as keyof typeof StagePromptTemplates];
      let helpContent = "Let me help you with this step.\n\n";
      
      if (currentState === 'IDEATION_INITIATOR' || currentState === 'IDEATION_BIG_IDEA') {
        helpContent += "A Big Idea is a conceptual lens that transforms how students see the subject. Examples:\n";
        helpContent += `• For ${wizardData.subject}: "Systems thinking" or "Human impact"\n`;
        helpContent += "• Think about what makes this topic urgent or relevant to students' lives\n";
        helpContent += "• Consider connections to current events or student interests";
      } else if (currentState.includes('EQ')) {
        helpContent += "Essential Questions are open-ended and thought-provoking. They should:\n";
        helpContent += "• Start with How, Why, or In what ways...\n";
        helpContent += "• Have no single right answer\n";
        helpContent += "• Connect to real-world relevance";
      } else if (currentState.includes('CHALLENGE')) {
        helpContent += "Challenges give students authentic tasks. They should:\n";
        helpContent += "• Have a real audience or purpose\n";
        helpContent += "• Allow for creative solutions\n";
        helpContent += "• Demonstrate deep understanding";
      }
      
      const helpMessage: Message = {
        id: `help-${Date.now()}`,
        role: 'assistant',
        content: helpContent,
        timestamp: new Date(),
        metadata: {
          stage: currentState
        }
      };
      
      setMessages(prev => [...prev, helpMessage]);
      return;
    }
    
    // For ideas and what-if, show cards
    const ideas = await generateIdeas(type as 'ideas' | 'whatif');
    
    let content = '';
    if (type === 'ideas') {
      content = "Here are some ideas tailored to your context:";
    } else if (type === 'whatif') {
      content = "Here are some thought-provoking scenarios:";
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
  
  // Handle card selection
  const handleCardSelection = useCallback(async (option: any) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
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
      setCapturedValue(option.title);
      setWaitingForConfirmation(true);
      
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
      
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, currentState]);
  
  // Handle text input
  const handleSendMessage = async (text: string = input) => {
    if (!text.trim() || isStreaming || isProcessing) return;
    
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
      
      // Check if needs confirmation for substantial inputs
      const needsConfirmation = (
        currentState.includes('BIG_IDEA') || 
        currentState.includes('ESSENTIAL_QUESTION') ||
        userText.split(' ').length > 5
      );
      
      if (needsConfirmation) {
        setCapturedValue(userText);
        setWaitingForConfirmation(true);
        
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
    
    // Build a prompt for the AI
    const systemPrompt = `You are an educational design coach helping create meaningful learning experiences.
    Current stage: ${context.stage}
    Subject: ${context.subject}
    Age group: ${context.ageGroup}
    Location: ${context.location || 'Not specified'}
    ${context.bigIdea ? `Big Idea: ${context.bigIdea}` : ''}
    ${context.essentialQuestion ? `Essential Question: ${context.essentialQuestion}` : ''}
    
    User input: ${userInput}
    
    Provide a helpful, encouraging response that guides them toward the next step. Keep responses concise and focused.`;
    
    try {
      // Convert to Gemini message format
      const geminiMessages = [
        {
          role: 'user' as const,
          parts: systemPrompt
        }
      ];
      
      const response = await sendMessage(geminiMessages);
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: typeof response === 'object' && response.text ? response.text : String(response),
        timestamp: new Date(),
        metadata: {
          stage: currentState
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI processing error:', error);
      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having trouble processing that right now. Could you try again?",
        timestamp: new Date(),
        metadata: {
          stage: currentState
        }
      };
      setMessages(prev => [...prev, errorMessage]);
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
        setTimeout(() => onComplete(), 2000);
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
        disabled={button.enabled === false || isProcessing}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium
          transition-all duration-200 transform-gpu
          ${button.variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
          ${button.variant === 'secondary' ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50' : ''}
          ${button.variant === 'tertiary' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}
          ${button.variant === 'suggestion' ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100' : ''}
          ${button.variant === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : ''}
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {Icon && <Icon className="w-5 h-5" />}
        {button.label}
      </motion.button>
    );
  };
  
  const currentButtons = getCurrentButtons();
  
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
                    <MessageContent content={message.content || ''} />
                    
                    {/* Show idea cards if present */}
                    {message.metadata?.showIdeaCards && message.metadata?.ideaOptions && (
                      <div className="mt-4">
                        <IdeaCardsV2
                          options={message.metadata.ideaOptions}
                          onSelect={(option) => handleCardSelection(option)}
                          isActive={isLastMessage && !isProcessing}
                          variant={message.metadata.cardType || 'ideas'}
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
              <div className="animate-pulse">Thinking...</div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area with Buttons */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto p-6">
          {/* Render current buttons */}
          {currentButtons.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {currentButtons.map(renderButton)}
            </div>
          )}
          
          {/* Text input */}
          <div className="flex gap-3">
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
    </div>
  );
}