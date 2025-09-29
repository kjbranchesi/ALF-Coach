/**
 * ChatbotFirstInterfaceFixed.tsx
 * 
 * ACTUALLY WORKING chat interface with real AI integration
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion */

import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, FileText, Lightbulb, Map, Target, Download, Sparkles, Layers, X, Check, ChevronLeft, Clipboard } from 'lucide-react';
import { InputArea } from './InputArea';
import { SuggestionPanel } from './SuggestionPanel';
import { MessagesList } from './MessagesList';
import { StageGuideCard } from './StageGuideCard';
// Use default export to avoid potential TDZ with named re-exports in optimized bundles
const ProgressSidebarLazy = lazy(() => import('./ProgressSidebar'));
const InlineHelpContentLazy = lazy(() => import('./UIGuidanceSystemV2'));
const StageInitiatorCardsLazy = lazy(() => import('./StageInitiatorCards'));
const MessageRendererLazy = lazy(() => import('./MessageRenderer'));
import { EnhancedButton } from '../ui/EnhancedButton';
const WizardV3WrapperLazy = lazy(() =>
  import('../../features/wizard/WizardV3Wrapper').then(m => ({ default: m.WizardV3Wrapper }))
);
import type { WizardDataV3 } from '../../features/wizard/wizardSchema';
import type { ProjectV3, Milestone, Scaffold, Checkpoint, Phase } from '../../types/alf';
import { normalizeProjectV3 } from '../../utils/normalizeProject';
const ContextualHelpLazy = lazy(() => import('./ContextualHelp'));
import { GeminiService } from '../../services/GeminiService';
import { buildPrompt as buildChatPrompt } from '../../services/ChatPromptBuilder';
import { useFeatureFlag, featureFlags } from '../../utils/featureFlags';
import { useChatEngine } from '../../hooks/useChatEngine';
// Removed unused StateManager import
import { logger } from '../../utils/logger';
import { getContextualHelp } from '../../utils/helpContent';
import { getStageSuggestions, type Suggestion as StageSuggestion } from '../../utils/suggestionContent';
import { selectDiverseSuggestionsBalanced } from '../../services/SuggestionSelector';
import { shouldShowCards } from '../../utils/conversationFramework';
import { getConfirmationStrategy, generateConfirmationPrompt, checkForProgressSignal, checkForRefinementSignal } from '../../utils/confirmationFramework';
import { isConfusedSignal, isProgressSignal, hasJourneyContent as hasJourneyText, hasDeliverablesContent as hasDeliverablesText } from '../../utils/stageTransitions';
import { FlowOrchestrator } from '../../services/FlowOrchestrator';
import { TooltipGlossary } from '../ui/TooltipGlossary';
import { CompactRecapBar } from './CompactRecapBar';
import { BlueprintPreviewModal } from '../preview/BlueprintPreviewModal';
import { queryHeroPromptReferences } from '../../ai/context/heroContext';
import { buildWizardSnapshot, copySnapshotPreview, buildSnapshotSharePreview } from '../../utils/wizardExport';
import { mergeWizardData } from '../../utils/draftMerge';
import { StageSpecificSuggestions } from './StageSpecificSuggestions';
import { CardActionBar } from '../../features/wizard/components/CardActionBar';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { heroProjectTransformer } from '../../services/HeroProjectTransformer';

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

type SuggestionEntry = StageSuggestion;

// Select up to `max` suggestions prioritizing category diversity across
// core, cross, moonshot, student-led; fall back gracefully.
const selectDiverseSuggestions = (items: SuggestionEntry[], max: number = 3): SuggestionEntry[] => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const preferredOrder = ['core', 'cross', 'moonshot', 'student-led'] as const;
  const byCategory = new Map<string, SuggestionEntry[]>();
  for (const s of items) {
    const cat = (s as any).category || 'core';
    const list = byCategory.get(cat) || [];
    list.push(s);
    byCategory.set(cat, list);
  }
  const picked: SuggestionEntry[] = [];
  // First pass: one per preferred category order
  for (const cat of preferredOrder) {
    const list = byCategory.get(cat);
    if (list && list.length) {
      picked.push(list.shift()!);
      if (picked.length >= max) return picked;
    }
  }
  // Second pass: fill from remaining items while avoiding duplicates
  const seen = new Set(picked.map(p => p.id || p.text));
  for (const arr of byCategory.values()) {
    for (const s of arr) {
      const key = s.id || s.text;
      if (!seen.has(key)) {
        picked.push(s);
        seen.add(key);
        if (picked.length >= max) return picked;
      }
    }
  }
  return picked.slice(0, max);
};

const SYSTEM_PROMPT = `You are a master PBL educator and curriculum design coach helping teachers create powerful project-based learning experiences.

YOUR COACHING PHILOSOPHY:
- Be a thinking partner, not a validator or tester
- Expand teacher understanding while maintaining momentum
- Provide expert insights that help teachers see the "why" behind good PBL
- Balance educational guidance with practical progress
- Always acknowledge teacher input positively before offering expertise

EXPERT COACHING APPROACH:
1. ACKNOWLEDGE: Start by recognizing what's valuable in their thinking
2. EDUCATE: Share brief expert insight about what makes this element powerful
3. ENHANCE: Offer gentle ways to strengthen their idea (if needed)
4. ADVANCE: Create clear momentum toward the next step

Current Stage: {stage}
Teacher Context: {context}
Progress So Far: {progressSummary}

{stageInstructions}

TONE: Collaborative expert who educates while coaching. Think "working with a master teacher colleague" not "taking a test."

Teacher's input: "{userInput}"

Generate a response that acknowledges their thinking, provides expert insight about this stage of PBL design, and creates momentum toward completion.`;

interface ChatProjectPayload {
  projectData?: ProjectV3 | null;
  wizardData?: Partial<WizardDataV3> | null;
  capturedData?: Record<string, unknown> | null;
}

interface ChatbotFirstInterfaceFixedProps {
  projectId?: string;
  projectData?: ChatProjectPayload | null;
  onStageComplete?: (stage: string, data: unknown) => void;
  onNavigate?: (view: string, projectId?: string) => void;
}

