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
  const envModel = (import.meta as any)?.env?.VITE_GEMINI_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s

  try {
    const res = await fetch(String(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        // Prefer explicit option, then env, default to 2.5-lite.
        model: opts?.model || envModel || 'gemini-2.5-flash-lite',
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
      // Log detailed error info before returning empty string
      console.error('[AI] HTTP error:', {
        status: res.status,
        statusText: res.statusText,
        url: String(url)
      });

      // Try to get error details from response
      try {
        const errorData = await res.json();
        console.error('[AI] Error response:', errorData);
      } catch {
        // Response not JSON, ignore
      }

      throw new Error(`AI HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = extractText(data);
    return sanitizeAI(text);
  } catch (e) {
    // Log the actual error instead of silently returning empty
    console.error('[AI] Generation failed:', e instanceof Error ? e.message : String(e));
    return '';
  } finally {
    clearTimeout(timeout);
  }
}

function toGeminiHistory(history: Array<{ role: 'user' | 'assistant'; content: string }>) {
  if (!history?.length) {return [];}
  return history.slice(-6).map(m => ({ role: m.role, parts: [{ text: m.content || '' }] }));
}

function extractText(data: any): string {
  try {
    // Primary: concatenate all parts in first candidate
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts) && parts.length) {
      const joined = parts.map((p: any) => p?.text || '').filter(Boolean).join('\n').trim();
      if (joined) {return joined;}
    }
    // Alternative shapes sometimes returned
    if (typeof data?.output_text === 'string' && data.output_text.trim()) {return data.output_text.trim();}
    if (typeof data?.text === 'string' && data.text.trim()) {return data.text.trim();}
  } catch {}
  return '';
}

function sanitizeAI(text: string): string {
  return String(text)
    .replace(/```[\s\S]*?```/g, '') // strip fenced code blocks
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .trim();
}
