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
  generateHelpPrompt,
  PromptContext 
} from '../../prompts/journey-v3';
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
  Sparkles
} from 'lucide-react';
import { Progress } from '../../components/ProgressV2';
import { MessageContent } from './MessageContent';
import { IdeaCardsV2, parseIdeasFromResponse, extractGroundingMessage, parseHelpContent } from './IdeaCardsV2';
import { DebugPanel } from './DebugPanel';
import { MilestoneAnimation, useMilestoneTracking } from '../../components/MilestoneAnimation';
import { AnimatedButton, AnimatedCard, AnimatedLoader } from '../../components/RiveInteractions';
import { JourneySummary } from '../../components/JourneySummary';
import { validateStageInput } from '../../lib/validation-system';
import { StagePromptTemplates, generateContextualIdeas, formatAIResponse } from '../../lib/prompt-templates';
import { CardSelection, MessageSource, ResponseContext, ChatMessage as ChatMessageType } from '../../types/chat';
import { 
  enforceResponseLength, 
  addLengthConstraintToPrompt, 
  determineResponseContext,
  formatConfirmationResponse 
} from '../../utils/response-length-control';
import { 
  detectUserIntent as detectUserIntentV2, 
  formatIntentDetection,
  UserIntent,
  IntentContext 
} from '../../utils/intent-detection';

// Use ChatMessage type from types/chat.ts
type ChatMessage = ChatMessageType;

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

// Track conversation depth and progression
interface ConversationState {
  exchangeCount: number;
  hasSharedIdea: boolean;
  ideaMaturity: 'exploring' | 'developing' | 'refining' | 'ready';
  lastProgressCheck: Date;
  lastIntent?: UserIntent;
}

