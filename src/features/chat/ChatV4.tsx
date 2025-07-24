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
  CheckCircle,
  Layers,
  Rocket,
  Info
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
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  
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
    // Special case for very first message - show Let's Begin and Tell Me More
    if (currentState === 'IDEATION_INITIATOR' && messages.length <= 1) {
      return [
        { label: "Let's Begin", action: 'start', icon: 'Rocket' },
        { label: 'Tell Me More', action: 'tellmore', icon: 'Info' }
      ];
    }
    
    // Per SOP: During input stages, show Ideas/What-If/Help
    if (!isInitiator() && !isClarifier() && !waitingForConfirmation) {
      return [
        { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
        { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    // Per SOP: After user provides answer, show Continue/Refine/Help
    if (waitingForConfirmation) {
      return [
        { label: 'Continue', action: 'continue', icon: 'ArrowRight' },
        { label: 'Refine', action: 'refine', icon: 'Edit' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    // Clarifier stage
    if (isClarifier()) {
      return [
        { label: 'Continue', action: 'continue', icon: 'ArrowRight' },
        { label: 'Edit', action: 'edit', icon: 'Edit' },
        { label: 'Help', action: 'help', icon: 'HelpCircle' }
      ];
    }
    
    // Default for other cases
    return [
      { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
      { label: 'What-If', action: 'whatif', icon: 'RefreshCw' },
      { label: 'Help', action: 'help', icon: 'HelpCircle' }
    ];
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isStreaming || isProcessing) return;

    setIsProcessing(true);
    
    // Clean up action: prefix for display
    const displayText = messageText.startsWith('action:') 
      ? (() => {
          const action = messageText.replace('action:', '');
          switch(action) {
            case 'ideas': return 'Ideas';
            case 'whatif': return 'What-If';
            case 'help': return 'Help';
            case 'start': return 'Start';
            case 'continue': return 'Continue';
            case 'refine': return 'Refine';
            default: return action.charAt(0).toUpperCase() + action.slice(1);
          }
        })()
      : messageText.trim();
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: displayText,
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

      // Handle continue/refine from confirmation state
      if (waitingForConfirmation) {
        if (['continue', 'yes', 'proceed', 'next'].includes(messageText.toLowerCase())) {
          setWaitingForConfirmation(false);
          await progressToNextStage();
          return;
        } else if (['refine', 'edit', 'change'].includes(messageText.toLowerCase())) {
          setWaitingForConfirmation(false);
          // Show the prompt again
          const repeatMessage: ChatMessage = {
            id: `repeat-${Date.now()}`,
            role: 'assistant',
            content: 'No problem! Let\'s refine your answer. What would you like to change?',
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
        if (currentState === 'IDEATION_INITIATOR') {
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
            }, 2500); // Increased delay to avoid confusion
          }
        } else if (isInitiator()) {
          // Regular initiator start
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
            content: 'No problem! Let\'s refine your answer. What would you like to change?',
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

  const processUserResponse = async (response: string, currentMessages: ChatMessage[]) => {
    // Process and validate the response based on current stage
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
      
      // Generate confirmation with proper quick replies
      const confirmationMessage: ChatMessage = {
        id: `confirm-${Date.now()}`,
        role: 'assistant',
        content: generateConfirmationMessage(processedResponse),
        timestamp: new Date(),
        quickReplies: [
          { label: 'Continue', action: 'continue', icon: 'ArrowRight' },
          { label: 'Refine', action: 'refine', icon: 'Edit' },
          { label: 'Help', action: 'help', icon: 'HelpCircle' }
        ],
        metadata: { isConfirmation: true }
      };
      
      setMessages([...currentMessages, confirmationMessage]);
    }
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
    // Per SOP: "Current **[Label]**: "[answer]". Click **Continue** to proceed or **Refine** to improve this answer."
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        return `Current **Big Idea**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
        
      case 'IDEATION_EQ':
        return `Current **Essential Question**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
        
      case 'IDEATION_CHALLENGE':
        return `Current **Challenge**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
        
      case 'JOURNEY_PHASES':
        return `Current **Phases**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
        
      case 'JOURNEY_ACTIVITIES':
        return `Current **Activities**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
        
      case 'JOURNEY_RESOURCES':
        return `Current **Resources**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
        
      default:
        return `Current **Response**: "${response}"

Click **Continue** to proceed or **Refine** to improve this answer.`;
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
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 max-w-2xl">
                      <div className="bg-white rounded-2xl shadow-sm px-6 py-4">
                        <MessageContent content={message.content} />
                        {/* Check if this message contains idea options */}
                        {(message.content.match(/^\d+\.\s*"/m) || message.content.match(/^\d+\.\s+\w/m) || message.content.includes('Option A') || message.content.includes('Option 1')) && (
                          <IdeaCardsV2 
                            options={parseIdeasFromResponse(message.content, 
                              message.content.toLowerCase().includes('what if') ? 'whatif' : 'ideas'
                            )}
                            onSelect={(option) => handleSendMessage(option.title)}
                            type={message.content.toLowerCase().includes('what if') ? 'whatif' : 'ideas'}
                          />
                        )}
                      </div>
                      {renderQuickReplies(message.quickReplies, message.id === messages[messages.length - 1]?.id)}
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

  function renderQuickReplies(quickReplies?: QuickReply[], isActive: boolean = false) {
    if (!quickReplies || quickReplies.length === 0) return null;

    const icons: Record<string, React.ElementType> = {
      ArrowRight,
      HelpCircle,
      RefreshCw,
      Edit,
      Lightbulb,
      Rocket,
      Info
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
              onClick={() => isActive ? handleSendMessage(`action:${reply.action}`) : null}
              disabled={!isActive}
              className={`inline-flex items-center gap-2 ${
                !isActive ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                (reply.action === 'start' || reply.action === 'tellmore') && currentState === 'IDEATION_INITIATOR'
                  ? reply.action === 'start' 
                    ? 'px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-base hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-semibold text-base hover:bg-blue-50 shadow-md hover:shadow-lg transform hover:scale-105'
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