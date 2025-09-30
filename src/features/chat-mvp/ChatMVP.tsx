import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useChatEngine } from '../../hooks/useChatEngine';
import { MessagesList } from '../../components/chat/MessagesList';
import { InputArea } from '../../components/chat/InputArea';
import { unifiedStorage } from '../../services/UnifiedStorageManager';
import { StageGuide } from './components/StageGuide';
import { SuggestionChips } from './components/SuggestionChips';
import { AIStatus } from './components/AIStatus';
import { buildStagePrompt } from './domain/prompt';
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
  fallbackForStage,
  transitionMessageFor,
  stageOrder,
  dynamicSuggestions,
  summarizeCaptured
} from './domain/stages';

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

  // Initial welcome (AI or fallback)
  useEffect(() => {
    // Small runtime check to confirm flag at runtime
    // eslint-disable-next-line no-console
    console.log('[ChatMVP] VITE_GEMINI_ENABLED =', (import.meta as any)?.env?.VITE_GEMINI_ENABLED);
    if (engine.state.messages.length > 0) return;
    const fallback = wizard.projectTopic
      ? `Welcome. We'll shape a ${wizard.duration || ''} ${wizard.subjects?.join(', ') || ''} project for ${wizard.gradeLevel || ''}.\nYour starting idea: “${wizard.projectTopic}”.\n\nFirst, let’s capture the Big Idea — the transferable concept students will understand.`
      : `Welcome. Let’s create a project that matters for your students.\n\nTo begin, what’s the Big Idea — a concise theme that gives the project focus?`;
    engine.appendMessage({ id: String(Date.now()), role: 'assistant', content: fallback, timestamp: new Date() } as any);
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

  const suggestions = useMemo(() => {
    const base = stageSuggestions(stage);
    const dyn = dynamicSuggestions(stage, { subjects: wizard.subjects, projectTopic: wizard.projectTopic }, captured);
    return Array.from(new Set([...(dyn || []), ...base])).slice(0, 3);
  }, [stage, wizard.subjects, wizard.projectTopic, captured]);
  const guide = useMemo(() => stageGuide(stage), [stage]);
  const gating = validate(stage, captured);

  const showGating = hasInput || stage !== 'BIG_IDEA';

  const handleSend = useCallback(async (text?: string) => {
    const content = (text ?? engine.state.input ?? '').trim();
    if (!content) return;
    engine.appendMessage({ id: String(Date.now()), role: 'user', content, timestamp: new Date() } as any);
    engine.setInput('');
    setHasInput(true);
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
      model: 'gemini-1.5-flash',
      history: (engine.state.messages as any[])
        .slice(-6)
        .map((m: any) => ({ role: m.role, content: m.content })),
      systemPrompt: 'You are ALF Coach. Be concise, encouraging, and practical. Always add value: acknowledge → educate → enhance → advance. Avoid code blocks.',
      temperature: 0.6,
      maxTokens: 400
    });
    const fallback = fallbackForStage(stage, updatedCaptured, gatingInfo.ok ? undefined : gatingInfo.reason);
    const reply = ai || fallback;
    if (reply) {
      engine.appendMessage({ id: String(Date.now() + 1), role: 'assistant', content: reply, timestamp: new Date() } as any);
    }

    // Auto‑advance when valid
    if (gatingInfo.ok) {
      const nxt = nextStage(stage);
      if (nxt) {
        setStage(nxt);
        setStageTurns(0);
        setHasInput(false);
        const transition = transitionMessageFor(stage);
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
  }, [engine, stage, wizard, captured, messageCountInStage, stageTurns]);

  return (
    <div className="relative flex flex-col h-full max-h-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Stage {stageOrder.indexOf(stage) + 1} of {stageOrder.length} · {stage.replace(/_/g, ' ').toLowerCase()}
          </div>
          <AIStatus />
        </div>
        <StageGuide {...guide} />
        {showGating && !gating.ok && (
          <div className="mb-3 text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {gating.reason}
          </div>
        )}
        {(suggestions.length > 0) && (stageTurns === 0 || (!hasInput && !gating.ok)) && (
          <SuggestionChips items={suggestions} onSelect={(t) => void handleSend(t)} />
        )}
        <div className="w-full space-y-3">
          <MessagesList messages={engine.state.messages as any} />
        </div>
        <div className="h-16" />
      </div>
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-900 px-3 py-2 sm:px-4 sm:py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="w-full">
          <InputArea
            value={engine.state.input}
            onChange={engine.setInput}
            onSend={() => void handleSend()}
            onToggleIdeas={() => { /* no-op MVP */ }}
            inputRef={engine.inputRef as any}
            onEscape={() => { /* no-op MVP */ }}
            lastUserMessage={(() => {
              const arr: any[] = engine.state.messages as any[];
              for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i]?.role === 'user') return arr[i]?.content || '';
              }
              return '';
            })()}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatMVP;
