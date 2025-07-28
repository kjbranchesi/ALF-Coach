// ChatV6.tsx - Simplified architecture with all MVP features preserved
// Maintains: stages, buttons, suggestions, rich UI, helpful interactions
// Simplifies: direct API calls, clear state management, no over-abstraction

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';
import { Bot, User, Send, Sparkles, CheckCircle, HelpCircle, Lightbulb } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { isDevelopment, isDebugEnabled } from '../utils/environment';

// Message structure that preserves all valuable features
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  // MVP features to preserve
  buttons?: string[];
  suggestions?: string[];
  interactionType?: 'welcome' | 'standard' | 'guide' | 'provocation';
  stageInfo?: {
    current: string;
    isComplete: boolean;
    nextStage?: string;
  };
  metadata?: {
    turnNumber?: number;
    capturedField?: string;
    validationStatus?: 'valid' | 'needs-refinement';
  };
}

interface ChatV6Props {
  projectId: string;
  projectData: {
    subject: string;
    ageGroup: string;
    stage: 'ideation' | 'journey' | 'deliverables';
    capturedData: Record<string, any>;
  };
  onStageComplete: (nextStage: string) => void;
  onDataCapture: (field: string, value: any) => void;
}

// Stage configuration - maintaining the 3-stage SOP structure
const STAGE_CONFIG = {
  ideation: {
    title: 'Ideation Stage',
    steps: ['bigIdea', 'essentialQuestion', 'challenge'],
    prompts: {
      welcome: "Welcome! I'm excited to help you design an engaging learning experience. Let's start by exploring your vision. What's the big idea or topic you want your students to explore?",
      bigIdea: "What conceptual understanding or 'big idea' do you want students to grasp? Think about concepts that connect to their lives and the world around them.",
      essentialQuestion: "What essential question will drive student inquiry? This should be open-ended and thought-provoking.",
      challenge: "What authentic challenge will students tackle? This should be meaningful and connect to real-world applications."
    }
  },
  journey: {
    title: 'Learning Journey',
    steps: ['phases', 'activities', 'resources'],
    prompts: {
      welcome: "Great ideation work! Now let's design the learning journey. We'll map out how students will build skills and knowledge to tackle the challenge.",
      phases: "Let's break down the learning journey into phases. How will students progress from introduction to mastery?",
      activities: "What hands-on activities will engage students at each phase? Think about varied approaches that cater to different learning styles.",
      resources: "What resources and materials will support student learning? Consider both digital and physical resources."
    }
  },
  deliverables: {
    title: 'Student Deliverables',
    steps: ['milestones', 'finalProduct', 'assessment'],
    prompts: {
      welcome: "Excellent progress! Now let's define how students will demonstrate their learning through authentic deliverables.",
      milestones: "What milestones will mark student progress? These should be meaningful checkpoints, not just deadlines.",
      finalProduct: "What will students create as their final deliverable? This should authentically demonstrate their learning.",
      assessment: "How will we assess student work fairly and comprehensively? Let's design rubrics that value both process and product."
    }
  }
};

