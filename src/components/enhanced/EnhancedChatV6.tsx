import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Remark } from 'react-remark';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import { logger } from '../../utils/logger';
import { isDevelopment, isDebugEnabled } from '../../utils/environment';

// Import our enhanced components
import { ProgressiveStageHeader } from './ProgressiveStageHeader';
import { SmartActionButtons } from './SmartActionButtons';
import { ContextualSuggestionCards } from './ContextualSuggestionCards';
import { AdaptiveUserInterface, usePersona, UserPersona } from './AdaptiveUserInterface';
import { ResponsiveChatLayout, IPadOptimizedInput, TouchOptimizedMessage } from './ResponsiveChatLayout';
import { IntelligentHelpSystem } from './IntelligentHelpSystem';
import { StuckDetectionSystem, useStuckDetection } from './StuckDetectionSystem';

// Enhanced message interface
interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  buttons?: string[];
  suggestions?: any[];
  interactionType?: 'welcome' | 'standard' | 'guide' | 'provocation' | 'validation' | 'stuck_recovery';
  stageInfo?: {
    current: string;
    isComplete: boolean;
    nextStage?: string;
  };
  metadata?: {
    turnNumber?: number;
    capturedField?: string;
    validationStatus?: 'valid' | 'needs-refinement' | 'excellent';
    confidence?: number;
    timeToRead?: number;
  };
}

interface EnhancedChatV6Props {
  projectId: string;
  projectData: {
    subject: string;
    ageGroup: string;
    stage: 'ideation' | 'journey' | 'deliverables';
    capturedData: Record<string, any>;
  };
  onStageComplete: (nextStage: string) => void;
  onDataCapture: (field: string, value: any) => void;
  initialUserType?: UserPersona;
}

// Enhanced stage configuration with better UX metadata
const ENHANCED_STAGE_CONFIG = {
  ideation: {
    title: 'Ideation Stage',
    description: 'Define your learning vision',
    steps: ['bigIdea', 'essentialQuestion', 'challenge'],
    prompts: {
      welcome: "Welcome! I'm excited to help you design an engaging learning experience. Let's start by exploring your vision for student learning.",
      bigIdea: "What big idea or fundamental concept do you want students to deeply understand? Think beyond topics to the transferable concepts that will serve them beyond your classroom.",
      essentialQuestion: "What essential question will drive student inquiry throughout this experience? This should be open-ended, thought-provoking, and worthy of deep investigation.",
      challenge: "What authentic, real-world challenge will students tackle? This should connect to their lives and community while applying their learning meaningfully."
    },
    helpContext: {
      bigIdea: "Big ideas are enduring understandings that transfer across contexts",
      essentialQuestion: "Essential questions provoke deep thinking and sustained inquiry", 
      challenge: "Challenges should be authentic, meaningful, and appropriately complex"
    }
  },
  journey: {
    title: 'Learning Journey',
    description: 'Design the learning experience',
    steps: ['phases', 'activities', 'resources'],
    prompts: {
      welcome: "Excellent foundation! Now let's design how students will build knowledge and skills to tackle your challenge.",
      phases: "How will you structure the learning journey? Consider how students will progress from novice understanding to confident application.",
      activities: "What engaging activities will build student knowledge and skills at each phase? Think about varied approaches that reach all learners.",
      resources: "What resources, tools, and materials will support student learning? Consider both digital and physical resources, as well as human expertise."
    },
    helpContext: {
      phases: "Effective learning journeys scaffold from basic to complex understanding",
      activities: "Activities should be engaging, varied, and aligned to learning goals",
      resources: "Resources should be accessible, relevant, and support diverse learners"
    }
  },
  deliverables: {
    title: 'Student Deliverables',
    description: 'Define outcomes and assessment',
    steps: ['milestones', 'finalProduct', 'assessment'],
    prompts: {
      welcome: "Great progress! Now let's define how students will demonstrate and share their learning.",
      milestones: "What key milestones will mark student progress? These should be meaningful checkpoints that build toward the final deliverable.",
      finalProduct: "What will students create to demonstrate their learning? This should authentically showcase their understanding and skills.",
      assessment: "How will you assess student learning fairly and comprehensively? Consider both formative and summative approaches that value process and product."
    },
    helpContext: {
      milestones: "Milestones provide feedback opportunities and maintain momentum",
      finalProduct: "Final products should authentically demonstrate learning and skills",
      assessment: "Assessment should be transparent, fair, and support continued learning"
    }
  }
};

