import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useChatEngine } from '../../hooks/useChatEngine';
import { MessagesList } from '../../components/chat/MessagesList';
import { InputArea } from '../../components/chat/InputArea';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { SuggestionChips } from './components/SuggestionChips';
import { AIStatus } from './components/AIStatus';
import { FirebaseStatus } from './components/FirebaseStatus';
import { WorkingDraftSidebar } from './components/WorkingDraftSidebar';
import { ResponsiveSidebar, StatusIndicator, type SystemStatus, type ResponsiveSidebarControls } from './components/minimal';
import { SyncStatusChip } from './components/SyncStatusChip';
import { CompactStageStepper } from './components/CompactStageStepper';
import { useResponsiveLayout } from './hooks';
import { trackEvent } from '../../utils/analytics';
import { DeliverablesPreviewCard } from './components/DeliverablesPreviewCard';
import { JourneyBoard, type JourneyPhaseDraft } from './components/JourneyBoard';
import { PhaseEditorDrawer } from './components/PhaseEditorDrawer';
import { DecisionBar } from './components/DecisionBar';
import { PhaseDetailExpander } from './components/PhaseDetailExpander';
import { buildStagePrompt, buildCorrectionPrompt, buildSuggestionPrompt } from './domain/prompt';
import { scoreIdeationSpecificity, nextQuestionFor } from './domain/specificityScorer';
import { generateAI } from './domain/ai';
import {
  type CapturedData,
  type Stage,
  stageGuide,
  stageSuggestions,
  validate,
  nextStage,
  computeStatus,
  createEmptyCaptured,
  captureStageInput,
  serializeCaptured,
  hydrateCaptured,
  deriveCurrentStage,
  transitionMessageFor,
  stageOrder,
  dynamicSuggestions,
  summarizeCaptured
} from './domain/stages';
import { assessStageInput } from './domain/inputQuality';
import { detectIntent, getImmediateAcknowledgment, extractFromConversationalWrapper, type UserIntent } from './domain/intentDetection';
import { suggestionTracker } from './domain/suggestionTracking';
import { generateSmartJourney } from './domain/journeyTemplate';
import {
  initDeliverablesMicroFlow,
  formatDeliverablesSuggestion,
  handleDeliverablesChoice,
  getDeliverablesActionChips,
  type DeliverablesMicroState
} from './domain/deliverablesMicroFlow';
import { generateCourseDescription, generateTagline, verifyDescriptionQuality } from './domain/courseDescriptionGenerator';
import { generateProjectShowcase } from './domain/projectShowcaseGenerator';
import { getPostCaptureCoaching, getStageGuidance } from './domain/coachingResponses';
import { resolveGradeBand, gradeBandRules, type GradeBandKey, type GradeBandRule } from '../../ai/gradeBandRules';

type ChatProjectPayload = {
  wizardData?: any | null;
  projectData?: any | null;
  capturedData?: Record<string, unknown> | null;
};

const stageDisplayNames: Record<Stage, string> = {
  BIG_IDEA: 'Big Idea',
  ESSENTIAL_QUESTION: 'Essential Question',
  CHALLENGE: 'Challenge',
  JOURNEY: 'Learning Journey',
  DELIVERABLES: 'Deliverables'
};

type DeliverablesChoiceResult = ReturnType<typeof handleDeliverablesChoice>;

