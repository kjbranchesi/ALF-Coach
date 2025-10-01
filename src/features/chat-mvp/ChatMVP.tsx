import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useChatEngine } from '../../hooks/useChatEngine';
import { MessagesList } from '../../components/chat/MessagesList';
import { InputArea } from '../../components/chat/InputArea';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { StageGuide } from './components/StageGuide';
import { SuggestionChips } from './components/SuggestionChips';
import { AIStatus } from './components/AIStatus';
import { FirebaseStatus } from './components/FirebaseStatus';
import { WorkingDraftSidebar } from './components/WorkingDraftSidebar';
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
import { detectIntent, getImmediateAcknowledgment, type UserIntent } from './domain/intentDetection';
import { suggestionTracker } from './domain/suggestionTracking';
import {
  initJourneyMicroFlow,
  formatJourneySuggestion,
  handleJourneyChoice,
  detectPhaseReference,
  type JourneyMicroState
} from './domain/journeyMicroFlow';
import {
  initDeliverablesMicroFlow,
  formatDeliverablesSuggestion,
  handleDeliverablesChoice,
  detectComponentReference,
  type DeliverablesMicroState
} from './domain/deliverablesMicroFlow';

type ChatProjectPayload = {
  wizardData?: any | null;
  projectData?: any | null;
  capturedData?: Record<string, unknown> | null;
};

export function ChatMVP({
  projectId,
  projectData,
}: {
  projectId?: string;
  projectData?: ChatProjectPayload | null;
}) {
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
  const stageIndex = stageOrder.indexOf(stage);

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

      await unifiedStorage.saveProject({
        id: projectId,
        lastOpenedStep: stage,
        stage,
        status,
        capturedData: capturedPayload,
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

    // CRITICAL: Detect intent BEFORE validation
    const recentSuggestionTexts = suggestionTracker.getRecentTexts(5);
    const intentResult = detectIntent(content, recentSuggestionTexts, conversationHistory);

    // Handle immediate acknowledgment for conversational inputs
    const immediateAck = getImmediateAcknowledgment(intentResult.intent);
    if (immediateAck) {
      engine.appendMessage({
        id: String(Date.now() + 1),
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

          // Confirmation message
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: `Perfect! I've captured that. ${validate(stage, updatedCaptured).ok ? "Let's move forward." : "Feel free to refine it further."}`,
            timestamp: new Date()
          } as any);

          // Check if stage is complete
          const gatingInfo = validate(stage, updatedCaptured);
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
                    await unifiedStorage.saveProject({ id: projectId, title: candidateName });
                  }
                } catch {}
              }

              // Transition message
              const transition = transitionMessageFor(stage, updatedCaptured, wizard);
              if (transition) {
                engine.appendMessage({
                  id: String(Date.now() + 3),
                  role: 'assistant',
                  content: transition,
                  timestamp: new Date()
                } as any);
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
        // Let AI handle clarification
        const clarifyPrompt = `The teacher said: "${content}". They seem confused or need clarification about the current stage (${stage.replace(/_/g, ' ').toLowerCase()}). Provide a brief, helpful clarification in under 60 words.`;
        const clarification = await generateAI(clarifyPrompt, {
          model: 'gemini-2.5-flash-lite',
          history: [],
          systemPrompt: 'You are ALF Coach. Be clear, patient, and helpful.',
          temperature: 0.5,
          maxTokens: 200
        });

        if (clarification) {
          engine.appendMessage({
            id: String(Date.now() + 2),
            role: 'assistant',
            content: clarification,
            timestamp: new Date()
          } as any);
        }
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

      case 'substantive_input':
      default:
        // Proceed to normal validation flow
        break;
    }

    // Normal validation flow for substantive input
    const assessment = assessStageInput(stage, content);
    if (!assessment.ok) {
      const correctionPrompt = buildCorrectionPrompt({
        stage,
        wizard,
        userInput: content,
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
    const updatedCaptured = captureStageInput(captured, stage, content);
    const newStatus = computeStatus(updatedCaptured);
    setCaptured(updatedCaptured);

    const gatingInfo = validate(stage, updatedCaptured);
    const snapshot = summarizeCaptured({ wizard, captured: updatedCaptured, stage });
    const prompt = buildStagePrompt({
      stage,
      wizard,
      userInput: content,
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
              await unifiedStorage.saveProject({ id: projectId, title: candidateName });
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
      } else if (stage === 'DELIVERABLES' && previousStatus !== 'ready' && newStatus === 'ready') {
        engine.appendMessage({
          id: String(Date.now() + 2),
          role: 'assistant',
          content: 'Fantastic. You now have milestones, artifacts, and rubric criteria. Export or share the project when you’re ready.',
          timestamp: new Date()
        } as any);
      }
    }
  }, [engine, stage, wizard, captured, messageCountInStage, stageTurns, aiStatus, autosaveEnabled, projectId, conversationHistory]);

  return (
    <div className="relative flex h-full max-h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Working Draft Sidebar */}
      {showWorkingDraft && (
        <div className="hidden md:block w-64 flex-shrink-0">
          <WorkingDraftSidebar
            captured={captured}
            currentStage={stage}
          />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Stage {stageOrder.indexOf(stage) + 1} of {stageOrder.length} · {stage.replace(/_/g, ' ').toLowerCase()}
          </div>
          <div className="flex items-center gap-2">
            <AIStatus
              onStatusChange={(status, detail) => {
                setAiStatus(status);
                setAiDetail(detail);
              }}
            />
            <FirebaseStatus />
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px]">
          {stageCompletion.map(({ key, label, state }) => (
            <span
              key={key}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 border text-[11px] ${
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
        {aiStatus !== 'online' && (
          <div className="mb-3 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <span>{aiStatus === 'checking' ? 'Checking AI availability…' : 'AI is currently unavailable. Try again shortly.'}</span>
            {aiDetail && <span className="text-rose-500 italic">{aiDetail}</span>}
          </div>
        )}
        <StageGuide {...guide} />
        {stageSummary.length > 0 && (
          <div className="mt-3 mb-3 rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-3 py-2 text-[12px] text-gray-600 dark:text-gray-300">
            <div className="uppercase tracking-wide text-[11px] text-gray-500 dark:text-gray-400 mb-1">Captured so far</div>
            <ul className="space-y-1">
              {stageSummary.map(item => (
                <li key={item.label} className="leading-snug"><span className="font-medium text-gray-700 dark:text-gray-100">{item.label}:</span> {item.value}</li>
              ))}
            </ul>
          </div>
        )}
        {showGating && !gating.ok && (
          <div className="mb-3 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {gating.reason}
          </div>
        )}
        <div className="w-full space-y-3">
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
        </div>
        <div className="h-16" />
      </div>
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-3 pb-3 pt-1 sm:px-4 sm:pb-4 sm:pt-2 border-t border-gray-200 dark:border-gray-800">
        <div className="relative w-full">
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
