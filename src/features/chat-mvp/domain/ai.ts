// Minimal AI wrapper for ChatMVP
import { telemetry, measureAsync } from '../../../services/telemetry';

export async function generateAI(prompt: string, opts?: {
  model?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  label?: string; // for telemetry grouping
}): Promise<string> {
  // Use plain import.meta.env so Jest's vite-meta-env transform can rewrite it
  const enabledFlag = import.meta.env?.VITE_GEMINI_ENABLED;
  const url = import.meta.env?.VITE_GEMINI_PROXY_URL || '/.netlify/functions/gemini';
  const envModel = import.meta.env?.VITE_GEMINI_MODEL;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s

  try {
    const { result: res, latencyMs } = await measureAsync(async () => fetch(String(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        // Use -latest aliases to auto-update to newest versions (recommended by Google)
        model: opts?.model || envModel || 'gemini-flash-lite-latest',
        history: toGeminiHistory(opts?.history || []),
        systemPrompt: opts?.systemPrompt,
        generationConfig: {
          temperature: typeof opts?.temperature === 'number' ? opts?.temperature : 0.6,
          maxOutputTokens: typeof opts?.maxTokens === 'number' ? opts?.maxTokens : 600
        }
      }),
      signal: controller.signal,
    }));
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
      telemetry.track({
        event: 'ai_prompt',
        success: false,
        latencyMs,
        projectId: opts?.label || 'ai',
        errorCode: `HTTP_${res.status}`,
        errorMessage: res.statusText,
        source: undefined,
        metadata: { model: opts?.model || envModel }
      });
      throw new Error(`AI HTTP ${res.status}`);
    }
    const data = await res.json();
    const text = extractText(data);
    const cleaned = sanitizeAI(text);
    telemetry.track({
      event: 'ai_prompt',
      success: Boolean(cleaned),
      latencyMs,
      projectId: opts?.label || 'ai',
      source: undefined,
      metadata: { model: opts?.model || envModel }
    });
    return cleaned;
  } catch (e) {
    // Log the actual error instead of silently returning empty
    console.error('[AI] Generation failed:', e instanceof Error ? e.message : String(e));
    telemetry.track({
      event: 'ai_prompt',
      success: false,
      latencyMs: 0,
      projectId: opts?.label || 'ai',
      errorCode: (e as any)?.name || 'ERROR',
      errorMessage: (e as any)?.message || String(e),
      source: undefined,
      metadata: { model: opts?.model || envModel }
    });
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
  let result = String(text);

  // Extract JSON from code fences (e.g., ```json...```)
  const jsonFenceMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonFenceMatch) {
    result = jsonFenceMatch[1].trim();
  } else {
    // If no JSON fence found, strip other code fences but keep content
    result = result.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
  }

  // Remove script tags
  result = result.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  return result.trim();
}
