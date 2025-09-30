import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useChatEngine } from '../../hooks/useChatEngine';
import { MessagesList } from '../../components/chat/MessagesList';
import { InputArea } from '../../components/chat/InputArea';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { StageGuide } from './components/StageGuide';
import { SuggestionChips } from './components/SuggestionChips';
import { AIStatus } from './components/AIStatus';
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
  const [showIdeas, setShowIdeas] = useState(false);
  const [aiStatus, setAiStatus] = useState<'unknown' | 'checking' | 'online' | 'error'>('checking');
  const [aiDetail, setAiDetail] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

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
    if (!initialized) return;
    const t = setTimeout(() => { void persist(); }, 1200);
    return () => clearTimeout(t);
  }, [persist, initialized, captured, stage]);

  const fallbackSuggestions = useMemo(() => {
    const base = stageSuggestions(stage);
    const dyn = dynamicSuggestions(stage, { subjects: wizard.subjects, projectTopic: wizard.projectTopic }, captured);
    return Array.from(new Set([...(dyn || []), ...base])).slice(0, 3);
  }, [stage, wizard.subjects, wizard.projectTopic, captured]);
  const suggestions = aiSuggestions.length ? aiSuggestions : fallbackSuggestions;
  const guide = useMemo(() => stageGuide(stage), [stage]);
  const gating = validate(stage, captured);

  const showGating = hasInput || stage !== 'BIG_IDEA';

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
  }, [aiStatus, engine, stage, captured, wizard, guide]);

  const handleSend = useCallback(async (text?: string) => {
    if (aiStatus !== 'online') {
      return;
    }
    const content = (text ?? engine.state.input ?? '').trim();
    if (!content) return;
    engine.appendMessage({ id: String(Date.now()), role: 'user', content, timestamp: new Date() } as any);
    engine.setInput('');
    setHasInput(true);

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
      stageTurns
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
      const nxt = nextStage(stage);
      if (nxt) {
        setStage(nxt);
        setStageTurns(0);
        setHasInput(false);
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
  }, [engine, stage, wizard, captured, messageCountInStage, stageTurns, aiStatus]);

  return (
    <div className="relative flex flex-col h-full max-h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Stage {stageOrder.indexOf(stage) + 1} of {stageOrder.length} · {stage.replace(/_/g, ' ').toLowerCase()}
          </div>
          <AIStatus
            onStatusChange={(status, detail) => {
              setAiStatus(status);
              setAiDetail(detail);
            }}
          />
        </div>
        {aiStatus !== 'online' && (
          <div className="mb-3 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 flex items-center justify-between">
            <span>{aiStatus === 'checking' ? 'Checking AI availability…' : 'AI is currently unavailable. Try again shortly.'}</span>
            {aiDetail && <span className="text-rose-500 italic">{aiDetail}</span>}
          </div>
        )}
        <StageGuide {...guide} />
        {showGating && !gating.ok && (
          <div className="mb-3 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {gating.reason}
          </div>
        )}
        {showIdeas && (
          suggestions.length > 0 ? (
            <SuggestionChips items={suggestions} onSelect={(t) => { setShowIdeas(false); void handleSend(t); }} />
          ) : suggestionsLoading ? (
            <div className="mb-3 text-[12px] text-gray-500 bg-gray-100/70 border border-gray-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-400 animate-ping" aria-hidden="true" />
              <span>Fetching fresh ideas…</span>
            </div>
          ) : null
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
          />
        </div>
        <div className="h-16" />
      </div>
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-3 py-2 sm:px-4 sm:py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="w-full">
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
  );
}

export default ChatMVP;
