import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizard/wizardSchema';
import { useGeminiStream } from '../../hooks/useGeminiStream';
import { useFSMv2 } from '../../context/FSMContextV2';
import { generatePrompt, generateQuickResponse, QuickReply } from '../../prompts/journey-v2';
import { 
  Send,
  Sparkles,
  Lightbulb,
  ArrowRight,
  SkipForward,
  HelpCircle,
  RefreshCw,
  Edit
} from 'lucide-react';
import { Progress } from '../../components/ProgressV2';
import { MessageContent } from './MessageContent';
import { StageOverview } from './StageOverview';
import { IdeaCardsV2, parseIdeasFromResponse } from './IdeaCardsV2';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  quickReplies?: QuickReply[];
  metadata?: {
    stage?: string;
    readyForNext?: boolean;
    isConfirmation?: boolean;
  };
}

interface ChatProps {
  wizardData: WizardData;
  blueprintId: string;
  chatHistory: ChatMessage[];
  onUpdateHistory: (history: ChatMessage[]) => void;
  onComplete: () => void;
}

// System prompt aligned with SOP
const SYSTEM_PROMPT_V3 = `You are ProjectCraft Coach implementing Blueprint Coach SOP v1.0.

CRITICAL RULES:
1. ALWAYS respond with the EXACT format provided in the prompt
2. NEVER add extra explanations or elaborations
3. ALWAYS include metadata with quickReplies in your response
4. For confirmation messages, use the EXACT format: "Current **[Label]**: "[answer]". Click **Continue** to proceed or **Refine** to improve this answer."
5. ONLY set readyForNext: true when user explicitly says "continue", "next", "proceed", or similar

Current context and stage will be provided with each message. Follow the SOP exactly.`;

// Icon mapping for quick replies
const quickReplyIcons = {
  Lightbulb,
  RefreshCw,
  HelpCircle,
  SkipForward,
  ArrowRight,
  Edit
};

// Edge case detection
function detectEdgeCase(input: string): 'ramble' | 'confusion' | 'multiple' | 'why' | 'blank' | null {
  const trimmed = input.trim();
  
  if (!trimmed || trimmed.toLowerCase() === 'ok') return 'blank';
  if (trimmed.length > 250) return 'ramble';
  if (trimmed.toLowerCase().includes('why this step') || trimmed.toLowerCase().includes('why do we need')) return 'why';
  if (trimmed.split(',').length > 3) return 'multiple';
  if (trimmed.includes('?') && (trimmed.includes('confused') || trimmed.includes("don't understand"))) return 'confusion';
  
  return null;
}

