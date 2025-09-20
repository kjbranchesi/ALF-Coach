/**
 * ChatbotFirstInterfaceFixed.tsx
 * 
 * ACTUALLY WORKING chat interface with real AI integration
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, Lightbulb, Map, Target, Download, HelpCircle, Sparkles, Layers, Menu, X, Check, ChevronLeft, Clipboard } from 'lucide-react';
import { lazy, Suspense } from 'react';
import { ContextualInitiator } from './ContextualInitiator';
const ProgressSidebarLazy = lazy(() => import('./ProgressSidebar').then(m => ({ default: m.ProgressSidebar })));
const InlineHelpContentLazy = lazy(() => import('./UIGuidanceSystemV2').then(m => ({ default: m.InlineHelpContent })));
const StageInitiatorCardsLazy = lazy(() => import('./StageInitiatorCards').then(m => ({ default: m.StageInitiatorCards })));
import { ConversationalOnboarding } from './ConversationalOnboarding';
import { getStageHelp } from '../../utils/stageSpecificContent';
const MessageRendererLazy = lazy(() => import('./MessageRenderer').then(m => ({ default: m.MessageRenderer })));
const StandardsCoverageMapLazy = lazy(() => import('../standards/StandardsCoverageMap').then(m => ({ default: m.StandardsCoverageMap })));
import { EnhancedButton } from '../ui/EnhancedButton';
import { WizardV3Wrapper } from '../../features/wizard/WizardV3Wrapper';
import type { WizardDataV3 } from '../../features/wizard/wizardSchema';
import type { ProjectV3, Milestone, Scaffold, Checkpoint, Phase } from '../../types/alf';
import { normalizeProjectV3 } from '../../utils/normalizeProject';
const ContextualHelpLazy = lazy(() => import('./ContextualHelp').then(m => ({ default: m.ContextualHelp })));
import { useAuth } from '../../hooks/useAuth';
import { GeminiService } from '../../services/GeminiService';
import { firebaseSync } from '../../services/FirebaseSync';
import { useFeatureFlag } from '../../utils/featureFlags';
// Removed unused StateManager import
import { logger } from '../../utils/logger';
import { WizardHandoffService } from '../../services/WizardHandoffService';
import { getContextualHelp } from '../../utils/helpContent';
import { getStageSuggestions } from '../../utils/suggestionContent';
import { CONVERSATION_STAGES, getStageMessage, shouldShowCards, getNextStage } from '../../utils/conversationFramework';
import { getConfirmationStrategy, generateConfirmationPrompt, checkForProgressSignal, checkForRefinementSignal } from '../../utils/confirmationFramework';
import { FlowOrchestrator } from '../../services/FlowOrchestrator';
import { ALFProcessRibbon } from '../layout/ALFProcessRibbon';
import { featureFlags } from '../../utils/featureFlags';
import { TourOverlay } from '../onboarding/TourOverlay';
import { TooltipGlossary } from '../ui/TooltipGlossary';
import { CompactRecapBar } from './CompactRecapBar';
import { BlueprintPreviewModal } from '../preview/BlueprintPreviewModal';
import { STANDARD_FRAMEWORKS, TERMS } from '../../constants/terms';
import { queryHeroPromptReferences } from '../../ai/context/heroContext';
import { buildWizardSnapshot, copySnapshotPreview, buildSnapshotSharePreview } from '../../utils/wizardExport';
import { mergeProjectData, mergeWizardData } from '../../utils/draftMerge';
import { StageSpecificSuggestions } from './StageSpecificSuggestions';
import { CardActionBar } from '../../features/wizard/components/CardActionBar';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    stage?: string;
    showIdeas?: boolean;
    showHelp?: boolean;
    suggestions?: Array<{ id: string; text: string; category: string }>;
    stageInitiator?: {
      type: 'big-idea' | 'essential-question' | 'challenge' | 'phase-timeline';
      value: string;
    };
  };
}

interface ProjectState {
  stage: 'ONBOARDING' | 'GROUNDING' | 'IDEATION_INTRO' | 'BIG_IDEA' | 'ESSENTIAL_QUESTION' | 'CHALLENGE' | 'JOURNEY' | 'DELIVERABLES' | 'COMPLETE';
  conversationStep: number;
  messageCountInStage: number;
  awaitingConfirmation?: {
    type: string;
    value: string;
  };
  context: {
    subject: string;
    gradeLevel: string;
    duration: string;
    location: string;
    materials: string;
  };
  ideation: {
    bigIdea: string;
    bigIdeaConfirmed: boolean;
    essentialQuestion: string;
    essentialQuestionConfirmed: boolean;
    challenge: string;
    challengeConfirmed: boolean;
  };
  journey: {
    phases: {
      analyze: { duration: string; activities: string[] };
      brainstorm: { duration: string; activities: string[] };
      prototype: { duration: string; activities: string[] };
      evaluate: { duration: string; activities: string[] };
    };
  };
}

const SYSTEM_PROMPT = `You are an expert curriculum designer helping educators create project-based learning experiences using the Active Learning Framework (ALF).

Current Stage: {stage}
User Context: {context}

{stageInstructions}

Your role is to:
1. Guide teachers through designing projects where STUDENTS journey through the Creative Process
2. Be conversational but professional
3. Ask one question at a time
4. Provide specific, actionable suggestions
5. Remember: Teachers DESIGN the curriculum, Students DO the creative process

Respond naturally to the teacher's input and guide them to the next step.`;

interface ChatbotFirstInterfaceFixedProps {
  projectId?: string;
  projectData?: any;
  onStageComplete?: (stage: string, data: any) => void;
  onNavigate?: (target: string) => void;
}

export const ChatbotFirstInterfaceFixed: React.FC<ChatbotFirstInterfaceFixedProps> = ({ 
  projectId, 
  projectData, 
  onStageComplete,
  onNavigate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSuggestionsForMessage, setShowSuggestionsForMessage] = useState<string | null>(null);
  const [showHelpForMessage, setShowHelpForMessage] = useState<string | null>(null);
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeAskALFStage, setActiveAskALFStage] = useState<ProjectState['stage'] | null>(null);
  const [activeAskALFContext, setActiveAskALFContext] = useState<{
    subject?: string;
    gradeLevel?: string;
    projectTopic?: string;
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [automaticSuggestionsHidden, setAutomaticSuggestionsHidden] = useState(false);
  const [lastSuggestionStage, setLastSuggestionStage] = useState<string>('');
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);
  const [recapExpanded, setRecapExpanded] = useState(true);
  const [journeyExpanded, setJourneyExpanded] = useState(false);
  const [deliverablesExpanded, setDeliverablesExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [standardsDraft, setStandardsDraft] = useState<{ framework: string; items: { code: string; label: string; rationale: string }[] }>({ framework: '', items: [{ code: '', label: '', rationale: '' }] });
  const [standardsConfirmed, setStandardsConfirmed] = useState(false);
  const [feasAck, setFeasAck] = useState(false);
  
  // Store wizard data locally to avoid race condition with projectData updates
  const [localWizardData, setLocalWizardData] = useState<Partial<WizardDataV3> | null>(null);
  const [localProjectSnapshot, setLocalProjectSnapshot] = useState<ProjectV3 | null>(null);
  const [snapshotShareStatus, setSnapshotShareStatus] = useState<'idle' | 'success' | 'error' | 'manual'>('idle');
  const [snapshotSharePreview, setSnapshotSharePreview] = useState<string | null>(null);

  const generateRuntimeId = useCallback((prefix: string) => {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
  }, []);

  const getCurrentProjectSnapshot = useCallback(() => {
    return localProjectSnapshot || ((projectData as any)?.projectData as ProjectV3 | null) || null;
  }, [localProjectSnapshot, projectData]);

  const parseListFromText = useCallback((value: string): string[] => {
    if (!value) {
      return [];
    }
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    const newlineSplit = trimmed.split(/\n+/).map(item => item.trim()).filter(Boolean);
    if (newlineSplit.length > 1) {
      return newlineSplit;
    }
    const bulletSplit = trimmed
      .split(/(?:•|\u2022|\u25AA|\u25CF|\*)\s*/)
      .map(item => item.trim())
      .filter(Boolean);
    if (bulletSplit.length > 1) {
      return bulletSplit;
    }
    const semicolonSplit = trimmed.split(/;+/).map(item => item.trim()).filter(Boolean);
    if (semicolonSplit.length > 1) {
      return semicolonSplit;
    }
    return [trimmed];
  }, []);

  const applyProjectPatch = useCallback((patch: Partial<ProjectV3>) => {
    if (!patch || Object.keys(patch).length === 0) {
      return;
    }

    setLocalProjectSnapshot(prev => {
      if (!prev) {
        return prev;
      }

      const updated: ProjectV3 = {
        ...prev,
        ...patch,
        metadata: {
          ...prev.metadata,
          updated: new Date().toISOString()
        }
      };

      return updated;
    });
  }, []);

  const wizardSnapshotSource = useMemo(
    () => mergeWizardData((projectData as any)?.wizardData ?? null, localWizardData),
    [projectData, localWizardData]
  );
  const canExportSnapshot = Boolean(wizardSnapshotSource && Object.keys(wizardSnapshotSource).length > 0);

  useEffect(() => {
    if (!localProjectSnapshot && (projectData as any)?.projectData) {
      setLocalProjectSnapshot((projectData as any).projectData as ProjectV3);
    }
  }, [projectData, localProjectSnapshot]);

  const handleCopySnapshot = useCallback(async () => {
    if (!canExportSnapshot || !wizardSnapshotSource) {
      setSnapshotShareStatus('error');
      setSnapshotSharePreview(null);
      return;
    }

    const snapshot = buildWizardSnapshot(wizardSnapshotSource);
    try {
      await copySnapshotPreview(snapshot);
      setSnapshotShareStatus('success');
      setSnapshotSharePreview(null);
    } catch (error) {
      console.warn('[ChatbotFirstInterfaceFixed] Clipboard share unavailable, showing manual preview', error);
      setSnapshotShareStatus('manual');
      setSnapshotSharePreview(buildSnapshotSharePreview(snapshot));
    }
  }, [canExportSnapshot, wizardSnapshotSource]);

  const dismissSnapshotPreview = useCallback(() => {
    setSnapshotSharePreview(null);
    setSnapshotShareStatus('idle');
  }, []);

  useEffect(() => {
    if (snapshotShareStatus === 'idle' || snapshotShareStatus === 'manual') {
      return;
    }
    const timeout = window.setTimeout(() => setSnapshotShareStatus('idle'), 3500);
    return () => window.clearTimeout(timeout);
  }, [snapshotShareStatus]);

  // Function to format stage labels consistently
  const formatStageLabel = (stage: string): string => {
    const stageLabels: Record<string, string> = {
      'ONBOARDING': 'Onboarding',
      'GROUNDING': 'Grounding',
      'IDEATION_INTRO': 'Getting Started',
      'BIG_IDEA': 'Big Idea',
      'ESSENTIAL_QUESTION': 'Essential Question',
      'CHALLENGE': 'Challenge',
      'JOURNEY': 'Learning Journey',
      'DELIVERABLES': 'Deliverables',
      'COMPLETE': 'Complete'
    };
    return stageLabels[stage] || stage.replace('_', ' ').toLowerCase();
  };
  
  // Feature flags
  const useInlineUI = useFeatureFlag('inlineUIGuidance');
  const useProgressSidebar = useFeatureFlag('progressSidebar');
  const useStageInitiators = useFeatureFlag('stageInitiatorCards');
  const showInlineRecap = useFeatureFlag('inlineRecapPanel');
  
  // Stage microcopy: What/Why/Coach Tip (grounding the teacher at each step)
  const getStageMicrocopy = (stage: ProjectState['stage']) => {
    switch (stage) {
      case 'BIG_IDEA':
        return {
          what: 'Define the Big Idea — a transferable concept that anchors the project.',
          why: 'It keeps work meaningful and gives coherence to everything that follows.',
          tip: 'Accept your first strong idea; we can refine language later.'
        };
      case 'ESSENTIAL_QUESTION':
        return {
          what: 'Shape an Essential Question that drives extended inquiry.',
          why: 'A good EQ builds curiosity and guides student investigation for weeks.',
          tip: 'Start with How/Why; aim for multiple perspectives and “can’t Google in 5 minutes”.'
        };
      case 'STANDARDS':
        return {
          what: 'Select standards and add a short rationale.',
          why: 'Clear alignment builds rigor and makes expectations transparent.',
          tip: 'Keep it tight: a few high‑value codes with plain‑language “why this fits”.'
        };
      case 'CHALLENGE':
        return {
          what: 'Design an authentic Challenge that gives students real purpose.',
          why: 'Authentic tasks create engagement and connect learning to community impact.',
          tip: 'Make the audience explicit (who benefits) and keep scope achievable.'
        };
      case 'JOURNEY':
        return {
          what: 'Plan the learning journey — Analyze → Brainstorm → Prototype → Evaluate.',
          why: 'A clear arc supports creative process and feedback‑driven growth.',
          tip: 'Add 1–2 simple checkpoints per phase; we’ll refine later.'
        };
      case 'DELIVERABLES':
        return {
          what: 'Lock deliverables, rubric criteria, impact plan, and checkpoints.',
          why: 'Clarity on products and evidence ensures fair, student‑friendly assessment.',
          tip: 'Tie criteria to artifacts; each milestone gets at least one checkpoint.'
        };
      default:
        return null;
    }
  };

  // Mobile-friendly toggle for stage tips (persisted per blueprint + stage)
  const [mobileTipsOpen, setMobileTipsOpen] = useState(true);

  // (moved) Persist Stage Guide state — placed after projectState

  const mapWizardToSummary = (wizard: Partial<WizardDataV3> | Record<string, any>) => {
    const source = wizard || {};
    const projectContext = (source as Partial<WizardDataV3>).projectContext || (source as any).context || {};

    const subjects: string[] = Array.isArray((projectContext as any).subjects)
      ? (projectContext as any).subjects
      : Array.isArray((source as any).subjects)
        ? (source as any).subjects
        : [];

    const gradeLevel: string = (projectContext as any).gradeLevel || (source as any).gradeLevel || '';
    const duration: string = (projectContext as any).timeWindow || (source as any).duration || '';
    const location: string = (projectContext as any).space || (source as any).location || '';

    const materialItems = Array.isArray((projectContext as any).availableMaterials)
      ? (projectContext as any).availableMaterials
      : Array.isArray((source as any).materials)
        ? (source as any).materials
        : [];

    const materials = Array.isArray(materialItems)
      ? materialItems.filter(Boolean).join(', ')
      : typeof materialItems === 'string'
        ? materialItems
        : '';

    const learningGoalsArray = Array.isArray((source as Partial<WizardDataV3>).learningGoals)
      ? ((source as Partial<WizardDataV3>).learningGoals || []).map(goal => {
          if (typeof goal === 'string') return goal;
          if (goal && typeof (goal as any).text === 'string') return (goal as any).text;
          return '';
        }).filter(Boolean)
      : typeof (source as any).learningGoals === 'string'
        ? (source as any).learningGoals.split(/\n+/).filter(Boolean)
        : [];

    return {
      projectTopic: (source as any).projectTopic || '',
      learningGoals: learningGoalsArray.join('\n'),
      entryPoint: (source as any).entryPoint || '',
      subjects,
      gradeLevel,
      duration,
      materials,
      location,
      specialRequirements: (source as any).specialRequirements || ((projectContext as any).constraints || []).join(', '),
      specialConsiderations: (source as any).specialConsiderations || '',
      pblExperience: (source as any).pblExperience || 'some',
      projectContext
    };
  };

  // Standardize wizard data access with comprehensive fallback
  const getWizardData = () => {
    const rawWizard = localWizardData || (projectData as any)?.wizardData || {};
    return mapWizardToSummary(rawWizard);
  };
  
  const [projectState, setProjectState] = useState<ProjectState>(() => {
    const wizard = getWizardData();
    
    // Simple check: Does this blueprint have valid wizard data?
    const hasValidWizardData = wizard.subjects?.length > 0 || wizard.projectTopic;
    
    // For development/debugging
    const urlParams = new URLSearchParams(window.location.search);
    const forceSkipOnboarding = urlParams.get('skip') === 'true';
    
    // Start with onboarding unless we have valid wizard data
    const shouldShowOnboarding = !hasValidWizardData && !forceSkipOnboarding;
    
    console.log('[ChatbotFirstInterfaceFixed] Initial state:', {
      projectId,
      hasValidWizardData,
      wizardData: wizard,
      shouldShowOnboarding,
      stage: shouldShowOnboarding ? 'ONBOARDING' : 'BIG_IDEA'
    });
    
    return {
      stage: shouldShowOnboarding ? 'ONBOARDING' : 'BIG_IDEA',
      conversationStep: 0,
      messageCountInStage: 0,
      context: {
        subject: wizard.subjects?.join(', ') || '',
        gradeLevel: wizard.gradeLevel || '',
        duration: wizard.duration || '',
        location: wizard.location || '',
        materials: wizard.materials || ''
      },
    ideation: {
      bigIdea: '',
      bigIdeaConfirmed: false,
      essentialQuestion: '',
      essentialQuestionConfirmed: false,
      challenge: '',
      challengeConfirmed: false
    },
    journey: {
      phases: {
        analyze: { duration: '', activities: [] },
        brainstorm: { duration: '', activities: [] },
        prototype: { duration: '', activities: [] },
        evaluate: { duration: '', activities: [] }
      }
    }
  };
  });

  const composeAskALFContext = useCallback(() => {
    const wizard = getWizardData();
    return {
      subject: projectState.context.subject || wizard.subjects?.join(', ') || wizard.subject || '',
      gradeLevel: projectState.context.gradeLevel || wizard.gradeLevel,
      projectTopic: wizard.projectTopic,
      bigIdea: projectState.ideation.bigIdea,
      essentialQuestion: projectState.ideation.essentialQuestion,
      challenge: projectState.ideation.challenge
    };
  }, [getWizardData, projectState.context.subject, projectState.context.gradeLevel, projectState.ideation.bigIdea, projectState.ideation.essentialQuestion, projectState.ideation.challenge]);

  const clearAskALFTray = useCallback(() => {
    setActiveAskALFStage(null);
    setActiveAskALFContext(null);
  }, []);

  // STABILIZATION FIX: Add stage validation
  const canEnterStage = useCallback((targetStage: ProjectState['stage']) => {
    switch(targetStage) {
      case 'ESSENTIAL_QUESTION':
        return !!projectState.ideation.bigIdea;
      case 'CHALLENGE':
        return !!projectState.ideation.bigIdea && !!projectState.ideation.essentialQuestion;
      case 'JOURNEY':
        return !!projectState.ideation.bigIdea && !!projectState.ideation.essentialQuestion && !!projectState.ideation.challenge;
      case 'DELIVERABLES':
        return !!projectState.ideation.bigIdea && !!projectState.ideation.essentialQuestion && !!projectState.ideation.challenge;
      default:
        return true;
    }
  }, [projectState.ideation]);

  // STABILIZATION FIX: Get stage order for preventing backward navigation
  const getStageOrder = (stage: ProjectState['stage']): number => {
    const order = {
      'ONBOARDING': 0,
      'BIG_IDEA': 1,
      'ESSENTIAL_QUESTION': 2,
      'CHALLENGE': 3,
      'JOURNEY': 4,
      'DELIVERABLES': 5,
      'COMPLETE': 6
    };
    return order[stage] || 0;
  };

  useEffect(() => {
    if (!activeAskALFStage) {
      return;
    }
    if (projectState.stage !== activeAskALFStage) {
      clearAskALFTray();
    }
  }, [projectState.stage, activeAskALFStage, clearAskALFTray]);

  // Persist Stage Guide open/closed state per project + stage
  useEffect(() => {
    try {
      const key = `stageGuideCollapsed:${projectId || 'unknown'}:${projectState.stage}`;
      const stored = localStorage.getItem(key);
      if (stored === '0' || stored === '1') {
        setMobileTipsOpen(stored === '1');
      } else {
        // default open on first visit
        setMobileTipsOpen(true);
      }
    } catch {}
  }, [projectId, projectState.stage]);

  // STABILIZATION FIX: Clear confirmation state on stage change
  useEffect(() => {
    if (projectState.awaitingConfirmation) {
      const timeout = setTimeout(() => {
        logger.warn('Clearing stuck confirmation state after timeout');
        setProjectState(prev => ({ ...prev, awaitingConfirmation: null }));
      }, 30000); // 30 second timeout
      return () => clearTimeout(timeout);
    }
  }, [projectState.awaitingConfirmation]);

  // STABILIZATION FIX: Recovery mechanism for invalid states
  useEffect(() => {
    // If in DELIVERABLES but missing prerequisites, go back to appropriate stage
    if (projectState.stage === 'DELIVERABLES' && !projectState.ideation.challenge) {
      logger.warn('Invalid state detected: DELIVERABLES without challenge');
      setProjectState(prev => ({ ...prev, stage: 'CHALLENGE', awaitingConfirmation: null }));
      addMessage('assistant', 'Let\'s complete the challenge first before defining deliverables.');
    } else if (projectState.stage === 'JOURNEY' && !projectState.ideation.challenge) {
      logger.warn('Invalid state detected: JOURNEY without challenge');
      setProjectState(prev => ({ ...prev, stage: 'CHALLENGE', awaitingConfirmation: null }));
      addMessage('assistant', 'Let\'s define the challenge first before planning the journey.');
    } else if (projectState.stage === 'CHALLENGE' && !projectState.ideation.essentialQuestion) {
      logger.warn('Invalid state detected: CHALLENGE without essential question');
      setProjectState(prev => ({ ...prev, stage: 'ESSENTIAL_QUESTION', awaitingConfirmation: null }));
      addMessage('assistant', 'Let\'s complete the essential question first.');
    } else if (projectState.stage === 'ESSENTIAL_QUESTION' && !projectState.ideation.bigIdea) {
      logger.warn('Invalid state detected: ESSENTIAL_QUESTION without big idea');
      setProjectState(prev => ({ ...prev, stage: 'BIG_IDEA', awaitingConfirmation: null }));
      addMessage('assistant', 'Let\'s define the big idea first.');
    }

    // STABILIZATION FIX: Clear orphaned confirmation states that don't match current stage
    if (projectState.awaitingConfirmation) {
      const confirmationType = projectState.awaitingConfirmation.type;
      const currentStage = projectState.stage;
      let shouldClear = false;

      // Check if confirmation type doesn't match current stage
      if (currentStage === 'BIG_IDEA' && !confirmationType.includes('bigIdea')) shouldClear = true;
      if (currentStage === 'ESSENTIAL_QUESTION' && !confirmationType.includes('essentialQuestion')) shouldClear = true;
      if (currentStage === 'CHALLENGE' && !confirmationType.includes('challenge')) shouldClear = true;
      if (currentStage === 'JOURNEY' && !confirmationType.includes('journey')) shouldClear = true;
      if (currentStage === 'DELIVERABLES' && !confirmationType.includes('deliverables')) shouldClear = true;
      if (currentStage === 'GROUNDING' || currentStage === 'IDEATION_INTRO' || currentStage === 'COMPLETE') shouldClear = true;

      if (shouldClear) {
        logger.warn('Clearing orphaned confirmation state', { confirmationType, currentStage });
        setProjectState(prev => ({ ...prev, awaitingConfirmation: null }));
      }
    }
  }, [projectState.stage, projectState.ideation, projectState.awaitingConfirmation]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const geminiService = useRef(new GeminiService());
  
  // Connection status logging removed - not using StateManager
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Initialize with proper welcome message - only if not showing onboarding
  useEffect(() => {
    console.log('[ChatbotFirstInterfaceFixed] Welcome message useEffect triggered', {
      stage: projectState.stage,
      messagesLength: messages.length,
      hasLocalWizardData: !!localWizardData,
      hasProjectData: !!projectData?.wizardData
    });
    
    const wizard = getWizardData();
    
    // Show welcome message when stage changes to BIG_IDEA (from wizard completion)
    if (projectState.stage === 'BIG_IDEA' && messages.length === 0) {
      console.log('[ChatbotFirstInterfaceFixed] Stage changed to BIG_IDEA, initializing welcome message with context:', wizard);
      
      // Build rich context from wizard data
      const contextSubject = wizard.subjects?.join(' & ') || projectState.context.subject || 'your subject area';
      const contextGrade = wizard.gradeLevel || projectState.context.gradeLevel || 'your students';
      const contextTopic = wizard.projectTopic || 'an engaging project';
      const contextGoals = (wizard.learningGoals || '').trim();
      const contextLocation = (wizard.location || '').trim();
      const contextDuration = wizard.duration || projectState.context.duration || 'this project';
      
      let welcomeContent = '';
      
      if (wizard.subjects?.length > 0 || wizard.projectTopic) {
        // Enhanced welcome with full wizard context
        if (wizard.projectTopic) {
          const goalLine = contextGoals ? `\n\nLearning goals you noted: ${contextGoals}` : '';
          const locationLine = contextLocation ? ` in ${contextLocation}` : '';
          welcomeContent = `Excellent! I see you want to explore "${wizard.projectTopic}" with your ${contextGrade} students in ${contextSubject}${locationLine}. This ${contextDuration} project has great potential!${goalLine}

Let's start by defining the Big Idea - the central concept that will drive deep learning. What overarching theme or principle do you want students to understand through this project?`;
        } else {
          welcomeContent = `Perfect! You're creating a ${contextSubject} project for ${contextGrade} students over ${contextDuration}. Let's design something amazing!

What's the big idea or central theme you'd like your students to explore? Think about a concept that connects to real-world challenges and sparks curiosity.`;
        }
      } else {
        // Fallback welcome message using available context
        welcomeContent = `Welcome! Let's create an amazing Active Learning Framework experience for your students.

What's the big idea or theme you'd like your students to explore? Think about a real-world problem or compelling question that could drive this project.`;
      }
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: welcomeContent,
        timestamp: new Date(),
        metadata: {
          stage: 'BIG_IDEA'
        }
      };
      setMessages([welcomeMessage]);
      console.log('[ChatbotFirstInterfaceFixed] Welcome message set with full context, chat should be visible');
    }
  }, [projectState.stage, projectState.context, messages.length, localWizardData, projectData?.wizardData]);

  // When entering JOURNEY, seed first micro-step prompt if not already awaiting
  useEffect(() => {
    if (projectState.stage === 'JOURNEY' && !projectState.awaitingConfirmation) {
      const firstType = 'journey.analyze.goal';
      setProjectState(prev => ({
        ...prev,
        awaitingConfirmation: { type: firstType, value: '' }
      }));
      // Seed inline micro-step suggestions
      setSuggestions(getMicrostepSuggestions(firstType).map((t, i) => ({ id: `js-${i}`, text: t })) as any);
      setShowSuggestions(true);
      const assistantMessage: Message = {
        id: String(Date.now() + 2),
        role: 'assistant',
        content: promptForJourneyAwaiting(firstType),
        timestamp: new Date(),
        metadata: { stage: 'JOURNEY' }
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  }, [projectState.stage]);

  // When entering DELIVERABLES, seed first micro-step prompt if not already awaiting
  useEffect(() => {
    if (projectState.stage === 'DELIVERABLES' && !projectState.awaitingConfirmation) {
      const firstType = 'deliverables.milestones.0';
      setProjectState(prev => ({
        ...prev,
        awaitingConfirmation: { type: firstType, value: '' }
      }));
      setSuggestions(getMicrostepSuggestions(firstType).map((t, i) => ({ id: `ds-${i}`, text: t })) as any);
      setShowSuggestions(true);
      const assistantMessage: Message = {
        id: String(Date.now() + 5),
        role: 'assistant',
        content: promptForDeliverablesAwaiting(firstType),
        timestamp: new Date(),
        metadata: { stage: 'DELIVERABLES' }
      };
      setMessages(prev => [...prev, assistantMessage]);
    }
  }, [projectState.stage]);
  
  // Generate contextual AI prompt using rich wizard data
  const generateAIPrompt = (userInput: string): string => {
    const wizard = getWizardData();
    const ideation = projectData?.ideation || projectState.ideation;
    
    // Get stage-specific instructions
    const getStageInstructions = () => {
      switch (projectState.stage) {
        case 'BIG_IDEA':
        case 'IDEATION_BIG_IDEA':
          return `CURRENT TASK: Help the teacher define a Big Idea - an overarching concept that drives student learning.

ACCEPTANCE CRITERIA:
- Accept ANY conceptual statement (3+ words)
- Build on what they give rather than asking for more
- Confirm before progressing to next stage

RESPONSE STRATEGY:
1. ACKNOWLEDGE their input positively ("Excellent! 'X' is a powerful concept...")
2. CONFIRM their choice ("This will help students explore [specific benefit]. Shall we build our Essential Question from this?")
3. WAIT for confirmation before advancing

If they want to refine, help them strengthen it.
If they confirm (yes, continue, etc.), proceed to Essential Question.
Format your response with markdown for clarity.`;
        
        case 'ESSENTIAL_QUESTION':
        case 'IDEATION_EQ':
          return `CURRENT TASK: Help create an Essential Question based on their Big Idea: "${ideation.bigIdea || 'Not yet defined'}"

ACCEPTANCE CRITERIA:
- Accept any question format
- Confirm before progressing to Challenge

RESPONSE STRATEGY:
1. ACKNOWLEDGE their question ("Great question! This will drive meaningful inquiry...")
2. CONFIRM their choice ("Ready to design the Challenge that addresses this question?")
3. WAIT for confirmation

Help refine to be more open-ended if needed, but always accept their input positively.`;
        
        case 'CHALLENGE':
        case 'IDEATION_CHALLENGE':
          return `CURRENT TASK: Help create a real-world Challenge based on their Essential Question: "${ideation.essentialQuestion || 'Not yet defined'}"

ACCEPTANCE CRITERIA:
- Accept any action-oriented task
- Confirm before progressing to Journey

RESPONSE STRATEGY:
1. ACKNOWLEDGE their challenge ("This gives students real purpose...")
2. CONFIRM their choice ("Ready to plan the learning journey?")
3. WAIT for confirmation

Help add authentic elements if needed, but accept their foundation positively.`;
        
        case 'JOURNEY':
          return `CURRENT TASK: Plan the learning journey for the Challenge: "${ideation.challenge || 'Not yet defined'}"

ACCEPTANCE CRITERIA:
- Accept any structured learning plan
- Confirm before progressing to Deliverables

RESPONSE STRATEGY:
1. ACKNOWLEDGE their journey plan ("This provides excellent structure...")
2. CONFIRM their choice ("Ready to define the deliverables and assessment?")
3. WAIT for confirmation

Guide them through phases if needed: Analyze → Brainstorm → Prototype → Evaluate
Use markdown lists and headers to organize the phases clearly.`;
        
        case 'DELIVERABLES':
          return `CURRENT TASK: Define deliverables and assessment for the project

ACCEPTANCE CRITERIA:
- Accept any concrete deliverables
- Confirm before completing

RESPONSE STRATEGY:
1. ACKNOWLEDGE their deliverables ("These will showcase meaningful learning...")
2. CONFIRM completion ("Your project blueprint is complete! Ready to finalize?")
3. WAIT for confirmation

Help them define assessment criteria if needed.
Use markdown tables or lists to present options clearly.`;
        
        default:
          return `CURRENT TASK: Understand the teacher's project context and goals.`;
      }
    };
    
    const stageInstructions = getStageInstructions();
    
    // Build enhanced context string with wizard data
    const subjectText = wizard.subjects?.length > 0 ? wizard.subjects.join(' & ') : projectState.context.subject || 'Not specified';
    const context = `
=== PROJECT CONTEXT ===
Subject Areas: ${subjectText}
Grade Level: ${wizard.gradeLevel || projectState.context.gradeLevel || 'Not specified'}
Project Duration: ${wizard.duration || projectState.context.duration || 'Not specified'}
Project Topic: ${wizard.projectTopic || 'Not specified'}
Learning Goals: ${wizard.learningGoals || 'Not specified'}
Entry Point: ${wizard.entryPoint || 'Standards-based'}
Materials Available: ${wizard.materials || 'Standard classroom resources'}

=== CONVERSATION PROGRESS ===
- Big Idea: ${ideation.bigIdea || 'Not yet defined'}
- Essential Question: ${ideation.essentialQuestion || 'Not yet defined'}
- Challenge: ${ideation.challenge || 'Not yet defined'}

=== CURRENT CONTEXT ===
User is working on: ${projectState.stage.replace('_', ' ')}
Message count in stage: ${projectState.messageCountInStage}
Awaiting confirmation: ${projectState.awaitingConfirmation ? 'Yes - for ' + projectState.awaitingConfirmation.type : 'No'}

=== USER INPUT ===
"${userInput}"
`;
    
    return SYSTEM_PROMPT
      .replace('{stage}', projectState.stage)
      .replace('{context}', context)
      .replace('{stageInstructions}', stageInstructions);
  };
  
  // Framework for when suggestions should appear automatically
  const shouldShowAutomaticSuggestions = () => {
    // Don't show if user manually hid them
    if (automaticSuggestionsHidden) return false;
    
    // Don't show if already showing manually
    if (showSuggestions) return false;
    
    // Don't show if typing
    if (isTyping) return false;
    
    // Show suggestions at key transition points
    const suggestibleStages = ['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'];
    
    // Show if:
    // 1. We're in a suggestible stage
    // 2. Stage just changed (different from last shown)
    // 3. User hasn't typed anything yet
    // 4. Not too many messages in current stage (first 2 messages)
    return (
      suggestibleStages.includes(projectState.stage) &&
      projectState.stage !== lastSuggestionStage &&
      !input.trim() &&
      projectState.messageCountInStage <= 1
    );
  };
  
  // Reset automatic suggestions when stage changes
  useEffect(() => {
    if (projectState.stage !== lastSuggestionStage) {
      setAutomaticSuggestionsHidden(false);
      setLastSuggestionStage(projectState.stage);
    }
  }, [projectState.stage, lastSuggestionStage]);

  // Helpers to surface captured summaries (non-blocking if data missing)
  const getCaptured = () => (projectData && projectData.capturedData) ? projectData.capturedData as Record<string, any> : {};
  const getJourneySummary = () => {
    const cd = getCaptured();
    const phases = ['analyze', 'brainstorm', 'prototype', 'evaluate'];
    const have = phases.filter(p => cd[`journey.${p}.goal`] || cd[`journey.${p}.activity`] || cd[`journey.${p}.output`] || cd[`journey.${p}.duration`]);
    if (have.length === 0) return 'No phases planned yet';
    return `${have.map(p => p[0].toUpperCase() + p.slice(1)).join(', ')} planned`;
  };
  const getDeliverablesSummary = () => {
    const cd = getCaptured();
    const milestones = ['0','1','2'].filter(i => cd[`deliverables.milestones.${i}`]).length;
    const criteria = cd['deliverables.rubric.criteria'] ? 'criteria set' : 'criteria pending';
    const audience = cd['deliverables.impact.audience'] || 'audience TBD';
    const method = cd['deliverables.impact.method'] || 'sharing method TBD';
    const parts: string[] = [];
    parts.push(`${milestones} milestone${milestones===1?'':'s'}`);
    parts.push(criteria);
    parts.push(`audience: ${audience}`);
    parts.push(`method: ${method}`);
    return parts.join(' • ');
  };

  // Derive standards confirmation and draft from captured data (for reload continuity)
  useEffect(() => {
    if (projectState.stage !== 'STANDARDS') return;
    const cd = getCaptured();
    const framework = cd['standards.framework'] || '';
    const list = cd['standards.list'] ? (() => { try { return JSON.parse(cd['standards.list']); } catch { return []; } })() : [];
    if (framework || (Array.isArray(list) && list.length)) {
      setStandardsConfirmed(true);
      setStandardsDraft({ framework, items: Array.isArray(list) && list.length ? list : standardsDraft.items });
    }
  }, [projectState.stage, projectData?.capturedData]);

  const getMissingItems = () => {
    const cd = getCaptured();
    const missing: string[] = [];
    // Standards are optional - don't mark as missing
    if (!cd['ideation.bigIdea']) missing.push('Big Idea');
    if (!cd['ideation.essentialQuestion']) missing.push('EQ');
    if (!cd['ideation.challenge']) missing.push('Challenge');
    if (!cd['deliverables.rubric.criteria']) missing.push('Rubric');
    if (!cd['deliverables.milestones.0']) missing.push('Milestones');
    if (!cd['deliverables.artifacts']) missing.push('Artifacts');
    if (!cd['deliverables.checkpoints.0']) missing.push('Checkpoints');
    return missing;
  };

  const isJourneyComplete = () => {
    const cd = getCaptured();
    const phases = ['analyze','brainstorm','prototype','evaluate'];
    return phases.every(p => (
      cd[`journey.${p}.goal`] && cd[`journey.${p}.activity`] && cd[`journey.${p}.output`] && cd[`journey.${p}.duration`]
    ));
  };

  const isDeliverablesComplete = () => {
    const cd = getCaptured();
    const milestonesOk = ['0','1','2'].every(i => !!cd[`deliverables.milestones.${i}`]);
    const rubricOk = !!cd['deliverables.rubric.criteria'];
    const impactOk = !!cd['deliverables.impact.audience'] && !!cd['deliverables.impact.method'];
    return milestonesOk && rubricOk && impactOk;
  };

  const getJourneyPhasePreview = (phase: 'analyze'|'brainstorm'|'prototype'|'evaluate') => {
    const projectSnapshot = getCurrentProjectSnapshot();
    let goal = '';
    let activity = '';
    let output = '';
    let duration = '';

    if (projectSnapshot?.phases?.length) {
      const normalized = phase.toLowerCase();
      const matchedPhase = projectSnapshot.phases.find(item => item.name?.toLowerCase().includes(normalized));
      if (matchedPhase) {
        goal = matchedPhase.goals?.[0] || goal;
        activity = Array.isArray(matchedPhase.activities) ? matchedPhase.activities[0] || activity : activity;
        duration = matchedPhase.duration || duration;
      }
    }

    if (!goal || !activity || !duration) {
      const cd = getCaptured();
      goal = goal || cd[`journey.${phase}.goal`] || '';
      activity = activity || cd[`journey.${phase}.activity`] || cd[`journey.${phase}.activities`] || '';
      output = cd[`journey.${phase}.output`] || '';
      duration = duration || cd[`journey.${phase}.duration`] || '';
    }

    const parts = [] as string[];
    if (goal) parts.push(goal);
    if (activity) parts.push(activity);
    if (output) parts.push(output);
    if (duration) parts.push(duration);
    return parts.slice(0, 2).join(' • ') || 'No details yet';
  };

  const getDeliverablesPreviewLines = () => {
    const projectSnapshot = getCurrentProjectSnapshot();
    const lines: string[] = [];
    if (projectSnapshot?.milestones?.length) {
      const milestoneSummary = projectSnapshot.milestones
        .map(item => item.name || item.description)
        .filter(Boolean);
      if (milestoneSummary.length) {
        lines.push(`Milestones: ${milestoneSummary.slice(0, 3).join(' • ')}`);
      }
    }
    if ((projectSnapshot as any)?.deliverables?.impact) {
      const impact = (projectSnapshot as any).deliverables.impact;
      const audience = impact?.audience;
      const method = impact?.method;
      if (audience || method) {
        lines.push(`Impact: ${audience || 'audience TBD'} • ${method || 'method TBD'}`);
      }
    } else if (projectSnapshot?.exhibition) {
      const audList = projectSnapshot.exhibition.audience?.join(', ');
      const method = projectSnapshot.exhibition.format;
      if (audList || method) {
        lines.push(`Impact: ${audList || 'audience TBD'} • ${method || 'method TBD'}`);
      }
    }

    if (!lines.length) {
      const cd = getCaptured();
      const ms = ['0','1','2'].map(i => cd[`deliverables.milestones.${i}`]).filter(Boolean);
      if (ms.length) lines.push(`Milestones: ${ms.join(' • ')}`);
      if (cd['deliverables.rubric.criteria']) lines.push(`Rubric: ${cd['deliverables.rubric.criteria']}`);
      const aud = cd['deliverables.impact.audience'];
      const meth = cd['deliverables.impact.method'];
      if (aud || meth) lines.push(`Impact: ${aud || 'audience TBD'} • ${meth || 'method TBD'}`);
    }
    return lines.length ? lines : ['No details yet'];
  };

  const aiAssistReferences = useMemo(() => {
    const wizard = getWizardData();
    const subjectSet = new Set<string>();
    (wizard.subjects || []).forEach(sub => sub && subjectSet.add(sub));
    if (wizard.projectTopic) subjectSet.add(wizard.projectTopic);
    if (projectState.context.subject) subjectSet.add(projectState.context.subject);

    const gradeSet = new Set<string>();
    if (wizard.gradeLevel) gradeSet.add(wizard.gradeLevel);
    if (projectState.context.gradeLevel) gradeSet.add(projectState.context.gradeLevel);

    const subjects = Array.from(subjectSet).filter(Boolean);
    const gradeLevels = Array.from(gradeSet).filter(Boolean);

    return queryHeroPromptReferences({
      subjects,
      gradeLevels,
      limit: 3
    });
  }, [localWizardData, projectData?.wizardData, projectState.context.subject, projectState.context.gradeLevel]);

  // Map last saved key to a friendly label
  const mapSavedKeyToLabel = (key: string | null): string | undefined => {
    if (!key) return undefined;
    if (key.startsWith('ideation.')) {
      if (key.endsWith('bigIdea')) return 'Big Idea';
      if (key.endsWith('essentialQuestion')) return 'Essential Question';
      if (key.endsWith('challenge')) return 'Challenge';
    }
    if (key.startsWith('journey.')) return 'Learning Journey';
    if (key.startsWith('deliverables.')) return 'Deliverables';
    return undefined;
  };

  const getSavedValueForKey = (key: string | null): string | undefined => {
    if (!key) return undefined;
    if (key === 'ideation.bigIdea') return projectState.ideation.bigIdea;
    if (key === 'ideation.essentialQuestion') return projectState.ideation.essentialQuestion;
    if (key === 'ideation.challenge') return projectState.ideation.challenge;
    const cd = getCaptured();
    return cd[key];
  };

  const getNextLabel = (): string | undefined => {
    switch (projectState.stage) {
      case 'BIG_IDEA':
        return projectState.ideation.bigIdeaConfirmed ? 'Essential Question' : 'Confirm Big Idea';
      case 'ESSENTIAL_QUESTION':
        return projectState.ideation.essentialQuestionConfirmed ? 'Challenge' : 'Confirm Essential Question';
      case 'CHALLENGE':
        return projectState.ideation.challengeConfirmed ? 'Learning Journey' : 'Confirm Challenge';
      case 'JOURNEY':
        return isJourneyComplete() ? 'Deliverables' : 'Continue Journey';
      case 'DELIVERABLES':
        return isDeliverablesComplete() ? 'Export' : 'Finalize Deliverables';
      default:
        return undefined;
    }
  };

  const openJourneyPhase = (phase: 'analyze'|'brainstorm'|'prototype'|'evaluate') => {
    const t = ('journey.' + phase + '.goal') as const;
    setProjectState(prev => ({ ...prev, stage: 'JOURNEY', awaitingConfirmation: { type: t, value: '' } }));
    setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: 'js-open-' + i, text: v })) as any);
    setShowSuggestions(true);
    showInfoToast('Editing ' + phase);
  };

  const openDeliverablesSection = (section: 'milestones'|'rubric'|'impact') => {
    let t: string = 'deliverables.milestones.0';
    if (section === 'rubric') t = 'deliverables.rubric.criteria';
    if (section === 'impact') t = 'deliverables.impact.audience';
    setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
    setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: 'ds-open-' + i, text: v })) as any);
    setShowSuggestions(true);
    showInfoToast('Editing ' + section);
  };

  const truncate = (s: string, n: number = 80) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s);
  
  // Show celebration when stage completes
  const showStageCompletionCelebration = (stageName: string) => {
    // Subtle, professional progress indicator - no emojis
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50';
    notification.innerHTML = `
      <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="text-sm font-medium">${stageName} saved</p>
        </div>
      </div>
    `;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
    document.body.appendChild(notification);
    
    // Fade in
    requestAnimationFrame(() => {
      notification.style.transition = 'all 0.3s ease-out';
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 2.5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  };

  const showInfoToast = (message: string) => {
    const el = document.createElement('div');
    el.className = 'fixed top-4 right-4 z-50';
    el.innerHTML = `
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 px-4 py-2 rounded-lg shadow-sm">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"></path>
          </svg>
          <p class="text-sm font-medium">${message}</p>
        </div>
      </div>`;
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transition = 'all 0.25s ease-out';
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100px)';
      setTimeout(() => el.remove(), 250);
    }, 2000);
  };

  // Helper function to save data to chat service capturedData format
  const saveToBackend = (stageKey: string, value: string, stageLabel: string) => {
    // Save in the format expected by chat-service.ts
    let capturedPrefix = projectState.stage.toLowerCase();
    if (['bigIdea', 'essentialQuestion', 'challenge'].includes(stageKey)) {
      capturedPrefix = 'ideation';
    } else if (stageKey === 'phases' || stageKey === 'supports' || stageKey === 'activities' || stageKey === 'resources') {
      capturedPrefix = 'journey';
    } else if (
      stageKey.startsWith('milestones') ||
      stageKey.startsWith('rubric') ||
      stageKey.startsWith('deliverables') ||
      stageKey.startsWith('impact') ||
      stageKey.startsWith('artifacts') ||
      stageKey.startsWith('checkpoints')
    ) {
      capturedPrefix = 'deliverables';
    }

    const capturedDataKey = `${capturedPrefix}.${stageKey}`;

    const payload: Record<string, unknown> = {
      [capturedDataKey]: value,
      value,
      stage: projectState.stage,
      stageLabel
    };

    const projectPatch: Partial<ProjectV3> & Record<string, unknown> = {};
    const existingProject = getCurrentProjectSnapshot();

    if (stageKey === 'bigIdea' && typeof value === 'string' && value.trim()) {
      const base = localProjectSnapshot?.bigIdea ?? { text: '', tier: 'core' as const, confidence: 0.85 };
      projectPatch.bigIdea = {
        ...base,
        text: value
      };
    }

    if (stageKey === 'essentialQuestion' && typeof value === 'string' && value.trim()) {
      const base = localProjectSnapshot?.essentialQuestion ?? { text: '', tier: 'core' as const, confidence: 0.85 };
      projectPatch.essentialQuestion = {
        ...base,
        text: value
      };
    }

    if (stageKey === 'challenge' && typeof value === 'string' && value.trim()) {
      const base = (localProjectSnapshot as any)?.challenge ?? { text: '', tier: 'core' as const, confidence: 0.75 };
      (projectPatch as any).challenge = {
        ...base,
        text: value
      };
    }

    if (stageKey === 'phases' && typeof value === 'string' && value.trim()) {
      const entries = parseListFromText(value);
      const basePhases = existingProject?.phases ?? [];
      const phases: Phase[] = entries.length
        ? entries.map((entry, index) => {
            const base = basePhases[index];
            const [namePart, ...rest] = entry.split(/[:–-]\s*/);
            const name = (namePart || entry).trim() || `Phase ${index + 1}`;
            const description = rest.length ? rest.join(': ').trim() : base?.description || '';
            return {
              id: base?.id ?? generateRuntimeId('phase'),
              name,
              description,
              duration: base?.duration || '',
              goals: base?.goals ?? [],
              activities: base?.activities ?? []
            } satisfies Phase;
          })
        : basePhases;
      projectPatch.phases = phases;
    }

    if (stageKey.startsWith('milestones') && typeof value === 'string' && value.trim()) {
      const index = Number.parseInt(stageKey.split('.')[1] ?? '0', 10);
      const baseMilestones = existingProject?.milestones ?? [];
      const updatedMilestones: Milestone[] = [...baseMilestones];
      const targetPhase = existingProject?.phases?.[Math.min(index, Math.max(0, (existingProject?.phases?.length ?? 1) - 1))];
      const existingMilestone = baseMilestones[index];
      const trimmedValue = value.trim();
      const [namePart, ...rest] = trimmedValue.split(/[:–\-]\s*/);
      const name = (namePart || trimmedValue).trim();
      const description = rest.length ? rest.join(': ').trim() || trimmedValue : trimmedValue;
      updatedMilestones[index] = {
        id: existingMilestone?.id ?? generateRuntimeId('milestone'),
        phaseId: existingMilestone?.phaseId ?? targetPhase?.id ?? 'unassigned',
        name,
        description,
        due: existingMilestone?.due,
        owner: existingMilestone?.owner ?? 'student',
        evidence: existingMilestone?.evidence ?? []
      };
      projectPatch.milestones = updatedMilestones;

      const deliverableSummary = (projectPatch as any).deliverables || (existingProject as any)?.deliverables || {};
      (projectPatch as any).deliverables = {
        ...deliverableSummary,
        milestones: updatedMilestones.map(milestone => ({
          id: milestone.id,
          title: milestone.name,
          description: milestone.description,
          phaseId: milestone.phaseId
        }))
      };
    }

    if (stageKey === 'supports' && typeof value === 'string' && value.trim()) {
      const entries = parseListFromText(value);
      const scaffoldEntries = entries.length ? entries : [value.trim()];
      const baseScaffolds = existingProject?.scaffolds ?? [];
      const scaffolds: Scaffold[] = scaffoldEntries.map((entry, index) => {
        const [titlePart, ...rest] = entry.split(/[:–\-]\s*/);
        const name = (titlePart || entry).trim() || `Support ${index + 1}`;
        const description = rest.length ? rest.join(': ').trim() || entry : entry;
        const base = baseScaffolds[index];
        return {
          id: base?.id ?? generateRuntimeId('scaffold'),
          name,
          description,
          templateLink: base?.templateLink
        } satisfies Scaffold;
      });
      projectPatch.scaffolds = scaffolds;
    }

    if (stageKey === 'checkpoints' && typeof value === 'string' && value.trim()) {
      const entries = parseListFromText(value);
      const checkpointEntries = entries.length ? entries : [value.trim()];
      const basePlan = existingProject?.evidencePlan;
      const baseCheckpoints = basePlan?.checkpoints ?? [];
      const referenceMilestones = (projectPatch.milestones as Milestone[] | undefined) ?? existingProject?.milestones ?? [];

      const checkpoints: Checkpoint[] = checkpointEntries.map((entry, index) => {
        const base = baseCheckpoints[index];
        const [typePart, ...rest] = entry.split(/[:–]\s*/);
        const type = (typePart || entry).trim();
        const notes = rest.length ? rest.join(': ').trim() : base?.notes;
        return {
          id: base?.id ?? generateRuntimeId('checkpoint'),
          milestoneId: base?.milestoneId ?? referenceMilestones[index]?.id ?? 'unassigned',
          type,
          evidence: base?.evidence ?? [],
          notes
        } satisfies Checkpoint;
      });

      const updatedPlan = {
        checkpoints,
        permissions: basePlan?.permissions ?? [],
        storage: basePlan?.storage ?? '',
        dataManagement: basePlan?.dataManagement,
        tier: basePlan?.tier ?? 'core',
        confidence: basePlan?.confidence ?? 0.75
      };

      projectPatch.evidencePlan = updatedPlan;
    }

    if ((stageKey === 'impact.audience' || stageKey === 'impact.method') && typeof value === 'string' && value.trim()) {
      const baseExhibition = existingProject?.exhibition ?? {
        format: '',
        audience: [] as string[],
        date: existingProject?.metadata?.updated,
        location: existingProject?.context?.space || existingProject?.context?.location || '',
        preparation: [] as string[],
        tier: 'aspirational' as const,
        confidence: 0.6
      };

      const updatedExhibition = {
        ...baseExhibition,
        audience: stageKey === 'impact.audience' ? parseListFromText(value) : baseExhibition.audience,
        format: stageKey === 'impact.method' ? value.trim() : baseExhibition.format
      };

      projectPatch.exhibition = updatedExhibition;

      const deliverableImpact = (projectPatch as any).deliverables || (existingProject as any)?.deliverables || {};
      (projectPatch as any).deliverables = {
        ...deliverableImpact,
        impact: {
          audience: updatedExhibition.audience.join(', '),
          method: updatedExhibition.format
        }
      };
    }

    if (Object.keys(projectPatch).length > 0) {
      applyProjectPatch(projectPatch as Partial<ProjectV3>);
      payload.projectData = projectPatch as Partial<ProjectV3>;
    }

    onStageComplete?.(stageKey, payload);

    console.log('[Data Save] Saved to backend:', {
      key: capturedDataKey,
      value: value,
      stageLabel: stageLabel
    });

    // Mark recap line as just-saved for inline feedback
    try {
      let recapKey = '';
      if (capturedPrefix === 'journey') {
        recapKey = stageKey.includes('.') ? `journey.${stageKey}` : `journey.${stageKey}`;
      } else if (capturedPrefix === 'deliverables') {
        const deliverableSection = stageKey.split('.')[0];
        recapKey = `deliverables.${deliverableSection}`;
      } else if (capturedPrefix === 'ideation') {
        recapKey = `ideation.${stageKey}`;
      }
      if (recapKey) {
        setLastSavedKey(recapKey);
        setTimeout(() => setLastSavedKey(null), 1500);
      }
    } catch {}
  };

  const handleAcceptIdeation = (section: 'bigIdea' | 'essentialQuestion' | 'challenge') => {
    const config = {
      bigIdea: { label: 'Big Idea', stageKey: 'bigIdea', confirmKey: 'bigIdeaConfirmed' as const },
      essentialQuestion: { label: 'Essential Question', stageKey: 'essentialQuestion', confirmKey: 'essentialQuestionConfirmed' as const },
      challenge: { label: 'Challenge', stageKey: 'challenge', confirmKey: 'challengeConfirmed' as const }
    }[section];

    const currentValue = (projectState.ideation as Record<string, string>)[section] || '';
    if (!currentValue.trim()) {
      showInfoToast(`Add a ${config.label.toLowerCase()} before accepting.`);
      return;
    }

    clearAskALFTray();
    saveToBackend(config.stageKey, currentValue, config.label);
    setProjectState(prev => ({
      ...prev,
      ideation: {
        ...prev.ideation,
        [section]: currentValue,
        [config.confirmKey]: true
      }
    }));
    showInfoToast(`${config.label} saved to your draft.`);
  };

  const handleRefineIdeation = (section: 'bigIdea' | 'essentialQuestion' | 'challenge') => {
    const config = {
      bigIdea: { label: 'Big Idea', stage: 'BIG_IDEA' as ProjectState['stage'], hint: 'idea' },
      essentialQuestion: { label: 'Essential Question', stage: 'ESSENTIAL_QUESTION' as ProjectState['stage'], hint: 'question' },
      challenge: { label: 'Challenge', stage: 'CHALLENGE' as ProjectState['stage'], hint: 'challenge' }
    }[section];

    const currentValue = (projectState.ideation as Record<string, string>)[section] || '';
    clearAskALFTray();
    triggerAskALF(config.stage, config.hint);
    const prompt = currentValue
      ? `Let's refine the ${config.label.toLowerCase()}. Current draft: "${currentValue}". Make it sharper and more student-facing.`
      : `Let's craft a compelling ${config.label.toLowerCase()} from scratch.`;
    setInput(prompt);
    window.requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
      textarea?.focus();
    });
  };

  const handleReplaceIdeation = (section: 'bigIdea' | 'essentialQuestion' | 'challenge') => {
    const config = {
      bigIdea: { stage: 'BIG_IDEA' as ProjectState['stage'], hint: 'idea', confirmKey: 'bigIdeaConfirmed' as const },
      essentialQuestion: { stage: 'ESSENTIAL_QUESTION' as ProjectState['stage'], hint: 'question', confirmKey: 'essentialQuestionConfirmed' as const },
      challenge: { stage: 'CHALLENGE' as ProjectState['stage'], hint: 'challenge', confirmKey: 'challengeConfirmed' as const }
    }[section];

    clearAskALFTray();
    triggerAskALF(config.stage, config.hint);
    setProjectState(prev => ({
      ...prev,
      ideation: {
        ...prev.ideation,
        [section]: '',
        [config.confirmKey]: false
      }
    }));
    setInput('');
    showInfoToast(`Cleared the ${section === 'bigIdea' ? 'big idea' : section === 'essentialQuestion' ? 'essential question' : 'challenge'} for a fresh brainstorm.`);
  };

  const handleAcceptJourney = () => {
    const snapshot = getCurrentProjectSnapshot();
    const phases = snapshot?.phases ?? [];
    if (!phases.length) {
      showInfoToast('Add some journey details before accepting.');
      return;
    }
    const summary = phases
      .map(phase => `${phase.name || 'Phase'}: ${phase.description || phase.goals?.[0] || ''}`.trim())
      .filter(Boolean)
      .join('\n');
    clearAskALFTray();
    saveToBackend('phases', summary, 'Learning Journey');
    showInfoToast('Learning journey saved to your draft.');
  };

  const handleRefineJourney = () => {
    const snapshot = getCurrentProjectSnapshot();
    const phases = snapshot?.phases ?? [];
    const summary = phases
      .map(phase => `${phase.name || 'Phase'} → ${phase.description || phase.goals?.[0] || ''}`.trim())
      .filter(Boolean)
      .join('\n');
    clearAskALFTray();
    triggerAskALF('JOURNEY', 'phases');
    const prompt = summary
      ? `Let's refine the learning journey. Here is the current outline:\n${summary}\nFocus on clarifying purpose, student experience, and timing.`
      : 'Help me design a learning journey aligned to our big idea and challenge.';
    setInput(prompt);
    window.requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
      textarea?.focus();
    });
  };

  const handleReplaceJourney = () => {
    clearAskALFTray();
    const firstType = 'journey.analyze.goal';
    setProjectState(prev => ({ ...prev, stage: 'JOURNEY', awaitingConfirmation: { type: firstType, value: '' } }));
    setSuggestions(getMicrostepSuggestions(firstType).map((t, i) => ({ id: `js-reset-${i}`, text: t })) as any);
    setShowSuggestions(true);
    showInfoToast('Starting a fresh learning journey plan.');
  };

  const handleAcceptDeliverables = () => {
    const snapshot = getCurrentProjectSnapshot();
    const milestones = snapshot?.milestones ?? [];
    if (milestones.length === 0) {
      showInfoToast('Add milestones before accepting deliverables.');
    }
    clearAskALFTray();
    milestones.forEach((milestone, index) => {
      const text = milestone.description || milestone.name;
      if (text) {
        saveToBackend(`milestones.${index}`, text, 'Deliverables');
      }
    });
    const audience = snapshot?.exhibition?.audience?.join(', ');
    const method = snapshot?.exhibition?.format;
    if (audience) {
      saveToBackend('impact.audience', audience, 'Deliverables Impact');
    }
    if (method) {
      saveToBackend('impact.method', method, 'Deliverables Impact');
    }
    showInfoToast('Deliverables saved to your draft.');
  };

  const handleRefineDeliverables = () => {
    clearAskALFTray();
    triggerAskALF('DELIVERABLES', 'deliverables');
    const summary = getDeliverablesSummary();
    const prompt = summary
      ? `Let's refine the deliverables plan. Current summary:\n${summary}\nSuggest improvements for authenticity and assessment.`
      : 'Help me craft milestones, rubric criteria, and an impact plan for this project.';
    setInput(prompt);
    window.requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
      textarea?.focus();
    });
  };

  const handleReplaceDeliverables = () => {
    clearAskALFTray();
    const t = 'deliverables.milestones.0';
    setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
    setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-reset-${i}`, text: v })) as any);
    setShowSuggestions(true);
    showInfoToast('Cleared deliverables — ready for a fresh plan.');
  };

  // Journey micro-steps orchestration (deterministic)
  const journeyPhases = ['analyze', 'brainstorm', 'prototype', 'evaluate'] as const;
  const journeySubsteps = ['goal', 'activity', 'output', 'duration'] as const;

  const isJourneySubAwaiting = () => {
    const t = projectState.awaitingConfirmation?.type || '';
    const parts = t.split('.');
    return t.startsWith('journey.') && parts.length === 3 && journeyPhases.includes(parts[1] as any) && journeySubsteps.includes(parts[2] as any);
  };

  const nextJourneyAwaitingType = (currentType: string): string | null => {
    const [, phase, sub] = currentType.split('.');
    const subIdx = journeySubsteps.indexOf(sub as any);
    if (subIdx < journeySubsteps.length - 1) {
      return `journey.${phase}.${journeySubsteps[subIdx + 1]}`;
    }
    // move to next phase
    const phaseIdx = journeyPhases.indexOf(phase as any);
    if (phaseIdx < journeyPhases.length - 1) {
      return `journey.${journeyPhases[phaseIdx + 1]}.goal`;
    }
    return null;
  };

  const promptForJourneyAwaiting = (type: string) => {
    if (type === 'journey.supports') {
      const wizard = getWizardData();
      const baseCtx = `${wizard.subjects?.join(', ') || projectState.context.subject || 'your subject'} • ${wizard.gradeLevel || projectState.context.gradeLevel || 'your students'}`;
      return `Roles & Scaffolds (${baseCtx}).\nDescribe student roles (e.g., researcher/designer), differentiation/UDL supports, and teacher scaffolds (templates, sentence frames, checklists).`;
    }
    const [, phase, sub] = type.split('.');
    const wizard = getWizardData();
    const baseCtx = `${wizard.subjects?.join(', ') || projectState.context.subject || 'your subject'} • ${wizard.gradeLevel || projectState.context.gradeLevel || 'your students'}`;
    const phaseTitle: Record<string, string> = { analyze: 'Analyze', brainstorm: 'Brainstorm', prototype: 'Prototype', evaluate: 'Evaluate' };
    const subLabel: Record<string, string> = {
      goal: `What should students learn or accomplish in the ${phaseTitle[phase]} phase?`,
      activity: `Describe one activity/method you want students to do in ${phaseTitle[phase]}.`,
      output: `What will students produce as evidence in ${phaseTitle[phase]}?`,
      duration: `About how long will ${phaseTitle[phase]} take (e.g., 1–2 lessons)?`
    };
    return `Let’s plan your Learning Journey (${baseCtx}).\n${subLabel[sub]}`;
  };

  const getMicrostepSuggestions = (type: string): string[] => {
    const [, phase, sub] = type.split('.');
    const band = (projectState.context.gradeLevel || getWizardData().gradeLevel || '').toLowerCase();
    const elem = band.includes('elementary');
    if (type.startsWith('journey.')) {
      if (sub === 'goal') {
        return elem
          ? ['Learn key ideas', 'Ask good questions', 'Understand the problem']
          : ['Clarify the problem', 'Identify learning goals', 'Define success indicators'];
      }
      if (sub === 'activity') {
        return elem
          ? ['Interview a helper', 'Observe and take notes', 'Read and discuss']
          : ['Stakeholder interviews', 'Data/Document analysis', 'Field observation'];
      }
      if (sub === 'output') {
        return elem
          ? ['Short poster', 'Sketch/model', 'Journal entry']
          : ['Research memo', 'Annotated sources', 'Interview summary'];
      }
      if (sub === 'duration') {
        return ['1–2 lessons', '3–4 lessons', 'About a week'];
      }
    }
    if (type.startsWith('deliverables.milestones')) {
      return ['Research summary', 'Prototype review', 'Final showcase'];
    }
    if (type === 'deliverables.rubric.criteria') {
      return ['Understanding, Process, Product', 'Insight, Rigor, Impact', 'Research, Design, Communication'];
    }
    if (type === 'deliverables.impact.audience') {
      return ['Peers and families', 'Community stakeholders', 'School leadership'];
    }
    if (type === 'deliverables.impact.method') {
      return ['Public exhibition', 'Stakeholder briefing', 'Digital publication'];
    }
    if (type === 'deliverables.artifacts') {
      return ['Infographic brief', 'Prototype demo', 'Policy proposal'];
    }
    if (type.startsWith('deliverables.checkpoints')) {
      return ['Kickoff check-in', 'Midpoint review', 'Final rehearsal'];
    }
    return [];
  };

  // Accept & Continue helper – accelerates micro-steps and confirmations
  // Defined after handleSend below to avoid TDZ issues

  const backOneStep = useCallback(() => {
    const awaiting = projectState.awaitingConfirmation?.type || '';
    if (!awaiting) return;

    if (awaiting === 'journey') {
      const previous = 'journey.evaluate.duration';
      // Clear previous value so user can re-enter
      saveToBackend(previous.replace('journey.', ''), '', 'Learning Journey');
      setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
      setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `js-prev-${i}`, text: t })) as any);
      setShowSuggestions(true);
      const prompt = promptForJourneyAwaiting(previous);
      setMessages(prev => [...prev, { id: String(Date.now() + 25), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'JOURNEY' } }]);
      showInfoToast('Previous step cleared');
      return;
    }
    if (awaiting === 'deliverables') {
      const previous = 'deliverables.impact.method';
      saveToBackend(previous.replace('deliverables.', ''), '', 'Deliverables');
      setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
      setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `ds-prev-${i}`, text: t })) as any);
      setShowSuggestions(true);
      const prompt = promptForDeliverablesAwaiting(previous);
      setMessages(prev => [...prev, { id: String(Date.now() + 26), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'DELIVERABLES' } }]);
      showInfoToast('Previous step cleared');
      return;
    }
    if (awaiting.startsWith('journey.')) {
      const previous = prevJourneyAwaitingType(awaiting);
      if (previous) {
        saveToBackend(previous.replace('journey.', ''), '', 'Learning Journey');
        setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
        setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `js-prev-${i}`, text: t })) as any);
        setShowSuggestions(true);
        const prompt = promptForJourneyAwaiting(previous);
        setMessages(prev => [...prev, { id: String(Date.now() + 27), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'JOURNEY' } }]);
        showInfoToast('Previous step cleared');
      }
      return;
    }
    if (awaiting.startsWith('deliverables.')) {
      const previous = prevDeliverablesAwaitingType(awaiting);
      if (previous) {
        saveToBackend(previous.replace('deliverables.', ''), '', 'Deliverables');
        setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
        setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `ds-prev-${i}`, text: t })) as any);
        setShowSuggestions(true);
        const prompt = promptForDeliverablesAwaiting(previous);
        setMessages(prev => [...prev, { id: String(Date.now() + 28), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'DELIVERABLES' } }]);
        showInfoToast('Previous step cleared');
      }
    }
  }, [projectState.awaitingConfirmation]);

  // Deliverables micro-steps orchestration (deterministic)
  const deliverablesSequence = [
    'deliverables.milestones.0',
    'deliverables.milestones.1',
    'deliverables.milestones.2',
    'deliverables.rubric.criteria',
    'deliverables.impact.audience',
    'deliverables.impact.method'
  ] as const;

  const isDeliverablesSubAwaiting = () => {
    const t = projectState.awaitingConfirmation?.type || '';
    return deliverablesSequence.includes(t as any);
  };

  const nextDeliverablesAwaitingType = (currentType: string): string | null => {
    const idx = deliverablesSequence.indexOf(currentType as any);
    if (idx >= 0 && idx < deliverablesSequence.length - 1) {
      return deliverablesSequence[idx + 1];
    }
    return null;
  };

  const promptForDeliverablesAwaiting = (type: string) => {
    const wizard = getWizardData();
    const baseCtx = `${wizard.subjects?.join(', ') || projectState.context.subject || 'your subject'} • ${wizard.gradeLevel || projectState.context.gradeLevel || 'your students'}`;
    if (type.startsWith('deliverables.milestones')) {
      const n = type.endsWith('.0') ? 'first' : type.endsWith('.1') ? 'second' : 'third';
      return `Let's define project milestones (${baseCtx}).\nWhat should be the ${n} key checkpoint (e.g., research summary, prototype review, final showcase)?`;
    }
    if (type === 'deliverables.rubric.criteria') {
      return `Now the rubric (${baseCtx}).\nList 3–4 criteria we will assess (e.g., understanding, process, product, impact).`;
    }
    if (type === 'deliverables.impact.audience') {
      return `Impact plan (${baseCtx}).\nWho is the authentic audience (e.g., peers, families, community partners, stakeholders)?`;
    }
    if (type === 'deliverables.impact.method') {
      return `And how will students share their work (e.g., exhibition, briefing, publication, demo)?`;
    }
    if (type === 'deliverables.artifacts') {
      return `Artifacts/Deliverables (${baseCtx}).\nList 1–3 student-facing outputs with a short description. Optionally reference a milestone number (e.g., "Infographic (Milestone 2)").`;
    }
    if (type.startsWith('deliverables.checkpoints')) {
      return `Checkpoints & Evidence (${baseCtx}).\nDescribe one formative checkpoint (name + due). Include what evidence to capture, where it lives (Drive/LMS), and who owns it (student/team/teacher).`;
    }
    return 'Tell me more about your deliverables.';
  };

  const prevJourneyAwaitingType = (currentType: string): string | null => {
    const [, phase, sub] = currentType.split('.');
    const subIdx = journeySubsteps.indexOf(sub as any);
    if (subIdx > 0) return `journey.${phase}.${journeySubsteps[subIdx - 1]}`;
    const phaseIdx = journeyPhases.indexOf(phase as any);
    if (phaseIdx > 0) return `journey.${journeyPhases[phaseIdx - 1]}.duration`;
    return null;
  };

  const prevDeliverablesAwaitingType = (currentType: string): string | null => {
    const deliverablesSequence = [
      'deliverables.milestones.0',
      'deliverables.milestones.1',
      'deliverables.milestones.2',
      'deliverables.rubric.criteria',
      'deliverables.impact.audience',
      'deliverables.impact.method'
    ];
    const idx = deliverablesSequence.indexOf(currentType);
    if (idx > 0) return deliverablesSequence[idx - 1];
    return null;
  };

  // Improved stage transition with natural progression and quality validation
  const detectStageTransition = (userInput: string, aiResponse: string) => {
    const input = userInput.toLowerCase();
    
    // Track message count in current stage
    setProjectState(prev => ({
      ...prev,
      messageCountInStage: prev.messageCountInStage + 1
    }));
    
    // Delegated deterministic flow via orchestrator first
    try {
      const plan = FlowOrchestrator.detect({
        stage: projectState.stage as any,
        messageCountInStage: projectState.messageCountInStage,
        awaitingConfirmation: projectState.awaitingConfirmation as any,
        ideation: projectState.ideation
      }, userInput);

      if (plan.type === 'clearAwaiting') {
        setProjectState(prev => ({ ...prev, awaitingConfirmation: undefined }));
        return;
      }

      if ((plan.type === 'awaitConfirmation' || plan.type === 'proposeMinimal') && plan.awaiting) {
        setProjectState(prev => ({ ...prev, awaitingConfirmation: plan.awaiting }));
        return;
      }

      if (plan.type === 'commitAndAdvance') {
        if (plan.celebrateLabel) showStageCompletionCelebration(plan.celebrateLabel);
        if (plan.save) saveToBackend(plan.save.stageKey, plan.save.value, plan.save.label);
        showInfoToast('Saved and advanced');
        setProjectState(prev => ({
          ...prev,
          stage: (plan.nextStage || prev.stage) as any,
          messageCountInStage: 0,
          awaitingConfirmation: undefined,
          ideation: {
            ...prev.ideation,
            bigIdea: plan.save?.stageKey === 'bigIdea' ? (plan.save.value || prev.ideation.bigIdea) : prev.ideation.bigIdea,
            bigIdeaConfirmed: plan.save?.stageKey === 'bigIdea' ? true : prev.ideation.bigIdeaConfirmed,
            essentialQuestion: plan.save?.stageKey === 'essentialQuestion' ? (plan.save.value || prev.ideation.essentialQuestion) : prev.ideation.essentialQuestion,
            essentialQuestionConfirmed: plan.save?.stageKey === 'essentialQuestion' ? true : prev.ideation.essentialQuestionConfirmed,
            challenge: plan.save?.stageKey === 'challenge' ? (plan.save.value || prev.ideation.challenge) : prev.ideation.challenge,
            challengeConfirmed: plan.save?.stageKey === 'challenge' ? true : prev.ideation.challengeConfirmed,
          }
        }));
        return;
      }
    } catch (e) {
      // Fall back to in-component logic below
    }
    
    // Detect confusion patterns (from guide section 4)
    const confusionPatterns = [
      'not sure', 'don\'t understand', 'confused', 'what do you mean',
      'can you explain', 'help me', 'i don\'t know', 'unclear', 'lost'
    ];
    const seemsConfused = confusionPatterns.some(pattern => input.includes(pattern));
    
    // Look for explicit progression signals (from guide section 5)
    const progressionSignals = [
      'sounds good', 'let\'s continue', 'what\'s next', 'next step',
      'i\'m ready', 'that works', 'perfect', 'great', 'yes, let\'s',
      'let\'s move on', 'i like that', 'that\'s it', 'exactly'
    ];
    const wantsToProgress = progressionSignals.some(signal => input.includes(signal));
    
    // Don't progress if user is confused
    if (seemsConfused) {
      console.log('[Stage Transition] User seems confused, providing support');
      // Stay in current stage but increase support
      return;
    }
    
    // Note: We now start directly in BIG_IDEA stage after wizard completion
    // No need for GROUNDING -> BIG_IDEA transition
    
    // BIG_IDEA -> ESSENTIAL_QUESTION (simplified progression)
    if (projectState.stage === 'BIG_IDEA') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'bigIdea') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const bigIdea = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] BIG_IDEA -> ESSENTIAL_QUESTION (confirmed)', { bigIdea });
          showStageCompletionCelebration('Big Idea');
          
          // Save to backend FIRST
          saveToBackend('bigIdea', bigIdea, 'Big Idea');
          
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, bigIdea, bigIdeaConfirmed: true },
            stage: 'ESSENTIAL_QUESTION',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine - clear confirmation state
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        } else {
          // User provided new input instead of confirming - treat as refined Big Idea
          const hasSubstance = userInput.trim().length > 5;
          if (hasSubstance) {
            console.log('[Stage Transition] User refined Big Idea, auto-progressing');
            showStageCompletionCelebration('Big Idea');
            
            // Save to backend FIRST
            saveToBackend('bigIdea', userInput, 'Big Idea');
            
            setProjectState(prev => ({
              ...prev,
              ideation: { ...prev.ideation, bigIdea: userInput, bigIdeaConfirmed: true },
              stage: 'ESSENTIAL_QUESTION',
              messageCountInStage: 0,
              awaitingConfirmation: undefined
            }));
            
            return;
          }
        }
      }
      
      // New input - SIMPLIFIED: Accept any substantive input and auto-progress
      const hasSubstance = userInput.trim().length > 3;
      const forceAccept = projectState.messageCountInStage >= 2; // Reduced from 3
      
      if (hasSubstance || forceAccept) {
        // Auto-progress without requiring confirmation
        console.log('[Stage Transition] BIG_IDEA -> ESSENTIAL_QUESTION (auto-progress)', { bigIdea: userInput });
        showStageCompletionCelebration('Big Idea');
        
        // Save to backend FIRST
        saveToBackend('bigIdea', userInput, 'Big Idea');
        
        setProjectState(prev => ({
          ...prev,
          ideation: { ...prev.ideation, bigIdea: userInput, bigIdeaConfirmed: true },
          stage: 'ESSENTIAL_QUESTION',
          messageCountInStage: 0,
          awaitingConfirmation: undefined
        }));
        
        return;
      }
    }
    
    // ESSENTIAL_QUESTION -> CHALLENGE (with confirmation)
    if (projectState.stage === 'ESSENTIAL_QUESTION') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'essentialQuestion') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const essentialQuestion = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] ESSENTIAL_QUESTION -> CHALLENGE (confirmed EQ, skipping standards since handled in wizard)', { essentialQuestion });
          showStageCompletionCelebration('Essential Question');
          
          // Save to backend FIRST
          saveToBackend('essentialQuestion', essentialQuestion, 'Essential Question');
          
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, essentialQuestion, essentialQuestionConfirmed: true },
            stage: 'CHALLENGE',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // New input - check if it's a question
      const hasQuestion = input.includes('?') || 
                         (input.includes('how') || input.includes('why') || input.includes('what'));
      const forceAccept = projectState.messageCountInStage >= 3;
      
      if (hasQuestion || forceAccept) {
        // Set up confirmation state
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'essentialQuestion',
            value: userInput
          }
        }));
        return;
      }
    }
    
    // CHALLENGE -> JOURNEY (with confirmation)
    if (projectState.stage === 'CHALLENGE') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'challenge') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const challenge = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] CHALLENGE -> JOURNEY (confirmed)', { challenge });
          showStageCompletionCelebration('Challenge Definition');
          
          // Save to backend FIRST
          saveToBackend('challenge', challenge, 'Challenge Definition');
          
          setProjectState(prev => ({
            ...prev,
            ideation: { ...prev.ideation, challenge, challengeConfirmed: true },
            stage: 'JOURNEY',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // New input - check if it has action
      const hasSubstance = userInput.length > 15;
      const forceAccept = projectState.messageCountInStage >= 3;
      
      if (hasSubstance || forceAccept) {
        // Set up confirmation state
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'challenge',
            value: userInput
          }
        }));
        return;
      }
    }
    
    // JOURNEY -> DELIVERABLES (with confirmation or auto-plan)
    if (projectState.stage === 'JOURNEY') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'journey') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const journeyPlan = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] JOURNEY -> DELIVERABLES (confirmed)', { journeyPlan });
          showStageCompletionCelebration('Learning Journey');
          
          // Save to backend FIRST
          saveToBackend('phases', journeyPlan, 'Learning Journey Phases');
          
          setProjectState(prev => ({
            ...prev,
            stage: 'DELIVERABLES',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }
      
      // If user signals progress without a detailed plan, propose a minimal plan for confirmation
      if (wantsToProgress) {
        const minimalPlan = `Analyze → Brainstorm → Prototype → Evaluate\n- Analyze: research + stakeholder perspectives\n- Brainstorm: generate and select ideas\n- Prototype: build and test with users\n- Evaluate: measure impact and refine`;
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: { type: 'journey', value: minimalPlan }
        }));
        return;
      }

      // Check for quality content that could be the learning journey plan
      const journeyKeywords = ['research', 'analyze', 'brainstorm', 'prototype', 'create', 'test', 'evaluate', 'phase', 'week', 'timeline'];
      const hasJourneyContent = journeyKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
      
      if (hasJourneyContent && userInput.length > 50) {
        // Save and ask for confirmation
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'journey',
            value: userInput
          }
        }));
        return;
      }
    }
    
    // DELIVERABLES -> COMPLETE (with confirmation or default summary)
    if (projectState.stage === 'DELIVERABLES') {
      // Check if we're confirming a previous input
      if (projectState.awaitingConfirmation?.type === 'deliverables') {
        if (checkForProgressSignal(userInput)) {
          // User confirmed - proceed
          const deliverables = projectState.awaitingConfirmation.value;
          console.log('[Stage Transition] DELIVERABLES -> COMPLETE (confirmed)', { deliverables });
          showStageCompletionCelebration('Project Blueprint');
          
          // Save to backend FIRST
          saveToBackend('deliverables', deliverables, 'Deliverables & Assessment');
          
          setProjectState(prev => ({
            ...prev,
            stage: 'COMPLETE',
            messageCountInStage: 0,
            awaitingConfirmation: undefined
          }));
          
          return;
        } else if (checkForRefinementSignal(userInput)) {
          // User wants to refine
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: undefined
          }));
          return;
        }
      }

      // If user signals ready, propose a minimal deliverables package and ask to confirm
      if (wantsToProgress) {
        const minimalDeliverables = `Milestones: kickoff, midpoint review, final showcase\nRubric: understanding, process, product (3 levels)\nImpact: share with authentic audience (e.g., community or stakeholders)`;
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: { type: 'deliverables', value: minimalDeliverables }
        }));
        return;
      }
      
      // Check for quality content that could be deliverables
      const deliverablesKeywords = ['presentation', 'portfolio', 'prototype', 'report', 'assessment', 'rubric', 'showcase', 'exhibition'];
      const hasDeliverablesContent = deliverablesKeywords.some(keyword => userInput.toLowerCase().includes(keyword));
      
      if (hasDeliverablesContent && userInput.length > 50) {
        // Save and ask for confirmation
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'deliverables',
            value: userInput
          }
        }));
        return;
      }
    }
  };
  
  // Handle sending messages with REAL AI
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;
    
    setLastInteractionTime(Date.now());
    
    // Add micro-interaction feedback
    const inputElement = document.querySelector('textarea');
    if (inputElement) {
      inputElement.style.transform = 'scale(0.98)';
      setTimeout(() => {
        inputElement.style.transform = 'scale(1)';
      }, 150);
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = textToSend;
    setInput('');
    setIsTyping(true);
    
    // Check if user is asking for ideas/examples
    const askingForIdeas = [
      'ideas', 'examples', 'suggestions', 'options', 'help me think',
      'not sure', 'give me', 'show me', 'what are some', 'can you suggest'
    ].some(phrase => userInput.toLowerCase().includes(phrase));
    
    try {
      // Deterministic handling for Journey micro-steps
      if (isJourneySubAwaiting()) {
        const awaitingType = projectState.awaitingConfirmation!.type;
        // Save this sub-step immediately using dotted keys, e.g., analyze.goal
        const saveKey = awaitingType.replace('journey.', '');
        saveToBackend(saveKey, textToSend, 'Learning Journey');

        // Advance to next sub-step or propose summary
        const nextType = nextJourneyAwaitingType(awaitingType);
        if (nextType) {
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: { type: nextType, value: '' }
          }));
          setSuggestions(getMicrostepSuggestions(nextType).map((t, i) => ({ id: `js-${i}`, text: t })) as any);
          setShowSuggestions(true);
          const prompt = promptForJourneyAwaiting(nextType);
          const assistantMessage: Message = {
            id: String(Date.now() + 3),
            role: 'assistant',
            content: prompt,
            timestamp: new Date(),
            metadata: { stage: 'JOURNEY' }
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
          return;
        } else {
          // Finished all phases → propose a compiled minimal plan for confirmation
          const minimalPlan = `Analyze → Brainstorm → Prototype → Evaluate\n- Analyze: research + stakeholder perspectives\n- Brainstorm: generate and select ideas\n- Prototype: build and test with users\n- Evaluate: measure impact and refine`;
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: { type: 'journey', value: minimalPlan }
          }));
          const assistantMessage: Message = {
            id: String(Date.now() + 4),
            role: 'assistant',
            content: `Great progress! Here’s a simple structure we can confirm:\n\n${minimalPlan}\n\nDoes this look good to move forward to Deliverables?`,
            timestamp: new Date(),
            metadata: { stage: 'JOURNEY' }
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Deterministic handling for Deliverables micro-steps
      if (isDeliverablesSubAwaiting()) {
        const awaitingType = projectState.awaitingConfirmation!.type; // e.g., deliverables.milestones.0
        // Save to backend removing 'deliverables.' so captured key becomes 'deliverables.xxx'
        const saveKey = awaitingType.replace('deliverables.', '');
        saveToBackend(saveKey, textToSend, 'Deliverables');

        const nextType = nextDeliverablesAwaitingType(awaitingType);
        if (nextType) {
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: { type: nextType, value: '' }
          }));
          setSuggestions(getMicrostepSuggestions(nextType).map((t, i) => ({ id: `ds-${i}`, text: t })) as any);
          setShowSuggestions(true);
          const prompt = promptForDeliverablesAwaiting(nextType);
          const assistantMessage: Message = {
            id: String(Date.now() + 6),
            role: 'assistant',
            content: prompt,
            timestamp: new Date(),
            metadata: { stage: 'DELIVERABLES' }
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
          return;
        } else {
          // Finished micro-steps: propose summary for confirmation
          const summary = `Milestones: three checkpoints\nRubric: criteria as defined\nImpact: audience + method above`;
          setProjectState(prev => ({
            ...prev,
            awaitingConfirmation: { type: 'deliverables', value: summary }
          }));
          const assistantMessage: Message = {
            id: String(Date.now() + 7),
            role: 'assistant',
            content: `Excellent. Here is a concise summary of your Deliverables:\n\n${summary}\n\nReady to finalize and complete the blueprint?`,
            timestamp: new Date(),
            metadata: { stage: 'DELIVERABLES' }
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Simple handling for additional Deliverables micro-steps (artifacts, checkpoints)
      if (projectState.awaitingConfirmation?.type === 'journey.supports') {
        saveToBackend('supports', textToSend, 'Learning Journey');
        const assistantMessage: Message = {
          id: String(Date.now() + 5),
          role: 'assistant',
          content: 'Captured roles and scaffolds. You can continue refining or type "next" to proceed to Deliverables.',
          timestamp: new Date(),
          metadata: { stage: 'JOURNEY' }
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        return;
      }

      // Simple handling for additional Deliverables micro-steps (artifacts, checkpoints)
      if (projectState.awaitingConfirmation?.type?.startsWith('deliverables.artifacts')) {
        // Save as single field under deliverables.artifacts
        saveToBackend('artifacts', textToSend, 'Deliverables');
        const assistantMessage: Message = {
          id: String(Date.now() + 5),
          role: 'assistant',
          content: 'Got it. Add another artifact or type "next" to move on.',
          timestamp: new Date(),
          metadata: { stage: 'DELIVERABLES' }
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        return;
      }

      if (projectState.awaitingConfirmation?.type?.startsWith('deliverables.checkpoints')) {
        // Save current checkpoint entry, then advance index
        const awaitingType = projectState.awaitingConfirmation!.type; // e.g., deliverables.checkpoints.0
        const saveKey = awaitingType.replace('deliverables.', ''); // checkpoints.0
        saveToBackend(saveKey, textToSend, 'Deliverables');
        // Advance to next checkpoint index
        const parts = awaitingType.split('.');
        const nextIdx = String((parseInt(parts[2] || '0', 10) || 0) + 1);
        const nextType = `deliverables.checkpoints.${nextIdx}`;
        setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: nextType, value: '' } }));
        setSuggestions(getMicrostepSuggestions(nextType).map((t, i) => ({ id: `ds-cp-${i}`, text: t })) as any);
        setShowSuggestions(true);
        const prompt = promptForDeliverablesAwaiting(nextType);
        const assistantMessage: Message = {
          id: String(Date.now() + 6),
          role: 'assistant',
          content: prompt + '\n(Type "done" any time to stop adding checkpoints.)',
          timestamp: new Date(),
          metadata: { stage: 'DELIVERABLES' }
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        return;
      }

      let aiResponse = '';
      
      // If asking for ideas, generate suggestions and show them
      if (askingForIdeas) {
        // Generate contextual suggestions using actual wizard data
        const wizard = getWizardData();
        const context = {
          subject: wizard.subjects?.join(', ') || projectState.context.subject || 'your subject area',
          gradeLevel: wizard.gradeLevel || projectState.context.gradeLevel || 'your students',
          projectTopic: wizard.projectTopic || 'your project',
          bigIdea: projectState.ideation.bigIdea,
          essentialQuestion: projectState.ideation.essentialQuestion,
          challenge: projectState.ideation.challenge
        };
        
        // Get contextual suggestions based on actual wizard data
        const stageSuggestions = getStageSuggestions(projectState.stage, undefined, context);
        
        if (stageSuggestions.length > 0) {
          const suggestions = stageSuggestions.slice(0, 3).map(s => 
            typeof s === 'string' ? s : s.text
          );
          
          // Create contextual response based on wizard data
          if (projectState.stage === 'BIG_IDEA') {
            aiResponse = `Here are some Big Idea concepts tailored to your ${context.subject} project with ${context.gradeLevel} students:`;
          } else if (projectState.stage === 'ESSENTIAL_QUESTION') {
            aiResponse = `Based on your Big Idea "${context.bigIdea || 'concept'}", here are Essential Questions for your ${context.subject} students:`;
          } else if (projectState.stage === 'CHALLENGE') {
            aiResponse = `Here are authentic ${context.subject} challenges that connect to your Essential Question and give students real purpose:`;
          } else {
            aiResponse = `Here are some ideas for your ${context.subject} project:`;
          }
          
          // Add suggestions to the message
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
            metadata: {
              stage: projectState.stage,
              suggestions: suggestions,
              showSuggestions: true
            }
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsTyping(false);
          return; // Exit early since we handled the suggestions
        } else {
          // Fallback to AI response if no contextual suggestions available
          const prompt = generateAIPrompt(userInput);
          aiResponse = await geminiService.current.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 500
          });
        }
      } else {
        // Check if we're in confirmation state
        if (projectState.awaitingConfirmation) {
          // Generate confirmation response based on user input
          const confirmationStrategy = getConfirmationStrategy({
            stage: projectState.stage,
            input: projectState.awaitingConfirmation.value,
            attemptCount: projectState.messageCountInStage,
            isFromSuggestion: false
          });
          
          // If user is confirming or refining, handle in detectStageTransition
          // Otherwise, provide the confirmation prompt
          if (!checkForProgressSignal(userInput) && !checkForRefinementSignal(userInput)) {
            aiResponse = generateConfirmationPrompt(confirmationStrategy, projectState.stage);
          } else {
            // Regular AI response for confirmation/refinement
            const prompt = generateAIPrompt(userInput);
            aiResponse = await geminiService.current.generateResponse(prompt, {
              temperature: 0.7,
              maxTokens: 500
            });
          }
        } else {
          // Regular AI response
          const prompt = generateAIPrompt(userInput);
          aiResponse = await geminiService.current.generateResponse(prompt, {
            temperature: 0.7,
            maxTokens: 500
          });
        }
      }
      
      // Detect stage transitions (handles confirmation logic)
      detectStageTransition(userInput, aiResponse);
      
      // Determine if we should show help/ideas buttons
      const shouldShowHelp = aiResponse.toLowerCase().includes('big idea') || 
                            aiResponse.toLowerCase().includes('essential question') ||
                            aiResponse.toLowerCase().includes('challenge');
      
      const shouldShowIdeas = ['BIG_IDEA','ESSENTIAL_QUESTION','CHALLENGE','JOURNEY'].includes(projectState.stage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        metadata: {
          stage: projectState.stage,
          showIdeas: useInlineUI && shouldShowIdeas,
          showHelp: useInlineUI && shouldShowHelp
        }
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      logger.error('AI response failed:', error);
      
      // Fallback message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, I'm having trouble processing that. Could you rephrase or tell me more about what you're looking for?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Accept & Continue helper – accelerates micro-steps and confirmations
  const acceptAndContinue = useCallback(() => {
    const awaiting = projectState.awaitingConfirmation?.type || '';
    if (!awaiting) return;

    // Confirmation steps – just confirm
    if (awaiting === 'journey' || awaiting === 'deliverables') {
      handleSend('yes');
      showInfoToast('Saved and advanced');
      return;
    }

    // Micro-steps – choose first suggestion or a sensible fallback
    const suggs = getMicrostepSuggestions(awaiting);
    const choice = suggs[0] || 'Looks good';
    handleSend(choice);
  }, [projectState.awaitingConfirmation, handleSend]);
  
  // Handle inline actions (Ideas/Help)
  const handleInlineAction = async (action: 'ideas' | 'help', messageId: string) => {
    logger.log('Inline action triggered:', action, messageId);
    
    if (action === 'ideas') {
      // Get contextual suggestions for the current stage
      const wizard = getWizardData();
      const stageSuggestions = getStageSuggestions(projectState.stage, undefined, {
        subject: projectState.context.subject || wizard.subjects?.join(', '),
        gradeLevel: projectState.context.gradeLevel || wizard.gradeLevel,
        projectTopic: wizard.projectTopic,
        bigIdea: projectState.ideation.bigIdea,
        essentialQuestion: projectState.ideation.essentialQuestion,
        challenge: projectState.ideation.challenge
      });
      
      // Set suggestions and show them
      setSuggestions(stageSuggestions);
      setShowSuggestions(true);
      setShowSuggestionsForMessage(messageId);
    }
    
    if (action === 'help') {
      // Show contextual help inline
      setShowHelpForMessage(messageId);
    }
  };

  const triggerAskALF = useCallback((stage: ProjectState['stage'], stepHint?: string) => {
    const context = composeAskALFContext();

    const contextualSuggestions = getStageSuggestions(stage, stepHint, context);
    if (contextualSuggestions.length) {
      setSuggestions(contextualSuggestions);
    }

    setActiveAskALFStage(stage);
    setActiveAskALFContext(context);
    setAutomaticSuggestionsHidden(false);
    setShowSuggestionsForMessage(null);
    setShowSuggestions(false);

    setProjectState(prev => ({
      ...prev,
      stage,
      awaitingConfirmation: undefined,
      messageCountInStage: 0
    }));

    window.requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      }
    });
  }, [composeAskALFContext]);
  
  // Handle suggestion selection - Fixed to work properly
  const handleSuggestionSelect = (suggestion: string) => {
    console.log('[Suggestion Selected]:', suggestion);
    // Add the suggestion to the input
    setInput(suggestion);
    setShowSuggestionsForMessage(null);
    setShowSuggestions(false); // Also hide the main suggestions panel
    
    // Focus the textarea (not input)
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      // Auto-resize after setting value
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };
  
  // Handle suggestion click - auto-submit immediately
  const handleSuggestionClick = (suggestion: any) => {
    console.log('[Suggestion Clicked - Insert to input]:', suggestion);
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setInput(text);
    setShowSuggestions(false);
    try {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.focus();
        try {
          textarea.selectionStart = textarea.selectionEnd = text.length;
        } catch {}
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      }
    } catch (err) {
      // Non-fatal UI enhancement; ignore errors and let the user type
    }
  };

  // Handle stage initiator card clicks
  const handleStageInitiatorClick = (prompt: string) => {
    // Replace placeholders with actual context data if available
    let processedPrompt = prompt;
    if (projectState.context.subject) {
      processedPrompt = processedPrompt.replace(/\[subject\]/g, projectState.context.subject);
    }
    if (projectState.context.duration) {
      processedPrompt = processedPrompt.replace(/\[duration\]/g, projectState.context.duration);
    }
    
    // Set input and auto-submit
    setInput(processedPrompt);
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      handleSend(processedPrompt);
    }, 50);
  };

  // Handle onboarding skip (dev/debug path)
  const handleOnboardingSkip = useCallback(async () => {
    console.log('[ChatbotFirstInterfaceFixed] Skipping onboarding (debug)');

    const wizardData: Partial<WizardDataV3> = {
      projectTopic: 'Draft Project Exploration',
      projectContext: {
        gradeLevel: 'Middle Years',
        subjects: ['Interdisciplinary'],
        studentCount: 24,
        timeWindow: '4 weeks',
        cadence: 'Weekly',
        availableTech: [],
        availableMaterials: [],
        constraints: [],
        resources: [],
        tier: 'core',
        confidence: 0.5
      },
      bigIdea: 'Students investigate challenges in their community and propose creative solutions.',
      essentialQuestion: 'How can we make a meaningful impact on our local community?',
      learningGoals: [
        'Students will collaborate to identify authentic community needs.',
        'Students will analyze research to justify proposed solutions.'
      ],
      successCriteria: [
        'Solutions align to a clearly defined community need.',
        'Presentations include evidence gathered from multiple sources.'
      ]
    };

    const project = normalizeProjectV3(wizardData as WizardDataV3);
    const derivedDraftId = projectId || `bp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    setLocalWizardData(wizardData);
    setLocalProjectSnapshot(project);
    setProjectState(prev => ({
      ...prev,
      stage: 'BIG_IDEA',
      context: {
        subject: (wizardData.projectContext?.subjects || []).join(', ') || 'Interdisciplinary',
        gradeLevel: wizardData.projectContext?.gradeLevel || 'Middle Years',
        duration: wizardData.projectContext?.timeWindow || '4 weeks',
        location: wizardData.projectContext?.space || 'Classroom',
        materials: (wizardData.projectContext?.availableMaterials || []).join(', ')
      }
    }));

    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: "Welcome! I'm your curriculum design partner. What big idea would you like your students to tackle?",
      timestamp: new Date(),
      metadata: {
        stage: 'BIG_IDEA'
      }
    };
    setMessages([welcomeMessage]);

    try {
      await onStageComplete?.('onboarding', {
        wizardData,
        project,
        draftId: derivedDraftId
      });
    } catch (error) {
      console.error('[ChatbotFirstInterfaceFixed] Failed to persist skip onboarding snapshot:', error);
    }
  }, [onStageComplete, projectId]);

  // Generate progress stages
  const getProgressStages = useCallback((): Stage[] => {
    const stages: Stage[] = [
      {
        id: 'setup',
        label: 'Setup',
        icon: <FileText className="w-5 h-5" />,
        status: projectState.stage === 'BIG_IDEA' ? 'completed' : 'completed', // Setup is complete when we reach BIG_IDEA
        substeps: [
          { id: 'subject', label: 'Subject Area', completed: !!projectState.context.subject },
          { id: 'grade', label: 'Grade Level', completed: !!projectState.context.gradeLevel },
          { id: 'duration', label: 'Project Duration', completed: !!projectState.context.duration }
        ]
      },
      {
        id: 'ideation',
        label: 'Ideation',
        icon: <Lightbulb className="w-5 h-5" />,
        status: ['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE'].includes(projectState.stage) ? 'in-progress' : 
                ['JOURNEY', 'DELIVERABLES', 'COMPLETE'].includes(projectState.stage) ? 'completed' : 'pending',
        substeps: [
          { id: 'bigIdea', label: 'Big Idea', completed: projectState.ideation.bigIdeaConfirmed },
          { id: 'essential', label: 'Essential Question', completed: projectState.ideation.essentialQuestionConfirmed },
          { id: 'challenge', label: 'Challenge', completed: projectState.ideation.challengeConfirmed }
        ]
      },
      {
        id: 'journey',
        label: 'Learning Journey',
        icon: <Map className="w-5 h-5" />,
        status: projectState.stage === 'JOURNEY' ? 'in-progress' : 
                ['DELIVERABLES', 'COMPLETE'].includes(projectState.stage) ? 'completed' : 'pending'
      },
      {
        id: 'deliverables',
        label: 'Deliverables',
        icon: <Target className="w-5 h-5" />,
        status: projectState.stage === 'DELIVERABLES' ? 'in-progress' : 
                projectState.stage === 'COMPLETE' ? 'completed' : 'pending'
      },
      {
        id: 'export',
        label: 'Export',
        icon: <Download className="w-5 h-5" />,
        status: projectState.stage === 'COMPLETE' ? 'completed' : 'pending'
      }
    ];
    
    return stages;
  }, [projectState]);
  
  // Show onboarding if not completed
  if (projectState.stage === 'ONBOARDING') {
    console.log('[ChatbotFirstInterfaceFixed] Showing WizardV3Wrapper for ONBOARDING stage');
    return (
      <div className="min-h-screen relative">
        <WizardV3Wrapper
          projectId={projectId}
          initialData={(projectData as any)?.wizardData as Partial<WizardDataV3>}
          onSkip={handleOnboardingSkip}
          onComplete={async ({ draftId, project, wizardData }) => {
            console.log('[ChatbotFirstInterfaceFixed] WizardV3 completed with project snapshot:', project);

            setLocalWizardData(wizardData);
            setLocalProjectSnapshot(project);

            const subjectList = wizardData?.projectContext?.subjects ?? [];
            const subjectText = Array.isArray(subjectList) && subjectList.length
              ? subjectList.join(', ')
              : wizardData?.projectContext?.primarySubject || '';

            setProjectState(prev => ({
              ...prev,
              stage: 'BIG_IDEA',
              context: {
                subject: subjectText,
                gradeLevel: wizardData?.projectContext?.gradeLevel || '',
                duration: wizardData?.projectContext?.timeWindow || '',
                location: wizardData?.projectContext?.space || '',
                materials: (wizardData?.projectContext?.availableMaterials || []).join(', ')
              }
            }));

            try {
              await onStageComplete?.('onboarding', {
                wizardData,
                project,
                draftId
              });
              console.log('[ChatbotFirstInterfaceFixed] WizardV3 onboarding snapshot persisted');
            } catch (error) {
              console.error('[ChatbotFirstInterfaceFixed] Failed to persist onboarding snapshot:', error);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      
      {/* Mobile Progress Menu Button - Floating, positioned to avoid overlap */}
      <div className="lg:hidden fixed top-20 left-4 z-40" style={{ left: 'max(16px, calc(50% - 400px))' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-soft hover:shadow-soft-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Map className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          )}
        </button>
      </div>
      
      {/* ALF Overview ribbon (dismissible) */}
      {featureFlags.isEnabled('processRibbon') && (
        <ALFProcessRibbon storageKey="alf_ribbon_dismissed_chat" />
      )}
      {featureFlags.isEnabled('firstRunTour') && (
        <TourOverlay storageKey="alf_first_run_tour_chat" />
      )}

      {/* Manual snapshot preview modal - only show when needed */}
      {canExportSnapshot && snapshotShareStatus === 'manual' && snapshotSharePreview && (
        <div className="print-hidden fixed top-20 right-6 z-30 w-80 max-w-sm rounded-xl border border-slate-200 bg-white/95 p-3 text-xs shadow-xl dark:border-slate-700 dark:bg-gray-900/95">
          <div className="mb-2 flex items-center justify-between text-slate-700 dark:text-slate-200">
            <span className="font-semibold">Snapshot preview</span>
            <button
              onClick={dismissSnapshotPreview}
              className="text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-2 text-[11px] text-slate-500 dark:text-slate-400">
            Copy this text manually if clipboard access is blocked.
          </p>
          <textarea
            readOnly
            value={snapshotSharePreview}
            className="h-32 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700 dark:border-slate-700 dark:bg-gray-900 dark:text-slate-200"
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Progress Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-80 max-w-[85vw] h-full bg-white dark:bg-gray-800 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Project Progress</h2>
              </div>
              {useProgressSidebar && (
                <Suspense fallback={null}>
                <ProgressSidebarLazy
                  stages={getProgressStages()}
                  currentStageId={projectState.stage.toLowerCase()}
                  isCollapsed={false}
                  onToggleCollapse={() => {}}
                  onStageClick={(stageId) => {
                    logger.log('Stage clicked:', stageId);
                    setMobileMenuOpen(false);
                  }}
                  className="h-full border-none shadow-none"
                />
                </Suspense>
              )}
            </motion.div>
          </div>
        )}
        
        {/* Desktop Progress Sidebar */}
        {useProgressSidebar && (
          <div className="hidden lg:block lg:w-1/4 lg:max-w-80 xl:w-1/5 xl:max-w-72 flex-shrink-0">
            <Suspense fallback={null}>
            <ProgressSidebarLazy
              stages={getProgressStages()}
              currentStageId={projectState.stage.toLowerCase()}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              onStageClick={(stageId) => logger.log('Stage clicked:', stageId)}
              onEditStage={(stageId) => {
                // STABILIZATION FIX: Prevent backward navigation and validate stage transitions
                const map: Record<string, ProjectState['stage']> = {
                  setup: 'BIG_IDEA',
                  ideation: 'BIG_IDEA',
                  journey: 'JOURNEY',
                  deliverables: 'DELIVERABLES',
                  export: 'COMPLETE'
                } as any;
                const target = map[stageId] || projectState.stage;

                // Prevent going backwards
                if (getStageOrder(target) < getStageOrder(projectState.stage)) {
                  logger.warn('Backward navigation prevented for stability');
                  return;
                }

                // Check if can enter the stage
                if (!canEnterStage(target)) {
                  logger.warn('Cannot enter stage - prerequisites not met');
                  addMessage('assistant', 'Please complete the previous steps before moving forward.');
                  return;
                }

                // Clear confirmation state when changing stages (STABILIZATION FIX)
                setProjectState(prev => ({
                  ...prev,
                  stage: target,
                  messageCountInStage: 0,
                  awaitingConfirmation: null
                }));
                setShowSuggestions(true);
              }}
              className="h-full"
            />
            <div className="hidden lg:block mt-2 px-2">
              <button
                onClick={() => setShowPreview(true)}
                className="w-full text-xs px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Preview Blueprint
              </button>
              <div className="mt-1 text-center">
                {(() => { const miss = getMissingItems(); return miss.length ? (
                  <span className="inline-block text-[11px] text-amber-700 dark:text-amber-300">Missing: {miss.join(', ')}</span>
                ) : (
                  <span className="inline-block text-[11px] text-green-700 dark:text-green-300">Ready to finalize</span>
                ); })()}
              </div>
              {/* Review Checklist Panel */}
              <div className="mt-2 p-2 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Review Checklist</p>
                <div className="space-y-1">
                  {(() => {
                    const items = getMissingItems();
                    if (!items.length) return <p className="text-[11px] text-green-700 dark:text-green-300">All core items set</p>;
                    const jump = (key: string) => {
                      switch (key) {
                        case 'Standards':
                          setProjectState(prev => ({ ...prev, stage: 'STANDARDS', messageCountInStage: 0 }));
                          break;
                        case 'Big Idea':
                          // STABILIZATION FIX: Clear any existing confirmation state when navigating
                          setProjectState(prev => ({ ...prev, stage: 'BIG_IDEA', awaitingConfirmation: null, messageCountInStage: 0 }));
                          break;
                        case 'EQ':
                          // STABILIZATION FIX: Clear any existing confirmation state when navigating
                          setProjectState(prev => ({ ...prev, stage: 'ESSENTIAL_QUESTION', awaitingConfirmation: null, messageCountInStage: 0 }));
                          break;
                        case 'Challenge':
                          // STABILIZATION FIX: Clear any existing confirmation state when navigating
                          setProjectState(prev => ({ ...prev, stage: 'CHALLENGE', awaitingConfirmation: null, messageCountInStage: 0 }));
                          break;
                        case 'Milestones':
                          // STABILIZATION FIX: Clear any existing confirmation state when navigating
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: null, messageCountInStage: 0 }));
                          break;
                        case 'Rubric':
                          // STABILIZATION FIX: Clear any existing confirmation state when navigating
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: null, messageCountInStage: 0 }));
                          break;
                        case 'Artifacts':
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: 'deliverables.artifacts', value: '' } }));
                          break;
                        case 'Checkpoints':
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: 'deliverables.checkpoints.0', value: '' } }));
                          break;
                        default:
                          break;
                      }
                      setShowSuggestions(true);
                    };
                    return items.map(it => (
                      <button key={it} onClick={() => jump(it)} className="w-full text-left text-[11px] text-primary-700 dark:text-primary-300 hover:underline">
                        • {it}
                      </button>
                    ));
                  })()}
                </div>
              </div>
              {aiAssistReferences.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                      AI Assist
                    </p>
                    <span className="text-[10px] text-gray-400">Hero exemplars</span>
                  </div>
                  <div className="space-y-2">
                    {aiAssistReferences.map(ref => (
                      <div key={ref.id} className="rounded-md border border-gray-100 dark:border-gray-700 bg-white/80 dark:bg-gray-900/40 p-2">
                        <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 leading-tight">
                          {ref.title}
                        </p>
                        <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 leading-snug line-clamp-2">
                          Essential Question: {ref.essentialQuestion}
                        </p>
                        {ref.metricHighlights[0] && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-500 mt-1">
                            Impact Focus: {ref.metricHighlights[0].metric} → {ref.metricHighlights[0].target}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {ref.resourceHighlights.slice(0, 2).map((resource, index) => (
                            <span
                              key={`${ref.id}-res-${index}`}
                              className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800 text-[10px] text-primary-700 dark:text-primary-300"
                            >
                              {resource}
                            </span>
                          ))}
                        </div>
                        <a
                          href={`/app/samples/${ref.id}`}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary-600 dark:text-primary-300 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View hero blueprint
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            </Suspense>
          </div>
        )}
      
      {/* Main Chat Area - Unified Layout Container */}
      <div className="flex-1 min-w-0 flex flex-col relative bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Progress Bar with Step Indicator and Copy Summary Button */}
        {projectState.stage !== 'ONBOARDING' && projectState.stage !== 'COMPLETE' && (
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <div className="flex items-center gap-3">
              <span className="text-xs px-3 py-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm font-medium">
                Step {['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'].indexOf(projectState.stage) + 1} of 5
              </span>
              {canExportSnapshot && (
                <button
                  onClick={() => { void handleCopySnapshot(); }}
                  className="print-hidden inline-flex items-center gap-2 rounded-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all duration-200"
                  title="Copy project summary to clipboard"
                >
                  <Clipboard className="h-3 w-3" />
                  <span className="hidden sm:inline">Copy Summary</span>
                  <span className="sm:hidden">Copy</span>
                </button>
              )}
            </div>
            {canExportSnapshot && snapshotShareStatus === 'success' && (
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-200">
                ✓ Copied
              </div>
            )}
            {canExportSnapshot && snapshotShareStatus === 'error' && (
              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm dark:bg-amber-900/30 dark:text-amber-300">
                Clipboard unavailable
              </div>
            )}
          </div>
        )}
        

        {/* Stage Microcopy (Grounding card) */}
        {projectState.stage !== 'ONBOARDING' && getStageMicrocopy(projectState.stage) && (
          <div className="px-4 pt-3">
            {(() => { const mc = getStageMicrocopy(projectState.stage)!; return (
              <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/85 dark:bg-gray-800/85 backdrop-blur" data-testid="stage-guide">
                {/* Mobile header with toggle */}
                <div className="flex items-center justify-between px-3 py-2 md:hidden">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Stage Guide</span>
                  <button
                    onClick={() => {
                      setMobileTipsOpen(v => {
                        const next = !v;
                        try {
                          const key = `stageGuideCollapsed:${projectId || 'unknown'}:${projectState.stage}`;
                          // store '1' for open, '0' for closed
                          localStorage.setItem(key, next ? '1' : '0');
                        } catch {}
                        return next;
                      });
                    }}
                    className="text-xs text-primary-700 dark:text-primary-300 px-2 py-1 rounded hover:bg-primary-50/60 dark:hover:bg-primary-900/10"
                    aria-expanded={mobileTipsOpen}
                    aria-controls="stage-guide-mobile"
                    data-testid="stage-guide-toggle"
                  >
                    {mobileTipsOpen ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div id="stage-guide-mobile" className={`px-3 pb-3 ${mobileTipsOpen ? 'block' : 'hidden md:block'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-[13px]">
                    <div>
                      <div className="text-gray-700 dark:text-gray-200 font-medium">What</div>
                      <div className="text-gray-600 dark:text-gray-300 mt-0.5">{mc.what}</div>
                    </div>
                    <div>
                      <div className="text-gray-700 dark:text-gray-200 font-medium">Why</div>
                      <div className="text-gray-600 dark:text-gray-300 mt-0.5">{mc.why}</div>
                    </div>
                    <div>
                      <div className="text-gray-700 dark:text-gray-200 font-medium">Coach Tip</div>
                      <div className="text-gray-600 dark:text-gray-300 mt-0.5">{mc.tip}</div>
                    </div>
                  </div>
                </div>
              </div>
            ); })()}
          </div>
        )}

        {/* Chat Messages - Full width layout */}
        <div className="flex-1 overflow-y-auto px-4 py-4 safe-top pb-32 lg:pb-4">
          <div className="w-full space-y-3">
            {messages.map((message, index) => (
              <div key={message.id} className="space-y-3">
                {/* Coach Message with Enhanced Layout */}
                {message.role === 'assistant' && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    {/* Coach Avatar & Status - Fixed Positioning */}
                    <div className="flex-shrink-0 mt-2">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700">
                        <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      {/* Clean Stage Indicator */}
                      {message.metadata?.stage && (
                        <div className="mt-2 text-center">
                          <div className="w-6 h-0.5 bg-primary-500 dark:bg-primary-400 rounded-full mx-auto"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block font-medium">
                            {formatStageLabel(message.metadata.stage)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content with Coaching Context */}
                    <div className="flex-1">
                      {/* Stage Progress Context */}
                      {message.metadata?.stage && index === 0 && (
                        <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-l-4 border-primary-400">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                              Working on: {formatStageLabel(message.metadata.stage)}
                            </span>
                            {featureFlags.isEnabled('glossary') && (
                              <span className="ml-1">
                                {message.metadata.stage === 'BIG_IDEA' && <TooltipGlossary term="Big Idea" />}
                                {message.metadata.stage === 'ESSENTIAL_QUESTION' && <TooltipGlossary term="Essential Question" />}
                                {message.metadata.stage === 'CHALLENGE' && <TooltipGlossary term="Challenge" />}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                            Building on your {getWizardData().subjects?.join(', ') || 'project'} context
                          </p>
                        </div>
                      )}
                      
                      {/* Main Message */}
                      <div className="p-5">
                        <Suspense fallback={null}>
                          <MessageRendererLazy content={message.content} role={message.role} />
                        </Suspense>
                      </div>
                      
                      {/* Contextual Encouragement */}
                      {message.metadata?.stage && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Thinking about your {projectState.context.gradeLevel || 'students'}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {/* User Message with Context */}
                {message.role === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-end"
                  >
                    <div className="w-full">
                      {/* User Input Context */}
                      <div className="text-right mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Your {projectState.stage.toLowerCase().replace('_', ' ')} input
                        </span>
                      </div>
                      
                      <div className="border-2 border-primary-500 dark:border-primary-400 text-gray-900 dark:text-gray-100 px-6 py-4 rounded-2xl rounded-tr-sm bg-transparent">
                        <Suspense fallback={null}>
                          <MessageRendererLazy content={message.content} role={message.role} />
                        </Suspense>
                      </div>
                      
                      {/* Build Progress Indicator */}
                      <div className="mt-2 text-right">
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Added to your project design
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Removed the Get Started button - no longer needed */}
                
                {/* Help content can still be shown separately if needed */}
                {showHelpForMessage === message.id && (
                  <div className="mt-3 ml-4">
                    <Suspense fallback={null}>
                      <InlineHelpContentLazy
                        {...getContextualHelp(message.content, projectState.stage)}
                        onDismiss={() => setShowHelpForMessage(null)}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            ))}
            
            {/* Optional inline recap panel (disabled by default in favor of sidebar) */}
            {showInlineRecap && messages.length > 2 && (
              <div className="mt-6 mb-4 bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Layers className="w-3 h-3 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-200">Your Project Taking Shape</h3>
                  <button
                    onClick={() => setRecapExpanded(!recapExpanded)}
                    className="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    aria-expanded={recapExpanded}
                    aria-controls="recap-content"
                  >
                    {recapExpanded ? 'Hide' : 'Show'}
                  </button>
                  <div className="ml-2 flex items-center gap-2">
                    <button
                      onClick={() => { setJourneyExpanded(true); setDeliverablesExpanded(true); }}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Expand all
                    </button>
                    <button
                      onClick={() => { setJourneyExpanded(false); setDeliverablesExpanded(false); }}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Collapse all
                    </button>
                  </div>
                </div>
                <motion.div
                  id="recap-content"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: recapExpanded ? 1 : 0, height: recapExpanded ? 'auto' : 0 }}
                  transition={{ duration: 0.2 }}
                >
                <div className="grid gap-3 md:grid-cols-3">
                  {/* Big Idea Progress */}
                  <div className={`p-3 rounded-xl border-2 transition-all ${
                    projectState.ideation.bigIdeaConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-500' 
                      : projectState.stage === 'BIG_IDEA' 
                        ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-500 ring-1 ring-blue-200 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.bigIdeaConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Big Idea</span>
                      {lastSavedKey === 'ideation.bigIdea' && (
                        <motion.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                          className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          Saved
                        </motion.span>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerAskALF('BIG_IDEA', 'idea');
                            showInfoToast('Here are some Big Idea spark starters');
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                          title="Ask ALF for Big Idea suggestions"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Ask ALF
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {projectState.ideation.bigIdea || 'Conceptual foundation...'}
                    </p>
                    <CardActionBar
                      onAccept={() => handleAcceptIdeation('bigIdea')}
                      onRefine={() => handleRefineIdeation('bigIdea')}
                      onReplace={() => handleReplaceIdeation('bigIdea')}
                      disabled={!projectState.ideation.bigIdea.trim()}
                    />
                  </div>
                  
                  {/* Essential Question Progress */}
                  <div className={`p-3 rounded-xl border-2 transition-all ${
                    projectState.ideation.essentialQuestionConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-500' 
                      : projectState.stage === 'ESSENTIAL_QUESTION' 
                        ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-500 ring-1 ring-blue-200 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.essentialQuestionConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Essential Question</span>
                      {lastSavedKey === 'ideation.essentialQuestion' && (
                        <motion.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                          className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          Saved
                        </motion.span>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerAskALF('ESSENTIAL_QUESTION', 'question');
                            showInfoToast('Here come Essential Question starters');
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                          title="Ask ALF for Essential Question ideas"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Ask ALF
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {projectState.ideation.essentialQuestion || 'Driving inquiry...'}
                    </p>
                    <CardActionBar
                      onAccept={() => handleAcceptIdeation('essentialQuestion')}
                      onRefine={() => handleRefineIdeation('essentialQuestion')}
                      onReplace={() => handleReplaceIdeation('essentialQuestion')}
                      disabled={!projectState.ideation.essentialQuestion.trim()}
                    />
                  </div>
                  
                  {/* Challenge Progress */}
                  <div className={`p-3 rounded-xl border-2 transition-all ${
                    projectState.ideation.challengeConfirmed 
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-500' 
                      : projectState.stage === 'CHALLENGE' 
                        ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-500 ring-1 ring-blue-200 dark:ring-blue-400' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {projectState.ideation.challengeConfirmed ? (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Challenge</span>
                      {lastSavedKey === 'ideation.challenge' && (
                        <motion.span initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}
                          className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          Saved
                        </motion.span>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerAskALF('CHALLENGE', 'challenge');
                            showInfoToast('Here are challenge prompts from ALF');
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                          title="Ask ALF for challenge prompts"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Ask ALF
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {projectState.ideation.challenge || 'Authentic task...'}
                    </p>
                    <CardActionBar
                      onAccept={() => handleAcceptIdeation('challenge')}
                      onRefine={() => handleRefineIdeation('challenge')}
                      onReplace={() => handleReplaceIdeation('challenge')}
                      disabled={!projectState.ideation.challenge.trim()}
                    />
                  </div>
                </div>
                {activeAskALFStage && ['BIG_IDEA','ESSENTIAL_QUESTION','CHALLENGE'].includes(activeAskALFStage) && (
                  <div className="mt-3">
                    <StageSpecificSuggestions
                      stage={activeAskALFStage as string}
                      context={activeAskALFContext ?? composeAskALFContext()}
                      onSelectSuggestion={(suggestion) => {
                        clearAskALFTray();
                        void handleSend(suggestion);
                      }}
                      isVisible={true}
                      showDismiss
                      onDismiss={clearAskALFTray}
                    />
                  </div>
                )}
                
                {/* Clean Progress Connection */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-0.5 w-6 bg-primary-500 dark:bg-primary-400 rounded-full"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Building your project foundation</span>
                    <div className="h-0.5 w-6 bg-primary-500 dark:bg-primary-400 rounded-full"></div>
                  </div>
                </div>

                {/* Journey & Deliverables Compact Controls */}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {/* Journey Plan */}
                  <div className="p-3 rounded-xl border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-1">
                      <Map className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Journey</span>
                      {isJourneyComplete() && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          Saved
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerAskALF('JOURNEY', 'phases');
                            showInfoToast('ALF can suggest journey phases to try');
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                          title="Ask ALF for journey ideas"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Ask ALF
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{getJourneySummary()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        data-testid="journey-toggle"
                        onClick={() => setJourneyExpanded(!journeyExpanded)}
                        className="text-[11px] text-primary-700 dark:text-primary-300 hover:underline"
                      >
                        {journeyExpanded ? 'Hide details' : 'Show details'}
                      </button>
                        <button
                          onClick={() => {
                            const t = 'journey.supports';
                            setProjectState(prev => ({ ...prev, stage: 'JOURNEY', awaitingConfirmation: { type: t, value: '' } }));
                            setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `js-s-${i}`, text: v })) as any);
                            clearAskALFTray();
                            setShowSuggestions(true);
                            showInfoToast('Editing Roles & Scaffolds');
                          }}
                        className="text-[11px] text-primary-700 dark:text-primary-300 hover:underline"
                      >
                        Roles/Scaffolds
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {journeyExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-1">
                          {(['analyze','brainstorm','prototype','evaluate'] as const).map((phase) => {
                            const preview = getJourneyPhasePreview(phase);
                            const saved = lastSavedKey && lastSavedKey.startsWith('journey.' + phase + '.');
                          return (
                              <button
                                data-testid={`journey-line-${phase}`}
                                key={phase}
                                title={'Edit ' + phase}
                                onClick={() => openJourneyPhase(phase)}
                                className="text-left w-full text-[11px] text-gray-600 dark:text-gray-400 hover:underline"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium capitalize">{phase}:</span> {truncate(preview)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {saved && (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                        Saved
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <CardActionBar
                      onAccept={handleAcceptJourney}
                      onRefine={handleRefineJourney}
                      onReplace={handleReplaceJourney}
                      disabled={!(getCurrentProjectSnapshot()?.phases?.length)}
                    />
                    {activeAskALFStage === 'JOURNEY' && (
                      <div className="mt-3">
                        <StageSpecificSuggestions
                          stage="JOURNEY"
                          context={activeAskALFContext ?? composeAskALFContext()}
                          onSelectSuggestion={(suggestion) => {
                            clearAskALFTray();
                            void handleSend(suggestion);
                          }}
                          isVisible={true}
                          showDismiss
                          onDismiss={clearAskALFTray}
                        />
                      </div>
                    )}
                  </div>

                  {/* Deliverables */}
                  <div className="p-3 rounded-xl border bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Deliverables</span>
                      {isDeliverablesComplete() && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                          Saved
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerAskALF('DELIVERABLES', 'deliverables');
                            showInfoToast('ALF queued deliverable templates to explore');
                          }}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                          title="Ask ALF for deliverable ideas"
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> Ask ALF
                        </button>
                        <button
                          data-testid="deliverables-toggle"
                          onClick={() => setDeliverablesExpanded(!deliverablesExpanded)}
                          className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {deliverablesExpanded ? 'Hide details' : 'Show details'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{getDeliverablesSummary()}</p>
                    <AnimatePresence initial={false}>
                      {deliverablesExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 space-y-1">
                          {getDeliverablesPreviewLines().map((line, idx) => {
                            // Map line to section for click target
                            let section: 'milestones'|'rubric'|'impact' = 'milestones';
                            if (line.toLowerCase().startsWith('rubric')) section = 'rubric';
                            if (line.toLowerCase().startsWith('impact')) section = 'impact';
                            const saved = lastSavedKey && lastSavedKey.startsWith('deliverables.' + (section === 'milestones' ? 'milestones' : section === 'rubric' ? 'rubric' : 'impact'));
                            return (
                              <button
                                data-testid={`deliverables-line-${section}`}
                                key={idx}
                                onClick={() => openDeliverablesSection(section)}
                                className="text-left w-full text-[11px] text-gray-600 dark:text-gray-400 hover:underline"
                                title={'Edit ' + section}
                              >
                                <div className="flex items-center justify-between">
                                  <div>{truncate(line)}</div>
                                  <div className="flex items-center gap-2">
                                    {saved && (
                                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                                        Saved
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const t = 'deliverables.milestones.0';
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
                          setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-m-${i}`, text: v })) as any);
                          clearAskALFTray();
                          setShowSuggestions(true);
                          showInfoToast('Editing Milestones');
                        }}
                        className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-900/10"
                        data-testid="deliverables-milestones-edit"
                      >
                        Milestones
                      </button>
                      <button
                        onClick={() => {
                          const t = 'deliverables.rubric.criteria';
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
                          setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-r-${i}`, text: v })) as any);
                          clearAskALFTray();
                          setShowSuggestions(true);
                          showInfoToast('Editing Rubric Criteria');
                        }}
                        className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-900/10"
                        data-testid="deliverables-rubric-edit"
                      >
                        Rubric
                      </button>
                      <button
                        onClick={() => {
                          const t = 'deliverables.impact.audience';
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
                          setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-i-${i}`, text: v })) as any);
                          clearAskALFTray();
                          setShowSuggestions(true);
                          showInfoToast('Editing Impact Plan');
                        }}
                        className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-900/10"
                        data-testid="deliverables-impact-edit"
                      >
                        Impact
                      </button>
                      <button
                        onClick={() => {
                          const t = 'deliverables.artifacts';
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
                          setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-a-${i}`, text: v })) as any);
                          clearAskALFTray();
                          setShowSuggestions(true);
                          showInfoToast('Editing Artifacts');
                        }}
                        className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-900/10"
                        data-testid="deliverables-artifacts-edit"
                      >
                        Artifacts
                      </button>
                      <button
                        onClick={() => {
                          const t = 'deliverables.checkpoints.0';
                          setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
                          setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-cp-${i}`, text: v })) as any);
                          clearAskALFTray();
                          setShowSuggestions(true);
                          showInfoToast('Editing Checkpoints');
                        }}
                        className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-primary-700 dark:text-primary-300 hover:bg-primary-50/60 dark:hover:bg-primary-900/10"
                        data-testid="deliverables-checkpoints-edit"
                      >
                        Checkpoints
                      </button>
                    </div>
                    <CardActionBar
                      onAccept={handleAcceptDeliverables}
                      onRefine={handleRefineDeliverables}
                      onReplace={handleReplaceDeliverables}
                      disabled={!(getCurrentProjectSnapshot()?.milestones?.length)}
                    />
                    {activeAskALFStage === 'DELIVERABLES' && (
                      <div className="mt-3">
                        <StageSpecificSuggestions
                          stage="DELIVERABLES"
                          context={activeAskALFContext ?? composeAskALFContext()}
                          onSelectSuggestion={(suggestion) => {
                            clearAskALFTray();
                            void handleSend(suggestion);
                          }}
                          isVisible={true}
                          showDismiss
                          onDismiss={clearAskALFTray}
                        />
                      </div>
                    )}
                  </div>
                </div>
                </motion.div>
              </div>
            )}
            
            {/* Stage Initiator Cards - Show only when appropriate for the stage */}
            {useStageInitiators && !isTyping && !input.trim() && 
             shouldShowCards(projectState.stage, projectState.messageCountInStage) && (
              <div className="mt-6 mb-6">
                <Suspense fallback={null}>
                  <StageInitiatorCardsLazy
                    currentStage={projectState.stage}
                    onCardClick={handleStageInitiatorClick}
                  />
                </Suspense>
              </div>
            )}
            
            {/* Enhanced Thinking Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                {/* Coach Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-gray-700">
                    <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                
                {/* Thoughtful Processing Indicator */}
                <div className="flex-1">
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce delay-200" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        ALF Coach is thinking...
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="h-1 bg-primary-400 rounded-full w-full opacity-50" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Considering your {projectState.context.gradeLevel || 'students'} and {getWizardData().subjects?.join(', ') || 'project'} context
                      </p>
                    </div>
                  </div>
                  
                  {/* Processing Context */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary-400 rounded-full animate-ping"></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Drawing on PBL expertise and your project goals
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Spacer to ensure last message is visible above input */}
            <div className="h-24" />
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Mobile-Optimized Input Area - Fixed on mobile, aligned on desktop */}
        <div className="fixed lg:relative bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto safe-bottom bg-gray-50 dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          {/* Gradient fade overlay - taller and more opaque */}
          <div className="absolute inset-x-0 -top-20 h-20 pointer-events-none bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50 dark:from-transparent dark:via-gray-900/80 dark:to-gray-900" />
          
          <div className="w-full relative">
            
            {/* Vibrant Suggestion Cards with Icons and Colors */}
            {/* Compact inline recap bar (pill shaped) */}
            {showInlineRecap && (
              featureFlags.getValue('inlineRecapAlways') ||
              lastSavedKey ||
              projectState.awaitingConfirmation
            ) && (
              // Respect minimum message threshold to avoid early noise
              (messages.length >= (featureFlags.getValue('inlineRecapMinMessages') as number)) &&
              <CompactRecapBar
                savedLabel={mapSavedKeyToLabel(lastSavedKey)}
                savedValue={getSavedValueForKey(lastSavedKey)}
                nextLabel={getNextLabel()}
                onNext={() => {
                  const nl = getNextLabel();
                  if (!nl) return;
                  if (nl === 'Essential Question') {
                    setProjectState(prev => ({ ...prev, stage: 'ESSENTIAL_QUESTION', messageCountInStage: 0 }));
                    setShowSuggestions(true);
                  } else if (nl === 'Challenge') {
                    setProjectState(prev => ({ ...prev, stage: 'CHALLENGE', messageCountInStage: 0 }));
                    setShowSuggestions(true);
                  } else if (nl === 'Learning Journey' || nl === 'Continue Journey') {
                    setProjectState(prev => ({ ...prev, stage: 'JOURNEY', messageCountInStage: 0 }));
                    setShowSuggestions(true);
                  } else if (nl === 'Deliverables' || nl === 'Finalize Deliverables') {
                    setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', messageCountInStage: 0 }));
                    setShowSuggestions(true);
                  } else if (nl === 'Export') {
                    void handleCopySnapshot();
                  }
                }}
              />
            )}

            {(showSuggestions || shouldShowAutomaticSuggestions()) && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mb-4"
              >
                {/* Add background to prevent transparency issues */}
                <div className="flex flex-col gap-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl p-3">
                  {/* Small stage indicator */}
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ideas for {projectState.stage.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  </div>
                  {projectState.awaitingConfirmation && (
                    <div className="flex items-center gap-2">
                      <EnhancedButton
                        data-testid="accept-continue"
                        onClick={acceptAndContinue}
                        variant="filled"
                        size="sm"
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        Accept & Continue
                      </EnhancedButton>
                      <EnhancedButton
                        onClick={backOneStep}
                        variant="text"
                        size="sm"
                        leftIcon={<ChevronLeft className="w-4 h-4" />}
                      >
                        Back one step
                      </EnhancedButton>
                      <EnhancedButton onClick={() => setShowSuggestions(true)} variant="outlined" size="sm">
                        More Options
                      </EnhancedButton>
                    </div>
                  )}
                  {projectState.awaitingConfirmation && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      You can refine any step later. Your progress saves automatically.
                    </p>
                  )}

                  {/* Context chips for suggestions */}
                  <div className="mb-2 flex flex-wrap gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                    {(() => { const w = getWizardData(); const chips = [w.subjects?.join(' • ') || '', w.gradeLevel || '', w.projectTopic || '', w.location || ''].filter(Boolean); return chips.map((c,i)=>(<span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">{c}</span>)); })()}
                  </div>

                  {/* Touch-Optimized suggestion cards */}
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={suggestion.id || index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left p-4 min-h-[48px] bg-white/100 dark:bg-gray-800/100 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary-300 dark:hover:border-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/10 focus:outline-none focus:ring-2 focus:ring-blue-300/50 dark:focus:ring-blue-600/40 hover:shadow-md active:scale-[0.98] transition-all duration-200 group touch-manipulation"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                            <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          </div>
                        </div>
                        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {typeof suggestion === 'string' ? suggestion : suggestion.text}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tap to insert — edit before sending.</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            
            {/* Ultra-Compact ChatGPT-Style Input */}
            <div className="relative">
              {/* Single-line input with expanding textarea and inline buttons */}
              <div className={`relative bg-white/95 dark:bg-gray-800 backdrop-blur-sm border border-gray-200/70 dark:border-gray-600 hover:border-primary-400/80 dark:hover:border-primary-400/80 focus-within:border-primary-500 dark:focus-within:border-primary-300 transition-all duration-200`}
                style={{
                  borderRadius: input && input.split('\n').length > 1 ? '24px' : '9999px'
                }}>
                <div className="flex items-center px-4 py-2.5 gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      // Auto-resize like ChatGPT (starts at 1 line, expands to 3, then scrolls)
                      const textarea = e.target;
                      textarea.style.height = '20px';
                      const scrollHeight = textarea.scrollHeight;
                      const newHeight = Math.min(scrollHeight, 60); // max 3 lines at 20px each
                      textarea.style.height = newHeight + 'px';
                      
                      // Smooth transition for border radius based on content
                      const container = textarea.closest('.relative');
                      if (container) {
                        const lines = e.target.value.split('\n').length;
                        const hasMultipleLines = lines > 1 || scrollHeight > 25;
                        container.style.borderRadius = hasMultipleLines ? '24px' : '9999px';
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Message ALF Coach..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-300 text-base leading-6"
                    style={{ 
                      height: '20px', 
                      minHeight: '20px', 
                      maxHeight: '60px',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none'
                    }}
                  />
                  
                  {/* Inline action buttons like ChatGPT */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Ideas button - Touch optimized with circular hover */}
                    <button
                      data-testid="ideas-button"
                      onClick={() => {
                        if (!showSuggestions) {
                          const wizard = getWizardData();
                          const stageSuggestions = getStageSuggestions(projectState.stage, undefined, {
                            subject: projectState.context.subject || wizard.subjects?.join(', '),
                            gradeLevel: projectState.context.gradeLevel || wizard.gradeLevel,
                            projectTopic: wizard.projectTopic,
                            bigIdea: projectState.ideation.bigIdea,
                            essentialQuestion: projectState.ideation.essentialQuestion,
                            challenge: projectState.ideation.challenge
                          });
                          setSuggestions(stageSuggestions);
                        }
                        clearAskALFTray();
                        setShowSuggestions(!showSuggestions);
                      }}
                      disabled={isTyping}
                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
                      title="Get ideas"
                    >
                      <Lightbulb className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    
                    {/* Send button - Touch optimized with circular shape */}
                    <button
                      onClick={handleSend}
                      disabled={isTyping || !input.trim()}
                      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed active:scale-95 touch-manipulation ${
                        input.trim() 
                          ? 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm' 
                          : 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* aria-live region for assistive feedback */}
      <div className="sr-only" aria-live="polite">
        {lastSavedKey ? 'Saved' : ''}
      </div>

      {/* Contextual Help Panel */}
      <Suspense fallback={null}>
      <ContextualHelpLazy
        stage={projectState.stage}
        isOpen={showContextualHelp}
        onClose={() => setShowContextualHelp(false)}
      />
      </Suspense>

      <BlueprintPreviewModal open={showPreview} onClose={() => setShowPreview(false)} blueprint={projectData} />
    </div>
    </div>
  );
};

export default ChatbotFirstInterfaceFixed;