export function ChatMVP({
  projectId,
  projectData,
  showIntro = false,
}: {
  projectId?: string;
  projectData?: ChatProjectPayload | null;
  showIntro?: boolean;
}) {
  const navigate = useNavigate();
  const engine = useChatEngine({ initialMessages: [] });
  const { isMobile } = useResponsiveLayout();
  const [stage, setStage] = useState<Stage>('BIG_IDEA');
  const [stageTurns, setStageTurns] = useState(0);
  const [captured, setCaptured] = useState<CapturedData>(createEmptyCaptured());
  const [initialized, setInitialized] = useState(false);
  const [hasInput, setHasInput] = useState(false);
  const [autosaveEnabled, setAutosaveEnabled] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);
  const [aiStatus, setAiStatus] = useState<'unknown' | 'checking' | 'online' | 'error'>('checking');
  const [aiDetail, setAiDetail] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [firebaseStatus, setFirebaseStatus] = useState<'online' | 'offline' | 'error'>('online');
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showWorkingDraft, setShowWorkingDraft] = useState(true); // Working Draft sidebar visibility
  const [conversationHistory, setConversationHistory] = useState<string[]>([]); // Last 5 user inputs for context
  const [deliverablesMicroState, setDeliverablesMicroState] = useState<DeliverablesMicroState | null>(null);
  const [, setMicroFlowActionChips] = useState<string[]>([]); // Retained setter for legacy micro-flow compatibility
  const [mode, setMode] = useState<'drafting' | 'refining' | 'validating'>('drafting');
  const [focus, setFocus] = useState<'ideation' | 'journey' | 'deliverables' | 'overview'>('ideation');
  const [showKickoffPanel, setShowKickoffPanel] = useState(false); // Show kickoff only on stage transitions
  // Tracks if kickoff panel was auto-opened (so we can auto-close it after a short delay)
  const kickoffAutoOpenRef = useRef(false);
  const [showBrief, setShowBrief] = useState(true);
  const [suppressNextAckUntil, setSuppressNextAckUntil] = useState<number | null>(null);
  const [journeyReceipt, setJourneyReceipt] = useState<{ phaseCount: number; timestamp: number } | null>(null);
  const [deliverablesReceipt, setDeliverablesReceipt] = useState<{ milestoneCount: number; artifactCount: number; criteriaCount: number; timestamp: number } | null>(null);
  const [showPhaseAI, setShowPhaseAI] = useState(false);
  const [completionState, setCompletionState] = useState<'idle' | 'processing' | 'ready' | 'error'>(() => {
    const meta = (projectData?.projectData as any)?.status ?? (projectData as any)?.status;
    return meta === 'ready' ? 'ready' : 'idle';
  });
  const greetingSentRef = useRef(false);
  const nameSuggestionSentRef = useRef(false);
  const sidebarControlsRef = useRef<ResponsiveSidebarControls | null>(null);
  const stageIndex = stageOrder.indexOf(stage);
  const projectStatus = useMemo(() => computeStatus(captured), [captured]);
  const journeyV2Enabled = useMemo(() => (import.meta.env.VITE_FEATURE_STUDIO_JOURNEY_V2 ?? 'true') !== 'false', []);

  const wizard = useMemo(() => {
    const w = projectData?.wizardData || {};
    const subjects: string[] = Array.isArray(w.projectContext?.subjects) ? w.projectContext.subjects : (w.subjects || []);
    return {
      subjects,
      gradeLevel: w.projectContext?.gradeLevel || w.gradeLevel || '',
      duration: w.projectContext?.timeWindow || w.duration || '',
      location: w.projectContext?.space || w.location || '',
      projectTopic: w.projectTopic || '',
      materials: Array.isArray(w.projectContext?.availableMaterials) ? w.projectContext.availableMaterials.join(', ') : w.materials || '',
      pblExperience: w.pblExperience || 'some'
    } as const;
  }, [projectData]);

  // Accept suggestion directly (capture + validate + advance or ask follow-up)
  const acceptSuggestion = useCallback(async (text: string, index?: number) => {
    try {
      const recent = suggestionTracker.getMostRecent(5);
      if (typeof index === 'number' && recent[index]) {
        suggestionTracker.recordSelection(recent[index].id);
      }

      const updatedCaptured = captureStageInput(captured, stage, text);
      setCaptured(updatedCaptured);

      const gatingInfo = validate(stage, updatedCaptured);
      // For ideation, guide with targeted follow-up if not complete
      if (!gatingInfo.ok && (stage === 'BIG_IDEA' || stage === 'ESSENTIAL_QUESTION' || stage === 'CHALLENGE')) {
        const { score, missing } = scoreIdeationSpecificity(stage as any, updatedCaptured, wizard);
        const band = resolveGradeBand(wizard.gradeLevel);
        const follow = nextQuestionFor('CHALLENGE', missing, band);
        const ack = score >= 40 ? 'Nice—this is getting clearer.' : 'Good start.';
        engine.appendMessage({ id: String(Date.now() + 1), role: 'assistant', content: follow ? `${ack} ${follow.question}` : `${ack} Tell me a bit more so we can lock this in.`, timestamp: new Date() } as any);
        if (follow?.chips?.length) {
          setAiSuggestions(follow.chips);
          setShowIdeas(true);
        }
        return;
      }

      if (gatingInfo.ok) {
        const transition = transitionMessageFor(stage, updatedCaptured, wizard);
        if (transition) {
          engine.appendMessage({ id: String(Date.now() + 2), role: 'assistant', content: transition, timestamp: new Date() } as any);
        }
        if (!autosaveEnabled) {setAutosaveEnabled(true);}        
        const nxt = nextStage(stage);
        if (nxt) {
          setStage(nxt);
          setStageTurns(0);
          setHasInput(false);
        }
      }
    } catch (e) {
      console.error('[ChatMVP] acceptSuggestion failed:', e);
    }
  }, [captured, stage, wizard, autosaveEnabled, engine]);
  const deliverablesComplete = useMemo(() => {
    const milestones = captured.deliverables?.milestones?.length ?? 0;
    const artifacts = captured.deliverables?.artifacts?.length ?? 0;
    const criteria = captured.deliverables?.rubric?.criteria?.length ?? 0;
    return milestones >= 3 && artifacts >= 1 && criteria >= 3;
  }, [captured.deliverables]);
  const [journeyDraft, setJourneyDraft] = useState<JourneyPhaseDraft[]>([]);
  const [journeyEditingPhaseId, setJourneyEditingPhaseId] = useState<string | null>(null);
  const journeyInitializedRef = useRef(false);
  // Footer sizing so the composer never requires a tiny scroll to appear
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerHeight, setFooterHeight] = useState(0);


  const messages = engine.state.messages as any[];
  const totalMessages = messages.length;
  const messageCountInStage = stageTurns;
  const experienceLevel: 'new' | 'some' | 'experienced' = wizard.pblExperience === 'new'
    ? 'new'
    : wizard.pblExperience === 'experienced'
      ? 'experienced'
      : 'some';
  const hasWizardName = Boolean((projectData?.wizardData as any)?.projectName);
  const gradeBandKey: GradeBandKey | null = useMemo(() => resolveGradeBand(wizard.gradeLevel), [wizard.gradeLevel]);
  const gradeBandLabel = gradeBandKey ?? 'unknown';

  const normalizePhaseDraft = useCallback((phase: Partial<JourneyPhaseDraft> & { name?: string; activities?: string[]; id?: string; focus?: string; checkpoint?: string }, index: number): JourneyPhaseDraft => ({
    id: phase.id || `phase-${index + 1}`,
    name: phase.name?.trim() || `Phase ${index + 1}`,
    focus: phase.focus ? phase.focus : '',
    activities: Array.isArray(phase.activities) ? phase.activities.filter(Boolean) : [],
    checkpoint: phase.checkpoint ? phase.checkpoint : ''
  }), []);

  const buildSuggestedPhases = useCallback((): JourneyPhaseDraft[] => {
    const suggestions = generateSmartJourney(captured, wizard);
    return suggestions.map((phase, index) => normalizePhaseDraft({
      id: `suggest-${index + 1}`,
      name: phase.name,
      focus: phase.summary,
      activities: phase.activities,
      checkpoint: ''
    }, index));
  }, [captured, wizard, normalizePhaseDraft]);

  const handleJourneyRename = useCallback((id: string, nextName: string) => {
    setJourneyDraft(prev => prev.map(phase => (phase.id === id ? { ...phase, name: nextName } : phase)));
  }, []);

  const handleJourneyReorder = useCallback((from: number, to: number) => {
    setJourneyDraft(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const handleJourneyAddPhase = useCallback(() => {
    setJourneyDraft(prev => [
      ...prev,
      {
        id: `phase-${Date.now()}`,
        name: `New phase ${prev.length + 1}`,
        focus: '',
        activities: [],
        checkpoint: ''
      }
    ]);
  }, []);

  const handleJourneyRemovePhase = useCallback((id: string) => {
    setJourneyDraft(prev => prev.filter(phase => phase.id !== id));
  }, []);

  const handleJourneySelectPhase = useCallback((id: string) => {
    setJourneyEditingPhaseId(id);
  }, []);

  const handleJourneySavePhase = useCallback((updated: JourneyPhaseDraft) => {
    setJourneyDraft(prev => prev.map(phase => (phase.id === updated.id ? { ...updated } : phase)));
    setJourneyEditingPhaseId(null);
  }, []);

  const handleJourneyRegenerate = useCallback(() => {
    if (!window.confirm('Regenerate the journey map with fresh AI suggestions? Your current edits will be replaced.')) {
      return;
    }
    const drafts = buildSuggestedPhases();
    setJourneyDraft(drafts);
    // Background AI refinement: replace template with AI-specific journey when available
    (async () => {
      const { generateSmartJourneyAI } = await import('./domain/journeyMicroFlow');
      const ai = await generateSmartJourneyAI(captured, wizard);
      if (ai && ai.length) {
        const refined = ai.map((p, index) => normalizePhaseDraft({ id: `suggest-${index + 1}`, name: p.name, focus: p.summary, activities: p.activities, checkpoint: '' }, index));
        setJourneyDraft(refined);
      }
    })().catch(() => {});
  }, [buildSuggestedPhases, captured, wizard, normalizePhaseDraft]);

  const handleJourneyCustomize = useCallback(() => {
    const first = journeyDraft[0];
    if (first) {
      setJourneyEditingPhaseId(first.id);
    }
  }, [journeyDraft]);

  const journeyCanAccept = useMemo(() => (
    journeyDraft.length >= 3 && journeyDraft.every(phase => phase.name.trim().length >= 3)
  ), [journeyDraft]);

  const editingPhase = useMemo(() => journeyDraft.find(phase => phase.id === journeyEditingPhaseId) || null, [journeyDraft, journeyEditingPhaseId]);
  const updateDeliverablesChips = useCallback((state: DeliverablesMicroState | null) => {
    if (journeyV2Enabled) {
      setMicroFlowActionChips([]);
      return;
    }
    if (state) {
      setMicroFlowActionChips(getDeliverablesActionChips(state));
    } else {
      setMicroFlowActionChips([]);
    }
  }, [journeyV2Enabled]);

  const handleJourneyAccept = useCallback(() => {
    const normalized = journeyDraft.map((phase, index) => normalizePhaseDraft(phase, index));
    if (normalized.length < 3) {
      window.alert('Add at least three phases before accepting the journey.');
      return;
    }

    const updatedCaptured: CapturedData = {
      ...captured,
      journey: {
        ...captured.journey,
        phases: normalized
      }
    };
    setCaptured(updatedCaptured);

    setJourneyDraft(normalized);
    setJourneyEditingPhaseId(null);
    setJourneyReceipt({ phaseCount: normalized.length, timestamp: Date.now() });
    trackEvent('journey_accept', { phaseCount: normalized.length });

    const transition = transitionMessageFor('JOURNEY', updatedCaptured, wizard);
    const deliverablesState = initDeliverablesMicroFlow(updatedCaptured, wizard);
    setDeliverablesMicroState(deliverablesState);
    updateDeliverablesChips(deliverablesState);

    let completionMessage = 'Great! Your learning journey is captured.';
    if (transition) {
      completionMessage = `${completionMessage}\n\n${transition}`;
    }
    if (journeyV2Enabled) {
      completionMessage = `${completionMessage}\n\nI've drafted milestones, artifacts, and rubric based on your journey. Review the deliverables card below to accept or tweak them.`;
    } else {
      const deliverablesMessage = formatDeliverablesSuggestion(deliverablesState);
      completionMessage = `${completionMessage}\n\n${deliverablesMessage}`;
    }

    engine.appendMessage({
      id: String(Date.now() + 5),
      role: 'assistant',
      content: completionMessage,
      timestamp: new Date()
    } as any);

    setStage('DELIVERABLES');
    setStageTurns(0);
    setHasInput(false);
    setMode('drafting');
    setFocus('deliverables');
    setShowKickoffPanel(false);

    // Background AI refinement of deliverables (replace template with AI when ready)
    (async () => {
      setDeliverablesAIStatus('refining');
      const { generateSmartDeliverablesAI } = await import('./domain/deliverablesAI');
      const ai = await generateSmartDeliverablesAI(updatedCaptured, wizard);
      if (ai) {
        setDeliverablesMicroState(prev => prev ? { ...prev, suggestedMilestones: ai.suggestedMilestones, suggestedArtifacts: ai.suggestedArtifacts, suggestedCriteria: ai.suggestedCriteria } : prev);
        setDeliverablesAIStatus('enhanced');
      } else {
        setDeliverablesAIStatus('idle');
      }
    })().catch(() => {});
  }, [journeyDraft, normalizePhaseDraft, captured, wizard, engine, setStage, setStageTurns, setHasInput, setMode, setFocus, setShowKickoffPanel, updateDeliverablesChips, journeyV2Enabled]);

  useEffect(() => {
    if (journeyV2Enabled) {
      if (stage === 'JOURNEY') {
        if (!journeyInitializedRef.current) {
          journeyInitializedRef.current = true;
          if (captured.journey.phases.length) {
            const drafts = captured.journey.phases.map((phase, index) => normalizePhaseDraft(phase, index));
            setJourneyDraft(drafts);
          } else {
            const drafts = buildSuggestedPhases();
            setJourneyDraft(drafts);
            // Background AI refinement (dynamic import to avoid cycles)
            (async () => {
              setJourneyAIStatus('refining');
              const { generateSmartJourneyAI } = await import('./domain/journeyMicroFlow');
              const ai = await generateSmartJourneyAI(captured, wizard);
              if (ai && ai.length) {
                const refined = ai.map((p, index) => normalizePhaseDraft({ id: `suggest-${index + 1}`, name: p.name, focus: p.summary, activities: p.activities, checkpoint: '' }, index));
                setJourneyDraft(refined);
                setJourneyAIStatus('enhanced');
              } else {
                setJourneyAIStatus('idle');
              }
            })().catch(() => {});
          }
        }
      } else {
        journeyInitializedRef.current = false;
        setJourneyEditingPhaseId(null);
      }
    }
  }, [journeyV2Enabled, stage, captured, wizard, buildSuggestedPhases, normalizePhaseDraft]);

  useEffect(() => {
    if (journeyV2Enabled && stage === 'JOURNEY') {
      updateDeliverablesChips(null);
    }
  }, [journeyV2Enabled, stage, updateDeliverablesChips]);

  useEffect(() => {
    if (stage === 'JOURNEY') {
      setFocus('journey');
    } else if (stage === 'DELIVERABLES') {
      setFocus('deliverables');
    } else {
      setFocus('ideation');
    }
  }, [stage]);

  useEffect(() => {
    if (!journeyReceipt) {return;}
    const timeout = setTimeout(() => setJourneyReceipt(null), 8000);
    return () => clearTimeout(timeout);
  }, [journeyReceipt]);

  useEffect(() => {
    if (!deliverablesReceipt) {return;}
    const timeout = setTimeout(() => setDeliverablesReceipt(null), 8000);
    return () => clearTimeout(timeout);
  }, [deliverablesReceipt]);

  useEffect(() => {
    if (showIntro) {
      kickoffAutoOpenRef.current = true;
      setShowKickoffPanel(!isMobile);
    }
  }, [showIntro, isMobile]);

  useEffect(() => {
    if (showKickoffPanel) {
      trackEvent('kickoff_shown', { stage, experience: experienceLevel, gradeBand: gradeBandLabel });
    }
  }, [showKickoffPanel, stage, experienceLevel, gradeBandLabel]);

  // Observe footer height and pad scroll area accordingly
  useEffect(() => {
    const el = footerRef.current;
    if (!el) { return; }
    const update = () => setFooterHeight(el.offsetHeight || 0);
    update();
    let ro: ResizeObserver | null = null;
    try {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } catch {
      // Older browsers without ResizeObserver
      window.addEventListener('resize', update);
      window.addEventListener('orientationchange', update as any);
    }
    return () => {
      if (ro) {
        ro.disconnect();
      } else {
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update as any);
      }
    };
  }, []);

  // Initial welcome from AI
  useEffect(() => {
    if (greetingSentRef.current) {return;}
    if (totalMessages > 0) {
      greetingSentRef.current = true;
      return;
    }

    const experience = wizard.pblExperience === 'new'
      ? 'new'
      : wizard.pblExperience === 'experienced'
        ? 'experienced'
        : 'some';

    const context = {
      subjects: wizard.subjects?.length ? wizard.subjects.join(', ') : 'your subject area',
      grade: wizard.gradeLevel || 'your students',
      duration: wizard.duration || 'your timeline',
      topic: wizard.projectTopic || 'the concept you have in mind'
    };

    const baseContext = `Subjects: ${context.subjects}. Grade: ${context.grade}. Duration: ${context.duration}. Topic seed: ${context.topic}.`;

    const promptLines = experience === 'new'
      ? [
          'You are ALF, an instructional coach welcoming a teacher who is new to project-based learning.',
          'Start with one sentence orienting them to the five-stage design flow (Big Idea → Essential Question → Challenge → Learning Journey → Deliverables).',
          'Follow with one sentence explaining that the first step is shaping the Big Idea, defined as the transferable concept students should carry forward.',
          'Finish by asking for that Big Idea in one focused question.',
          baseContext,
          'Keep it collegial and grounded. Stay under 60 words.'
        ]
      : experience === 'experienced'
        ? [
            'You are ALF, greeting an experienced PBL teacher.',
            'Acknowledge the context they already provided and frame the next move as refining the Big Idea (the transferable concept anchoring the project).',
            'Close with a concise question asking for that Big Idea.',
            baseContext,
            'Tone: trusted peer. Stay under 45 words.'
          ]
        : [
            'You are ALF, welcoming a teacher with some PBL experience.',
            'Briefly acknowledge their setup and remind them that you will co-design across five stages, starting with sharpening the Big Idea (the transferable concept students should keep).',
            'Ask for that Big Idea in one focused question.',
            baseContext,
            'Keep under 55 words with a collegial, confident tone.'
          ];

    const prompt = promptLines.join('\n');

    greetingSentRef.current = true;

    const greet = async () => {
      try {
        const intro = await generateAI(prompt, {
          model: 'gemini-2.5-flash-lite',
          temperature: 0.5,
          maxTokens: 140,
          systemPrompt: 'Voice: grounded, collegial, specific. Respect teacher expertise and keep language tight.'
        });
        if (intro) {
          engine.appendMessage({ id: String(Date.now()), role: 'assistant', content: intro, timestamp: new Date() } as any);
          trackEvent('chat_started', { experience: experienceLevel });
        }
      } catch {
        // Reset flag so we can retry if needed on subsequent renders
        greetingSentRef.current = false;
      }
    };

    void greet();
  }, [engine, totalMessages, wizard, experienceLevel]);

  // Hydrate captured data from blueprint/unified storage
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      let hydrated = hydrateCaptured(projectData?.capturedData as Record<string, any> | undefined);
      let storedProject: any = null;

      if ((!projectData?.capturedData || Object.keys(projectData.capturedData).length === 0) && projectId) {
        try {
          storedProject = await unifiedStorage.loadProject(projectId);
          if (!cancelled && storedProject?.capturedData) {
            hydrated = hydrateCaptured(storedProject.capturedData);
          }
        } catch {
          // ignore – stay with default captured
        }
      }

      if (cancelled) {return;}
      setCaptured(hydrated);
      const rawStage = (projectData as any)?.stage ?? storedProject?.stage ?? null;

      // Priority: 1) Saved stage, 2) Derived from captured data
      let initialStage: Stage = 'BIG_IDEA';

      if (typeof rawStage === 'string') {
        const normalized = rawStage.toUpperCase()
          .replace(/\s+/g, '_') as Stage;
        if (stageOrder.includes(normalized)) {
          initialStage = normalized;
        }
      } else {
        // Derive from captured data only if no saved stage
        initialStage = deriveCurrentStage(hydrated);
      }

      setStage(initialStage);
      setStageTurns(0);
      setInitialized(true);
      setAutosaveEnabled(Object.keys(serializeCaptured(hydrated)).length > 0);
      kickoffAutoOpenRef.current = true;
      setShowKickoffPanel(!isMobile); // Show kickoff on initial load (mobile collapses)
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [projectId, projectData, isMobile]);

  // Surface kickoff guidance on every stage transition until the teacher dismisses it
  useEffect(() => {
    kickoffAutoOpenRef.current = true;
    setShowKickoffPanel(!isMobile);
  }, [stage, isMobile]);

  // Removed auto-dismiss: let users close kickoff panel manually (per UX feedback)
  // Intentionally no auto-close behavior here.

  const persist = useCallback(async () => {
    try {
      if (!projectId) {return;}
      const status = computeStatus(captured);
      const serialized = serializeCaptured(captured);
      const capturedPayload = {
        ...serialized,
        ideation: captured.ideation,
        journey: captured.journey,
        deliverables: captured.deliverables
      };

      // Check if we have any meaningful content captured
      const hasMeaningfulContent = Boolean(
        captured.ideation?.bigIdea?.trim() ||
        captured.ideation?.essentialQuestion?.trim() ||
        captured.ideation?.challenge?.trim() ||
        (captured.journey?.phases && captured.journey.phases.length > 0) ||
        (captured.deliverables?.milestones && captured.deliverables.milestones.length > 0)
      );

      await unifiedStorage.saveProject({
        id: projectId,
        lastOpenedStep: stage,
        stage,
        status,
        capturedData: capturedPayload,
        // Set provisional=false once user has captured anything meaningful
        provisional: !hasMeaningfulContent,
        updatedAt: new Date()
      });
    } catch {}
  }, [projectId, captured, stage]);

  useEffect(() => {
    if (!initialized || !autosaveEnabled) {return;}
    const t = setTimeout(() => { void persist(); }, 1200);
    return () => clearTimeout(t);
  }, [persist, initialized, autosaveEnabled, captured, stage]);

  // Cloud sync on page hide/close and when coming back online
  useEffect(() => {
    if (!projectId) {return;}
    const handleHidden = () => { void unifiedStorage.syncNowIfDue(projectId, { force: true, reason: 'visibilitychange' }); };
    const handleBeforeUnload = () => { void unifiedStorage.syncNowIfDue(projectId, { force: true, reason: 'beforeunload' }); };
    const handleOnline = () => { void unifiedStorage.syncNowIfDue(projectId, { force: true, reason: 'online' }); };
    document.addEventListener('visibilitychange', handleHidden);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleHidden);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
    };
  }, [projectId]);

  const fallbackSuggestions = useMemo(() => {
    const base = stageSuggestions(stage);
    const dyn = dynamicSuggestions(stage, { subjects: wizard.subjects, projectTopic: wizard.projectTopic }, captured);
    return Array.from(new Set([...(dyn || []), ...base])).slice(0, 3);
  }, [stage, wizard.subjects, wizard.projectTopic, captured]);
  const suggestions = aiSuggestions.length ? aiSuggestions : fallbackSuggestions;
  const guide = useMemo(() => stageGuide(stage), [stage]);
  const gating = validate(stage, captured);
  const showGating = hasInput || stage !== 'BIG_IDEA';

  // System status for StatusIndicator component
  const systemStatus: SystemStatus = useMemo(() => ({
    ai: aiStatus === 'online' ? 'online' : aiStatus === 'error' ? 'error' : 'offline',
    firebase: firebaseStatus,
    model: aiStatus === 'online' ? 'Gemini 2.5 Flash' : undefined,
  }), [aiStatus, firebaseStatus]);

  const stageSummary = useMemo(() => getStageSummary(stage, captured), [stage, captured]);
  const gradeBandSections = useMemo(() => {
    if (!gradeBandKey) {return [] as GradeGuardrailSection[];}
    return buildGradeBandSections(stage, gradeBandRules[gradeBandKey]);
  }, [stage, gradeBandKey]);

  const handleSidebarControls = useCallback((controls: ResponsiveSidebarControls | null) => {
    sidebarControlsRef.current = controls;
  }, []);

  const navigateSidebarToStage = useCallback((targetStage: Stage) => {
    const controls = sidebarControlsRef.current;
    trackEvent('kickoff_sidebar_view', { stage: targetStage, device: isMobile ? 'mobile' : 'desktop', gradeBand: gradeBandLabel });

    const scrollToStage = () => {
      const el = document.querySelector(`[data-draft-stage="${targetStage}"]`);
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.focus?.({ preventScroll: true });
      }
    };

    if (!controls) {
      requestAnimationFrame(scrollToStage);
      return;
    }

    if (!controls.isOpen) {
      controls.open();
      const delay = controls.isMobile ? 380 : 140;
      window.setTimeout(() => {
        scrollToStage();
      }, delay);
      return;
    }

    requestAnimationFrame(scrollToStage);
  }, [isMobile, gradeBandLabel]);

  const latestAssistantId = useMemo(() => {
    const msgs = engine.state.messages as any[];
    for (let i = msgs.length - 1; i >= 0; i -= 1) {
      if (msgs[i]?.role === 'assistant') {return String(msgs[i]?.id);}
    }
    return null;
  }, [engine.state.messages]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSuggestions() {
      if (aiStatus !== 'online') {
        setAiSuggestions([]);
        return;
      }
      setSuggestionsLoading(true);
      try {
        const prompt = buildSuggestionPrompt({ stage, wizard, captured });
        const response = await generateAI(prompt, {
          model: 'gemini-2.5-flash-lite',
          history: [],
          systemPrompt: 'Return only the suggestion lines—no introductions, no numbering.',
          temperature: 0.65,
          maxTokens: 220
        });
        if (cancelled) {return;}
        const ideas = (response || '')
          .split(/\r?\n/)
          .map((line) => line.replace(/^[•\d\-\s]+/, '').trim())
          .filter((line) => line.length > 0)
          .slice(0, 3);

        // Track suggestions for intent detection
        if (ideas.length > 0) {
          suggestionTracker.trackMultiple(stage, ideas, 'ai');
        }

        setAiSuggestions(ideas);
      } catch (error) {
        if (!cancelled) {
          setAiSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false);
        }
      }
    }

    void fetchSuggestions();
    return () => {
      cancelled = true;
    };
  }, [stage, wizard, captured, aiStatus]);

  const handleCoachAction = useCallback(async (
    action: 'refine' | 'push-deeper',
    message: { id: string | number; content: string }
  ) => {
    if (aiStatus !== 'online') {return;}
    if (latestAssistantId && String(message.id) !== latestAssistantId) {return;}

    const allMessages = engine.state.messages as any[];
    const targetIndex = allMessages.findIndex((m) => m.id === message.id);
    let lastUserContent = '';
    if (targetIndex >= 0) {
      for (let i = targetIndex - 1; i >= 0; i -= 1) {
        if (allMessages[i]?.role === 'user') {
          lastUserContent = allMessages[i]?.content || '';
          break;
        }
      }
    }
    if (!lastUserContent) {
      for (let i = allMessages.length - 1; i >= 0; i -= 1) {
        if (allMessages[i]?.role === 'user') {
          lastUserContent = allMessages[i]?.content || '';
          break;
        }
      }
    }

    const snapshot = summarizeCaptured({ wizard, captured, stage });
    const stageInfo = guide;
    const gatingInfo = validate(stage, captured);

    const instruction = action === 'refine'
      ? 'Refine your previous coaching response to be sharper and more actionable. Keep acknowledgement, add one expert-level insight, and finish with a focused next step. Stay under 90 words.'
      : 'Push the teacher to go deeper. Challenge their thinking with one probing insight, then ask a powerful next question that raises the bar. Stay under 90 words.';

    const prompt = [
      `Stage: ${stage} — ${stageInfo.what}`,
      `Why it matters: ${stageInfo.why}`,
      `Progress snapshot:\n${snapshot || 'No details captured yet.'}`,
      gatingInfo.ok ? 'The stage meets basic gating criteria.' : `Gating gap: ${gatingInfo.reason ?? 'Needs more detail.'}`,
      `Teacher’s latest input:\n${lastUserContent || '(Not provided in chat yet.)'}`,
      `Your previous coaching reply:\n${message.content}`,
      instruction
    ].join('\n\n');

    const refined = await generateAI(prompt, {
      model: 'gemini-2.5-flash-lite',
      history: (engine.state.messages as any[])
        .slice(-6)
        .map((m: any) => ({ role: m.role, content: m.content })),
      systemPrompt: 'You are ALF Coach. Be concise, encouraging, and practical. Always add value: acknowledge → educate → enhance → advance. Avoid code blocks.',
      temperature: 0.55,
      maxTokens: 350
    });

    if (refined) {
      engine.appendMessage({
        id: `${Date.now()}_${action}`,
        role: 'assistant',
        content: refined,
        timestamp: new Date(),
        metadata: { action, parentId: message.id }
      } as any);
    }
  }, [aiStatus, engine, stage, captured, wizard, guide, latestAssistantId]);

  const handleProjectCompletion = useCallback(async (capturedSnapshot?: CapturedData) => {
    if (!projectId) {
      console.error('[ChatMVP] Cannot complete project without projectId');
      return;
    }

    const finalCaptured = capturedSnapshot ?? captured;

    try {
      setCompletionState('processing');
      // Show generating message
      engine.appendMessage({
        id: String(Date.now()),
        role: 'assistant',
        content: '**Finalizing your project...**\n\nGenerating professional course description, assignments, and showcase materials. This will take a moment.',
        timestamp: new Date()
      } as any);

      // Generate professional course description and tagline in parallel
      const [description, tagline] = await Promise.all([
        generateCourseDescription(finalCaptured, wizard),
        generateTagline(finalCaptured, wizard)
      ]);

      // Verify description quality
      const quality = verifyDescriptionQuality(description);
      console.log('[ChatMVP] Description quality check:', quality);

      if (!quality.isValid && quality.warnings.length > 0) {
        console.warn('[ChatMVP] Description quality warnings:', quality.warnings);
      }

      // Build complete project title
      const existingProject = await unifiedStorage.loadProject(projectId);
      const projectTitle = existingProject?.title ||
                          finalCaptured.ideation?.bigIdea?.split(' ').slice(0, 8).join(' ') ||
                          'Untitled Project';

      // Generate complete showcase structure with assignments
      console.log('[ChatMVP] Generating complete project showcase...');
      const showcase = await generateProjectShowcase(finalCaptured, wizard, {
        projectId,
        title: projectTitle,
        tagline,
        description
      });
      console.log('[ChatMVP] Showcase generation complete:', {
        assignments: showcase.assignments.length,
        weeks: showcase.runOfShow.length
      });

      // CRITICAL: Validate showcase structure before saving
      const isValidShowcase = showcase &&
        showcase.assignments &&
        showcase.assignments.length > 0 &&
        showcase.runOfShow &&
        showcase.runOfShow.length > 0 &&
        showcase.hero &&
        showcase.hero.title;

      if (!isValidShowcase) {
        console.error('[ChatMVP] CRITICAL: Showcase validation failed', {
          hasShowcase: !!showcase,
          hasAssignments: !!showcase?.assignments,
          assignmentsLength: showcase?.assignments?.length || 0,
          hasRunOfShow: !!showcase?.runOfShow,
          runOfShowLength: showcase?.runOfShow?.length || 0,
          hasHero: !!showcase?.hero,
          hasTitle: !!showcase?.hero?.title
        });

        // Throw error to trigger catch block and inform user
        throw new Error('Showcase generation failed - AI services may be experiencing issues. Please try again in a moment.');
      }

      // Extract display metadata
      const gradeLevel = wizard.gradeLevel || 'K-12';
      const subjects = wizard.subjects || [];
      const subject = subjects.length > 0 ? subjects.join(', ') : 'General';
      const duration = wizard.duration || '';

      // Show preview before final save
      engine.appendMessage({
        id: String(Date.now() + 5),
        role: 'assistant',
        content: `**Project Preview**\n\n**Title:** ${projectTitle}\n\n**Tagline:** ${tagline}\n\n**Description:**\n${description}\n\n**Generated:**\n- ${showcase.assignments.length} detailed assignments\n- ${showcase.runOfShow.length} week-by-week lesson plans\n- Complete materials list and rubric\n\n**Quality Check:** ${quality.wordCount} words ${quality.isValid ? '(looks great)' : '(has minor issues)'}\n\nSaving your project now...`,
        timestamp: new Date()
      } as any);

      // Small delay so user can see preview
      await new Promise(resolve => setTimeout(resolve, 800));

      // Build complete project structure with showcase data
      const completeProject = {
        id: projectId,
        title: projectTitle,
        description,
        tagline,

        // Display metadata
        gradeLevel,
        subject,
        subjects,
        duration,

        // Complete showcase structure (NEW)
        showcase,

        // From wizard
        wizardData: {
          ...existingProject?.wizardData,
          gradeLevel,
          subjects,
          duration,
          projectTopic: wizard.projectTopic
        },

        // From captured data (full structure)
        capturedData: {
          ideation: finalCaptured.ideation,
          journey: finalCaptured.journey,
          deliverables: finalCaptured.deliverables
        },

        // Also store in legacy format for compatibility
        ideation: finalCaptured.ideation,
        journey: finalCaptured.journey,
        deliverables: finalCaptured.deliverables,

        // Project metadata
        bigIdea: finalCaptured.ideation?.bigIdea,
        essentialQuestion: finalCaptured.ideation?.essentialQuestion,
        challenge: finalCaptured.ideation?.challenge,

        // Completion metadata
        status: 'ready' as const,
        provisional: false,
        stage: 'COMPLETED',
        source: 'chat' as const,
        completedAt: new Date(),
        updatedAt: new Date()
      };

      // Save complete project
      await unifiedStorage.saveProject(completeProject);

      console.log('[ChatMVP] Project saved successfully:', {
        projectId,
        title: projectTitle,
        descriptionLength: description.length,
        taglineLength: tagline.length,
        qualityCheck: quality
      });

      // PHASE A: Save showcase to cloud immediately for cloud-first reads
      try {
        console.log('[ChatMVP] 🌥️ Saving showcase to cloud...');
        const { cloudProjectService } = await import('../../services/CloudProjectService');
        const { featureFlags } = await import('../../config/featureFlags');

        if (featureFlags.cloudFirstReads && completeProject.showcase) {
          const saveResult = await cloudProjectService.saveShowcase(
            projectId,
            completeProject.showcase
          );

          if (saveResult.success) {
            console.log(
              `[ChatMVP] ✅ Showcase saved to cloud (rev ${saveResult.rev})`,
              saveResult.showcasePath
            );
          } else {
            console.warn('[ChatMVP] ⚠️ Cloud save failed:', saveResult.error);
          }
        } else {
          console.log('[ChatMVP] Skipping cloud save (cloudFirstReads=false or no showcase)');
        }
      } catch (cloudError) {
        console.error('[ChatMVP] ❌ Cloud save error (non-fatal):', cloudError);
        // Continue anyway - local storage has the data
      }

      // Trigger hero transformation for showcase view
      // This is CRITICAL for the preview page to work properly
      console.log('[ChatMVP] Triggering hero transformation...');

      // Add small delay to ensure localStorage write is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      const heroResult = await unifiedStorage.loadHeroProject(projectId);

      if (!heroResult) {
        console.error('[ChatMVP] CRITICAL: Hero transformation failed - preview may not work correctly');
        // Still continue, but log the error
        engine.appendMessage({
          id: String(Date.now() - 1),
          role: 'assistant',
          content: '⚠️ **Note:** There was an issue generating the preview. Your project is saved, but you may need to refresh to view the preview.',
          timestamp: new Date()
        } as any);
      } else {
        console.log('[ChatMVP] Hero transformation complete:', {
          projectId,
          hasShowcase: !!heroResult.showcase,
          dataCompleteness: heroResult.transformationMeta?.dataCompleteness
        });
      }

      // Gate readiness on presence of a usable preview source (hero cache or raw showcase)
      const checkPreviewReady = (): boolean => {
        try {
          const heroKey = `alf_hero_${projectId}`;
          const rawKey = `alf_project_${projectId}`;
          const hasHero = !!localStorage.getItem(heroKey);
          let hasRawShowcase = false;
          let hasShowcaseRef = false;
          const raw = localStorage.getItem(rawKey);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              hasRawShowcase = !!parsed?.showcase;
              hasShowcaseRef = !!parsed?.showcaseRef;
            } catch {
              // ignore parse error
            }
          }
          // Consider presence of a showcaseRef (IDB offload) as preview-ready
          return hasHero || hasRawShowcase || hasShowcaseRef;
        } catch {
          return false;
        }
      };

      let isReady = checkPreviewReady();
      if (!isReady) {
        // Longer, incremental wait to allow IDB offload and hero transform
        const intervals = [300, 300, 300, 300, 400, 400, 500, 500, 600, 700];
        for (const ms of intervals) {
          await new Promise(resolve => setTimeout(resolve, ms));
          if (checkPreviewReady()) { isReady = true; break; }
        }
        // Last-mile recheck
        if (!isReady) {
          await new Promise(resolve => setTimeout(resolve, 800));
          isReady = checkPreviewReady();
        }
      }

      if (isReady) {
        setCompletionState('ready');
      } else {
        console.warn('[ChatMVP] Preview sources not ready after wait; marking as error.');
        setCompletionState('error');
      }

      // Show completion message
      engine.appendMessage({
        id: String(Date.now() + 10),
        role: 'assistant',
        content: `**Project Complete**\n\nYour PBL project "${projectTitle}" is ready.\n\n**What's included:**\n- ${showcase.assignments.length} detailed assignments with student directions and teacher setup\n- ${showcase.runOfShow.length} weeks of lesson plans with checkpoints and deliverables\n- Complete materials list and assessment rubric\n- ${finalCaptured.journey?.phases?.length || 0} learning phases with clear progressions\n- ${finalCaptured.deliverables?.milestones?.length || 0} milestones and ${finalCaptured.deliverables?.artifacts?.length || 0} authentic artifacts\n\n**Next steps:**\n- Review Project - View your professional showcase with all assignments and materials\n- Dashboard - Access and manage all your projects\n- The project is now available on your dashboard as a completed project\n\nYour project is ready to implement with your students.`,
        timestamp: new Date()
      } as any);

    } catch (error) {
      console.error('[ChatMVP] Project completion failed', error);
      setCompletionState('error');

      // Determine if this is a showcase generation failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isShowcaseError = errorMessage.includes('Showcase generation failed') ||
                              errorMessage.includes('AI services');

      const userMessage = isShowcaseError
        ? `**Unable to Complete Project Showcase**

The AI service encountered an issue while generating your professional showcase materials (assignments, lesson plans, and materials list).

**What happened:**
- Your core project data (Big Idea, Learning Journey, Deliverables) is saved
- The AI-generated showcase materials could not be created

**What you can do:**
1. Wait 1-2 minutes for AI services to recover
2. Click "Retry Finalization" below
3. If the issue persists, your project data is safe - contact support

**Your work is not lost.** All your conversations and project design are autosaved.`
        : 'I hit a storage snag while finalizing your project. Your work is autosaved. If preview is unavailable, try freeing some browser storage (clear large items) and tap "Retry finalization."';

      engine.appendMessage({
        id: String(Date.now() + 10),
        role: 'assistant',
        content: userMessage,
        timestamp: new Date()
      } as any);
    }
  }, [captured, wizard, projectId, engine]);

  const handleEditStage = useCallback((targetStage: Stage) => {
    // Reset micro-flow states when navigating to a stage
    if (targetStage === 'DELIVERABLES') {
      setDeliverablesMicroState(null);
    }

    // Clear action chips
    updateDeliverablesChips(null);
    if (targetStage !== 'DELIVERABLES') {
      setCompletionState('idle');
    }

    // Navigate to the stage
    trackEvent('stage_jump', { fromStage: stage, toStage: targetStage, gradeBand: gradeBandLabel });
    setStage(targetStage);
    setStageTurns(0);
    setMode('refining');
    setFocus(targetStage === 'JOURNEY' ? 'journey' : targetStage === 'DELIVERABLES' ? 'deliverables' : 'ideation');

    // Show guidance message for the stage
    const guidance = getStageGuidance(targetStage, captured, wizard);
    if (guidance) {
      engine.appendMessage({
        id: String(Date.now() + 1),
        role: 'assistant',
        content: `Returning to **${targetStage.replace('_', ' ').toLowerCase()}**.\n\n${guidance}`,
        timestamp: new Date()
      } as any);
    }
  }, [captured, wizard, engine, stage, gradeBandLabel, updateDeliverablesChips]);

  const handleStageContinue = useCallback(() => {
    const next = nextStage(stage);
    if (!next) {
      setMode('validating');
      setFocus('overview');
      return;
    }

    setMode('drafting');
    setFocus(next === 'JOURNEY' ? 'journey' : next === 'DELIVERABLES' ? 'deliverables' : 'ideation');
    trackEvent('stage_continue', { fromStage: stage, toStage: next, gradeBand: gradeBandLabel });
    setStage(next);
    setStageTurns(0);
    setHasInput(false);
    setDeliverablesMicroState(next === 'DELIVERABLES' ? null : deliverablesMicroState);
    updateDeliverablesChips(null);

    const transition = transitionMessageFor(stage, captured, wizard);
    if (transition) {
      engine.appendMessage({
        id: String(Date.now() + 3),
        role: 'assistant',
        content: transition,
        timestamp: new Date()
      } as any);
    }
  }, [stage, deliverablesMicroState, captured, wizard, engine, gradeBandLabel, updateDeliverablesChips]);

  const processDeliverablesResult = useCallback(async (
    currentState: DeliverablesMicroState,
    result: DeliverablesChoiceResult
  ) => {
    switch (result.action) {
      case 'accept_all': {
        const updatedCaptured = {
          ...captured,
          deliverables: {
            milestones: result.captured!.milestones,
            artifacts: result.captured!.artifacts,
            rubric: result.captured!.rubric
          }
        };
        setCaptured(updatedCaptured);
        setDeliverablesMicroState(null);
        updateDeliverablesChips(null);
        setDeliverablesReceipt({
          milestoneCount: result.captured!.milestones.length,
          artifactCount: result.captured!.artifacts.length,
          criteriaCount: result.captured!.rubric.criteria.length,
          timestamp: Date.now()
        });

        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: `Perfect! Your deliverables are complete:
• **${result.captured!.milestones.length} milestones** to track progress
• **${result.captured!.artifacts.length} ${result.captured!.artifacts.length === 1 ? 'artifact' : 'artifacts'}** for students to create
• **${result.captured!.rubric.criteria.length} rubric criteria** for assessment

Your project structure is ready!`,
          timestamp: new Date()
        } as any);

        const previousStatus = computeStatus(captured);
        const newStatus = computeStatus(updatedCaptured);
        if (previousStatus !== 'ready' && newStatus === 'ready') {
          setMode('validating');
          setFocus('overview');
          await handleProjectCompletion(updatedCaptured);
        }
        return true;
      }

      case 'show_all': {
        const nextState = result.newState ?? currentState;
        setDeliverablesMicroState(nextState);
        updateDeliverablesChips(nextState);
        const suggestion = formatDeliverablesSuggestion(nextState);
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: suggestion,
          timestamp: new Date()
        } as any);
        return true;
      }

      case 'regenerate': {
        setCompletionState('idle');
        const microState = initDeliverablesMicroFlow(captured, wizard);
        setDeliverablesMicroState(microState);
        updateDeliverablesChips(microState);
        const deliverablesSuggestion = formatDeliverablesSuggestion(microState);
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: `Let's try a different approach.\n\n${  deliverablesSuggestion}`,
          timestamp: new Date()
        } as any);
        return true;
      }

      case 'none': {
        if (result.message) {
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: result.message,
            timestamp: new Date()
          } as any);
        }
        if (currentState) {
          updateDeliverablesChips(currentState);
        }
        return true;
      }

      default:
        return false;
    }
  }, [captured, engine, handleProjectCompletion, wizard, stage, updateDeliverablesChips]);

  const handleDeliverablesQuickCommand = useCallback(async (command: string) => {
    if (!deliverablesMicroState) {return;}
    const result = handleDeliverablesChoice(deliverablesMicroState, command);
    await processDeliverablesResult(deliverablesMicroState, result);
  }, [deliverablesMicroState, processDeliverablesResult]);

  const handleDeliverablesRename = useCallback((section: 'milestones' | 'artifacts' | 'criteria', index: number, text: string) => {
    setCompletionState('idle');
    setDeliverablesMicroState(prev => {
      if (!prev) {return prev;}
      const clone = { ...prev };
      if (section === 'milestones') {
        const items = [...clone.suggestedMilestones];
        items[index] = text;
        clone.suggestedMilestones = items;
      } else if (section === 'artifacts') {
        const items = [...clone.suggestedArtifacts];
        items[index] = text;
        clone.suggestedArtifacts = items;
      } else {
        const items = [...clone.suggestedCriteria];
        items[index] = text;
        clone.suggestedCriteria = items;
      }
      updateDeliverablesChips(clone);
      return clone;
    });
  }, [updateDeliverablesChips]);

  const handleDeliverablesReorder = useCallback((section: 'milestones' | 'artifacts' | 'criteria', from: number, to: number) => {
    if (from === to) {return;}
    setCompletionState('idle');
    setDeliverablesMicroState(prev => {
        if (!prev) {return prev;}
        const clone = { ...prev };
        const reorder = <T,>(arr: T[]) => {
          const copy = [...arr];
          const [moved] = copy.splice(from, 1);
          if (moved === undefined) {return arr;}
          copy.splice(to, 0, moved);
          return copy;
        };
        if (section === 'milestones') {
          clone.suggestedMilestones = reorder(clone.suggestedMilestones);
          clone.workingMilestones = clone.workingMilestones.length ? reorder(clone.workingMilestones) : clone.workingMilestones;
        } else if (section === 'artifacts') {
          clone.suggestedArtifacts = reorder(clone.suggestedArtifacts);
          clone.workingArtifacts = clone.workingArtifacts.length ? reorder(clone.workingArtifacts) : clone.workingArtifacts;
        } else {
          clone.suggestedCriteria = reorder(clone.suggestedCriteria);
          clone.workingCriteria = clone.workingCriteria.length ? reorder(clone.workingCriteria) : clone.workingCriteria;
        }
      updateDeliverablesChips(clone);
      return clone;
    });
  }, [updateDeliverablesChips]);

  const handleSend = useCallback(async (text?: string) => {
    if (aiStatus !== 'online') {
      return;
    }
    const content = (text ?? engine.state.input ?? '').trim();
    if (!content) {return;}

    // Add user message
    engine.appendMessage({ id: String(Date.now()), role: 'user', content, timestamp: new Date() } as any);
    engine.setInput('');
    setHasInput(true);

    // Update conversation history for context
    setConversationHistory(prev => {
      const updated = [content, ...prev].slice(0, 5);
      return updated;
    });

    // CRITICAL: Extract conversational wrappers FIRST, then detect intent
    // This ensures "what about, [actual question]" is properly recognized
    const extractedContent = extractFromConversationalWrapper(content);
    const recentSuggestionTexts = suggestionTracker.getRecentTexts(5);
    const intentResult = detectIntent(extractedContent, recentSuggestionTexts, conversationHistory);

    // Handle immediate acknowledgment for conversational inputs (but NOT for accept_suggestion - coaching handles that)
    const immediateAck = intentResult.intent !== 'accept_suggestion' ? getImmediateAcknowledgment(intentResult.intent) : null;
    const now = Date.now();
    const shouldSuppressAck = suppressNextAckUntil !== null && now < suppressNextAckUntil;
    if (shouldSuppressAck) {
      setSuppressNextAckUntil(null);
    } else if (immediateAck) {
      engine.appendMessage({
        id: String(now + 1),
        role: 'assistant',
        content: immediateAck,
        timestamp: new Date()
      } as any);
    }

    // Handle different intents
    switch (intentResult.intent) {
      case 'accept_suggestion': {
        // User accepted a suggestion - capture it directly
        const suggestionIndex = intentResult.lastSuggestionIndex ?? 0;
        const actualIndex = suggestionIndex === -1 ? recentSuggestionTexts.length - 1 : suggestionIndex;
        const selectedSuggestion = recentSuggestionTexts[actualIndex];

        if (selectedSuggestion) {
          // Record selection
          const recentSuggestions = suggestionTracker.getMostRecent(5);
          if (recentSuggestions[actualIndex]) {
            suggestionTracker.recordSelection(recentSuggestions[actualIndex].id);
          }

          // Capture the suggestion directly
          const updatedCaptured = captureStageInput(captured, stage, selectedSuggestion);
          setCaptured(updatedCaptured);

          // Check if stage is complete to determine message content
          const gatingInfo = validate(stage, updatedCaptured);

          // Generate appropriate message based on stage completion
          let responseMessage: string;
          if (gatingInfo.ok) {
            // Stage complete - show transition to next stage (includes coaching context)
            const transition = transitionMessageFor(stage, updatedCaptured, wizard);
            responseMessage = transition || `Perfect! I've captured that. Let's move forward.`;
          } else {
            // Stage incomplete - show coaching to help complete it
            const coaching = getPostCaptureCoaching(stage, updatedCaptured, wizard);
            responseMessage = coaching || `Got it! Feel free to refine it further.`;
          }

          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: responseMessage,
            timestamp: new Date()
          } as any);

          // Advance to next stage if complete
          if (gatingInfo.ok) {
            if (!autosaveEnabled) {setAutosaveEnabled(true);}
            const nxt = nextStage(stage);
            if (nxt) {
              setStage(nxt);
              setStageTurns(0);
              setHasInput(false);

              // Auto-generate project name for Big Idea
              if (stage === 'BIG_IDEA' && updatedCaptured.ideation?.bigIdea && projectId) {
                try {
                  const makeName = (idea: string) => {
                    const cleaned = idea.replace(/[\.!?]+$/g, '').split(/\s+/).slice(0, 8).join(' ');
                    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
                  };
                  const candidateName = makeName(updatedCaptured.ideation.bigIdea);
                  if (candidateName && candidateName.length >= 4) {
                    await unifiedStorage.saveProject({
                      id: projectId,
                      title: candidateName,
                      provisional: false // Has meaningful content now
                    });
                  }
                } catch {}
              }

            }
          }
        }
        return;
      }

      case 'request_alternatives': {
        // Regenerate suggestions
        setSuggestionsLoading(true);
        try {
          const prompt = buildSuggestionPrompt({ stage, wizard, captured });
          const response = await generateAI(prompt, {
            model: 'gemini-2.5-flash-lite',
            history: [],
            systemPrompt: 'Return only fresh suggestion lines—no introductions, no numbering. Provide variety.',
            temperature: 0.75, // Higher temp for variety
            maxTokens: 220
          });

          const ideas = (response || '')
            .split(/\r?\n/)
            .map((line) => line.replace(/^[•\d\-\s]+/, '').trim())
            .filter((line) => line.length > 0)
            .slice(0, 3);

          if (ideas.length > 0) {
            suggestionTracker.trackMultiple(stage, ideas, 'ai');
            setAiSuggestions(ideas);
            setShowIdeas(true);

            engine.appendMessage({
              id: String(Date.now() + 2),
              role: 'assistant',
              content: "Here are some fresh ideas. Take a look below:",
              timestamp: new Date()
            } as any);
          }
        } catch {
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: "I'm having trouble generating new suggestions right now. Want to try your own take?",
            timestamp: new Date()
          } as any);
        } finally {
          setSuggestionsLoading(false);
        }
        return;
      }

      case 'request_clarification': {
        // Use AI to provide contextual help based on stage guidance
        const baseGuidance = getStageGuidance(stage, captured, wizard);
        const snapshot = summarizeCaptured({ wizard, captured, stage });

        const helpPrompt = [
          `The teacher asked: "${content}"`,
          `Current stage: ${stage.replace(/_/g, ' ').toLowerCase()}`,
          snapshot ? `What they've captured so far:\n${snapshot}` : 'Nothing captured yet.',
          '',
          'Base guidance to reference:',
          baseGuidance,
          '',
          'Respond conversationally to their specific question while incorporating the guidance above.',
          'Keep it under 100 words, friendly and helpful.'
        ].join('\n');

        const helpResponse = await generateAI(helpPrompt, {
          model: 'gemini-2.5-flash-lite',
          history: (engine.state.messages as any[])
            .slice(-4)
            .map((m: any) => ({ role: m.role, content: m.content })),
          systemPrompt: 'You are ALF Coach. Be conversational, specific, and helpful. Reference their work when relevant.',
          temperature: 0.6,
          maxTokens: 300
        });

        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: helpResponse || baseGuidance, // Fallback to static if AI fails
          timestamp: new Date()
        } as any);
        return;
      }

      case 'show_progress': {
        // Show working draft sidebar (it's always visible, so just acknowledge)
        const summary = summarizeCaptured({ wizard, captured, stage });
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: `Here's what we've captured so far:\n\n${summary}`,
          timestamp: new Date()
        } as any);
        return;
      }

      case 'modify_previous': {
        // User wants to modify a previous suggestion
        const modification = intentResult.extractedValue || content;
        const updatedCaptured = captureStageInput(captured, stage, modification);
        setCaptured(updatedCaptured);

        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: "Got it, I've updated that.",
          timestamp: new Date()
        } as any);
        return;
      }

      case 'cancel_flow': {
        // User wants to escape from micro-flow
        if (deliverablesMicroState) {
          setDeliverablesMicroState(null);
          updateDeliverablesChips(null);

          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: "No problem! Let's approach this differently. What would you like to focus on?",
            timestamp: new Date()
          } as any);
          return;
        }
        // If not in a micro-flow, treat as substantive input
        break;
      }

      case 'substantive_input':
      default:
        // Proceed to normal validation flow
        break;
    }
    // DELIVERABLES STAGE: Initialize micro-flow if not already active
    if (stage === 'DELIVERABLES' && !deliverablesMicroState && !deliverablesComplete) {
      const microState = initDeliverablesMicroFlow(captured, wizard);
      setDeliverablesMicroState(microState);
      setSuppressNextAckUntil(Date.now() + 500);
      engine.appendMessage({
        id: String(Date.now() + 2),
        role: 'assistant',
        content: journeyV2Enabled
          ? "Here's a deliverables package aligned to your journey. Review the card below to finalize or customize anything you'd like."
          : "Here's a complete deliverables package—milestones, artifacts, and rubric. Review the card below to finalize or customize.",
        timestamp: new Date()
      } as any);

      updateDeliverablesChips(microState);
      return;
    }

    // DELIVERABLES STAGE: Handle user response to deliverables suggestion
    if (stage === 'DELIVERABLES' && deliverablesMicroState) {
      const result = handleDeliverablesChoice(deliverablesMicroState, content);
      if (await processDeliverablesResult(deliverablesMicroState, result)) {
        return;
      }
    }

    // Normal validation flow for substantive input
    // extractedContent already extracted at line 496
    const assessment = assessStageInput(stage, extractedContent);
    if (!assessment.ok) {
      const correctionPrompt = buildCorrectionPrompt({
        stage,
        wizard,
        userInput: extractedContent,
        reason: assessment.reason || 'Needs refinement.'
      });
      const correction = await generateAI(correctionPrompt, {
        model: 'gemini-2.5-flash-lite',
        history: (engine.state.messages as any[])
          .slice(-6)
          .map((m: any) => ({ role: m.role, content: m.content })),
        systemPrompt: 'You are ALF Coach—collegial, specific, and encouraging. Keep guidance under 80 words and invite a clearer response.',
        temperature: 0.5,
        maxTokens: 260
      });
      if (correction) {
        engine.appendMessage({ id: String(Date.now() + 1), role: 'assistant', content: correction, timestamp: new Date() } as any);
      }
      return;
    }

    setStageTurns(prev => prev + 1);

    const previousStatus = computeStatus(captured);
    // Use extracted content for capture
    const updatedCaptured = captureStageInput(captured, stage, extractedContent);
    const newStatus = computeStatus(updatedCaptured);
    setCaptured(updatedCaptured);

    const gatingInfo = validate(stage, updatedCaptured);
    // For ideation, if still incomplete, ask a targeted follow-up instead of a generic prompt
    if (!gatingInfo.ok && (stage === 'BIG_IDEA' || stage === 'ESSENTIAL_QUESTION' || stage === 'CHALLENGE')) {
      const { score, missing } = scoreIdeationSpecificity(stage as any, updatedCaptured, wizard);
      const band = resolveGradeBand(wizard.gradeLevel);
      const follow = nextQuestionFor('CHALLENGE', missing, band);
      const ack = score >= 40 ? 'Nice—this is getting clearer.' : 'Good start.';
      engine.appendMessage({ id: String(Date.now() + 1), role: 'assistant', content: follow ? `${ack} ${follow.question}` : `${ack} Tell me a bit more so we can lock this in.`, timestamp: new Date() } as any);
      if (follow?.chips?.length) {
        setAiSuggestions(follow.chips);
        setShowIdeas(true);
      }
      return;
    }

    const snapshot = summarizeCaptured({ wizard, captured: updatedCaptured, stage });
    const prompt = buildStagePrompt({
      stage,
      wizard,
      captured: updatedCaptured,
      userInput: extractedContent, // Use extracted content for AI prompt too
      messageCountInStage,
      snapshot,
      gatingReason: gatingInfo.ok ? null : gatingInfo.reason || '',
      stageTurns,
      assessmentHint: assessment.hint || null
    });
    const ai = await generateAI(prompt, {
      model: 'gemini-2.5-flash-lite',
      history: (engine.state.messages as any[])
        .slice(-6)
        .map((m: any) => ({ role: m.role, content: m.content })),
      systemPrompt: 'You are ALF Coach. Be concise, encouraging, and practical. Always add value: acknowledge → educate → enhance → advance. Avoid code blocks.',
      temperature: 0.6,
      maxTokens: 400
    });
    if (ai) {
      engine.appendMessage({ id: String(Date.now() + 1), role: 'assistant', content: ai, timestamp: new Date() } as any);
    }

    // Auto‑advance when valid
    if (gatingInfo.ok) {
      trackEvent('stage_complete', { stage });
      if (!autosaveEnabled) {
        setAutosaveEnabled(true);
      }
      const nxt = nextStage(stage);
      if (nxt) {
        trackEvent('stage_transition', { fromStage: stage, toStage: nxt });
        setStage(nxt);
        setStageTurns(0);
        setHasInput(false);
        setMode('drafting');
        setFocus(nxt === 'JOURNEY' ? 'journey' : nxt === 'DELIVERABLES' ? 'deliverables' : 'ideation');
        if (
          stage === 'BIG_IDEA' &&
          updatedCaptured.ideation?.bigIdea &&
          !nameSuggestionSentRef.current &&
          !hasWizardName
        ) {
          nameSuggestionSentRef.current = true;
          const contextLine = [
            wizard.subjects?.length ? `Subjects: ${wizard.subjects.join(', ')}` : '',
            wizard.gradeLevel ? `Grade band: ${wizard.gradeLevel}` : '',
            wizard.duration ? `Duration: ${wizard.duration}` : ''
          ].filter(Boolean).join(' · ');
          const suggestionPrompt = [
            'Generate three professional, inviting project name options based on this project context.',
            `Big Idea: ${updatedCaptured.ideation.bigIdea}`,
            contextLine ? contextLine : 'General audience',
            '',
            'Rules:',
            '- Exactly three options, numbered 1-3.',
            '- 4-8 words each.',
            '- Avoid colons and punctuation at the end.',
            '- Capture the energy of the Big Idea without sounding like a slogan.',
            'Return only the numbered list.'
          ].join('\n');

          try {
            const suggestions = await generateAI(suggestionPrompt, {
              model: 'gemini-2.5-flash-lite',
              temperature: 0.6,
              maxTokens: 120,
              systemPrompt: 'Voice: grounded, professional, and concise. Provide only the list.'
            });
            if (suggestions) {
              engine.appendMessage({
                id: String(Date.now() + 4),
                role: 'assistant',
                content: `Here are three project name ideas you can use or tweak:\n\n${suggestions}\n\nReply with a number or share your own name to capture the project tone.`,
                timestamp: new Date()
              } as any);
              trackEvent('project_name_suggestions_shown', { options: 3 });
            }
          } catch {
            nameSuggestionSentRef.current = false;
          }
        }
        const transition = transitionMessageFor(stage, updatedCaptured, wizard);
        if (transition) {
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: transition,
            timestamp: new Date()
          } as any);
        }

      } else if (stage === 'DELIVERABLES' && previousStatus !== 'ready' && newStatus === 'ready') {
        // Project is complete - trigger completion flow
        await handleProjectCompletion(updatedCaptured);
      }
    }
  }, [engine, stage, wizard, captured, messageCountInStage, stageTurns, aiStatus, autosaveEnabled, projectId, conversationHistory, handleProjectCompletion, hasWizardName, deliverablesMicroState, deliverablesComplete, journeyV2Enabled, processDeliverablesResult, suppressNextAckUntil, updateDeliverablesChips]);

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Responsive Sidebar - Desktop rail, Mobile slide-over */}
      <ResponsiveSidebar onControls={handleSidebarControls}>
        <WorkingDraftSidebar
          captured={captured}
          currentStage={stage}
          onEditStage={handleEditStage}
        />
      </ResponsiveSidebar>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div
          className="flex-1 min-h-0 overflow-y-auto px-3 pt-2 sm:px-4 sm:pt-2"
          style={{ paddingBottom: Math.max(footerHeight, 72) + 16 }}
        >
          {/* Minimal header with stage indicator and consolidated status */}
          <div className="bg-gray-50 dark:bg-gray-900 pb-1.5 mb-1.5 space-y-1">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                Stage {stageOrder.indexOf(stage) + 1} of {stageOrder.length} · {stageDisplayNames[stage]}
              </div>
              <div className="flex items-center gap-2">
                {(['BIG_IDEA','ESSENTIAL_QUESTION','CHALLENGE'] as const).includes(stage) && (
                  (() => {
                    const { score, missing } = scoreIdeationSpecificity(stage as any, captured, wizard);
                    return (
                      <div className="hidden sm:flex items-center gap-2 text-[10px]">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-semibold">
                          Specificity {score}
                        </span>
                        {missing.length > 0 && (
                          <span className="text-gray-500 dark:text-gray-400">Need: {missing[0]}</span>
                        )}
                      </div>
                    );
                  })()
                )}
                {/* Hidden AIStatus/FirebaseStatus for backward compatibility */}
                <div className="hidden">
                  <AIStatus
                    onStatusChange={(status, detail) => {
                      setAiStatus(status);
                      setAiDetail(detail);
                    }}
                  />
                  <FirebaseStatus />
                </div>
                {/* New consolidated status indicator */}
                <SyncStatusChip projectId={projectId} />
                <StatusIndicator status={systemStatus} />
              </div>
            </div>
            <CompactStageStepper
              currentStage={stage}
              captured={captured}
              labels={stageDisplayNames}
              onSelectStage={handleEditStage}
            />
          </div>
          <div className="mb-1.5">
          <StageKickoffPanel
              stage={stage}
              stageIndex={stageIndex}
              stageCount={stageOrder.length}
              labels={stageDisplayNames}
              experience={experienceLevel}
              summary={stageSummary}
              captured={captured}
              expanded={showKickoffPanel}
              onNavigateToSidebarStage={navigateSidebarToStage}
              gradeBand={gradeBandKey}
              gradeSections={gradeBandSections}
              onToggle={() => {
                kickoffAutoOpenRef.current = false; // user action should not auto-close
                setShowKickoffPanel(prev => {
                  const next = !prev;
                  trackEvent('kickoff_toggle', { stage, expanded: next, gradeBand: gradeBandLabel });
                  return next;
                });
              }}
              onContinue={() => {
                handleStageContinue();
                setShowKickoffPanel(false);
              }}
              onRefine={() => {
                trackEvent('kickoff_refine_clicked', { stage, gradeBand: gradeBandLabel });
                setMode('refining');
                setFocus(stage === 'JOURNEY' ? 'journey' : stage === 'DELIVERABLES' ? 'deliverables' : 'ideation');
                setShowKickoffPanel(false);
              }}
            />
          </div>
          {aiStatus !== 'online' && (
            <div className="mb-3 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <span>{aiStatus === 'checking' ? 'Checking AI availability…' : 'AI is currently unavailable. Try again shortly.'}</span>
              {aiDetail && <span className="text-rose-500 italic">{aiDetail}</span>}
            </div>
          )}
          {showGating && !gating.ok && (
            <>
              <div className="hidden sm:block mb-3 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {gating.reason}
              </div>
              <details className="sm:hidden mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                <summary className="font-semibold text-amber-700 cursor-pointer">Needs attention</summary>
                <p className="mt-2 leading-snug">{gating.reason}</p>
              </details>
            </>
          )}
          <div className="w-full space-y-3 pb-6">
            <MessagesList
              messages={engine.state.messages as any}
              onRefine={(msg) => {
                void handleCoachAction('refine', msg);
              }}
              onPushDeeper={(msg) => {
                void handleCoachAction('push-deeper', msg);
              }}
              actionsDisabled={aiStatus !== 'online'}
              latestAssistantId={latestAssistantId}
            />
            {journeyV2Enabled && stage === 'JOURNEY' ? (
              <>
                {journeyAIStatus !== 'idle' && (
                  <div className="mb-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${journeyAIStatus==='refining' ? 'bg-ai-100 text-ai-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {journeyAIStatus === 'refining' ? 'AI refining… ✨' : 'AI Enhanced ✓'}
                    </span>
                  </div>
                )}
                <JourneyBoard
                  phases={journeyDraft}
                  selectedId={journeyEditingPhaseId}
                  onSelect={handleJourneySelectPhase}
                  onExpandAI={(id) => { setJourneyEditingPhaseId(id); setShowPhaseAI(true); }}
                  onRename={handleJourneyRename}
                  onReorder={handleJourneyReorder}
                  onAdd={handleJourneyAddPhase}
                  onRemove={handleJourneyRemovePhase}
                />
              </>
            ) : null}

            {journeyV2Enabled && stage === 'JOURNEY' ? (
              <>
                <PhaseEditorDrawer
                  open={Boolean(journeyEditingPhaseId && editingPhase)}
                  phase={editingPhase}
                  onClose={() => setJourneyEditingPhaseId(null)}
                  onSave={handleJourneySavePhase}
                />
                <PhaseDetailExpander
                  open={showPhaseAI}
                  phase={editingPhase || null}
                  wizard={wizard}
                  onClose={() => setShowPhaseAI(false)}
                  onApply={(detail) => {
                    if (!editingPhase) { return; }
                    const cleanedTasks = (detail.studentTasks || []).map(t => String(t).replace(/\s*—\s*\d+\s*min\s*$/i, '').trim()).slice(0, 8);
                    const next: JourneyPhaseDraft = {
                      ...editingPhase,
                      activities: cleanedTasks.length ? cleanedTasks : editingPhase.activities,
                      checkpoint: (detail.checkpoints && detail.checkpoints[0]) ? detail.checkpoints[0] : editingPhase.checkpoint
                    };
                    handleJourneySavePhase(next);
                    setShowPhaseAI(false);
                    // Confirmation toast
                    try {
                      const idx = journeyDraft.findIndex(p => p.id === editingPhase.id);
                      const toast = document.createElement('div');
                      toast.textContent = `Applied teacher moves to Phase ${idx >= 0 ? idx + 1 : ''} \u2713`;
                      toast.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-[10000]';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 2000);
                    } catch {}
                  }}
                />
                <DecisionBar
                  primaryLabel="Accept journey map"
                  onPrimary={handleJourneyAccept}
                  primaryDisabled={!journeyCanAccept}
                  secondary={[
                    { label: 'Customize phase', onClick: handleJourneyCustomize },
                    { label: 'Regenerate', onClick: handleJourneyRegenerate, tone: 'danger' }
                  ]}
                  sticky={false}
                />
              </>
            ) : null}
            {deliverablesMicroState && (
              <DeliverablesPreviewCard
                milestones={deliverablesMicroState.suggestedMilestones}
                artifacts={deliverablesMicroState.suggestedArtifacts}
                criteria={deliverablesMicroState.suggestedCriteria}
                onAcceptAll={() => { void handleDeliverablesQuickCommand('yes'); }}
                onCustomize={(section) => {
                  const command = section === 'milestones' ? 'customize milestones' : 'customize artifacts';
                  void handleDeliverablesQuickCommand(command);
                }}
                onRegenerate={() => { void handleDeliverablesQuickCommand('regenerate'); }}
                onRename={handleDeliverablesRename}
                onReorder={handleDeliverablesReorder}
                hideFooter={journeyV2Enabled}
              />
            )}
            {deliverablesMicroState && (
              <div className="mt-2">
                {deliverablesAIStatus !== 'idle' && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${deliverablesAIStatus==='refining' ? 'bg-ai-100 text-ai-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {deliverablesAIStatus === 'refining' ? 'AI refining… ✨' : 'AI Enhanced ✓'}
                  </span>
                )}
              </div>
            )}
            {journeyV2Enabled && stage === 'DELIVERABLES' && deliverablesMicroState ? (
              <DecisionBar
                primaryLabel="Accept deliverables"
                onPrimary={() => { void handleDeliverablesQuickCommand('yes'); }}
                secondary={[
                  { label: 'Customize milestones', onClick: () => { void handleDeliverablesQuickCommand('customize milestones'); } },
                  { label: 'Customize artifacts', onClick: () => { void handleDeliverablesQuickCommand('customize artifacts'); } },
                  { label: 'Regenerate', onClick: () => { void handleDeliverablesQuickCommand('regenerate'); }, tone: 'danger' }
                ]}
                sticky={false}
              />
            ) : null}
            {journeyReceipt && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-800 flex items-center justify-between">
                <span>Journey saved — {journeyReceipt.phaseCount} phases captured.</span>
                <span className="text-[11px] font-semibold text-emerald-600">You can refine anytime from the sidebar.</span>
              </div>
            )}
            {deliverablesReceipt && !deliverablesMicroState && (
              <div className="rounded-2xl border border-primary-300 bg-primary-50 px-4 py-3 text-[12px] text-primary-800 flex items-center justify-between">
                <span>Deliverables locked — {deliverablesReceipt.milestoneCount} milestones, {deliverablesReceipt.artifactCount} artifacts, {deliverablesReceipt.criteriaCount} criteria.</span>
                <span className="text-[11px] font-semibold text-primary-700">Review or tweak from the sidebar anytime.</span>
              </div>
            )}
          </div>
        </div>
        <div
          ref={footerRef}
          className="fixed bottom-0 left-0 right-0 z-40 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 sm:px-4 sm:pb-3 sm:pt-2 border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-black/10 dark:shadow-black/30"
        >
          <div className="relative w-full">
            {projectId && projectStatus === 'ready' && (
              <div className="mb-3 space-y-2">
                <button
                  type="button"
                  onClick={() => navigate(`/app/project/${projectId}/preview`)}
                  disabled={completionState !== 'ready'}
                  aria-busy={completionState === 'processing'}
                  className={`w-full inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-semibold shadow-sm transition-colors ${
                    completionState === 'ready'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-emerald-500/60 text-white/70 cursor-not-allowed'
                  }`}
                >
                  {completionState === 'processing'
                    ? 'Finalizing your project…'
                    : completionState === 'error'
                      ? 'Preview unavailable'
                      : 'View your Review →'}
                </button>
                {completionState === 'processing' && (
                  <p className="text-[11px] text-gray-500 text-center">
                    Sit tight—polishing your showcase for the review page.
                  </p>
                )}
                {completionState === 'error' && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700 space-y-1.5">
                    <p className="font-semibold text-rose-800">Preview not ready yet</p>
                    <p>We hit a snag saving the showcase. Retry finalizing to generate the review view.</p>
                    <button
                      type="button"
                      onClick={() => { void handleProjectCompletion(); }}
                      className="inline-flex items-center rounded-full bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 font-semibold"
                    >
                      Retry finalization
                    </button>
                  </div>
                )}
              </div>
            )}
          {/* Regular suggestions - toggleable via lightbulb */}
          <div
            className={`absolute left-0 right-0 bottom-full mb-3 transition-all duration-200 ease-out ${
              showIdeas ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            {suggestionsLoading ? (
              <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/95 dark:bg-gray-800/90 px-3 py-2 text-[11px] text-gray-500 dark:text-gray-300 shadow-sm">
                Gathering ideas…
              </div>
            ) : suggestions.length > 0 ? (
              <SuggestionChips items={suggestions} onSelect={(t, i) => { setShowIdeas(false); void acceptSuggestion(t, i); }} />
            ) : null}
          </div>
          <InputArea
            value={engine.state.input}
            onChange={engine.setInput}
            onSend={() => void handleSend()}
            onToggleIdeas={() => setShowIdeas(prev => !prev)}
            inputRef={engine.inputRef as any}
            onEscape={() => { /* no-op MVP */ }}
            lastUserMessage={(() => {
              const arr: any[] = engine.state.messages as any[];
              for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i]?.role === 'user') {return arr[i]?.content || '';}
              }
              return '';
            })()}
            disabled={aiStatus !== 'online'}
            ideasActive={showIdeas}
            guidance={{
              what: guide.what,
              why: guide.why,
              tip: guide.tip
            }}
            stageName={stageDisplayNames[stage]}
          />
        </div>
      </div>

      {/* Floating Guidance FAB - Now inline in InputArea */}
      {/* <GuidanceFAB
        guidance={{
          what: guide.what,
          why: guide.why,
          tip: guide.tip,
        }}
        stageName={stageDisplayNames[stage]}
      /> */}
      </div>
    </div>
  );
}

export default ChatMVP;

function getStageSummary(stage: Stage, captured: CapturedData): Array<{ label: string; value: string }> {
  const lines: Array<{ label: string; value: string }> = [];

  switch (stage) {
    case 'BIG_IDEA':
      if (captured.ideation?.bigIdea) {
        lines.push({ label: 'Big Idea', value: captured.ideation.bigIdea });
      }
      break;
    case 'ESSENTIAL_QUESTION':
      if (captured.ideation?.essentialQuestion) {
        lines.push({ label: 'Essential Question', value: captured.ideation.essentialQuestion });
      }
      if (captured.ideation?.bigIdea) {
        lines.push({ label: 'Big Idea anchor', value: captured.ideation.bigIdea });
      }
      break;
    case 'CHALLENGE':
      if (captured.ideation?.challenge) {
        lines.push({ label: 'Authentic challenge', value: captured.ideation.challenge });
      }
      if (captured.ideation?.essentialQuestion) {
        lines.push({ label: 'Driving question', value: captured.ideation.essentialQuestion });
      }
      break;
    case 'JOURNEY': {
      const phases = captured.journey?.phases || [];
      if (phases.length) {
        const preview = phases.slice(0, 3).map((phase, idx) => `${idx + 1}. ${phase.name}`).join(' · ');
        lines.push({ label: 'Phases mapped', value: preview });
      }
      if (captured.journey?.resources?.length) {
        lines.push({ label: 'Resources', value: captured.journey.resources.slice(0, 3).join(', ') });
      }
      break;
    }
    case 'DELIVERABLES': {
      const milestones = captured.deliverables?.milestones || [];
      const artifacts = captured.deliverables?.artifacts || [];
      const criteria = captured.deliverables?.rubric?.criteria || [];
      if (artifacts.length) {
        lines.push({ label: 'Final artifacts', value: artifacts.slice(0, 3).map(a => a.name || a).join(', ') });
      }
      if (milestones.length) {
        lines.push({ label: 'Milestones', value: milestones.slice(0, 3).map(m => m.name || m).join(', ') });
      }
      if (criteria.length) {
        lines.push({ label: 'Rubric criteria', value: criteria.slice(0, 4).join(', ') });
      }
      break;
    }
    default:
      break;
  }

  return lines;
}

type GradeGuardrailSection = { title: string; items: string[] };

function buildGradeBandSections(stage: Stage, rules: GradeBandRule): GradeGuardrailSection[] {
  const take = (arr: string[], count: number) => arr.filter(Boolean).slice(0, count);

  const base: GradeGuardrailSection[] = (() => {
    switch (stage) {
      case 'BIG_IDEA':
      case 'ESSENTIAL_QUESTION':
        return [
          { title: 'Development cues', items: take(rules.developmentalMoves, 2) },
          { title: 'Avoid', items: take(rules.avoid, 1) }
        ];
      case 'CHALLENGE':
        return [
          { title: 'Authenticity guardrails', items: take(rules.scopeAndDeliverables, 2) },
          { title: 'Partner considerations', items: take(rules.partnershipTech, 1) }
        ];
      case 'JOURNEY':
        return [
          { title: 'Scope & pacing', items: take(rules.scopeAndDeliverables, 2) },
          { title: 'Feasibility checks', items: take(rules.safetyFeasibility, 2) }
        ];
      case 'DELIVERABLES':
        return [
          { title: 'Assessment focus', items: take(rules.assessmentFeedback, 2) },
          { title: 'Feasibility checks', items: take(rules.safetyFeasibility, 1) }
        ];
      default:
        return [
          { title: 'Development cues', items: take(rules.developmentalMoves, 2) }
        ];
    }
  })();

  return base.filter(section => section.items.length > 0);
}

function StageKickoffPanel({
  stage,
  stageIndex,
  stageCount,
  expanded,
  onToggle,
  onContinue,
  onRefine,
  continueDisabled,
  refineDisabled,
  labels,
  experience,
  summary,
  captured,
  onNavigateToSidebarStage,
  gradeBand,
  gradeSections
}: {
  stage: Stage;
  stageIndex: number;
  stageCount: number;
  expanded: boolean;
  onToggle(): void;
  onContinue(): void;
  onRefine(): void;
  continueDisabled?: boolean;
  refineDisabled?: boolean;
  labels: Record<Stage, string>;
  experience: 'new' | 'some' | 'experienced';
  summary?: Array<{ label: string; value: string }>;
  captured: CapturedData;
  onNavigateToSidebarStage?: (stage: Stage) => void;
  gradeBand?: GradeBandKey | null;
  gradeSections?: GradeGuardrailSection[];
}) {
  const guide = stageGuide(stage);
  const next = nextStage(stage);
  const continueLabel = next ? `Continue to ${labels[next]}` : 'Review project';
  // Pitfall hints removed per UX decision to keep panel lean.
  const prefersReducedMotion = useReducedMotion();
  const isSimpleStage = stage === 'BIG_IDEA' || stage === 'ESSENTIAL_QUESTION' || stage === 'CHALLENGE';
  const phasesCount = captured.journey?.phases?.length || 0;
  const milestonesCount = captured.deliverables?.milestones?.length || 0;
  const artifactsCount = captured.deliverables?.artifacts?.length || 0;
  const criteriaCount = captured.deliverables?.rubric?.criteria?.length || 0;

  const headerIndicatorClass = expanded ? 'rotate-180' : '';

  const contentId = `kickoff-${stage.toLowerCase()}-content`;

  const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
    `${count} ${count === 1 ? singular : plural}`;

  const handleSidebarNavigate = (target: Stage) => {
    if (onNavigateToSidebarStage) {
      onNavigateToSidebarStage(target);
      return;
    }
    const el = document.querySelector(`[data-draft-stage="${target}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const animation = prefersReducedMotion
    ? {
        initial: { opacity: 1, height: 'auto' },
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 1, height: 'auto' },
        transition: { duration: 0 }
      }
    : {
        initial: { opacity: 0, height: 0 },
        animate: {
          opacity: 1,
          height: 'auto',
          transition: {
            height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.2, delay: 0.05 }
          }
        },
        exit: {
          opacity: 0,
          height: 0,
          transition: {
            height: { duration: 0.2 },
            opacity: { duration: 0.15 }
          }
        }
      };

  const gradeLabel = gradeBand ?? '';
  const effectiveGradeSections = gradeSections ?? [];

  const exampleHints: Record<Stage, { label: string; items?: string[]; tip?: string }> = {
    BIG_IDEA: {
      label: 'Examples',
      items: ['Systems thinking', 'Sustainable design', 'Data ethics']
    },
    ESSENTIAL_QUESTION: {
      label: 'Examples',
      items: [
        'How might we reduce waste in our cafeteria?',
        'What makes a fair algorithm?',
        'How does energy move through a system?'
      ]
    },
    CHALLENGE: {
      label: 'Examples',
      items: [
        'Design a low‑waste lunch system for our school',
        'Advise the city on safer crosswalks near campus',
        'Prototype a tool to visualize local air quality'
      ]
    },
    JOURNEY: {
      label: 'Tip',
      tip: 'Click the lightbulb for sample phases and resources.'
    },
    DELIVERABLES: {
      label: 'Tip',
      tip: 'Click the lightbulb for milestones, artifacts, and rubric ideas.'
    }
  };

  const renderSummary = () => {
    if (!summary || summary.length === 0) {
      return null;
    }

    if (isSimpleStage) {
      return (
        <ul className="space-y-1 text-[12px] text-gray-700 dark:text-gray-200">
          {summary.map(item => (
            <li key={item.label} className="leading-snug"><span className="font-medium">{item.label}:</span> {item.value}</li>
          ))}
        </ul>
      );
    }

    if (stage === 'JOURNEY') {
      return (
        <div className="space-y-2 text-[12px] text-gray-700 dark:text-gray-200">
          <p className="leading-snug">{pluralize(phasesCount, 'phase')} outlined.</p>
          <button
            type="button"
            onClick={() => handleSidebarNavigate('JOURNEY')}
            className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 rounded-md px-1.5 py-0.5 transition-colors dark:text-primary-300"
          >
            View full journey in sidebar →
          </button>
        </div>
      );
    }

    if (stage === 'DELIVERABLES') {
      return (
        <div className="space-y-2 text-[12px] text-gray-700 dark:text-gray-200">
          <p className="leading-snug">
            {pluralize(milestonesCount, 'milestone')} · {pluralize(artifactsCount, 'artifact')} · {pluralize(criteriaCount, 'rubric criterion', 'rubric criteria')}
          </p>
          <button
            type="button"
            onClick={() => handleSidebarNavigate('DELIVERABLES')}
            className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 rounded-md px-1.5 py-0.5 transition-colors dark:text-primary-300"
          >
            View full details in sidebar →
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      id="stage-kickoff-panel"
      className="rounded-[22px] border border-white/60 bg-white/75 shadow-sm backdrop-blur-md transition-shadow dark:border-white/10 dark:bg-gray-900/45 overflow-hidden"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 dark:hover:bg-gray-900/60"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary-500" aria-hidden="true" />
            <span className="text-[11px] uppercase tracking-wide text-primary-700/80 dark:text-primary-200/80">Now shaping</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1 truncate">
            {labels[stage]}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-500 dark:text-gray-400 hidden sm:inline">
            {stageIndex + 1} of {stageCount}
          </span>
          <ChevronDown className={`w-5 h-5 text-primary-600 transition-transform duration-200 ${headerIndicatorClass}`} aria-hidden="true" />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="kickoff-content"
            id={contentId}
            aria-hidden={!expanded}
            {...animation}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-2 flex flex-col gap-2.5">
              <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug">{guide.why}</p>
              {summary && summary.length > 0 && (
                <div className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm px-3 py-2 shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  <p className="uppercase tracking-wide text-[10px] font-semibold text-gray-700 dark:text-gray-200 mb-1">Captured so far</p>
                  {renderSummary()}
                </div>
              )}
              <div className="text-[11px] text-gray-700 dark:text-gray-300 bg-white/60 dark:bg-gray-900/40 border border-white/60 dark:border-white/10 rounded-2xl px-3 py-2 shadow-sm backdrop-blur-sm">
                <p className="font-semibold text-gray-700 dark:text-gray-200 tracking-wide uppercase text-[10px] mb-1">What good looks like</p>
                <p className="leading-snug text-[12px]">{guide.tip}</p>
              </div>
              {/* Quick examples/tips and no public guardrails */}
              <div className="rounded-xl border border-white/60 bg-white/60 backdrop-blur-sm px-3 py-2 shadow-sm dark:border-white/10 dark:bg-gray-900/40 text-[11px] text-gray-700 dark:text-gray-300">
                <p className="font-semibold uppercase tracking-wide text-[10px] mb-1">{exampleHints[stage].label}</p>
                {exampleHints[stage].items ? (
                  <ul className="list-disc pl-4 space-y-1 text-[12px]">
                    {exampleHints[stage].items!.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="leading-snug text-[12px]">{exampleHints[stage].tip}</p>
                )}
                {!exampleHints[stage].items && (
                  <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">Need ideas fast? Tap the lightbulb.</p>
                )}
              </div>
              {/* Gold Standard guidance merged above into "What good looks like" for simplicity */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onContinue}
                  disabled={continueDisabled}
                  className={`inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 ${
                    continueDisabled
                      ? 'bg-primary-200/60 text-primary-800/80 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {continueLabel}
                </button>
                <button
                  type="button"
                  onClick={onRefine}
                  disabled={refineDisabled}
                  className={`inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200 ${
                    refineDisabled
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                  }`}
                >
                  Keep refining {labels[stage]}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