// Validate stage input for alignment and quality
function validateStageInput(input: string, stage: string, context: { wizardData: WizardData; journeyData: JourneyData }): { isValid: boolean; message: string } {
  const { wizardData, journeyData } = context;
  const trimmed = input.trim().toLowerCase();
  const subject = wizardData.subject.toLowerCase();
  
  switch (stage) {
    case 'IDEATION_BIG_IDEA':
      // Check subject alignment
      if ((subject.includes('physical education') || subject.includes('pe')) && 
          (trimmed.includes('plants') || trimmed.includes('biology') || trimmed.includes('chemistry'))) {
        return {
          isValid: false,
          message: `I notice your Big Idea "${input}" might not align with ${wizardData.subject}. \n\nA Big Idea should connect directly to your subject area. For ${wizardData.subject}, consider concepts like:\n- Movement as a language of expression\n- The body as a system of interconnected parts\n- Physical literacy for lifelong wellness\n- Sport as a mirror of society\n\nWould you like to refine your Big Idea to better connect with ${wizardData.subject}?`
        };
      }
      // Check if too vague
      if (trimmed.split(' ').length < 2) {
        return {
          isValid: false,
          message: `Your Big Idea "${input}" seems quite brief. A strong Big Idea typically:\n- Contains 3-6 words\n- Expresses a complete concept\n- Connects to larger themes\n\nWould you like to expand on this idea?`
        };
      }
      break;
      
    case 'IDEATION_EQ':
      // Check if it's actually a question
      if (!trimmed.includes('?')) {
        return {
          isValid: false,
          message: `Essential Questions should end with a question mark. Your input "${input}" appears to be a statement.\n\nTry rephrasing as a question that:\n- Is open-ended (not yes/no)\n- Provokes deep thinking\n- Connects to your Big Idea: "${journeyData.ideation.bigIdea}"\n\nWould you like to rephrase this as a question?`
        };
      }
      // Check if it's a yes/no question
      const startsWithClosed = ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'will', 'would', 'should'];
      const firstWord = trimmed.split(' ')[0];
      if (startsWithClosed.includes(firstWord)) {
        return {
          isValid: false,
          message: `Your question "${input}" might be too closed-ended.\n\nEssential Questions work best when they:\n- Start with "How", "Why", "What if", or "In what ways"\n- Have multiple possible answers\n- Inspire investigation and debate\n\nWould you like to reframe this question?`
        };
      }
      break;
      
    case 'IDEATION_CHALLENGE':
      // Check if it's action-oriented
      const actionVerbs = ['create', 'design', 'build', 'develop', 'solve', 'investigate', 'explore', 'document', 'produce', 'organize'];
      const hasAction = actionVerbs.some(verb => trimmed.includes(verb));
      if (!hasAction) {
        return {
          isValid: false,
          message: `Your challenge "${input}" might benefit from a stronger action verb.\n\nEffective challenges typically start with verbs like:\n- Create, Design, Build\n- Develop, Solve, Investigate\n- Explore, Document, Produce\n\nThis helps students understand what they'll DO. Would you like to rephrase with an action verb?`
        };
      }
      break;
      
    case 'JOURNEY_PHASES':
      // Check if phases are provided
      const phaseLines = input.split('\n').filter(line => line.trim());
      if (phaseLines.length < 2) {
        return {
          isValid: false,
          message: `Learning journeys typically have 3-5 phases. You've provided ${phaseLines.length}.\n\nEach phase should:\n- Have a clear name and purpose\n- Build on previous phases\n- Lead toward the challenge: "${journeyData.ideation.challenge}"\n\nWould you like to add more phases or see examples?`
        };
      }
      break;
      
    // Add more validation for other stages as needed
  }
  
  return { isValid: true, message: '' };
}