export default function ChatV6({ projectId, projectData, onStageComplete, onDataCapture }: ChatV6Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [geminiModel, setGeminiModel] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Gemini model
  useEffect(() => {
    const initializeModel = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
          logger.error('Gemini API key not configured');
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash', // Updated to match production
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1024,
          }
        });
        
        setGeminiModel(model);
        logger.log('Gemini model initialized');
      } catch (error) {
        logger.error('Failed to initialize Gemini:', error);
      }
    };

    initializeModel();
  }, []);

  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const stageConfig = STAGE_CONFIG[projectData.stage];
      const welcomeMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: stageConfig.prompts.welcome,
        timestamp: new Date(),
        interactionType: 'welcome',
        buttons: ["Let's get started!", "Tell me more about ALF"],
        stageInfo: {
          current: projectData.stage,
          isComplete: false
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [projectData.stage]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate AI response with context
  const generateAIResponse = async (userInput: string, context: any): Promise<string> => {
    if (!geminiModel) {
      return "I'm having trouble connecting to the AI service. Please try again.";
    }

    const prompt = buildContextualPrompt(userInput, context);
    
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error('AI generation error:', error);
      return getFallbackResponse(context);
    }
  };

  // Build prompt with full context
  const buildContextualPrompt = (userInput: string, context: any): string => {
    const { stage, step, projectData, recentMessages } = context;
    
    return `You are ALF Coach, helping an educator design a learning experience using the Active Learning Framework.

CURRENT CONTEXT:
- Subject: ${projectData.subject}
- Age Group: ${projectData.ageGroup}
- Stage: ${stage} (${step + 1} of ${STAGE_CONFIG[stage].steps.length})
- Current Step: ${STAGE_CONFIG[stage].steps[step]}
- User Input: "${userInput}"

CAPTURED DATA SO FAR:
${JSON.stringify(projectData.capturedData, null, 2)}

RECENT CONVERSATION:
${recentMessages.map((m: ChatMessage) => `${m.role}: ${m.content}`).join('\n')}

INSTRUCTIONS:
1. Respond conversationally and supportively
2. Help refine and improve their input
3. If the input is good, validate and ask if they want to refine or continue
4. Keep responses concise (2-3 paragraphs max)
5. NEVER mention Apple, CBL, or Challenge Based Learning
6. Always use "Active Learning Framework" or "ALF"

Generate a helpful, encouraging response:`;
  };

  // Handle user message submission
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Determine context and action
      const context = {
        stage: projectData.stage,
        step: currentStep,
        projectData,
        recentMessages: messages.slice(-4)
      };

      // Generate AI response
      const aiContent = await generateAIResponse(content, context);
      
      // Parse AI response and extract features
      const aiFeatures = parseAIResponse(aiContent, context);
      
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiFeatures.content,
        timestamp: new Date(),
        buttons: aiFeatures.buttons,
        suggestions: aiFeatures.suggestions,
        interactionType: aiFeatures.interactionType,
        stageInfo: aiFeatures.stageInfo,
        metadata: {
          turnNumber: messages.filter(m => m.role === 'assistant').length + 1
        }
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle data capture if this was a field response
      if (aiFeatures.captureData) {
        onDataCapture(aiFeatures.captureData.field, content);
      }

      // Handle stage progression if needed
      if (aiFeatures.shouldProgress) {
        handleProgression();
      }

    } catch (error) {
      logger.error('Error handling message:', error);
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "I encountered an issue processing that. Let's try again - could you rephrase your thoughts?",
        timestamp: new Date(),
        buttons: ["Let's continue", "I need help"]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse AI response to extract UI features
  const parseAIResponse = (aiText: string, context: any) => {
    const features = {
      content: aiText,
      buttons: [] as string[],
      suggestions: [] as string[],
      interactionType: 'standard' as const,
      stageInfo: {
        current: context.stage,
        isComplete: false
      },
      captureData: null as { field: string; value: string } | null,
      shouldProgress: false
    };

    // Detect if this is a validation response
    if (aiText.toLowerCase().includes('great') || aiText.toLowerCase().includes('excellent')) {
      features.buttons = ["Let's refine this", "Continue to next step"];
      features.interactionType = 'guide';
    }

    // Add contextual suggestions based on step
    const currentStepName = STAGE_CONFIG[context.stage].steps[context.step];
    if (currentStepName === 'bigIdea') {
      features.suggestions = [
        "Environmental sustainability in our community",
        "How technology shapes our daily lives",
        "The power of storytelling across cultures"
      ];
    } else if (currentStepName === 'essentialQuestion') {
      features.suggestions = [
        "How might we create positive change in our community?",
        "What does it mean to be a responsible digital citizen?",
        "How do stories shape our understanding of the world?"
      ];
    }

    // Check if we should capture this data
    if (!features.buttons.includes("Let's refine this")) {
      features.captureData = {
        field: `${context.stage}.${currentStepName}`,
        value: context.userInput
      };
    }

    return features;
  };

  // Handle progression through steps and stages
  const handleProgression = () => {
    const stageConfig = STAGE_CONFIG[projectData.stage];
    const nextStep = currentStep + 1;

    if (nextStep < stageConfig.steps.length) {
      // Move to next step in current stage
      setCurrentStep(nextStep);
      
      const nextStepMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: stageConfig.prompts[stageConfig.steps[nextStep] as keyof typeof stageConfig.prompts] || '',
        timestamp: new Date(),
        interactionType: 'guide',
        buttons: ["I need ideas", "I have something in mind"],
        stageInfo: {
          current: projectData.stage,
          isComplete: false
        }
      };
      
      setMessages(prev => [...prev, nextStepMessage]);
    } else {
      // Stage complete - move to next stage
      const stageOrder: Array<'ideation' | 'journey' | 'deliverables'> = ['ideation', 'journey', 'deliverables'];
      const currentIndex = stageOrder.indexOf(projectData.stage);
      
      if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        onStageComplete(nextStage);
      }
    }
  };

  // Handle button clicks
  const handleButtonClick = (buttonText: string) => {
    if (buttonText === "Continue to next step") {
      handleProgression();
    } else if (buttonText === "Tell me more about ALF") {
      const alfMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `The Active Learning Framework (ALF) helps you design authentic learning experiences through three stages:

**1. Ideation** - Define the big idea, essential question, and real-world challenge
**2. Learning Journey** - Design phases, activities, and resources for skill building  
**3. Deliverables** - Create authentic assessments that demonstrate learning

Each stage builds on the previous one to create cohesive, engaging projects that connect to students' lives and communities.`,
        timestamp: new Date(),
        buttons: ["Let's get started!", "Show me an example"]
      };
      setMessages(prev => [...prev, alfMessage]);
    } else if (buttonText === "I need ideas") {
      // Show contextual suggestions
      const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
      if (lastAssistantMessage?.suggestions) {
        // Suggestions already visible
      }
    } else {
      // Treat other buttons as user input
      handleSendMessage(buttonText);
    }
  };

  // Get fallback response if AI fails
  const getFallbackResponse = (context: any): string => {
    const step = STAGE_CONFIG[context.stage].steps[context.step];
    return `Let's work on your ${step}. Take your time to think about what would work best for your ${context.projectData.ageGroup} students studying ${context.projectData.subject}.`;
  };

  // Generate unique ID
  const generateId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Render message component
  const MessageComponent = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex items-start gap-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
        )}
        
        <div className={`max-w-2xl ${isUser ? 'order-1' : 'order-2'}`}>
          <div className={`p-4 rounded-2xl shadow-sm ${
            isUser ? 'bg-purple-600 text-white' : 'bg-white text-slate-800'
          }`}>
            {/* Debug info only in development */}
            {!isUser && (isDevelopment() || isDebugEnabled()) && message.interactionType && (
              <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded mb-2">
                Type: {message.interactionType} | Stage: {message.stageInfo?.current}
              </div>
            )}
            
            {/* Message content */}
            <div className="prose prose-sm max-w-none">
              <Remark remarkPlugins={[remarkGfm]}>{message.content}</Remark>
            </div>
            
            {/* Action buttons */}
            {message.buttons && message.buttons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.buttons.map((button, i) => (
                  <button
                    key={i}
                    onClick={() => handleButtonClick(button)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {button}
                  </button>
                ))}
              </div>
            )}
            
            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-slate-500 mb-1">Ideas to consider:</p>
                {message.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={isLoading}
                    className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-sm disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 order-2">
            <User className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map(message => (
            <MessageComponent key={message.id} message={message} />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start gap-4 justify-start animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              placeholder="Share your ideas..."
              className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-slate-800 placeholder-slate-400"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}