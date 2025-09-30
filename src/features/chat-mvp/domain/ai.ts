// Minimal AI wrapper for ChatMVP

export async function generateAI(prompt: string, opts?: {
  model?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const enabled = (import.meta as any)?.env?.VITE_GEMINI_ENABLED === 'true';
  const url = (import.meta as any)?.env?.VITE_GEMINI_PROXY_URL || '/.netlify/functions/gemini';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s

  try {
    if (!enabled) throw new Error('AI disabled');
    const res = await fetch(String(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: opts?.model || 'gemini-1.5-flash',
        history: toGeminiHistory(opts?.history || []),
        systemPrompt: opts?.systemPrompt,
        generationConfig: {
          temperature: typeof opts?.temperature === 'number' ? opts?.temperature : 0.6,
          maxOutputTokens: typeof opts?.maxTokens === 'number' ? opts?.maxTokens : 600
        }
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`AI HTTP ${res.status}`);
    const data = await res.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return sanitizeAI(text || '');
  } catch (e) {
    // Fallback: non-blocking, caller may add stage-specific microcopy
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function toGeminiHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  if (!history?.length) return [];
  return history.slice(-6).map(m => ({ role: m.role, parts: [{ text: m.content || '' }] }));
}

function sanitizeAI(text: string): string {
  return String(text)
    .replace(/```[\s\S]*?```/g, '') // strip fenced code blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();
}
