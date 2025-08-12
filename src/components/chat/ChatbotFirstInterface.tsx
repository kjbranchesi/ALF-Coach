/**
 * ChatbotFirstInterface.tsx
 * 
 * Primary conversational interface for ALF Coach
 * Mental Model: Teachers DESIGN curriculum, Students JOURNEY through Creative Process
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ChevronRight, RotateCcw, TrendingUp, RefreshCw } from 'lucide-react';
import { ContextualInitiator } from './ContextualInitiator';
import { ChatbotOnboarding } from './ChatbotOnboarding';
import UIGuidanceSystem from './UIGuidanceSystem';
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';
import { firebaseSync } from '../../services/FirebaseSync';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    confirmationNeeded?: string;
  };
}

interface ProjectState {
  stage: 'WELCOME' | 'IDEATION' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  
  ideation: {
    bigIdea: string;
    bigIdeaConfirmed: boolean;
    essentialQuestion: string;
    essentialQuestionConfirmed: boolean;
    challenge: string;
    challengeConfirmed: boolean;
  };
  
  journey: {
    projectDuration: string;
    phaseBreakdown: {
      analyze: { duration: string; activities: string[] };
      brainstorm: { duration: string; activities: string[] };
      prototype: { duration: string; activities: string[] };
      evaluate: { duration: string; activities: string[] };
    };
    iterationStrategy: string;
  };
  
  contextualInitiator: {
    type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline' | null;
    value: any;
  };
}

// Conversation starters for each stage
const CONVERSATION_FLOWS = {
  WELCOME: {
    opening: "Welcome! I'm your curriculum design partner. Together, we'll create a transformative learning experience that guides your students through a structured creative process. What subject do you teach?",
    followUp: "Excellent! And what grade level are your students?"
  },
  
  IDEATION: {
    bigIdea: {
      prompt: "Let's start with your Big Idea - the core concept you want your students to explore. What topic or theme excites both you and your students?",
      validation: "That's a compelling focus! In your local context, what specific aspect would resonate most with your students?",
      confirmation: "Perfect! Ready to lock in '{value}' as your Big Idea?"
    },
    essentialQuestion: {
      prompt: "Now for your Essential Question - this will drive student inquiry throughout the project. What open-ended question will challenge students to think deeply about {bigIdea}?",
      validation: "Good start! Essential Questions work best when they require investigation and can't be answered with yes/no. Could we rephrase it to begin with 'How might...' or 'Why does...'?",
      confirmation: "Excellent question! Ready to confirm '{value}'?"
    },
    challenge: {
      prompt: "Finally, let's define the authentic challenge your students will tackle. What real-world problem related to {bigIdea} will they solve?",
      validation: "That's authentic! To make it even more real, who specifically will benefit from student solutions? Where might their work be implemented?",
      confirmation: "Outstanding! Ready to lock in this challenge: '{value}'?"
    }
  },
  
  JOURNEY: {
    opening: "Now let's design how YOUR STUDENTS will journey through the Creative Process to tackle this challenge. Remember, you're designing the learning experience FOR them, not participating in it yourself.",
    duration: "How much time do you have for this project? (e.g., '3 weeks', 'one semester', '2 months')",
    phaseIntro: "Perfect! With {duration}, here's how your students could move through the four phases of the Creative Process. Each phase builds on the previous, with room for iteration.",
    phaseDetails: {
      analyze: "In the ANALYZE phase, your students will investigate {essentialQuestion}. What key understandings should they gain?",
      brainstorm: "During BRAINSTORM, students will generate solutions. What creative thinking methods will you introduce?",
      prototype: "In PROTOTYPE, students build and test solutions. What will they create to demonstrate learning?",
      evaluate: "Finally, in EVALUATE, students refine and present. Who will be their authentic audience?"
    }
  },
  
  DELIVERABLES: {
    opening: "Let's define what students will create to demonstrate their learning. These deliverables become both assessment evidence and learning artifacts.",
    rubric: "I'll help you design assessment criteria that values both product quality AND the learning process. What's most important to assess?"
  }
};

interface ChatbotFirstInterfaceProps {
  projectId?: string;
  projectData?: {
    subject: string;
    ageGroup: string;
    title: string;
    ideation?: any;
    learningJourney?: any;
    studentDeliverables?: any;
    stage: string;
  };
  onStageComplete?: (stage: string, data: any) => void;
  onNavigate?: (target: string) => void;
}

export const ChatbotFirstInterface: React.FC<ChatbotFirstInterfaceProps> = ({ 
  projectId, 
  projectData, 
  onStageComplete,
  onNavigate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [userContext, setUserContext] = useState<any>(null);
  const [projectState, setProjectState] = useState<ProjectState>({
    stage: 'WELCOME',
    ideation: {
      bigIdea: '',
      bigIdeaConfirmed: false,
      essentialQuestion: '',
      essentialQuestionConfirmed: false,
      challenge: '',
      challengeConfirmed: false
    },
    journey: {
      projectDuration: '',
      phaseBreakdown: {
        analyze: { duration: '', activities: [] },
        brainstorm: { duration: '', activities: [] },
        prototype: { duration: '', activities: [] },
        evaluate: { duration: '', activities: [] }
      },
      iterationStrategy: ''
    },
    contextualInitiator: {
      type: null,
      value: null
    }
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef(new GeminiService());
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize with appropriate message based on project stage
  useEffect(() => {
    // Check for onboarding data from wizard
    const onboardingDataStr = sessionStorage.getItem('onboardingData');
    let onboardingData: any = null;
    
    if (onboardingDataStr) {
      try {
        onboardingData = JSON.parse(onboardingDataStr);
        console.log('[ChatbotFirstInterface] Using onboarding data:', onboardingData);
        // Store user context for UI guidance
        setUserContext(onboardingData);
        // Clear after reading to prevent reuse
        sessionStorage.removeItem('onboardingData');
      } catch (e) {
        console.error('Failed to parse onboarding data:', e);
      }
    }
    
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('alf-onboarding-complete');
    if (!hasCompletedOnboarding && !projectData && !onboardingData) {
      setShowOnboarding(true);
    }
    
    // If we have onboarding data, craft a contextual initial message
    if (onboardingData && messages.length === 0) {
      const { subject, ageGroup, educatorPerspective, location, projectScope } = onboardingData;
      const contextualMessage = {
        id: '1',
        role: 'assistant' as const,
        content: `Great! I see you're planning a ${subject} project for ${ageGroup}${location ? ` in a ${location} setting` : ''}. 

You mentioned: "${educatorPerspective}"

Let's develop this into a complete Active Learning Framework project using the Creative Process. First, let's clarify the big idea - what's the core concept or understanding you want students to walk away with?`,
        timestamp: Date.now()
      };
      setMessages([contextualMessage]);
    }
    
    // Load existing chat history if available
    if (projectData && (projectData as any).chatHistory) {
      const existingHistory = (projectData as any).chatHistory;
      if (Array.isArray(existingHistory) && existingHistory.length > 0) {
        setMessages(existingHistory.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp)
        })));
        return; // Don't add initial message if we have history
      }
    }
    
    let initialMessage: Message;
    
    if (projectData) {
      // Initialize based on existing project stage
      const stage = projectData.stage;
      
      if (stage === 'Ideation' && !projectData.ideation?.bigIdea) {
        initialMessage = {
          id: 'welcome-ideation',
          role: 'assistant',
          content: `Welcome back! Let's continue designing your ${projectData.subject} project for ${projectData.ageGroup}. ${CONVERSATION_FLOWS.IDEATION.bigIdea.prompt}`,
          timestamp: new Date()
        };
        setProjectState(prev => ({ ...prev, stage: 'IDEATION' }));
      } else if (stage === 'Learning Journey') {
        initialMessage = {
          id: 'welcome-journey',
          role: 'assistant',
          content: CONVERSATION_FLOWS.JOURNEY.opening,
          timestamp: new Date()
        };
        setProjectState(prev => ({ ...prev, stage: 'JOURNEY' }));
      } else if (stage === 'Deliverables') {
        initialMessage = {
          id: 'welcome-deliverables',
          role: 'assistant',
          content: CONVERSATION_FLOWS.DELIVERABLES.opening,
          timestamp: new Date()
        };
        setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES' }));
      } else {
        initialMessage = {
          id: 'welcome',
          role: 'assistant',
          content: CONVERSATION_FLOWS.WELCOME.opening,
          timestamp: new Date()
        };
      }
      
      // Load existing ideation data if available
      if (projectData.ideation) {
        setProjectState(prev => ({
          ...prev,
          ideation: {
            bigIdea: projectData.ideation.bigIdea || '',
            bigIdeaConfirmed: !!projectData.ideation.bigIdea,
            essentialQuestion: projectData.ideation.essentialQuestion || '',
            essentialQuestionConfirmed: !!projectData.ideation.essentialQuestion,
            challenge: projectData.ideation.challenge || '',
            challengeConfirmed: !!projectData.ideation.challenge
          }
        }));
      }
    } else {
      // Default welcome for new projects
      initialMessage = {
        id: 'welcome',
        role: 'assistant',
        content: CONVERSATION_FLOWS.WELCOME.opening,
        timestamp: new Date()
      };
    }
    
    setMessages([initialMessage]);
  }, [projectData]);
  
  // Handle user input
  // Helper to get current step within a stage
  const getCurrentStep = () => {
    if (projectState.stage === 'IDEATION') {
      if (!projectState.ideation.bigIdeaConfirmed) return 'bigIdea';
      if (!projectState.ideation.essentialQuestionConfirmed) return 'essentialQuestion';
      if (!projectState.ideation.challengeConfirmed) return 'challenge';
    }
    if (projectState.stage === 'JOURNEY') {
      const phases = projectState.journey.phaseBreakdown;
      if (!phases.analyze.activities.length) return 'analyze';
      if (!phases.brainstorm.activities.length) return 'brainstorm';
      if (!phases.prototype.activities.length) return 'prototype';
      if (!phases.evaluate.activities.length) return 'evaluate';
    }
    if (projectState.stage === 'DELIVERABLES') {
      return 'rubric'; // or 'milestones' based on progress
    }
    return null;
  };

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    
    // Update interaction time
    setLastInteractionTime(Date.now());
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Save user message to Firebase
    if (projectId) {
      try {
        await firebaseSync.updateBlueprint(projectId, {
          chatHistory: [...messages, userMessage]
        });
      } catch (error) {
        console.error('Error saving chat to Firebase:', error);
      }
    }
    
    // Process the message and generate response
    const response = await processUserInput(userMessage.content);
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: response.metadata
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
    
    // Save assistant message to Firebase
    if (projectId) {
      try {
        await firebaseSync.updateBlueprint(projectId, {
          chatHistory: [...messages, userMessage, assistantMessage]
        });
      } catch (error) {
        console.error('Error saving chat to Firebase:', error);
      }
    }
    
    // Check if we need to show a contextual initiator
    if (response.showInitiator) {
      setProjectState(prev => ({
        ...prev,
        contextualInitiator: {
          type: response.initiatorType,
          value: response.initiatorValue
        }
      }));
    }
  }, [input]);
  
  // Process user input based on current stage using AI
  const processUserInput = async (content: string) => {
    const currentStage = projectState.stage;
    
    try {
      // Determine the appropriate step for the AI
      let step = 'IDEATION_BIG_IDEA';
      let action = 'response';
      
      // Map our stage and state to the step format the GeminiService expects
      if (currentStage === 'IDEATION') {
        if (!projectState.ideation.bigIdeaConfirmed) {
          step = 'IDEATION_BIG_IDEA';
        } else if (!projectState.ideation.essentialQuestionConfirmed) {
          step = 'IDEATION_EQ';
        } else if (!projectState.ideation.challengeConfirmed) {
          step = 'IDEATION_CHALLENGE';
        }
      } else if (currentStage === 'JOURNEY') {
        step = 'JOURNEY_PHASES';
      } else if (currentStage === 'DELIVERABLES') {
        step = 'DELIVER_MILESTONES';
      }
      
      // Build context for the AI
      const context = {
        wizard: projectData ? {
          subject: projectData.subject,
          students: projectData.ageGroup,
          scope: 'Full Project',
          duration: projectState.journey.projectDuration || '3 weeks'
        } : {},
        ideation: projectState.ideation,
        journey: projectState.journey
      };
      
      // Call the AI service
      const response = await geminiService.current.generate({
        step,
        context,
        action,
        userInput: content
      });
      
      // Process the AI response
      let shouldShowInitiator = false;
      let initiatorType: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline' | null = null;
      let initiatorValue: any = null;
      
      // Check if we need to show a contextual initiator based on the stage
      if (currentStage === 'IDEATION') {
        if (!projectState.ideation.bigIdeaConfirmed && content.length > 20) {
          shouldShowInitiator = true;
          initiatorType = 'big-idea';
          initiatorValue = content;
          
          // Save the Big Idea temporarily
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, bigIdea: content }
          }));
        } else if (!projectState.ideation.essentialQuestionConfirmed && 
                   projectState.ideation.bigIdeaConfirmed && 
                   content.includes('?')) {
          shouldShowInitiator = true;
          initiatorType = 'essential-question';
          initiatorValue = content;
          
          // Save the Essential Question temporarily
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, essentialQuestion: content }
          }));
        } else if (!projectState.ideation.challengeConfirmed && 
                   projectState.ideation.essentialQuestionConfirmed) {
          shouldShowInitiator = true;
          initiatorType = 'challenge';
          initiatorValue = content;
          
          // Save the Challenge temporarily
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, challenge: content }
          }));
        }
      }
      
      return {
        content: response.message,
        metadata: { 
          stage: currentStage,
          suggestions: response.suggestions 
        },
        showInitiator: shouldShowInitiator,
        initiatorType,
        initiatorValue
      };
      
    } catch (error) {
      console.error('Error processing input with AI:', error);
      
      // Fallback to simple responses if AI fails
      switch (currentStage) {
        case 'WELCOME':
          return {
            content: "Excellent choice! And what grade level are your students?",
            metadata: { stage: 'WELCOME' }
          };
          
        case 'IDEATION':
          if (!projectState.ideation.bigIdeaConfirmed) {
            setProjectState(prev => ({
              ...prev,
              ideation: { ...prev.ideation, bigIdea: content }
            }));
            
            return {
              content: CONVERSATION_FLOWS.IDEATION.bigIdea.validation,
              metadata: { stage: 'IDEATION', confirmationNeeded: 'bigIdea' },
              showInitiator: true,
              initiatorType: 'big-idea' as const,
              initiatorValue: content
            };
          }
          break;
          
        case 'JOURNEY':
          return {
            content: "Let's plan that phase in detail...",
            metadata: { stage: 'JOURNEY' }
          };
          
        default:
          return {
            content: "Let's continue designing your curriculum...",
            metadata: {}
          };
      }
      
      return {
        content: "I'm here to help! Let's continue working on your project.",
        metadata: {}
      };
    }
  };
  
  // Handle contextual initiator confirmation
  const handleInitiatorConfirm = async (value: any) => {
    const initiatorType = projectState.contextualInitiator.type;
    
    switch (initiatorType) {
      case 'big-idea':
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, bigIdea: value, bigIdeaConfirmed: true },
          contextualInitiator: { type: null, value: null }
        }));
        
        // Save to Firebase if we have a project
        if (projectId && projectData) {
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'ideation.bigIdea': value
            });
          } catch (error) {
            console.error('Error saving Big Idea to Firebase:', error);
          }
        }
        
        // Move to Essential Question
        const questionPrompt: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: CONVERSATION_FLOWS.IDEATION.essentialQuestion.prompt.replace('{bigIdea}', value),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, questionPrompt]);
        break;
        
      case 'essential-question':
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, essentialQuestion: value, essentialQuestionConfirmed: true },
          contextualInitiator: { type: null, value: null }
        }));
        
        // Save to Firebase
        if (projectId && projectData) {
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'ideation.essentialQuestion': value
            });
          } catch (error) {
            console.error('Error saving Essential Question to Firebase:', error);
          }
        }
        
        // Move to Challenge
        const challengePrompt: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: CONVERSATION_FLOWS.IDEATION.challenge.prompt
            .replace('{bigIdea}', projectState.ideation.bigIdea)
            .replace('{essentialQuestion}', value),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, challengePrompt]);
        break;
        
      case 'challenge':
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, challenge: value, challengeConfirmed: true },
          contextualInitiator: { type: null, value: null }
        }));
        
        // Save to Firebase and advance stage
        if (projectId && projectData && onStageComplete) {
          const completeIdeation = {
            bigIdea: projectState.ideation.bigIdea,
            essentialQuestion: projectState.ideation.essentialQuestion,
            challenge: value
          };
          
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'ideation': completeIdeation
            });
            
            // Notify parent that ideation is complete
            onStageComplete('IDEATION', completeIdeation);
          } catch (error) {
            console.error('Error saving Challenge to Firebase:', error);
          }
        }
        
        // Move to Journey stage
        setProjectState(prev => ({ ...prev, stage: 'JOURNEY' }));
        const journeyPrompt: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: CONVERSATION_FLOWS.JOURNEY.opening,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, journeyPrompt]);
        break;
        
      case 'phase-timeline':
        // Handle phase timeline confirmation
        setProjectState(prev => ({
          ...prev,
          journey: { ...prev.journey, phaseBreakdown: value },
          contextualInitiator: { type: null, value: null }
        }));
        
        if (projectId && projectData) {
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'learningJourney.phaseBreakdown': value
            });
          } catch (error) {
            console.error('Error saving phase timeline to Firebase:', error);
          }
        }
        break;
    }
  };
  
  // Handle contextual initiator dismissal
  const handleInitiatorDismiss = () => {
    setProjectState(prev => ({
      ...prev,
      contextualInitiator: { type: null, value: null }
    }));
  };
  
  // Handle iteration options
  const handleIteration = async (iterationType: 'quick-loop' | 'major-pivot' | 'complete-restart') => {
    let message: Message;
    
    switch (iterationType) {
      case 'quick-loop':
        // Quick loop - redo current phase
        message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Great! Let's refine the current phase. Iteration is a core part of the Creative Process - it shows students that learning is non-linear. What specific aspect would you like to adjust?",
          timestamp: new Date()
        };
        
        // Track iteration in Firebase
        if (projectId) {
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'learningJourney.iterations': {
                type: 'quick-loop',
                timestamp: new Date(),
                phase: 'current'
              }
            });
          } catch (error) {
            console.error('Error tracking iteration:', error);
          }
        }
        break;
        
      case 'major-pivot':
        // Major pivot - go back to earlier phase
        message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Excellent decision! Major pivots demonstrate that the Creative Process values deep learning over linear progression. Which phase would you like to revisit? We can adjust your timeline to accommodate this deeper exploration.",
          timestamp: new Date()
        };
        
        if (projectId) {
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'learningJourney.iterations': {
                type: 'major-pivot',
                timestamp: new Date(),
                phase: 'previous'
              }
            });
          } catch (error) {
            console.error('Error tracking iteration:', error);
          }
        }
        break;
        
      case 'complete-restart':
        // Complete restart - begin fresh
        message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Bold choice! A complete restart with accumulated learnings often leads to breakthrough innovations. Your students will see that 'failure' is actually data gathering. Let's redesign the journey with everything you've learned. What's the most important insight you want to carry forward?",
          timestamp: new Date()
        };
        
        if (projectId) {
          try {
            await firebaseSync.updateBlueprint(projectId, {
              'learningJourney.iterations': {
                type: 'complete-restart',
                timestamp: new Date(),
                learnings: 'captured'
              }
            });
          } catch (error) {
            console.error('Error tracking iteration:', error);
          }
        }
        break;
    }
    
    setMessages(prev => [...prev, message]);
    
    // Update project state to reflect iteration
    setProjectState(prev => ({
      ...prev,
      journey: {
        ...prev.journey,
        iterationStrategy: iterationType
      }
    }));
  };
  
  // Creative Process Phases with progress tracking
  const creativeProcessPhases = [
    { 
      name: 'Analyze', 
      percentage: 25, 
      color: 'bg-blue-500', 
      description: 'Investigate & understand',
      progress: projectState.journey.phaseBreakdown?.analyze ? 100 : 0
    },
    { 
      name: 'Brainstorm', 
      percentage: 25, 
      color: 'bg-purple-500', 
      description: 'Generate ideas',
      progress: projectState.journey.phaseBreakdown?.brainstorm ? 100 : 0
    },
    { 
      name: 'Prototype', 
      percentage: 35, 
      color: 'bg-green-500', 
      description: 'Build & test',
      progress: projectState.journey.phaseBreakdown?.prototype ? 100 : 0
    },
    { 
      name: 'Evaluate', 
      percentage: 15, 
      color: 'bg-orange-500', 
      description: 'Reflect & refine',
      progress: projectState.journey.phaseBreakdown?.evaluate ? 100 : 0
    }
  ];
  
  return (
    <>
      {/* Onboarding Modal */}
      {showOnboarding && (
        <ChatbotOnboarding 
          onComplete={() => setShowOnboarding(false)}
          userName={user?.displayName || user?.email?.split('@')[0]}
        />
      )}
      
      {/* UI Guidance System - Consolidated Ideas/Help */}
      <UIGuidanceSystem
        currentStage={projectState.stage}
        currentStep={getCurrentStep()}
        userContext={userContext}
        onSuggestionSelect={(suggestion) => {
          setInput(suggestion);
          setLastInteractionTime(Date.now());
        }}
        inputValue={input}
        lastInteractionTime={lastInteractionTime}
        isWaiting={isTyping}
      />
      
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {onNavigate && (
            <button 
              onClick={() => onNavigate('dashboard')}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold mb-2 transition-colors"
            >
              ← Back to Dashboard
            </button>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">
            {projectData?.title || 'ALF Coach - Curriculum Design Partner'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {projectData ? `${projectData.subject} • ${projectData.ageGroup}` : 'Designing learning experiences FOR your students'}
          </p>
        </div>
      </div>
      
      {/* Creative Process Timeline - Show for Journey stage */}
      {projectState.stage === 'JOURNEY' && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Student Creative Process Journey
              </h3>
              <p className="text-xs text-gray-500">
                How YOUR STUDENTS will move through the 4 phases
              </p>
            </div>
            
            {/* Phase Timeline */}
            <div className="flex gap-2 mb-3">
              {creativeProcessPhases.map((phase, index) => (
                <motion.div
                  key={phase.name}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${phase.percentage}%`, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`${phase.color} text-white rounded-lg p-3 relative overflow-hidden`}
                >
                  <div className="relative z-10">
                    <div className="font-semibold text-sm">{phase.name}</div>
                    <div className="text-xs opacity-90">{phase.percentage}%</div>
                    <div className="text-xs opacity-75 mt-1">{phase.description}</div>
                    
                    {/* Progress indicator */}
                    {phase.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
                          <motion.div 
                            className="bg-white h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${phase.progress}%` }}
                            transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                          />
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {phase.progress === 100 ? 'Planned ✓' : `${phase.progress}% planned`}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity" />
                </motion.div>
              ))}
            </div>
            
            {/* Iteration Options */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleIteration('quick-loop')}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Redo the current phase with minor adjustments"
              >
                <RotateCcw className="w-3 h-3" />
                Quick Loop Back
              </button>
              <button 
                onClick={() => handleIteration('major-pivot')}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Return to an earlier phase for significant changes"
              >
                <TrendingUp className="w-3 h-3" />
                Major Pivot
              </button>
              <button 
                onClick={() => handleIteration('complete-restart')}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Begin fresh with all your learnings"
              >
                <RefreshCw className="w-3 h-3" />
                Complete Restart
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Area - Full Width, Primary Focus */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 px-6 py-4 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your response..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
      
      {/* Contextual Initiator */}
      {projectState.contextualInitiator.type && (
        <ContextualInitiator
          type={projectState.contextualInitiator.type}
          value={projectState.contextualInitiator.value}
          onConfirm={handleInitiatorConfirm}
          onDismiss={handleInitiatorDismiss}
        />
      )}
    </div>
    </>
  );
};