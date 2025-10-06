/**
 * PBLChatInterface.tsx
 *
 * Conversational interface for the 9-step PBL project creation process.
 * Redesigned with fixed layout: compact header, fixed sidebar, scrollable chat, fixed input
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Circle,
  AlertCircle,
  HelpCircle,
  Save,
  Download,
  Sparkles,
  MessageSquare,
  Clock,
  Target,
  BookOpen,
  Users,
  Calendar,
  Globe,
  FileText,
  Award
} from 'lucide-react';
import { PBLFlowOrchestrator, type PBLStepId, type PBLProjectState } from '../../services/PBLFlowOrchestrator';
import { EnhancedButton } from '../ui/EnhancedButton';
import { logger } from '../../utils/logger';
import { CompactHeader } from './CompactHeader';
import { FixedProgressSidebar } from './FixedProgressSidebar';
import { ScrollableChatArea } from './ScrollableChatArea';
import { FixedInputBar } from './FixedInputBar';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    step?: PBLStepId;
    subStep?: string;
    suggestions?: string[];
    options?: Array<{ id: string; label: string; description?: string }>;
    error?: boolean;
    actionButtons?: Array<{
      label: string;
      action: string;
      variant?: 'primary' | 'secondary' | 'ghost';
    }>;
  };
}

interface PBLChatInterfaceProps {
  onComplete?: (projectData: any) => void;
  onSave?: (state: PBLProjectState) => void;
  initialState?: Partial<PBLProjectState>;
  className?: string;
}

// Step icons and colors
const STEP_CONFIG: Record<PBLStepId, {
  icon: React.ElementType;
  color: string;
  label: string;
  description: string;
}> = {
  PROJECT_INTAKE: {
    icon: Users,
    color: 'blue',
    label: 'Class Context',
    description: 'Understanding your classroom'
  },
  GOALS_EQ: {
    icon: Target,
    color: 'indigo',
    label: 'Goals & Questions',
    description: 'Defining learning objectives'
  },
  STANDARDS_ALIGNMENT: {
    icon: BookOpen,
    color: 'purple',
    label: 'Standards',
    description: 'Curriculum alignment'
  },
  PHASES_MILESTONES: {
    icon: Calendar,
    color: 'pink',
    label: 'Project Phases',
    description: 'Timeline and milestones'
  },
  ARTIFACTS_RUBRICS: {
    icon: FileText,
    color: 'red',
    label: 'Artifacts',
    description: 'Student deliverables'
  },
  ROLES_DIFFERENTIATION: {
    icon: Users,
    color: 'orange',
    label: 'Roles & Support',
    description: 'Student responsibilities'
  },
  OUTREACH_EXHIBITION: {
    icon: Globe,
    color: 'yellow',
    label: 'Community',
    description: 'Real-world connections'
  },
  EVIDENCE_LOGISTICS: {
    icon: Clock,
    color: 'green',
    label: 'Logistics',
    description: 'Practical planning'
  },
  REVIEW_EXPORT: {
    icon: Award,
    color: 'teal',
    label: 'Review',
    description: 'Finalize your project'
  }
};

export function PBLChatInterface({
  onComplete,
  onSave,
  initialState,
  className = ''
}: PBLChatInterfaceProps) {
  // State management
  const [orchestrator] = useState(() => new PBLFlowOrchestrator(initialState));
  const [currentState, setCurrentState] = useState<PBLProjectState>(orchestrator.getState());
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showProgressPanel, setShowProgressPanel] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: orchestrator.getCurrentPrompt(),
      timestamp: new Date(),
      metadata: {
        step: currentState.currentStep,
        suggestions: [
          "Let's get started!",
          "Tell me about your class",
          "I need help"
        ]
      }
    };
    setMessages([welcomeMessage]);
  }, []);
  
  // Handle user input submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {e.preventDefault();}
    
    if (!inputValue.trim()) {return;}
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Process input through orchestrator
    setTimeout(() => {
      const result = orchestrator.processUserInput(inputValue);
      const newState = orchestrator.getState();
      setCurrentState(newState);
      
      // Create assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.response || '',
        timestamp: new Date(),
        metadata: {
          step: newState.currentStep,
          subStep: newState.subStep || undefined,
          suggestions: result.suggestions,
          error: result.validation && !result.validation.valid
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Handle completion
      if (result.nextAction === 'complete' && onComplete) {
        onComplete(newState.projectData);
      }
      
      // Auto-save
      if (onSave) {
        onSave(newState);
      }
    }, 1000 + Math.random() * 500); // Simulate typing delay
  }, [inputValue, orchestrator, onComplete, onSave]);
  
  // Handle quick action buttons
  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action);
    setTimeout(() => handleSubmit(), 100);
  }, [handleSubmit]);
  
  // Handle navigation
  const handleNavigation = useCallback((direction: 'back' | 'skip') => {
    const command = direction === 'back' ? 'go back' : 'skip this';
    handleQuickAction(command);
  }, [handleQuickAction]);
  
  // Calculate progress
  const progress = useMemo(() => orchestrator.getProgress(), [currentState]);
  const steps = Object.keys(STEP_CONFIG) as PBLStepId[];
  const currentStepIndex = steps.indexOf(currentState.currentStep);
  
  // Get suggested actions
  const suggestedActions = useMemo(() => 
    orchestrator.getSuggestedActions(),
    [currentState]
  );
  
  // Prepare data for new components
  const progressItems = useMemo(() =>
    steps.map((stepId) => ({
      id: stepId,
      label: STEP_CONFIG[stepId].label,
      icon: STEP_CONFIG[stepId].icon,
      completed: orchestrator.isStepComplete(stepId),
      content: currentState.projectData[stepId] ?
        String(currentState.projectData[stepId]).slice(0, 100) : undefined
    })),
    [steps, currentState, orchestrator]
  );

  const currentStageConfig = STEP_CONFIG[currentState.currentStep];

  const formattedMessages = useMemo(() =>
    messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      suggestions: msg.metadata?.suggestions,
      actions: msg.metadata?.actionButtons?.map(btn => ({
        label: btn.label,
        onClick: () => handleQuickAction(btn.action),
        variant: btn.variant === 'primary' ? 'primary' as const : 'secondary' as const
      }))
    })),
    [messages, handleQuickAction]
  );

  const handleSaveDraft = useCallback(() => {
    const state = orchestrator.serialize();
    localStorage.setItem('pbl-project-draft', state);
    logger.info('Project saved to draft');
    if (onSave) {
      onSave(currentState);
    }
  }, [orchestrator, currentState, onSave]);

  return (
    <div className={`relative h-screen bg-gray-50 dark:bg-slate-900 ${className}`}>
      {/* Fixed Compact Header */}
      <CompactHeader
        currentStage={currentState.currentStep}
        currentStageLabel={currentStageConfig.label}
        currentStageDescription={currentStageConfig.description}
        currentStageIcon={currentStageConfig.icon}
        totalStages={steps.length}
        currentStageIndex={currentStepIndex}
        stages={progressItems}
        onStageSelect={(stageId) => handleQuickAction(`jump to ${STEP_CONFIG[stageId].label}`)}
        onSave={handleSaveDraft}
        onHelp={() => setShowHelp(true)}
      />

      {/* Fixed Progress Sidebar */}
      <FixedProgressSidebar
        currentStage={currentState.currentStep}
        progressItems={progressItems}
        onStageSelect={(stageId) => handleQuickAction(`jump to ${STEP_CONFIG[stageId].label}`)}
      />

      {/* Scrollable Chat Area */}
      <ScrollableChatArea
        messages={formattedMessages}
        isTyping={isTyping}
        autoScroll={true}
      />

      {/* Fixed Input Bar */}
      <FixedInputBar
        onSendMessage={(msg) => {
          setInputValue(msg);
          setTimeout(() => handleSubmit(), 100);
        }}
        placeholder="Type your response..."
        disabled={isTyping}
      />

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-[1100]"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-slate-700/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Help & Tips
              </h2>

              <div className="space-y-3 text-[13px] text-gray-600 dark:text-slate-400">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-[13px]">
                    Navigation Commands
                  </h3>
                  <ul className="space-y-1 ml-4 text-[11px]">
                    <li>• Say "go back" to return to the previous step</li>
                    <li>• Say "skip" to skip optional fields</li>
                    <li>• Say "help" for context-specific assistance</li>
                    <li>• Click on any completed step to revisit it</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-[13px]">
                    Tips for Success
                  </h3>
                  <ul className="space-y-1 ml-4 text-[11px]">
                    <li>• Be specific about your learning goals</li>
                    <li>• Consider your available time and resources</li>
                    <li>• Think about real-world connections</li>
                    <li>• Your responses are automatically saved</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-[13px]">
                    Current Step
                  </h3>
                  <p className="text-[11px]">
                    You're working on: <strong>{currentStageConfig.label}</strong>
                  </p>
                  <p className="mt-1 text-[11px]">
                    {currentStageConfig.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowHelp(false)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-[13px] rounded-lg transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