export const ChatbotFirstInterfaceFixed: React.FC<ChatbotFirstInterfaceFixedProps> = ({ 
  projectId, 
  projectData, 
  onStageComplete,
  onNavigate: _onNavigate 
}) => {
  const engine = useChatEngine({ initialMessages: [] as any });
  const inputRef = engine.inputRef as any;
  const input = engine.state.input as any;
  const setInput = engine.setInput as any;
  const isTyping = engine.state.isTyping as any;
  const setIsTyping = engine.setTyping as any;
  const lastInteractionTimeRef = useRef(Date.now());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHelpForMessage, setShowHelpForMessage] = useState<string | null>(null);
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const showSuggestions = engine.state.showSuggestions as any;
  const [suggestions, setSuggestions] = useState<SuggestionEntry[]>([]);
  const [activeAskALFStage, setActiveAskALFStage] = useState<ProjectState['stage'] | null>(null);
  const [activeAskALFContext, setActiveAskALFContext] = useState<{
    subject?: string;
    gradeLevel?: string;
    projectTopic?: string;
    bigIdea?: string;
    essentialQuestion?: string;
    challenge?: string;
  } | null>(null);
  const [automaticSuggestionsHidden, setAutomaticSuggestionsHidden] = useState(false);
  const [lastSuggestionStage, setLastSuggestionStage] = useState<string>('');
  const [lastSavedKey, setLastSavedKey] = useState<string | null>(null);
  const [recapExpanded, setRecapExpanded] = useState(true);
  const [journeyExpanded, setJourneyExpanded] = useState(false);
  const [deliverablesExpanded, setDeliverablesExpanded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [standardsDraft, setStandardsDraft] = useState<{ framework: string; items: { code: string; label: string; rationale: string }[] }>({ framework: '', items: [{ code: '', label: '', rationale: '' }] });

  // Render messages source: reducer when refactored, local otherwise
  const currentMessages: Message[] = engine.state.messages as any;
  const messageCount = currentMessages.length;
  
  // Store wizard data locally to avoid race condition with projectData updates
  const [localWizardData, setLocalWizardData] = useState<Partial<WizardDataV3> | null>(null);
  const [localProjectSnapshot, setLocalProjectSnapshot] = useState<ProjectV3 | null>(null);
  const [snapshotShareStatus, setSnapshotShareStatus] = useState<'idle' | 'success' | 'error' | 'manual'>('idle');
  const [snapshotSharePreview, setSnapshotSharePreview] = useState<string | null>(null);

  const generateRuntimeId = useCallback((prefix: string) => {
    return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
  }, []);

  const getCurrentProjectSnapshot = useCallback(() => {
    return localProjectSnapshot || ((projectData)?.projectData as ProjectV3 | null) || null;
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
    () => mergeWizardData((projectData)?.wizardData ?? null, localWizardData),
    [projectData, localWizardData]
  );
  const canExportSnapshot = Boolean(wizardSnapshotSource && Object.keys(wizardSnapshotSource).length > 0);

  useEffect(() => {
    if (!localProjectSnapshot && (projectData)?.projectData) {
      setLocalProjectSnapshot((projectData).projectData as ProjectV3);
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
  // Refactored chat UI is the default; legacy flag removed
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

    // Prioritize main wizard fields over nested projectContext fields
    const subjects: string[] = Array.isArray((source as any).subjects)
      ? (source as any).subjects
      : Array.isArray((projectContext).subjects)
        ? (projectContext).subjects
        : [];

    const gradeLevel: string = (source as any).gradeLevel || (projectContext).gradeLevel || '';

    // Map duration enum to user-friendly string
    const durationRaw = (source as any).duration || (projectContext).timeWindow || '';
    const durationLabels = {
      'short': '2-3 weeks',
      'medium': '4-8 weeks',
      'long': 'Semester'
    };
    const duration = durationLabels[durationRaw as keyof typeof durationLabels] || durationRaw;

    const location: string = (projectContext).space || (source as any).location || '';

    const materialItems = Array.isArray((source as any).materials)
      ? (source as any).materials
      : Array.isArray((projectContext).availableMaterials)
        ? (projectContext).availableMaterials
        : typeof (source as any).materials === 'string'
          ? [(source as any).materials]
          : [];

    const materials = Array.isArray(materialItems)
      ? materialItems.filter(Boolean).join(', ')
      : typeof materialItems === 'string'
        ? materialItems
        : '';

    // Handle learningGoals properly - can be string or array
    const learningGoalsRaw = (source as any).learningGoals;
    const learningGoalsArray = Array.isArray(learningGoalsRaw)
      ? learningGoalsRaw.map(goal => {
          if (typeof goal === 'string') {return goal;}
          if (goal && typeof (goal).text === 'string') {return (goal).text;}
          return '';
        }).filter(Boolean)
      : typeof learningGoalsRaw === 'string'
        ? learningGoalsRaw.split(/\n+/).filter(Boolean)
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
      specialRequirements: (source as any).specialRequirements || ((projectContext).constraints || []).join(', '),
      specialConsiderations: (source as any).specialConsiderations || '',
      pblExperience: (source as any).pblExperience || 'some',
      projectContext
    };
  };

  // Standardize wizard data access with comprehensive fallback
  const getWizardData = () => {
    const rawWizard = localWizardData || (projectData)?.wizardData || {};
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

  // Enhanced data persistence with UnifiedStorageManager
  const saveProjectData = useCallback(async (updatedData: any) => {
    if (!projectId) {return;}

    try {
      const existingProject = await unifiedStorage.loadProject(projectId);
      const mergedData = {
        ...existingProject,
        ...updatedData,
        capturedData: {
          ...existingProject?.capturedData,
          chatState: projectState,
          // Persist current chat messages from reducer state
          messages: currentMessages
        },
        updatedAt: new Date()
      };

      await unifiedStorage.saveProject(mergedData);
      console.log('[ChatbotFirstInterfaceFixed] Project data saved with UnifiedStorageManager');
    } catch (error: any) {
      console.error('[ChatbotFirstInterfaceFixed] Failed to save project data:', error);

      // Handle Firebase permissions specifically
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.warn('[ChatbotFirstInterfaceFixed] Firebase permissions issue during auto-save - data saved locally');
        // Don't show toast for auto-save permission errors to avoid spam
      } else if (error?.code === 'unauthenticated') {
        console.warn('[ChatbotFirstInterfaceFixed] Authentication required for cloud sync - data saved locally');
      } else {
        console.error('[ChatbotFirstInterfaceFixed] Unexpected auto-save error:', error);
      }
    }
  }, [projectId, projectState, currentMessages]);

  // Auto-save project state changes
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (projectId && projectState) {
        saveProjectData({});
      }
    }, 2000); // Auto-save every 2 seconds

    return () => clearTimeout(saveTimer);
  }, [projectState, saveProjectData]);

  // ENHANCED stage validation with detailed feedback
  const canEnterStage = useCallback((targetStage: ProjectState['stage']) => {
    switch(targetStage) {
      case 'ESSENTIAL_QUESTION':
        return !!projectState.ideation.bigIdea && projectState.ideation.bigIdea.trim().length > 10;
      case 'CHALLENGE':
        return !!projectState.ideation.bigIdea && projectState.ideation.bigIdea.trim().length > 10 &&
               !!projectState.ideation.essentialQuestion && projectState.ideation.essentialQuestion.trim().length > 10;
      case 'JOURNEY':
        return !!projectState.ideation.bigIdea && projectState.ideation.bigIdea.trim().length > 10 &&
               !!projectState.ideation.essentialQuestion && projectState.ideation.essentialQuestion.trim().length > 10 &&
               !!projectState.ideation.challenge && projectState.ideation.challenge.trim().length > 15;
      case 'DELIVERABLES':
        return !!projectState.ideation.bigIdea && projectState.ideation.bigIdea.trim().length > 10 &&
               !!projectState.ideation.essentialQuestion && projectState.ideation.essentialQuestion.trim().length > 10 &&
               !!projectState.ideation.challenge && projectState.ideation.challenge.trim().length > 15;
      default:
        return true;
    }
  }, [projectState.ideation]);

  // Get validation message for why a stage cannot be entered
  const getStageValidationMessage = useCallback((targetStage: ProjectState['stage']): string => {
    switch(targetStage) {
      case 'ESSENTIAL_QUESTION':
        if (!projectState.ideation.bigIdea || projectState.ideation.bigIdea.trim().length <= 10) {
          return 'Please define a substantial Big Idea (at least 10 characters) before moving to Essential Question.';
        }
        break;
      case 'CHALLENGE':
        if (!projectState.ideation.bigIdea || projectState.ideation.bigIdea.trim().length <= 10) {
          return 'Please define a Big Idea before moving to Challenge.';
        }
        if (!projectState.ideation.essentialQuestion || projectState.ideation.essentialQuestion.trim().length <= 10) {
          return 'Please define an Essential Question before moving to Challenge.';
        }
        break;
      case 'JOURNEY':
        if (!projectState.ideation.bigIdea || projectState.ideation.bigIdea.trim().length <= 10) {
          return 'Please define a Big Idea before planning the Learning Journey.';
        }
        if (!projectState.ideation.essentialQuestion || projectState.ideation.essentialQuestion.trim().length <= 10) {
          return 'Please define an Essential Question before planning the Learning Journey.';
        }
        if (!projectState.ideation.challenge || projectState.ideation.challenge.trim().length <= 15) {
          return 'Please define a substantial Challenge before planning the Learning Journey.';
        }
        break;
      case 'DELIVERABLES':
        if (!projectState.ideation.bigIdea || projectState.ideation.bigIdea.trim().length <= 10) {
          return 'Please complete all ideation steps before defining Deliverables.';
        }
        if (!projectState.ideation.essentialQuestion || projectState.ideation.essentialQuestion.trim().length <= 10) {
          return 'Please complete all ideation steps before defining Deliverables.';
        }
        if (!projectState.ideation.challenge || projectState.ideation.challenge.trim().length <= 15) {
          return 'Please complete all ideation steps before defining Deliverables.';
        }
        break;
    }
    return 'Please complete the previous steps before continuing.';
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
      if (currentStage === 'BIG_IDEA' && !confirmationType.includes('bigIdea')) {shouldClear = true;}
      if (currentStage === 'ESSENTIAL_QUESTION' && !confirmationType.includes('essentialQuestion')) {shouldClear = true;}
      if (currentStage === 'CHALLENGE' && !confirmationType.includes('challenge')) {shouldClear = true;}
      if (currentStage === 'JOURNEY' && !confirmationType.includes('journey')) {shouldClear = true;}
      if (currentStage === 'DELIVERABLES' && !confirmationType.includes('deliverables')) {shouldClear = true;}
      if (currentStage === 'GROUNDING' || currentStage === 'IDEATION_INTRO' || currentStage === 'COMPLETE') {shouldClear = true;}

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
  }, [messageCount]);

  // Small helper to append a message consistently
  const addMessage = useCallback((role: 'assistant'|'user'|'system', content: string, metadata?: any) => {
    const msg: Message = { id: String(Date.now() + Math.floor(Math.random()*1000)), role, content, timestamp: new Date(), metadata };
    engine.appendMessage(msg as any);
  }, [engine]);

  const pushMessage = useCallback((msg: Message) => {
    engine.appendMessage(msg as any);
  }, [engine]);

  const replaceMessages = useCallback((arr: Message[]) => {
    engine.setMessages(arr as any);
  }, [engine]);

  // Persist last opened step for resume on dashboard
  useEffect(() => {
    try {
      if (projectId && projectState?.stage) {
        void unifiedStorage.saveProject({ id: projectId, lastOpenedStep: projectState.stage, stage: projectState.stage });
      }
    } catch {}
  }, [projectId, projectState.stage]);
  
  // Initialize with proper welcome message - only if not showing onboarding
  useEffect(() => {
    console.log('[ChatbotFirstInterfaceFixed] Welcome message useEffect triggered', {
      stage: projectState.stage,
      messagesLength: messageCount,
      hasLocalWizardData: !!localWizardData,
      hasProjectData: !!projectData?.wizardData
    });
    
    const wizard = getWizardData();
    
    // Show welcome message when stage changes to BIG_IDEA (from wizard completion)
    if (projectState.stage === 'BIG_IDEA' && messageCount === 0) {
      console.log('[ChatbotFirstInterfaceFixed] Stage changed to BIG_IDEA, initializing welcome message with context:', wizard);
      
      // Build rich context from wizard data
      const contextSubject = wizard.subjects?.join(' & ') || projectState.context.subject || 'your subject area';
      const contextGrade = wizard.gradeLevel || projectState.context.gradeLevel || 'your students';
      const contextTopic = wizard.projectTopic || 'an engaging project';
      const contextGoals = (wizard.learningGoals || '').trim();
      const contextLocation = (wizard.location || '').trim();
      const contextDuration = wizard.duration || projectState.context.duration || 'this project';
      
      // Prime contextual suggestions immediately
      try {
        const stageSuggestions = getStageSuggestions('BIG_IDEA', undefined, {
          subject: contextSubject,
          gradeLevel: contextGrade,
          projectTopic: contextTopic,
          bigIdea: projectState.ideation.bigIdea,
          essentialQuestion: projectState.ideation.essentialQuestion,
          challenge: projectState.ideation.challenge
        });
        setSuggestions(stageSuggestions);
        engine.toggleSuggestions(true);
      } catch {}

      let welcomeContent = '';
      
      if (wizard.subjects?.length > 0 || wizard.projectTopic) {
        // Enhanced welcome with full wizard context
        if (wizard.projectTopic) {
          const locationLine = contextLocation ? ` in ${contextLocation}` : '';
          welcomeContent = `Welcome. We’ll shape a ${contextDuration} ${contextSubject} project for ${contextGrade}${locationLine}.
Your starting idea: “${wizard.projectTopic}”.

First, let’s capture the Big Idea — the transferable concept students will understand. What theme best fits this direction?`;
        } else {
          welcomeContent = `Welcome. We’ll shape a ${contextDuration} ${contextSubject} project for ${contextGrade}.

First, let’s capture the Big Idea — a clear theme that grounds the work. What concept do you want students to understand deeply?`;
        }
      } else {
        // Fallback welcome
        welcomeContent = `Welcome. Let’s create a project that matters for your students.

To begin, what’s the Big Idea — a concise theme that gives the project focus?`;
      }
      
      // Prefer AI-first welcome when enabled; fall back to contextual text
      const run = async () => {
        try {
          const aiEnabled = (import.meta as any)?.env?.VITE_GEMINI_ENABLED === 'true';
          if (aiEnabled) {
            setIsTyping(true);
            const prompt = generateAIPrompt('Let’s begin with the Big Idea.');
            const content = await geminiService.current.generateResponse(prompt, { temperature: 0.6, maxTokens: 400 });
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content,
              timestamp: new Date(),
              metadata: { stage: 'BIG_IDEA' }
            };
            replaceMessages([welcomeMessage]);
          } else {
            const welcomeMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: welcomeContent,
              timestamp: new Date(),
              metadata: { stage: 'BIG_IDEA' }
            };
            replaceMessages([welcomeMessage]);
          }
        } catch (e) {
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            role: 'assistant',
            content: welcomeContent,
            timestamp: new Date(),
            metadata: { stage: 'BIG_IDEA' }
          };
          replaceMessages([welcomeMessage]);
        } finally {
          setIsTyping(false);
          console.log('[ChatbotFirstInterfaceFixed] Welcome message set (AI or fallback), chat should be visible');
        }
      };
      void run();
    }
  }, [projectState.stage, projectState.context, messageCount, localWizardData, projectData?.wizardData]);

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
      engine.toggleSuggestions(true);
      const assistantMessage: Message = {
        id: String(Date.now() + 2),
        role: 'assistant',
        content: promptForJourneyAwaiting(firstType),
        timestamp: new Date(),
        metadata: { stage: 'JOURNEY' }
      };
      pushMessage(assistantMessage);
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
      engine.toggleSuggestions(true);
      const assistantMessage: Message = {
        id: String(Date.now() + 5),
        role: 'assistant',
        content: promptForDeliverablesAwaiting(firstType),
        timestamp: new Date(),
        metadata: { stage: 'DELIVERABLES' }
      };
      pushMessage(assistantMessage);
    }
  }, [projectState.stage]);
  
  // Generate contextual AI prompt using centralized builder
  const generateAIPrompt = (userInput: string): string => {
    const wizard = getWizardData();
    const ideation = projectData?.ideation || projectState.ideation;
    return buildChatPrompt({
      stage: projectState.stage as any,
      wizard: {
        subjects: wizard.subjects || [],
        gradeLevel: wizard.gradeLevel,
        duration: wizard.duration,
        location: wizard.location,
        projectTopic: wizard.projectTopic,
        materials: wizard.materials,
      },
      ideation: {
        bigIdea: ideation.bigIdea || '',
        essentialQuestion: ideation.essentialQuestion || '',
        challenge: ideation.challenge || '',
      },
      messageCountInStage: projectState.messageCountInStage,
      awaitingConfirmation: projectState.awaitingConfirmation as any,
      userInput,
    });
  };

  // Toggle Suggestions helper (shared by InputArea and actions)
  const handleToggleIdeas = useCallback(() => {
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
    engine.toggleSuggestions();
  }, [showSuggestions, getWizardData, projectState.context.subject, projectState.context.gradeLevel, projectState.ideation, clearAskALFTray, engine]);
  
  // Framework for when suggestions should appear automatically
  const shouldShowAutomaticSuggestions = () => {
    // Don't show if user manually hid them
    if (automaticSuggestionsHidden) {return false;}
    
    // Don't show if already showing manually
    if (showSuggestions) {return false;}
    
    // Don't show if typing
    if (isTyping) {return false;}
    
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
    if (have.length === 0) {return 'No phases planned yet';}
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
    if (projectState.stage !== 'STANDARDS') {return;}
    const cd = getCaptured();
    const framework = cd['standards.framework'] || '';
    const list = cd['standards.list'] ? (() => { try { return JSON.parse(cd['standards.list']); } catch { return []; } })() : [];
    if (framework || (Array.isArray(list) && list.length)) {
      setStandardsDraft({ framework, items: Array.isArray(list) && list.length ? list : standardsDraft.items });
    }
  }, [projectState.stage, projectData?.capturedData]);

  const getMissingItems = () => {
    const cd = getCaptured();
    const missing: string[] = [];
    // Standards are optional - don't mark as missing
    if (!cd['ideation.bigIdea']) {missing.push('Big Idea');}
    if (!cd['ideation.essentialQuestion']) {missing.push('EQ');}
    if (!cd['ideation.challenge']) {missing.push('Challenge');}
    if (!cd['deliverables.rubric.criteria']) {missing.push('Rubric');}
    if (!cd['deliverables.milestones.0']) {missing.push('Milestones');}
    if (!cd['deliverables.artifacts']) {missing.push('Artifacts');}
    if (!cd['deliverables.checkpoints.0']) {missing.push('Checkpoints');}
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
    if (goal) {parts.push(goal);}
    if (activity) {parts.push(activity);}
    if (output) {parts.push(output);}
    if (duration) {parts.push(duration);}
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
      if (ms.length) {lines.push(`Milestones: ${ms.join(' • ')}`);}
      if (cd['deliverables.rubric.criteria']) {lines.push(`Rubric: ${cd['deliverables.rubric.criteria']}`);}
      const aud = cd['deliverables.impact.audience'];
      const meth = cd['deliverables.impact.method'];
      if (aud || meth) {lines.push(`Impact: ${aud || 'audience TBD'} • ${meth || 'method TBD'}`);}
    }
    return lines.length ? lines : ['No details yet'];
  };

  const aiAssistReferences = useMemo(() => {
    const wizard = getWizardData();
    const subjectSet = new Set<string>();
    (wizard.subjects || []).forEach(sub => sub && subjectSet.add(sub));
    if (wizard.projectTopic) {subjectSet.add(wizard.projectTopic);}
    if (projectState.context.subject) {subjectSet.add(projectState.context.subject);}

    const gradeSet = new Set<string>();
    if (wizard.gradeLevel) {gradeSet.add(wizard.gradeLevel);}
    if (projectState.context.gradeLevel) {gradeSet.add(projectState.context.gradeLevel);}

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
    if (!key) {return undefined;}
    if (key.startsWith('ideation.')) {
      if (key.endsWith('bigIdea')) {return 'Big Idea';}
      if (key.endsWith('essentialQuestion')) {return 'Essential Question';}
      if (key.endsWith('challenge')) {return 'Challenge';}
    }
    if (key.startsWith('journey.')) {return 'Learning Journey';}
    if (key.startsWith('deliverables.')) {return 'Deliverables';}
    return undefined;
  };

  const getSavedValueForKey = (key: string | null): string | undefined => {
    if (!key) {return undefined;}
    if (key === 'ideation.bigIdea') {return projectState.ideation.bigIdea;}
    if (key === 'ideation.essentialQuestion') {return projectState.ideation.essentialQuestion;}
    if (key === 'ideation.challenge') {return projectState.ideation.challenge;}
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
    const t = (`journey.${  phase  }.goal`) as const;
    setProjectState(prev => ({ ...prev, stage: 'JOURNEY', awaitingConfirmation: { type: t, value: '' } }));
    setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `js-open-${  i}`, text: v })) as any);
    engine.toggleSuggestions(true);
    showInfoToast(`Editing ${  phase}`);
  };

  const openDeliverablesSection = (section: 'milestones'|'rubric'|'impact') => {
    let t: string = 'deliverables.milestones.0';
    if (section === 'rubric') {t = 'deliverables.rubric.criteria';}
    if (section === 'impact') {t = 'deliverables.impact.audience';}
    setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
    setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-open-${  i}`, text: v })) as any);
    engine.toggleSuggestions(true);
    showInfoToast(`Editing ${  section}`);
  };

  const truncate = (s: string, n: number = 80) => (s && s.length > n ? `${s.slice(0, n - 1)  }…` : s);
  
  // Show subtle completion feedback
  const showStageCompletionCelebration = (stageName: string) => {
    // Minimal, professional progress feedback
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50';
    notification.innerHTML = `
      <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-md shadow-sm">
        <div class="flex items-center gap-1.5">
          <svg class="w-3 h-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <p class="text-xs font-normal">${stageName} saved</p>
        </div>
      </div>
    `;
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    document.body.appendChild(notification);

    // Fade in
    requestAnimationFrame(() => {
      notification.style.transition = 'all 0.2s ease-out';
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    });

    // Remove after 2 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      setTimeout(() => notification.remove(), 200);
    }, 2000);
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
      const referenceMilestones = (projectPatch.milestones) ?? existingProject?.milestones ?? [];

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

    // Try to save to backend with Firebase permissions error handling
    try {
      onStageComplete?.(stageKey, payload);
      console.log('[Data Save] Saved to backend:', {
        key: capturedDataKey,
        value: value,
        stageLabel: stageLabel
      });
    } catch (error: any) {
      console.error('[Data Save] Failed to save to backend:', error);

      // Handle Firebase permissions specifically
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        console.warn('[Data Save] Firebase permissions issue, continuing with local save only');
        showInfoToast(`${stageLabel} saved locally. Check your connection and permissions.`);
      } else if (error?.code === 'unauthenticated') {
        console.warn('[Data Save] Authentication required for cloud sync, continuing with local save only');
        showInfoToast(`${stageLabel} saved locally. Sign in to enable cloud sync.`);
      } else {
        console.error('[Data Save] Unexpected save error:', error);
        showInfoToast(`${stageLabel} saved locally (sync issue).`);
      }
    }

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
      const textarea = document.querySelector('textarea');
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
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    });
  };

  const handleReplaceJourney = () => {
    clearAskALFTray();
    const firstType = 'journey.analyze.goal';
    setProjectState(prev => ({ ...prev, stage: 'JOURNEY', awaitingConfirmation: { type: firstType, value: '' } }));
    setSuggestions(getMicrostepSuggestions(firstType).map((t, i) => ({ id: `js-reset-${i}`, text: t })) as any);
    engine.toggleSuggestions(true);
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
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    });
  };

  const handleReplaceDeliverables = () => {
    clearAskALFTray();
    const t = 'deliverables.milestones.0';
    setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', awaitingConfirmation: { type: t, value: '' } }));
    setSuggestions(getMicrostepSuggestions(t).map((v, i) => ({ id: `ds-reset-${i}`, text: v })) as any);
    engine.toggleSuggestions(true);
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
    if (!awaiting) {return;}

    if (awaiting === 'journey') {
      const previous = 'journey.evaluate.duration';
      // Clear previous value so user can re-enter
      saveToBackend(previous.replace('journey.', ''), '', 'Learning Journey');
      setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
      setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `js-prev-${i}`, text: t })) as any);
      engine.toggleSuggestions(true);
      const prompt = promptForJourneyAwaiting(previous);
      pushMessage({ id: String(Date.now() + 25), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'JOURNEY' } } as any);
      showInfoToast('Previous step cleared');
      return;
    }
    if (awaiting === 'deliverables') {
      const previous = 'deliverables.impact.method';
      saveToBackend(previous.replace('deliverables.', ''), '', 'Deliverables');
      setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
      setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `ds-prev-${i}`, text: t })) as any);
      engine.toggleSuggestions(true);
      const prompt = promptForDeliverablesAwaiting(previous);
      pushMessage({ id: String(Date.now() + 26), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'DELIVERABLES' } } as any);
      showInfoToast('Previous step cleared');
      return;
    }
    if (awaiting.startsWith('journey.')) {
      const previous = prevJourneyAwaitingType(awaiting);
      if (previous) {
        saveToBackend(previous.replace('journey.', ''), '', 'Learning Journey');
        setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: previous, value: '' } }));
        setSuggestions(getMicrostepSuggestions(previous).map((t, i) => ({ id: `js-prev-${i}`, text: t })) as any);
        engine.toggleSuggestions(true);
        const prompt = promptForJourneyAwaiting(previous);
        pushMessage({ id: String(Date.now() + 27), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'JOURNEY' } } as any);
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
        engine.toggleSuggestions(true);
        const prompt = promptForDeliverablesAwaiting(previous);
        pushMessage({ id: String(Date.now() + 28), role: 'assistant', content: prompt, timestamp: new Date(), metadata: { stage: 'DELIVERABLES' } } as any);
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
    if (subIdx > 0) {return `journey.${phase}.${journeySubsteps[subIdx - 1]}`;}
    const phaseIdx = journeyPhases.indexOf(phase as any);
    if (phaseIdx > 0) {return `journey.${journeyPhases[phaseIdx - 1]}.duration`;}
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
    if (idx > 0) {return deliverablesSequence[idx - 1];}
    return null;
  };

  // Helper function to detect if input is conversational/greeting rather than substantive
  const isConversationalInput = (input: string): boolean => {
    const conversationalPatterns = [
      // Greetings
      'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
      // Polite responses
      'please', 'thank you', 'thanks', 'you\'re welcome', 'no problem',
      // Acknowledgments
      'ok', 'okay', 'alright', 'sure', 'yes', 'yeah', 'yep', 'no', 'nope',
      // Filler words/phrases
      'um', 'uh', 'well', 'so', 'like', 'you know', 'i mean',
      // Single word responses
      'cool', 'nice', 'great', 'awesome', 'perfect', 'right', 'correct',
      // Questions about the system
      'what should i do', 'what do you need', 'what\'s next', 'how does this work'
    ];

    const normalizedInput = input.toLowerCase().trim();

    // Check for exact matches or if input starts/ends with these patterns
    return conversationalPatterns.some(pattern =>
      normalizedInput === pattern ||
      normalizedInput.startsWith(`${pattern  } `) ||
      normalizedInput.endsWith(` ${  pattern}`) ||
      normalizedInput.includes(` ${  pattern  } `)
    );
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
        if (plan.celebrateLabel) {showStageCompletionCelebration(plan.celebrateLabel);}
        if (plan.save) {saveToBackend(plan.save.stageKey, plan.save.value, plan.save.label);}
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
    const seemsConfused = isConfusedSignal(userInput);
    
    // Look for explicit progression signals (from guide section 5)
    const progressionSignals = [
      'sounds good', 'let\'s continue', 'what\'s next', 'next step',
      'i\'m ready', 'that works', 'perfect', 'great', 'yes, let\'s',
      'let\'s move on', 'i like that', 'that\'s it', 'exactly'
    ];
    const wantsToProgress = isProgressSignal(userInput);
    
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
      
      // ENHANCED: Only capture actual big ideas with semantic validation
      const hasMinimumLength = userInput.trim().length >= 15; // Require more substantial input
      const forceAccept = projectState.messageCountInStage >= 5; // Increase threshold before force-accepting

      // EXPANDED clarification/conversation patterns - be more restrictive
      const clarificationPatterns = [
        'what?', 'huh?', 'what do you mean', 'can you explain', 'i don\'t understand',
        'help', 'what', 'how', 'why', 'unclear', 'confused', 'what is', 'tell me more',
        'i need help', 'can you help', 'not sure', 'don\'t know', 'hmm', 'ok', 'okay',
        'yes', 'no', 'maybe', 'sure', 'thanks', 'thank you', 'got it', 'i see',
        'sounds good', 'makes sense', 'understood', 'right', 'correct', 'exactly',
        'that\'s right', 'perfect', 'great', 'awesome', 'cool', 'nice', 'good',
        'interesting', 'wow', 'oh', 'ah', 'hmm', 'uh', 'um', 'well', 'so',
        'actually', 'but', 'however', 'although', 'though', 'yet', 'still'
      ];

      // SEMANTIC validation - check if input looks like a concept/topic
      const conceptualKeywords = [
        'concept', 'idea', 'theme', 'topic', 'principle', 'theory', 'framework',
        'system', 'process', 'method', 'approach', 'strategy', 'solution',
        'innovation', 'design', 'development', 'creation', 'exploration',
        'investigation', 'research', 'study', 'analysis', 'understanding'
      ];

      const hasConceptualLanguage = conceptualKeywords.some(keyword =>
        userInput.toLowerCase().includes(keyword)
      );

      const seemsLikeClarification = clarificationPatterns.some(pattern =>
        userInput.toLowerCase().trim() === pattern ||
        userInput.toLowerCase().includes(pattern)
      );

      const isConversational = isConversationalInput(userInput);

      // STRICT validation - must pass multiple checks
      const isLikelyBigIdea = hasMinimumLength &&
                            !seemsLikeClarification &&
                            !isConversational &&
                            (hasConceptualLanguage || userInput.includes(' ') && userInput.split(' ').length >= 3);

      // Don't auto-progress unless we're confident this is a big idea
      if (!isLikelyBigIdea && !forceAccept) {
        console.log('[Stage Transition] Input does not meet big idea criteria:', {
          length: userInput.trim().length,
          hasConceptualLanguage,
          seemsLikeClarification,
          isConversational,
          messageCount: projectState.messageCountInStage,
          input: userInput.slice(0, 50) + (userInput.length > 50 ? '...' : '')
        });
        return;
      }

      // REQUIRE CONFIRMATION instead of auto-progressing
      if (isLikelyBigIdea || forceAccept) {
        console.log('[Stage Transition] Setting up big idea confirmation:', { bigIdea: userInput });

        // Set up confirmation state instead of auto-progressing
        setProjectState(prev => ({
          ...prev,
          awaitingConfirmation: {
            type: 'bigIdea',
            value: userInput
          }
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
      if (hasJourneyText(userInput)) {
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

          // Trigger Hero Project transformation
          if (projectId) {
            heroProjectTransformer.transformProject(projectId, 'comprehensive')
              .then(() => console.log('[ChatbotFirstInterfaceFixed] Hero Project transformation complete'))
              .catch(err => console.error('[ChatbotFirstInterfaceFixed] Hero Project transformation failed:', err));
          }
          
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
      if (hasDeliverablesText(userInput)) {
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
    // Read the freshest value directly from the DOM to avoid stale state
    const currentValue = inputRef.current?.value ?? input;
    const textToSend = textOverride ?? currentValue;
    if (!textToSend.trim()) {return;}
    
    lastInteractionTimeRef.current = Date.now();
    
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
    
    pushMessage(userMessage);
    const userInput = textToSend;
    // Clear input state and DOM value
    setInput('');
    try { if (inputRef.current) { inputRef.current.value = ''; inputRef.current.style.height = '20px'; } } catch {}
    setIsTyping(true);
    
    // Check if user is asking for ideas/examples
    const askingForIdeas = [
      'ideas', 'examples', 'suggestions', 'options', 'help me think',
      'not sure', 'give me', 'show me', 'what are some', 'can you suggest'
    ].some(phrase => userInput.toLowerCase().includes(phrase));
    
    try {
      // Ultra‑reliable offline/local path when AI proxy isn't enabled
      const aiEnabled = (import.meta as any)?.env?.VITE_GEMINI_ENABLED === 'true';
      if (!aiEnabled) {
        const wizard = getWizardData();
        const context = {
          subject: wizard.subjects?.join(', ') || projectState.context.subject || 'your subject area',
          gradeLevel: wizard.gradeLevel || projectState.context.gradeLevel || 'your students',
          projectTopic: wizard.projectTopic || '',
          bigIdea: projectState.ideation.bigIdea,
          essentialQuestion: projectState.ideation.essentialQuestion,
          challenge: projectState.ideation.challenge
        };
        const local = selectDiverseSuggestionsBalanced(getStageSuggestions(projectState.stage, undefined, context) as any, 3);
        const preface =
          projectState.stage === 'BIG_IDEA' ? `Here are Big Idea themes for your ${context.subject} group:` :
          projectState.stage === 'ESSENTIAL_QUESTION' ? `Here are Essential Questions that fit your context:` :
          projectState.stage === 'CHALLENGE' ? `Here are authentic challenge ideas to get moving:` :
          `Here are ideas to move this step forward:`;
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: preface,
          timestamp: new Date(),
          metadata: { stage: projectState.stage, suggestions: local as any, showSuggestions: true }
        };
        pushMessage(assistantMessage);
        setSuggestions(local as any);
        engine.toggleSuggestions(true);
        setIsTyping(false);
        return;
      }
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
          engine.toggleSuggestions(true);
          const prompt = promptForJourneyAwaiting(nextType);
          const assistantMessage: Message = {
            id: String(Date.now() + 3),
            role: 'assistant',
            content: prompt,
            timestamp: new Date(),
            metadata: { stage: 'JOURNEY' }
          };
          pushMessage(assistantMessage);
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
          pushMessage(assistantMessage);
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
          engine.toggleSuggestions(true);
          const prompt = promptForDeliverablesAwaiting(nextType);
          const assistantMessage: Message = {
            id: String(Date.now() + 6),
            role: 'assistant',
            content: prompt,
            timestamp: new Date(),
            metadata: { stage: 'DELIVERABLES' }
          };
          pushMessage(assistantMessage);
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
          pushMessage(assistantMessage);
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
        pushMessage(assistantMessage);
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
        pushMessage(assistantMessage);
        setIsTyping(false);
        return;
      }

      if (projectState.awaitingConfirmation?.type?.startsWith('deliverables.checkpoints')) {
        // Save current checkpoint entry, then advance index
        const awaitingType = projectState.awaitingConfirmation.type; // e.g., deliverables.checkpoints.0
        const saveKey = awaitingType.replace('deliverables.', ''); // checkpoints.0
        saveToBackend(saveKey, textToSend, 'Deliverables');
        // Advance to next checkpoint index
        const parts = awaitingType.split('.');
        const nextIdx = String((parseInt(parts[2] || '0', 10) || 0) + 1);
        const nextType = `deliverables.checkpoints.${nextIdx}`;
        setProjectState(prev => ({ ...prev, awaitingConfirmation: { type: nextType, value: '' } }));
        setSuggestions(getMicrostepSuggestions(nextType).map((t, i) => ({ id: `ds-cp-${i}`, text: t })) as any);
        engine.toggleSuggestions(true);
        const prompt = promptForDeliverablesAwaiting(nextType);
        const assistantMessage: Message = {
          id: String(Date.now() + 6),
          role: 'assistant',
          content: `${prompt  }\n(Type "done" any time to stop adding checkpoints.)`,
          timestamp: new Date(),
          metadata: { stage: 'DELIVERABLES' }
        };
        pushMessage(assistantMessage);
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
          const suggestions = selectDiverseSuggestionsBalanced(stageSuggestions as any, 3);
          setSuggestions(suggestions as any);
          engine.toggleSuggestions(true);
          
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
              suggestions: suggestions as any,
              showSuggestions: true
            }
          };
          pushMessage(assistantMessage);
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
      
      pushMessage(assistantMessage);
    } catch (error) {
      logger.error('AI response failed:', error);
      
      // Fallback message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, I'm having trouble processing that. Could you rephrase or tell me more about what you're looking for?",
        timestamp: new Date()
      };
      
      pushMessage(errorMessage as any);
    } finally {
      setIsTyping(false);
    }
  };

  // Accept & Continue helper – accelerates micro-steps and confirmations
  const acceptAndContinue = useCallback(() => {
    const awaiting = projectState.awaitingConfirmation?.type || '';
    if (!awaiting) {return;}

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
      
      // Set suggestions (diverse) and show them
      setSuggestions(selectDiverseSuggestionsBalanced(stageSuggestions as any, 3) as any);
      engine.toggleSuggestions(true);
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
    engine.toggleSuggestions(false);

    setProjectState(prev => ({
      ...prev,
      stage,
      awaitingConfirmation: undefined,
      messageCountInStage: 0
    }));

    window.requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)  }px`;
      }
    });
  }, [composeAskALFContext]);
  
  // Handle suggestion selection - Fixed to work properly
  const handleSuggestionSelect = (suggestion: string) => {
    console.log('[Suggestion Selected]:', suggestion);
    // Add the suggestion to the input
    setInput(suggestion);
    engine.toggleSuggestions(false); // Also hide the main suggestions panel
    
    // Focus the textarea (not input)
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      // Auto-resize after setting value
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)  }px`;
    }
  };
  
  // Handle suggestion click - insert and auto-send
  const handleSuggestionClick = (suggestion: any) => {
    console.log('[Suggestion Clicked - Auto-send]:', suggestion);
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text;
    setInput(text);
    try { if (inputRef.current) { inputRef.current.value = text; } } catch {}
    engine.toggleSuggestions(false);
    try {
      const textarea = inputRef.current || (document.querySelector('textarea') as HTMLTextAreaElement | null);
      if (textarea) {
        textarea.focus();
        try {
          textarea.selectionStart = textarea.selectionEnd = text.length;
        } catch {}
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    } catch (err) {
      // Non-fatal UI enhancement; ignore errors and let the user type
    }
    // Auto-send using the stabilized handler
    void handleSend(text);
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
    replaceMessages([welcomeMessage]);

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
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="h-10 w-10 rounded-full border-2 border-primary-300 border-t-transparent animate-spin" />
                <span>Loading wizard…</span>
              </div>
            </div>
          }
        >
          <WizardV3WrapperLazy
            projectId={projectId}
            initialData={(projectData)?.wizardData as Partial<WizardDataV3>}
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
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full max-h-full overflow-hidden bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      
      {/* Mobile Progress Menu Button - Subtle floating button */}
      <div className="lg:hidden fixed top-20 left-4 z-40" style={{ left: 'max(16px, calc(50% - 400px))' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {mobileMenuOpen ? (
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <Map className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
      
      {/* Removed ALF ribbon and tour overlay to prioritize chat interface space */}

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

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
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
        
        {/* Desktop Progress Sidebar - Reduced size when collapsed */}
        {useProgressSidebar && (
          <div className={`hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:w-12' : 'lg:w-64'}`}>
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

                // Check if can enter the stage with detailed validation message
                if (!canEnterStage(target)) {
                  const validationMessage = getStageValidationMessage(target);
                  logger.warn('Cannot enter stage - prerequisites not met:', validationMessage);
                  addMessage('assistant', validationMessage);
                  return;
                }

                // Clear confirmation state when changing stages (STABILIZATION FIX)
                setProjectState(prev => ({
                  ...prev,
                  stage: target,
                  messageCountInStage: 0,
                  awaitingConfirmation: null
                }));
                engine.toggleSuggestions(true);
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
                    if (!items.length) {return <p className="text-[11px] text-green-700 dark:text-green-300">All core items set</p>;}
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
                    engine.toggleSuggestions(true);
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
      <div className="flex-1 min-w-0 min-h-0 flex flex-col relative bg-gradient-to-br from-gray-50 via-gray-50 to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Subtle Progress Indicator - Minimized visual prominence */}
        {projectState.stage !== 'ONBOARDING' && projectState.stage !== 'COMPLETE' && (
          <div className="flex items-center justify-between px-4 pt-1 pb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 bg-gray-100/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 rounded-md border border-gray-200/50 dark:border-gray-700/50 font-normal">
                {['BIG_IDEA', 'ESSENTIAL_QUESTION', 'CHALLENGE', 'JOURNEY', 'DELIVERABLES'].indexOf(projectState.stage) + 1}/5
              </span>
              {canExportSnapshot && (
                <button
                  onClick={() => { void handleCopySnapshot(); }}
                  className="print-hidden inline-flex items-center gap-1 rounded-md bg-gray-100/60 dark:bg-gray-800/40 px-2 py-1 text-[10px] font-normal text-gray-500 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200"
                  title="Copy project summary to clipboard"
                >
                  <Clipboard className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">Copy</span>
                </button>
              )}
            </div>
            {canExportSnapshot && snapshotShareStatus === 'success' && (
              <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 text-[10px] font-normal text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                ✓ Copied
              </div>
            )}
            {canExportSnapshot && snapshotShareStatus === 'error' && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-[10px] font-normal text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50">
                Clipboard unavailable
              </div>
            )}
          </div>
        )}
        

        {/* Stage Guide - Minimal Context Card */}
        {projectState.stage !== 'ONBOARDING' && getStageMicrocopy(projectState.stage) && (
          <div className="px-4 pt-1">
            {(() => { const mc = getStageMicrocopy(projectState.stage)!; return (
              <StageGuideCard
                microcopy={mc}
                open={mobileTipsOpen}
                onToggle={() => {
                  setMobileTipsOpen(v => {
                    const next = !v;
                    try {
                      const key = `stageGuideCollapsed:${projectId || 'unknown'}:${projectState.stage}`;
                      localStorage.setItem(key, next ? '1' : '0');
                    } catch {}
                    return next;
                  });
                }}
              />
            ); })()}
          </div>
        )}

        {/* Gating hint: explain why next stage is disabled */}
        {(() => {
          const nextMap: Record<string,string> = {
            'BIG_IDEA': 'ESSENTIAL_QUESTION',
            'ESSENTIAL_QUESTION': 'CHALLENGE',
            'CHALLENGE': 'JOURNEY',
            'JOURNEY': 'DELIVERABLES'
          };
          const next = nextMap[projectState.stage];
          if (!next) return null;
          const can = canEnterStage(next as any);
          if (can) return null;
          const reason = getStageValidationMessage(next as any);
          return (
            <div className="px-4 pt-1">
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {reason}
              </div>
            </div>
          );
        })()}

        {/* Chat Messages - Full width layout */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 safe-top pb-24 sm:pb-24">
          <div className="w-full space-y-3">
            <MessagesList messages={currentMessages as any} />
          </div>
          {/* Optional inline recap panel (disabled by default in favor of sidebar) */}
            {showInlineRecap && messageCount > 2 && (
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
                            engine.toggleSuggestions(true);
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
                            const saved = lastSavedKey && lastSavedKey.startsWith(`journey.${  phase  }.`);
                          return (
                              <div
                                data-testid={`journey-line-${phase}`}
                                key={phase}
                                className="text-left w-full text-[11px] text-gray-600 dark:text-gray-400"
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
                              </div>
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
                            if (line.toLowerCase().startsWith('rubric')) {section = 'rubric';}
                            if (line.toLowerCase().startsWith('impact')) {section = 'impact';}
                            const saved = lastSavedKey && lastSavedKey.startsWith(`deliverables.${  section === 'milestones' ? 'milestones' : section === 'rubric' ? 'rubric' : 'impact'}`);
                            return (
                              <button
                                data-testid={`deliverables-line-${section}`}
                                key={idx}
                                onClick={() => openDeliverablesSection(section)}
                                className="text-left w-full text-[11px] text-gray-600 dark:text-gray-400 hover:underline"
                                title={`Edit ${  section}`}
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
                    {/* Simplified editing interface - Use the main action buttons below */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Use "Refine" below to modify specific sections
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
              <div className="mt-6 mb-6 max-h-80 overflow-auto rounded-xl">
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
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ALF Coach is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Spacer to ensure last message is visible above input */}
            <div className="h-16 sm:h-20" />
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Chat Input Area - Always visible */}
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-3 py-2 sm:px-4 sm:py-3 border-t border-gray-200 dark:border-gray-800">
          {/* Gradient fade overlay - responsive height */}
          <div className="absolute inset-x-0 -top-10 sm:-top-16 h-10 sm:h-16 pointer-events-none bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50 dark:from-transparent dark:via-gray-900/80 dark:to-gray-900" />
          
          <div className="w-full relative">
            
            {/* Vibrant Suggestion Cards with Icons and Colors */}
            {/* Compact inline recap bar (pill shaped) */}
            {showInlineRecap && (
              featureFlags.getValue('inlineRecapAlways') ||
              lastSavedKey ||
              projectState.awaitingConfirmation
            ) && (
              // Respect minimum message threshold to avoid early noise
              (messageCount >= (featureFlags.getValue('inlineRecapMinMessages') as number)) &&
              <CompactRecapBar
                savedLabel={mapSavedKeyToLabel(lastSavedKey)}
                savedValue={getSavedValueForKey(lastSavedKey)}
                nextLabel={getNextLabel()}
                onNext={() => {
                  const nl = getNextLabel();
                  if (!nl) {return;}
                  if (nl === 'Essential Question') {
                    setProjectState(prev => ({ ...prev, stage: 'ESSENTIAL_QUESTION', messageCountInStage: 0 }));
                    engine.toggleSuggestions(true);
                  } else if (nl === 'Challenge') {
                    setProjectState(prev => ({ ...prev, stage: 'CHALLENGE', messageCountInStage: 0 }));
                    engine.toggleSuggestions(true);
                  } else if (nl === 'Learning Journey' || nl === 'Continue Journey') {
                    setProjectState(prev => ({ ...prev, stage: 'JOURNEY', messageCountInStage: 0 }));
                    engine.toggleSuggestions(true);
                  } else if (nl === 'Deliverables' || nl === 'Finalize Deliverables') {
                    setProjectState(prev => ({ ...prev, stage: 'DELIVERABLES', messageCountInStage: 0 }));
                    engine.toggleSuggestions(true);
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
                <SuggestionPanel
                  suggestions={(suggestions as any).slice(0, 3)}
                  stageLabel={`Ideas for ${projectState.stage.replace(/_/g, ' ').toLowerCase()}`}
                  onSelect={(s) => handleSuggestionClick(s)}
                />
              </motion.div>
            )}
            
            
            {/* Ultra-Compact ChatGPT-Style Input (refactored component always on) */}
            <InputArea
              value={input}
              onChange={setInput}
              onSend={() => handleSend()}
              onToggleIdeas={handleToggleIdeas}
              inputRef={inputRef}
              disabled={isTyping}
              onEscape={() => engine.toggleSuggestions(false)}
              lastUserMessage={(() => {
                for (let i = messageCount - 1; i >= 0; i--) {
                  if (currentMessages[i].role === 'user') return currentMessages[i].content;
                }
                return '';
              })()}
            />
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
  );
};

export default ChatbotFirstInterfaceFixed;
