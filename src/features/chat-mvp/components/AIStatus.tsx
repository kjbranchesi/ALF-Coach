import React, { useEffect, useState } from 'react';

type Status = 'unknown' | 'checking' | 'online' | 'error';

function parseAIText(data: any): string {
  try {
    const parts = data?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts) && parts.length) {
      const joined = parts.map((p: any) => p?.text || '').filter(Boolean).join('\n').trim();
      if (joined) return joined;
    }
    if (typeof data?.output_text === 'string') return data.output_text.trim();
    if (typeof data?.text === 'string') return data.text.trim();
  } catch {}
  return '';
}

export function AIStatus({
  onStatusChange,
  onModelChange,
}: {
  onStatusChange?: (status: Status, detail: string) => void;
  onModelChange?: (model: string) => void;
}) {
  const [status, setStatus] = useState<Status>('unknown');
  const [detail, setDetail] = useState<string>('');
  const flag = (import.meta as any)?.env?.VITE_GEMINI_ENABLED;
  const model = (import.meta as any)?.env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash-lite';

  useEffect(() => {
    onModelChange?.(model);
  }, [model, onModelChange]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setStatus('checking');
    const timer = setTimeout(() => controller.abort(), 12000);

    fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Status check: reply OK.', model: 'gemini-2.5-flash-lite' }),
      signal: controller.signal,
    })
      .then(async (r) => {
        if (cancelled) return;
        if (!r.ok) {
          setStatus('error');
          setDetail(`Proxy HTTP ${r.status}`);
          return;
        }
        const data = await r.json();
        const text = parseAIText(data);
        if (text) {
          setStatus('online');
          setDetail('');
        } else {
          setStatus('error');
          setDetail('Empty AI response');
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus('error');
        setDetail((e as Error)?.message || 'Request failed');
      })
      .finally(() => clearTimeout(timer));

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    onStatusChange?.(status, detail);
  }, [status, detail, onStatusChange]);

  const color = status === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : status === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-gray-50 text-gray-600 border-gray-200';
  const label = status === 'online' ? 'AI Online' : status === 'error' ? 'AI Error' : status === 'checking' ? 'AI Checking' : 'AI Unknown';

  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg border text-[11px] ${color}`} title={detail || undefined}>
      <span className={`inline-block h-2 w-2 rounded-full ${status === 'online' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-gray-400'}`} />
      <span>{label}</span>
      {typeof flag !== 'undefined' && (
        <>
          <span className="text-gray-400">|</span>
          <span>Flag: {String(flag)}</span>
        </>
      )}
      <span className="text-gray-400">|</span>
      <span>Model: {model}</span>
      {detail && (
        <span className="ml-1 text-gray-500">({detail.slice(0, 60)})</span>
      )}
    </div>
  );
}

export default AIStatus;
