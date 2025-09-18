/**
 * PBLChatInterface.tsx
 * 
 * Conversational interface for the 9-step PBL project creation process.
 * Maintains natural conversation flow while ensuring structured data collection.
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
import { PBLFlowOrchestrator, PBLStepId, PBLProjectState } from '../../services/PBLFlowOrchestrator';
import { EnhancedButton } from '../ui/EnhancedButton';
import { logger } from '../../utils/logger';

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
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
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
  
  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Progress Sidebar */}
      <AnimatePresence>
        {showProgressPanel && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto"
          >
            {/* Progress Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                ALF Project Builder
              </h2>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Steps List */}
            <div className="space-y-3">
              {steps.map((stepId, index) => {
                const stepConfig = STEP_CONFIG[stepId];
                const Icon = stepConfig.icon;
                const isActive = stepId === currentState.currentStep;
                const isComplete = orchestrator.isStepComplete(stepId);
                const isPending = index > currentStepIndex;
                
                return (
                  <motion.div
                    key={stepId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      relative flex items-start space-x-3 p-3 rounded-lg transition-all cursor-pointer
                      ${isActive ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800' : ''}
                      ${isComplete ? 'opacity-100' : isPending ? 'opacity-50' : 'opacity-100'}
                      ${!isPending ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50' : ''}
                    `}
                    onClick={() => {
                      if (!isPending && !isActive) {
                        handleQuickAction(`jump to ${stepConfig.label}`);
                      }
                    }}
                  >
                    {/* Step Icon */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      ${isActive ? `bg-${stepConfig.color}-500 text-white` : 
                        isComplete ? 'bg-green-500 text-white' : 
                        'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    `}>
                      {isComplete ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${
                          isActive ? 'text-primary-900 dark:text-primary-100' : 
                          'text-gray-900 dark:text-gray-100'
                        }`}>
                          {stepConfig.label}
                        </h3>
                        {isActive && (
                          <span className="text-xs text-primary-600 dark:text-primary-400">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {stepConfig.description}
                      </p>
                      
                      {/* Sub-step indicator */}
                      {isActive && currentState.subStep && (
                        <div className="mt-2 text-xs text-primary-600 dark:text-primary-400">
                          <Sparkles className="inline w-3 h-3 mr-1" />
                          {currentState.subStep.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                    
                    {/* Connection line */}
                    {index < steps.length - 1 && (
                      <div className={`
                        absolute left-8 top-14 w-0.5 h-12
                        ${isComplete ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}
                      `} />
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleNavigation('back')}
                  disabled={currentStepIndex === 0}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
                
                <button
                  onClick={() => {
                    const state = orchestrator.serialize();
                    localStorage.setItem('pbl-project-draft', state);
                    logger.info('Project saved to draft');
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/30"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>
                
                <button
                  onClick={() => setShowHelp(true)}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Get Help</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProgressPanel(!showProgressPanel)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Building Your PBL Project
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Step {currentStepIndex + 1} of {steps.length}: {STEP_CONFIG[currentState.currentStep].label}
                </p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {progress === 100 && (
                <EnhancedButton
                  variant="filled"
                  size="sm"
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => handleQuickAction('export project')}
                >
                  Export Project
                </EnhancedButton>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-2xl px-4 py-3 rounded-2xl
                  ${message.role === 'user' 
                    ? 'bg-primary-500 text-white' 
                    : message.metadata?.error
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'}
                `}>
                  {/* Message content */}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Options/Suggestions */}
                  {message.metadata?.suggestions && message.role === 'assistant' && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.metadata.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(suggestion)}
                          className="px-3 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Multiple choice options */}
                  {message.metadata?.options && (
                    <div className="mt-3 space-y-2">
                      {message.metadata.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleQuickAction(option.label)}
                          className="w-full text-left px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="text-sm font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {option.description}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Timestamp */}
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-primary-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          {/* Suggested Actions */}
          {suggestedActions.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              disabled={isTyping}
            />
            <EnhancedButton
              type="submit"
              variant="filled"
              size="lg"
              disabled={!inputValue.trim() || isTyping}
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send
            </EnhancedButton>
          </form>
        </div>
      </div>
      
      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Help & Tips
              </h2>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Navigation Commands
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Say "go back" to return to the previous step</li>
                    <li>• Say "skip" to skip optional fields</li>
                    <li>• Say "help" for context-specific assistance</li>
                    <li>• Click on any completed step to revisit it</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Tips for Success
                  </h3>
                  <ul className="space-y-1 ml-4">
                    <li>• Be specific about your learning goals</li>
                    <li>• Consider your available time and resources</li>
                    <li>• Think about real-world connections</li>
                    <li>• Your responses are automatically saved</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Current Step
                  </h3>
                  <p>
                    You're working on: <strong>{STEP_CONFIG[currentState.currentStep].label}</strong>
                  </p>
                  <p className="mt-1">
                    {STEP_CONFIG[currentState.currentStep].description}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <EnhancedButton
                  variant="filled"
                  onClick={() => setShowHelp(false)}
                >
                  Got it!
                </EnhancedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