export default function EnhancedChatV6({ 
  projectId, 
  projectData, 
  onStageComplete, 
  onDataCapture,
  initialUserType = 'experienced'
}: EnhancedChatV6Props) {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState<UserPersona>(initialUserType);
  const [isValidated, setIsValidated] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { trackAction } = useStuckDetection();

  // Initialize chat with enhanced welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const stageConfig = ENHANCED_STAGE_CONFIG[projectData.stage];
      const welcomeMessage: EnhancedChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: stageConfig.prompts.welcome,
        timestamp: new Date(),
        interactionType: 'welcome',
        buttons: userType === 'new' ? 
          ["Let's get started!", "Tell me more about ALF", "I need help understanding this"] :
          ["Let's get started!", "Tell me more about ALF"],
        stageInfo: {
          current: projectData.stage,
          isComplete: false
        },
        metadata: {
          timeToRead: Math.ceil(stageConfig.prompts.welcome.length / 200) // Estimate reading time
        }
      };
      setMessages([welcomeMessage]);
    }
  }, [projectData.stage, userType]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced AI response generation
  const generateAIResponse = async (userInput: string, context: any): Promise<string> => {
    const prompt = buildEnhancedPrompt(userInput, context);
    
    try {
      const response = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: prompt,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      logger.error('AI generation error:', error);
      return getEnhancedFallbackResponse(context);
    }
  };

  // Enhanced prompt building with better context
  const buildEnhancedPrompt = (userInput: string, context: any): string => {
    const { stage, step, projectData, recentMessages } = context;
    const stageConfig = ENHANCED_STAGE_CONFIG[stage];
    const currentStepName = stageConfig.steps[step];
    const helpContext = stageConfig.helpContext[currentStepName as keyof typeof stageConfig.helpContext];
    
    return `You are ALF Coach, an expert educational designer helping teachers create meaningful Project-Based Learning experiences using the Active Learning Framework.

CURRENT CONTEXT:
- Subject: ${projectData.subject}
- Age Group: ${projectData.ageGroup}
- Stage: ${stage} (${step + 1} of ${stageConfig.steps.length})
- Current Step: ${currentStepName}
- User Type: ${userType} teacher
- Help Context: ${helpContext}
- User Input: "${userInput}"

CAPTURED DATA SO FAR:
${JSON.stringify(projectData.capturedData, null, 2)}

RECENT CONVERSATION:
${recentMessages.map((m: EnhancedChatMessage) => `${m.role}: ${m.content}`).join('\n')}

RESPONSE GUIDELINES:
1. Provide specific, actionable feedback on their input
2. If input is strong, validate it and offer a path forward
3. If input needs work, suggest specific improvements
4. Keep responses conversational and encouraging (2-3 paragraphs max)
5. Use educational best practices and PBL principles
6. Adapt complexity to user type: ${userType}
7. NEVER mention Apple, CBL, or Challenge Based Learning
8. Always use "Active Learning Framework" or "ALF"

Generate a helpful, expert response that moves them forward:`;
  };

  // Enhanced message handling with better UX
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    trackAction('message_sent');
    
    const userMessage: EnhancedChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setHasContent(true);

    try {
      const context = {
        stage: projectData.stage,
        step: currentStep,
        projectData,
        userType,
        recentMessages: messages.slice(-4)
      };

      const aiContent = await generateAIResponse(content, context);
      const aiFeatures = parseEnhancedAIResponse(aiContent, context, content);
      
      const aiMessage: EnhancedChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: aiFeatures.content,
        timestamp: new Date(),
        buttons: aiFeatures.buttons,
        suggestions: aiFeatures.suggestions,
        interactionType: aiFeatures.interactionType,
        stageInfo: aiFeatures.stageInfo,
        metadata: {
          turnNumber: messages.filter(m => m.role === 'assistant').length + 1,
          validationStatus: aiFeatures.validationStatus,
          confidence: aiFeatures.confidence,
          timeToRead: Math.ceil(aiFeatures.content.length / 200)
        }
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsValidated(aiFeatures.validationStatus === 'valid' || aiFeatures.validationStatus === 'excellent');

      // Handle data capture
      if (aiFeatures.captureData) {
        onDataCapture(aiFeatures.captureData.field, content);
        trackAction('progress');
      }

      // Handle progression
      if (aiFeatures.shouldProgress) {
        setTimeout(() => handleProgression(), 1000);
      }

    } catch (error) {
      logger.error('Error handling message:', error);
      trackAction('error');
      
      const errorMessage: EnhancedChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "I encountered an issue processing that. Let's try again - could you rephrase your thoughts?",
        timestamp: new Date(),
        buttons: ["Let's continue", "I need help"],
        interactionType: 'standard'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced AI response parsing
  const parseEnhancedAIResponse = (aiText: string, context: any, userInput: string) => {
    const features = {
      content: aiText,
      buttons: [] as string[],
      suggestions: [] as any[],
      interactionType: 'standard' as const,
      validationStatus: 'needs-refinement' as 'valid' | 'needs-refinement' | 'excellent',
      confidence: 0.5,
      stageInfo: {
        current: context.stage,
        isComplete: false
      },
      captureData: null as { field: string; value: string } | null,
      shouldProgress: false
    };

    // Analyze response sentiment and validation cues
    const validationKeywords = ['great', 'excellent', 'strong', 'well thought', 'good thinking'];
    const refinementKeywords = ['consider', 'might want to', 'could improve', 'think about'];
    
    const hasValidation = validationKeywords.some(keyword => 
      aiText.toLowerCase().includes(keyword)
    );
    const needsRefinement = refinementKeywords.some(keyword => 
      aiText.toLowerCase().includes(keyword)
    );

    if (hasValidation && !needsRefinement) {
      features.validationStatus = 'excellent';
      features.confidence = 0.9;
      features.buttons = userType === 'expert' ? 
        ["Continue to next step"] :
        ["Perfect! Continue", "Let me refine this further"];
      features.interactionType = 'validation';
      features.shouldProgress = userType === 'expert';
    } else if (hasValidation) {
      features.validationStatus = 'valid';
      features.confidence = 0.7;
      features.buttons = ["This looks good, continue", "Let me improve this"];
    } else {
      features.buttons = ["Let me try again", "I need help with this", "Show me examples"];
    }

    // Capture data if validated
    if (features.validationStatus !== 'needs-refinement') {
      const currentStepName = ENHANCED_STAGE_CONFIG[context.stage].steps[context.step];
      features.captureData = {
        field: `${context.stage}.${currentStepName}`,
        value: userInput
      };
    }

    return features;
  };

  // Enhanced progression handling
  const handleProgression = () => {
    const stageConfig = ENHANCED_STAGE_CONFIG[projectData.stage];
    const nextStep = currentStep + 1;

    if (nextStep < stageConfig.steps.length) {
      setCurrentStep(nextStep);
      setIsValidated(false);
      setHasContent(false);
      
      const nextStepName = stageConfig.steps[nextStep];
      const nextStepMessage: EnhancedChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: stageConfig.prompts[nextStepName as keyof typeof stageConfig.prompts] || '',
        timestamp: new Date(),
        interactionType: 'guide',
        buttons: userType === 'new' ? 
          ["I need examples", "I have ideas", "Help me understand this"] :
          ["I need ideas", "I'm ready to start"],
        stageInfo: {
          current: projectData.stage,
          isComplete: false
        }
      };
      
      setMessages(prev => [...prev, nextStepMessage]);
      trackAction('progress');
    } else {
      // Stage complete
      const stageOrder: Array<'ideation' | 'journey' | 'deliverables'> = ['ideation', 'journey', 'deliverables'];
      const currentIndex = stageOrder.indexOf(projectData.stage);
      
      if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        onStageComplete(nextStage);
        trackAction('stage_complete');
      }
    }
  };

  // Enhanced button handling
  const handleButtonClick = (buttonText: string) => {
    trackAction('button_click');
    
    if (buttonText.includes("Continue")) {
      handleProgression();
    } else if (buttonText === "Tell me more about ALF") {
      showALFInformation();
    } else if (buttonText.includes("need help") || buttonText.includes("Help me")) {
      handleGetHelp();
    } else if (buttonText.includes("examples") || buttonText.includes("ideas")) {
      handleGetIdeas();
    } else {
      handleSendMessage(buttonText);
    }
  };

  // Enhanced help handlers
  const handleGetHelp = () => {
    trackAction('help');
    // This will be handled by the IntelligentHelpSystem
  };

  const handleGetIdeas = () => {
    trackAction('ideas');
    setShowSuggestions(true);
  };

  const handleStuckDetected = (signals: any[]) => {
    logger.info('Stuck signals detected:', signals);
    // The StuckDetectionSystem will handle the UI
  };

  const handleRecoveryAction = (actionId: string) => {
    trackAction('recovery_action');
    logger.info('Recovery action taken:', actionId);
  };

  // Helper functions
  const showALFInformation = () => {
    const alfMessage: EnhancedChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: `The Active Learning Framework (ALF) helps you design authentic learning experiences through three connected stages:

**1. Ideation** - Define the big idea, essential question, and real-world challenge that will drive learning
**2. Learning Journey** - Design phases, activities, and resources that scaffold student growth
**3. Deliverables** - Create authentic assessments where students demonstrate and share their learning

Each stage builds on the previous one to create cohesive, engaging projects that connect to students' lives and communities. The goal is learning that transfers beyond your classroom.`,
      timestamp: new Date(),
      buttons: ["Let's get started!", "I want to see an example"],
      interactionType: 'guide'
    };
    setMessages(prev => [...prev, alfMessage]);
  };

  const getEnhancedFallbackResponse = (context: any): string => {
    const stepName = ENHANCED_STAGE_CONFIG[context.stage].steps[context.step];
    const helpContext = ENHANCED_STAGE_CONFIG[context.stage].helpContext[stepName as keyof typeof ENHANCED_STAGE_CONFIG[typeof context.stage]['helpContext']];
    
    return `Let's focus on your ${stepName}. ${helpContext}. Take your time to think about what would work best for your ${context.projectData.ageGroup} students studying ${context.projectData.subject}.`;
  };

  const generateId = (): string => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Enhanced message component
  const EnhancedMessageComponent = ({ message }: { message: EnhancedChatMessage }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={`flex items-start gap-4 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
        {!isUser && (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-purple-600" />
          </div>
        )}
        
        <div className={`max-w-2xl ${isUser ? 'order-1' : 'order-2'}`}>
          <div className={`p-4 rounded-2xl shadow-sm ${
            isUser ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'
          }`}>
            {/* Debug info */}
            {!isUser && (isDevelopment() || isDebugEnabled()) && message.metadata && (
              <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded mb-2">
                Type: {message.interactionType} | Validation: {message.metadata.validationStatus} | 
                Confidence: {message.metadata.confidence}
              </div>
            )}
            
            {/* Message content */}
            <div className="prose prose-sm max-w-none">
              <Remark remarkPlugins={[remarkGfm]}>{message.content}</Remark>
            </div>
            
            {/* Reading time estimate */}
            {!isUser && message.metadata?.timeToRead && (
              <div className="text-xs text-gray-400 mt-2">
                {message.metadata.timeToRead} min read
              </div>
            )}
          </div>
          
          {/* Enhanced action buttons */}
          {!isUser && (
            <div className="mt-4">
              <SmartActionButtons
                stage={projectData.stage}
                step={currentStep}
                inputValue={inputValue}
                hasContent={hasContent}
                isValidated={isValidated}
                isLoading={isLoading}
                userType={userType}
                onSendMessage={handleSendMessage}
                onGetIdeas={handleGetIdeas}
                onRefineContent={() => handleSendMessage("Let me refine this further")}
                onContinue={handleProgression}
                onGetHelp={handleGetHelp}
              />
            </div>
          )}
          
          {/* Legacy buttons (for compatibility) */}
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
          
          {/* Timestamp */}
          <div className={`text-xs text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 order-2">
            <User className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
    );
  };

  // Sidebar content
  const sidebarContent = (
    <div className="space-y-6">
      <ProgressiveStageHeader
        currentStage={projectData.stage}
        currentStep={currentStep}
        stageData={projectData.capturedData}
        userType={userType}
      />
      
      {showSuggestions && (
        <ContextualSuggestionCards
          stage={projectData.stage}
          step={currentStep}
          subject={projectData.subject}
          ageGroup={projectData.ageGroup}
          userType={userType}
          onSelectSuggestion={(suggestion) => {
            handleSendMessage(suggestion.title);
            setShowSuggestions(false);
          }}
          onRequestMore={() => handleSendMessage("I need more ideas for this step")}
        />
      )}
    </div>
  );

  return (
    <AdaptiveUserInterface
      userType={userType}
      onUserTypeChange={setUserType}
      className="h-screen"
    >
      <ResponsiveChatLayout
        sidebar={sidebarContent}
        className="h-full"
      >
        <div className="flex flex-col h-full bg-slate-50">
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-area">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map(message => (
                <EnhancedMessageComponent key={message.id} message={message} />
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
          
          {/* Enhanced input area */}
          <div className="border-t bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <IPadOptimizedInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSendMessage(inputValue)}
                disabled={isLoading}
                placeholder="Share your thoughts..."
              />
            </div>
          </div>
        </div>
        
        {/* Enhanced help system */}
        <IntelligentHelpSystem
          currentStage={projectData.stage}
          currentStep={ENHANCED_STAGE_CONFIG[projectData.stage].steps[currentStep]}
          userType={userType}
          userContext={{
            hasInteracted: messages.length > 1,
            timeSpent: Date.now() - (messages[0]?.timestamp.getTime() || Date.now()),
            lastAction: messages[messages.length - 1]?.role
          }}
          onHelpUsed={(helpId, helpful) => {
            logger.info('Help used:', { helpId, helpful });
          }}
        />
        
        {/* Stuck detection system */}
        <StuckDetectionSystem
          isActive={true}
          currentStage={projectData.stage}
          currentStep={ENHANCED_STAGE_CONFIG[projectData.stage].steps[currentStep]}
          userType={userType}
          onStuckDetected={handleStuckDetected}
          onRecoveryAction={handleRecoveryAction}
          onGetHelp={handleGetHelp}
          onGetIdeas={handleGetIdeas}
          onSimplifyTask={() => handleSendMessage("Can you help me break this down into smaller steps?")}
          onTryAlternative={() => handleSendMessage("Can you suggest a different approach?")}
        />
      </ResponsiveChatLayout>
    </AdaptiveUserInterface>
  );
}