export function ChatV3({ wizardData, blueprintId, chatHistory, onUpdateHistory, onComplete }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);
  const [input, setInput] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [lastUserResponse, setLastUserResponse] = useState<string>('');
  
  const { sendMessage, isStreaming } = useGeminiStream();
  const { 
    currentState, 
    journeyData, 
    advance, 
    canSkip, 
    updateData,
    getStageContext,
    saveState,
    loadState,
    isInitiator,
    isClarifier,
    getCurrentStage,
    edit
  } = useFSMv2();
  
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

  // Helper to serialize messages for Firestore
  const serializeMessages = (messages: ChatMessage[]): ChatMessage[] => {
    return messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      // Omit quickReplies and metadata to avoid Firestore serialization issues
    })) as ChatMessage[];
  };

  const initializeConversation = async () => {
    const promptData = generatePrompt({
      wizardData,
      journeyData,
      currentStage: currentState
    });

    const assistantMessage: ChatMessage = {
      id: 'assistant-1',
      role: 'assistant',
      content: promptData.content,
      timestamp: new Date(),
      quickReplies: promptData.metadata.quickReplies,
      metadata: { stage: currentState }
    };

    setMessages([assistantMessage]);
    onUpdateHistory(serializeMessages([assistantMessage]));
  };

  // Update FSM data based on stage and input
  const updateStageData = (userInput: string): void => {
    const input = userInput.trim();
    
    switch (currentState) {
      case 'IDEATION_BIG_IDEA':
        updateData({
          ideation: { ...journeyData.ideation, bigIdea: input }
        });
        break;
        
      case 'IDEATION_EQ':
        updateData({
          ideation: { ...journeyData.ideation, essentialQuestion: input }
        });
        break;
        
      case 'IDEATION_CHALLENGE':
        updateData({
          ideation: { ...journeyData.ideation, challenge: input }
        });
        break;
        
      // Handle phases, activities, resources, etc.
      case 'JOURNEY_PHASES':
        // Parse phases from input (simplified for now)
        const phases = input.split('\n').filter(line => line.trim()).map((line, i) => ({
          id: `phase-${i + 1}`,
          name: line.split(':')[0].trim(),
          description: line.split(':')[1]?.trim() || ''
        }));
        updateData({ phases });
        break;
        
      case 'JOURNEY_ACTIVITIES':
        // Parse activities (simplified)
        const activities = input.split('\n').filter(line => line.trim()).map((line, i) => ({
          id: `activity-${i + 1}`,
          phaseId: journeyData.phases[0]?.id || 'phase-1',
          name: line.split(':')[0].trim(),
          description: line.split(':')[1]?.trim() || '',
          duration: '45 min'
        }));
        updateData({ activities });
        break;
        
      case 'JOURNEY_RESOURCES':
        // Parse resources
        const resources = input.split('\n').filter(line => line.trim()).map((line, i) => ({
          id: `resource-${i + 1}`,
          type: 'material' as const,
          name: line.trim(),
          description: ''
        }));
        updateData({ resources });
        break;
        
      case 'DELIVER_MILESTONES':
        // Parse milestones
        const milestones = input.split('\n').filter(line => line.trim()).map((line, i) => ({
          id: `milestone-${i + 1}`,
          name: line.split(':')[0].trim(),
          description: line.split(':')[1]?.trim() || '',
          week: i + 1
        }));
        updateData({
          deliverables: {
            ...journeyData.deliverables,
            milestones
          }
        });
        break;
        
      case 'DELIVER_RUBRIC':
        // Parse rubric criteria
        const criteria = input.split('\n').filter(line => line.trim()).map((line, i) => ({
          id: `criteria-${i + 1}`,
          name: line.split(':')[0].trim(),
          description: line.split(':')[1]?.trim() || '',
          weight: 25
        }));
        updateData({
          deliverables: {
            ...journeyData.deliverables,
            rubric: { criteria }
          }
        });
        break;
        
      case 'DELIVER_IMPACT':
        // Parse impact plan
        const lines = input.split('\n').filter(line => line.trim());
        updateData({
          deliverables: {
            ...journeyData.deliverables,
            impact: {
              audience: lines[0] || '',
              format: lines[1] || '',
              outcome: lines[2] || ''
            }
          }
        });
        break;
        
      // Add more cases as needed
    }
  };

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isStreaming) return;

    // Clean up action: prefix for display
    const displayText = messageText.startsWith('action:') 
      ? messageText.replace('action:', '').charAt(0).toUpperCase() + messageText.slice(7)
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

    // Handle edge cases
    const edgeCase = detectEdgeCase(messageText.trim());
    if (edgeCase && !waitingForConfirmation) {
      await handleEdgeCase(edgeCase, updatedMessages);
      return;
    }

    // Handle quick-reply actions
    if (messageText.startsWith('action:')) {
      const action = messageText.replace('action:', '');
      await handleQuickReplyAction(action, updatedMessages);
      return;
    }

    // Handle stage-specific logic
    if (isInitiator()) {
      // User typed "start" or similar
      if (['start', 'begin', 'yes', 'ready'].includes(messageText.toLowerCase())) {
        progressToNext(updatedMessages);
        return;
      }
      // If they typed something else, just progress anyway since they're providing their answer
      progressToNext(updatedMessages);
      return;
    }

    if (isClarifier()) {
      // Handle edit commands
      if (messageText.toLowerCase().startsWith('edit ')) {
        const stepToEdit = messageText.slice(5).toUpperCase().replace(' ', '_');
        // Try to find matching state
        const editState = `${getCurrentStage()}_${stepToEdit}` as any;
        const result = edit(editState);
        if (result.success) {
          await regeneratePrompt(updatedMessages);
        }
        return;
      }
      
      // Handle proceed command
      if (['proceed', 'continue', 'next'].includes(messageText.toLowerCase())) {
        progressToNext(updatedMessages);
      }
      return;
    }

    // Regular input - waiting for confirmation
    if (!waitingForConfirmation) {
      // Store the response and show confirmation
      setLastUserResponse(messageText);
      updateStageData(messageText);
      
      // Validate input alignment with context
      const validationResult = validateStageInput(messageText, currentState, { wizardData, journeyData });
      if (!validationResult.isValid) {
        const clarifyMessage: ChatMessage = {
          id: `clarify-${Date.now()}`,
          role: 'assistant',
          content: validationResult.message,
          timestamp: new Date(),
          quickReplies: [
            { label: 'Refine', action: 'refine', icon: 'Edit' },
            { label: 'Ideas', action: 'ideas', icon: 'Lightbulb' },
            { label: 'Keep Original', action: 'continue', icon: 'ArrowRight' }
          ],
          metadata: { stage: currentState }
        };
        
        setMessages([...updatedMessages, clarifyMessage]);
        onUpdateHistory(serializeMessages([...updatedMessages.filter(m => m.role !== 'system'), clarifyMessage]));
        return;
      }
      
      setWaitingForConfirmation(true);
      
      const confirmPrompt = generatePrompt({
        wizardData,
        journeyData,
        currentStage: currentState,
        previousResponse: messageText
      });

      const confirmMessage: ChatMessage = {
        id: `confirm-${Date.now()}`,
        role: 'assistant',
        content: confirmPrompt.content,
        timestamp: new Date(),
        quickReplies: confirmPrompt.metadata.quickReplies,
        metadata: { 
          stage: currentState,
          isConfirmation: true
        }
      };

      setMessages([...updatedMessages, confirmMessage]);
      onUpdateHistory(serializeMessages([...updatedMessages.filter(m => m.role !== 'system'), confirmMessage]));
    } else {
      // Handle confirmation response
      if (['continue', 'yes', 'proceed', 'next'].includes(messageText.toLowerCase())) {
        setWaitingForConfirmation(false);
        progressToNext(updatedMessages);
      } else if (['refine', 'edit', 'change'].includes(messageText.toLowerCase())) {
        setWaitingForConfirmation(false);
        await regeneratePrompt(updatedMessages);
      }
    }
  };

  const handleQuickReplyAction = async (action: string, messages: ChatMessage[]) => {
    const response = generateQuickResponse(action, {
      wizardData,
      journeyData,
      currentStage: currentState
    });

    // Check if this is a generative prompt that needs AI response
    if (response.metadata.isGenerativePrompt) {
      // Send to Gemini for generation
      const systemMessage = `${SYSTEM_PROMPT_V3}\n\nGenerate response for: ${response.content}`;
      
      try {
        // Convert to Gemini format
        const geminiMessages = [
          { role: 'system' as const, parts: systemMessage },
          ...messages.filter(m => m.role !== 'system').slice(-5).map(m => ({
            role: m.role === 'assistant' ? 'model' as const : 'user' as const,
            parts: m.content
          }))
        ];
        
        const aiResponse = await sendMessage(geminiMessages);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: aiResponse.text,
          timestamp: new Date(),
          quickReplies: response.metadata.quickReplies,
          metadata: { stage: currentState }
        };

        const newMessages = [...messages, assistantMessage];
        setMessages(newMessages);
        onUpdateHistory(serializeMessages(newMessages.filter(m => m.role !== 'system')));
      } catch (error) {
        console.error('Error generating ideas:', error);
        // Fallback response
        const fallbackMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: 'I had trouble generating suggestions. Please share your own ideas or try again.',
          timestamp: new Date(),
          quickReplies: response.metadata.quickReplies,
          metadata: { stage: currentState }
        };
        setMessages([...messages, fallbackMessage]);
      }
    } else {
      // Regular non-generative response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        quickReplies: response.metadata.quickReplies,
        metadata: response.metadata
      };

      const newMessages = [...messages, assistantMessage];
      setMessages(newMessages);
      onUpdateHistory(serializeMessages(newMessages.filter(m => m.role !== 'system')));

      if (response.metadata.readyForNext) {
        setTimeout(() => progressToNext(newMessages), 500);
      }
    }
  };

  const handleEdgeCase = async (edgeCase: string, messages: ChatMessage[]) => {
    let response = '';
    
    switch (edgeCase) {
      case 'ramble':
        response = "Let's focus on one key point. What's the most important aspect you'd like to capture?";
        break;
      case 'confusion':
        // Auto-trigger help
        return handleQuickReplyAction('help', messages);
      case 'multiple':
        response = "I see multiple ideas here. Let's focus on one at a time. Which would you like to explore first?";
        break;
      case 'why':
        const context = getStageContext();
        response = `Great question! ${context.description}\n\nThis step helps ${context.tips[0].toLowerCase()}`;
        break;
      case 'blank':
        response = "Please share your thoughts or click one of the options below for inspiration.";
        break;
    }

    const edgeMessage: ChatMessage = {
      id: `edge-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      quickReplies: generatePrompt({ wizardData, journeyData, currentStage: currentState }).metadata.quickReplies,
      metadata: { stage: currentState }
    };

    setMessages([...messages, edgeMessage]);
    onUpdateHistory(serializeMessages([...messages.filter(m => m.role !== 'system'), edgeMessage]));
  };

  const progressToNext = async (messages: ChatMessage[]) => {
    const result = advance();
    
    if (result.success) {
      // Generate prompt for new stage
      const promptData = generatePrompt({
        wizardData,
        journeyData,
        currentStage: result.newState
      });

      const progressMessage: ChatMessage = {
        id: `progress-${Date.now()}`,
        role: 'assistant',
        content: promptData.content,
        timestamp: new Date(),
        quickReplies: promptData.metadata.quickReplies,
        metadata: { stage: result.newState }
      };

      const newMessages = [...messages, progressMessage];
      setMessages(newMessages);
      onUpdateHistory(serializeMessages(newMessages.filter(m => m.role !== 'system')));

      // Check if we're complete
      if (result.newState === 'COMPLETE') {
        setTimeout(() => onComplete(), 1000);
      }
    } else {
      // Show validation message
      const validationMessage: ChatMessage = {
        id: `validation-${Date.now()}`,
        role: 'assistant',
        content: result.message || 'Please complete this step before continuing.',
        timestamp: new Date(),
        quickReplies: generatePrompt({ wizardData, journeyData, currentStage: currentState }).metadata.quickReplies,
        metadata: { stage: currentState }
      };

      setMessages([...messages, validationMessage]);
      onUpdateHistory(serializeMessages([...messages.filter(m => m.role !== 'system'), validationMessage]));
    }
  };

  const regeneratePrompt = async (messages: ChatMessage[]) => {
    const promptData = generatePrompt({
      wizardData,
      journeyData,
      currentStage: currentState
    });

    const newPromptMessage: ChatMessage = {
      id: `regenerate-${Date.now()}`,
      role: 'assistant',
      content: promptData.content,
      timestamp: new Date(),
      quickReplies: promptData.metadata.quickReplies,
      metadata: { stage: currentState }
    };

    const newMessages = [...messages, newPromptMessage];
    setMessages(newMessages);
    onUpdateHistory(serializeMessages(newMessages.filter(m => m.role !== 'system')));
  };

  const handleQuickReply = (quickReply: QuickReply) => {
    handleSendMessage(`action:${quickReply.action}`);
  };

  const renderQuickReplies = (quickReplies?: QuickReply[]) => {
    if (!quickReplies || quickReplies.length === 0) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 mt-4"
      >
        {quickReplies.map((reply, index) => {
          const Icon = reply.icon ? quickReplyIcons[reply.icon as keyof typeof quickReplyIcons] : null;
          
          return (
            <motion.button
              key={reply.action}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleQuickReply(reply)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow"
            >
              {Icon && <Icon className="w-4 h-4" />}
              {reply.label}
            </motion.button>
          );
        })}
      </motion.div>
    );
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
            {messages.filter(m => m.role !== 'system').map((message) => (
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
              placeholder={
                isInitiator() ? "Type 'start' to begin..." :
                isClarifier() ? "Type 'proceed' to continue or 'edit <step>' to revise..." :
                waitingForConfirmation ? "Type 'continue' to proceed or 'refine' to change..." :
                "Share your ideas..."
              }
              rows={textareaRows}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isStreaming ? (
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
}