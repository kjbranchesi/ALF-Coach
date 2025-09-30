// Minimal AI wrapper for ChatMVP

export async function generateAI(prompt: string, opts?: {
  model?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const enabledFlag = (import.meta as any)?.env?.VITE_GEMINI_ENABLED;
  const url = (import.meta as any)?.env?.VITE_GEMINI_PROXY_URL || '/.netlify/functions/gemini';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s

  try {
    // Attempt the request even if the flag is missing; server will reply with an error if misconfigured
    // Helpful console to quickly diagnose in production
    // eslint-disable-next-line no-console
    console.log('[AI] Calling Gemini proxy', {
      model: opts?.model || 'gemini-1.5-flash',
      url,
      flag: enabledFlag
    });

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
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn('[AI] Proxy HTTP error', res.status);
      throw new Error(`AI HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = extractText(data);
    // eslint-disable-next-line no-console
    console.log('[AI] Response received', { length: text.length });
    return sanitizeAI(text);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[AI] Falling back to non-AI path', (e as Error)?.message);
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function toGeminiHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  if (!history?.length) return [];
  return history.slice(-6).map(m => ({ role: m.role, parts: [{ text: m.content || '' }] }));
}

function extractText(data: any): string {
  try {
    // Primary: concatenate all parts in first candidate
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts) && parts.length) {
      const joined = parts.map((p: any) => p?.text || '').filter(Boolean).join('\n').trim();
      if (joined) return joined;
    }
    // Alternative shapes sometimes returned
    if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
    if (typeof data?.text === 'string' && data.text.trim()) return data.text.trim();
  } catch {}
  return '';
}

function sanitizeAI(text: string): string {
  return String(text)
    .replace(/```[\s\S]*?```/g, '') // strip fenced code blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();
}
