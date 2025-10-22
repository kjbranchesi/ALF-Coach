import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { generateAI } from '../domain/ai';
import type { JourneyPhaseDraft } from './JourneyBoard';
import { resolveGradeBand, buildGradeBandPrompt } from '../../../ai/gradeBandRules';

export function PhaseDetailExpander({
  open,
  phase,
  wizard,
  onClose,
  onApply
}: {
  open: boolean;
  phase: JourneyPhaseDraft | null;
  wizard: { subjects?: string[]; gradeLevel?: string; duration?: string; projectTopic?: string };
  onClose: () => void;
  onApply?: (detail: { teacherMoves: string[]; studentTasks: string[]; materials: string[]; checkpoints: string[] }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ teacherMoves: string[]; studentTasks: string[]; materials: string[]; checkpoints: string[] } | null>(null);

  useEffect(() => {
    if (!open || !phase) {return;}

    const run = async () => {
      setLoading(true);
      setError(null);
      setDetail(null);
      const band = resolveGradeBand(wizard.gradeLevel);
      const guardrails = band ? buildGradeBandPrompt(band) : '';
      const prompt = `Generate a lesson-level breakdown for this phase.

CONTEXT:
- Phase name: ${phase.name}
- Focus: ${phase.focus || ''}
- Activities: ${(phase.activities || []).join(', ')}
- Grade level: ${wizard.gradeLevel || 'unspecified'}
- Subjects: ${(wizard.subjects || []).join(', ') || 'Interdisciplinary'}
- Topic: ${wizard.projectTopic || ''}

GRADE-BAND GUARDRAILS:
${guardrails}

Return JSON:
{
  "teacherMoves": ["..."], // 5-7 bullets; ≤ 10 words each
  "studentTasks": ["..."], // 6-10 bullets with time hints (e.g., "Sort waste samples — 15 min")
  "materials": ["..."], // 6-10 items
  "checkpoints": ["..."] // 2-3 formative checks
}`;
      try {
        const res = await generateAI(prompt, { model: 'gemini-flash-latest', temperature: 0.6, maxTokens: 600, label: 'phase_expand' });
        const parsed = safeParse(res);
        if (!parsed) {throw new Error('Parse failure');}
        setDetail(parsed);
      } catch (e: any) {
        setError(e?.message || 'Failed to generate');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [open, phase, wizard.gradeLevel, wizard.subjects, wizard.projectTopic]);

  if (!open || !phase) {return null;}

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI Expanded: {phase.name}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close">
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="p-5 text-sm text-gray-800 dark:text-gray-200">
          {loading && <p className="text-gray-500">Generating lesson-level breakdown…</p>}
          {error && (
            <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 p-3">{error}</div>
          )}
          {detail && (
            <div className="space-y-4">
              <Section title="Teacher moves" items={detail.teacherMoves} />
              <Section title="Student tasks" items={detail.studentTasks} />
              <Section title="Materials" items={detail.materials} />
              <Section title="Formative checkpoints" items={detail.checkpoints} />
              {onApply && (
                <div className="pt-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-primary-600 text-white px-4 py-2 text-[12px] font-semibold hover:bg-primary-700"
                    onClick={() => onApply(detail)}
                  >
                    Save to phase
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</p>
      {items?.length ? (
        <ul className="list-disc ml-5 space-y-1 text-gray-700 dark:text-gray-300">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">None</p>
      )}
    </div>
  );
}

function safeParse(text: string): { teacherMoves: string[]; studentTasks: string[]; materials: string[]; checkpoints: string[] } | null {
  const t = (text || '').trim();
  if (!t) {return null;}
  try {
    const obj = JSON.parse(t);
    return {
      teacherMoves: Array.isArray(obj.teacherMoves) ? obj.teacherMoves : [],
      studentTasks: Array.isArray(obj.studentTasks) ? obj.studentTasks : [],
      materials: Array.isArray(obj.materials) ? obj.materials : [],
      checkpoints: Array.isArray(obj.checkpoints) ? obj.checkpoints : []
    };
  } catch {
    return null;
  }
}
