import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatEngine } from '../../hooks/useChatEngine';
import { MessagesList } from '../../components/chat/MessagesList';
import { InputArea } from '../../components/chat/InputArea';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { StageGuide } from './components/StageGuide';
import { SuggestionChips } from './components/SuggestionChips';
import { AIStatus } from './components/AIStatus';
import { FirebaseStatus } from './components/FirebaseStatus';
import { WorkingDraftSidebar } from './components/WorkingDraftSidebar';
import { ProjectBriefCard } from './components/ProjectBriefCard';
import { JourneyPreviewCard } from './components/JourneyPreviewCard';
import { DeliverablesPreviewCard } from './components/DeliverablesPreviewCard';
import { buildStagePrompt, buildCorrectionPrompt, buildSuggestionPrompt } from './domain/prompt';
import { generateAI } from './domain/ai';
import {
  CapturedData,
  Stage,
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
import {
  initJourneyMicroFlow,
  formatJourneySuggestion,
  handleJourneyChoice,
  detectPhaseReference,
  getJourneyActionChips,
  type JourneyMicroState
} from './domain/journeyMicroFlow';
import {
  initDeliverablesMicroFlow,
  formatDeliverablesSuggestion,
  handleDeliverablesChoice,
  detectComponentReference,
  getDeliverablesActionChips,
  type DeliverablesMicroState
} from './domain/deliverablesMicroFlow';
import { generateCourseDescription } from './domain/courseDescriptionGenerator';
import { getPostCaptureCoaching, getStageGuidance } from './domain/coachingResponses';

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

type JourneyChoiceResult = ReturnType<typeof handleJourneyChoice>;
type DeliverablesChoiceResult = ReturnType<typeof handleDeliverablesChoice>;

export function ChatMVP({
  projectId,
  projectData,
}: {
  projectId?: string;
  projectData?: ChatProjectPayload | null;
}) {
  const navigate = useNavigate();
  const engine = useChatEngine({ initialMessages: [] });
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
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showWorkingDraft, setShowWorkingDraft] = useState(true); // Working Draft sidebar visibility
  const [conversationHistory, setConversationHistory] = useState<string[]>([]); // Last 5 user inputs for context
  const [journeyMicroState, setJourneyMicroState] = useState<JourneyMicroState | null>(null);
  const [deliverablesMicroState, setDeliverablesMicroState] = useState<DeliverablesMicroState | null>(null);
  const [microFlowActionChips, setMicroFlowActionChips] = useState<string[]>([]); // Action chips for micro-flows
  const [mode, setMode] = useState<'drafting' | 'refining' | 'validating'>('drafting');
  const [focus, setFocus] = useState<'ideation' | 'journey' | 'deliverables' | 'overview'>('ideation');
  const [showBrief, setShowBrief] = useState(true);
  const [suppressNextAckUntil, setSuppressNextAckUntil] = useState<number | null>(null);
  const [journeyReceipt, setJourneyReceipt] = useState<{ phaseCount: number; timestamp: number } | null>(null);
  const [deliverablesReceipt, setDeliverablesReceipt] = useState<{ milestoneCount: number; artifactCount: number; criteriaCount: number; timestamp: number } | null>(null);
  const stageIndex = stageOrder.indexOf(stage);
  const projectStatus = useMemo(() => computeStatus(captured), [captured]);

  const wizard = useMemo(() => {
    const w = projectData?.wizardData || {};
    const subjects: string[] = Array.isArray(w.projectContext?.subjects) ? w.projectContext.subjects : (w.subjects || []);
    return {
      subjects,
      gradeLevel: w.projectContext?.gradeLevel || w.gradeLevel || '',
      duration: w.projectContext?.timeWindow || w.duration || '',
      location: w.projectContext?.space || w.location || '',
      projectTopic: w.projectTopic || '',
      materials: Array.isArray(w.projectContext?.availableMaterials) ? w.projectContext.availableMaterials.join(', ') : w.materials || ''
    };
  }, [projectData]);

  const messageCountInStage = stageTurns;

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
    if (!journeyReceipt) return;
    const timeout = setTimeout(() => setJourneyReceipt(null), 8000);
    return () => clearTimeout(timeout);
  }, [journeyReceipt]);

  useEffect(() => {
    if (!deliverablesReceipt) return;
    const timeout = setTimeout(() => setDeliverablesReceipt(null), 8000);
    return () => clearTimeout(timeout);
  }, [deliverablesReceipt]);

  // Initial welcome from AI (no manual fallback)
  useEffect(() => {
    if (engine.state.messages.length > 0) return;
    const greet = async () => {
      const context = {
        subjects: wizard.subjects?.length ? wizard.subjects.join(', ') : 'your subject area',
        grade: wizard.gradeLevel || 'your students',
        duration: wizard.duration || 'your timeline',
        topic: wizard.projectTopic || 'the concept you have in mind',
      };

      const intro = await generateAI(
        [
          'You are the ALF instructional coach welcoming an educator. Keep the response under 55 words.',
          'The educator is experienced; acknowledge their expertise and co-design approach. Sound like a trusted peer, not a cheerleader.',
          `Subject focus: ${context.subjects}. Grade band: ${context.grade}. Project duration: ${context.duration}. Current spark/topic: ${context.topic}.`,
          'Open with one vivid sentence that links the subject and grade to a real-world opportunity.',
          'Second sentence should honor the teacher’s expertise and frame this project as a collaboration that gives students agency.',
          'End with one focused question asking for the core Big Idea they want students to carry beyond the unit.',
          'Never use generic phrases like "Hello educators" or "get ready". Mention the subject or learner context explicitly in the first sentence.'
        ].join('\n'),
        {
          model: 'gemini-2.5-flash-lite',
          temperature: 0.55,
          maxTokens: 120,
          systemPrompt:
            'Voice: grounded, collegial, specific. Imagine coaching a respected peer at a planning retreat. Keep language tight and meaningful.'
        }
      );
      if (intro) {
        engine.appendMessage({ id: String(Date.now()), role: 'assistant', content: intro, timestamp: new Date() } as any);
      }
    };
    void greet();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      if (cancelled) return;
      setCaptured(hydrated);
      const rawStage = (projectData as any)?.stage ?? storedProject?.stage ?? null;

      let initialStage = deriveCurrentStage(hydrated);
      if (typeof rawStage === 'string') {
        const normalized = rawStage.toUpperCase()
          .replace(/\s+/g, '_') as Stage;
        if (stageOrder.includes(normalized)) {
          initialStage = normalized;
        }
      }

      setStage(initialStage);
      setStageTurns(0);
      setInitialized(true);
      setAutosaveEnabled(Object.keys(serializeCaptured(hydrated)).length > 0);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [projectId, projectData]);

  const persist = useCallback(async () => {
    try {
      if (!projectId) return;
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
    if (!initialized || !autosaveEnabled) return;
    const t = setTimeout(() => { void persist(); }, 1200);
    return () => clearTimeout(t);
  }, [persist, initialized, autosaveEnabled, captured, stage]);

  const fallbackSuggestions = useMemo(() => {
    const base = stageSuggestions(stage);
    const dyn = dynamicSuggestions(stage, { subjects: wizard.subjects, projectTopic: wizard.projectTopic }, captured);
    return Array.from(new Set([...(dyn || []), ...base])).slice(0, 3);
  }, [stage, wizard.subjects, wizard.projectTopic, captured]);
  const suggestions = aiSuggestions.length ? aiSuggestions : fallbackSuggestions;
  const guide = useMemo(() => stageGuide(stage), [stage]);
  const gating = validate(stage, captured);
  const showGating = hasInput || stage !== 'BIG_IDEA';

  const stageCompletion = useMemo(() => {
    return stageOrder.map((stageKey, idx) => {
      const ok = validate(stageKey as Stage, captured).ok;
      let state: 'complete' | 'active' | 'pending';
      if (idx === stageIndex) {
        state = 'active';
      } else if (ok) {
        state = 'complete';
      } else {
        state = 'pending';
      }
      return {
        key: stageKey,
        label: stageKey.replace(/_/g, ' ').toLowerCase(),
        state,
      };
    });
  }, [captured, stageIndex]);

  const stageSummary = useMemo(() => getStageSummary(stage, captured), [stage, captured]);

  const latestAssistantId = useMemo(() => {
    const msgs = engine.state.messages as any[];
    for (let i = msgs.length - 1; i >= 0; i -= 1) {
      if (msgs[i]?.role === 'assistant') return String(msgs[i]?.id);
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
        if (cancelled) return;
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
    if (aiStatus !== 'online') return;
    if (latestAssistantId && String(message.id) !== latestAssistantId) return;

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

  const handleProjectCompletion = useCallback(async () => {
    if (!projectId) {
      console.error('[ChatMVP] Cannot complete project without projectId');
      return;
    }

    try {
      // Generate professional course description
      const description = await generateCourseDescription(captured, wizard);

      // Extract display metadata
      const gradeLevel = wizard.gradeLevel || 'K-12';
      const subjects = wizard.subjects || [];
      const subject = subjects.length > 0 ? subjects.join(', ') : 'General';
      const duration = wizard.duration || '';

      // Build complete project title (use auto-generated or big idea)
      const existingProject = await unifiedStorage.loadProject(projectId);
      const projectTitle = existingProject?.title ||
                          captured.ideation?.bigIdea?.split(' ').slice(0, 8).join(' ') ||
                          'Untitled Project';

      // Build complete project structure
      const completeProject = {
        id: projectId,
        title: projectTitle,
        description,

        // Display metadata
        gradeLevel,
        subject,
        subjects,
        duration,

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
          ideation: captured.ideation,
          journey: captured.journey,
          deliverables: captured.deliverables
        },

        // Also store in legacy format for compatibility
        ideation: captured.ideation,
        journey: captured.journey,
        deliverables: captured.deliverables,

        // Project metadata
        bigIdea: captured.ideation?.bigIdea,
        essentialQuestion: captured.ideation?.essentialQuestion,
        challenge: captured.ideation?.challenge,

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

      // Show completion message with celebration
      engine.appendMessage({
        id: String(Date.now() + 10),
        role: 'assistant',
        content: `🎉 **Project Complete!**\n\nYour PBL project **"${projectTitle}"** is ready!\n\nI've structured everything you need:\n• **${captured.journey?.phases?.length || 0} learning phases** with clear progressions\n• **${captured.deliverables?.milestones?.length || 0} milestones** to track student progress\n• **${captured.deliverables?.artifacts?.length || 0} artifacts** for authentic assessment\n• **Professional rubric** with ${captured.deliverables?.rubric?.criteria?.length || 0} quality criteria\n\n**Next Steps:**\n→ View your complete project on the Dashboard\n→ Export as PDF for planning\n→ Share with your team for feedback\n\nGreat work bringing this vision to life! Your students will love this experience.`,
        timestamp: new Date()
      } as any);

      console.log('[ChatMVP] Project completed successfully', { projectId, title: projectTitle });

    } catch (error) {
      console.error('[ChatMVP] Project completion failed', error);

      engine.appendMessage({
        id: String(Date.now() + 10),
        role: 'assistant',
        content: 'I encountered an issue finalizing your project. Don\'t worry—all your work is safely autosaved. Let me try saving it again, or you can view your draft on the dashboard.',
        timestamp: new Date()
      } as any);
    }
  }, [captured, wizard, projectId, engine]);

  const handleEditStage = useCallback((targetStage: Stage) => {
    // Reset micro-flow states when navigating to a stage
    if (targetStage === 'JOURNEY') {
      setJourneyMicroState(null);
    } else if (targetStage === 'DELIVERABLES') {
      setDeliverablesMicroState(null);
    }

    // Clear action chips
    setMicroFlowActionChips([]);

    // Navigate to the stage
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
  }, [captured, wizard, engine]);

  const handleStageContinue = useCallback(() => {
    const next = nextStage(stage);
    if (!next) {
      setMode('validating');
      setFocus('overview');
      return;
    }

    setMode('drafting');
    setFocus(next === 'JOURNEY' ? 'journey' : next === 'DELIVERABLES' ? 'deliverables' : 'ideation');
    setStage(next);
    setStageTurns(0);
    setHasInput(false);
    setJourneyMicroState(next === 'JOURNEY' ? null : journeyMicroState);
    setDeliverablesMicroState(next === 'DELIVERABLES' ? null : deliverablesMicroState);
    setMicroFlowActionChips([]);

    const transition = transitionMessageFor(stage, captured, wizard);
    if (transition) {
      engine.appendMessage({
        id: String(Date.now() + 3),
        role: 'assistant',
        content: transition,
        timestamp: new Date()
      } as any);
    }
  }, [stage, journeyMicroState, deliverablesMicroState, captured, wizard, engine]);

  const processJourneyResult = useCallback(async (
    currentState: JourneyMicroState,
    result: JourneyChoiceResult
  ) => {
    switch (result.action) {
      case 'show_all': {
        const nextState = result.updatedState ?? currentState;
        setJourneyMicroState(nextState);
        setMicroFlowActionChips(getJourneyActionChips(nextState));
        const suggestion = formatJourneySuggestion(nextState);
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: suggestion,
          timestamp: new Date()
        } as any);
        return true;
      }

      case 'accept_all': {
        const updatedCaptured = captureStageInput(captured, stage, JSON.stringify(result.finalPhases));
        setCaptured(updatedCaptured);
        setJourneyMicroState(null);
        setMicroFlowActionChips([]);
        setJourneyReceipt({ phaseCount: result.finalPhases?.length ?? 0, timestamp: Date.now() });

        const coaching = getPostCaptureCoaching(stage, updatedCaptured, wizard);
        let combinedMessage = coaching || "Great! I've captured your learning journey.";

        const gatingInfo = validate(stage, updatedCaptured);
        if (gatingInfo.ok) {
          if (!autosaveEnabled) setAutosaveEnabled(true);
          const nxt = nextStage(stage);
          if (nxt) {
            setStage(nxt);
            setStageTurns(0);
            setHasInput(false);
            setMode('drafting');
            setFocus(nxt === 'JOURNEY' ? 'journey' : nxt === 'DELIVERABLES' ? 'deliverables' : 'ideation');

            const transition = transitionMessageFor(stage, updatedCaptured, wizard);
            if (transition) {
              combinedMessage = `${combinedMessage}\n\n${transition}`;
            }

            if (nxt === 'DELIVERABLES') {
              const microState = initDeliverablesMicroFlow(updatedCaptured, wizard);
              setDeliverablesMicroState(microState);
              const deliverablesSuggestion = formatDeliverablesSuggestion(microState);
              combinedMessage = `${combinedMessage}\n\n${deliverablesSuggestion}`;
              setMicroFlowActionChips(getDeliverablesActionChips(microState));
            }
          }
        }

        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: combinedMessage,
          timestamp: new Date()
        } as any);
        return true;
      }

      case 'refine': {
        if (result.updatedState) {
          setJourneyMicroState(result.updatedState);
          setMicroFlowActionChips(getJourneyActionChips(result.updatedState));
          const suggestion = formatJourneySuggestion(result.updatedState);
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: suggestion,
            timestamp: new Date()
          } as any);
        }
        return true;
      }

      case 'regenerate': {
        const microState = initJourneyMicroFlow(captured, wizard);
        setJourneyMicroState(microState);
        setMicroFlowActionChips(getJourneyActionChips(microState));
        const journeySuggestion = formatJourneySuggestion(microState);
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: "Let's try a different approach.\n\n" + journeySuggestion,
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
          setMicroFlowActionChips(getJourneyActionChips(currentState));
        }
        return true;
      }

      default:
        return false;
    }
  }, [autosaveEnabled, captured, engine, stage, wizard]);

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
        setMicroFlowActionChips([]);
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
          await handleProjectCompletion();
        }
        return true;
      }

      case 'show_all': {
        const nextState = result.newState ?? currentState;
        setDeliverablesMicroState(nextState);
        setMicroFlowActionChips(getDeliverablesActionChips(nextState));
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
        const microState = initDeliverablesMicroFlow(captured, wizard);
        setDeliverablesMicroState(microState);
        setMicroFlowActionChips(getDeliverablesActionChips(microState));
        const deliverablesSuggestion = formatDeliverablesSuggestion(microState);
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: "Let's try a different approach.\n\n" + deliverablesSuggestion,
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
          setMicroFlowActionChips(getDeliverablesActionChips(currentState));
        }
        return true;
      }

      default:
        return false;
    }
  }, [captured, engine, handleProjectCompletion, wizard, stage]);

  const handleJourneyQuickCommand = useCallback(async (command: string) => {
    if (!journeyMicroState) return;
    const result = handleJourneyChoice(journeyMicroState, command);
    await processJourneyResult(journeyMicroState, result);
  }, [journeyMicroState, processJourneyResult]);

  const handleDeliverablesQuickCommand = useCallback(async (command: string) => {
    if (!deliverablesMicroState) return;
    const result = handleDeliverablesChoice(deliverablesMicroState, command);
    await processDeliverablesResult(deliverablesMicroState, result);
  }, [deliverablesMicroState, processDeliverablesResult]);

  const handleJourneyRenamePhase = useCallback((index: number, name: string) => {
    setJourneyMicroState(prev => {
      if (!prev) return prev;
      const updated = prev.suggestedPhases.map((phase, idx) => idx === index ? { ...phase, name } : phase);
      const working = prev.workingPhases?.map((phase, idx) => idx === index ? { ...phase, name } : phase) || prev.workingPhases;
      const nextState = { ...prev, suggestedPhases: updated, workingPhases: working ?? [] };
      setMicroFlowActionChips(getJourneyActionChips(nextState));
      return nextState;
    });
  }, []);

  const handleJourneyReorderPhase = useCallback((from: number, to: number) => {
    if (from === to) return;
    setJourneyMicroState(prev => {
      if (!prev) return prev;
      const updated = [...prev.suggestedPhases];
      const [moved] = updated.splice(from, 1);
      if (!moved) return prev;
      updated.splice(to, 0, moved);
      const working = prev.workingPhases?.length ? [...prev.workingPhases] : [];
      if (working.length) {
        const [workingMoved] = working.splice(from, 1);
        if (workingMoved) {
          working.splice(to, 0, workingMoved);
        }
      }
      const nextState = { ...prev, suggestedPhases: updated, workingPhases: working };
      setMicroFlowActionChips(getJourneyActionChips(nextState));
      return nextState;
    });
  }, []);

  const handleDeliverablesRename = useCallback((section: 'milestones' | 'artifacts' | 'criteria', index: number, text: string) => {
    setDeliverablesMicroState(prev => {
      if (!prev) return prev;
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
      setMicroFlowActionChips(getDeliverablesActionChips(clone));
      return clone;
    });
  }, []);

  const handleDeliverablesReorder = useCallback((section: 'milestones' | 'artifacts' | 'criteria', from: number, to: number) => {
    if (from === to) return;
      setDeliverablesMicroState(prev => {
        if (!prev) return prev;
        const clone = { ...prev };
        const reorder = <T,>(arr: T[]) => {
          const copy = [...arr];
          const [moved] = copy.splice(from, 1);
          if (moved === undefined) return arr;
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
        setMicroFlowActionChips(getDeliverablesActionChips(clone));
        return clone;
      });
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    if (aiStatus !== 'online') {
      return;
    }
    const content = (text ?? engine.state.input ?? '').trim();
    if (!content) return;

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
            if (!autosaveEnabled) setAutosaveEnabled(true);
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

              // JOURNEY STAGE: Initialize micro-flow but DON'T auto-dump suggestion
              // Wait for user to ask for it - reduces information overload
              if (nxt === 'JOURNEY') {
                const microState = initJourneyMicroFlow(updatedCaptured, wizard);
                setJourneyMicroState(microState);
                // Suggestion will show when user responds (see lines 701-715)
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
        if (journeyMicroState || deliverablesMicroState) {
          setJourneyMicroState(null);
          setDeliverablesMicroState(null);
          setMicroFlowActionChips([]);

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

    // JOURNEY STAGE: Initialize micro-flow if not already active - SINGLE-SHOT
    if (stage === 'JOURNEY' && !journeyMicroState) {
      const microState = initJourneyMicroFlow(captured, wizard);
      setJourneyMicroState(microState);
      setSuppressNextAckUntil(Date.now() + 500);
      engine.appendMessage({
        id: String(Date.now() + 2),
        role: 'assistant',
        content: "I've mapped a complete learning journey based on your context. Review the card below to accept or tweak it.",
        timestamp: new Date()
      } as any);

      setMicroFlowActionChips(getJourneyActionChips(microState));
      return;
    }

    // JOURNEY STAGE: Handle user response to journey suggestion
    if (stage === 'JOURNEY' && journeyMicroState) {
      const phaseRef = detectPhaseReference(content);
      const result = handleJourneyChoice(journeyMicroState, content, phaseRef);
      if (await processJourneyResult(journeyMicroState, result)) {
        return;
      }
    }

    // DELIVERABLES STAGE: Initialize micro-flow if not already active
    if (stage === 'DELIVERABLES' && !deliverablesMicroState) {
      const microState = initDeliverablesMicroFlow(captured, wizard);
      setDeliverablesMicroState(microState);
      setSuppressNextAckUntil(Date.now() + 500);
      engine.appendMessage({
        id: String(Date.now() + 2),
        role: 'assistant',
        content: "Here's a complete deliverables package—milestones, artifacts, and rubric. Review the card below to finalize or customize.",
        timestamp: new Date()
      } as any);

      setMicroFlowActionChips(getDeliverablesActionChips(microState));
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
    const snapshot = summarizeCaptured({ wizard, captured: updatedCaptured, stage });
    const prompt = buildStagePrompt({
      stage,
      wizard,
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
      if (!autosaveEnabled) {
        setAutosaveEnabled(true);
      }
      const nxt = nextStage(stage);
      if (nxt) {
        setStage(nxt);
        setStageTurns(0);
        setHasInput(false);
        setMode('drafting');
        setFocus(nxt === 'JOURNEY' ? 'journey' : nxt === 'DELIVERABLES' ? 'deliverables' : 'ideation');
        // Auto-generate a project name when the Big Idea is first captured and no name exists
        try {
          if (stage === 'BIG_IDEA' && updatedCaptured.ideation?.bigIdea && projectId) {
            const makeName = (idea: string) => {
              const cleaned = idea
                .replace(/[\.!?]+$/g, '')
                .split(/\s+/)
                .slice(0, 8)
                .join(' ');
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
          }
        } catch {}
        const transition = transitionMessageFor(stage, updatedCaptured, wizard);
        if (transition) {
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: transition,
            timestamp: new Date()
          } as any);
        }

        // JOURNEY STAGE: Initialize micro-flow and show complete journey suggestion
        if (nxt === 'JOURNEY') {
          const microState = initJourneyMicroFlow(updatedCaptured, wizard);
          setJourneyMicroState(microState);

          // SINGLE-SHOT: Show complete journey immediately
          const journeySuggestion = formatJourneySuggestion(microState);
          engine.appendMessage({
            id: String(Date.now() + 3),
            role: 'assistant',
            content: journeySuggestion,
            timestamp: new Date()
          } as any);

          // Show action chips
          setMicroFlowActionChips(getJourneyActionChips(microState));
        }
      } else if (stage === 'DELIVERABLES' && previousStatus !== 'ready' && newStatus === 'ready') {
        // Project is complete - trigger completion flow
        await handleProjectCompletion();
      }
    }
  }, [engine, stage, wizard, captured, messageCountInStage, stageTurns, aiStatus, autosaveEnabled, projectId, conversationHistory, handleProjectCompletion]);

  return (
    <div className="relative flex min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
      {/* Working Draft Sidebar */}
      {showWorkingDraft && (
        <div className="hidden md:flex md:w-72 lg:w-80 flex-shrink-0 border-r border-gray-200/60 dark:border-gray-800/60">
          <WorkingDraftSidebar
            captured={captured}
            currentStage={stage}
            onEditStage={handleEditStage}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex min-h-[100dvh] flex-col min-w-0">
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Stage {stageOrder.indexOf(stage) + 1} of {stageOrder.length} · {stage.replace(/_/g, ' ').toLowerCase()}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <AIStatus
                onStatusChange={(status, detail) => {
                  setAiStatus(status);
                  setAiDetail(detail);
                }}
              />
              <FirebaseStatus />
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2 text-[11px] overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
            {stageCompletion.map(({ key, label, state }) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 border text-[11px] snap-start whitespace-nowrap ${
                  state === 'complete'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : state === 'active'
                    ? 'border-primary-300 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${state === 'complete' ? 'bg-emerald-500' : state === 'active' ? 'bg-primary-500 animate-pulse' : 'bg-gray-300'}`} />
                {label}
              </span>
            ))}
          </div>
          <ProjectBriefCard
            subjects={wizard.subjects || []}
            gradeLevel={wizard.gradeLevel || ''}
            duration={wizard.duration || ''}
            projectTopic={wizard.projectTopic || ''}
            bigIdea={captured.ideation?.bigIdea}
            essentialQuestion={captured.ideation?.essentialQuestion}
            challenge={captured.ideation?.challenge}
            collapsed={!showBrief}
            currentStage={stage}
            onToggle={() => setShowBrief(prev => !prev)}
            onQuickEdit={(field) => {
              engine.appendMessage({
                id: String(Date.now() + 5),
                role: 'assistant',
                content: `Happy to adjust your ${field === 'projectTopic' ? 'project focus' : field}. Just let me know the updated value when you're ready.`,
                timestamp: new Date()
              } as any);
            }}
          />
          <StageKickoffPanel
            stage={stage}
            onContinue={() => handleStageContinue()}
            onRefine={() => {
              setMode('refining');
              setFocus(stage === 'JOURNEY' ? 'journey' : stage === 'DELIVERABLES' ? 'deliverables' : 'ideation');
            }}
          />
          {aiStatus !== 'online' && (
            <div className="mb-3 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-center justify-between">
              <span>{aiStatus === 'checking' ? 'Checking AI availability…' : 'AI is currently unavailable. Try again shortly.'}</span>
              {aiDetail && <span className="text-rose-500 italic">{aiDetail}</span>}
            </div>
          )}
          <div className="hidden sm:block">
            <StageGuide {...guide} />
          </div>
          {stageSummary.length > 0 && (
            <>
              <div className="hidden sm:block mt-3 mb-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-2 text-[12px] text-gray-600 dark:text-gray-300">
                <div className="uppercase tracking-wide text-[11px] text-gray-500 dark:text-gray-400 mb-1">Captured so far</div>
                <ul className="space-y-1">
                  {stageSummary.map(item => (
                    <li key={item.label} className="leading-snug"><span className="font-medium text-gray-700 dark:text-gray-100">{item.label}:</span> {item.value}</li>
                  ))}
                </ul>
              </div>
              <details className="sm:hidden mt-3 mb-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/90 dark:bg-gray-800/90 px-3 py-2 text-[12px] text-gray-600 dark:text-gray-300">
                <summary className="uppercase tracking-wide text-[11px] text-gray-500 dark:text-gray-400 cursor-pointer">Captured so far</summary>
                <ul className="space-y-1 mt-2">
                  {stageSummary.map(item => (
                    <li key={item.label} className="leading-snug"><span className="font-medium text-gray-700 dark:text-gray-100">{item.label}:</span> {item.value}</li>
                  ))}
                </ul>
              </details>
            </>
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
            {journeyMicroState && (
              <JourneyPreviewCard
                phases={journeyMicroState.suggestedPhases}
                onAcceptAll={() => { void handleJourneyQuickCommand('yes'); }}
                onMakeShorter={() => { void handleJourneyQuickCommand('make it shorter'); }}
                onDifferentApproach={() => { void handleJourneyQuickCommand('different approach'); }}
                onRenamePhase={handleJourneyRenamePhase}
                onReorderPhase={handleJourneyReorderPhase}
              />
            )}
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
              />
            )}
            {journeyReceipt && !journeyMicroState && (
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
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-1 sm:px-4 sm:pb-5 sm:pt-2 border-t border-gray-200 dark:border-gray-800">
          <div className="relative w-full">
            {projectId && projectStatus === 'ready' && (
              <div className="mb-3">
                <button
                  type="button"
                onClick={() => navigate(`/app/project/${projectId}/preview`)}
                className="w-full inline-flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold px-4 py-2 shadow-sm"
              >
                View your Review →
              </button>
            </div>
          )}
          {/* Micro-flow action chips - always visible when available */}
          {microFlowActionChips.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Action options</p>
              <SuggestionChips
                items={microFlowActionChips}
                onSelect={(t) => {
                  setMicroFlowActionChips([]); // Clear chips when user clicks one
                  void handleSend(t);
                }}
              />
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
              <SuggestionChips items={suggestions} onSelect={(t) => { setShowIdeas(false); void handleSend(t); }} />
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
                if (arr[i]?.role === 'user') return arr[i]?.content || '';
              }
              return '';
            })()}
            disabled={aiStatus !== 'online'}
            ideasActive={showIdeas}
          />
        </div>
      </div>
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

function StageKickoffPanel({
  stage,
  onContinue,
  onRefine,
  continueDisabled,
  refineDisabled
}: {
  stage: Stage;
  onContinue(): void;
  onRefine(): void;
  continueDisabled?: boolean;
  refineDisabled?: boolean;
}) {
  const guide = stageGuide(stage);
  const next = nextStage(stage);
  const continueLabel = next ? `Continue to ${stageDisplayNames[next]}` : 'Review project';
  return (
    <div className="mb-3 rounded-2xl border border-primary-100/70 dark:border-primary-900/40 bg-primary-50/70 dark:bg-primary-950/20 px-4 py-3">
      <div className="flex flex-col gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-primary-700/80 dark:text-primary-200/80">Now shaping</p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{stageDisplayNames[stage]}</h3>
        </div>
        <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug">{guide.why}</p>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-900/40 border border-white/60 dark:border-gray-800/70 rounded-xl px-3 py-2">
          <p className="font-semibold text-gray-600 dark:text-gray-300 tracking-wide uppercase text-[10px] mb-1">What good looks like</p>
          <p className="leading-snug text-[12px]">{guide.tip}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onContinue}
            disabled={continueDisabled}
            className={`inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
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
            className={`inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
              refineDisabled
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
            }`}
          >
            Keep refining {stageDisplayNames[stage]}
          </button>
        </div>
      </div>
    </div>
  );
}