// Stage-aware system prompt
const SYSTEM_PROMPT = `You are an educational design coach helping teachers create transformative learning experiences. Think of yourself as a supportive colleague sitting across from them, having a natural conversation.

Key behaviors:
1. Be conversational, warm, and human - avoid robotic or formulaic responses
2. Show genuine curiosity about their ideas and ask follow-up questions
3. Celebrate their thinking and build on what excites them
4. Guide gently without being prescriptive or assumptive
5. Use natural language - vary your responses, avoid repetitive patterns
6. Listen for intent - they may be brainstorming, questioning, or ready to commit
   - If they say 'maybe' or 'perhaps' or 'I'm thinking', treat it as exploration
   - Only treat clear, definitive statements as final submissions
   - When in doubt, ask for clarification rather than assuming
7. Never assume a response is their final answer unless they explicitly say so
8. Keep responses concise but meaningful - this is a conversation, not a lecture
9. NEVER respond with "Current Big Idea: [their text]" or similar robotic confirmations
10. If they're exploring, engage with questions like "What excites you about that?" or "Tell me more about..."

Remember: This is a collaborative dialogue, not a form to fill out. Help them think, explore, and discover.`;

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
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Track conversation state for intelligent progression
  const [conversationState, setConversationState] = useState<ConversationState>({
    exchangeCount: 0,
    hasSharedIdea: false,
    ideaMaturity: 'exploring',
    lastProgressCheck: new Date(),
    lastIntent: undefined
  });
  
  // Track milestone completions for animations
  const { currentMilestone } = useMilestoneTracking();
  
  const { sendMessage, isStreaming } = useGeminiStream();
  const { 
    currentState, 
    advance, 
    isInitiator,
    isClarifier,
    getCurrentStage,
    saveStageRecap,
    generateStageRecap,
    updateData,
    journeyData: fsmJourneyData
  } = useFSMv2();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Save journey data to localStorage
  useEffect(() => {
    localStorage.setItem(`journey-v4-${blueprintId}`, JSON.stringify(journeyData));
  }, [journeyData, blueprintId]);

  // Initialize conversation for current stage - only on mount
  useEffect(() => {
    console.log('ChatV4 initialization check:', { 
      messagesLength: messages.length, 
      hasWizardData: !!wizardData, 
      blueprintId,
      currentState 
    });
    if (messages.length === 0 && wizardData && blueprintId) {
      initializeStageConversation();
    }
  }, [wizardData, blueprintId]); // Remove currentState dependency to prevent re-initialization

  // Log debug info on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('💡 To enable debug panel, run: enableDebug("panel") in console');
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeStageConversation = () => {
    console.log('Initializing stage conversation...');
    
    // Validate required data
    if (!wizardData || !blueprintId) {
      console.error('Cannot initialize conversation - missing required data:', { 
        wizardData, 
        blueprintId
      });
      return;
    }
    
    // Use proper prompt templates
    const stageContext = {
      subject: wizardData.subject || 'this subject',
      ageGroup: wizardData.ageGroup || 'students',
      location: wizardData.location,
      bigIdea: journeyData.stageData.ideation?.bigIdea,
      essentialQuestion: journeyData.stageData.ideation?.essentialQuestion,
      challenge: journeyData.stageData.ideation?.challenge
    };
    
    let stagePrompt = '';
    const templates = StagePromptTemplates[currentState as keyof typeof StagePromptTemplates];
    
    if (templates && templates.welcome) {
      stagePrompt = templates.welcome(stageContext);
    } else {
      // Fallback to existing prompt generation
      const context: PromptContext = {
        wizardData,
        journeyData,
        currentStage: currentState,
        previousRecaps: Object.values(journeyData.recaps).filter(Boolean)
      };
      stagePrompt = generateStagePrompt(context);
    }
    
    const welcomeMessage: ChatMessage = {
      id: `init-${Date.now()}`,
      role: 'assistant',
      content: stagePrompt,
      timestamp: new Date(),
      quickReplies: getStageQuickReplies(),
      metadata: { stage: currentState }
    };

    console.log('Setting initial welcome message:', welcomeMessage);
    setMessages([welcomeMessage]);
  };

  const getStageQuickRepliesForState = (state: string): QuickReply[] => {
    // Special case for very first message - show Let's Begin and Tell Me More
    if (state === 'IDEATION_INITIATOR' && messages.length <= 1) {
      return [
        { label: "Let's Begin", action: 'start', icon: 'Rocket' },
        { label: 'Tell Me More', action: 'tellmore', icon: 'Info' }
      ];
    }
    
    // IMPORTANT: Only show Continue/Refine when explicitly waiting for confirmation
    if (waitingForConfirmation) {
      return [
        { label: "Yes, let's go!", action: 'continue', icon: 'ArrowRight' },
        { label: 'Let me refine this', action: 'refine', icon: 'Edit' },
        { label: 'I need guidance', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    // Clarifier stages (review stages)
    if (state.includes('_CLARIFIER')) {
      return [
        { label: 'Continue to Next Stage', action: 'continue', icon: 'ArrowRight' },
        { label: 'Edit Something', action: 'edit', icon: 'Edit' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    // Initiator stages (welcome stages)
    if (state.includes('_INITIATOR')) {
      return [
        { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    // Default for all content stages - ALWAYS show these
    const baseReplies = [
      { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
      { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
      { label: 'Help', action: 'help', icon: 'HelpCircle' }
    ];
    
    // Add insights option after some conversation
    if (conversationState.exchangeCount >= 2) {
      baseReplies.push({ label: 'Insights', action: 'insights', icon: 'Sparkles' });
    }
    
    return baseReplies;
  };

  const getStageQuickReplies = (): QuickReply[] => {
    return getStageQuickRepliesForState(currentState);
  };

  const getRefineMessage = (stage: string): string => {
    const stageSpecificMessages: Record<string, string[]> = {
      'IDEATION_BIG_IDEA': [
        "I hear you! Sometimes the big idea needs a bit more spark. What aspect would you like to explore differently?",
        "No worries! Let's massage this idea a bit more. What direction are you thinking?",
        "Great instinct! What would make this big idea feel more aligned with your vision?"
      ],
      'IDEATION_EQ': [
        "Good call! Essential questions can be tricky. What angle would you like to try instead?",
        "I get it - finding the right question is crucial. What's pulling at you?",
        "Smart move! What would make this question more compelling for your students?"
      ],
      'IDEATION_CHALLENGE': [
        "Absolutely! The challenge should feel just right. What would make it more engaging?",
        "I see where you're coming from. How can we make this challenge more authentic?",
        "Good thinking! What adjustments would make this challenge really sing?"
      ],
      'JOURNEY_PHASES': [
        "Makes sense! The journey structure is so important. What flow are you envisioning?",
        "I hear you! Let's reshape these phases. What progression feels more natural?",
        "Great intuition! How would you like to restructure the learning journey?"
      ],
      'JOURNEY_ACTIVITIES': [
        "Totally understand! Activities need to really engage. What would you like to try instead?",
        "Good eye! What kinds of activities would better capture your students' imagination?",
        "Smart thinking! How can we make these activities more hands-on and exciting?"
      ],
      'DELIVERABLES_MILESTONES': [
        "I see it! Milestones should feel celebratory. What would make them more meaningful?",
        "Great point! How can we make these checkpoints more inspiring for students?",
        "Absolutely! What milestones would better showcase student growth?"
      ],
      'DELIVERABLES_ASSESSMENT': [
        "So true! Assessment should feel authentic. What approach resonates more with you?",
        "I get it! How can we make evaluation feel more like a natural part of learning?",
        "Smart move! What assessment methods would better honor student work?"
      ],
      'DELIVERABLES_IMPACT': [
        "Yes! The impact should be tangible. What kind of difference do you envision?",
        "Great thinking! How can we make the real-world connection stronger?",
        "I love it! What impact would make students feel truly empowered?"
      ]
    };

    const defaultMessages = [
      "I hear you! Let's explore this from a different angle. What would you like to adjust?",
      "Good thinking! Sometimes we need to iterate. What direction feels better?",
      "Absolutely! Let's refine this together. What changes are you considering?"
    ];

    const messages = stageSpecificMessages[stage] || defaultMessages;
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Process card selection without adding it as a user message
  const processCardSelection = async (selection: CardSelection, currentMessages: ChatMessage[]) => {
    try {
      // For card selections, we treat them as direct submissions without intent detection
      // This prevents cards from appearing as user messages in the chat
      
      // Validate selection
      if (!selection.value || selection.value.length > 1000) {
        throw new Error('Invalid card selection');
      }
      
      // Clean up the card value (remove any prefixes if needed)
      let processedValue = selection.value.trim();
      
      // If it's a what-if card, make sure it starts with "What if"
      if (selection.type === 'whatif' && !processedValue.toLowerCase().startsWith('what if')) {
        processedValue = `What if ${processedValue}`;
      }
      
      // Create a synthetic user message for processing (not displayed)
      const syntheticUserMessage = {
        id: `synthetic-${Date.now()}`,
        role: 'user' as const,
        content: processedValue,
        timestamp: new Date()
      };
      
      // Process the card selection as a final answer
      await processResponseCore(processedValue, currentMessages);
      
    } catch (error) {
      console.error('Error processing card selection:', error);
      const isNetworkError = error instanceof Error && 
        (error.message.includes('network') || error.message.includes('fetch'));
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: isNetworkError 
          ? "I'm having trouble connecting right now. Please check your internet connection and try again."
          : `I couldn't process your selection "${selection.value}". You can try selecting another option or typing your response directly.`,
        timestamp: new Date(),
        quickReplies: getStageQuickReplies(),
        metadata: { source: 'card', stage: currentState }
      };
      setMessages([...currentMessages, errorMessage]);
    }
  };

  const handleSendMessage = async (source?: MessageSource | string) => {
    // Handle legacy string parameter
    let messageSource: MessageSource;
    if (typeof source === 'string' || !source) {
      messageSource = { type: 'user-input', text: source || input };
    } else {
      messageSource = source;
    }
    
    // Validate based on source type
    if (messageSource.type === 'user-input' && !messageSource.text.trim()) return;
    if (isStreaming || isProcessing) return;

    setIsProcessing(true);
    
    try {
      switch (messageSource.type) {
        case 'quick-action':
          setInput('');
          await handleQuickAction(messageSource.action, messages);
          break;
          
        case 'card-selection':
          setInput('');
          await processCardSelection(messageSource.selection, messages);
          break;
          
        case 'user-input':
          // Handle action commands
          if (messageSource.text.startsWith('action:')) {
            const action = messageSource.text.replace('action:', '');
            setInput('');
            await handleQuickAction(action, messages);
            return;
          }
          
          // Process regular user input
          await processUserInput(messageSource.text);
          break;
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processUserInput = async (messageText: string) => {
    const trimmedText = messageText.trim();
    if (!trimmedText) return;
    
    // Regular user input
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

      // Handle typed commands (not from quick action buttons)
      const lowerMessage = messageText.toLowerCase().trim();
      
      // Handle initiator stage input
      if (currentState === 'IDEATION_INITIATOR' || isInitiator()) {
        // Check if user is asking questions or expressing confusion
        const isAskingQuestions = lowerMessage.includes('?') || 
                                 lowerMessage.includes('what') || 
                                 lowerMessage.includes('how') || 
                                 lowerMessage.includes('why') ||
                                 lowerMessage.includes('confused') ||
                                 lowerMessage.includes('tell me more') ||
                                 lowerMessage.includes('explain') ||
                                 lowerMessage.includes('help');
        
        if (isAskingQuestions) {
          // Show "Tell Me More" content
          await handleQuickAction('tellmore', updatedMessages);
        } else {
          // User is ready to start - add a friendly transition message
          const transitionMessage: ChatMessage = {
            id: `transition-${Date.now()}`,
            role: 'assistant',
            content: "Perfect! Let's dive in and start building something amazing together.",
            timestamp: new Date(),
            metadata: { stage: currentState }
          };
          setMessages([...updatedMessages, transitionMessage]);
          
          // Brief pause for the message to be read, then transition
          setTimeout(() => progressToNextStage(), 800);
        }
        return;
      }
      
      // Handle stage progression commands
      if (['continue', 'next', 'proceed'].includes(lowerMessage) && isClarifier()) {
        await progressToNextStage();
        return;
      }
      
      // Handle idea/whatif/help commands
      if (['ideas', 'what-if', 'whatif', 'help'].includes(lowerMessage)) {
        await handleQuickAction(lowerMessage.replace('-', ''), updatedMessages);
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

      // Handle continue/refine from confirmation state
      if (waitingForConfirmation) {
        if (['continue', 'yes', 'proceed', 'next'].includes(lowerMessage)) {
          setWaitingForConfirmation(false);
          await progressToNextStage();
          return;
        } else if (['refine', 'edit', 'change'].includes(lowerMessage)) {
          setWaitingForConfirmation(false);
          // Show the prompt again
          const repeatMessage: ChatMessage = {
            id: `repeat-${Date.now()}`,
            role: 'assistant',
            content: getRefineMessage(currentState),
            timestamp: new Date(),
            quickReplies: [
              { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
              { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
              { label: 'Help', action: 'help', icon: 'HelpCircle' }
            ]
          };
          setMessages([...updatedMessages, repeatMessage]);
          return;
        }
        // If neither continue nor refine, treat as new input and reset confirmation
        setWaitingForConfirmation(false);
      }
      
      // Process and store the response
      await processUserResponse(messageText, updatedMessages);
      setLastError(null); // Clear error on success
      
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      setLastError(err.message || 'Unknown error occurred');
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        quickReplies: getStageQuickReplies()
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (action: string, currentMessages: ChatMessage[]) => {
    switch (action) {
      case 'ideas':
      case 'whatif':
        // Don't add the action as a message - just generate suggestions
        await generateSuggestions(action as 'ideas' | 'whatif', currentMessages);
        break;
        
      case 'help':
        await showHelp(currentMessages);
        break;
        
      case 'tellmore':
        if (currentState === 'IDEATION_INITIATOR') {
          const alfMessage: ChatMessage = {
            id: `alf-info-${Date.now()}`,
            role: 'assistant',
            content: `## About the ALF Framework

The **Authentic Learning Framework (ALF)** is built on decades of educational research showing that students learn best when:

- **Learning is relevant** to their lives and communities
- **They solve real problems** with authentic audiences
- **They create meaningful products** that matter beyond grades
- **They develop agency** through choice and ownership

### Our Approach

ProjectCraft guides you through a proven design process:

1. **Start with Why** - Identify compelling concepts that resonate
2. **Frame the Journey** - Design exploration through essential questions  
3. **Create for Impact** - Build authentic challenges with real outcomes
4. **Support Success** - Scaffold with phases, activities, and resources

This isn't about lesson planning - it's about designing transformative experiences where students become creators, problem-solvers, and changemakers.

Ready to transform your teaching?`,
            timestamp: new Date(),
            quickReplies: [
              { label: "Let's Begin", action: 'start', icon: 'Rocket' }
            ],
            metadata: { stage: currentState }
          };
          setMessages([...currentMessages, alfMessage]);
        }
        break;
        
      case 'start':
        if (currentState === 'IDEATION_INITIATOR' || isInitiator()) {
          // For "Let's Begin", just advance without any completion message
          await progressToNextStage();
        }
        break;
        
      case 'continue':
        if (isClarifier() || waitingForConfirmation) {
          setWaitingForConfirmation(false);
          await progressToNextStage();
        }
        break;
        
      case 'refine':
        if (waitingForConfirmation) {
          setWaitingForConfirmation(false);
          // Show the prompt again
          const repeatMessage: ChatMessage = {
            id: `repeat-${Date.now()}`,
            role: 'assistant',
            content: getRefineMessage(currentState),
            timestamp: new Date(),
            quickReplies: [
              { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
              { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
              { label: 'Help', action: 'help', icon: 'HelpCircle' }
            ]
          };
          setMessages([...currentMessages, repeatMessage]);
        }
        break;
        
      case 'submit':
        // User is explicitly ready to submit their idea
        // Find their most recent non-action message
        const userMessages = currentMessages.filter(m => m.role === 'user' && !m.content.startsWith('action:'));
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        if (lastUserMessage) {
          // Mark that this is an explicit submission
          setWaitingForConfirmation(false);
          // Process as final answer
          await processUserResponseAsFinal(lastUserMessage.content, currentMessages);
        }
        break;
        
      case 'share':
        // User wants to share more thoughts
        const sharePrompt: ChatMessage = {
          id: `share-prompt-${Date.now()}`,
          role: 'assistant',
          content: "I'm listening! Share what's on your mind - whether it's a question, an idea you're exploring, or something you're wondering about. Take your time.",
          timestamp: new Date(),
          quickReplies: [
            { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
            { label: 'What-If', action: 'whatif', icon: 'RefreshCw' }
          ],
          metadata: { stage: currentState }
        };
        setMessages([...currentMessages, sharePrompt]);
        break;
        
      case 'elaborate':
        // User wants to elaborate on their short answer
        const elaboratePrompt: ChatMessage = {
          id: `elaborate-prompt-${Date.now()}`,
          role: 'assistant',
          content: "I'd love to hear more! Tell me about the thinking behind your idea - what inspired it, how you see it working, or what excites you about it.",
          timestamp: new Date(),
          quickReplies: [
            { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' }
          ],
          metadata: { stage: currentState }
        };
        setMessages([...currentMessages, elaboratePrompt]);
        break;
        
      case 'insights':
        // Show ProjectCraft value-add: stage connections and pedagogical insights
        await showStageInsights(currentMessages);
        break;
        
      default:
        console.warn('Unknown action:', action);
    }
  };

  const handleBrainstormingResponse = async (response: string, currentMessages: ChatMessage[], userIntent?: UserIntent) => {
    try {
      // Get conversation history for context
      const recentMessages = currentMessages.slice(-5); // Last 5 messages for context
      const conversationContext = recentMessages
        .map(m => `${m.role === 'user' ? 'Teacher' : 'Coach'}: ${m.content}`)
        .join('\n');
      
      // Add intent-aware context to prompts
      let intentContext = '';
      if (userIntent === 'exploring') {
        intentContext = '\nThe teacher is exploring ideas and thinking out loud. Be curious, ask open-ended questions, and help them discover insights.';
      } else if (userIntent === 'elaborating') {
        intentContext = '\nThe teacher is building on their previous thoughts. Acknowledge what they\'ve added and help them go deeper.';
      } else if (userIntent === 'uncertain') {
        intentContext = '\nThe teacher seems uncertain. Provide gentle guidance and reassurance while helping them find clarity.';
      }
      
      // Create stage-specific brainstorming prompts
      const stagePrompts: Record<string, string> = {
        'IDEATION_BIG_IDEA': `The teacher is exploring concepts for their unit. They're thinking about: "${response}"

Context:
- Subject: ${wizardData.subject}
- Age group: ${wizardData.ageGroup}
- Location: ${wizardData.location || 'Not specified'}

Recent conversation:
${conversationContext}

Respond as a supportive coach who helps them develop their big idea. Show enthusiasm for what excites them. Ask questions that help them:
- Connect to their students' lived experiences
- Think about real-world relevance
- Consider the "why" behind their concept
- Explore different angles or perspectives

Keep it conversational, warm, and curious. End with 1-2 thought-provoking questions.`,

        'IDEATION_EQ': `The teacher is crafting their essential question. They're considering: "${response}"

Context:
- Big Idea: ${journeyData.stageData.ideation.bigIdea}
- Subject: ${wizardData.subject}
- Age group: ${wizardData.ageGroup}

Recent conversation:
${conversationContext}

Help them develop a powerful essential question. Be encouraging about their thinking process. Guide them to consider:
- Is it open-ended with multiple valid answers?
- Does it spark genuine curiosity?
- Will it sustain inquiry throughout the unit?
- Does it connect to students' lives?

Respond naturally, acknowledge their ideas, and ask questions that help refine their thinking.`,

        'IDEATION_CHALLENGE': `The teacher is designing their authentic challenge. They're proposing: "${response}"

Context:
- Big Idea: ${journeyData.stageData.ideation.bigIdea}
- Essential Question: ${journeyData.stageData.ideation.essentialQuestion}
- Subject: ${wizardData.subject}
- Age group: ${wizardData.ageGroup}

Recent conversation:
${conversationContext}

Support them in creating a meaningful challenge. Show excitement for their ideas. Help them think about:
- Who is the authentic audience?
- What real impact could this have?
- How does it connect to the essential question?
- What will make students care deeply?

Be conversational and supportive. Ask questions that help them envision success.`
      };
      
      const defaultPrompt = `The teacher is brainstorming ideas. They shared: "${response}"

Current stage: ${currentState}
Subject: ${wizardData.subject}
Age group: ${wizardData.ageGroup}

Recent conversation:
${conversationContext}

Respond as an encouraging coach. Show genuine interest in their thinking. Ask thoughtful follow-up questions that help them develop and refine their ideas. Keep it natural, warm, and conversational.`;
      
      // Add intent context to all prompts
      const basePrompt = stagePrompts[currentState] || defaultPrompt;
      const brainstormPrompt = basePrompt + intentContext;
      
      // Add length constraint to prompt
      const promptWithLengthControl = addLengthConstraintToPrompt(
        brainstormPrompt,
        ResponseContext.BRAINSTORMING
      );

      const geminiMessages = [
        { role: 'system' as const, parts: SYSTEM_PROMPT },
        { role: 'user' as const, parts: promptWithLengthControl }
      ];

      const result = await sendMessage(geminiMessages);
      
      if (result) {
        // Apply response length control for brainstorming
        const responseContext = ResponseContext.BRAINSTORMING;
        const lengthControlled = enforceResponseLength(result.text, responseContext);
        
        const conversationalResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: lengthControlled.text,
          timestamp: new Date(),
          quickReplies: [
            { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
            { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
            { label: 'This is my idea', action: 'submit', icon: 'ArrowRight' }
          ],
          metadata: { 
            stage: currentState, 
            type: 'brainstorming',
            responseLength: lengthControlled.wordCount
          }
        };
        
        setMessages([...currentMessages, conversationalResponse]);
      }
    } catch (error) {
      console.error('Error generating brainstorming response:', error);
    }
  };

  const generateSuggestions = async (type: 'ideas' | 'whatif', currentMessages: ChatMessage[]) => {
    try {
      const stageContext = {
        subject: wizardData.subject || 'this subject',
        ageGroup: wizardData.ageGroup || 'students', 
        location: wizardData.location,
        bigIdea: journeyData.stageData.ideation?.bigIdea,
        essentialQuestion: journeyData.stageData.ideation?.essentialQuestion,
        challenge: journeyData.stageData.ideation?.challenge
      };
      
      // Generate contextual ideas using the new system
      const contextualIdeas = generateContextualIdeas(currentState, stageContext);
      
      // Create a properly formatted message
      let suggestionContent = '';
      
      if (type === 'ideas') {
        suggestionContent = `Here are some ideas tailored to your context:\n\n`;
        contextualIdeas.forEach((idea, index) => {
          suggestionContent += `${index + 1}. ${idea}\n`;
        });
        suggestionContent += `\nThese are starting points - feel free to adapt them or share your own ideas!`;
      } else {
        // Generate what-if scenarios with AI
        const prompt = generateAIPrompt(type, {
          wizardData,
          journeyData,
          currentStage: currentState
        });
        
        // Add length constraint for suggestions
        const promptWithLengthControl = addLengthConstraintToPrompt(
          prompt,
          ResponseContext.BRAINSTORMING
        );

        const geminiMessages = [
          { role: 'system' as const, parts: SYSTEM_PROMPT },
          { role: 'user' as const, parts: promptWithLengthControl }
        ];

        const response = await sendMessage(geminiMessages);
        // Apply response length control for suggestions
        const lengthControlled = enforceResponseLength(response.text, ResponseContext.BRAINSTORMING);
        suggestionContent = lengthControlled.text;
      }
      
      const suggestionMessage: ChatMessage = {
        id: `suggestion-${Date.now()}`,
        role: 'assistant',
        content: suggestionContent,
        timestamp: new Date(),
        quickReplies: getStageQuickReplies(),
        metadata: { stage: currentState, type: 'suggestions' }
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
    try {
      // Generate contextual help with AI
      const prompt = generateHelpPrompt(
        currentState,
        wizardData.subject,
        wizardData.ageGroup,
        wizardData.location || '',
        journeyData
      );
      
      // Add length constraint for help content
      const promptWithLengthControl = addLengthConstraintToPrompt(
        prompt,
        ResponseContext.HELP_CONTENT
      );

      const geminiMessages = [
        { role: 'system' as const, parts: SYSTEM_PROMPT },
        { role: 'user' as const, parts: promptWithLengthControl }
      ];

      const response = await sendMessage(geminiMessages);
      
      // Apply response length control for help content
      const lengthControlled = enforceResponseLength(response.text, ResponseContext.HELP_CONTENT);
      
      const helpMessage: ChatMessage = {
        id: `help-${Date.now()}`,
        role: 'assistant',
        content: lengthControlled.text,
        timestamp: new Date(),
        quickReplies: getStageQuickReplies(),
        metadata: {
          stage: currentState,
          responseLength: lengthControlled.wordCount
        }
      };

      setMessages([...currentMessages, helpMessage]);
      
    } catch (error) {
      console.error('Error generating help:', error);
      // Fallback to static help
      const fallbackMessage: ChatMessage = {
        id: `help-fallback-${Date.now()}`,
        role: 'assistant',
        content: getStageHelp(),
        timestamp: new Date(),
        quickReplies: getStageQuickReplies()
      };
      setMessages([...currentMessages, fallbackMessage]);
    }
  };
  
  // ProjectCraft Value-Add: Show pedagogical insights and stage connections
  const showStageInsights = async (currentMessages: ChatMessage[]) => {
    try {
      const insights = generateStageInsights();
      
      const insightMessage: ChatMessage = {
        id: `insight-${Date.now()}`,
        role: 'assistant',
        content: insights,
        timestamp: new Date(),
        quickReplies: [
          { label: 'This helps!', action: 'share', icon: 'MessageCircle' },
          { label: 'Show examples', action: 'ideas', icon: 'Lightbulb' }
        ],
        metadata: { stage: currentState, type: 'pedagogical-insight' }
      };
      
      setMessages([...currentMessages, insightMessage]);
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };
  
  const generateStageInsights = (): string => {
    const stageInsights: Record<string, string> = {
      'IDEATION_BIG_IDEA': `### 🎓 Pedagogical Insight: Why Big Ideas Matter

Research shows that conceptual anchors increase retention by 40%. Your Big Idea serves three critical functions:
- **Relevance Bridge**: Connects academic content to students' lived experiences
- **Inquiry Driver**: Creates genuine curiosity that sustains engagement
- **Transfer Tool**: Helps students apply learning to new contexts

💡 **Pro tip**: The best Big Ideas feel urgent to students - they address something that matters in their world right now.`,

      'IDEATION_EQ': `### 🎓 Pedagogical Insight: The Power of Essential Questions

Your Essential Question does heavy lifting:
- **Cognitive Demand**: Requires higher-order thinking (analysis, synthesis, evaluation)
- **Multiple Perspectives**: No single "right" answer encourages diverse viewpoints
- **Sustained Inquiry**: Complex enough to explore over weeks, not minutes

${journeyData.stageData.ideation.bigIdea ? `\n💡 **Connection**: Your Big Idea "${journeyData.stageData.ideation.bigIdea}" should directly inform this question. Students explore the Big Idea BY investigating the Essential Question.` : ''}`,

      'IDEATION_CHALLENGE': `### 🎓 Pedagogical Insight: Authentic Challenges Transform Learning

Authentic challenges activate what researchers call "productive struggle":
- **Purpose**: Real audience = real motivation
- **Agency**: Students make meaningful choices
- **Impact**: Work lives beyond the gradebook

${journeyData.stageData.ideation.essentialQuestion ? `\n💡 **Connection**: Your challenge should be the vehicle through which students answer "${journeyData.stageData.ideation.essentialQuestion}"` : ''}

🌟 **ProjectCraft Advantage**: We'll help you scaffold this challenge across multiple phases, ensuring all students can succeed while maintaining high expectations.`,

      'JOURNEY_PHASES': `### 🎓 Pedagogical Insight: Strategic Sequencing

Learning phases follow research-backed progressions:
- **Activate** → **Investigate** → **Create** → **Reflect**
- Each phase builds cognitive load gradually
- Mixed individual/collaborative work maximizes engagement

💡 **Design Principle**: Front-load curiosity, back-load complexity. Students should feel pulled forward by interest, not pushed by requirements.`,

      'DELIVERABLES_ASSESSMENT': `### 🎓 Pedagogical Insight: Assessment AS Learning

Modern assessment theory emphasizes:
- **Formative > Summative**: Ongoing feedback accelerates growth
- **Self-Assessment**: Students tracking their own progress builds metacognition
- **Authentic Evidence**: Performance tasks over traditional tests

🌟 **ProjectCraft Edge**: Our framework embeds assessment naturally into the work, so evaluation feels like part of the journey, not an interruption.`
    };
    
    return stageInsights[currentState] || `### 🎓 Insight: Building Coherent Learning Experiences

Every choice you make connects to create a unified experience. ProjectCraft ensures:
- Each stage builds logically on the previous
- Student work accumulates toward meaningful outcomes
- Assessment aligns with authentic goals

Keep going - you're designing something transformative!`;
  };

  // Map new intent system to legacy intent for backward compatibility
  const mapToLegacyIntent = (intent: UserIntent): 'brainstorming' | 'question' | 'submission' | 'clarification' => {
    switch (intent) {
      case 'exploring':
      case 'elaborating':
        return 'brainstorming';
      case 'questioning':
      case 'uncertain':
        return 'question';
      case 'submitting':
      case 'confirming':
        return 'submission';
      case 'refining':
        return 'clarification';
      default:
        return 'brainstorming';
    }
  };

  const getStageHelp = (): string => {
    // Per SOP: Help = Meta-guide + Exemplar
    const { subject, ageGroup } = wizardData;
    
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        return `**Understanding Big Ideas**

A Big Idea is the conceptual anchor for your entire unit - the "why" that makes learning matter.

**For ${subject} with ${ageGroup} students:**

Strong Big Ideas:
• Connect to enduring human themes
• Bridge academic content to real life
• Spark genuine curiosity

**Exemplar:** "*Technology as a force for social change*" transforms a tech class into an exploration of how we shape our world.

**Tips:**
- Think beyond facts to concepts
- Consider what matters to your students
- Look for universal themes`;
        
      case 'IDEATION_EQ':
        const bigIdea = journeyData.stageData.ideation.bigIdea || 'your concept';
        return `**Crafting Essential Questions**

An Essential Question drives the entire inquiry - open-ended, thought-provoking, and meaningful.

**Building on your Big Idea: "${bigIdea}"**

Effective Essential Questions:
• Have multiple valid answers
• Require investigation and thinking
• Connect to students' lives

**Exemplar:** "*How might we use technology to amplify unheard voices in our community?*"

**Starter words:** How might..., In what ways..., Why does..., What if...`;
        
      case 'IDEATION_CHALLENGE':
        const eq = journeyData.stageData.ideation.essentialQuestion || 'your question';
        return `**Designing Authentic Challenges**

A Challenge gives students real purpose - something meaningful to create, solve, or contribute.

**Aligned with:** "${eq}"

Powerful Challenges:
• Have genuine audience/purpose
• Allow creative approaches
• Result in tangible outcomes

**Exemplar:** "*Design and launch a digital campaign that addresses a local social issue*"

**Action verbs:** Create, Design, Build, Develop, Launch, Solve, Transform`;
        
      default:
        return `**Getting Oriented**

This stage helps you move forward in your design.

Need specific guidance? Try:
• **Ideas** - See examples tailored to your context
• **What-If** - Explore creative possibilities
• Share what you're thinking and I'll help shape it!`;
    }
  };

  // Legacy intent detection - kept for compatibility
  const detectUserIntentLegacy = (input: string, stage: string, conversationHistory: ChatMessage[] = []): 'brainstorming' | 'question' | 'submission' | 'clarification' => {
    const lowerInput = input.toLowerCase();
    const wordCount = input.split(' ').length;
    
    // Questions - expanded detection
    const questionIndicators = [
      '?',
      /^(what|when|where|who|why|how|which|can|could|should|would|will|is|are|do|does|did)\s/i,
      /\b(wondering|curious|asking|question)\b/i,
      /^(tell me|explain|help me understand)\b/i
    ];
    
    if (questionIndicators.some(indicator => 
      typeof indicator === 'string' ? input.includes(indicator) : indicator.test(input)
    )) {
      return 'question';
    }
    
    // Brainstorming - more comprehensive detection
    const brainstormingPhrases = [
      // Tentative language
      'maybe', 'perhaps', 'possibly', 'might', 'could be', 'potentially',
      // Exploration language  
      'thinking about', 'exploring', 'considering', 'wondering if',
      'what if', 'how about', 'what about',
      // Ideation language
      'i want', 'i\'d like', 'i envision', 'imagine if',
      'draft', 'develop', 'create',
      // Comparative language
      'like', 'such as', 'for example', 'similar to',
      // Process language
      'start with', 'begin by', 'first', 'then',
      // Uncertainty markers
      'sort of', 'kind of', 'something like'
    ];
    
    const brainstormingScore = brainstormingPhrases.filter(phrase => 
      lowerInput.includes(phrase)
    ).length;
    
    // Check for stream of consciousness (longer, less structured responses)
    const hasMultipleClauses = (input.match(/,|;| - | and | or | but /g) || []).length >= 2;
    const isConversational = wordCount > 20 && hasMultipleClauses;
    
    if (brainstormingScore >= 2 || (brainstormingScore >= 1 && isConversational)) {
      return 'brainstorming';
    }
    
    // Clarification needs
    const clarificationPhrases = [
      'not sure', 'confused', 'don\'t understand', 'unclear',
      'help me', 'can you explain', 'what do you mean',
      'lost', 'stuck', 'need help'
    ];
    
    if (clarificationPhrases.some(phrase => lowerInput.includes(phrase))) {
      return 'clarification';
    }
    
    // Check context - if previous message was a brainstorming response, 
    // short follow-ups might still be brainstorming
    if (conversationHistory.length > 0) {
      const lastAssistantMessage = [...conversationHistory].reverse()
        .find(m => m.role === 'assistant');
      
      if (lastAssistantMessage?.metadata?.type === 'brainstorming' && wordCount < 10) {
        // Short responses after brainstorming prompts are likely continuations
        return 'brainstorming';
      }
    }
    
    // Submission indicators - clear, declarative statements
    const submissionIndicators = [
      /^(my|the|our)\s+(big idea|essential question|challenge|answer)\s+(is|will be)/i,
      /^(here('s| is)|this is)\s+(my|the|our)/i,
      /^\w+\s+as\s+\w+/i, // "Technology as transformation" pattern
      wordCount < 15 && !hasMultipleClauses // Short, direct statements
    ];
    
    if (submissionIndicators.some(indicator => 
      typeof indicator === 'boolean' ? indicator : indicator.test(input)
    )) {
      return 'submission';
    }
    
    // Default based on response length and structure
    return wordCount > 25 || hasMultipleClauses ? 'brainstorming' : 'submission';
  };

  const processUserResponseAsFinal = async (response: string, currentMessages: ChatMessage[]) => {
    // Process directly as final answer without intent detection
    await processResponseCore(response, currentMessages);
  };

  // Analyze the maturity of an idea based on specific indicators
  const analyzeIdeaMaturity = (idea: string, stage: string): 'exploring' | 'developing' | 'refining' | 'ready' => {
    const wordCount = idea.split(' ').length;
    const hasSpecifics = /\b(students will|learners will|they will|we will)\b/i.test(idea);
    const hasContext = /\b(because|since|as|to|in order to|so that)\b/i.test(idea);
    const hasClarity = wordCount > 10 && !idea.includes('maybe') && !idea.includes('possibly');
    
    if (stage === 'IDEATION_BIG_IDEA') {
      const hasConceptualDepth = /\b(as|through|by|using|with)\b/i.test(idea);
      if (hasConceptualDepth && hasContext && wordCount > 8) return 'ready';
      if (hasConceptualDepth || hasContext) return 'refining';
      if (wordCount > 5) return 'developing';
    }
    
    if (stage === 'IDEATION_EQ') {
      const isQuestion = idea.includes('?');
      const hasQuestionWord = /^(how|what|why|in what ways|to what extent)/i.test(idea);
      if (isQuestion && hasQuestionWord && wordCount > 8) return 'ready';
      if (isQuestion && hasQuestionWord) return 'refining';
      if (isQuestion || hasQuestionWord) return 'developing';
    }
    
    if (stage === 'IDEATION_CHALLENGE') {
      const hasActionVerb = /\b(create|design|build|develop|launch|solve|transform|investigate)\b/i.test(idea);
      const hasOutcome = /\b(that|which|to|for)\b/i.test(idea);
      if (hasActionVerb && hasOutcome && hasSpecifics) return 'ready';
      if (hasActionVerb && (hasOutcome || hasSpecifics)) return 'refining';
      if (hasActionVerb) return 'developing';
    }
    
    return 'exploring';
  };

  // Generate progression nudges based on conversation state
  const generateContextualConfirmation = (
    response: string,
    stage: string,
    intentResult: ReturnType<typeof detectUserIntentV2>
  ): string => {
    const templates = {
      exploring: [
        `I can see you're exploring "${response}". This sounds intriguing! Is this the direction you want to commit to, or would you like to explore other angles?`,
        `"${response}" - there's something compelling here. Are you ready to move forward with this, or shall we develop it further?`
      ],
      uncertain: [
        `I sense you might still be working through this idea: "${response}". That's perfectly fine! Should we go with this, or would you like to explore some examples for inspiration?`,
        `"${response}" - sometimes the first version leads us to something even better. Want to refine this together or move forward?`
      ],
      tentative: [
        `I hear you exploring the idea of "${response}". This has potential! Would you like to develop this further or try a different direction?`,
        `"${response}" - I can see you're working through this concept. Should we explore it more deeply or consider other angles?`
      ],
      default: [
        `So you're thinking "${response}". I like the direction! Ready to build on this foundation?`,
        `"${response}" captures an interesting angle. Shall we move forward with this?`
      ]
    };
    
    const intentTemplates = templates[intentResult.intent] || templates.default;
    return intentTemplates[Math.floor(Math.random() * intentTemplates.length)];
  };

  const generateProgressionNudge = (state: ConversationState, currentStage: string): string | null => {
    // Don't nudge too frequently
    const timeSinceLastCheck = Date.now() - state.lastProgressCheck.getTime();
    if (timeSinceLastCheck < 60000) return null; // Wait at least 1 minute between nudges
    
    if (state.exchangeCount >= 4 && state.ideaMaturity === 'exploring') {
      return "I'm loving this exploration! When you feel you've landed on something that resonates, just let me know and we can build on it.";
    }
    
    if (state.exchangeCount >= 6 && state.ideaMaturity === 'developing') {
      return "Your thinking is really taking shape! Feel free to keep refining, or if you're happy with where this is heading, we can move forward.";
    }
    
    if (state.ideaMaturity === 'ready' && state.exchangeCount >= 3) {
      return "This sounds fantastic! Are you feeling good about this, or would you like to explore other angles?";
    }
    
    return null;
  };

  // Detect conversation loops or stuck points
  const detectConversationLoop = (messages: ChatMessage[]): boolean => {
    if (messages.length < 6) return false;
    
    // Check if the last 3 user messages are very similar
    const recentUserMessages = messages
      .filter(m => m.role === 'user')
      .slice(-3)
      .map(m => m.content.toLowerCase());
    
    if (recentUserMessages.length < 3) return false;
    
    // Simple similarity check - could be enhanced
    const uniqueWords = new Set(recentUserMessages.flatMap(m => m.split(' ')));
    const totalWords = recentUserMessages.join(' ').split(' ').length;
    const uniquenessRatio = uniqueWords.size / totalWords;
    
    return uniquenessRatio < 0.6; // If less than 60% unique words, might be looping
  };

  const handleQuestionResponse = async (question: string, currentMessages: ChatMessage[]) => {
    try {
      // Get conversation context
      const recentMessages = currentMessages.slice(-3);
      const conversationContext = recentMessages
        .map(m => `${m.role === 'user' ? 'Teacher' : 'Coach'}: ${m.content}`)
        .join('\n');
      
      const questionPrompt = `The teacher is asking a question: "${question}"

Current stage: ${currentState}
Subject: ${wizardData.subject}
Age group: ${wizardData.ageGroup}

Recent conversation:
${conversationContext}

Provide a helpful, encouraging response that:
- Directly answers their question
- Gives concrete examples when helpful
- Maintains a supportive, coaching tone
- Encourages them to keep exploring
- Ends with an invitation to continue the conversation

Keep it conversational and supportive.`;
      
      // Add length constraint to prompt
      const promptWithLengthControl = addLengthConstraintToPrompt(
        questionPrompt,
        ResponseContext.BRAINSTORMING
      );

      const geminiMessages = [
        { role: 'system' as const, parts: SYSTEM_PROMPT },
        { role: 'user' as const, parts: promptWithLengthControl }
      ];

      const result = await sendMessage(geminiMessages);
      
      if (result) {
        // Apply response length control for question responses
        const lengthControlled = enforceResponseLength(result.text, ResponseContext.BRAINSTORMING);
        
        const questionResponse: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: lengthControlled.text,
          timestamp: new Date(),
          quickReplies: [
            { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
            { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
            { label: 'Share my thoughts', action: 'share', icon: 'MessageCircle' }
          ],
          metadata: { 
            stage: currentState, 
            type: 'question-response',
            responseLength: lengthControlled.wordCount
          }
        };
        
        setMessages([...currentMessages, questionResponse]);
      }
    } catch (error) {
      console.error('Error generating question response:', error);
    }
  };

  const processUserResponse = async (response: string, currentMessages: ChatMessage[]) => {
    // Update conversation state
    const newConversationState = {
      ...conversationState,
      exchangeCount: conversationState.exchangeCount + 1,
      hasSharedIdea: true
    };
    
    // First, validate the input based on the current stage
    const validationContext = {
      subject: wizardData.subject,
      ageGroup: wizardData.ageGroup,
      location: wizardData.location,
      bigIdea: journeyData.stageData.ideation?.bigIdea,
      essentialQuestion: journeyData.stageData.ideation?.essentialQuestion
    };
    
    const validation = validateStageInput(response, currentState, validationContext);
    
    // If there are validation errors, guide the user
    if (!validation.isValid && validation.issues.some(i => i.severity === 'error')) {
      const templates = StagePromptTemplates[currentState as keyof typeof StagePromptTemplates];
      let validationResponse = '';
      
      // Special handling for "I am interested in..." patterns for Essential Questions
      if (currentState === 'IDEATION_EQ' && /^(i am interested in|i like|i want to explore)/i.test(response.trim())) {
        if (templates && templates.transformation_help) {
          validationResponse = templates.transformation_help(response, validationContext);
        }
      } else if (templates && templates.validation_response) {
        const errors = validation.issues.filter(i => i.severity === 'error').map(i => i.message);
        validationResponse = templates.validation_response(errors, validation.suggestions, response);
      } else {
        // Fallback
        validationResponse = validation.suggestions.join('\n\n') || 'Let\'s work on refining this together.';
      }
      
      const guidanceMessage: ChatMessage = {
        id: `guidance-${Date.now()}`,
        role: 'assistant',
        content: validationResponse,
        timestamp: new Date(),
        quickReplies: [
          { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
          { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
          { label: 'Help', action: 'help', icon: 'HelpCircle' }
        ],
        metadata: { stage: currentState, type: 'validation-guidance' }
      };
      
      setMessages([...currentMessages, guidanceMessage]);
      setConversationState(newConversationState);
      return;
    }
    
    // Transform input if needed (e.g., "I like mushrooms" for EQ stage)
    const processedInput = validation.transformedInput || response;
    
    // Use improved intent detection
    const intentContext: IntentContext = {
      currentStage: currentState,
      messageHistory: currentMessages.slice(-5).map(m => ({ 
        role: m.role, 
        content: m.content 
      })),
      previousIntent: conversationState.lastIntent as UserIntent | undefined,
      conversationTurns: conversationState.exchangeCount
    };
    
    const intentResult = detectUserIntentV2(processedInput, intentContext);
    console.log('Advanced intent detection:', formatIntentDetection(intentResult));
    
    // Map new intent to legacy intent for compatibility
    const intent = mapToLegacyIntent(intentResult.intent);
    console.log('Mapped to legacy intent:', intent);
    
    // Analyze idea maturity if they've shared something substantial
    if (intent === 'brainstorming' || intent === 'submission') {
      const maturity = analyzeIdeaMaturity(processedInput, currentState);
      newConversationState.ideaMaturity = maturity;
      console.log('Idea maturity:', maturity);
    }
    
    // Check for conversation loops
    if (detectConversationLoop(currentMessages)) {
      const loopBreaker: ChatMessage = {
        id: `loop-break-${Date.now()}`,
        role: 'assistant',
        content: "I notice we might be going in circles. Let me offer a different perspective. What if we tried looking at this from your students' point of view? What would make them excited about this?",
        timestamp: new Date(),
        quickReplies: [
          { label: 'Good point', action: 'share', icon: 'MessageCircle' },
          { label: 'Show me examples', action: 'ideas', icon: 'Lightbulb' },
          { label: 'Let\'s move forward', action: 'submit', icon: 'ArrowRight' }
        ],
        metadata: { stage: currentState, type: 'loop-breaker' }
      };
      setMessages([...currentMessages, loopBreaker]);
      setConversationState(newConversationState);
      return;
    }
    
    // Update state with detected intent
    newConversationState.lastIntent = intentResult.intent;
    setConversationState(newConversationState);
    
    // Use suggested response type for better handling
    if (intentResult.suggestedResponse === 'clarify' && intentResult.confidence < 50) {
      // Low confidence - ask for clarification
      const clarifyMessage: ChatMessage = {
        id: `clarify-${Date.now()}`,
        role: 'assistant',
        content: "I want to make sure I understand what you're looking for. Could you tell me a bit more about your thinking?",
        timestamp: new Date(),
        quickReplies: [
          { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
          { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
          { label: 'Let me rephrase', action: 'share', icon: 'MessageCircle' }
        ],
        metadata: { stage: currentState, type: 'clarification' }
      };
      setMessages([...currentMessages, clarifyMessage]);
      return;
    }
    
    // Handle different intents appropriately
    switch (intent) {
      case 'brainstorming':
        // Engage in exploratory conversation with intent awareness
        await handleBrainstormingResponse(response, currentMessages, intentResult.intent);
        
        // Add progression nudge if appropriate
        const nudge = generateProgressionNudge(newConversationState, currentState);
        if (nudge && newConversationState.exchangeCount > 3) {
          setTimeout(() => {
            const nudgeMessage: ChatMessage = {
              id: `nudge-${Date.now()}`,
              role: 'assistant',
              content: nudge,
              timestamp: new Date(),
              quickReplies: [
                { label: 'Keep exploring', action: 'share', icon: 'MessageCircle' },
                { label: 'I\'m ready', action: 'submit', icon: 'ArrowRight' }
              ],
              metadata: { stage: currentState, type: 'progression-nudge' }
            };
            setMessages(prev => [...prev, nudgeMessage]);
          }, 2000); // Slight delay so it feels natural
        }
        break;
        
      case 'question':
        // Answer their question directly
        await handleQuestionResponse(response, currentMessages);
        break;
        
      case 'clarification':
        // Provide contextual help
        await handleQuickAction('help', currentMessages);
        break;
        
      case 'submission':
        // Check if this is a high-confidence submission (raised threshold for better accuracy)
        if (intentResult.confidence > 85 || (intentResult.confidence > 70 && response.split(' ').length > 15)) {
          // Very high confidence or high confidence with substantial response - process directly
          await processResponseCore(response, currentMessages);
        } else if (response.split(' ').length < 5) {
          // Very short responses need elaboration encouragement
          const elaboratePrompt: ChatMessage = {
            id: `elaborate-prompt-${Date.now()}`,
            role: 'assistant',
            content: `"${response}" - I like where this is heading! Can you paint me a fuller picture? What excites you about this ${
              currentState.includes('BIG_IDEA') ? 'concept' :
              currentState.includes('EQ') ? 'question' :
              currentState.includes('CHALLENGE') ? 'challenge' :
              'idea'
            }?`,
            timestamp: new Date(),
            quickReplies: [
              { label: 'Let me explain', action: 'elaborate', icon: 'MessageCircle' },
              { label: 'No, this captures it', action: 'submit', icon: 'Check' },
              { label: 'Show me examples', action: 'ideas', icon: 'Lightbulb' }
            ],
            metadata: { stage: currentState, type: 'elaboration-prompt' }
          };
          setMessages([...currentMessages, elaboratePrompt]);
        } else {
          // Medium-length response with medium confidence - gentle confirmation
          const gentleConfirm: ChatMessage = {
            id: `gentle-confirm-${Date.now()}`,
            role: 'assistant',
            content: generateContextualConfirmation(response, currentState, intentResult),
            timestamp: new Date(),
            quickReplies: [
              { label: 'Yes, exactly!', action: 'submit', icon: 'Check' },
              { label: 'Let me refine', action: 'refine', icon: 'Edit' },
              { label: 'I want to explore more', action: 'share', icon: 'MessageCircle' }
            ],
            metadata: { stage: currentState, type: 'gentle-confirmation' }
          };
          setMessages([...currentMessages, gentleConfirm]);
        }
        break;
    }
  };

  const processResponseCore = async (response: string, currentMessages: ChatMessage[]) => {
    let processedResponse = response;
    
    // Common processing for all stages - remove filler words and clean up
    processedResponse = response
      .replace(/^(yes|yeah|ok|okay|sure|well|um|uh|so|i think|maybe|perhaps|my answer is|here's what i think)[,:]?\s*/gi, '')
      .trim();
    
    // Stage-specific processing
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        // Remove phrases specific to big ideas
        processedResponse = processedResponse
          .replace(/^(my big idea is|the big idea is|i want to explore)[,:]?\s*/gi, '')
          .replace(/^art as\s+/i, '') // Remove leading "Art as"
          .trim();
        break;
        
      case 'IDEATION_EQ':
        // Ensure it's a question
        processedResponse = processedResponse
          .replace(/^(my essential question is|the question is|i would ask)[,:]?\s*/gi, '')
          .trim();
        // Add question mark if missing
        if (processedResponse && !processedResponse.endsWith('?')) {
          processedResponse += '?';
        }
        break;
        
      case 'IDEATION_CHALLENGE':
        // Clean up challenge statements
        processedResponse = processedResponse
          .replace(/^(my challenge is|the challenge is|students will)[,:]?\s*/gi, '')
          .trim();
        break;
        
      case 'JOURNEY_PHASES':
        // Process phase listings
        processedResponse = processedResponse
          .replace(/^(my phases are|the phases are|i would structure it as)[,:]?\s*/gi, '')
          .trim();
        break;
        
      case 'JOURNEY_ACTIVITIES':
        // Process activity descriptions
        processedResponse = processedResponse
          .replace(/^(activities include|my activities are|we would do)[,:]?\s*/gi, '')
          .trim();
        break;
        
      case 'JOURNEY_RESOURCES':
        // Process resource lists
        processedResponse = processedResponse
          .replace(/^(resources include|we need|i would use)[,:]?\s*/gi, '')
          .trim();
        break;
        
      case 'DELIVERABLES_MILESTONES':
        // Process milestone descriptions
        processedResponse = processedResponse
          .replace(/^(milestones are|key moments include|checkpoints would be)[,:]?\s*/gi, '')
          .trim();
        break;
        
      case 'DELIVERABLES_ASSESSMENT':
        // Process assessment approaches
        processedResponse = processedResponse
          .replace(/^(assessment would include|i would assess|evaluation includes)[,:]?\s*/gi, '')
          .trim();
        break;
        
      case 'DELIVERABLES_IMPACT':
        // Process impact statements
        processedResponse = processedResponse
          .replace(/^(the impact would be|students' work will|this will)[,:]?\s*/gi, '')
          .trim();
        break;
    }
    
    // Ensure first letter is capitalized for all responses
    if (processedResponse.length > 0) {
      processedResponse = processedResponse.charAt(0).toUpperCase() + processedResponse.slice(1);
    }
    
    // Update journey data with processed response
    updateJourneyData(processedResponse);
    
    // For input stages, show confirmation and wait
    if (!isInitiator() && !isClarifier()) {
      setWaitingForConfirmation(true);
      
      // Generate confirmation with conversational quick replies
      const confirmationMessage: ChatMessage = {
        id: `confirm-${Date.now()}`,
        role: 'assistant',
        content: generateConfirmationMessage(processedResponse),
        timestamp: new Date(),
        quickReplies: [
          { label: "Yes, let's go!", action: 'continue', icon: 'ArrowRight' },
          { label: 'Let me refine this', action: 'refine', icon: 'Edit' },
          { label: 'I need guidance', action: 'help', icon: 'HelpCircle' }
        ],
        metadata: { isConfirmation: true }
      };
      
      setMessages([...currentMessages, confirmationMessage]);
      
      // Remove auto-progression - it can cause confusion and state issues
      // Users should explicitly choose to continue or refine
    }
  };

  const updateJourneyData = (response: string) => {
    const newData = { ...journeyData };
    const stageKey = getCurrentStage().toLowerCase() as 'ideation' | 'journey' | 'deliverables';
    
    // Update based on current specific state
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        newData.stageData.ideation.bigIdea = response;
        // Update FSM data with correct structure - FSM expects data at root level
        const currentFSMIdeation = fsmJourneyData.ideation || {};
        updateData({ 
          ideation: { 
            ...currentFSMIdeation, 
            bigIdea: response 
          }
        });
        break;
      case 'IDEATION_EQ':
        newData.stageData.ideation.essentialQuestion = response;
        // Update FSM data with correct structure
        const currentFSMIdeation2 = fsmJourneyData.ideation || {};
        updateData({ 
          ideation: { 
            ...currentFSMIdeation2, 
            essentialQuestion: response 
          }
        });
        break;
      case 'IDEATION_CHALLENGE':
        newData.stageData.ideation.challenge = response;
        // Update FSM data with correct structure
        const currentFSMIdeation3 = fsmJourneyData.ideation || {};
        updateData({ 
          ideation: { 
            ...currentFSMIdeation3, 
            challenge: response 
          }
        });
        break;
        
      case 'JOURNEY_PHASES':
        // Parse phases from response
        const phases = response.split('\n').filter(line => line.trim())
          .map((line, index) => ({
            id: `phase-${index + 1}`,
            name: line.replace(/^\d+\.\s*/, '').trim(),
            description: ''
          }));
        newData.stageData.journey.phases = phases;
        // Update FSM data
        updateData({ phases });
        break;
        
      case 'JOURNEY_ACTIVITIES':
        // Parse activities from response
        const activities = response.split('\n').filter(line => line.trim())
          .map((line, index) => ({
            id: `activity-${index + 1}`,
            name: line.replace(/^\d+\.\s*/, '').trim(),
            phaseId: '',
            description: ''
          }));
        newData.stageData.journey.activities = activities;
        // Update FSM data
        updateData({ activities });
        break;
        
      case 'JOURNEY_RESOURCES':
        // Parse resources from response
        const resources = response.split('\n').filter(line => line.trim())
          .map((line, index) => ({
            id: `resource-${index + 1}`,
            name: line.replace(/^\d+\.\s*/, '').trim(),
            type: 'other' as const,
            description: ''
          }));
        newData.stageData.journey.resources = resources;
        // Update FSM data
        updateData({ resources });
        break;
        
      case 'DELIVER_MILESTONES':
        // Parse milestones from response
        const milestones = response.split('\n').filter(line => line.trim())
          .map((line, index) => ({
            id: `milestone-${index + 1}`,
            name: line.replace(/^\d+\.\s*/, '').trim(),
            description: ''
          }));
        newData.stageData.deliverables.milestones = milestones;
        // Update FSM data
        const currentDeliverables = fsmJourneyData.deliverables || { milestones: [], rubric: { criteria: [], levels: [] }, impact: { audience: '', method: '' }};
        updateData({ 
          deliverables: { 
            ...currentDeliverables, 
            milestones 
          }
        });
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
    // Use formatConfirmationResponse for consistent, length-controlled confirmations
    const stageContext = {
      subject: wizardData.subject || 'this subject',
      ageGroup: wizardData.ageGroup || 'students'
    };
    
    return formatConfirmationResponse(response, currentState, stageContext);
    
    // Fallback confirmations
    const confirmations: Record<string, string[]> = {
      'IDEATION_BIG_IDEA': [
        `I love where you're going with this! "${response}" has real potential to transform how students see ${wizardData.subject}. Ready to build on this foundation?`,
        `"${response}" - what a compelling concept! This could really resonate with your ${wizardData.ageGroup} students. Shall we explore how this might unfold?`,
        `That's powerful! "${response}" creates such rich possibilities for learning. Want to continue developing this idea?`
      ],
      'IDEATION_EQ': [
        `"${response}" - now that's a question that will get students thinking! Ready to see where this inquiry leads?`,
        `Great question! "${response}" opens up so many avenues for exploration. Should we move forward with this?`,
        `I can already imagine the discussions this will spark! "${response}" is exactly the kind of question that drives deep learning. Continue?`
      ],
      'IDEATION_CHALLENGE': [
        `"${response}" - your students are going to love this challenge! It's authentic and meaningful. Ready to design the journey?`,
        `What an engaging task! "${response}" gives students real purpose and audience. Shall we start mapping out how they'll get there?`,
        `This is exactly the kind of real-world application that makes learning stick! "${response}" will be transformative. Continue?`
      ]
    };
    
    const stageConfirmations = confirmations[currentState] || [
      `Got it! "${response}" looks good. Ready to continue?`,
      `I've captured that: "${response}". Should we move forward?`,
      `Understood! "${response}" works well. Continue?`
    ];
    
    const confirmation = stageConfirmations[Math.floor(Math.random() * stageConfirmations.length)];
    
    return confirmation;
  };

  const progressToNextStage = async () => {
    console.log('🔄 Progress to next stage - Current:', currentState);
    
    // CRITICAL: Reset waiting state when moving to new stage
    setWaitingForConfirmation(false);
    
    // Reset conversation state for new stage
    setConversationState({
      exchangeCount: 0,
      hasSharedIdea: false,
      ideaMaturity: 'exploring',
      lastProgressCheck: new Date()
    });
    
    // NO MORE STAGE COMPLETE MODALS - they interrupt the flow
    // We'll use the progress bar and natural conversation flow instead
    
    let updatedJourneyData = journeyData;
    
    // Only generate recap if we're not at an initiator stage
    if (!isInitiator()) {
      // Generate and save recap for current stage
      const currentStageKey = getCurrentStage().toLowerCase() as 'ideation' | 'journey' | 'deliverables';
      const recap = StageTransitions.generateRecap(currentStageKey, journeyData);
      console.log('📝 Generated recap for', currentStageKey, recap);
      
      // Update journey data with recap
      updatedJourneyData = { ...journeyData };
      updatedJourneyData.recaps[currentStageKey] = recap;
      updatedJourneyData.currentStageMessages = []; // Clear messages for new stage
      setJourneyData(updatedJourneyData);
    }
    
    // Advance FSM
    try {
      const result = advance();
      console.log('➡️ FSM advance result:', result);
      
      if (result.success) {
        // Don't clear messages - maintain conversation continuity
        // Just add the next stage's prompt to the existing conversation
        const context: PromptContext = {
          wizardData,
          journeyData: updatedJourneyData,
          currentStage: result.newState,
          previousRecaps: Object.values(updatedJourneyData.recaps).filter(Boolean)
        };

        const nextStagePrompt = generateStagePrompt(context);
        
        // Add a smooth transition message
        const transitionMessage: ChatMessage = {
          id: `transition-${Date.now()}`,
          role: 'assistant',
          content: nextStagePrompt,
          timestamp: new Date(),
          quickReplies: getStageQuickRepliesForState(result.newState),
          metadata: { stage: result.newState }
        };
        
        setMessages([...messages, transitionMessage]);
        
        if (result.newState === 'COMPLETE') {
          setTimeout(() => onComplete(), 2000);
        }
      } else {
        console.error('FSM advance failed:', result.message);
        const errorMessage: ChatMessage = {
          id: `advance-error-${Date.now()}`,
          role: 'assistant',
          content: result.message || 'Please complete this stage before continuing.',
          timestamp: new Date(),
          quickReplies: getStageQuickReplies()
        };
        setMessages([...messages, errorMessage]);
      }
    } catch (error) {
      console.error('Error advancing FSM:', error);
      const errorMessage: ChatMessage = {
        id: `advance-error-${Date.now()}`,
        role: 'assistant',
        content: 'There was an error progressing to the next stage. Please try again.',
        timestamp: new Date(),
        quickReplies: getStageQuickReplies()
      };
      setMessages([...messages, errorMessage]);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Milestone Animations */}
      <MilestoneAnimation 
        milestone={currentMilestone || ''} 
        show={!!currentMilestone} 
      />
      
      {/* Journey Summary - Floating on the right */}
      <JourneySummary 
        journeyData={journeyData}
        currentStage={currentState}
        onEdit={(stage, field) => {
          // Handle edit action - could trigger a refine flow
          console.log('Edit requested:', stage, field);
          setWaitingForConfirmation(false);
          const editMessage: ChatMessage = {
            id: `edit-${Date.now()}`,
            role: 'assistant',
            content: `I see you want to refine your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}. What changes would you like to make?`,
            timestamp: new Date(),
            quickReplies: [
              { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
              { label: 'What-If', action: 'whatif', icon: 'RefreshCw' }
            ],
            metadata: { stage: currentState }
          };
          setMessages(prev => [...prev, editMessage]);
        }}
      />
      
      {/* Fixed Progress Bar - Below header, above chat */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Progress />
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Messages */}
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <DebugPanel
                        messageId={message.id}
                        messageRole={message.role}
                        currentState={currentState}
                        isProcessing={isProcessing}
                        waitingForConfirmation={waitingForConfirmation}
                        journeyData={journeyData}
                        error={lastError}
                        metadata={message.metadata}
                        timestamp={message.timestamp}
                      />
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/50 px-6 py-4">
                        {/* Check if this message contains idea options */}
                        {(() => {
                          const hasNumberedList = message.content.match(/^\d+\.\s/m);
                          const hasLetterOptions = message.content.match(/^(Option\s+)?[A-D][\.:)]/im);
                          const hasBulletList = message.content.match(/^[•\-\*]\s+/m);
                          const isFromAI = message.role === 'assistant';
                          const hasMultipleItems = (message.content.match(/^\d+\./gm) || []).length >= 2;
                          
                          // Check if this is an ideas/what-if/help prompt
                          // Be more lenient with Ideas detection
                          const hasIdeasKeywords = message.content.match(/brainstorm|spark.*thinking|ideas? (to|that)|compelling.*ideas/i);
                          const hasWhatIfKeywords = message.content.match(/what if.*\?/i) || message.content.match(/thought-provoking scenarios/i);
                          
                          const isIdeasPrompt = (hasIdeasKeywords && !hasWhatIfKeywords) ||
                                               message.content.match(/here are (some |\d+ )?(ideas|suggestions|options)/i) ||
                                               message.content.match(/consider these/i);
                          const isWhatIfPrompt = hasWhatIfKeywords;
                          const isHelpPrompt = message.content.match(/understanding.*ideas|crafting.*questions|designing.*challenges/i);
                          
                          // Check if this is NOT an explanation (contains framework/approach/proven/research)
                          const isExplanation = message.content.match(/(framework|approach|research|proven|decades|authentic learning)/i);
                          
                          // Handle Help responses separately
                          if (isFromAI && isHelpPrompt && !isExplanation) {
                            const { groundingMessage, examples } = parseHelpContent(message.content);
                            
                            return (
                              <>
                                <MessageContent content={groundingMessage} />
                                {examples.length > 0 && (
                                  <IdeaCardsV2 
                                    options={examples}
                                    onSelect={(option, isCardClick) => {
                                      if (isCardClick) {
                                        handleSendMessage({
                                          type: 'card-selection',
                                          selection: {
                                            value: option.title,
                                            type: 'example',
                                            originalOption: option
                                          }
                                        });
                                      } else {
                                        handleSendMessage(option.title);
                                      }
                                    }}
                                    type='ideas'
                                  />
                                )}
                              </>
                            );
                          }
                          
                          // Handle Ideas and What-If responses
                          if (isFromAI && (hasNumberedList || hasLetterOptions || hasBulletList) && hasMultipleItems && (isIdeasPrompt || isWhatIfPrompt) && !isExplanation) {
                            const type = isWhatIfPrompt ? 'whatif' : 'ideas';
                            const parsedOptions = parseIdeasFromResponse(message.content, type);
                            
                            
                            if (parsedOptions.length > 0) {
                              // Extract the grounding message (intro text before numbered list)
                              const groundingMessage = extractGroundingMessage(message.content);
                              
                              return (
                                <>
                                  {groundingMessage && <MessageContent content={groundingMessage} />}
                                  <IdeaCardsV2 
                                    options={parsedOptions}
                                    onSelect={(option, isCardClick) => {
                                      if (isCardClick) {
                                        handleSendMessage({
                                          type: 'card-selection',
                                          selection: {
                                            value: option.title,
                                            type: type as 'idea' | 'whatif',
                                            originalOption: option,
                                            index: parsedOptions.indexOf(option)
                                          }
                                        });
                                      } else {
                                        handleSendMessage(option.title);
                                      }
                                    }}
                                    type={type}
                                  />
                                </>
                              );
                            }
                          }
                          
                          // No cards to show, display full content
                          return <MessageContent content={message.content} />;
                        })()}
                      </div>
                      {renderQuickReplies(message.quickReplies, message.id === messages[messages.length - 1]?.id)}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl">
                    <DebugPanel
                      messageId={message.id}
                      messageRole={message.role}
                      currentState={currentState}
                      isProcessing={isProcessing}
                      waitingForConfirmation={waitingForConfirmation}
                      journeyData={journeyData}
                      error={lastError}
                      metadata={message.metadata}
                      timestamp={message.timestamp}
                    />
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl px-6 py-4 shadow-md dark:shadow-gray-900/50">
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

      {/* No more stage transition modals - they interrupt the natural flow */}

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
              placeholder={getInputPlaceholder()}
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-500 dark:placeholder:text-gray-400"
              disabled={isStreaming || isProcessing}
            />
            <AnimatedButton
              type="submit"
              disabled={!input.trim() || isStreaming || isProcessing}
              variant="primary"
              icon={isStreaming || isProcessing ? undefined : Send}
              className="px-6"
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

  function renderQuickReplies(quickReplies?: QuickReply[], isActive: boolean = false) {
    if (!quickReplies || quickReplies.length === 0) return null;
    
    // Debug logging
    console.log('Rendering quick replies:', quickReplies);

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
      Sparkles
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
            <motion.div
              key={reply.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <AnimatedButton
                onClick={() => isActive ? handleSendMessage(`action:${reply.action}`) : null}
                disabled={!isActive}
                variant={
                  (reply.action === 'start' && currentState === 'IDEATION_INITIATOR') 
                    ? 'primary' 
                    : 'secondary'
                }
                icon={Icon}
                className={
                  (reply.action === 'start' || reply.action === 'tellmore') && currentState === 'IDEATION_INITIATOR'
                    ? 'px-6 py-3 text-base font-semibold'
                    : 'text-sm'
                }
              >
                {reply.label || reply.action}
              </AnimatedButton>
            </motion.div>
          );
        })}
      </motion.div>
    );
  }

  function getInputPlaceholder(): string {
    if (isInitiator()) return "Share your thoughts or questions...";
    if (isClarifier()) return "Type 'continue' to proceed or describe what to edit...";
    return "Share your ideas...";
  }
}